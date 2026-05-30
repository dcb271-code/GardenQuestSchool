#!/usr/bin/env tsx
/**
 * Reads a hand-authored selections.json under scripts/staging/<code>/,
 * uploads each chosen photo to the Supabase Storage `flora-photos`
 * bucket, and inserts one flora_photo row per upload.
 *
 * selections.json format (see docs/naturalist-photo-curation.md):
 *   [
 *     {
 *       "filename": "inat_500.jpg",
 *       "role": "leaf",           // 'whole'|'leaf'|'bark'|'flower'|'fruit'
 *       "tier": 1,                // 1|2|3
 *       "altText": "Eastern White Pine, single five-needle bundle"
 *     },
 *     ...
 *   ]
 *
 * Re-runnable: if a flora_photo row already exists with the same
 * storage_path, the script skips it.
 *
 * Usage:
 *   npm run naturalist:upload -- --species tulip_poplar
 *   npm run naturalist:upload -- --all
 */

import { config } from 'dotenv';
import { resolve } from 'node:path';
config({ path: resolve(process.cwd(), '.env.local') });

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { FLORA_CATALOG, type FloraData, type PhotoRole } from '../lib/world/floraCatalog';

const BUCKET = 'flora-photos';
const STAGING_ROOT = join(process.cwd(), 'scripts', 'staging');

interface SelectionRecord {
  filename: string;
  role: PhotoRole;
  tier: 1 | 2 | 3;
  altText: string;
}

interface CandidateRecord {
  source: 'inat' | 'wikimedia';
  filename: string;
  photographer: string;
  licenseCode: string;
  sourceUrl: string;
  originalDownloadUrl: string;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('✗ NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

function parseArgs(): { species: string[]; all: boolean } {
  const args = process.argv.slice(2);
  const species: string[] = [];
  let all = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--all') { all = true; continue; }
    if (args[i] === '--species' && args[i + 1]) {
      species.push(args[i + 1]);
      i++;
    }
  }
  return { species, all };
}

async function ensureBucket(): Promise<void> {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw error;
  if (buckets?.some(b => b.name === BUCKET)) {
    console.log(`✓ Bucket '${BUCKET}' already exists`);
    return;
  }
  console.log(`→ Creating bucket '${BUCKET}' (public read)`);
  const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,  // 10 MB per photo
  });
  if (createErr) throw createErr;
  console.log(`✓ Bucket '${BUCKET}' created`);
}

async function uploadSpecies(species: FloraData): Promise<void> {
  const dir = join(STAGING_ROOT, species.code);
  const selPath = join(dir, 'selections.json');
  const candPath = join(dir, 'candidates.json');

  if (!existsSync(selPath)) {
    console.log(`  ↳ skip ${species.code} (no selections.json — nothing to upload)`);
    return;
  }
  if (!existsSync(candPath)) {
    console.error(`  ! ${species.code}: candidates.json missing — re-run harvest first`);
    return;
  }

  const selections: SelectionRecord[] = JSON.parse(await readFile(selPath, 'utf-8'));
  const candidates: CandidateRecord[] = JSON.parse(await readFile(candPath, 'utf-8'));
  const candByFile = new Map(candidates.map(c => [c.filename, c]));

  console.log(`\n→ ${species.code} (${selections.length} selections)`);

  for (const sel of selections) {
    const cand = candByFile.get(sel.filename);
    if (!cand) {
      console.error(`  ! ${sel.filename} listed in selections.json but not in candidates.json — skipping`);
      continue;
    }
    const sourceFile = join(dir, sel.filename);
    if (!existsSync(sourceFile)) {
      console.error(`  ! ${sourceFile} missing on disk — skipping`);
      continue;
    }

    const ext = extname(sel.filename).replace('.', '').toLowerCase() || 'jpg';
    const storagePath = `${species.code}/${sel.role}_${sel.tier}_${cand.source}_${cand.filename.replace(/\.[^.]+$/, '')}.${ext}`;

    // Check if already exists in DB (idempotent skip)
    const { data: existing } = await supabase
      .from('flora_photo')
      .select('id')
      .eq('storage_path', storagePath)
      .maybeSingle();
    if (existing) {
      console.log(`  ↳ skip ${storagePath} (already in DB)`);
      continue;
    }

    // Upload to Storage (upsert so re-runs replace bytes)
    const bytes = await readFile(sourceFile);
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, bytes, {
        contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        upsert: true,
      });
    if (upErr) {
      console.error(`  ! upload failed for ${storagePath}: ${upErr.message}`);
      continue;
    }

    // Insert metadata row
    const { error: insErr } = await supabase.from('flora_photo').insert({
      flora_code: species.code,
      role: sel.role,
      tier: sel.tier,
      storage_path: storagePath,
      source: cand.source,
      source_url: cand.sourceUrl,
      photographer: cand.photographer,
      license_code: cand.licenseCode,
      alt_text: sel.altText,
    });
    if (insErr) {
      console.error(`  ! DB insert failed for ${storagePath}: ${insErr.message}`);
      // Roll back the upload to avoid orphaned Storage objects
      await supabase.storage.from(BUCKET).remove([storagePath]);
      continue;
    }
    console.log(`  ✓ ${storagePath}`);
  }
}

async function main() {
  const { species, all } = parseArgs();
  if (!all && species.length === 0) {
    console.error('Usage:');
    console.error('  npm run naturalist:upload -- --species <code>');
    console.error('  npm run naturalist:upload -- --all');
    process.exit(1);
  }

  await ensureBucket();

  const targets = all
    ? FLORA_CATALOG
    : FLORA_CATALOG.filter(f => species.includes(f.code));

  if (targets.length === 0) {
    console.error(`No matching species in FLORA_CATALOG for: ${species.join(', ')}`);
    process.exit(1);
  }

  for (const sp of targets) {
    await uploadSpecies(sp);
  }
  console.log(`\n✓ Done.`);
}

main().catch(e => { console.error(e); process.exit(1); });
