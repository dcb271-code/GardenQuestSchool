// app/(child)/town/art-store/page.tsx
//
// The Art Store — phase 1: the easel and her wall of pictures. The
// storefront scene, the shelves and the ride arrive in phase 2; this
// page is the making, which is the point of the whole building.

import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import type { ArtGallery } from '@/lib/world/artStore';
import ArtStoreScene from './ArtStoreScene';

export const dynamic = 'force-dynamic';

export default async function ArtStorePage({
  searchParams,
}: {
  searchParams: { learner?: string };
}) {
  const db = createServiceClient();
  const learnerId = await resolveLearnerId(db, searchParams.learner);
  if (!learnerId) {
    return <div className="p-6">No learner found.</div>;
  }
  const { data: row } = await db
    .from('world_state').select('garden').eq('learner_id', learnerId).maybeSingle();
  const garden = (row?.garden as Record<string, any>) ?? {};
  const gallery: ArtGallery = Array.isArray(garden.art_gallery) ? garden.art_gallery : [];
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const ownedFrames: string[] = Array.isArray(garden.art_frames) ? garden.art_frames : [];
  const coins: number = (garden.cavern as any)?.coins ?? 0;

  return (
    <ArtStoreScene learnerId={learnerId} initialGallery={gallery} baseUrl={baseUrl}
                   initialOwnedFrames={ownedFrames} initialCoins={coins} />
  );
}
