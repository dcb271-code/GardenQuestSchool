// lib/level0/words.ts
//
// Every sentence a Level-0 child hears. She cannot read, so each of
// these is spoken by the narrator — they are written to be SAID, in
// short plain American English, and nothing here assumes a screen.
// Spec: docs/superpowers/specs/2026-09-26-level-zero-spec.md

import { countingWords, numberWord } from './ladybug';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** A lesson route was asked for by a Level-0 learner. Refused, in words. */
export const LEVEL_ZERO_NO_LESSON =
  'This lesson is for later. Your games are on the garden map — look for the ladybugs and the bunny.';

/* ── the Ladybug Count ───────────────────────────────────────────── */

export const LADYBUG = {
  /** The map invitation, for a screen reader or a grown-up. */
  invitation: 'ladybugs on a leaf — come and count them',

  askCount: 'How many ladybugs? Tap each one.',
  askSubitize: 'How many ladybugs? Do not count — just look. Tap the number.',
  askNumeral: (n: number) => `Tap the ${numberWord(n)}.`,

  /** After the last ladybug flies, in count mode. */
  counted: (n: number) => `${cap(numberWord(n))}! Now tap the ${numberWord(n)}.`,

  /** A wrong numeral. COMPUTED from the leaf: what she tapped, then
   *  the count said out loud, then the ask again. Never canned. */
  wrong: (chosen: number, n: number) =>
    `That is the ${numberWord(chosen)}. Let us count: ${countingWords(n)}. ` +
    `${cap(numberWord(n))}! Tap the ${numberWord(n)}.`,

  right: (n: number) => `Yes! ${cap(numberWord(n))}.`,

  /** The server did not accept the leaf. In words, because it is read aloud. */
  refused: 'That leaf did not match the one the garden grew. Here is a fresh one.',

  another: 'another leaf',
  back: 'back to the garden',
};

/* ── Bunny's Basket ──────────────────────────────────────────────── */

export const BASKET = {
  invitation: 'the bunny with two baskets — which has more?',

  askMore: 'Which basket has more carrots? Tap it.',

  /** A wrong basket. COMPUTED: both counts said, the bigger named. */
  wrongMore: (chosen: number, other: number) =>
    `This basket has ${numberWord(chosen)}. That basket has ${numberWord(other)}. ` +
    `${cap(numberWord(other))} is more. Tap the basket with more.`,

  rightMore: (n: number) => `Yes! ${cap(numberWord(n))} is more. Crunch!`,

  /** After the bunny eats one from the fuller basket. */
  askOneMore: (from: number) =>
    `Now it has ${numberWord(from)}. Put one more carrot in. Tap the basket.`,

  oneMoreIn: (from: number) =>
    `${cap(numberWord(from))}… and one more is ${numberWord(from + 1)}. Tap the ${numberWord(from + 1)}.`,

  wrongNumeral: (chosen: number, n: number) =>
    `That is the ${numberWord(chosen)}. Let us count the carrots: ${countingWords(n)}. ` +
    `${cap(numberWord(n))}! Tap the ${numberWord(n)}.`,

  right: (n: number) => `Yes! ${cap(numberWord(n))}.`,

  refused: 'Those baskets did not match the ones the bunny brought. Here are fresh ones.',
  another: 'more carrots',
  back: 'back to the garden',
};
