// Focus sessions: "just let me practice Reading / Math" — a
// subject-scoped five-question mix, as opposed to the exploration
// compass which picks ONE skill per session. The item route rotates
// through the ordered list below so each question in a focus session
// can come from a different skill.

export interface FocusSkillRow {
  skillCode: string;
  masteryState: 'new' | 'learning' | 'review' | 'mastered';
  studentElo: number;
  nextReviewAt: Date | null;
  lastAttemptedAt: Date | null;
}

// Session skill_planned prefix that marks a focus session, e.g.
// "focus.math". The suffix is a subject code from the subject table.
export const FOCUS_SKILL_PREFIX = 'focus.';

export function isFocusPlan(skillPlanned: string | null | undefined): boolean {
  return !!skillPlanned?.startsWith(FOCUS_SKILL_PREFIX);
}

export function focusSubjectOf(skillPlanned: string): string {
  return skillPlanned.slice(FOCUS_SKILL_PREFIX.length);
}

/**
 * Order a learner's skills for a focus session:
 *   1. due reviews, most overdue first — spaced repetition wins
 *   2. in-progress skills (learning / review), weakest Elo first —
 *      shore up what's shaky
 *   3. mastered refresh, least recently practiced first
 * 'new' skills are excluded: focus mode reviews what the learner has
 * met; brand-new material stays an exploration reward.
 */
export function orderFocusSkills(rows: FocusSkillRow[], now: Date = new Date()): string[] {
  const isDue = (r: FocusSkillRow) =>
    r.nextReviewAt !== null && r.nextReviewAt.getTime() <= now.getTime();

  const due = rows
    .filter(r => r.masteryState !== 'new' && isDue(r))
    .sort((a, b) => (a.nextReviewAt!.getTime()) - (b.nextReviewAt!.getTime()));
  const inProgress = rows
    .filter(r => !isDue(r) && (r.masteryState === 'learning' || r.masteryState === 'review'))
    .sort((a, b) => a.studentElo - b.studentElo);
  const refresh = rows
    .filter(r => !isDue(r) && r.masteryState === 'mastered')
    .sort((a, b) =>
      (a.lastAttemptedAt?.getTime() ?? 0) - (b.lastAttemptedAt?.getTime() ?? 0));

  return [...due, ...inProgress, ...refresh].map(r => r.skillCode);
}

/**
 * Which skill should the Nth question of a focus session use?
 * Rotates through the ordered list so a five-question session touches
 * five different skills when the learner has that many.
 */
export function pickFocusSkill(
  rows: FocusSkillRow[],
  attemptedCount: number,
  now: Date = new Date(),
): string | null {
  const order = orderFocusSkills(rows, now);
  if (order.length === 0) return null;
  return order[attemptedCount % order.length];
}
