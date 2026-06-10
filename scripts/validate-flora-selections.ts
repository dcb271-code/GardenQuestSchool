#!/usr/bin/env tsx
/**
 * Sanity-checks every scripts/staging/<code>/selections.json before an
 * upload: filenames must exist on disk and in candidates.json, roles
 * must be valid for the species, tiers in 1..3, alt text plain ASCII.
 * Run after any curation pass, before `npm run naturalist:upload`.
 *
 * Usage:
 *   npm run naturalist:validate
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { FLORA_CATALOG } from '../lib/world/floraCatalog';

const STAGING_ROOT = join(process.cwd(), 'scripts', 'staging');

interface SelectionRecord {
  filename: string;
  role: string;
  tier: number;
  altText: string;
}

async function main() {
  let problems = 0;
  for (const species of FLORA_CATALOG) {
    const dir = join(STAGING_ROOT, species.code);
    const selPath = join(dir, 'selections.json');
    const candPath = join(dir, 'candidates.json');
    if (!existsSync(selPath)) {
      console.log(`  ↳ skip ${species.code} (no selections.json)`);
      continue;
    }

    let selections: SelectionRecord[];
    try {
      selections = JSON.parse(await readFile(selPath, 'utf-8'));
    } catch (e) {
      console.error(`✗ ${species.code}: selections.json is not valid JSON (${(e as Error).message})`);
      problems++;
      continue;
    }

    const candidates: { filename: string }[] = existsSync(candPath)
      ? JSON.parse(await readFile(candPath, 'utf-8'))
      : [];
    const candFiles = new Set(candidates.map(c => c.filename));
    const errs: string[] = [];

    for (const sel of selections) {
      if (!candFiles.has(sel.filename)) errs.push(`${sel.filename}: not in candidates.json`);
      if (!existsSync(join(dir, sel.filename))) errs.push(`${sel.filename}: missing on disk`);
      if (!(species.photoRoles as string[]).includes(sel.role)) {
        errs.push(`${sel.filename}: role '${sel.role}' not in [${species.photoRoles.join(', ')}]`);
      }
      if (![1, 2, 3].includes(sel.tier)) errs.push(`${sel.filename}: tier ${sel.tier} invalid`);
      if (!sel.altText || /[^\x20-\x7E]/.test(sel.altText)) {
        errs.push(`${sel.filename}: altText missing or contains non-ASCII characters`);
      }
    }
    if (!selections.some(s => s.role === 'whole')) errs.push(`no 'whole' photo selected`);

    const roleCounts = species.photoRoles
      .map(r => `${r}:${selections.filter(s => s.role === r).length}`)
      .join(' ');
    if (errs.length === 0) {
      console.log(`✓ ${species.code}: ${selections.length} selections OK (${roleCounts})`);
    } else {
      console.error(`✗ ${species.code}:`);
      for (const e of errs) console.error(`    ${e}`);
      problems += errs.length;
    }
  }

  if (problems > 0) {
    console.error(`\n✗ ${problems} problem(s) found — fix before uploading.`);
    process.exit(1);
  }
  console.log('\n✓ All selections valid.');
}

main().catch(e => { console.error(e); process.exit(1); });
