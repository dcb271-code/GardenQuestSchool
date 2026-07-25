// tests/world/speciesArt.test.tsx
import { describe, it, expect } from 'vitest';
import { SpeciesIllustration } from '@/components/child/garden/speciesIllustrations';
import { SPECIES_CATALOG } from '@/lib/world/speciesCatalog';

describe('species illustrations', () => {
  it('every species in the catalog has hand-drawn art (no emoji fallback)', () => {
    for (const s of SPECIES_CATALOG) {
      expect(
        SpeciesIllustration({ code: s.code, size: 60 }),
        `${s.code} has no illustration — it will fall back to the ${s.emoji} emoji`,
      ).not.toBeNull();
    }
  });

  it('the rare visitors are drawn, so they never share an icon with a common species', () => {
    for (const code of ['painted_turtle', 'spotted_salamander', 'luna_moth']) {
      expect(SpeciesIllustration({ code, size: 60 }), code).not.toBeNull();
    }
  });

  it('returns null for an unknown code so callers can still fall back', () => {
    expect(SpeciesIllustration({ code: 'not_a_species', size: 60 })).toBeNull();
  });
});
