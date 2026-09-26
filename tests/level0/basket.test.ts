// Bunny's Basket grows from a seed; the server regrows it and decides
// "more" from its own counts. These are the referee's guarantees.

import { describe, it, expect } from 'vitest';
import {
  buildRound, judgeBasketTaps, judgeNumeralTaps, BASKET_MIN, BASKET_MAX,
} from '@/lib/level0/basket';
import { BASKET } from '@/lib/level0/words';

describe('buildRound', () => {
  it('is deterministic', () => {
    expect(buildRound(77, 'one_more')).toEqual(buildRound(77, 'one_more'));
  });

  it('never gives equal baskets, and says which has more from its own counts', () => {
    for (let seed = 1; seed < 400; seed++) {
      const r = buildRound(seed, 'more_fewer');
      expect(r.left).not.toBe(r.right);
      expect(r.left).toBeGreaterThanOrEqual(BASKET_MIN); expect(r.left).toBeLessThanOrEqual(BASKET_MAX);
      expect(r.right).toBeGreaterThanOrEqual(BASKET_MIN); expect(r.right).toBeLessThanOrEqual(BASKET_MAX);
      expect(r.more).toBe(r.left > r.right ? 'left' : 'right');
      expect(r.oneMore).toBeNull();
    }
  });

  it('both sides get to be the fuller one', () => {
    const sides = { left: 0, right: 0 };
    for (let seed = 1; seed < 400; seed++) sides[buildRound(seed, 'more_fewer').more]++;
    expect(sides.left).toBeGreaterThan(120);
    expect(sides.right).toBeGreaterThan(120);
  });

  it('a one_more round counts on from the fuller basket after the bunny eats one', () => {
    for (let seed = 1; seed < 400; seed++) {
      const r = buildRound(seed, 'one_more');
      const fuller = Math.max(r.left, r.right);
      expect(r.oneMore).not.toBeNull();
      expect(r.oneMore!.basket).toBe(r.more);
      expect(r.oneMore!.from).toBe(fuller - 1);
      expect(r.oneMore!.to).toBe(fuller);
      expect(r.oneMore!.choices).toHaveLength(3);
      expect(new Set(r.oneMore!.choices).size).toBe(3);
      expect(r.oneMore!.choices).toContain(fuller);
      for (const c of r.oneMore!.choices) {
        expect(c).toBeGreaterThanOrEqual(1);
        expect(Math.abs(c - fuller)).toBeLessThanOrEqual(2);
      }
    }
  });

  it('refuses a pre-skill that is not a basket one', () => {
    expect(() => buildRound(1, 'count_to_5')).toThrow();
  });
});

describe('the referee', () => {
  const r = buildRound(5, 'one_more');
  const less = r.more === 'left' ? 'right' : 'left';

  it('judges basket taps in order and stops at the first right one', () => {
    expect(judgeBasketTaps(r, [less, r.more, less])).toEqual([
      { chosen: less, correct: false }, { chosen: r.more, correct: true },
    ]);
  });

  it('judges numeral taps against the one-more answer', () => {
    const wrong = r.oneMore!.choices.find(c => c !== r.oneMore!.to)!;
    expect(judgeNumeralTaps(r, [wrong, r.oneMore!.to])).toEqual([
      { chosen: wrong, correct: false }, { chosen: r.oneMore!.to, correct: true },
    ]);
  });

  it('refuses a numeral the round never offered, and numerals on a round with no one-more step', () => {
    const never = [1, 2, 3, 4, 5, 6].find(n => !r.oneMore!.choices.includes(n))!;
    expect(judgeNumeralTaps(r, [never])).toBeNull();
    const plain = buildRound(5, 'more_fewer');
    expect(judgeNumeralTaps(plain, [])).toEqual([]);
    expect(judgeNumeralTaps(plain, [3])).toBeNull();
  });
});

describe('the words', () => {
  it('a wrong basket is explained from both counts', () => {
    expect(BASKET.wrongMore(2, 4)).toBe('This basket has two. That basket has four. Four is more. Tap the basket with more.');
  });
  it('one more is counted on aloud', () => {
    expect(BASKET.oneMoreIn(3)).toBe('Three… and one more is four. Tap the four.');
  });
});
