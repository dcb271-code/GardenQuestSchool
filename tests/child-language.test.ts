import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Enforce the pedagogy's language rules (spec §4):
 * child-facing UI must not contain coin economy, praise-as-control, or streak language.
 *
 * Scans files under:
 *   app/(child)/**
 *   components/child/**
 *   lib/packs/**\/rendering/*.tsx
 */
// The intent of this rule is to forbid GAMIFIED coin/currency
// economies (Khan-Academy/Duolingo-style "earn coins, spend in shop"
// loops), NOT to ban the literal English word "coin" — Grade-2 math
// (CCSS 2.MD.C.8) explicitly teaches counting pennies/nickels/dimes/
// quarters as "coins". So instead of `\bcoins?\b`, match phrases
// that read like virtual-currency UI ("earn coins", "your coin
// balance", "coin store", etc.).
const FORBIDDEN_PATTERNS: Array<RegExp> = [
  /\b(earn|earned|spend|spent|win|won|collect|collected)\s+(\d+\s+)?coins?\b/i,
  /\b(your|the)\s+coins?\s+(balance|total|count|wallet)\b/i,
  /\bcoin\s+(store|shop|economy|wallet|balance|reward)\b/i,
  /\bcurrency\b/i,
  /daily\s*streak/i,
  /\bgood\s*job\b/i,
  /\bgreat\s*job\b/i,
  /level\s*up/i,
];

const ROOTS = [
  'app/(child)',
  'components/child',
];

function collectFiles(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try { entries = readdirSync(dir); } catch { return out; }
  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      collectFiles(full, out);
    } else if (/\.(tsx?|jsx?)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

function collectRenderers(baseDir: string, out: string[] = []): string[] {
  let entries: string[];
  try { entries = readdirSync(baseDir); } catch { return out; }
  for (const entry of entries) {
    const full = join(baseDir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === 'rendering') {
        collectFiles(full, out);
      } else {
        collectRenderers(full, out);
      }
    }
  }
  return out;
}

describe('child UI language hygiene', () => {
  const cwd = process.cwd();
  const childFiles: string[] = [];
  for (const root of ROOTS) collectFiles(join(cwd, root), childFiles);
  collectRenderers(join(cwd, 'lib/packs'), childFiles);

  it('collects child-facing source files', () => {
    expect(childFiles.length).toBeGreaterThan(0);
  });

  for (const f of childFiles) {
    it(`${f.replace(cwd, '')} avoids coins / currency / streak / "good job" / "level up"`, () => {
      const content = readFileSync(f, 'utf8');
      for (const pattern of FORBIDDEN_PATTERNS) {
        const match = content.match(pattern);
        if (match) {
          throw new Error(
            `"${match[0]}" found in ${f.replace(cwd, '')} — child UI must not use coin economy, ` +
            `praise-as-control, or streak language (spec §4).`
          );
        }
      }
    });
  }
});
