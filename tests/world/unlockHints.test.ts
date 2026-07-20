import { describe, it, expect } from 'vitest';
import { actionablePrereqs, dependentsCount, pickBeaconSkill } from '@/lib/world/unlockHints';
import { MATH_SKILLS } from '@/lib/packs/math/skills';

const byCode = new Map(MATH_SKILLS.map(s => [s.code, s]));

describe('unlockHints', () => {
  it('resolves a locked skill to its playable prerequisite(s)', () => {
    // divide.facts_to_10 needs multiply.facts_to_10 + divide.equal_share.
    // With facts_to_5's chain mastered, both prereqs are playable.
    const mastered = new Set([
      'math.multiply.equal_groups', 'math.multiply.arrays', 'math.multiply.facts_to_5',
      'math.add.within_20.no_crossing', 'math.counting.skip_2s', 'math.counting.to_20',
      'math.counting.skip_5s', 'math.counting.to_50', 'math.add.within_10',
    ]);
    const hints = actionablePrereqs('math.divide.facts_to_10', byCode, mastered);
    const codes = hints.map(h => h.code);
    expect(codes).toContain('math.multiply.facts_to_10');
    expect(codes).toContain('math.divide.equal_share');
    // Never suggests something already mastered or the locked skill itself
    expect(codes).not.toContain('math.multiply.facts_to_5');
    expect(codes).not.toContain('math.divide.facts_to_10');
  });

  it('walks DEEP chains down to the truly playable ancestor', () => {
    // Nothing mastered: order_of_operations should resolve to the
    // bottom of its chains (counting/add basics), all playable.
    const hints = actionablePrereqs('math.order_of_operations', byCode, new Set());
    expect(hints.length).toBeGreaterThan(0);
    for (const h of hints) {
      expect(h.prereqSkillCodes.length).toBe(0);
    }
  });

  it('counts dependents (doors a skill opens)', () => {
    // multiply.facts_to_10 famously gates several Level 3/4/5 skills.
    expect(dependentsCount('math.multiply.facts_to_10', MATH_SKILLS)).toBeGreaterThanOrEqual(4);
  });

  it('beacon picks the playable skill that opens the most doors', () => {
    const mastered = new Set([
      'math.multiply.equal_groups', 'math.multiply.arrays', 'math.multiply.facts_to_5',
      'math.counting.skip_2s', 'math.counting.skip_5s', 'math.counting.to_20', 'math.counting.to_50',
    ]);
    const beacon = pickBeaconSkill(
      ['math.multiply.facts_to_10', 'math.multiply.skip_count_bridge', 'math.divide.facts_to_10'],
      MATH_SKILLS,
      mastered,
    );
    // divide.facts_to_10 is not playable (needs equal_share); between
    // the playable two, facts_to_10 opens far more doors.
    expect(beacon).toBe('math.multiply.facts_to_10');
  });

  it('beacon is null when nothing offered is playable', () => {
    expect(pickBeaconSkill(['math.divide.facts_to_10'], MATH_SKILLS, new Set())).toBeNull();
  });
});
