import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Update a learner's level and/or default challenge.
 *
 * Intentionally narrow: this is the parent-side "I picked the wrong
 * level when I set up this profile" path. We do NOT re-seed
 * skill_progress when the level changes — the planner adapts via Elo
 * over time, and a hard reseed would clobber any actual learning the
 * child has done. If a parent really wants a clean slate, they use
 * the existing /reset endpoint.
 */
const LevelSchema = z.union([
  z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5),
]);

const PatchBody = z.object({
  level: LevelSchema.optional(),
  // Legacy wire name for `level`.
  gradeLevel: LevelSchema.optional(),
  defaultChallenge: z.enum(['easier', 'normal', 'harder']).optional(),
  firstName: z.string().min(1).max(40).optional(),
  avatarKey: z.string().min(1).max(40).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = PatchBody.parse(await req.json());
  if (Object.keys(body).length === 0) {
    return NextResponse.json({ error: 'no fields to update' }, { status: 400 });
  }

  const db = createServiceClient();

  const update: Record<string, unknown> = {};
  const level = body.level ?? body.gradeLevel;
  if (level !== undefined) update.grade_level = level;
  if (body.defaultChallenge !== undefined) update.default_challenge = body.defaultChallenge;
  if (body.firstName !== undefined) update.first_name = body.firstName;
  if (body.avatarKey !== undefined) update.avatar_key = body.avatarKey;

  const { data, error } = await db
    .from('learner')
    .update(update)
    .eq('id', params.id)
    .select('id, first_name, avatar_key, grade_level, default_challenge')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ learner: data });
}
