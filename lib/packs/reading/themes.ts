import type { ThemeHeader } from '@/lib/packs/math/themes';

export const READING_THEMES: Record<string, ThemeHeader> = {
  'reading.sight_words.dolch_primer': {
    title: 'Word Petals', themeEmoji: '🌸', skillHint: 'sight words',
  },
  'reading.sight_words.dolch_first_grade': {
    title: 'Bee Words', themeEmoji: '🐝', skillHint: 'more sight words',
  },
  'reading.phonics.cvc_blend': {
    title: 'Tiny Word Ants', themeEmoji: '🐜', skillHint: 'blending sounds',
  },
  'reading.phonics.digraphs': {
    title: 'Butterfly Digraphs', themeEmoji: '🦋', skillHint: 'ch, sh, th sounds',
  },
  'reading.phonics.initial_blends': {
    title: 'Frog Pond Blends', themeEmoji: '🐸', skillHint: 'blends like bl, cl, fl',
  },
  'reading.read_aloud.simple': {
    title: 'Read It Aloud', themeEmoji: '📖', skillHint: 'practice reading words',
  },
};

export function getReadingThemeHeader(skillCode: string): ThemeHeader {
  return READING_THEMES[skillCode] ?? {
    title: 'A New Story', themeEmoji: '📖', skillHint: 'reading',
  };
}
