// tests/world/correctCounts.test.ts
//
// Per-skill counts must not be computed from a truncated sample.
//
// PostgREST caps a select at 1000 rows. Four pages used to fetch a
// learner's whole correct-attempt history in one unbounded query and
// count it in JS — fine under 1000 lifetime attempts, silently wrong
// above it, and getting wronger the more the child plays.
//
// These counts unlock habitats (20+ correct at a prereq) and drive
// every progress badge on every map. The first symptom in the wild was
// a seven-year-old writing to ask why Crystal Cavern had locked
// itself: her 28 correct answers at the gate skill were outside the
// 1000-row window.

import { describe, it, expect, vi } from 'vitest';
import { correctCountsBySkill, countBySkillPaginated } from '@/lib/world/cumulativeProgress';

/** A fake PostgREST that enforces the 1000-row cap, like the real one. */
function dbWith(rowsPerSkill: Record<string, number>) {
  const all = Object.entries(rowsPerSkill).flatMap(([code, n]) =>
    Array.from({ length: n }, () => ({ item: { skill: { code } } })),
  );
  const range = vi.fn((from: number, to: number) =>
    Promise.resolve({ data: all.slice(from, Math.min(to + 1, from + 1000)), error: null }),
  );
  const chain = { select: () => chain, eq: () => chain, range } as any;
  return { db: { from: () => chain } as any, total: all.length, range };
}

/** A db whose RPC works, returning one row per skill. */
function dbWithRpc(counts: Record<string, number>) {
  const rpc = vi.fn(() => Promise.resolve({
    data: Object.entries(counts).map(([skill_code, correct_count]) => ({ skill_code, correct_count })),
    error: null,
  }));
  return { db: { rpc } as any, rpc };
}

describe('correctCountsBySkill — the aggregate path', () => {
  it('asks the database to count, and returns one row per skill', async () => {
    const { db, rpc } = dbWithRpc({ 'math.multiply.facts_to_10': 28, 'reading.sight_words': 369 });
    const counts = await correctCountsBySkill(db, 'learner');
    expect(rpc).toHaveBeenCalledWith('skill_correct_counts', { p_learner_id: 'learner' });
    expect(counts.get('math.multiply.facts_to_10')).toBe(28);
    expect(counts.get('reading.sight_words')).toBe(369);
  });

  it('falls back to paging when the function is missing', async () => {
    // Migrations here are applied by hand and can lag a deploy. A slow
    // map is recoverable; a map that silently reports zero progress
    // locks doors on a child.
    const paged = dbWith({ 'a': 1500 });
    const db = { rpc: () => Promise.resolve({ data: null, error: { message: 'function does not exist' } }),
                 from: paged.db.from } as any;
    const counts = await correctCountsBySkill(db, 'learner');
    expect(counts.get('a')).toBe(1500);
  });
});

describe('countBySkillPaginated', () => {
  it('counts every attempt past the 1000-row cap', async () => {
    // 1500 rows: a single unbounded query would see 1000 and miss 500.
    const { db } = dbWith({ 'math.multiply.facts_to_10': 1200, 'math.add.within_20': 300 });
    const counts = await countBySkillPaginated(db, 'learner');
    expect(counts.get('math.multiply.facts_to_10')).toBe(1200);
    expect(counts.get('math.add.within_20')).toBe(300);
  });

  it('actually pages rather than asking once', async () => {
    const { db, range } = dbWith({ 'a': 2500 });
    await countBySkillPaginated(db, 'learner');
    expect(range.mock.calls.length).toBeGreaterThan(2);
  });

  it('stops cleanly on an exact multiple of the page size', async () => {
    const { db } = dbWith({ 'a': 2000 });
    expect((await countBySkillPaginated(db, 'learner')).get('a')).toBe(2000);
  });

  it('handles an empty history and rows with no skill', async () => {
    expect((await countBySkillPaginated(dbWith({}).db, 'l')).size).toBe(0);
  });
});
