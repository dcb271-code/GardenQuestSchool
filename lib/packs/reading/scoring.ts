import type { Item, ScoreOutcome } from '@/lib/types';

export function scoreSightWordTap(item: Item, response: any): ScoreOutcome {
  const expected = (item.answer as { word: string }).word;
  const given = (response as { chosen: string })?.chosen;
  return { outcome: given === expected ? 'correct' : 'incorrect' };
}

export function scorePhonemeBlend(item: Item, response: any): ScoreOutcome {
  const expected = (item.answer as { word: string }).word;
  const given = (response as { chosen: string })?.chosen;
  return { outcome: given === expected ? 'correct' : 'incorrect' };
}

export function scoreDigraphSort(item: Item, response: any): ScoreOutcome {
  const expected = (item.answer as { placements: Record<string, string> }).placements;
  const given = (response as { placements: Record<string, string> })?.placements ?? {};
  const words = Object.keys(expected);
  if (words.length === 0) return { outcome: 'incorrect' };
  const allCorrect = words.every(w => given[w] === expected[w]);
  return { outcome: allCorrect ? 'correct' : 'incorrect' };
}

export function scoreReadAloudSimple(item: Item, response: any): ScoreOutcome {
  return { outcome: (response as { claimed: boolean })?.claimed ? 'correct' : 'incorrect' };
}
