// app/(child)/birds/page.tsx
//
// The bird hide. Learn the birds that are actually outside the window,
// commonest first. Every answer is recorded as an attempt, so it grows
// the garden like everything else.

import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import BirdScene from './BirdScene';

export const dynamic = 'force-dynamic';

export default async function BirdsPage({
  searchParams,
}: {
  searchParams: { learner?: string };
}) {
  const db = createServiceClient();
  const learnerId = await resolveLearnerId(db, searchParams.learner);
  if (!learnerId) {
    return <div className="p-6">No learner found.</div>;
  }
  return <BirdScene learnerId={learnerId} />;
}
