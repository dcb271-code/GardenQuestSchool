import { describe, it, expect } from 'vitest';
import { BUNNY_LESSONS, lessonsForLevel, lessonTopics } from '@/lib/world/bunnyLessons';

describe('bunny lessons — the little school', () => {
  it('lessons are well-formed: unique codes, 2+ slides, narratable text', () => {
    const codes = new Set(BUNNY_LESSONS.map(l => l.code));
    expect(codes.size).toBe(BUNNY_LESSONS.length);
    for (const l of BUNNY_LESSONS) {
      expect(l.slides.length).toBeGreaterThanOrEqual(2);
      expect(l.minLevel).toBeLessThanOrEqual(l.maxLevel);
      for (const s of l.slides) {
        expect(s.text.length).toBeGreaterThan(30);
        expect(s.visual.kind).toBeTruthy();
      }
    }
  });

  it('level windows: level 1 sees bands 1–2, level 3 sees 3–4', () => {
    const l1 = lessonsForLevel(1);
    expect(l1.every(l => l.minLevel <= 2 && l.maxLevel >= 1)).toBe(true);
    expect(l1.some(l => l.code === 'make_ten')).toBe(true);
    expect(l1.some(l => l.code === 'nines_pattern')).toBe(false);

    const l3 = lessonsForLevel(3);
    expect(l3.some(l => l.code === 'nines_pattern')).toBe(true);
    expect(l3.some(l => l.code === 'break_apart_times')).toBe(true);
    expect(l3.some(l => l.code === 'make_ten')).toBe(false);
  });

  it('every level 1–3 has a non-empty offering with multiple topics', () => {
    for (const level of [1, 2, 3]) {
      const lessons = lessonsForLevel(level);
      expect(lessons.length, `level ${level}`).toBeGreaterThanOrEqual(5);
      expect(lessonTopics(lessons).length, `level ${level} topics`).toBeGreaterThanOrEqual(2);
    }
  });

  it('level 2 bridges both bands (sees 1–2 AND 2–3 lessons)', () => {
    const l2 = lessonsForLevel(2);
    expect(l2.some(l => l.maxLevel === 2)).toBe(true);
    expect(l2.some(l => l.minLevel === 2 && l.maxLevel === 3)).toBe(true);
  });

  // `splitAtCol: 0` sat in the ×4 lesson for a month doing nothing —
  // the renderer ignores a split of 0, so "double, then double again"
  // drew as one undifferentiated block. Any split that is present must
  // actually split something.
  it('no visual carries a parameter the renderer will ignore', () => {
    for (const l of BUNNY_LESSONS) {
      for (const s of l.slides) {
        const v = s.visual;
        if (v.kind === 'array') {
          if (v.splitAtCol !== undefined) {
            expect(v.splitAtCol, `${l.code} splitAtCol`).toBeGreaterThan(0);
            expect(v.splitAtCol, `${l.code} splitAtCol`).toBeLessThan(v.cols);
          }
          if (v.splitAtRow !== undefined) {
            expect(v.splitAtRow, `${l.code} splitAtRow`).toBeGreaterThan(0);
            expect(v.splitAtRow, `${l.code} splitAtRow`).toBeLessThan(v.rows);
          }
        }
        if (v.kind === 'ten_frame') {
          expect(v.filled + (v.extra ?? 0), `${l.code} ten frame overflow`).toBeLessThanOrEqual(10);
        }
        if (v.kind === 'clock') {
          expect(v.minuteHandOn).toBeGreaterThanOrEqual(1);
          expect(v.minuteHandOn).toBeLessThanOrEqual(12);
        }
      }
    }
  });

  // The lesson is called "the fives live on a clock" and used to render
  // a number line.
  it('a lesson that promises a clock draws one', () => {
    const fives = BUNNY_LESSONS.find(l => l.code === 'fives_clock')!;
    expect(fives.slides.some(s => s.visual.kind === 'clock')).toBe(true);
  });

  it('level windows do not run a whole band ahead of the learner', () => {
    // Spec: "level 1 would have 1-2, level 2 would have 2-3". A band
    // that only STARTS at level+1 is a band too far.
    const l2 = lessonsForLevel(2);
    expect(l2.every(l => l.minLevel <= 2), 'level 2 sees a 3+ band').toBe(true);
    expect(l2.some(l => l.code === 'nines_pattern')).toBe(false);
    const l1 = lessonsForLevel(1);
    expect(l1.every(l => l.minLevel <= 1)).toBe(true);
  });

  it('every level 1–3 hears about adding and taking away, not just times tables', () => {
    for (const level of [1, 2, 3]) {
      const topics = lessonTopics(lessonsForLevel(level));
      expect(topics, `level ${level}`).toContain('adding');
      expect(topics, `level ${level}`).toContain('taking away');
    }
  });
});
