import type { SkillDefinition } from '@/lib/engine/types';

export const READING_SKILLS: SkillDefinition[] = [
  // ─── SIGHT WORDS ───────────────────────────────────────────────────
  {
    code: 'reading.sight_words.dolch_primer',
    name: 'Dolch Primer sight words',
    strandCode: 'sight_words', level: 0.2,
    prereqSkillCodes: [], curriculumRefs: { dolch: 'primer' },
    themeTags: ['sight_words', 'flowers'], sortOrder: 1,
  },
  {
    code: 'reading.sight_words.dolch_first_grade',
    name: 'Dolch First Grade sight words',
    strandCode: 'sight_words', level: 0.3,
    prereqSkillCodes: ['reading.sight_words.dolch_primer'], curriculumRefs: { dolch: 'first_grade' },
    themeTags: ['sight_words', 'bees'], sortOrder: 2,
  },
  {
    code: 'reading.sight_words.dolch_second_grade',
    name: 'Dolch Second Grade sight words',
    strandCode: 'sight_words', level: 0.45,
    prereqSkillCodes: ['reading.sight_words.dolch_first_grade'], curriculumRefs: { dolch: 'second_grade' },
    themeTags: ['sight_words'], sortOrder: 3,
  },
  {
    code: 'reading.sight_words.dolch_third_grade',
    name: 'Dolch Third Grade sight words',
    strandCode: 'sight_words', level: 0.6,
    prereqSkillCodes: ['reading.sight_words.dolch_second_grade'], curriculumRefs: { dolch: 'third_grade' },
    themeTags: ['sight_words'], sortOrder: 4,
  },

  // ─── PHONICS ───────────────────────────────────────────────────────
  {
    code: 'reading.phonics.cvc_blend',
    name: 'Blend CVC words',
    strandCode: 'phonics', level: 0.2,
    prereqSkillCodes: [], curriculumRefs: { og: 'cvc' },
    themeTags: ['phonics', 'cvc', 'ants'], sortOrder: 10,
  },
  {
    code: 'reading.phonics.digraphs',
    name: 'Digraphs ch/sh/th',
    strandCode: 'phonics', level: 0.3,
    prereqSkillCodes: ['reading.phonics.cvc_blend'], curriculumRefs: { og: 'digraphs' },
    themeTags: ['phonics', 'digraphs', 'butterflies'], sortOrder: 11,
  },
  {
    code: 'reading.phonics.initial_blends',
    name: 'Initial consonant blends',
    strandCode: 'phonics', level: 0.4,
    prereqSkillCodes: ['reading.phonics.digraphs'], curriculumRefs: { og: 'blends' },
    themeTags: ['phonics', 'blends', 'frogs'], sortOrder: 12,
  },
  {
    code: 'reading.phonics.silent_e',
    name: 'Silent-e (magic e)',
    strandCode: 'phonics', level: 0.45,
    prereqSkillCodes: ['reading.phonics.cvc_blend'], curriculumRefs: { og: 'cvce' },
    themeTags: ['phonics', 'long_vowel', 'magic_e'], sortOrder: 13,
  },
  {
    code: 'reading.phonics.vowel_teams_ee_ea',
    name: 'Vowel teams: ee, ea',
    strandCode: 'phonics', level: 0.5,
    prereqSkillCodes: ['reading.phonics.silent_e'], curriculumRefs: { og: 'vowel_teams' },
    themeTags: ['phonics', 'vowel_teams', 'long_e'], sortOrder: 14,
  },
  {
    code: 'reading.phonics.vowel_teams_ai_ay',
    name: 'Vowel teams: ai, ay',
    strandCode: 'phonics', level: 0.5,
    prereqSkillCodes: ['reading.phonics.silent_e'], curriculumRefs: { og: 'vowel_teams' },
    themeTags: ['phonics', 'vowel_teams', 'long_a'], sortOrder: 15,
  },
  {
    code: 'reading.phonics.vowel_teams_oa_ow',
    name: 'Vowel teams: oa, ow',
    strandCode: 'phonics', level: 0.55,
    prereqSkillCodes: ['reading.phonics.vowel_teams_ee_ea'], curriculumRefs: { og: 'vowel_teams' },
    themeTags: ['phonics', 'vowel_teams', 'long_o'], sortOrder: 16,
  },
  {
    code: 'reading.phonics.r_controlled',
    name: 'R-controlled vowels (ar, er, ir, or, ur)',
    strandCode: 'phonics', level: 0.6,
    prereqSkillCodes: ['reading.phonics.vowel_teams_ee_ea'], curriculumRefs: { og: 'r_controlled' },
    themeTags: ['phonics', 'r_controlled'], sortOrder: 17,
  },
  {
    code: 'reading.phonics.diphthongs',
    name: 'Diphthongs (oi/oy, ou/ow)',
    strandCode: 'phonics', level: 0.65,
    prereqSkillCodes: ['reading.phonics.vowel_teams_oa_ow'], curriculumRefs: { og: 'diphthongs' },
    themeTags: ['phonics', 'diphthongs'], sortOrder: 18,
  },

  // ─── MORPHOLOGY ────────────────────────────────────────────────────
  {
    code: 'reading.morphology.inflectional_ed_ing',
    name: 'Word endings: -ed, -ing',
    strandCode: 'morphology', level: 0.55,
    prereqSkillCodes: ['reading.phonics.silent_e'], curriculumRefs: { og: 'inflectional' },
    themeTags: ['morphology', 'verb_endings'], sortOrder: 20,
  },
  {
    code: 'reading.morphology.plural_s_es',
    name: 'Plurals: -s, -es',
    strandCode: 'morphology', level: 0.4,
    prereqSkillCodes: ['reading.phonics.cvc_blend'], curriculumRefs: { og: 'plurals' },
    themeTags: ['morphology', 'plurals'], sortOrder: 21,
  },
  {
    code: 'reading.morphology.compound_words',
    name: 'Compound words',
    strandCode: 'morphology', level: 0.55,
    prereqSkillCodes: ['reading.phonics.digraphs'], curriculumRefs: { og: 'compound' },
    themeTags: ['morphology', 'compound'], sortOrder: 22,
  },
  {
    code: 'reading.morphology.prefix_un_re',
    name: 'Prefixes: un-, re-',
    strandCode: 'morphology', level: 0.65,
    prereqSkillCodes: ['reading.morphology.inflectional_ed_ing'], curriculumRefs: { og: 'prefixes' },
    themeTags: ['morphology', 'prefixes'], sortOrder: 23,
  },

  // ─── ORAL READING ──────────────────────────────────────────────────
  {
    code: 'reading.read_aloud.simple',
    name: 'Read a word aloud',
    strandCode: 'phonics', level: 0.25,
    prereqSkillCodes: ['reading.phonics.cvc_blend'], curriculumRefs: { og: 'oral_reading' },
    themeTags: ['read_aloud', 'practice'], sortOrder: 30,
  },
  {
    code: 'reading.read_aloud.longer_words',
    name: 'Read longer words aloud',
    strandCode: 'phonics', level: 0.5,
    prereqSkillCodes: ['reading.phonics.silent_e'], curriculumRefs: { og: 'oral_reading' },
    themeTags: ['read_aloud', 'multi_syllable'], sortOrder: 31,
  },

  // ─── COMPREHENSION (Grade 2) ───────────────────────────────────────
  {
    code: 'reading.comprehension.short_sentence',
    name: 'Read a sentence and answer',
    strandCode: 'phonics', level: 0.55,
    prereqSkillCodes: [
      'reading.sight_words.dolch_first_grade',
      'reading.phonics.silent_e',
    ],
    curriculumRefs: { ccss: 'RL.2.1' },
    themeTags: ['comprehension', 'sentence', 'reading'], sortOrder: 40,
  },

  // ─── COMPREHENSION (Grade 3) ───────────────────────────────────────
  {
    code: 'reading.comprehension.paragraph',
    name: 'Read a paragraph and answer',
    strandCode: 'phonics', level: 0.7,
    prereqSkillCodes: [
      'reading.comprehension.short_sentence',
      'reading.read_aloud.longer_words',
    ],
    curriculumRefs: { ccss: 'RL.3.1, RI.3.1' },
    themeTags: ['comprehension', 'paragraph', 'reading'], sortOrder: 41,
  },

  // ─── LEVEL 4 — PHONICS / SIGHT WORDS (Grade 4) ─────────────────────
  {
    code: 'reading.phonics.multisyllable',
    name: 'Read long words (3–4 syllables)',
    strandCode: 'phonics', level: 0.75,
    prereqSkillCodes: [
      'reading.phonics.r_controlled',
      'reading.morphology.inflectional_ed_ing',
    ],
    curriculumRefs: { og: 'multisyllable' },
    themeTags: ['phonics', 'multi_syllable', 'nature'], sortOrder: 19,
  },
  {
    code: 'reading.sight_words.academic',
    name: 'Tricky words (Fry list)',
    strandCode: 'sight_words', level: 0.75,
    prereqSkillCodes: ['reading.sight_words.dolch_third_grade'],
    curriculumRefs: { fry: '4th-5th' },
    themeTags: ['sight_words', 'tricky'], sortOrder: 5,
  },

  // ─── LEVEL 4 — MORPHOLOGY (Grade 4) ────────────────────────────────
  {
    code: 'reading.morphology.prefix_dis_mis_non',
    name: 'Prefixes dis-, mis-, non-',
    strandCode: 'morphology', level: 0.76,
    prereqSkillCodes: ['reading.morphology.inflectional_ed_ing'],
    curriculumRefs: { og: 'prefixes' },
    themeTags: ['morphology', 'prefixes'], sortOrder: 24,
  },
  {
    code: 'reading.morphology.suffix_ful_less_ness',
    name: 'Suffixes -ful, -less, -ness',
    strandCode: 'morphology', level: 0.78,
    prereqSkillCodes: ['reading.morphology.prefix_dis_mis_non'],
    curriculumRefs: { og: 'suffixes' },
    themeTags: ['morphology', 'suffixes'], sortOrder: 25,
  },

  // ─── LEVEL 4 — COMPREHENSION & VOCABULARY (Grade 4) ────────────────
  {
    code: 'reading.vocab.context_clues',
    name: 'Word meaning from context',
    strandCode: 'comprehension', level: 0.80,
    prereqSkillCodes: ['reading.comprehension.paragraph'],
    curriculumRefs: { ccss: 'RL.4.4' },
    themeTags: ['comprehension', 'vocab', 'context'], sortOrder: 42,
  },
  {
    code: 'reading.comprehension.passage',
    name: 'Longer passages',
    strandCode: 'comprehension', level: 0.82,
    prereqSkillCodes: ['reading.comprehension.paragraph'],
    curriculumRefs: { ccss: 'RL.4.1, RI.4.1' },
    themeTags: ['comprehension', 'passage', 'reading'], sortOrder: 43,
  },

  // ─── LEVEL 5 — MORPHOLOGY (Grade 5) ────────────────────────────────
  {
    code: 'reading.morphology.suffix_tion_ment_ity',
    name: 'Suffixes -tion, -ment, -ity',
    strandCode: 'morphology', level: 0.86,
    prereqSkillCodes: ['reading.morphology.suffix_ful_less_ness'],
    curriculumRefs: { og: 'suffixes' },
    themeTags: ['morphology', 'suffixes'], sortOrder: 26,
  },
  {
    code: 'reading.morphology.greek_latin_roots',
    name: 'Greek and Latin roots',
    strandCode: 'morphology', level: 0.88,
    prereqSkillCodes: ['reading.morphology.suffix_tion_ment_ity'],
    curriculumRefs: { ccss: 'RL.5.4' },
    themeTags: ['morphology', 'roots', 'vocab'], sortOrder: 27,
  },

  // ─── LEVEL 5 — COMPREHENSION & VOCABULARY (Grade 5) ────────────────
  {
    code: 'reading.vocab.shades_of_meaning',
    name: 'Choose the precise word',
    strandCode: 'comprehension', level: 0.90,
    prereqSkillCodes: ['reading.vocab.context_clues'],
    curriculumRefs: {},
    themeTags: ['comprehension', 'vocab', 'nuance'], sortOrder: 44,
  },
  {
    code: 'reading.vocab.figurative',
    name: 'Figurative language',
    strandCode: 'comprehension', level: 0.92,
    prereqSkillCodes: ['reading.vocab.shades_of_meaning'],
    curriculumRefs: { ccss: 'RL.5.4' },
    themeTags: ['comprehension', 'vocab', 'figurative'], sortOrder: 45,
  },
  {
    code: 'reading.comprehension.long_passage',
    name: 'Long passages',
    strandCode: 'comprehension', level: 0.95,
    prereqSkillCodes: ['reading.comprehension.passage'],
    curriculumRefs: { ccss: 'RL.5.1, RI.5.2' },
    themeTags: ['comprehension', 'passage', 'reading'], sortOrder: 46,
  },
];
