import { describe, it, expect } from 'vitest';
import {
  bondLevelFor, nextLevelAt, computeNeeds, todayString, BOND_LEVELS, FAMILY_TZ,
} from '@/lib/companion/companionRules';

describe('companionRules — gentle by construction', () => {
  it('bond levels climb at 4/10/22 XP', () => {
    expect(bondLevelFor(0)).toBe(0);
    expect(bondLevelFor(3)).toBe(0);
    expect(bondLevelFor(4)).toBe(1);
    expect(bondLevelFor(10)).toBe(2);
    expect(bondLevelFor(21)).toBe(2);
    expect(bondLevelFor(22)).toBe(3);
    expect(bondLevelFor(999)).toBe(3);
  });

  it('nextLevelAt points at the next threshold, null at max', () => {
    expect(nextLevelAt(0)).toBe(4);
    expect(nextLevelAt(4)).toBe(10);
    expect(nextLevelAt(15)).toBe(22);
    expect(nextLevelAt(22)).toBeNull();
  });

  it('needs are per-day booleans — a missed week is just "hungry today"', () => {
    const longAgo = '2026-01-01';
    const today = '2026-07-19';
    const needs = computeNeeds({ last_fed_on: longAgo }, false, today);
    expect(needs.hungryToday).toBe(true);
    expect(needs.napping).toBe(true);
    // Nothing about a long absence changes the shape of the need.
    const yesterday = computeNeeds({ last_fed_on: '2026-07-18' }, false, today);
    expect(yesterday).toEqual(needs);
  });

  it('fed today + played today = content, not napping', () => {
    const today = '2026-07-19';
    expect(computeNeeds({ last_fed_on: today }, true, today)).toEqual({
      hungryToday: false, playedToday: true, napping: false,
    });
    // Either one alone keeps the friend awake.
    expect(computeNeeds({ last_fed_on: today }, false, today).napping).toBe(false);
    expect(computeNeeds({ last_fed_on: null }, true, today).napping).toBe(false);
  });

  it('todayString uses the family timezone, formatted YYYY-MM-DD', () => {
    expect(FAMILY_TZ).toBe('America/Chicago');
    // 3am UTC on Jan 2 is still Jan 1 evening in Chicago.
    const lateEvening = new Date('2026-01-02T03:00:00Z');
    expect(todayString('America/Chicago', lateEvening)).toBe('2026-01-01');
    expect(todayString('UTC', lateEvening)).toBe('2026-01-02');
  });

  it('max 2 XP/day means level 3 takes at least 11 days of tending', () => {
    const top = BOND_LEVELS[BOND_LEVELS.length - 1];
    expect(Math.ceil(top.atXp / 2)).toBeGreaterThanOrEqual(11);
  });
});
