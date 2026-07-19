import { describe, it, expect } from 'vitest';
import { confusability, pickNearMissDistractors, decoyPhonemes } from '@/lib/packs/reading/distractors';

const rng = (seed = 7) => {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0x100000000; };
};

describe('near-miss distractors', () => {
  it('ranks confusable words above unrelated ones', () => {
    expect(confusability('through', 'thought')).toBeGreaterThan(confusability('through', 'cat'));
    expect(confusability('where', 'were')).toBeGreaterThan(confusability('where', 'jump'));
    expect(confusability('there', 'three')).toBeGreaterThan(confusability('there', 'blue'));
  });

  it('never selects the target itself, case-insensitively', () => {
    const picks = pickNearMissDistractors('The', ['the', 'they', 'then', 'them', 'this'], 3, rng());
    expect(picks.map(w => w.toLowerCase())).not.toContain('the');
    expect(picks.length).toBe(3);
  });

  it('prefers the confusable band of a mixed pool', () => {
    const pool = ['thought', 'though', 'three', 'cat', 'dog', 'sun', 'blue', 'jump', 'red'];
    const picks = pickNearMissDistractors('through', pool, 3, rng());
    const confusable = new Set(['thought', 'though', 'three']);
    const hits = picks.filter(w => confusable.has(w)).length;
    expect(hits).toBeGreaterThanOrEqual(2);
  });

  it('backfills when the pool is small', () => {
    expect(pickNearMissDistractors('was', ['saw', 'is'], 3, rng()).length).toBe(2);
  });

  it('decoy phonemes never duplicate the word\'s own chunks', () => {
    const decoys = decoyPhonemes(['bl', 'o', 'b'], 3);
    expect(decoys.length).toBeGreaterThan(0);
    for (const d of decoys) {
      expect(['bl', 'o', 'b']).not.toContain(d);
    }
    // Deterministic
    expect(decoyPhonemes(['bl', 'o', 'b'], 3)).toEqual(decoys);
  });
});
