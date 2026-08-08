import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { getSpeciesByCode } from '@/lib/world/speciesCatalog';
import { todayKey } from '@/lib/learning/review';
import { getPlant } from '@/lib/world/plantCatalog';
import {
  emptyNightGarden, canVisitTonight, mothForTonight, nightGardenOpen,
  getConstellation, type NightGardenState,
} from '@/lib/world/nightGarden';

/**
 * The Night Garden.
 *
 * Every rule lives here rather than in the component, for the reason
 * the cavern route already spells out: a cap the browser owns is not a
 * cap. One new moth per night, checked server-side, and a client that
 * asks twice is told no the second time.
 *
 * The gate is a moon-quadrant plant IN BLOOM, not merely planted. A bud
 * advertises nothing, and sending a child into a dark empty garden is
 * the shape of dead end this project has shipped before.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const Body = z.object({
  learnerId: z.string().min(1),
  action: z.enum(['visit', 'star']),
  constellationCode: z.string().optional(),
});

/**
 * Which of a learner's plants are actually open right now.
 *
 * Growth is (correct answers since planting) / growthCost, the same sum
 * the garden itself uses — so a flower is in bloom here exactly when it
 * looks in bloom on her screen.
 */
async function bloomingMoonPlants(
  db: ReturnType<typeof createServiceClient>, learnerId: string,
): Promise<string[]> {
  const { count } = await db.from('attempt')
    .select('*', { count: 'exact', head: true })
    .eq('learner_id', learnerId).eq('outcome', 'correct');
  const correct = count ?? 0;

  const { data: plots } = await db.from('garden_plot')
    .select('plant_code, planted_at_correct')
    .eq('learner_id', learnerId).is('harvested_at', null);

  return (plots ?? [])
    .filter(p => {
      const plant = getPlant(p.plant_code as string);
      if (!plant || plant.garden !== 'moon') return false;
      return (correct - (p.planted_at_correct as number)) >= plant.growthCost;
    })
    .map(p => p.plant_code as string);
}

async function ensureSpeciesRow(
  db: ReturnType<typeof createServiceClient>, code: string,
): Promise<string | null> {
  const { data } = await db.from('species').select('id').eq('code', code).maybeSingle();
  if (data?.id) return data.id as string;
  const sp = getSpeciesByCode(code);
  if (!sp) return null;
  const { data: made } = await db.from('species').insert({
    code: sp.code, common_name: sp.commonName, scientific_name: sp.scientificName,
    description: sp.description, fun_fact: sp.funFact,
    illustration_key: sp.illustrationKey, habitat_req_codes: sp.habitatReqCodes,
  }).select('id').maybeSingle();
  return (made?.id as string) ?? null;
}

async function load(db: ReturnType<typeof createServiceClient>, learnerId: string) {
  const { data: row } = await db
    .from('world_state').select('garden').eq('learner_id', learnerId).maybeSingle();
  const garden = (row?.garden as Record<string, unknown>) ?? {};
  const state: NightGardenState = {
    ...emptyNightGarden(),
    ...((garden.nightGarden as NightGardenState) ?? {}),
  };
  return { garden, state };
}

export async function GET(req: Request) {
  const learnerId = new URL(req.url).searchParams.get('learner');
  if (!learnerId) return NextResponse.json({ error: 'learner required' }, { status: 400 });

  const db = createServiceClient();
  const { state } = await load(db, learnerId);
  const blooming = await bloomingMoonPlants(db, learnerId);

  return NextResponse.json({
    night: { ...state, canVisitTonight: canVisitTonight(state, todayKey()) },
    blooming,
    open: nightGardenOpen(blooming),
  });
}

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();
  const { garden, state } = await load(db, body.learnerId);
  const today = todayKey();

  const blooming = await bloomingMoonPlants(db, body.learnerId);
  if (!nightGardenOpen(blooming)) {
    return NextResponse.json({
      error: 'Nothing is open out here yet. A moon flower has to be in bloom before anything comes.',
    }, { status: 400 });
  }

  let mothCode: string | null = null;

  if (body.action === 'visit') {
    // THE CAP. One new moth a night, server-owned.
    if (!canVisitTonight(state, today)) {
      return NextResponse.json({
        error: 'Everything that was coming tonight has come. Try again tomorrow night.',
        night: { ...state, canVisitTonight: false },
      });
    }
    const next = mothForTonight(state.mothsSeen);
    if (next) {
      state.lastVisit = today;
      mothCode = next;
      state.mothsSeen = [...state.mothsSeen, next];
      const speciesId = await ensureSpeciesRow(db, next);
      if (speciesId) {
        const { data: already } = await db.from('journal_entry')
          .select('id').eq('learner_id', body.learnerId)
          .eq('species_id', speciesId).maybeSingle();
        if (!already) {
          await db.from('journal_entry')
            .insert({ learner_id: body.learnerId, species_id: speciesId });
        }
      }
    }
  }

  if (body.action === 'star' && body.constellationCode) {
    // Stars are not capped. Looking up costs the garden nothing, and
    // the sky is the same sky however long she stands in it.
    if (getConstellation(body.constellationCode)
        && !state.starsFound.includes(body.constellationCode)) {
      state.starsFound = [...state.starsFound, body.constellationCode];
    }
  }

  garden.nightGarden = {
    lastVisit: state.lastVisit,
    mothsSeen: state.mothsSeen,
    starsFound: state.starsFound,
  };

  const { error } = await db.from('world_state').upsert(
    { learner_id: body.learnerId, garden, last_updated_at: new Date().toISOString() },
    { onConflict: 'learner_id' },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    night: { ...state, canVisitTonight: canVisitTonight(state, today) },
    mothCode, blooming,
  });
}
