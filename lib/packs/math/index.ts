import { MATH_SKILLS } from './skills';
import { MATH_STRANDS } from './strands';
import { MATH_THEMES, getThemeHeader } from './themes';
import { scoreNumberBonds, scoreCountingTiles, scoreEquationTap, scoreMathResponse } from './scoring';
import NumberBonds from './rendering/NumberBonds';
import CountingTiles from './rendering/CountingTiles';
import EquationTap from './rendering/EquationTap';
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
};
