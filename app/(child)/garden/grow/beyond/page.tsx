// app/(child)/garden/grow/beyond/page.tsx
//
// Server component for the second grow screen — the garden beyond the
// trellis. Same loader as the home screen; redirects back if the
// trellis gate is still locked (mastery-gated, see trellisGating.ts)
// so a typed-in URL can't skip past it.

import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import { loadGrowState } from '@/lib/world/growGarden';
import BeyondScene from './BeyondScene';

export const dynamic = 'force-dynamic';

export default async function BeyondPage({
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
  if (!state.trellisUnlocked) {
    redirect(`/garden/grow?learner=${learnerId}`);
  }

  return <BeyondScene learnerId={learnerId} state={state} />;
}
