// lib/world/branchGating.ts
//
// Decides whether a "branch scene" (Math Mountain, Reading Forest) is
// reachable from the central garden for a given learner. The branch
// gates open after a learner has completed N of their subject's
// starter structures on the central garden — the "graduating-world"
// model from §5 of the world-navigation-overhaul design spec.
//
// "Completed" = either the underlying skill is mastered (which is
// auto-set for grade-2/3 learners via masteredSkillsForGrade), or
// the cumulative correctCount on the structure's skill has reached
// ZONE_COMPLETION_TARGET. Together this means: G1 learners earn
// the gate by playing; older learners walk through it on day one.

import type { MapStructure } from './gardenMap';

export type BranchCode = 'math_mountain' | 'reading_forest';

export interface GatingRule {
  starterStructureCodes: string[];
  threshold: number;
}

export const BRANCH_GATING: Record<BranchCode, GatingRule> = {
  math_mountain: {
    starterStructureCodes: [
      'math_counting_path',  // skip_2s
      'math_bee_swarm',      // add.within_20.no_crossing
      'math_petal_falls',    // subtract.within_10
      'math_number_bonds',   // number_bond.within_10
      'math_word_stories',   // word_problem.add_within_20
    ],
    threshold: 3,
  },
  reading_forest: {
    starterStructureCodes: [
      'reading_book_stump',     // dolch_primer
      'reading_blending_beach', // cvc_blend
      'reading_readaloud_log',  // read_aloud.simple
    ],
    threshold: 2,
  },
};

/**
 * For unlock-gating purposes, is this central-garden structure considered
 * "complete"? True if the structure's underlying skill is in the mastered
 * set OR if the cumulative correctCount on it has reached the target.
 *
 * Returns false for unknown structure codes so a typo can't accidentally
 * unlock a branch.
 */
export function isStructureCompletedForGating(
  structureCode: string,
  structures: MapStructure[],
  correctByCode: Map<string, number>,
  mastered: Set<string>,
  target: number,
): boolean {
  const struct = structures.find(s => s.code === structureCode);
  if (!struct || struct.kind !== 'skill' || !struct.skillCode) return false;
  if (mastered.has(struct.skillCode)) return true;
  return (correctByCode.get(struct.skillCode) ?? 0) >= target;
}

/**
 * Is this branch unlocked for the learner? Pass in a predicate that
 * answers "is this central-garden structure complete?" — typically
 * built by composing `isStructureCompletedForGating` with the page
 * layer's existing `correctByCode` and `mastered` set.
 */
export function isBranchUnlocked(
  branchCode: BranchCode,
  isStructureCompleted: (structureCode: string) => boolean,
): boolean {
  const rule = BRANCH_GATING[branchCode];
  let count = 0;
  for (const code of rule.starterStructureCodes) {
    if (isStructureCompleted(code)) count++;
  }
  return count >= rule.threshold;
}
