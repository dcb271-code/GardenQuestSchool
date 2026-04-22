import type { EngineEvent, VirtueName } from './types';

export interface DetectedVirtue {
  virtue: VirtueName;
  narrativeText: string;
}

/**
 * Plan 3 implements the seven detection rules (persistence, curiosity, noticing,
 * care, practice, courage, wondering). For Plan 1 this returns no virtues —
 * ensuring the pipeline runs but no gems surface until Plan 3.
 */
export function detectVirtuesForEvent(_evt: EngineEvent): DetectedVirtue[] {
  return [];
}
