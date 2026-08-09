// lib/music/curriculum.ts
//
// A self-contained theory course for a seven-year-old who is already
// in an early method book: reading around C position, quarter/half/
// whole notes, steps and skips.
//
// Four strands run through it, because they teach different senses and
// a pianist needs all four:
//   keyboard  — where the notes LIVE under the hand
//   notation  — what they look like on the page
//   ear       — what they sound like
//   rhythm    — how long they last
//
// Each unit teaches (a page or two of explanation) and then practises
// with GENERATED exercises, so the same unit is different every visit
// and can't be memorised by position. Every answered exercise is
// recorded as an attempt, which is what makes music practice grow
// plants in the garden like any other question.
//
// Adding a unit later — including one that mirrors whatever her
// teacher assigns this month — means appending to UNITS. Nothing else
// needs to change.

import {
  LETTERS, C_POSITION, FINGER_OF_C_POSITION, MIDDLE_C,
  midiOf, noteName, diatonicOf, noteFromDiatonic, stepOrSkip, directionOf,
  BEATS, VALUE_NAME, countAloud, isFullBar,
  type Note, type NoteValue, type Letter, type Clef,
} from './theory';

export type Strand = 'keyboard' | 'notation' | 'ear' | 'rhythm';

export const STRAND_LABEL: Record<Strand, string> = {
  keyboard: 'the keys',
  notation: 'reading',
  ear: 'listening',
  rhythm: 'rhythm',
};

export const STRAND_EMOJI: Record<Strand, string> = {
  keyboard: '🎹', notation: '🎼', ear: '👂', rhythm: '🥁',
};

/** A page of teaching, shown before the practice. */
export interface TeachPage {
  heading: string;
  body: string;
  /** Optional visual the lesson screen knows how to draw. */
  figure?:
    | { kind: 'keyboard'; highlight?: string[]; labelWhite?: boolean; octaves?: number }
    | { kind: 'staff'; notes: Note[]; caption?: string; clef?: Clef }
    | { kind: 'rhythm'; pattern: NoteValue[] }
    | { kind: 'fingers' };
}

export interface MusicUnit {
  code: string;
  title: string;
  strand: Strand;
  blurb: string;
  teach: TeachPage[];
  /** How many generated exercises make one pass of this unit. */
  exerciseCount: number;
  outro: string;
}

// ─── EXERCISES ─────────────────────────────────────────────────────────

export type Exercise =
  /** Tap a key on the drawn keyboard. */
  | { kind: 'find_key'; prompt: string; answer: string; keys: Note[]; hint: string }
  /** Multiple choice about a note drawn on a staff. */
  | { kind: 'read_note'; prompt: string; note: Note; choices: string[]; correctIndex: number; hint: string; clef?: Clef }
  /** Listen, then choose. */
  | { kind: 'listen'; prompt: string; midis: number[]; playTogether?: boolean; choices: string[]; correctIndex: number; hint: string }
  /** Tap the rhythm back. */
  | { kind: 'tap_rhythm'; prompt: string; pattern: NoteValue[]; bpm: number; hint: string }
  /** Multiple choice about a drawn rhythm. */
  | { kind: 'read_rhythm'; prompt: string; pattern: NoteValue[]; choices: string[]; correctIndex: number; hint: string }
  /**
   * Hear a short melody (optionally with the keys lighting up), then
   * play it back on the keyboard. Imitation before notation — the
   * oldest idea in music teaching and the heart of Gordon's audiation
   * sequence. Cecily asked for this one herself.
   */
  | { kind: 'echo_melody'; prompt: string; midis: number[]; beats?: number[]; showLights: boolean; hint: string };

/** Deterministic PRNG so a seeded exercise set is reproducible in tests. */
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

function pick<T>(arr: readonly T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function mc(correct: string, wrong: string[], rand: () => number) {
  const choices = shuffle([correct, ...wrong], rand);
  return { choices, correctIndex: choices.indexOf(correct) };
}

const WHITE_LETTERS = LETTERS;

/** Notes an early reader meets: middle C up to G above, plus A and B. */
const READING_RANGE: Note[] = [
  { letter: 'C', octave: 4 }, { letter: 'D', octave: 4 }, { letter: 'E', octave: 4 },
  { letter: 'F', octave: 4 }, { letter: 'G', octave: 4 }, { letter: 'A', octave: 4 },
  { letter: 'B', octave: 4 }, { letter: 'C', octave: 5 },
];

const QUARTER_BARS: NoteValue[][] = [
  ['quarter', 'quarter', 'quarter', 'quarter'],
  ['half', 'quarter', 'quarter'],
  ['quarter', 'quarter', 'half'],
  ['half', 'half'],
  ['quarter', 'half', 'quarter'],
  ['whole'],
];

/**
 * A singable little melody in C position.
 *
 * Rules that make it echo-able rather than random: it starts on a note
 * of the tonic chord, moves mostly by step, never leaps more than a
 * third, and comes to rest on C or G. That is what makes a phrase feel
 * finished — and a phrase that feels finished is far easier to hold in
 * your head, which is the whole skill being trained.
 */
function makeMelody(length: number, rand: () => number): number[] {
  const C = 60;
  const scale = [0, 2, 4, 5, 7];            // C D E F G, as offsets
  const restful = [0, 4, 7];                // C, E, G — the tonic chord
  const restfulIdx = restful.map(o => scale.indexOf(o));   // C, E, G
  let idx = restfulIdx[Math.floor(rand() * restfulIdx.length)];
  const out = [C + scale[idx]];
  for (let i = 1; i < length; i++) {
    const last = i === length - 1;
    if (last) {
      // Settle on the NEAREST restful note. Jumping to a fixed one
      // could span a 4th or more, which contradicts the whole point of
      // keeping the phrase singable — and every position is at most one
      // scale-step from C, E or G anyway.
      const best = Math.min(...restfulIdx.map(r => Math.abs(r - idx)));
      const options = restfulIdx.filter(r => Math.abs(r - idx) === best);
      idx = options[Math.floor(rand() * options.length)];
    } else {
      const move = rand() < 0.72 ? 1 : 2;    // mostly steps, some skips
      const dir = rand() < 0.5 ? -1 : 1;
      idx = Math.max(0, Math.min(scale.length - 1, idx + move * dir));
    }
    out.push(C + scale[idx]);
  }
  return out;
}

/** Rhythms that fit a short phrase, in beats. */
function makeEchoRhythm(length: number, rand: () => number): number[] {
  const out: number[] = [];
  for (let i = 0; i < length; i++) {
    const last = i === length - 1;
    // End long, so the phrase settles instead of stopping abruptly.
    out.push(last ? 2 : rand() < 0.7 ? 1 : 0.5);
  }
  return out;
}

export function buildExercises(unit: MusicUnit, seed: number): Exercise[] {
  const rand = rng(seed);
  const out: Exercise[] = [];
  for (let i = 0; i < unit.exerciseCount; i++) {
    out.push(exerciseFor(unit.code, rand));
  }
  return out;
}

function exerciseFor(unitCode: string, rand: () => number): Exercise {
  switch (unitCode) {
    // ── KEYBOARD ────────────────────────────────────────────────────
    case 'black_key_groups': {
      const wantTwo = rand() < 0.5;
      return {
        kind: 'find_key',
        prompt: wantTwo
          ? 'Tap a black key in a group of TWO.'
          : 'Tap a black key in a group of THREE.',
        answer: wantTwo ? 'group2' : 'group3',
        keys: [],
        hint: wantTwo
          ? 'The twos are C♯ and D♯ — they sit together with a gap after.'
          : 'The threes are F♯, G♯ and A♯ — the wider huddle.',
      };
    }
    case 'find_c': {
      const target = pick(['C', 'F'] as const, rand);
      return {
        kind: 'find_key',
        prompt: `Tap ${target}.`,
        answer: target,
        keys: [],
        hint: target === 'C'
          ? 'C hides just to the LEFT of the two black keys.'
          : 'F is just to the LEFT of the three black keys.',
      };
    }
    case 'c_position': {
      const note = pick(C_POSITION, rand);
      const useFinger = rand() < 0.45;
      if (useFinger) {
        return {
          kind: 'find_key',
          prompt: `In C position, tap the key for finger ${FINGER_OF_C_POSITION[note.letter]}.`,
          answer: note.letter,
          keys: C_POSITION,
          hint: 'Thumb is 1 on C, and the fingers climb up: D is 2, E is 3, F is 4, G is 5.',
        };
      }
      return {
        kind: 'find_key',
        prompt: `Tap ${note.letter}.`,
        answer: note.letter,
        keys: C_POSITION,
        hint: 'Find C first — left of the two black keys — then walk up the white keys.',
      };
    }

    // ── NOTATION ────────────────────────────────────────────────────
    case 'staff_and_middle_c': {
      const note = pick(READING_RANGE.slice(0, 5), rand);
      const wrong = shuffle(WHITE_LETTERS.filter(l => l !== note.letter), rand).slice(0, 3);
      const { choices, correctIndex } = mc(note.letter, wrong as string[], rand);
      return {
        kind: 'read_note',
        prompt: 'Which note is this?',
        note,
        choices,
        correctIndex,
        hint: 'Middle C sits on its own little line UNDER the staff. Count up from there.',
      };
    }
    case 'reading_up_to_c': {
      const note = pick(READING_RANGE, rand);
      const wrong = shuffle(WHITE_LETTERS.filter(l => l !== note.letter), rand).slice(0, 3);
      const { choices, correctIndex } = mc(note.letter, wrong as string[], rand);
      return {
        kind: 'read_note',
        prompt: 'Name this note.',
        note,
        choices,
        correctIndex,
        hint: 'The bottom line is E, and the spaces spell F–A–C–E going up.',
      };
    }
    case 'steps_and_skips': {
      const startD = diatonicOf(pick(READING_RANGE.slice(0, 5), rand));
      const isStep = rand() < 0.5;
      const up = rand() < 0.5;
      const delta = (isStep ? 1 : 2) * (up ? 1 : -1);
      const a = noteFromDiatonic(startD);
      const b = noteFromDiatonic(startD + delta);
      const correct = isStep ? 'a step' : 'a skip';
      const { choices, correctIndex } = mc(correct, [isStep ? 'a skip' : 'a step', 'the same note'], rand);
      return {
        kind: 'read_note',
        prompt: `From ${noteName(a)} to ${noteName(b)} — step or skip?`,
        note: b,
        choices,
        correctIndex,
        hint: 'A step goes line→space, next door. A skip jumps line→line or space→space.',
      };
    }

    // ── EAR ─────────────────────────────────────────────────────────
    case 'high_and_low': {
      const base = midiOf(MIDDLE_C);
      const a = base + Math.floor(rand() * 5);
      const up = rand() < 0.5;
      const b = a + (up ? 7 + Math.floor(rand() * 5) : -(7 + Math.floor(rand() * 5)));
      const correct = up ? 'higher' : 'lower';
      const { choices, correctIndex } = mc(correct, [up ? 'lower' : 'higher'], rand);
      return {
        kind: 'listen',
        prompt: 'Is the second note higher or lower?',
        midis: [a, b],
        choices,
        correctIndex,
        hint: 'Higher notes live to the RIGHT on the keyboard, and sound brighter.',
      };
    }
    case 'hear_step_or_skip': {
      const startD = diatonicOf(pick(C_POSITION, rand));
      const isStep = rand() < 0.5;
      const up = rand() < 0.5;
      const a = noteFromDiatonic(startD);
      const b = noteFromDiatonic(startD + (isStep ? 1 : 2) * (up ? 1 : -1));
      const correct = isStep ? 'a step' : 'a skip';
      const { choices, correctIndex } = mc(correct, [isStep ? 'a skip' : 'a step'], rand);
      return {
        kind: 'listen',
        prompt: 'Step or skip?',
        midis: [midiOf(a), midiOf(b)],
        choices,
        correctIndex,
        hint: 'A step is next-door neighbors. A skip hops over a key and sounds wider.',
      };
    }
    case 'same_or_different': {
      const a = midiOf(pick(C_POSITION, rand));
      const same = rand() < 0.5;
      const b = same ? a : a + (rand() < 0.5 ? 1 : 2) * (rand() < 0.5 ? 1 : -1);
      const correct = same ? 'the same' : 'different';
      const { choices, correctIndex } = mc(correct, [same ? 'different' : 'the same'], rand);
      return {
        kind: 'listen',
        prompt: 'Are these two notes the same, or different?',
        midis: [a, b],
        choices,
        correctIndex,
        hint: 'Listen for whether the second one moves at all.',
      };
    }

    // ── RHYTHM ──────────────────────────────────────────────────────
    case 'note_values': {
      const value = pick(['whole', 'half', 'quarter'] as const, rand);
      const correct = `${BEATS[value]} beat${BEATS[value] === 1 ? '' : 's'}`;
      const wrong = (['whole', 'half', 'quarter'] as const)
        .filter(v => v !== value)
        .map(v => `${BEATS[v]} beat${BEATS[v] === 1 ? '' : 's'}`);
      const { choices, correctIndex } = mc(correct, wrong, rand);
      return {
        kind: 'read_rhythm',
        prompt: `How many beats does a ${VALUE_NAME[value]} get?`,
        pattern: [value],
        choices,
        correctIndex,
        hint: `Count it: ${countAloud(value)}.`,
      };
    }
    case 'counting_bars': {
      const bar = pick(QUARTER_BARS, rand);
      const correct = 'yes — exactly 4';
      const short = bar.slice(0, -1);
      const useFull = rand() < 0.5;
      const pattern = useFull ? bar : short;
      const { choices, correctIndex } = mc(
        useFull ? correct : 'no — it is short',
        [useFull ? 'no — it is short' : correct],
        rand,
      );
      return {
        kind: 'read_rhythm',
        prompt: 'Does this bar add up to 4 beats?',
        pattern,
        choices,
        correctIndex,
        hint: 'Add them up: a whole is 4, a half is 2, a quarter is 1.',
      };
    }
    // ── ECHO ────────────────────────────────────────────────────────
    case 'echo_three':
      return {
        kind: 'echo_melody',
        prompt: 'Listen, then play it back.',
        midis: makeMelody(3, rand),
        showLights: true,
        hint: 'Watch which stones light up, and hum it to yourself before you play.',
      };
    case 'echo_five':
      return {
        kind: 'echo_melody',
        prompt: 'A longer one. Listen all the way through first.',
        midis: makeMelody(5, rand),
        showLights: true,
        hint: 'Try to hear the shape — where it goes up, where it comes back down.',
      };
    case 'echo_by_ear': {
      const len = 3 + Math.floor(rand() * 2);
      return {
        kind: 'echo_melody',
        prompt: 'No lights this time. Just your ears.',
        midis: makeMelody(len, rand),
        showLights: false,
        hint: 'Sing it back first, then find the notes. Your voice knows before your fingers do.',
      };
    }
    case 'echo_with_rhythm': {
      const len = 4;
      const midis = makeMelody(len, rand);
      return {
        kind: 'echo_melody',
        prompt: 'Same tune AND the same lengths — hold the long ones.',
        midis,
        beats: makeEchoRhythm(len, rand),
        showLights: true,
        hint: 'Listen for which notes linger. A long note is worth waiting on.',
      };
    }

    // ── BASS CLEF ───────────────────────────────────────────────────
    case 'bass_clef_intro': {
      const notes: Note[] = [
        { letter: 'G', octave: 2 }, { letter: 'B', octave: 2 }, { letter: 'D', octave: 3 },
        { letter: 'F', octave: 3 }, { letter: 'A', octave: 3 },
      ];
      const note = pick(notes, rand);
      const wrong = shuffle(WHITE_LETTERS.filter(l => l !== note.letter), rand).slice(0, 3);
      const { choices, correctIndex } = mc(note.letter, wrong as string[], rand);
      return {
        kind: 'read_note',
        prompt: 'Name this note — bass clef.',
        note,
        choices,
        correctIndex,
        hint: 'Bass lines climb G–B–D–F–A. The two dots hug the F line.',
        clef: 'bass',
      };
    }
    case 'bass_reading': {
      const notes: Note[] = [
        { letter: 'F', octave: 2 }, { letter: 'G', octave: 2 }, { letter: 'A', octave: 2 },
        { letter: 'B', octave: 2 }, { letter: 'C', octave: 3 }, { letter: 'D', octave: 3 },
        { letter: 'E', octave: 3 }, { letter: 'F', octave: 3 }, { letter: 'A', octave: 3 },
      ];
      const note = pick(notes, rand);
      const wrong = shuffle(WHITE_LETTERS.filter(l => l !== note.letter), rand).slice(0, 3);
      const { choices, correctIndex } = mc(note.letter, wrong as string[], rand);
      return {
        kind: 'read_note',
        prompt: 'Name this note.',
        note,
        choices,
        correctIndex,
        hint: 'Spaces are A–C–E–G going up. Lines are G–B–D–F–A.',
        clef: 'bass',
      };
    }

    // ── INTERVALS BY NUMBER ─────────────────────────────────────────
    case 'intervals_by_number': {
      const startD = diatonicOf(pick(C_POSITION, rand));
      const size = 2 + Math.floor(rand() * 4);       // 2nd … 5th
      const up = rand() < 0.6;
      const a = noteFromDiatonic(startD);
      const b = noteFromDiatonic(startD + (size - 1) * (up ? 1 : -1));
      const name = (n: number) => n === 2 ? 'a 2nd' : n === 3 ? 'a 3rd' : n === 4 ? 'a 4th' : 'a 5th';
      const wrong = shuffle([2, 3, 4, 5].filter(n => n !== size), rand).slice(0, 2).map(name);
      const { choices, correctIndex } = mc(name(size), wrong, rand);
      return {
        kind: 'read_note',
        prompt: `From ${noteName(a)} to ${noteName(b)} — what size?`,
        note: b,
        choices,
        correctIndex,
        hint: 'Count BOTH notes: C to E is C-D-E, three letters, so a 3rd. A step is a 2nd.',
      };
    }

    case 'tap_it_back': {
      const pattern = pick(QUARTER_BARS.filter(b => b.length >= 2), rand);
      return {
        kind: 'tap_rhythm',
        prompt: 'Listen, then tap it back.',
        pattern,
        bpm: 88,
        hint: 'Hold the long ones — a half note waits for two counts before the next tap.',
      };
    }
  }

  // Shouldn't happen; a harmless fallback beats a crash mid-lesson.
  return {
    kind: 'listen',
    prompt: 'Is the second note higher or lower?',
    midis: [60, 67],
    choices: ['higher', 'lower'],
    correctIndex: 0,
    hint: 'Higher notes live to the right.',
  };
}

// ─── THE COURSE ────────────────────────────────────────────────────────

export const UNITS: MusicUnit[] = [
  {
    code: 'black_key_groups',
    title: 'Twos and Threes',
    strand: 'keyboard',
    blurb: 'The black keys come in little groups — that is the whole map.',
    exerciseCount: 5,
    teach: [
      {
        heading: 'Look at the black keys',
        body: 'They are not spread out evenly. They huddle: two together, then three together, then two, then three, all the way up the piano. Once you see the twos and threes, you are never lost.',
        figure: { kind: 'keyboard', octaves: 2 },
      },
      {
        heading: 'Why it matters',
        body: 'Every white key is named by which huddle it sits next to. That is how pianists find a note without hunting — they look at the black keys first.',
        figure: { kind: 'keyboard', highlight: ['C#4', 'D#4'], octaves: 2 },
      },
    ],
    outro: 'You can read the black-key map now. Everything else hangs off it.',
  },
  {
    code: 'find_c',
    title: 'Finding C',
    strand: 'keyboard',
    blurb: 'C is the white key just left of the two black keys. Always.',
    exerciseCount: 5,
    teach: [
      {
        heading: 'C lives beside the twos',
        body: 'Find a group of TWO black keys. The white key immediately to their left is C. There is a C beside every pair, all the way up the keyboard.',
        figure: { kind: 'keyboard', highlight: ['C4', 'C5'], labelWhite: true, octaves: 2 },
      },
      {
        heading: 'And F beside the threes',
        body: 'The same trick again: the white key just left of a group of THREE black keys is F. Two landmarks, and the rest you can count from.',
        figure: { kind: 'keyboard', highlight: ['F4'], labelWhite: true, octaves: 2 },
      },
    ],
    outro: 'Two landmarks — C by the twos, F by the threes. You will use these forever.',
  },
  {
    code: 'c_position',
    title: 'C Position',
    strand: 'keyboard',
    blurb: 'Five fingers, five notes: C D E F G.',
    exerciseCount: 6,
    teach: [
      {
        heading: 'Thumb on C',
        body: 'Put your right thumb on middle C. Now each finger has its own key: thumb 1 on C, 2 on D, 3 on E, 4 on F, 5 on G. Your hand does not have to move at all.',
        figure: { kind: 'fingers' },
      },
      {
        heading: 'The notes go up as the fingers do',
        body: 'Moving to the RIGHT on the keyboard means going UP in pitch, and that is the same direction the notes climb on the page.',
        figure: { kind: 'keyboard', highlight: ['C4', 'D4', 'E4', 'F4', 'G4'], labelWhite: true },
      },
    ],
    outro: 'C position is home base. Most of your early pieces live right here.',
  },
  {
    code: 'staff_and_middle_c',
    title: 'The Staff and Middle C',
    strand: 'notation',
    blurb: 'Five lines, four spaces, and one famous note underneath.',
    exerciseCount: 6,
    teach: [
      {
        heading: 'Five lines and four spaces',
        body: 'Music is written on a staff of five lines. A note sits either ON a line or IN a space — never halfway. Higher on the staff means higher in sound.',
        figure: { kind: 'staff', notes: [{ letter: 'E', octave: 4 }, { letter: 'G', octave: 4 }, { letter: 'B', octave: 4 }], caption: 'notes on lines' },
      },
      {
        heading: 'Middle C has its own little line',
        body: 'Middle C is too low for the treble staff, so it gets a tiny ledger line of its own just underneath. That is how you spot it instantly.',
        figure: { kind: 'staff', notes: [{ letter: 'C', octave: 4 }], caption: 'middle C, below the staff' },
      },
    ],
    outro: 'Middle C below the staff, then D in the gap, then E on the bottom line.',
  },
  {
    code: 'reading_up_to_c',
    title: 'Reading the Neighborhood',
    strand: 'notation',
    blurb: 'From middle C up to the C above — the notes you actually play.',
    exerciseCount: 8,
    teach: [
      {
        heading: 'The spaces spell a word',
        body: 'Going up, the four spaces of the treble staff spell F–A–C–E. That is the fastest thing in all of music reading, and it is free.',
        figure: { kind: 'staff', notes: [{ letter: 'F', octave: 4 }, { letter: 'A', octave: 4 }, { letter: 'C', octave: 5 }, { letter: 'E', octave: 5 }], caption: 'F A C E' },
      },
      {
        heading: 'The lines climb E–G–B–D–F',
        body: 'Bottom line E, then G, B, D, and top line F. Plenty of people remember it as “Every Good Bird Does Fly”. Make up your own — it will stick better.',
        figure: { kind: 'staff', notes: [{ letter: 'E', octave: 4 }, { letter: 'G', octave: 4 }, { letter: 'B', octave: 4 }, { letter: 'D', octave: 5 }, { letter: 'F', octave: 5 }], caption: 'the five lines' },
      },
    ],
    outro: 'Spaces spell FACE, lines climb E G B D F. Everything else is counting.',
  },
  {
    code: 'steps_and_skips',
    title: 'Steps and Skips',
    strand: 'notation',
    blurb: 'Next door, or hopping over — on the page and under the hand.',
    exerciseCount: 6,
    teach: [
      {
        heading: 'A step is next door',
        body: 'A step moves from a line to the very next space, or a space to the next line. On the keyboard it is the white key right beside the one you are on.',
        figure: { kind: 'staff', notes: [{ letter: 'C', octave: 4 }, { letter: 'D', octave: 4 }], caption: 'C to D — a step' },
      },
      {
        heading: 'A skip hops over one',
        body: 'A skip goes line to line, or space to space, jumping the one in between. Your fingers feel it as a wider reach, and your ear hears a bigger gap.',
        figure: { kind: 'staff', notes: [{ letter: 'C', octave: 4 }, { letter: 'E', octave: 4 }], caption: 'C to E — a skip' },
      },
    ],
    outro: 'Line-to-space is a step. Line-to-line is a skip. Your eyes can read shapes now, not just letters.',
  },
  {
    code: 'high_and_low',
    title: 'Higher or Lower',
    strand: 'ear',
    blurb: 'Train the ear that has to check what your fingers just did.',
    exerciseCount: 6,
    teach: [
      {
        heading: 'Listen for the direction',
        body: 'You will hear two notes, one after the other. All you have to decide is whether the second one went UP or DOWN. Close your eyes if it helps — most musicians do.',
      },
    ],
    outro: 'Your ear is the thing that tells you when a wrong note happened. Worth training.',
  },
  {
    code: 'same_or_different',
    title: 'Same or Different',
    strand: 'ear',
    blurb: 'Sometimes the hardest thing to hear is no change at all.',
    exerciseCount: 6,
    teach: [
      {
        heading: 'Did it move?',
        body: 'Two notes again — but this time they might be exactly the same. Listen to whether anything changed at all before you decide which way.',
      },
    ],
    outro: 'Noticing that nothing moved is a real musical skill.',
  },
  {
    code: 'hear_step_or_skip',
    title: 'Hearing Steps and Skips',
    strand: 'ear',
    blurb: 'Now name the distance with your ears instead of your eyes.',
    exerciseCount: 6,
    teach: [
      {
        heading: 'A skip sounds wider',
        body: 'You already know steps and skips on the page. They have a sound too: a step slides gently to its neighbor, a skip leaves a small hole you can hear.',
        figure: { kind: 'staff', notes: [{ letter: 'C', octave: 4 }, { letter: 'D', octave: 4 }, { letter: 'C', octave: 4 }, { letter: 'E', octave: 4 }], caption: 'step, then skip' },
      },
    ],
    outro: 'Eyes and ears agreeing on the same idea — that is when reading starts to feel easy.',
  },
  {
    code: 'echo_three',
    title: 'Echo the Ditty',
    strand: 'ear',
    blurb: 'I play a tiny tune. You play it back.',
    exerciseCount: 5,
    teach: [
      {
        heading: 'Listen, then answer',
        body: 'Three notes will play, and the stones will light up as they sound. Wait until it finishes, then play the same three back. This is how musicians have learned tunes for thousands of years — long before anyone wrote anything down.',
        figure: { kind: 'keyboard', highlight: ['C4', 'E4', 'G4'], labelWhite: true },
      },
      {
        heading: 'Hum it first',
        body: 'Here is the secret: hum the tune to yourself before you touch a key. If you can hum it, your fingers can nearly always find it. If you cannot hum it, listen once more — there is no rush and no penalty.',
      },
    ],
    outro: 'Playing back what you hear is the ear and the hand learning to trust each other.',
  },
  {
    code: 'echo_five',
    title: 'Longer Ditties',
    strand: 'ear',
    blurb: 'Five notes now. Hold the whole shape in your head.',
    exerciseCount: 5,
    teach: [
      {
        heading: 'Hear the shape, not just the notes',
        body: 'Five notes are too many to grab one at a time. Instead listen to the SHAPE — does it climb and come back? Does it dip in the middle? Remember the shape and the notes come along with it.',
      },
    ],
    outro: 'You are holding a whole phrase in your head now. That is real musical memory.',
  },
  {
    code: 'echo_by_ear',
    title: 'No Lights',
    strand: 'ear',
    blurb: 'The stones stay dark. Only your ears to go on.',
    exerciseCount: 5,
    teach: [
      {
        heading: 'Ears only',
        body: 'No lights this time — you have to find the notes by listening. Start by finding the FIRST note; hunt for it, and it is fine to try a few. Once the first one is right, the rest is just steps and skips from there.',
      },
    ],
    outro: 'That is audiation — hearing music in your mind and then making it real.',
  },
  {
    code: 'echo_with_rhythm',
    title: 'Tune and Timing',
    strand: 'ear',
    blurb: 'The right notes AND the right lengths.',
    exerciseCount: 5,
    teach: [
      {
        heading: 'Both at once',
        body: 'Now the notes have different lengths. Play the same tune, and hold the long notes as long as they were held for you. This is the hardest one here, and it is exactly what playing a real piece asks of you.',
        figure: { kind: 'rhythm', pattern: ['quarter', 'quarter', 'quarter', 'half'] },
      },
    ],
    outro: 'Notes and time together — that is a performance, not an exercise.',
  },
  {
    code: 'intervals_by_number',
    title: 'Counting the Distance',
    strand: 'notation',
    blurb: 'Steps and skips get proper names: 2nds, 3rds, 4ths, 5ths.',
    exerciseCount: 6,
    teach: [
      {
        heading: 'Count both ends',
        body: 'A step is really a 2nd, and a skip is a 3rd. To find the size, count the letters including BOTH notes: C to E is C-D-E — three letters — so it is a 3rd. Nearly everyone forgets to count the note they started on.',
        figure: { kind: 'staff', notes: [{ letter: 'C', octave: 4 }, { letter: 'E', octave: 4 }], caption: 'C to E — a 3rd' },
      },
      {
        heading: 'Shapes on the page',
        body: 'A 2nd goes line to the very next space. A 3rd goes line to line, or space to space. A 5th is a big friendly stretch — your thumb and little finger in C position are a 5th apart.',
        figure: { kind: 'staff', notes: [{ letter: 'C', octave: 4 }, { letter: 'G', octave: 4 }], caption: 'C to G — a 5th' },
      },
    ],
    outro: 'Numbers instead of nicknames. This is the language the rest of music is written in.',
  },
  {
    code: 'bass_clef_intro',
    title: 'The Other Clef',
    strand: 'notation',
    blurb: 'The left hand gets its own staff, and its own letters.',
    exerciseCount: 6,
    teach: [
      {
        heading: 'Two dots around the F line',
        body: 'The bass clef is where your left hand lives. Its two dots sit either side of the F line, which is how the clef tells you where F is — and everything else counts from there.',
        figure: { kind: 'staff', notes: [{ letter: 'F', octave: 3 }], caption: 'F — between the two dots', clef: 'bass' },
      },
      {
        heading: 'New lines, new spaces',
        body: 'The lines climb G–B–D–F–A, and the spaces climb A–C–E–G. The letters are the same old alphabet; they just sit in different places than they do in treble clef. That is the only thing that changes.',
        figure: { kind: 'staff', notes: [{ letter: 'G', octave: 2 }, { letter: 'B', octave: 2 }, { letter: 'D', octave: 3 }, { letter: 'F', octave: 3 }, { letter: 'A', octave: 3 }], caption: 'the bass lines', clef: 'bass' },
      },
    ],
    outro: 'Two clefs now. Your two hands can finally read at the same time.',
  },
  {
    code: 'bass_reading',
    title: 'Reading Down There',
    strand: 'notation',
    blurb: 'Getting quick with the left hand\'s notes.',
    exerciseCount: 8,
    teach: [
      {
        heading: 'Practice makes it automatic',
        body: 'Bass clef feels slow at first for everybody — you are undoing a habit. Find one landmark you trust (F between the dots, or middle C just above the staff) and count from it. Speed arrives on its own.',
        figure: { kind: 'staff', notes: [{ letter: 'C', octave: 4 }], caption: 'middle C — just ABOVE the bass staff', clef: 'bass' },
      },
    ],
    outro: 'Middle C sits below the treble staff and above the bass one. It is the note where your two hands meet.',
  },
  {
    code: 'note_values',
    title: 'How Long Does It Last?',
    strand: 'rhythm',
    blurb: 'Whole, half, quarter — and the counting that goes with them.',
    exerciseCount: 6,
    teach: [
      {
        heading: 'Notes have lengths',
        body: 'A quarter note gets 1 beat. A half note gets 2 — it is hollow, and it waits. A whole note is hollow with no stem at all, and it holds for 4 whole beats.',
        figure: { kind: 'rhythm', pattern: ['quarter', 'half', 'whole'] },
      },
      {
        heading: 'Count out loud',
        body: 'Counting aloud is not babyish — it is what professionals do when a rhythm is tricky. A half note is “1 – 2”, and you keep holding through the 2.',
        figure: { kind: 'rhythm', pattern: ['half', 'quarter', 'quarter'] },
      },
    ],
    outro: 'Quarter 1, half 2, whole 4. Say them out loud while you play.',
  },
  {
    code: 'counting_bars',
    title: 'Bars of Four',
    strand: 'rhythm',
    blurb: 'The bar lines split music into tidy handfuls of beats.',
    exerciseCount: 6,
    teach: [
      {
        heading: 'Four beats to a bar',
        body: 'Those vertical lines through the staff are bar lines, and in 4/4 time every bar between them holds exactly four beats. Not three, not five.',
        figure: { kind: 'rhythm', pattern: ['quarter', 'quarter', 'half'] },
      },
      {
        heading: 'Check by adding',
        body: 'If a bar looks wrong, add it up. A half plus two quarters is 2 + 1 + 1 = 4. Correct. This is arithmetic doing real work.',
        figure: { kind: 'rhythm', pattern: ['half', 'quarter', 'quarter'] },
      },
    ],
    outro: 'Every bar adds to four. You can check your own music now.',
  },
  {
    code: 'tap_it_back',
    title: 'Tap It Back',
    strand: 'rhythm',
    blurb: 'Hear a rhythm, then play it back with your finger.',
    exerciseCount: 5,
    teach: [
      {
        heading: 'Listen first, all the way through',
        body: 'You get a count-in of four, then the rhythm. Do not start tapping until it has finished — musicians listen to the whole phrase before they copy it.',
        figure: { kind: 'rhythm', pattern: ['quarter', 'quarter', 'half'] },
      },
    ],
    outro: 'Copying a rhythm by ear is exactly what playing in a group asks of you.',
  },
];

export function getUnit(code: string): MusicUnit | undefined {
  return UNITS.find(u => u.code === code);
}

export function unitsOfStrand(strand: Strand): MusicUnit[] {
  return UNITS.filter(u => u.strand === strand);
}

/**
 * Units unlock in order WITHIN a strand, so all four strands are open
 * from day one and she can follow whichever her lesson is about — but
 * can't skip to hearing skips before she has met them on the page.
 */
export function isUnitUnlocked(code: string, completed: string[]): boolean {
  const unit = getUnit(code);
  if (!unit) return false;
  const inStrand = unitsOfStrand(unit.strand);
  const idx = inStrand.findIndex(u => u.code === code);
  if (idx <= 0) return idx === 0;
  return completed.includes(inStrand[idx - 1].code);
}

/** Total exercises in the course — used for the progress readout. */
export function totalExercises(): number {
  return UNITS.reduce((n, u) => n + u.exerciseCount, 0);
}

export { isFullBar, BEATS, VALUE_NAME };
export type { Note, NoteValue, Letter };
