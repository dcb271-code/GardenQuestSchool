// app/(child)/garden/grow/page.tsx
//
// Server component for the Tiny Garden reward-game. Loads everything
// the scene needs via loadGrowState and hands off to GrowScene.

import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import { loadGrowState } from '@/lib/world/growGarden';
import GrowScene from './GrowScene';

export const dynamic = 'force-dynamic';

export default async function GrowPage({
  searchParams,
}: {
  searchParams: { learner?: string };
}) {
  const db = createServiceClient();
  const learnerId = await resolveLearnerId(db, searchParams.learner);
  if (!learnerId) {
    return <div className="p-6">No learner found.</div>;
  }
  const state = await loadGrowState(db, learnerId);

  return <GrowScene learnerId={learnerId} state={state} />;
}
