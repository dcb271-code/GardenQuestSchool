import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { todayKey } from '@/lib/learning/review';
import { grantVirtueGem } from '@/lib/engine/virtueGrants';
import {
  recordCrowResults, type CrowCacheState, type CrowResult,
} from '@/lib/packs/math/crowPractice';
import { CROW_SCENES } from '@/lib/packs/math/crowScenes';
import { factKey } from '@/lib/packs/math/timesTable';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Crow practice, recorded so it counts twice over.
 *
 * Each answer becomes a null-item attempt row with the FACT in the
 * response, so the workshop's per-fact accuracy (extended to read
 * these) and the garden's growth both see crow work — the birds' and
 * gems' pattern, fourth subject on it.
 *
 * Gold frames are computed HERE on her home-timezone day: three
 * first-try corrects across at least two days. On a newly gold frame
 * a 'practice' virtue gem may be granted (bounded: six facts ever,
 * plus the existing one-per-day virtue cap). No coins, no stones.
 */

const VALID_KEYS = new Set(CROW_SCENES.map(s => factKey(s.a, s.b)));

const Body = z.object({
  learnerId: z.string().min(1),
  results: z.array(z.object({
    factKey: z.string().min(3),
    kind: z.enum(['forward', 'reverse']),
    correct: z.boolean(),
    retries: z.number().int().min(0).max(50).default(0),
  })).min(1).max(20),
});

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();

  const results = body.results.filter(r => VALID_KEYS.has(r.factKey));
  if (results.length === 0) {
    return NextResponse.json({ error: 'no valid facts in results' }, { status: 400 });
  }

  const rows = results.map(r => ({
    learner_id: body.learnerId,
    session_id: null,
    item_id: null,
    outcome: r.correct ? 'correct' : 'incorrect',
    response: {
      source: 'crow',
      fact: r.factKey,
      exercise: r.kind,
    },
    time_ms: null,
    retry_count: r.retries,
  }));
  const { error } = await db.from('attempt').insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: stateRow } = await db
    .from('world_state').select('garden').eq('learner_id', body.learnerId).maybeSingle();
  const garden = (stateRow?.garden as Record<string, any>) ?? {};
  const cache: CrowCacheState = (garden.crow_cache as CrowCacheState) ?? {};

  const crowResults: CrowResult[] = results.map(r => ({
    factKey: r.factKey, correct: r.correct && r.retries === 0, retries: r.retries,
  }));
  const out = recordCrowResults(cache, crowResults, todayKey());
  garden.crow_cache = out.cache;

  const { error: we } = await db.from('world_state').upsert(
    { learner_id: body.learnerId, garden, last_updated_at: new Date().toISOString() },
    { onConflict: 'learner_id' },
  );
  if (we) return NextResponse.json({ error: we.message }, { status: 500 });

  let gemGranted = false;
  if (out.newlyGold.length > 0) {
    const key = out.newlyGold[0].replace('x', ' × ');
    gemGranted = await grantVirtueGem(
      db, body.learnerId, 'practice',
      `${key} held across days — its frame on the crow's wall is gold now.`,
      { source: 'crow', facts: out.newlyGold },
    );
  }

  return NextResponse.json({
    recorded: rows.length,
    cache: out.cache,
    newlyGold: out.newlyGold,
    newFeather: out.newFeather,
    gemGranted,
  });
}
