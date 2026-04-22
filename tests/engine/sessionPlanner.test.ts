import { describe, it, expect } from 'vitest';
import { generateExpeditionCandidates } from '@/lib/engine/sessionPlanner';
import type { SkillDefinition, SkillProgressRow } from '@/lib/engine/types';

const mkSkill = (code: string, level = 0.3, prereqs: string[] = []): SkillDefinition => ({
  code, name: code, strandCode: 's', level, prereqSkillCodes: prereqs,
  curriculumRefs: {}, themeTags: [], sortOrder: 0,
});

const mkProgress = (skillCode: string, overrides: Partial<SkillProgressRow> = {}): SkillProgressRow => ({
  learnerId: 'l', skillId: 'sid', skillCode, masteryState: 'new',
  leitnerBox: 1, studentElo: 1000, streakCorrect: 0, totalAttempts: 0,
  totalCorrect: 0, lastAttemptedAt: null, nextReviewAt: null, ...overrides,
});

describe('sessionPlanner — generateExpeditionCandidates', () => {
  it('returns up to 3 candidates from ready skills', () => {
    const skills = [mkSkill('a'), mkSkill('b'), mkSkill('c'), mkSkill('d')];
    const progress: SkillProgressRow[] = [];
    const titles: Record<string, { title: string; themeEmoji: string; skillHint: string }> = {
      a: { title: 'A', themeEmoji: '🐜', skillHint: 'a-hint' },
      b: { title: 'B', themeEmoji: '🦋', skillHint: 'b-hint' },
      c: { title: 'C', themeEmoji: '🐸', skillHint: 'c-hint' },
      d: { title: 'D', themeEmoji: '🐝', skillHint: 'd-hint' },
    };
    const out = generateExpeditionCandidates({
      skills, progress,
      getThemeHeader: (code) => titles[code]!,
      interestTagDecay: [],
    });
    expect(out.length).toBe(3);
    expect(out[0].estItemCount).toBeGreaterThanOrEqual(5);
    expect(out[0].estItemCount).toBeLessThanOrEqual(8);
  });

  it('prioritizes due reviews when overdue', () => {
    const skills = [mkSkill('a'), mkSkill('b'), mkSkill('c')];
    const progress = [
      mkProgress('a', { masteryState: 'learning', nextReviewAt: new Date('2026-04-20T00:00:00Z') }),
      mkProgress('b', { masteryState: 'new' }),
      mkProgress('c', { masteryState: 'new' }),
    ];
    const titles: Record<string, { title: string; themeEmoji: string; skillHint: string }> = {
      a: { title: 'A', themeEmoji: '🐜', skillHint: 'a-hint' },
      b: { title: 'B', themeEmoji: '🦋', skillHint: 'b-hint' },
      c: { title: 'C', themeEmoji: '🐸', skillHint: 'c-hint' },
    };
    const out = generateExpeditionCandidates({
      skills, progress,
      getThemeHeader: (code) => titles[code]!,
      interestTagDecay: [],
      now: new Date('2026-04-22T12:00:00Z'),
    });
    expect(out[0].skillCode).toBe('a');
  });
});
