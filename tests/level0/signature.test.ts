// Sign Her Name: a letter is finished when the dots are passed in
// order. No recognition, no wrong signature — finished or not yet.

import { describe, it, expect } from 'vitest';
import {
  LETTER_GUIDES, signatureLetters, checkpoints, startTrace, advanceTrace, nextDot,
  CHECKPOINT_SPACING, MAX_SIGNATURE_LETTERS, type Point,
} from '@/lib/level0/signature';

/** Walk a polyline in small steps, feeding each point to the tracer. */
function trace(letter: string, strokes: Point[][]) {
  const guide = LETTER_GUIDES[letter];
  let progress = startTrace();
  let finishedStrokes = 0;
  for (const stroke of strokes) {
    for (let i = 1; i < stroke.length; i++) {
      const [x0, y0] = stroke[i - 1], [x1, y1] = stroke[i];
      const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 4));
      for (let s = 0; s <= steps; s++) {
        const r = advanceTrace(guide, progress, [x0 + ((x1 - x0) * s) / steps, y0 + ((y1 - y0) * s) / steps]);
        progress = r.progress;
        if (r.strokeFinished) finishedStrokes++;
      }
    }
  }
  return { progress, finishedStrokes };
}

describe('the letter guides', () => {
  it('cover every capital, inside the box', () => {
    for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
      const g = LETTER_GUIDES[ch];
      expect(g, ch).toBeDefined();
      expect(g.length).toBeGreaterThan(0);
      for (const stroke of g) {
        expect(stroke.length).toBeGreaterThan(1);
        for (const [x, y] of stroke) {
          expect(x, `${ch} x`).toBeGreaterThanOrEqual(0); expect(x, `${ch} x`).toBeLessThanOrEqual(100);
          expect(y, `${ch} y`).toBeGreaterThanOrEqual(0); expect(y, `${ch} y`).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it('every letter can be finished by tracing its own strokes', () => {
    for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
      const { progress } = trace(ch, LETTER_GUIDES[ch]);
      expect(progress.done, ch).toBe(true);
    }
  });
});

describe('signatureLetters', () => {
  it('is the first name in capitals, letters only', () => {
    expect(signatureLetters('Esme')).toEqual(['E', 'S', 'M', 'E']);
    expect(signatureLetters('Cecily')).toEqual(['C', 'E', 'C', 'I', 'L', 'Y']);
    expect(signatureLetters('Otto')).toEqual(['O', 'T', 'T', 'O']);
  });

  it('is nothing for no name', () => {
    expect(signatureLetters(null)).toEqual([]);
    expect(signatureLetters('')).toEqual([]);
    expect(signatureLetters('123')).toEqual([]);
  });

  it('a name too long for the corner becomes initials', () => {
    expect(signatureLetters('Bartholomew Quincy')).toEqual(['B', 'Q']);
    expect('Bartholomew'.length).toBeGreaterThan(MAX_SIGNATURE_LETTERS);
  });
});

describe('checkpoints', () => {
  it('start and end on the stroke, about SPACING apart', () => {
    const dots = checkpoints([[0, 0], [100, 0]]);
    expect(dots[0]).toEqual([0, 0]);
    expect(dots[dots.length - 1]).toEqual([100, 0]);
    // the last dot snaps to the stroke's end, so one gap may stretch to 1.5×
    for (let i = 1; i < dots.length; i++) {
      expect(dots[i][0] - dots[i - 1][0]).toBeLessThanOrEqual(CHECKPOINT_SPACING * 1.5 + 0.01);
    }
  });
});

describe('advanceTrace', () => {
  it('E: the stem stroke then the middle bar finishes it; the bar alone does not', () => {
    const [stem, bar] = LETTER_GUIDES.E;
    expect(trace('E', [stem, bar]).progress.done).toBe(true);
    const barOnly = trace('E', [bar]);
    expect(barOnly.progress.done).toBe(false);
    expect(barOnly.progress.stroke).toBe(0);   // still waiting on the first stroke
  });

  it('a stroke traced backwards does not count', () => {
    const [stem] = LETTER_GUIDES.L;
    const backwards = stem.slice().reverse();
    const r = trace('L', [backwards]);
    // the first dot is the far end; the finger passed it last, then nothing after
    expect(r.progress.done).toBe(false);
  });

  it('reports each stroke as it finishes', () => {
    expect(trace('H', LETTER_GUIDES.H).finishedStrokes).toBe(3);
  });

  it('says which dot comes next, and nothing once done', () => {
    const p = startTrace();
    expect(nextDot(LETTER_GUIDES.I, p)).toEqual([50, 0]);
    const done = trace('I', LETTER_GUIDES.I).progress;
    expect(nextDot(LETTER_GUIDES.I, done)).toBeNull();
  });

  it('a finger far from the dots changes nothing', () => {
    const r = advanceTrace(LETTER_GUIDES.T, startTrace(), [50, 60]);
    expect(r.progress).toEqual(startTrace());
    expect(r.strokeFinished).toBe(false);
  });
});
