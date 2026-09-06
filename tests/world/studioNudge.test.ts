// tests/world/studioNudge.test.ts — the knock at the studio door.

import { describe, it, expect } from 'vitest';
import {
  knockDue, knockWords, NUDGE_MINUTES, type StudioErrand,
} from '@/lib/world/studioNudge';

const ERRAND: StudioErrand = { href: '/garden?learner=x', what: 'Luna has not been fed today' };

describe('knockDue', () => {
  it('stays quiet before the first interval', () => {
    for (const m of [0, 5, 19.9]) expect(knockDue(m, 0)).toBeNull();
  });

  it('knocks once each interval is passed, in order', () => {
    expect(knockDue(20, 0)).toBe(0);
    expect(knockDue(39, 1)).toBeNull();   // second knock not yet due
    expect(knockDue(40, 1)).toBe(1);
    expect(knockDue(65, 2)).toBe(2);
  });

  it('does not re-knock the same knock after it is dismissed', () => {
    // 25 minutes in, one knock already shown: silence until 40.
    expect(knockDue(25, 1)).toBeNull();
  });

  it('runs out of knocks — it never nags forever', () => {
    expect(knockDue(600, NUDGE_MINUTES.length)).toBeNull();
  });
});

describe('knockWords', () => {
  it('names the real errand when there is one', () => {
    for (let i = 0; i < NUDGE_MINUTES.length; i++) {
      expect(knockWords(i, ERRAND, 'Esme').body).toContain('Luna has not been fed today');
    }
  });

  it('still works when nothing is waiting — and invents nothing', () => {
    for (let i = 0; i < NUDGE_MINUTES.length; i++) {
      const w = knockWords(i, null, 'Esme');
      expect(w.body.length).toBeGreaterThan(10);
      expect(w.body).not.toContain('undefined');
      expect(w.body).not.toContain('null');
    }
  });

  it('always offers a way to stay — painting is never taken away', () => {
    for (let i = 0; i < NUDGE_MINUTES.length; i++) {
      expect(knockWords(i, ERRAND, 'Esme').stayLabel.length).toBeGreaterThan(0);
    }
  });

  it('never scolds, shames, counts coins, or mentions time on a clock', () => {
    const banned = /minute[s]? left|time is up|you should have|wasted|too long|hurry|coins?\b|\d+:\d\d/i;
    for (let i = 0; i < NUDGE_MINUTES.length; i++) {
      for (const e of [ERRAND, null]) {
        const w = knockWords(i, e, 'Cecily');
        expect(w.title + ' ' + w.body).not.toMatch(banned);
      }
    }
  });
});
