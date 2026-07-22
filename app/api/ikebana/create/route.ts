import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { ikebanaFlowerCodes } from '@/lib/world/ikebana';
import { grantVirtueGem } from '@/lib/engine/virtueGrants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const Body = z.object({
  learnerId: z.string().min(1),
  shin: z.string().min(1),
  soe: z.string().min(1),
  hikae: z.string().min(1),
});

/**
 * Make an arrangement: verify the basket really holds the three stems,
 * record the arrangement, and consume the harvested rows (oldest first
 * — same FIFO as cooking).
 */
export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();

  const flowerCodes = new Set(ikebanaFlowerCodes());
  const stems = [body.shin, body.soe, body.hikae];
  if (stems.some(s => !flowerCodes.has(s))) {
    return NextResponse.json({ error: 'only flowers go in the vase' }, { status: 400 });
  }

  // How many of each flower this arrangement needs (roles may repeat).
  const needed: Record<string, number> = {};
  for (const s of stems) needed[s] = (needed[s] ?? 0) + 1;

  const { data: rows, error: rErr } = await db
    .from('garden_plot')
    .select('id, plant_code, harvested_at')
    .eq('learner_id', body.learnerId)
    .in('plant_code', Object.keys(needed))
    .not('harvested_at', 'is', null)
    .is('consumed_by_meal_id', null)
    .is('consumed_by_companion_id', null)
    .is('consumed_by_arrangement_id', null)
    .order('harvested_at', { ascending: true });
  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 });

  const byPlant = new Map<string, string[]>();
  for (const r of rows ?? []) {
    if (!byPlant.has(r.plant_code)) byPlant.set(r.plant_code, []);
    byPlant.get(r.plant_code)!.push(r.id);
  }

  const missing: Record<string, number> = {};
  const toConsume: string[] = [];
  for (const [plant, count] of Object.entries(needed)) {
    const have = byPlant.get(plant) ?? [];
    if (have.length < count) missing[plant] = count - have.length;
    else toConsume.push(...have.slice(0, count));
  }
  if (Object.keys(missing).length > 0) {
    return NextResponse.json({ error: 'not enough flowers', missing }, { status: 409 });
  }

  const { data: arrangement, error: aErr } = await db
    .from('arrangement')
    .insert({
      learner_id: body.learnerId,
      shin_plant_code: body.shin,
      soe_plant_code: body.soe,
      hikae_plant_code: body.hikae,
    })
    .select('id')
    .single();
  if (aErr || !arrangement) return NextResponse.json({ error: aErr?.message }, { status: 500 });

  const { error: cErr } = await db
    .from('garden_plot')
    .update({ consumed_by_arrangement_id: arrangement.id })
    .in('id', toConsume)
    .is('consumed_by_meal_id', null)
    .is('consumed_by_companion_id', null)
    .is('consumed_by_arrangement_id', null);
  if (cErr) {
    // Roll the arrangement back rather than leave one that used nothing.
    await db.from('arrangement').delete().eq('id', arrangement.id);
    return NextResponse.json({ error: cErr.message }, { status: 500 });
  }

  // Making something beautiful together and sharing your flowers with
  // Bachan is care (1/day cap in the helper).
  await grantVirtueGem(
    db, body.learnerId, 'care',
    'You shared your flowers with Bachan and arranged them together. Making something beautiful for someone is care.',
    { arrangementId: arrangement.id },
  );

  const { error: sigErr } = await db.from('interest_signal').insert([
    { learner_id: body.learnerId, tag: 'plants', weight: 1.0, source: 'ikebana_arrange' },
    { learner_id: body.learnerId, tag: 'art', weight: 1.0, source: 'ikebana_arrange' },
  ]);
  if (sigErr) console.error('interest_signal insert failed:', sigErr.message);

  return NextResponse.json({ arranged: true, arrangementId: arrangement.id });
}
