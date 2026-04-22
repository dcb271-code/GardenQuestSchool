#!/usr/bin/env tsx
/**
 * Seeds a dev parent + Cecily + Math pack + ~40 hand-authored items.
 * Uses service_role key — no DATABASE_URL required.
 *
 * Idempotent: wipes existing seed-generated items per run before re-inserting.
 * Non-seed (parent/generated_by != 'seed') items are preserved.
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { MATH_STRANDS } from '../lib/packs/math/strands';
import { MATH_SKILLS } from '../lib/packs/math/skills';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_ROLE);

const PARENT_ID = '00000000-0000-0000-0000-000000000001';
const CECILY_ID = '11111111-1111-1111-1111-111111111111';
const SUBJECT_ID = '22222222-2222-2222-2222-222222222221';

const PARENT_EMAIL = 'dylan.c.brock@gmail.com';

async function step(label: string, fn: () => Promise<void>) {
  process.stdout.write(`→ ${label} ... `);
  try {
    await fn();
    console.log('✓');
  } catch (e: any) {
    console.log('✗');
    console.error(`  ${e.message ?? e}`);
    throw e;
  }
}

async function main() {
  await step('parent', async () => {
    const { error } = await sb.from('parent').upsert({
      id: PARENT_ID, email: PARENT_EMAIL, display_name: 'Dylan',
    }, { onConflict: 'id' });
    if (error) throw error;
  });

  await step('learner (Cecily)', async () => {
    const { error } = await sb.from('learner').upsert({
      id: CECILY_ID, parent_id: PARENT_ID, first_name: 'Cecily', avatar_key: 'fox',
    }, { onConflict: 'id' });
    if (error) throw error;
  });

  await step('subject (math)', async () => {
    const { error } = await sb.from('subject').upsert({
      id: SUBJECT_ID, code: 'math', name: 'Math', pack_version: '1.0.0',
    }, { onConflict: 'code' });
    if (error) throw error;
  });

  await step('strands', async () => {
    for (const s of MATH_STRANDS) {
      const { error } = await sb.from('strand').upsert({
        subject_id: SUBJECT_ID, code: s.code, name: s.name, sort_order: s.sortOrder,
      }, { onConflict: 'subject_id,code' });
      if (error) throw error;
    }
  });

  const { data: strandRows, error: strandErr } = await sb.from('strand')
    .select('id, code').eq('subject_id', SUBJECT_ID);
  if (strandErr) throw strandErr;
  const strandIdByCode = new Map(strandRows!.map(r => [r.code, r.id]));

  await step(`skills (${MATH_SKILLS.length})`, async () => {
    for (const sk of MATH_SKILLS) {
      const strandId = strandIdByCode.get(sk.strandCode);
      if (!strandId) throw new Error(`Strand not found for skill ${sk.code}: ${sk.strandCode}`);
      const { error } = await sb.from('skill').upsert({
        strand_id: strandId,
        code: sk.code,
        name: sk.name,
        level: sk.level,
        prereq_skill_codes: sk.prereqSkillCodes,
        curriculum_refs: sk.curriculumRefs ?? {},
        theme_tags: sk.themeTags,
        sort_order: sk.sortOrder,
      }, { onConflict: 'code' });
      if (error) throw error;
    }
  });

  const { data: skillRows, error: skillErr } = await sb.from('skill').select('id, code');
  if (skillErr) throw skillErr;
  const skillIdByCode = new Map(skillRows!.map(r => [r.code, r.id]));

  await step('world_state (Cecily)', async () => {
    const { error } = await sb.from('world_state').upsert({
      learner_id: CECILY_ID,
    }, { onConflict: 'learner_id' });
    if (error) throw error;
  });

  // Wipe seed items from math pack skills and re-insert
  const mathSkillIds = MATH_SKILLS
    .map(s => skillIdByCode.get(s.code))
    .filter((x): x is string => !!x);

  await step(`wipe previous seed items`, async () => {
    const { error } = await sb.from('item')
      .delete()
      .eq('generated_by', 'seed')
      .in('skill_id', mathSkillIds);
    if (error) throw error;
  });

  const now = new Date().toISOString();
  const items: any[] = [];

  // NumberBonds within 10 (partner pairs to 10 — 9 items: knownPart 1..9)
  {
    const id = skillIdByCode.get('math.number_bond.within_10');
    if (id) {
      for (let k = 1; k <= 9; k++) {
        items.push({
          skill_id: id,
          type: 'NumberBonds',
          content: { type: 'NumberBonds', whole: 10, knownPart: k, promptText: `${k} and what make 10?` },
          answer: { missing: 10 - k },
          approved_at: now,
          generated_by: 'seed',
          difficulty_elo: 1000,
        });
      }
    }
  }

  // CountingTiles within 20 (18 items: count 3..20)
  {
    const id = skillIdByCode.get('math.counting.to_20');
    if (id) {
      const emojiSet = ['🐜', '🦋', '🐝', '🐞', '🌼', '🌱', '🍄', '🐛'];
      for (let n = 3; n <= 20; n++) {
        const emoji = emojiSet[(n - 3) % emojiSet.length];
        items.push({
          skill_id: id,
          type: 'CountingTiles',
          content: { type: 'CountingTiles', emoji, count: n, promptText: 'How many do you see?' },
          answer: { count: n },
          approved_at: now,
          generated_by: 'seed',
          difficulty_elo: 900 + n * 10,
        });
      }
    }
  }

  // EquationTap for add within 10 (15 items where a+b <= 10, a,b in 1..5)
  {
    const id = skillIdByCode.get('math.add.within_10');
    if (id) {
      const pairs: Array<[number, number]> = [];
      for (let a = 1; a <= 5; a++) for (let b = 1; b <= 5; b++) {
        if (a + b <= 10) pairs.push([a, b]);
      }
      for (const [a, b] of pairs) {
        const sum = a + b;
        const distractors = Array.from(new Set([sum - 1, sum + 1, sum + 2])).filter(n => n > 0 && n !== sum).slice(0, 3);
        const choices = [sum, ...distractors].sort(() => Math.random() - 0.5);
        items.push({
          skill_id: id,
          type: 'EquationTap',
          content: {
            type: 'EquationTap',
            equation: `${a} + ${b} = ?`,
            choices,
            promptText: `${a} plus ${b} is?`,
          },
          answer: { correct: sum },
          approved_at: now,
          generated_by: 'seed',
          difficulty_elo: 950 + (a + b) * 5,
        });
      }
    }
  }

  await step(`insert ${items.length} seed items`, async () => {
    if (items.length === 0) return;
    const { error } = await sb.from('item').insert(items);
    if (error) throw error;
  });

  console.log(`\n✅ Seed complete. Inserted ${items.length} items.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
