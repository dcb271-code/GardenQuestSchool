// tests/world/seedEarnSchedule.test.ts
import { describe, it, expect } from 'vitest';
import {
  SEED_EARN_SCHEDULE,
  getEarnedSeedCodes,
  getOpenQuadrants,
  getSessionSeedEarns,
} from '@/lib/world/seedEarnSchedule';

describe('SEED_EARN_SCHEDULE', () => {
  it('has 39 entries in ascending threshold order', () => {
    expect(SEED_EARN_SCHEDULE).toHaveLength(39);
    for (let i = 1; i < SEED_EARN_SCHEDULE.length; i++) {
      expect(SEED_EARN_SCHEDULE[i].atCorrect).toBeGreaterThan(SEED_EARN_SCHEDULE[i - 1].atCorrect);
    }
  });

  it('first entry is radish at 25', () => {
    expect(SEED_EARN_SCHEDULE[0]).toEqual({ atCorrect: 25, plantCode: 'radish' });
  });
});

describe('getEarnedSeedCodes', () => {
  it('returns empty array below first threshold', () => {
    expect(getEarnedSeedCodes(0)).toEqual([]);
    expect(getEarnedSeedCodes(24)).toEqual([]);
  });
  it('returns radish at 25 cumulative correct', () => {
    expect(getEarnedSeedCodes(25)).toEqual(['radish']);
  });
  it('returns all earned seeds at high count', () => {
    const codes = getEarnedSeedCodes(99999);
    expect(codes).toContain('radish');
    expect(codes).toContain('cherry');
    expect(codes).toContain('carrot');
    expect(codes).toContain('blueberry');
    expect(codes).toContain('milkweed');
    expect(codes).toContain('lupine');
    expect(codes).toContain('pawpaw');
    expect(codes).toContain('nightphlox');
    expect(codes).toHaveLength(39);
  });
});

describe('getOpenQuadrants', () => {
  it('vegetable always open', () => {
    expect(getOpenQuadrants(0).has('vegetable')).toBe(true);
  });
  it('flower opens at 250', () => {
    expect(getOpenQuadrants(249).has('flower')).toBe(false);
    expect(getOpenQuadrants(250).has('flower')).toBe(true);
  });
  it('fruit opens at 700', () => {
    expect(getOpenQuadrants(699).has('fruit')).toBe(false);
    expect(getOpenQuadrants(700).has('fruit')).toBe(true);
  });
  it('japanese opens at 950', () => {
    expect(getOpenQuadrants(949).has('japanese')).toBe(false);
    expect(getOpenQuadrants(950).has('japanese')).toBe(true);
  });
  it('beyond-the-trellis quadrants open at their thresholds', () => {
    expect(getOpenQuadrants(1799).has('orchard')).toBe(false);
    expect(getOpenQuadrants(1800).has('orchard')).toBe(true);
    expect(getOpenQuadrants(2100).has('berry')).toBe(true);
    expect(getOpenQuadrants(2550).has('herb')).toBe(true);
    expect(getOpenQuadrants(3299).has('moon')).toBe(false);
    expect(getOpenQuadrants(3300).has('moon')).toBe(true);
  });
});

describe('getSessionSeedEarns', () => {
  it('detects radish earned when crossing 25 in a single session', () => {
    const earns = getSessionSeedEarns(20, 28);
    expect(earns).toHaveLength(1);
    expect(earns[0].plantCode).toBe('radish');
  });
  it('detects multiple earns crossed in one session', () => {
    const earns = getSessionSeedEarns(20, 80);
    expect(earns.map(e => e.plantCode)).toEqual(['radish', 'mint']);
  });
  it('returns empty when no thresholds crossed', () => {
    expect(getSessionSeedEarns(30, 50)).toEqual([]);
  });
  it('does not double-count thresholds already passed before the session', () => {
    expect(getSessionSeedEarns(25, 30)).toEqual([]);
  });
});
