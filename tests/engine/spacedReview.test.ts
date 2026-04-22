import { describe, it, expect } from 'vitest';
import {
  promoteBox, demoteBox, nextReviewDate, isDueForReview,
} from '@/lib/engine/spacedReview';

describe('spacedReview — Leitner 5-box', () => {
  it('promotes within 1..5', () => {
    expect(promoteBox(1)).toBe(2);
    expect(promoteBox(4)).toBe(5);
    expect(promoteBox(5)).toBe(5);
  });

  it('demotes by one, never below 1', () => {
    expect(demoteBox(3)).toBe(2);
    expect(demoteBox(1)).toBe(1);
  });

  it('computes next review date per box', () => {
    const from = new Date('2026-04-22T00:00:00Z');
    expect(nextReviewDate(1, from).toISOString()).toBe('2026-04-22T00:00:00.000Z');
    expect(nextReviewDate(2, from).toISOString()).toBe('2026-04-23T00:00:00.000Z');
    expect(nextReviewDate(3, from).toISOString()).toBe('2026-04-24T00:00:00.000Z');
    expect(nextReviewDate(4, from).toISOString()).toBe('2026-04-26T00:00:00.000Z');
    expect(nextReviewDate(5, from).toISOString()).toBe('2026-04-29T00:00:00.000Z');
  });

  it('isDueForReview handles null and past dates', () => {
    const now = new Date('2026-04-22T12:00:00Z');
    expect(isDueForReview(null, now)).toBe(true);
    expect(isDueForReview(new Date('2026-04-21T00:00:00Z'), now)).toBe(true);
    expect(isDueForReview(new Date('2026-04-23T00:00:00Z'), now)).toBe(false);
  });
});
