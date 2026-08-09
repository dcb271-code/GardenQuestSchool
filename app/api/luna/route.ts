import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { todayKey } from '@/lib/learning/review';
import { emptyLuna, canFeed, nextFact, type LunaState } from '@/lib/world/lunaTreats';

/** Give Luna a treat. She answers with something true. */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const Body = z.object({ learnerId: z.string().min(1) });

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();
  const today = todayKey();

  const { data: row } = await db
    .from('world_state').select('garden').eq('learner_id', body.learnerId).maybeSingle();
  const garden = (row?.garden as Record<string, unknown>) ?? {};
  const state: LunaState = { ...emptyLuna(), ...((garden.luna as LunaState) ?? {}) };

  // The cap is the server's, like every other daily rule here.
  if (!canFeed(state, today)) {
    return NextResponse.json({
      fed: false,
      message: 'She has had one today. She is asleep on the warm bit of the path.',
      luna: { ...state, canFeedToday: false },
    });
  }

  const fact = nextFact(state.factsHeard);
  state.lastFed = today;
  if (fact) state.factsHeard = [...state.factsHeard, fact.id];

  garden.luna = { lastFed: state.lastFed, factsHeard: state.factsHeard };
  const { error } = await db.from('world_state').upsert(
    { learner_id: body.learnerId, garden, last_updated_at: new Date().toISOString() },
    { onConflict: 'learner_id' },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    fed: true,
    fact: fact?.text ?? null,
    luna: { ...state, canFeedToday: false },
  });
}
