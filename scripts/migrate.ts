#!/usr/bin/env tsx
/**
 * Applies all SQL migrations in lib/supabase/migrations/ in alphabetical order.
 *
 * Reads DATABASE_URL from .env.local — get it from:
 *   Supabase dashboard → Settings → Database → Connection String → URI
 *   (the one that starts with postgresql://postgres:...)
 *
 * Each migration is idempotent (uses `if not exists`, `on conflict do nothing`),
 * so re-running is safe.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { config } from 'dotenv';
import postgres from 'postgres';

config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('✗ DATABASE_URL not set in .env.local');
  console.error('  Get it from Supabase: Settings → Database → Connection String → URI');
  console.error('  Example: postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres');
  process.exit(1);
}

const MIGRATIONS_DIR = join(process.cwd(), 'lib', 'supabase', 'migrations');

async function main() {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('No migration files found.');
    return;
  }

  const sql = postgres(DATABASE_URL!, { prepare: false });

  try {
    for (const file of files) {
      const path = join(MIGRATIONS_DIR, file);
      const content = readFileSync(path, 'utf8');
      process.stdout.write(`→ applying ${file} ... `);
      try {
        await sql.unsafe(content);
        console.log('✓');
      } catch (err: any) {
        console.log('✗');
        console.error(`  error in ${file}:`);
        console.error(`  ${err.message}`);
        process.exit(1);
      }
    }
    console.log(`\n✅ Applied ${files.length} migrations successfully.`);
  } finally {
    await sql.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
