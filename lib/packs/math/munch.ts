// lib/packs/math/munch.ts
//
// The Munch Patch engine — rules, boards, and the referee's tools.
// Spec: docs/superpowers/specs/2026-08-29-munch-patch-spec.md.
//
// TWO LAWS, from the spec:
//  1. The server is the referee. Boards are generated from a seed,
//     DETERMINISTICALLY, so the server can regrow the exact board a
//     child played and judge every munch itself.
//  2. Wrongness must be shown, not asserted. whyWrong() COMPUTES its
//     explanation from the rule and the face — no canned text that
//     could drift out of truth.

/* ── deterministic randomness ───────────────────────────────────── */

/** mulberry32 — tiny, seedable, and identical on server and client. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(rng: () => number, arr: readonly T[]): T =>
  arr[Math.floor(rng() * arr.length)];
const between = (rng: () => number, lo: number, hi: number): number =>
  lo + Math.floor(rng() * (hi - lo + 1));

/* ── rules ──────────────────────────────────────────────────────── */

export type MunchRule =
  | { type: 'eat_number'; target: number }
  | { type: 'bigger_than'; pivot: number }
  | { type: 'sum_equals'; target: number }
  | { type: 'multiple_of'; k: number };

/** Attempt/ledger key: one rule, one name. */
export function ruleKey(rule: MunchRule): string {
  switch (rule.type) {
    case 'eat_number': return `eat_number_${rule.target}`;
    case 'bigger_than': return `bigger_than_${rule.pivot}`;
    case 'sum_equals': return `sum_equals_${rule.target}`;
    case 'multiple_of': return `multiple_of_${rule.k}`;
  }
}

const NUMERAL = /^\d{1,2}$/;
const SUM = /^(\d{1,2})\+(\d{1,2})$/;

/**
 * The predicate — the single source of truth for "is this face a
 * right answer under this rule". A face that does not even parse is
 * simply not correct.
 */
export function checkFace(rule: MunchRule, face: string): boolean {
  if (rule.type === 'sum_equals') {
    const m = SUM.exec(face);
    return !!m && Number(m[1]) + Number(m[2]) === rule.target;
  }
  if (!NUMERAL.test(face)) return false;
  const n = Number(face);
  switch (rule.type) {
    case 'eat_number': return n === rule.target;
    case 'bigger_than': return n > rule.pivot;
    case 'multiple_of': return n % rule.k === 0;
  }
}

/**
 * The "blech" card — WHY that veggie was wrong, derivable from the
 * card itself. Only ever called on faces checkFace rejected.
 */
export function whyWrong(rule: MunchRule, face: string): string {
  switch (rule.type) {
    case 'eat_number':
      return `That one is a ${face}. We are eating ${rule.target}s.`;
    case 'bigger_than': {
      const n = Number(face);
      return n === rule.pivot
        ? `${face} IS ${rule.pivot} — we want bigger than ${rule.pivot}.`
        : `${face} comes before ${rule.pivot}.`;
    }
    case 'sum_equals': {
      const m = SUM.exec(face)!;
      const sum = Number(m[1]) + Number(m[2]);
      return `${m[1]} + ${m[2]} makes ${sum}, not ${rule.target}.`;
    }
    case 'multiple_of': {
      // The skip-count chain, computed: true multiples bracketing
      // the wrong value, with the value sitting in sorted position
      // wearing a question mark.
      const n = Number(face);
      const below = Math.floor(n / rule.k) * rule.k;
      const chain: string[] = [];
      for (let v = Math.max(rule.k, below - rule.k); v <= below; v += rule.k) {
        chain.push(String(v));
      }
      chain.push(`${n}?`);
      chain.push(String(below + rule.k));
      return `${chain.join(', ')} — ${n} is not a landing spot when you count by ${rule.k}s.`;
    }
  }
}

/* ── the board ──────────────────────────────────────────────────── */

export const BOARD_COLS = 5;
export const BOARD_ROWS = 4;
export const BOARD_SIZE = BOARD_COLS * BOARD_ROWS;

export interface MunchTile {
  face: string;
  correct: boolean;
}

export interface MunchBoard {
  tiles: MunchTile[];
  correctCount: number;
}

const swapDigits = (n: number): number =>
  n >= 10 ? (n % 10) * 10 + Math.floor(n / 10) : n;

/**
 * Grow one board: 6–9 correct tiles of 20, the rest DESIGNED traps.
 * Every tile — correct and distractor alike — is re-checked against
 * checkFace before it is planted; a template that produces a lie is
 * discarded, never trusted.
 */
export function makeBoard(rule: MunchRule, seed: number): MunchBoard {
  const rng = mulberry32(seed);
  // Small sum targets have a small face space — target 8 grows only
  // seven unique "a+b" faces — so the correct count is clamped to
  // what can actually be planted, never wished into existence.
  const maxCorrect = rule.type === 'sum_equals'
    ? Math.min(9, rule.target - 1)
    : 9;
  const correctCount = between(rng, 6, Math.max(6, maxCorrect));
  const tiles: MunchTile[] = [];
  const sumFaces = new Set<string>(); // sum faces must be unique as strings

  const plantCorrect = (): void => {
    for (let tries = 0; tries < 200; tries++) {
      const face = growCorrectFace(rule, rng);
      if (face === null) continue;
      if (rule.type === 'sum_equals') {
        if (sumFaces.has(face)) continue;
        sumFaces.add(face);
      }
      if (!checkFace(rule, face)) continue; // the re-check law
      tiles.push({ face, correct: true });
      return;
    }
    throw new Error(`munch: could not grow a correct face for ${ruleKey(rule)}`);
  };

  const plantTrap = (): void => {
    for (let tries = 0; tries < 200; tries++) {
      const face = growTrapFace(rule, rng);
      if (face === null) continue;
      if (rule.type === 'sum_equals') {
        if (sumFaces.has(face)) continue;
        sumFaces.add(face);
      }
      if (checkFace(rule, face)) continue; // an accidental answer is a bug, not a trap
      tiles.push({ face, correct: false });
      return;
    }
    throw new Error(`munch: could not grow a trap for ${ruleKey(rule)}`);
  };

  for (let i = 0; i < correctCount; i++) plantCorrect();
  while (tiles.length < BOARD_SIZE) plantTrap();

  // Fisher–Yates with the same rng, so the LAYOUT is in the seed too.
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  return { tiles, correctCount };
}

function growCorrectFace(rule: MunchRule, rng: () => number): string | null {
  switch (rule.type) {
    case 'eat_number':
      return String(rule.target);
    case 'bigger_than':
      return String(between(rng, rule.pivot + 1, Math.min(rule.pivot + 24, 99)));
    case 'sum_equals': {
      const a = between(rng, 1, rule.target - 1);
      return `${a}+${rule.target - a}`;
    }
    case 'multiple_of':
      return String(rule.k * between(rng, 1, 10));
  }
}

/** The traps children actually fall for, per rule. */
function growTrapFace(rule: MunchRule, rng: () => number): string | null {
  switch (rule.type) {
    case 'eat_number': {
      // Neighbors of the target, plus honest strangers.
      const near = [rule.target - 1, rule.target + 1].filter(n => n >= 0 && n <= 10);
      const n = rng() < 0.4 ? pick(rng, near) : between(rng, 0, 10);
      return String(n);
    }
    case 'bigger_than': {
      // Everything at or below the pivot — the pivot itself is the
      // best trap of all ("is bigger the same as equal?" — no).
      const n = rng() < 0.2
        ? rule.pivot
        : between(rng, Math.max(0, rule.pivot - 24), rule.pivot);
      return String(n);
    }
    case 'sum_equals': {
      // Off-by-one and ten-slip sums — the real mistakes.
      const slip = pick(rng, [-10, -2, -1, 1, 2, 10] as const);
      const t = rule.target + slip;
      if (t < 2 || t > 99) return null;
      const a = between(rng, 1, t - 1);
      return `${a}+${t - a}`;
    }
    case 'multiple_of': {
      // k·m ± 1, the neighbors' multiples, and digit swaps of true
      // answers — every candidate re-checked upstream, because for
      // some k a swap IS still an answer (24→42 stays a multiple
      // of 6) and must be rejected there.
      const m = between(rng, 1, 10);
      const kind = rng();
      let n: number;
      if (kind < 0.35) n = rule.k * m + (rng() < 0.5 ? 1 : -1);
      else if (kind < 0.6) n = (rule.k - 1) * m;
      else if (kind < 0.85) n = (rule.k + 1) * m;
      else n = swapDigits(rule.k * between(rng, 2, 10));
      if (n < 1 || n > 99) return null;
      return String(n);
    }
  }
}

/* ── the crates: which rules each level is offered ──────────────── */

export interface MunchCrate {
  code: string;
  /** Child-facing crate label — plain words, listenable. */
  label: string;
  minLevel: number;
  /** Grow this crate's rule for one round, from a seed. */
  roll: (seed: number) => MunchRule;
}

export const CRATES: MunchCrate[] = [
  {
    code: 'find', label: 'Find every one', minLevel: 1,
    roll: s => ({ type: 'eat_number', target: between(mulberry32(s), 2, 10) }),
  },
  {
    code: 'bigger', label: 'Eat the bigger numbers', minLevel: 2,
    roll: s => ({ type: 'bigger_than', pivot: between(mulberry32(s), 15, 75) }),
  },
  {
    code: 'little_sums', label: 'Sums that match', minLevel: 2,
    roll: s => ({ type: 'sum_equals', target: between(mulberry32(s), 8, 20) }),
  },
  {
    code: 'skip_small', label: 'Counting-by steps (2s to 5s)', minLevel: 3,
    roll: s => ({ type: 'multiple_of', k: between(mulberry32(s), 2, 5) }),
  },
  {
    code: 'skip_big', label: 'Counting-by steps (6s to 9s)', minLevel: 3,
    roll: s => ({ type: 'multiple_of', k: between(mulberry32(s), 6, 9) }),
  },
  {
    code: 'big_sums', label: 'Big sums that match', minLevel: 3,
    roll: s => ({ type: 'sum_equals', target: between(mulberry32(s), 41, 99) }),
  },
];

/**
 * Every crate at or below the child's level, plus AT MOST one
 * stretch crate from the next level up (marked). The catalog tops
 * out at level 3, so level-3+ children see everything and no
 * stretch — the sprout only appears where a harder crate exists.
 */
export function offeredCrates(level: number): Array<MunchCrate & { stretch: boolean }> {
  const mine = CRATES.filter(c => c.minLevel <= level)
    .map(c => ({ ...c, stretch: false }));
  const next = CRATES.find(c => c.minLevel === level + 1);
  return next ? [...mine, { ...next, stretch: true }] : mine;
}

/* ── regrow bookkeeping (the groundhog's debt) ──────────────────── */

/**
 * Where a stolen correct veggie regrows: any empty index. One always
 * exists — the tile the groundhog just emptied qualifies — so this
 * only throws on a caller bug, never in honest play.
 */
export function pickEmptyIndex(empties: number[], roll: number): number {
  if (empties.length === 0) {
    throw new Error('munch: regrow with no empty tile — caller accounting bug');
  }
  return empties[Math.floor(Math.max(0, Math.min(0.999999, roll)) * empties.length)];
}

/* ── prizes: the county fair shelf ──────────────────────────────── */

export interface PrizeVeggie {
  code: string;
  name: string;
  blurb: string;
}

export const PRIZE_VEGGIES: PrizeVeggie[] = [
  { code: 'enormous_pumpkin', name: 'the Enormous Pumpkin',
    blurb: 'It needed its own wheelbarrow. And a friend to push it.' },
  { code: 'blue_ribbon_zucchini', name: 'the Blue-Ribbon Zucchini',
    blurb: 'The judges measured it twice and whispered a lot.' },
  { code: 'very_long_carrot', name: 'the Very Long Carrot',
    blurb: 'Pulled and pulled and pulled and pulled. And pulled.' },
  { code: 'cabbage_of_unusual_size', name: 'the Cabbage of Unusual Size',
    blurb: 'Scientists were notified. The cabbage did not care.' },
  { code: 'proud_tomato', name: 'the Proud Tomato',
    blurb: 'It sat for its portrait without being asked.' },
  { code: 'curly_kale', name: 'the Curliest Kale',
    blurb: 'Combing it only made things worse.' },
  { code: 'gentle_squash', name: 'the Gentle Giant Squash',
    blurb: 'Big enough to frighten a groundhog. Too kind to try.' },
  { code: 'twin_radishes', name: 'the Twin Radishes',
    blurb: 'They finish each other\'s leaves.' },
];

export interface MunchState {
  prizeDate?: string;
  prizes?: Array<{ code: string; date: string }>;
  cleared?: Record<string, number>;
}

const hashText = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

/**
 * Record a server-verified clear. Bumps the count for the rule and
 * — first clear of the day only — picks the day's prize veggie,
 * date-seeded. Later clears are cheerfully allowed and pay nothing,
 * exactly like the hummingbird's flower.
 */
export function recordClear(
  state: MunchState, key: string, today: string,
): { state: MunchState; prize: PrizeVeggie | null } {
  const cleared = { ...(state.cleared ?? {}) };
  cleared[key] = (cleared[key] ?? 0) + 1;
  if (state.prizeDate === today) {
    return { state: { ...state, cleared }, prize: null };
  }
  const prize = PRIZE_VEGGIES[hashText(today) % PRIZE_VEGGIES.length];
  return {
    state: {
      ...state,
      cleared,
      prizeDate: today,
      prizes: [...(state.prizes ?? []), { code: prize.code, date: today }],
    },
    prize,
  };
}
