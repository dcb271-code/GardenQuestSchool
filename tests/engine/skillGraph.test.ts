import { describe, it, expect } from 'vitest';
import { getReadySkills, getDueReviews } from '@/lib/engine/skillGraph';
import type { SkillDefinition, SkillProgressRow } from '@/lib/engine/types';

const skills: SkillDefinition[] = [
  { code: 'a', name: 'A', strandCode: 's', level: 0.2, prereqSkillCodes: [], curriculumRefs: {}, themeTags: [], sortOrder: 1 },
  { code: 'b', name: 'B', strandCode: 's', level: 0.3, prereqSkillCodes: ['a'], curriculumRefs: {}, themeTags: [], sortOrder: 2 },
  { code: 'c', name: 'C', strandCode: 's', level: 0.4, prereqSkillCodes: ['b'], curriculumRefs: {}, themeTags: [], sortOrder: 3 },
];

const progress = (overrides: Partial<SkillProgressRow>[]): SkillProgressRow[] =>
  overrides.map(o => ({
    learnerId: 'l', skillId: 'sid', skillCode: '', masteryState: 'new',
    leitnerBox: 1, studentElo: 1000, streakCorrect: 0, totalAttempts: 0,
    totalCorrect: 0, lastAttemptedAt: null, nextReviewAt: null, ...o,
  }));

describe('skillGraph', () => {
  it('ready = a when nothing mastered', () => {
    const ready = getReadySkills(skills, progress([]));
    expect(ready.map(s => s.code)).toEqual(['a']);
  });

  it('ready = b when a is mastered', () => {
    const ready = getReadySkills(skills, progress([{ skillCode: 'a', masteryState: 'mastered' }]));
    expect(ready.map(s => s.code).sort()).toEqual(['b']);
  });

  it('due reviews returns those with nextReviewAt in past, sorted oldest first', () => {
    const now = new Date('2026-04-22T12:00:00Z');
    const p = progress([
      { skillCode: 'x', nextReviewAt: new Date('2026-04-21T00:00:00Z') },
      { skillCode: 'y', nextReviewAt: new Date('2026-04-20T00:00:00Z') },
      { skillCode: 'z', nextReviewAt: new Date('2026-04-23T00:00:00Z') },
    ]);
    const due = getDueReviews(p, now);
    expect(due.map(r => r.skillCode)).toEqual(['y', 'x']);
  });
});
