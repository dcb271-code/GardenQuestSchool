#!/usr/bin/env tsx
/**
 * Diagnostic: print the Elo distribution of items for a given skill
 * and what would be in-band for the default learner.
 *
 *   npx tsx scripts/diagnose-skill.ts math.subtract.within_10
 *   npx tsx scripts/diagnose-skill.ts reading.sight_words.dolch_primer
 *
 * Defaults to math.subtract.within_10 if no arg.
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_ROLE);
const CECILY_ID = '11111111-1111-1111-1111-111111111111';

const skillCode = process.argv[2] ?? 'math.subtract.within_10';

async function main() {
  const { data: skill } = await sb.from('skill').select('id, code, name').eq('code', skillCode).single();
  if (!skill) {
    console.error(`✗ skill not found: ${skillCode}`);
    process.exit(1);
  }

  const { data: items } = await sb.from('item')
    .select('id, content, difficulty_elo, usage_count')
    .eq('skill_id', skill.id)
    .not('approved_at', 'is', null);

  if (!items || items.length === 0) {
    console.log(`(no items for ${skillCode})`);
    return;
  }

  const sorted = items.slice().sort((a, b) => a.difficulty_elo - b.difficulty_elo);

  const labelFor = (it: any): string => {
    const c = it.content ?? {};
    return c.equation ?? (typeof c.count === 'number' ? `count ${c.count}` : (c.word ?? '(?)'));
  };

  console.log(`\n${skill.name}  [${skillCode}]\n`);
  console.log(`  ${items.length} items, Elo ${sorted[0].difficulty_elo} … ${sorted[sorted.length-1].difficulty_elo}`);

  const buckets = {
    'easier-only (<1000)':  sorted.filter(i => i.difficulty_elo < 1000),
    'normal-band (1000–1300)': sorted.filter(i => i.difficulty_elo >= 1000 && i.difficulty_elo < 1300),
    'harder-band (≥1300)':  sorted.filter(i => i.difficulty_elo >= 1300),
  };
  for (const [label, list] of Object.entries(buckets)) {
    console.log(`    ${label}: ${list.length}`);
  }

  // Cecily's stored Elo for this skill
  const { data: prog } = await sb.from('skill_progress')
    .select('student_elo, total_attempts, total_correct, mastery_state')
    .eq('learner_id', CECILY_ID).eq('skill_id', skill.id).maybeSingle();
  const stored = prog?.student_elo ?? 1000;
  console.log(`\n  Cecily's stored student_elo: ${stored}  (attempts ${prog?.total_attempts ?? 0}, mastery ${prog?.mastery_state ?? 'new'})`);

  for (const [level, offset] of Object.entries({ easier: -150, normal: 150, harder: 300 })) {
    const eff = stored + offset;
    const min = eff - 150, max = eff + 200;
    const inBand = sorted.filter(i => i.difficulty_elo >= min && i.difficulty_elo <= max);
    console.log(`  At "${level}" (offset ${offset >= 0 ? '+' : ''}${offset}): effective ${eff}, band ${min}..${max}, ${inBand.length} items in band`);
    if (inBand.length > 0 && inBand.length <= 8) {
      for (const it of inBand) console.log(`      Elo ${it.difficulty_elo} usage ${it.usage_count}  →  ${labelFor(it)}`);
    } else if (inBand.length > 0) {
      console.log(`      lowest:  Elo ${inBand[0].difficulty_elo}  →  ${labelFor(inBand[0])}`);
      console.log(`      highest: Elo ${inBand[inBand.length-1].difficulty_elo}  →  ${labelFor(inBand[inBand.length-1])}`);
    }
  }
}

main().catch(err => {
  console.error('✗ failed:', err);
  process.exit(1);
});
