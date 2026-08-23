import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { todayKey } from '@/lib/learning/review';
import {
  recordRound, ROUND_LENGTH, type HummingbirdState,
} from '@/lib/packs/math/hummingbird';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * A nectar round, recorded so it counts. Null-item attempts with
 * source 'hummingbird' — fifth subject on the pattern. The flower is
 * capped one per day on HER day; a second round is cheerfully
 * allowed and pays nothing, and the timing number never leaves the
 * server's remark logic.
 */

const Body = z.object({
  learnerId: z.string().min(1),
  results: z.array(z.object({
    a: z.number().int().min(0).max(20),
    b: z.number().int().min(0).max(20),
    correct: z.boolean(),
    retries: z.number().int().min(0).max(50).default(0),
  })).min(1).max(ROUND_LENGTH),
  totalMs: z.number().int().min(0).max(30 * 60 * 1000),
});

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();

  const rows = body.results.map(r => ({
    learner_id: body.learnerId,
    session_id: null,
    item_id: null,
    outcome: r.correct ? 'correct' : 'incorrect',
    response: { source: 'hummingbird', fact: `${r.a}+${r.b}` },
    time_ms: null,
    retry_count: r.retries,
  }));
  const { error } = await db.from('attempt').insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: stateRow } = await db
    .from('world_state').select('garden').eq('learner_id', body.learnerId).maybeSingle();
  const garden = (stateRow?.garden as Record<string, any>) ?? {};
  const state: HummingbirdState = (garden.hummingbird as HummingbirdState) ?? {};

  const firstTryCount = body.results.filter(r => r.correct && r.retries === 0).length;
  const out = recordRound(state, firstTryCount, body.totalMs, todayKey());
  garden.hummingbird = out.state;

  const { error: we } = await db.from('world_state').upsert(
    { learner_id: body.learnerId, garden, last_updated_at: new Date().toISOString() },
    { onConflict: 'learner_id' },
  );
  if (we) return NextResponse.json({ error: we.message }, { status: 500 });

  return NextResponse.json({
    remark: out.remark,
    flowerEarned: out.flowerEarned,
    flowers: out.state.flowers ?? 0,
    firstTryCount,
  });
}
