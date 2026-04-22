import type { Item, ScoreOutcome } from '@/lib/types';

export function scoreMathResponse(item: Item, response: any): ScoreOutcome {
  switch (item.type) {
    case 'NumberBonds': {
      const expected = (item.answer as { missing: number }).missing;
      const given = (response as { missing: number })?.missing;
      return { outcome: given === expected ? 'correct' : 'incorrect' };
    }
    case 'CountingTiles': {
      const expected = (item.answer as { count: number }).count;
      const given = (response as { count: number })?.count;
      return { outcome: given === expected ? 'correct' : 'incorrect' };
    }
    case 'EquationTap': {
      const expected = (item.answer as { correct: number }).correct;
      const given = (response as { chosen: number })?.chosen;
      return { outcome: given === expected ? 'correct' : 'incorrect' };
    }
    default:
      throw new Error(`Unknown math item type: ${item.type}`);
  }
}
