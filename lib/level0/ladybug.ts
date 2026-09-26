// lib/level0/ladybug.ts
//
// The Ladybug Count — Level 0's first game. Ladybugs land on a leaf;
// she taps each one to count it (it says its number and flies), then
// taps the numeral. Spec: docs/superpowers/specs/2026-09-26-level-zero-spec.md
//
// Everything about a leaf grows from (seed, preSkill), so the server
// can regrow the exact leaf and be the referee: how many ladybugs,
// where they sit, which three numerals are offered. Correctness is
// never in the client's payload.
//
// No timer, no lives, no way to lose. A wrong numeral makes the
// ladybugs line up in a row to be counted aloud; the leaf ends one
// way: she tapped the right number.

import type { PreSkillCode } from './curriculum';
import { rng, shuffle } from './rng';

export type LeafMode =
  | 'count'      // tap each ladybug, then tap the numeral
  | 'subitize'   // ladybugs in a dice pattern; no tapping them, just look
  | 'numeral';   // no ladybugs to count: "tap the seven"

export interface LadybugSpot { x: number; y: number; tilt: number }

export interface Leaf {
  seed: number;
  preSkill: PreSkillCode;
  mode: LeafMode;
  /** The answer. */
  count: number;
  /** Three distinct numerals, one of them `count`, in display order. */
  choices: number[];
  /** Where the ladybugs sit, in leaf coordinates (LEAF_W × LEAF_H). */
  spots: LadybugSpot[];
}

export const LEAF_W = 400;
export const LEAF_H = 300;

/** Which leaf modes each ladybug pre-skill plays. */
export const LEAF_MODE_FOR: Partial<Record<PreSkillCode, LeafMode>> = {
  count_to_5: 'count',
  count_to_10: 'count',
  subitize_1_3: 'subitize',
  numeral_1_5: 'numeral',
  numeral_1_10: 'numeral',
};

/** How many ladybugs a pre-skill may ask about. */
export const COUNT_RANGE: Partial<Record<PreSkillCode, [number, number]>> = {
  count_to_5: [1, 5],
  count_to_10: [4, 10],     // to_5 is behind her; the point is 6..10
  subitize_1_3: [1, 3],
  numeral_1_5: [1, 5],
  numeral_1_10: [1, 10],
};

export function isLadybugPreSkill(code: string): code is PreSkillCode {
  return code in LEAF_MODE_FOR;
}

/* ── where ladybugs may sit ──────────────────────────────────────── */

/** Twelve resting places inside the leaf, well apart (a ladybug is
 *  ~44 wide), so up to ten never overlap. Jitter is added per leaf. */
const SLOTS: Array<[number, number]> = [
  [95, 90], [165, 70], [240, 70], [310, 95],
  [80, 160], [155, 145], [235, 150], [315, 165],
  [110, 225], [185, 230], [255, 225], [325, 230],
];

/** Dice patterns for a glance: one in the middle, two on a diagonal,
 *  three on a diagonal. The shapes a child learns to see whole. */
const DICE: Record<number, Array<[number, number]>> = {
  1: [[200, 150]],
  2: [[130, 100], [270, 200]],
  3: [[120, 90], [200, 150], [280, 210]],
};

/* ── the leaf ────────────────────────────────────────────────────── */

/**
 * Three distinct numerals including the answer. Neighbors first —
 * a 4 among 3 and 5 is the real question; a 4 among 1 and 9 is not —
 * but never off the pre-skill's own range, and shuffled so the
 * answer has no favorite position.
 */
function makeChoices(count: number, range: [number, number], rand: () => number): number[] {
  const [lo, hi] = range;
  const pool = shuffle(
    Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).filter(n => n !== count),
    rand,
  ).sort((a, b) => Math.abs(a - count) - Math.abs(b - count));
  // Nearest two, with the shuffle breaking ties between n-1 and n+1.
  const wrongs = pool.slice(0, 2);
  return shuffle([count, ...wrongs], rand);
}

export function buildLeaf(seed: number, preSkill: PreSkillCode): Leaf {
  const mode = LEAF_MODE_FOR[preSkill];
  const range = COUNT_RANGE[preSkill];
  if (!mode || !range) throw new Error(`not a ladybug pre-skill: ${preSkill}`);
  const rand = rng(seed);
  const [lo, hi] = range;
  const count = lo + Math.floor(rand() * (hi - lo + 1));
  const choices = makeChoices(count, range, rand);

  let spots: LadybugSpot[];
  if (mode === 'subitize') {
    spots = DICE[count].map(([x, y]) => ({ x, y, tilt: Math.round((rand() - 0.5) * 30) }));
  } else {
    // Count mode scatters them; numeral mode shows none until the
    // answer, when `count` of them fly in to land on the card — the
    // spots are where they come from.
    spots = shuffle(SLOTS, rand).slice(0, count).map(([x, y]) => ({
      x: x + Math.round((rand() - 0.5) * 16),
      y: y + Math.round((rand() - 0.5) * 12),
      tilt: Math.round((rand() - 0.5) * 50),
    }));
  }
  return { seed, preSkill, mode, count, choices, spots };
}

/* ── the referee ─────────────────────────────────────────────────── */

export interface JudgedTap { chosen: number; correct: boolean }

/**
 * Judge the numerals she tapped, in order, against the server's own
 * leaf. A tap on a numeral the leaf never offered means client and
 * server disagree about the leaf — nothing is judged. Taps after the
 * first correct one are ignored: the leaf was over.
 */
export function judgeTaps(leaf: Leaf, taps: number[]): JudgedTap[] | null {
  const judged: JudgedTap[] = [];
  for (const chosen of taps) {
    if (!leaf.choices.includes(chosen)) return null;
    const correct = chosen === leaf.count;
    judged.push({ chosen, correct });
    if (correct) break;
  }
  return judged;
}

/* ── words ───────────────────────────────────────────────────────── */

export const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

export function numberWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

/** "one, two, three, four" — the count, said. */
export function countingWords(n: number): string {
  return Array.from({ length: n }, (_, i) => numberWord(i + 1)).join(', ');
}
