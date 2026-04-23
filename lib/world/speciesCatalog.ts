export interface SpeciesData {
  code: string;
  commonName: string;
  scientificName: string;
  description: string;
  funFact: string;
  illustrationKey: string;
  emoji: string;
  habitatReqCodes: string[];
}

export const SPECIES_CATALOG: SpeciesData[] = [
  { code: 'leafcutter_ant', commonName: 'Leafcutter Ant', scientificName: 'Atta cephalotes',
    description: 'Ants that cut and carry leaves back to their colony to grow fungus gardens.',
    funFact: 'Leafcutters are farmers! They grow fungus on leaves and eat the fungus, not the leaves.',
    illustrationKey: 'leafcutter', emoji: '🐜', habitatReqCodes: ['ant_hill'] },
  { code: 'carpenter_ant', commonName: 'Carpenter Ant', scientificName: 'Camponotus',
    description: 'Large black ants that tunnel into dead wood.',
    funFact: "Carpenter ants don't eat wood — they just move through it to make rooms.",
    illustrationKey: 'carpenter_ant', emoji: '🐜', habitatReqCodes: ['ant_hill'] },
  { code: 'monarch', commonName: 'Monarch Butterfly', scientificName: 'Danaus plexippus',
    description: 'Orange and black butterflies that migrate thousands of miles.',
    funFact: 'Monarchs only lay their eggs on milkweed plants — their babies eat nothing else.',
    illustrationKey: 'monarch', emoji: '🦋', habitatReqCodes: ['butterfly_bush'] },
  { code: 'swallowtail', commonName: 'Swallowtail', scientificName: 'Papilio',
    description: 'Large butterflies with tail-like wing extensions.',
    funFact: 'The "tails" confuse predators — they aim for the tail thinking it is a head.',
    illustrationKey: 'swallowtail', emoji: '🦋', habitatReqCodes: ['butterfly_bush'] },
  { code: 'skipper', commonName: 'Skipper Butterfly', scientificName: 'Hesperiidae',
    description: 'Small, fast butterflies that skip from flower to flower.',
    funFact: 'Skippers fly so fast they can hover like hummingbirds.',
    illustrationKey: 'skipper', emoji: '🦋', habitatReqCodes: ['butterfly_bush'] },
  { code: 'mason_bee', commonName: 'Mason Bee', scientificName: 'Osmia',
    description: 'Gentle solitary bees that seal their nests with mud.',
    funFact: 'A single mason bee pollinates as many flowers as 100 honeybees.',
    illustrationKey: 'mason_bee', emoji: '🐝', habitatReqCodes: ['bee_hotel'] },
  { code: 'honey_bee', commonName: 'Honey Bee', scientificName: 'Apis mellifera',
    description: 'Social bees that live in hives and make honey.',
    funFact: 'A honey bee visits about 2 million flowers to make a single jar of honey.',
    illustrationKey: 'honey_bee', emoji: '🐝', habitatReqCodes: ['bee_hotel'] },
  { code: 'bumble_bee', commonName: 'Bumble Bee', scientificName: 'Bombus',
    description: 'Fuzzy bees that buzz loudly from flower to flower.',
    funFact: 'Bumble bees can fly in colder weather than honey bees.',
    illustrationKey: 'bumble_bee', emoji: '🐝', habitatReqCodes: ['bee_hotel'] },
  { code: 'ladybug', commonName: 'Ladybug', scientificName: 'Coccinellidae',
    description: 'Small red beetles with black spots.',
    funFact: 'Ladybugs are farmers\' friends — a single ladybug eats thousands of aphids.',
    illustrationKey: 'ladybug', emoji: '🐞', habitatReqCodes: ['log_pile'] },
  { code: 'centipede', commonName: 'Centipede', scientificName: 'Chilopoda',
    description: 'Fast-moving creatures with many legs.',
    funFact: 'Despite the name, centipedes have 15 to 177 legs — never exactly 100.',
    illustrationKey: 'centipede', emoji: '🦗', habitatReqCodes: ['log_pile'] },
  { code: 'firefly', commonName: 'Firefly', scientificName: 'Lampyridae',
    description: 'Beetles that glow in the dark to find mates.',
    funFact: 'Firefly light is the most efficient in nature — no heat, almost all light.',
    illustrationKey: 'firefly', emoji: '✨', habitatReqCodes: ['log_pile'] },
  { code: 'tree_frog', commonName: 'Tree Frog', scientificName: 'Hylidae',
    description: 'Small frogs with sticky toe pads for climbing.',
    funFact: 'Tree frogs can stick to glass — their toe pads make natural suction cups.',
    illustrationKey: 'tree_frog', emoji: '🐸', habitatReqCodes: ['frog_pond'] },
  { code: 'spring_peeper', commonName: 'Spring Peeper', scientificName: 'Pseudacris crucifer',
    description: 'Tiny frogs with X-shaped marks, known for their springtime chorus.',
    funFact: 'A spring peeper\'s peep can be heard over a kilometer away.',
    illustrationKey: 'spring_peeper', emoji: '🐸', habitatReqCodes: ['frog_pond'] },
  { code: 'cottontail_rabbit', commonName: 'Cottontail Rabbit', scientificName: 'Sylvilagus',
    description: 'Wild rabbits with fluffy white tails.',
    funFact: 'Cottontails can run up to 18 mph and zigzag to escape predators.',
    illustrationKey: 'cottontail', emoji: '🐰', habitatReqCodes: ['bunny_burrow'] },
];

export function getSpeciesByCode(code: string): SpeciesData | undefined {
  return SPECIES_CATALOG.find(s => s.code === code);
}
