// app/(child)/town/art-store/page.tsx
//
// The Art Store — phase 1: the easel and her wall of pictures. The
// storefront scene, the shelves and the ride arrive in phase 2; this
// page is the making, which is the point of the whole building.

import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import type { ArtGallery } from '@/lib/world/artStore';
import { unreadReplies, type Letterbox } from '@/lib/world/letters';
import { canFeed } from '@/lib/world/lunaTreats';
import { todayKey } from '@/lib/learning/review';
import type { StudioErrand } from '@/lib/world/studioNudge';
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

  // ONE true thing waiting elsewhere, for the knock at the door. Every
  // branch below is a fact read from her own garden — the nudge never
  // invents an errand. Null is a fine answer.
  const today = todayKey();
  const unread = unreadReplies((garden.letters as Letterbox) ?? []).length;
  const lunaHungry = canFeed((garden.luna ?? {}) as { lastFed?: string }, today);
  const prizeUnclaimed = ((garden.arcade as any)?.munch?.prizeDate ?? null) !== today;
  const errand: StudioErrand | null =
    unread > 0
      ? { href: `/letters?learner=${learnerId}`,
          what: unread === 1
            ? 'There is a letter waiting in your letterbox'
            : `There are ${unread} letters waiting in your letterbox` }
      : lunaHungry
        ? { href: `/garden?learner=${learnerId}`, what: 'Luna has not been fed today' }
        : prizeUnclaimed
          ? { href: `/town/play-barn?learner=${learnerId}`,
              what: 'The Play Barn has a crate you have not opened today' }
          : null;

  const { data: learner } = await db
    .from('learner').select('first_name').eq('id', learnerId).maybeSingle();

  return (
    <ArtStoreScene learnerId={learnerId} initialGallery={gallery} baseUrl={baseUrl}
                   initialOwnedFrames={ownedFrames} initialCoins={coins}
                   firstName={(learner?.first_name as string) ?? 'you'}
                   errand={errand} />
  );
}
