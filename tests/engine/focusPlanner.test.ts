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

  it('orders due reviews HARDEST first; equal levels fall back to most overdue', () => {
    const rows = [
      mkRow('recent-due', { nextReviewAt: new Date('2026-07-15T00:00:00Z') }),
      mkRow('old-due', { nextReviewAt: new Date('2026-05-01T00:00:00Z') }),
      mkRow('not-due', { nextReviewAt: new Date('2026-08-01T00:00:00Z') }),
    ];
    // equal (default) levels → due tie-break by overdue; the not-due
    // review weaves in as in-progress after the first due slot
    expect(orderFocusSkills(rows, NOW)).toEqual(['old-due', 'not-due', 'recent-due']);

    // a HARDER due review leads even when it's the least overdue —
    // "targeted practice" opens at the learner's edge, not at the
    // bottom of the backlog
    const withLevels = [
      mkRow('easy-ancient', { nextReviewAt: new Date('2026-04-01T00:00:00Z'), level: 0.6 }),
      mkRow('hard-fresh', { nextReviewAt: new Date('2026-07-16T00:00:00Z'), level: 0.8 }),
    ];
    expect(orderFocusSkills(withLevels, NOW)[0]).toBe('hard-fresh');
  });

  it('sends far-below-frontier due reviews to the tail (basement backlog)', () => {
    const rows = [
      mkRow('kindergarten-due', { nextReviewAt: new Date('2026-04-01T00:00:00Z'), level: 0.2 }),
      mkRow('frontier-due', { nextReviewAt: new Date('2026-07-15T00:00:00Z'), level: 0.8 }),
      mkRow('shaky-progress', { masteryState: 'learning', studentElo: 1050, nextReviewAt: new Date('2026-08-01T00:00:00Z'), level: 0.75 }),
    ];
    // A 3-slot session opens frontier-due → shaky-progress; the
    // level-0.2 leftover cycles in only after the real work.
    expect(orderFocusSkills(rows, NOW)).toEqual([
      'frontier-due', 'shaky-progress', 'kindergarten-due',
    ]);
  });

  it('weaves near-frontier due reviews with in-progress skills', () => {
    const rows = [
      mkRow('due-a', { nextReviewAt: new Date('2026-07-01T00:00:00Z'), level: 0.8 }),
      mkRow('due-b', { nextReviewAt: new Date('2026-07-02T00:00:00Z'), level: 0.7 }),
      mkRow('prog-a', { masteryState: 'learning', studentElo: 1000, nextReviewAt: new Date('2026-08-01T00:00:00Z'), level: 0.75 }),
      mkRow('prog-b', { masteryState: 'learning', studentElo: 1200, nextReviewAt: new Date('2026-08-01T00:00:00Z'), level: 0.75 }),
    ];
    expect(orderFocusSkills(rows, NOW)).toEqual(['due-a', 'prog-a', 'due-b', 'prog-b']);
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
