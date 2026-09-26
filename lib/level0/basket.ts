// lib/level0/basket.ts
//
// Bunny's Basket — Level 0's second game. Two baskets of carrots:
// which has more? The bunny hops to it and eats one. Then: put one
// more in — and what is that now? Spec: docs/superpowers/specs/
// 2026-09-26-level-zero-spec.md
//
// A round grows from (seed, preSkill) so the server regrows it and
// referees. "More" is decided by the server's own counts; the client
// only ever says which basket, and which numeral, she tapped.
//
// No way to lose. A wrong basket lines the carrots up in two rows so
// the longer one is plain and the voice counts each; a wrong numeral
// gets the count said aloud. The round ends one way.

import type { PreSkillCode } from './curriculum';
import { rng, shuffle } from './rng';

export type Side = 'left' | 'right';

export interface BasketRound {
  seed: number;
  preSkill: 'more_fewer' | 'one_more';
  left: number;
  right: number;
  /** The basket with more — the server's opinion, and the only one. */
  more: Side;
  /**
   * The one-more step, only in a one_more round: after the bunny
   * eats one from the fuller basket it holds `from`; she puts one
   * back and taps `from + 1` from three numerals.
   */
  oneMore: { basket: Side; from: number; to: number; choices: number[] } | null;
}

/** Carrots per basket. Never equal in V1 — "the same" is V2. */
export const BASKET_MIN = 1;
export const BASKET_MAX = 5;

export function isBasketPreSkill(code: string): code is BasketRound['preSkill'] {
  return code === 'more_fewer' || code === 'one_more';
}

export function buildRound(seed: number, preSkill: PreSkillCode): BasketRound {
  if (!isBasketPreSkill(preSkill)) throw new Error(`not a basket pre-skill: ${preSkill}`);
  const rand = rng(seed);
  const span = BASKET_MAX - BASKET_MIN + 1;
  const left = BASKET_MIN + Math.floor(rand() * span);
  let right = BASKET_MIN + Math.floor(rand() * (span - 1));
  if (right >= left) right += 1;              // never equal
  const more: Side = left > right ? 'left' : 'right';

  let oneMore: BasketRound['oneMore'] = null;
  if (preSkill === 'one_more') {
    const fuller = Math.max(left, right);
    const from = fuller - 1;                  // after the bunny eats one
    const to = from + 1;
    // The wrongs are neighbors — `from` itself is the natural trap
    // ("three… and one more is… three?"). `to` is 2..5, so there are
    // always at least two candidates in 1..6.
    const pool = [to - 2, to - 1, to + 1, to + 2].filter(n => n >= 1 && n <= BASKET_MAX + 1);
    const wrongs = shuffle(pool, rand).sort((a, b) => Math.abs(a - to) - Math.abs(b - to)).slice(0, 2);
    oneMore = { basket: more, from, to, choices: shuffle([to, ...wrongs], rand) };
  }
  return { seed, preSkill, left, right, more, oneMore };
}

/* ── the referee ─────────────────────────────────────────────────── */

export interface JudgedBasketTap { chosen: Side; correct: boolean }
export interface JudgedNumeralTap { chosen: number; correct: boolean }

/** Basket taps in order, stopping at the first right one. */
export function judgeBasketTaps(round: BasketRound, taps: Side[]): JudgedBasketTap[] {
  const out: JudgedBasketTap[] = [];
  for (const chosen of taps) {
    const correct = chosen === round.more;
    out.push({ chosen, correct });
    if (correct) break;
  }
  return out;
}

/**
 * Numeral taps for the one-more step. Null when the round has no
 * such step, or a tap names a numeral that was never offered — the
 * client and server disagree about the round.
 */
export function judgeNumeralTaps(round: BasketRound, taps: number[]): JudgedNumeralTap[] | null {
  if (!round.oneMore) return taps.length === 0 ? [] : null;
  const out: JudgedNumeralTap[] = [];
  for (const chosen of taps) {
    if (!round.oneMore.choices.includes(chosen)) return null;
    const correct = chosen === round.oneMore.to;
    out.push({ chosen, correct });
    if (correct) break;
  }
  return out;
}
