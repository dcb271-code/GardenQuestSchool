import type { SkillDefinition, SkillProgressRow } from './types';

export function getReadySkills(
  skills: SkillDefinition[],
  progress: SkillProgressRow[]
): SkillDefinition[] {
  const progressByCode = new Map(progress.map(p => [p.skillCode, p]));
  const isMastered = (code: string) => progressByCode.get(code)?.masteryState === 'mastered';

  return skills.filter(s => {
    const prereqsDone = s.prereqSkillCodes.every(code => isMastered(code));
    const thisMastered = isMastered(s.code);
    return prereqsDone && !thisMastered;
  });
}

export function getDueReviews(
  progress: SkillProgressRow[],
  now: Date = new Date()
): SkillProgressRow[] {
  return progress
    .filter(p => p.nextReviewAt !== null && p.nextReviewAt.getTime() <= now.getTime())
    .sort((a, b) =>
      (a.nextReviewAt!.getTime()) - (b.nextReviewAt!.getTime())
    );
}
