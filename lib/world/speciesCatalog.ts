/**
 * Kid-friendly conservation status. A soft three-step version of the
 * real-world "how much trouble is this creature in?" scale, honest to
 * each species but framed for a 6–10 year old:
 *   stable     → doing fine in the world right now
 *   needs_help → its numbers are slipping; gardens genuinely help
 *   in_danger  → truly rare and struggling
 */
export type ConservationStatus = 'stable' | 'needs_help' | 'in_danger';

export interface SpeciesData {
  code: string;
  commonName: string;
  scientificName: string;
  description: string;
  funFact: string;
  illustrationKey: string;
  emoji: string;
  habitatReqCodes: string[];
  /** Real-world-ish conservation status. Absent is treated as 'stable'. */
  conservationStatus?: ConservationStatus;
  /**
   * Rare visitor: only arrives once EVERY required habitat has earned
   * its researcher badge (the Level-3+ post-build science quest —
   * see researcherQuests.ts). Quest-gated, not count-gated, so it
   * can't be farmed on easy structures.
   */
  requiresResearcherBadge?: boolean;
}

export interface ConservationDisplay {
  /** Warm label a child reads, e.g. "needs our help". */
  label: string;
  emoji: string;
  /** Tailwind fragment for the small badge: background + border + text. */
  badgeClass: string;
  /** One gentle line, shown only for friends who need us. */
  note?: string;
}

/**
 * The one place status → how-it-looks lives. Colours are drawn from the
 * app palette (forest / ochre / terracotta) so the badge sits happily
 * next to everything else.
 */
export const CONSERVATION_DISPLAY: Record<ConservationStatus, ConservationDisplay> = {
  stable: {
    label: 'doing fine',
    emoji: '🌿',
    badgeClass: 'bg-forest/10 border-forest/40 text-forest',
  },
  needs_help: {
    label: 'needs our help',
    emoji: '💛',
    badgeClass: 'bg-ochre/25 border-ochre text-bark',
    note: 'Gardens like yours help this friend.',
  },
  in_danger: {
    label: 'in danger',
    emoji: '🧡',
    badgeClass: 'bg-terracotta/25 border-terracotta text-bark',
    note: 'This friend really needs gardens like yours.',
  },
};

/** Status for a species, defaulting a missing value to 'stable'. */
export function conservationOf(species: SpeciesData): ConservationDisplay {
  return CONSERVATION_DISPLAY[species.conservationStatus ?? 'stable'];
}

export const SPECIES_CATALOG: SpeciesData[] = [
  { code: 'leafcutter_ant', commonName: 'Leafcutter Ant', scientificName: 'Atta cephalotes',
    description: 'Ants that cut and carry leaves back to their colony to grow fungus gardens.',
    funFact: 'Leafcutters are farmers! They grow fungus on leaves and eat the fungus, not the leaves.',
    illustrationKey: 'leafcutter', emoji: '🐜', habitatReqCodes: ['ant_hill'], conservationStatus: 'stable' },
  { code: 'carpenter_ant', commonName: 'Carpenter Ant', scientificName: 'Camponotus',
    description: 'Large black ants that tunnel into dead wood.',
    funFact: "Carpenter ants don't eat wood — they just move through it to make rooms.",
    illustrationKey: 'carpenter_ant', emoji: '🐜', habitatReqCodes: ['ant_hill'], conservationStatus: 'stable' },
  { code: 'monarch', commonName: 'Monarch Butterfly', scientificName: 'Danaus plexippus',
    description: 'Orange and black butterflies that migrate thousands of miles.',
    funFact: 'Monarchs only lay their eggs on milkweed plants — their babies eat nothing else.',
    illustrationKey: 'monarch', emoji: '🦋', habitatReqCodes: ['butterfly_bush'], conservationStatus: 'needs_help' },
  { code: 'swallowtail', commonName: 'Swallowtail', scientificName: 'Papilio',
    description: 'Large butterflies with tail-like wing extensions.',
    funFact: 'The "tails" confuse predators — they aim for the tail thinking it is a head.',
    illustrationKey: 'swallowtail', emoji: '🦋', habitatReqCodes: ['butterfly_bush'], conservationStatus: 'stable' },
  { code: 'skipper', commonName: 'Skipper Butterfly', scientificName: 'Hesperiidae',
    description: 'Small, fast butterflies that skip from flower to flower.',
    funFact: 'Skippers fly so fast they can hover like hummingbirds.',
    illustrationKey: 'skipper', emoji: '🦋', habitatReqCodes: ['butterfly_bush'], conservationStatus: 'stable' },
  { code: 'mason_bee', commonName: 'Mason Bee', scientificName: 'Osmia',
    description: 'Gentle solitary bees that seal their nests with mud.',
    funFact: 'A single mason bee pollinates as many flowers as 100 honeybees.',
    illustrationKey: 'mason_bee', emoji: '🐝', habitatReqCodes: ['bee_hotel'], conservationStatus: 'stable' },
  { code: 'honey_bee', commonName: 'Honey Bee', scientificName: 'Apis mellifera',
    description: 'Social bees that live in hives and make honey.',
    funFact: 'A honey bee visits about 2 million flowers to make a single jar of honey.',
    illustrationKey: 'honey_bee', emoji: '🐝', habitatReqCodes: ['bee_hotel'], conservationStatus: 'stable' },
  { code: 'bumble_bee', commonName: 'Bumble Bee', scientificName: 'Bombus',
    description: 'Fuzzy bees that buzz loudly from flower to flower.',
    funFact: 'Bumble bees can fly in colder weather than honey bees.',
    illustrationKey: 'bumble_bee', emoji: '🐝', habitatReqCodes: ['bee_hotel'], conservationStatus: 'needs_help' },
  { code: 'ladybug', commonName: 'Ladybug', scientificName: 'Coccinellidae',
    description: 'Small red beetles with black spots.',
    funFact: 'Ladybugs are farmers\' friends — a single ladybug eats thousands of aphids.',
    illustrationKey: 'ladybug', emoji: '🐞', habitatReqCodes: ['log_pile'], conservationStatus: 'stable' },
  { code: 'centipede', commonName: 'Centipede', scientificName: 'Chilopoda',
    description: 'Fast-moving creatures with many legs.',
    funFact: 'Despite the name, centipedes have 15 to 177 legs — never exactly 100.',
    illustrationKey: 'centipede', emoji: '🦗', habitatReqCodes: ['log_pile'], conservationStatus: 'stable' },
  { code: 'firefly', commonName: 'Firefly', scientificName: 'Lampyridae',
    description: 'Beetles that glow in the dark to find mates.',
    funFact: 'Firefly light is the most efficient in nature — no heat, almost all light.',
    illustrationKey: 'firefly', emoji: '✨', habitatReqCodes: ['log_pile'], conservationStatus: 'needs_help' },
  { code: 'tree_frog', commonName: 'Tree Frog', scientificName: 'Hylidae',
    description: 'Small frogs with sticky toe pads for climbing.',
    funFact: 'Tree frogs can stick to glass — their toe pads make natural suction cups.',
    illustrationKey: 'tree_frog', emoji: '🐸', habitatReqCodes: ['frog_pond'], conservationStatus: 'stable' },
  { code: 'spring_peeper', commonName: 'Spring Peeper', scientificName: 'Pseudacris crucifer',
    description: 'Tiny frogs with X-shaped marks, known for their springtime chorus.',
    funFact: 'A spring peeper\'s peep can be heard over a kilometer away.',
    illustrationKey: 'spring_peeper', emoji: '🐸', habitatReqCodes: ['frog_pond'], conservationStatus: 'stable' },
  { code: 'cottontail_rabbit', commonName: 'Cottontail Rabbit', scientificName: 'Sylvilagus',
    description: 'Wild rabbits with fluffy white tails.',
    funFact: 'Cottontails can run up to 18 mph and zigzag to escape predators.',
    illustrationKey: 'cottontail', emoji: '🐰', habitatReqCodes: ['bunny_burrow'], conservationStatus: 'stable' },

  // ── THE FEEDER BIRDS ───────────────────────────────────────────────
  //
  // The ten birds of the /birds curriculum, as garden creatures. They
  // are ordinary arrivals, not rare visitors: the point is that a bird
  // she has learned to recognise turns up at her feeder and then LIVES
  // there, so the curriculum and the garden stop being separate games.
  //
  // Text is drawn from birdCatalog.ts rather than written afresh —
  // same bird, same facts, one source of truth. Descriptions are the
  // colour hook (what she was taught to look for) and the fun fact is
  // the hook the bird curriculum leads with.
  //
  // Codes MATCH the bird catalog codes exactly. That is load-bearing:
  // the residents' tap-to-sing feature looks up bird_audio by species
  // code, and getBird() resolves the same string.
  { code: 'northern_cardinal', commonName: 'Northern Cardinal', scientificName: 'Cardinalis cardinalis',
    description: 'The male is scarlet all over with a black mask. The female is warm buff-brown — but she has the same crest and the same heavy orange bill.',
    funFact: "Kentucky's state bird. Schoolchildren campaigned for it, and the state agreed in 1926.",
    illustrationKey: 'northern_cardinal', emoji: '🐦', habitatReqCodes: ['bird_feeder'], conservationStatus: 'stable' },
  { code: 'blue_jay', commonName: 'Blue Jay', scientificName: 'Cyanocitta cristata',
    description: 'Bright blue above, clean white below, with a black necklace across the throat and a tall blue crest.',
    funFact: 'The blue is not paint. There is no blue pigment in the feather at all — it is built to scatter light so only blue bounces back. Crush one and the blue vanishes.',
    illustrationKey: 'blue_jay', emoji: '🐦', habitatReqCodes: ['bird_feeder'], conservationStatus: 'stable' },
  { code: 'mourning_dove', commonName: 'Mourning Dove', scientificName: 'Zenaida macroura',
    description: 'Soft fawn-grey all over, slim, with a very long pointed tail and a small round head.',
    funFact: 'The whistling when a dove takes off is not its voice — it is the wings. Specially shaped feathers make the sound, and it warns the whole flock that something is wrong.',
    illustrationKey: 'mourning_dove', emoji: '🕊️', habitatReqCodes: ['bird_feeder'], conservationStatus: 'stable' },
  { code: 'carolina_chickadee', commonName: 'Carolina Chickadee', scientificName: 'Poecile carolinensis',
    description: 'Tiny and round, grey above and pale below, with a black cap and a black bib — and a bright white cheek squeezed between them.',
    funFact: 'It hides seeds one at a time in bark cracks and remembers thousands of hiding places. In autumn the memory part of its brain grows new cells to hold them all.',
    illustrationKey: 'carolina_chickadee', emoji: '🐦', habitatReqCodes: ['bird_feeder'], conservationStatus: 'stable' },
  { code: 'american_robin', commonName: 'American Robin', scientificName: 'Turdus migratorius',
    description: 'Dark grey back, warm orange breast, yellow bill. Upright and long-legged on the grass.',
    funFact: 'When a robin tilts its head on the lawn, it is aiming one eye at the ground. Its eyes are on the sides of its head, so it cannot look straight down with both at once.',
    illustrationKey: 'american_robin', emoji: '🐦', habitatReqCodes: ['bird_feeder'], conservationStatus: 'stable' },
  { code: 'tufted_titmouse', commonName: 'Tufted Titmouse', scientificName: 'Baeolophus bicolor',
    description: 'Soft grey above, white below, with a peachy wash down the sides — a grey crest and a very big black eye.',
    funFact: 'It lines its nest with fur, and it pulls the fur off live animals to get it — squirrels, dogs, even people.',
    illustrationKey: 'tufted_titmouse', emoji: '🐦', habitatReqCodes: ['bird_feeder'], conservationStatus: 'stable' },
  { code: 'white_breasted_nuthatch', commonName: 'White-breasted Nuthatch', scientificName: 'Sitta carolinensis',
    description: 'Blue-grey back, clean white face and chest, black cap. Looks like it has no neck and almost no tail.',
    funFact: 'It walks DOWN tree trunks head-first, which lets it spot insects hiding in bark that every upward-climbing bird walked straight past.',
    illustrationKey: 'white_breasted_nuthatch', emoji: '🐦', habitatReqCodes: ['bird_feeder'], conservationStatus: 'stable' },
  { code: 'carolina_wren', commonName: 'Carolina Wren', scientificName: 'Thryothorus ludovicianus',
    description: 'Warm rusty brown above, buff below, with a bold white stripe over the eye — and the tail cocked straight up.',
    funFact: 'It weighs about as much as four paperclips and has one of the loudest voices in the yard. The male may sing his teakettle song three thousand times in a day.',
    illustrationKey: 'carolina_wren', emoji: '🐦', habitatReqCodes: ['bird_feeder'], conservationStatus: 'stable' },
  { code: 'american_goldfinch', commonName: 'American Goldfinch', scientificName: 'Spinus tristis',
    description: 'In summer the male is brilliant lemon yellow with a black cap and black wings. In winter the same bird is drab olive-buff.',
    funFact: 'Summer gold and winter olive are the same bird in a different coat — the black wings with white bars stay the same whatever else changes.',
    illustrationKey: 'american_goldfinch', emoji: '🐤', habitatReqCodes: ['bird_feeder'], conservationStatus: 'stable' },
  { code: 'house_finch', commonName: 'House Finch', scientificName: 'Haemorhous mexicanus',
    description: 'The male has red on his forehead, throat and rump over a plain brown back. The female is brown and streaky with a blank face.',
    funFact: 'Not originally an eastern bird. New York pet shops sold them illegally as "Hollywood Finches", and in 1940 the sellers set them loose to avoid arrest. They reached Kentucky in the late 1970s.',
    illustrationKey: 'house_finch', emoji: '🐦', habitatReqCodes: ['bird_feeder'], conservationStatus: 'stable' },

  // ── RARE VISITORS — researcher-badge gated (Level 3+ science) ──────
  { code: 'painted_turtle', commonName: 'Painted Turtle', scientificName: 'Chrysemys picta',
    description: 'A pond turtle with red and yellow stripes along its shell edge, famous for sunbathing in stacks.',
    funFact: 'Painted turtles pile on top of each other to bask — the sun\'s warmth is how they power up, since they can\'t make their own body heat.',
    illustrationKey: 'painted_turtle', emoji: '🐢', habitatReqCodes: ['frog_pond'],
    conservationStatus: 'stable', requiresResearcherBadge: true },
  { code: 'spotted_salamander', commonName: 'Spotted Salamander', scientificName: 'Ambystoma maculatum',
    description: 'A secretive blue-black salamander with two rows of yellow polka dots, who lives under logs and breeds in spring pools.',
    funFact: 'Its eggs have algae living INSIDE them — the algae make oxygen for the babies and get a safe home in return. Scientists call that symbiosis.',
    illustrationKey: 'spotted_salamander', emoji: '🦎', habitatReqCodes: ['log_pile', 'frog_pond'],
    conservationStatus: 'needs_help', requiresResearcherBadge: true },
  { code: 'luna_moth', commonName: 'Luna Moth', scientificName: 'Actias luna',
    description: 'A big pale-green moth with long swallow tails on its wings, flying only on spring and summer nights.',
    funFact: 'Adult luna moths have no mouth at all — they live about a week on energy saved up as a caterpillar. Turning off porch lights helps them find each other.',
    illustrationKey: 'luna_moth', emoji: '🦋', habitatReqCodes: ['butterfly_bush'],
    conservationStatus: 'needs_help', requiresResearcherBadge: true },
];

export function getSpeciesByCode(code: string): SpeciesData | undefined {
  return SPECIES_CATALOG.find(s => s.code === code);
}
