import { describe, it, expect } from 'vitest';
import { computeMasteryTransition } from '@/lib/engine/masteryTracker';

describe('masteryTracker', () => {
  it('new → learning on first attempt', () => {
    const next = computeMasteryTransition({
      currentState: 'new', correct: true, streakCorrect: 0,
      sameSessionStreak: 1, isNewSession: false,
      studentElo: 1000, itemElo: 1000,
    });
    expect(next.newState).toBe('learning');
  });

  it('learning → review on 3-correct in-session streak', () => {
    const next = computeMasteryTransition({
      currentState: 'learning', correct: true, streakCorrect: 3,
      sameSessionStreak: 3, isNewSession: false,
      studentElo: 1000, itemElo: 1000,
    });
    expect(next.newState).toBe('review');
  });

  it('review → mastered only on a correct in a LATER session', () => {
    const sameSession = computeMasteryTransition({
      currentState: 'review', correct: true, streakCorrect: 4,
      sameSessionStreak: 4, isNewSession: false,
      studentElo: 1000, itemElo: 1000,
    });
    expect(sameSession.newState).toBe('review');

    const laterSession = computeMasteryTransition({
      currentState: 'review', correct: true, streakCorrect: 1,
      sameSessionStreak: 1, isNewSession: true,
      studentElo: 1000, itemElo: 1000,
    });
    expect(laterSession.newState).toBe('mastered');
  });

  it('wrong answer: no demote when student-Elo is >100 below item', () => {
    const next = computeMasteryTransition({
      currentState: 'review', correct: false, streakCorrect: 0,
      sameSessionStreak: 0, isNewSession: false,
      studentElo: 900, itemElo: 1100,
    });
    expect(next.newState).toBe('review');
  });

  it('wrong answer: demote one notch when student-Elo within ±100 of item', () => {
    const next = computeMasteryTransition({
      currentState: 'mastered', correct: false, streakCorrect: 0,
      sameSessionStreak: 0, isNewSession: false,
      studentElo: 1000, itemElo: 1050,
    });
    expect(next.newState).toBe('review');
  });
});
