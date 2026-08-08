import { describe, it, expect } from 'vitest';
import { HABIT_BY_CODE } from '@/components/child/garden/GemSpecimen';
import { GEM_CATALOG } from '@/lib/world/gemCatalog';

describe('gem specimen drawings', () => {
  it('every gem in the catalog has a crystal habit to draw', () => {
    for (const gem of GEM_CATALOG) {
      expect(HABIT_BY_CODE[gem.code], `${gem.code} has no habit — it would draw as a cube`)
        .toBeDefined();
    }
  });

  it('maps no codes that are not in the catalog', () => {
    const codes = new Set(GEM_CATALOG.map(g => g.code));
    for (const code of Object.keys(HABIT_BY_CODE)) {
      expect(codes.has(code), `${code} is drawn but not in the catalog`).toBe(true);
    }
  });

  // The drawing must not contradict the words on the label beside it.
  it('agrees with the crystalShape prose in the catalog', () => {
    const EXPECT_IN_PROSE: Record<string, string> = {
      cube: 'cube',
      rhombohedron: 'rhombohedron',
      'hex-prism-pointed': 'hexagonal prism',
      'hex-prism-flat': 'hexagonal prism',
      octahedron: 'octahedron',
      'rhombic-dodecahedron': 'rhombic dodecahedron',
    };
    for (const gem of GEM_CATALOG) {
      const needle = EXPECT_IN_PROSE[HABIT_BY_CODE[gem.code]];
      if (!needle) continue; // banded/geode/lump/sphere have no formal habit
      expect(gem.crystalShape.toLowerCase(), `${gem.code}`).toContain(needle);
    }
  });

  it('only quartz gets the pointed termination', () => {
    const pointed = Object.entries(HABIT_BY_CODE)
      .filter(([, h]) => h === 'hex-prism-pointed').map(([c]) => c);
    expect(pointed).toEqual(['quartz']);
  });
});
