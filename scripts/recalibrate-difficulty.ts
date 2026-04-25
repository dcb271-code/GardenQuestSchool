#!/usr/bin/env tsx
/**
 * One-shot recalibration of difficulty_elo on existing items in-place.
 *
 * Use this instead of re-running `seed.ts` when you only want to fix
 * item ratings without wiping attempts and progress. The seed script
 * deletes-and-reinserts items, which cascades to deleting attempts —
 * we don't want to lose Cecily's history.
 *
 * This script parses the existing item.content JSON to recover the
 * operands (a, b for addition/subtraction; n for counting) and
 * applies the new difficulty formulas defined in seed-math.ts.
 *
 * Run:  npx tsx scripts/recalibrate-difficulty.ts
 *
 * Safe to re-run: it's idempotent. Only updates items where the new
 * Elo differs from what's stored.
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_ROLE);

// ─── New difficulty formulas (kept in sync with scripts/seed-math.ts) ──

/** subtract within 10: cognitive load is the subtrahend. */
function rateSubtractWithin10(a: number, b: number): number {
  if (b === a) return 850;          // a - a = 0, trivial
  return 850 + b * 30;
}

/** add within 10: cognitive load is the smaller addend. */
function rateAddWithin10(a: number, b: number): number {
  return 850 + Math.min(a, b) * 70;
}

/** add within 20 (no crossing): cognitive load is the small addend. */
function rateAddWithin20NoCrossing(_a: number, b: number): number {
  return 970 + b * 30;
}

/** subtract within 20 (no crossing): cognitive load is the subtrahend. */
function rateSubtractWithin20NoCrossing(_a: number, b: number): number {
  return 970 + b * 40;
}

/** count to 20: pre-K range gets a lower band. */
function rateCountTo20(n: number): number {
  if (n < 10) return 800 + n * 6;
  return 950 + (n - 10) * 8;
}

// ─── Parsers — extract operands from item.content ──────────────────────

/** Match patterns like "5 - 0 = ?" / "5 − 2 = ?" / "5 minus 0 = ?". */
function parseSubtraction(eq: string): { a: number; b: number } | null {
  const m = eq.match(/(\d+)\s*[-−–]\s*(\d+)/);
  if (!m) return null;
  return { a: Number(m[1]), b: Number(m[2]) };
}

/** Match patterns like "5 + 0 = ?" or "? = 5 + 0". */
function parseAddition(eq: string): { a: number; b: number } | null {
  const m = eq.match(/(\d+)\s*\+\s*(\d+)/);
  if (!m) return null;
  return { a: Number(m[1]), b: Number(m[2]) };
}

// ─── Recalibrate by skill ──────────────────────────────────────────────

interface Item {
  id: string;
  type: string;
  content: any;
  difficulty_elo: number;
}

interface Skill {
  id: string;
  code: string;
}

async function fetchSkill(code: string): Promise<Skill | null> {
  const { data } = await sb.from('skill').select('id, code').eq('code', code).single();
  return data ?? null;
}

async function fetchItems(skillId: string): Promise<Item[]> {
  const { data, error } = await sb.from('item')
    .select('id, type, content, difficulty_elo')
    .eq('skill_id', skillId);
  if (error) throw error;
  return data ?? [];
}

async function applyUpdates(updates: Array<{ id: string; newElo: number }>): Promise<number> {
  let changed = 0;
  for (const u of updates) {
    const { error } = await sb.from('item')
      .update({ difficulty_elo: u.newElo })
      .eq('id', u.id);
    if (error) {
      console.error(`  ✗ failed to update ${u.id}: ${error.message}`);
      continue;
    }
    changed++;
  }
  return changed;
}

interface SkillRecalibration {
  code: string;
  parse: (item: Item) => { newElo: number } | null;
}

const RECALIBRATIONS: SkillRecalibration[] = [
  {
    code: 'math.subtract.within_10',
    parse: (item) => {
      const eq = item.content?.equation;
      if (typeof eq !== 'string') return null;
      const p = parseSubtraction(eq);
      if (!p) return null;
      return { newElo: rateSubtractWithin10(p.a, p.b) };
    },
  },
  {
    code: 'math.add.within_10',
    parse: (item) => {
      const eq = item.content?.equation;
      if (typeof eq !== 'string') return null;
      const p = parseAddition(eq);
      if (!p) return null;
      return { newElo: rateAddWithin10(p.a, p.b) };
    },
  },
  {
    code: 'math.add.within_20.no_crossing',
    parse: (item) => {
      const eq = item.content?.equation;
      if (typeof eq !== 'string') return null;
      const p = parseAddition(eq);
      if (!p) return null;
      // Skip items that don't fit the no-crossing pattern (e.g. fluency variants)
      if (p.a < 10 && p.b < 10) return null;
      return { newElo: rateAddWithin20NoCrossing(p.a, p.b) };
    },
  },
  {
    code: 'math.subtract.within_20.no_crossing',
    parse: (item) => {
      const eq = item.content?.equation;
      if (typeof eq !== 'string') return null;
      const p = parseSubtraction(eq);
      if (!p) return null;
      if (p.a < 11 || p.a > 19) return null;
      return { newElo: rateSubtractWithin20NoCrossing(p.a, p.b) };
    },
  },
  {
    code: 'math.counting.to_20',
    parse: (item) => {
      const n = item.content?.count;
      if (typeof n !== 'number') return null;
      return { newElo: rateCountTo20(n) };
    },
  },
];

async function main() {
  console.log('🌱 GardenQuestSchool — difficulty recalibration');
  console.log(`   Connected to: ${SUPABASE_URL}\n`);

  let totalChanged = 0;
  let totalSkipped = 0;
  let totalUnchanged = 0;

  for (const { code, parse } of RECALIBRATIONS) {
    const skill = await fetchSkill(code);
    if (!skill) {
      console.log(`  ⚠ skill ${code} not found, skipping`);
      continue;
    }
    const items = await fetchItems(skill.id);
    const updates: Array<{ id: string; newElo: number }> = [];
    let unchanged = 0;
    let unparseable = 0;
    for (const item of items) {
      const result = parse(item);
      if (!result) { unparseable++; continue; }
      if (result.newElo === item.difficulty_elo) { unchanged++; continue; }
      updates.push({ id: item.id, newElo: result.newElo });
    }
    const changed = updates.length > 0 ? await applyUpdates(updates) : 0;
    console.log(`  • ${code.padEnd(40)} ${items.length} items → ${changed} updated, ${unchanged} already-correct, ${unparseable} unparseable`);
    totalChanged += changed;
    totalSkipped += unparseable;
    totalUnchanged += unchanged;
  }

  console.log(`\n✓ Done. ${totalChanged} items updated, ${totalUnchanged} already-correct, ${totalSkipped} unparseable.`);
  console.log('   Attempts and skill_progress untouched.');
}

main().catch(err => {
  console.error('✗ recalibration failed:', err);
  process.exit(1);
});
