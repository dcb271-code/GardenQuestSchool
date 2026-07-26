#!/usr/bin/env tsx
/**
 * Harvests CC-licensed candidate photos for the bird catalog from
 * iNaturalist, staging them under scripts/staging/birds/<bird_code>/.
 *
 * Usage:
 *   npm run birds:harvest -- --bird northern_cardinal
 *   npm run birds:harvest -- --all
 *
 * Differs from the flora harvester in one way that matters: birds are
 * queried PER ROLE, not once per species. A beginner's single biggest
 * shock is that a male and female cardinal look nothing alike, so the
 * dimorphic species need male and female photos harvested separately —
 * iNat's sex annotation does exactly that.
 *
 * After running, choose selections by eye (see §4.1 of the design
 * spec). A photo where the diagnostic mark is hidden behind a branch
 * is worse than no photo at all, so this cannot be auto-curated the
 * way flora was.
 */

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { BIRD_CATALOG, type BirdData } from '../lib/world/birdCatalog';
import {
  buildInatObservationsUrl, parseInatResponse, ANNOTATION, type InatPhoto,
} from './naturalist/inatClient';

const STAGING_ROOT = join(process.cwd(), 'scripts', 'staging', 'birds');
const PER_ROLE = 12;
/** iNat asks for <=60 req/min. One per 1.2s keeps us well inside it. */
const THROTTLE_MS = 1200;
const USER_AGENT = 'GardenQuestSchool/1.0 (homeschool education project)';

type HarvestRole = 'perched' | 'male' | 'female';

interface CandidateRecord {
  source: 'inat';
  role: HarvestRole;
  filename: string;
  photographer: string;
  licenseCode: string;
  sourceUrl: string;
  originalDownloadUrl: string;
}

function parseArgs(): { birds: string[]; all: boolean } {
  const args = process.argv.slice(2);
  const birds: string[] = [];
  let all = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--all') { all = true; continue; }
    if (args[i] === '--bird' && args[i + 1]) { birds.push(args[i + 1]); i++; }
  }
  return { birds, all };
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function downloadPhoto(url: string, outPath: string): Promise<void> {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`Download failed (${res.status}): ${url}`);
  await writeFile(outPath, Buffer.from(await res.arrayBuffer()));
}

/** Which roles to harvest for this bird. Only dimorphic ones need sexes. */
function rolesFor(bird: BirdData): HarvestRole[] {
  return bird.dimorphic ? ['perched', 'male', 'female'] : ['perched'];
}

function queryFor(bird: BirdData, role: HarvestRole) {
  const base = { taxonId: bird.inatTaxonId, perPage: 40 };
  if (role === 'male') {
    return { ...base, termId: ANNOTATION.SEX, termValueId: ANNOTATION.MALE };
  }
  if (role === 'female') {
    return { ...base, termId: ANNOTATION.SEX, termValueId: ANNOTATION.FEMALE };
  }
  return base;
}

async function harvestBird(bird: BirdData): Promise<void> {
  const dir = join(STAGING_ROOT, bird.code);
  await mkdir(dir, { recursive: true });
  console.log(`\n→ ${bird.code} (${bird.commonName})`);

  const records: CandidateRecord[] = [];

  for (const role of rolesFor(bird)) {
    try {
      const url = buildInatObservationsUrl(queryFor(bird, role));
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      if (!res.ok) throw new Error(`iNat HTTP ${res.status}`);
      const photos: InatPhoto[] = parseInatResponse(await res.json());
      console.log(`  • ${role}: ${photos.length} CC-licensed candidates`);

      for (const p of photos.slice(0, PER_ROLE)) {
        const filename = `${role}_inat_${p.id}.jpg`;
        const out = join(dir, filename);
        if (!existsSync(out)) {
          await downloadPhoto(p.largeUrl, out);
          await sleep(THROTTLE_MS);
        }
        records.push({
          source: 'inat',
          role,
          filename,
          photographer: p.photographer,
          licenseCode: p.licenseCode,
          sourceUrl: p.observationUrl,
          originalDownloadUrl: p.largeUrl,
        });
      }
      console.log(`    ↳ ${Math.min(photos.length, PER_ROLE)} staged`);
    } catch (e) {
      console.error(`  ! ${role} failed for ${bird.code}:`, (e as Error).message);
    }
    await sleep(THROTTLE_MS);
  }

  // Merge additively — a rerun must never lose an earlier harvest.
  const candidatesPath = join(dir, 'candidates.json');
  let existing: CandidateRecord[] = [];
  if (existsSync(candidatesPath)) {
    try { existing = JSON.parse(await readFile(candidatesPath, 'utf-8')); } catch {}
  }
  const byFilename = new Map<string, CandidateRecord>();
  for (const r of existing) byFilename.set(r.filename, r);
  for (const r of records) byFilename.set(r.filename, r);   // newer wins
  const merged = Array.from(byFilename.values());
  await writeFile(candidatesPath, JSON.stringify(merged, null, 2));
  console.log(`  ✓ ${merged.length} candidates in ${candidatesPath}`);
}

async function main() {
  const { birds, all } = parseArgs();
  if (!all && birds.length === 0) {
    console.error('Usage:');
    console.error('  npm run birds:harvest -- --bird <code>');
    console.error('  npm run birds:harvest -- --all');
    process.exit(1);
  }

  const targets = all
    ? BIRD_CATALOG
    : BIRD_CATALOG.filter(b => birds.includes(b.code));

  if (targets.length === 0) {
    console.error(`No matching birds in BIRD_CATALOG for: ${birds.join(', ')}`);
    process.exit(1);
  }

  console.log(`Harvesting ${targets.length} birds...`);
  for (const b of targets) await harvestBird(b);
  console.log(`\n✓ Done. Choose selections BY EYE — see §4.1 of the design spec.`);
}

main().catch(e => { console.error(e); process.exit(1); });
