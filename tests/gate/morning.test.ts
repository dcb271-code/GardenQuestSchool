// The morning gate's rules, at 7:59 and 8:00, on any day.

import { describe, it, expect } from 'vitest';
import {
  localParts, isBeforeCutoff, dailyCode, codeMatches, gateStep, isMorningGated, CHORES,
  waitRemainingMs, CHORE_WAIT_MS,
} from '@/lib/gate/morning';

/** A UTC instant that is `h:mm` in New York on the given local date (EDT in September = UTC-4). */
const ny = (date: string, h: number, m = 0) => new Date(new Date(`${date}T00:00:00Z`).getTime() + ((h + 4) * 60 + m) * 60_000);

describe('the day in Eastern time', () => {
  it('reads the local date and hour', () => {
    expect(localParts(ny('2026-09-27', 7, 59))).toMatchObject({ dateKey: '2026-09-27', hour: 7, year: 2026, month: 9, day: 27 });
    expect(localParts(ny('2026-09-27', 8, 0)).hour).toBe(8);
  });

  it('rolls the date at local midnight, not UTC midnight', () => {
    // 23:30 ET on the 26th is 03:30 UTC on the 27th
    expect(localParts(new Date('2026-09-27T03:30:00Z')).dateKey).toBe('2026-09-26');
    expect(localParts(new Date('2026-09-27T03:30:00Z')).hour).toBe(23);
  });

  it('handles winter time too', () => {
    // 07:30 EST (UTC-5) on Jan 5 is 12:30Z
    expect(localParts(new Date('2027-01-05T12:30:00Z'))).toMatchObject({ dateKey: '2027-01-05', hour: 7 });
  });

  it('is before the cutoff until eight', () => {
    expect(isBeforeCutoff(ny('2026-09-27', 0, 1))).toBe(true);
    expect(isBeforeCutoff(ny('2026-09-27', 7, 59))).toBe(true);
    expect(isBeforeCutoff(ny('2026-09-27', 8, 0))).toBe(false);
    expect(isBeforeCutoff(ny('2026-09-27', 21, 0))).toBe(false);
  });
});

describe('the daily code', () => {
  it('is day × month + year', () => {
    expect(dailyCode({ year: 2026, month: 9, day: 27 })).toBe('269');
    expect(dailyCode({ year: 2026, month: 1, day: 1 })).toBe('27');
    expect(dailyCode({ year: 2027, month: 12, day: 31 })).toBe('399');
  });

  it('changes from one day to the next', () => {
    expect(dailyCode({ year: 2026, month: 9, day: 27 })).not.toBe(dailyCode({ year: 2026, month: 9, day: 28 }));
  });

  it('matches what is typed today, with stray spaces forgiven', () => {
    expect(codeMatches(' 269 ', ny('2026-09-27', 7))).toBe(true);
    expect(codeMatches('268', ny('2026-09-27', 7))).toBe(false);
    // yesterday's code is no good today
    expect(codeMatches(dailyCode({ year: 2026, month: 9, day: 26 }), ny('2026-09-27', 7))).toBe(false);
  });
});

describe('gateStep', () => {
  const early = ny('2026-09-27', 7, 30);
  const later = ny('2026-09-27', 9, 0);

  it('gates only the named children', () => {
    expect(isMorningGated('Esme')).toBe(true);
    expect(isMorningGated('Cecily')).toBe(true);
    expect(isMorningGated('Otto')).toBe(false);
    expect(isMorningGated('Friends')).toBe(false);
    expect(gateStep('Otto', early, null)).toBe('open');
  });

  it('asks for the code before eight, then the chores, then opens', () => {
    expect(gateStep('Esme', early, null)).toBe('code');
    expect(gateStep('Esme', early, { codeOn: '2026-09-27' })).toBe('chores');
    expect(gateStep('Esme', early, { codeOn: '2026-09-27', choresOn: '2026-09-27' })).toBe('open');
  });

  it('after eight, no code — but the chores still come once a day', () => {
    expect(gateStep('Cecily', later, null)).toBe('chores');
    expect(gateStep('Cecily', later, { choresOn: '2026-09-27' })).toBe('open');
  });

  it('yesterday does not count', () => {
    expect(gateStep('Esme', early, { codeOn: '2026-09-26', choresOn: '2026-09-26' })).toBe('code');
    expect(gateStep('Esme', later, { codeOn: '2026-09-26', choresOn: '2026-09-26' })).toBe('chores');
  });

  it('the pause after the chores is enforced by the rules, not the screen', () => {
    const answered = ny('2026-09-27', 9, 0);
    const state = { choresOn: '2026-09-27', choresAt: answered.toISOString() };
    const tenSecondsLater = new Date(answered.getTime() + 10_000);
    const afterThePause = new Date(answered.getTime() + CHORE_WAIT_MS + 1);
    expect(gateStep('Cecily', tenSecondsLater, state)).toBe('wait');
    expect(waitRemainingMs(tenSecondsLater, state)).toBe(CHORE_WAIT_MS - 10_000);
    expect(gateStep('Cecily', afterThePause, state)).toBe('open');
    expect(waitRemainingMs(afterThePause, state)).toBe(0);
    expect(waitRemainingMs(afterThePause, { choresOn: '2026-09-27', choresAt: 'garbage' })).toBe(0);
  });

  it('a code entered at 7:50 holds after eight', () => {
    expect(gateStep('Esme', later, { codeOn: '2026-09-27', choresOn: '2026-09-27' })).toBe('open');
  });
});

describe('the chores', () => {
  it('are the three the owner named, each a question', () => {
    expect(CHORES.map(c => c.code)).toEqual(['dressed', 'dishes', 'toys']);
    for (const c of CHORES) expect(c.ask.endsWith('?')).toBe(true);
  });
});
