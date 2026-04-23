import type { Item, ScoreOutcome } from '@/lib/types';

export function scoreNumberBonds(item: Item, response: any): ScoreOutcome {
  const expected = (item.answer as { missing: number }).missing;
  const given = (response as { missing: number })?.missing;
  return { outcome: given === expected ? 'correct' : 'incorrect' };
}

export function scoreCountingTiles(item: Item, response: any): ScoreOutcome {
  const expected = (item.answer as { count: number }).count;
  const given = (response as { count: number })?.count;
  return { outcome: given === expected ? 'correct' : 'incorrect' };
}

export function scoreEquationTap(item: Item, response: any): ScoreOutcome {
  const expected = (item.answer as { correct: number }).correct;
  const given = (response as { chosen: number })?.chosen;
  return { outcome: given === expected ? 'correct' : 'incorrect' };
}

export function scoreMathResponse(item: Item, response: any): ScoreOutcome {
  switch (item.type) {
    case 'NumberBonds': return scoreNumberBonds(item, response);
    case 'CountingTiles': return scoreCountingTiles(item, response);
    case 'EquationTap': return scoreEquationTap(item, response);
    default:
      throw new Error(`Unknown math item type: ${item.type}`);
  }
}
