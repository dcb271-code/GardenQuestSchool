import { describe, it, expect } from 'vitest';
import {
  SHOP_ITEMS, getShopItem, emptyShop, instanceIds, codeOf, unplaced,
  canAfford, snapToGrid, canPlaceAt, overlaps, SNAP,
} from '@/lib/world/shopCatalog';
import { ART_CODES } from '@/components/child/garden/ShopItemArt';

describe('the shop catalog', () => {
  it('draws every item it sells', () => {
    for (const item of SHOP_ITEMS) {
      expect(ART_CODES, `${item.code} has no artwork`).toContain(item.code);
    }
  });

  it('sells everything that was promised in writing', () => {
    const codes = SHOP_ITEMS.map(i => i.code);
    for (const promised of ['bench', 'stone_lantern', 'birdbath', 'sundial']) {
      expect(codes, `promised her a ${promised}`).toContain(promised);
    }
  });

  it('has unique codes and sane prices', () => {
    const codes = SHOP_ITEMS.map(i => i.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const i of SHOP_ITEMS) {
      expect(i.price).toBeGreaterThan(0);
      expect(i.w).toBeGreaterThan(0);
      expect(i.h).toBeGreaterThan(0);
      expect(i.worth.length).toBeGreaterThan(4);
    }
  });

  // She has 190p after the founding payment. If nothing at all were
  // reachable, the shop would teach her the feature is fake.
  it('has something she can afford on opening day', () => {
    expect(SHOP_ITEMS.some(i => canAfford(190, i))).toBe(true);
    expect(SHOP_ITEMS.some(i => !canAfford(190, i))).toBe(true); // and something to save for
  });
});

describe('owning and placing', () => {
  it('numbers duplicates so two benches are different objects', () => {
    expect(instanceIds(['bench', 'bench', 'sundial']))
      .toEqual(['bench#0', 'bench#1', 'sundial#0']);
    expect(codeOf('bench#1')).toBe('bench');
  });

  it('knows what is still in the shed', () => {
    const s = { owned: ['bench', 'bench'], placed: { 'bench#0': { x: 40, y: 40 } } };
    expect(unplaced(s)).toEqual(['bench#1']);
  });

  it('snaps to the grid', () => {
    expect(snapToGrid(0)).toBe(0);
    expect(snapToGrid(19)).toBe(0);
    expect(snapToGrid(21)).toBe(SNAP);
    expect(snapToGrid(-21)).toBe(-SNAP);
  });
});

describe('where a thing may stand', () => {
  const bench = getShopItem('bench')!;
  const bounds = { w: 1200, h: 800 };

  it('allows an empty spot', () => {
    expect(canPlaceAt(bench, 400, 400, [], bounds)).toBe(true);
  });

  it('refuses to hang off the edge of the map', () => {
    expect(canPlaceAt(bench, 5, 400, [], bounds)).toBe(false);
    expect(canPlaceAt(bench, 1195, 400, [], bounds)).toBe(false);
    expect(canPlaceAt(bench, 400, 2, [], bounds)).toBe(false);
    expect(canPlaceAt(bench, 400, 798, [], bounds)).toBe(false);
  });

  // A bench on top of the carrots is not a garden.
  it('refuses a spot already occupied', () => {
    const bed = { x: 400, y: 400, w: 96, h: 96 };
    expect(canPlaceAt(bench, 400, 400, [bed], bounds)).toBe(false);
    expect(canPlaceAt(bench, 400, 560, [bed], bounds)).toBe(true);
  });

  it('detects overlap symmetrically', () => {
    const a = { x: 100, y: 100, w: 40, h: 40 };
    const b = { x: 130, y: 100, w: 40, h: 40 };
    expect(overlaps(a, b)).toBe(true);
    expect(overlaps(b, a)).toBe(true);
    const far = { x: 200, y: 100, w: 40, h: 40 };
    expect(overlaps(a, far)).toBe(false);
  });

  it('lets two things stand exactly edge to edge', () => {
    const a = { x: 100, y: 100, w: 40, h: 40 };
    const b = { x: 140, y: 100, w: 40, h: 40 };
    expect(overlaps(a, b)).toBe(false);
  });
});
