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

export function scoreNumberCompare(item: Item, response: any): ScoreOutcome {
  const expected = (item.answer as { symbol: string }).symbol;
  const given = (response as { symbol: string })?.symbol;
  return { outcome: given === expected ? 'correct' : 'incorrect' };
}

export function scorePlaceValueSplit(item: Item, response: any): ScoreOutcome {
  const expected = item.answer as { hundreds?: number; tens: number; ones: number };
  const given = response as { hundreds?: number; tens: number; ones: number };
  if (!given) return { outcome: 'incorrect' };
  if (given.tens !== expected.tens) return { outcome: 'incorrect' };
  if (given.ones !== expected.ones) return { outcome: 'incorrect' };
  if (expected.hundreds !== undefined && given.hundreds !== expected.hundreds) {
    return { outcome: 'incorrect' };
  }
  return { outcome: 'correct' };
}

export function scoreMathResponse(item: Item, response: any): ScoreOutcome {
  switch (item.type) {
    case 'NumberBonds': return scoreNumberBonds(item, response);
    case 'CountingTiles': return scoreCountingTiles(item, response);
    case 'EquationTap': return scoreEquationTap(item, response);
    case 'NumberCompare': return scoreNumberCompare(item, response);
    case 'PlaceValueSplit': return scorePlaceValueSplit(item, response);
    default:
      throw new Error(`Unknown math item type: ${item.type}`);
  }
}
