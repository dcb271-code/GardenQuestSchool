#!/usr/bin/env tsx
/**
 * Move a child to Level 0 without destroying anything.
 *
 *   npm run rebaseline-level0 -- Esme            # dry run: prints the plan
 *   npm run rebaseline-level0 -- Esme --apply    # does it
 *
 * Why this exists: a child's skill_progress can be someone else's
 * work. Esme's showed silent-e, compound words and multiplication
 * arrays at four years old — her sister's answers — and the planner
 * believed it, so it served her two-digit comparison she failed for
 * a month. The plan itself is lib/learner/rebaseline.ts (pure,
 * tested); this file only reads, prints, and — with --apply — writes.
 *
 * What it does:
 *   - learner.grade_level → 0
 *   - every skill_progress row in `mastered` or `review` → `new`,
 *     with a state_transitions entry carrying the reason
 *
 * What it never does: delete an attempt, a session, a painting, a
 * letter, or an Elo. scripts/seed.ts once deleted 1,623 of Cecily's
 * correct answers; this script deletes nothing, by construction — it
 * only ever issues UPDATEs, and only to two columns.
 *
 * Runs once per child: a second run finds the reason in a transition
 * log and refuses. Needs migration 022 applied first (the level
 * constraint); without it the learner update fails and says so.
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { planRebaseline, REBASELINE_REASON, type ProgressRowLike } from '../lib/learner/rebaseline';

config({ path: '.env.local' });

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const firstName = args.find(a => !a.startsWith('--'));
  if (!firstName) {
    console.error('Usage: npm run rebaseline-level0 -- <FirstName> [--apply]');
    process.exit(1);
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }
  const db = createClient(url, key, { auth: { persistSession: false } });

  const { data: learner, error: le } = await db
    .from('learner').select('id, first_name, grade_level').eq('first_name', firstName).maybeSingle();
  if (le) { console.error(`! ${le.message}`); process.exit(1); }
  if (!learner) { console.error(`no learner called ${firstName}`); process.exit(1); }

  const { data: rows, error: pe } = await db
    .from('skill_progress')
    .select('skill_id, mastery_state, state_transitions')
    .eq('learner_id', learner.id);
  if (pe) { console.error(`! ${pe.message}`); process.exit(1); }

  const { data: skills, error: se } = await db.from('skill').select('id, code');
  if (se) { console.error(`! ${se.message}`); process.exit(1); }
  const codeOf = new Map((skills ?? []).map(s => [String(s.id), String(s.code)]));

  const { alreadyDone, changes } = planRebaseline((rows ?? []) as ProgressRowLike[], new Date().toISOString());
  if (alreadyDone) {
    console.error(`! ${learner.first_name} was already rebaselined (found "${REBASELINE_REASON}" in a transition log). Refusing.`);
    process.exit(1);
  }

  console.log(`${learner.first_name}: Level ${learner.grade_level} → Level 0`);
  console.log(`${changes.length} skill_progress row(s) → new:`);
  for (const c of changes) console.log(`  ${codeOf.get(c.skill_id) ?? c.skill_id}  (${c.from})`);
  console.log(`untouched: ${(rows ?? []).length - changes.length} row(s) already new/learning; every attempt, session and painting.`);

  if (!apply) {
    console.log('\nDry run. Add --apply to do it.');
    return;
  }

  const { error: ue } = await db.from('learner').update({ grade_level: 0 }).eq('id', learner.id);
  if (ue) {
    console.error(`! could not set Level 0: ${ue.message}`);
    console.error('  If this mentions learner_grade_level_chk, run npm run db:migrate first (022_level_zero.sql).');
    process.exit(1);
  }
  for (const c of changes) {
    const { error } = await db
      .from('skill_progress')
      .update({ mastery_state: 'new', state_transitions: c.state_transitions })
      .eq('learner_id', learner.id)
      .eq('skill_id', c.skill_id);
    if (error) { console.error(`! ${codeOf.get(c.skill_id)}: ${error.message}`); process.exit(1); }
  }
  console.log(`\n✓ ${learner.first_name} is at Level 0. ${changes.length} row(s) reset; nothing deleted.`);
}

main().catch(e => { console.error(e); process.exit(1); });
