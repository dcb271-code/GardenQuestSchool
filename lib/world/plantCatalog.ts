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
  // ORCHARD (beyond the trellis)
  {
    code: 'peach',
    commonName: 'Peach tree',
    scientificName: 'Prunus persica',
    garden: 'orchard',
    growthCost: 350,
    sun: 'full',
    water: 'medium',
    facts: [
      'Peach fuzz is real armor — the soft hairs protect the fruit\'s thin skin from insects and sunburn.',
      'Peaches were first grown in China over 3,000 years ago, where they stand for long life.',
      'A nectarine is just a peach without fuzz — one tiny gene makes the difference.',
    ],
    growingTip: 'Prune the middle open so sunshine can reach every branch.',
    stages: [
      { atProgress: 0,    illustration: 'plant_peach_seed' },
      { atProgress: 0.1,  illustration: 'plant_peach_sprout' },
      { atProgress: 0.35, illustration: 'plant_peach_twig' },
      { atProgress: 0.7,  illustration: 'plant_peach_young' },
      { atProgress: 1,    illustration: 'plant_peach_mature' },
    ],
  },
  {
    code: 'pawpaw',
    commonName: 'Pawpaw tree',
    scientificName: 'Asimina triloba',
    garden: 'orchard',
    growthCost: 450,
    sun: 'partial',
    water: 'medium',
    facts: [
      'The pawpaw is the biggest fruit that grows wild in North America — it tastes like banana-mango custard.',
      'Zebra swallowtail caterpillars eat pawpaw leaves and nothing else in the world.',
      'Pawpaw flowers are pollinated by flies and beetles instead of bees.',
    ],
    growingTip: 'Young pawpaws like shade; grown-up ones want sun. Odd, but true.',
    stages: [
      { atProgress: 0,    illustration: 'plant_pawpaw_seed' },
      { atProgress: 0.1,  illustration: 'plant_pawpaw_sprout' },
      { atProgress: 0.35, illustration: 'plant_pawpaw_twig' },
      { atProgress: 0.7,  illustration: 'plant_pawpaw_young' },
      { atProgress: 1,    illustration: 'plant_pawpaw_mature' },
    ],
  },
  {
    code: 'plum',
    commonName: 'Plum tree',
    scientificName: 'Prunus domestica',
    garden: 'orchard',
    growthCost: 320,
    sun: 'full',
    water: 'medium',
    facts: [
      'The silvery dust on a plum is called bloom — a natural wax the fruit makes to protect itself.',
      'Plums were one of the very first fruit trees people ever farmed.',
      'A dried plum has its own name: a prune.',
    ],
    growingTip: 'Two plum trees make more fruit than one alone — they trade pollen.',
    stages: [
      { atProgress: 0,    illustration: 'plant_plum_seed' },
      { atProgress: 0.1,  illustration: 'plant_plum_sprout' },
      { atProgress: 0.35, illustration: 'plant_plum_twig' },
      { atProgress: 0.7,  illustration: 'plant_plum_young' },
      { atProgress: 1,    illustration: 'plant_plum_mature' },
    ],
  },
  {
    code: 'persimmon',
    commonName: 'Persimmon tree',
    scientificName: 'Diospyros kaki',
    garden: 'orchard',
    growthCost: 500,
    sun: 'full',
    water: 'medium',
    facts: [
      'Persimmon\'s scientific name, Diospyros, means "food of the gods" in Greek.',
      'The fruit hangs on after the leaves fall — like little orange lanterns on bare winter branches.',
      'An unripe persimmon puckers your whole mouth; a soft ripe one tastes like honey.',
    ],
    growingTip: 'Patience — a persimmon isn\'t ready until it feels like jelly inside.',
    stages: [
      { atProgress: 0,    illustration: 'plant_persimmon_seed' },
      { atProgress: 0.1,  illustration: 'plant_persimmon_sprout' },
      { atProgress: 0.35, illustration: 'plant_persimmon_twig' },
      { atProgress: 0.7,  illustration: 'plant_persimmon_young' },
      { atProgress: 1,    illustration: 'plant_persimmon_mature' },
    ],
  },
  {
    code: 'fig',
    commonName: 'Fig tree',
    scientificName: 'Ficus carica',
    garden: 'orchard',
    growthCost: 380,
    sun: 'full',
    water: 'low',
    facts: [
      'A fig isn\'t a simple fruit — it\'s a tiny garden of hundreds of little flowers blooming INSIDE.',
      'Figs are one of the oldest plants people have ever farmed — older than wheat.',
      'Fig leaves grow big enough to use as a fan on a hot day.',
    ],
    growingTip: 'Figs love baking sun and don\'t mind poor, rocky soil.',
    stages: [
      { atProgress: 0,    illustration: 'plant_fig_seed' },
      { atProgress: 0.1,  illustration: 'plant_fig_sprout' },
      { atProgress: 0.35, illustration: 'plant_fig_twig' },
      { atProgress: 0.7,  illustration: 'plant_fig_young' },
      { atProgress: 1,    illustration: 'plant_fig_mature' },
    ],
  },
  // BERRY PATCH (beyond the trellis)
  {
    code: 'raspberry',
    commonName: 'Raspberry',
    scientificName: 'Rubus idaeus',
    garden: 'berry',
    growthCost: 120,
    sun: 'full',
    water: 'medium',
    facts: [
      'One raspberry is really about 100 tiny fruits stuck together — each little bump has its own seed.',
      'A raspberry cane grows one summer, makes fruit the next, then hands the job to new canes.',
      'Raspberries come in red, gold, purple, and black.',
    ],
    growingTip: 'Give the long canes a wire to lean on, like a handrail.',
    stages: [
      { atProgress: 0,    illustration: 'plant_raspberry_seed' },
      { atProgress: 0.2,  illustration: 'plant_raspberry_sprout' },
      { atProgress: 0.55, illustration: 'plant_raspberry_cane' },
      { atProgress: 1,    illustration: 'plant_raspberry_berries' },
    ],
  },
  {
    code: 'blackberry',
    commonName: 'Blackberry',
    scientificName: 'Rubus fruticosus',
    garden: 'berry',
    growthCost: 130,
    sun: 'full',
    water: 'medium',
    facts: [
      'Blackberries are red before they ripen — pickers say "blackberries are red when they\'re green."',
      'The prickles are little hooks that help the long canes climb over everything in their way.',
      'A ripe blackberry slides off with the gentlest pull. If you have to tug, it isn\'t ready.',
    ],
    growingTip: 'Pick only the berries that let go easily — the rest need more sun.',
    stages: [
      { atProgress: 0,    illustration: 'plant_blackberry_seed' },
      { atProgress: 0.2,  illustration: 'plant_blackberry_sprout' },
      { atProgress: 0.55, illustration: 'plant_blackberry_cane' },
      { atProgress: 1,    illustration: 'plant_blackberry_berries' },
    ],
  },
  {
    code: 'gooseberry',
    commonName: 'Gooseberry',
    scientificName: 'Ribes uva-crispa',
    garden: 'berry',
    growthCost: 150,
    sun: 'partial',
    water: 'medium',
    facts: [
      'Gooseberry skin is see-through — hold one up to the sun and you can see stripes and seeds inside.',
      'In old England, whole villages held contests to grow the biggest gooseberry.',
      'They start out mouth-puckering tart, then turn sweet as they blush pink.',
    ],
    growingTip: 'Wear long sleeves to pick — the bush guards its berries with thorns.',
    stages: [
      { atProgress: 0,    illustration: 'plant_gooseberry_seed' },
      { atProgress: 0.2,  illustration: 'plant_gooseberry_sprout' },
      { atProgress: 0.55, illustration: 'plant_gooseberry_cane' },
      { atProgress: 1,    illustration: 'plant_gooseberry_berries' },
    ],
  },
  {
    code: 'currant',
    commonName: 'Red currant',
    scientificName: 'Ribes rubrum',
    garden: 'berry',
    growthCost: 160,
    sun: 'partial',
    water: 'medium',
    facts: [
      'Currants dangle in little strings called strigs — like ruby necklaces hung on the bush.',
      'Ripe currants shine like glass beads, and the robins are always racing you to them.',
      'Unlike most fruit, currants are happy growing in partial shade.',
    ],
    growingTip: 'Drape a net over the bush before the berries turn red — or the birds win.',
    stages: [
      { atProgress: 0,    illustration: 'plant_currant_seed' },
      { atProgress: 0.2,  illustration: 'plant_currant_sprout' },
      { atProgress: 0.55, illustration: 'plant_currant_cane' },
      { atProgress: 1,    illustration: 'plant_currant_berries' },
    ],
  },
  {
    code: 'elderberry',
    commonName: 'Elderberry',
    scientificName: 'Sambucus canadensis',
    garden: 'berry',
    growthCost: 250,
    sun: 'full',
    water: 'high',
    facts: [
      'Elderberry flowers bloom in flat lacy plates, then turn into hundreds of tiny dark berries.',
      'The stems are hollow — people used to make whistles and flutes from them.',
      'Elderberries are for cooking into syrup and pie, not for snacking raw.',
    ],
    growingTip: 'Elderberries love wet feet — plant where the rain puddles.',
    stages: [
      { atProgress: 0,    illustration: 'plant_elderberry_seed' },
      { atProgress: 0.2,  illustration: 'plant_elderberry_sprout' },
      { atProgress: 0.55, illustration: 'plant_elderberry_cane' },
      { atProgress: 1,    illustration: 'plant_elderberry_berries' },
    ],
  },
  // HERB & TEA GARDEN (beyond the trellis)
  {
    code: 'basil',
    commonName: 'Basil',
    scientificName: 'Ocimum basilicum',
    garden: 'herb',
    growthCost: 40,
    sun: 'full',
    water: 'medium',
    facts: [
      'Pinch off basil\'s top and it grows TWO new branches — it gets bushier every time you pick it.',
      'Basil means "royal herb" — basileus is the Greek word for king.',
      'That wonderful smell is oil in the leaves, which the plant makes to shoo insects away.',
    ],
    growingTip: 'Pinch off the flower buds so the leaves stay big and sweet.',
    stages: [
      { atProgress: 0,    illustration: 'plant_basil_seed' },
      { atProgress: 0.25, illustration: 'plant_basil_sprout' },
      { atProgress: 0.6,  illustration: 'plant_basil_clump' },
      { atProgress: 1,    illustration: 'plant_basil_bloom' },
    ],
  },
  {
    code: 'lavender',
    commonName: 'Lavender',
    scientificName: 'Lavandula angustifolia',
    garden: 'herb',
    growthCost: 90,
    sun: 'full',
    water: 'low',
    facts: [
      'Lavender\'s name comes from lavare — Latin for "to wash." Romans scented their baths with it.',
      'Bees adore lavender, and the honey they make from it tastes of flowers.',
      'Dried lavender keeps its smell for years — a drawer sachet from your own garden.',
    ],
    growingTip: 'Lavender likes gritty, dry soil. More lavender drowns than dries out.',
    stages: [
      { atProgress: 0,    illustration: 'plant_lavender_seed' },
      { atProgress: 0.25, illustration: 'plant_lavender_sprout' },
      { atProgress: 0.6,  illustration: 'plant_lavender_clump' },
      { atProgress: 1,    illustration: 'plant_lavender_bloom' },
    ],
  },
  {
    code: 'chamomile',
    commonName: 'Chamomile',
    scientificName: 'Matricaria chamomilla',
    garden: 'herb',
    growthCost: 60,
    sun: 'full',
    water: 'low',
    facts: [
      'Chamomile is the bedtime-tea flower — dry the little daisy heads and steep them warm.',
      'Its name means "earth apple" in Greek, because the flowers smell like apples underfoot.',
      'Peter Rabbit\'s mother gave him chamomile tea after his adventure in Mr. McGregor\'s garden.',
    ],
    growingTip: 'Pick the flowers often — the plant answers with more.',
    stages: [
      { atProgress: 0,    illustration: 'plant_chamomile_seed' },
      { atProgress: 0.25, illustration: 'plant_chamomile_sprout' },
      { atProgress: 0.6,  illustration: 'plant_chamomile_clump' },
      { atProgress: 1,    illustration: 'plant_chamomile_bloom' },
    ],
  },
  {
    code: 'rosemary',
    commonName: 'Rosemary',
    scientificName: 'Salvia rosmarinus',
    garden: 'herb',
    growthCost: 110,
    sun: 'full',
    water: 'low',
    facts: [
      'Rosemary means "dew of the sea" — it grows wild on cliffs above the Mediterranean.',
      'It stays green all winter, so you can pick a sprig for dinner even in the snow.',
      'Ancient students wore rosemary crowns because they believed it helped them remember.',
    ],
    growingTip: 'Water it rarely. Rosemary would rather be thirsty than soggy.',
    stages: [
      { atProgress: 0,    illustration: 'plant_rosemary_seed' },
      { atProgress: 0.25, illustration: 'plant_rosemary_sprout' },
      { atProgress: 0.6,  illustration: 'plant_rosemary_clump' },
      { atProgress: 1,    illustration: 'plant_rosemary_bloom' },
    ],
  },
  {
    code: 'thyme',
    commonName: 'Thyme',
    scientificName: 'Thymus vulgaris',
    garden: 'herb',
    growthCost: 50,
    sun: 'full',
    water: 'low',
    facts: [
      'Thyme creeps along the ground into a fragrant little carpet dotted with pink flowers.',
      'Knights once rode with thyme embroidered on their scarves — it was the herb of courage.',
      'The leaves are some of the smallest in the herb garden, but soups love them best.',
    ],
    growingTip: 'Trim it after flowering and the carpet grows back thicker.',
    stages: [
      { atProgress: 0,    illustration: 'plant_thyme_seed' },
      { atProgress: 0.25, illustration: 'plant_thyme_sprout' },
      { atProgress: 0.6,  illustration: 'plant_thyme_clump' },
      { atProgress: 1,    illustration: 'plant_thyme_bloom' },
    ],
  },
  // MOON GARDEN (beyond the trellis)
  {
    code: 'moonflower',
    commonName: 'Moonflower',
    scientificName: 'Ipomoea alba',
    garden: 'moon',
    growthCost: 140,
    sun: 'full',
    water: 'medium',
    facts: [
      'A moonflower opens at dusk in about a minute — slowly enough to watch, fast enough to gasp.',
      'It\'s white and sweet-smelling so night moths can find it in the dark.',
      'Each flower blooms for exactly one night, then folds forever at sunrise.',
    ],
    growingTip: 'Give the vine something to climb — it reaches for the moon.',
    stages: [
      { atProgress: 0,    illustration: 'plant_moonflower_seed' },
      { atProgress: 0.25, illustration: 'plant_moonflower_sprout' },
      { atProgress: 0.6,  illustration: 'plant_moonflower_bud' },
      { atProgress: 1,    illustration: 'plant_moonflower_bloom' },
    ],
  },
  {
    code: 'eveningprimrose',
    commonName: 'Evening primrose',
    scientificName: 'Oenothera biennis',
    garden: 'moon',
    growthCost: 100,
    sun: 'full',
    water: 'low',
    facts: [
      'Evening primrose petals spring open at dusk fast enough to watch with your own eyes.',
      'Its yellow cups have secret patterns only night insects can see.',
      'Goldfinches feast on the seed pods all winter long.',
    ],
    growingTip: 'Leave the seed stalks standing in fall — they\'re a bird feeder you grew.',
    stages: [
      { atProgress: 0,    illustration: 'plant_eveningprimrose_seed' },
      { atProgress: 0.25, illustration: 'plant_eveningprimrose_sprout' },
      { atProgress: 0.6,  illustration: 'plant_eveningprimrose_bud' },
      { atProgress: 1,    illustration: 'plant_eveningprimrose_bloom' },
    ],
  },
  {
    code: 'fouroclock',
    commonName: "Four o'clock flower",
    scientificName: 'Mirabilis jalapa',
    garden: 'moon',
    growthCost: 80,
    sun: 'full',
    water: 'medium',
    facts: [
      'Four o\'clocks open in the late afternoon — a flower with its own clock.',
      'One plant can grow flowers of different colors on the very same stem.',
      'Its scientific name, Mirabilis, means "marvelous."',
    ],
    growingTip: 'Check what time YOUR flowers really open — every garden is a little different.',
    stages: [
      { atProgress: 0,    illustration: 'plant_fouroclock_seed' },
      { atProgress: 0.25, illustration: 'plant_fouroclock_sprout' },
      { atProgress: 0.6,  illustration: 'plant_fouroclock_bud' },
      { atProgress: 1,    illustration: 'plant_fouroclock_bloom' },
    ],
  },
  {
    code: 'nightphlox',
    commonName: 'Night phlox',
    scientificName: 'Zaluzianskya capensis',
    garden: 'moon',
    growthCost: 120,
    sun: 'full',
    water: 'medium',
    facts: [
      'Night phlox is nicknamed "midnight candy" — after dark it smells like honey and vanilla.',
      'The petal backs are dark maroon and the insides white: closed it hides, open it looks like stars.',
      'It came to gardens from South Africa.',
    ],
    growingTip: 'Plant it near a window you open on summer nights.',
    stages: [
      { atProgress: 0,    illustration: 'plant_nightphlox_seed' },
      { atProgress: 0.25, illustration: 'plant_nightphlox_sprout' },
      { atProgress: 0.6,  illustration: 'plant_nightphlox_bud' },
      { atProgress: 1,    illustration: 'plant_nightphlox_bloom' },
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
