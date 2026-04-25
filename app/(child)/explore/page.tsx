import { Suspense } from 'react';
import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import ExploreClient from './ExploreClient';
import ExploreHeader from './ExploreHeader';

export const dynamic = 'force-dynamic';

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: { learner?: string };
}) {
  // Resolve once on the server so the client doesn't have to read
  // cookies and the URL doesn't have to carry ?learner= for the
  // candidates fetch to know who to load.
  const db = createServiceClient();
  const learnerId = await resolveLearnerId(db, searchParams.learner);

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto space-y-6 pb-16">
      <ExploreHeader learnerId={learnerId} />
      <Suspense fallback={<div className="text-center font-display italic text-bark/60">…</div>}>
        <ExploreClient learnerId={learnerId} />
      </Suspense>
    </main>
  );
}
