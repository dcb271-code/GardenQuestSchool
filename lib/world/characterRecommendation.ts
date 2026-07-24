// lib/world/characterRecommendation.ts
//
// Partitions the engine's candidate list into per-character
// recommendations. The actual fetch from /api/plan/candidates happens
// in the garden page server component; this file just slices the
// returned candidates into the right buckets per character.
//
// Hodge (beaver, math affinity) → a math candidate. For learners at
//   Level 3+, Hodge is ambitious: he recommends the MOST ADVANCED math
//   candidate on the menu (by the skill catalog's difficulty level)
//   instead of whatever happens to be listed first — a Level-3 learner
//   should never be greeted with subtract-within-10 when multiplication
//   is on the table. Below Level 3, the engine's own ordering stands.
// Bachan (reading affinity) → first reading candidate
// Wanderer's Signpost → up to 4 candidates, mixed subjects, in engine order
//
// Fallbacks: if the engine returns no candidate for a subject (e.g.
// because every math skill is already mastered, or the response was
// empty due to a transient fetch error), every character STILL gets a
// safe baseline skill so the world remains responsive — no character
// is ever a dead tap. Hodge's baseline is level-keyed for the same
// reason as above.

import { MATH_SKILLS } from '@/lib/packs/math/skills';

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
// Level-3+ baseline — multiplication, not baby subtraction.
const HODGE_FALLBACK_L3: RecommendedCandidate = {
  skillCode: 'math.multiply.facts_to_5',
  title: 'Times Tables',
  themeEmoji: '✖️',
  skillHint: 'multiplication facts',
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

const MATH_LEVEL_BY_CODE = new Map(MATH_SKILLS.map(s => [s.code, s.level]));

/** Level 3+ learners get Hodge's most ambitious pick. */
export const HODGE_AMBITIOUS_MIN_LEVEL = 3;

export function partitionRecommendations(
  candidates: RecommendedCandidate[],
  learnerLevel: number = 2,
): CharacterRecommendations {
  const mathCandidates = candidates.filter(c => c.skillCode.startsWith('math.'));
  const hodgeFromEngine =
    learnerLevel >= HODGE_AMBITIOUS_MIN_LEVEL
      ? mathCandidates.reduce<RecommendedCandidate | null>((best, c) => {
          if (!best) return c;
          const bestLevel = MATH_LEVEL_BY_CODE.get(best.skillCode) ?? 0;
          const cLevel = MATH_LEVEL_BY_CODE.get(c.skillCode) ?? 0;
          return cLevel > bestLevel ? c : best;
        }, null)
      : mathCandidates[0] ?? null;
  const nanaFromEngine = candidates.find(c => c.skillCode.startsWith('reading.'));
  const signpostFromEngine = candidates.slice(0, SIGNPOST_ARMS);

  const hodgeFallback =
    learnerLevel >= HODGE_AMBITIOUS_MIN_LEVEL ? HODGE_FALLBACK_L3 : HODGE_FALLBACK;

  return {
    hodge: hodgeFromEngine ?? hodgeFallback,
    nana: nanaFromEngine ?? NANA_FALLBACK,
    signpost: signpostFromEngine.length > 0 ? signpostFromEngine : SIGNPOST_FALLBACK,
  };
}
