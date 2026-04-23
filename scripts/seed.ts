#!/usr/bin/env tsx
/**
 * Seed orchestrator: creates parent, learner (Cecily), subjects, strands,
 * skills, habitats, species, and delegates item generation to seed-math.ts
 * and seed-reading.ts.
 *
 * Idempotent: wipes existing seed-generated items per run before re-inserting.
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { MATH_STRANDS } from '../lib/packs/math/strands';
import { MATH_SKILLS } from '../lib/packs/math/skills';
import { seedReading } from './seed-reading';
import { seedWorld } from './seed-world';
import { seedMath } from './seed-math';

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
      id: SUBJECT_ID, code: 'math', name: 'Math', pack_version: '2.0.0',
    }, { onConflict: 'code' });
    if (error) throw error;
  });

  await step('subject (reading)', async () => {
    const { error } = await sb.from('subject').upsert({
      id: READING_SUBJECT_ID, code: 'reading', name: 'Reading', pack_version: '2.0.0',
    }, { onConflict: 'code' });
    if (error) throw error;
  });

  await step('math strands', async () => {
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

  await step(`math skills (${MATH_SKILLS.length})`, async () => {
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

  await step('world (habitats + species)', async () => {
    await seedWorld(sb);
  });

  await step('math pack items', async () => {
    await seedMath(sb, skillIdByCode);
  });

  // Refresh skill IDs in case any new skills were added during reading seed
  const { data: finalSkillRows } = await sb.from('skill').select('id, code');
  for (const r of finalSkillRows ?? []) skillIdByCode.set(r.code, r.id);

  await step('Cecily baseline mastery (Grade 2 stretch)', async () => {
    // Cecily is late 1st / early 2nd grade. Mark foundational skills mastered
    // so the planner pushes her toward Grade 2 content immediately.
    const mastered = [
      // Counting
      'math.counting.to_20',
      'math.counting.to_50',
      'math.counting.skip_2s',
      // Basic operations
      'math.add.within_10',
      'math.subtract.within_10',
      'math.number_bond.within_10',
      'math.add.within_20.no_crossing',
      // Reading — first-grade basics consolidated
      'reading.phonics.cvc_blend',
      'reading.phonics.digraphs',
      'reading.sight_words.dolch_primer',
      'reading.sight_words.dolch_first_grade',
      'reading.read_aloud.simple',
    ];
    // "Review" = she's seen them recently and they're due for revisit
    const reviewing = [
      'math.add.within_20.crossing_ten',
      'math.subtract.within_20.no_crossing',
      'reading.phonics.initial_blends',
      'reading.phonics.silent_e',
    ];
    const rows = [
      ...mastered.map(code => ({
        learner_id: CECILY_ID,
        skill_id: skillIdByCode.get(code),
        mastery_state: 'mastered',
        leitner_box: 5,
        student_elo: 1150,
        total_attempts: 12,
        total_correct: 12,
        last_attempted_at: new Date().toISOString(),
        next_review_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      })),
      ...reviewing.map(code => ({
        learner_id: CECILY_ID,
        skill_id: skillIdByCode.get(code),
        mastery_state: 'review',
        leitner_box: 3,
        student_elo: 1100,
        total_attempts: 6,
        total_correct: 5,
        last_attempted_at: new Date().toISOString(),
        next_review_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      })),
    ].filter(r => r.skill_id);
    const { error } = await sb.from('skill_progress')
      .upsert(rows, { onConflict: 'learner_id,skill_id' });
    if (error) throw error;
  });

  // Total item count for reporting
  const { count: totalItems } = await sb.from('item')
    .select('*', { count: 'exact', head: true })
    .eq('generated_by', 'seed');

  console.log(`\n✅ Seed complete. Total seed items: ${totalItems}.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
