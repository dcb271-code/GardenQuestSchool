/**
 * Translates a (gradeLevel, defaultChallenge) pair into the
 * baseline-mastery rows that should be inserted when a learner is
 * first created.
 *
 * Two effects:
 *   1. Foundational skills below the learner's grade are marked
 *      mastered so the planner doesn't waste their first session
 *      on K-counting if they're a 2nd grader.
 *   2. The starting student_elo for ALL skills is set so the picker
 *      hits the right band on day one — no warm-up needed before
 *      the difficulty makes sense.
 *
 * Within a grade, "easier / normal / harder" shifts the baseline by
 * ±60 Elo. Grades shift by 100 Elo.
 *
 *   Grade 1, easier  → 890 baseline
 *   Grade 1, normal  → 950
 *   Grade 1, harder  → 1010
 *   Grade 2, easier  → 990
 *   Grade 2, normal  → 1050
 *   Grade 2, harder  → 1110
 *   Grade 3, easier  → 1090
 *   Grade 3, normal  → 1150
 *   Grade 3, harder  → 1210
 */

export type GradeLevel = 1 | 2 | 3;
export type DefaultChallenge = 'easier' | 'normal' | 'harder';

const BASE_ELO_BY_GRADE: Record<GradeLevel, number> = {
  1: 950,
  2: 1050,
  3: 1150,
};

const CHALLENGE_OFFSET: Record<DefaultChallenge, number> = {
  easier: -60,
  normal: 0,
  harder: 60,
};

export function baselineEloFor(grade: GradeLevel, challenge: DefaultChallenge): number {
  return BASE_ELO_BY_GRADE[grade] + CHALLENGE_OFFSET[challenge];
}

/**
 * Skill codes that should be counted as already-mastered when the
 * learner is created at the given grade. This is intentionally
 * conservative — we promote up to (but not into) the learner's
 * declared grade, so they'll see grade-appropriate content first
 * but can still revisit foundational skills via Leitner review.
 */
export function masteredSkillsForGrade(grade: GradeLevel): string[] {
  // Pre-K / Kindergarten foundations — everyone past Grade 1 has these.
  const kindergarten = [
    'math.counting.to_10',
    'math.counting.to_20',
  ];
  // Grade 1 — basic addition/subtraction within 10, dolch primer + 1st.
  const firstGrade = [
    'math.counting.to_50',
    'math.counting.skip_2s',
    'math.add.within_10',
    'math.subtract.within_10',
    'math.number_bond.within_10',
    'reading.phonics.cvc_blend',
    'reading.sight_words.dolch_primer',
    'reading.sight_words.dolch_first_grade',
  ];
  // Grade 2 — adds digraphs, no-crossing within 20, simple read-alouds.
  const secondGrade = [
    'math.add.within_20.no_crossing',
    'math.subtract.within_20.no_crossing',
    'reading.phonics.digraphs',
    'reading.read_aloud.simple',
  ];

  if (grade <= 1) return kindergarten;
  if (grade === 2) return [...kindergarten, ...firstGrade];
  return [...kindergarten, ...firstGrade, ...secondGrade];
}

/**
 * Skills that should be in "review" state when the learner is
 * created — they're at the edge of the learner's comfort zone:
 * recently encountered, due for revisit. The planner uses these to
 * surface mixed-difficulty sessions on day one.
 *
 * Important: these are also the FIRST skills the planner will pick
 * for a fresh learner, so the list should reflect what the parent
 * set as the grade level. Grade-2 here pulls genuinely-Grade-2
 * content (2-digit add/subtract, multi-syllable reading, short
 * sentence comprehension) so a brand-new Cecily-equivalent doesn't
 * spend her first sessions on K material.
 */
export function reviewingSkillsForGrade(grade: GradeLevel): string[] {
  if (grade <= 1) {
    return [
      'math.add.within_10',
      'math.subtract.within_10',
      'reading.phonics.cvc_blend',
      'reading.sight_words.dolch_first_grade',
    ];
  }
  if (grade === 2) {
    return [
      // Math — proper Grade-2 working band
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
      // Reading — multi-syllabic + sentence comprehension is the
      // gap a Grade-2 learner most acutely felt
      'reading.phonics.silent_e',
      'reading.read_aloud.longer_words',
      'reading.comprehension.short_sentence',
      'reading.morphology.compound_words',
    ];
  }
  return [
    // Grade 3 — first push includes paragraph comprehension and the
    // first fractions skills. The rest of Grade 3 (multiplication
    // tables, division, place value to 1000, multi-step word
    // problems) lives in the spec at
    // docs/superpowers/specs/2026-04-25-grade3-expansion-plan.md
    // and lands in subsequent pushes.
    'math.add.within_100.with_regrouping',
    'math.subtract.within_100.with_regrouping',
    'math.placevalue.hundreds_tens_ones',
    'math.placevalue.compare_3digit',
    'math.multiply.equal_groups',
    'math.multiply.arrays',
    'math.fractions.identify',
    'math.fractions.compare_visual',
    'reading.phonics.r_controlled',
    'reading.morphology.inflectional_ed_ing',
    'reading.morphology.compound_words',
    'reading.comprehension.short_sentence',
    'reading.comprehension.paragraph',
  ];
}
