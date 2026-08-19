import { describe, it, expect } from 'vitest';
import {
  GARDEN_STRUCTURES, resolveStructureSkill, getStructureByCode,
} from '@/lib/world/gardenMap';
import { MATH_SKILLS } from '@/lib/packs/math/skills';

/**
 * "I wont flower in the meadow be harder because I think it's too
 * easy." — Cecily, 2026-08-15. The garden map is the early map, and
 * a stop that carries a Level-1 skill forever pays Level-3 work rates
 * for Level-1 answers. A stop with a levelUpgrade grows with her.
 */
describe('stops that grow with the child', () => {
  it('the flower serves within_10 to a young learner and within_20 to Cecily', () => {
    const flower = getStructureByCode('math_number_bonds')!;
    expect(resolveStructureSkill(flower, 1).skillCode).toBe('math.number_bond.within_10');
    expect(resolveStructureSkill(flower, 2).skillCode).toBe('math.number_bond.within_10');
    expect(resolveStructureSkill(flower, 3).skillCode).toBe('math.number_bond.within_20');
    expect(resolveStructureSkill(flower, 5).skillCode).toBe('math.number_bond.within_20');
  });

  it('the upgraded sublabel says what changed', () => {
    const flower = getStructureByCode('math_number_bonds')!;
    expect(resolveStructureSkill(flower, 3).subLabel).not.toBe(
      resolveStructureSkill(flower, 1).subLabel,
    );
  });

  it('a stop with no upgrade is untouched at every level', () => {
    for (const s of GARDEN_STRUCTURES.filter(s => s.kind === 'skill' && !s.levelUpgrade)) {
      for (const level of [1, 3, 5]) {
        const r = resolveStructureSkill(s, level);
        expect(r.skillCode).toBe(s.skillCode);
        expect(r.subLabel).toBe(s.subLabel);
      }
    }
  });

  it('every upgrade target is a real skill in the pack', () => {
    const codes = new Set(MATH_SKILLS.map(s => s.code));
    for (const s of GARDEN_STRUCTURES) {
      if (s.levelUpgrade) {
        expect(codes.has(s.levelUpgrade.skillCode),
          `${s.code} upgrades to unknown skill ${s.levelUpgrade.skillCode}`).toBe(true);
      }
    }
  });
});
