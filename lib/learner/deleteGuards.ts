// lib/learner/deleteGuards.ts
//
// The two rules that stand between a mis-tap and a child's entire
// history. Pure so they can be tested directly, because the thing they
// protect against is not recoverable: this project has already lost
// learner data once to a script that ran twice, and there is no
// point-in-time restore on this database.

export type DeleteVerdict =
  | { ok: true }
  | { ok: false; status: 400 | 404; error: string };

export function checkLearnerDelete(input: {
  /** The stored first name, or null if no such learner. */
  actualName: string | null;
  /** What the caller typed to confirm. */
  confirmName: string;
  /** How many profiles exist in total, including this one. */
  totalLearners: number;
}): DeleteVerdict {
  if (input.actualName == null) {
    return { ok: false, status: 404, error: 'no such learner' };
  }
  if (input.totalLearners <= 1) {
    return {
      ok: false, status: 400,
      error: 'this is the only profile — there would be no way back in',
    };
  }
  // Trimmed, but NOT case-folded. The name is the deliberate friction;
  // loosening the comparison loosens the only guard that depends on the
  // parent having actually read the card in front of them.
  if (input.confirmName.trim() !== input.actualName.trim()) {
    return {
      ok: false, status: 400,
      error: 'name did not match — nothing was deleted',
    };
  }
  return { ok: true };
}
