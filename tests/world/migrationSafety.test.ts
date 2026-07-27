// tests/world/migrationSafety.test.ts
//
// scripts/migrate.ts has no tracking table: it re-applies every
// migration on every run, forever. Everyone remembers that means
// "make the schema changes idempotent". What was forgotten for months
// is that it also means a migration must never write a learner's own
// state.
//
// `update learner set grade_level = 2 where id = '1111...'` sat in
// 008 and reset Cecily from Level 3 to Level 2 — and flipped her
// difficulty setting — on every single migrate run. She was promoted
// in July and kept silently reverting. Nothing failed; the migration
// reported success every time, because it WAS succeeding.
//
// These tests read the actual .sql files and refuse to let it happen
// again.

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join(process.cwd(), 'lib', 'supabase', 'migrations');

/** Tables holding a learner's own progress or preferences. */
const LEARNER_STATE = [
  'learner', 'world_state', 'skill_progress', 'attempt',
  'journal_entry', 'habitat', 'companion', 'garden_plot',
];

/**
 * Something that makes a write stop matching once it has run — so a
 * re-run is a no-op rather than a reset.
 */
const GUARDS = [/\bis\s+null\b/i, /\bcoalesce\s*\(/i, /\bnot\s*\(/i, /\bon conflict\b/i];

function sqlFiles(): Array<{ name: string; body: string }> {
  return readdirSync(DIR)
    .filter(f => f.endsWith('.sql'))
    .sort()
    .map(name => ({ name, body: readFileSync(join(DIR, name), 'utf8') }));
}

/** Strip comments so a cautionary note about old SQL isn't read as SQL. */
function stripComments(sql: string): string {
  return sql.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
}

function statements(sql: string): string[] {
  return stripComments(sql).split(';').map(s => s.trim()).filter(Boolean);
}

describe('migration safety', () => {
  it('finds the migration files', () => {
    expect(sqlFiles().length).toBeGreaterThan(15);
  });

  it('never writes learner state without a guard that makes a re-run a no-op', () => {
    const offences: string[] = [];
    for (const { name, body } of sqlFiles()) {
      for (const stmt of statements(body)) {
        const m = /^update\s+([a-z_]+)/i.exec(stmt);
        if (!m) continue;
        const table = m[1].toLowerCase();
        if (!LEARNER_STATE.includes(table)) continue;
        if (GUARDS.some(g => g.test(stmt))) continue;
        offences.push(`${name}: unguarded "update ${table}" — ${stmt.slice(0, 90)}…`);
      }
    }
    expect(offences, offences.join('\n')).toEqual([]);
  });

  it('never deletes learner state at all', () => {
    const offences: string[] = [];
    for (const { name, body } of sqlFiles()) {
      for (const stmt of statements(body)) {
        const m = /^delete\s+from\s+([a-z_]+)/i.exec(stmt);
        if (!m) continue;
        if (!LEARNER_STATE.includes(m[1].toLowerCase())) continue;
        offences.push(`${name}: "${stmt.slice(0, 90)}…"`);
      }
    }
    expect(offences, offences.join('\n')).toEqual([]);
  });

  it('no migration hardcodes a specific learner id', () => {
    // The seeded ids are fine in scripts/seed.ts, which bootstraps a
    // fresh database once. In a migration — which re-runs forever —
    // a hardcoded learner id means writing over a real child's data.
    const offences: string[] = [];
    for (const { name, body } of sqlFiles()) {
      const clean = stripComments(body);
      const ids = clean.match(/'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'/gi) ?? [];
      for (const id of ids) {
        if (/^'0{8}-/.test(id)) continue;          // all-zero sentinel is fine
        offences.push(`${name}: hardcoded id ${id}`);
      }
    }
    expect(offences, offences.join('\n')).toEqual([]);
  });

  it('grade_level is only ever written as a backfill of nulls', () => {
    // The legitimate use — `set grade_level = 2 where grade_level is
    // null` — gives a fresh database a default and then never matches
    // again. The bug was the same assignment with no guard, which
    // matched a real, promoted child every single run.
    const offences: string[] = [];
    for (const { name, body } of sqlFiles()) {
      for (const stmt of statements(body)) {
        if (!/^update\s+learner\b/i.test(stmt)) continue;
        if (!/\bgrade_level\s*=/i.test(stmt)) continue;
        if (/\bgrade_level\s+is\s+null\b/i.test(stmt)) continue;   // the backfill
        offences.push(`${name}: writes grade_level without a null guard — ${stmt.slice(0, 90)}…`);
      }
    }
    expect(offences, offences.join('\n')).toEqual([]);
  });
});
