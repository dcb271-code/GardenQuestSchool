export type ReadingItemType = 'SightWordTap' | 'PhonemeBlend' | 'DigraphSort' | 'ReadAloudSimple';

export interface SightWordTapContent {
  type: 'SightWordTap';
  word: string;
  distractors: string[];
  promptText: string;
}
export interface SightWordTapAnswer { word: string }
export interface SightWordTapResponse { chosen: string }

export interface PhonemeBlendContent {
  type: 'PhonemeBlend';
  phonemes: string[];
  word: string;
  distractors: string[];
  promptText: string;
}
export interface PhonemeBlendAnswer { word: string }
export interface PhonemeBlendResponse { chosen: string }

export interface DigraphSortContent {
  type: 'DigraphSort';
  digraphs: string[];
  words: Array<{ word: string; emoji?: string; digraph: string }>;
  promptText: string;
}
export interface DigraphSortAnswer {
  placements: Record<string, string>;
}
export interface DigraphSortResponse {
  placements: Record<string, string>;
}

export interface ReadAloudSimpleContent {
  type: 'ReadAloudSimple';
  word: string;
  promptText: string;
}
export interface ReadAloudSimpleAnswer { skipped?: boolean }
export interface ReadAloudSimpleResponse { claimed: boolean }
