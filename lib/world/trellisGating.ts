// lib/world/trellisGating.ts
//
// Decides whether the trellis gate at the east edge of the grow garden
// is open — the way through to the second grow screen (orchard, berry
// patch, herb & tea garden, moon garden).
//
// Deliberately gated on MASTERY, not on cumulative correct count. The
// quadrant gates inside both screens run on lifetime correct answers,
// which easy-content grinding advances directly; the trellis instead
// mirrors the branch-gate model (branchGating.ts): it opens only once
// a learner has truly mastered a handful of skills, so the second
// garden is a reward for real progress rather than volume.

export const TRELLIS_MASTERED_SKILLS = 4;

export function isTrellisUnlocked(masteredCount: number): boolean {
  return masteredCount >= TRELLIS_MASTERED_SKILLS;
}
