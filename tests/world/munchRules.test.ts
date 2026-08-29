// tests/world/munchRules.test.ts
//
// The Munch Patch engine invariants. The spec's law is that nothing
// about a board is trusted from templates — so these tests hammer
// the generators across hundreds of seeds and re-derive everything.

import { describe, it, expect } from 'vitest';
import {
  makeBoard, checkFace, whyWrong, ruleKey, offeredCrates, CRATES,
  pickEmptyIndex, recordClear, PRIZE_VEGGIES, BOARD_SIZE,
  type MunchRule, type MunchState,
} from '@/lib/packs/math/munch';

const SAMPLE_RULES: MunchRule[] = [
  { type: 'eat_number', target: 2 },
  { type: 'eat_number', target: 5 },
  { type: 'eat_number', target: 10 },
  { type: 'bigger_than', pivot: 15 },
  { type: 'bigger_than', pivot: 25 },
  { type: 'bigger_than', pivot: 75 },
  { type: 'sum_equals', target: 8 },
  { type: 'sum_equals', target: 12 },
  { type: 'sum_equals', target: 20 },
  { type: 'sum_equals', target: 41 },
  { type: 'sum_equals', target: 72 },
  { type: 'sum_equals', target: 99 },
  ...([2, 3, 4, 5, 6, 7, 8, 9] as const).map(k =>
    ({ type: 'multiple_of', k } as MunchRule)),
];

describe('makeBoard invariants (across many seeds)', () => {
  it('every tile is exactly what its flag says, on every rule', () => {
    for (const rule of SAMPLE_RULES) {
      for (let seed = 1; seed <= 60; seed++) {
        const board = makeBoard(rule, seed * 977);
        expect(board.tiles).toHaveLength(BOARD_SIZE);
        for (const tile of board.tiles) {
          // The predicate is the single source of truth — the flag
          // must agree with it. A distractor that satisfies the rule
          // (24→42 stays a multiple of 6) must never be planted.
          expect(checkFace(rule, tile.face)).toBe(tile.correct);
        }
      }
    }
  });

  it('grows 6–9 correct tiles of 20, and correctCount is honest', () => {
    for (const rule of SAMPLE_RULES) {
      for (let seed = 1; seed <= 40; seed++) {
        const board = makeBoard(rule, seed * 1013);
        const actual = board.tiles.filter(t => t.correct).length;
        expect(actual).toBe(board.correctCount);
        expect(actual).toBeGreaterThanOrEqual(6);
        expect(actual).toBeLessThanOrEqual(9);
      }
    }
  });

  it('is deterministic: same rule + seed grows the identical board', () => {
    for (const rule of SAMPLE_RULES) {
      const a = makeBoard(rule, 424242);
      const b = makeBoard(rule, 424242);
      expect(a).toEqual(b);
      // ...and a different seed grows a different layout (overwhelmingly).
      const c = makeBoard(rule, 424243);
      expect(a.tiles.map(t => t.face).join('|'))
        .not.toEqual(c.tiles.map(t => t.face).join('|'));
    }
  });

  it('sum boards never repeat a face string', () => {
    for (const target of [8, 12, 20, 41, 72, 99]) {
      for (let seed = 1; seed <= 40; seed++) {
        const board = makeBoard({ type: 'sum_equals', target }, seed * 31);
        const faces = board.tiles.map(t => t.face);
        expect(new Set(faces).size).toBe(faces.length);
      }
    }
  });

  it('sum faces parse strictly and never smuggle a wrong total', () => {
    const board = makeBoard({ type: 'sum_equals', target: 72 }, 7);
    for (const tile of board.tiles) {
      const m = /^(\d{1,2})\+(\d{1,2})$/.exec(tile.face);
      expect(m).not.toBeNull();
      expect((Number(m![1]) + Number(m![2]) === 72)).toBe(tile.correct);
    }
  });
});

describe('whyWrong computes, never asserts', () => {
  it('sum card shows the real total', () => {
    expect(whyWrong({ type: 'sum_equals', target: 12 }, '4+7'))
      .toBe('4 + 7 makes 11, not 12.');
  });

  it('bigger-than card knows before from equal', () => {
    expect(whyWrong({ type: 'bigger_than', pivot: 25 }, '23'))
      .toBe('23 comes before 25.');
    expect(whyWrong({ type: 'bigger_than', pivot: 25 }, '25'))
      .toContain('IS 25');
  });

  it('skip-count chain contains only true multiples plus the wrong value in place', () => {
    const card = whyWrong({ type: 'multiple_of', k: 6 }, '26');
    expect(card).toContain('18, 24, 26?, 30');
    // Derive the same guarantee generally, across rules and values.
    for (const k of [2, 3, 4, 5, 6, 7, 8, 9]) {
      for (const n of [k * 3 + 1, k * 5 - 1, k * 7 + 2]) {
        if (n % k === 0 || n > 99) continue;
        const text = whyWrong({ type: 'multiple_of', k }, String(n));
        const nums = text.split(' — ')[0].split(', ');
        for (const token of nums) {
          if (token.endsWith('?')) expect(Number(token.slice(0, -1))).toBe(n);
          else expect(Number(token) % k).toBe(0);
        }
        // The wrong value sits in sorted position.
        const values = nums.map(t => Number(t.replace('?', '')));
        expect([...values].sort((x, y) => x - y)).toEqual(values);
      }
    }
  });

  it('eat-number card names both numbers', () => {
    const card = whyWrong({ type: 'eat_number', target: 5 }, '6');
    expect(card).toContain('6');
    expect(card).toContain('5');
  });
});

describe('the crates', () => {
  it('offers everything at or below level, plus exactly one marked stretch', () => {
    const l1 = offeredCrates(1);
    expect(l1.filter(c => !c.stretch).map(c => c.code)).toEqual(['find']);
    expect(l1.filter(c => c.stretch)).toHaveLength(1);
    expect(l1.find(c => c.stretch)!.minLevel).toBe(2);

    const l2 = offeredCrates(2);
    expect(l2.filter(c => !c.stretch)).toHaveLength(3);
    expect(l2.find(c => c.stretch)!.minLevel).toBe(3);
  });

  it('level 3+ sees the full catalog and no sprout — nothing harder exists to offer', () => {
    for (const level of [3, 4, 5]) {
      const offered = offeredCrates(level);
      expect(offered).toHaveLength(CRATES.length);
      expect(offered.every(c => !c.stretch)).toBe(true);
    }
  });

  it('every crate rolls a rule its own board generator can always grow', () => {
    for (const crate of CRATES) {
      for (let seed = 1; seed <= 25; seed++) {
        const rule = crate.roll(seed * 131);
        expect(() => makeBoard(rule, seed * 7919)).not.toThrow();
        expect(ruleKey(rule)).toMatch(/^[a-z_]+_\d+$/);
      }
    }
  });
});

describe('regrow accounting', () => {
  it('always lands on an offered empty tile', () => {
    for (let i = 0; i < 50; i++) {
      const empties = [3, 8, 14];
      const idx = pickEmptyIndex(empties, i / 50);
      expect(empties).toContain(idx);
    }
  });

  it('an empty-tile regrow with no empties is a loud caller bug, not silence', () => {
    expect(() => pickEmptyIndex([], 0.5)).toThrow();
  });
});

describe('the prize shelf', () => {
  it('first clear of the day pays one veggie; later clears pay nothing', () => {
    const first = recordClear({}, 'multiple_of_6', '2026-08-29');
    expect(first.prize).not.toBeNull();
    expect(first.state.prizes).toHaveLength(1);
    expect(first.state.cleared).toEqual({ multiple_of_6: 1 });

    const second = recordClear(first.state, 'sum_equals_12', '2026-08-29');
    expect(second.prize).toBeNull();
    expect(second.state.prizes).toHaveLength(1); // shelf unchanged
    expect(second.state.cleared).toEqual({ multiple_of_6: 1, sum_equals_12: 1 });

    const nextDay = recordClear(second.state, 'multiple_of_6', '2026-08-30');
    expect(nextDay.prize).not.toBeNull();
    expect(nextDay.state.prizes).toHaveLength(2);
  });

  it('prize codes on the shelf are all real catalog veggies', () => {
    let state: MunchState = {};
    for (let d = 1; d <= 28; d++) {
      const day = `2026-09-${String(d).padStart(2, '0')}`;
      state = recordClear(state, 'find_5', day).state;
    }
    const codes = new Set(PRIZE_VEGGIES.map(v => v.code));
    for (const p of state.prizes ?? []) expect(codes.has(p.code)).toBe(true);
    // Date-seeding actually varies the pick across a month.
    expect(new Set((state.prizes ?? []).map(p => p.code)).size).toBeGreaterThan(2);
  });
});
