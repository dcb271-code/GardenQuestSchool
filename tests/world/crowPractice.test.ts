import { describe, it, expect } from 'vitest';
import {
  buildCrowDeck, recordCrowResults, goldKeysOf,
  GOLD_FIRST_TRIES, GOLD_MIN_DAYS,
  type CrowCacheState,
} from '@/lib/packs/math/crowPractice';
import { CROW_SCENES } from '@/lib/packs/math/crowScenes';
import { factKey } from '@/lib/packs/math/timesTable';

const EMPTY_ACC = new Map<string, { correct: number; total: number }>();

describe('the deck', () => {
  it('is deterministic by seed and answerable throughout', () => {
    const a = buildCrowDeck(EMPTY_ACC, new Set(), 7);
    expect(a).toEqual(buildCrowDeck(EMPTY_ACC, new Set(), 7));
    expect(a.length).toBe(8);
    for (const q of a) {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.choices.length);
      if (q.kind === 'forward') {
        const scene = CROW_SCENES.find(s => factKey(s.a, s.b) === q.factKey)!;
        expect(q.choices[q.correctIndex]).toBe(scene.product);
        expect(new Set(q.choices).size).toBe(q.choices.length);
      } else {
        expect(q.choices[q.correctIndex]).toBe(q.sceneCode);
      }
    }
  });

  it('alternates directions, covers every scene, doubles the weakest', () => {
    // Every fact has a record; 7x8 is the worst. (An unseen fact
    // sorts weaker than any seen one, by design — meeting it matters.)
    const acc = new Map(
      CROW_SCENES.map(s => [factKey(s.a, s.b), { correct: 8, total: 10 }]),
    );
    acc.set(factKey(7, 8), { correct: 1, total: 10 });
    const deck = buildCrowDeck(acc, new Set(), 3);
    expect(deck.filter(q => q.kind === 'forward').length).toBe(4);
    expect(deck.filter(q => q.kind === 'reverse').length).toBe(4);
    const keys = deck.map(q => q.factKey);
    for (const s of CROW_SCENES) expect(keys).toContain(factKey(s.a, s.b));
    // the weakest fact (7x8 at 10%) leads and repeats
    expect(keys[0]).toBe(factKey(7, 8));
    expect(keys.filter(k => k === factKey(7, 8)).length).toBe(2);
  });

  it('gold facts still appear, but at the back of the line', () => {
    const gold = new Set([factKey(6, 6)]);
    const deck = buildCrowDeck(EMPTY_ACC, gold, 5);
    const keys = deck.slice(0, 6).map(q => q.factKey);
    expect(keys[5]).toBe(factKey(6, 6));
    expect(keys.slice(0, 5)).not.toContain(factKey(6, 6));
  });
});

describe('gold frames', () => {
  const K = factKey(7, 8);
  const hit = (fk: string) => ({ factKey: fk, correct: true, retries: 0 });

  it('needs three first-tries across at least two days', () => {
    let cache: CrowCacheState = {};
    let out = recordCrowResults(cache, [hit(K), hit(K), hit(K)], '2026-08-19');
    // three hits, one day — not gold yet
    expect(out.newlyGold).toEqual([]);
    expect(goldKeysOf(out.cache).has(K)).toBe(false);

    out = recordCrowResults(out.cache, [hit(K)], '2026-08-20');
    expect(out.newlyGold).toEqual([K]);
    expect(goldKeysOf(out.cache).has(K)).toBe(true);
    expect(GOLD_FIRST_TRIES).toBe(3);
    expect(GOLD_MIN_DAYS).toBe(2);
  });

  it('a miss costs nothing and never resets progress', () => {
    let out = recordCrowResults({}, [hit(K), hit(K)], '2026-08-19');
    out = recordCrowResults(out.cache, [{ factKey: K, correct: false, retries: 2 }], '2026-08-20');
    expect(out.cache.facts![K].firstTry).toBe(2);
    out = recordCrowResults(out.cache, [hit(K)], '2026-08-21');
    expect(out.newlyGold).toEqual([K]);
  });

  it('gold never re-announces, and the feather comes once, on all six', () => {
    // One hit per fact per day: firstTry reaches 3 on the third day,
    // which is when gold (and the feather) land.
    let cache: CrowCacheState = {};
    for (const day of ['2026-08-19', '2026-08-20', '2026-08-21', '2026-08-22']) {
      const all = CROW_SCENES.map(s => hit(factKey(s.a, s.b)));
      const out = recordCrowResults(cache, all, day);
      cache = out.cache;
      if (day === '2026-08-20') {
        expect(out.newlyGold).toEqual([]);
        expect(out.newFeather).toBe(false);
      }
      if (day === '2026-08-21') {
        expect(out.newlyGold.length).toBe(6);
        expect(out.newFeather).toBe(true);
      }
      if (day === '2026-08-22') {
        expect(out.newlyGold).toEqual([]);
        expect(out.newFeather).toBe(false);
      }
    }
    expect(cache.featherAt).toBe('2026-08-21');
  });
});
