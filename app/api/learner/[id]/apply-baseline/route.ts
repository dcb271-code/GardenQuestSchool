import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import {
  baselineEloFor,
  masteredSkillsForGrade,
  reviewingSkillsForGrade,
  type GradeLevel,
  type DefaultChallenge,
} from '@/lib/learner/baseline';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Apply (or re-apply) the grade-appropriate baseline mastery for a
 * learner. Used by the parent dashboard for two cases:
 *
 *   1. Learners that pre-date the auto-baseline-on-create logic and
 *      never got their starting skill_progress rows seeded.
 *   2. Learners whose grade was just changed and whose skill_progress
 *      table is still empty (i.e. they never actually played).
 *
 * Safety: this endpoint upserts onto skill_progress with onConflict on
 * (learner_id, skill_id), which means it will OVERWRITE any progress
 * the learner has on the skills it touches. To avoid stomping real
 * learning, we refuse to run if the learner has any submitted attempts.
 * Parents who really do want a fresh start should use the existing
 * /reset endpoint first.
 */
export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const db = createServiceClient();

  const { data: learner, error: lErr } = await db
    .from('learner')
    .select('id, grade_level, default_challenge')
    .eq('id', params.id)
    .single();
  if (lErr || !learner) return NextResponse.json({ error: 'learner not found' }, { status: 404 });

  const grade = (learner.grade_level ?? 2) as GradeLevel;
  const challenge = (learner.default_challenge ?? 'normal') as DefaultChallenge;

  // Refuse to clobber actual learning.
  const { count: attemptCount } = await db
    .from('attempt')
    .select('id', { count: 'exact', head: true })
    .eq('learner_id', params.id);
  if ((attemptCount ?? 0) > 0) {
    return NextResponse.json(
      {
        error: 'this learner already has practice history — use Reset progress first if you want a fresh baseline',
        attemptCount,
      },
      { status: 409 },
    );
  }

  const { data: skillRows } = await db.from('skill').select('id, code');
  const idByCode = new Map<string, string>();
  for (const r of skillRows ?? []) idByCode.set(r.code, r.id);

  const baselineElo = baselineEloFor(grade, challenge);
  const masteredCodes = masteredSkillsForGrade(grade);
  const reviewingCodes = reviewingSkillsForGrade(grade);
  const now = new Date().toISOString();
  const inAWeek = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
  const yesterday = new Date(Date.now() - 24 * 3600 * 1000).toISOString();

  const rows = [
    ...masteredCodes.map(code => ({
      learner_id: params.id,
      skill_id: idByCode.get(code),
      mastery_state: 'mastered',
      leitner_box: 5,
      student_elo: baselineElo + 100,
      total_attempts: 12,
      total_correct: 12,
      last_attempted_at: now,
      next_review_at: inAWeek,
    })),
    ...reviewingCodes.map(code => ({
      learner_id: params.id,
      skill_id: idByCode.get(code),
      mastery_state: 'review',
      leitner_box: 3,
      student_elo: baselineElo,
      total_attempts: 6,
      total_correct: 5,
      last_attempted_at: now,
      next_review_at: yesterday,
    })),
  ].filter(r => !!r.skill_id);

  if (rows.length === 0) {
    return NextResponse.json({ ok: true, seededRows: 0 });
  }

  const { error: spErr } = await db
    .from('skill_progress')
    .upsert(rows, { onConflict: 'learner_id,skill_id' });
  if (spErr) return NextResponse.json({ error: spErr.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    seededRows: rows.length,
    grade,
    challenge,
    baselineElo,
  });
}
