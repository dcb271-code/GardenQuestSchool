// app/(child)/gems/page.tsx
//
// The study table — the learning half of Crystal Cavern. Four units
// on the seam stones, generated from the same catalog the cavern
// digs from. Every answer is recorded as an attempt, so studying
// minerals grows the garden like everything else.

import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import GemScene from './GemScene';

export const dynamic = 'force-dynamic';

export default async function GemsPage({
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
  const completed: string[] = Array.isArray(garden.gem_units) ? garden.gem_units : [];

  return <GemScene learnerId={learnerId} initialCompleted={completed} />;
}
