export interface RawInterestSignal { tag: string; weight: number; createdAt: Date }

const DECAY_PER_SESSION = 0.6;
const MIN_WEIGHT = 0.05;
const MAX_TAG_WEIGHT = 2.0;

/**
 * Decays each signal 0.6x for every session started after it (the
 * design-spec "0.6x/session" rule), drops the dust (<0.05), then
 * aggregates by tag. The per-tag cap keeps stacked signals from
 * outranking due reviews in the planner (cap 2.0 -> tagBonus*5 = +10,
 * the same priority as a brand-new skill).
 */
export function computeInterestTagDecay(
  signals: RawInterestSignal[],
  sessionStarts: Date[],
): Array<{ tag: string; weight: number }> {
  const byTag = new Map<string, number>();
  for (const s of signals) {
    const sessionsSince = sessionStarts.filter(
      t => t.getTime() > s.createdAt.getTime(),
    ).length;
    const effective = s.weight * Math.pow(DECAY_PER_SESSION, sessionsSince);
    if (effective < MIN_WEIGHT) continue;
    byTag.set(s.tag, (byTag.get(s.tag) ?? 0) + effective);
  }
  return Array.from(byTag.entries())
    .map(([tag, weight]) => ({ tag, weight: Math.min(weight, MAX_TAG_WEIGHT) }))
    .sort((a, b) => b.weight - a.weight);
}
