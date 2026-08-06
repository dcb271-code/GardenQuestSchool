// lib/world/gemCatalog.ts
//
// The gems of the mine. Cecily asked for this, and she asked for ruby.
//
// Design: docs/superpowers/specs/2026-08-06-gem-mine-design.md
//
// TWO SHELVES, and the split is the honest answer to a real problem.
// Cecily's favourite gem is the ruby, and there are no rubies in
// Kentucky. Pretending otherwise would break the rule that made the
// bird curriculum work — every fact checkable, the local thing first.
//
//   THE SEAM — what is actually under her feet. Kentucky agate,
//   fluorite, geodes, coal, quartz, calcite, galena. These are the
//   ones she could genuinely find, and they lead.
//
//   THE CASE — the famous ones from elsewhere, the way a real mining
//   museum keeps a display cabinet beside its local finds. Ruby leads
//   this shelf because she asked for it, and it turns out to be the
//   best possible teacher: ruby and sapphire are the SAME MINERAL, and
//   the nearest place you can really dig one up is a few hours' drive
//   away in North Carolina.
//
// `mohs` is the load-bearing field. Hardness is the one property a
// child can actually TEST — fingernail 2.5, copper coin 3.5, steel
// nail 5.5, glass 5.5 — which turns "how do they differ" from a fact
// to memorise into an experiment she can run on a real rock.

export type GemShelf = 'seam' | 'case';

/**
 * Rock, mineral or organic — the distinction Kentucky itself got
 * wrong for twenty-four years. See KENTUCKY_MIXUP below.
 */
export type GemKind = 'mineral' | 'rock' | 'organic';

export type FormedBy =
  | 'hydrothermal'   // grown from hot water in cracks
  | 'igneous'        // cooled from molten rock
  | 'sedimentary'    // settled and pressed in layers
  | 'metamorphic'    // changed by heat and squeezing
  | 'biological';    // made by a living thing

export interface GemData {
  code: string;
  name: string;
  shelf: GemShelf;
  kind: GemKind;
  emoji: string;
  /** What it actually looks like, in words a child would use. */
  colours: string[];
  /** Mohs hardness, 1–10. The testable property. */
  mohs: number;
  formedBy: FormedBy;
  /** How it got made, told as a story rather than a definition. */
  formationStory: string;
  whereFound: string;
  /** Crystal habit — the geometry. 'none' for the banded ones. */
  crystalShape: string;
  /** Three, like the birds. Every one checkable. */
  facts: string[];
  /**
   * Rough value in pennies per gram, for the selling maths. Wildly
   * approximate and deliberately so — these are teaching numbers that
   * keep the ORDER right (agate is cheap, ruby is not), not a price
   * list. Anything a child would multiply should stay a friendly size.
   */
  valuePerGram: number;
  /** Gems it is genuinely mistaken for. Drives hard distractors. */
  confusableWith?: string[];
}

/** What a hardness number means in the hand. Mohs is a scratch test. */
export const HARDNESS_TESTS: Array<{ mohs: number; thing: string }> = [
  { mohs: 2.5, thing: 'your fingernail' },
  { mohs: 3.5, thing: 'a copper coin' },
  { mohs: 5.5, thing: 'a steel nail' },
  { mohs: 5.5, thing: 'a piece of glass' },
  { mohs: 7, thing: 'a steel file' },
];

/**
 * The true story of how Kentucky labelled its own rocks backwards.
 *
 * Coal was made the state MINERAL in 1998 and agate the state ROCK in
 * 2000 — but coal is a rock and agate is a mineral. In 2024 the
 * legislature swapped them (HB 378) and made agate the state gemstone
 * too. This is the whole rock-versus-mineral lesson arriving as a
 * story in which grown-ups got it wrong and had to fix it, which is
 * the same shape as the Red-bellied Woodpecker's misleading name.
 */
export const KENTUCKY_MIXUP = {
  wrongFrom: 1998,
  correctedIn: 2024,
  nowRock: 'coal',
  nowMineral: 'kentucky_agate',
  nowGemstone: 'kentucky_agate',
} as const;

export const GEM_CATALOG: GemData[] = [
  // ── THE SEAM — what is really under Kentucky ────────────────────
  {
    code: 'kentucky_agate',
    name: 'Kentucky Agate',
    shelf: 'seam',
    kind: 'mineral',
    emoji: '🪨',
    colours: ['red', 'black', 'grey', 'white', 'banded'],
    mohs: 7,
    formedBy: 'hydrothermal',
    formationStory:
      'Water with silica dissolved in it seeped into a hollow in the rock, and left a thin layer behind. Then it happened again. And again, for thousands of years — one band at a time, like the rings of a tree, until the hollow was full.',
    whereFound: 'Eastern Kentucky, in creek beds — Estill, Powell and Madison counties',
    crystalShape: 'none — it grows in bands, not crystals',
    facts: [
      'It is the official state mineral AND the official state gemstone of Kentucky.',
      'Kentucky agate is hunted in creek beds, and collectors say the best ones look like a sunset sliced in half.',
      'You cannot tell from the outside. A dull grey lump in a stream can be brilliant red inside, which is why agate hunters carry a saw.',
    ],
    valuePerGram: 40,
    confusableWith: ['geode'],
  },
  {
    code: 'fluorite',
    name: 'Fluorite',
    shelf: 'seam',
    kind: 'mineral',
    emoji: '💠',
    colours: ['purple', 'green', 'blue', 'yellow', 'clear'],
    mohs: 4,
    formedBy: 'hydrothermal',
    formationStory:
      'Hot water pushed up through cracks deep underground, carrying dissolved minerals. As it cooled it could not hold them any more, and fluorite grew into the cracks in perfect cubes.',
    whereFound: 'Western Kentucky — Crittenden, Livingston and Caldwell counties',
    crystalShape: 'cube',
    facts: [
      'Western Kentucky was one of the two biggest fluorite districts in the whole United States, mined hardest from the 1920s to the 1960s.',
      'When it was first found near the Crittenden County courthouse in the 1830s, miners threw it away as waste. They called it "spar" and did not know what they had.',
      'It grows in almost perfect cubes without anybody cutting it. Fluorite decides on the corners by itself.',
    ],
    valuePerGram: 25,
    confusableWith: ['quartz', 'calcite'],
  },
  {
    code: 'geode',
    name: 'Geode',
    shelf: 'seam',
    kind: 'rock',
    emoji: '🥚',
    colours: ['grey outside', 'white', 'purple', 'clear inside'],
    mohs: 7,
    formedBy: 'sedimentary',
    formationStory:
      'A bubble was left in the rock — sometimes where a creature had rotted away. Water crept in for millions of years, leaving crystals growing inwards from the walls, all pointing at the empty middle.',
    whereFound: 'All over Kentucky, especially the south-central counties',
    crystalShape: 'hexagonal prisms inside a plain ball',
    facts: [
      'From the outside it is a boring grey lump. That is the whole point of a geode.',
      'The crystals grow INWARDS, pointing at the hollow middle, which is the opposite of how nearly everything else grows.',
      'You open one by cracking it, and you only get to do that once. Some people never crack theirs.',
    ],
    valuePerGram: 15,
    confusableWith: ['kentucky_agate'],
  },
  {
    code: 'coal',
    name: 'Coal',
    shelf: 'seam',
    kind: 'rock',
    emoji: '⬛',
    colours: ['black', 'shiny black'],
    mohs: 2.5,
    formedBy: 'sedimentary',
    formationStory:
      'A swamp forest fell into its own mud, and more forest grew on top, and fell too. Squashed under everything above it for three hundred million years, the old wood slowly turned to rock.',
    whereFound: 'Eastern and western Kentucky coalfields',
    crystalShape: 'none — it is squashed plants',
    facts: [
      'It is the official state ROCK of Kentucky, but only since 2024 — before that the state had it labelled a mineral by mistake.',
      'It is made of trees that were alive three hundred million years ago, long before there were any dinosaurs.',
      'It is softer than your fingernail is hard — you can scratch coal with a copper coin.',
    ],
    valuePerGram: 1,
  },
  {
    code: 'quartz',
    name: 'Quartz',
    shelf: 'seam',
    kind: 'mineral',
    emoji: '🔮',
    colours: ['clear', 'white', 'smoky', 'pink'],
    mohs: 7,
    formedBy: 'hydrothermal',
    formationStory:
      'Silica dissolved in hot water, then grew slowly into six-sided crystals wherever there was room — in a crack, in a hollow, in the middle of a geode.',
    whereFound: 'Everywhere in the world, and in most Kentucky geodes',
    crystalShape: 'hexagonal prism with a pointed tip',
    facts: [
      'It is the commonest mineral on the surface of the whole planet. Sand is mostly tiny broken-up quartz.',
      'A quartz crystal always has six sides. Always. However big or small it grows.',
      'It is hard enough to scratch glass, which is one way to tell it from something softer pretending to be it.',
    ],
    valuePerGram: 10,
    confusableWith: ['fluorite', 'calcite', 'diamond'],
  },
  {
    code: 'calcite',
    name: 'Calcite',
    shelf: 'seam',
    kind: 'mineral',
    emoji: '⬜',
    colours: ['white', 'clear', 'honey', 'orange'],
    mohs: 3,
    formedBy: 'sedimentary',
    formationStory:
      'Dripping water in a limestone cave leaves a speck of mineral behind every single drip. Given long enough, those specks become the stalactites hanging from a cave roof.',
    whereFound: 'Kentucky caves, including Mammoth Cave',
    crystalShape: 'rhombohedron — a squashed cube',
    facts: [
      'It is what stalactites and stalagmites are made of, one drip at a time.',
      'Clear calcite doubles anything you look at through it. Put it on a word and you see the word twice.',
      'A drop of vinegar makes it fizz, which is how geologists tell it apart from quartz in the field.',
    ],
    valuePerGram: 8,
    confusableWith: ['quartz', 'fluorite'],
  },
  {
    code: 'galena',
    name: 'Galena',
    shelf: 'seam',
    kind: 'mineral',
    emoji: '⬛',
    colours: ['silver-grey', 'metallic'],
    mohs: 2.5,
    formedBy: 'hydrothermal',
    formationStory:
      'It grew in the same hot cracks as the fluorite, in the same corner of Kentucky, at the same time — the two often come out of the ground side by side.',
    whereFound: 'Western Kentucky, alongside the fluorite',
    crystalShape: 'cube',
    facts: [
      'It is astonishingly heavy for its size. Pick up a piece and your arm expects it to weigh a third of what it does.',
      'It is where lead comes from, which is why it is heavy — and why you wash your hands after holding it.',
      'It grows in cubes like fluorite, but it is metallic silver and it is soft enough to scratch with a fingernail.',
    ],
    valuePerGram: 5,
    confusableWith: ['fluorite'],
  },
  {
    code: 'freshwater_pearl',
    name: 'Freshwater Pearl',
    shelf: 'seam',
    kind: 'organic',
    emoji: '🦪',
    colours: ['white', 'cream', 'pink', 'lavender'],
    mohs: 2.5,
    formedBy: 'biological',
    formationStory:
      'A mussel on a river bottom got something sharp stuck inside its shell. It could not spit it out, so it wrapped the thing in smooth layers, over and over, until it stopped hurting.',
    whereFound: 'Kentucky rivers — the Tennessee and the Cumberland',
    crystalShape: 'none — it is grown in layers, like an onion',
    facts: [
      'It was the state gemstone of Kentucky from 1986 until 2024, when agate took the title.',
      'It is not a mineral at all. It is made by an animal, which makes it the odd one out in any gem case.',
      'It is the only gem that needs no cutting or polishing. It comes out of the river already finished.',
    ],
    valuePerGram: 120,
  },

  // ── THE CASE — the famous ones, from elsewhere ──────────────────
  {
    code: 'ruby',
    name: 'Ruby',
    shelf: 'case',
    kind: 'mineral',
    emoji: '❤️',
    colours: ['deep red', 'pinkish red'],
    mohs: 9,
    formedBy: 'metamorphic',
    formationStory:
      'Ordinary rock got buried deep and squeezed and cooked for millions of years, until the aluminium and oxygen inside it rearranged themselves into something new and very hard. A trace of chromium turned it red.',
    whereFound:
      'Myanmar, Thailand and east Africa — and in North America, the Cowee Valley near Franklin, North Carolina',
    crystalShape: 'hexagonal prism, often barrel-shaped',
    facts: [
      'Ruby and sapphire are the SAME mineral. It is called corundum. If it is red it is a ruby, and if it is any other colour at all it is a sapphire.',
      'The red comes from a tiny amount of chromium — the same element that makes emeralds green. Same paint, different rock.',
      'It is a 9 on the hardness scale, which makes it the second hardest natural thing there is. Only a diamond can scratch it.',
    ],
    valuePerGram: 200000,
    confusableWith: ['sapphire', 'garnet'],
  },
  {
    code: 'sapphire',
    name: 'Sapphire',
    shelf: 'case',
    kind: 'mineral',
    emoji: '💙',
    colours: ['blue', 'yellow', 'pink', 'green', 'clear'],
    mohs: 9,
    formedBy: 'metamorphic',
    formationStory:
      'Exactly the same story as a ruby — the same mineral, made the same way. It simply had iron and titanium in it instead of chromium, so it came out blue.',
    whereFound: 'Sri Lanka, Madagascar, Australia — and the same North Carolina valley as the rubies',
    crystalShape: 'hexagonal prism, often barrel-shaped',
    facts: [
      'A sapphire is a ruby that is not red. That is the entire difference.',
      'Sapphires come in almost every colour except red, because red is the one that gets its own name.',
      'You can dig for sapphires and rubies in the same bucket of gravel in North Carolina, because they come out of the same rock.',
    ],
    valuePerGram: 80000,
    confusableWith: ['ruby'],
  },
  {
    code: 'emerald',
    name: 'Emerald',
    shelf: 'case',
    kind: 'mineral',
    emoji: '💚',
    colours: ['deep green'],
    mohs: 7.75,
    formedBy: 'hydrothermal',
    formationStory:
      'Hot fluid carrying beryllium — a rare element — met rock carrying chromium, in a crack deep underground. The two together grew green crystals.',
    whereFound: 'Colombia mostly, and North Carolina',
    crystalShape: 'hexagonal prism',
    facts: [
      'Nearly every emerald has cracks and specks inside it. Jewellers do not call them flaws, they call them the jardin — French for garden.',
      'Its green comes from chromium, the same element that makes a ruby red.',
      'It is much easier to break than a ruby, even though both are hard, because all those tiny cracks give it somewhere to split.',
    ],
    valuePerGram: 150000,
  },
  {
    code: 'garnet',
    name: 'Garnet',
    shelf: 'case',
    kind: 'mineral',
    emoji: '🔴',
    colours: ['dark red', 'orange', 'green', 'purple-red'],
    mohs: 7.5,
    formedBy: 'metamorphic',
    formationStory:
      'Mud and clay buried deep, then squeezed and heated until the minerals in it broke apart and rebuilt themselves. Garnets grow inside the rock like plums in a pudding, and weather out whole when the rock finally crumbles.',
    whereFound: 'All over the world — and in the same North Carolina gravels as the rubies',
    crystalShape: 'rhombic dodecahedron — a ball with twelve flat faces',
    facts: [
      'It is the stone people most often mistake for a ruby, and for hundreds of years plenty of famous "rubies" turned out to be garnets.',
      'You can tell them apart by hardness. A ruby is a 9 and a garnet is about 7 and a half — so a ruby will scratch a garnet, and a garnet cannot scratch back.',
      'It grows with twelve flat faces all by itself. Nobody cuts those; that is just the shape garnet likes.',
    ],
    valuePerGram: 300,
    confusableWith: ['ruby'],
  },
  {
    code: 'diamond',
    name: 'Diamond',
    shelf: 'case',
    kind: 'mineral',
    emoji: '💎',
    colours: ['clear', 'yellow', 'brown', 'pink', 'blue'],
    mohs: 10,
    formedBy: 'igneous',
    formationStory:
      'Carbon, squeezed about 150 kilometres down inside the Earth where it is hot enough to melt rock, and then carried up to the surface fast by a violent volcano. Slowly would not work — it has to be fast.',
    whereFound: 'Africa, Russia, Australia, Canada',
    crystalShape: 'octahedron — two square pyramids stuck base to base',
    facts: [
      'It is a 10, the top of the hardness scale, and nothing natural scratches it except another diamond.',
      'It is made of pure carbon — exactly the same stuff as the coal in a Kentucky seam and the graphite in a pencil. Only the arrangement is different.',
      'Every natural diamond is at least a billion years old. Most are more than three.',
    ],
    valuePerGram: 500000,
    confusableWith: ['quartz'],
  },
];

export function getGem(code: string): GemData | undefined {
  return GEM_CATALOG.find(g => g.code === code);
}

export function gemsOnShelf(shelf: GemShelf): GemData[] {
  return GEM_CATALOG.filter(g => g.shelf === shelf);
}

/**
 * What a child can use to test this hardness: the hardest everyday
 * thing that will still scratch it. Null when nothing common will —
 * which is itself the lesson for a ruby.
 */
export function scratchTestFor(gem: GemData): string | null {
  const softer = HARDNESS_TESTS.filter(t => t.mohs > gem.mohs);
  return softer.length ? softer[0].thing : null;
}

/** Softest first — the order the hardness lesson should walk. */
export function byHardness(gems: GemData[] = GEM_CATALOG): GemData[] {
  return gems.slice().sort((a, b) => a.mohs - b.mohs);
}
