// app/(child)/level0/basket/page.tsx
//
// Bunny's Basket — Level 0's second game. No gate. It is the bunny's
// invitation on a Level-0 child's map.
//
// Spec: docs/superpowers/specs/2026-09-26-level-zero-spec.md

import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import BasketScene from './BasketScene';

export const dynamic = 'force-dynamic';

export default async function BasketPage({
  searchParams,
}: {
  searchParams: { learner?: string };
}) {
  const db = createServiceClient();
  const learnerId = await resolveLearnerId(db, searchParams.learner);
  if (!learnerId) {
    return <div className="p-6">No learner found.</div>;
  }
  return <BasketScene learnerId={learnerId} />;
}
