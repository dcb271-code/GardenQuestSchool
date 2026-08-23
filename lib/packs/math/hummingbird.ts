// lib/packs/math/hummingbird.ts
//
// The hummingbird's nectar rounds — addition fluency with speed FELT,
// never shown. Spec: docs/superpowers/specs/2026-08-21-hummingbird-spec.md.
//
// THE RULE THIS FILE ENFORCES: no clock ever reaches the screen.
// Time is measured silently, compared only against HER OWN past
// rounds, and surfaces only as the bird's own remark — an
// observation after the fact, never a demand during. A slow round
// gets no remark about time at all.

export interface NectarFact {
  a: number;
  b: number;
  choices: number[];
  correctIndex: number;
}

export const ROUND_LENGTH = 10;

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
 * Ten addition facts within 20 — mostly ten-crossers, because those
 * are where fluency is actually earned; a few gentle ones so the
 * round has a rhythm.
 */
export function buildNectarRound(seed: number): NectarFact[] {
  const rand = rng(seed);
  const facts: NectarFact[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (facts.length < ROUND_LENGTH && guard++ < 400) {
    const crossing = facts.length % 5 !== 0; // 8 of 10 cross ten
    let a: number, b: number;
    if (crossing) {
      a = 5 + Math.floor(rand() * 5);        // 5..9
      b = (11 - a) + Math.floor(rand() * (9 - (11 - a) + 1)); // sum 11..a+9
    } else {
      a = 2 + Math.floor(rand() * 6);        // 2..7
      b = 1 + Math.floor(rand() * Math.min(8, 10 - a)); // sum ≤ 10
    }
    const key = a <= b ? `${a}+${b}` : `${b}+${a}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const sum = a + b;
    const wrongs = new Set<number>();
    while (wrongs.size < 3) {
      const w = sum + (Math.floor(rand() * 5) - 2 || 3);
      if (w !== sum && w > 0 && w <= 20) wrongs.add(w);
    }
    const choices = Array.from(wrongs);
    const slot = Math.floor(rand() * 4);
    choices.splice(slot, 0, sum);
    facts.push({ a, b, choices, correctIndex: slot });
  }
  return facts;
}

/* ── state ──────────────────────────────────────────────────────── */

export interface HummingbirdState {
  /** Her quickest CLEAN round (all ten first-try), in ms. Private to
   *  the bird — never rendered as a number. */
  bestMs?: number;
  /** Nectar flowers earned, one per day at most. */
  flowers?: number;
  lastFlowerOn?: string;
}

export function canEarnFlowerToday(state: HummingbirdState, today: string): boolean {
  return state.lastFlowerOn !== today;
}

/**
 * What the bird says after a round. Speed remarks ONLY on a clean
 * round that strictly beats her own best; otherwise the bird talks
 * about anything except time.
 */
export function birdRemark(
  state: HummingbirdState, firstTryCount: number, totalMs: number,
): { remark: string; newBestMs?: number } {
  const clean = firstTryCount === ROUND_LENGTH;
  if (clean && (state.bestMs === undefined || totalMs < state.bestMs)) {
    return {
      remark: state.bestMs === undefined
        ? 'Every flower, first try. The hummingbird did a little loop in the air.'
        : 'Every flower, first try — and quicker than you have ever been. The hummingbird is showing off now, and so should you.',
      newBestMs: totalMs,
    };
  }
  if (clean) {
    return { remark: 'Every flower, first try. The hummingbird bobbed its head at you — from a hummingbird, that is a deep bow.' };
  }
  if (firstTryCount >= ROUND_LENGTH - 2) {
    return { remark: `${firstTryCount} flowers on the first try. The hummingbird waited for you at the tricky ones — it does that for friends.` };
  }
  return { remark: 'The garden got watered either way. The hummingbird will be here tomorrow — it always comes back.' };
}

export function recordRound(
  state: HummingbirdState, firstTryCount: number, totalMs: number, today: string,
): { state: HummingbirdState; remark: string; flowerEarned: boolean } {
  const { remark, newBestMs } = birdRemark(state, firstTryCount, totalMs);
  const flowerEarned = canEarnFlowerToday(state, today);
  return {
    state: {
      ...state,
      ...(newBestMs !== undefined ? { bestMs: newBestMs } : {}),
      ...(flowerEarned
        ? { flowers: (state.flowers ?? 0) + 1, lastFlowerOn: today }
        : {}),
    },
    remark,
    flowerEarned,
  };
}
