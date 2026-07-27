// lib/birds/audioResolve.ts
//
// Turning a {birdCode, kind} reference into an actual clip.
//
// Same contract as photoResolve: exercises are generated from the
// catalog, clips are auditioned by ear one at a time, and the two will
// never be perfectly in step. Resolution degrades rather than breaks —
// a bird with no confirmed clip resolves to null and the scene skips
// the exercise.
//
// One deliberate difference from photos: there is NO cross-kind
// fallback. A male cardinal photo is a fine stand-in for a perched
// cardinal; a cardinal's sharp metallic tick is NOT a stand-in for its
// birdie-birdie-birdie song. Serving the wrong kind would teach the
// wrong sound, which is worse than skipping the question — the sound
// IS the lesson.

import type { VoiceKind } from '@/lib/world/birdCatalog';

export interface ResolvedClip {
  /** The opus clip. */
  url: string;
  /** AAC fallback for older Safari; <audio> picks whichever plays. */
  fallbackUrl: string | null;
  /** The clip's own spectrogram — the sound made visible. */
  spectrogramUrl: string | null;
  attribution: {
    recordist: string;
    /** 'XC1154497' */
    sourceId: string;
    sourceUrl: string;
    licenseUrl: string;
  };
}

export type AudioIndex =
  Record<string, Partial<Record<VoiceKind, ResolvedClip[]>>>;

/**
 * Best clip for a reference, or null if nothing has been auditioned.
 * `seed` varies between equally good clips once a bird has more than
 * one of a kind — recognising one recording is not recognising the
 * bird.
 */
export function resolveClip(
  index: AudioIndex,
  birdCode: string,
  kind: VoiceKind,
  seed = 0,
): ResolvedClip | null {
  const clips = index[birdCode]?.[kind];
  if (!clips || clips.length === 0) return null;
  return clips[Math.abs(seed) % clips.length];
}

/** Can this exercise be shown at all? */
export function hasClip(
  index: AudioIndex, birdCode: string, kind: VoiceKind,
): boolean {
  return resolveClip(index, birdCode, kind) !== null;
}

/** Which birds have any confirmed clip — drives what Listen can teach. */
export function birdsWithAudio(index: AudioIndex): string[] {
  return Object.keys(index).filter(code =>
    Object.values(index[code]).some(list => (list?.length ?? 0) > 0),
  );
}
