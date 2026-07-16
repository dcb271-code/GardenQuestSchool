import { describe, it, expect } from 'vitest';
import {
  INTERVALS_DAYS,
  nextReviewAt,
  nextReviewAfterRun,
  isDue,
  nextRoleForExposure,
  tierForExposures,
} from '@/lib/naturalist/spacing';

describe('spacing.INTERVALS_DAYS', () => {
  it('is the SM-2 lite ladder', () => {
    expect(INTERVALS_DAYS).toEqual([1, 3, 7, 14, 30, 60]);
  });
});

describe('spacing.nextReviewAt', () => {
  const from = new Date('2026-06-02T00:00:00.000Z');

  it('exposures=1 → +1 day', () => {
    expect(nextReviewAt(1, from).toISOString()).toBe('2026-06-03T00:00:00.000Z');
  });
  it('exposures=2 → +3 days', () => {
    expect(nextReviewAt(2, from).toISOString()).toBe('2026-06-05T00:00:00.000Z');
  });
  it('exposures=3 → +7 days', () => {
    expect(nextReviewAt(3, from).toISOString()).toBe('2026-06-09T00:00:00.000Z');
  });
  it('exposures=6 → +60 days', () => {
    expect(nextReviewAt(6, from).toISOString()).toBe('2026-08-01T00:00:00.000Z');
  });
  it('exposures beyond ladder caps at +60 days', () => {
    expect(nextReviewAt(99, from).toISOString()).toBe('2026-08-01T00:00:00.000Z');
  });
  it('exposures=0 or negative treated as first interval (+1 day)', () => {
    expect(nextReviewAt(0, from).toISOString()).toBe('2026-06-03T00:00:00.000Z');
    expect(nextReviewAt(-5, from).toISOString()).toBe('2026-06-03T00:00:00.000Z');
  });
});

describe('spacing.isDue', () => {
  const now = new Date('2026-06-02T12:00:00.000Z');
  it('null next_review_at is always due', () => {
    expect(isDue(null, now)).toBe(true);
  });
  it('past date is due', () => {
    expect(isDue(new Date('2026-06-01T00:00:00.000Z'), now)).toBe(true);
  });
  it('exact-now is due', () => {
    expect(isDue(new Date('2026-06-02T12:00:00.000Z'), now)).toBe(true);
  });
  it('future date is not due', () => {
    expect(isDue(new Date('2026-06-03T00:00:00.000Z'), now)).toBe(false);
  });
  it('accepts ISO strings too', () => {
    expect(isDue('2026-06-01T00:00:00.000Z', now)).toBe(true);
    expect(isDue('2026-06-03T00:00:00.000Z', now)).toBe(false);
  });
});

describe('spacing.nextRoleForExposure', () => {
  const roles = ['whole', 'leaf', 'bark', 'flower'] as const;

  it('prefers the first never-seen role', () => {
    expect(nextRoleForExposure(roles, ['whole'])).toBe('leaf');
    expect(nextRoleForExposure(roles, ['whole', 'leaf'])).toBe('bark');
  });
  it('returns the first role when nothing seen', () => {
    expect(nextRoleForExposure(roles, [])).toBe('whole');
  });
  it('cycles once all roles seen', () => {
    // rolesSeen length 4 → index 4 % 4 = 0 → 'whole'
    expect(nextRoleForExposure(roles, ['whole', 'leaf', 'bark', 'flower'])).toBe('whole');
    // length 5 → 5 % 4 = 1 → 'leaf'
    expect(nextRoleForExposure(roles, ['whole', 'leaf', 'bark', 'flower', 'whole'])).toBe('leaf');
  });
  it('ignores seen roles not in the species photoRoles list', () => {
    expect(nextRoleForExposure(['whole', 'leaf'], ['fruit'])).toBe('whole');
  });
  it('throws on empty photoRoles', () => {
    expect(() => nextRoleForExposure([], [])).toThrow(/photoRoles/i);
  });
});

describe('spacing.tierForExposures', () => {
  it('exposures < 3 → tier 1', () => {
    expect(tierForExposures(0)).toBe(1);
    expect(tierForExposures(2)).toBe(1);
  });
  it('3 <= exposures < 10 → tier 2', () => {
    expect(tierForExposures(3)).toBe(2);
    expect(tierForExposures(9)).toBe(2);
  });
  it('exposures >= 10 → tier 3', () => {
    expect(tierForExposures(10)).toBe(3);
    expect(tierForExposures(50)).toBe(3);
  });
});

describe('nextReviewAfterRun', () => {
  it('climbs the ladder on a clean run', () => {
    const from = new Date('2026-07-16T12:00:00Z');
    const clean = nextReviewAfterRun(4, true, from);
    expect(clean.toISOString().slice(0, 10)).toBe('2026-07-30'); // 14 days
  });

  it('resets to a next-day revisit after wrong turns', () => {
    const from = new Date('2026-07-16T12:00:00Z');
    const messy = nextReviewAfterRun(4, false, from);
    expect(messy.toISOString().slice(0, 10)).toBe('2026-07-17'); // 1 day
  });
});
