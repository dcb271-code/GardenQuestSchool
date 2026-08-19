// lib/gems/curriculum.ts
//
// The gem curriculum — the learning half of Cecily's Crystal Cavern
// commission, in the bird module's shape: one-pass units, teach pages
// first, exercises generated ENTIRELY from GEM_CATALOG with a seeded
// generator, so no question can drift from the catalog it teaches.
//
// Spec: docs/superpowers/specs/2026-08-18-gem-curriculum-spec.md.
// Four seam units now; the case crew (ruby and sapphire being the
// same mineral, diamond the unscratchable king) is phase two.

import {
  GEM_CATALOG, HARDNESS_TESTS, KENTUCKY_MIXUP, getGem,
  type GemData,
} from '@/lib/world/gemCatalog';

/* ── teach pages ────────────────────────────────────────────────── */

export interface GemTeachPage {
  heading: string;
  body: string;
  figure?:
    /** One stone, drawn in its real crystal habit. */
    | { kind: 'specimen'; gemCode: string }
    /** The scratch ladder: household objects with their hardness. */
    | { kind: 'hardness_ladder' }
    /** A row of stones side by side, for comparing. */
    | { kind: 'shelf'; gemCodes: string[] };
}

export type GemExerciseKind =
  | 'kind_sort'      // rock, mineral, or once alive?
  | 'harder_which'   // two stones — which is harder?
  | 'scratch_test'   // will this object leave a mark on that stone?
  | 'origin_match'   // which stone was made this way?
  | 'shape_spot'     // which stone grows in this shape?
  | 'story';         // which stone is this true thing about?

/**
 * One uniform shape — every exercise is a prompt, choices, and one
 * right answer, with a hint that TEACHES rather than scolds. Kept
 * deliberately simpler than the birds' union type: gems neither sing
 * nor fly away.
 */
export interface GemExercise {
  kind: GemExerciseKind;
  prompt: string;
  /** When one stone is the subject, its specimen is drawn. */
  gemCode?: string;
  choices: string[];
  correctIndex: number;
  hint: string;
}

export interface GemUnit {
  code: string;
  title: string;
  blurb: string;
  /**
   * Units that must be passed before this one opens. The case crew
   * builds on the seam crew — the scratch test has to exist in her
   * hands before "only a diamond scratches a ruby" means anything.
   */
  requiresUnits?: string[];
  teach: GemTeachPage[];
  /** The stones this unit may ask about. */
  gemCodes: string[];
  /** Which generators this unit draws from, in rotation. */
  exerciseKinds: GemExerciseKind[];
  exerciseCount: number;
  outro: string;
  /**
   * Finishing this unit pays this stone into the cavern's pending
   * pile — ONCE, ever. The reward is the unit's own subject, so the
   * case can complete through study as well as luck.
   */
  rewardStone: string;
}

/* ── seeded helpers (same private shape as the other subjects) ──── */

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

function pickOthers(
  pool: GemData[], not: GemData, n: number, rand: () => number,
  reject?: (g: GemData) => boolean,
): GemData[] {
  return shuffle(pool.filter(g => g.code !== not.code && !(reject?.(g))), rand).slice(0, n);
}

/** Insert the right answer among distractors at a random slot. */
function assemble(
  correct: string, others: string[], rand: () => number,
): { choices: string[]; correctIndex: number } {
  const i = Math.floor(rand() * (others.length + 1));
  const choices = [...others];
  choices.splice(i, 0, correct);
  return { choices, correctIndex: i };
}

/* ── generators — everything reads the catalog ──────────────────── */

const KIND_LABELS: Record<GemData['kind'], string> = {
  rock: 'a rock — a mix of stuff pressed together',
  mineral: 'a mineral — one recipe, grown as a crystal',
  organic: 'once alive — a living thing made it',
};

function kindSort(gem: GemData, rand: () => number): GemExercise {
  const all = Object.values(KIND_LABELS);
  const correct = KIND_LABELS[gem.kind];
  return {
    kind: 'kind_sort',
    prompt: `${gem.name}: rock, mineral, or once alive?`,
    gemCode: gem.code,
    choices: shuffle(all, rand),
    correctIndex: -1, // fixed below
    hint: gem.formationStory,
  };
}

function harderWhich(gem: GemData, pool: GemData[], rand: () => number): GemExercise | null {
  // A fair contest needs a real gap — a child cannot be marked wrong
  // over half a Mohs point.
  const rivals = pool.filter(g => g.code !== gem.code && Math.abs(g.mohs - gem.mohs) >= 1.5);
  if (rivals.length === 0) return null;
  const rival = rivals[Math.floor(rand() * rivals.length)];
  const winner = gem.mohs > rival.mohs ? gem : rival;
  const pair = shuffle([gem.name, rival.name], rand);
  return {
    kind: 'harder_which',
    prompt: `Which is harder — ${pair[0]} or ${pair[1]}?`,
    gemCode: winner.code,
    choices: pair,
    correctIndex: pair.indexOf(winner.name),
    hint: `${winner.name} is hardness ${winner.mohs}. ${(winner === gem ? rival : gem).name} is ${(winner === gem ? rival : gem).mohs}. Bigger number wins the scratch.`,
  };
}

function scratchTest(gem: GemData, rand: () => number): GemExercise | null {
  // Only ask where the answer is clean — at least a full point of gap.
  const tools = HARDNESS_TESTS.filter(t => Math.abs(t.mohs - gem.mohs) >= 1);
  if (tools.length === 0) return null;
  const tool = tools[Math.floor(rand() * tools.length)];
  const marks = tool.mohs > gem.mohs;
  const yes = 'yes — it leaves a scratch';
  const no = 'no — it slides right off';
  const { choices, correctIndex } = assemble(marks ? yes : no, [marks ? no : yes], rand);
  return {
    kind: 'scratch_test',
    prompt: `You drag ${tool.thing} across a piece of ${gem.name.toLowerCase()}. Does it scratch?`,
    gemCode: gem.code,
    choices,
    correctIndex,
    hint: `${tool.thing[0].toUpperCase()}${tool.thing.slice(1)} is about hardness ${tool.mohs}, and ${gem.name.toLowerCase()} is ${gem.mohs}. The harder one always wins.`,
  };
}

const ORIGIN_PHRASES: Record<GemData['formedBy'], string> = {
  hydrothermal: 'grew out of hot water pushing up through cracks in the rock',
  sedimentary: 'was pressed together in layers, over a very long time',
  igneous: 'was made deep down, in tremendous heat',
  metamorphic: 'was changed into itself by heat and squeezing',
  biological: 'was made by a living creature',
};

function originMatch(gem: GemData, pool: GemData[], rand: () => number): GemExercise | null {
  const others = pickOthers(pool, gem, 2, rand, g => g.formedBy === gem.formedBy);
  if (others.length < 2) return null;
  const { choices, correctIndex } = assemble(gem.name, others.map(g => g.name), rand);
  return {
    kind: 'origin_match',
    prompt: `Which of these ${ORIGIN_PHRASES[gem.formedBy]}?`,
    gemCode: gem.code,
    choices,
    correctIndex,
    hint: gem.formationStory,
  };
}

function shapeSpot(gem: GemData, pool: GemData[], rand: () => number): GemExercise | null {
  if (gem.crystalShape.startsWith('none')) return null;
  // Distractors must not share the shape — fluorite and galena both
  // grow cubes, and a question with two right answers is a lie.
  const shapeWord = gem.crystalShape.split(/[ —]/)[0];
  const others = pickOthers(pool, gem, 2, rand, g => g.crystalShape.includes(shapeWord));
  if (others.length < 2) return null;
  const { choices, correctIndex } = assemble(gem.name, others.map(g => g.name), rand);
  return {
    kind: 'shape_spot',
    prompt: `Which stone grows as ${gem.crystalShape.replace(/ —.*$/, '')}${gem.crystalShape.includes('—') ? '' : 's'}, with nobody cutting it?`,
    gemCode: gem.code,
    choices,
    correctIndex,
    hint: `Look in your display case — the drawing shows the shape it really grows in.`,
  };
}

function story(gem: GemData, pool: GemData[], rand: () => number): GemExercise | null {
  // A fact that names its own stone answers itself.
  const tellable = gem.facts.filter(f => !f.toLowerCase().includes(gem.name.toLowerCase()));
  if (tellable.length === 0) return null;
  const fact = tellable[Math.floor(rand() * tellable.length)];
  const others = pickOthers(pool, gem, 2, rand);
  if (others.length < 2) return null;
  const { choices, correctIndex } = assemble(gem.name, others.map(g => g.name), rand);
  return {
    kind: 'story',
    prompt: `Which stone is this about? "${fact}"`,
    choices,
    correctIndex,
    hint: gem.formationStory,
  };
}

/* ── building a unit's exercises ────────────────────────────────── */

export function buildExercises(unit: GemUnit, seed: number): GemExercise[] {
  const rand = rng(seed);
  const pool = unit.gemCodes
    .map(getGem)
    .filter((g): g is GemData => !!g);
  if (pool.length === 0) return [];

  const out: GemExercise[] = [];
  const order = shuffle(pool, rand);
  let gi = 0, ki = 0, safety = 0;
  while (out.length < unit.exerciseCount && safety < unit.exerciseCount * 12) {
    safety++;
    const gem = order[gi % order.length]; gi++;
    const kind = unit.exerciseKinds[ki % unit.exerciseKinds.length]; ki++;
    let ex: GemExercise | null = null;
    if (kind === 'kind_sort') {
      ex = kindSort(gem, rand);
      ex.correctIndex = ex.choices.indexOf(KIND_LABELS[gem.kind]);
    } else if (kind === 'harder_which') {
      ex = harderWhich(gem, pool, rand);
    } else if (kind === 'scratch_test') {
      ex = scratchTest(gem, rand);
    } else if (kind === 'origin_match') {
      ex = originMatch(gem, pool, rand);
    } else if (kind === 'shape_spot') {
      ex = shapeSpot(gem, pool, rand);
    } else {
      ex = story(gem, pool, rand);
    }
    // No two identical prompts in one run — a rerun reads as a glitch.
    if (ex && !out.some(o => o.prompt === ex!.prompt)) out.push(ex);
  }
  return out;
}

/* ── the units ──────────────────────────────────────────────────── */

const SEAM_CODES = [
  'kentucky_agate', 'fluorite', 'geode', 'coal',
  'quartz', 'calcite', 'galena', 'freshwater_pearl',
];

export const GEM_UNITS: GemUnit[] = [
  {
    code: 'gem_rock_mineral',
    title: 'Rock, Mineral, or Once Alive?',
    blurb: 'The state got its own rocks backwards for 24 years. You will not.',
    teach: [
      {
        heading: 'The mix-up',
        body:
          `In ${KENTUCKY_MIXUP.wrongFrom}, Kentucky named coal its state MINERAL. Then it named agate its state ROCK. Both labels were backwards — and they stayed backwards for about twenty-four years, until the state fixed them in ${KENTUCKY_MIXUP.correctedIn}. Grown-ups got it wrong, somebody checked, and the law itself had to be corrected. So what is the difference they missed?`,
      },
      {
        heading: 'A mineral follows one recipe',
        body:
          'A mineral is one ingredient, arranged the same way every time, all the way through. That is why minerals can grow crystals with flat faces and sharp corners — the recipe repeats perfectly, so the shape does too. Quartz is a mineral. Fluorite is a mineral. Agate is a mineral in bands.',
        figure: { kind: 'specimen', gemCode: 'quartz' },
      },
      {
        heading: 'A rock is a mixture',
        body:
          'A rock is a jumble — bits of different things pressed or melted together. Coal is squashed swamp plants. A geode is a plain rock ball with mineral crystals hiding inside it. Rocks do not grow neat crystal shapes, because a jumble has no single recipe to follow.',
        figure: { kind: 'specimen', gemCode: 'coal' },
      },
      {
        heading: 'And one of them was ALIVE',
        body:
          'A freshwater pearl is not a rock and not quite a mineral. A river mussel made it, layer by layer, around something sharp that got into its shell. Anything a living creature builds gets its own word: organic. It is the odd one out in every gem case, and knowing why is the whole game.',
        figure: { kind: 'specimen', gemCode: 'freshwater_pearl' },
      },
      {
        heading: 'Your shelf, sorted',
        body:
          'Every stone in your cavern is one of the three: a mineral with a recipe, a rock that is a mixture, or an organic thing an animal made. Sort them right and you know more than the state of Kentucky did in 1999.',
        figure: { kind: 'shelf', gemCodes: ['kentucky_agate', 'coal', 'freshwater_pearl'] },
      },
    ],
    gemCodes: SEAM_CODES,
    exerciseKinds: ['kind_sort', 'story', 'kind_sort'],
    exerciseCount: 8,
    outro:
      'Rock, mineral, or once alive — you can now sort every stone in your case. The scratch test is next, and it needs your fingernail.',
    rewardStone: 'kentucky_agate',
  },
  {
    code: 'gem_scratch_test',
    title: 'The Scratch Test',
    blurb: 'Hardness is the one thing about a stone you can TEST.',
    teach: [
      {
        heading: 'The one-way rule',
        body:
          'A harder thing scratches a softer thing. Never the other way around. That single rule is the whole test — drag one thing across another, and whichever gets the mark is the softer one. Geologists number hardness from 1 to 10, and the numbers are called the Mohs scale.',
      },
      {
        heading: 'You already own a test kit',
        body:
          'Your fingernail is about hardness 2.5. A copper coin is 3.5. A steel nail is 5.5, and so is glass. You can carry the whole ladder in your pocket, and it puts any mystery stone between two rungs in about ten seconds.',
        figure: { kind: 'hardness_ladder' },
      },
      {
        heading: 'Soft surprises',
        body:
          'Coal is softer than your own fingernail is hard — a copper coin marks it easily. Galena looks like tough silver metal and is just as soft. Hard and heavy are not the same thing, and hard and shiny are not either. Only the scratch tells the truth.',
        figure: { kind: 'specimen', gemCode: 'galena' },
      },
      {
        heading: 'Hard surprises',
        body:
          'Quartz is hardness 7 — hard enough to scratch glass. So are Kentucky agate and the crystals inside a geode, because they are quartz\'s close cousins. If a clear stone will not scratch glass, it is not quartz, whatever it pretends.',
        figure: { kind: 'specimen', gemCode: 'kentucky_agate' },
      },
      {
        heading: 'Your assignment',
        body:
          'This one leaves the screen. Find a rock in the garden. Try your fingernail, then a penny with a grown-up nearby. Which rung of the ladder does your rock sit between? That is a real measurement, and you made it yourself.',
      },
    ],
    gemCodes: SEAM_CODES,
    exerciseKinds: ['scratch_test', 'harder_which'],
    exerciseCount: 8,
    outro:
      'You can now test a stone nobody has labeled. Next: where stones come from in the first place.',
    rewardStone: 'fluorite',
  },
  {
    code: 'gem_how_made',
    title: 'How Stones Get Made',
    blurb: 'Hot water, old swamps, patient drips, and one annoyed mussel.',
    teach: [
      {
        heading: 'Grown from hot water',
        body:
          'Deep underground, hot water pushes up through cracks with minerals dissolved in it, the way sugar dissolves in tea. As the water cools, it cannot hold them anymore — and they grow into the crack as crystals. Fluorite grew that way in western Kentucky, in perfect cubes nobody cut.',
        figure: { kind: 'specimen', gemCode: 'fluorite' },
      },
      {
        heading: 'One drip at a time',
        body:
          'In a limestone cave, every drip of water leaves behind a speck of calcite. Specks become icicles of stone hanging from the roof — stalactites — one drip at a time, for thousands of years. Mammoth Cave, the longest cave on Earth, is being built this way right now, in Kentucky.',
        figure: { kind: 'specimen', gemCode: 'calcite' },
      },
      {
        heading: 'A pressed swamp',
        body:
          'Three hundred million years ago — before any dinosaur — Kentucky was a swamp forest. Trees fell into the mud, more grew and fell on top, and the weight of everything above slowly pressed the old wood into black rock. Coal is a fossil you can hold.',
        figure: { kind: 'specimen', gemCode: 'coal' },
      },
      {
        heading: 'A bubble, lined from the inside',
        body:
          'A geode starts as a hollow in the rock. Mineral-rich water creeps in for millions of years, and crystals grow from the walls INWARD, all pointing at the empty middle — the opposite direction from nearly everything else. From outside: a dull gray ball. That is the point of a geode.',
        figure: { kind: 'specimen', gemCode: 'geode' },
      },
      {
        heading: 'Made by somebody',
        body:
          'And one gem is built on purpose, by an animal. A mussel with something sharp stuck in its shell wraps it in smooth layers until it stops hurting. The pearl comes out of the river already finished — the only gem that never needs cutting or polishing.',
        figure: { kind: 'specimen', gemCode: 'freshwater_pearl' },
      },
    ],
    gemCodes: SEAM_CODES,
    exerciseKinds: ['origin_match', 'shape_spot', 'story'],
    exerciseCount: 8,
    outro:
      'Water, pressure, patience, and one mussel — you know where your whole case came from. One story left: the treasure everyone threw away.',
    rewardStone: 'geode',
  },
  {
    code: 'gem_spar_story',
    title: 'The Spar Nobody Wanted',
    blurb: 'Kentucky threw a treasure in the trash for years. True story.',
    teach: [
      {
        heading: 'Found, and thrown away',
        body:
          'In the 1830s, miners near the Crittenden County courthouse in western Kentucky kept digging up a glassy purple-and-green stone. They called it "spar," decided it was in the way, and threw it on the waste pile. For years, fluorite went in the trash.',
        figure: { kind: 'specimen', gemCode: 'fluorite' },
      },
      {
        heading: 'Then somebody looked properly',
        body:
          'Fluorite turned out to be enormously useful — for making steel, and later for chemistry of all kinds. The stuff on the spoil heaps was suddenly worth digging back OUT. Western Kentucky became one of the two great fluorspar mining districts in the whole United States.',
      },
      {
        heading: 'The boom years',
        body:
          'From the 1920s to the 1960s, the mines of Crittenden, Livingston and Caldwell counties hummed. Whole towns ran on spar. It mostly ended in the 1980s, when buying fluorite from far away got cheaper than digging it at home — but a museum in Crittenden County still keeps a great mine-owner\'s collection, so the stones stayed.',
      },
      {
        heading: 'What the story is for',
        body:
          'A valuable thing sat in the trash pile because nobody looked at it properly. That is the whole lesson of the spar — and of the geode, and of the gray lump in the creek that is secretly an agate. Looking properly is a skill, and it is the one this cavern is really teaching you.',
        figure: { kind: 'shelf', gemCodes: ['fluorite', 'geode', 'kentucky_agate'] },
      },
    ],
    gemCodes: ['fluorite', 'galena', 'calcite', 'kentucky_agate', 'geode', 'quartz'],
    exerciseKinds: ['story', 'harder_which', 'shape_spot'],
    exerciseCount: 8,
    outro:
      'That is the seam: what stones are, how to test them, where they come from, and why looking properly beats everything. The famous case gems have stories too — those come later.',
    rewardStone: 'calcite',
  },
];

const SEAM_UNIT_CODES = [
  'gem_rock_mineral', 'gem_scratch_test', 'gem_how_made', 'gem_spar_story',
];

// ── THE CASE CREW — phase two, the famous ones ──────────────────
// These pay SEAM stones, deliberately: a lesson must never hand over
// a Great-Work-grade gem. The reward rhymes with the lesson instead —
// the one-mineral-many-colors unit pays quartz (one mineral, many
// colors), and the diamond unit pays coal, which IS the joke.

GEM_UNITS.push(
  {
    code: 'gem_corundum',
    title: 'One Mineral, Two Names',
    blurb: 'Ruby and sapphire are the same stone wearing different paint.',
    requiresUnits: SEAM_UNIT_CODES,
    teach: [
      {
        heading: 'The secret',
        body:
          'Ruby and sapphire are the SAME mineral. Its real name is corundum — aluminum and oxygen, cooked and squeezed deep underground for millions of years. If it comes out red, people call it a ruby. Any other color at all — blue, yellow, pink, green — and it is called a sapphire. Red is the only color that gets its own name.',
        figure: { kind: 'shelf', gemCodes: ['ruby', 'sapphire'] },
      },
      {
        heading: 'The paint is the difference',
        body:
          'The red in a ruby comes from a trace of chromium that slipped into the crystal while it grew. Iron and titanium make it blue instead. The strangest part: chromium — the very same element that makes rubies red — is what makes an EMERALD green. Same paint, different rock, completely different color.',
        figure: { kind: 'specimen', gemCode: 'emerald' },
      },
      {
        heading: 'The garden inside an emerald',
        body:
          'Nearly every emerald is full of tiny cracks and specks. Jewelers do not call them flaws — they call them the jardin, which is French for garden. But all those little cracks give an emerald somewhere to split, so it breaks far more easily than a ruby, even though both are hard.',
      },
      {
        heading: 'You could dig one yourself',
        body:
          'There are no rubies under Kentucky — but a few hours away, in the Cowee Valley near Franklin, North Carolina, rubies, sapphires and garnets weather out of the mountains into the streams. You can rent a spot, wash a bucket of gravel, and check every pebble. People really do find them.',
      },
    ],
    gemCodes: ['ruby', 'sapphire', 'emerald', 'garnet', 'quartz', 'fluorite'],
    exerciseKinds: ['story', 'harder_which', 'origin_match'],
    exerciseCount: 8,
    outro:
      'One mineral, two names, and one element painting rubies red and emeralds green. The hardness kings are next.',
    rewardStone: 'quartz',
  },
  {
    code: 'gem_kings',
    title: 'The Hardness Kings',
    blurb: 'The top of the scale — and the pencil-and-coal secret of the diamond.',
    requiresUnits: SEAM_UNIT_CODES,
    teach: [
      {
        heading: 'A ten',
        body:
          'Diamond is a 10 — the very top of the hardness scale. Nothing natural on Earth scratches a diamond except another diamond. Your whole test kit slides right off, which is itself a test: if ANYTHING you own can mark a clear stone, it is not a diamond.',
        figure: { kind: 'specimen', gemCode: 'diamond' },
      },
      {
        heading: 'Made of pencil and coal',
        body:
          'A diamond is pure carbon — exactly the same stuff as the coal in a Kentucky seam and the graphite in a pencil. Only the arrangement is different. Squeezed about 150 kilometers down, hot enough to melt rock, then carried up FAST by a volcano — slowly would not work — carbon comes out as the hardest thing in nature. Every natural diamond is at least a billion years old.',
        figure: { kind: 'shelf', gemCodes: ['diamond', 'coal'] },
      },
      {
        heading: 'The famous mistake',
        body:
          'The stone people most often mistake for a ruby is a garnet, and for hundreds of years plenty of famous "rubies" turned out to be garnets. The scratch test settles it: a ruby is a 9 and a garnet about 7 and a half, so a ruby scratches a garnet and a garnet cannot scratch back. The one-way rule catches the impostor every time.',
        figure: { kind: 'specimen', gemCode: 'garnet' },
      },
      {
        heading: 'Twelve faces, no jeweler',
        body:
          'A garnet grows with twelve flat faces all by itself — a shape called a rhombic dodecahedron. Nobody cuts those faces. It is the same lesson as the fluorite cube in your case: a mineral follows its recipe, and the recipe decides the shape.',
      },
    ],
    gemCodes: ['diamond', 'ruby', 'garnet', 'quartz', 'coal', 'galena'],
    exerciseKinds: ['scratch_test', 'harder_which', 'shape_spot', 'story'],
    exerciseCount: 8,
    outro:
      'That is the whole case: what the famous stones are, what they are made of, and how the scratch test un-fools everyone. Your study table has no lessons left — for now.',
    rewardStone: 'coal',
  },
);

/** Is this unit open, given what she has already passed? */
export function unitAvailable(unit: GemUnit, completed: string[]): boolean {
  return !unit.requiresUnits || unit.requiresUnits.every(c => completed.includes(c));
}

export function getGemUnit(code: string): GemUnit | undefined {
  return GEM_UNITS.find(u => u.code === code);
}

/** Pass mark, shared with the practice route: 70%, like the birds. */
export function unitPassed(correctCount: number, total: number): boolean {
  return total > 0 && correctCount >= Math.ceil(total * 0.7);
}
