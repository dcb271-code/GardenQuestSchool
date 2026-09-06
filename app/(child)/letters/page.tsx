// app/(child)/letters/page.tsx
//
// The letterbox — a child writing directly to whoever builds this.

import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import { resolveLetterboxStyle } from '@/lib/world/letterbox';
import LetterScene from './LetterScene';

export const dynamic = 'force-dynamic';

export default async function LettersPage({
  searchParams,
}: {
  searchParams: { learner?: string };
}) {
  const db = createServiceClient();
  const learnerId = await resolveLearnerId(db, searchParams.learner);
  if (!learnerId) {
    return <div className="p-6">No learner found.</div>;
  }
  const { data: learners } = await db
    .from('learner').select('id, first_name').order('first_name');
  const me = (learners ?? []).find(l => l.id === learnerId);

  // Every box's paint job, in one query — the recipient chips show
  // each sibling's real letterbox, so "which box is whose" is
  // answered by looking, not reading.
  const ids = (learners ?? []).map(l => l.id as string);
  const { data: worlds } = await db
    .from('world_state').select('learner_id, garden').in('learner_id', ids);
  const boxOf = (id: string) =>
    resolveLetterboxStyle(
      ((worlds ?? []).find(w => w.learner_id === id)?.garden as
        Record<string, unknown> | undefined)?.letterbox);

  const siblings = (learners ?? [])
    .filter(l => l.id !== learnerId)
    .map(l => ({
      id: l.id as string,
      name: l.first_name as string,
      box: boxOf(l.id as string),
    }));

  return (
    <LetterScene learnerId={learnerId} firstName={me?.first_name ?? 'me'}
                 siblings={siblings} ownBox={boxOf(learnerId)} />
  );
}
