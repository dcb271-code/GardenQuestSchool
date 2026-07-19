import { describe, it, expect } from 'vitest';
import { presentableHeardWord } from '@/lib/audio/useSpeechRecognition';

describe('presentableHeardWord — never show garbage to a child', () => {
  it('passes through a clean single word', () => {
    expect(presentableHeardWord('cat', [])).toBe('cat');
    expect(presentableHeardWord('Blob', [])).toBe('blob');
  });

  it('takes the last word when the recognizer prepends filler', () => {
    expect(presentableHeardWord('the cat', [])).toBe('cat');
    expect(presentableHeardWord('i said ship', [])).toBe('ship');
  });

  it('rejects long garbled multi-word hypotheses', () => {
    expect(presentableHeardWord('buh luh aw b seven eight nine', [])).toBeNull();
  });

  it('strips digits and symbols; rejects what remains if too short', () => {
    expect(presentableHeardWord('a7', [])).toBeNull();
    expect(presentableHeardWord('sh1p', [])).toBe('shp');
  });

  it('falls back to alternatives when the primary is junk', () => {
    expect(presentableHeardWord('xxxxxxxxxxxxxxxxxxxxxx', ['clip'])).toBe('clip');
  });

  it('null when nothing usable', () => {
    expect(presentableHeardWord('', [])).toBeNull();
  });
});
