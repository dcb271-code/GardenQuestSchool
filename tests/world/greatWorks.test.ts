import { describe, it, expect } from 'vitest';
import {
  GREAT_WORKS, getShopItem, canTradeFor, itemsOnShelf,
  LANDMARKS, nearestLandmark, isGreatWork, canPlaceAt,
} from '@/lib/world/shopCatalog';
import { emptyCavern, spendKeptGem, sellGem, sellKept, isSellableForCoins } from '@/lib/world/cavern';
import { getGem } from '@/lib/world/gemCatalog';

describe('the Great Works are bartered, not bought', () => {
  it('each one asks for a real case gem', () => {
    for (const w of GREAT_WORKS) {
      const gem = getGem(w.tradeFor!);
      expect(gem, `${w.code} trades for ${w.tradeFor}`).toBeDefined();
      expect(gem!.shelf).toBe('case');
      expect(w.price).toBe(0);
    }
  });

  it('asks for a different gem each — one stone, one monument', () => {
    const stones = GREAT_WORKS.map(w => w.tradeFor);
    expect(new Set(stones).size).toBe(stones.length);
  });

  it('knows whether she can afford the trade', () => {
    const obs = getShopItem('observatory')!;
    expect(canTradeFor(obs, {})).toBe(false);
    expect(canTradeFor(obs, { ruby: 1 })).toBe(true);
  });

  it('takes exactly one stone out of the case', () => {
    const c = { ...emptyCavern(), kept: { ruby: 2 } };
    const after = spendKeptGem(c, 'ruby')!;
    expect(after.kept.ruby).toBe(1);
    expect(spendKeptGem(after, 'ruby')!.kept.ruby).toBeUndefined();
  });

  it('refuses when she has none', () => {
    expect(spendKeptGem(emptyCavern(), 'ruby')).toBeNull();
  });
});

// The bug that started this: a diamond is 500,000 pennies against a
// Yard that costs 590 in total.
describe('case gems have no cash price', () => {
  it('cannot be sold from the hand', () => {
    const holding = { ...emptyCavern(), currentFind: 'diamond' };
    expect(sellGem(holding, 'diamond').paid).toBe(0);
  });

  it('cannot be sold out of the case either', () => {
    const c = { ...emptyCavern(), kept: { diamond: 1 } };
    expect(sellKept(c, 'diamond').paid).toBe(0);
    expect(sellKept(c, 'diamond').state.kept.diamond).toBe(1);
  });

  it('still lets seam stones be sold', () => {
    const holding = { ...emptyCavern(), currentFind: 'kentucky_agate' };
    expect(sellGem(holding, 'kentucky_agate').paid).toBe(40);
    expect(isSellableForCoins('kentucky_agate')).toBe(true);
    expect(isSellableForCoins('diamond')).toBe(false);
  });

  it('puts four monuments on the great_work shelf', () => {
    expect(itemsOnShelf('great_work')).toHaveLength(4);
    expect(itemsOnShelf('yard')).toHaveLength(6);
  });
});

describe('a monument only stands on reserved ground', () => {
  const obs = getShopItem('observatory')!;
  const bench = getShopItem('bench')!;
  const bounds = { w: 1200, h: 800 };
  const spot = LANDMARKS[0];

  it('accepts a tap on a landmark', () => {
    expect(canPlaceAt(obs, spot.x, spot.y, [], bounds)).toBe(true);
  });

  it('refuses open ground, however empty', () => {
    expect(canPlaceAt(obs, 120, 120, [], bounds)).toBe(false);
  });

  it('snaps from a near miss onto the landmark itself', () => {
    const near = nearestLandmark(spot.x + 40, spot.y - 30);
    expect(near?.code).toBe(spot.code);
    expect(nearestLandmark(40, 40)).toBeNull();
  });

  // A bench is not a monument and must not be restricted.
  it('leaves ordinary ornaments free to go anywhere', () => {
    expect(canPlaceAt(bench, 120, 120, [], bounds)).toBe(true);
    expect(isGreatWork(bench)).toBe(false);
    expect(isGreatWork(obs)).toBe(true);
  });

  it('gives every landmark a distinct spot and a name', () => {
    const codes = LANDMARKS.map(l => l.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const l of LANDMARKS) expect(l.note.length).toBeGreaterThan(3);
    // enough places for every monument
    expect(LANDMARKS.length).toBeGreaterThanOrEqual(GREAT_WORKS.length);
  });
});
