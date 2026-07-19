// A session earns rewards (creature arrivals) only when it's real work:
// the skill is still being learned, or it's a mastered skill that has
// genuinely come due for spaced review. Replaying a mastered skill
// early is welcome — it just doesn't pay out, so the creature economy
// keeps pointing at the frontier instead of at the easiest structure.

export interface RewardEligibilityInput {
  masteryState: 'new' | 'learning' | 'review' | 'mastered' | null;
  nextReviewAt: Date | null;
}

export function sessionEarnsRewards(
  progress: RewardEligibilityInput | null,
  now: Date = new Date(),
): boolean {
  if (!progress || progress.masteryState !== 'mastered') return true;
  if (progress.nextReviewAt === null) return true;
  return progress.nextReviewAt.getTime() <= now.getTime();
}
