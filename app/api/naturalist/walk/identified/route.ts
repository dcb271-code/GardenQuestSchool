import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { nextReviewAt, nextReviewAfterRun } from '@/lib/naturalist/spacing';
import { FLORA_CATALOG } from '@/lib/world/floraCatalog';

const Body = z.object({
  learnerId: z.string().min(1),
  floraCode: z.string().min(1),
  photoRole: z.string().optional(),  // role of the hero photo Cecily just saw
  // False when the child took wrong turns in the key (or missed the
  // name quiz): the species still counts as seen, but it comes back
  // tomorrow instead of climbing the spacing ladder.
  cleanRun: z.boolean().default(true),
});

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();
  const now = new Date();
  const nowIso = now.toISOString();

  // Try to fetch existing
  const { data: existing, error: selErr } = await db
    .from('flora_review')
    .select('id, exposures, photo_roles_seen')
    .eq('learner_id', body.learnerId)
    .eq('flora_code', body.floraCode)
    .maybeSingle();
  if (selErr) return NextResponse.json({ error: selErr.message }, { status: 500 });

  if (existing) {
    const rolesSeen: string[] = Array.isArray(existing.photo_roles_seen) ? existing.photo_roles_seen : [];
    const nextRoles = body.photoRole && !rolesSeen.includes(body.photoRole)
      ? [...rolesSeen, body.photoRole]
      : rolesSeen;
    const newExposures = existing.exposures + 1;
    const { data: updated, error: upErr } = await db
      .from('flora_review')
      .update({
        exposures: newExposures,
        last_seen_at: nowIso,
        next_review_at: nextReviewAfterRun(newExposures, body.cleanRun, now).toISOString(),
        photo_roles_seen: nextRoles,
      })
      .eq('id', existing.id)
      .select('id, exposures, next_review_at')
      .single();
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
    return NextResponse.json({
      id: updated!.id,
      exposures: updated!.exposures,
      nextReviewAt: updated!.next_review_at,
      isNew: false,
    });
  }

  const { data: created, error: insErr } = await db
    .from('flora_review')
    .insert({
      learner_id: body.learnerId,
      flora_code: body.floraCode,
      exposures: 1,
      last_seen_at: nowIso,
      next_review_at: nextReviewAt(1, now).toISOString(),
      photo_roles_seen: body.photoRole ? [body.photoRole] : [],
    })
    .select('id, exposures, next_review_at')
    .single();
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  // First discovery of this species — emit gentle interest signals so
  // the planner can surface plant/flower-themed skills next session.
  // Non-fatal: a logging failure must never break the discovery.
  const flora = FLORA_CATALOG.find(f => f.code === body.floraCode);
  const floraTags = flora?.kind === 'flower'
    ? ['flowers', 'plants', 'nature']
    : ['plants', 'nature'];
  const { error: sigErr } = await db.from('interest_signal').insert(
    floraTags.map(tag => ({
      learner_id: body.learnerId,
      tag,
      weight: 0.5,
      source: 'naturalist_identify',
    })),
  );
  if (sigErr) console.error('interest_signal insert failed:', sigErr.message);

  return NextResponse.json({
    id: created!.id,
    exposures: created!.exposures,
    nextReviewAt: created!.next_review_at,
    isNew: true,
  });
}
