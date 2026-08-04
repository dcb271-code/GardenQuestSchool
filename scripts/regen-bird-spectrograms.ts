#!/usr/bin/env tsx
/**
 * Redraws every uploaded spectrogram from its already-uploaded clip
 * and overwrites the object in place.
 *
 *   npm run birds:respectrogram
 *
 * Exists because the picture settings are a display decision that will
 * be tuned again — the first version used a linear frequency scale,
 * which squashed the Mourning Dove into the bottom few pixels and made
 * its spectrogram useless. Changing the settings should not mean
 * re-auditioning fifteen clips by ear.
 *
 * Storage paths and bird_audio rows are UNTOUCHED: the same object is
 * replaced at the same path, so nothing in the database moves and no
 * cached URL breaks. Nothing here can change which clip plays, only
 * how its picture looks.
 *
 * Prefers the staged _final/*.opus that produced the upload; falls
 * back to downloading the clip from storage, so this works on a
 * machine that never ran the audition.
 */

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { AUDIO_BUCKET } from '../lib/birds/photoStorage';
import { spectrogram } from './naturalist/audioClip';

config({ path: '.env.local' });

const STAGING = join(process.cwd(), 'scripts', 'staging', 'birds-audio');
const TMP = join(STAGING, '_respectrogram');

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }
  const db = createClient(url, key, { auth: { persistSession: false } });
  await mkdir(TMP, { recursive: true });

  const { data: rows, error } = await db
    .from('bird_audio')
    .select('bird_code, kind, storage_path, spectrogram_path');
  if (error) { console.error(error.message); process.exit(1); }
  if (!rows?.length) { console.log('No clips uploaded yet.'); return; }

  let redrawn = 0, skipped = 0;
  for (const row of rows) {
    const specPath = row.spectrogram_path as string | null;
    if (!specPath) { skipped++; continue; }
    const clipPath = row.storage_path as string;
    const stem = basename(clipPath).replace(/\.opus$/, '');

    // The staged final cut, if this machine has it.
    let source = join(STAGING, row.bird_code as string, '_final', `${stem}.opus`);
    if (!existsSync(source)) {
      const dl = await db.storage.from(AUDIO_BUCKET).download(clipPath);
      if (dl.error || !dl.data) {
        console.error(`  ! ${clipPath}: ${dl.error?.message ?? 'no data'}`);
        continue;
      }
      source = join(TMP, `${stem}.opus`);
      await writeFile(source, Buffer.from(await dl.data.arrayBuffer()));
    }

    const outPng = join(TMP, `${stem}.png`);
    try {
      await spectrogram(source, outPng);
    } catch (e) {
      console.error(`  ! drawing ${stem}: ${(e as Error).message}`);
      continue;
    }

    const up = await db.storage.from(AUDIO_BUCKET)
      .upload(specPath, await readFile(outPng), {
        contentType: 'image/png', upsert: true,
      });
    if (up.error) { console.error(`  ! upload ${specPath}: ${up.error.message}`); continue; }
    redrawn++;
    console.log(`  ✓ ${row.bird_code}/${row.kind}`);
  }

  console.log(`\n✓ ${redrawn} spectrogram(s) redrawn in place${skipped ? `, ${skipped} row(s) had none` : ''}.`);
  console.log('  Storage paths and bird_audio rows are unchanged.');
}

main().catch(e => { console.error(e); process.exit(1); });
