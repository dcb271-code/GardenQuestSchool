import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { getBird } from '@/lib/world/birdCatalog';
import { recordSighting, type LifeList } from '@/lib/birds/lifeList';
import { todayKey } from '@/lib/learning/review';
import { grantVirtueGem } from '@/lib/engine/virtueGrants';

/**
 * "I saw one!"
 *
 * The life list lives in world_state.garden.bird_lifelist, like every
 * other subject's progress — no migration, no new table.
 *
 * A FIRST sighting of a species grants the 'noticing' gem, which is
 * the exactly right virtue: noticing a bird out of a window is the
 * behaviour the entire curriculum exists to produce. Repeat sightings
 * still count (they build the record) but mint nothing, so the gem
 * cannot be farmed by tapping the same cardinal all afternoon.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const Body = z.object({
  learnerId: z.string().min(1),
  birdCode: z.string().min(1),
  note: z.string().max(280).optional(),
});

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const bird = getBird(body.birdCode);
  if (!bird) return NextResponse.json({ error: 'unknown bird' }, { status: 400 });

  const db = createServiceClient();
  const { data: stateRow } = await db
    .from('world_state')
    .select('garden')
    .eq('learner_id', body.learnerId)
    .maybeSingle();

  const garden = (stateRow?.garden as Record<string, unknown>) ?? {};
  const current = (garden.bird_lifelist as LifeList) ?? {};
  const { list, isFirst } = recordSighting(
    current, body.birdCode, todayKey(), body.note,
  );
  garden.bird_lifelist = list;

  const { error } = await db.from('world_state').upsert(
    { learner_id: body.learnerId, garden, last_updated_at: new Date().toISOString() },
    { onConflict: 'learner_id' },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let gemGranted = false;
  if (isFirst) {
    gemGranted = await grantVirtueGem(
      db, body.learnerId, 'noticing',
      `You saw a real ${bird.commonName} with your own eyes and wrote it down. That is what naturalists do.`,
      { source: 'bird_lifelist', birdCode: bird.code },
    );
  }

  return NextResponse.json({
    lifelist: list,
    isFirst,
    gemGranted,
    entry: list[body.birdCode],
  });
}

export async function GET(req: Request) {
  const learnerId = new URL(req.url).searchParams.get('learner');
  if (!learnerId) return NextResponse.json({ error: 'learner required' }, { status: 400 });

  const db = createServiceClient();
  const { data: row } = await db
    .from('world_state')
    .select('garden')
    .eq('learner_id', learnerId)
    .maybeSingle();
  const garden = (row?.garden as Record<string, unknown>) ?? {};
  return NextResponse.json({
    lifelist: (garden.bird_lifelist as LifeList) ?? {},
  });
}
