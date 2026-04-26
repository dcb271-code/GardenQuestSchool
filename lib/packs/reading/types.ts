export type ReadingItemType =
  | 'SightWordTap'
  | 'PhonemeBlend'
  | 'DigraphSort'
  | 'ReadAloudSimple'
  | 'SentenceComprehension';

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

export interface SentenceComprehensionContent {
  type: 'SentenceComprehension';
  // Short sentence the child reads (one or two clauses, ~6–14 words).
  sentence: string;
  // The question we ask after they read the sentence.
  question: string;
  // The set of multiple-choice options to pick from.
  choices: string[];
  // The correct answer text — must appear in `choices` exactly.
  promptText: string;
}
export interface SentenceComprehensionAnswer { correct: string }
export interface SentenceComprehensionResponse { chosen: string }
