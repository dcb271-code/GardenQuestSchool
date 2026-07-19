import type { ThemeHeader } from '@/lib/packs/math/themes';

export const READING_THEMES: Record<string, ThemeHeader> = {
  // Sight words
  'reading.sight_words.dolch_primer': { title: 'Word Petals', themeEmoji: '🌸', skillHint: 'sight words' },
  'reading.sight_words.dolch_first_grade': { title: 'Bee Words', themeEmoji: '🐝', skillHint: 'more sight words' },
  'reading.sight_words.dolch_second_grade': { title: 'Nest Words', themeEmoji: '🪺', skillHint: '2nd grade words' },
  'reading.sight_words.dolch_third_grade': { title: 'Tall Tree Words', themeEmoji: '🌲', skillHint: '3rd grade stretch' },

  // Phonics
  'reading.phonics.cvc_blend': { title: 'Tiny Word Ants', themeEmoji: '🐜', skillHint: 'blending sounds' },
  'reading.phonics.digraphs': { title: 'Butterfly Digraphs', themeEmoji: '🦋', skillHint: 'ch, sh, th' },
  'reading.phonics.initial_blends': { title: 'Frog Pond Blends', themeEmoji: '🐸', skillHint: 'bl, cl, fl…' },
  'reading.phonics.silent_e': { title: 'Magic-E Meadow', themeEmoji: '✨', skillHint: 'silent e' },
  'reading.phonics.vowel_teams_ee_ea': { title: 'Green Team Words', themeEmoji: '🌿', skillHint: 'ee & ea' },
  'reading.phonics.vowel_teams_ai_ay': { title: 'Rainy Day Words', themeEmoji: '☔', skillHint: 'ai & ay' },
  'reading.phonics.vowel_teams_oa_ow': { title: 'Boat & Snow Words', themeEmoji: '⛵', skillHint: 'oa & ow' },
  'reading.phonics.r_controlled': { title: 'Bossy-R Barn', themeEmoji: '🐴', skillHint: 'ar, er, ir, or, ur' },
  'reading.phonics.diphthongs': { title: 'Coin & Cloud Words', themeEmoji: '☁️', skillHint: 'oi/oy, ou/ow' },

  // Morphology
  'reading.morphology.inflectional_ed_ing': { title: 'Action Garden', themeEmoji: '🏃', skillHint: '-ed and -ing' },
  'reading.morphology.plural_s_es': { title: 'Many Many', themeEmoji: '🪴', skillHint: 'plurals (-s, -es)' },
  'reading.morphology.compound_words': { title: 'Word Joining', themeEmoji: '🤝', skillHint: 'compound words' },
  'reading.morphology.prefix_un_re': { title: 'Front Helpers', themeEmoji: '⏪', skillHint: 'un-, re-' },

  // Oral reading
  'reading.read_aloud.simple': { title: 'Read It Aloud', themeEmoji: '📖', skillHint: 'practice reading' },
  'reading.read_aloud.longer_words': { title: 'Longer Words', themeEmoji: '📚', skillHint: 'multi-syllable' },

  // Comprehension
  'reading.comprehension.short_sentence': { title: 'Sentence Snippets', themeEmoji: '📜', skillHint: 'read & answer' },
  'reading.comprehension.paragraph': { title: 'Story Glade', themeEmoji: '📔', skillHint: 'read a paragraph' },

  // Level 4 — phonics & sight words
  'reading.phonics.multisyllable': { title: 'Long Word Thicket', themeEmoji: '🌾', skillHint: 'big 3–4 syllable words' },
  'reading.sight_words.academic': { title: 'Tricky Word Hollow', themeEmoji: '🦊', skillHint: 'sneaky spellings' },

  // Level 4 — morphology
  'reading.morphology.prefix_dis_mis_non': { title: 'Front-Flip Words', themeEmoji: '🔄', skillHint: 'dis-, mis-, non-' },
  'reading.morphology.suffix_ful_less_ness': { title: 'Tail-End Words', themeEmoji: '🍂', skillHint: '-ful, -less, -ness' },

  // Level 4 — comprehension & vocabulary
  'reading.vocab.context_clues': { title: 'Word Detective', themeEmoji: '🔎', skillHint: 'meaning from context' },
  'reading.comprehension.passage': { title: 'Reading Grove', themeEmoji: '🌳', skillHint: 'longer passages' },

  // Level 5 — morphology
  'reading.morphology.suffix_tion_ment_ity': { title: 'Grand Suffix Grove', themeEmoji: '🌟', skillHint: '-tion, -ment, -ity' },
  'reading.morphology.greek_latin_roots': { title: 'Ancient Roots', themeEmoji: '🏛️', skillHint: 'Greek & Latin roots' },

  // Level 5 — comprehension & vocabulary
  'reading.vocab.shades_of_meaning': { title: 'Just-Right Words', themeEmoji: '🎨', skillHint: 'the precise word' },
  'reading.vocab.figurative': { title: 'Word Magic', themeEmoji: '🪄', skillHint: 'similes & idioms' },
  'reading.comprehension.long_passage': { title: 'Deep Woods Reading', themeEmoji: '🌲', skillHint: 'long passages' },
};

export function getReadingThemeHeader(skillCode: string): ThemeHeader {
  return READING_THEMES[skillCode] ?? {
    title: 'A New Story', themeEmoji: '📖', skillHint: 'reading',
  };
}
