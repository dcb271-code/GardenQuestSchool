// lib/world/characterRecommendation.ts
//
// Partitions the engine's candidate list into per-character
// recommendations. The actual fetch from /api/plan/candidates happens
// in the garden page server component; this file just slices the
// returned candidates into the right buckets per character.
//
// Hodge (beaver, math affinity) → first math candidate
// Bachan (reading affinity) → first reading candidate
// Wanderer's Signpost → up to 4 candidates, mixed subjects, in engine order
//
// Fallbacks: if the engine returns no candidate for a subject (e.g.
// because every math skill is already mastered, or the response was
// empty due to a transient fetch error), every character STILL gets a
// safe baseline skill so the world remains responsive — no character
// is ever a dead tap.

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

// Hardcoded baselines used when the engine has nothing to offer for a
// given character's subject. These are foundational skills that exist
// for every learner so a tap always resolves to a real session.
const HODGE_FALLBACK: RecommendedCandidate = {
  skillCode: 'math.subtract.within_10',
  title: 'Petal Falls',
  themeEmoji: '🌺',
  skillHint: 'subtract within 10',
};
const NANA_FALLBACK: RecommendedCandidate = {
  skillCode: 'reading.sight_words.dolch_primer',
  title: 'Word Stump',
  themeEmoji: '🌳',
  skillHint: 'sight words',
};
const SIGNPOST_FALLBACK: RecommendedCandidate[] = [
  {
    skillCode: 'math.add.within_20.no_crossing',
    title: 'Bee Swarms',
    themeEmoji: '🐝',
    skillHint: 'addition within 20',
  },
  NANA_FALLBACK,
  HODGE_FALLBACK,
];

export function partitionRecommendations(
  candidates: RecommendedCandidate[],
): CharacterRecommendations {
  const hodgeFromEngine = candidates.find(c => c.skillCode.startsWith('math.'));
  const nanaFromEngine = candidates.find(c => c.skillCode.startsWith('reading.'));
  const signpostFromEngine = candidates.slice(0, SIGNPOST_ARMS);

  return {
    hodge: hodgeFromEngine ?? HODGE_FALLBACK,
    nana: nanaFromEngine ?? NANA_FALLBACK,
    signpost: signpostFromEngine.length > 0 ? signpostFromEngine : SIGNPOST_FALLBACK,
  };
}
