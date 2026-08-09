// app/(child)/garden/shop/page.tsx
//
// The Yard. Reached from the garden, and from the cavern where the
// coins come from.

import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import { emptyShop, type ShopState } from '@/lib/world/shopCatalog';
import { emptyCavern, type CavernState } from '@/lib/world/cavern';
import ShopScene from './ShopScene';

export const dynamic = 'force-dynamic';

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { learner?: string };
}) {
  const db = createServiceClient();
  const learnerId = await resolveLearnerId(db, searchParams.learner);
  if (!learnerId) redirect('/');

  const { data: row } = await db
    .from('world_state').select('garden').eq('learner_id', learnerId).maybeSingle();
  const garden = (row?.garden as Record<string, unknown>) ?? {};
  const shop: ShopState = { ...emptyShop(), ...((garden.shop as ShopState) ?? {}) };
  const cavern: CavernState = { ...emptyCavern(), ...((garden.cavern as CavernState) ?? {}) };

  return <ShopScene learnerId={learnerId} coins={cavern.coins} shop={shop} />;
}
