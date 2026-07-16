import { describe, it, expect } from 'vitest';
import {
  orderFocusSkills, pickFocusSkill, isFocusPlan, focusSubjectOf,
  type FocusSkillRow,
} from '@/lib/engine/focusPlanner';

const NOW = new Date('2026-07-16T12:00:00Z');

const mkRow = (skillCode: string, overrides: Partial<FocusSkillRow> = {}): FocusSkillRow => ({
  skillCode,
  masteryState: 'review',
  studentElo: 1000,
  nextReviewAt: null,
  lastAttemptedAt: null,
  ...overrides,
});

describe('focusPlanner', () => {
  it('recognizes focus plans and extracts the subject', () => {
    expect(isFocusPlan('focus.reading')).toBe(true);
    expect(isFocusPlan('math.add.within_10')).toBe(false);
    expect(isFocusPlan(null)).toBe(false);
    expect(focusSubjectOf('focus.reading')).toBe('reading');
  });

  it('orders due reviews first, most overdue first', () => {
    const rows = [
      mkRow('recent-due', { nextReviewAt: new Date('2026-07-15T00:00:00Z') }),
      mkRow('old-due', { nextReviewAt: new Date('2026-05-01T00:00:00Z') }),
      mkRow('not-due', { nextReviewAt: new Date('2026-08-01T00:00:00Z') }),
    ];
    expect(orderFocusSkills(rows, NOW)).toEqual(['old-due', 'recent-due', 'not-due']);
  });

  it('orders in-progress skills by weakest elo, then mastered refresh', () => {
    const rows = [
      mkRow('mastered-old', { masteryState: 'mastered', lastAttemptedAt: new Date('2026-06-01T00:00:00Z') }),
      mkRow('mastered-recent', { masteryState: 'mastered', lastAttemptedAt: new Date('2026-07-10T00:00:00Z') }),
      mkRow('strong', { masteryState: 'learning', studentElo: 1300 }),
      mkRow('shaky', { masteryState: 'learning', studentElo: 1050 }),
    ];
    expect(orderFocusSkills(rows, NOW)).toEqual([
      'shaky', 'strong', 'mastered-old', 'mastered-recent',
    ]);
  });

  it('excludes new (never-met) skills', () => {
    const rows = [
      mkRow('untouched', { masteryState: 'new' }),
      mkRow('practiced', { masteryState: 'learning' }),
    ];
    expect(orderFocusSkills(rows, NOW)).toEqual(['practiced']);
  });

  it('rotates through skills across the session', () => {
    const rows = [
      mkRow('a', { studentElo: 1000, masteryState: 'learning' }),
      mkRow('b', { studentElo: 1100, masteryState: 'learning' }),
    ];
    expect(pickFocusSkill(rows, 0, NOW)).toBe('a');
    expect(pickFocusSkill(rows, 1, NOW)).toBe('b');
    expect(pickFocusSkill(rows, 2, NOW)).toBe('a');
  });

  it('returns null when the learner has nothing to review', () => {
    expect(pickFocusSkill([], 0, NOW)).toBeNull();
    expect(pickFocusSkill([mkRow('x', { masteryState: 'new' })], 0, NOW)).toBeNull();
  });
});
