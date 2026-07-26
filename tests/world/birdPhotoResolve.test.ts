// tests/world/birdPhotoResolve.test.ts
import { describe, it, expect } from 'vitest';
import {
  resolvePhoto, hasPhoto, birdsWithPhotos, ROLE_FALLBACK,
  type PhotoIndex, type ResolvedPhoto,
} from '@/lib/birds/photoResolve';
import type { BirdPhotoRole } from '@/lib/birds/curriculum';

const photo = (id: string, tier = 1): ResolvedPhoto => ({
  url: `https://example.test/${id}.jpg`,
  alt: id,
  tier,
  attribution: { photographer: 'A Photographer', licenseCode: 'cc-by', sourceUrl: 'https://x.test' },
});

const INDEX: PhotoIndex = {
  northern_cardinal: { male: [photo('m1'), photo('m2')], female: [photo('f1')] },
  carolina_wren: { perched: [photo('w1'), photo('w2', 2)] },
  american_goldfinch: { male: [photo('g-summer')], nonbreeding: [photo('g-winter')] },
  no_photos_yet: {},
};

describe('resolvePhoto', () => {
  it('returns the asked-for role when it exists', () => {
    expect(resolvePhoto(INDEX, 'carolina_wren', 'perched')!.alt).toMatch(/^w/);
  });

  it('falls back to the male when a dimorphic bird has no perched shot', () => {
    // A male cardinal IS a perched cardinal. Showing it beats showing
    // nothing on a "which bird is this?" question.
    const got = resolvePhoto(INDEX, 'northern_cardinal', 'perched');
    expect(got).not.toBeNull();
    expect(got!.alt).toMatch(/^m/);
  });

  it('falls back to the female rather than giving up', () => {
    const onlyFemale: PhotoIndex = { x: { female: [photo('f')] } };
    expect(resolvePhoto(onlyFemale, 'x', 'perched')!.alt).toBe('f');
  });

  it('returns null for a bird with no curated photos', () => {
    expect(resolvePhoto(INDEX, 'no_photos_yet', 'perched')).toBeNull();
    expect(resolvePhoto(INDEX, 'never_heard_of_it', 'perched')).toBeNull();
  });

  it('never answers a silhouette question with a colour photograph', () => {
    // The whole shape-before-colour sequence depends on this. A
    // full-colour fallback would silently turn the hardest exercise
    // into the easiest one.
    expect(resolvePhoto(INDEX, 'northern_cardinal', 'silhouette')).toBeNull();
    expect(ROLE_FALLBACK.silhouette).toEqual(['silhouette']);
  });

  it('prefers the clearest tier', () => {
    // w2 is tier 2 — the tier-1 photo must win regardless of seed.
    for (let seed = 0; seed < 8; seed++) {
      expect(resolvePhoto(INDEX, 'carolina_wren', 'perched', seed)!.alt).toBe('w1');
    }
  });

  it('varies between equally good photos so she learns the bird, not the picture', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 8; seed++) {
      seen.add(resolvePhoto(INDEX, 'northern_cardinal', 'male', seed)!.alt);
    }
    expect(seen.size).toBe(2);
  });

  it('is stable for a given seed', () => {
    const a = resolvePhoto(INDEX, 'northern_cardinal', 'male', 3);
    const b = resolvePhoto(INDEX, 'northern_cardinal', 'male', 3);
    expect(a).toEqual(b);
  });

  it('handles a negative seed without crashing', () => {
    expect(resolvePhoto(INDEX, 'northern_cardinal', 'male', -5)).not.toBeNull();
  });

  it('keeps the goldfinch coats apart', () => {
    // Summer gold and winter olive are the lesson. If these collapsed
    // into each other the "same bird, different coat" page would show
    // the same picture twice.
    const summer = resolvePhoto(INDEX, 'american_goldfinch', 'male')!;
    const winter = resolvePhoto(INDEX, 'american_goldfinch', 'nonbreeding')!;
    expect(summer.alt).toBe('g-summer');
    expect(winter.alt).toBe('g-winter');
    expect(summer.url).not.toBe(winter.url);
  });

  it('every role has a fallback chain that starts with itself', () => {
    for (const [role, chain] of Object.entries(ROLE_FALLBACK)) {
      expect(chain[0], role).toBe(role);
      expect(new Set(chain).size, `${role} repeats a role`).toBe(chain.length);
    }
  });

  it('every fallback target is a real role', () => {
    const roles = new Set(Object.keys(ROLE_FALLBACK) as BirdPhotoRole[]);
    for (const [role, chain] of Object.entries(ROLE_FALLBACK)) {
      for (const target of chain) {
        expect(roles.has(target), `${role} → ${target}`).toBe(true);
      }
    }
  });

  it('reports which birds are ready to show', () => {
    expect(hasPhoto(INDEX, 'carolina_wren', 'perched')).toBe(true);
    expect(hasPhoto(INDEX, 'no_photos_yet', 'perched')).toBe(false);
    expect(birdsWithPhotos(INDEX).sort())
      .toEqual(['american_goldfinch', 'carolina_wren', 'northern_cardinal']);
  });
});
