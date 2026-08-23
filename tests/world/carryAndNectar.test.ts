import { describe, it, expect } from 'vitest';
import { analyzeSum, makeCarrySum, WATCH_DEMO } from '@/lib/packs/math/carry';
import {
  buildNectarRound, birdRemark, recordRound, canEarnFlowerToday, ROUND_LENGTH,
} from '@/lib/packs/math/hummingbird';

describe('the carrying lanes', () => {
  it('analyzes columns correctly, carries only completed tens', () => {
    const s = analyzeSum(47, 38);
    expect(s.total).toBe(85);
    expect(s.columns[0]).toMatchObject({ sum: 15, writes: 5, carryOut: 1 });
    expect(s.columns[1]).toMatchObject({ carryIn: 1, sum: 8, writes: 8, carryOut: 0 });
    const clean = analyzeSum(23, 45);
    expect(clean.carryCount).toBe(0);
  });

  it('a practice sum always has at least one carry, at every size', () => {
    for (const digits of [2, 3, 4] as const) {
      for (const seed of [1, 7, 42, 99]) {
        const s = makeCarrySum(seed, digits);
        expect(s.carryCount).toBeGreaterThanOrEqual(1);
        expect(String(s.a).length).toBe(digits);
        expect(s.total).toBeLessThan(10 ** digits);
        expect(s.a + s.b).toBe(s.total);
      }
    }
  });

  it('the demo is 47+38 with exactly one carry — the narration depends on it', () => {
    expect(WATCH_DEMO.a).toBe(47);
    expect(WATCH_DEMO.carryCount).toBe(1);
  });
});

describe('nectar rounds', () => {
  it('deals ten answerable, unique facts within 20', () => {
    const round = buildNectarRound(7);
    expect(round).toHaveLength(ROUND_LENGTH);
    const keys = new Set<string>();
    for (const f of round) {
      expect(f.a + f.b).toBeLessThanOrEqual(20);
      expect(f.choices[f.correctIndex]).toBe(f.a + f.b);
      expect(new Set(f.choices).size).toBe(f.choices.length);
      keys.add(f.a <= f.b ? `${f.a}+${f.b}` : `${f.b}+${f.a}`);
    }
    expect(keys.size).toBe(ROUND_LENGTH);
    expect(buildNectarRound(7)).toEqual(round);
  });

  it('the bird remarks on speed ONLY for a clean personal best', () => {
    // first clean round sets the bar without comparing
    const first = birdRemark({}, ROUND_LENGTH, 60000);
    expect(first.newBestMs).toBe(60000);
    // clean but slower: praised, no speed talk, best unchanged
    const slower = birdRemark({ bestMs: 60000 }, ROUND_LENGTH, 90000);
    expect(slower.newBestMs).toBeUndefined();
    expect(slower.remark.toLowerCase()).not.toContain('quick');
    // clean and faster: the only time speed is ever mentioned
    const faster = birdRemark({ bestMs: 60000 }, ROUND_LENGTH, 45000);
    expect(faster.newBestMs).toBe(45000);
    expect(faster.remark.toLowerCase()).toContain('quicker');
    // a missy round: kind, and silent about time
    const rough = birdRemark({ bestMs: 60000 }, 5, 30000);
    expect(rough.newBestMs).toBeUndefined();
    expect(rough.remark.toLowerCase()).not.toContain('quick');
  });

  it('one flower a day, and a second round pays nothing', () => {
    const d1 = recordRound({}, 10, 50000, '2026-08-23');
    expect(d1.flowerEarned).toBe(true);
    expect(d1.state.flowers).toBe(1);
    const d1b = recordRound(d1.state, 10, 40000, '2026-08-23');
    expect(d1b.flowerEarned).toBe(false);
    expect(d1b.state.flowers).toBe(1);
    expect(d1b.state.bestMs).toBe(40000); // best still updates
    expect(canEarnFlowerToday(d1b.state, '2026-08-24')).toBe(true);
  });
});
