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
import { seedReading } from './seed-reading';

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
const READING_SUBJECT_ID = '22222222-2222-2222-2222-222222222222';

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

  await step('subject (reading)', async () => {
    const { error } = await sb.from('subject').upsert({
      id: READING_SUBJECT_ID, code: 'reading', name: 'Reading', pack_version: '1.0.0',
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

  await step('reading pack', async () => {
    await seedReading(sb, READING_SUBJECT_ID, skillIdByCode);
  });

  // Seed Cecily's baseline mastery to reflect her actual level (Math c, Reading b→c).
  // This opens up more expeditions on day 1; otherwise the planner only
  // offers skills with zero prereqs.
  await step('Cecily baseline mastery (math c, reading b\u2192c)', async () => {
    const mastered = [
      'math.counting.to_20', 'math.counting.to_50', 'math.add.within_10',
      'reading.phonics.cvc_blend',
    ];
    const reviewing = [
      'math.subtract.within_10',
      'reading.sight_words.dolch_primer',
    ];
    const rows = [
      ...mastered.map(code => ({
        learner_id: CECILY_ID,
        skill_id: skillIdByCode.get(code),
        mastery_state: 'mastered',
        leitner_box: 5,
        student_elo: 1100,
        total_attempts: 10,
        total_correct: 10,
        last_attempted_at: new Date().toISOString(),
        next_review_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      })),
      ...reviewing.map(code => ({
        learner_id: CECILY_ID,
        skill_id: skillIdByCode.get(code),
        mastery_state: 'review',
        leitner_box: 3,
        student_elo: 1050,
        total_attempts: 5,
        total_correct: 4,
        last_attempted_at: new Date().toISOString(),
        next_review_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      })),
    ].filter(r => r.skill_id);
    const { error } = await sb.from('skill_progress')
      .upsert(rows, { onConflict: 'learner_id,skill_id' });
    if (error) throw error;
  });

  // Wipe seed items from math pack skills and re-insert
  const mathSkillIds = MATH_SKILLS
    .map(s => skillIdByCode.get(s.code))
    .filter((x): x is string => !!x);

  await step(`wipe previous seed items (and their attempts)`, async () => {
    // Fetch seed item IDs first so we can null out FK references safely
    const { data: seedItems } = await sb.from('item')
      .select('id')
      .eq('generated_by', 'seed')
      .in('skill_id', mathSkillIds);
    const seedItemIds = (seedItems ?? []).map(r => r.id);

    if (seedItemIds.length > 0) {
      // Delete attempts referencing these items first (FK constraint)
      const { error: aErr } = await sb.from('attempt').delete().in('item_id', seedItemIds);
      if (aErr) throw aErr;

      const { error: iErr } = await sb.from('item').delete().in('id', seedItemIds);
      if (iErr) throw iErr;
    }
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

  // CountingTiles for counting.to_50 (21..45 in steps of 2 → 13 items)
  {
    const id = skillIdByCode.get('math.counting.to_50');
    if (id) {
      const emojiSet = ['🐝', '🌼', '🐛', '🐞', '🦋', '🐜', '🌱', '🍄'];
      for (let n = 21; n <= 45; n += 2) {
        const emoji = emojiSet[(n - 21) % emojiSet.length];
        items.push({
          skill_id: id,
          type: 'CountingTiles',
          content: { type: 'CountingTiles', emoji, count: n, promptText: 'How many are there?' },
          answer: { count: n },
          approved_at: now,
          generated_by: 'seed',
          difficulty_elo: 1050 + n * 5,
        });
      }
    }
  }

  // Skip-count by 2s — EquationTap with a sequence, answer is the missing number
  {
    const id = skillIdByCode.get('math.counting.skip_2s');
    if (id) {
      // sequences where one number is replaced with "?"
      const seqs: Array<[number[], number, number]> = [
        // [sequence-with-?-placeholder-as-null, answer, positionOfAnswer]
        [[2, 4, 0, 8], 6, 2],
        [[4, 6, 8, 0], 10, 3],
        [[2, 0, 6, 8], 4, 1],
        [[6, 8, 10, 0], 12, 3],
        [[0, 4, 6, 8], 2, 0],
        [[10, 12, 0, 16], 14, 2],
        [[8, 10, 12, 0], 14, 3],
        [[14, 16, 18, 0], 20, 3],
        [[2, 4, 6, 0], 8, 3],
        [[0, 8, 10, 12], 6, 0],
      ];
      for (const [seq, answer] of seqs) {
        const display = seq.map(n => (n === 0 ? '?' : n.toString())).join(', ');
        const distractors = [answer - 2, answer + 2, answer + 1].filter(n => n > 0 && n !== answer);
        const choices = [answer, ...distractors].sort(() => Math.random() - 0.5);
        items.push({
          skill_id: id,
          type: 'EquationTap',
          content: {
            type: 'EquationTap',
            equation: display,
            choices,
            promptText: 'What number is missing?',
          },
          answer: { correct: answer },
          approved_at: now,
          generated_by: 'seed',
          difficulty_elo: 1000 + answer * 2,
        });
      }
    }
  }

  // Subtract within 10 — EquationTap
  {
    const id = skillIdByCode.get('math.subtract.within_10');
    if (id) {
      const pairs: Array<[number, number]> = [];
      for (let a = 2; a <= 10; a++) for (let b = 1; b < a; b++) pairs.push([a, b]);
      for (const [a, b] of pairs.slice(0, 15)) {
        const diff = a - b;
        const distractors = [diff - 1, diff + 1, a + b].filter(n => n > 0 && n !== diff);
        const choices = [diff, ...distractors.slice(0, 3)].sort(() => Math.random() - 0.5);
        items.push({
          skill_id: id,
          type: 'EquationTap',
          content: {
            type: 'EquationTap',
            equation: `${a} − ${b} = ?`,
            choices,
            promptText: `${a} minus ${b} is?`,
          },
          answer: { correct: diff },
          approved_at: now,
          generated_by: 'seed',
          difficulty_elo: 1000 + (a - b) * 5,
        });
      }
    }
  }

  // Add within 20 (no crossing) — EquationTap, e.g., 12+3, 14+5 where units sum < 10
  {
    const id = skillIdByCode.get('math.add.within_20.no_crossing');
    if (id) {
      const pairs: Array<[number, number]> = [];
      for (let a = 11; a <= 15; a++) for (let b = 1; b <= 4; b++) {
        const ones = a % 10;
        if (ones + b < 10) pairs.push([a, b]);
      }
      for (const [a, b] of pairs) {
        const sum = a + b;
        const distractors = [sum - 1, sum + 1, sum + 10].filter(n => n > 0 && n !== sum);
        const choices = [sum, ...distractors.slice(0, 3)].sort(() => Math.random() - 0.5);
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
          difficulty_elo: 1050 + (a + b) * 3,
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
