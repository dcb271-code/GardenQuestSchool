import { describe, it, expect } from 'vitest';
import {
  emptyCavern, canDig, digsUsedToday, digsLeftToday, recordDig,
  rollDig, DIGS_PER_DAY, digCooldownMs, cooldownLabel, MIN_DIG_GAP_MS,
} from '@/lib/world/cavern';

const TODAY = '2026-08-09';

describe('two digs a day', () => {
  // Times are explicit throughout, because the digs are now spaced as
  // well as counted and "twice in the same millisecond" is not a case
  // that can happen.
  const T = new Date('2026-08-09T09:00:00Z').getTime();
  const LATER = T + 10 * 60_000;

  it('allows exactly two and then stops', () => {
    let s = emptyCavern();
    expect(canDig(s, TODAY, T)).toBe(true);
    expect(digsLeftToday(s, TODAY)).toBe(2);

    s = recordDig(s, TODAY, T);
    expect(canDig(s, TODAY, LATER)).toBe(true);
    expect(digsLeftToday(s, TODAY)).toBe(1);

    s = recordDig(s, TODAY, LATER);
    expect(canDig(s, TODAY, LATER + 10 * 60_000)).toBe(false);
    expect(digsLeftToday(s, TODAY)).toBe(0);
  });

  it('resets the next day', () => {
    const s = recordDig(recordDig(emptyCavern(), TODAY, T), TODAY, LATER);
    expect(canDig(s, TODAY, LATER + 10 * 60_000)).toBe(false);
    expect(canDig(s, '2026-08-10', LATER + 10 * 60_000)).toBe(true);
    expect(digsLeftToday(s, '2026-08-10')).toBe(DIGS_PER_DAY);
  });

  // Everyone already had a `lastDig` and no counter. Reading that as
  // zero digs used would have handed a free extra dig to every child
  // who had already dug on the day this shipped.
  it('counts a legacy lastDig as one dig already used', () => {
    const legacy = { ...emptyCavern(), lastDig: TODAY };
    expect(digsUsedToday(legacy, TODAY)).toBe(1);
    expect(digsLeftToday(legacy, TODAY)).toBe(1);
    expect(canDig(legacy, TODAY)).toBe(true);
  });

  it('ignores a legacy lastDig from a previous day', () => {
    const legacy = { ...emptyCavern(), lastDig: '2026-08-08' };
    expect(digsUsedToday(legacy, TODAY)).toBe(0);
  });

  // Twice the digging must not mean twice the treasure — the Great
  // Works are priced at one case gem each.
  it('keeps case gems at roughly 6% of digs', () => {
    let cases = 0;
    const N = 10000;
    for (let i = 0; i < N; i++) {
      if (rollDig(i / N).shelf === 'case') cases++;
    }
    const pct = cases / N;
    expect(pct).toBeGreaterThan(0.045);
    expect(pct).toBeLessThan(0.075);
  });

  it('still always returns a real gem', () => {
    for (let r = 0; r < 1; r += 0.005) {
      expect(rollDig(r).code).toBeTruthy();
    }
  });
});

describe('the five-minute gap between digs', () => {
  const T0 = new Date('2026-08-09T14:00:00Z').getTime();

  it('refuses a second dig taken immediately', () => {
    const s = recordDig(emptyCavern(), TODAY, T0);
    expect(digsLeftToday(s, TODAY)).toBe(1);          // she has one left
    expect(canDig(s, TODAY, T0 + 1000)).toBe(false);  // but not yet
  });

  it('allows it once five minutes have passed', () => {
    const s = recordDig(emptyCavern(), TODAY, T0);
    expect(canDig(s, TODAY, T0 + 4 * 60_000)).toBe(false);
    expect(canDig(s, TODAY, T0 + 5 * 60_000)).toBe(true);
  });

  it('reports the remaining wait', () => {
    const s = recordDig(emptyCavern(), TODAY, T0);
    expect(digCooldownMs(s, T0)).toBe(MIN_DIG_GAP_MS);
    expect(digCooldownMs(s, T0 + 2 * 60_000)).toBe(3 * 60_000);
    expect(digCooldownMs(s, T0 + 99 * 60_000)).toBe(0);
  });

  it('says the wait in words a child can act on', () => {
    expect(cooldownLabel(4 * 60_000)).toBe('4 minutes');
    expect(cooldownLabel(30_000)).toBe('about a minute');
    expect(cooldownLabel(1)).toBe('about a minute');
  });

  // A tablet whose clock is wrong, or a daylight-saving jump, must not
  // lock a child out of her own cavern.
  it('never locks her out if the clock runs backwards', () => {
    const s = recordDig(emptyCavern(), TODAY, T0);
    expect(digCooldownMs(s, T0 - 60 * 60_000)).toBe(0);
    expect(canDig(s, TODAY, T0 - 60 * 60_000)).toBe(true);
  });

  it('is not fooled by a missing timestamp', () => {
    expect(digCooldownMs({}, T0)).toBe(0);
    expect(digCooldownMs({ lastDigAt: 'nonsense' }, T0)).toBe(0);
  });

  // The gap must never be the reason a NEW day is refused.
  it('does not block the first dig of the next day', () => {
    const s = recordDig(recordDig(emptyCavern(), TODAY, T0), TODAY, T0 + 6 * 60_000);
    expect(canDig(s, TODAY, T0 + 12 * 60_000)).toBe(false);   // out of digs
    expect(canDig(s, '2026-08-10', T0 + 12 * 60_000)).toBe(true);
  });
});
