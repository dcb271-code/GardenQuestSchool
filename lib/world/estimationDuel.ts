// lib/world/estimationDuel.ts
//
// Hodge's Estimation Duel — a Level-3+ game at the beaver's brook.
// Three rounds; each shows a scene, the child picks the best estimate,
// then the exact answer is revealed and compared against Hodge's
// (authored, plausibly-lazy) guess. Closest estimate wins the round.
//
// DESIGN RULE — estimation must be REASONABLE, never arbitrary:
//   • benchmark_count rounds always show one marked cluster with a
//     known count ("this bundle is 10 logs") and the rest in similar
//     clusters — so the estimate is "about 4 bundles → about 40",
//     which is grouping logic, not guessing.
//   • benchmark_length rounds show the unit itself (Hodge is 1 meter
//     long) next to the thing being measured — the estimate is "how
//     many Hodges fit", i.e. iterating a unit.
//   • rounding rounds give a computation with nearly-friendly numbers
//     (21 ≈ 20) — the estimate is round-then-multiply.
// Every round carries a reasonHint that the reveal screen shows, so
// the STRATEGY is the lesson, win or lose.
//
// Rounds are picked deterministically from the day + a stride, so the
// duel changes daily but doesn't reshuffle mid-day.

export type DuelScene = 'logs' | 'acorns' | 'cattails' | 'fish';

export interface DuelRoundBase {
  id: string;
  prompt: string;
  exact: number;
  /** 4 candidate estimates; the "best" is whichever is closest to exact. */
  choices: number[];
  hodgeGuess: number;
  /** Hodge announces his guess with his (often lazy) reasoning. */
  hodgeLine: string;
  /** The reveal screen teaches the strategy in one line. */
  reasonHint: string;
  unitWord: string;             // 'logs', 'acorns', 'meters', …
}

export type DuelRound =
  | (DuelRoundBase & {
      kind: 'benchmark_count';
      scene: DuelScene;
      /** Item counts per cluster; cluster 0 is the marked benchmark. */
      clusters: number[];
      benchmarkLabel: string;   // e.g. 'this bundle is 10'
    })
  | (DuelRoundBase & {
      kind: 'benchmark_length';
      /** True length in Hodge-units (1 unit = 1 meter). */
      units: number;
      unitLabel: string;        // e.g. 'Hodge is 1 meter, nose to tail'
    })
  | (DuelRoundBase & {
      kind: 'rounding';
      expression: string;       // e.g. '7 sections × 21 logs'
    });

// Interleaved kinds so any stride-3 walk yields a varied trio.
export const DUEL_ROUNDS: DuelRound[] = [
  {
    kind: 'benchmark_count', id: 'logs_38', scene: 'logs',
    prompt: 'Hodge dragged all these logs to the brook. About how many logs?',
    clusters: [10, 9, 11, 8], benchmarkLabel: 'this pile is 10',
    exact: 38, choices: [40, 20, 80, 12],
    hodgeGuess: 60, hodgeLine: 'I counted one pile, then guessed BIG. Sixty!',
    reasonHint: '4 piles of about 10 each → about 40. (It was 38.)',
    unitWord: 'logs',
  },
  {
    kind: 'benchmark_length', id: 'dam_5',
    prompt: 'About how many meters long is the new dam?',
    units: 5, unitLabel: 'Hodge is 1 meter, nose to tail',
    exact: 5, choices: [5, 2, 10, 25],
    hodgeGuess: 8, hodgeLine: 'Feels like eight of me. I am very long.',
    reasonHint: 'About 5 Hodges fit along the dam — and Hodge is 1 meter. So about 5 meters.',
    unitWord: 'meters',
  },
  {
    kind: 'rounding', id: 'sections_147',
    prompt: 'The dam has 7 sections, and each section needs 21 logs. About how many logs altogether?',
    expression: '7 sections × 21 logs',
    exact: 147, choices: [140, 70, 280, 210],
    hodgeGuess: 200, hodgeLine: 'Twenty-one is basically thirty. So… two hundred!',
    reasonHint: '21 is close to 20, and 7 × 20 = 140. (Exactly: 147.)',
    unitWord: 'logs',
  },
  {
    kind: 'benchmark_count', id: 'acorns_52', scene: 'acorns',
    prompt: 'A squirrel spilled its whole winter stash. About how many acorns?',
    clusters: [10, 12, 9, 11, 10], benchmarkLabel: 'this heap is 10',
    exact: 52, choices: [50, 25, 100, 15],
    hodgeGuess: 30, hodgeLine: 'Beavers don\'t do acorns. Thirty-ish?',
    reasonHint: '5 heaps of about 10 → about 50. (It was 52.)',
    unitWord: 'acorns',
  },
  {
    kind: 'benchmark_length', id: 'lodge_3',
    prompt: 'About how many meters wide is Hodge\'s lodge?',
    units: 3, unitLabel: 'Hodge is 1 meter, nose to tail',
    exact: 3, choices: [3, 1, 7, 15],
    hodgeGuess: 4, hodgeLine: 'Four of me, easy. I have measured it with naps.',
    reasonHint: 'About 3 Hodges fit across the lodge → about 3 meters.',
    unitWord: 'meters',
  },
  {
    kind: 'rounding', id: 'sticks_336',
    prompt: 'The stream washes 48 sticks past the dam every day. About how many sticks in a week?',
    expression: '7 days × 48 sticks',
    exact: 336, choices: [350, 100, 700, 50],
    hodgeGuess: 500, hodgeLine: 'A week is long. Five hundred, easily.',
    reasonHint: '48 is close to 50, and 7 × 50 = 350. (Exactly: 336.)',
    unitWord: 'sticks',
  },
  {
    kind: 'benchmark_count', id: 'cattails_29', scene: 'cattails',
    prompt: 'Cattails grow in clumps along the bank. About how many stems?',
    clusters: [10, 8, 11], benchmarkLabel: 'this clump is 10',
    exact: 29, choices: [30, 10, 60, 90],
    hodgeGuess: 50, hodgeLine: 'Tall things always come in fifties.',
    reasonHint: '3 clumps of about 10 → about 30. (It was 29.)',
    unitWord: 'stems',
  },
  {
    kind: 'benchmark_count', id: 'fish_60', scene: 'fish',
    prompt: 'A school of minnows is passing the dam. About how many fish?',
    clusters: [10, 9, 12, 10, 8, 11], benchmarkLabel: 'this group is 10',
    exact: 60, choices: [60, 30, 120, 20],
    hodgeGuess: 100, hodgeLine: 'They move too fast to count. One hundred!',
    reasonHint: '6 groups of about 10 → about 60. (Exactly 60!)',
    unitWord: 'fish',
  },
];

export const DUEL_ROUNDS_PER_GAME = 3;
export const ESTIMATION_MIN_LEVEL = 3;

/** Deterministic 3-round pick for a given day key (e.g. '2026-07-23'). */
export function duelRoundsForDay(dayKey: string): DuelRound[] {
  let h = 0;
  for (const ch of dayKey) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const n = DUEL_ROUNDS.length;
  const start = h % n;
  // Stride 3 is coprime with the round count (8), so 3 picks are distinct.
  return Array.from({ length: DUEL_ROUNDS_PER_GAME }, (_, i) =>
    DUEL_ROUNDS[(start + i * 3) % n],
  );
}

export type RoundWinner = 'kid' | 'hodge' | 'tie';

export function scoreRound(round: DuelRound, kidChoice: number): {
  kidOff: number;
  hodgeOff: number;
  winner: RoundWinner;
} {
  const kidOff = Math.abs(kidChoice - round.exact);
  const hodgeOff = Math.abs(round.hodgeGuess - round.exact);
  const winner: RoundWinner = kidOff < hodgeOff ? 'kid' : hodgeOff < kidOff ? 'hodge' : 'tie';
  return { kidOff, hodgeOff, winner };
}
