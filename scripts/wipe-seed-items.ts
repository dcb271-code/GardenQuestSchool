#!/usr/bin/env tsx
/**
 * Hard-wipe ALL seed-generated items + their attempts.
 *
 * Use this once to clean up duplicates left by the previous broken
 * deletion in seed-math.ts / seed-reading.ts (which silently failed
 * to delete prior items because the URL was too long, so each
 * re-seed appended instead of replacing → 3x duplicate items).
 *
 * After running this, run the seed script for a clean slate:
 *
 *   npx tsx scripts/wipe-seed-items.ts
 *   npx tsx scripts/seed.ts
 *
 * Safe to re-run. Keeps learners, sessions, skill_progress (their
 * stored Elo + mastery state survive). Only attempts on seed items
 * and the seed items themselves are removed.
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

const DELETE_BATCH = 50;

async function main() {
  console.log('🌱 Hard-wiping seed-generated items + their attempts');
  console.log(`   Connected to: ${SUPABASE_URL}\n`);

  // Pull all seed item IDs. Paginate — Supabase / PostgREST caps
  // SELECT at 1000 rows by default, and the previous bug left this
  // table with thousands of duplicate seed items.
  const PAGE = 1000;
  const ids: string[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb.from('item')
      .select('id')
      .eq('generated_by', 'seed')
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const r of data) ids.push(r.id);
    if (data.length < PAGE) break;
  }
  console.log(`  found ${ids.length} seed items`);
  if (ids.length === 0) {
    console.log('  nothing to delete.');
    return;
  }

  // Delete attempts referencing those items, in batches
  let attemptsDeleted = 0;
  for (let i = 0; i < ids.length; i += DELETE_BATCH) {
    const batch = ids.slice(i, i + DELETE_BATCH);
    // Count attempts before deleting (for the report)
    const { count } = await sb.from('attempt')
      .select('*', { count: 'exact', head: true })
      .in('item_id', batch);
    attemptsDeleted += count ?? 0;
    const { error } = await sb.from('attempt').delete().in('item_id', batch);
    if (error) throw error;
    process.stdout.write(`  attempts: deleted batch ${Math.floor(i / DELETE_BATCH) + 1}\r`);
  }
  console.log(`\n  deleted ${attemptsDeleted} attempts referencing seed items`);

  // Delete items themselves
  for (let i = 0; i < ids.length; i += DELETE_BATCH) {
    const batch = ids.slice(i, i + DELETE_BATCH);
    const { error } = await sb.from('item').delete().in('id', batch);
    if (error) throw error;
    process.stdout.write(`  items: deleted batch ${Math.floor(i / DELETE_BATCH) + 1}\r`);
  }
  console.log(`\n  deleted ${ids.length} seed items`);

  console.log(`\n✓ Done. Now run:  npx tsx scripts/seed.ts`);
}

main().catch(err => {
  console.error('✗ wipe failed:', err);
  process.exit(1);
});
