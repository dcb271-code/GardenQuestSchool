#!/usr/bin/env tsx
/**
 * One-off content fix: replace "nonempty" with "nonslip" in the
 * dis-/mis-/non- prefix items already seeded into the database.
 *
 * The full reading seed wipes learner attempts, and SEED_ADDITIVE only
 * fills empty skills — neither can repair existing items, so this
 * patches the two affected item shapes in place:
 *   - DigraphSort rounds whose word list includes "nonempty"
 *   - the SentenceComprehension meaning question built on NONEMPTY
 *
 * Dry-run by default; pass --apply to write.
 *
 *   npx tsx scripts/fix-nonempty.ts          # show what would change
 *   npx tsx scripts/fix-nonempty.ts --apply  # write the changes
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
const apply = process.argv.includes('--apply');

const SKILL_CODE = 'reading.morphology.prefix_dis_mis_non';

// Mirrors the current seed-reading.ts content for this word.
const NONSLIP_MEANING = {
  sentence: 'Esme wore NONSLIP boots to cross the muddy garden path.',
  question: 'NONSLIP boots…',
  correct: 'keep you from slipping',
  distractors: ['make you slide faster', 'are always muddy', 'are far too big'],
};

async function main() {
  const { data: skill, error: skillErr } = await sb
    .from('skill').select('id').eq('code', SKILL_CODE).single();
  if (skillErr || !skill) throw skillErr ?? new Error(`skill ${SKILL_CODE} not found`);

  const { data: items, error: itemErr } = await sb
    .from('item').select('id, type, content, answer').eq('skill_id', skill.id);
  if (itemErr) throw itemErr;

  let touched = 0;
  for (const item of items ?? []) {
    const blob = JSON.stringify({ c: item.content, a: item.answer }).toLowerCase();
    if (!blob.includes('nonempty')) continue;

    let content = item.content;
    let answer = item.answer;

    if (item.type === 'DigraphSort') {
      content = {
        ...content,
        words: content.words.map((w: { word: string; digraph: string }) =>
          w.word === 'nonempty' ? { ...w, word: 'nonslip' } : w),
      };
      const placements = { ...answer.placements };
      if ('nonempty' in placements) {
        delete placements.nonempty;
        placements.nonslip = 'non';
      }
      answer = { ...answer, placements };
    } else if (item.type === 'SentenceComprehension') {
      content = {
        ...content,
        sentence: NONSLIP_MEANING.sentence,
        question: NONSLIP_MEANING.question,
        choices: [NONSLIP_MEANING.correct, ...NONSLIP_MEANING.distractors],
        promptText: NONSLIP_MEANING.question,
      };
      answer = { ...answer, correct: NONSLIP_MEANING.correct };
    } else {
      console.warn(`  ? unexpected item type ${item.type} (${item.id}) mentions nonempty — skipped`);
      continue;
    }

    touched++;
    if (apply) {
      const { error } = await sb.from('item').update({ content, answer }).eq('id', item.id);
      if (error) throw error;
      console.log(`  ✓ fixed ${item.type} ${item.id}`);
    } else {
      console.log(`  would fix ${item.type} ${item.id}`);
    }
  }

  console.log(apply
    ? `Done: ${touched} item(s) updated.`
    : `Dry run: ${touched} item(s) would be updated. Re-run with --apply to write.`);
}

main().catch(err => { console.error(err); process.exit(1); });
