#!/usr/bin/env tsx
/**
 * Harvests CC-licensed candidate photos for one or all flora species
 * from iNaturalist and Wikimedia Commons. Stages results under
 *   scripts/staging/<flora_code>/
 * with a candidates.json describing each file's source, photographer,
 * license, and original URL.
 *
 * Usage:
 *   npm run naturalist:harvest -- --species tulip_poplar
 *   npm run naturalist:harvest -- --all
 *
 * After running, hand-author selections.json (see docs/naturalist-photo-curation.md)
 * then run `npm run naturalist:upload -- --species <code>`.
 */

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { FLORA_CATALOG, type FloraData } from '../lib/world/floraCatalog';
import { buildInatObservationsUrl, parseInatResponse, type InatPhoto } from './naturalist/inatClient';
import { buildWikimediaCategoryUrl, parseWikimediaResponse, type WikimediaPhoto } from './naturalist/wikimediaClient';

const STAGING_ROOT = join(process.cwd(), 'scripts', 'staging');

interface CandidateRecord {
  source: 'inat' | 'wikimedia';
  filename: string;             // relative to scripts/staging/<flora_code>/
  photographer: string;
  licenseCode: string;
  sourceUrl: string;
  originalDownloadUrl: string;
}

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

async function downloadPhoto(url: string, outPath: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Download failed (${res.status}): ${url}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(outPath, buf);
}

async function harvestSpecies(species: FloraData): Promise<void> {
  const dir = join(STAGING_ROOT, species.code);
  await mkdir(dir, { recursive: true });
  console.log(`\n→ ${species.code} (${species.commonName})`);

  const records: CandidateRecord[] = [];

  // ── iNaturalist ──────────────────────────────────────────────────
  try {
    const inatUrl = buildInatObservationsUrl({ taxonId: species.inatTaxonId, perPage: 50 });
    console.log(`  • iNat: ${inatUrl}`);
    const res = await fetch(inatUrl);
    if (!res.ok) throw new Error(`iNat HTTP ${res.status}`);
    const json = await res.json();
    const photos: InatPhoto[] = parseInatResponse(json);
    console.log(`    → ${photos.length} CC-licensed candidates`);

    // Limit to 20 per source per species to keep staging dir manageable
    for (const p of photos.slice(0, 20)) {
      const filename = `inat_${p.id}.jpg`;
      const out = join(dir, filename);
      if (existsSync(out)) {
        console.log(`    ↳ skip ${filename} (already downloaded)`);
      } else {
        await downloadPhoto(p.largeUrl, out);
        console.log(`    ↳ saved ${filename}`);
      }
      records.push({
        source: 'inat',
        filename,
        photographer: p.photographer,
        licenseCode: p.licenseCode,
        sourceUrl: p.observationUrl,
        originalDownloadUrl: p.largeUrl,
      });
    }
  } catch (e) {
    console.error(`  ! iNat failed for ${species.code}:`, (e as Error).message);
  }

  // ── Wikimedia Commons ────────────────────────────────────────────
  try {
    const wikiUrl = buildWikimediaCategoryUrl(species.wikiSpecies);
    console.log(`  • Wikimedia: ${wikiUrl}`);
    const res = await fetch(wikiUrl);
    if (!res.ok) throw new Error(`Wikimedia HTTP ${res.status}`);
    const json = await res.json();
    const photos: WikimediaPhoto[] = parseWikimediaResponse(json);
    console.log(`    → ${photos.length} CC-licensed candidates`);

    for (const p of photos.slice(0, 20)) {
      const ext = (p.directUrl.match(/\.(jpg|jpeg|png|webp)(\?|$)/i)?.[1] ?? 'jpg').toLowerCase();
      const filename = `wikimedia_${p.pageId}.${ext}`;
      const out = join(dir, filename);
      if (existsSync(out)) {
        console.log(`    ↳ skip ${filename} (already downloaded)`);
      } else {
        await downloadPhoto(p.directUrl, out);
        console.log(`    ↳ saved ${filename}`);
      }
      records.push({
        source: 'wikimedia',
        filename,
        photographer: p.photographer,
        licenseCode: p.licenseCode,
        sourceUrl: p.sourceUrl,
        originalDownloadUrl: p.directUrl,
      });
    }
  } catch (e) {
    console.error(`  ! Wikimedia failed for ${species.code}:`, (e as Error).message);
  }

  // ── Merge into candidates.json (additive) ────────────────────────
  const candidatesPath = join(dir, 'candidates.json');
  let existing: CandidateRecord[] = [];
  if (existsSync(candidatesPath)) {
    try { existing = JSON.parse(await readFile(candidatesPath, 'utf-8')); } catch {}
  }
  const byFilename = new Map<string, CandidateRecord>();
  for (const r of existing) byFilename.set(r.filename, r);
  for (const r of records) byFilename.set(r.filename, r);  // newer wins
  const merged = Array.from(byFilename.values());
  await writeFile(candidatesPath, JSON.stringify(merged, null, 2));
  console.log(`  ✓ ${merged.length} candidates total in ${candidatesPath}`);
}

async function main() {
  const { species, all } = parseArgs();
  if (!all && species.length === 0) {
    console.error('Usage:');
    console.error('  npm run naturalist:harvest -- --species <code>');
    console.error('  npm run naturalist:harvest -- --all');
    process.exit(1);
  }

  const targets = all
    ? FLORA_CATALOG
    : FLORA_CATALOG.filter(f => species.includes(f.code));

  if (targets.length === 0) {
    console.error(`No matching species in FLORA_CATALOG for: ${species.join(', ')}`);
    process.exit(1);
  }

  console.log(`Harvesting ${targets.length} species...`);
  for (const sp of targets) {
    await harvestSpecies(sp);
  }
  console.log(`\n✓ Done. Hand-edit selections.json in each species dir to choose role + tier.`);
  console.log(`  See docs/naturalist-photo-curation.md for the format.`);
}

main().catch(e => { console.error(e); process.exit(1); });
