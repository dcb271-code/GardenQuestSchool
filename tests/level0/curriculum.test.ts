// Level 0's mastery is a pure function of attempt rows, and what a
// game may offer follows from it. Spec: 2026-09-26-level-zero-spec.md

import { describe, it, expect } from 'vitest';
import {
  PRE_SKILLS, preSkillStatus, allStatuses, offerable, readyForLevelOne,
  MASTERY_WINDOW, type PreSkillAttempt, type PreSkillCode,
} from '@/lib/level0/curriculum';

function rows(code: PreSkillCode, outcomes: boolean[], days = 3): PreSkillAttempt[] {
  return outcomes.map((correct, i) => ({
    preSkill: code, correct,
    at: `2026-09-${String(10 + (i % days)).padStart(2, '0')}T12:${String(i).padStart(2, '0')}:00.000Z`,
  }));
}

describe('the pre-skill catalog', () => {
  it('every prerequisite is itself a pre-skill', () => {
    const codes = new Set(PRE_SKILLS.map(p => p.code));
    for (const p of PRE_SKILLS) for (const a of p.after) expect(codes.has(a), `${p.code} after ${a}`).toBe(true);
  });

  it('counting to five is a root — the first thing a four-year-old is asked', () => {
    expect(PRE_SKILLS.find(p => p.code === 'count_to_5')?.after).toEqual([]);
  });
});

describe('preSkillStatus', () => {
  it('is new with no rows, practicing with any', () => {
    expect(preSkillStatus('count_to_5', [])).toBe('new');
    expect(preSkillStatus('count_to_5', rows('count_to_5', [false]))).toBe('practicing');
  });

  it('needs a full window before it can be mastered', () => {
    expect(preSkillStatus('count_to_5', rows('count_to_5', Array(MASTERY_WINDOW - 1).fill(true)))).toBe('practicing');
    expect(preSkillStatus('count_to_5', rows('count_to_5', Array(MASTERY_WINDOW).fill(true)))).toBe('mastered');
  });

  it('needs three different days — twenty right answers in one sitting is one sitting', () => {
    expect(preSkillStatus('count_to_5', rows('count_to_5', Array(MASTERY_WINDOW).fill(true), 1))).toBe('practicing');
    expect(preSkillStatus('count_to_5', rows('count_to_5', Array(MASTERY_WINDOW).fill(true), 2))).toBe('practicing');
  });

  it('judges the NEWEST window, so old mistakes stop counting', () => {
    const early = rows('count_to_5', Array(10).fill(false));
    const late = rows('count_to_5', Array(MASTERY_WINDOW).fill(true)).map(r => ({ ...r, at: r.at.replace('2026-09', '2026-10') }));
    expect(preSkillStatus('count_to_5', [...late, ...early])).toBe('mastered');
  });

  it('85% of twenty is the line', () => {
    const seventeen = [...Array(17).fill(true), ...Array(3).fill(false)];
    const sixteen = [...Array(16).fill(true), ...Array(4).fill(false)];
    expect(preSkillStatus('count_to_5', rows('count_to_5', seventeen))).toBe('mastered');
    expect(preSkillStatus('count_to_5', rows('count_to_5', sixteen))).toBe('practicing');
  });

  it('ignores other pre-skills\' rows', () => {
    expect(preSkillStatus('count_to_10', rows('count_to_5', Array(MASTERY_WINDOW).fill(true)))).toBe('new');
  });
});

describe('offerable', () => {
  it('a fresh child gets counting to five and nothing that stands on it', () => {
    expect(offerable('ladybug', allStatuses([]))).toEqual(['count_to_5']);
  });

  it('one attempt at counting opens the numerals, the glance, and counting to ten', () => {
    const s = allStatuses(rows('count_to_5', [true]));
    expect(offerable('ladybug', s)).toEqual(['count_to_5', 'numeral_1_5', 'subitize_1_3', 'count_to_10']);
  });

  it('mastered pre-skills fall out of the fresh list, and come back only when nothing is fresh', () => {
    const all = PRE_SKILLS.filter(p => p.game === 'ladybug').flatMap(p =>
      rows(p.code, Array(MASTERY_WINDOW).fill(true)));
    const s = allStatuses(all);
    const offers = offerable('ladybug', s);
    expect(offers.length).toBe(5);              // everything, so she can keep playing
    expect(offerable('basket', s)).toEqual(['more_fewer']);  // one_more waits on more_fewer
  });

  it('never offers a game nothing', () => {
    expect(offerable('ladybug', allStatuses([])).length).toBeGreaterThan(0);
    expect(offerable('basket', allStatuses([])).length).toBe(0); // more_fewer waits on count_to_5 — the bunny is for later
  });
});

describe('readyForLevelOne', () => {
  it('is false for a fresh child and true when every game pre-skill is mastered', () => {
    expect(readyForLevelOne(allStatuses([]))).toBe(false);
    const all = PRE_SKILLS.filter(p => p.game === 'ladybug' || p.game === 'basket').flatMap(p =>
      rows(p.code, Array(MASTERY_WINDOW).fill(true)));
    expect(readyForLevelOne(allStatuses(all))).toBe(true);
  });
});
