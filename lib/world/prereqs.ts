// lib/world/prereqs.ts
//
// Skills you have OUTGROWN still count.
//
// Found the day a five-year-old was told she could have an ant hill
// by counting to fifty, said "Okay", went to play — and the app had
// no way to give her that lesson. The ant hill wants
// math.counting.to_50 mastered; Esme is working two levels above it,
// so the planner will never serve it to her again. The door was
// locked with a key that no longer exists.
//
// But the curriculum already knows she has it: she has MASTERED
// math.placevalue.tens_ones, and the skill table says tens_ones
// REQUIRES counting.to_50. You cannot build the upper floor without
// the lower one. So a prerequisite counts as met when the learner
// has mastered it, or has mastered anything that (transitively)
// stands on it.
//
// This only ever OPENS doors, and only on evidence the curriculum
// itself asserts.

export interface SkillNode {
  code: string;
  prereqSkillCodes: string[];
}

/**
 * Expand a set of mastered skill codes with every prerequisite those
 * skills stand on, transitively.
 */
export function effectivelyMastered(
  masteredCodes: readonly string[],
  skills: SkillNode[],
): Set<string> {
  const prereqsOf = new Map<string, string[]>();
  for (const s of skills) prereqsOf.set(s.code, s.prereqSkillCodes ?? []);

  const out = new Set<string>();
  const stack = [...masteredCodes];
  while (stack.length > 0) {
    const code = stack.pop()!;
    if (out.has(code)) continue;   // also guards prereq cycles
    out.add(code);
    for (const p of prereqsOf.get(code) ?? []) {
      if (!out.has(p)) stack.push(p);
    }
  }
  return out;
}

/** Which of these prerequisites the learner has not met, even generously. */
export function unmetPrereqs(
  required: string[],
  masteredCodes: readonly string[],
  skills: SkillNode[],
): string[] {
  const have = effectivelyMastered(masteredCodes, skills);
  return required.filter(c => !have.has(c));
}
