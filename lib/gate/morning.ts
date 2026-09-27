// lib/gate/morning.ts
//
// The morning gate — the pure half. Owner's ask (2026-09-27): before
// 8am Eastern, Esme's and Cecily's profiles are locked unless a code
// is entered, and the code changes every day by a formula a grown-up
// can do in their head. And the first time a child comes in each day,
// three chore questions, then a half-minute pause before the garden
// opens.
//
// Nothing here reads a clock or a database: every function takes
// `now` and the child's stored state, so the rules can be tested at
// 7:59 and 8:00 on any day of the year.

export const GATE_TIME_ZONE = 'America/New_York';
export const CUTOFF_HOUR = 8;

/** Whose mornings are gated. Not Otto, not the shared tablets. */
export const GATED_FIRST_NAMES = ['Esme', 'Cecily'];

export function isMorningGated(firstName: string | null | undefined): boolean {
  return !!firstName && GATED_FIRST_NAMES.includes(firstName);
}

/* ── the day, in Eastern time ────────────────────────────────────── */

export interface LocalParts { dateKey: string; hour: number; year: number; month: number; day: number }

export function localParts(now: Date, timeZone = GATE_TIME_ZONE): LocalParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit',
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find(p => p.type === t)?.value ?? 0);
  const year = get('year'), month = get('month'), day = get('day');
  // Some engines print midnight as "24".
  const hour = get('hour') % 24;
  return { dateKey: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, hour, year, month, day };
}

export function isBeforeCutoff(now: Date): boolean {
  return localParts(now).hour < CUTOFF_HOUR;
}

/* ── the daily code ──────────────────────────────────────────────── */

/**
 * day × month + year (two digits). 2026-09-27 → 27 × 9 + 26 = 269.
 * Short enough to type on a number pad, changes every day, and a
 * grown-up can work it out at the kitchen counter. Also shown on the
 * parent page, so nobody has to.
 */
export function dailyCode(parts: Pick<LocalParts, 'year' | 'month' | 'day'>): string {
  return String(parts.day * parts.month + (parts.year % 100));
}

export const CODE_FORMULA = 'day × month + year';

/* ── chores ──────────────────────────────────────────────────────── */

export interface Chore { code: string; ask: string; label: string }

export const CHORES: Chore[] = [
  { code: 'dressed', ask: 'Did you get dressed?', label: 'got dressed' },
  { code: 'dishes',  ask: 'Did you put your dishes away?', label: 'put dishes away' },
  { code: 'toys',    ask: 'Did you put some toys away?', label: 'put toys away' },
];

/** The pause between the questions and the garden. No clock is shown. */
export const CHORE_WAIT_MS = 30_000;

/* ── state and decision ──────────────────────────────────────────── */

/** Lives in world_state.garden.morning. */
export interface MorningState {
  /** dateKey the code was entered. */
  codeOn?: string;
  /** dateKey the chores were asked. */
  choresOn?: string;
  /** What she said, most recent day. */
  chores?: Record<string, boolean>;
  /** ISO time she answered. */
  choresAt?: string;
}

export type GateStep = 'open' | 'code' | 'chores' | 'wait';

/**
 * What stands between this child and the garden right now.
 *   - code:   it is before the cutoff and today's code has not been entered
 *   - chores: first visit of the day (any hour)
 *   - wait:   the chores were answered less than CHORE_WAIT_MS ago —
 *             enforced HERE, so a refresh does not skip the pause
 *   - open:   nothing
 * The code comes first: no chore questions before the door is unlocked.
 */
export function gateStep(firstName: string | null | undefined, now: Date, state: MorningState | null | undefined): GateStep {
  if (!isMorningGated(firstName)) return 'open';
  const { dateKey, hour } = localParts(now);
  if (hour < CUTOFF_HOUR && state?.codeOn !== dateKey) return 'code';
  if (state?.choresOn !== dateKey) return 'chores';
  if (waitRemainingMs(now, state) > 0) return 'wait';
  return 'open';
}

/** Milliseconds of the pause still to go; 0 when it is over or never started. */
export function waitRemainingMs(now: Date, state: MorningState | null | undefined): number {
  if (!state?.choresAt) return 0;
  const started = Date.parse(state.choresAt);
  if (Number.isNaN(started)) return 0;
  return Math.max(0, started + CHORE_WAIT_MS - now.getTime());
}

export function codeMatches(entered: string, now: Date): boolean {
  return entered.trim() === dailyCode(localParts(now));
}
