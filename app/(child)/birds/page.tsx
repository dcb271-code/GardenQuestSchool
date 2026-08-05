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

  // Level picks the tier. The hide was built for a Level-3 seven-year
  // old; a Level-1 learner gets the same birds with the abstractions
  // taken out (see BirdTier in lib/birds/curriculum.ts). DB column is
  // still called grade_level.
  const { data: learner } = await db
    .from('learner').select('grade_level').eq('id', learnerId).maybeSingle();
  const learnerLevel = learner?.grade_level ?? 2;

  return <BirdScene learnerId={learnerId} learnerLevel={learnerLevel} />;
}
