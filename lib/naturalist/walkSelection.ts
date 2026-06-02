// lib/naturalist/walkSelection.ts
//
// Picks 2-4 species for a single walk session. Phase 2: uniform random.
// Phase 3 will replace with a spacing-aware picker (50% due / 30% new /
// 20% wild card per the design spec).
//
// Pure function — caller injects the RNG so tests can seed it.

import { isDue } from './spacing';

export type Rng = () => number;  // returns [0, 1)

export function pickWalkSpecies(
  pool: readonly string[],
  n: number,
  rng: Rng,
): string[] {
  if (n < 1) throw new Error('pickWalkSpecies: n must be at least 1');
  if (n > pool.length) {
    throw new Error(
      `pickWalkSpecies: not enough species in pool (need ${n}, have ${pool.length})`,
    );
  }

  // Fisher-Yates partial shuffle: shuffle the first n indices.
  const arr = [...pool];
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(rng() * (arr.length - i));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

// A subset of a flora_review row — only the fields the picker needs.
export interface ReviewRow {
  flora_code: string;
  exposures: number;
  next_review_at: string | null;
  photo_roles_seen: string[];
}

export interface SelectWalkOptions {
  seasonPool: readonly string[];   // flora codes appropriate for the current season
  reviewRows: readonly ReviewRow[]; // this learner's flora_review rows (any season)
  n: number;                        // how many species to pick (2-4)
  now: Date;
  rng: Rng;
}

// Spacing-aware species picker. Fills the walk from three weighted buckets:
//   DUE      (50%): season-appropriate species past their next_review_at
//   NEW      (30%): season-appropriate species the learner has never seen
//   WILDCARD (20%): any season-appropriate species
// Picks are de-duplicated; if a bucket runs dry the remaining slots fall
// through to the other buckets so we always return min(n, distinct pool).
export function selectWalkSpecies(opts: SelectWalkOptions): string[] {
  const { seasonPool, reviewRows, n, now, rng } = opts;
  if (n < 1) throw new Error('selectWalkSpecies: n must be at least 1');
  if (seasonPool.length === 0) return [];

  const seasonSet = new Set(seasonPool);
  const seenCodes = new Set(reviewRows.map(r => r.flora_code));

  // DUE: season-appropriate AND past next_review_at
  const dueCodes = reviewRows
    .filter(r => seasonSet.has(r.flora_code) && isDue(r.next_review_at, now))
    .map(r => r.flora_code);

  // NEW: season-appropriate AND never seen
  const newCodes = seasonPool.filter(c => !seenCodes.has(c));

  // WILDCARD: any season-appropriate
  const wildCodes = [...seasonPool];

  // Weighted bucket order. We draw one code at a time: roll the weighted
  // die to choose a bucket, then take a random unused code from it. If the
  // chosen bucket is exhausted, fall through to the next non-empty bucket.
  const buckets: Array<{ weight: number; pool: string[] }> = [
    { weight: 0.5, pool: shuffle(dueCodes, rng) },
    { weight: 0.3, pool: shuffle(newCodes, rng) },
    { weight: 0.2, pool: shuffle(wildCodes, rng) },
  ];

  const picked: string[] = [];
  const used = new Set<string>();
  const target = Math.min(n, new Set(seasonPool).size);

  let guard = 0;
  while (picked.length < target && guard < 1000) {
    guard++;
    const bucket = chooseBucket(buckets, rng);
    // Try chosen bucket first, then any non-empty bucket as fallback.
    const order = bucket ? [bucket, ...buckets.filter(b => b !== bucket)] : buckets;
    let took = false;
    for (const b of order) {
      while (b.pool.length > 0) {
        const code = b.pool.pop()!;
        if (!used.has(code)) {
          used.add(code);
          picked.push(code);
          took = true;
          break;
        }
      }
      if (took) break;
    }
    if (!took) break; // all buckets exhausted
  }

  return picked;
}

function shuffle(arr: readonly string[], rng: Rng): string[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Weighted pick among buckets that still have items. Returns null if all empty.
function chooseBucket(
  buckets: Array<{ weight: number; pool: string[] }>,
  rng: Rng,
): { weight: number; pool: string[] } | null {
  const live = buckets.filter(b => b.pool.length > 0);
  if (live.length === 0) return null;
  const total = live.reduce((s, b) => s + b.weight, 0);
  let roll = rng() * total;
  for (const b of live) {
    roll -= b.weight;
    if (roll <= 0) return b;
  }
  return live[live.length - 1];
}
