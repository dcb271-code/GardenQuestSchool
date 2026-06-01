// lib/naturalist/walkSelection.ts
//
// Picks 2-4 species for a single walk session. Phase 2: uniform random.
// Phase 3 will replace with a spacing-aware picker (50% due / 30% new /
// 20% wild card per the design spec).
//
// Pure function — caller injects the RNG so tests can seed it.

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
