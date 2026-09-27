// The morning gate's rules, at 7:59 and 8:00, on any day.

import { describe, it, expect } from 'vitest';
import {
  localParts, isBeforeCutoff, dailyCode, codeMatches, gateStep, isMorningGated,
  waitRemainingMs, CHORE_WAIT_MS, DEFAULT_MORNING_CONFIG, normalizeMorningConfig, choreQuestion,
  acceptChecklist, MAX_CHORES,
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

describe('the parent\'s settings', () => {
  it('default to eight o\'clock and the three chores the owner named', () => {
    expect(DEFAULT_MORNING_CONFIG.cutoffHour).toBe(8);
    expect(DEFAULT_MORNING_CONFIG.chores.map(c => c.text)).toEqual(['get dressed', 'put your dishes away', 'put some toys away']);
  });

  it('a chore is written as you would say it, and becomes a question', () => {
    expect(choreQuestion({ text: 'get dressed' })).toBe('Did you get dressed?');
    expect(choreQuestion({ text: 'brush your teeth.' })).toBe('Did you brush your teeth?');
  });

  it('normalizes whatever was stored, field by field', () => {
    expect(normalizeMorningConfig(undefined)).toEqual(DEFAULT_MORNING_CONFIG);
    expect(normalizeMorningConfig({ cutoffHour: 7 }).cutoffHour).toBe(7);
    expect(normalizeMorningConfig({ cutoffHour: 7 }).chores).toEqual(DEFAULT_MORNING_CONFIG.chores);
    expect(normalizeMorningConfig({ cutoffHour: 99 }).cutoffHour).toBe(8);
    expect(normalizeMorningConfig({ cutoffHour: 'nine' }).cutoffHour).toBe(8);
    // an explicit empty list means no checklist
    expect(normalizeMorningConfig({ chores: [] }).chores).toEqual([]);
    // junk chores drop out; icons fall back; at most MAX_CHORES
    const many = normalizeMorningConfig({ chores: [
      { id: 'a', text: 'make your bed', icon: 'bed' }, { id: 'b', text: '   ', icon: 'bed' },
      { id: 'c', text: 'feed the cat', icon: 'dragon' }, { id: 'd', text: 'four', icon: 'toys' }, { id: 'e', text: 'five', icon: 'toys' },
    ] });
    expect(many.chores.map(c => c.id)).toEqual(['a', 'c', 'd']);
    expect(many.chores[1].icon).toBe('toys');
    expect(many.chores.length).toBe(MAX_CHORES);
  });

  it('a different cutoff moves the code window', () => {
    const seven = normalizeMorningConfig({ cutoffHour: 7 });
    expect(gateStep('Esme', ny('2026-09-27', 7, 30), null, seven)).toBe('chores');
    expect(gateStep('Esme', ny('2026-09-27', 6, 30), null, seven)).toBe('code');
  });

  it('no chores means no checklist and no pause', () => {
    const none = normalizeMorningConfig({ chores: [] });
    expect(gateStep('Esme', ny('2026-09-27', 9, 0), null, none)).toBe('open');
  });
});

describe('the checklist', () => {
  it('needs at least one tick, and only real chores count', () => {
    expect(acceptChecklist(DEFAULT_MORNING_CONFIG, [])).toBeNull();
    expect(acceptChecklist(DEFAULT_MORNING_CONFIG, ['nonsense'])).toBeNull();
    expect(acceptChecklist(DEFAULT_MORNING_CONFIG, ['dishes'])).toEqual({ dressed: false, dishes: true, toys: false });
    expect(acceptChecklist(DEFAULT_MORNING_CONFIG, ['dishes', 'toys', 'nonsense'])).toEqual({ dressed: false, dishes: true, toys: true });
  });
});
