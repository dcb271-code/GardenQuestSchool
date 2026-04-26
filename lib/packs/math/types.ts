export type MathItemType =
  | 'NumberBonds'
  | 'CountingTiles'
  | 'EquationTap'
  | 'NumberCompare'
  | 'PlaceValueSplit';

export interface NumberBondsContent {
  type: 'NumberBonds';
  whole: number;
  knownPart: number;
  promptText: string;
}
export interface NumberBondsAnswer { missing: number }
export interface NumberBondsResponse { missing: number }

export interface CountingTilesContent {
  type: 'CountingTiles';
  emoji: string;
  count: number;
  promptText: string;
}
export interface CountingTilesAnswer { count: number }
export interface CountingTilesResponse { count: number }

// EquationTap is a generic "show this prompt + 4 tappable answers"
// item. Most uses are numeric, but it's also the renderer for binary
// even/odd choices ("even" / "odd"), so the choice/answer/response
// shapes are widened to accept strings as well as numbers. Scoring
// uses strict equality so mixing types in a single item is fine.
export interface EquationTapContent {
  type: 'EquationTap';
  equation: string;
  choices: Array<number | string>;
  promptText: string;
}
export interface EquationTapAnswer { correct: number | string }
export interface EquationTapResponse { chosen: number | string }

export type CompareSymbol = '<' | '>' | '=';
export interface NumberCompareContent {
  type: 'NumberCompare';
  left: number;
  right: number;
  promptText: string;
}
export interface NumberCompareAnswer { symbol: CompareSymbol }
export interface NumberCompareResponse { symbol: CompareSymbol }

export interface PlaceValueSplitContent {
  type: 'PlaceValueSplit';
  number: number;           // 2- or 3-digit target
  showHundreds: boolean;    // true when target >= 100
  promptText: string;
}
export interface PlaceValueSplitAnswer { hundreds?: number; tens: number; ones: number }
export interface PlaceValueSplitResponse { hundreds?: number; tens: number; ones: number }
