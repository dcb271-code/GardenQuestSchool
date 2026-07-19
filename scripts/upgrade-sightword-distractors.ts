#!/usr/bin/env tsx
/**
 * One-off/maintenance: recompute distractors for existing SightWordTap
 * items on the sight-word skills IN PLACE, using the near-miss ranker
 * (lib/packs/reading/distractors). Content-only update — item ids,
 * answers, elo, and attempt history are untouched, so no learner
 * progress or garden state is affected.
 *
 *   npx tsx scripts/upgrade-sightword-distractors.ts          # dry run
 *   APPLY=1 npx tsx scripts/upgrade-sightword-distractors.ts  # write
 */
import { config } from 'dotenv';
import postgres from 'postgres';
import { pickNearMissDistractors } from '../lib/packs/reading/distractors';

config({ path: '.env.local' });

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { prepare: false });
  const rows = await sql`
    select i.id, i.content, sk.code as skill
    from item i join skill sk on sk.id = i.skill_id
    where i.type = 'SightWordTap' and sk.code like 'reading.sight_words.%'
    order by sk.code`;

  const poolBySkill = new Map<string, string[]>();
  for (const r of rows as any[]) {
    if (!poolBySkill.has(r.skill)) poolBySkill.set(r.skill, []);
    if (typeof r.content?.word === 'string') poolBySkill.get(r.skill)!.push(r.content.word);
  }

  const rngFor = (seedStr: string) => {
    let s = 0;
    for (const ch of seedStr) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0x100000000; };
  };

  let changed = 0;
  const samples: string[] = [];
  for (const r of rows as any[]) {
    if (typeof r.content?.word !== 'string') continue;
    const pool = poolBySkill.get(r.skill)!;
    const next = pickNearMissDistractors(r.content.word, pool, 3, rngFor(r.id));
    if (JSON.stringify(r.content.distractors) !== JSON.stringify(next)) {
      changed++;
      if (samples.length < 12) {
        samples.push(`${r.skill.split('.').pop()} "${r.content.word}": ${JSON.stringify(r.content.distractors)} → ${JSON.stringify(next)}`);
      }
      if (process.env.APPLY === '1') {
        // NB: sql.json() is REQUIRED here. Passing a JSON string (even
        // with a ::jsonb cast) makes postgres.js store a double-encoded
        // jsonb STRING — that bug corrupted these items twice.
        await sql`update item set content = ${sql.json({ ...r.content, distractors: next })} where id = ${r.id}`;
      }
    }
  }
  console.log(`${rows.length} SightWordTap items; ${changed} get better distractors`);
  for (const s of samples) console.log('  ' + s);
  console.log(process.env.APPLY === '1' ? 'APPLIED.' : 'DRY RUN — APPLY=1 to write.');
  await sql.end();
}
main();
