import { describe, it, expect } from 'vitest';
import { FOREST_LESSONS, lessonsForLevel, lessonTopics } from '@/lib/world/forestLessons';

describe('forest lessons — Old Bramble’s reading tree', () => {
  it('lessons are well-formed: unique codes, real paragraphs, 2+ questions', () => {
    const codes = new Set(FOREST_LESSONS.map(l => l.code));
    expect(codes.size).toBe(FOREST_LESSONS.length);
    for (const l of FOREST_LESSONS) {
      expect(l.pages.length, l.code).toBeGreaterThanOrEqual(2);
      expect(l.minLevel).toBeLessThanOrEqual(l.maxLevel);
      expect(l.teaser.length).toBeGreaterThan(10);
      for (const p of l.pages) {
        // These are comprehension passages, not captions — a page that
        // shrinks to one short sentence has lost the point.
        expect(p.text.length, `${l.code} page`).toBeGreaterThan(180);
        expect(p.visual.kind).toBeTruthy();
      }
      expect(l.questions.length, l.code).toBeGreaterThanOrEqual(2);
      expect(l.questions.length, l.code).toBeLessThanOrEqual(3);
    }
  });

  it('every question has distinct choices, a valid answer, and an explanation', () => {
    for (const l of FOREST_LESSONS) {
      for (const q of l.questions) {
        expect(q.choices.length, `${l.code}: ${q.prompt}`).toBeGreaterThanOrEqual(3);
        expect(new Set(q.choices).size).toBe(q.choices.length);
        expect(q.correct).toBeGreaterThanOrEqual(0);
        expect(q.correct).toBeLessThan(q.choices.length);
        // The "why" restates the takeaway; a bare "correct!" is useless.
        expect(q.why.length, `${l.code}: ${q.prompt}`).toBeGreaterThan(40);
      }
    }
  });

  it('the correct answer is not always in the same position', () => {
    const positions = new Set(
      FOREST_LESSONS.flatMap(l => l.questions.map(q => q.correct)),
    );
    expect(positions.size).toBeGreaterThanOrEqual(3);
  });

  it('level windows: 3 sees the 3–4 band, 5 sees the 4–5 band', () => {
    const l3 = lessonsForLevel(3);
    expect(l3.some(l => l.code === 'cloud_types')).toBe(true);
    expect(l3.some(l => l.code === 'photosynthesis')).toBe(true);   // 3+1 reaches band 4
    expect(l3.some(l => l.code === 'decomposers')).toBe(true);

    const l5 = lessonsForLevel(5);
    expect(l5.some(l => l.code === 'mendel_peas')).toBe(true);
    expect(l5.some(l => l.code === 'cloud_types')).toBe(false);     // band 3–4 has aged out
  });

  it('a younger reader still gets the starter shelf, not an empty tree', () => {
    for (const level of [1, 2, 3]) {
      const lessons = lessonsForLevel(level);
      expect(lessons.length, `level ${level}`).toBeGreaterThanOrEqual(6);
      expect(lessons.some(l => l.code === 'germination'), `level ${level}`).toBe(true);
    }
    // Clamping means level 1, 2 and 3 all see the same shelf.
    expect(lessonsForLevel(1).map(l => l.code)).toEqual(lessonsForLevel(3).map(l => l.code));
  });

  it('every level 3–5 offering spans multiple topics', () => {
    for (const level of [3, 4, 5]) {
      const lessons = lessonsForLevel(level);
      expect(lessonTopics(lessons).length, `level ${level} topics`).toBeGreaterThanOrEqual(3);
    }
  });

  it('covers the science Dylan asked for', () => {
    const codes = FOREST_LESSONS.map(l => l.code);
    for (const c of [
      'cloud_types', 'photosynthesis', 'plant_parts_eat', 'mendel_peas',
      'water_cycle', 'seeds_find_sun', 'germination', 'spider_web', 'moth_or_butterfly',
    ]) {
      expect(codes, c).toContain(c);
    }
  });
});
