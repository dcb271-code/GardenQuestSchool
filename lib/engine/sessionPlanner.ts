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

      // Level bonus: among equally-ready skills, surface the hardest
      // material at the edge of the tree rather than whichever easy
      // skill happens to come first in catalog order.
      const score = stateScore + tagBonus * 5 + s.level * 20;
      return { skill: s, score, isDue };
    })
    .filter((x): x is { skill: SkillDefinition; score: number; isDue: boolean } => x !== null);

  // Due reviews get AT MOST ONE candidate slot. A learner with a big
  // review backlog (weeks away, early skills all cycling due) would
  // otherwise see nothing but re-runs of mastered material — the
  // backlog crowded out every new skill and sessions stopped getting
  // harder. One review keeps spaced repetition alive; the remaining
  // slots always go to the learning frontier.
  const due = scored.filter(x => x.isDue).sort((a, b) => b.score - a.score);
  const frontier = scored.filter(x => !x.isDue).sort((a, b) => b.score - a.score);

  const picks: typeof scored = [];
  if (due.length > 0) picks.push(due[0]);
  for (const f of frontier) {
    if (picks.length >= candidateCount) break;
    picks.push(f);
  }
  // Not enough ready frontier skills (e.g. everything's mastered) —
  // backfill with additional due reviews rather than returning fewer
  // candidates.
  for (const d of due.slice(1)) {
    if (picks.length >= candidateCount) break;
    picks.push(d);
  }

  return picks.map(({ skill }) => {
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
