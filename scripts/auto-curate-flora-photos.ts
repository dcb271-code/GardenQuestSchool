#!/usr/bin/env tsx
/**
 * Heuristic auto-curation: for each species that has candidates harvested,
 * write a selections.json that picks the top N photos (already vote-sorted
 * by iNat) and tags them by ROUND-ROBINNING through the species' photoRoles.
 *
 * This is NOT photo-content-aware — the tags are a placeholder that lets
 * Phase 2 ship with real photos. A future manual curation pass can replace
 * mis-tagged entries (e.g., a photo tagged 'leaf' that's really a whole-
 * plant shot).
 *
 * Usage:
 *   npm run naturalist:auto-curate -- --all
 *   npm run naturalist:auto-curate -- --species tulip_poplar
 *
 * After this, run `npm run naturalist:upload -- --all`.
 */

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { FLORA_CATALOG, type FloraData, type PhotoRole } from '../lib/world/floraCatalog';

const STAGING_ROOT = join(process.cwd(), 'scripts', 'staging');
const PHOTOS_PER_SPECIES = 5;

interface CandidateRecord {
  source: 'inat' | 'wikimedia';
  filename: string;
  photographer: string;
  licenseCode: string;
  sourceUrl: string;
  originalDownloadUrl: string;
}

interface SelectionRecord {
  filename: string;
  role: PhotoRole;
  tier: 1 | 2 | 3;
  altText: string;
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

async function curateSpecies(species: FloraData): Promise<void> {
  const dir = join(STAGING_ROOT, species.code);
  const candPath = join(dir, 'candidates.json');
  const selPath = join(dir, 'selections.json');

  if (!existsSync(candPath)) {
    console.log(`  ↳ skip ${species.code} (no candidates.json — run harvest first)`);
    return;
  }

  const candidates: CandidateRecord[] = JSON.parse(await readFile(candPath, 'utf-8'));

  // Only include candidates whose file actually exists on disk
  const onDisk = candidates.filter(c => existsSync(join(dir, c.filename)));
  if (onDisk.length === 0) {
    console.log(`  ↳ skip ${species.code} (no candidate files exist on disk)`);
    return;
  }

  // Take top N photos (already vote-sorted by iNat; Wikimedia appended after)
  const chosen = onDisk.slice(0, PHOTOS_PER_SPECIES);

  // Round-robin through photoRoles. First photo gets photoRoles[0] (usually
  // 'whole'), second gets photoRoles[1] (usually 'leaf'), etc.
  const roles = species.photoRoles;
  const selections: SelectionRecord[] = chosen.map((c, i) => {
    const role = roles[i % roles.length];
    return {
      filename: c.filename,
      role,
      tier: 1,
      altText: `${species.commonName} — ${role} reference`,
    };
  });

  await mkdir(dir, { recursive: true });
  await writeFile(selPath, JSON.stringify(selections, null, 2));
  console.log(`  ✓ ${species.code}: ${selections.length} selections written`);
  for (const s of selections) {
    console.log(`      ${s.role} tier ${s.tier}: ${s.filename}`);
  }
}

async function main() {
  const { species, all } = parseArgs();
  if (!all && species.length === 0) {
    console.error('Usage:');
    console.error('  npm run naturalist:auto-curate -- --species <code>');
    console.error('  npm run naturalist:auto-curate -- --all');
    process.exit(1);
  }

  const targets = all
    ? FLORA_CATALOG
    : FLORA_CATALOG.filter(f => species.includes(f.code));

  if (targets.length === 0) {
    console.error(`No matching species in FLORA_CATALOG for: ${species.join(', ')}`);
    process.exit(1);
  }

  console.log(`Auto-curating ${targets.length} species...\n`);
  for (const sp of targets) {
    await curateSpecies(sp);
  }
  console.log(`\n✓ Done. Run \`npm run naturalist:upload -- --all\` to push to Storage + DB.`);
}

main().catch(e => { console.error(e); process.exit(1); });
