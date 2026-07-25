// app/(child)/music/page.tsx
//
// The music room. Self-contained theory practice for a young pianist;
// every answer is recorded as an attempt, so it grows the garden.

import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import MusicScene from './MusicScene';

export const dynamic = 'force-dynamic';

export default async function MusicPage({
  searchParams,
}: {
  searchParams: { learner?: string };
}) {
  const db = createServiceClient();
  const learnerId = await resolveLearnerId(db, searchParams.learner);
  if (!learnerId) {
    return <div className="p-6">No learner found.</div>;
  }
  return <MusicScene learnerId={learnerId} />;
}
