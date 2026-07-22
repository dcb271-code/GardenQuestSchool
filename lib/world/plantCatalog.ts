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
  {
    code: 'carrot',
    commonName: 'Carrot',
    scientificName: 'Daucus carota',
    garden: 'vegetable',
    growthCost: 30,
    sun: 'full',
    water: 'medium',
    facts: [
      'Carrots weren\'t always orange — the first ones were purple and white.',
      'The orange color comes from carotene, which your body turns into vitamin A for your eyes.',
      'The feathery green tops are edible too — they taste a little like parsley.',
    ],
    growingTip: 'Loose, stone-free soil lets the root grow long and straight.',
    stages: [
      { atProgress: 0,    illustration: 'plant_carrot_seed' },
      { atProgress: 0.25, illustration: 'plant_carrot_sprout' },
      { atProgress: 0.55, illustration: 'plant_carrot_tops' },
      { atProgress: 1,    illustration: 'plant_carrot_mature' },
    ],
  },
  {
    code: 'tomato',
    commonName: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    garden: 'vegetable',
    growthCost: 55,
    sun: 'full',
    water: 'high',
    facts: [
      'Surprise: a tomato is botanically a FRUIT — it grows from a flower and holds the seeds.',
      'Tomatoes start green and ripen to red as they make a pigment called lycopene.',
      'People once thought tomatoes were poisonous and grew them only to look at.',
    ],
    growingTip: 'Give the vine a stick to climb and water at the roots, not the leaves.',
    stages: [
      { atProgress: 0,    illustration: 'plant_tomato_seed' },
      { atProgress: 0.2,  illustration: 'plant_tomato_sprout' },
      { atProgress: 0.5,  illustration: 'plant_tomato_vine' },
      { atProgress: 0.75, illustration: 'plant_tomato_green' },
      { atProgress: 1,    illustration: 'plant_tomato_ripe' },
    ],
  },
  {
    code: 'pumpkin',
    commonName: 'Pumpkin',
    scientificName: 'Cucurbita pepo',
    garden: 'vegetable',
    growthCost: 90,
    sun: 'full',
    water: 'high',
    facts: [
      'Pumpkin vines can grow longer than a school bus in one summer.',
      'The biggest pumpkins ever grown weigh more than a small car — over 1,000 kg.',
      'Pumpkin flowers open for just one morning, and bees hurry in to visit.',
    ],
    growingTip: 'Give it LOTS of room — one plant can cover a whole bed.',
    stages: [
      { atProgress: 0,    illustration: 'plant_pumpkin_seed' },
      { atProgress: 0.2,  illustration: 'plant_pumpkin_sprout' },
      { atProgress: 0.45, illustration: 'plant_pumpkin_vine' },
      { atProgress: 0.7,  illustration: 'plant_pumpkin_flower' },
      { atProgress: 1,    illustration: 'plant_pumpkin_mature' },
    ],
  },
  // FRUIT
  {
    code: 'strawberry',
    commonName: 'Strawberry',
    scientificName: 'Fragaria × ananassa',
    garden: 'fruit',
    growthCost: 70,
    sun: 'full',
    water: 'medium',
    facts: [
      'Strawberries wear their seeds on the OUTSIDE — about 200 on every berry.',
      'A strawberry isn\'t a true berry, but a banana is. Plant names can be sneaky!',
      'Strawberry plants send out runners that grow brand-new baby plants.',
    ],
    growingTip: 'Tuck straw under the berries to keep them clean and dry.',
    stages: [
      { atProgress: 0,    illustration: 'plant_strawberry_seed' },
      { atProgress: 0.25, illustration: 'plant_strawberry_sprout' },
      { atProgress: 0.6,  illustration: 'plant_strawberry_flower' },
      { atProgress: 1,    illustration: 'plant_strawberry_berries' },
    ],
  },
  {
    code: 'blueberry',
    commonName: 'Blueberry',
    scientificName: 'Vaccinium corymbosum',
    garden: 'fruit',
    growthCost: 110,
    sun: 'full',
    water: 'medium',
    facts: [
      'Blueberries are one of the only truly BLUE foods in nature.',
      'Bumblebees pollinate blueberry flowers by buzzing at just the right pitch to shake the pollen loose.',
      'A blueberry bush can keep making berries for 50 years.',
    ],
    growingTip: 'Blueberries like acidic soil — pine needles make a happy mulch.',
    stages: [
      { atProgress: 0,    illustration: 'plant_blueberry_seed' },
      { atProgress: 0.25, illustration: 'plant_blueberry_sprout' },
      { atProgress: 0.6,  illustration: 'plant_blueberry_bush' },
      { atProgress: 1,    illustration: 'plant_blueberry_berries' },
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
  {
    code: 'coneflower',
    commonName: 'Purple coneflower',
    scientificName: 'Echinacea purpurea',
    garden: 'flower',
    growthCost: 70,
    sun: 'full',
    water: 'low',
    facts: [
      'The spiky center dome is where the seeds live — "echinacea" comes from the Greek word for hedgehog.',
      'This prairie wildflower is from North America, and butterflies line up to sip its nectar all summer.',
      'Leave the seed heads standing in winter and goldfinches will come by to snack.',
    ],
    growingTip: 'Plant in full sun. Once it settles in, it barely needs watering.',
    stages: [
      { atProgress: 0,    illustration: 'plant_coneflower_seed' },
      { atProgress: 0.25, illustration: 'plant_coneflower_sprout' },
      { atProgress: 0.6,  illustration: 'plant_coneflower_bud' },
      { atProgress: 1,    illustration: 'plant_coneflower_bloom' },
    ],
  },
  {
    code: 'blackeyedsusan',
    commonName: 'Black-eyed Susan',
    scientificName: 'Rudbeckia hirta',
    garden: 'flower',
    growthCost: 55,
    sun: 'full',
    water: 'medium',
    facts: [
      'The "black eye" is the flower\'s dark brown center — a button packed with hundreds of tiny flowers.',
      'This cheerful wildflower grows wild in meadows and along roadsides all across North America.',
      'It blooms from midsummer right up to frost — one of the longest-blooming wildflowers there is.',
    ],
    growingTip: 'Not picky at all — give it sun and ordinary soil and it takes off.',
    stages: [
      { atProgress: 0,    illustration: 'plant_blackeyedsusan_seed' },
      { atProgress: 0.25, illustration: 'plant_blackeyedsusan_sprout' },
      { atProgress: 0.6,  illustration: 'plant_blackeyedsusan_bud' },
      { atProgress: 1,    illustration: 'plant_blackeyedsusan_bloom' },
    ],
  },
  {
    code: 'milkweed',
    commonName: 'Common milkweed',
    scientificName: 'Asclepias syriaca',
    garden: 'flower',
    growthCost: 85,
    sun: 'full',
    water: 'low',
    facts: [
      'Monarch butterflies lay their eggs ONLY on milkweed — their caterpillars won\'t eat anything else.',
      'Snap a leaf and milky white sap comes out. That\'s how milkweed got its name.',
      'In autumn its pods split open and hundreds of seeds sail away on silky white parachutes.',
    ],
    growingTip: 'Plant it in a sunny spot and let it be — the monarchs will find it.',
    stages: [
      { atProgress: 0,    illustration: 'plant_milkweed_seed' },
      { atProgress: 0.2,  illustration: 'plant_milkweed_sprout' },
      { atProgress: 0.5,  illustration: 'plant_milkweed_leafy' },
      { atProgress: 0.75, illustration: 'plant_milkweed_bloom' },
      { atProgress: 1,    illustration: 'plant_milkweed_pods' },
    ],
  },
  {
    code: 'lupine',
    commonName: 'Lupine',
    scientificName: 'Lupinus perennis',
    garden: 'flower',
    growthCost: 110,
    sun: 'full',
    water: 'medium',
    facts: [
      'Lupine stacks its flowers in a tall spire that opens from the bottom up.',
      'Its leaves spread like little green hands and catch raindrops that sparkle like jewels.',
      'Lupine roots feed nitrogen into the soil, making the dirt better for every plant nearby.',
    ],
    growingTip: 'Soak the hard seeds in water overnight before planting to wake them up.',
    stages: [
      { atProgress: 0,    illustration: 'plant_lupine_seed' },
      { atProgress: 0.25, illustration: 'plant_lupine_sprout' },
      { atProgress: 0.55, illustration: 'plant_lupine_leaves' },
      { atProgress: 1,    illustration: 'plant_lupine_bloom' },
    ],
  },
  {
    code: 'beebalm',
    commonName: 'Bee balm',
    scientificName: 'Monarda didyma',
    garden: 'flower',
    growthCost: 95,
    sun: 'partial',
    water: 'medium',
    facts: [
      'The shaggy scarlet blooms look like tiny fireworks — and hummingbirds zoom in for the nectar.',
      'Bee balm is in the mint family. Rub a leaf and sniff — it smells minty-spicy.',
      'People have brewed its leaves into a drink called Oswego tea for hundreds of years.',
    ],
    growingTip: 'Give it room to breathe — fresh air moving between plants keeps the leaves healthy.',
    stages: [
      { atProgress: 0,    illustration: 'plant_beebalm_seed' },
      { atProgress: 0.25, illustration: 'plant_beebalm_sprout' },
      { atProgress: 0.6,  illustration: 'plant_beebalm_bud' },
      { atProgress: 1,    illustration: 'plant_beebalm_bloom' },
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
