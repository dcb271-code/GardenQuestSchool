// tests/world/jokeStump.test.ts
import { describe, it, expect } from 'vitest';
import {
  addJoke, removeJoke, readJokes, jokesToTell, riddlesFor, checkRiddle,
  countRiddle, RIDDLES, STARTER_JOKES, RIDDLE_SEEDS_PER_DAY,
  MAX_JOKES_PER_CHILD, MAX_SETUP_LENGTH, type Joke,
} from '@/lib/world/jokeStump';

const NOW = '2026-10-07T15:00:00.000Z';

function added(list: Joke[], setup: string, punch?: string, at = NOW): Joke[] {
  const r = addJoke(list, setup, punch, at);
  if ('error' in r) throw new Error(r.error);
  return r.list;
}

describe('teaching the stump a joke', () => {
  it('keeps her words, newest first, with or without a punchline', () => {
    const one = added([], '  Why did the cookie go to the doctor? ', ' It felt crummy! ');
    const two = added(one, 'Knock knock');
    expect(two[0]).toMatchObject({ setup: 'Knock knock' });
    expect(two[0].punchline).toBeUndefined();
    expect(two[1]).toMatchObject({
      setup: 'Why did the cookie go to the doctor?', punchline: 'It felt crummy!',
    });
  });

  it('refuses in words, never silently', () => {
    for (const r of [
      addJoke([], '   ', undefined, NOW),
      addJoke([], 'x'.repeat(MAX_SETUP_LENGTH + 1), undefined, NOW),
    ]) {
      expect('error' in r && r.error.length > 10).toBe(true);
    }
  });

  it('says so when the stump is full', () => {
    let list: Joke[] = [];
    for (let i = 0; i < MAX_JOKES_PER_CHILD; i++) list = added(list, `joke ${i}`);
    const r = addJoke(list, 'one more', undefined, NOW);
    expect('error' in r && /full/.test(r.error)).toBe(true);
  });

  it('never reuses an id after a joke is taken out', () => {
    let list = added(added([], 'a'), 'b');           // -1, -2
    list = removeJoke(list, list[1].id);              // take out -1
    list = added(list, 'c');
    const ids = list.map(j => j.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('drops malformed rows from the blob instead of crashing', () => {
    expect(readJokes(null)).toEqual([]);
    expect(readJokes([{ id: 'x' }, 7, { id: 'y', setup: 'ok', addedAt: NOW }]))
      .toEqual([{ id: 'y', setup: 'ok', addedAt: NOW }]);
  });
});

describe('the shared stump', () => {
  it('tells every child’s jokes, signed and newest first, then its own', () => {
    const told = jokesToTell([
      { learnerId: 'c', name: 'Cecily', jokes: added([], 'old one', undefined, '2026-10-01T00:00:00Z') },
      { learnerId: 'e', name: 'Esme', jokes: added([], 'new one', undefined, '2026-10-05T00:00:00Z') },
    ]);
    expect(told.slice(0, 2).map(j => [j.by, j.setup])).toEqual([
      ['Esme', 'new one'], ['Cecily', 'old one'],
    ]);
    expect(told.slice(2)).toEqual(STARTER_JOKES);
  });

  it('keeps ids unique across children, whose own ids collide', () => {
    const same = added([], 'hi');
    const told = jokesToTell([
      { learnerId: 'c', name: 'Cecily', jokes: same },
      { learnerId: 'e', name: 'Esme', jokes: same },
    ]);
    const ids = told.map(j => j.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('math riddles', () => {
  it('have unique ids', () => {
    expect(new Set(RIDDLES.map(r => r.id)).size).toBe(RIDDLES.length);
  });

  it('always state the right answer in the explanation', () => {
    // Said after a wrong answer too — it must teach, not change the subject.
    for (const r of RIDDLES) {
      expect(r.because, r.id).toContain(String(r.answer));
    }
  });

  it('checks answers on the server side of the line', () => {
    const r = RIDDLES[0];
    expect(checkRiddle(r.id, r.answer)).toBe(true);
    expect(checkRiddle(r.id, r.answer + 1)).toBe(false);
    expect(checkRiddle('no-such-riddle', 1)).toBeNull();
  });

  it('offers her own level and the one below, and Level 0 hears Level 1', () => {
    expect(riddlesFor(3).every(r => r.level === 2 || r.level === 3)).toBe(true);
    expect(riddlesFor(3).length).toBeGreaterThan(6);
    expect(riddlesFor(0)).toEqual(riddlesFor(1));
    expect(riddlesFor(0).every(r => r.level === 1)).toBe(true);
    for (let lv = 0; lv <= 5; lv++) expect(riddlesFor(lv).length).toBeGreaterThan(0);
  });
});

describe('the daily seed cap', () => {
  it(`counts ${RIDDLE_SEEDS_PER_DAY} riddles a day, then stops counting`, () => {
    let tally;
    for (let i = 0; i < RIDDLE_SEEDS_PER_DAY; i++) {
      const r = countRiddle(tally, '2026-10-07');
      expect(r.counts).toBe(true);
      tally = r.next;
    }
    expect(countRiddle(tally, '2026-10-07').counts).toBe(false);
  });

  it('starts fresh the next day', () => {
    const full = { day: '2026-10-07', counted: RIDDLE_SEEDS_PER_DAY };
    expect(countRiddle(full, '2026-10-08')).toEqual({
      counts: true, next: { day: '2026-10-08', counted: 1 },
    });
  });
});
