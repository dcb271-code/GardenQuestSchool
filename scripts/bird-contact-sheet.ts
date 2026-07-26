#!/usr/bin/env tsx
/**
 * Builds a numbered contact sheet per bird-and-role so every staged
 * candidate can actually be LOOKED at before it is chosen.
 *
 * The flora pipeline learned this the hard way: iNaturalist ranks by
 * favourites, and favourites reward beautiful photographs, not useful
 * ones. A prize-winning shot of a Downy Woodpecker with its bill
 * hidden behind a branch is worse than no photo at all, because the
 * bill length is the entire lesson. So nothing here is auto-selected;
 * this script only makes looking at 192 files feasible.
 *
 * Usage:
 *   npx tsx scripts/bird-contact-sheet.ts
 *   → scripts/staging/birds/_sheets/<bird>_<role>.jpg
 */

import { readdir, mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const ROOT = join(process.cwd(), 'scripts', 'staging', 'birds');
const OUT = join(ROOT, '_sheets');

const CELL = 300;      // px per thumbnail
const COLS = 4;
const LABEL_H = 26;

/** A numbered strip under each thumbnail, so a pick can be named. */
function labelSvg(text: string, w: number, h: number): Buffer {
  return Buffer.from(
    `<svg width="${w}" height="${h}">
       <rect width="${w}" height="${h}" fill="#1f2937"/>
       <text x="8" y="${h - 8}" font-family="monospace" font-size="15"
             fill="#f9fafb">${text}</text>
     </svg>`,
  );
}

async function sheetFor(birdDir: string, role: string, files: string[]) {
  const rows = Math.ceil(files.length / COLS);
  const cellH = CELL + LABEL_H;
  const canvas = sharp({
    create: {
      width: COLS * CELL, height: rows * cellH,
      channels: 3, background: { r: 17, g: 24, b: 39 },
    },
  });

  // Typed off the call site rather than the `sharp` namespace, which
  // isn't importable under this tsconfig.
  type Overlay = { input: Buffer; left: number; top: number };
  const composites: Overlay[] = [];
  for (let i = 0; i < files.length; i++) {
    const left = (i % COLS) * CELL;
    const top = Math.floor(i / COLS) * cellH;
    const buf = await sharp(await readFile(join(birdDir, files[i])))
      .resize(CELL, CELL, { fit: 'cover' })
      .toBuffer();
    composites.push({ input: buf, left, top });
    // Index + the iNat photo id, which is what selections.json refers to.
    const id = files[i].replace(/^.*_inat_/, '').replace(/\.jpg$/, '');
    composites.push({
      input: labelSvg(`[${i}] ${id}`, CELL, LABEL_H),
      left, top: top + CELL,
    });
  }

  const outPath = join(OUT, `${birdDir.split('/').pop()}_${role}.jpg`);
  await canvas.composite(composites).jpeg({ quality: 82 }).toFile(outPath);
  console.log(`  ✓ ${outPath.split('/').pop()}  (${files.length} candidates)`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const birds = (await readdir(ROOT, { withFileTypes: true }))
    .filter(d => d.isDirectory() && !d.name.startsWith('_'))
    .map(d => d.name);

  for (const bird of birds) {
    const dir = join(ROOT, bird);
    const jpgs = (await readdir(dir)).filter(f => f.endsWith('.jpg')).sort();
    const byRole = new Map<string, string[]>();
    for (const f of jpgs) {
      const role = f.split('_')[0];
      if (!byRole.has(role)) byRole.set(role, []);
      byRole.get(role)!.push(f);
    }
    console.log(`\n→ ${bird}`);
    // Array.from, not direct Map iteration — see the handoff's
    // downlevelIteration gotcha.
    for (const [role, files] of Array.from(byRole)) await sheetFor(dir, role, files);
  }
  console.log(`\n✓ Sheets in ${OUT}`);
}

main().catch(e => { console.error(e); process.exit(1); });
