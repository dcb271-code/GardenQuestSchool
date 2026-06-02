import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';

const Body = z.object({
  learnerId: z.string().min(1),
  floraCode: z.string().min(1),
  photoRole: z.string().optional(),  // role of the hero photo Cecily just saw
});

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();
  const now = new Date().toISOString();

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
    const { data: updated, error: upErr } = await db
      .from('flora_review')
      .update({
        exposures: existing.exposures + 1,
        last_seen_at: now,
        photo_roles_seen: nextRoles,
      })
      .eq('id', existing.id)
      .select('id, exposures')
      .single();
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
    return NextResponse.json({ id: updated!.id, exposures: updated!.exposures, isNew: false });
  }

  const { data: created, error: insErr } = await db
    .from('flora_review')
    .insert({
      learner_id: body.learnerId,
      flora_code: body.floraCode,
      exposures: 1,
      last_seen_at: now,
      photo_roles_seen: body.photoRole ? [body.photoRole] : [],
    })
    .select('id, exposures')
    .single();
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
  return NextResponse.json({ id: created!.id, exposures: created!.exposures, isNew: true });
}
