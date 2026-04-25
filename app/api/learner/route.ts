import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';
import {
  baselineEloFor,
  masteredSkillsForGrade,
  reviewingSkillsForGrade,
  type GradeLevel,
  type DefaultChallenge,
} from '@/lib/learner/baseline';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const PARENT_ID = '00000000-0000-0000-0000-000000000001';

export async function GET() {
  const db = createServiceClient();
  const { data } = await db
    .from('learner')
    .select('id, first_name, avatar_key, grade_level, default_challenge')
    .eq('parent_id', PARENT_ID)
    .order('created_at', { ascending: true });
  return NextResponse.json({ learners: data ?? [] });
}

const AddBody = z.object({
  firstName: z.string().min(1).max(40),
  avatarKey: z.string().min(1).max(40),
  // Both are required for new learners — the AddLearnerModal forces
  // the parent to choose. Old code paths that POST without them get
  // sane defaults so we don't break anything mid-rollout.
  gradeLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(2),
  defaultChallenge: z.enum(['easier', 'normal', 'harder']).default('normal'),
});

export async function POST(req: Request) {
  const body = AddBody.parse(await req.json());
  const db = createServiceClient();

  const { data: learner, error } = await db.from('learner').insert({
    parent_id: PARENT_ID,
    first_name: body.firstName,
    avatar_key: body.avatarKey,
    grade_level: body.gradeLevel,
    default_challenge: body.defaultChallenge,
  }).select('id').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await db.from('world_state').upsert({
    learner_id: learner.id,
  }, { onConflict: 'learner_id' });

  // Seed grade-appropriate baseline mastery so the planner doesn't
  // start a 2nd grader on K counting.
  await seedBaselineMastery(
    db,
    learner.id,
    body.gradeLevel as GradeLevel,
    body.defaultChallenge as DefaultChallenge,
  );

  return NextResponse.json({ learnerId: learner.id });
}

async function seedBaselineMastery(
  db: ReturnType<typeof createServiceClient>,
  learnerId: string,
  grade: GradeLevel,
  challenge: DefaultChallenge,
) {
  // skill table is small (~50 rows) so a single fetch is fine.
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
      learner_id: learnerId,
      skill_id: idByCode.get(code),
      mastery_state: 'mastered',
      leitner_box: 5,
      student_elo: baselineElo + 100,   // mastered skills sit above the working band
      total_attempts: 12,
      total_correct: 12,
      last_attempted_at: now,
      next_review_at: inAWeek,
    })),
    ...reviewingCodes.map(code => ({
      learner_id: learnerId,
      skill_id: idByCode.get(code),
      mastery_state: 'review',
      leitner_box: 3,
      student_elo: baselineElo,
      total_attempts: 6,
      total_correct: 5,
      last_attempted_at: now,
      next_review_at: yesterday,        // due now → planner picks them up first
    })),
  ].filter(r => !!r.skill_id);

  if (rows.length === 0) return;
  const { error } = await db.from('skill_progress')
    .upsert(rows, { onConflict: 'learner_id,skill_id' });
  if (error) {
    console.error('seedBaselineMastery failed:', error.message, { learnerId, grade, challenge });
  }
}
