import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { grantVirtueGem } from '@/lib/engine/virtueGrants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const Body = z.object({
  learnerId: z.string().min(1),
  // e.g. 'plant:tomato', 'species:monarch', 'flora:red_oak'
  code: z.string().min(1).max(80),
});

const CURIOSITY_THRESHOLD = 3; // distinct facts in a day

const CURIOSITY_LINES = [
  'You went exploring the journal — curiosity is how naturalists find new things.',
  'Three different facts in one day. The garden notices a curious mind.',
  'You keep peeking at how things work. That\'s exactly what naturalists do.',
];

/**
 * Record that the learner opened a fact card. When they've explored
 * ≥3 distinct facts today, that's curiosity — grant the gem (the
 * 1/day cap in grantVirtueGem makes tap-spam pointless, and the
 * primary key makes re-opening the same card a no-op).
 */
export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();

  const { error: insErr } = await db.from('fact_peek').upsert(
    { learner_id: body.learnerId, code: body.code },
    { onConflict: 'learner_id,code,day', ignoreDuplicates: true },
  );
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  const { count } = await db
    .from('fact_peek')
    .select('code', { count: 'exact', head: true })
    .eq('learner_id', body.learnerId)
    .eq('day', new Date().toISOString().slice(0, 10));

  let curiosityGranted = false;
  if ((count ?? 0) >= CURIOSITY_THRESHOLD) {
    const line = CURIOSITY_LINES[(count ?? 0) % CURIOSITY_LINES.length];
    curiosityGranted = await grantVirtueGem(db, body.learnerId, 'curiosity', line);
  }

  return NextResponse.json({ ok: true, distinctToday: count ?? 0, curiosityGranted });
}
