// lib/world/characterRecommendation.ts
//
// Partitions the engine's candidate list into per-character
// recommendations. The actual fetch from /api/plan/candidates happens
// in the garden page server component; this file just slices the
// returned candidates into the right buckets per character.
//
// Hodge (beaver, math affinity) → first math candidate
// Nana Mira (reading affinity) → first reading candidate
// Wanderer's Signpost → up to 4 candidates, mixed subjects, in engine order

export interface RecommendedCandidate {
  skillCode: string;
  title: string;
  themeEmoji: string;
  skillHint: string;
}

export interface CharacterRecommendations {
  hodge: RecommendedCandidate | null;
  nana: RecommendedCandidate | null;
  signpost: RecommendedCandidate[];
}

const SIGNPOST_ARMS = 4;

export function partitionRecommendations(
  candidates: RecommendedCandidate[],
): CharacterRecommendations {
  const hodge = candidates.find(c => c.skillCode.startsWith('math.')) ?? null;
  const nana = candidates.find(c => c.skillCode.startsWith('reading.')) ?? null;
  const signpost = candidates.slice(0, SIGNPOST_ARMS);
  return { hodge, nana, signpost };
}
