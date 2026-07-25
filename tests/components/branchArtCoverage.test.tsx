// tests/components/branchArtCoverage.test.tsx
//
// Every stop on Math Mountain and in Reading Forest must resolve to
// hand-drawn art. Each scene renders a structure through a three-step
// chain, and a stop is only "drawn" if one of them answers:
//
//   1. drawBespoke(code)          — art written inline in the scene
//   2. StructureIllustration(...) — via the scene's ILLUSTRATION_ALIAS,
//                                   which points branch codes at the
//                                   central garden's illustrations
//   3. MarkerIcon(code)           — the bespoke L4/L5 icon set
//
// ...and only THEN does it fall back to the structure's themeEmoji.
//
// This test exists because that chain is easy to misjudge: checking
// StructureIllustration alone against a raw structure code reports
// ~90 stops as missing art when in fact every one of them is drawn.
// Steps 1 and 2 live inside the scene components, so we read them out
// of the source rather than importing them — brittle to a rename, but
// a rename that breaks this test is exactly what should be caught.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { StructureIllustration } from '@/components/child/garden/illustrations';
import { hasMarkerIcon } from '@/components/child/garden/markerIcons';
import { MATH_MOUNTAIN_STRUCTURES, READING_FOREST_STRUCTURES } from '@/lib/world/branchMaps';

const MOUNTAIN_SCENE = 'app/(child)/garden/math-mountain/MathMountainScene.tsx';
const FOREST_SCENE = 'app/(child)/garden/reading-forest/ReadingForestScene.tsx';

function resolversFor(scenePath: string) {
  const src = readFileSync(scenePath, 'utf8');

  const aliasBlock = src.match(/ILLUSTRATION_ALIAS[^=]*=\s*\{([\s\S]*?)\n\};/);
  const alias = new Map<string, string>();
  if (aliasBlock) {
    let m: RegExpExecArray | null;
    const aliasRe = /([a-z0-9_]+):\s*'([a-z0-9_]+)'/g;
    while ((m = aliasRe.exec(aliasBlock[1])) !== null) alias.set(m[1], m[2]);
  }

  const bespokeBlock = src.match(/const drawBespoke[^\n]*\n([\s\S]*?)\n\s*\};/);
  const bespoke = new Set<string>();
  if (bespokeBlock) {
    let m: RegExpExecArray | null;
    const bespokeRe = /code === '([a-z0-9_]+)'/g;
    while ((m = bespokeRe.exec(bespokeBlock[1])) !== null) bespoke.add(m[1]);
  }

  return { alias, bespoke };
}

function undrawn(structures: readonly any[], scenePath: string) {
  const { alias, bespoke } = resolversFor(scenePath);
  return structures.filter(s => {
    if (bespoke.has(s.code)) return false;
    const code = alias.get(s.code) ?? s.code;
    if (StructureIllustration({ code, x: 0, y: 0, size: 38 }) != null) return false;
    if (hasMarkerIcon(s.code)) return false;
    return true;
  });
}

describe('branch map art coverage', () => {
  it('every Math Mountain stop is drawn, not an emoji', () => {
    const missing = undrawn(MATH_MOUNTAIN_STRUCTURES, MOUNTAIN_SCENE);
    expect(
      missing.map(s => `${s.code} (${s.label}) would render as ${s.themeEmoji}`),
    ).toEqual([]);
  });

  it('every Reading Forest stop is drawn, not an emoji', () => {
    const missing = undrawn(READING_FOREST_STRUCTURES, FOREST_SCENE);
    expect(
      missing.map(s => `${s.code} (${s.label}) would render as ${s.themeEmoji}`),
    ).toEqual([]);
  });

  it('the resolvers are actually found in the scenes (guards a rename)', () => {
    // If a refactor renames ILLUSTRATION_ALIAS or drawBespoke, the two
    // tests above would silently pass by finding nothing to check.
    const mountain = resolversFor(MOUNTAIN_SCENE);
    expect(mountain.alias.size).toBeGreaterThan(0);
    expect(mountain.bespoke.size).toBeGreaterThan(0);
    expect(resolversFor(FOREST_SCENE).alias.size).toBeGreaterThan(0);
  });
});
