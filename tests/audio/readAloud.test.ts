// Read-to-me splits a long letter into pieces the TTS proxy will
// accept. The one promise that matters: NOTHING a child wrote is
// lost, reordered or tidied on the way to the voice.

import { describe, it, expect } from 'vitest';
import { splitForSpeech, READ_ALOUD_PIECE_MAX } from '@/lib/audio/useReadAloud';

const squash = (s: string) => s.replace(/\s+/g, '');

describe('splitForSpeech', () => {
  it('leaves a short letter whole', () => {
    expect(splitForSpeech('Dear garden builder, the owl box is here!')).toEqual([
      'Dear garden builder, the owl box is here!',
    ]);
  });

  it('is empty for nothing', () => {
    expect(splitForSpeech('   ')).toEqual([]);
  });

  it('keeps every character of a long letter, in order', () => {
    const sentences = Array.from({ length: 60 }, (_, i) => `Sentence number ${i + 1} is about the pond.`);
    const letter = sentences.join(' ');
    const pieces = splitForSpeech(letter);
    expect(pieces.length).toBeGreaterThan(1);
    for (const p of pieces) expect(p.length).toBeLessThanOrEqual(READ_ALOUD_PIECE_MAX);
    expect(squash(pieces.join(''))).toBe(squash(letter));
  });

  it('breaks after a sentence end when it can', () => {
    const letter = ('Hello there. ').repeat(120);
    for (const p of splitForSpeech(letter).slice(0, -1)) {
      expect(p.endsWith('.')).toBe(true);
    }
  });

  it('breaks a keyboard song mid-song rather than dropping it', () => {
    const song = '9oo99òô9óöōœøõ98î8íìïīû7úūüù'.repeat(60); // no spaces anywhere
    const pieces = splitForSpeech(song);
    for (const p of pieces) expect(p.length).toBeLessThanOrEqual(READ_ALOUD_PIECE_MAX);
    expect(pieces.join('')).toBe(song);
  });

  it('keeps emoji rows — they are read, not skipped', () => {
    const letter = 'Did it ' + '😲🤣'.repeat(400);
    expect(squash(splitForSpeech(letter).join(''))).toBe(squash(letter));
  });

  it('honors a custom max', () => {
    const pieces = splitForSpeech('one two three four five six', 9);
    expect(pieces).toEqual(['one two', 'three', 'four five', 'six']);
  });
});
