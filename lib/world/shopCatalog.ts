// lib/world/shopCatalog.ts
//
// The Yard — phase one of the shop.
//
// The promise, in writing, three times over:
//
//   "Coins buy things for the garden. Not seeds, because you already
//    earn those. I mean things you BUILD and place where you want them:
//    a bench, a stone lantern, a birdbath, a little bridge, a sundial.
//    Your garden, arranged by you."
//
// Every item named in that sentence is in here. Prices are set against
// what a stone actually sells for, so the arithmetic is legible: a
// bench is one Kentucky agate, a birdbath is one freshwater pearl. She
// can look at a stone and know what it is worth in benches.
//
// See docs/superpowers/specs/2026-08-09-shop-spec.md. The Great Works —
// the case-gem tier — are phase two and deliberately not here yet.

export type ShopShelf = 'yard';

export interface ShopItem {
  code: string;
  name: string;
  /** Pennies, the same purse the cavern fills. */
  price: number;
  shelf: ShopShelf;
  /** What it is, in her language. Shown under the name. */
  blurb: string;
  /** Roughly what it costs in stones, so the price means something. */
  worth: string;
  /** Footprint on the garden map, in map units. Drives collision. */
  w: number;
  h: number;
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    code: 'log_seat', name: 'Log seat', price: 30, shelf: 'yard',
    blurb: 'A sawn log, flat on top. Somewhere to sit and watch.',
    worth: 'about six quartz', w: 54, h: 34,
  },
  {
    code: 'bench', name: 'Wooden bench', price: 40, shelf: 'yard',
    blurb: 'Two people. Or one person and a lot of thinking.',
    worth: 'one Kentucky agate', w: 76, h: 44,
  },
  {
    code: 'stepping_stones', name: 'Stepping stones', price: 60, shelf: 'yard',
    blurb: 'Flat stones set into the grass, for crossing the wet bit.',
    worth: 'about four fluorite', w: 88, h: 30,
  },
  {
    code: 'stone_lantern', name: 'Stone lantern', price: 90, shelf: 'yard',
    blurb: 'A carved lantern that glows after dark. Japanese gardens keep these by a path.',
    worth: 'about two agates', w: 44, h: 76,
  },
  {
    code: 'birdbath', name: 'Birdbath', price: 150, shelf: 'yard',
    blurb: 'Shallow water on a pedestal. Birds drink AND bathe in it.',
    worth: 'one freshwater pearl', w: 56, h: 70,
  },
  {
    code: 'sundial', name: 'Sundial', price: 220, shelf: 'yard',
    blurb: 'Tells the time with a shadow. Only works when the sun is out, which is the joke.',
    worth: 'a good week of digging', w: 52, h: 60,
  },
];

export function getShopItem(code: string): ShopItem | undefined {
  return SHOP_ITEMS.find(i => i.code === code);
}

export function itemsOnShelf(shelf: ShopShelf): ShopItem[] {
  return SHOP_ITEMS.filter(i => i.shelf === shelf);
}

/* ─── what she owns and where she has put it ──────────────────────── */

export interface PlacedItem { x: number; y: number }

export interface ShopState {
  /** Item codes bought. Buying the same thing twice is allowed. */
  owned: string[];
  /**
   * Where each owned item sits, keyed by INSTANCE id (`code#n`), so two
   * benches can stand in different places.
   */
  placed: Record<string, PlacedItem>;
}

export function emptyShop(): ShopState {
  return { owned: [], placed: {} };
}

/** `bench#0`, `bench#1`, … in the order they were bought. */
export function instanceIds(owned: string[]): string[] {
  const seen: Record<string, number> = {};
  return owned.map(code => {
    const n = seen[code] ?? 0;
    seen[code] = n + 1;
    return `${code}#${n}`;
  });
}

export function codeOf(instanceId: string): string {
  return instanceId.split('#')[0];
}

/** Owned but not yet put anywhere — waiting in the shed. */
export function unplaced(state: ShopState): string[] {
  return instanceIds(state.owned).filter(id => !state.placed[id]);
}

export function canAfford(coins: number, item: ShopItem): boolean {
  return coins >= item.price;
}

/* ─── placement rules ─────────────────────────────────────────────── */

/**
 * The grid everything snaps to.
 *
 * Free placement was the point — she asked to put things "where you
 * want them" — but a finger on a tablet lands within about twenty
 * units of where it means to, and a garden of things each three units
 * off true reads as broken rather than arranged. Snapping keeps it
 * hers and keeps it tidy.
 */
export const SNAP = 40;

export function snapToGrid(v: number): number {
  return Math.round(v / SNAP) * SNAP;
}

export interface Box { x: number; y: number; w: number; h: number }

export function overlaps(a: Box, b: Box): boolean {
  return Math.abs(a.x - b.x) * 2 < a.w + b.w
      && Math.abs(a.y - b.y) * 2 < a.h + b.h;
}

/**
 * Whether an item may stand at (x, y).
 *
 * Rejects anything that would sit on a bed, a habitat, a path or
 * another ornament — a bench on top of the carrots is not a garden,
 * and a child who cannot see why her bench will not go there will
 * assume the game is broken rather than that she is on the potatoes.
 * The caller supplies the obstacles so this stays pure.
 */
export function canPlaceAt(
  item: ShopItem,
  x: number, y: number,
  obstacles: Box[],
  bounds: { w: number; h: number },
): boolean {
  const half = { w: item.w / 2, h: item.h / 2 };
  if (x - half.w < 0 || x + half.w > bounds.w) return false;
  if (y - half.h < 0 || y + half.h > bounds.h) return false;
  const me: Box = { x, y, w: item.w, h: item.h };
  return !obstacles.some(o => overlaps(me, o));
}
