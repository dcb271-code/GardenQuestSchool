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
 * Asks the DATABASE to count, via the `skill_correct_counts` function
 * in migration 020. That returns one row per skill — about 66 today,
 * and still 66 at ten thousand attempts.
 *
 * The history here is worth keeping. Four pages used to fetch a
 * learner's entire correct-attempt history in a single select and
 * count it in JavaScript. PostgREST silently caps a select at 1000
 * rows, so past 1000 lifetime attempts every count was computed from
 * an arbitrary truncated window — and these counts unlock habitats
 * (20+ correct at a prereq) and drive every progress badge on every
 * map. They got wronger the more the child played. The first symptom
 * was a seven-year-old asking why Crystal Cavern had locked itself.
 *
 * Paginating fixed the correctness and left the shape wrong: three
 * round trips and 2,400 rows on every render, growing forever.
 *
 * FALLBACK, and it is deliberate. Migrations here are applied by hand
 * and can lag a deploy, so if the function is missing this falls back
 * to the paginated count rather than returning nothing. A map that
 * renders slowly is recoverable; a map that silently reports zero
 * progress locks doors on a child.
 */
export async function correctCountsBySkill(
  db: SupabaseClient,
  learnerId: string,
): Promise<Map<string, number>> {
  const { data, error } = await db.rpc('skill_correct_counts', { p_learner_id: learnerId });
  if (!error && Array.isArray(data)) {
    const counts = new Map<string, number>();
    for (const row of data as Array<{ skill_code: string; correct_count: number }>) {
      counts.set(row.skill_code, Number(row.correct_count));
    }
    return counts;
  }
  console.warn(
    'skill_correct_counts RPC unavailable — falling back to a paginated count. ' +
    'Has migration 020 been applied to this database?',
    error?.message,
  );
  return countBySkillPaginated(db, learnerId);
}

/**
 * The fallback. Correct but O(history): pages through every correct
 * attempt 1000 at a time, because a single unbounded select would be
 * silently truncated.
 */
export async function countBySkillPaginated(
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
