// lib/world/nightGarden.ts
//
// The Night Garden — what a moonflower is actually FOR.
//
// Cecily asked why she cannot put moonflowers in her bouquet. The easy
// answer was to add the moon quadrant to the vase's filter and move on.
// The true answer is better, and it is the reason this exists instead:
//
//   A MOONFLOWER IS OPEN FOR ONE NIGHT. It unfurls at dusk in about a
//   minute, and at sunrise it folds and never opens again. Cut one for
//   a vase and by breakfast you are holding a damp white rag.
//
// So the flower cannot come to her. She has to go to IT — and what it
// gives her is something a bouquet never could. Moonflowers are white
// and heavily scented for exactly one reason: they are advertising to
// night-flying moths, which is why they bother opening in the dark at
// all. Plant a moon garden and moths arrive. That is the payoff, and
// it is the plant's real biology rather than a rule invented for a
// game.
//
// It also closes a loop the app already opened. Luna's adventure has a
// moonflower opening in the dark, moths landing "like a soft grey
// snowfall", and a green moth circling a porch lantern. That story
// promised this garden. This is the garden it promised.
//
// THE CAP, in the house style: ONE new moth per night. The failure mode
// of this world is a child farming an easy loop for collectables, so
// the night garden pays for coming back on another night, never for
// staying longer tonight. Same shape as the cavern's one dig a day.

import { PLANT_CATALOG } from './plantCatalog';

/** Moon-quadrant plants, which are the ones that call the moths in. */
export function moonPlantCodes(): string[] {
  return PLANT_CATALOG.filter(p => p.garden === 'moon').map(p => p.code);
}

export interface NightGardenState {
  /** ISO date of the last night she was visited by a new moth. */
  lastVisit?: string;
  /** Species codes of moths that have come to the flowers. */
  mothsSeen: string[];
  /** Constellation codes she has picked out of the sky. */
  starsFound: string[];
}

export function emptyNightGarden(): NightGardenState {
  return { mothsSeen: [], starsFound: [] };
}

/**
 * The moths, in the order the garden sends them.
 *
 * Ordered deliberately rather than rolled at random: the pink-spotted
 * hawkmoth comes FIRST because it is the actual moonflower pollinator —
 * the insect the flower is shaped, coloured and scented for. Its tongue
 * is longer than its body, which is the whole explanation for why a
 * moonflower's throat is so deep. Getting that one first means the
 * first thing she learns is why any of this happens.
 *
 * Luna comes second, because the story already introduced her.
 */
export const NIGHT_MOTHS = [
  'pink_spotted_hawkmoth',
  'luna_moth',
  'white_lined_sphinx',
  'rosy_maple_moth',
  'polyphemus_moth',
] as const;

/** One new moth a night. The single most important rule in this file. */
export function canVisitTonight(state: { lastVisit?: string }, today: string): boolean {
  return state.lastVisit !== today;
}

/**
 * Which moth arrives tonight — always the next unseen one, in order, so
 * the pollinator is never skipped. Null once they have all come.
 */
export function mothForTonight(seen: string[]): string | null {
  return NIGHT_MOTHS.find(m => !seen.includes(m)) ?? null;
}

/**
 * Whether the night garden is open at all.
 *
 * Gated on a moon plant being IN BLOOM, not merely planted. A closed
 * bud advertises nothing, so an empty night sky would be the honest
 * result — and a child standing in a dark garden with nothing in it is
 * a dead end of the kind this project has shipped before. The moon
 * quadrant itself already opens at 2,000 correct answers, so reaching
 * here is real work.
 */
export function nightGardenOpen(
  bloomingPlantCodes: string[],
): boolean {
  const moon = new Set(moonPlantCodes());
  return bloomingPlantCodes.some(c => moon.has(c));
}

/* ─── the sky ─────────────────────────────────────────────────────── */

export interface Constellation {
  code: string;
  name: string;
  /** What she is actually looking for, in her own words. */
  lookFor: string;
  fact: string;
  /** Star positions in a 0–100 box, and the lines joining them. */
  stars: Array<{ x: number; y: number; mag: number }>;
  lines: Array<[number, number]>;
  /** Roughly when it is up, from a Kentucky back garden. */
  season: string;
}

/**
 * Five constellations a child in Louisville can genuinely find, with
 * the Big Dipper first because it is the one that teaches you to find
 * the others. Every position is the real shape, not a decorative
 * scatter — the pointer stars of the Dipper really do line up on
 * Polaris, and that is the trick worth owning.
 */
export const CONSTELLATIONS: Constellation[] = [
  {
    code: 'big_dipper',
    name: 'The Big Dipper',
    lookFor: 'A saucepan with a bent handle, high in the north.',
    fact: 'The two stars at the end of the pan point straight at Polaris, the North Star. Once you can find the Dipper you can always find north — which is how people navigated for thousands of years before anybody had a map.',
    season: 'All year round from Kentucky — it never sets.',
    // Dubhe, Merak, Phecda, Megrez close the bowl; Alioth, Mizar and
    // Alkaid sweep out as the handle. The first two are the POINTERS —
    // the bowl's outer edge, away from the handle — and the line
    // through them is what runs on to Polaris. Draw them anywhere else
    // and the fact printed beside them stops being true.
    stars: [
      { x: 14, y: 30, mag: 1 }, { x: 16, y: 55, mag: 2 }, { x: 40, y: 58, mag: 2 },
      { x: 38, y: 34, mag: 3 }, { x: 56, y: 30, mag: 2 }, { x: 72, y: 26, mag: 2 },
      { x: 90, y: 34, mag: 1 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]],
  },
  {
    code: 'cygnus',
    name: 'Cygnus, the Swan',
    lookFor: 'A big cross overhead in summer — a swan flying down the Milky Way.',
    fact: 'Its brightest star is Deneb, and it is one of the most distant stars you can see without a telescope. The light hitting your eye tonight left it before anyone you have ever heard of was born.',
    season: 'Summer and autumn, straight overhead.',
    stars: [
      { x: 50, y: 12, mag: 1 }, { x: 50, y: 34, mag: 3 }, { x: 50, y: 54, mag: 2 },
      { x: 50, y: 76, mag: 2 }, { x: 24, y: 46, mag: 2 }, { x: 76, y: 46, mag: 2 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [4, 2], [2, 5]],
  },
  {
    code: 'lyra',
    name: 'Lyra, the Harp',
    lookFor: 'One very bright star with a small squashed square hanging under it.',
    fact: 'The bright one is Vega. In about twelve thousand years Vega will be the North Star instead of Polaris, because the Earth wobbles like a slowing spinning top.',
    season: 'Summer, near Cygnus.',
    stars: [
      { x: 40, y: 20, mag: 1 }, { x: 52, y: 34, mag: 3 }, { x: 36, y: 42, mag: 3 },
      { x: 56, y: 60, mag: 3 }, { x: 38, y: 66, mag: 3 },
    ],
    lines: [[0, 1], [0, 2], [1, 3], [2, 4], [3, 4]],
  },
  {
    code: 'cassiopeia',
    name: 'Cassiopeia',
    lookFor: 'A big letter W in the north, sitting on its side half the year.',
    fact: 'It circles the North Star and never sets from Kentucky, so it spins slowly through the night — a W in the evening can be an M by morning.',
    season: 'All year, opposite the Big Dipper.',
    stars: [
      { x: 14, y: 40, mag: 2 }, { x: 32, y: 62, mag: 2 }, { x: 50, y: 38, mag: 2 },
      { x: 68, y: 60, mag: 2 }, { x: 86, y: 36, mag: 2 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  {
    code: 'orion',
    name: 'Orion',
    lookFor: 'Three bright stars in a short straight row — the belt. Nothing else in the sky looks like it.',
    fact: 'The reddish star at his shoulder is Betelgeuse, and it is so enormous that if it sat where our Sun is, it would swallow the Earth. It will explode one day, though probably not this week.',
    season: 'Winter evenings, in the south.',
    stars: [
      { x: 30, y: 14, mag: 1 }, { x: 70, y: 18, mag: 2 },
      { x: 42, y: 46, mag: 2 }, { x: 50, y: 48, mag: 2 }, { x: 58, y: 50, mag: 2 },
      { x: 34, y: 82, mag: 2 }, { x: 68, y: 84, mag: 1 },
    ],
    lines: [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]],
  },
];

export function getConstellation(code: string): Constellation | undefined {
  return CONSTELLATIONS.find(c => c.code === code);
}
