import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { getSpeciesByCode } from '@/lib/world/speciesCatalog';
import { todayKey } from '@/lib/learning/review';
import {
  emptyCavern, canDig, rollDig, creatureForDig, sellGem, keepGem,
  resolvePending, type CavernState,
} from '@/lib/world/cavern';

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
  action: z.enum(['dig', 'keep', 'sell']),
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
    if (!canDig(state, today)) {
      return NextResponse.json({
        error: 'You already dug today. The seam opens again tomorrow morning.',
        cavern: { ...state, canDigToday: false },
      });
    }
    state.lastDig = today;

    const roll = Math.random();
    const creature = creatureForDig(state.creaturesFound, roll);
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
    }
  }

  if (body.action === 'sell' && body.gemCode) {
    const out = sellGem(state, body.gemCode);
    Object.assign(state, out.state);
    paid = out.paid;
    // If this stone was one she earned by mastering something, it is
    // now spoken for. Harmless when it came from a dig.
    Object.assign(state, resolvePending(state, body.gemCode));
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
  };

  const { error } = await db.from('world_state').upsert(
    { learner_id: body.learnerId, garden, last_updated_at: new Date().toISOString() },
    { onConflict: 'learner_id' },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    cavern: { ...state, canDigToday: canDig(state, today) },
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
    cavern: { ...state, canDigToday: canDig(state, todayKey()) },
  });
}
