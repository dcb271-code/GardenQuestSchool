export interface InterestTag { tag: string; weight: number; expiresAt?: Date }

export function decayTags(tags: InterestTag[], now: Date = new Date()): InterestTag[] {
  return tags
    .filter(t => !t.expiresAt || t.expiresAt.getTime() > now.getTime())
    .map(t => ({ ...t, weight: t.weight * 0.6 }))
    .filter(t => t.weight >= 0.05);
}
