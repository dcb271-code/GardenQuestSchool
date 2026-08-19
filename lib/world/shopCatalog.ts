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

export type ShopShelf = 'yard' | 'great_work';

export interface ShopItem {
  code: string;
  name: string;
  /**
   * Pennies, the same purse the cavern fills. Zero for a Great Work —
   * those are not bought with money at all.
   */
  price: number;
  shelf: ShopShelf;
  /**
   * A Great Work is BARTERED, not bought: she hands over this stone
   * and gets the thing.
   *
   * Money could not do this job. A diamond is 500,000 pennies and the
   * whole Yard costs 590, so any single price is either unreachable or
   * ends the economy the moment it is paid — and pricing the monument
   * at 500,000 just moves the absurdity around. Trading the stone
   * itself keeps the catalog values true, keeps "this stone buys that
   * thing" legible, and makes the decision the interesting one: the
   * ruby OR the observatory, never both.
   */
  tradeFor?: string;
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

export const GREAT_WORKS: ShopItem[] = [
  {
    code: 'stone_bridge', name: 'Little Stone Bridge', price: 0, shelf: 'great_work',
    tradeFor: 'garnet',
    blurb: 'A humped stone bridge over the wet corner, wide enough for one person.',
    worth: 'trade one garnet', w: 130, h: 62,
  },
  {
    code: 'glasshouse', name: 'Glasshouse', price: 0, shelf: 'great_work',
    tradeFor: 'sapphire',
    blurb: 'A little house made of windows, warm enough to start seeds while it is still frozen outside.',
    worth: 'trade one sapphire', w: 132, h: 116,
  },
  {
    code: 'observatory', name: 'Observatory', price: 0, shelf: 'great_work',
    tradeFor: 'ruby',
    blurb: 'A round tower with a roof that opens, and a telescope pointed at the sky you already know the names of.',
    worth: 'trade one ruby', w: 118, h: 146,
  },
  {
    code: 'stone_well', name: 'Stone Well', price: 0, shelf: 'great_work',
    tradeFor: 'diamond',
    blurb: 'A deep well with a bucket on a rope, and a roof to keep the rain out of the water.',
    worth: 'trade one diamond', w: 112, h: 124,
  },
];

/** Everything on both shelves. */
export const ALL_SHOP_ITEMS: ShopItem[] = [...SHOP_ITEMS, ...GREAT_WORKS];

export function getShopItem(code: string): ShopItem | undefined {
  return ALL_SHOP_ITEMS.find(i => i.code === code);
}

export function itemsOnShelf(shelf: ShopShelf): ShopItem[] {
  return ALL_SHOP_ITEMS.filter(i => i.shelf === shelf);
}

/** Does she hold the stone this Great Work asks for? */
export function canTradeFor(
  item: ShopItem, kept: Record<string, number>,
): boolean {
  return !!item.tradeFor && (kept[item.tradeFor] ?? 0) > 0;
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
  /** Treats she is carrying: treatCode -> count. See lib/world/treats. */
  pantry?: Record<string, number>;
  /** speciesCode -> ISO date last fed — the one-treat-a-day cap. */
  animalsFed?: Record<string, string>;
  /** speciesCode -> lifetime feeds, so the facts rotate. */
  fedCount?: Record<string, number>;
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

/* ─── where a monument may stand ──────────────────────────────────── */

/**
 * Reserved ground for the Great Works.
 *
 * An observatory is nearly the size of a habitat, and the garden map
 * already holds beds, habitats and paths. Free placement is right for a
 * bench and wrong for a tower: a monument wedged behind the ant hill is
 * not a landmark. So there are four chosen places, each picked to suit
 * what stands on it, and she decides WHICH — not anywhere.
 */
export interface Landmark { code: string; x: number; y: number; note: string }

export const LANDMARKS: Landmark[] = [
  { code: 'wet_corner', x: 700, y: 620, note: 'the wet corner' },
  { code: 'open_rise',  x: 980, y: 300, note: 'the open rise' },
  { code: 'by_the_beds', x: 470, y: 250, note: 'beside the beds' },
  { code: 'near_the_path', x: 840, y: 470, note: 'near the path' },
];

/** How close a tap must be to count as landing on a landmark. */
export const LANDMARK_RADIUS = 110;

export function nearestLandmark(x: number, y: number): Landmark | null {
  let best: Landmark | null = null;
  let bestD = Infinity;
  for (const l of LANDMARKS) {
    const d = Math.hypot(l.x - x, l.y - y);
    if (d < bestD) { bestD = d; best = l; }
  }
  return bestD <= LANDMARK_RADIUS ? best : null;
}

export function isGreatWork(item: ShopItem): boolean {
  return item.shelf === 'great_work';
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
  // A Great Work only stands on reserved ground.
  if (isGreatWork(item) && !nearestLandmark(x, y)) return false;
  const half = { w: item.w / 2, h: item.h / 2 };
  if (x - half.w < 0 || x + half.w > bounds.w) return false;
  if (y - half.h < 0 || y + half.h > bounds.h) return false;
  const me: Box = { x, y, w: item.w, h: item.h };
  return !obstacles.some(o => overlaps(me, o));
}
