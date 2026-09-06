// tests/world/letterboxStyle.test.ts — custom letterbox validation.

import { describe, it, expect } from 'vitest';
import {
  LETTERBOX_COLORS, LETTERBOX_EMBLEMS, DEFAULT_LETTERBOX,
  getLetterboxColor, resolveLetterboxStyle, setLetterboxStyle,
} from '@/lib/world/letterbox';

describe('setLetterboxStyle', () => {
  it('accepts every paint on the shelf, with and without an emblem', () => {
    for (const c of LETTERBOX_COLORS) {
      expect(setLetterboxStyle(c.code, null)).toEqual({ style: { color: c.code } });
      for (const e of LETTERBOX_EMBLEMS) {
        expect(setLetterboxStyle(c.code, e)).toEqual({ style: { color: c.code, emblem: e } });
      }
    }
  });

  it('refuses nonsense in words', () => {
    const badColor = setLetterboxStyle('plaid', null);
    expect('error' in badColor && badColor.error).toMatch(/paints/);
    const badEmblem = setLetterboxStyle('green', 'dragon');
    expect('error' in badEmblem && badEmblem.error).toMatch(/emblems/);
  });
});

describe('resolveLetterboxStyle', () => {
  it('defaults an empty or unknown blob to garden green, no emblem', () => {
    expect(resolveLetterboxStyle(undefined)).toEqual(DEFAULT_LETTERBOX);
    expect(resolveLetterboxStyle({ color: 'plaid', emblem: 'dragon' }))
      .toEqual(DEFAULT_LETTERBOX);
  });

  it('passes a valid saved style through', () => {
    expect(resolveLetterboxStyle({ color: 'pink', emblem: 'snail' }))
      .toEqual({ color: 'pink', emblem: 'snail' });
  });

  it('never returns an undrawable color', () => {
    for (const raw of [null, {}, { color: 7 }, { color: 'red', emblem: 42 }]) {
      const style = resolveLetterboxStyle(raw);
      expect(getLetterboxColor(style.color).body).toMatch(/^#/);
    }
  });
});
