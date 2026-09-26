/**
 * The pure half of scripts/rebaseline-level0.ts: decide which
 * skill_progress rows change when a child moves to Level 0, and what
 * they become. Nothing here touches a database.
 *
 * Mastery states are the planner's OPINION of a child. When the
 * opinion is wrong (a sister's answers under a four-year-old's name),
 * the fix is to change the opinion and leave the history: rows go
 * back to `new`, every attempt and Elo stays, and the transition log
 * carries REASON so the change is visible and reversible by hand.
 */

export const REBASELINE_REASON = 'rebaseline-level0';

export interface Transition { at: string; to: string; from: string; reason?: string }

export interface ProgressRowLike {
  skill_id: string;
  mastery_state: string;
  state_transitions: Transition[] | null;
}

export interface RebaselineChange {
  skill_id: string;
  from: string;
  state_transitions: Transition[];
}

export function planRebaseline(rows: ProgressRowLike[], now: string): {
  alreadyDone: boolean;
  changes: RebaselineChange[];
} {
  const alreadyDone = rows.some(r =>
    (r.state_transitions ?? []).some(t => t.reason === REBASELINE_REASON));
  const changes = rows
    .filter(r => r.mastery_state === 'mastered' || r.mastery_state === 'review')
    .map(r => ({
      skill_id: r.skill_id,
      from: r.mastery_state,
      state_transitions: [
        ...(r.state_transitions ?? []),
        { at: now, to: 'new', from: r.mastery_state, reason: REBASELINE_REASON },
      ],
    }));
  return { alreadyDone, changes };
}
