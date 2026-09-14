// lib/world/room.ts
//
// Upstairs — each child's bedroom. House phase 3, spec:
// docs/superpowers/specs/2026-08-29-upstairs-spec.md.
//
// Three fixtures, all hers: a six-frame gallery wall (the reading
// room has two; the promise in writing was "a LOT more"), a bed with
// a choice of quilt, and a treasure shelf with three spots for the
// things she already collects but has nowhere to show off together.
//
// NO GATES, NO COSTS. "Nobody earns their own front door" extends
// upstairs: the room, the quilts, the hanging, the shelf are free.
//
// State lives in world_state.garden.room — each child's room in THEIR
// blob, the letterbox convention. Never a migration.

import { getGem, type GemData } from '@/lib/world/gemCatalog';
import { getBird, type BirdData } from '@/lib/world/birdCatalog';
import { PRIZE_VEGGIES, type PrizeVeggie } from '@/lib/packs/math/munch';
import { hangPicture, type ArtGallery, type ArtPiece } from '@/lib/world/artStore';

/* ── who gets a door ────────────────────────────────────────────── */

/**
 * The coat hooks downstairs render every learner row, and that
 * includes the shared tablet profiles. A tablet can visit (it gets
 * a coat hook) but a tablet does not sleep: the landing has one door
 * per CHILD. Two shared profiles exist today, both by name.
 */
export const SHARED_PROFILES: readonly string[] = ['Friends', 'Family'];

export function getsABedroom(firstName: string): boolean {
  return !SHARED_PROFILES.includes(firstName);
}

/* ── quilts ─────────────────────────────────────────────────────── */

export type QuiltCode = 'patch' | 'star' | 'sun' | 'sea';

export interface QuiltData {
  code: QuiltCode;
  name: string;
  blurb: string;
}

/** Four drawn quilts, free, swappable anytime. Patch is the default. */
export const QUILTS: QuiltData[] = [
  { code: 'patch', name: 'the patchwork quilt',
    blurb: 'Squares of every color, sewn edge to edge.' },
  { code: 'star', name: 'the star quilt',
    blurb: 'Seven rows of seven stars. Count them — the crow did.' },
  { code: 'sun', name: 'the sun quilt',
    blurb: 'One big sun in the middle, warm to the corners.' },
  { code: 'sea', name: 'the sea quilt',
    blurb: 'Blue waves, and a little boat that never gets anywhere.' },
];

export const DEFAULT_QUILT: QuiltCode = 'patch';

export function getQuilt(code: string | undefined): QuiltData {
  return QUILTS.find(q => q.code === code) ?? QUILTS[0];
}

/* ── the gallery wall ───────────────────────────────────────────── */

export const BEDROOM_SLOTS = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'] as const;
export type BedroomSlot = typeof BEDROOM_SLOTS[number];

/** The reading room's two, unchanged since phase 2. */
export const READING_SLOTS = ['left', 'right'] as const;

export type WallName = 'reading' | 'bedroom';

export const WALLS: Record<WallName, readonly string[]> = {
  reading: READING_SLOTS,
  bedroom: BEDROOM_SLOTS,
};

/**
 * A wall/slot pair must agree. `wall: 'reading', slot: 'r3'` is a
 * mistake, and a mistake is refused in words — never guessed at.
 */
export function checkWallSlot(wall: WallName, slot: string): { error: string } | null {
  if (WALLS[wall].includes(slot)) return null;
  const other: WallName = wall === 'reading' ? 'bedroom' : 'reading';
  if (WALLS[other].includes(slot)) {
    return { error: `That spot is on the ${other === 'bedroom' ? 'bedroom' : 'reading room'} wall, not the ${wall === 'bedroom' ? 'bedroom' : 'reading room'} one.` };
  }
  return { error: 'There is no spot on the wall by that name.' };
}

/* ── the treasure shelf ─────────────────────────────────────────── */

export type ShelfKind = 'stone' | 'bird' | 'veggie';

export interface ShelfItem {
  kind: ShelfKind;
  code: string;
}

export const SHELF_SPOTS = 3;

/** What she really has — the shelf displays, it never conjures. */
export interface Collections {
  /** cavern.kept: stone code → how many kept. */
  kept: Record<string, number>;
  /** bird_lifelist keys — birds she has really seen. */
  lifeList: string[];
  /** arcade.munch.prizes codes — veggies she really won. */
  prizes: string[];
}

export function ownsShelfItem(item: ShelfItem, c: Collections): boolean {
  switch (item.kind) {
    case 'stone':  return (c.kept[item.code] ?? 0) > 0 && !!getGem(item.code);
    case 'bird':   return c.lifeList.includes(item.code) && !!getBird(item.code);
    case 'veggie': return c.prizes.includes(item.code)
                     && PRIZE_VEGGIES.some(v => v.code === item.code);
  }
}

/* ── the room ───────────────────────────────────────────────────── */

export interface RoomState {
  quilt?: QuiltCode;
  /** r1..r6 → art piece id from her own gallery. */
  hung?: Partial<Record<BedroomSlot, string>>;
  /** Index is the spot; null is an empty spot. At most three. */
  shelf?: Array<ShelfItem | null>;
}

export function emptyRoom(): RoomState {
  return {};
}

/** A room with nothing chosen — the door card says so, warmly. */
export function isUndecorated(room: RoomState): boolean {
  return !room.quilt
    && Object.values(room.hung ?? {}).every(v => !v)
    && (room.shelf ?? []).every(s => s === null);
}

export function setQuilt(room: RoomState, code: string): { room: RoomState } | { error: string } {
  if (!QUILTS.some(q => q.code === code)) {
    return { error: 'That is not one of the quilts. Pick one from the chest.' };
  }
  return { room: { ...room, quilt: code as QuiltCode } };
}

/** Three spots, always; missing and extra entries normalized away. */
function normalizeShelf(shelf: Array<ShelfItem | null> | undefined): Array<ShelfItem | null> {
  const out: Array<ShelfItem | null> = [];
  for (let i = 0; i < SHELF_SPOTS; i++) out.push(shelf?.[i] ?? null);
  return out;
}

/**
 * Drop anything she no longer owns — a stone sold from the cavern,
 * for instance. Displaying never reserves: her stuff stays hers to
 * sell, and the shelf quietly makes room.
 */
export function pruneShelf(room: RoomState, c: Collections): RoomState {
  const shelf = normalizeShelf(room.shelf).map(s => (s && ownsShelfItem(s, c)) ? s : null);
  return { ...room, shelf };
}

/**
 * Put something on a spot, or `null` to clear it. Refuses, in words,
 * anything she does not really own and anything already standing on
 * another spot — one thing cannot be in two places.
 */
export function setShelf(
  room: RoomState, spot: number, item: ShelfItem | null, c: Collections,
): { room: RoomState } | { error: string } {
  if (!Number.isInteger(spot) || spot < 0 || spot >= SHELF_SPOTS) {
    return { error: 'The shelf has three spots. That is not one of them.' };
  }
  const shelf = normalizeShelf(pruneShelf(room, c).shelf);
  if (item === null) {
    shelf[spot] = null;
    return { room: { ...room, shelf } };
  }
  if (!ownsShelfItem(item, c)) {
    return { error: shelfRefusal(item) };
  }
  const elsewhere = shelf.findIndex((s, i) =>
    i !== spot && !!s && s.kind === item.kind && s.code === item.code);
  if (elsewhere >= 0) {
    return { error: 'That is already on the shelf. One thing, one spot.' };
  }
  shelf[spot] = { kind: item.kind, code: item.code };
  return { room: { ...room, shelf } };
}

function shelfRefusal(item: ShelfItem): string {
  switch (item.kind) {
    case 'stone':  return 'That stone is not in your case, so it cannot stand on your shelf.';
    case 'bird':   return 'The shelf only holds birds from your life list — ones you have really seen.';
    case 'veggie': return 'You have not won that veggie at the barn yet. The shelf shows real prizes.';
  }
}

/* ── hanging, bedroom side ──────────────────────────────────────── */

export function hangInBedroom(
  gallery: ArtGallery, room: RoomState, slot: string, id: string | null,
): { room: RoomState } | { error: string } {
  const bad = checkWallSlot('bedroom', slot);
  if (bad) return bad;
  const out = hangPicture(gallery, room.hung ?? {}, slot, id, BEDROOM_SLOTS);
  if ('error' in out) return out;
  return { room: { ...room, hung: out.hung as RoomState['hung'] } };
}

/* ── render helpers: tolerant of dangling refs, everywhere ──────── */

/**
 * Deleting a picture does not clean the wall, and selling a stone can
 * orphan a shelf entry. Both renderers — her own room and a sibling
 * visiting — resolve through here and get an empty slot for anything
 * they cannot find. Never a crash.
 */
export function resolveHung(
  room: RoomState, gallery: ArtGallery,
): Record<BedroomSlot, ArtPiece | null> {
  const out = {} as Record<BedroomSlot, ArtPiece | null>;
  for (const slot of BEDROOM_SLOTS) {
    const id = room.hung?.[slot];
    out[slot] = id ? (gallery.find(p => p.id === id) ?? null) : null;
  }
  return out;
}

export type ResolvedShelfItem =
  | { kind: 'stone'; gem: GemData }
  | { kind: 'bird'; bird: BirdData }
  | { kind: 'veggie'; veggie: PrizeVeggie };

export function resolveShelf(room: RoomState): Array<ResolvedShelfItem | null> {
  return normalizeShelf(room.shelf).map(item => {
    if (!item) return null;
    if (item.kind === 'stone') {
      const gem = getGem(item.code);
      return gem ? { kind: 'stone', gem } : null;
    }
    if (item.kind === 'bird') {
      const bird = getBird(item.code);
      return bird ? { kind: 'bird', bird } : null;
    }
    const veggie = PRIZE_VEGGIES.find(v => v.code === item.code);
    return veggie ? { kind: 'veggie', veggie } : null;
  });
}
