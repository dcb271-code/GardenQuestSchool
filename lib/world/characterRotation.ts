// lib/world/characterRotation.ts
//
// Daily-deterministic pick of which quick-start character is "alert"
// today on the central garden. Pure function — no DB writes, no calls
// to the engine. Hash of (learnerId + YYYY-MM-DD) mod 3.
//
// Why deterministic per day: if the picker were random, the same
// learner could see Nana alert at 9am and Hodge alert at 9:01am, which
// would feel arbitrary. Daily rotation gives the world a "today's
// person" rhythm that's quietly stable.

export const CHARACTER_CODES = ['nana', 'hodge', 'signpost'] as const;
export type CharacterCode = typeof CHARACTER_CODES[number];

/**
 * Java-style String.hashCode — small, fast, no deps.
 * Returns a non-negative integer.
 */
function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function todaysAlertCharacter(
  learnerId: string,
  today: Date = new Date(),
): CharacterCode {
  // YYYY-MM-DD in UTC; we don't care about timezone here because the
  // rotation cadence is "once per UTC day" and that's stable enough
  // for a 7-year-old's daily rhythm.
  const dateKey = today.toISOString().slice(0, 10);
  const h = simpleHash(learnerId + dateKey);
  return CHARACTER_CODES[h % CHARACTER_CODES.length];
}
