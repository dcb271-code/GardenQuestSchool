// lib/level0/rng.ts
//
// Seeded randomness for the Level 0 games. The seed is MIXED before
// use: a raw xorshift32 started from a small seed gives near-zero
// first outputs, which meant every basket round with seed < 400
// put one carrot on the left. Tests use small seeds; children get
// whatever Math.random hands the server. Both must be fair.

export function rng(seed: number): () => number {
  // splitmix32-style scramble, then xorshift32.
  let s = (seed >>> 0) + 0x9E3779B9;
  s = Math.imul(s ^ (s >>> 16), 0x21F0AAAD);
  s = Math.imul(s ^ (s >>> 15), 0x735A2D97);
  s = (s ^ (s >>> 15)) >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 0x100000000;
  };
}

export function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
