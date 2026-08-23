// lib/packs/math/carry.ts
//
// The ant colony carries — the lane model behind the carrying
// workshop. Spec: docs/superpowers/specs/2026-08-21-ant-carry-spec.md.
//
// The invariant the whole feature rests on: NOTHING IS EVER CARRIED
// EXCEPT A COMPLETED TEN. The model only produces a carry when a
// column sums past nine, so the animation cannot show the algorithm
// being done wrong.

export interface CarryColumn {
  /** 1 = ones, 10 = tens, ... */
  place: number;
  aDigit: number;
  bDigit: number;
  carryIn: number;
  /** aDigit + bDigit + carryIn */
  sum: number;
  /** The digit written below the line. */
  writes: number;
  /** 1 if a bundle crosses the wall to the next lane. */
  carryOut: number;
}

export interface CarrySum {
  a: number;
  b: number;
  total: number;
  columns: CarryColumn[];   // ones first
  carryCount: number;
}

export function analyzeSum(a: number, b: number): CarrySum {
  const columns: CarryColumn[] = [];
  let carry = 0;
  let pa = a, pb = b, place = 1;
  while (pa > 0 || pb > 0 || carry > 0) {
    const aDigit = pa % 10, bDigit = pb % 10;
    const sum = aDigit + bDigit + carry;
    const carryOut = sum >= 10 ? 1 : 0;
    columns.push({
      place, aDigit, bDigit, carryIn: carry,
      sum, writes: sum % 10, carryOut,
    });
    carry = carryOut;
    pa = Math.floor(pa / 10); pb = Math.floor(pb / 10); place *= 10;
  }
  return {
    a, b, total: a + b, columns,
    carryCount: columns.filter(c => c.carryOut === 1).length,
  };
}

function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 0xffffffff;
  };
}

/**
 * A practice sum with AT LEAST ONE carry — a carrying workshop that
 * deals a no-carry sum is a swimming lesson on dry land.
 */
export function makeCarrySum(seed: number, digits: 2 | 3 | 4 = 2): CarrySum {
  const rand = rng(seed);
  const lo = 10 ** (digits - 1), hi = 10 ** digits - 1;
  for (let tries = 0; tries < 200; tries++) {
    const a = lo + Math.floor(rand() * (hi - lo));
    const b = lo + Math.floor(rand() * Math.min(hi - a, hi - lo));
    if (a + b > hi) continue;
    const s = analyzeSum(a, b);
    if (s.carryCount >= 1) return s;
  }
  // Deterministic fallback that always carries.
  const a = lo + 7, b = lo + 8;
  return analyzeSum(a, b);
}

/** The demo sum the WATCH tool narrates — fixed, so the narration
 *  and the art can be written against exact numbers. */
export const WATCH_DEMO = analyzeSum(47, 38);
