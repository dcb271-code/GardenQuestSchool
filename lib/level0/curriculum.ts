// lib/level0/curriculum.ts
//
// Level 0 — letters and numbers, spoken. The band below Level 1 for a
// child who cannot read yet. Spec: docs/superpowers/specs/
// 2026-09-26-level-zero-spec.md
//
// This is a curriculum MODULE in the birds / gems / music shape, not
// skill rows: a hand-authored catalog of pre-skills, exercises grown
// from seeds, rounds recorded as null-item attempt rows tagged
// response.source. No Elo, no Leitner, no skill_progress writes.
// Mastery is a pure function of those rows (preSkillStatus), and
// graduating IS the Level-1 baseline, applied by a parent.

export type PreSkillCode =
  | 'count_to_5' | 'count_to_10' | 'subitize_1_3'
  | 'numeral_1_5' | 'numeral_1_10' | 'more_fewer' | 'one_more'
  | 'letters.own_name' | 'letters.family' | 'letters.shapes'
  | 'letter_sounds.initial';

export interface PreSkill {
  code: PreSkillCode;
  /** Said aloud to a grown-up; never shown to the child as a label. */
  name: string;
  strand: 'numbers' | 'letters';
  /** Must be at least `practicing` before this one is offered. */
  after: PreSkillCode[];
  /** Which game teaches it in V1; null = catalogued, not yet built. */
  game: 'ladybug' | 'basket' | 'signature' | null;
}

export const PRE_SKILLS: PreSkill[] = [
  { code: 'count_to_5',   name: 'counting to five',            strand: 'numbers', after: [],               game: 'ladybug' },
  { code: 'numeral_1_5',  name: 'knowing the numerals 1 to 5', strand: 'numbers', after: ['count_to_5'],   game: 'ladybug' },
  { code: 'subitize_1_3', name: 'seeing one, two or three at a glance', strand: 'numbers', after: ['count_to_5'], game: 'ladybug' },
  { code: 'count_to_10',  name: 'counting to ten',             strand: 'numbers', after: ['count_to_5'],   game: 'ladybug' },
  { code: 'numeral_1_10', name: 'knowing the numerals 1 to 10', strand: 'numbers', after: ['count_to_10'], game: 'ladybug' },
  { code: 'more_fewer',   name: 'which has more',              strand: 'numbers', after: ['count_to_5'],   game: 'basket' },
  { code: 'one_more',     name: 'one more',                    strand: 'numbers', after: ['more_fewer'],   game: 'basket' },
  { code: 'letters.own_name', name: 'the letters of her own name', strand: 'letters', after: [], game: 'signature' },
  { code: 'letters.family',   name: 'the letters of the family',   strand: 'letters', after: ['letters.own_name'], game: null },
  { code: 'letters.shapes',   name: 'letters with unmistakable shapes', strand: 'letters', after: ['letters.own_name'], game: null },
  { code: 'letter_sounds.initial', name: 'first sounds',         strand: 'letters', after: ['letters.shapes'], game: null },
];

export function getPreSkill(code: string): PreSkill | undefined {
  return PRE_SKILLS.find(p => p.code === code);
}

/* ── mastery ─────────────────────────────────────────────────────── */

export type PreSkillState = 'new' | 'practicing' | 'mastered';

/** The only shape this module needs from an attempt row. */
export interface PreSkillAttempt {
  preSkill: string;
  correct: boolean;
  /** ISO timestamp of the attempt. */
  at: string;
}

/** Mastered = the last WINDOW answers are ≥ MASTERY_RATIO correct, on
 *  at least MASTERY_DAYS different days. Numbers from the spec. */
export const MASTERY_WINDOW = 20;
export const MASTERY_RATIO = 0.85;
export const MASTERY_DAYS = 3;

/**
 * Decide a pre-skill's state from its attempt rows alone. Order of
 * `attempts` does not matter; the newest WINDOW are judged.
 */
export function preSkillStatus(code: PreSkillCode, attempts: PreSkillAttempt[]): PreSkillState {
  const mine = attempts.filter(a => a.preSkill === code)
    .sort((a, b) => a.at.localeCompare(b.at));
  if (mine.length === 0) return 'new';
  const recent = mine.slice(-MASTERY_WINDOW);
  if (recent.length < MASTERY_WINDOW) return 'practicing';
  const correct = recent.filter(a => a.correct).length;
  const days = new Set(recent.map(a => a.at.slice(0, 10)));
  return correct / recent.length >= MASTERY_RATIO && days.size >= MASTERY_DAYS
    ? 'mastered' : 'practicing';
}

export function allStatuses(attempts: PreSkillAttempt[]): Record<PreSkillCode, PreSkillState> {
  const out = {} as Record<PreSkillCode, PreSkillState>;
  for (const p of PRE_SKILLS) out[p.code] = preSkillStatus(p.code, attempts);
  return out;
}

/**
 * Which pre-skills a game may offer right now: its own, whose
 * `after` list is at least practicing. Mastered ones stay in the
 * list — nothing is ever taken away from her, the mix just widens —
 * but they go LAST so a fresh one is what the game reaches for
 * first. Empty only when a game has no pre-skills at all.
 */
export function offerable(game: PreSkill['game'], statuses: Record<PreSkillCode, PreSkillState>): PreSkillCode[] {
  const mine = PRE_SKILLS.filter(p => p.game === game);
  const open = mine.filter(p => p.after.every(a => statuses[a] !== 'new'));
  const fresh = open.filter(p => statuses[p.code] !== 'mastered').map(p => p.code);
  const done = open.filter(p => statuses[p.code] === 'mastered').map(p => p.code);
  return fresh.length > 0 ? fresh : done;
}

/** Every V1 game pre-skill mastered — the parent card's "ready for Level 1". */
export function readyForLevelOne(statuses: Record<PreSkillCode, PreSkillState>): boolean {
  return PRE_SKILLS.filter(p => p.game !== null && p.game !== 'signature')
    .every(p => statuses[p.code] === 'mastered');
}
