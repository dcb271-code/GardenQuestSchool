// Unlock guidance: turn "finish X first" into something a 7-year-old
// can ACT on. A locked stop's real advice is the set of skills that
// are (a) on its prerequisite chain, (b) not yet mastered, and
// (c) playable right now — plus which single playable skill opens the
// most doors (the "next" beacon).

export interface HintSkill {
  code: string;
  name: string;
  level: number;
  prereqSkillCodes: string[];
}

/**
 * Walk a locked skill's prerequisite chain DOWN to the skills that are
 * actionable today: unmastered, with all of their own prereqs mastered.
 * Returns them hardest-first (the child is usually closest to those).
 */
export function actionablePrereqs(
  code: string,
  skillsByCode: Map<string, HintSkill>,
  mastered: Set<string>,
): HintSkill[] {
  const out = new Map<string, HintSkill>();
  const visited = new Set<string>();
  const visit = (c: string) => {
    if (visited.has(c)) return;
    visited.add(c);
    const s = skillsByCode.get(c);
    if (!s || mastered.has(c)) return;
    const unmet = s.prereqSkillCodes.filter(p => !mastered.has(p));
    if (unmet.length === 0) {
      if (c !== code) out.set(c, s);   // the locked skill itself isn't its own hint
      return;
    }
    for (const p of unmet) visit(p);
  };
  for (const p of (skillsByCode.get(code)?.prereqSkillCodes ?? [])) {
    if (!mastered.has(p)) visit(p);
  }
  return Array.from(out.values()).sort((a, b) => b.level - a.level);
}

/** How many other skills list this one as a direct prerequisite —
 *  a rough "doors this opens" count. */
export function dependentsCount(code: string, skills: HintSkill[]): number {
  return skills.filter(s => s.prereqSkillCodes.includes(code)).length;
}

/**
 * Choose the beacon skill for a scene: among currently-playable,
 * unmastered skills, the one that unlocks the most and sits highest
 * on the ladder. Ties break toward harder (closer to her frontier).
 */
export function pickBeaconSkill(
  candidateCodes: string[],
  skills: HintSkill[],
  mastered: Set<string>,
): string | null {
  const byCode = new Map(skills.map(s => [s.code, s]));
  let best: { code: string; score: number } | null = null;
  for (const code of candidateCodes) {
    const s = byCode.get(code);
    if (!s || mastered.has(code)) continue;
    const unmet = s.prereqSkillCodes.filter(p => !mastered.has(p));
    if (unmet.length > 0) continue;    // not playable yet
    const score = dependentsCount(code, skills) * 10 + s.level;
    if (!best || score > best.score) best = { code, score };
  }
  return best?.code ?? null;
}
