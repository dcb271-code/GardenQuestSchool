import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { ESTIMATION_MIN_LEVEL } from '@/lib/world/estimationDuel';
import { grantVirtueGem } from '@/lib/engine/virtueGrants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const Body = z.object({
  learnerId: z.string().min(1),
  kidScore: z.number().int().min(0).max(3),
  hodgeScore: z.number().int().min(0).max(3),
});

/**
 * Records a finished estimation duel with Hodge. Beating (or tying)
 * Hodge earns a 'noticing' gem — estimation with reasons IS noticing —
 * with the daily cap in grantVirtueGem keeping replays from farming it.
 */
export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();

  const { data: learner } = await db
    .from('learner')
    .select('grade_level')
    .eq('id', body.learnerId)
    .single();
  if ((learner?.grade_level ?? 2) < ESTIMATION_MIN_LEVEL) {
    return NextResponse.json({ error: 'the duel opens at Level 3' }, { status: 403 });
  }

  let gemGranted = false;
  if (body.kidScore >= body.hodgeScore) {
    gemGranted = await grantVirtueGem(
      db, body.learnerId, 'noticing',
      body.kidScore > body.hodgeScore
        ? 'You out-estimated Hodge — with reasons, not wild guesses. Bundles of ten beat "sixty-ish" every time.'
        : 'You matched Hodge estimate for estimate. Noticing how many groups of ten — that\'s the whole trick.',
      { source: 'hodge_duel', kidScore: body.kidScore, hodgeScore: body.hodgeScore },
    );
  }

  return NextResponse.json({ ok: true, gemGranted });
}
