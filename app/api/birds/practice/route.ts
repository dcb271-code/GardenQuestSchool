import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { getUnit } from '@/lib/birds/curriculum';
import { recordResult, todayKey, type ReviewMap } from '@/lib/learning/review';
import { grantVirtueGem } from '@/lib/engine/virtueGrants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Bird practice, recorded so it counts.
 *
 * Same trick as music: every answered exercise becomes an `attempt`
 * row with a learner id and an outcome, and null item_id/session_id.
 * getCumulativeCorrect() counts exactly those, so learning birds grows
 * plants in the garden with no special case in the garden code — while
 * the queries that walk attempt → item → skill skip null-item rows, so
 * birds can't mark a maths skill as practised.
 */

const Body = z.object({
  learnerId: z.string().min(1),
  unitCode: z.string().min(1),
  results: z.array(z.object({
    exerciseKind: z.string().min(1),
    correct: z.boolean(),
    /** Wrong tries before getting it — 0 means first time. */
    retries: z.number().int().min(0).max(50).default(0),
    timeMs: z.number().int().min(0).max(600000).optional(),
  })).min(1).max(40),
});

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();

  const unit = getUnit(body.unitCode);
  if (!unit) return NextResponse.json({ error: 'unknown unit' }, { status: 400 });

  const rows = body.results.map(r => ({
    learner_id: body.learnerId,
    session_id: null,
    item_id: null,
    outcome: r.correct ? 'correct' : 'incorrect',
    response: {
      source: 'birds',
      unit: unit.code,
      stage: unit.stage,
      exercise: r.exerciseKind,
    },
    time_ms: r.timeMs ?? null,
    retry_count: r.retries,
  }));

  const { error } = await db.from('attempt').insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const correctCount = body.results.filter(r => r.correct).length;
  const accuracy = correctCount / body.results.length;

  const { data: stateRow } = await db
    .from('world_state')
    .select('garden')
    .eq('learner_id', body.learnerId)
    .maybeSingle();
  const garden = (stateRow?.garden as Record<string, any>) ?? {};
  const done: string[] = Array.isArray(garden.bird_units) ? garden.bird_units : [];
  const alreadyDone = done.includes(unit.code);
  const passed = correctCount >= Math.ceil(body.results.length * 0.7);

  const review: ReviewMap = (garden.bird_review as ReviewMap) ?? {};
  review[unit.code] = recordResult(review[unit.code], accuracy, todayKey());
  garden.bird_review = review;
  if (passed && !alreadyDone) garden.bird_units = [...done, unit.code];

  await db.from('world_state').upsert(
    { learner_id: body.learnerId, garden, last_updated_at: new Date().toISOString() },
    { onConflict: 'learner_id' },
  );

  let gemGranted = false;
  if (passed && !alreadyDone) {
    gemGranted = await grantVirtueGem(
      db, body.learnerId, 'curiosity',
      `You learned ${unit.title} — ${correctCount} right. Now go and look out of a window.`,
      { source: 'birds', unitCode: unit.code, stage: unit.stage },
    );
  }

  return NextResponse.json({
    recorded: rows.length,
    correctCount,
    accuracy,
    passed,
    alreadyDone,
    gemGranted,
    completed: garden.bird_units ?? done,
    review,
  });
}

export async function GET(req: Request) {
  const learnerId = new URL(req.url).searchParams.get('learner');
  if (!learnerId) return NextResponse.json({ error: 'learner required' }, { status: 400 });

  const db = createServiceClient();
  const { data: row } = await db
    .from('world_state')
    .select('garden')
    .eq('learner_id', learnerId)
    .maybeSingle();
  const garden = (row?.garden as Record<string, any>) ?? {};

  return NextResponse.json({
    completed: Array.isArray(garden.bird_units) ? garden.bird_units : [],
    review: (garden.bird_review as ReviewMap) ?? {},
    lifelist: (garden.bird_lifelist as Record<string, unknown>) ?? {},
  });
}
