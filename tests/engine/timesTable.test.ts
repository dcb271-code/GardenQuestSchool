import { describe, it, expect } from 'vitest';
import {
  factKey, strategyFor, hardCoreFacts, byDifficulty, weakestFacts, commutativePartner,
} from '@/lib/packs/math/timesTable';

describe('times table reteaching model', () => {
  it('treats a fact and its mirror as the same fact', () => {
    expect(factKey(7, 6)).toBe(factKey(6, 7));
    expect(commutativePartner(7, 6)).toEqual({ a: 6, b: 7 });
  });

  it('has exactly 36 pairs to learn, not 64 orderings', () => {
    expect(hardCoreFacts()).toHaveLength(36);
    const keys = new Set(hardCoreFacts().map(f => factKey(f.a, f.b)));
    expect(keys.size).toBe(36);
  });

  it('excludes the trivial rules from the facts to learn', () => {
    for (const f of hardCoreFacts()) {
      expect(f.a).toBeGreaterThanOrEqual(2);
      expect(f.b).toBeLessThanOrEqual(9);
    }
  });

  // Every explanation is arithmetic a child can check, so every one of
  // them has to actually be true.
  it('every split adds back up to the right answer', () => {
    for (let a = 2; a <= 9; a++) {
      for (let b = 2; b <= 9; b++) {
        const s = strategyFor(a, b);
        if (!s.split) continue;
        const lo = Math.min(a, b);
        expect(s.split.top + s.split.bottom, `${a}x${b} split`).toBe(Math.max(a, b));
        expect((s.split.top + s.split.bottom) * lo).toBe(a * b);
      }
    }
  });

  // The nines rule is 10× then subtract; there is no cut through the
  // array that says that, and a bogus split would be drawn as a real
  // line a child could tap.
  it('gives the nines rule no split, because it is not one', () => {
    for (const lo of [3, 4, 6, 7, 8]) {
      const s = strategyFor(lo, 9);
      expect(s.kind).toBe('nines');
      expect(s.split).toBeNull();
    }
  });

  it('picks the cheapest available route', () => {
    expect(strategyFor(0, 7).kind).toBe('zero');
    expect(strategyFor(1, 8).kind).toBe('identity');
    expect(strategyFor(10, 6).kind).toBe('tens');
    expect(strategyFor(2, 8).kind).toBe('double');
    expect(strategyFor(5, 7).kind).toBe('skip_five');
    expect(strategyFor(9, 6).kind).toBe('nines');
    expect(strategyFor(7, 7).kind).toBe('square');
    expect(strategyFor(7, 8).kind).toBe('near_square');
    expect(strategyFor(6, 8).kind).toBe('split_five');
  });

  // The three the whole table is famous for.
  it('ranks 6×7, 6×8 and 7×8-shaped facts as the hardest', () => {
    const hardest = byDifficulty().slice(0, 6).map(f => factKey(f.a, f.b));
    expect(hardest).toContain('6x8');
    expect(hardest).toContain('3x8');
  });

  it('merges a fact and its mirror when finding weak spots', () => {
    // She missed 4×7 and 7×4 separately; that is ONE fact, six attempts.
    const acc = new Map([
      ['4x7', { correct: 2, total: 6 }],
      ['6x7', { correct: 0, total: 3 }],
      ['3x4', { correct: 9, total: 9 }],
    ]);
    const weak = weakestFacts(acc, 3);
    expect(factKey(weak[0].a, weak[0].b)).toBe('6x7');
    expect(weak[0].pct).toBe(0);
    expect(weak[1].total).toBe(6);
  });

  it('ignores facts she has never been asked', () => {
    expect(weakestFacts(new Map())).toHaveLength(0);
  });
});
