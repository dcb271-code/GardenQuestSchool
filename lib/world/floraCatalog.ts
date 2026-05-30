// lib/world/floraCatalog.ts
//
// Catalog of trees + wildflowers + ferns + shrubs that Cecily can
// identify in the Naturalist Grove module. Parallel to
// speciesCatalog.ts (which covers fauna like ants + butterflies).
//
// Phase 1 pilot: 10 species (5 trees, 5 flowers) covering spring,
// summer, fall, winter so the seasonal walk-selection algorithm in
// Phase 3 has content year-round. Phase 5 expands to ~55.
//
// Design spec: docs/superpowers/specs/2026-05-29-naturalist-grove-design.md §5

export type FloraKind = 'tree' | 'flower' | 'fern' | 'shrub';
export type Season = 'spring' | 'summer' | 'fall' | 'winter';
export type LocalTier = 'hyper_local' | 'canonical_native';
export type PhotoRole = 'whole' | 'leaf' | 'bark' | 'flower' | 'fruit';

export interface FloraData {
  code: string;                  // 'red_maple', 'eastern_redbud'
  commonName: string;            // "Red Maple"
  scientificName: string;        // "Acer rubrum"
  kind: FloraKind;
  localTier: LocalTier;
  emoji: string;                 // fallback / journal chip
  seasons: Season[];             // when this species is visibly identifiable
  notableFeatures: string[];     // ['lobed leaf', 'red samaras', 'smooth grey bark']
  facts: string[];               // 2-3 short kid-readable facts
  wikiSpecies: string;           // 'Acer_rubrum' — for Wikimedia category lookup
  inatTaxonId: number;           // iNaturalist taxon id
  photoRoles: PhotoRole[];       // which photo roles exist for this species
}

export const FLORA_CATALOG: FloraData[] = [
  // ─── TREES ─────────────────────────────────────────────────────────

  {
    code: 'tulip_poplar',
    commonName: 'Tulip Poplar',
    scientificName: 'Liriodendron tulipifera',
    kind: 'tree',
    localTier: 'hyper_local',
    emoji: '🌳',
    seasons: ['spring', 'summer', 'fall', 'winter'],
    notableFeatures: [
      'four-lobed leaf with a flat top',
      'tulip-shaped greenish-orange flower in late spring',
      'tall straight grey trunk',
    ],
    facts: [
      'The Tulip Poplar is the state tree of Kentucky.',
      'Its flowers look like little tulips — that is how it got its name.',
      'It can grow taller than almost any other tree in the eastern forest.',
    ],
    wikiSpecies: 'Liriodendron_tulipifera',
    inatTaxonId: 48719,
    photoRoles: ['whole', 'leaf', 'bark', 'flower'],
  },

  {
    code: 'eastern_redbud',
    commonName: 'Eastern Redbud',
    scientificName: 'Cercis canadensis',
    kind: 'tree',
    localTier: 'hyper_local',
    emoji: '🌳',
    seasons: ['spring', 'summer', 'fall', 'winter'],
    notableFeatures: [
      'magenta-pink flowers all along bare branches in very early spring',
      'heart-shaped leaves',
      'thin twisty trunk',
    ],
    facts: [
      'Redbuds bloom before they grow leaves — the pink flowers come straight out of the bark.',
      'You can eat redbud flowers in a salad.',
      'A redbud rarely grows taller than about 25 feet.',
    ],
    wikiSpecies: 'Cercis_canadensis',
    inatTaxonId: 49083,
    photoRoles: ['whole', 'leaf', 'flower'],
  },

  {
    code: 'flowering_dogwood',
    commonName: 'Flowering Dogwood',
    scientificName: 'Cornus florida',
    kind: 'tree',
    localTier: 'hyper_local',
    emoji: '🌳',
    seasons: ['spring', 'summer', 'fall', 'winter'],
    notableFeatures: [
      'four white "petals" that are really leaves around the real tiny flowers in the middle',
      'red berries in fall',
      'bumpy alligator-skin bark',
    ],
    facts: [
      'The big white "petals" are not really petals — they are special leaves called bracts.',
      'Dogwood berries feed birds through the fall and winter.',
      'Its leaves turn deep red in autumn.',
    ],
    wikiSpecies: 'Cornus_florida',
    inatTaxonId: 48835,
    photoRoles: ['whole', 'leaf', 'bark', 'flower', 'fruit'],
  },

  {
    code: 'eastern_white_pine',
    commonName: 'Eastern White Pine',
    scientificName: 'Pinus strobus',
    kind: 'tree',
    localTier: 'hyper_local',
    emoji: '🌲',
    seasons: ['spring', 'summer', 'fall', 'winter'],
    notableFeatures: [
      'long soft needles in bundles of five',
      'long slender cones',
      'tall straight trunk with horizontal branches',
    ],
    facts: [
      'White pines hold their needles in groups of FIVE — count them on your fingers: W-H-I-T-E.',
      'They can live for more than 200 years.',
      'You will see lots of them in the Red River Gorge.',
    ],
    wikiSpecies: 'Pinus_strobus',
    inatTaxonId: 47561,
    photoRoles: ['whole', 'leaf', 'bark', 'fruit'],
  },

  {
    code: 'shagbark_hickory',
    commonName: 'Shagbark Hickory',
    scientificName: 'Carya ovata',
    kind: 'tree',
    localTier: 'hyper_local',
    emoji: '🌳',
    seasons: ['spring', 'summer', 'fall', 'winter'],
    notableFeatures: [
      'shaggy bark that peels off in long curling strips',
      'leaves made of five leaflets in a row',
      'thick-shelled nuts in fall',
    ],
    facts: [
      'You can spot a Shagbark Hickory from far away — its bark looks like it is peeling in long strips.',
      'Squirrels love hickory nuts.',
      'A Shagbark can live for more than 200 years.',
    ],
    wikiSpecies: 'Carya_ovata',
    inatTaxonId: 60703,
    photoRoles: ['whole', 'leaf', 'bark', 'fruit'],
  },
];
