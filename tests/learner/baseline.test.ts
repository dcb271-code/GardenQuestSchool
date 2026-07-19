import { describe, it, expect } from 'vitest';
import {
  baselineEloFor,
  masteredSkillsForLevel,
  reviewingSkillsForLevel,
  type LearnerLevel,
} from '@/lib/learner/baseline';
import { MATH_SKILLS } from '@/lib/packs/math/skills';
import { READING_SKILLS } from '@/lib/packs/reading/skills';

const CATALOG = new Set([...MATH_SKILLS, ...READING_SKILLS].map(s => s.code));
const LEVELS: LearnerLevel[] = [1, 2, 3, 4, 5];

describe('learner baseline — levels 1–5', () => {
  it('every baseline skill code exists in a pack catalog', () => {
    for (const level of LEVELS) {
      for (const code of masteredSkillsForLevel(level)) {
        expect(CATALOG.has(code), `mastered[level ${level}] ${code}`).toBe(true);
      }
      for (const code of reviewingSkillsForLevel(level)) {
        expect(CATALOG.has(code), `reviewing[level ${level}] ${code}`).toBe(true);
      }
    }
  });

  it('mastered and reviewing sets never overlap', () => {
    for (const level of LEVELS) {
      const mastered = new Set(masteredSkillsForLevel(level));
      for (const code of reviewingSkillsForLevel(level)) {
        expect(mastered.has(code), `level ${level}: ${code} in both sets`).toBe(false);
      }
    }
  });

  it('higher levels start with strictly more mastered skills', () => {
    for (let i = 1; i < LEVELS.length; i++) {
      const lower = masteredSkillsForLevel(LEVELS[i - 1]);
      const higher = new Set(masteredSkillsForLevel(LEVELS[i]));
      expect(higher.size).toBeGreaterThan(lower.length - 1);
      for (const code of lower) {
        expect(higher.has(code), `level ${LEVELS[i]} lost mastered ${code}`).toBe(true);
      }
    }
  });

  it('baseline elo rises with level and respects challenge offsets', () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(baselineEloFor(LEVELS[i], 'normal'))
        .toBeGreaterThan(baselineEloFor(LEVELS[i - 1], 'normal'));
    }
    expect(baselineEloFor(3, 'easier')).toBe(baselineEloFor(3, 'normal') - 60);
    expect(baselineEloFor(3, 'harder')).toBe(baselineEloFor(3, 'normal') + 60);
  });
});
