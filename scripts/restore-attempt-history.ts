#!/usr/bin/env tsx
/**
 * Rebuilds lifetime-correct history that a destructive seed deleted.
 *
 *   npm run restore:attempts            # DRY RUN — reports, writes nothing
 *   npm run restore:attempts -- --write  # actually insert
 *   npm run restore:attempts -- --undo   # remove what this script wrote
 *
 * On 2026-08-04 a `npm run db:seed` run deleted every attempt row that
 * referenced a seed item — 1,623 correct answers for Cecily, 338 for
 * Esme. Garden beds unlock from lifetime-correct, so their gardens
 * closed. seed-math.ts / seed-reading.ts can no longer do this; this
 * script repairs what already happened.
 *
 * WHERE THE NUMBER COMES FROM. Not a guess and not an estimate: the
 * `session` table survived, and every session carries `items_correct`,
 * written when the session ended. Summing it gives the number of
 * correct item answers the child really gave. Attempts that never had
 * an item (music, birds, Japanese) were not deleted, so they are
 * counted from the attempt table as they stand.
 *
 *     restored = Σ session.items_correct − surviving item-linked correct
 *
 * WHAT IT WRITES. Null-item attempt rows, the same shape music and
 * bird practice have always used: they count toward lifetime-correct
 * (which reads learner_id + outcome only) and are skipped by every
 * query that walks attempt → item → skill, so no per-skill state is
 * invented. Each row is stamped `response.source = 'history_restore'`
 * so it is always identifiable, auditable, and removable — which is
 * what --undo does.
 *
 * It does NOT invent achievement. The child answered these questions;
 * only the rows recording them were lost, and the session table is the
 * independent evidence of that.
 */

import { config } from 'dotenv';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const MARKER = 'history_restore';

interface Learner { id: string; label: string }

async function learners(db: SupabaseClient): Promise<Learner[]> {
  const { data, error } = await db.from('learner').select('*');
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: String(r.id),
    label: String(r.first_name ?? r.display_name ?? r.id),
  }));
}

async function pagedSessionCorrect(db: SupabaseClient, learnerId: string): Promise<number> {
  let total = 0;
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db
      .from('session')
      .select('items_correct')
      .eq('learner_id', learnerId)
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    total += data.reduce((n, s) => n + (Number(s.items_correct) || 0), 0);
    if (data.length < 1000) break;
  }
  return total;
}

async function countCorrect(
  db: SupabaseClient, learnerId: string, opts: { itemLinked?: boolean; restored?: boolean } = {},
): Promise<number> {
  let q = db.from('attempt').select('*', { count: 'exact', head: true })
    .eq('learner_id', learnerId).eq('outcome', 'correct');
  if (opts.itemLinked === true) q = q.not('item_id', 'is', null);
  if (opts.itemLinked === false) q = q.is('item_id', null);
  if (opts.restored) q = q.contains('response', { source: MARKER });
  const { count, error } = await q;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

/**
 * Second pass: give the restored rows their SKILL back.
 *
 * Restoring the count reopened the gardens, but every restored row is
 * item-less, and per-skill progress is read through attempt → item →
 * skill. So the map's "7/10" badges, the ✓ at 20 correct and the ⭐ at
 * 30 all read zero: her mastery was intact but the mountain looked
 * untouched.
 *
 * `session.skill_planned` records which skill each session was for,
 * and it covers every correct answer, so the attribution is evidence
 * rather than guesswork. What CANNOT be recovered is which individual
 * item she answered — those rows are gone and their items were
 * replaced. Each restored row is therefore pointed at a real, current
 * item of the right skill: truthful at the skill level, which is what
 * is displayed, and approximate below it.
 *
 * Spreading across several items per skill is cosmetic rather than
 * load-bearing — item selection orders by `usage_count` and excludes
 * only items already served in the current session, so nothing reads
 * per-item attempt history — but a run of identical rows would be a
 * lie of a different kind.
 */
const ITEMS_PER_SKILL = 8;

async function attribute(db: SupabaseClient, learner: Learner, write: boolean) {
  // What each skill SHOULD have, from the sessions.
  const target = new Map<string, number>();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from('session')
      .select('skill_planned, items_correct')
      .eq('learner_id', learner.id).range(from, from + 999);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    for (const s of data) {
      const code = s.skill_planned as string | null;
      if (!code) continue;
      target.set(code, (target.get(code) ?? 0) + (Number(s.items_correct) || 0));
    }
    if (data.length < 1000) break;
  }

  // What each skill HAS right now.
  const current = new Map<string, number>();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from('attempt')
      .select('item:item_id(skill:skill_id(code))')
      .eq('learner_id', learner.id).eq('outcome', 'correct')
      .not('item_id', 'is', null).range(from, from + 999);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    for (const r of data as Array<{ item?: { skill?: { code?: string } } }>) {
      const code = r.item?.skill?.code;
      if (code) current.set(code, (current.get(code) ?? 0) + 1);
    }
    if (data.length < 1000) break;
  }

  // The restored rows still waiting for a skill.
  const pool: string[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from('attempt')
      .select('id').eq('learner_id', learner.id).is('item_id', null)
      .contains('response', { source: MARKER }).range(from, from + 999);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    pool.push(...data.map(r => String(r.id)));
    if (data.length < 1000) break;
  }

  const needs = Array.from(target.entries())
    .map(([code, want]) => ({ code, need: Math.max(0, want - (current.get(code) ?? 0)) }))
    .filter(n => n.need > 0)
    .sort((a, b) => b.need - a.need);
  const totalNeed = needs.reduce((n, x) => n + x.need, 0);

  console.log(`\n${learner.label} — attribution`);
  console.log(`  skills named by sessions        : ${target.size}`);
  console.log(`  skills with a count already     : ${current.size}`);
  console.log(`  attributions missing            : ${totalNeed}`);
  console.log(`  unattributed restored rows      : ${pool.length}`);
  if (totalNeed === 0 || pool.length === 0) { console.log('  → nothing to do'); return; }
  if (totalNeed > pool.length) {
    console.log(`  ! only ${pool.length} rows available; the largest skills get them first`);
  }
  if (!write) { console.log('  → dry run; pass --write to apply'); return; }

  let cursor = 0, updated = 0;
  for (const { code, need } of needs) {
    if (cursor >= pool.length) break;
    const { data: skillRow } = await db.from('skill').select('id').eq('code', code).maybeSingle();
    if (!skillRow) { console.warn(`  ! unknown skill ${code}, skipping`); continue; }
    const { data: items } = await db.from('item')
      .select('id').eq('skill_id', skillRow.id).limit(ITEMS_PER_SKILL);
    if (!items?.length) { console.warn(`  ! no items for ${code}, skipping`); continue; }

    const take = Math.min(need, pool.length - cursor);
    const slice = pool.slice(cursor, cursor + take);
    cursor += take;

    // Round-robin the rows across this skill's items, then one update
    // per item rather than one per row.
    const byItem = new Map<string, string[]>();
    slice.forEach((rowId, i) => {
      const itemId = String(items[i % items.length].id);
      (byItem.get(itemId) ?? byItem.set(itemId, []).get(itemId)!).push(rowId);
    });
    for (const [itemId, rowIds] of Array.from(byItem.entries())) {
      const { error } = await db.from('attempt').update({ item_id: itemId }).in('id', rowIds);
      if (error) { console.error(`  ! ${code}: ${error.message}`); continue; }
      updated += rowIds.length;
    }
  }
  console.log(`  ✓ attributed ${updated} row(s) across ${needs.length} skill(s)`);
}

async function main() {
  const write = process.argv.includes('--write');
  const undo = process.argv.includes('--undo');
  const attributeOnly = process.argv.includes('--attribute');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }
  const db = createClient(url, key, { auth: { persistSession: false } });

  for (const learner of await learners(db)) {
    if (attributeOnly && !undo) { await attribute(db, learner, write); continue; }

    const alreadyRestored = await countCorrect(db, learner.id, { restored: true });

    if (undo) {
      if (alreadyRestored === 0) { console.log(`${learner.label}: nothing to undo`); continue; }
      const { error } = await db.from('attempt').delete()
        .eq('learner_id', learner.id).contains('response', { source: MARKER });
      console.log(error
        ? `${learner.label}: undo failed — ${error.message}`
        : `${learner.label}: removed ${alreadyRestored} restored row(s)`);
      continue;
    }

    const fromSessions = await pagedSessionCorrect(db, learner.id);
    const survivingItemLinked = await countCorrect(db, learner.id, { itemLinked: true });
    const nowTotal = await countCorrect(db, learner.id);
    const missing = fromSessions - survivingItemLinked - alreadyRestored;

    console.log(`\n${learner.label}`);
    console.log(`  correct answers recorded in sessions : ${fromSessions}`);
    console.log(`  item-linked attempts still present   : ${survivingItemLinked}`);
    console.log(`  already restored by this script      : ${alreadyRestored}`);
    console.log(`  lifetime-correct right now           : ${nowTotal}`);
    console.log(`  MISSING (would insert)               : ${Math.max(0, missing)}`);
    console.log(`  lifetime-correct after restore       : ${nowTotal + Math.max(0, missing)}`);

    if (missing <= 0) { console.log('  → nothing to do'); continue; }
    if (!write) { console.log('  → dry run; pass --write to insert'); continue; }

    const stamp = new Date().toISOString();
    const rows = Array.from({ length: missing }, () => ({
      learner_id: learner.id,
      session_id: null,
      item_id: null,
      outcome: 'correct',
      response: {
        source: MARKER,
        note: 'rebuilt from session.items_correct after a destructive seed deleted the original rows',
        restored_at: stamp,
      },
      time_ms: null,
      retry_count: 0,
    }));
    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await db.from('attempt').insert(rows.slice(i, i + 500));
      if (error) { console.error(`  ! insert failed: ${error.message}`); process.exit(1); }
    }
    console.log(`  ✓ restored ${missing} row(s)`);
  }

  if (!write && !undo) {
    console.log('\nDRY RUN — nothing was written. Re-run with --write to apply.');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
