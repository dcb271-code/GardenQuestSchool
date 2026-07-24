// tests/world/estimationDuel.test.ts
import { describe, it, expect } from 'vitest';
import {
  DUEL_ROUNDS, DUEL_ROUNDS_PER_GAME, ESTIMATION_MIN_LEVEL,
  duelRoundsForDay, scoreRound,
} from '@/lib/world/estimationDuel';

describe('DUEL_ROUNDS', () => {
  it('rounds are well-formed: 4 choices, unique ids, positive exact', () => {
    const ids = new Set(DUEL_ROUNDS.map(r => r.id));
    expect(ids.size).toBe(DUEL_ROUNDS.length);
    for (const r of DUEL_ROUNDS) {
      expect(r.choices).toHaveLength(4);
      expect(r.exact).toBeGreaterThan(0);
      expect(r.hodgeGuess).toBeGreaterThan(0);
      expect(r.reasonHint.length).toBeGreaterThan(10);
    }
  });

  it('benchmark_count rounds are honest: exact equals the sum of the clusters, and every cluster is "about 10"', () => {
    for (const r of DUEL_ROUNDS) {
      if (r.kind !== 'benchmark_count') continue;
      const sum = r.clusters.reduce((a, b) => a + b, 0);
      expect(sum, r.id).toBe(r.exact);
      // The benchmark cluster is exactly 10, others within 8–12 so the
      // "count the bundles of ten" strategy genuinely works.
      expect(r.clusters[0], r.id).toBe(10);
      for (const c of r.clusters) {
        expect(c, r.id).toBeGreaterThanOrEqual(8);
        expect(c, r.id).toBeLessThanOrEqual(12);
      }
    }
  });

  it('benchmark_length rounds are honest: exact equals the drawn unit count', () => {
    for (const r of DUEL_ROUNDS) {
      if (r.kind !== 'benchmark_length') continue;
      expect(r.exact, r.id).toBe(r.units);
    }
  });

  it('in every round the child can beat Hodge by reasoning (best choice is strictly closer than Hodge)', () => {
    for (const r of DUEL_ROUNDS) {
      const bestOff = Math.min(...r.choices.map(c => Math.abs(c - r.exact)));
      const hodgeOff = Math.abs(r.hodgeGuess - r.exact);
      expect(bestOff, r.id).toBeLessThan(hodgeOff);
    }
  });

  it('the best choice is unique — no ties between candidate estimates', () => {
    for (const r of DUEL_ROUNDS) {
      const offs = r.choices.map(c => Math.abs(c - r.exact)).sort((a, b) => a - b);
      expect(offs[0], r.id).toBeLessThan(offs[1]);
    }
  });
});

describe('duelRoundsForDay', () => {
  it('returns 3 distinct rounds, deterministically for a given day', () => {
    const a = duelRoundsForDay('2026-07-23');
    const b = duelRoundsForDay('2026-07-23');
    expect(a.map(r => r.id)).toEqual(b.map(r => r.id));
    expect(new Set(a.map(r => r.id)).size).toBe(DUEL_ROUNDS_PER_GAME);
  });

  it('different days can produce different lineups', () => {
    const days = ['2026-07-23', '2026-07-24', '2026-07-25', '2026-07-26'];
    const lineups = new Set(days.map(d => duelRoundsForDay(d).map(r => r.id).join(',')));
    expect(lineups.size).toBeGreaterThan(1);
  });
});

describe('scoreRound', () => {
  const round = DUEL_ROUNDS[0]; // logs_38: exact 38, hodge 60
  it('closer kid estimate wins', () => {
    expect(scoreRound(round, 40).winner).toBe('kid');
  });
  it('worse kid estimate loses', () => {
    expect(scoreRound(round, 12).winner).toBe('hodge');
  });
  it('equal distance ties', () => {
    // hodge off by 22 → kid at 16 (38-22) is also off by 22
    expect(scoreRound(round, 16).winner).toBe('tie');
  });
});

describe('gating', () => {
  it('duel opens at Level 3', () => {
    expect(ESTIMATION_MIN_LEVEL).toBe(3);
  });
});
