#!/usr/bin/env tsx
/**
 * Offline sanity check for the procedural item generators — runs the
 * math builder with a fake skill-id map (NO database) and validates
 * structural invariants: every skill has items, every multiple-choice
 * item contains its correct answer exactly once, and per-skill Elo
 * ranges land where the level bands expect.
 *
 *   npx tsx scripts/verify-items.ts
 */
import { buildMathItems } from './seed-math';
import { MATH_SKILLS } from '../lib/packs/math/skills';

const idByCode = new Map(MATH_SKILLS.map(s => [s.code, s.code]));
const items = buildMathItems(c => idByCode.get(c));
const byCode = new Map<string, typeof items>();
for (const it of items) {
  if (!byCode.has(it.skill_id)) byCode.set(it.skill_id, []);
  byCode.get(it.skill_id)!.push(it);
}

console.log(`total math items: ${items.length}`);
let bad = 0;
for (const s of MATH_SKILLS) {
  const list = byCode.get(s.code) ?? [];
  if (list.length === 0) {
    bad++;
    console.log(`NO ITEMS FOR ${s.code}`);
    continue;
  }
  for (const it of list) {
    const c = it.content as any;
    const a = it.answer as any;
    const choices: unknown[] | null = c.choices ?? null;
    if (choices) {
      const key = a.correct ?? a.fraction ?? a.interval ?? a.cents ?? a.each ?? a.total;
      if (key !== undefined && !choices.includes(key)) {
        bad++;
        console.log(`MISSING ANSWER ${s.code}`, JSON.stringify({ c, a }).slice(0, 160));
      }
      if (new Set(choices.map(String)).size !== choices.length) {
        bad++;
        console.log(`DUP CHOICES ${s.code}`, choices);
      }
    }
  }
  const elos = list.map(i => i.difficulty_elo);
  console.log(
    `${s.code.padEnd(45)} n=${String(list.length).padStart(3)} elo ${Math.min(...elos)}-${Math.max(...elos)}`,
  );
}

// Eyeball samples from the newest skills
for (const code of [
  'math.order_of_operations', 'math.fractions.add_subtract_unlike',
  'math.word_problem.multi_step', 'math.divide.with_remainders',
]) {
  console.log(`\nSAMPLE ${code}`);
  for (const it of (byCode.get(code) ?? []).slice(0, 3)) {
    const c = it.content as any;
    console.log(' ', JSON.stringify({
      eq: c.equation, prompt: c.promptText, choices: c.choices,
      ans: (it.answer as any).correct, elo: it.difficulty_elo,
    }));
  }
}

console.log(`\nstructural problems: ${bad}`);
process.exit(bad > 0 ? 1 : 0);
