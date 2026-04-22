export interface ThemeHeader {
  title: string;
  themeEmoji: string;
  skillHint: string;
}

export const MATH_THEMES: Record<string, ThemeHeader> = {
  'math.counting.to_20': {
    title: 'Counting Bugs', themeEmoji: '🐞', skillHint: 'counting to 20',
  },
  'math.counting.to_50': {
    title: 'Flowers in the Meadow', themeEmoji: '🌼', skillHint: 'counting to 50',
  },
  'math.counting.skip_2s': {
    title: 'Ants in Pairs', themeEmoji: '🐜', skillHint: 'skip counting by 2s',
  },
  'math.add.within_10': {
    title: 'Meeting Bugs', themeEmoji: '🐛', skillHint: 'addition within 10',
  },
  'math.subtract.within_10': {
    title: 'Petal Falls', themeEmoji: '🌸', skillHint: 'subtraction within 10',
  },
  'math.add.within_20.no_crossing': {
    title: 'Bee Swarms', themeEmoji: '🐝', skillHint: 'addition within 20',
  },
  'math.add.within_20.crossing_ten': {
    title: 'Butterfly Clusters', themeEmoji: '🦋', skillHint: 'make-10 addition',
  },
  'math.number_bond.within_10': {
    title: 'Part & Whole Garden', themeEmoji: '🌺', skillHint: 'number bonds to 10',
  },
};

export function getThemeHeader(skillCode: string): ThemeHeader {
  return MATH_THEMES[skillCode] ?? {
    title: 'A New Path', themeEmoji: '🌿', skillHint: 'something new',
  };
}
