#!/usr/bin/env tsx
/**
 * Proposes a 6-second window for every harvested recording and cuts an
 * auditionable preview (m4a + spectrogram) for each, under
 * scripts/staging/birds-audio/<bird_code>/_previews/.
 *
 * Usage:
 *   npm run birds:audio-clips              # everything harvested
 *   npm run birds:audio-clips -- --bird northern_cardinal
 *
 * The window is picked by signal analysis — band-pass to the range
 * birds occupy, then the loudest contiguous six seconds. That is a
 * PROPOSAL, not a decision: nothing in this pipeline can hear, and the
 * loudest six seconds of a field recording can be a lawnmower. The
 * audition page (npm run birds:audition) is where a human confirms or
 * nudges every window; nothing uploads without a selections.json
 * written there.
 *
 * Rerun-safe: previews are keyed by (recording, start), so re-running
 * recomputes nothing that already exists, and a re-harvest that adds
 * candidates only cuts the new ones.
 */

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import type { AudioCandidate } from './seed-bird-audio';
import {
  probeDurationSec, proposeWindowSec, normaliseStart, startTag,
  cutM4a, spectrogram, CLIP_LEN_SEC,
} from './naturalist/audioClip';

const STAGING = join(process.cwd(), 'scripts', 'staging', 'birds-audio');

export interface WindowProposal {
  filename: string;
  kind: string;
  sourceId: string;
  /** Real duration from ffprobe — the API's length field is 'm:ss'. */
  durationSec: number;
  proposedStartSec: number;
  previewFile: string;      // _previews/<stem>_s<...>.m4a
  spectrogramFile: string;  // _previews/<stem>_s<...>.png
}

function parseArgs(): { birds: string[] } {
  const args = process.argv.slice(2);
  const birds: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--bird' && args[i + 1]) { birds.push(args[i + 1]); i++; }
  }
  return { birds };
}

/** Preview + spectrogram for one recording at one start. Idempotent. */
export async function cutPreview(
  dir: string, filename: string, startSec: number,
): Promise<{ previewFile: string; spectrogramFile: string }> {
  const previewDir = join(dir, '_previews');
  await mkdir(previewDir, { recursive: true });
  const stem = basename(filename, extname(filename));
  const tag = `${stem}_${startTag(startSec)}`;
  const preview = join(previewDir, `${tag}.m4a`);
  const png = join(previewDir, `${tag}.png`);
  if (!existsSync(preview)) await cutM4a(join(dir, filename), startSec, preview);
  if (!existsSync(png)) await spectrogram(preview, png);
  return {
    previewFile: join('_previews', `${tag}.m4a`),
    spectrogramFile: join('_previews', `${tag}.png`),
  };
}

async function processBird(code: string): Promise<void> {
  const dir = join(STAGING, code);
  const recordingsPath = join(dir, 'recordings.json');
  if (!existsSync(recordingsPath)) return;
  const candidates: AudioCandidate[] = JSON.parse(await readFile(recordingsPath, 'utf-8'));
  console.log(`\n→ ${code}: ${candidates.length} candidate(s)`);

  const proposalsPath = join(dir, 'proposals.json');
  let existing: WindowProposal[] = [];
  if (existsSync(proposalsPath)) {
    try { existing = JSON.parse(await readFile(proposalsPath, 'utf-8')); } catch {}
  }
  const byFilename = new Map(existing.map(p => [p.filename, p]));

  for (const cand of candidates) {
    const src = join(dir, cand.filename);
    if (!existsSync(src)) {
      console.warn(`  ! ${cand.filename} in manifest but not on disk — re-run the harvest`);
      continue;
    }
    // A proposal already made (and possibly already auditioned) is
    // never silently moved by a re-run.
    let proposal = byFilename.get(cand.filename);
    if (!proposal) {
      try {
        const durationSec = await probeDurationSec(src);
        if (durationSec < CLIP_LEN_SEC) {
          console.warn(`  ! ${cand.filename}: only ${durationSec.toFixed(1)}s — too short, skipping`);
          continue;
        }
        const start = normaliseStart(await proposeWindowSec(src, durationSec), durationSec);
        proposal = {
          filename: cand.filename,
          kind: cand.kind,
          sourceId: cand.sourceId,
          durationSec: Math.round(durationSec * 10) / 10,
          proposedStartSec: start,
          previewFile: '', spectrogramFile: '',
        };
      } catch (e) {
        console.error(`  ! ${cand.filename}: ${(e as Error).message}`);
        continue;
      }
    }
    try {
      const files = await cutPreview(dir, cand.filename, proposal.proposedStartSec);
      proposal.previewFile = files.previewFile;
      proposal.spectrogramFile = files.spectrogramFile;
      byFilename.set(cand.filename, proposal);
      console.log(`  ✓ ${cand.filename} @ ${proposal.proposedStartSec}s of ${proposal.durationSec}s`);
    } catch (e) {
      console.error(`  ! preview for ${cand.filename}: ${(e as Error).message}`);
    }
  }

  const merged = Array.from(byFilename.values());
  await writeFile(proposalsPath, JSON.stringify(merged, null, 2));
  console.log(`  ✓ ${merged.length} proposal(s) in ${proposalsPath}`);
}

async function main() {
  const { birds } = parseArgs();
  if (!existsSync(STAGING)) {
    console.error('Nothing staged. Run npm run birds:audio-harvest first.');
    process.exit(1);
  }
  const dirs = (await readdir(STAGING, { withFileTypes: true }))
    .filter(d => d.isDirectory() && !d.name.startsWith('_'))
    .map(d => d.name);
  const targets = birds.length ? dirs.filter(d => birds.includes(d)) : dirs;
  if (targets.length === 0) {
    console.error('No matching staged birds.');
    process.exit(1);
  }
  for (const code of targets) await processBird(code);
  console.log('\n✓ Done. Next: npm run birds:audition — windows must be confirmed BY EAR.');
}

// Only run as a script — cutPreview is imported by the audition server.
if (process.argv[1] && process.argv[1].endsWith('clip-bird-audio.ts')) {
  main().catch(e => { console.error(e); process.exit(1); });
}
