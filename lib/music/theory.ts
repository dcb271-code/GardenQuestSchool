// lib/music/theory.ts
//
// The small amount of music theory the app needs to reason about
// pitch, keys and the staff. Pure functions, no audio, no DOM.
//
// Two number lines matter and they are NOT the same:
//
//   MIDI number — every semitone counts, black keys included.
//                 C4 (middle C) = 60. Used for SOUND.
//   diatonic    — only letter names count, so C→D is 1 whether or not
//                 there is a black key between them. Used for the
//                 STAFF, because a staff line/space is a letter, not a
//                 semitone. This is why a "step" on the page can be
//                 either a tone or a semitone in the ear.

export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
export type Letter = typeof LETTERS[number];

/** Semitones above C for each letter. */
const SEMITONE_OF_LETTER: Record<Letter, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
};

export interface Note {
  letter: Letter;
  octave: number;      // scientific pitch: middle C is C4
  sharp?: boolean;     // black key a semitone above the letter
}

export const MIDDLE_C: Note = { letter: 'C', octave: 4 };

export function midiOf(n: Note): number {
  return (n.octave + 1) * 12 + SEMITONE_OF_LETTER[n.letter] + (n.sharp ? 1 : 0);
}

export function freqOf(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function freqOfNote(n: Note): number {
  return freqOf(midiOf(n));
}

/**
 * Position on the letter-name number line. Middle C is 28.
 * Adjacent diatonic values are adjacent line/space positions.
 */
export function diatonicOf(n: Note): number {
  return n.octave * 7 + LETTERS.indexOf(n.letter);
}

export function noteFromDiatonic(d: number): Note {
  const octave = Math.floor(d / 7);
  return { letter: LETTERS[((d % 7) + 7) % 7], octave };
}

export function noteName(n: Note): string {
  return `${n.letter}${n.sharp ? '♯' : ''}`;
}

/** Is this white key one of the 5 black-key positions? (never true for naturals) */
export function isWhite(n: Note): boolean {
  return !n.sharp;
}

// ─── Intervals, as a seven-year-old meets them ─────────────────────────

export type StepSkip = 'same' | 'step' | 'skip' | 'leap';

/**
 * How a pair of notes reads ON THE PAGE: neighbours are a step,
 * line-to-next-line (or space-to-space) is a skip, anything wider is a
 * leap. Deliberately diatonic — this is what a method book means.
 */
export function stepOrSkip(a: Note, b: Note): StepSkip {
  const d = Math.abs(diatonicOf(a) - diatonicOf(b));
  if (d === 0) return 'same';
  if (d === 1) return 'step';
  if (d === 2) return 'skip';
  return 'leap';
}

export type Direction = 'up' | 'down' | 'same';

export function directionOf(a: Note, b: Note): Direction {
  const x = midiOf(a), y = midiOf(b);
  return y > x ? 'up' : y < x ? 'down' : 'same';
}

// ─── The staff ─────────────────────────────────────────────────────────

export type Clef = 'treble' | 'bass';

/** The note sitting on the BOTTOM line of each clef. */
export const BOTTOM_LINE: Record<Clef, Note> = {
  treble: { letter: 'E', octave: 4 },
  bass: { letter: 'G', octave: 2 },
};

/**
 * Vertical position of a note in "half-spaces above the bottom line",
 * which is the natural unit for drawing: 0 = on the bottom line,
 * 1 = the space above it, 2 = the second line, and so on. Middle C in
 * treble clef comes out at -2, i.e. one ledger line below.
 */
export function staffPosition(n: Note, clef: Clef = 'treble'): number {
  return diatonicOf(n) - diatonicOf(BOTTOM_LINE[clef]);
}

/** True when the note needs ledger lines (outside the five lines). */
export function needsLedger(n: Note, clef: Clef = 'treble'): boolean {
  const p = staffPosition(n, clef);
  return p < 0 || p > 8;
}

// ─── Rhythm ────────────────────────────────────────────────────────────

export type NoteValue = 'whole' | 'half' | 'quarter' | 'eighth';

/** Beats in 4/4, which is the only metre an early method book uses. */
export const BEATS: Record<NoteValue, number> = {
  whole: 4, half: 2, quarter: 1, eighth: 0.5,
};

export const VALUE_NAME: Record<NoteValue, string> = {
  whole: 'whole note', half: 'half note', quarter: 'quarter note', eighth: 'eighth note',
};

/** How a child counts it out loud. */
export function countAloud(v: NoteValue): string {
  switch (v) {
    case 'whole': return '1 – 2 – 3 – 4';
    case 'half': return '1 – 2';
    case 'quarter': return '1';
    case 'eighth': return 'and';
  }
}

export function totalBeats(pattern: NoteValue[]): number {
  return pattern.reduce((sum, v) => sum + BEATS[v], 0);
}

/** A bar of 4/4 must add up to exactly four beats. */
export function isFullBar(pattern: NoteValue[]): boolean {
  return Math.abs(totalBeats(pattern) - 4) < 1e-9;
}

// ─── C position — where an early pianist actually lives ────────────────

/** The five notes under the right hand in C position, fingers 1–5. */
export const C_POSITION: Note[] = [
  { letter: 'C', octave: 4 },
  { letter: 'D', octave: 4 },
  { letter: 'E', octave: 4 },
  { letter: 'F', octave: 4 },
  { letter: 'G', octave: 4 },
];

export const FINGER_OF_C_POSITION: Record<Letter, number> = {
  C: 1, D: 2, E: 3, F: 4, G: 5, A: 0, B: 0,
};

/**
 * One octave of keys from a starting C, as they appear on a keyboard —
 * white keys with their black keys attached. Used to draw the keyboard
 * and to talk about the groups of two and three.
 */
export function octaveKeys(octave: number): Array<{ note: Note; blackAfter?: Note }> {
  return LETTERS.map(letter => {
    const note: Note = { letter, octave };
    // No black key after E or B — that is what makes the 2-and-3 groups.
    const hasBlack = letter !== 'E' && letter !== 'B';
    return hasBlack ? { note, blackAfter: { letter, octave, sharp: true } } : { note };
  });
}
