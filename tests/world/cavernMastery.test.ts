import { describe, it, expect } from 'vitest';
import {
  emptyCavern, awardMasteryStones, stoneForMastery, resolvePending,
} from '@/lib/world/cavern';
import { GEM_CATALOG } from '@/lib/world/gemCatalog';

const CODES = new Set(GEM_CATALOG.map(g => g.code));

describe('mastery pays a stone', () => {
  it('pays one stone per newly mastered skill', () => {
    const { state, earned } = awardMasteryStones(
      emptyCavern(), ['math.multiply.facts_to_10', 'math.divide.equal_share'], [0.1, 0.9]);
    expect(earned).toHaveLength(2);
    expect(state.pending).toHaveLength(2);
    for (const e of earned) expect(CODES.has(e.gemCode)).toBe(true);
  });

  // The oldest bug in this world is farming easy content for rewards.
  // Mastery is one-pass, so the supply is bounded by how much maths
  // exists — but only if re-mastering the same skill pays nothing.
  it('never pays the same skill twice, even after mastery lapses', () => {
    const first = awardMasteryStones(emptyCavern(), ['math.multiply.arrays'], [0.3]);
    expect(first.earned).toHaveLength(1);

    const again = awardMasteryStones(first.state, ['math.multiply.arrays'], [0.3]);
    expect(again.earned).toHaveLength(0);
    expect(again.state.pending).toHaveLength(1);   // still just the one
    expect(again.state).toBe(first.state);          // untouched
  });

  it('pays only the skills that are new in a mixed batch', () => {
    const first = awardMasteryStones(emptyCavern(), ['a', 'b'], [0.2, 0.4]);
    const second = awardMasteryStones(first.state, ['b', 'c'], [0.6]);
    expect(second.earned.map(e => e.skillCode)).toEqual(['c']);
    expect(second.state.masteryPaid.sort()).toEqual(['a', 'b', 'c']);
  });

  it('does nothing when nothing is new', () => {
    const s = emptyCavern();
    expect(awardMasteryStones(s, [], []).earned).toEqual([]);
    expect(awardMasteryStones(s, [], []).state).toBe(s);
  });

  it('always rolls a real gem, across the whole range', () => {
    for (let r = 0; r < 1; r += 0.01) {
      expect(CODES.has(stoneForMastery(r).code), `roll ${r}`).toBe(true);
    }
  });

  // Earned work should feel better than luck.
  it('reaches the case shelf more often than a plain dig does', () => {
    let caseCount = 0;
    for (let r = 0; r < 1; r += 0.001) {
      if (stoneForMastery(r).shelf === 'case') caseCount++;
    }
    expect(caseCount / 1000).toBeGreaterThan(0.2);
  });

  describe('resolving a pending stone', () => {
    it('removes exactly one, not every copy', () => {
      const s = { ...emptyCavern(), pending: ['quartz', 'quartz', 'ruby'] };
      const out = resolvePending(s, 'quartz');
      expect(out.pending).toEqual(['quartz', 'ruby']);
    });

    it('ignores a stone that is not pending', () => {
      const s = { ...emptyCavern(), pending: ['quartz'] };
      expect(resolvePending(s, 'diamond').pending).toEqual(['quartz']);
    });
  });
});
