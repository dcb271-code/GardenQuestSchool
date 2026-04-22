import { MATH_SKILLS } from './skills';
import { MATH_STRANDS } from './strands';
import { MATH_THEMES, getThemeHeader } from './themes';
import { scoreMathResponse } from './scoring';

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

  // Plan 2 fills these in
  generateItems: async () => { throw new Error('Plan 2: AI generation'); },
  getPromptText: (item: any) => item.content?.promptText ?? '',
};
