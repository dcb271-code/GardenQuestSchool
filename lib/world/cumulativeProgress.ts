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


/**
 * Lifetime correct answers PER SKILL.
 *
 * Paginated, and that is the whole point. Three pages used to do this
 * inline with a single unbounded select — and PostgREST silently caps
 * a select at 1000 rows. Under 1000 lifetime attempts nobody notices;
 * past it, every per-skill count is computed from an arbitrary
 * truncated sample and starts drifting DOWNWARD as the child plays
 * more.
 *
 * That is not cosmetic. These counts unlock habitats (20+ correct at a
 * prereq) and drive every progress badge on every map. Cecily crossed
 * 1000 attempts, and the first symptom was a seven-year-old writing to
 * ask why Crystal Cavern had locked itself: her 28 correct answers at
 * the gate skill were sitting outside the window.
 *
 * Counting rows in the app is not ideal either — a GROUP BY belongs in
 * the database — but it is correct, it needs no migration, and a few
 * thousand rows is a few hundred kilobytes. Correct first.
 */
export async function correctCountsBySkill(
  db: SupabaseClient,
  learnerId: string,
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db
      .from('attempt')
      .select('item:item_id(skill:skill_id(code))')
      .eq('learner_id', learnerId)
      .eq('outcome', 'correct')
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    for (const row of data as Array<{ item?: { skill?: { code?: string } } }>) {
      const code = row.item?.skill?.code;
      if (code) counts.set(code, (counts.get(code) ?? 0) + 1);
    }
    if (data.length < PAGE) break;
  }
  return counts;
}
