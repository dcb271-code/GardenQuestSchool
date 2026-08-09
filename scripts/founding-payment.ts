#!/usr/bin/env tsx
/**
 * The cavern settles up.
 *
 * The mastery award fires on a state TRANSITION, so every skill a
 * learner mastered before that award existed paid nothing. Cecily had
 * 65 of them. She has one penny, and the shop is about to open.
 *
 * This pays a founding five stones — not sixty-five, which would be a
 * flood and would devalue every stone she earns afterwards. Five is
 * roughly 140 pennies: a bench and a treat on the first day, which is
 * enough for the shop to feel real.
 *
 * SAFE BY CONSTRUCTION:
 *   * dry run unless --apply
 *   * writes ONE key, garden.cavern; everything else is copied through
 *   * idempotent — records a marker and refuses to pay twice
 *   * touches no attempt, session or skill_progress row
 *
 * Usage:  npx tsx scripts/founding-payment.ts --learner Cecily [--apply]
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { createServiceClient } from '@/lib/supabase/server';
import { emptyCavern, stoneForMastery, type CavernState } from '@/lib/world/cavern';
import { getGem } from '@/lib/world/gemCatalog';

const STONES = 5;
const MARKER = '__founding_payment__';

async function main() {
  const apply = process.argv.includes('--apply');
  const nameArg = process.argv.indexOf('--learner');
  const name = nameArg > -1 ? process.argv[nameArg + 1] : null;
  if (!name) { console.error('need --learner <first name>'); process.exit(1); }

  const db = createServiceClient();
  const { data: learner } = await db
    .from('learner').select('id, first_name').eq('first_name', name).maybeSingle();
  if (!learner) { console.error(`no learner called ${name}`); process.exit(1); }

  const { data: row } = await db
    .from('world_state').select('garden').eq('learner_id', learner.id).maybeSingle();
  const garden = { ...((row?.garden as Record<string, unknown>) ?? {}) };
  const cavern: CavernState = { ...emptyCavern(), ...((garden.cavern as CavernState) ?? {}) };

  if ((cavern.masteryPaid ?? []).includes(MARKER)) {
    console.log(`${learner.first_name} has already had the founding payment. Nothing to do.`);
    return;
  }

  // Deterministic spread, and deliberately all BELOW the case-shelf
  // threshold so every founding stone is local seam rock.
  //
  // The first draft spread across the whole range and the last roll
  // came out an emerald — a hundred and fifty thousand pennies, which
  // is a Great Work handed over as a welcome gift. This is back-pay for
  // work already done, not a prize, and it should buy a bench.
  const rolls = [0.06, 0.22, 0.38, 0.54, 0.68];
  const stones = rolls.slice(0, STONES).map(r => stoneForMastery(r).code);

  cavern.pending = [...(cavern.pending ?? []), ...stones];
  cavern.masteryPaid = [...(cavern.masteryPaid ?? []), MARKER];
  garden.cavern = cavern;

  console.log(`${learner.first_name}: paying ${STONES} founding stones`);
  for (const c of stones) {
    const g = getGem(c);
    console.log(`   ${g?.name.padEnd(18)} worth ${g?.valuePerGram}p`);
  }
  const total = stones.reduce((s, c) => s + (getGem(c)?.valuePerGram ?? 0), 0);
  console.log(`   total if all sold: ${total}p`);
  console.log(`   they arrive as PENDING — she still chooses keep or sell.`);

  if (!apply) { console.log('\n(dry run — pass --apply)'); return; }
  const { error } = await db.from('world_state').upsert(
    { learner_id: learner.id, garden, last_updated_at: new Date().toISOString() },
    { onConflict: 'learner_id' },
  );
  console.log(error ? `ERROR ${error.message}` : '\n✓ applied');
}
main();
