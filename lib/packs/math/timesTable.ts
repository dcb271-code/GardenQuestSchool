// lib/packs/math/timesTable.ts
//
// The times table, modelled for RETEACHING rather than drilling.
//
// Cecily is stuck in a very specific place, and the data says exactly
// where: ×0–×5 sits at 87%, ×6–×10 at 66% and knocked back to Leitner
// box 2. Every fact she misses involves a 6, 7, 8 or 9 — 7×9, 6×3, 8×9,
// 9×6 and 7×6 are all 0 for 3.
//
// More repetitions of the same drill is the obvious response and the
// wrong one. Two ideas do nearly all the work instead, and both are
// things you SEE rather than memorise:
//
//   COMMUTATIVITY. 7×6 and 6×7 are the same array looked at sideways.
//   Knowing that halves the table — and she is currently missing 4×7
//   AND 7×4, 9×6 AND 6×9, 2×6 AND 6×2, which is three facts being paid
//   for twice.
//
//   THE SPLIT (the distributive property). Nobody has to know 7×6. You
//   need to know 5×6 = 30, which she does, and 2×6 = 12, which she
//   does, and that the array can be cut in two. 30 + 12 = 42. This
//   turns a wall of memorisation into a small amount of arithmetic she
//   is already fluent in, and — the part that matters — it is visible.
//   You can cut a picture of 42 dots in half and see both pieces.
//
// So the hard facts here are not "the ones with big numbers". They are
// the ones with no easier route, and each carries the route it does
// have.

/** A single fact, always stored with the smaller factor first. */
export interface Fact { a: number; b: number }

export function factKey(a: number, b: number): string {
  const [lo, hi] = a <= b ? [a, b] : [b, a];
  return `${lo}x${hi}`;
}

/** The same array, turned ninety degrees. */
export function commutativePartner(a: number, b: number): Fact {
  return { a: b, b: a };
}

export type StrategyKind =
  | 'zero' | 'identity' | 'double' | 'skip_five' | 'tens'
  | 'nines' | 'square' | 'near_square' | 'split_five' | 'halve_double';

export interface Strategy {
  kind: StrategyKind;
  /** One sentence, in her language, for why this fact is gettable. */
  explain: string;
  /**
   * How to cut the array in two, when that is the strategy. `a` rows
   * become `top` rows and `bottom` rows. Null when the strategy is not
   * a split.
   */
  split: { top: number; bottom: number } | null;
}

/**
 * The best route into a fact.
 *
 * Ordered from cheapest to most effortful, and it stops at the first
 * one that applies — a child who can reach a fact by counting in tens
 * should never be shown a split.
 */
export function strategyFor(a: number, b: number): Strategy {
  const [lo, hi] = a <= b ? [a, b] : [b, a];

  if (lo === 0) {
    return { kind: 'zero', split: null,
      explain: `Zero groups of ${hi} is nothing at all. Every ×0 fact is 0.` };
  }
  if (lo === 1) {
    return { kind: 'identity', split: null,
      explain: `One group of ${hi} is just ${hi}. Every ×1 fact is the number itself.` };
  }
  if (hi === 10 || lo === 10) {
    return { kind: 'tens', split: null,
      explain: `Ten of anything just adds a zero. ${lo === 10 ? hi : lo} becomes ${(lo === 10 ? hi : lo) * 10}.` };
  }
  if (lo === 2) {
    return { kind: 'double', split: null,
      explain: `Two groups of ${hi} is just ${hi} doubled — ${hi} + ${hi}.` };
  }
  if (lo === 5) {
    return { kind: 'skip_five', split: null,
      explain: `Count in fives ${hi} times. Fives always end in 5 or 0.` };
  }
  // ×9 has a trick worth more than the fact: ten of them, take one away.
  if (hi === 9) {
    // Not a split: the nines rule goes UP to ten and comes back down,
    // so there is no cut through this array that expresses it. The
    // splitter falls back to a plain five-cut and the text teaches the
    // shortcut alongside it.
    return { kind: 'nines', split: null,
      explain: `Nine is one less than ten. Take ${lo} tens — that's ${lo * 10} — then take away ${lo}. ${lo * 10} − ${lo} = ${lo * 9}.` };
  }
  if (lo === hi) {
    return { kind: 'square', split: null,
      explain: `${lo} rows of ${lo} makes a perfect square. Squares are worth knowing by heart — this one is ${lo * lo}.` };
  }
  if (hi - lo === 1) {
    return { kind: 'near_square', split: { top: lo, bottom: 1 },
      explain: `${lo}×${lo} is ${lo * lo}, and this is one more row of ${lo}. ${lo * lo} + ${lo} = ${lo * hi}.` };
  }
  // The general case: cut five rows off the top, because she is fluent
  // in fives and whatever is left is small.
  if (hi > 5) {
    return { kind: 'split_five', split: { top: 5, bottom: hi - 5 },
      explain: `Cut it into 5 rows and ${hi - 5}. That's ${5 * lo} and ${(hi - 5) * lo}, and ${5 * lo} + ${(hi - 5) * lo} = ${lo * hi}.` };
  }
  return { kind: 'halve_double', split: { top: Math.floor(hi / 2), bottom: hi - Math.floor(hi / 2) },
    explain: `Split it in half and add the two pieces back together.` };
}

/**
 * Facts worth reteaching: both factors 2–9, and no trivial route in.
 *
 * ×0, ×1 and ×10 are excluded because they are one rule each, not
 * facts — and because 41% of Cecily's multiplication practice had been
 * spent on ×0 and ×1 items, which is where the illusion of mastery in
 * the ×0–×5 band came from.
 *
 * Stored once per PAIR, not once per ordering. That is the point: there
 * are 64 orderings here and only 36 things to learn.
 */
export function hardCoreFacts(): Fact[] {
  const out: Fact[] = [];
  for (let a = 2; a <= 9; a++) {
    for (let b = a; b <= 9; b++) out.push({ a, b });
  }
  return out;
}

/**
 * Sort facts by how much trouble they actually give a child.
 *
 * Not by size — 9×9 is easier than 7×8 because nines have a trick and
 * squares are memorable. This ranks by whether a strategy exists, which
 * is what makes 6×7, 7×8 and 6×8 the genuinely hardest three in the
 * whole table.
 */
const STRATEGY_EASE: Record<StrategyKind, number> = {
  zero: 0, identity: 0, tens: 1, double: 2, skip_five: 2,
  nines: 3, square: 4, near_square: 5, halve_double: 6, split_five: 7,
};

export function byDifficulty(facts: Fact[] = hardCoreFacts()): Fact[] {
  return facts.slice().sort((x, y) => {
    const ex = STRATEGY_EASE[strategyFor(x.a, x.b).kind];
    const ey = STRATEGY_EASE[strategyFor(y.a, y.b).kind];
    if (ex !== ey) return ey - ex;
    return (y.a * y.b) - (x.a * x.b);
  });
}

/**
 * What she should work on next, given what she has been getting wrong.
 *
 * Takes per-fact accuracy keyed by factKey and returns the weakest
 * facts first, collapsing each commutative pair to one entry — so 4×7
 * and 7×4 count as evidence about the SAME fact rather than two.
 */
export function weakestFacts(
  accuracy: Map<string, { correct: number; total: number }>,
  limit = 8,
): Array<Fact & { correct: number; total: number; pct: number }> {
  const merged = new Map<string, { correct: number; total: number }>();
  for (const [key, v] of Array.from(accuracy.entries())) {
    const cur = merged.get(key) ?? { correct: 0, total: 0 };
    merged.set(key, { correct: cur.correct + v.correct, total: cur.total + v.total });
  }
  return hardCoreFacts()
    .map(f => {
      const v = merged.get(factKey(f.a, f.b)) ?? { correct: 0, total: 0 };
      return { ...f, ...v, pct: v.total ? v.correct / v.total : 1 };
    })
    .filter(f => f.total > 0)
    .sort((x, y) => x.pct - y.pct || y.total - x.total)
    .slice(0, limit);
}
