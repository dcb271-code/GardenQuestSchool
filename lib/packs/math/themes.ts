export interface ThemeHeader {
  title: string;
  themeEmoji: string;
  skillHint: string;
}

export const MATH_THEMES: Record<string, ThemeHeader> = {
  // Counting
  'math.counting.to_20': { title: 'Counting Bugs', themeEmoji: '🐞', skillHint: 'counting to 20' },
  'math.counting.to_50': { title: 'Flowers in the Meadow', themeEmoji: '🌼', skillHint: 'counting to 50' },
  'math.counting.to_120': { title: 'Big Meadow Count', themeEmoji: '🌾', skillHint: 'counting to 120' },
  'math.counting.skip_2s': { title: 'Ants in Pairs', themeEmoji: '🐜', skillHint: 'skip counting by 2s' },
  'math.counting.skip_5s': { title: 'Fingers & Fives', themeEmoji: '🖐️', skillHint: 'skip counting by 5s' },
  'math.counting.skip_10s': { title: 'Ten at a Time', themeEmoji: '🔟', skillHint: 'skip counting by 10s' },

  // Addition
  'math.add.within_10': { title: 'Meeting Bugs', themeEmoji: '🐛', skillHint: 'addition within 10' },
  'math.add.within_20.no_crossing': { title: 'Bee Swarms', themeEmoji: '🐝', skillHint: 'addition within 20' },
  'math.add.within_20.crossing_ten': { title: 'Butterfly Clusters', themeEmoji: '🦋', skillHint: 'make-10 addition' },
  'math.add.fluency_within_20': { title: 'Fast Facts', themeEmoji: '⚡', skillHint: 'quick recall within 20' },
  'math.add.within_100.no_regrouping': { title: "Hundred's Hollow", themeEmoji: '🌳', skillHint: '2-digit add (easy)' },
  'math.add.within_100.with_regrouping': { title: "Regrouping Ridge", themeEmoji: '⛰️', skillHint: '2-digit add (regroup)' },

  // Subtraction
  'math.subtract.within_10': { title: 'Petal Falls', themeEmoji: '🌸', skillHint: 'subtraction within 10' },
  'math.subtract.within_20.no_crossing': { title: 'Leaf Drops', themeEmoji: '🍂', skillHint: 'subtraction within 20' },
  'math.subtract.within_20.crossing_ten': { title: 'Berry Basket', themeEmoji: '🫐', skillHint: 'subtract with make-10' },
  'math.subtract.within_100.no_regrouping': { title: 'Quiet Pond', themeEmoji: '🪷', skillHint: '2-digit subtract (easy)' },
  'math.subtract.within_100.with_regrouping': { title: 'Rushing Stream', themeEmoji: '🌊', skillHint: '2-digit subtract (regroup)' },

  // Number bonds
  'math.number_bond.within_10': { title: 'Part & Whole', themeEmoji: '🌺', skillHint: 'number bonds to 10' },
  'math.number_bond.within_20': { title: 'Twin Blossoms', themeEmoji: '🌷', skillHint: 'number bonds to 20' },

  // Place value
  'math.placevalue.tens_ones': { title: 'Tens Tower', themeEmoji: '🏯', skillHint: 'tens and ones' },
  'math.placevalue.hundreds_tens_ones': { title: 'Three-Digit Tower', themeEmoji: '🏛️', skillHint: 'hundreds, tens, ones' },
  'math.placevalue.compare_2digit': { title: 'Tall Trees Compare', themeEmoji: '🌲', skillHint: 'compare 2-digit numbers' },
  'math.placevalue.compare_3digit': { title: 'Mountain Heights', themeEmoji: '🏔️', skillHint: 'compare 3-digit numbers' },
  'math.placevalue.add_subtract_10': { title: 'Ten More, Ten Less', themeEmoji: '🍃', skillHint: '± 10 mentally' },

  // Multiplication
  'math.multiply.equal_groups': { title: 'Equal Gardens', themeEmoji: '🌻', skillHint: 'equal groups' },
  'math.multiply.arrays': { title: 'Array Orchard', themeEmoji: '🍎', skillHint: 'rows and columns' },
  'math.multiply.skip_count_bridge': { title: 'Skip Count Bridge', themeEmoji: '🌉', skillHint: 'skip count as multiply' },

  // Word problems
  'math.word_problem.add_within_20': { title: 'Garden Stories (+)', themeEmoji: '📖', skillHint: 'add in a story' },
  'math.word_problem.subtract_within_20': { title: 'Garden Stories (−)', themeEmoji: '📖', skillHint: 'subtract in a story' },
  'math.word_problem.two_step': { title: 'Long Stories', themeEmoji: '📜', skillHint: 'two-step problems' },
};

export function getThemeHeader(skillCode: string): ThemeHeader {
  return MATH_THEMES[skillCode] ?? {
    title: 'A New Path', themeEmoji: '🌿', skillHint: 'something new',
  };
}
