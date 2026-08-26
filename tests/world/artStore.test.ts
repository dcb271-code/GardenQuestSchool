import { describe, it, expect } from 'vitest';
import {
  addPiece, removePiece, artId, validateTitle, decodePngDataUrl,
  MAX_PNG_BYTES,
} from '@/lib/world/artStore';

// A one-pixel PNG, the smallest real picture there is.
const TINY_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

describe('the gallery', () => {
  const NOW = '2026-08-26T12:00:00.000Z';

  it('adds newest-first with date-sequenced ids', () => {
    const one = addPiece([], 'kid/a.png', NOW);
    const two = addPiece(one.gallery, 'kid/b.png', NOW, 'My Bunny');
    expect(two.gallery[0].id).toBe('2026-08-26-2');
    expect(two.gallery[0].title).toBe('My Bunny');
    expect(two.gallery[1].id).toBe('2026-08-26-1');
    expect(artId(NOW, two.gallery)).toBe('2026-08-26-3');
  });

  it('removes by id and reports what left, for the storage cleanup', () => {
    const g = addPiece([], 'kid/a.png', NOW).gallery;
    const out = removePiece(g, g[0].id);
    expect(out.gallery).toHaveLength(0);
    expect(out.removed?.path).toBe('kid/a.png');
    expect(removePiece(g, 'nope').removed).toBeNull();
  });
});

describe('validation refuses in words', () => {
  it('titles: her words kept, control characters stripped, length capped', () => {
    expect(validateTitle('My Bunny!')).toEqual({ title: 'My Bunny!' });
    expect(validateTitle('  spaced  ')).toEqual({ title: 'spaced' });
    expect(validateTitle(undefined)).toEqual({});
    expect(validateTitle('')).toEqual({});
    expect('error' in validateTitle('x'.repeat(41))).toBe(true);
  });

  it('accepts a real PNG and rejects impostors', () => {
    const ok = decodePngDataUrl(TINY_PNG);
    expect('bytes' in ok).toBe(true);
    expect('error' in decodePngDataUrl('data:image/jpeg;base64,AAAA')).toBe(true);
    expect('error' in decodePngDataUrl('hello')).toBe(true);
    // right header, wrong magic
    const fake = 'data:image/png;base64,' + Buffer.from('not a png at all, sorry').toString('base64');
    expect('error' in decodePngDataUrl(fake)).toBe(true);
    // too big
    const big = 'data:image/png;base64,' +
      Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
                     Buffer.alloc(MAX_PNG_BYTES)]).toString('base64');
    expect('error' in decodePngDataUrl(big)).toBe(true);
  });
});
