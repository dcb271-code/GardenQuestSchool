export type MathItemType = 'NumberBonds' | 'CountingTiles' | 'EquationTap';

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

export interface EquationTapContent {
  type: 'EquationTap';
  equation: string;
  choices: number[];
  promptText: string;
}
export interface EquationTapAnswer { correct: number }
export interface EquationTapResponse { chosen: number }
