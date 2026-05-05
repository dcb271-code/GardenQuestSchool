// lib/world/plantCatalog.ts
//
// Real botanical content keyed by plantCode. See spec §5.
// Every plant lists its growth cost (in correct attempts), garden
// quadrant, sun + water needs, 2-3 facts, growing tip, and visual
// stages. Stage atProgress is a fraction (0..1) of growthCost.

import type { GardenType } from './seedEarnSchedule';
export type { GardenType } from './seedEarnSchedule';

export type SunNeed = 'full' | 'partial' | 'shade';
export type WaterNeed = 'low' | 'medium' | 'high';

export interface PlantStage {
  atProgress: number;            // 0.0 .. 1.0
  illustration: string;          // PlantStageIllustration code: plant_<code>_<stage>
}

export interface PlantData {
  code: string;
  commonName: string;
  scientificName: string;
  garden: GardenType;
  growthCost: number;            // correct attempts needed to fully mature
  sun: SunNeed;
  water: WaterNeed;
  facts: string[];               // 2-3 short kid-readable facts
  growingTip: string;
  stages: PlantStage[];          // first atProgress=0, last atProgress=1
}

export const PLANT_CATALOG: PlantData[] = [
  // VEGETABLE
  {
    code: 'radish',
    commonName: 'Radish',
    scientificName: 'Raphanus sativus',
    garden: 'vegetable',
    growthCost: 20,
    sun: 'full',
    water: 'medium',
    facts: [
      'Radishes are one of the fastest vegetables — ready to eat in just a few weeks.',
      'The part you eat grows underground. The leaves up top are also edible.',
      'Radishes were grown in ancient Egypt over 5,000 years ago, before the pyramids.',
    ],
    growingTip: 'Plant in cool weather. Water a little, often.',
    stages: [
      { atProgress: 0,    illustration: 'plant_radish_seed' },
      { atProgress: 0.2,  illustration: 'plant_radish_sprout' },
      { atProgress: 0.5,  illustration: 'plant_radish_leaves' },
      { atProgress: 1,    illustration: 'plant_radish_mature' },
    ],
  },
  {
    code: 'mint',
    commonName: 'Mint',
    scientificName: 'Mentha',
    garden: 'vegetable',
    growthCost: 25,
    sun: 'partial',
    water: 'medium',
    facts: [
      'Mint spreads fast — too fast! Most gardeners grow it in pots so it doesn\'t take over.',
      'There are over 600 kinds of mint. Peppermint and spearmint are the most common.',
      'Bees and butterflies love mint flowers.',
    ],
    growingTip: 'Pinch the tips so it bushes out instead of getting tall.',
    stages: [
      { atProgress: 0,    illustration: 'plant_mint_seed' },
      { atProgress: 0.25, illustration: 'plant_mint_sprout' },
      { atProgress: 0.6,  illustration: 'plant_mint_young' },
      { atProgress: 1,    illustration: 'plant_mint_mature' },
    ],
  },
  {
    code: 'lettuce',
    commonName: 'Lettuce',
    scientificName: 'Lactuca sativa',
    garden: 'vegetable',
    growthCost: 40,
    sun: 'partial',
    water: 'high',
    facts: [
      'Lettuce comes in many shapes — tight heads, loose leaves, frilly, smooth.',
      'Lettuce gets bitter when it\'s too hot. It likes cool weather best.',
      'Romans grew lettuce 2,000 years ago and ate it at the END of meals as a relaxing food.',
    ],
    growingTip: 'Pick the outer leaves; the middle keeps growing.',
    stages: [
      { atProgress: 0,    illustration: 'plant_lettuce_seed' },
      { atProgress: 0.2,  illustration: 'plant_lettuce_sprout' },
      { atProgress: 0.55, illustration: 'plant_lettuce_young' },
      { atProgress: 1,    illustration: 'plant_lettuce_mature' },
    ],
  },
  // FLOWER
  {
    code: 'tulip',
    commonName: 'Tulip',
    scientificName: 'Tulipa',
    garden: 'flower',
    growthCost: 60,
    sun: 'full',
    water: 'low',
    facts: [
      'Tulips grow from bulbs that store food underground all winter.',
      'In the 1600s in Holland, a single tulip bulb could cost more than a house.',
      'There are over 3,000 named varieties of tulip in the world.',
    ],
    growingTip: 'Plant bulbs in autumn so they bloom in spring.',
    stages: [
      { atProgress: 0,    illustration: 'plant_tulip_bulb' },
      { atProgress: 0.25, illustration: 'plant_tulip_spear' },
      { atProgress: 0.6,  illustration: 'plant_tulip_bud' },
      { atProgress: 1,    illustration: 'plant_tulip_bloom' },
    ],
  },
  {
    code: 'daisy',
    commonName: 'Daisy',
    scientificName: 'Bellis perennis',
    garden: 'flower',
    growthCost: 50,
    sun: 'full',
    water: 'medium',
    facts: [
      'A daisy is actually two flowers in one — the white "petals" and the yellow center are different flowers grouped together.',
      'Daisies close up at night and open again in the morning sun.',
      'The name "daisy" comes from "day\'s eye" because the flower looks like a tiny sun.',
    ],
    growingTip: 'Daisies don\'t mind poor soil — they grow well in meadows.',
    stages: [
      { atProgress: 0,    illustration: 'plant_daisy_seed' },
      { atProgress: 0.25, illustration: 'plant_daisy_sprout' },
      { atProgress: 0.6,  illustration: 'plant_daisy_bud' },
      { atProgress: 1,    illustration: 'plant_daisy_bloom' },
    ],
  },
  {
    code: 'sunflower',
    commonName: 'Sunflower',
    scientificName: 'Helianthus annuus',
    garden: 'flower',
    growthCost: 120,
    sun: 'full',
    water: 'medium',
    facts: [
      'Sunflowers turn their heads to follow the sun across the sky each day.',
      'A big sunflower can grow taller than a person — up to 12 feet!',
      'The black seeds in the middle are food for birds, squirrels, and people.',
    ],
    growingTip: 'Plant in the sunniest spot you have, and water deeply.',
    stages: [
      { atProgress: 0,    illustration: 'plant_sunflower_seed' },
      { atProgress: 0.15, illustration: 'plant_sunflower_sprout' },
      { atProgress: 0.4,  illustration: 'plant_sunflower_stalk' },
      { atProgress: 0.7,  illustration: 'plant_sunflower_bud' },
      { atProgress: 1,    illustration: 'plant_sunflower_bloom' },
    ],
  },
  // FRUIT
  {
    code: 'apple',
    commonName: 'Apple sapling',
    scientificName: 'Malus domestica',
    garden: 'fruit',
    growthCost: 300,
    sun: 'full',
    water: 'medium',
    facts: [
      'A real apple tree takes years to make its first fruit. Patience is everything.',
      'There are over 7,500 different kinds of apples in the world.',
      'Apple trees need a cold winter — without it, they don\'t blossom in spring.',
    ],
    growingTip: 'Plant where the tree gets full sun. Water deeply, not often.',
    stages: [
      { atProgress: 0,    illustration: 'plant_apple_seed' },
      { atProgress: 0.1,  illustration: 'plant_apple_sprout' },
      { atProgress: 0.35, illustration: 'plant_apple_twig' },
      { atProgress: 0.7,  illustration: 'plant_apple_young' },
      { atProgress: 1,    illustration: 'plant_apple_mature' },
    ],
  },
  // JAPANESE
  {
    code: 'bamboo',
    commonName: 'Bamboo cluster',
    scientificName: 'Bambusoideae',
    garden: 'japanese',
    growthCost: 100,
    sun: 'partial',
    water: 'medium',
    facts: [
      'Bamboo is the fastest-growing plant on Earth — some kinds grow 3 feet in a single day.',
      'Bamboo isn\'t a tree. It\'s a giant grass.',
      'Pandas eat almost nothing but bamboo — about 30 pounds of it every day.',
    ],
    growingTip: 'Bamboo spreads by underground roots; give it room.',
    stages: [
      { atProgress: 0,    illustration: 'plant_bamboo_seed' },
      { atProgress: 0.2,  illustration: 'plant_bamboo_shoot' },
      { atProgress: 0.55, illustration: 'plant_bamboo_stalk' },
      { atProgress: 1,    illustration: 'plant_bamboo_cluster' },
    ],
  },
  {
    code: 'bonsai',
    commonName: 'Bonsai pine',
    scientificName: 'Pinus thunbergii (trained)',
    garden: 'japanese',
    growthCost: 200,
    sun: 'full',
    water: 'low',
    facts: [
      'A bonsai is a regular tree kept tiny by careful pruning. It isn\'t a special species.',
      'Some bonsai trees in Japan are over 1,000 years old, passed down for generations.',
      'The art of bonsai started in China about 1,500 years ago and spread to Japan.',
    ],
    growingTip: 'Trim the tips, never the trunk. Patience is the whole tradition.',
    stages: [
      { atProgress: 0,    illustration: 'plant_bonsai_seed' },
      { atProgress: 0.2,  illustration: 'plant_bonsai_sprout' },
      { atProgress: 0.55, illustration: 'plant_bonsai_young' },
      { atProgress: 1,    illustration: 'plant_bonsai_mature' },
    ],
  },
  {
    code: 'cherry',
    commonName: 'Cherry blossom',
    scientificName: 'Prunus serrulata',
    garden: 'japanese',
    growthCost: 400,
    sun: 'full',
    water: 'medium',
    facts: [
      'Cherry blossoms (sakura) bloom for only one or two weeks each spring.',
      'In Japan, people gather under the trees to watch the petals fall — a tradition called hanami.',
      'A cherry tree can live for 40 to 100 years; some famous ones in Japan are over 1,000.',
    ],
    growingTip: 'Plant in autumn so roots settle before spring. Don\'t prune the trunk.',
    stages: [
      { atProgress: 0,    illustration: 'plant_cherry_seed' },
      { atProgress: 0.1,  illustration: 'plant_cherry_sprout' },
      { atProgress: 0.4,  illustration: 'plant_cherry_twig' },
      { atProgress: 0.75, illustration: 'plant_cherry_young' },
      { atProgress: 1,    illustration: 'plant_cherry_bloom' },
    ],
  },
];

export function getPlant(code: string): PlantData | undefined {
  return PLANT_CATALOG.find(p => p.code === code);
}

export function plantStageFor(plant: PlantData, progress: number): PlantStage {
  const ratio = Math.min(1, Math.max(0, progress / plant.growthCost));
  let chosen = plant.stages[0];
  for (const s of plant.stages) {
    if (s.atProgress <= ratio) chosen = s;
  }
  return chosen;
}

// "almost ready" / "halfway there" / etc. for the inspect modal.
export function progressHint(plant: PlantData, progress: number): string {
  const ratio = Math.min(1, Math.max(0, progress / plant.growthCost));
  if (ratio >= 1)    return 'ready to pick';
  if (ratio >= 0.75) return 'almost ready';
  if (ratio >= 0.5)  return 'halfway there';
  if (ratio >= 0.25) return 'growing roots';
  if (ratio > 0)     return 'just sprouting';
  return 'just planted';
}
