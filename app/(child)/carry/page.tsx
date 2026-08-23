// app/(child)/carry/page.tsx
//
// The Carrying Lanes — the ant colony teaches regrouping. Reached
// from the ant hill interior. The 4-digit lane appears only when its
// items actually exist, because a button that starts nothing is a
// dead tap.

import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import CarryWorkshop from './CarryWorkshop';

export const dynamic = 'force-dynamic';

export default async function CarryPage({
  searchParams,
}: {
  searchParams: { learner?: string };
}) {
  const db = createServiceClient();
  const learnerId = await resolveLearnerId(db, searchParams.learner);
  if (!learnerId) {
    return <div className="p-6">No learner found.</div>;
  }

  const { data: sk } = await db
    .from('skill').select('id').eq('code', 'math.add.within_10000').maybeSingle();
  let has4digit = false;
  if (sk) {
    const { count } = await db
      .from('item').select('*', { count: 'exact', head: true }).eq('skill_id', sk.id);
    has4digit = (count ?? 0) > 0;
  }

  return <CarryWorkshop learnerId={learnerId} has4digit={has4digit} />;
}
