import type { SkillDefinition, SkillProgressRow, ExpeditionCandidate } from './types';
import { getReadySkills, getDueReviews } from './skillGraph';

export interface PlannerInput {
  skills: SkillDefinition[];
  progress: SkillProgressRow[];
  getThemeHeader: (skillCode: string) => { title: string; themeEmoji: string; skillHint: string };
  interestTagDecay: Array<{ tag: string; weight: number }>;
  now?: Date;
  candidateCount?: number;
}

export function generateExpeditionCandidates(input: PlannerInput): ExpeditionCandidate[] {
  const { skills, progress, getThemeHeader, interestTagDecay, candidateCount = 3, now = new Date() } = input;

  const progressByCode = new Map(progress.map(p => [p.skillCode, p]));
  const dueReviews = new Set(getDueReviews(progress, now).map(r => r.skillCode));
  const readyCodes = new Set(getReadySkills(skills, progress).map(s => s.code));

  const scored = skills
    .map(s => {
      const prog = progressByCode.get(s.code);
      const isDue = dueReviews.has(s.code);
      const isReady = readyCodes.has(s.code);
      if (!isDue && !isReady) return null;

      const tagBonus = s.themeTags.reduce((acc, tag) => {
        const hit = interestTagDecay.find(t => t.tag === tag);
        return acc + (hit?.weight ?? 0);
      }, 0);

      const statePriority: Record<string, number> = {
        mastered: -10, review: 5, learning: 8, new: 10,
      };
      const stateScore = statePriority[prog?.masteryState ?? 'new'] ?? 0;

      const score = (isDue ? 50 : 0) + stateScore + tagBonus * 5;
      return { skill: s, score };
    })
    .filter((x): x is { skill: SkillDefinition; score: number } => x !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, candidateCount);

  return scored.map(({ skill }) => {
    const header = getThemeHeader(skill.code);
    return {
      skillCode: skill.code,
      skillName: skill.name,
      title: header.title,
      themeEmoji: header.themeEmoji,
      skillHint: header.skillHint,
      estItemCount: 6,
      estDurationMs: 7 * 60 * 1000,
    };
  });
}
