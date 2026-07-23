// tests/world/trellisGating.test.ts
import { describe, it, expect } from 'vitest';
import { TRELLIS_MASTERED_SKILLS, isTrellisUnlocked } from '@/lib/world/trellisGating';

describe('isTrellisUnlocked', () => {
  it('stays locked below the mastery threshold', () => {
    expect(isTrellisUnlocked(0)).toBe(false);
    expect(isTrellisUnlocked(TRELLIS_MASTERED_SKILLS - 1)).toBe(false);
  });
  it('opens at the mastery threshold and beyond', () => {
    expect(isTrellisUnlocked(TRELLIS_MASTERED_SKILLS)).toBe(true);
    expect(isTrellisUnlocked(TRELLIS_MASTERED_SKILLS + 10)).toBe(true);
  });
});
