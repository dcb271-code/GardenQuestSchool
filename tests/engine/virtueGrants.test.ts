import { describe, it, expect } from 'vitest';
import { DAILY_CAP, isUnderDailyCap } from '@/lib/engine/virtueGrants';

describe('virtueGrants — daily caps', () => {
  it('special-event virtues cap at one per day', () => {
    for (const v of ['noticing', 'curiosity', 'courage', 'care', 'wondering'] as const) {
      expect(DAILY_CAP[v]).toBe(1);
      expect(isUnderDailyCap(v, 0)).toBe(true);
      expect(isUnderDailyCap(v, 1)).toBe(false);
    }
  });

  it('effort virtues stay uncapped', () => {
    for (const v of ['persistence', 'practice'] as const) {
      expect(DAILY_CAP[v]).toBeNull();
      expect(isUnderDailyCap(v, 50)).toBe(true);
    }
  });
});
