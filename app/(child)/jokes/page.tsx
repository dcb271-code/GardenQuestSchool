// app/(child)/jokes/page.tsx
//
// The Silly Stump — Cecily's idea, from her letter of 2026-10-06.

import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import { riddlesFor } from '@/lib/world/jokeStump';
import StumpScene from './StumpScene';

export const dynamic = 'force-dynamic';

export default async function JokesPage({
  searchParams,
}: {
  searchParams: { learner?: string };
}) {
  const db = createServiceClient();
  const learnerId = await resolveLearnerId(db, searchParams.learner);
  if (!learnerId) {
    return <div className="p-6">No learner found.</div>;
  }
  const { data: me } = await db
    .from('learner').select('first_name, grade_level').eq('id', learnerId).maybeSingle();

  // Questions only — the answers stay on the server, which checks them.
  const riddles = riddlesFor(me?.grade_level ?? 2)
    .map(r => ({ id: r.id, question: r.question }));

  return (
    <StumpScene learnerId={learnerId} firstName={me?.first_name ?? 'me'} riddles={riddles} />
  );
}
