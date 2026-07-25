import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { getUnit } from '@/lib/music/curriculum';
import { recordResult, todayKey, type ReviewMap } from '@/lib/music/review';
import { grantVirtueGem } from '@/lib/engine/virtueGrants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Music practice, recorded so it counts.
 *
 * Every answered exercise becomes an `attempt` row with the learner's
 * id and an outcome — the same rows getCumulativeCorrect() counts. That
 * is the whole trick: practising music grows plants in the garden
 * exactly like answering a maths question does, with no special case
 * anywhere in the garden code.
 *
 * item_id and session_id are left null. Both are nullable, and the
 * places that walk attempt → item → skill (the garden's per-skill
 * counts, mastery) skip rows without an item, so music can't
 * accidentally mark a maths skill as practised.
 */

const Body = z.object({
  learnerId: z.string().min(1),
  unitCode: z.string().min(1),
  /** One entry per exercise answered in this sitting. */
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
      source: 'music',
      unit: unit.code,
      strand: unit.strand,
      exercise: r.exerciseKind,
    },
    time_ms: r.timeMs ?? null,
    retry_count: r.retries,
  }));

  const { error } = await db.from('attempt').insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // FIRST-TRY correct is what counts for scheduling: getting there
  // after three wrong guesses is not the same as knowing it.
  const correctCount = body.results.filter(r => r.correct).length;
  const accuracy = correctCount / body.results.length;

  const { data: stateRow } = await db
    .from('world_state')
    .select('garden')
    .eq('learner_id', body.learnerId)
    .maybeSingle();
  const garden = (stateRow?.garden as Record<string, any>) ?? {};
  const done: string[] = Array.isArray(garden.music_units) ? garden.music_units : [];
  const alreadyDone = done.includes(unit.code);
  // Finishing means getting most of it right, not merely reaching the end.
  const passed = correctCount >= Math.ceil(body.results.length * 0.7);

  // Schedule the unit's next review whatever happened — a shaky pass
  // should come back tomorrow, a clean one in a month.
  const review: ReviewMap = (garden.music_review as ReviewMap) ?? {};
  review[unit.code] = recordResult(review[unit.code], accuracy, todayKey());
  garden.music_review = review;
  if (passed && !alreadyDone) garden.music_units = [...done, unit.code];

  await db.from('world_state').upsert(
    { learner_id: body.learnerId, garden, last_updated_at: new Date().toISOString() },
    { onConflict: 'learner_id' },
  );

  let gemGranted = false;
  if (passed && !alreadyDone) {
    gemGranted = await grantVirtueGem(
      db, body.learnerId, 'practice',
      `You worked through ${unit.title} at the piano — ${correctCount} right.`,
      { source: 'music', unitCode: unit.code, strand: unit.strand },
    );
  }

  return NextResponse.json({
    recorded: rows.length,
    correctCount,
    accuracy,
    passed,
    alreadyDone,
    gemGranted,
    completed: garden.music_units ?? done,
    review,
  });
}

/** Which music units has this learner finished? */
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
    completed: Array.isArray(garden.music_units) ? garden.music_units : [],
    review: (garden.music_review as ReviewMap) ?? {},
  });
}
