import type { EngineEvent, NarratorKind } from './types';

export interface NarratorMoment {
  kind: NarratorKind;
  text: string;
  skillCode: string;
}

/**
 * Plan 3 implements the growth-mindset narrator. For Plan 1, no moments
 * are produced — session-end documentation uses simpler templated observations.
 */
export function computeNarratorMoments(_events: EngineEvent[]): NarratorMoment[] {
  return [];
}
