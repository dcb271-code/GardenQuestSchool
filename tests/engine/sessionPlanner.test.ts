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

  it('caps due reviews at one slot so a backlog cannot crowd out new skills', () => {
    // Four overdue reviews of mastered material + two ready new skills.
    const skills = [
      mkSkill('r1'), mkSkill('r2'), mkSkill('r3'), mkSkill('r4'),
      mkSkill('new1', 0.6), mkSkill('new2', 0.7),
    ];
    const overdue = new Date('2026-04-01T00:00:00Z');
    const progress = [
      mkProgress('r1', { masteryState: 'mastered', nextReviewAt: overdue }),
      mkProgress('r2', { masteryState: 'mastered', nextReviewAt: overdue }),
      mkProgress('r3', { masteryState: 'mastered', nextReviewAt: overdue }),
      mkProgress('r4', { masteryState: 'mastered', nextReviewAt: overdue }),
    ];
    const out = generateExpeditionCandidates({
      skills, progress,
      getThemeHeader: (code) => ({ title: code, themeEmoji: '🌿', skillHint: '' }),
      interestTagDecay: [],
      now: new Date('2026-04-22T12:00:00Z'),
    });
    const dueCount = out.filter(c => c.skillCode.startsWith('r')).length;
    expect(dueCount).toBe(1);
    expect(out.map(c => c.skillCode)).toContain('new1');
    expect(out.map(c => c.skillCode)).toContain('new2');
  });

  it('prefers higher-level frontier skills over easier ones', () => {
    const skills = [mkSkill('easy', 0.2), mkSkill('mid', 0.5), mkSkill('hard', 0.8)];
    const out = generateExpeditionCandidates({
      skills, progress: [],
      getThemeHeader: (code) => ({ title: code, themeEmoji: '🌿', skillHint: '' }),
      interestTagDecay: [],
    });
    expect(out[0].skillCode).toBe('hard');
    expect(out[1].skillCode).toBe('mid');
  });

  it('backfills with due reviews when the frontier is empty', () => {
    const skills = [mkSkill('r1'), mkSkill('r2'), mkSkill('r3'), mkSkill('r4')];
    const overdue = new Date('2026-04-01T00:00:00Z');
    const progress = skills.map(s =>
      mkProgress(s.code, { masteryState: 'mastered', nextReviewAt: overdue }),
    );
    const out = generateExpeditionCandidates({
      skills, progress,
      getThemeHeader: (code) => ({ title: code, themeEmoji: '🌿', skillHint: '' }),
      interestTagDecay: [],
      now: new Date('2026-04-22T12:00:00Z'),
    });
    expect(out.length).toBe(3);
  });
});
