import { describe, it, expect } from 'vitest';
import { sessionEarnsRewards } from '@/lib/engine/rewardEligibility';

const now = new Date('2026-07-19T12:00:00Z');

describe('rewardEligibility — comfort replays earn nothing', () => {
  it('earns on a brand-new skill (no progress row)', () => {
    expect(sessionEarnsRewards(null, now)).toBe(true);
  });

  it('earns while learning or reviewing', () => {
    expect(sessionEarnsRewards({ masteryState: 'learning', nextReviewAt: null }, now)).toBe(true);
    expect(sessionEarnsRewards(
      { masteryState: 'review', nextReviewAt: new Date('2026-08-01T00:00:00Z') }, now,
    )).toBe(true);
  });

  it('earns on a mastered skill that has come due for review', () => {
    expect(sessionEarnsRewards(
      { masteryState: 'mastered', nextReviewAt: new Date('2026-07-18T00:00:00Z') }, now,
    )).toBe(true);
  });

  it('does NOT earn on a mastered skill replayed before it is due', () => {
    expect(sessionEarnsRewards(
      { masteryState: 'mastered', nextReviewAt: new Date('2026-07-25T00:00:00Z') }, now,
    )).toBe(false);
  });

  it('earns on a mastered skill with no scheduled review', () => {
    expect(sessionEarnsRewards({ masteryState: 'mastered', nextReviewAt: null }, now)).toBe(true);
  });
});
