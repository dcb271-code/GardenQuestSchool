// Level 0 — the band below Level 1, for a child who cannot read yet.
// Spec: docs/superpowers/specs/2026-09-26-level-zero-spec.md
//
// Two things must hold. The baseline must promise a Level-0 learner
// NOTHING — not even counting-to-20, which `level <= 1` used to hand
// out. And moving a child to Level 0 must change opinions (mastery
// states), never history (attempts).

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  baselineEloFor,
  masteredSkillsForLevel,
  reviewingSkillsForLevel,
  isLevelZero,
  LEVEL_ZERO,
  MIN_LEVEL,
} from '@/lib/learner/baseline';
import { planRebaseline, REBASELINE_REASON } from '@/lib/learner/rebaseline';

describe('Level 0 baseline', () => {
  it('starts with nothing mastered and nothing reviewing', () => {
    expect(masteredSkillsForLevel(0)).toEqual([]);
    expect(reviewingSkillsForLevel(0)).toEqual([]);
  });

  it('Level 1 still gets counting-to-20 — Level 0 did not steal it', () => {
    expect(masteredSkillsForLevel(1)).toContain('math.counting.to_20');
  });

  it('sits below Level 1 in Elo', () => {
    expect(baselineEloFor(0, 'normal')).toBeLessThan(baselineEloFor(1, 'normal'));
  });

  it('is a real level, not a missing one', () => {
    expect(MIN_LEVEL).toBe(0);
    expect(LEVEL_ZERO).toBe(0);
    expect(isLevelZero(0)).toBe(true);
    expect(isLevelZero(null)).toBe(false);
    expect(isLevelZero(undefined)).toBe(false);
    expect(isLevelZero(1)).toBe(false);
    // The trap the spec named: 0 is falsy. `level ?? 2` keeps it;
    // `level || 2` loses it.
    const level: number | null = 0;
    expect(level ?? 2).toBe(0);
  });

  it('the DB constraint in 022 admits 0 and still stops 6', () => {
    const sql = readFileSync(join(process.cwd(), 'lib/supabase/migrations/022_level_zero.sql'), 'utf8');
    expect(sql).toMatch(/grade_level between 0 and 5/);
    expect(sql).toMatch(/drop constraint if exists learner_grade_level_chk/);
  });
});

describe('rebaseline to Level 0', () => {
  const now = '2026-09-26T12:00:00.000Z';
  const rows = [
    { skill_id: 'a', mastery_state: 'mastered', state_transitions: [{ at: '2026-07-01', to: 'mastered', from: 'review' }] },
    { skill_id: 'b', mastery_state: 'review', state_transitions: null },
    { skill_id: 'c', mastery_state: 'learning', state_transitions: [] },
    { skill_id: 'd', mastery_state: 'new', state_transitions: [] },
  ];

  it('resets mastered and review rows, leaves learning and new alone', () => {
    const { changes } = planRebaseline(rows, now);
    expect(changes.map(c => c.skill_id)).toEqual(['a', 'b']);
  });

  it('appends a reasoned transition and keeps the old ones', () => {
    const { changes } = planRebaseline(rows, now);
    const a = changes.find(c => c.skill_id === 'a')!;
    expect(a.state_transitions).toHaveLength(2);
    expect(a.state_transitions[0]).toEqual({ at: '2026-07-01', to: 'mastered', from: 'review' });
    expect(a.state_transitions[1]).toEqual({ at: now, to: 'new', from: 'mastered', reason: REBASELINE_REASON });
    const b = changes.find(c => c.skill_id === 'b')!;
    expect(b.state_transitions).toEqual([{ at: now, to: 'new', from: 'review', reason: REBASELINE_REASON }]);
  });

  it('refuses to run twice', () => {
    const { changes } = planRebaseline(rows, now);
    const after = rows.map(r => {
      const c = changes.find(x => x.skill_id === r.skill_id);
      return c ? { ...r, mastery_state: 'new', state_transitions: c.state_transitions } : r;
    });
    expect(planRebaseline(after, now).alreadyDone).toBe(true);
    expect(planRebaseline(rows, now).alreadyDone).toBe(false);
  });

  it('never produces a delete — it only describes updates to two fields', () => {
    const { changes } = planRebaseline(rows, now);
    for (const c of changes) {
      expect(Object.keys(c).sort()).toEqual(['from', 'skill_id', 'state_transitions']);
    }
  });
});
