// tests/world/traceScoring.test.ts
import { describe, it, expect } from 'vitest';
import { scoreTrace, traceHint, DEFAULT_TRACE_RULES, type Pt } from '@/lib/world/traceScoring';
import { STROKE_DATA, strokesFor, canTrace } from '@/lib/world/japaneseStrokes';
import { JAPANESE_UNITS } from '@/lib/world/japaneseSchool';

/** A straight guide from (10,50) to (90,50), sampled like the real thing. */
const line = (n = 20): Pt[] =>
  Array.from({ length: n }, (_, i) => ({ x: 10 + (80 * i) / (n - 1), y: 50 }));

describe('scoreTrace', () => {
  it('passes a clean trace along the line', () => {
    const r = scoreTrace(line(), line(40));
    expect(r.passed).toBe(true);
    expect(r.coverage).toBe(1);
    expect(r.startHit && r.endHit).toBe(true);
  });

  it('passes a wobbly trace — a six-year-old is not a plotter', () => {
    const wobbly = line(40).map((p, i) => ({ x: p.x, y: p.y + (i % 2 ? 6 : -6) }));
    expect(scoreTrace(line(), wobbly).passed).toBe(true);
  });

  it('passes a fast swipe with only a few sampled points', () => {
    // Two points spanning the whole stroke: the segment logic must
    // still see the line as covered.
    const swipe: Pt[] = [{ x: 10, y: 50 }, { x: 90, y: 50 }];
    expect(scoreTrace(line(), swipe).passed).toBe(true);
  });

  it('REJECTS a backwards trace even though it covers the line', () => {
    const backwards = [...line(40)].reverse();
    const r = scoreTrace(line(), backwards);
    expect(r.coverage).toBe(1);
    expect(r.passed).toBe(false);
    expect(r.reason).toBe('backwards');
  });

  it('rejects starting in the middle', () => {
    const fromMiddle = line(40).filter(p => p.x >= 50);
    const r = scoreTrace(line(), fromMiddle);
    expect(r.passed).toBe(false);
    expect(r.reason).toBe('missed-start');
  });

  it('rejects stopping early', () => {
    const stopsShort = line(40).filter(p => p.x <= 60);
    const r = scoreTrace(line(), stopsShort);
    expect(r.passed).toBe(false);
    expect(r.reason).toBe('missed-end');
  });

  it('rejects cutting the corner on a curved stroke', () => {
    // Guide arcs up from (10,50) to (90,50), bulging to y≈10.
    const arc: Pt[] = Array.from({ length: 20 }, (_, i) => {
      const t = i / 19;
      return { x: 10 + 80 * t, y: 50 - 40 * Math.sin(Math.PI * t) };
    });
    // The child drags straight between the endpoints, ignoring the bow.
    const chord: Pt[] = Array.from({ length: 30 }, (_, i) => ({ x: 10 + (80 * i) / 29, y: 50 }));
    const r = scoreTrace(arc, chord);
    expect(r.startHit && r.endHit).toBe(true);   // ends are fine
    expect(r.coverage).toBeLessThan(0.8);        // the middle is missed
    expect(r.passed).toBe(false);
    expect(r.reason).toBe('gaps');
  });

  it('a continuous drag along the line is never penalised for speed', () => {
    // Only two sampled points is what a fast flick actually produces;
    // it must not read as a gap. (A lifted finger ends the stroke, so
    // a true mid-stroke hole cannot occur.)
    const flick: Pt[] = [{ x: 10, y: 50 }, { x: 50, y: 50 }, { x: 90, y: 50 }];
    expect(scoreTrace(line(), flick).passed).toBe(true);
  });

  it('rejects a trace that strays far off the line', () => {
    const wayOff = line(40).map(p => ({ x: p.x, y: p.y + 40 }));
    expect(scoreTrace(line(), wayOff).passed).toBe(false);
  });

  it('a tap is not a trace', () => {
    const r = scoreTrace(line(), [{ x: 10, y: 50 }]);
    expect(r.passed).toBe(false);
    expect(r.reason).toBe('too-short');
  });

  it('tolerance is generous enough for a fingertip but not a whole box', () => {
    const near = line(40).map(p => ({ x: p.x, y: p.y + DEFAULT_TRACE_RULES.tolerance - 2 }));
    const far = line(40).map(p => ({ x: p.x, y: p.y + DEFAULT_TRACE_RULES.tolerance + 6 }));
    expect(scoreTrace(line(), near).passed).toBe(true);
    expect(scoreTrace(line(), far).passed).toBe(false);
  });

  it('every failure reason has a kid-readable hint', () => {
    for (const reason of ['too-short', 'missed-start', 'missed-end', 'gaps', 'backwards'] as const) {
      expect(traceHint(reason).length).toBeGreaterThan(8);
    }
  });
});

describe('STROKE_DATA', () => {
  it('every stroke is a path that starts with a move command', () => {
    for (const [char, set] of Object.entries(STROKE_DATA)) {
      expect(set.strokes.length, char).toBeGreaterThan(0);
      expect(set.say.length, char).toBeGreaterThan(0);
      for (const d of set.strokes) expect(d.trim(), char).toMatch(/^M /);
    }
  });

  it('covers every hiragana the curriculum teaches', () => {
    for (const unit of JAPANESE_UNITS.filter(u => u.kind === 'hiragana')) {
      for (const c of unit.chars) {
        expect(canTrace(c.char), `${c.char} (${c.romaji}) has no stroke guide`).toBe(true);
      }
    }
  });

  it('traceable kanji are the simple ones; intricate kanji stay recognition-only', () => {
    for (const c of ['一', '二', '三', '木', '山', '川', '日']) {
      expect(canTrace(c), c).toBe(true);
    }
    // Deliberately absent until their strokes can be authored properly.
    for (const c of ['桜', '菊', '藤', '苔']) {
      expect(canTrace(c), `${c} should not offer tracing yet`).toBe(false);
    }
  });

  it('stroke counts match the real characters', () => {
    const expected: Record<string, number> = {
      'く': 1, 'し': 1, 'つ': 1, 'て': 1, 'の': 1, 'そ': 1,
      'い': 2, 'う': 2, 'え': 2, 'こ': 2, 'す': 2, 'ち': 2, 'と': 2, 'ぬ': 2, 'ね': 2,
      'あ': 3, 'お': 3, 'か': 3, 'け': 3, 'さ': 3, 'せ': 3, 'に': 3,
      'き': 4, 'た': 4, 'な': 4,
      '一': 1, '二': 2, '三': 3, '山': 3, '川': 3, '木': 4, '日': 4,
    };
    for (const [char, count] of Object.entries(expected)) {
      expect(strokesFor(char)?.strokes.length, `${char} stroke count`).toBe(count);
    }
  });

  it('kanji speak their reading, not the character name', () => {
    expect(strokesFor('一')!.say).toBe('いち');
    expect(strokesFor('山')!.say).toBe('やま');
    expect(strokesFor('川')!.say).toBe('かわ');
  });
});
