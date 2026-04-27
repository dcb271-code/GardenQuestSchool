import { describe, it, expect } from 'vitest';
import {
  BRANCH_GATING,
  isStructureCompletedForGating,
  isBranchUnlocked,
  type BranchCode,
} from '@/lib/world/branchGating';
import { ZONE_COMPLETION_TARGET } from '@/lib/world/zoneProgress';
import { GARDEN_STRUCTURES } from '@/lib/world/gardenMap';

const target = ZONE_COMPLETION_TARGET;

describe('branchGating', () => {
  describe('BRANCH_GATING constant', () => {
    it('defines a rule for math_mountain with 5 starters and threshold 3', () => {
      expect(BRANCH_GATING.math_mountain.starterStructureCodes).toHaveLength(5);
      expect(BRANCH_GATING.math_mountain.threshold).toBe(3);
    });

    it('defines a rule for reading_forest with 3 starters and threshold 2', () => {
      expect(BRANCH_GATING.reading_forest.starterStructureCodes).toHaveLength(3);
      expect(BRANCH_GATING.reading_forest.threshold).toBe(2);
    });

    it('every starter structure code resolves to a real garden structure', () => {
      const allBranches: BranchCode[] = ['math_mountain', 'reading_forest'];
      for (const branch of allBranches) {
        for (const code of BRANCH_GATING[branch].starterStructureCodes) {
          const found = GARDEN_STRUCTURES.find(s => s.code === code);
          expect(found, `${branch} starter ${code} must exist in GARDEN_STRUCTURES`).toBeDefined();
          expect(found?.kind, `${code} must be a skill structure`).toBe('skill');
        }
      }
    });
  });

  describe('isStructureCompletedForGating', () => {
    const fakeStruct = {
      code: 'math_bee_swarm',
      kind: 'skill' as const,
      skillCode: 'math.add.within_20.no_crossing',
      label: 'Bee Swarms',
      themeEmoji: '🐝',
      x: 0, y: 0, size: 60,
      zone: 'meadow' as const,
    };

    it('returns true when the underlying skill is mastered', () => {
      const completed = isStructureCompletedForGating(
        'math_bee_swarm',
        [fakeStruct],
        new Map(),
        new Set(['math.add.within_20.no_crossing']),
        target,
      );
      expect(completed).toBe(true);
    });

    it('returns true when correctCount meets target', () => {
      const completed = isStructureCompletedForGating(
        'math_bee_swarm',
        [fakeStruct],
        new Map([['math.add.within_20.no_crossing', target]]),
        new Set(),
        target,
      );
      expect(completed).toBe(true);
    });

    it('returns false when neither mastery nor target met', () => {
      const completed = isStructureCompletedForGating(
        'math_bee_swarm',
        [fakeStruct],
        new Map([['math.add.within_20.no_crossing', target - 1]]),
        new Set(),
        target,
      );
      expect(completed).toBe(false);
    });

    it('returns false when the structure code is unknown', () => {
      const completed = isStructureCompletedForGating(
        'no_such_code',
        [fakeStruct],
        new Map(),
        new Set(),
        target,
      );
      expect(completed).toBe(false);
    });
  });

  describe('isBranchUnlocked', () => {
    it('unlocks math_mountain when 3 of 5 starters are completed', () => {
      const completedSet = new Set([
        'math_counting_path', 'math_bee_swarm', 'math_petal_falls',
      ]);
      expect(isBranchUnlocked('math_mountain', code => completedSet.has(code))).toBe(true);
    });

    it('keeps math_mountain locked when only 2 of 5 starters are completed', () => {
      const completedSet = new Set(['math_counting_path', 'math_bee_swarm']);
      expect(isBranchUnlocked('math_mountain', code => completedSet.has(code))).toBe(false);
    });

    it('unlocks reading_forest when 2 of 3 starters are completed', () => {
      const completedSet = new Set(['reading_book_stump', 'reading_blending_beach']);
      expect(isBranchUnlocked('reading_forest', code => completedSet.has(code))).toBe(true);
    });

    it('keeps reading_forest locked when only 1 of 3 starters are completed', () => {
      const completedSet = new Set(['reading_book_stump']);
      expect(isBranchUnlocked('reading_forest', code => completedSet.has(code))).toBe(false);
    });
  });
});
