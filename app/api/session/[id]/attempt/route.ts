import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { scoreAnyItem } from '@/lib/packs';
import {
  updateElo, computeMasteryTransition, promoteBox, demoteBox, nextReviewDate,
} from '@/lib/engine';
import type { MasteryState } from '@/lib/engine/types';

const Body = z.object({
  itemId: z.string().min(1),
  response: z.record(z.string(), z.any()),
  timeMs: z.number().int().nonnegative(),
  retries: z.number().int().nonnegative().default(0),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();

  const { data: session } = await db
    .from('session').select('*').eq('id', params.id).single();
  if (!session) return NextResponse.json({ error: 'session not found' }, { status: 404 });

  const { data: item } = await db
    .from('item').select('*').eq('id', body.itemId).single();
  if (!item) return NextResponse.json({ error: 'item not found' }, { status: 404 });

  const { outcome } = scoreAnyItem(
    {
      id: item.id, skillId: item.skill_id, type: item.type,
      content: item.content, answer: item.answer,
      difficultyElo: item.difficulty_elo, generatedBy: item.generated_by,
    },
    body.response
  );

  const correct = outcome === 'correct';

  await db.from('attempt').insert({
    session_id: params.id,
    item_id: body.itemId,
    outcome,
    response: body.response,
    time_ms: body.timeMs,
    retry_count: body.retries,
  });

  await db.from('session').update({
    items_attempted: (session.items_attempted ?? 0) + 1,
    items_correct: (session.items_correct ?? 0) + (correct ? 1 : 0),
  }).eq('id', params.id);

  const { data: prog } = await db
    .from('skill_progress')
    .select('*')
    .eq('learner_id', session.learner_id)
    .eq('skill_id', item.skill_id)
    .maybeSingle();

  const currentState: MasteryState = (prog?.mastery_state ?? 'new') as MasteryState;
  const studentElo = prog?.student_elo ?? 1000;

  const elo = updateElo({
    itemRating: item.difficulty_elo,
    studentRating: studentElo,
    correct,
  });

  const { count: correctInSession } = await db
    .from('attempt').select('*', { count: 'exact', head: true })
    .eq('session_id', params.id).eq('outcome', 'correct');
  const streakThisSession = (correctInSession ?? 0);

  const isNewSession = prog?.last_attempted_at
    ? new Date(prog.last_attempted_at).toDateString() !== new Date(session.started_at).toDateString()
    : false;

  const transition = computeMasteryTransition({
    currentState,
    correct,
    streakCorrect: (prog?.streak_correct ?? 0) + (correct ? 1 : 0),
    sameSessionStreak: streakThisSession,
    isNewSession,
    studentElo,
    itemElo: item.difficulty_elo,
  });

  const newBox = correct ? promoteBox(prog?.leitner_box ?? 1) : demoteBox(prog?.leitner_box ?? 1);
  const newNextReview = nextReviewDate(newBox);

  const priorState = currentState;
  const newState = transition.newState;
  const priorTransitions = ((prog as any)?.state_transitions ?? []) as Array<{ at: string; from: string; to: string }>;
  const newTransitions = newState !== priorState
    ? [...priorTransitions, { at: new Date().toISOString(), from: priorState, to: newState }]
    : priorTransitions;

  await db.from('skill_progress').upsert({
    learner_id: session.learner_id,
    skill_id: item.skill_id,
    mastery_state: newState,
    leitner_box: newBox,
    student_elo: Math.round(elo.newStudentRating),
    streak_correct: correct ? (prog?.streak_correct ?? 0) + 1 : 0,
    total_attempts: (prog?.total_attempts ?? 0) + 1,
    total_correct: (prog?.total_correct ?? 0) + (correct ? 1 : 0),
    last_attempted_at: new Date().toISOString(),
    next_review_at: newNextReview.toISOString(),
    state_transitions: newTransitions,
  }, { onConflict: 'learner_id,skill_id' });

  await db.from('item').update({
    difficulty_elo: Math.round(elo.newItemRating),
    usage_count: (item.usage_count ?? 0) + 1,
    last_served_at: new Date().toISOString(),
  }).eq('id', item.id);

  return NextResponse.json({ outcome, transition });
}
