export interface HabitatTypeData {
  code: string;
  name: string;
  description: string;
  attractsSpeciesCodes: string[];
  prereqSkillCodes: string[];
  illustrationKey: string;
  emoji: string;
  /**
   * Emergent-curriculum tags emitted as interest signals when the
   * learner builds this habitat. Must match skill themeTags or they
   * bias nothing (enforced by tests/world/habitatCatalog.test.ts).
   */
  interestTags: string[];
}

export const HABITAT_CATALOG: HabitatTypeData[] = [
  {
    code: 'ant_hill',
    name: 'Ant Hill',
    description: 'A tall mound where ant colonies tunnel and forage.',
    attractsSpeciesCodes: ['leafcutter_ant', 'carpenter_ant'],
    prereqSkillCodes: ['math.counting.to_50'],
    illustrationKey: 'ant_hill',
    emoji: '🐜',
    interestTags: ['ants', 'insects', 'counting'],
  },
  {
    code: 'butterfly_bush',
    name: 'Butterfly Bush',
    description: 'Nectar-rich flowers that attract monarchs and swallowtails.',
    attractsSpeciesCodes: ['monarch', 'swallowtail', 'skipper', 'luna_moth'],
    prereqSkillCodes: ['math.add.within_20.crossing_ten'],
    illustrationKey: 'butterfly_bush',
    emoji: '🦋',
    interestTags: ['butterflies', 'insects', 'flowers'],
  },
  {
    code: 'bee_hotel',
    name: 'Bee Hotel',
    description: 'Hollow tubes where solitary bees nest and raise their young.',
    attractsSpeciesCodes: ['mason_bee', 'honey_bee', 'bumble_bee'],
    // Different prereq from Butterfly Bush (which needs make-10 add)
    // so the two adjacent habitats reward separate practice. The
    // hexagonal cells of a bee hotel echo part-whole structure, hence
    // number-bond as the unlock skill.
    prereqSkillCodes: ['math.number_bond.within_10'],
    illustrationKey: 'bee_hotel',
    emoji: '🐝',
    interestTags: ['bees', 'insects', 'part_whole'],
  },
  {
    code: 'frog_pond',
    name: 'Frog Pond',
    description: 'A shallow pool where frogs sing in the evening.',
    attractsSpeciesCodes: ['tree_frog', 'spring_peeper', 'painted_turtle', 'spotted_salamander'],
    prereqSkillCodes: ['math.add.within_20.no_crossing'],
    illustrationKey: 'frog_pond',
    emoji: '🐸',
    interestTags: ['frogs', 'nature'],
  },
  {
    code: 'bunny_burrow',
    name: 'Bunny Burrow',
    description: 'Underground tunnels where cottontails make their home.',
    attractsSpeciesCodes: ['cottontail_rabbit'],
    prereqSkillCodes: ['math.subtract.within_10'],
    illustrationKey: 'bunny_burrow',
    emoji: '🐰',
    interestTags: ['nature', 'subtract'],
  },
  {
    code: 'log_pile',
    name: 'Log Pile',
    description: 'Decaying wood where beetles and small animals shelter.',
    attractsSpeciesCodes: ['ladybug', 'centipede', 'firefly', 'spotted_salamander'],
    prereqSkillCodes: ['math.counting.skip_2s'],
    illustrationKey: 'log_pile',
    emoji: '🪵',
    interestTags: ['insects', 'nature', 'patterns'],
  },
  {
    // The eighth habitat, and the bird curriculum's door into the
    // world: the ten Louisville birds she learns in the bird hide
    // arrive HERE. Gated on equal groups because a feeder is one:
    // four perches with three birds each is the first multiplication
    // problem she can watch out of a window.
    code: 'bird_feeder',
    name: 'Bird Feeder',
    description: 'A seed feeder on a tall pole, where the neighborhood birds line up.',
    attractsSpeciesCodes: [
      'northern_cardinal', 'blue_jay', 'mourning_dove', 'carolina_chickadee',
      'american_robin', 'tufted_titmouse', 'white_breasted_nuthatch',
      'carolina_wren', 'american_goldfinch', 'house_finch',
    ],
    prereqSkillCodes: ['math.multiply.equal_groups'],
    illustrationKey: 'bird_feeder',
    emoji: '🐦',
    interestTags: ['multiply', 'groups', 'counting', 'nature'],
  },
  {
    // The Reading Forest had NO habitat at all — every animal home was
    // in the garden, and the two on the mountain are the cave and the
    // cavern. Cecily spotted the hole before anyone else did.
    code: 'owl_box',
    name: 'Owl Box',
    description: 'A deep wooden box high on a trunk, with a round hole and a floor of wood shavings.',
    attractsSpeciesCodes: ['eastern_screech_owl', 'flying_squirrel'],
    prereqSkillCodes: ['reading.phonics.cvc_blend'],
    illustrationKey: 'owl_box',
    emoji: '🦉',
    interestTags: ['reading', 'comprehension', 'read_aloud'],
  },
  {
    // Crystal Cavern — Cecily's, by request and by name.
    //
    // The second cut into Math Mountain, higher than Operations Cave
    // and opened later. Gated on multiplication facts because that is
    // squarely Level 3, which is the level she asked for, and because
    // the maths inside is money: a price times a count.
    //
    // Its residents are the point rather than an afterthought. A mine
    // sounds like the one habitat with nothing living in it, and the
    // truth is the opposite — see the cave species in SPECIES_CATALOG,
    // which between them give four different answers to "how do you
    // live where there is no light".
    code: 'crystal_cavern',
    name: 'Crystal Cavern',
    description: 'A worked-out mine in the mountainside, where the walls still glitter.',
    attractsSpeciesCodes: [
      'cave_salamander', 'cave_cricket', 'little_brown_bat', 'cave_shrimp',
    ],
    prereqSkillCodes: ['math.multiply.facts_to_10'],
    illustrationKey: 'crystal_cavern',
    emoji: '💎',
    interestTags: ['multiply', 'facts', 'patterns', 'nature'],
  },
  {
    // Math Mountain side-habitat — the cave at the foot of the
    // mountain. Hosts three regrouping/operations skills inside,
    // plus a friendly resident bear who sleeps near the lantern.
    // Attracts cave-dwelling species in time (left empty for now;
    // species catalog can grow into it).
    code: 'operations_cave',
    name: 'Operations Cave',
    description: 'A deep, mossy cave at the foot of the mountain — where numbers regroup in the dark.',
    attractsSpeciesCodes: [],
    prereqSkillCodes: ['math.add.within_100.no_regrouping'],
    illustrationKey: 'operations_cave',
    emoji: '🕳️',
    interestTags: ['regrouping', 'mental_math'],
  },
];

export function getHabitatByCode(code: string): HabitatTypeData | undefined {
  return HABITAT_CATALOG.find(h => h.code === code);
}
