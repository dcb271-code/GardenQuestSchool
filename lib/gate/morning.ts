// lib/gate/morning.ts
//
// The morning gate — the pure half. Owner's ask (2026-09-27): before
// a cutoff hour Eastern, Esme's and Cecily's profiles are locked
// unless a code is entered, and the code changes every day by a
// formula a grown-up can do in their head. The first time a child
// comes in each day, a short chore checklist — tick at least one —
// then a half-minute pause before the garden opens.
//
// The cutoff hour and the chores are the parent's to set (parent
// page → parent.settings.morning); DEFAULT_MORNING_CONFIG is what
// applies until they do. Nothing here reads a clock or a database:
// every function takes `now`, the child's state and the config, so
// the rules can be tested at 7:59 and 8:00 on any day of the year.

export const GATE_TIME_ZONE = 'America/New_York';

/** Whose mornings are gated. Not Otto, not the shared tablets. */
export const GATED_FIRST_NAMES = ['Esme', 'Cecily'];

export function isMorningGated(firstName: string | null | undefined): boolean {
  return !!firstName && GATED_FIRST_NAMES.includes(firstName);
}

/* ── the parent's settings ───────────────────────────────────────── */

/** The drawn icons a chore can wear (components/child/gate/ChoreIcons). */
export const CHORE_ICONS = ['clothes', 'dishes', 'toys', 'bed', 'teeth', 'backpack'] as const;
export type ChoreIcon = typeof CHORE_ICONS[number];

/** A chore is written the way you would say it: "get dressed". The
 *  question, the to-do and the parent's label are all formed from it. */
export interface Chore { id: string; text: string; icon: ChoreIcon }

export interface MorningConfig {
  /** Before this hour (Eastern), the code is needed. */
  cutoffHour: number;
  /** Up to MAX_CHORES; an empty list means no chore step at all. */
  chores: Chore[];
}

export const MAX_CHORES = 3;
export const MAX_CHORE_TEXT = 40;
export const MIN_CUTOFF_HOUR = 0;
export const MAX_CUTOFF_HOUR = 12;

export const DEFAULT_MORNING_CONFIG: MorningConfig = {
  cutoffHour: 8,
  chores: [
    { id: 'dressed', text: 'get dressed', icon: 'clothes' },
    { id: 'dishes', text: 'put your dishes away', icon: 'dishes' },
    { id: 'toys', text: 'put some toys away', icon: 'toys' },
  ],
};

/** Whatever is stored → a config the rules can trust. Unknown or
 *  malformed parts fall back field by field, never wholesale. */
export function normalizeMorningConfig(raw: unknown): MorningConfig {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const hour = Number(r.cutoffHour);
  const cutoffHour = Number.isInteger(hour) && hour >= MIN_CUTOFF_HOUR && hour <= MAX_CUTOFF_HOUR
    ? hour : DEFAULT_MORNING_CONFIG.cutoffHour;
  const chores: Chore[] = [];
  if (Array.isArray(r.chores)) {
    for (const c of r.chores as Array<Record<string, unknown>>) {
      const text = String(c?.text ?? '').trim().slice(0, MAX_CHORE_TEXT);
      if (!text) continue;
      const icon = (CHORE_ICONS as readonly string[]).includes(String(c?.icon)) ? (c.icon as ChoreIcon) : 'toys';
      const id = String(c?.id ?? '').trim() || `chore-${chores.length + 1}`;
      if (chores.some(x => x.id === id)) continue;
      chores.push({ id, text, icon });
      if (chores.length >= MAX_CHORES) break;
    }
  } else if (r.chores === undefined) {
    chores.push(...DEFAULT_MORNING_CONFIG.chores);
  }
  return { cutoffHour, chores };
}

/** "get dressed" → "Did you get dressed?" */
export function choreQuestion(chore: Pick<Chore, 'text'>): string {
  return `Did you ${chore.text.replace(/[.?!]+$/, '')}?`;
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

export function isBeforeCutoff(now: Date, config: MorningConfig = DEFAULT_MORNING_CONFIG): boolean {
  return localParts(now).hour < config.cutoffHour;
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

export function codeMatches(entered: string, now: Date): boolean {
  return entered.trim() === dailyCode(localParts(now));
}

/* ── the pause ───────────────────────────────────────────────────── */

/** Between the checklist and the garden. No clock is shown. */
export const CHORE_WAIT_MS = 30_000;

/* ── state and decision ──────────────────────────────────────────── */

/** Lives in world_state.garden.morning. */
export interface MorningState {
  /** dateKey the code was entered. */
  codeOn?: string;
  /** dateKey the checklist was answered. */
  choresOn?: string;
  /** Which chores she ticked, by id, most recent day. */
  chores?: Record<string, boolean>;
  /** ISO time she answered. */
  choresAt?: string;
}

export type GateStep = 'open' | 'code' | 'chores' | 'wait';

/**
 * What stands between this child and the garden right now.
 *   - code:   before the cutoff and today's code has not been entered
 *   - chores: first visit of the day (any hour), if there are chores
 *   - wait:   the checklist was answered less than CHORE_WAIT_MS ago —
 *             enforced HERE, so a refresh does not skip the pause
 *   - open:   nothing
 * The code comes first: no checklist before the door is unlocked.
 */
export function gateStep(
  firstName: string | null | undefined, now: Date, state: MorningState | null | undefined,
  config: MorningConfig = DEFAULT_MORNING_CONFIG,
): GateStep {
  if (!isMorningGated(firstName)) return 'open';
  const { dateKey, hour } = localParts(now);
  if (hour < config.cutoffHour && state?.codeOn !== dateKey) return 'code';
  if (config.chores.length > 0 && state?.choresOn !== dateKey) return 'chores';
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

/**
 * The checklist's one rule: at least one chore ticked, and only
 * chores that exist. Returns the answers to store, or null.
 */
export function acceptChecklist(config: MorningConfig, ticked: string[]): Record<string, boolean> | null {
  const ids = new Set(config.chores.map(c => c.id));
  const done = new Set(ticked.filter(id => ids.has(id)));
  if (done.size === 0) return null;
  const out: Record<string, boolean> = {};
  for (const c of config.chores) out[c.id] = done.has(c.id);
  return out;
}
