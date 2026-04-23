export interface HabitatTypeData {
  code: string;
  name: string;
  description: string;
  attractsSpeciesCodes: string[];
  prereqSkillCodes: string[];
  illustrationKey: string;
  emoji: string;
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
  },
  {
    code: 'butterfly_bush',
    name: 'Butterfly Bush',
    description: 'Nectar-rich flowers that attract monarchs and swallowtails.',
    attractsSpeciesCodes: ['monarch', 'swallowtail', 'skipper'],
    prereqSkillCodes: ['math.add.within_20.crossing_ten'],
    illustrationKey: 'butterfly_bush',
    emoji: '🦋',
  },
  {
    code: 'bee_hotel',
    name: 'Bee Hotel',
    description: 'Hollow tubes where solitary bees nest and raise their young.',
    attractsSpeciesCodes: ['mason_bee', 'honey_bee', 'bumble_bee'],
    prereqSkillCodes: ['math.add.within_20.crossing_ten'],
    illustrationKey: 'bee_hotel',
    emoji: '🐝',
  },
  {
    code: 'frog_pond',
    name: 'Frog Pond',
    description: 'A shallow pool where frogs sing in the evening.',
    attractsSpeciesCodes: ['tree_frog', 'spring_peeper'],
    prereqSkillCodes: ['math.add.within_20.no_crossing'],
    illustrationKey: 'frog_pond',
    emoji: '🐸',
  },
  {
    code: 'bunny_burrow',
    name: 'Bunny Burrow',
    description: 'Underground tunnels where cottontails make their home.',
    attractsSpeciesCodes: ['cottontail_rabbit'],
    prereqSkillCodes: ['math.subtract.within_10'],
    illustrationKey: 'bunny_burrow',
    emoji: '🐰',
  },
  {
    code: 'log_pile',
    name: 'Log Pile',
    description: 'Decaying wood where beetles and small animals shelter.',
    attractsSpeciesCodes: ['ladybug', 'centipede', 'firefly'],
    prereqSkillCodes: ['math.counting.skip_2s'],
    illustrationKey: 'log_pile',
    emoji: '🪵',
  },
];

export function getHabitatByCode(code: string): HabitatTypeData | undefined {
  return HABITAT_CATALOG.find(h => h.code === code);
}
