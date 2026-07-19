import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const Body = z.object({
  learnerId: z.string().min(1),
  speciesCode: z.string().min(1),
  nickname: z.string().max(24).optional(),
});

/**
 * Adopt (or re-adopt) a discovered species as the garden friend.
 * Re-adopting a previous friend restores its bond history — the
 * unique (learner_id, species_code) row keeps bond_xp per species.
 */
export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();

  // Only creatures she has actually welcomed can be adopted.
  const { data: discovered } = await db
    .from('journal_entry')
    .select('species:species_id!inner(code)')
    .eq('learner_id', body.learnerId)
    .eq('species.code', body.speciesCode)
    .limit(1);
  if (!discovered || discovered.length === 0) {
    return NextResponse.json({ error: 'species not discovered yet' }, { status: 404 });
  }

  // Deactivate the current friend first (partial unique index enforces
  // one active row).
  await db.from('companion')
    .update({ active: false })
    .eq('learner_id', body.learnerId)
    .eq('active', true);

  const { data: existing } = await db
    .from('companion')
    .select('id')
    .eq('learner_id', body.learnerId)
    .eq('species_code', body.speciesCode)
    .maybeSingle();

  if (existing) {
    const { error } = await db.from('companion')
      .update({ active: true, ...(body.nickname ? { nickname: body.nickname } : {}) })
      .eq('id', existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await db.from('companion').insert({
      learner_id: body.learnerId,
      species_code: body.speciesCode,
      nickname: body.nickname ?? null,
      active: true,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ adopted: true, speciesCode: body.speciesCode });
}
