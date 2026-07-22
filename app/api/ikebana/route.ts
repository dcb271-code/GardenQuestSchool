import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { PLANT_CATALOG } from '@/lib/world/plantCatalog';
import { IKEBANA_UNLOCK_FLOWERS, ikebanaFlowerCodes } from '@/lib/world/ikebana';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Ikebana state for a learner: whether Bachan offers it yet (lifetime
 * flower harvests vs the unlock bar), which flowers are in the basket
 * (harvested, not yet spent on a meal / companion / arrangement), and
 * the arrangements made so far.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const learnerId = url.searchParams.get('learner');
  if (!learnerId) return NextResponse.json({ error: 'learner required' }, { status: 400 });

  const db = createServiceClient();
  const flowerCodes = ikebanaFlowerCodes();

  // Lifetime flower harvests — spent flowers still count toward the
  // unlock, the gate rewards growing.
  const { count: lifetime } = await db
    .from('garden_plot')
    .select('id', { count: 'exact', head: true })
    .eq('learner_id', learnerId)
    .in('plant_code', flowerCodes)
    .not('harvested_at', 'is', null);

  const { data: basketRows } = await db
    .from('garden_plot')
    .select('plant_code')
    .eq('learner_id', learnerId)
    .in('plant_code', flowerCodes)
    .not('harvested_at', 'is', null)
    .is('consumed_by_meal_id', null)
    .is('consumed_by_companion_id', null)
    .is('consumed_by_arrangement_id', null);

  const basket: Record<string, number> = {};
  for (const r of basketRows ?? []) {
    basket[r.plant_code] = (basket[r.plant_code] ?? 0) + 1;
  }

  const { data: arrangements } = await db
    .from('arrangement')
    .select('id, shin_plant_code, soe_plant_code, hikae_plant_code, arranged_at')
    .eq('learner_id', learnerId)
    .order('arranged_at', { ascending: false });

  const plantNames = Object.fromEntries(PLANT_CATALOG.map(p => [p.code, p.commonName]));

  return NextResponse.json({
    unlocked: (lifetime ?? 0) >= IKEBANA_UNLOCK_FLOWERS,
    lifetimeFlowerHarvests: lifetime ?? 0,
    needed: IKEBANA_UNLOCK_FLOWERS,
    basket,
    plantNames,
    arrangements: arrangements ?? [],
  });
}
