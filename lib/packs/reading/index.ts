import { READING_SKILLS } from './skills';
import { READING_STRANDS } from './strands';
import { READING_THEMES, getReadingThemeHeader } from './themes';
import {
  scoreSightWordTap, scorePhonemeBlend, scoreDigraphSort, scoreReadAloudSimple,
  scoreSentenceComprehension,
} from './scoring';
import SightWordTap from './rendering/SightWordTap';
import PhonemeBlend from './rendering/PhonemeBlend';
import DigraphSort from './rendering/DigraphSort';
import ReadAloudSimple from './rendering/ReadAloudSimple';
import SentenceComprehension from './rendering/SentenceComprehension';
import type { ItemTypeMap } from '@/lib/packs/registry';

export const ReadingPack = {
  id: 'reading' as const,
  name: 'Reading',
  packVersion: '1.0.0',
  strands: READING_STRANDS,
  skills: READING_SKILLS,
  themes: READING_THEMES,
  getThemeHeader: getReadingThemeHeader,
  skillThemeTags(code: string) {
    return READING_SKILLS.find(s => s.code === code)?.themeTags ?? [];
  },
};

export const readingItemTypes: ItemTypeMap = {
  SightWordTap: {
    renderer: SightWordTap,
    score: scoreSightWordTap,
    getPromptText: (item) => item.content?.promptText ?? '',
  },
  PhonemeBlend: {
    renderer: PhonemeBlend,
    score: scorePhonemeBlend,
    getPromptText: (item) =>
      item.content?.promptText
        ?? `Blend: ${(item.content?.phonemes ?? []).join(' ')}`,
  },
  DigraphSort: {
    renderer: DigraphSort,
    score: scoreDigraphSort,
    getPromptText: (item) => item.content?.promptText ?? '',
  },
  ReadAloudSimple: {
    renderer: ReadAloudSimple,
    score: scoreReadAloudSimple,
    // The narrator should NOT speak the word aloud — the entire point is
    // for the child to read it themselves. Only narrate the prompt
    // (e.g. "Say it out loud.").
    getPromptText: (item) => item.content?.promptText ?? '',
  },
  SentenceComprehension: {
    renderer: SentenceComprehension,
    score: scoreSentenceComprehension,
    // Narrate the QUESTION, not the sentence — the sentence is the
    // exercise the child is reading. Hearing it read aloud first
    // would defeat the comprehension test.
    getPromptText: (item) => item.content?.question ?? item.content?.promptText ?? '',
  },
};
