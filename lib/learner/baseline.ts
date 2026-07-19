/**
 * Translates a (level, defaultChallenge) pair into the baseline-mastery
 * rows that should be inserted when a learner is first created.
 *
 * "Level" is Garden Quest's own 1–5 ladder, not a school grade. The
 * content behind each level is anchored to CCSS grades (Level 3 ≈
 * CCSS grade 3, etc.), but we deliberately stopped calling them
 * "grades" in the app — a level describes where the ladder starts,
 * not what year of school a child is in. The DB column is still
 * learner.grade_level for historical reasons.
 *
 * Two effects:
 *   1. Foundational skills below the learner's level are marked
 *      mastered so the planner doesn't waste their first session
 *      on K-counting if they start at Level 2.
 *   2. The starting student_elo for ALL skills is set so the picker
 *      hits the right band on day one — no warm-up needed before
 *      the difficulty makes sense.
 *
 * Within a level, "easier / normal / harder" shifts the baseline by
 * ±60 Elo. Levels 1–3 sit 100 Elo apart; 4 and 5 step 200 apart
 * because their item pools live in wider, higher bands
 * (L4 items ≈ 1550–1950, L5 ≈ 1800–2200).
 */

export type LearnerLevel = 1 | 2 | 3 | 4 | 5;
export type DefaultChallenge = 'easier' | 'normal' | 'harder';

/** Highest selectable level — keep in sync with the DB constraint
 *  learner_grade_level_chk (1..5) in 014_learner_levels.sql. */
export const MAX_LEVEL = 5;

const BASE_ELO_BY_LEVEL: Record<LearnerLevel, number> = {
  1: 950,
  2: 1050,
  3: 1150,
  4: 1350,
  5: 1550,
};

const CHALLENGE_OFFSET: Record<DefaultChallenge, number> = {
  easier: -60,
  normal: 0,
  harder: 60,
};

export function baselineEloFor(level: LearnerLevel, challenge: DefaultChallenge): number {
  return BASE_ELO_BY_LEVEL[level] + CHALLENGE_OFFSET[challenge];
}

// ─── Skill tiers ──────────────────────────────────────────────────────
// Each tier is "the working band of that level" — what a learner AT
// that level is actively studying. A learner starting above a tier
// gets the tier marked mastered; the tier of their own level starts
// in review state.

// Note: the catalog's earliest counting skill is to_20 — there is no
// math.counting.to_10 skill (a dangling reference to it lived here for
// months and was silently dropped by the seeder's id filter).
const KINDERGARTEN = [
  'math.counting.to_20',
];

const LEVEL_1 = [
  'math.counting.to_50',
  'math.counting.skip_2s',
  'math.add.within_10',
  'math.subtract.within_10',
  'math.number_bond.within_10',
  'reading.phonics.cvc_blend',
  'reading.sight_words.dolch_primer',
  'reading.sight_words.dolch_first_grade',
];

const LEVEL_2 = [
  'math.add.within_20.no_crossing',
  'math.subtract.within_20.no_crossing',
  'reading.phonics.digraphs',
  'reading.read_aloud.simple',
];

// Level 3's working band — becomes mastered for a Level-4 starter.
const LEVEL_3_BAND = [
  'math.add.within_100.with_regrouping',
  'math.subtract.within_100.with_regrouping',
  'math.add.within_1000',
  'math.subtract.within_1000',
  'math.placevalue.hundreds_tens_ones',
  'math.placevalue.compare_3digit',
  'math.placevalue.round_nearest_10',
  'math.placevalue.round_nearest_100',
  'math.multiply.facts_to_5',
  'math.multiply.facts_to_10',
  'math.divide.equal_share',
  'math.divide.facts_to_10',
  'math.divide.unknown_factor',
  'math.fractions.identify',
  'math.fractions.compare_visual',
  'math.time.elapsed_intervals',
  'reading.phonics.r_controlled',
  'reading.morphology.inflectional_ed_ing',
  'reading.morphology.compound_words',
  'reading.comprehension.short_sentence',
  'reading.comprehension.paragraph',
];

// Level 2's extra working-band skills that L3+ starters should also
// have behind them (they were only ever seeded as "reviewing" for a
// Level-2 starter).
const LEVEL_2_BAND = [
  'math.add.within_20.crossing_ten',
  'math.subtract.within_20.crossing_ten',
  'math.add.within_100.no_regrouping',
  'math.subtract.within_100.no_regrouping',
  'math.even_odd.recognize',
  'math.placevalue.tens_ones',
  'math.time.read_hour_half',
  'math.time.read_to_5_min',
  'math.money.coin_count',
  'math.multiply.equal_groups',
  'reading.phonics.silent_e',
  'reading.read_aloud.longer_words',
  'reading.comprehension.short_sentence',
  'reading.morphology.compound_words',
];

// Level 4's working band (CCSS grade 4) — becomes mastered for a
// Level-5 starter.
const LEVEL_4_BAND = [
  'math.placevalue.to_1_000_000',
  'math.placevalue.round_large',
  'math.multiply.by_10s_100s',
  'math.multiply.2digit_by_1digit',
  'math.multiply.2digit_by_2digit',
  'math.divide.with_remainders',
  'math.factors.find',
  'math.fractions.equivalent',
  'math.fractions.add_subtract_like',
  'math.decimals.tenths_hundredths',
  'math.decimals.compare',
  'math.operations.multi_digit_add_subtract',
  'math.measurement.area_perimeter',
  'math.time.elapsed_across_hours',
  'math.word_problem.multiplicative',
  'reading.phonics.multisyllable',
  'reading.sight_words.academic',
  'reading.morphology.prefix_dis_mis_non',
  'reading.morphology.suffix_ful_less_ness',
  'reading.vocab.context_clues',
  'reading.comprehension.passage',
];

// Level 5's working band (CCSS grade 5).
const LEVEL_5_BAND = [
  'math.multiply.multi_digit',
  'math.divide.long_division',
  'math.fractions.of_a_set',
  'math.fractions.add_subtract_unlike',
  'math.fractions.multiply',
  'math.decimals.add_subtract',
  'math.decimals.multiply_divide_10s',
  'math.order_of_operations',
  'math.volume.rectangular',
  'math.word_problem.multi_step',
  'reading.morphology.suffix_tion_ment_ity',
  'reading.morphology.greek_latin_roots',
  'reading.vocab.shades_of_meaning',
  'reading.vocab.figurative',
  'reading.comprehension.long_passage',
];

/**
 * Skill codes that should be counted as already-mastered when the
 * learner is created at the given level. This is intentionally
 * conservative — we promote up to (but not into) the learner's
 * declared level, so they'll see level-appropriate content first
 * but can still revisit foundational skills via Leitner review.
 */
export function masteredSkillsForLevel(level: LearnerLevel): string[] {
  if (level <= 1) return KINDERGARTEN;
  if (level === 2) return [...KINDERGARTEN, ...LEVEL_1];
  if (level === 3) return [...KINDERGARTEN, ...LEVEL_1, ...LEVEL_2];
  if (level === 4) {
    return dedupe([
      ...KINDERGARTEN, ...LEVEL_1, ...LEVEL_2, ...LEVEL_2_BAND, ...LEVEL_3_BAND,
    ]);
  }
  return dedupe([
    ...KINDERGARTEN, ...LEVEL_1, ...LEVEL_2, ...LEVEL_2_BAND, ...LEVEL_3_BAND, ...LEVEL_4_BAND,
  ]);
}

/**
 * Skills that should be in "review" state when the learner is
 * created — they're at the edge of the learner's comfort zone:
 * recently encountered, due for revisit. The planner uses these to
 * surface mixed-difficulty sessions on day one.
 *
 * Important: these are also the FIRST skills the planner will pick
 * for a fresh learner, so the list should reflect the level the
 * parent chose — a brand-new Level-4 learner starts on genuinely
 * Level-4 material, not a warm-up tour of earlier levels.
 */
export function reviewingSkillsForLevel(level: LearnerLevel): string[] {
  if (level <= 1) {
    return [
      'math.add.within_10',
      'math.subtract.within_10',
      'reading.phonics.cvc_blend',
      'reading.sight_words.dolch_first_grade',
    ];
  }
  if (level === 2) return LEVEL_2_BAND;
  if (level === 3) return LEVEL_3_BAND;
  if (level === 4) return LEVEL_4_BAND;
  return LEVEL_5_BAND;
}

function dedupe(codes: string[]): string[] {
  return Array.from(new Set(codes));
}

// ─── Legacy aliases ──────────────────────────────────────────────────
// The app used to call levels "grades". Keep the old names importable
// while call sites migrate; new code should use the Level names.
export type GradeLevel = LearnerLevel;
export const masteredSkillsForGrade = masteredSkillsForLevel;
export const reviewingSkillsForGrade = reviewingSkillsForLevel;
