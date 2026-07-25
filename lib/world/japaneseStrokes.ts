// lib/world/japaneseStrokes.ts
//
// Stroke-by-stroke guides for tracing, in a 0–100 box.
//
// IMPORTANT about accuracy: these paths are hand-authored
// approximations of each glyph's skeleton. They are NOT a substitute
// for the real letterform, and they aren't trying to be — the TracePad
// renders the actual character from the device font behind the guide,
// so the child always sees the true shape. What these paths carry is
// the part a font cannot give you:
//
//   • how many strokes there are
//   • what ORDER they go in
//   • which DIRECTION each one travels
//
// That is the pedagogically load-bearing content in Japanese
// handwriting, and it's what the tracing checks.
//
// Characters without an entry simply don't offer tracing — the more
// intricate kanji (桜 菊 藤 苔 花 竹) stay recognition-only until
// their strokes can be authored properly rather than guessed at.

export interface StrokeSet {
  /** SVG path `d` strings, in writing order, each drawn start → end. */
  strokes: string[];
  /** What to say aloud when the character is finished. */
  say: string;
}

export const STROKE_DATA: Record<string, StrokeSet> = {
  // ── HIRAGANA: あ row ────────────────────────────────────────────
  'あ': { say: 'あ', strokes: [
    'M 22 32 L 70 30',
    'M 50 16 C 47 40, 44 62, 39 84',
    'M 72 42 C 50 44, 26 56, 30 74 C 34 88, 60 84, 66 66',
  ]},
  'い': { say: 'い', strokes: [
    'M 28 28 C 23 48, 25 66, 40 68',
    'M 72 32 C 72 46, 71 54, 66 60',
  ]},
  'う': { say: 'う', strokes: [
    'M 38 18 L 64 18',
    'M 28 38 C 52 28, 76 36, 73 55 C 70 74, 52 84, 32 86',
  ]},
  'え': { say: 'え', strokes: [
    'M 40 16 L 62 16',
    'M 60 30 C 44 44, 32 52, 45 59 C 33 70, 26 80, 23 85 C 45 85, 64 85, 80 82',
  ]},
  'お': { say: 'お', strokes: [
    'M 20 34 L 64 32',
    'M 45 16 C 42 44, 35 66, 34 77 C 34 87, 51 87, 55 74 C 59 60, 44 56, 31 64',
    'M 73 40 C 78 47, 78 54, 73 58',
  ]},

  // ── HIRAGANA: か row ────────────────────────────────────────────
  'か': { say: 'か', strokes: [
    'M 19 36 C 36 33, 45 40, 43 57 C 41 73, 32 81, 21 83',
    'M 57 21 C 55 44, 52 65, 48 83',
    'M 73 40 C 79 48, 79 55, 74 61',
  ]},
  'き': { say: 'き', strokes: [
    'M 22 30 L 69 26',
    'M 18 47 L 65 43',
    'M 61 15 C 53 40, 43 62, 34 72',
    'M 34 72 C 41 81, 53 85, 63 80',
  ]},
  'く': { say: 'く', strokes: [
    'M 62 19 L 29 50 L 64 83',
  ]},
  'け': { say: 'け', strokes: [
    'M 26 22 C 24 46, 24 66, 20 85',
    'M 44 34 L 78 32',
    'M 63 19 C 63 47, 62 67, 59 77 C 57 85, 68 87, 74 80',
  ]},
  'こ': { say: 'こ', strokes: [
    'M 24 30 C 44 27, 62 27, 73 30',
    'M 27 66 C 44 75, 63 75, 75 66',
  ]},

  // ── HIRAGANA: さ row ────────────────────────────────────────────
  'さ': { say: 'さ', strokes: [
    'M 22 30 L 69 26',
    'M 57 13 C 51 36, 43 53, 34 63',
    'M 61 56 C 44 54, 28 62, 30 75 C 32 85, 49 87, 59 80',
  ]},
  'し': { say: 'し', strokes: [
    'M 33 17 C 31 46, 33 69, 46 77 C 59 85, 71 76, 76 63',
  ]},
  'す': { say: 'す', strokes: [
    'M 21 32 L 73 30',
    'M 57 15 C 55 40, 51 58, 45 68 C 36 81, 47 89, 55 80 C 61 71, 52 63, 39 66',
  ]},
  'せ': { say: 'せ', strokes: [
    'M 19 40 L 76 36',
    'M 40 19 C 40 44, 38 65, 36 82',
    'M 67 21 C 65 45, 63 63, 65 75 C 67 85, 78 83, 82 76',
  ]},
  'そ': { say: 'そ', strokes: [
    'M 26 25 L 71 23 L 36 50 L 73 47 C 61 66, 46 79, 31 85',
  ]},

  // ── HIRAGANA: た row ────────────────────────────────────────────
  'た': { say: 'た', strokes: [
    'M 17 34 L 57 32',
    'M 41 17 C 38 43, 34 65, 27 84',
    'M 63 44 L 86 42',
    'M 62 62 C 70 71, 79 71, 87 64',
  ]},
  'ち': { say: 'ち', strokes: [
    'M 22 27 L 71 23',
    'M 55 11 C 48 34, 40 53, 36 65 C 31 79, 52 86, 67 74',
  ]},
  'つ': { say: 'つ', strokes: [
    'M 23 34 C 46 25, 72 30, 74 47 C 76 65, 57 81, 33 84',
  ]},
  'て': { say: 'て', strokes: [
    'M 23 27 L 72 25 C 59 42, 48 59, 46 71 C 44 83, 57 85, 68 78',
  ]},
  'と': { say: 'と', strokes: [
    'M 39 26 L 53 34',
    'M 36 15 C 36 40, 34 63, 41 75 C 49 85, 68 78, 78 65',
  ]},

  // ── HIRAGANA: な row ────────────────────────────────────────────
  'な': { say: 'な', strokes: [
    'M 17 34 L 59 32',
    'M 41 17 C 38 44, 34 67, 27 85',
    'M 69 21 C 71 30, 71 37, 68 43',
    'M 60 54 C 47 53, 39 64, 46 73 C 53 81, 68 76, 71 63',
  ]},
  'に': { say: 'に', strokes: [
    'M 26 21 C 24 46, 24 67, 22 85',
    'M 48 36 L 80 34',
    'M 46 68 L 84 66',
  ]},
  'ぬ': { say: 'ぬ', strokes: [
    'M 24 29 C 33 48, 35 67, 26 84',
    'M 55 19 C 40 36, 29 59, 40 73 C 51 85, 74 79, 76 62 C 78 45, 59 43, 50 56 C 43 67, 54 77, 67 79',
  ]},
  'ね': { say: 'ね', strokes: [
    'M 26 21 C 24 46, 24 67, 22 85',
    'M 46 25 C 57 40, 63 57, 56 71 C 50 83, 65 87, 75 79 C 84 70, 75 57, 62 62 C 52 66, 54 79, 67 83',
  ]},
  'の': { say: 'の', strokes: [
    'M 64 25 C 45 22, 26 37, 28 56 C 30 75, 51 84, 67 73 C 80 64, 80 45, 69 33',
  ]},

  // ── KANJI: numbers ─────────────────────────────────────────────
  '一': { say: 'いち', strokes: [
    'M 15 50 L 85 48',
  ]},
  '二': { say: 'に', strokes: [
    'M 26 34 L 74 32',
    'M 15 68 L 85 66',
  ]},
  '三': { say: 'さん', strokes: [
    'M 24 27 L 76 25',
    'M 32 50 L 68 48',
    'M 15 74 L 85 72',
  ]},

  // ── KANJI: little pictures ─────────────────────────────────────
  '木': { say: 'き', strokes: [
    'M 14 36 L 86 34',
    'M 50 15 L 49 86',
    'M 48 43 C 38 57, 26 70, 15 80',
    'M 52 45 C 62 58, 74 70, 85 80',
  ]},
  '山': { say: 'やま', strokes: [
    'M 50 19 L 50 74',
    'M 22 33 L 21 77 L 81 75',
    'M 79 25 L 79 74',
  ]},
  '川': { say: 'かわ', strokes: [
    'M 23 21 C 21 44, 19 66, 15 83',
    'M 49 28 L 49 73',
    'M 79 21 C 79 48, 79 68, 77 85',
  ]},
  '日': { say: 'ひ', strokes: [
    'M 28 19 L 27 83',
    'M 28 19 L 74 19 L 73 83',
    'M 28 51 L 73 50',
    'M 27 83 L 73 82',
  ]},
};

export function strokesFor(char: string): StrokeSet | undefined {
  return STROKE_DATA[char];
}

export function canTrace(char: string): boolean {
  return char in STROKE_DATA;
}
