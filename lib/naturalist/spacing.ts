// lib/naturalist/spacing.ts
//
// SM-2 "lite" spacing for the Naturalist Grove module. Pure functions —
// the caller injects the clock so tests are deterministic.
//
// Design spec: docs/superpowers/specs/2026-05-29-naturalist-grove-design.md §6

// Expanding review ladder, in days. exposures=1 → INTERVALS_DAYS[0], etc.
export const INTERVALS_DAYS = [1, 3, 7, 14, 30, 60] as const;

// Given how many times a learner has now identified a species, returns
// when it should next surface for review. Clamps to the ladder ends.
export function nextReviewAt(exposures: number, from: Date): Date {
  const idx = Math.min(Math.max(exposures, 1), INTERVALS_DAYS.length) - 1;
  const days = INTERVALS_DAYS[idx];
  const d = new Date(from.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

// Spacing that respects how the identification actually went: a clean
// run climbs the ladder by exposure count; a run with wrong turns (or
// a missed name-quiz) schedules a next-day revisit instead — seeing a
// species isn't the same as knowing it.
export function nextReviewAfterRun(exposures: number, cleanRun: boolean, from: Date): Date {
  return nextReviewAt(cleanRun ? exposures : 1, from);
}

// Is a species due for review? null/undefined next-review = never scheduled = due.
export function isDue(nextReview: Date | string | null | undefined, now: Date): boolean {
  if (nextReview == null) return true;
  const t = typeof nextReview === 'string' ? new Date(nextReview) : nextReview;
  return t.getTime() <= now.getTime();
}

// Interleaved practice: pick the photo role to show next. Prefer the first
// role this learner has NOT yet seen for this species; once all seen, cycle.
export function nextRoleForExposure<T extends string>(
  photoRoles: readonly T[],
  rolesSeen: readonly string[],
): T {
  if (photoRoles.length === 0) {
    throw new Error('nextRoleForExposure: photoRoles must be non-empty');
  }
  const unseen = photoRoles.filter(r => !rolesSeen.includes(r));
  if (unseen.length > 0) return unseen[0];
  // All roles seen — count only roles relevant to this species.
  const seenRelevant = rolesSeen.filter(r => (photoRoles as readonly string[]).includes(r));
  return photoRoles[seenRelevant.length % photoRoles.length];
}

// Progressive difficulty: clearer reference photos early, harder later.
export function tierForExposures(exposures: number): 1 | 2 | 3 {
  if (exposures < 3) return 1;
  if (exposures < 10) return 2;
  return 3;
}
