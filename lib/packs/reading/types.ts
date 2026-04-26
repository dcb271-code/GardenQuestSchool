export type ReadingItemType =
  | 'SightWordTap'
  | 'PhonemeBlend'
  | 'DigraphSort'
  | 'ReadAloudSimple'
  | 'SentenceComprehension'
  | 'ParagraphComprehension';

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

/**
 * Paragraph comprehension — the Grade 3 step up from
 * SentenceComprehension. The child reads a 3-5 sentence paragraph,
 * then answers ONE question about it (literal recall, inference,
 * sequence, or vocab-from-context). Multiple authored items can
 * share the same paragraph text by re-using it with different
 * questions; the picker may surface them in adjacent slots, which
 * is fine — re-reading a paragraph for a new question is a
 * legitimate study skill.
 */
export interface ParagraphComprehensionContent {
  type: 'ParagraphComprehension';
  paragraph: string;       // 3-5 sentences, ~40-90 words
  question: string;
  choices: string[];
  // Question-kind tag for analytics + lesson-header coloring; not
  // shown to the child. One of:
  //   'recall'  — literal: "what colour was the bird?"
  //   'sequence'— "what happened first / next / last?"
  //   'inference' — "why did X do Y?"
  //   'main_idea' — "what is this passage mostly about?"
  //   'vocab'   — "what does the word X mean here?"
  questionKind?: 'recall' | 'sequence' | 'inference' | 'main_idea' | 'vocab';
  promptText: string;      // narrator reads this — usually = question
}
export interface ParagraphComprehensionAnswer { correct: string }
export interface ParagraphComprehensionResponse { chosen: string }
