import { describe, it, expect } from 'vitest';
import { BURROW_ANIMALS, getBurrowAnimal, passed } from '@/lib/world/burrowTunnels';
import { LUNA_FACTS, nextFact, canFeed, factsRemaining } from '@/lib/world/lunaTreats';

describe('the tunnels', () => {
  it('has a home for every animal, with unique codes', () => {
    const codes = BURROW_ANIMALS.map(a => a.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(BURROW_ANIMALS.length).toBeGreaterThanOrEqual(5);
  });

  it('every question has a real correct answer', () => {
    for (const a of BURROW_ANIMALS) {
      expect(a.questions.length, a.code).toBeGreaterThanOrEqual(3);
      for (const q of a.questions) {
        expect(q.choices.length).toBeGreaterThanOrEqual(3);
        expect(q.correct).toBeGreaterThanOrEqual(0);
        expect(q.correct).toBeLessThan(q.choices.length);
        expect(q.why.length, `${a.code}: ${q.prompt}`).toBeGreaterThan(20);
      }
    }
  });

  it('never repeats a choice within a question', () => {
    for (const a of BURROW_ANIMALS) {
      for (const q of a.questions) {
        expect(new Set(q.choices).size, `${a.code}: ${q.prompt}`).toBe(q.choices.length);
      }
    }
  });

  it('draws every burrow inside the picture', () => {
    for (const a of BURROW_ANIMALS) {
      expect(a.x, a.code).toBeGreaterThan(60);
      expect(a.x, a.code).toBeLessThan(940);
      expect(a.depth, a.code).toBeGreaterThan(0);
    }
  });

  // The diagram is a claim about the world, so the depths have to be
  // honest: the rabbit barely goes under, the groundhog goes deepest.
  it('digs each animal to an honest depth relative to the others', () => {
    const by = Object.fromEntries(BURROW_ANIMALS.map(a => [a.code, a.depth]));
    expect(by.cottontail_form).toBeLessThan(by.eastern_mole);
    expect(by.groundhog).toBeGreaterThan(by.red_fox_den);
    expect(by.groundhog).toBe(Math.max(...BURROW_ANIMALS.map(a => a.depth)));
    expect(by.cottontail_form).toBe(Math.min(...BURROW_ANIMALS.map(a => a.depth)));
  });

  it('only lets an animal move in on a clean sweep', () => {
    expect(passed([true, true, true], 3)).toBe(true);
    expect(passed([true, false, true], 3)).toBe(false);
    expect(passed([true, true], 3)).toBe(false);
  });

  it('is retrievable by code', () => {
    expect(getBurrowAnimal('groundhog')?.name).toBe('Groundhog');
    expect(getBurrowAnimal('nope')).toBeUndefined();
  });
});

describe('feeding Luna', () => {
  it('has unique facts with real content', () => {
    const ids = LUNA_FACTS.map(f => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const f of LUNA_FACTS) expect(f.text.length).toBeGreaterThan(40);
  });

  it('gives one treat a day', () => {
    expect(canFeed({}, '2026-08-09')).toBe(true);
    expect(canFeed({ lastFed: '2026-08-09' }, '2026-08-09')).toBe(false);
    expect(canFeed({ lastFed: '2026-08-08' }, '2026-08-09')).toBe(true);
  });

  it('never repeats a fact until every one has been heard', () => {
    const heard: string[] = [];
    for (let i = 0; i < LUNA_FACTS.length; i++) {
      const f = nextFact(heard)!;
      expect(heard).not.toContain(f.id);
      heard.push(f.id);
    }
    expect(nextFact(heard)).toBeNull();
    expect(factsRemaining(heard)).toBe(0);
  });
});
