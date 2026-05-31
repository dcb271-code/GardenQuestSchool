#!/usr/bin/env tsx
/**
 * DESTRUCTIVE: deletes ALL rows from flora_photo AND all objects from
 * the flora-photos Storage bucket. Used to start fresh when the catalog
 * taxon IDs were wrong and the uploaded photos are mis-identified.
 *
 * Usage:
 *   npx tsx scripts/purge-flora-photos.ts --confirm
 */

import { config } from 'dotenv';
import { resolve } from 'node:path';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

if (!process.argv.includes('--confirm')) {
  console.error('DESTRUCTIVE — re-run with --confirm to proceed.');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function main() {
  const { data: rows, error: selErr } = await supabase
    .from('flora_photo')
    .select('id, storage_path');
  if (selErr) throw selErr;
  console.log(`Existing flora_photo rows: ${rows?.length ?? 0}`);

  if (rows && rows.length > 0) {
    const paths = rows.map(r => r.storage_path);
    const { error: rmErr } = await supabase.storage
      .from('flora-photos')
      .remove(paths);
    if (rmErr) console.error('Storage rm:', rmErr.message);
    else console.log(`✓ Removed ${paths.length} Storage objects`);

    const { error: delErr } = await supabase
      .from('flora_photo')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (delErr) console.error('DB del:', delErr.message);
    else console.log(`✓ Deleted ${rows.length} DB rows`);
  }

  // Also purge any flora_review test rows so we start clean
  const { count } = await supabase
    .from('flora_review')
    .select('*', { count: 'exact', head: true });
  console.log(`flora_review rows (NOT deleting — kept for learner history): ${count ?? 0}`);
}

main().catch(e => { console.error(e); process.exit(1); });
