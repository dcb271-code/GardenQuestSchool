// lib/packs/math/factAccuracy.ts
//
// How a learner is doing on each individual multiplication fact.
//
// Skill-level mastery is too coarse to teach from. "facts_to_10 is at
// 66%" tells you she is stuck; it does not tell you that 7×9, 6×3, 8×9,
// 9×6 and 7×6 are all zero for three while the rest of the band is
// fine. The workshop needs the second thing.
//
// PAGINATED, deliberately. PostgREST silently caps a select at 1000
// rows, and reading a learner's attempts in one go is precisely the bug
// that once locked a seven-year-old out of Crystal Cavern. The first
// draft of this very query hit the cap and produced a plausible,
// wrong ranking of her weakest facts.

import type { SupabaseClient } from '@supabase/supabase-js';
import { factKey } from './timesTable';

export interface FactStat { correct: number; total: number }

/** `${lo}x${hi}` → tally, with a fact and its mirror already merged. */
export type FactAccuracy = Map<string, FactStat>;

/**
 * Pull the digits back out of a seeded fact item.
 *
 * The generator writes `equation: "7 × 6 = ?"` and
 * `promptText: "7 times 6."`, so either shape yields the pair. Word
 * problems are skipped rather than guessed at — a story about muffins
 * is evidence about multiplication, but not cleanly about ONE fact.
 */
export function factFromContent(content: unknown): { a: number; b: number } | null {
  const c = content as Record<string, unknown> | null;
  if (!c) return null;
  const eq = typeof c.equation === 'string' ? c.equation : '';
  const m = eq.match(/(\d+)\s*[×x*]\s*(\d+)/);
  if (m) return { a: Number(m[1]), b: Number(m[2]) };
  const pt = typeof c.promptText === 'string' ? c.promptText : '';
  const m2 = pt.match(/^(\d+)\s+times\s+(\d+)/i);
  if (m2) return { a: Number(m2[1]), b: Number(m2[2]) };
  const rows = c.rows, cols = c.cols;
  if (typeof rows === 'number' && typeof cols === 'number') return { a: rows, b: cols };
  return null;
}

export async function multiplicationFactAccuracy(
  db: SupabaseClient, learnerId: string,
): Promise<FactAccuracy> {
  const acc: FactAccuracy = new Map();

  const { data: skills } = await db.from('skill').select('id, code').like('code', 'math.multiply.%');
  const skillIds = (skills ?? []).map(s => s.id as string);
  if (!skillIds.length) return acc;

  const { data: items } = await db.from('item')
    .select('id, content').in('skill_id', skillIds);
  const factByItem = new Map<string, { a: number; b: number }>();
  for (const it of items ?? []) {
    const f = factFromContent(it.content);
    if (f) factByItem.set(it.id as string, f);
  }
  const itemIds = Array.from(factByItem.keys());
  if (!itemIds.length) return acc;

  // One page at a time, because the cap is silent.
  for (let from = 0; ; from += 1000) {
    const { data } = await db.from('attempt')
      .select('item_id, outcome')
      .eq('learner_id', learnerId)
      .in('item_id', itemIds)
      .range(from, from + 999);
    if (!data || data.length === 0) break;
    for (const a of data) {
      const f = factByItem.get(a.item_id as string);
      if (!f) continue;
      const key = factKey(f.a, f.b);
      const cur = acc.get(key) ?? { correct: 0, total: 0 };
      cur.total += 1;
      if (a.outcome === 'correct') cur.correct += 1;
      acc.set(key, cur);
    }
    if (data.length < 1000) break;
  }
  // Crow practice writes null-item rows with the fact in the
  // response (source: 'crow'). They count too — one ledger, so the
  // chart, the queue and the crow's own ordering all agree.
  for (let from = 0; ; from += 1000) {
    const { data } = await db.from('attempt')
      .select('outcome, response')
      .eq('learner_id', learnerId)
      .is('item_id', null)
      .eq('response->>source', 'crow')
      .range(from, from + 999);
    if (!data || data.length === 0) break;
    for (const a of data) {
      const fact = (a.response as Record<string, unknown> | null)?.fact;
      if (typeof fact !== 'string' || !/^\d+x\d+$/.test(fact)) continue;
      const cur = acc.get(fact) ?? { correct: 0, total: 0 };
      cur.total += 1;
      if (a.outcome === 'correct') cur.correct += 1;
      acc.set(fact, cur);
    }
    if (data.length < 1000) break;
  }

  return acc;
}
