// lib/birds/lifeList.ts
//
// The life list: birds she has ACTUALLY SEEN, out of a window or on a
// walk. Not birds she passed a quiz about.
//
// This is the part of the bird curriculum that reaches outside the
// app. The study the whole design rests on — White, Eberstein & Scott
// (2018), 220 children aged 7–10 — got its gains from installing
// feeders and letting children WATCH, not from instruction. The app's
// job is to be the field guide, not the whole experience, and this is
// the file where that belief is cashed in.
//
// Stored in world_state.garden.bird_lifelist, following the same
// convention as bird_units and bird_review: progress lives in the
// jsonb blob, never in a new table.

import { BIRD_CATALOG, getBird, type BirdData } from '@/lib/world/birdCatalog';

export interface LifeListEntry {
  /** ISO date of the first sighting — the entry that earns the gem. */
  firstSeen: string;
  /** How many times she has logged this bird. */
  count: number;
  /** Her own words. The best thing in the whole feature. */
  note?: string;
  /** ISO date of the most recent sighting. */
  lastSeen?: string;
}

export type LifeList = Record<string, LifeListEntry>;

export interface LifeListRow {
  bird: BirdData;
  entry: LifeListEntry | null;
}

/**
 * Record a sighting. Returns the new list and whether this was a
 * FIRST — the caller grants the 'noticing' gem on a first only.
 *
 * Pure, so the rule is testable without a database: seeing a bird
 * twice in one day must not mint two gems, and the existing 1-per-day
 * virtue cap is not the thing being relied on here.
 */
export function recordSighting(
  list: LifeList, birdCode: string, today: string, note?: string,
): { list: LifeList; isFirst: boolean } {
  const existing = list[birdCode];
  const trimmed = note?.trim();
  const next: LifeListEntry = existing
    ? {
        ...existing,
        count: existing.count + 1,
        lastSeen: today,
        // A new note replaces the old one; an empty note leaves what
        // she wrote before alone rather than wiping it.
        note: trimmed ? trimmed : existing.note,
      }
    : { firstSeen: today, lastSeen: today, count: 1, note: trimmed || undefined };
  return { list: { ...list, [birdCode]: next }, isFirst: !existing };
}

/**
 * Where an unscored bird sits.
 *
 * `localPoints` is the Louisville Parks FEEDER guide's score, so a
 * bird that does not visit feeders has no score at all — and null
 * emphatically does NOT mean rare. The American Robin is the case in
 * point: one of the most abundant birds in America, on every lawn in
 * the city, and absent from the guide purely because it eats worms
 * rather than seed. Treating null as 100 put "a rare one" under a
 * robin, which is not a display quirk, it is teaching a child
 * something false.
 *
 * 40 places them among the common birds. It is a placement decision,
 * not a claim about data we do not have.
 */
const UNSCORED_RANK = 40;

/**
 * The list as she should read it: rarest first.
 *
 * `localPoints` is the Louisville Parks feeder guide's rarity score —
 * 20 for the commonest feeder bird, 100 for the rarest — so sorting
 * descending puts the hard-won sighting at the top and makes a Brown
 * Creeper feel like the event it is. Cardinals and chickadees, which
 * she will see every single day, settle to the bottom where they
 * belong.
 *
 * Unseen birds come after seen ones: the list is a record of what she
 * has done, with the rest shown underneath as an invitation.
 */
export function lifeListRows(list: LifeList): LifeListRow[] {
  const rarity = (b: BirdData) => b.localPoints ?? UNSCORED_RANK;
  return BIRD_CATALOG
    .map(bird => ({ bird, entry: list[bird.code] ?? null }))
    .sort((a, b) => {
      if (!!a.entry !== !!b.entry) return a.entry ? -1 : 1;
      const byRarity = rarity(b.bird) - rarity(a.bird);
      if (byRarity !== 0) return byRarity;
      return a.bird.commonName.localeCompare(b.bird.commonName);
    });
}

/** How many species she has actually seen. */
export function lifeListCount(list: LifeList): number {
  return Object.keys(list).filter(code => !!getBird(code)).length;
}

/**
 * Kid-facing word for how special a sighting is, from the same local
 * frequency data. Deliberately gentle at the common end — "one you
 * will see often" is an invitation to look, not a demotion.
 *
 * A bird with no feeder score gets told the TRUTH about why: it does
 * not come to feeders. That is a real and useful thing to know when
 * you are trying to find one — you look on the lawn, not at the pole.
 */
export function rarityLabel(bird: BirdData): string {
  if (bird.localPoints === null) return 'look on the lawn, not at the feeder';
  const pts = bird.localPoints;
  if (pts <= 20) return 'one you will see often';
  if (pts <= 40) return 'around most days';
  if (pts <= 60) return 'a good find';
  if (pts <= 80) return 'not an everyday bird';
  return 'a rare one';
}

/**
 * A fact she has not been given yet for this bird.
 *
 * Every bird carries three, and the curriculum's teach pages lead with
 * the first — so a sighting hands back the SECOND on the first
 * sighting, the third on the next, then wraps. The reward for seeing a
 * real bird should be something she did not already know, not the line
 * the lesson opened with.
 */
export function sightingFact(bird: BirdData, count: number): string {
  if (bird.facts.length === 0) return bird.colourHook;
  // count is 1 on the first sighting; skip facts[0], the taught one.
  const idx = bird.facts.length === 1 ? 0 : 1 + ((count - 1) % (bird.facts.length - 1));
  return bird.facts[idx] ?? bird.facts[0];
}

/** '2026-08-02' → '2 Aug'. A date a child reads, not a timestamp. */
export function friendlyDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = MONTHS[Number(m[2]) - 1];
  return month ? `${Number(m[3])} ${month}` : iso;
}
