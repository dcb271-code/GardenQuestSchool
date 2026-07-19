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
  /** Catalog difficulty 0..1 (skill.level). Defaults to 0.5 when a
   *  caller doesn't supply it. */
  level?: number;
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

// A due review whose catalog level sits this far below the learner's
// current frontier is "basement backlog": still worth cycling through
// eventually, but it must never LEAD a focus session. (This is exactly
// how "targeted practice" served a Level-3 learner counting-to-120
// fill-in-the-blanks: her oldest due rows were her easiest.)
const FAR_BELOW_FRONTIER = 0.35;

/**
 * Order a learner's skills for a focus session:
 *   1. due reviews near her frontier, HARDEST first (level desc) —
 *      spaced repetition still wins, but sessions open at her edge,
 *      not at the bottom of the backlog…
 *   2. …woven alternately with in-progress skills (weakest Elo
 *      first), so a five-question session mixes review and shoring-up
 *   3. far-below-frontier due reviews — they still cycle, just last
 *   4. mastered refresh, least recently practiced first
 * 'new' skills are excluded: focus mode reviews what the learner has
 * met; brand-new material stays an exploration reward.
 */
export function orderFocusSkills(rows: FocusSkillRow[], now: Date = new Date()): string[] {
  const isDue = (r: FocusSkillRow) =>
    r.nextReviewAt !== null && r.nextReviewAt.getTime() <= now.getTime();
  const levelOf = (r: FocusSkillRow) => r.level ?? 0.5;

  const due = rows
    .filter(r => r.masteryState !== 'new' && isDue(r))
    .sort((a, b) =>
      (levelOf(b) - levelOf(a))
      // equal difficulty → most overdue first (classic spaced rep)
      || (a.nextReviewAt!.getTime() - b.nextReviewAt!.getTime()));
  const inProgress = rows
    .filter(r => !isDue(r) && (r.masteryState === 'learning' || r.masteryState === 'review'))
    .sort((a, b) => a.studentElo - b.studentElo);
  const refresh = rows
    .filter(r => !isDue(r) && r.masteryState === 'mastered')
    .sort((a, b) =>
      (a.lastAttemptedAt?.getTime() ?? 0) - (b.lastAttemptedAt?.getTime() ?? 0));

  // The frontier is the hardest thing she's actively working or owes a
  // review on; due skills far beneath it go to the tail.
  const frontierLevel = Math.max(0, ...due.map(levelOf), ...inProgress.map(levelOf));
  const nearDue = due.filter(r => levelOf(r) >= frontierLevel - FAR_BELOW_FRONTIER);
  const basementDue = due.filter(r => levelOf(r) < frontierLevel - FAR_BELOW_FRONTIER);

  // Weave near-frontier due reviews with shaky in-progress skills.
  const woven: FocusSkillRow[] = [];
  for (let i = 0; i < Math.max(nearDue.length, inProgress.length); i++) {
    if (i < nearDue.length) woven.push(nearDue[i]);
    if (i < inProgress.length) woven.push(inProgress[i]);
  }

  return [...woven, ...basementDue, ...refresh].map(r => r.skillCode);
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
