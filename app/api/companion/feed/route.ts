import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { todayString } from '@/lib/companion/companionRules';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const Body = z.object({
  learnerId: z.string().min(1),
  plantCode: z.string().min(1),
});

/**
 * Feed the active companion one harvested crop. Consumes the oldest
 * unconsumed harvest row (FIFO, same pantry rule as the kitchen).
 * Once per day — the 409 is the server-side cap that keeps feeding a
 * small daily ritual instead of a basket dump.
 */
export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();
  const today = todayString();

  const { data: companion } = await db
    .from('companion')
    .select('*')
    .eq('learner_id', body.learnerId)
    .eq('active', true)
    .maybeSingle();
  if (!companion) return NextResponse.json({ error: 'no-companion' }, { status: 404 });
  if (companion.last_fed_on === today) {
    return NextResponse.json({ error: 'already-fed' }, { status: 409 });
  }

  const { data: harvestRows } = await db
    .from('garden_plot')
    .select('id')
    .eq('learner_id', body.learnerId)
    .eq('plant_code', body.plantCode)
    .not('harvested_at', 'is', null)
    .is('consumed_by_meal_id', null)
    .is('consumed_by_companion_id', null)
    .order('harvested_at', { ascending: true })
    .limit(1);
  const row = harvestRows?.[0];
  if (!row) return NextResponse.json({ error: 'no-harvest' }, { status: 409 });

  const { error: cErr } = await db
    .from('garden_plot')
    .update({ consumed_by_companion_id: companion.id })
    .eq('id', row.id)
    .is('consumed_by_meal_id', null)
    .is('consumed_by_companion_id', null);
  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });

  const { data: updated, error: uErr } = await db
    .from('companion')
    .update({ last_fed_on: today, bond_xp: companion.bond_xp + 1 })
    .eq('id', companion.id)
    .select('bond_xp, last_fed_on')
    .single();
  if (uErr) return NextResponse.json({ error: uErr.message }, { status: 500 });

  return NextResponse.json({ fed: true, fedWith: body.plantCode, bondXp: updated!.bond_xp });
}
