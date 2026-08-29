// app/(child)/town/play-barn/page.tsx
//
// The Play Barn — the bike's second road. No gates: any level, all
// three children, nothing requires reading (crates are listenable).
//
// Spec: docs/superpowers/specs/2026-08-29-munch-patch-spec.md

import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import type { MunchState } from '@/lib/packs/math/munch';
import PlayBarnScene from './PlayBarnScene';

export const dynamic = 'force-dynamic';

export default async function PlayBarnPage({
  searchParams,
}: {
  searchParams: { learner?: string };
}) {
  const db = createServiceClient();
  const learnerId = await resolveLearnerId(db, searchParams.learner);
  if (!learnerId) {
    return <div className="p-6">No learner found.</div>;
  }

  const { data: learner } = await db
    .from('learner').select('grade_level').eq('id', learnerId).maybeSingle();
  // Level 1–5 (the DB column keeps its old name).
  const level = (learner?.grade_level as number) ?? 2;

  const { data: row } = await db
    .from('world_state').select('garden').eq('learner_id', learnerId).maybeSingle();
  const garden = (row?.garden as Record<string, any>) ?? {};
  const munch: MunchState = ((garden.arcade as any)?.munch as MunchState) ?? {};

  return (
    <PlayBarnScene
      learnerId={learnerId}
      level={level}
      initialPrizes={munch.prizes ?? []}
    />
  );
}
