// lib/packs/reading/digraphSort.ts
//
// How a DigraphSort item is presented. Two problems the owner spotted
// (2026-10-07):
//
//  1. Each round's words arrived in the SAME order as the buckets
//     (ch-word, sh-word, th-word under ch, sh, th), so the answer was
//     the layout.
//  2. The word was printed on the card, so "which bucket?" was letter
//     matching — find "sh" inside "ship" — not phonics.
//
// So: the pool is shuffled, never in bucket order; and for sorts whose
// letter pairs make DIFFERENT SOUNDS, the word is hidden — she sees the
// picture, taps to hear it, and sorts by what she hears. That is the
// skill: hearing /sh/ and knowing it is spelled s-h.
//
// The vowel-team sorts (ee/ea, ai/ay, oa/ow) also use this renderer,
// but those pairs sound IDENTICAL — "feet" and "meat" cannot be sorted
// by ear. They are spelling-pattern sorts and keep the word visible.

/** Letter pairs whose sounds differ from each other within a sort. */
const SOUND_DISTINCT = new Set(['ch', 'sh', 'th', 'wh', 'ph', 'ck', 'ng']);

/**
 * Sort by ear? Only when every bucket is a sound-distinct digraph and
 * every word has a picture to show in place of the word.
 */
export function isListeningSort(content: {
  digraphs: string[];
  words: Array<{ word?: string; digraph?: string; emoji?: string }>;
}): boolean {
  return content.digraphs.length > 1
    && content.digraphs.every(d => SOUND_DISTINCT.has(d))
    && content.words.length > 0
    && content.words.every(w => !!w.emoji);
}

/** Small string hash — the shuffle must match on server and client. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * The pool order: a stable shuffle keyed on the item's words (so a
 * server render and the client agree), and never the bucket order —
 * if the shuffle lands there, rotate by one.
 */
export function poolOrder<T extends { word: string; digraph: string }>(
  words: T[], digraphs: string[],
): T[] {
  const out = [...words];
  let seed = hash(words.map(w => w.word).join('|'));
  for (let i = out.length - 1; i > 0; i--) {
    seed = Math.imul(seed ^ (seed >>> 15), 2246822507) >>> 0;
    const j = seed % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  const inBucketOrder = (xs: T[]) =>
    xs.length === digraphs.length && xs.every((w, i) => w.digraph === digraphs[i]);
  if (out.length > 1 && inBucketOrder(out)) out.push(out.shift()!);
  return out;
}
