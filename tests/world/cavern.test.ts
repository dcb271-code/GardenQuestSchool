// tests/world/cavern.test.ts
//
// The Crystal Cavern economy, and mostly the rules that stop it
// becoming a grind. This project's documented failure mode is a child
// farming easy content for rewards — a currency that buys things is
// exactly that shape, so the caps are the part worth testing.

import { describe, it, expect } from 'vitest';
import {
  emptyCavern, canDig, coinsToPrice, rollDig, creatureForDig,
  sellGem, keepGem, caseProgress, CAVERN_CREATURES,
} from '@/lib/world/cavern';
import { GEM_CATALOG, getGem } from '@/lib/world/gemCatalog';

// The cap was one a day and is now two, at least five minutes apart.
// The detailed rules live in cavernDigs.test.ts; these are the two
// facts that must never stop being true.
describe('the dig cap — the server owns it', () => {
  it('lets a fresh cavern dig', () => {
    expect(canDig(emptyCavern(), '2026-08-06')).toBe(true);
  });

  it('stops her once the day is spent', () => {
    const spent = { digDate: '2026-08-06', digsToday: 2 };
    expect(canDig(spent, '2026-08-06')).toBe(false);
    expect(canDig(spent, '2026-08-07')).toBe(true);
  });
});

describe('what a dig turns up', () => {
  it('is overwhelmingly local stone — the seam is what is under Kentucky', () => {
    let seam = 0;
    for (let i = 0; i < 1000; i++) {
      if (rollDig(i / 1000).shelf === 'seam') seam++;
    }
    expect(seam / 1000).toBeGreaterThan(0.8);
  });

  it('can still turn up a case piece, so a ruby stays an event', () => {
    const shelves = new Set(
      Array.from({ length: 1000 }, (_, i) => rollDig(i / 1000).shelf),
    );
    expect(shelves.has('case')).toBe(true);
  });

  it('always returns a real gem, at every roll including the edges', () => {
    for (const roll of [0, 0.5, 0.93, 0.94, 0.99, 0.999999]) {
      expect(getGem(rollDig(roll).code), `roll ${roll}`).toBeDefined();
    }
  });
});

describe('the creatures in the dark', () => {
  it('meets the salamander first — the one she asked for', () => {
    expect(creatureForDig([], 0.1)).toBe('cave_salamander');
  });

  it('works through them in order and then stops', () => {
    let found: string[] = [];
    for (const expected of CAVERN_CREATURES) {
      const next = creatureForDig(found, 0.1);
      expect(next).toBe(expected);
      found = [...found, next!];
    }
    expect(creatureForDig(found, 0.1)).toBeNull();
  });

  it('most digs are stone, not creatures', () => {
    expect(creatureForDig([], 0.5)).toBeNull();
    expect(creatureForDig([], 0.9)).toBeNull();
  });
});

describe('keep or sell — the choice is the feature', () => {
  /**
   * A stone she was actually handed. Both paths now refuse anything the
   * server did not give her, so every case here has to start from a
   * real find — which is the point of the guard.
   */
  const holding = (code: string) => ({ ...emptyCavern(), currentFind: code });

  it('selling pays the stone\'s worth and adds no stone to the case', () => {
    const { state, paid } = sellGem(holding('kentucky_agate'), 'kentucky_agate');
    expect(paid).toBe(getGem('kentucky_agate')!.valuePerGram);
    expect(state.coins).toBe(paid);
    expect(Object.keys(state.kept)).toHaveLength(0);
  });

  it('keeping fills the case and pays nothing — that IS the trade-off', () => {
    const state = keepGem(holding('fluorite'), 'fluorite');
    expect(state.coins).toBe(0);
    expect(state.kept.fluorite).toBe(1);
  });

  it('an unknown stone changes nothing either way', () => {
    const start = emptyCavern();
    expect(sellGem(start, 'moon_cheese').paid).toBe(0);
    expect(keepGem(start, 'moon_cheese')).toEqual(start);
    // and a real stone she was never handed is refused just as firmly
    expect(sellGem(start, 'diamond').paid).toBe(0);
  });

  // The order of worth is still the lesson, but it is no longer told
  // through the till: a case gem has no cash price at all now, because
  // 500,000 pennies against a 590-penny shop breaks either the economy
  // or the honesty of the number. The catalog still says what a ruby is
  // worth, and the shop trades one whole for a monument.
  it('a ruby is worth far more than a day of agate — the order is the lesson', () => {
    expect(getGem('ruby')!.valuePerGram)
      .toBeGreaterThan(getGem('kentucky_agate')!.valuePerGram * 100);
  });

  it('but a ruby cannot be cashed — it is traded, not sold', () => {
    expect(sellGem(holding('ruby'), 'ruby').paid).toBe(0);
    expect(sellGem(holding('kentucky_agate'), 'kentucky_agate').paid).toBe(40);
  });
});

describe('the display case', () => {
  it('counts species of stone, not piles of it', () => {
    // Each keep needs its own find, because one dig is one stone.
    const dig = (st: ReturnType<typeof emptyCavern>, code: string) =>
      keepGem({ ...st, currentFind: code }, code);
    let s = dig(emptyCavern(), 'geode');
    s = dig(s, 'geode');
    expect(caseProgress(s).have).toBe(1);
    s = dig(s, 'coal');
    expect(caseProgress(s).have).toBe(2);
    expect(caseProgress(s).total).toBe(GEM_CATALOG.length);
  });
});

describe('coinsToPrice', () => {
  it('reads like money, because the point is money maths', () => {
    expect(coinsToPrice(40)).toBe('40c');
    expect(coinsToPrice(100)).toBe('$1');
    expect(coinsToPrice(250)).toBe('$2.50');
    expect(coinsToPrice(205)).toBe('$2.05');
  });

  it('never shows a negative or a fraction of a penny', () => {
    expect(coinsToPrice(-5)).toBe('0c');
    expect(coinsToPrice(12.7)).toBe('13c');
  });
});
