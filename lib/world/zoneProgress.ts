/**
 * Zone-based progression for the garden map.
 *
 * Within each zone, skill structures are ordered by difficulty. Only the
 * first-unfinished skill in a zone is "open"; already-completed skills
 * remain tappable (revisit), but later skills stay locked until the
 * current one reaches its completion threshold.
 *
 * Habitats follow their own prereq-based unlock logic in the page layer.
 */

import type { MapStructure } from './gardenMap';

// Cumulative correct attempts required to mark a skill as "completed"
// for the purposes of zone progression. Chosen as a clean round number
// that's a meaningful daily goal for a 7-year-old.
export const ZONE_COMPLETION_TARGET = 10;

// Ordered skill structures per zone, easiest-first.
export const ZONE_SKILL_ORDER: Record<string, string[]> = {
  reading: [
    'reading_book_stump',       // dolch_primer
    'reading_blending_beach',   // cvc_blend
    'reading_bee_words',        // dolch_first_grade
    'reading_digraph_bridge',   // digraphs
    'reading_readaloud_log',    // read_aloud.simple
  ],
  math: [
    'math_counting_path',       // skip_2s
    'math_number_bonds',        // number_bond.within_10
    'math_butterfly_arrays',    // add.within_20.crossing_ten
    'math_tens_tower',          // placevalue.tens_ones
    'math_compare_trees',       // compare_2digit
    'math_hundreds_hollow',     // add.within_100.no_regrouping
    'math_array_orchard',       // multiply.arrays
  ],
  meadow: [
    'math_bee_swarm',           // add.within_20.no_crossing
    'math_word_stories',        // word_problem.add_within_20
  ],
  bunny: [
    'math_petal_falls',         // subtract.within_10
  ],
  water: [],                    // habitats only, no skills
};

export interface StructureProgress {
  unlocked: boolean;
  completed: boolean;
  isNext: boolean;              // the currently-recommended skill in its zone
  correctCount: number;
  target: number;
  prereqDisplay: string;        // hint text when locked
  unlocksLabel?: string | null; // label of the next zone-stop that finishing
                                // this one opens (only on the isNext stop)
}

/**
 * Compute per-structure progress for a learner, given the cumulative
 * number of correct attempts per skill code.
 *
 * Rules:
 *  - A skill is `completed` if correctCount >= target.
 *  - Within a zone, the `isNext` skill is the first structure in the
 *    zone's ordered list that is not yet completed.
 *  - `unlocked` = completed OR isNext.
 *  - Structures not in any zone order (fallback) follow their own
 *    prereq-based logic from the page layer.
 */
export function computeStructureProgress(
  structures: MapStructure[],
  correctByCode: Map<string, number>,
  skillPrereqUnmet: (structureCode: string) => string,
  target: number = ZONE_COMPLETION_TARGET,
): Record<string, StructureProgress> {
  const result: Record<string, StructureProgress> = {};

  for (const zone of Object.keys(ZONE_SKILL_ORDER)) {
    const ordered = ZONE_SKILL_ORDER[zone];
    let foundNext = false;

    for (let i = 0; i < ordered.length; i++) {
      const structureCode = ordered[i];
      const struct = structures.find(s => s.code === structureCode);
      if (!struct || struct.kind !== 'skill' || !struct.skillCode) continue;

      const correctCount = correctByCode.get(struct.skillCode) ?? 0;
      const completed = correctCount >= target;
      const isNext = !completed && !foundNext;
      if (isNext) foundNext = true;

      // For the current "next" stop, look ahead to whatever comes
      // after it in the zone — that's what finishing this one will
      // open. We skip past anything already complete (rare but
      // possible if someone bumped the target down).
      let unlocksLabel: string | null = null;
      if (isNext) {
        for (let j = i + 1; j < ordered.length; j++) {
          const nextStruct = structures.find(s => s.code === ordered[j]);
          if (!nextStruct?.skillCode) continue;
          const nextDone = (correctByCode.get(nextStruct.skillCode) ?? 0) >= target;
          if (!nextDone) {
            unlocksLabel = nextStruct.label;
            break;
          }
        }
      }

      result[structureCode] = {
        unlocked: completed || isNext,
        completed,
        isNext,
        correctCount,
        target,
        prereqDisplay: completed || isNext
          ? ''
          : `Finish ${ordered
              .slice(0, ordered.indexOf(structureCode))
              .map(c => structures.find(s => s.code === c)?.label ?? c)
              .filter(Boolean)
              .slice(-1)[0] ?? 'the earlier stop'} first`,
        unlocksLabel,
      };
    }
  }

  // Any skill structures not covered by a zone order → fall back to
  // the existing prereq-based logic (shouldn't happen with current map,
  // but leaving this as a safety net).
  for (const struct of structures) {
    if (struct.kind !== 'skill') continue;
    if (result[struct.code]) continue;
    const correctCount = struct.skillCode
      ? correctByCode.get(struct.skillCode) ?? 0
      : 0;
    const completed = correctCount >= target;
    result[struct.code] = {
      unlocked: completed,
      completed,
      isNext: false,
      correctCount,
      target,
      prereqDisplay: skillPrereqUnmet(struct.code),
    };
  }

  return result;
}
