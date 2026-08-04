// tests/world/seedSafety.test.ts
//
// A seed must never destroy a learner's history.
//
// `npm run db:seed`, run on the live database to pick up a new
// habitat, deleted every attempt row that pointed at a seed item:
// 1,623 of Cecily's correct answers and 338 of Esme's. Garden beds
// unlock from lifetime-correct, so every bed they had earned closed,
// and a seven-year-old opened the app to find her gardens shut.
//
// The script had a comment explaining that this would happen and an
// opt-in flag to avoid it. That is not a guard — safety that has to be
// remembered is not safety. This test reads the actual .ts files, the
// way migrationSafety.test.ts reads the .sql files, and fails on the
// patterns that caused it.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const SEEDS = ['seed-math.ts', 'seed-reading.ts'] as const;

function read(name: string): string {
  return readFileSync(join(process.cwd(), 'scripts', name), 'utf8');
}

describe('seed scripts', () => {
  it('never delete attempt rows', () => {
    // The whole bug in one line. An attempt row is a record of
    // something a child actually did; seeding content must not be able
    // to erase it. Detaching (item_id = null) is the sanctioned move —
    // lifetime-correct counts learner_id + outcome only, and queries
    // that walk attempt → item → skill already skip null-item rows.
    for (const name of SEEDS) {
      const src = read(name);
      // Plain scanning, not a multiline regex: a `\s*\n\s*` pattern
      // backtracks catastrophically over these files and once hung the
      // suite for five minutes.
      const idx = src.indexOf(".from('attempt')");
      let cursor = idx;
      while (cursor !== -1) {
        const window = src.slice(cursor, cursor + 200);
        expect(
          window.includes('.delete()'),
          `${name}: deletes attempt rows — detach with { item_id: null } instead`,
        ).toBe(false);
        cursor = src.indexOf(".from('attempt')", cursor + 1);
      }
    }
  });

  it('are additive by DEFAULT — destruction must be opted into', () => {
    // It used to be the other way round: destructive unless you
    // remembered SEED_ADDITIVE=1. Nobody remembers a flag they only
    // need on the one database that matters.
    for (const name of SEEDS) {
      const src = read(name);
      expect(
        src.includes("SEED_ADDITIVE === '1'"),
        `${name}: still gates safety behind an opt-in flag`,
      ).toBe(false);
      expect(
        src.includes('SEED_WIPE_ITEMS'),
        `${name}: no explicit opt-in flag for the destructive path`,
      ).toBe(true);
    }
  });

  it('say out loud when they are about to replace items', () => {
    for (const name of SEEDS) {
      expect(read(name), `${name}: replaces items silently`)
        .toContain('SEED_WIPE_ITEMS=1 — replacing');
    }
  });
});
