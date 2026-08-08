import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { checkLearnerDelete } from '@/lib/learner/deleteGuards';

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


/**
 * Remove a learner profile entirely.
 *
 * There was no way to do this. A duplicate profile created by a
 * double-tap could be renamed or reset but never removed, so it sat in
 * the picker forever.
 *
 * Two guards, both deliberate:
 *
 *   * The LAST learner cannot be deleted. An app with no learners has
 *     no way back in through the child UI.
 *   * The caller must send the profile's exact name. This is the one
 *     irreversible action in the parent area, and a mis-tap on the
 *     wrong card would take a real child's history with it.
 */
const DeleteBody = z.object({
  confirmName: z.string().min(1),
});

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const body = DeleteBody.parse(await req.json().catch(() => ({})));
  const db = createServiceClient();

  const { data: learner } = await db
    .from('learner').select('id, first_name').eq('id', params.id).maybeSingle();
  const { count } = await db.from('learner').select('*', { count: 'exact', head: true });

  const verdict = checkLearnerDelete({
    actualName: learner ? String(learner.first_name) : null,
    confirmName: body.confirmName,
    totalLearners: count ?? 0,
  });
  if (!verdict.ok) {
    return NextResponse.json({ error: verdict.error }, { status: verdict.status });
  }

  // One delete is enough. Every table that scopes to a learner —
  // attempt, session, skill_progress, habitat, garden_plot,
  // journal_entry, companion, virtue_gem, world_state, and the rest —
  // declares `references learner(id) on delete cascade`, so Postgres
  // tears down the whole history in the right order inside one
  // transaction. Deleting them by hand first would duplicate that in
  // application code, where a table added later would be silently
  // missed and the ordering could drift out of step with the schema.
  const { error } = await db.from('learner').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ deleted: params.id, name: learner!.first_name });
}
