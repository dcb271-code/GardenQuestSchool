import { describe, it, expect } from 'vitest';
import {
  CROW_SCENES, CROW_ALPHABET, sceneForFact, getScene,
} from '@/lib/packs/math/crowScenes';

/**
 * The derivability rule, pinned. The scenes are approved owner
 * content; these tests keep them arithmetically honest and guard the
 * design rules from the spec.
 */

const PRODUCT_WORDS: Record<number, string> = {
  36: 'thirty-six', 42: 'forty-two', 48: 'forty-eight',
  49: 'forty-nine', 56: 'fifty-six', 64: 'sixty-four',
};

describe('the six scenes', () => {
  it('cover exactly the 6–8 upper square, canonically ordered', () => {
    const keys = CROW_SCENES.map(s => `${s.a}x${s.b}`).sort();
    expect(keys).toEqual(['6x6', '6x7', '6x8', '7x7', '7x8', '8x8']);
    for (const s of CROW_SCENES) expect(s.a).toBeLessThanOrEqual(s.b);
  });

  it('every product is the real product', () => {
    for (const s of CROW_SCENES) expect(s.product).toBe(s.a * s.b);
  });

  it('every rhyme speaks its own answer, in words', () => {
    for (const s of CROW_SCENES) {
      expect(s.rhyme.toLowerCase()).toContain(PRODUCT_WORDS[s.product]);
    }
  });

  it('the answer in words is the LAST number named — the ones digit rides the rhyme', () => {
    for (const s of CROW_SCENES) {
      const words = Object.values(PRODUCT_WORDS);
      const positions = words
        .map(w => s.rhyme.toLowerCase().lastIndexOf(w))
        .filter(i => i >= 0);
      const answerPos = s.rhyme.toLowerCase().lastIndexOf(PRODUCT_WORDS[s.product]);
      expect(Math.max(...positions)).toBe(answerPos);
    }
  });

  it('every scene has a derivation — the fallback into thinking', () => {
    for (const s of CROW_SCENES) {
      expect(s.derivation.length).toBeGreaterThan(40);
    }
  });

  it('the fence carries its once-only warning, and only the fence', () => {
    for (const s of CROW_SCENES) {
      if (s.code === 'famous_fence') {
        expect(s.caution).toBeDefined();
        expect(s.caution!.toLowerCase()).toContain('exactly once');
      } else {
        expect(s.caution).toBeUndefined();
      }
    }
  });
});

describe('commutativity', () => {
  it('8×7 summons the same scene as 7×8', () => {
    expect(sceneForFact(8, 7)).toBe(sceneForFact(7, 8));
    expect(sceneForFact(8, 6)?.code).toBe('honeycomb');
  });

  it('facts outside the stubborn six have no scene — Pip covers them', () => {
    expect(sceneForFact(3, 4)).toBeUndefined();
    expect(sceneForFact(6, 9)).toBeUndefined(); // nines are the finger trick
    expect(sceneForFact(9, 9)).toBeUndefined();
  });
});

describe('the alphabet', () => {
  it('is exactly 6, 7, 8, 9 — the digits of the hard corner', () => {
    expect(CROW_ALPHABET.map(c => c.digit)).toEqual([6, 7, 8, 9]);
  });

  it('getScene finds real scenes and rejects nonsense', () => {
    expect(getScene('star_quilt')?.product).toBe(49);
    expect(getScene('tortured_feelers')).toBeUndefined();
  });
});
