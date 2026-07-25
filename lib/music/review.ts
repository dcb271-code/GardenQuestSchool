// lib/music/review.ts
//
// Spaced review for the music room.
//
// The gap this fills: a unit used to be one-and-done. Pass it once at
// 70% and it was ticked forever, and the third of it she got WRONG
// never came back. Retrieval practice is the best-evidenced idea in
// learning, and the main engine already uses Leitner boxes for it —
// music had none.
//
// So each unit carries a box. Do well and it climbs, and the next
// review is further away; do badly and it drops to the bottom and
// comes back tomorrow. The music room opens with whatever is due.
//
// Deliberately at UNIT granularity rather than per-question, because
// the exercises are generated fresh each time — there is no stable
// "item" to schedule. A unit is the smallest thing that reliably means
// the same skill twice.

export interface ReviewState {
  /** 1 = shakiest, 5 = solid. */
  box: number;
  /** ISO date (yyyy-mm-dd) this unit next wants revisiting. */
  due: string;
  /** Best first-try accuracy so far, 0..1 — drives the mastery badge. */
  best: number;
}

export type ReviewMap = Record<string, ReviewState>;

/** Days until a unit in each box comes back. Classic expanding schedule. */
export const BOX_DAYS: Record<number, number> = {
  1: 1, 2: 3, 3: 7, 4: 16, 5: 35,
};

export const MAX_BOX = 5;

/** Accuracy at or above this moves a unit UP a box. */
export const PROMOTE_AT = 0.9;
/** Below this and the unit goes back to the beginning. */
export const RESET_BELOW = 0.7;

export function addDays(isoDay: string, days: number): string {
  const d = new Date(`${isoDay}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Fold one practice result into a unit's review state.
 *
 * `accuracy` is FIRST-TRY accuracy: getting it right after three wrong
 * guesses is not the same as knowing it, and scheduling should reflect
 * that.
 */
export function recordResult(
  prev: ReviewState | undefined,
  accuracy: number,
  today: string,
): ReviewState {
  const box = prev?.box ?? 1;
  let next: number;
  if (accuracy >= PROMOTE_AT) next = Math.min(MAX_BOX, box + 1);
  else if (accuracy < RESET_BELOW) next = 1;
  else next = box;                       // held its ground, same interval

  return {
    box: next,
    due: addDays(today, BOX_DAYS[next]),
    best: Math.max(prev?.best ?? 0, accuracy),
  };
}

/** Units wanting attention today, shakiest first. */
export function dueUnits(review: ReviewMap, today: string): string[] {
  return Object.entries(review)
    .filter(([, s]) => s.due <= today)
    .sort((a, b) => a[1].box - b[1].box)
    .map(([code]) => code);
}

export type Badge = 'none' | 'bronze' | 'silver' | 'gold';

/**
 * What the unit card shows. Gold means she got everything right first
 * try — which is the only reason to go back to a unit she has already
 * "finished", so it needs to be visible and worth having.
 */
export function badgeFor(state: ReviewState | undefined): Badge {
  if (!state) return 'none';
  if (state.best >= 1) return 'gold';
  if (state.best >= 0.9) return 'silver';
  if (state.best >= 0.7) return 'bronze';
  return 'none';
}

export const BADGE_MARK: Record<Badge, string> = {
  none: '', bronze: '🥉', silver: '🥈', gold: '🥇',
};

/** Today, as the yyyy-mm-dd the schedule uses. */
export function todayKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}
