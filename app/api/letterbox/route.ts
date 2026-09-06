import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { setLetterboxStyle } from '@/lib/world/letterbox';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Paint your letterbox. Free, no gates — it is their mailbox.
 * Validation refuses nonsense in words; the flag is not stylable
 * (signal red is a signal), so it is not even in the schema.
 */

const Body = z.object({
  learnerId: z.string().min(1),
  color: z.string().max(20),
  emblem: z.string().max(20).nullable(),
});

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();

  const out = setLetterboxStyle(body.color, body.emblem);
  if ('error' in out) {
    return NextResponse.json({ error: out.error }, { status: 400 });
  }

  const { data: row } = await db
    .from('world_state').select('garden').eq('learner_id', body.learnerId).maybeSingle();
  const garden = (row?.garden as Record<string, unknown>) ?? {};
  garden.letterbox = out.style;

  const { error } = await db.from('world_state').upsert(
    { learner_id: body.learnerId, garden, last_updated_at: new Date().toISOString() },
    { onConflict: 'learner_id' },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ style: out.style });
}
