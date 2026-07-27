// tests/world/birdAudioResolve.test.ts
import { describe, it, expect } from 'vitest';
import {
  resolveClip, hasClip, birdsWithAudio, type AudioIndex, type ResolvedClip,
} from '@/lib/birds/audioResolve';

const clip = (n: string): ResolvedClip => ({
  url: `https://x/${n}.opus`,
  fallbackUrl: `https://x/${n}.m4a`,
  spectrogramUrl: `https://x/${n}.png`,
  attribution: { recordist: 'R', sourceId: 'XC1', sourceUrl: 'u', licenseUrl: 'l' },
});

const index: AudioIndex = {
  northern_cardinal: { song: [clip('song')], call: [clip('call')] },
  blue_jay: { call: [clip('jay1'), clip('jay2')] },
  house_finch: {},
};

describe('resolveClip', () => {
  it('resolves an exact kind', () => {
    expect(resolveClip(index, 'northern_cardinal', 'song')?.url).toContain('song');
  });

  it('NEVER falls back across kinds — the sound IS the lesson', () => {
    // Photos fall back (a male cardinal is a perched cardinal); a
    // cardinal's tick is NOT its song, and serving it would teach the
    // wrong sound. Missing kind → null → the exercise is skipped.
    expect(resolveClip(index, 'blue_jay', 'song')).toBeNull();
    expect(resolveClip(index, 'northern_cardinal', 'flight_call')).toBeNull();
  });

  it('returns null for unknown birds and empty entries', () => {
    expect(resolveClip(index, 'dodo', 'song')).toBeNull();
    expect(resolveClip(index, 'house_finch', 'song')).toBeNull();
  });

  it('varies between clips by seed, deterministically', () => {
    const a = resolveClip(index, 'blue_jay', 'call', 0)?.url;
    const b = resolveClip(index, 'blue_jay', 'call', 1)?.url;
    expect(a).not.toBe(b);
    expect(resolveClip(index, 'blue_jay', 'call', 2)?.url).toBe(a);
  });
});

describe('hasClip / birdsWithAudio', () => {
  it('reports availability the way the menu needs it', () => {
    expect(hasClip(index, 'northern_cardinal', 'song')).toBe(true);
    expect(hasClip(index, 'blue_jay', 'song')).toBe(false);
    // house_finch has an entry but no clips — it must not count.
    expect(birdsWithAudio(index).sort()).toEqual(['blue_jay', 'northern_cardinal']);
  });
});
