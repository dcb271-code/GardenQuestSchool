import { MATH_SKILLS } from './skills';
import { MATH_STRANDS } from './strands';
import { MATH_THEMES, getThemeHeader } from './themes';
import {
  scoreNumberBonds, scoreCountingTiles, scoreEquationTap,
  scoreNumberCompare, scorePlaceValueSplit, scoreMathResponse,
  scoreClockRead, scoreCoinSum, scoreEqualGroupsVisual, scoreArrayGridVisual,
} from './scoring';
import NumberBonds from './rendering/NumberBonds';
import CountingTiles from './rendering/CountingTiles';
import EquationTap from './rendering/EquationTap';
import NumberCompare from './rendering/NumberCompare';
import PlaceValueSplit from './rendering/PlaceValueSplit';
import ClockRead from './rendering/ClockRead';
import CoinSum from './rendering/CoinSum';
import EqualGroupsVisual from './rendering/EqualGroupsVisual';
import ArrayGridVisual from './rendering/ArrayGridVisual';
import type { ItemTypeMap } from '@/lib/packs/registry';

export const MathPack = {
  id: 'math' as const,
  name: 'Math',
  packVersion: '1.0.0',

  strands: MATH_STRANDS,
  skills: MATH_SKILLS,
  themes: MATH_THEMES,

  getThemeHeader,
  scoreResponse: scoreMathResponse,

  skillThemeTags(code: string) {
    return MATH_SKILLS.find(s => s.code === code)?.themeTags ?? [];
  },

  generateItems: async () => { throw new Error('Plan 3: AI generation'); },
  getPromptText: (item: any) => item.content?.promptText ?? '',
};

export const mathItemTypes: ItemTypeMap = {
  NumberBonds: {
    renderer: NumberBonds,
    score: scoreNumberBonds,
    getPromptText: (item) => item.content?.promptText ?? '',
  },
  CountingTiles: {
    renderer: CountingTiles,
    score: scoreCountingTiles,
    getPromptText: (item) => item.content?.promptText ?? '',
  },
  EquationTap: {
    renderer: EquationTap,
    score: scoreEquationTap,
    getPromptText: (item) => item.content?.promptText ?? item.content?.equation ?? '',
  },
  NumberCompare: {
    renderer: NumberCompare,
    score: scoreNumberCompare,
    getPromptText: (item) => item.content?.promptText ?? `Which is ${item.content?.left} compared to ${item.content?.right}?`,
  },
  PlaceValueSplit: {
    renderer: PlaceValueSplit,
    score: scorePlaceValueSplit,
    getPromptText: (item) => item.content?.promptText ?? `Split ${item.content?.number} into place values.`,
  },
  ClockRead: {
    renderer: ClockRead,
    score: scoreClockRead,
    getPromptText: (item) => item.content?.promptText ?? 'What time is shown?',
  },
  CoinSum: {
    renderer: CoinSum,
    score: scoreCoinSum,
    getPromptText: (item) => item.content?.promptText ?? 'How much money is this?',
  },
  EqualGroupsVisual: {
    renderer: EqualGroupsVisual,
    score: scoreEqualGroupsVisual,
    getPromptText: (item) =>
      item.content?.promptText
        ?? `${item.content?.groups} groups of ${item.content?.each} — how many in all?`,
  },
  ArrayGridVisual: {
    renderer: ArrayGridVisual,
    score: scoreArrayGridVisual,
    getPromptText: (item) =>
      item.content?.promptText
        ?? `An array with ${item.content?.rows} rows and ${item.content?.cols} in each — how many?`,
  },
};
