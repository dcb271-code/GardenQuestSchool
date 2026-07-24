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
