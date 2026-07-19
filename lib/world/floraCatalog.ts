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

export type FloraKind = 'tree' | 'flower' | 'fern' | 'shrub' | 'vine';
export type Season = 'spring' | 'summer' | 'fall' | 'winter';
export type LocalTier = 'hyper_local' | 'canonical_native';
export type PhotoRole = 'whole' | 'leaf' | 'bark' | 'flower' | 'fruit';

// Species that can hurt the learner on contact. Only 'touch' exists
// today (urushiol — the poison ivy rash). This flag inverts how the
// walk treats uncertainty: for every other species the walk eventually
// shows the answer, because a wrong guess about a trillium costs
// nothing. For a hazard species the *safe* answer IS "I'm not sure, so
// I won't touch it" — so repeated misses resolve to caution rather
// than to the answer, and the reveal is calm instead of celebratory.
export type FloraHazard = 'touch';

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
  hazard?: FloraHazard;          // set → walk switches to caution mode
  safetyNote?: string;           // shown on the reveal for hazard species
  // Harmless species that get mistaken for a hazard species. Their
  // reveal carries the reassurance half of the lesson ("this one is
  // safe — and leaving it alone was still a fine choice"), which is
  // what stops the hazard lesson from becoming a fear of all plants.
  hazardLookalike?: boolean;
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
    inatTaxonId: 53582,
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
    inatTaxonId: 48502,
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
    inatTaxonId: 54777,
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
    inatTaxonId: 52391,
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
    inatTaxonId: 54791,
    photoRoles: ['whole', 'leaf', 'bark', 'fruit'],
  },

  // ─── WILDFLOWERS ───────────────────────────────────────────────────

  {
    code: 'virginia_bluebells',
    commonName: 'Virginia Bluebells',
    scientificName: 'Mertensia virginica',
    kind: 'flower',
    localTier: 'hyper_local',
    emoji: '🌸',
    seasons: ['spring'],
    notableFeatures: [
      'pink buds that open into sky-blue trumpet-shaped flowers',
      'oval blue-green leaves',
      'grows in big patches in damp woods',
    ],
    facts: [
      'The flower buds start out pink and turn blue as they open.',
      'Virginia Bluebells are a spring ephemeral — they appear, bloom, and disappear in just a few weeks.',
      'You can find them in the Red River Gorge in April.',
    ],
    wikiSpecies: 'Mertensia_virginica',
    inatTaxonId: 59771,
    photoRoles: ['whole', 'flower', 'leaf'],
  },

  {
    code: 'mayapple',
    commonName: 'Mayapple',
    scientificName: 'Podophyllum peltatum',
    kind: 'flower',
    localTier: 'hyper_local',
    emoji: '🌿',
    seasons: ['spring', 'summer'],
    notableFeatures: [
      'big umbrella-shaped leaf',
      'single white flower hidden under the leaf',
      'green apple-shaped fruit (only ripe fruit is safe — everything else is toxic)',
    ],
    facts: [
      'The leaf looks like a tiny green umbrella.',
      'The white flower hides under the leaf — you have to bend down to see it.',
      'Only the ripe yellow fruit is safe to eat. Every other part of the plant is toxic.',
    ],
    wikiSpecies: 'Podophyllum_peltatum',
    inatTaxonId: 49288,
    photoRoles: ['whole', 'leaf', 'flower', 'fruit'],
  },

  {
    code: 'trillium',
    commonName: 'Large White Trillium',
    scientificName: 'Trillium grandiflorum',
    kind: 'flower',
    localTier: 'hyper_local',
    emoji: '🌸',
    seasons: ['spring'],
    notableFeatures: [
      'three white petals',
      'three broad leaves',
      'one flower per stem, on the forest floor',
    ],
    facts: [
      'Everything about a Trillium comes in threes — three petals, three leaves, three sepals.',
      'Trilliums are spring ephemerals and take up to seven years to bloom for the first time.',
      'Please never pick a Trillium — it might not bloom again for many years.',
    ],
    wikiSpecies: 'Trillium_grandiflorum',
    inatTaxonId: 55402,
    photoRoles: ['whole', 'flower', 'leaf'],
  },

  {
    code: 'cardinal_flower',
    commonName: 'Cardinal Flower',
    scientificName: 'Lobelia cardinalis',
    kind: 'flower',
    localTier: 'hyper_local',
    emoji: '🌺',
    seasons: ['summer'],
    notableFeatures: [
      'bright scarlet-red flowers in a tall spike',
      'long pointed dark green leaves',
      'grows near streams and wet meadows',
    ],
    facts: [
      'It is named after the red robes of Catholic cardinals.',
      'Hummingbirds love Cardinal Flowers — the long red tubes fit a hummingbird beak perfectly.',
      'It grows in wet places near streams.',
    ],
    wikiSpecies: 'Lobelia_cardinalis',
    inatTaxonId: 48038,
    photoRoles: ['whole', 'flower', 'leaf'],
  },

  {
    code: 'common_milkweed',
    commonName: 'Common Milkweed',
    scientificName: 'Asclepias syriaca',
    kind: 'flower',
    localTier: 'hyper_local',
    emoji: '🌸',
    seasons: ['summer', 'fall'],
    notableFeatures: [
      'pink-purple ball-shaped flower clusters',
      'broad oval leaves',
      'long pointy seedpods that split open with silky white floss in fall',
    ],
    facts: [
      'Monarch butterflies lay their eggs only on milkweed plants — the caterpillars eat nothing else.',
      'The stems make a sticky white sap that looks like milk if you snap a leaf.',
      'The seedpods split open in fall and float their seeds away on silky white parachutes.',
    ],
    wikiSpecies: 'Asclepias_syriaca',
    inatTaxonId: 47911,
    photoRoles: ['whole', 'flower', 'leaf', 'fruit'],
  },

  // ─── LEAVES OF THREE ───────────────────────────────────────────────
  // Poison ivy plus the three plants it actually gets confused with.
  // The lookalikes are not optional decoration: "leaves of three, let
  // it be" is uselessly overbroad on its own — box elder and fragrant
  // sumac ALSO have three leaflets, and Virginia creeper is what most
  // "is that poison ivy?" panics turn out to be. Without them in the
  // key, the lesson is "fear every plant"; with them it's a real
  // discrimination a 7-year-old can make.
  //
  // Kentucky observation counts (iNaturalist, place_id=26, checked
  // 2026-07-16) — all four are genuinely present in her world:
  //   poison ivy 2035 · virginia creeper 2258 · box elder 1742
  //   fragrant sumac 427
  // Atlantic poison oak (Toxicodendron pubescens) is deliberately
  // ABSENT: 0 observations in Kentucky. Teaching it here would spend a
  // child's attention on a plant she cannot meet.

  {
    code: 'poison_ivy',
    commonName: 'Poison Ivy',
    scientificName: 'Toxicodendron radicans',
    kind: 'vine',
    localTier: 'hyper_local',
    emoji: '⚠️',
    // Leaves needed to key it out. The bare winter vine is still
    // hazardous, but identifying it then is a different (harder) skill.
    seasons: ['spring', 'summer', 'fall'],
    notableFeatures: [
      'always exactly three leaflets',
      'the middle leaflet sits on its own little stalk',
      'leaves grow one at a time up the stem, never in pairs',
      'climbs trees on a rope that looks hairy',
    ],
    facts: [
      'Poison ivy always has three leaflets — never four, never five. "Leaves of three, let it be."',
      'The itch comes from an oil called urushiol. It is on every part of the plant, all year long.',
      'Birds eat the white berries and are not bothered at all — the oil only bothers people.',
    ],
    wikiSpecies: 'Toxicodendron_radicans',
    inatTaxonId: 58732,
    photoRoles: ['whole', 'leaf', 'bark', 'fruit'],
    hazard: 'touch',
    safetyNote: 'Do not touch it — the oil on the leaves gives most people an itchy rash. You do not need to be sure. If you think it might be poison ivy, leave it alone and tell a grown-up.',
  },

  {
    code: 'virginia_creeper',
    commonName: 'Virginia Creeper',
    scientificName: 'Parthenocissus quinquefolia',
    kind: 'vine',
    localTier: 'hyper_local',
    emoji: '🍃',
    seasons: ['spring', 'summer', 'fall'],
    notableFeatures: [
      'five leaflets spreading from one point, like fingers on a hand',
      'climbs walls and trees',
      'leaves turn bright red early in the fall',
    ],
    facts: [
      'Virginia creeper has FIVE leaflets — count them and you know it is not poison ivy.',
      'It climbs using tiny sticky pads on the ends of its tendrils, like little suction cups.',
      'It is one of the first plants to turn red in the fall.',
    ],
    wikiSpecies: 'Parthenocissus_quinquefolia',
    inatTaxonId: 50278,
    // No 'fruit' yet — the harvested berry candidates were macros that
    // showed no leaflets, and the five-leaflet leaf is the whole lesson.
    photoRoles: ['whole', 'leaf'],
    hazardLookalike: true,
  },

  {
    code: 'box_elder',
    commonName: 'Box Elder',
    scientificName: 'Acer negundo',
    kind: 'tree',
    localTier: 'hyper_local',
    emoji: '🌳',
    seasons: ['spring', 'summer', 'fall'],
    notableFeatures: [
      'three leaflets, like poison ivy',
      'but its leaves grow in PAIRS, straight across from each other',
      'a young tree, not a climbing vine',
    ],
    facts: [
      'Box elder fools people all the time — it has three leaflets just like poison ivy.',
      'The trick: box elder leaves grow in pairs across from each other. Poison ivy leaves take turns up the stem.',
      'Box elder is a kind of maple, so it makes little helicopter seeds.',
    ],
    wikiSpecies: 'Acer_negundo',
    inatTaxonId: 47726,
    photoRoles: ['whole', 'leaf', 'bark'],
    hazardLookalike: true,
  },

  {
    code: 'fragrant_sumac',
    commonName: 'Fragrant Sumac',
    scientificName: 'Rhus aromatica',
    kind: 'shrub',
    localTier: 'hyper_local',
    emoji: '🌿',
    seasons: ['spring', 'summer', 'fall'],
    notableFeatures: [
      'three leaflets, like poison ivy',
      'but the middle leaflet sits right against the stem with no stalk',
      'a low bushy shrub',
      'fuzzy red berries',
    ],
    facts: [
      'Fragrant sumac has three leaflets too — but its middle leaflet has no little stalk.',
      'Crush a leaf and it smells citrusy. That is how it got the name "fragrant".',
      'Its fuzzy red berries feed birds through the winter.',
    ],
    wikiSpecies: 'Rhus_aromatica',
    inatTaxonId: 58738,
    photoRoles: ['whole', 'leaf', 'fruit'],
    hazardLookalike: true,
  },

  // ─── EVERYDAY GIANTS (2026-07 expansion) ──────────────────────────
  // The trees she walks past daily — instant real-world recognition.

  {
    code: 'white_oak',
    commonName: 'White Oak',
    scientificName: 'Quercus alba',
    kind: 'tree',
    localTier: 'hyper_local',
    emoji: '🌳',
    seasons: ['spring', 'summer', 'fall', 'winter'],
    notableFeatures: [
      'leaves with rounded finger-like lobes — no points, no bristles',
      'pale grey bark in loose flaky plates',
      'acorns with a bumpy cap covering about a quarter of the nut',
    ],
    facts: [
      'A white oak can live 300 years or more — some alive today were seedlings before Kentucky was a state.',
      'One big oak can drop ten thousand acorns in a good year. Squirrels, deer, turkeys, and blue jays all come to dinner.',
      'You can tell white oaks from red oaks by the leaf tips: white oak lobes are ROUND, red oak lobes end in little bristle points.',
    ],
    wikiSpecies: 'Quercus_alba',
    inatTaxonId: 54779,
    photoRoles: ['whole', 'leaf', 'bark', 'fruit'],
  },

  {
    code: 'red_maple',
    commonName: 'Red Maple',
    scientificName: 'Acer rubrum',
    kind: 'tree',
    localTier: 'hyper_local',
    emoji: '🍁',
    seasons: ['spring', 'summer', 'fall'],
    notableFeatures: [
      'leaves with 3 pointy lobes and V-shaped notches between them',
      'leaves grow in PAIRS, directly across from each other',
      'something on it is red in every season — buds, flowers, stems, or fall leaves',
    ],
    facts: [
      'Red maple keeps its promise all year: red buds in winter, red flowers in early spring, red leaf-stems in summer, red leaves in fall.',
      'Its winged seeds are called samaras — kids call them helicopters. Throw one up and watch it spin.',
      'Maple leaves always grow two-by-two, exactly opposite each other on the twig. Oaks and most other trees take turns instead.',
    ],
    wikiSpecies: 'Acer_rubrum',
    inatTaxonId: 48098,
    photoRoles: ['whole', 'leaf', 'bark', 'flower', 'fruit'],
  },

  {
    code: 'sweetgum',
    commonName: 'Sweetgum',
    scientificName: 'Liquidambar styraciflua',
    kind: 'tree',
    localTier: 'hyper_local',
    emoji: '⭐',
    seasons: ['spring', 'summer', 'fall', 'winter'],
    notableFeatures: [
      'star-shaped leaves with five sharp points',
      'spiky round seed balls ("gumballs") that litter the ground',
      'twigs sometimes have corky ridges like little wings',
    ],
    facts: [
      'Every sweetgum leaf is a five-pointed star — crush one gently and it smells sweet, which is how the tree got its name.',
      'The spiky gumballs are seed cases. Each one held dozens of tiny seeds that goldfinches love.',
      'In fall a single sweetgum can wear yellow, orange, red, and deep purple leaves all at the same time.',
    ],
    wikiSpecies: 'Liquidambar_styraciflua',
    inatTaxonId: 49658,
    photoRoles: ['whole', 'leaf', 'bark', 'fruit'],
  },

  {
    code: 'american_sycamore',
    commonName: 'American Sycamore',
    scientificName: 'Platanus occidentalis',
    kind: 'tree',
    localTier: 'hyper_local',
    emoji: '🦴',
    seasons: ['spring', 'summer', 'fall', 'winter'],
    notableFeatures: [
      'camouflage bark — patches of grey, green, and cream where it peels',
      'upper branches turn ghost-white',
      'huge maple-ish leaves, and round seed balls on long strings',
    ],
    facts: [
      'Sycamore bark cannot stretch, so it flakes off in puzzle pieces — that is what makes the camouflage pattern.',
      'The higher you look, the whiter the branches get. In winter a sycamore looks like white bones against the sky.',
      'Sycamores love water. Find one and a creek is usually close by — old explorers used them to find rivers.',
    ],
    wikiSpecies: 'Platanus_occidentalis',
    inatTaxonId: 49662,
    photoRoles: ['whole', 'leaf', 'bark', 'fruit'],
  },

  // ─── MEADOW & ROADSIDE ────────────────────────────────────────────
  // The "weeds" kids actually pick.

  {
    code: 'dandelion',
    commonName: 'Dandelion',
    scientificName: 'Taraxacum officinale',
    kind: 'flower',
    localTier: 'hyper_local',
    emoji: '🌼',
    seasons: ['spring', 'summer', 'fall'],
    notableFeatures: [
      'one bright yellow flower on a hollow, milky stem',
      'jagged tooth-edged leaves in a circle at the ground',
      'turns into the famous white wish-puff seed head',
    ],
    facts: [
      'The name comes from French — dent de lion, "lion\'s tooth" — for the jagged leaves.',
      'One wish-puff can carry two hundred seeds, each on its own tiny parachute that can ride the wind for miles.',
      'A dandelion flower is really a bouquet: every yellow strap is its own little flower packed in with a hundred others.',
    ],
    wikiSpecies: 'Taraxacum_officinale',
    inatTaxonId: 47602,
    photoRoles: ['whole', 'leaf', 'flower', 'fruit'],
  },

  {
    code: 'black_eyed_susan',
    commonName: 'Black-eyed Susan',
    scientificName: 'Rudbeckia hirta',
    kind: 'flower',
    localTier: 'hyper_local',
    emoji: '🌻',
    seasons: ['summer', 'fall'],
    notableFeatures: [
      'golden petals around a dark chocolate-brown dome',
      'rough, hairy stems and leaves',
      'blooms in big cheerful patches along roads and meadows',
    ],
    facts: [
      'The "black eye" is a dome of hundreds of tiny dark flowers — the golden petals are just the frame around them.',
      'Run a finger up the stem: it is fuzzy like a kitten\'s tongue. The hairs help keep crawling insects from stealing nectar.',
      'Bees and butterflies see patterns on the petals that people cannot — landing stripes in ultraviolet light.',
    ],
    wikiSpecies: 'Rudbeckia_hirta',
    inatTaxonId: 62741,
    // No leaf role: every harvested "leaf" frame had other species'
    // foliage tangled in (vetch photobombs) — teaching the wrong
    // leaves is worse than teaching none.
    photoRoles: ['whole', 'flower'],
  },

  {
    code: 'tall_goldenrod',
    commonName: 'Goldenrod',
    scientificName: 'Solidago altissima',
    kind: 'flower',
    localTier: 'hyper_local',
    emoji: '🌾',
    seasons: ['summer', 'fall'],
    notableFeatures: [
      'a plume of hundreds of tiny golden flowers, arching like a firework',
      'tall single stems in big patches',
      'blooms late, when most flowers are finished',
    ],
    facts: [
      'Goldenrod is Kentucky\'s state flower — those golden September fields are the state saying hello.',
      'It gets blamed for fall sneezes, but goldenrod pollen is heavy and sticky and travels by BEE, not by wind. The real sneeze-maker is ragweed, blooming quietly nearby.',
      'Over a hundred kinds of butterflies, bees, and beetles visit goldenrod — it is the last big diner open before winter.',
    ],
    wikiSpecies: 'Solidago_altissima',
    inatTaxonId: 79148,
    photoRoles: ['whole', 'leaf', 'flower'],
  },

  {
    code: 'chicory',
    commonName: 'Chicory',
    scientificName: 'Cichorium intybus',
    kind: 'flower',
    localTier: 'hyper_local',
    emoji: '🩵',
    seasons: ['summer', 'fall'],
    notableFeatures: [
      'sky-blue flowers with square-tipped, fringed petals',
      'grows on tough wiry stems along roadsides',
      'each flower lasts a single morning',
    ],
    facts: [
      'Chicory flowers are morning people: they open at sunrise and usually close by lunchtime.',
      'True-blue flowers are rare in nature — chicory blue is so distinctive that the color is named after it in some languages.',
      'People roast chicory roots to make a coffee-like drink — New Orleans still loves it.',
    ],
    wikiSpecies: 'Cichorium_intybus',
    inatTaxonId: 52913,
    photoRoles: ['whole', 'leaf', 'flower'],
  },

  // ─── CURIOUS CHARACTERS ───────────────────────────────────────────
  // Maximum wonder-per-plant.

  {
    code: 'jewelweed',
    commonName: 'Jewelweed',
    scientificName: 'Impatiens capensis',
    kind: 'flower',
    localTier: 'hyper_local',
    emoji: '🧡',
    seasons: ['summer', 'fall'],
    notableFeatures: [
      'orange trumpet flowers with red freckles, hanging like earrings',
      'fat ripe seed pods that POP when touched',
      'rain beads up on the leaves like silver jewels',
    ],
    facts: [
      'Its other name is touch-me-not — but you SHOULD touch the fat pods: they explode and fling seeds, and it never gets old.',
      'Water rolls up into silver beads on the leaves. Dip a leaf underwater and it turns shiny like foil.',
      'Jewelweed often grows near poison ivy, and old woods-wisdom says its juice soothes the itch. Scientists still argue; hummingbirds do not care and drink from it anyway.',
    ],
    wikiSpecies: 'Impatiens_capensis',
    inatTaxonId: 47888,
    photoRoles: ['whole', 'leaf', 'flower', 'fruit'],
  },

  {
    code: 'jack_in_the_pulpit',
    commonName: 'Jack-in-the-Pulpit',
    scientificName: 'Arisaema triphyllum',
    kind: 'flower',
    localTier: 'canonical_native',
    emoji: '🎪',
    seasons: ['spring', 'summer'],
    notableFeatures: [
      'a striped green hood curling over a little spike ("Jack" in his pulpit)',
      'leaves of three large leaflets — but soft, matte, and all from one stalk at the ground',
      'a club of bright red berries in late summer',
    ],
    facts: [
      'The stripy hood is a tiny roofed room. "Jack" is the spike inside, and small flies are his only visitors.',
      'It has three leaflets like poison ivy — but Jack grows straight from the forest floor on its own stalk, never climbing, never shiny.',
      'A plant can change its mind about being male or female from year to year, depending on how much food its root stored.',
    ],
    wikiSpecies: 'Arisaema_triphyllum',
    inatTaxonId: 50310,
    photoRoles: ['whole', 'leaf', 'flower', 'fruit'],
    hazardLookalike: true,
  },

  {
    code: 'cattail',
    commonName: 'Cattail',
    scientificName: 'Typha latifolia',
    kind: 'flower',
    localTier: 'hyper_local',
    emoji: '🌭',
    seasons: ['spring', 'summer', 'fall', 'winter'],
    notableFeatures: [
      'the famous brown corn-dog head on a tall stalk',
      'flat sword-shaped leaves taller than a grown-up',
      'always standing in or beside still water',
    ],
    facts: [
      'The brown "corn dog" is a package of up to a quarter of a MILLION seeds. In winter it bursts into a snowstorm of fluff.',
      'Red-winged blackbirds build their nests by weaving cattail leaves; muskrats build whole lodges out of the stalks.',
      'Cattails are water-cleaners: their roots catch mud and soak up pollution, so ponds with cattails run clearer.',
    ],
    wikiSpecies: 'Typha_latifolia',
    inatTaxonId: 48685,
    photoRoles: ['whole', 'leaf', 'fruit'],
  },

  {
    code: 'pawpaw',
    commonName: 'Pawpaw',
    scientificName: 'Asimina triloba',
    kind: 'tree',
    localTier: 'hyper_local',
    emoji: '🥭',
    seasons: ['spring', 'summer', 'fall'],
    notableFeatures: [
      'huge droopy tropical-looking leaves, biggest at the branch tip',
      'greenish fruit like a small lumpy mango — the "Kentucky banana"',
      'grows in shady patches, many trunks together',
    ],
    facts: [
      'Pawpaw is the biggest fruit native to North America — it tastes like banana custard with mango, and Kentucky is right in pawpaw country.',
      'Its deep-maroon spring flowers smell faintly of old socks on purpose: they are inviting flies and beetles, not bees.',
      'Zebra swallowtail caterpillars eat pawpaw leaves and nothing else — find a pawpaw patch and you may find that butterfly.',
    ],
    wikiSpecies: 'Asimina_triloba',
    inatTaxonId: 50897,
    photoRoles: ['whole', 'leaf', 'bark', 'flower', 'fruit'],
  },
];
