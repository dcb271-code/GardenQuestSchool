import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { getGemUnit, unitPassed } from '@/lib/gems/curriculum';
import { getGem } from '@/lib/world/gemCatalog';
import { recordResult, todayKey, type ReviewMap } from '@/lib/learning/review';
import { grantVirtueGem } from '@/lib/engine/virtueGrants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Gem study, recorded so it counts.
 *
 * Same trick as birds and music: every answered exercise becomes an
 * attempt row with null item_id/session_id and a source tag, so
 * studying minerals grows plants in the garden with no special case —
 * while never marking a math skill as practiced.
 *
 * FIRST PASS PAYS THE UNIT'S STONE — once, ever, into the cavern's
 * pending pile, where keep-or-sell still happens. Bounded by content:
 * four units, four stones, and nothing pays per correct answer.
 */

const Body = z.object({
  learnerId: z.string().min(1),
  unitCode: z.string().min(1),
  results: z.array(z.object({
    exerciseKind: z.string().min(1),
    correct: z.boolean(),
    retries: z.number().int().min(0).max(50).default(0),
    timeMs: z.number().int().min(0).max(600000).optional(),
  })).min(1).max(40),
});

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();

  const unit = getGemUnit(body.unitCode);
  if (!unit) return NextResponse.json({ error: 'unknown unit' }, { status: 400 });

  const rows = body.results.map(r => ({
    learner_id: body.learnerId,
    session_id: null,
    item_id: null,
    outcome: r.correct ? 'correct' : 'incorrect',
    response: {
      source: 'gems',
      unit: unit.code,
      exercise: r.exerciseKind,
    },
    time_ms: r.timeMs ?? null,
    retry_count: r.retries,
  }));

  const { error } = await db.from('attempt').insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const correctCount = body.results.filter(r => r.correct).length;
  const accuracy = correctCount / body.results.length;
  const passed = unitPassed(correctCount, body.results.length);

  const { data: stateRow } = await db
    .from('world_state').select('garden').eq('learner_id', body.learnerId).maybeSingle();
  const garden = (stateRow?.garden as Record<string, any>) ?? {};
  const done: string[] = Array.isArray(garden.gem_units) ? garden.gem_units : [];
  const alreadyDone = done.includes(unit.code);

  const review: ReviewMap = (garden.gem_review as ReviewMap) ?? {};
  review[unit.code] = recordResult(review[unit.code], accuracy, todayKey());
  garden.gem_review = review;
  if (passed && !alreadyDone) garden.gem_units = [...done, unit.code];

  // The stone. Into pending, so the keep-or-sell choice is still hers,
  // with its own paid-list so a re-run can never pay twice.
  let stoneCode: string | null = null;
  if (passed && !alreadyDone) {
    const cavern = (garden.cavern as Record<string, any>) ?? {};
    const lessonPaid: string[] = Array.isArray(cavern.lessonPaid) ? cavern.lessonPaid : [];
    if (!lessonPaid.includes(unit.code) && getGem(unit.rewardStone)) {
      cavern.pending = [...(cavern.pending ?? []), unit.rewardStone];
      cavern.lessonPaid = [...lessonPaid, unit.code];
      garden.cavern = cavern;
      stoneCode = unit.rewardStone;
    }
  }

  await db.from('world_state').upsert(
    { learner_id: body.learnerId, garden, last_updated_at: new Date().toISOString() },
    { onConflict: 'learner_id' },
  );

  let gemGranted = false;
  if (passed && !alreadyDone) {
    gemGranted = await grantVirtueGem(
      db, body.learnerId, 'curiosity',
      `You learned ${unit.title} — ${correctCount} right. Now go and look at a real rock.`,
      { source: 'gems', unitCode: unit.code },
    );
  }

  return NextResponse.json({
    recorded: rows.length,
    correctCount,
    accuracy,
    passed,
    alreadyDone,
    stoneCode,
    gemGranted,
    completed: garden.gem_units ?? done,
  });
}

export async function GET(req: Request) {
  const learnerId = new URL(req.url).searchParams.get('learner');
  if (!learnerId) return NextResponse.json({ error: 'learner required' }, { status: 400 });
  const db = createServiceClient();
  const { data: row } = await db
    .from('world_state').select('garden').eq('learner_id', learnerId).maybeSingle();
  const garden = (row?.garden as Record<string, any>) ?? {};
  return NextResponse.json({
    completed: Array.isArray(garden.gem_units) ? garden.gem_units : [],
  });
}
