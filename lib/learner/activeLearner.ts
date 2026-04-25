/**
 * Active-learner resolution.
 *
 * Why this exists: the child pages (garden, journal, explore, habitats,
 * settings) used to default to the FIRST learner row when no
 * `?learner=` was in the URL. With multiple profiles in the DB that
 * meant tapping "garden" in any nav landed you on a stranger's
 * garden — including back-from-completion if the picker hadn't
 * threaded the id through. The badges quite reasonably said 0/N
 * because nobody had played as Cecily-the-seeded-row.
 *
 * Resolution order:
 *   1. `?learner=…` URL param (explicit, beats everything)
 *   2. `gqs-active-learner` cookie (set by ProfileTile on tap)
 *   3. Most-recently-active learner (last attempt wins)
 *   4. Most-recently-created learner (final fallback)
 */
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ACTIVE_LEARNER_COOKIE } from './activeLearnerKey';

// Re-export for backwards compatibility with any other server module
// that was importing the constant from here.
export { ACTIVE_LEARNER_COOKIE };

export async function resolveLearnerId(
  db: SupabaseClient,
  searchParamsLearner: string | undefined,
): Promise<string | null> {
  if (searchParamsLearner) return searchParamsLearner;

  // Server-side cookie (set by the picker when a profile is tapped).
  // `cookies()` throws in non-request contexts so guard it.
  try {
    const cookieStore = cookies();
    const fromCookie = cookieStore.get(ACTIVE_LEARNER_COOKIE)?.value;
    if (fromCookie) {
      // Sanity-check: the learner still exists. If they were deleted,
      // fall through to the recency-based fallback.
      const { data } = await db.from('learner').select('id').eq('id', fromCookie).maybeSingle();
      if (data?.id) return data.id;
    }
  } catch {
    // not in a request scope — skip cookie lookup
  }

  // Most recently active learner — whoever last submitted an attempt.
  const { data: lastAttempt } = await db
    .from('attempt')
    .select('learner_id')
    .not('learner_id', 'is', null)
    .order('attempted_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (lastAttempt?.learner_id) return lastAttempt.learner_id;

  // Final fallback: most recently created learner.
  const { data: newest } = await db
    .from('learner')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return newest?.id ?? null;
}
