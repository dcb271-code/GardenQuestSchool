#!/usr/bin/env tsx
/**
 * Validates the ear-confirmed clip selections, cuts the final clips,
 * uploads them to the bird-audio bucket, and writes a bird_audio row
 * for each.
 *
 * Usage:
 *   npm run birds:audio-validate           # check without touching anything
 *   npm run birds:audio-upload -- --bird northern_cardinal
 *   npm run birds:audio-upload -- --all
 *
 * Refuses to upload anything if ANY selection is broken — a
 * half-uploaded catalog is worse than none. Idempotent: a selection
 * whose storage_path already has a row is skipped, so re-running after
 * choosing one more clip uploads only that one. If the DB insert fails
 * the uploaded objects are removed again, so a failed run never leaves
 * orphans in storage.
 *
 * Selections come ONLY from the audition page (npm run birds:audition).
 * There is deliberately no way to upload a window no human has heard.
 */

import { mkdir, readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { BIRD_CATALOG } from '../lib/world/birdCatalog';
import { AUDIO_BUCKET } from '../lib/birds/photoStorage';
import { isNdLicense, isNcLicense } from './naturalist/xcClient';
import {
  cutOpus, cutM4a, spectrogram, normaliseStart, startTag,
  CLIP_LEN_SEC, MODIFICATIONS_TEXT,
} from './naturalist/audioClip';
import type { AudioCandidate } from './seed-bird-audio';
import type { WindowProposal } from './clip-bird-audio';
import type { AudioSelection } from './audition-bird-audio';

config({ path: '.env.local' });

const STAGING = join(process.cwd(), 'scripts', 'staging', 'birds-audio');

const VALID_KINDS = ['song', 'call', 'drum', 'flight_call'];

interface Problem { bird: string; message: string }

async function loadBird(code: string) {
  const dir = join(STAGING, code);
  const selPath = join(dir, 'selections.json');
  if (!existsSync(selPath)) return null;
  const selections: AudioSelection[] = JSON.parse(await readFile(selPath, 'utf-8'));
  const candidates: AudioCandidate[] = existsSync(join(dir, 'recordings.json'))
    ? JSON.parse(await readFile(join(dir, 'recordings.json'), 'utf-8'))
    : [];
  const proposals: WindowProposal[] = existsSync(join(dir, 'proposals.json'))
    ? JSON.parse(await readFile(join(dir, 'proposals.json'), 'utf-8'))
    : [];
  return { dir, selections, candidates, proposals };
}

function validate(
  code: string,
  dir: string,
  selections: AudioSelection[],
  candidates: AudioCandidate[],
  proposals: WindowProposal[],
): Problem[] {
  const problems: Problem[] = [];
  const bird = BIRD_CATALOG.find(b => b.code === code);
  if (!bird) {
    problems.push({ bird: code, message: 'staged directory has no catalog entry' });
    return problems;
  }
  const byName = new Map(candidates.map(c => [c.filename, c]));
  const propByName = new Map(proposals.map(p => [p.filename, p]));
  const seenKinds = new Set<string>();

  for (const s of selections) {
    const where = `${s.kind}/${s.filename}`;
    if (!existsSync(join(dir, s.filename))) {
      problems.push({ bird: code, message: `${where}: file not on disk` });
      continue;
    }
    const cand = byName.get(s.filename);
    if (!cand) {
      problems.push({ bird: code, message: `${where}: no metadata in recordings.json` });
      continue;
    }
    if (!VALID_KINDS.includes(s.kind)) {
      problems.push({ bird: code, message: `${where}: bad kind "${s.kind}"` });
    }
    if (!bird.voices.some(v => v.kind === s.kind)) {
      problems.push({ bird: code, message: `${where}: catalog lists no ${s.kind} voice for this bird` });
    }
    if (seenKinds.has(s.kind)) {
      problems.push({ bird: code, message: `${where}: two selections for one kind` });
    }
    seenKinds.add(s.kind);
    // The licence rules the whole pipeline exists to honour. The DB
    // CHECK enforces ND again; failing here is the friendlier place.
    if (!cand.licenseUrl) {
      problems.push({ bird: code, message: `${where}: no licence URL` });
    } else if (isNdLicense(cand.licenseUrl)) {
      problems.push({ bird: code, message: `${where}: no-derivatives licence — cannot be used at all` });
    }
    if (!cand.recordist) {
      problems.push({ bird: code, message: `${where}: no recordist — attribution is required` });
    }
    const prop = propByName.get(s.filename);
    if (!prop) {
      problems.push({ bird: code, message: `${where}: no proposal row — run birds:audio-clips` });
    } else if (s.startSec !== normaliseStart(s.startSec, prop.durationSec)) {
      problems.push({ bird: code, message: `${where}: start ${s.startSec}s does not fit ${prop.durationSec}s recording` });
    }
  }
  return problems;
}

/**
 * DO NOT "TIDY" THIS — same rule as the photo uploader's path builder.
 * The start second is baked into the object path, so a re-audition
 * that moves a window produces a NEW path and a fresh row rather than
 * silently overwriting a clip that an exercise may have cached.
 * Changing the format would break the skip-if-exists check for
 * everything already uploaded.
 */
function storagePathsFor(code: string, s: AudioSelection) {
  const stem = `${code}/${s.kind}_${s.sourceId}_${startTag(s.startSec)}`;
  return { opus: `${stem}.opus`, m4a: `${stem}.m4a`, png: `${stem}.png` };
}

/** '2021-05-03' → itself; '0000-00-00' and friends → null. */
function validDate(d: string): string | null {
  return /^\d{4}-\d{2}-\d{2}$/.test(d) && !d.startsWith('0000') ? d : null;
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
  if (!existsSync(STAGING)) {
    console.error('Nothing staged. Run the harvest → clips → audition pipeline first.');
    process.exit(1);
  }
  const dirs = (await readdir(STAGING, { withFileTypes: true }))
    .filter(d => d.isDirectory() && !d.name.startsWith('_'))
    .map(d => d.name);
  const targets = (all || validateOnly) ? dirs : dirs.filter(d => birds.includes(d));

  if (targets.length === 0) {
    console.error('Nothing to do. Use --all, --bird <code>, or --validate-only.');
    process.exit(1);
  }

  // ── validate everything first ──────────────────────────────────
  const loaded = new Map<string, Awaited<ReturnType<typeof loadBird>>>();
  const problems: Problem[] = [];
  for (const code of targets) {
    const data = await loadBird(code);
    loaded.set(code, data);
    if (!data || data.selections.length === 0) {
      console.log(`  – ${code}: nothing auditioned yet, skipping`);
      continue;
    }
    problems.push(...validate(code, data.dir, data.selections, data.candidates, data.proposals));
  }

  if (problems.length) {
    console.error(`\n✗ ${problems.length} problem(s):`);
    for (const p of problems) console.error(`  ${p.bird}: ${p.message}`);
    process.exit(1);
  }

  const total = Array.from(loaded.values()).reduce((n, d) => n + (d?.selections.length ?? 0), 0);
  console.log(`✓ ${total} selection(s) valid across ${targets.length} bird(s).`);

  // Which catalog voices still have no chosen clip — the honest gap.
  const missing: string[] = [];
  for (const bird of BIRD_CATALOG) {
    const sel = loaded.get(bird.code)?.selections ?? [];
    for (const kind of Array.from(new Set(bird.voices.map(v => v.kind)))) {
      if (!sel.some(s => s.kind === kind)) missing.push(`${bird.code}/${kind}`);
    }
  }
  if (missing.length) console.log(`  (not auditioned yet: ${missing.join(', ')})`);
  if (validateOnly) return;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }
  const db = createClient(url, key, { auth: { persistSession: false } });

  const { data: buckets } = await db.storage.listBuckets();
  if (!buckets?.some(b => b.name === AUDIO_BUCKET)) {
    const { error } = await db.storage.createBucket(AUDIO_BUCKET, {
      public: true, fileSizeLimit: 5 * 1024 * 1024,
    });
    if (error) { console.error(`Could not create bucket: ${error.message}`); process.exit(1); }
    console.log(`✓ created public bucket ${AUDIO_BUCKET}`);
  }

  let uploaded = 0, skipped = 0;
  for (const code of targets) {
    const data = loaded.get(code);
    if (!data || data.selections.length === 0) continue;
    const byName = new Map(data.candidates.map(c => [c.filename, c]));
    console.log(`\n→ ${code}`);

    for (const s of data.selections) {
      const cand = byName.get(s.filename)!;
      const paths = storagePathsFor(code, s);

      const { data: existing } = await db
        .from('bird_audio').select('id').eq('storage_path', paths.opus).maybeSingle();
      if (existing) { skipped++; console.log(`  ↳ skip ${paths.opus}`); continue; }

      // Final cut, from the ORIGINAL at the confirmed start, through
      // the same filter chain the audition previews used.
      const finalDir = join(data.dir, '_final');
      await mkdir(finalDir, { recursive: true });
      const stem = `${s.kind}_${s.sourceId}_${startTag(s.startSec)}`;
      const opusFile = join(finalDir, `${stem}.opus`);
      const m4aFile = join(finalDir, `${stem}.m4a`);
      const pngFile = join(finalDir, `${stem}.png`);
      const src = join(data.dir, s.filename);
      try {
        if (!existsSync(opusFile)) await cutOpus(src, s.startSec, opusFile);
        if (!existsSync(m4aFile)) await cutM4a(src, s.startSec, m4aFile);
        if (!existsSync(pngFile)) await spectrogram(opusFile, pngFile);
      } catch (e) {
        console.error(`  ! cutting ${stem}: ${(e as Error).message}`);
        continue;
      }

      const objects: Array<[string, string, string]> = [
        [paths.opus, opusFile, 'audio/ogg'],
        [paths.m4a, m4aFile, 'audio/mp4'],
        [paths.png, pngFile, 'image/png'],
      ];
      let uploadFailed = false;
      for (const [path, file, contentType] of objects) {
        const up = await db.storage.from(AUDIO_BUCKET)
          .upload(path, await readFile(file), { contentType, upsert: true });
        if (up.error) {
          console.error(`  ! upload ${path}: ${up.error.message}`);
          uploadFailed = true;
          break;
        }
      }
      if (uploadFailed) {
        await db.storage.from(AUDIO_BUCKET).remove(Object.values(paths));
        continue;
      }

      const ins = await db.from('bird_audio').insert({
        bird_code: code,
        kind: s.kind,
        storage_path: paths.opus,
        fallback_path: paths.m4a,
        spectrogram_path: paths.png,
        source: 'xeno_canto',
        source_id: s.sourceId,
        source_url: cand.sourceUrl,
        recordist: cand.recordist,
        license_url: cand.licenseUrl,
        is_nc: isNcLicense(cand.licenseUrl),
        original_title: cand.originalTitle || null,
        locality: cand.locality || null,
        recorded_on: validDate(cand.date),
        clip_start_sec: s.startSec,
        clip_len_sec: CLIP_LEN_SEC,
        modifications: MODIFICATIONS_TEXT,
      });
      if (ins.error) {
        // Don't leave orphan objects behind.
        await db.storage.from(AUDIO_BUCKET).remove(Object.values(paths));
        console.error(`  ! insert ${paths.opus}: ${ins.error.message} (objects removed)`);
        continue;
      }
      uploaded++;
      console.log(`  ✓ ${paths.opus}`);
    }
  }

  console.log(`\n✓ ${uploaded} uploaded, ${skipped} already present.`);
}

main().catch(e => { console.error(e); process.exit(1); });
