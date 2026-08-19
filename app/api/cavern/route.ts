import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { getSpeciesByCode } from '@/lib/world/speciesCatalog';
import { todayKey } from '@/lib/learning/review';
import {
  emptyCavern, canDig, rollDig, creatureForDig, sellGem, keepGem,
  resolvePending, recordDig, digsLeftToday, digCooldownMs, cooldownLabel,
  sellKept, holdsFind, isSellableForCoins, type CavernState,
} from '@/lib/world/cavern';
import { getGem } from '@/lib/world/gemCatalog';

/**
 * Crystal Cavern: digging, keeping, selling.
 *
 * Every rule that matters is enforced HERE, not in the component. The
 * one-dig-a-day cap in particular: a client that asks twice gets told
 * no the second time, because a cap the browser owns is not a cap.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const Body = z.object({
  learnerId: z.string().min(1),
  action: z.enum(['dig', 'keep', 'sell', 'sell_kept']),
  gemCode: z.string().optional(),
});

/**
 * The species table has a foreign key from journal_entry, and a
 * catalog entry that never got seeded is what once stranded a child in
 * a loop she could not leave. Heal it rather than fail.
 */
async function ensureSpeciesRow(
  db: ReturnType<typeof createServiceClient>, code: string,
): Promise<string | null> {
  const { data } = await db.from('species').select('id').eq('code', code).maybeSingle();
  if (data?.id) return data.id as string;
  const sp = getSpeciesByCode(code);
  if (!sp) return null;
  const { data: made } = await db.from('species').insert({
    code: sp.code,
    common_name: sp.commonName,
    scientific_name: sp.scientificName,
    description: sp.description,
    fun_fact: sp.funFact,
    illustration_key: sp.illustrationKey,
    habitat_req_codes: sp.habitatReqCodes,
  }).select('id').maybeSingle();
  return (made?.id as string) ?? null;
}

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();

  const { data: row } = await db
    .from('world_state').select('garden').eq('learner_id', body.learnerId).maybeSingle();
  const garden = (row?.garden as Record<string, unknown>) ?? {};
  const state: CavernState = { ...emptyCavern(), ...((garden.cavern as CavernState) ?? {}) };
  const today = todayKey();

  let gemCode: string | null = null;
  let creatureCode: string | null = null;
  let paid = 0;

  if (body.action === 'dig') {
    // THE CAP. Owned by the server, checked before anything else.
    // Two separate refusals, because they mean different things and a
    // child told "come back tomorrow" when she actually has a dig
    // waiting in four minutes has been told something false.
    const cooldown = digCooldownMs(state, Date.now());
    if (digsLeftToday(state, today) > 0 && cooldown > 0) {
      return NextResponse.json({
        error: `The dust is still settling. Come back in ${cooldownLabel(cooldown)}.`,
        cavern: {
          ...state, canDigToday: false,
          digsLeftToday: digsLeftToday(state, today), cooldownMs: cooldown,
        },
      });
    }
    if (!canDig(state, today)) {
      return NextResponse.json({
        error: 'That is both of today\'s digs. The seam opens again tomorrow morning.',
        cavern: { ...state, canDigToday: false, digsLeftToday: 0 },
      });
    }
    // Roll for a creature BEFORE recording the dig. Meeting an animal
    // costs nothing: it used to eat the dig and start the cooldown,
    // and "if I find a animal it will not let me go dig" arrived in
    // the letterbox. She was right — a child who meets the salamander
    // instead of a stone has not mined anything yet. Free digs are
    // bounded by the creature list: four, ever, per child.
    const roll = Math.random();
    const creature = creatureForDig(state.creaturesFound, roll);
    if (!creature) Object.assign(state, recordDig(state, today));

    if (creature) {
      creatureCode = creature;
      state.creaturesFound = [...state.creaturesFound, creature];
      // A found creature goes in the field journal like any other.
      const speciesId = await ensureSpeciesRow(db, creature);
      if (speciesId) {
        const { data: already } = await db.from('journal_entry')
          .select('id').eq('learner_id', body.learnerId)
          .eq('species_id', speciesId).maybeSingle();
        if (!already) {
          await db.from('journal_entry')
            .insert({ learner_id: body.learnerId, species_id: speciesId });
        }
      }
    } else {
      gemCode = rollDig(Math.random()).code;
      // Remember it. keep/sell check against this rather than trusting
      // whatever the client names.
      state.currentFind = gemCode;
    }
  }

  if (body.action === 'sell' && body.gemCode) {
    // A refusal must SAY so. sellGem returning { paid: 0 } as a 200
    // used to reach the screen as "Sold the Garnet for 0" with a happy
    // chime, and the stone was gone from her view — not sold, not in
    // the case. She wrote a letter asking what was going on.
    const gem = getGem(body.gemCode);
    if (!gem || !holdsFind(state, body.gemCode)) {
      return NextResponse.json({
        error: 'That stone is not in your hand, so nothing was sold.',
        cavern: {
          ...state, canDigToday: canDig(state, today),
          digsLeftToday: digsLeftToday(state, today),
        },
      });
    }
    if (!isSellableForCoins(body.gemCode)) {
      return NextResponse.json({
        error: `A ${gem.name.toLowerCase()} has no coin price. It goes in the case — and one day it can be traded for a Great Work.`,
        cavern: {
          ...state, canDigToday: canDig(state, today),
          digsLeftToday: digsLeftToday(state, today),
        },
      });
    }
    const out = sellGem(state, body.gemCode);
    Object.assign(state, out.state);
    paid = out.paid;
    // If this stone was one she earned by mastering something, it is
    // now spoken for. Harmless when it came from a dig.
    Object.assign(state, resolvePending(state, body.gemCode));
  }

  // Selling something already in the case. The stone must actually be
  // in there — the client cannot conjure coins by naming a gem.
  if (body.action === 'sell_kept' && body.gemCode) {
    const out = sellKept(state, body.gemCode);
    if (out.paid === 0) {
      const gem = getGem(body.gemCode);
      return NextResponse.json({
        error: gem && (state.kept[body.gemCode] ?? 0) > 0
          ? `A ${gem.name.toLowerCase()} has no coin price. It stays in the case — and one day it can be traded for a Great Work.`
          : 'That stone is not in your case, so nothing was sold.',
        cavern: {
          ...state, canDigToday: canDig(state, today),
          digsLeftToday: digsLeftToday(state, today),
        },
      });
    }
    Object.assign(state, out.state);
    paid = out.paid;
  }

  if (body.action === 'keep' && body.gemCode) {
    Object.assign(state, keepGem(state, body.gemCode));
    Object.assign(state, resolvePending(state, body.gemCode));
  }

  garden.cavern = {
    coins: state.coins,
    kept: state.kept,
    lastDig: state.lastDig,
    creaturesFound: state.creaturesFound,
    pending: state.pending,
    masteryPaid: state.masteryPaid,
    digDate: state.digDate,
    digsToday: state.digsToday,
    lastDigAt: state.lastDigAt,
    currentFind: state.currentFind,
  };

  const { error } = await db.from('world_state').upsert(
    { learner_id: body.learnerId, garden, last_updated_at: new Date().toISOString() },
    { onConflict: 'learner_id' },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    cavern: {
      ...state,
      canDigToday: canDig(state, today),
      digsLeftToday: digsLeftToday(state, today),
      cooldownMs: digCooldownMs(state, Date.now()),
    },
    gemCode, creatureCode, paid,
  });
}

export async function GET(req: Request) {
  const learnerId = new URL(req.url).searchParams.get('learner');
  if (!learnerId) return NextResponse.json({ error: 'learner required' }, { status: 400 });

  const db = createServiceClient();
  const { data: row } = await db
    .from('world_state').select('garden').eq('learner_id', learnerId).maybeSingle();
  const garden = (row?.garden as Record<string, unknown>) ?? {};
  const state: CavernState = { ...emptyCavern(), ...((garden.cavern as CavernState) ?? {}) };
  return NextResponse.json({
    cavern: {
      ...state,
      canDigToday: canDig(state, todayKey()),
      digsLeftToday: digsLeftToday(state, todayKey()),
      cooldownMs: digCooldownMs(state, Date.now()),
    },
  });
}
