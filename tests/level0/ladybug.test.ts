// The Ladybug Count's leaf grows from a seed, so the server can regrow
// it and referee. These tests are the referee's guarantees.

import { describe, it, expect } from 'vitest';
import {
  buildLeaf, judgeTaps, COUNT_RANGE, LEAF_W, LEAF_H, numberWord, countingWords,
} from '@/lib/level0/ladybug';
import { LADYBUG } from '@/lib/level0/words';
import type { PreSkillCode } from '@/lib/level0/curriculum';

const SKILLS = Object.keys(COUNT_RANGE) as PreSkillCode[];

describe('buildLeaf', () => {
  it('is deterministic: same seed, same leaf', () => {
    for (const s of SKILLS) {
      expect(buildLeaf(4242, s)).toEqual(buildLeaf(4242, s));
    }
  });

  it('stays inside its pre-skill range across many seeds', () => {
    for (const s of SKILLS) {
      const [lo, hi] = COUNT_RANGE[s]!;
      for (let seed = 1; seed < 300; seed++) {
        const leaf = buildLeaf(seed, s);
        expect(leaf.count).toBeGreaterThanOrEqual(lo);
        expect(leaf.count).toBeLessThanOrEqual(hi);
        for (const c of leaf.choices) {
          expect(c).toBeGreaterThanOrEqual(lo);
          expect(c).toBeLessThanOrEqual(hi);
        }
      }
    }
  });

  it('offers three distinct numerals, one of them the answer', () => {
    for (const s of SKILLS) for (let seed = 1; seed < 300; seed++) {
      const leaf = buildLeaf(seed, s);
      expect(leaf.choices).toHaveLength(3);
      expect(new Set(leaf.choices).size).toBe(3);
      expect(leaf.choices).toContain(leaf.count);
    }
  });

  it('the wrong numerals are neighbors — a real question, not a giveaway', () => {
    for (let seed = 1; seed < 300; seed++) {
      const leaf = buildLeaf(seed, 'count_to_10');
      for (const c of leaf.choices) expect(Math.abs(c - leaf.count)).toBeLessThanOrEqual(2);
    }
  });

  it('the answer has no favorite position', () => {
    const slots = [0, 0, 0];
    for (let seed = 1; seed < 600; seed++) slots[buildLeaf(seed, 'count_to_5').choices.indexOf(buildLeaf(seed, 'count_to_5').count)]++;
    for (const n of slots) expect(n).toBeGreaterThan(120);
  });

  it('puts exactly `count` ladybugs on the leaf, on the leaf, not on top of each other', () => {
    for (const s of ['count_to_5', 'count_to_10', 'subitize_1_3'] as PreSkillCode[]) {
      for (let seed = 1; seed < 200; seed++) {
        const leaf = buildLeaf(seed, s);
        expect(leaf.spots).toHaveLength(leaf.count);
        for (const p of leaf.spots) {
          expect(p.x).toBeGreaterThan(40); expect(p.x).toBeLessThan(LEAF_W - 40);
          expect(p.y).toBeGreaterThan(40); expect(p.y).toBeLessThan(LEAF_H - 40);
        }
        for (let i = 0; i < leaf.spots.length; i++) for (let j = i + 1; j < leaf.spots.length; j++) {
          const d = Math.hypot(leaf.spots[i].x - leaf.spots[j].x, leaf.spots[i].y - leaf.spots[j].y);
          expect(d, `${s} seed ${seed}`).toBeGreaterThan(48);
        }
      }
    }
  });

  it('a glance is one, two or three in a dice pattern; a numeral leaf has ladybugs waiting to land', () => {
    for (let seed = 1; seed < 50; seed++) {
      expect(buildLeaf(seed, 'subitize_1_3').mode).toBe('subitize');
      const num = buildLeaf(seed, 'numeral_1_10');
      expect(num.mode).toBe('numeral');
      expect(num.spots).toHaveLength(num.count);
    }
  });

  it('refuses a pre-skill that is not a ladybug one', () => {
    expect(() => buildLeaf(1, 'more_fewer')).toThrow();
  });
});

describe('judgeTaps — the referee', () => {
  const leaf = buildLeaf(99, 'count_to_5');
  const wrong = leaf.choices.find(c => c !== leaf.count)!;

  it('judges taps in order and stops at the first right one', () => {
    expect(judgeTaps(leaf, [wrong, leaf.count, wrong])).toEqual([
      { chosen: wrong, correct: false },
      { chosen: leaf.count, correct: true },
    ]);
  });

  it('refuses a numeral the leaf never offered — the boards disagree', () => {
    const never = [1, 2, 3, 4, 5].find(n => !leaf.choices.includes(n))!;
    expect(judgeTaps(leaf, [never])).toBeNull();
  });

  it('a first-try answer is one correct row', () => {
    expect(judgeTaps(leaf, [leaf.count])).toEqual([{ chosen: leaf.count, correct: true }]);
  });
});

describe('the words', () => {
  it('count in words, one to ten', () => {
    expect(numberWord(4)).toBe('four');
    expect(countingWords(4)).toBe('one, two, three, four');
  });

  it('a wrong tap is explained from the leaf, not from a script', () => {
    expect(LADYBUG.wrong(3, 4)).toBe('That is the three. Let us count: one, two, three, four. Four! Tap the four.');
    expect(LADYBUG.wrong(5, 4)).toContain('That is the five.');
  });
});
