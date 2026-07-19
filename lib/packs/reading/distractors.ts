// Near-miss distractor selection for listening/decoding items.
//
// A sight-word item that plays "through" and offers "cat / blue /
// jump" as alternatives tests nothing — the child picks the only
// word that could possibly sound like what she heard. Distractors
// must be CLOSE: shared first sound, similar length, shared ending —
// so the choice requires actually reading the word.

/** Similarity score between a candidate and the target word.
 *  Higher = more confusable = better distractor. */
export function confusability(target: string, candidate: string): number {
  const t = target.toLowerCase();
  const c = candidate.toLowerCase();
  if (t === c) return -Infinity;
  let score = 0;
  // Same first letter — the strongest "looks like what I heard" pull.
  if (t[0] === c[0]) score += 4;
  // Same first two letters (onset) — stronger still.
  if (t.slice(0, 2) === c.slice(0, 2)) score += 3;
  // Shared ending (rime) — “-ough”, “-ere”, “-ight” families.
  for (const n of [2, 3]) {
    if (t.length >= n && c.length >= n && t.slice(-n) === c.slice(-n)) score += n;
  }
  // Similar length: within ±1 letter.
  const dl = Math.abs(t.length - c.length);
  if (dl === 0) score += 2;
  else if (dl === 1) score += 1;
  else score -= dl;
  // Shared letters overall (rough bag-of-letters overlap).
  const tl = new Set(t.split(''));
  let shared = 0;
  Array.from(new Set(c.split(''))).forEach(ch => { if (tl.has(ch)) shared++; });
  score += shared * 0.5;
  return score;
}

/**
 * Pick n distractors for a target from a pool, preferring confusable
 * near-misses. Deterministic given the same rand sequence: the top
 * candidates are taken with a light seeded shuffle among the best 6
 * so repeated items don't always show the identical trio.
 */
export function pickNearMissDistractors(
  target: string,
  pool: string[],
  n: number,
  rand: () => number,
): string[] {
  const seen = new Set<string>([target.toLowerCase()]);
  const unique = pool.filter(w => {
    const k = w.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const ranked = unique
    .map(w => ({ w, s: confusability(target, w) }))
    .sort((a, b) => b.s - a.s);
  if (ranked.length <= n) return ranked.map(x => x.w);
  // Shuffle ONLY among near-ties of the nth-best score, so variety
  // never trades away confusability (a wide shuffle band was letting
  // "cat" sneak in past "thought").
  const cutoff = ranked[n - 1].s - 1.5;
  const band = ranked.filter(x => x.s >= cutoff);
  for (let i = band.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [band[i], band[j]] = [band[j], band[i]];
  }
  const picked = band.slice(0, n).map(x => x.w);
  for (const r of ranked) {
    if (picked.length >= n) break;
    if (!picked.includes(r.w)) picked.push(r.w);
  }
  return picked;
}

/**
 * Decoy phoneme tiles for the listen-and-build mode: plausible
 * near-sounds of the target's own chunks. Deterministic per word.
 */
const SWAPS: Record<string, string[]> = {
  a: ['e', 'o'], e: ['a', 'i'], i: ['e', 'a'], o: ['a', 'u'], u: ['o', 'i'],
  b: ['d', 'p'], d: ['b', 't'], p: ['b', 'q'], t: ['d'], m: ['n'], n: ['m'],
  s: ['z'], f: ['v'], sh: ['ch', 'th'], ch: ['sh', 'j'], th: ['sh', 'f'],
  ee: ['ea', 'ie'], ea: ['ee', 'ai'], ai: ['ay', 'ea'], ay: ['ai'],
  oa: ['ow', 'oo'], ow: ['oa', 'ou'], ar: ['or', 'er'], er: ['ir', 'ar'],
  or: ['ar', 'ur'], ir: ['er', 'ur'], ur: ['er', 'ir'],
};

export function decoyPhonemes(phonemes: string[], count: number): string[] {
  const inWord = new Set(phonemes.map(p => p.toLowerCase()));
  const decoys: string[] = [];
  const push = (d: string) => {
    if (!inWord.has(d) && !decoys.includes(d) && decoys.length < count) decoys.push(d);
  };
  // First pass: direct swaps of the word's own chunks (most confusable).
  for (const p of phonemes) {
    for (const d of SWAPS[p.toLowerCase()] ?? []) push(d);
  }
  // Backfill with common chunks if the word had no swappable pieces.
  for (const d of ['s', 'a', 't', 'm', 'e', 'sh', 'o']) push(d);
  return decoys;
}
