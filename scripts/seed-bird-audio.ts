#!/usr/bin/env tsx
/**
 * Harvests CC-licensed candidate recordings for the bird catalog from
 * xeno-canto v3, staging them under scripts/staging/birds-audio/<bird_code>/.
 *
 * Usage:
 *   npm run birds:audio-harvest -- --bird northern_cardinal
 *   npm run birds:audio-harvest -- --all
 *   npm run birds:audio-harvest -- --all --per-kind 8
 *
 * One (bird, voice kind) pair per catalog voice — the cardinal needs a
 * song AND a call, the jay needs only calls (Blue Jays essentially do
 * not sing; the live-API coverage counts agreed: 24 songs vs 285
 * calls). What to harvest is read from BIRD_CATALOG.voices, so adding
 * a voice to the catalog is what asks for its audio.
 *
 * Downloads are ORIGINALS and can be large (a verified sample was a
 * 26.8 MB WAV). They stay in staging, which is gitignored; only the
 * ~35 KB trimmed clips ever reach storage.
 *
 * After running: npm run birds:audio-clips proposes a 6-second window
 * per candidate, then npm run birds:audition serves the page where a
 * HUMAN EAR confirms them. Nothing here can hear; do not skip that
 * step.
 */

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { config } from 'dotenv';
import { BIRD_CATALOG, type BirdData, type VoiceKind } from '../lib/world/birdCatalog';
import {
  buildXcQuery, buildXcUrl, parseXcResponse, rankRecordings, xcSourceId,
  type XcRecording,
} from './naturalist/xcClient';

config({ path: '.env.local' });

const STAGING_ROOT = join(process.cwd(), 'scripts', 'staging', 'birds-audio');
/**
 * Candidates per (bird, kind). Five is usually enough — the query is
 * already filtered to quality >C and the ranking prefers recordings
 * with no background species. Raise with --per-kind if a bird's top
 * five all turn out to have lawnmowers in them.
 */
const DEFAULT_PER_KIND = 5;
/** No published rate limit since keys came in, but their Terms still
 *  frown on mass downloading. One request per 1.5s is a polite once. */
const THROTTLE_MS = 1500;
const USER_AGENT = 'GardenQuestSchool/1.0 (homeschool education project)';
/** Originals longer than this are all download and no extra value. */
const MAX_LENGTH_SEC = 240;
const MIN_LENGTH_SEC = 8;

export interface AudioCandidate {
  source: 'xeno_canto';
  kind: VoiceKind;
  /** 'XC1154497' */
  sourceId: string;
  filename: string;
  recordist: string;
  /** Verbatim licence URL from the API. */
  licenseUrl: string;
  sourceUrl: string;
  originalTitle: string;
  locality: string;
  country: string;
  date: string;
  quality: string;
  lengthSec: number;
  also: string[];
}

function parseArgs(): { birds: string[]; all: boolean; perKind: number } {
  const args = process.argv.slice(2);
  const birds: string[] = [];
  let all = false;
  let perKind = DEFAULT_PER_KIND;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--all') { all = true; continue; }
    if (args[i] === '--bird' && args[i + 1]) { birds.push(args[i + 1]); i++; continue; }
    if (args[i] === '--per-kind' && args[i + 1]) { perKind = Number(args[i + 1]); i++; }
  }
  return { birds, all, perKind };
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function download(url: string, outPath: string): Promise<void> {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, redirect: 'follow' });
  if (!res.ok) throw new Error(`Download failed (${res.status}): ${url}`);
  await writeFile(outPath, Buffer.from(await res.arrayBuffer()));
}

/** Distinct voice kinds this bird's catalog entry asks for. */
function kindsFor(bird: BirdData): VoiceKind[] {
  return Array.from(new Set(bird.voices.map(v => v.kind)));
}

function stagedFilename(kind: VoiceKind, rec: XcRecording): string {
  const ext = (extname(rec.fileName) || '.mp3').toLowerCase();
  return `${kind}_${xcSourceId(rec.id)}${ext}`;
}

async function harvestBird(bird: BirdData, perKind: number, key: string): Promise<void> {
  const dir = join(STAGING_ROOT, bird.code);
  await mkdir(dir, { recursive: true });
  console.log(`\n→ ${bird.code} (${bird.commonName})`);

  const records: AudioCandidate[] = [];

  for (const kind of kindsFor(bird)) {
    try {
      const query = buildXcQuery(bird.xcQuery, kind);
      const res = await fetch(buildXcUrl(query, key), {
        headers: { 'User-Agent': USER_AGENT },
      });
      if (!res.ok) throw new Error(`xeno-canto HTTP ${res.status}`);
      const page = parseXcResponse(await res.json());
      console.log(`  • ${kind}: ${page.numRecordings} recordings match`);
      if (page.numRecordings === 0) {
        console.warn(`    ! NOTHING found — check the query: ${query}`);
        continue;
      }

      const usable = rankRecordings(page.recordings).filter(
        r => r.lengthSec >= MIN_LENGTH_SEC && r.lengthSec <= MAX_LENGTH_SEC,
      );
      let staged = 0;
      for (const rec of usable) {
        if (staged >= perKind) break;
        const filename = stagedFilename(kind, rec);
        const out = join(dir, filename);
        try {
          if (!existsSync(out)) {
            await download(rec.fileUrl, out);
            await sleep(THROTTLE_MS);
          }
        } catch (e) {
          console.warn(`    ! ${filename}: ${(e as Error).message}`);
          continue;
        }
        staged++;
        records.push({
          source: 'xeno_canto',
          kind,
          sourceId: xcSourceId(rec.id),
          filename,
          recordist: rec.recordist,
          licenseUrl: rec.licenseUrl,
          sourceUrl: rec.url,
          originalTitle: rec.fileName,
          locality: rec.locality,
          country: rec.country,
          date: rec.date,
          quality: rec.quality,
          lengthSec: rec.lengthSec,
          also: rec.also,
        });
      }
      console.log(`    ↳ ${staged} staged (quality ${usable.slice(0, staged).map(r => r.quality).join(',') || '—'})`);
    } catch (e) {
      console.error(`  ! ${kind} failed for ${bird.code}:`, (e as Error).message);
    }
    await sleep(THROTTLE_MS);
  }

  // Merge additively — a rerun must never lose an earlier harvest.
  const candidatesPath = join(dir, 'recordings.json');
  let existing: AudioCandidate[] = [];
  if (existsSync(candidatesPath)) {
    try { existing = JSON.parse(await readFile(candidatesPath, 'utf-8')); } catch {}
  }
  const byFilename = new Map<string, AudioCandidate>();
  for (const r of existing) byFilename.set(r.filename, r);
  for (const r of records) byFilename.set(r.filename, r);   // newer wins
  const merged = Array.from(byFilename.values());
  await writeFile(candidatesPath, JSON.stringify(merged, null, 2));
  console.log(`  ✓ ${merged.length} candidates in ${candidatesPath}`);
}

async function main() {
  const { birds, all, perKind } = parseArgs();
  if (!all && birds.length === 0) {
    console.error('Usage:');
    console.error('  npm run birds:audio-harvest -- --bird <code>');
    console.error('  npm run birds:audio-harvest -- --all');
    process.exit(1);
  }

  const key = process.env.XENO_CANTO_KEY;
  if (!key) {
    console.error('XENO_CANTO_KEY missing from .env.local — see the birds handoff §5.');
    process.exit(1);
  }

  const targets = all
    ? BIRD_CATALOG
    : BIRD_CATALOG.filter(b => birds.includes(b.code));

  if (targets.length === 0) {
    console.error(`No matching birds in BIRD_CATALOG for: ${birds.join(', ')}`);
    process.exit(1);
  }

  console.log(`Harvesting audio for ${targets.length} bird(s)...`);
  for (const b of targets) await harvestBird(b, perKind, key);
  console.log('\n✓ Done. Next: npm run birds:audio-clips, then npm run birds:audition.');
}

main().catch(e => { console.error(e); process.exit(1); });
