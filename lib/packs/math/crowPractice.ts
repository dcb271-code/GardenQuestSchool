// lib/packs/math/crowPractice.ts
//
// Crow practice — phase 2 of the spec. Pure logic: the deck builder
// and the gold-frame reducer live here so both are testable without
// a browser or a database.
//
// THE INCENTIVE IS GOLD FRAMES, NOT MONEY. A fact that holds across
// spaced visits turns its picture's frame gold on the cache wall;
// all six gold and the crow leaves a single black feather. Nothing
// here pays a coin, a stone, or a seed — memory made visible, not
// currency (spec: "Explicitly out").

import { factKey } from './timesTable';
import { CROW_SCENES, type CrowScene } from './crowScenes';

/* ── the deck ───────────────────────────────────────────────────── */

export type CrowQuestion =
  | {
      kind: 'forward';               // 7 × 8 = ?
      factKey: string;
      a: number; b: number;
      choices: number[];             // products; one is right
      correctIndex: number;
      sceneCode: string;             // the hint picture
    }
  | {
      kind: 'reverse';               // 56 — whose picture is this?
      factKey: string;
      product: number;
      choices: string[];             // scene codes; one is right
      correctIndex: number;
      sceneCode: string;
    };

function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 0xffffffff;
  };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Eight questions over the six scenes, weakest facts first and
 * doubled, directions alternating. Golded facts still appear — gold
 * that is never revisited is gold that quietly stops being true —
 * but they go to the back of the line.
 */
export function buildCrowDeck(
  accuracy: Map<string, { correct: number; total: number }>,
  goldKeys: Set<string>,
  seed: number,
): CrowQuestion[] {
  const rand = rng(seed);

  const rate = (s: CrowScene) => {
    const st = accuracy.get(factKey(s.a, s.b));
    // Unseen sorts as weakest — the whole point is meeting them.
    if (!st || st.total === 0) return -1;
    return st.correct / st.total;
  };
  const ordered = [...CROW_SCENES].sort((x, y) => {
    const gx = goldKeys.has(factKey(x.a, x.b)) ? 1 : 0;
    const gy = goldKeys.has(factKey(y.a, y.b)) ? 1 : 0;
    if (gx !== gy) return gx - gy;          // gold to the back
    return rate(x) - rate(y);               // weakest first
  });

  // Two extra visits for the two weakest.
  const lineup = [...ordered, ordered[0], ordered[1]];

  return lineup.map((scene, i) => {
    const key = factKey(scene.a, scene.b);
    if (i % 2 === 0) {
      // forward: distractors are the OTHER scenes' products — the
      // confusions she would actually make.
      const others = shuffle(
        CROW_SCENES.filter(s => s !== scene).map(s => s.product), rand,
      ).slice(0, 3);
      const slot = Math.floor(rand() * 4);
      const choices = [...others];
      choices.splice(slot, 0, scene.product);
      return {
        kind: 'forward' as const, factKey: key,
        a: scene.a, b: scene.b,
        choices, correctIndex: slot, sceneCode: scene.code,
      };
    }
    const others = shuffle(
      CROW_SCENES.filter(s => s !== scene).map(s => s.code), rand,
    ).slice(0, 2);
    const slot = Math.floor(rand() * 3);
    const choices = [...others];
    choices.splice(slot, 0, scene.code);
    return {
      kind: 'reverse' as const, factKey: key,
      product: scene.product,
      choices, correctIndex: slot, sceneCode: scene.code,
    };
  });
}

/* ── gold frames ────────────────────────────────────────────────── */

export interface CrowFactProgress {
  /** Distinct days with at least one first-try correct. */
  days: string[];
  /** Lifetime first-try corrects. */
  firstTry: number;
  /** ISO date the frame turned gold. Absent until it does. */
  goldAt?: string;
}

export interface CrowCacheState {
  facts?: Record<string, CrowFactProgress>;
  /** ISO date the crow left its feather — all six frames gold. */
  featherAt?: string;
}

/** Gold = three first-try corrects spread across at least two days. */
export const GOLD_FIRST_TRIES = 3;
export const GOLD_MIN_DAYS = 2;

export interface CrowResult {
  factKey: string;
  correct: boolean;   // first try, no hint
  retries: number;
}

export function recordCrowResults(
  cache: CrowCacheState, results: CrowResult[], today: string,
): { cache: CrowCacheState; newlyGold: string[]; newFeather: boolean } {
  const facts = { ...(cache.facts ?? {}) };
  const newlyGold: string[] = [];

  for (const r of results) {
    if (!r.correct) continue;   // a miss costs nothing, ever
    const cur: CrowFactProgress = facts[r.factKey]
      ? { ...facts[r.factKey], days: [...facts[r.factKey].days] }
      : { days: [], firstTry: 0 };
    cur.firstTry += 1;
    if (!cur.days.includes(today)) cur.days.push(today);
    if (!cur.goldAt
        && cur.firstTry >= GOLD_FIRST_TRIES
        && cur.days.length >= GOLD_MIN_DAYS) {
      cur.goldAt = today;
      newlyGold.push(r.factKey);
    }
    facts[r.factKey] = cur;
  }

  const allGold = CROW_SCENES.every(s => facts[factKey(s.a, s.b)]?.goldAt);
  const newFeather = allGold && !cache.featherAt;

  return {
    cache: {
      ...cache,
      facts,
      ...(newFeather ? { featherAt: today } : {}),
    },
    newlyGold,
    newFeather,
  };
}

export function goldKeysOf(cache: CrowCacheState): Set<string> {
  return new Set(
    Object.entries(cache.facts ?? {})
      .filter(([, p]) => p.goldAt)
      .map(([k]) => k),
  );
}
