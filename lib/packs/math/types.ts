export type MathItemType =
  | 'NumberBonds'
  | 'CountingTiles'
  | 'EquationTap'
  | 'NumberCompare'
  | 'PlaceValueSplit'
  | 'ClockRead'
  | 'CoinSum'
  | 'EqualGroupsVisual'
  | 'ArrayGridVisual'
  | 'FractionIdentify'
  | 'FractionCompareVisual'
  | 'ClockInterval'
  | 'EqualShareVisual';

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

// ── Clock reading (CCSS 2.MD.C.7) ────────────────────────────────────
// hour 1..12, minute in {0,5,10,...,55}. Multiple-choice strings
// like "3:25" / "9:00".
export interface ClockReadContent {
  type: 'ClockRead';
  hour: number;            // 1..12 (the hour the hour-hand should be near)
  minute: number;          // 0..55, multiples of 5
  choices: string[];       // "h:mm" formatted, includes the correct one
  promptText: string;
}
export interface ClockReadAnswer { time: string }    // "h:mm"
export interface ClockReadResponse { chosen: string }

// ── Coin counting (CCSS 2.MD.C.8) ────────────────────────────────────
// Show a collection of coins and ask the total in cents.
export type CoinKind = 'penny' | 'nickel' | 'dime' | 'quarter';
export interface CoinSumContent {
  type: 'CoinSum';
  // Coins in the order they should be displayed left-to-right.
  coins: CoinKind[];
  // Multiple-choice cent values; includes the correct one.
  choices: number[];
  promptText: string;
}
export interface CoinSumAnswer { cents: number }
export interface CoinSumResponse { chosen: number }

// ── Multiplication: equal groups, visualized (CCSS 2.OA.C.4 / 3.OA.A.1) ─
// Show `groups` rings, each containing `each` emoji items. Multiple
// choice with the total.
export interface EqualGroupsVisualContent {
  type: 'EqualGroupsVisual';
  groups: number;          // number of rings, 2..6
  each: number;            // items in each ring, 2..6
  emoji: string;           // the item rendered inside each ring (one char)
  choices: number[];       // includes the correct total
  promptText: string;
}
export interface EqualGroupsVisualAnswer { total: number }
export interface EqualGroupsVisualResponse { chosen: number }

// ── Multiplication: rectangular array, visualized ───────────────────
export interface ArrayGridVisualContent {
  type: 'ArrayGridVisual';
  rows: number;            // 2..6
  cols: number;            // 2..6
  emoji: string;           // single char rendered in each cell
  choices: number[];       // includes the correct total
  promptText: string;
}
export interface ArrayGridVisualAnswer { total: number }
export interface ArrayGridVisualResponse { chosen: number }

// ── Fractions: identify (CCSS 3.NF.A.1) ─────────────────────────────
// Show a pie or bar split into `denominator` equal parts with
// `numerator` of them shaded; child picks the matching fraction.
export interface FractionIdentifyContent {
  type: 'FractionIdentify';
  numerator: number;       // 1..(denominator-1) for "true" fractions
  denominator: number;     // 2..8
  shape: 'pie' | 'bar';    // visualisation style
  // Choices are formatted strings like "1/2", "3/4". Includes the
  // correct one.
  choices: string[];
  promptText: string;
}
export interface FractionIdentifyAnswer { fraction: string }   // "n/d"
export interface FractionIdentifyResponse { chosen: string }

// ── Fractions: compare two fractions visually (CCSS 3.NF.A.3.d) ─────
// Show two fractions side by side (each with its own pie/bar). Child
// picks <, >, or =.
export interface FractionCompareVisualContent {
  type: 'FractionCompareVisual';
  left: { numerator: number; denominator: number };
  right: { numerator: number; denominator: number };
  shape: 'pie' | 'bar';
  promptText: string;
}
export interface FractionCompareVisualAnswer { symbol: '<' | '>' | '=' }
export interface FractionCompareVisualResponse { symbol: '<' | '>' | '=' }

// ── Time intervals (CCSS 3.MD.A.1) ──────────────────────────────────
// Two analog clocks side by side ("now" and "then"); child picks how
// much time has passed.
export interface ClockIntervalContent {
  type: 'ClockInterval';
  startHour: number;       // 1..12
  startMinute: number;     // 0..55, multiples of 5
  endHour: number;         // 1..12
  endMinute: number;       // 0..55, multiples of 5
  // Choices are formatted strings like "35 minutes" / "1 hour 15 min".
  // Includes the correct one.
  choices: string[];
  promptText: string;
}
export interface ClockIntervalAnswer { interval: string }
export interface ClockIntervalResponse { chosen: string }

// ── Division: equal-share visualization (CCSS 3.OA.A.2) ─────────────
// Show `total` items distributed across `groups` plates/bowls. The
// child reads off how many ended up in each group.
export interface EqualShareVisualContent {
  type: 'EqualShareVisual';
  total: number;           // total items, 4..30
  groups: number;          // number of groups, 2..6
  emoji: string;           // single char of the item being shared
  groupEmoji: string;      // single char of the container (plate/bowl/nest)
  // Multiple choice — number per group.
  choices: number[];
  promptText: string;
}
export interface EqualShareVisualAnswer { each: number }
export interface EqualShareVisualResponse { chosen: number }
