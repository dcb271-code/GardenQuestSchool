// lib/world/cumulativeProgress.ts
//
// Counts the learner's lifetime correct attempts. Used as the universal
// "growth point" tick for the Tiny Garden reward-game and as the basis
// for seed-earn thresholds.
//
// IMPORTANT: this query is called on every garden / grow page render,
// so it intentionally uses head:true (no row body) for speed.

import type { SupabaseClient } from '@supabase/supabase-js';

export async function getCumulativeCorrect(
  db: SupabaseClient,
  learnerId: string,
): Promise<number> {
  const { count, error } = await db
    .from('attempt')
    .select('*', { count: 'exact', head: true })
    .eq('learner_id', learnerId)
    .eq('outcome', 'correct');
  if (error) throw new Error(error.message);
  return count ?? 0;
}

// For the session-end celebration card we need the count BEFORE the
// session started. Same shape as above but with an attempted_at upper bound.
export async function getCumulativeCorrectAt(
  db: SupabaseClient,
  learnerId: string,
  before: Date,
): Promise<number> {
  const { count, error } = await db
    .from('attempt')
    .select('*', { count: 'exact', head: true })
    .eq('learner_id', learnerId)
    .eq('outcome', 'correct')
    .lt('attempted_at', before.toISOString());
  if (error) throw new Error(error.message);
  return count ?? 0;
}
