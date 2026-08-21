import { describe, it, expect } from 'vitest';
import { HABITAT_INTERIORS, resolveInteriorSkill } from '@/lib/world/habitatInteriors';
import { MATH_SKILLS } from '@/lib/packs/math/skills';
import { READING_SKILLS } from '@/lib/packs/reading/skills';
import { MATH_THEMES } from '@/lib/packs/math/themes';
import { partitionRecommendations } from '@/lib/world/characterRecommendation';

/**
 * "I wont flower in the meadow be harder" — the flower turned out to
 * be the ant hill's counting-to-50 session. Interiors now grow with
 * the child; these tests keep the upgrades honest.
 */

const ALL_CODES = new Set([...MATH_SKILLS, ...READING_SKILLS].map(s => s.code));

describe('interior level upgrades', () => {
  it('every upgrade target is a real skill, harder than what it replaces', () => {
    const levelOf = (code: string) =>
      [...MATH_SKILLS, ...READING_SKILLS].find(s => s.code === code)?.level ?? -1;
    for (const [habitat, cfg] of Object.entries(HABITAT_INTERIORS)) {
      if (!cfg.levelUpgrade) continue;
      expect(ALL_CODES.has(cfg.levelUpgrade.skillCode),
        `${habitat} upgrades to unknown ${cfg.levelUpgrade.skillCode}`).toBe(true);
      expect(levelOf(cfg.levelUpgrade.skillCode))
        .toBeGreaterThan(levelOf(cfg.themedSkillCode));
    }
  });

  it('resolves the base skill below minLevel and the upgrade at it', () => {
    const ant = HABITAT_INTERIORS.ant_hill;
    expect(resolveInteriorSkill(ant, 1).themedSkillCode).toBe('math.counting.to_50');
    expect(resolveInteriorSkill(ant, 3).themedSkillCode).toBe('math.multiply.skip_count_bridge');
    expect(resolveInteriorSkill(ant, 3).themedStructureLabel).not.toBe(ant.themedStructureLabel);
  });

  it('every upgraded math skill has a session theme, so the lesson screen has a title', () => {
    for (const cfg of Object.values(HABITAT_INTERIORS)) {
      if (cfg.levelUpgrade?.skillCode.startsWith('math.')) {
        expect(MATH_THEMES[cfg.levelUpgrade.skillCode],
          `${cfg.levelUpgrade.skillCode} has no theme`).toBeDefined();
      }
    }
  });

  it('an interior with no upgrade is untouched at every level', () => {
    for (const cfg of Object.values(HABITAT_INTERIORS)) {
      if (cfg.levelUpgrade) continue;
      for (const lvl of [1, 3, 5]) {
        expect(resolveInteriorSkill(cfg, lvl).themedSkillCode).toBe(cfg.themedSkillCode);
      }
    }
  });
});

describe('the signpost points forward at Level 3+', () => {
  const c = (skillCode: string) => ({ skillCode, title: skillCode, themeEmoji: 'x', skillHint: '' });

  it('sorts hardest-first at L3, engine order below', () => {
    const candidates = [
      c('math.counting.to_50'),           // 0.2
      c('math.multiply.2digit_by_1digit'), // high
      c('math.add.within_20.no_crossing'), // 0.25ish
      c('math.fractions.of_a_set'),        // high
      c('math.add.within_10'),             // 0.2
    ];
    const l3 = partitionRecommendations(candidates, 3).signpost;
    const levels = l3.map(x => x.skillCode);
    expect(levels[0]).not.toBe('math.counting.to_50');
    expect([levels[0], levels[1]]).toEqual(
      expect.arrayContaining(['math.multiply.2digit_by_1digit', 'math.fractions.of_a_set']),
    );
    const l2 = partitionRecommendations(candidates, 2).signpost;
    expect(l2[0].skillCode).toBe('math.counting.to_50');
  });
});
