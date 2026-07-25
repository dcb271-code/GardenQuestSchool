// tests/world/ikebanaMaterials.test.ts
import { describe, it, expect } from 'vitest';
import { ikebanaFlowers, ikebanaFlowerCodes, flowerEmoji } from '@/lib/world/ikebana';
import { PLANT_CATALOG } from '@/lib/world/plantCatalog';

describe('ikebana materials', () => {
  it('includes every flower-garden plant', () => {
    const codes = new Set(ikebanaFlowerCodes());
    for (const p of PLANT_CATALOG.filter(p => p.garden === 'flower')) {
      expect(codes.has(p.code), `${p.code} should be arrangeable`).toBe(true);
    }
  });

  it('includes the japanese-garden blooms and branches — kiku above all', () => {
    const codes = new Set(ikebanaFlowerCodes());
    for (const code of ['kiku', 'fuji', 'momiji', 'cherry', 'bamboo']) {
      expect(codes.has(code), `${code} should be arrangeable`).toBe(true);
    }
  });

  it('excludes what you cannot cut a stem from: moss and bonsai', () => {
    const codes = new Set(ikebanaFlowerCodes());
    expect(codes.has('moss')).toBe(false);
    expect(codes.has('bonsai')).toBe(false);
  });

  it('excludes every other garden — the vase is not a vegetable basket', () => {
    for (const p of ikebanaFlowers()) {
      expect(['flower', 'japanese'], `${p.code}`).toContain(p.garden);
    }
  });

  it('every arrangeable plant renders some emoji', () => {
    // Note: a few flowers (coneflower, milkweed) are deliberately
    // mapped to the same 🌸 the fallback uses, so we can't assert
    // "not the fallback" here — only that nothing renders blank.
    for (const p of ikebanaFlowers()) {
      expect(flowerEmoji(p.code).length, p.code).toBeGreaterThan(0);
    }
  });

  it('the japanese additions each got a distinct emoji, not the 🌸 default', () => {
    expect(flowerEmoji('kiku')).toBe('🏵️');
    expect(flowerEmoji('fuji')).toBe('💜');
    expect(flowerEmoji('momiji')).toBe('🍁');
    expect(flowerEmoji('bamboo')).toBe('🎋');
  });
});
