import { describe, it, expect } from 'vitest';
import { computeInterestTagDecay } from '@/lib/engine/interestMixer';

const d = (iso: string) => new Date(iso);

describe('computeInterestTagDecay', () => {
  it('returns full weight when no sessions have started since the signal', () => {
    const out = computeInterestTagDecay(
      [{ tag: 'frogs', weight: 1, createdAt: d('2026-06-10T10:00:00Z') }],
      [d('2026-06-09T10:00:00Z')], // session BEFORE the signal — no decay
    );
    expect(out).toEqual([{ tag: 'frogs', weight: 1 }]);
  });

  it('decays 0.6x per session started after the signal', () => {
    const out = computeInterestTagDecay(
      [{ tag: 'bees', weight: 1, createdAt: d('2026-06-01T00:00:00Z') }],
      [d('2026-06-02T00:00:00Z'), d('2026-06-03T00:00:00Z')],
    );
    expect(out[0].weight).toBeCloseTo(0.36);
  });

  it('drops signals decayed below 0.05', () => {
    const sessions = [1, 2, 3, 4, 5, 6].map(n => d(`2026-06-0${n}T12:00:00Z`));
    const out = computeInterestTagDecay(
      [{ tag: 'ants', weight: 1, createdAt: d('2026-06-01T00:00:00Z') }],
      sessions, // 0.6^6 ≈ 0.047 < 0.05
    );
    expect(out).toEqual([]);
  });

  it('sums multiple signals for the same tag and caps at 2.0', () => {
    const out = computeInterestTagDecay(
      [
        { tag: 'flowers', weight: 1, createdAt: d('2026-06-10T00:00:00Z') },
        { tag: 'flowers', weight: 1, createdAt: d('2026-06-10T01:00:00Z') },
        { tag: 'flowers', weight: 1, createdAt: d('2026-06-10T02:00:00Z') },
      ],
      [],
    );
    expect(out).toEqual([{ tag: 'flowers', weight: 2 }]);
  });

  it('sorts descending by weight and handles empty input', () => {
    expect(computeInterestTagDecay([], [])).toEqual([]);
    const out = computeInterestTagDecay(
      [
        { tag: 'ants', weight: 0.5, createdAt: d('2026-06-10T00:00:00Z') },
        { tag: 'frogs', weight: 1, createdAt: d('2026-06-10T00:00:00Z') },
      ],
      [],
    );
    expect(out.map(t => t.tag)).toEqual(['frogs', 'ants']);
  });
});
