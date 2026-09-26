// app/(child)/level0/ladybug/page.tsx
//
// The Ladybug Count — Level 0's first game. No gate: any child may
// count ladybugs. It is the invitation on a Level-0 child's map.
//
// Spec: docs/superpowers/specs/2026-09-26-level-zero-spec.md

import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import LadybugScene from './LadybugScene';

export const dynamic = 'force-dynamic';

export default async function LadybugPage({
  searchParams,
}: {
  searchParams: { learner?: string };
}) {
  const db = createServiceClient();
  const learnerId = await resolveLearnerId(db, searchParams.learner);
  if (!learnerId) {
    return <div className="p-6">No learner found.</div>;
  }
  return <LadybugScene learnerId={learnerId} />;
}
