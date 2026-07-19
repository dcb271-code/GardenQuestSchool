/**
 * Garden Friend rules — pure functions, enforced server-side. The
 * client only displays what these compute.
 *
 * Anti-dark-pattern invariants (deliberate, do not "improve"):
 *  - Needs are per-day booleans derived from date columns. A missed
 *    day never stacks or punishes; it just means the need is fresh.
 *  - bond_xp only goes up. There is no decay code path.
 *  - Feeding is capped at once per day (server 409s), so the basket
 *    can't be dumped into the creature.
 *  - An unfed/unplayed companion NAPS. It is never sick, sad, or
 *    lost. Copy stays cozy ("having a cozy nap").
 */

// Day boundaries in the family's timezone — computing "today" in UTC
// would flip needs mid-evening US time.
export const FAMILY_TZ = 'America/Chicago';

export function todayString(tz: string = FAMILY_TZ, now: Date = new Date()): string {
  // en-CA gives YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(now);
}

// Max 2 XP/day (1 feed + 1 play) → levels are paced in days of gentle
// tending, not grindable in an afternoon.
export const BOND_LEVELS = [
  { level: 1, atXp: 4, unlock: 'nickname' },
  { level: 2, atXp: 10, unlock: 'bandana' },
  { level: 3, atXp: 22, unlock: 'flower_crown' },
] as const;

export function bondLevelFor(xp: number): number {
  let level = 0;
  for (const b of BOND_LEVELS) if (xp >= b.atXp) level = b.level;
  return level;
}

export function nextLevelAt(xp: number): number | null {
  for (const b of BOND_LEVELS) if (xp < b.atXp) return b.atXp;
  return null;
}

export interface CompanionNeeds {
  hungryToday: boolean;
  playedToday: boolean;
  napping: boolean;
}

export function computeNeeds(
  companion: { last_fed_on: string | null },
  playedToday: boolean,
  today: string = todayString(),
): CompanionNeeds {
  const hungryToday = companion.last_fed_on !== today;
  return {
    hungryToday,
    playedToday,
    // Pure presentation: nothing decays while napping.
    napping: hungryToday && !playedToday,
  };
}
