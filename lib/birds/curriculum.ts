// lib/birds/curriculum.ts
//
// Units and generated exercises for the bird curriculum.
//
// Shape follows lib/music/curriculum.ts — a typed config array plus a
// seeded generator — because that pattern has now survived two
// subjects: content is cheap to add, questions can't be memorised by
// position, and the generator is testable against the catalog.
//
// The ordering inside a unit is Cornell's Four Keys, and it is not
// arbitrary:  size & shape  →  colour  →  behaviour & habitat  →  the
// fine marks. Their instruction is explicit that field marks matter
// "after you've placed your bird in the right group", and a beginner
// who jumps straight to marks ends up memorising spots without ever
// learning to see a bird.
//
// Photo exercises carry a {birdCode, role} REFERENCE, not a URL. The
// server resolves them against bird_photo at request time, so a bird
// whose photos haven't been curated yet simply produces fewer
// exercises rather than a broken screen.

import {
  BIRD_CATALOG, birdsOfCrew, crewCodes, getBird, sizeComparison,
  BILL_HINT, ANCHOR_INCHES,
  type BirdData, type SizeAnchor, type BillShape,
} from '@/lib/world/birdCatalog';

export type Stage = 'look' | 'know' | 'listen' | 'match';

export const STAGE_LABEL: Record<Stage, string> = {
  look: 'who is it?',
  know: 'how it lives',
  listen: 'what it says',
  match: 'name that tune',
};

export const STAGE_EMOJI: Record<Stage, string> = {
  look: '👀', know: '📖', listen: '👂', match: '🎯',
};

export type BirdPhotoRole =
  | 'perched' | 'flight' | 'male' | 'female' | 'nonbreeding'
  | 'juvenile' | 'head' | 'back' | 'silhouette';

/** Resolved server-side against the bird_photo table. */
export interface BirdPhotoRef {
  birdCode: string;
  role: BirdPhotoRole;
}

export interface TeachPage {
  heading: string;
  body: string;
  figure?:
    | { kind: 'size_ladder'; highlight?: SizeAnchor }
    | { kind: 'bills'; highlight?: BillShape }
    | { kind: 'photo'; ref: BirdPhotoRef }
    | { kind: 'marks'; birdCode: string }
    | { kind: 'four_keys' };
}

export interface BirdUnit {
  code: string;
  title: string;
  crew: string;
  stage: Stage;
  blurb: string;
  teach: TeachPage[];
  birdCodes: string[];
  exerciseCount: number;
  outro: string;
}

export type BirdExercise =
  // ── shape first ──────────────────────────────────────────────
  | { kind: 'size_anchor'; prompt: string; birdCode: string;
      choices: string[]; correctIndex: number; hint: string }
  | { kind: 'bill_face'; prompt: string; birdCode: string;
      choices: string[]; correctIndex: number; hint: string }
  // ── then colour and name ─────────────────────────────────────
  | { kind: 'photo_name'; prompt: string; photo: BirdPhotoRef;
      choices: string[]; correctIndex: number; hint: string }
  | { kind: 'name_photo'; prompt: string; birdCode: string;
      photos: BirdPhotoRef[]; correctIndex: number; hint: string }
  // ── then behaviour and habitat ───────────────────────────────
  | { kind: 'behaviour'; prompt: string; birdCode: string;
      choices: string[]; correctIndex: number; hint: string }
  | { kind: 'habitat'; prompt: string; birdCode: string;
      choices: string[]; correctIndex: number; hint: string }
  // ── and only then the fine marks ─────────────────────────────
  | { kind: 'field_mark'; prompt: string; photo: BirdPhotoRef;
      choices: string[]; correctIndex: number; hint: string }
  | { kind: 'true_false'; prompt: string; birdCode: string;
      answer: boolean; hint: string };

// ── seeded helpers (same private shape as the other subjects) ────

function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;  s >>>= 0;
    return s / 4294967296;
  };
}

function pick<T>(arr: readonly T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function shuffle<T>(arr: readonly T[], rand: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Build a multiple choice.
 *
 * Deduplicates the distractor pool and drops anything equal to the
 * correct answer. Both matter: two birds in a crew can honestly share
 * a habitat ("shady yards" belongs to the titmouse AND the nuthatch),
 * and offering it twice would put two correct answers on screen.
 */
function mc(
  correct: string, wrong: string[], rand: () => number, count: number,
): { choices: string[]; correctIndex: number } {
  const pool = Array.from(new Set(wrong)).filter(w => w !== correct);
  const distractors = shuffle(pool, rand).slice(0, Math.max(0, count - 1));
  const choices = shuffle([correct, ...distractors], rand);
  return { choices, correctIndex: choices.indexOf(correct) };
}

/**
 * How many choices this exercise offers.
 *
 * Ramps 2 → 3 → 4 across a unit. Two is not a token difficulty — for a
 * first meeting it's the difference between a guess she can reason
 * about and a wall of four unfamiliar names.
 */
export function choiceCount(index: number, total: number): number {
  if (total <= 2) return 2;
  const third = total / 3;
  if (index < third) return 2;
  if (index < third * 2) return 3;
  return 4;
}

/** Distractors, hardest-first: confusable birds before random ones. */
function otherBirds(bird: BirdData, pool: BirdData[]): BirdData[] {
  const confusable = (bird.confusableWith ?? [])
    .map(getBird)
    .filter((b): b is BirdData => !!b && b.code !== bird.code);
  const rest = pool.filter(
    b => b.code !== bird.code && !confusable.some(c => c.code === b.code),
  );
  return [...confusable, ...rest];
}

// ── the generator ────────────────────────────────────────────────

function lookExercise(
  bird: BirdData, pool: BirdData[], rand: () => number, n: number,
): BirdExercise | null {
  const others = otherBirds(bird, pool);
  const roll = rand();

  // Size — the first of Cornell's keys.
  if (roll < 0.2) {
    const correct = sizeComparison(bird);
    const anchors: SizeAnchor[] = ['sparrow', 'robin', 'crow'];
    const wrong = anchors
      .flatMap(a => [`smaller than a ${a}`, `about the size of a ${a}`, `bigger than a ${a}`])
      .filter(s => s !== correct);
    const { choices, correctIndex } = mc(correct, wrong, rand, n);
    return {
      kind: 'size_anchor',
      prompt: `How big is the ${bird.commonName}?`,
      birdCode: bird.code,
      choices, correctIndex,
      hint: `A ${bird.commonName} is about ${bird.lengthInches} inches long, and a ${bird.sizeAnchor} is about ${ANCHOR_INCHES[bird.sizeAnchor]}.`,
    };
  }

  // Bill and face — Sibley's version of shape, and the one a child can see.
  if (roll < 0.4) {
    const correct = BILL_HINT[bird.bill];
    const wrong = Object.entries(BILL_HINT)
      .filter(([k]) => k !== bird.bill)
      .map(([, v]) => v);
    const { choices, correctIndex } = mc(correct, wrong, rand, n);
    return {
      kind: 'bill_face',
      prompt: `What kind of bill does the ${bird.commonName} have?`,
      birdCode: bird.code,
      choices, correctIndex,
      hint: `Look at what it eats. ${bird.colourHook}`,
    };
  }

  // Name the photo.
  if (roll < 0.75) {
    const { choices, correctIndex } = mc(
      bird.commonName, others.map(b => b.commonName), rand, n,
    );
    return {
      kind: 'photo_name',
      prompt: 'Which bird is this?',
      photo: { birdCode: bird.code, role: bird.dimorphic ? pickSexRole(rand) : 'perched' },
      choices, correctIndex,
      hint: bird.fieldMarks[0] ? `Look for ${bird.fieldMarks[0]}.` : bird.colourHook,
    };
  }

  // Find the bird by name — harder, because it needs recall not recognition.
  const wrongBirds = shuffle(others, rand).slice(0, Math.max(0, n - 1));
  const photos: BirdPhotoRef[] = shuffle(
    [bird, ...wrongBirds].map(b => ({
      birdCode: b.code, role: 'perched' as BirdPhotoRole,
    })),
    rand,
  );
  return {
    kind: 'name_photo',
    prompt: `Which one is the ${bird.commonName}?`,
    birdCode: bird.code,
    photos,
    correctIndex: photos.findIndex(p => p.birdCode === bird.code),
    hint: bird.fieldMarks[0] ? `Look for ${bird.fieldMarks[0]}.` : bird.colourHook,
  };
}

function pickSexRole(rand: () => number): BirdPhotoRole {
  return rand() < 0.5 ? 'male' : 'female';
}

function knowExercise(
  bird: BirdData, pool: BirdData[], rand: () => number, n: number,
): BirdExercise | null {
  const others = otherBirds(bird, pool);
  const roll = rand();

  if (roll < 0.4 && bird.behaviour.length) {
    const correct = pick(bird.behaviour, rand);
    // Filter against THIS bird's whole list, not just the chosen line:
    // two birds in a crew can honestly share a behaviour, and offering
    // it as the wrong answer would mark a right answer wrong.
    const wrong = others
      .flatMap(b => b.behaviour)
      .filter(x => !bird.behaviour.includes(x));
    const { choices, correctIndex } = mc(correct, wrong, rand, n);
    return {
      kind: 'behaviour',
      prompt: `Which of these does the ${bird.commonName} do?`,
      birdCode: bird.code,
      choices, correctIndex,
      hint: bird.facts[0] ?? bird.colourHook,
    };
  }

  if (roll < 0.7 && bird.habitat.length) {
    const correct = pick(bird.habitat, rand);
    const wrong = others.flatMap(b => b.habitat).filter(h => !bird.habitat.includes(h));
    const { choices, correctIndex } = mc(correct, wrong, rand, n);
    return {
      kind: 'habitat',
      prompt: `Where would you look for a ${bird.commonName}?`,
      birdCode: bird.code,
      choices, correctIndex,
      hint: bird.colourHook,
    };
  }

  // True/false, drawn from real field marks — half the time about a
  // DIFFERENT bird's mark, which is what makes it worth asking.
  const askAboutSelf = rand() < 0.5 || others.length === 0;
  if (askAboutSelf && bird.fieldMarks.length) {
    return {
      kind: 'true_false',
      prompt: `True or false — the ${bird.commonName} has ${bird.fieldMarks[0]}.`,
      birdCode: bird.code,
      answer: true,
      hint: bird.colourHook,
    };
  }
  const other = pick(others, rand);
  // Only borrow a mark that is genuinely NOT true of this bird —
  // otherwise the "false" answer is actually true.
  const borrowable = other.fieldMarks.filter(m => !bird.fieldMarks.includes(m));
  const borrowed = borrowable[0];
  if (!borrowed) return null;
  return {
    kind: 'true_false',
    prompt: `True or false — the ${bird.commonName} has ${borrowed}.`,
    birdCode: bird.code,
    answer: false,
    hint: `That belongs to the ${other.commonName}. ${bird.colourHook}`,
  };
}

export function buildExercises(unit: BirdUnit, seed: number): BirdExercise[] {
  const rand = rng(seed);
  const pool = unit.birdCodes
    .map(getBird)
    .filter((b): b is BirdData => !!b);
  if (pool.length === 0) return [];

  const out: BirdExercise[] = [];
  // Walk the birds in rotation so every bird in the crew gets asked
  // about before any bird is asked about twice.
  const order = shuffle(pool, rand);
  for (let i = 0; i < unit.exerciseCount; i++) {
    const bird = order[i % order.length];
    const n = Math.min(choiceCount(i, unit.exerciseCount), pool.length);
    const ex = unit.stage === 'look'
      ? lookExercise(bird, pool, rand, n)
      : knowExercise(bird, pool, rand, n);
    if (ex) out.push(ex);
  }
  return out;
}

// ── the units ────────────────────────────────────────────────────

const FOUR_KEYS_PAGE: TeachPage = {
  heading: 'Four things to look at',
  body:
    'Birders look at four things, always in the same order. First how BIG it is and what SHAPE — especially the bill and the face. Then the COLOUR pattern. Then what it is DOING. Then WHERE it is. The little spots and stripes come last, once you already know roughly what kind of bird it is.',
  figure: { kind: 'four_keys' },
};

const SIZE_PAGE: TeachPage = {
  heading: 'The measuring stick',
  body:
    'Every bird gets measured against three you already know. Sparrow-sized, robin-sized, or crow-sized. When you see a new bird, that is the very first question: which of the three is it closest to?',
  figure: { kind: 'size_ladder' },
};

const BILL_PAGE: TeachPage = {
  heading: 'The bill tells you what it eats',
  body:
    'A fat cone bill cracks seeds. A straight chisel drills wood. Fine tweezers pick insects out of cracks. Before you look at a single colour, look at the bill — it puts the bird in the right family straight away.',
  figure: { kind: 'bills' },
};

export const UNITS: BirdUnit[] = [
  {
    code: 'crew1_look',
    title: 'Meet the Everyday Five',
    crew: 'crew1',
    stage: 'look',
    blurb: 'The five birds you can see from the window almost any day.',
    teach: [
      FOUR_KEYS_PAGE,
      SIZE_PAGE,
      BILL_PAGE,
      {
        heading: 'The cardinal is yours',
        body:
          'The Northern Cardinal is the state bird of Kentucky. Schoolchildren campaigned for it and the state agreed in 1926. The male is scarlet with a black mask. The female is warm brown — but look at her crest and her heavy orange bill and you will see she is the same bird in different colours.',
        figure: { kind: 'marks', birdCode: 'northern_cardinal' },
      },
      {
        heading: 'Blue, and not really blue',
        body:
          'The Blue Jay has no blue paint in it at all. The feather is built so that when light hits it, only blue bounces back to your eye. Crush the feather and the blue disappears completely.',
        figure: { kind: 'photo', ref: { birdCode: 'blue_jay', role: 'perched' } },
      },
      {
        heading: 'The little one with the black cap',
        body:
          'The Carolina Chickadee is tiny — smaller than a sparrow. Black cap, black bib, and a bright white cheek squeezed between the two. Watch the feeder: it takes exactly one seed, flies off to eat it, and comes straight back.',
        figure: { kind: 'marks', birdCode: 'carolina_chickadee' },
      },
    ],
    birdCodes: ['northern_cardinal', 'blue_jay', 'mourning_dove', 'carolina_chickadee', 'american_robin'],
    exerciseCount: 9,
    outro: 'Five birds. Now look out of a window — one of them is probably there right now.',
  },
  {
    code: 'crew1_know',
    title: 'How the Everyday Five Live',
    crew: 'crew1',
    stage: 'know',
    blurb: 'What they eat, where they go, and the strange things they do.',
    teach: [
      {
        heading: 'Watch what it is doing',
        body:
          'Behaviour identifies a bird as surely as colour does. A robin runs, stops dead, tilts its head, then pulls. A dove walks on the ground and almost never lands on the feeder. A chickadee grabs one seed and leaves. You can name all three with your eyes half shut.',
        figure: { kind: 'four_keys' },
      },
      {
        heading: 'The head tilt',
        body:
          'When a robin stops and tilts its head on the lawn, it is aiming ONE eye at the ground. Its eyes are on the sides of its head, so it cannot look straight down with both at once. Then it pulls the worm up.',
        figure: { kind: 'photo', ref: { birdCode: 'american_robin', role: 'perched' } },
      },
      {
        heading: 'Counting the dees',
        body:
          'The chickadee is saying its own name — chick-a-DEE-DEE-DEE. It is an alarm call, and the number of dees tells the other birds how much danger there is. More dees means a more dangerous animal nearby. Next time you hear it, count.',
      },
    ],
    birdCodes: ['northern_cardinal', 'blue_jay', 'mourning_dove', 'carolina_chickadee', 'american_robin'],
    exerciseCount: 7,
    outro: 'Knowing what a bird does is knowing the bird.',
  },
  {
    code: 'crew2_look',
    title: 'Meet the Little Gang',
    crew: 'crew2',
    stage: 'look',
    blurb: 'Five small birds — and in winter they all travel together.',
    teach: [
      {
        heading: 'They come as a gang',
        body:
          'In winter, chickadees, titmice and nuthatches move through the trees together in one loose flock. More birds means more eyes watching for hawks. If you find one of them, look around — the others are usually close by.',
      },
      {
        heading: 'Crest, or no crest?',
        body:
          'The Tufted Titmouse and the White-breasted Nuthatch are both small and grey and white. The titmouse has a pointed CREST and a big dark eye. The nuthatch has a smooth black cap and almost no tail — and it walks head-first DOWN the tree trunk, which nothing else in the yard does.',
        figure: { kind: 'marks', birdCode: 'white_breasted_nuthatch' },
      },
      {
        heading: 'The loudest small bird',
        body:
          'The Carolina Wren weighs about as much as four paperclips. Rusty brown, a bold white eyebrow, and a tail cocked straight up. It has one of the loudest voices in the whole yard, and it is the one bird here that sings all year round.',
        figure: { kind: 'marks', birdCode: 'carolina_wren' },
      },
      {
        heading: 'The same bird, twice',
        body:
          'In summer the American Goldfinch is brilliant lemon yellow with a black cap. In winter the very same bird is a drab olive-buff. People are sure they are two different birds. Look at the black wings with white bars — those stay the same all year.',
        figure: { kind: 'photo', ref: { birdCode: 'american_goldfinch', role: 'male' } },
      },
    ],
    birdCodes: ['tufted_titmouse', 'white_breasted_nuthatch', 'carolina_wren', 'american_goldfinch', 'house_finch'],
    exerciseCount: 9,
    outro: 'Ten birds now. That is more than most grown-ups can name.',
  },
  {
    code: 'crew2_know',
    title: 'How the Little Gang Lives',
    crew: 'crew2',
    stage: 'know',
    blurb: 'Fur thieves, upside-down walkers, and a finch that came from a pet shop.',
    teach: [
      {
        heading: 'Upside down on purpose',
        body:
          'The nuthatch goes DOWN the tree head-first. Every other bird climbs up. Going down means it spots insects tucked into the bark that all the upward-climbing birds walked straight past — it is finding food nobody else can reach.',
        figure: { kind: 'photo', ref: { birdCode: 'white_breasted_nuthatch', role: 'perched' } },
      },
      {
        heading: 'The fur thief',
        body:
          'The Tufted Titmouse lines its nest with fur — and it takes the fur off living animals. Squirrels, dogs, and sometimes people. It lands, pulls out a beakful, and flies off before anyone can object.',
      },
      {
        heading: 'The finch that escaped',
        body:
          'House Finches are not really eastern birds. Pet shops in New York sold them illegally as "Hollywood Finches". In 1940 the sellers let them go to avoid being arrested, and those escaped birds spread across the whole eastern half of the country. They reached Kentucky in the late 1970s.',
        figure: { kind: 'photo', ref: { birdCode: 'house_finch', role: 'male' } },
      },
    ],
    birdCodes: ['tufted_titmouse', 'white_breasted_nuthatch', 'carolina_wren', 'american_goldfinch', 'house_finch'],
    exerciseCount: 7,
    outro: 'Every one of these is out there today, doing exactly this.',
  },
];

export function getUnit(code: string): BirdUnit | undefined {
  return UNITS.find(u => u.code === code);
}

export function unitsOfCrew(crew: string): BirdUnit[] {
  return UNITS.filter(u => u.crew === crew);
}

/**
 * Strictly sequential, unlike music.
 *
 * Music unlocks per strand so she can follow whatever her teacher set
 * this week. Birds are the opposite: the request was explicitly see
 * them, then learn them, then hear them, then match — and the stages
 * genuinely depend on each other. You cannot match a song to a photo
 * of a bird you cannot yet recognise.
 */
export function isUnitUnlocked(code: string, completed: string[]): boolean {
  const idx = UNITS.findIndex(u => u.code === code);
  if (idx <= 0) return idx === 0;
  return completed.includes(UNITS[idx - 1].code);
}

export function nextUnit(completed: string[]): BirdUnit | undefined {
  return UNITS.find(u => !completed.includes(u.code));
}

/** Birds she has been taught — drives the journal and, later, the garden. */
export function birdsLearned(completed: string[]): string[] {
  const codes = new Set<string>();
  for (const u of UNITS) {
    if (completed.includes(u.code)) u.birdCodes.forEach(c => codes.add(c));
  }
  return BIRD_CATALOG.filter(b => codes.has(b.code)).map(b => b.code);
}

export { BIRD_CATALOG, birdsOfCrew, crewCodes, getBird };
