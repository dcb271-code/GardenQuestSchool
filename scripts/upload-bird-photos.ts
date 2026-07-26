#!/usr/bin/env tsx
/**
 * Validates the hand-chosen selections, uploads them to the
 * bird-photos bucket, and writes a bird_photo row for each.
 *
 * Usage:
 *   npm run birds:validate                 # check without touching anything
 *   npm run birds:upload -- --bird blue_jay
 *   npm run birds:upload -- --all
 *
 * Idempotent: a selection whose storage_path already has a row is
 * skipped, so a rerun after adding one photo uploads only that one.
 * If the DB insert fails the uploaded object is removed again, so a
 * failed run never leaves an orphan in storage.
 */

import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { BIRD_CATALOG } from '../lib/world/birdCatalog';
import { PHOTO_BUCKET } from '../lib/birds/photoStorage';

config({ path: '.env.local' });

const STAGING = join(process.cwd(), 'scripts', 'staging', 'birds');

const VALID_ROLES = [
  'perched', 'flight', 'male', 'female', 'nonbreeding',
  'juvenile', 'head', 'back', 'silhouette',
];
const VALID_LICENSES = ['cc0', 'cc-by', 'cc-by-sa'];

interface Candidate {
  source: 'inat';
  role: string;
  filename: string;
  photographer: string;
  licenseCode: string;
  sourceUrl: string;
  originalDownloadUrl: string;
}

interface Selection {
  filename: string;
  role: string;
  tier: number;
  altText: string;
}

interface Problem { bird: string; message: string }

async function loadBird(code: string) {
  const dir = join(STAGING, code);
  const selPath = join(dir, 'selections.json');
  const canPath = join(dir, 'candidates.json');
  if (!existsSync(selPath)) return null;
  const selections: Selection[] = JSON.parse(await readFile(selPath, 'utf-8'));
  const candidates: Candidate[] = existsSync(canPath)
    ? JSON.parse(await readFile(canPath, 'utf-8'))
    : [];
  return { dir, selections, candidates };
}

function validate(
  code: string, dir: string, selections: Selection[], candidates: Candidate[],
): Problem[] {
  const problems: Problem[] = [];
  const byName = new Map(candidates.map(c => [c.filename, c]));
  const seenPaths = new Set<string>();

  for (const s of selections) {
    const where = `${s.filename}`;
    if (!existsSync(join(dir, s.filename))) {
      problems.push({ bird: code, message: `${where}: file not on disk` });
      continue;
    }
    const cand = byName.get(s.filename);
    if (!cand) {
      problems.push({ bird: code, message: `${where}: no attribution in candidates.json` });
      continue;
    }
    if (!VALID_ROLES.includes(s.role)) {
      problems.push({ bird: code, message: `${where}: bad role "${s.role}"` });
    }
    if (!Number.isInteger(s.tier) || s.tier < 1 || s.tier > 3) {
      problems.push({ bird: code, message: `${where}: tier must be 1..3` });
    }
    if (!VALID_LICENSES.includes(cand.licenseCode)) {
      problems.push({ bird: code, message: `${where}: license "${cand.licenseCode}" not permitted` });
    }
    // Alt text is read aloud by screen readers and shown when an image
    // fails to load. A placeholder here is a silent accessibility hole.
    if (!s.altText || s.altText.trim().length < 25) {
      problems.push({ bird: code, message: `${where}: alt text too short to be useful` });
    }
    const path = storagePathFor(code, s, cand);
    if (seenPaths.has(path)) {
      problems.push({ bird: code, message: `${where}: duplicate storage path ${path}` });
    }
    seenPaths.add(path);
  }
  return problems;
}

function storagePathFor(code: string, s: Selection, cand: Candidate): string {
  const ext = (extname(s.filename) || '.jpg').replace('.', '');
  const stem = basename(s.filename, extname(s.filename));
  return `${code}/${s.role}_${s.tier}_${cand.source}_${stem}.${ext}`;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const birds: string[] = [];
  let all = false;
  let validateOnly = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--all') { all = true; continue; }
    if (args[i] === '--validate-only') { validateOnly = true; continue; }
    if (args[i] === '--bird' && args[i + 1]) { birds.push(args[i + 1]); i++; }
  }
  return { birds, all, validateOnly };
}

async function main() {
  const { birds, all, validateOnly } = parseArgs();
  const dirs = (await readdir(STAGING, { withFileTypes: true }))
    .filter(d => d.isDirectory() && !d.name.startsWith('_'))
    .map(d => d.name);
  const targets = (all || validateOnly)
    ? dirs
    : dirs.filter(d => birds.includes(d));

  if (targets.length === 0) {
    console.error('Nothing to do. Use --all, --bird <code>, or --validate-only.');
    process.exit(1);
  }

  // ── validate everything first, and refuse to upload anything if
  //    any bird is broken. A half-uploaded catalog is worse than none.
  const loaded = new Map<string, Awaited<ReturnType<typeof loadBird>>>();
  const problems: Problem[] = [];
  for (const code of targets) {
    const data = await loadBird(code);
    loaded.set(code, data);
    if (!data) { console.log(`  – ${code}: no selections.json yet, skipping`); continue; }
    problems.push(...validate(code, data.dir, data.selections, data.candidates));
  }

  if (problems.length) {
    console.error(`\n✗ ${problems.length} problem(s):`);
    for (const p of problems) console.error(`  ${p.bird}: ${p.message}`);
    process.exit(1);
  }
  const total = Array.from(loaded.values()).reduce((n, d) => n + (d?.selections.length ?? 0), 0);
  console.log(`✓ ${total} selection(s) valid across ${targets.length} bird(s).`);
  if (validateOnly) return;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }
  const db = createClient(url, key, { auth: { persistSession: false } });

  const { data: buckets } = await db.storage.listBuckets();
  if (!buckets?.some(b => b.name === PHOTO_BUCKET)) {
    const { error } = await db.storage.createBucket(PHOTO_BUCKET, {
      public: true, fileSizeLimit: 10 * 1024 * 1024,
    });
    if (error) { console.error(`Could not create bucket: ${error.message}`); process.exit(1); }
    console.log(`✓ created public bucket ${PHOTO_BUCKET}`);
  }

  let uploaded = 0, skipped = 0;
  for (const code of targets) {
    const data = loaded.get(code);
    if (!data) continue;
    const byName = new Map(data.candidates.map(c => [c.filename, c]));
    console.log(`\n→ ${code}`);

    for (const s of data.selections) {
      const cand = byName.get(s.filename)!;
      const path = storagePathFor(code, s, cand);

      const { data: existing } = await db
        .from('bird_photo').select('id').eq('storage_path', path).maybeSingle();
      if (existing) { skipped++; console.log(`  ↳ skip ${path}`); continue; }

      const body = await readFile(join(data.dir, s.filename));
      const up = await db.storage.from(PHOTO_BUCKET)
        .upload(path, body, { contentType: 'image/jpeg', upsert: true });
      if (up.error) { console.error(`  ! upload ${path}: ${up.error.message}`); continue; }

      const ins = await db.from('bird_photo').insert({
        bird_code: code,
        role: s.role,
        tier: s.tier,
        storage_path: path,
        source: cand.source,
        source_url: cand.sourceUrl,
        photographer: cand.photographer,
        license_code: cand.licenseCode,
        alt_text: s.altText,
      });
      if (ins.error) {
        // Don't leave an orphan object behind.
        await db.storage.from(PHOTO_BUCKET).remove([path]);
        console.error(`  ! insert ${path}: ${ins.error.message} (object removed)`);
        continue;
      }
      uploaded++;
      console.log(`  ✓ ${path}`);
    }
  }

  console.log(`\n✓ ${uploaded} uploaded, ${skipped} already present.`);
  const missing = BIRD_CATALOG.filter(b => !targets.includes(b.code)).map(b => b.code);
  if (missing.length) console.log(`  (not curated yet: ${missing.join(', ')})`);
}

main().catch(e => { console.error(e); process.exit(1); });
