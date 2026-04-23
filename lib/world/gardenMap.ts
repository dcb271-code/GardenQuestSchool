/**
 * Garden map: a hand-placed 2D layout (Stardew-style) where each structure
 * represents a skill or habitat. Positions are in a 1200x800 viewport.
 *
 * Each structure is either:
 *  - a skill-entry (tap → start a session on that skill), or
 *  - a habitat (tap → shows info about residents if unlocked)
 *
 * Layout zones (roughly):
 *   NW (100-400, 100-400)  → Reading Grove (sight words, phonics)
 *   NE (800-1150, 100-400) → Math Mound (counting, arrays)
 *   SW (100-400, 450-750)  → Bunny Glade (subtract)
 *   Center (450-750, 300-550) → Meadow + path + Luna's log
 *   SE (800-1150, 450-750) → Water Zone (frog pond, bee hotel)
 */

export interface MapStructure {
  code: string;           // unique id
  kind: 'skill' | 'habitat';
  skillCode?: string;     // for skill-entries
  habitatCode?: string;   // for habitats (matches HABITAT_CATALOG code)
  label: string;          // display name
  subLabel?: string;      // skill hint
  themeEmoji: string;     // what shows on the map
  x: number;              // center x in map coords
  y: number;              // center y in map coords
  size: number;           // approximate visual size (emoji fontSize)
  zone: 'reading' | 'math' | 'water' | 'meadow' | 'bunny';
}

export const MAP_WIDTH = 1200;
export const MAP_HEIGHT = 800;

export const GARDEN_STRUCTURES: MapStructure[] = [
  // --- Reading Grove (NW) ---
  {
    code: 'reading_book_stump',
    kind: 'skill',
    skillCode: 'reading.sight_words.dolch_primer',
    label: 'Word Stump',
    subLabel: 'sight words',
    themeEmoji: '🌳',
    x: 220, y: 210, size: 80,
    zone: 'reading',
  },
  {
    code: 'reading_blending_beach',
    kind: 'skill',
    skillCode: 'reading.phonics.cvc_blend',
    label: 'Blending Beach',
    subLabel: 'blending sounds',
    themeEmoji: '🐚',
    x: 150, y: 340, size: 68,
    zone: 'reading',
  },
  {
    code: 'reading_digraph_bridge',
    kind: 'skill',
    skillCode: 'reading.phonics.digraphs',
    label: 'Digraph Bridge',
    subLabel: 'ch · sh · th',
    themeEmoji: '🌉',
    x: 340, y: 310, size: 72,
    zone: 'reading',
  },
  {
    code: 'reading_bee_words',
    kind: 'skill',
    skillCode: 'reading.sight_words.dolch_first_grade',
    label: 'Bee Words',
    subLabel: 'more sight words',
    themeEmoji: '🌼',
    x: 380, y: 140, size: 68,
    zone: 'reading',
  },
  {
    code: 'reading_readaloud_log',
    kind: 'skill',
    skillCode: 'reading.read_aloud.simple',
    label: 'Story Log',
    subLabel: 'read it aloud',
    themeEmoji: '📖',
    x: 110, y: 160, size: 56,
    zone: 'reading',
  },

  // --- Math Mound (NE) ---
  {
    code: 'math_counting_path',
    kind: 'skill',
    skillCode: 'math.counting.skip_2s',
    label: 'Counting Path',
    subLabel: 'skip counting',
    themeEmoji: '🪨',
    x: 830, y: 180, size: 60,
    zone: 'math',
  },
  {
    code: 'math_bee_swarm',
    kind: 'skill',
    skillCode: 'math.add.within_20.no_crossing',
    label: 'Bee Swarms',
    subLabel: 'add within 20',
    themeEmoji: '🐝',
    x: 1060, y: 200, size: 64,
    zone: 'math',
  },
  {
    code: 'math_butterfly_arrays',
    kind: 'skill',
    skillCode: 'math.add.within_20.crossing_ten',
    label: 'Butterfly Clusters',
    subLabel: 'make-10 add',
    themeEmoji: '🦋',
    x: 980, y: 340, size: 68,
    zone: 'math',
  },
  {
    code: 'math_number_bonds',
    kind: 'skill',
    skillCode: 'math.number_bond.within_10',
    label: 'Part & Whole',
    subLabel: 'number bonds',
    themeEmoji: '🌸',
    x: 870, y: 330, size: 60,
    zone: 'math',
  },

  // --- Bunny Glade (SW) ---
  {
    code: 'math_petal_falls',
    kind: 'skill',
    skillCode: 'math.subtract.within_10',
    label: 'Petal Falls',
    subLabel: 'subtract within 10',
    themeEmoji: '🌺',
    x: 200, y: 580, size: 68,
    zone: 'bunny',
  },
  {
    code: 'habitat_bunny_burrow',
    kind: 'habitat',
    habitatCode: 'bunny_burrow',
    label: 'Bunny Burrow',
    themeEmoji: '🐰',
    x: 330, y: 670, size: 76,
    zone: 'bunny',
  },

  // --- Water Zone (SE) ---
  {
    code: 'habitat_frog_pond',
    kind: 'habitat',
    habitatCode: 'frog_pond',
    label: 'Frog Pond',
    themeEmoji: '🐸',
    x: 900, y: 640, size: 80,
    zone: 'water',
  },
  {
    code: 'habitat_bee_hotel',
    kind: 'habitat',
    habitatCode: 'bee_hotel',
    label: 'Bee Hotel',
    themeEmoji: '🏡',
    x: 1060, y: 560, size: 72,
    zone: 'water',
  },
  {
    code: 'habitat_butterfly_bush',
    kind: 'habitat',
    habitatCode: 'butterfly_bush',
    label: 'Butterfly Bush',
    themeEmoji: '🌷',
    x: 1080, y: 700, size: 72,
    zone: 'water',
  },

  // --- Meadow + Math Mound extras ---
  {
    code: 'habitat_ant_hill',
    kind: 'habitat',
    habitatCode: 'ant_hill',
    label: 'Ant Hill',
    themeEmoji: '⛰️',
    x: 700, y: 170, size: 72,
    zone: 'math',
  },
  {
    code: 'habitat_log_pile',
    kind: 'habitat',
    habitatCode: 'log_pile',
    label: 'Log Pile',
    themeEmoji: '🪵',
    x: 560, y: 620, size: 72,
    zone: 'meadow',
  },
];

export function getStructureByCode(code: string): MapStructure | undefined {
  return GARDEN_STRUCTURES.find(s => s.code === code);
}
