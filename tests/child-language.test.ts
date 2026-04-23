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
const FORBIDDEN_PATTERNS = [
  /\bcoins?\b/i,
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
