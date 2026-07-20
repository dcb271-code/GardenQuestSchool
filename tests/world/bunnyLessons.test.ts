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
});
