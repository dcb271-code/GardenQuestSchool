/**
 * The Burrow Bunny's little school — TEACHING, not quizzing.
 *
 * Each lesson is a short slide deck: a friendly narrated line plus a
 * typed visual (rendered by LessonVisualView). No questions, no
 * scoring — this is the cozy fireside chat where tricks and mental-
 * math strategies get SHOWN. The practice happens elsewhere.
 *
 * Level windows: a learner at level N sees lessons whose window
 * covers N or N+1 (level 1 → bands 1-2, level 2 → 2-3, level 3 →
 * 3-4). Built out through level 3 for now; the catalog is designed
 * to grow (and later to unlock extra lessons on mastery).
 */

export type LessonVisual =
  | { kind: 'ten_frame'; filled: number; extra?: number; leftOver?: number }               // extra = second color dots
  | { kind: 'number_line'; from: number; to: number; hops: number[]; startAt?: number }
  | { kind: 'array'; rows: number; cols: number; splitAtCol?: number; splitAtRow?: number; rotate?: boolean }
  | { kind: 'equal_groups'; groups: number; per: number }
  | { kind: 'blocks'; tens: number; ones: number; tens2?: number; ones2?: number }
  | { kind: 'pie'; num: number; den: number; second?: { num: number; den: number } }
  | { kind: 'equations'; lines: string[]; highlight?: number }          // highlight = line index
  /** Clock face; `minuteHandOn` is the numeral the big hand points at. */
  | { kind: 'clock'; minuteHandOn: number }
  /** Two-column fact table — keeps its columns, unlike an equations list. */
  | { kind: 'fact_table'; rows: [string, string][] };

export interface LessonSlide {
  text: string;             // narrated aloud
  visual: LessonVisual;
}

export interface BunnyLesson {
  code: string;
  title: string;
  emoji: string;
  topic: 'adding' | 'taking away' | 'times tables' | 'dividing' | 'big numbers' | 'fractions';
  minLevel: number;
  maxLevel: number;
  slides: LessonSlide[];
}

export const BUNNY_LESSONS: BunnyLesson[] = [
  // ─── Level 1–2 ────────────────────────────────────────────────────
  {
    code: 'count_on_bigger',
    title: 'Start from the bigger number',
    emoji: '🐾',
    topic: 'adding',
    minLevel: 1, maxLevel: 2,
    slides: [
      {
        text: 'Here is a bunny secret: when you add, start from the BIGGER number. For 3 plus 8, do not count all the way from 3.',
        visual: { kind: 'equations', lines: ['3 + 8 = ?'], highlight: 0 },
      },
      {
        text: 'Hop onto 8 first — then take just three little hops. Nine… ten… eleven!',
        visual: { kind: 'number_line', from: 5, to: 12, hops: [1, 1, 1], startAt: 8 },
      },
      {
        text: 'Three hops instead of eight. Bunnies never hop more than they have to.',
        visual: { kind: 'equations', lines: ['3 + 8', '= 8 + 3', '= 11'], highlight: 2 },
      },
    ],
  },
  {
    code: 'make_ten',
    title: 'Make ten first',
    emoji: '🔟',
    topic: 'adding',
    minLevel: 1, maxLevel: 2,
    slides: [
      {
        text: 'Ten is the friendliest number there is. When you add 8 plus 5, look how close 8 is to ten…',
        visual: { kind: 'ten_frame', filled: 8 },
      },
      {
        text: 'Borrow 2 from the 5 to fill the frame. Now the ten is FULL, and you have 3 left over.',
        visual: { kind: 'ten_frame', filled: 8, extra: 2, leftOver: 3 },
      },
      {
        text: 'Ten and three is thirteen — no finger counting needed. Eight plus five is thirteen, every time.',
        visual: { kind: 'equations', lines: ['8 + 5', '= 8 + 2 + 3', '= 10 + 3', '= 13'], highlight: 3 },
      },
    ],
  },
  {
    code: 'doubles_friends',
    title: 'Doubles are your friends',
    emoji: '👯',
    topic: 'adding',
    minLevel: 1, maxLevel: 2,
    slides: [
      {
        text: 'Doubles are easy to remember: 6 plus 6 is 12. Two matching rows — see how tidy that looks?',
        visual: { kind: 'array', rows: 2, cols: 6 },
      },
      {
        text: 'So what is 6 plus 7? It is just a double wearing a hat! Six plus six… and one more.',
        visual: { kind: 'equations', lines: ['6 + 7', '= 6 + 6 + 1', '= 12 + 1', '= 13'], highlight: 1 },
      },
      {
        text: 'Whenever two numbers are neighbors, use the double and add one. Bunnies love neighbors.',
        visual: { kind: 'equations', lines: ['7 + 8 = 7 + 7 + 1 = 15', '4 + 5 = 4 + 4 + 1 = 9'] },
      },
    ],
  },
  {
    code: 'subtract_hop_up',
    title: 'Taking away by hopping UP',
    emoji: '⬆️',
    topic: 'taking away',
    minLevel: 1, maxLevel: 2,
    slides: [
      {
        text: 'Here is a trick: 13 take away 9 does not need counting backwards. Ask instead — how far is it FROM 9 UP TO 13?',
        visual: { kind: 'equations', lines: ['13 − 9 = ?', 'how far from 9 to 13?'], highlight: 1 },
      },
      {
        text: 'Hop from 9 to 10 — that is one hop. Then 10 to 13 — three more. Four hops altogether!',
        visual: { kind: 'number_line', from: 8, to: 14, hops: [1, 3], startAt: 9 },
      },
      {
        text: 'Subtraction is just finding the missing hop. Hopping up is often easier than counting back.',
        visual: { kind: 'equations', lines: ['13 − 9 = 4', 'because 9 + 4 = 13'] },
      },
    ],
  },
  {
    code: 'skip_secret',
    title: 'Skip counting is secret multiplying',
    emoji: '🤫',
    topic: 'times tables',
    minLevel: 1, maxLevel: 2,
    slides: [
      {
        text: 'You already know how to skip count: 5, 10, 15, 20… guess what? That is multiplying in disguise!',
        visual: { kind: 'number_line', from: 0, to: 20, hops: [5, 5, 5, 5], startAt: 0 },
      },
      {
        text: 'Four hops of five lands on 20. Grown-ups write it like this: 4 times 5 equals 20. Same thing!',
        visual: { kind: 'equations', lines: ['5, 10, 15, 20', '4 × 5 = 20'], highlight: 1 },
      },
    ],
  },

  // ─── Level 2–3 ────────────────────────────────────────────────────
  {
    code: 'break_apart_add',
    title: 'Break big numbers into tens and ones',
    emoji: '🧱',
    topic: 'big numbers',
    minLevel: 2, maxLevel: 3,
    slides: [
      {
        text: 'Big numbers are just tens and ones in a trench coat. 34 is three tens and four ones.',
        visual: { kind: 'blocks', tens: 3, ones: 4 },
      },
      {
        text: 'To add 34 and 25, add the tens together, then the ones. Three tens and two tens make five tens.',
        visual: { kind: 'blocks', tens: 3, ones: 4, tens2: 2, ones2: 5 },
      },
      {
        text: 'Five tens, nine ones — 59. Breaking numbers apart makes big sums small.',
        visual: { kind: 'equations', lines: ['34 + 25', '= 30 + 20 = 50', '= 4 + 5 = 9', '= 59'], highlight: 3 },
      },
    ],
  },
  {
    code: 'turnaround',
    title: 'The turn-around trick',
    emoji: '🔄',
    topic: 'times tables',
    minLevel: 2, maxLevel: 3,
    slides: [
      {
        text: 'Here are 3 rows of 7 carrots. That is 3 times 7.',
        visual: { kind: 'array', rows: 3, cols: 7 },
      },
      {
        text: 'Now tip your head sideways! The SAME carrots become 7 rows of 3. Nothing changed — so 3×7 and 7×3 are the same number.',
        visual: { kind: 'array', rows: 3, cols: 7, rotate: true },
      },
      {
        text: 'Every times fact you learn is really TWO facts. Learn 3×7=21 and you get 7×3=21 for free. Half the work!',
        visual: { kind: 'equations', lines: ['3 × 7 = 21', '7 × 3 = 21'], highlight: 1 },
      },
    ],
  },
  {
    code: 'double_double',
    title: '×2 is double. ×4 is double-double!',
    emoji: '✌️',
    topic: 'times tables',
    minLevel: 2, maxLevel: 3,
    slides: [
      {
        text: 'Times 2 just means double. 7 times 2? Double 7 — fourteen.',
        visual: { kind: 'array', rows: 2, cols: 7 },
      },
      {
        text: 'And times 4 is double, TWICE. 7 × 4: double 7 is 14… double again is 28.',
        visual: { kind: 'array', rows: 4, cols: 7, splitAtRow: 2 },
      },
      {
        text: 'Double-double works for any number. 6×4? 12… 24. 8×4? 16… 32. You never need to memorize the fours!',
        visual: { kind: 'equations', lines: ['7 × 4', '= (7 × 2) × 2', '= 14 × 2 = 28'], highlight: 1 },
      },
    ],
  },
  {
    code: 'fives_clock',
    title: 'The fives live on a clock',
    emoji: '🕐',
    topic: 'times tables',
    minLevel: 2, maxLevel: 3,
    slides: [
      {
        text: 'The 5 times table hides on every clock! Every number on the face is five minutes further round. When the big hand points at the 3, it is 15 minutes past — because 3 × 5 is 15.',
        visual: { kind: 'clock', minuteHandOn: 3 },
      },
      {
        text: 'It works the whole way round. The big hand on the 7? That is 7 × 5 — thirty-five minutes past. You have been reading the five times table your whole life without knowing it.',
        visual: { kind: 'clock', minuteHandOn: 7 },
      },
      {
        text: 'And here is a pattern to pocket: the fives always end in 5 or 0. Five, ten, fifteen, twenty — flip, flop, flip, flop.',
        visual: { kind: 'fact_table', rows: [['1 × 5 = 5', '2 × 5 = 10'], ['3 × 5 = 15', '4 × 5 = 20'], ['5 × 5 = 25', '6 × 5 = 30']] },
      },
    ],
  },
  {
    code: 'share_fair',
    title: 'Dividing is fair sharing',
    emoji: '🥕',
    topic: 'dividing',
    minLevel: 2, maxLevel: 3,
    slides: [
      {
        text: 'Twelve carrots, three bunny friends. Dividing just asks: if we share FAIRLY, how many does each bunny get?',
        visual: { kind: 'equal_groups', groups: 3, per: 4 },
      },
      {
        text: 'Deal them out like cards — one for you, one for you, one for you — until the pile is gone. Four each!',
        visual: { kind: 'equations', lines: ['12 ÷ 3 = 4', 'twelve shared three ways is four each'] },
      },
    ],
  },

  // ─── Level 3–4 ────────────────────────────────────────────────────
  {
    code: 'nines_pattern',
    title: 'The nines have a secret pattern',
    emoji: '🪄',
    topic: 'times tables',
    minLevel: 3, maxLevel: 4,
    slides: [
      {
        text: 'The nines look scary, but watch closely… 9, 18, 27, 36, 45. See the first digits counting UP and the last digits counting DOWN?',
        visual: { kind: 'equations', lines: ['1×9 = 09', '2×9 = 18', '3×9 = 27', '4×9 = 36', '5×9 = 45'] },
      },
      {
        text: 'And the digits of every nines answer add up to nine! 2+7 is 9. 3+6 is 9. 4+5 is 9. Magic? No — pattern!',
        visual: { kind: 'equations', lines: ['27 → 2 + 7 = 9', '36 → 3 + 6 = 9', '45 → 4 + 5 = 9'], highlight: 1 },
      },
      {
        text: 'Quick trick: 9 times anything is 10 times it, minus one of it. 9×6? Ten sixes is 60, take away one 6… 54.',
        visual: { kind: 'equations', lines: ['9 × 6', '= 10 × 6 − 6', '= 60 − 6 = 54'], highlight: 1 },
      },
    ],
  },
  {
    code: 'break_apart_times',
    title: 'Break apart the hard times tables',
    emoji: '✂️',
    topic: 'times tables',
    minLevel: 3, maxLevel: 4,
    slides: [
      {
        text: 'Stuck on 6 × 7? Snip it into pieces you DO know. Here are 6 rows of 7 carrots.',
        visual: { kind: 'array', rows: 6, cols: 7 },
      },
      {
        text: 'Snip! Now it is 6 rows of 5, plus 6 rows of 2. And you know both of those: 30 and 12.',
        visual: { kind: 'array', rows: 6, cols: 7, splitAtCol: 5 },
      },
      {
        text: '30 plus 12 is 42. Any hard fact can be snipped into easy ones — that is how mathematicians really do it.',
        visual: { kind: 'equations', lines: ['6 × 7', '= 6×5 + 6×2', '= 30 + 12 = 42'], highlight: 1 },
      },
    ],
  },
  {
    code: 'fact_families',
    title: 'One picture, four facts',
    emoji: '👨‍👩‍👧‍👦',
    topic: 'dividing',
    minLevel: 3, maxLevel: 4,
    slides: [
      {
        text: 'This one picture — 3 rows of 8 — holds FOUR facts at once. Multiplication and division are the same picture, read two ways.',
        visual: { kind: 'array', rows: 3, cols: 8 },
      },
      {
        text: '3 times 8 is 24. 8 times 3 is 24. And backwards: 24 shared into 3 rows is 8. 24 shared into 8 columns is 3.',
        visual: { kind: 'equations', lines: ['3 × 8 = 24', '8 × 3 = 24', '24 ÷ 3 = 8', '24 ÷ 8 = 3'] },
      },
      {
        text: 'So every dividing question is a times question wearing a mask. 24 ÷ 8 just asks: eight times WHAT makes 24?',
        visual: { kind: 'equations', lines: ['24 ÷ 8 = ?', '8 × ? = 24', '8 × 3 = 24 ✓'], highlight: 1 },
      },
    ],
  },
  {
    code: 'half_of_half',
    title: 'Half, and half again',
    emoji: '🍰',
    topic: 'fractions',
    minLevel: 3, maxLevel: 4,
    slides: [
      {
        text: 'Cut a cake in half — two pieces. Cut each half in half again — four pieces. Each piece is a quarter.',
        visual: { kind: 'pie', num: 1, den: 2, second: { num: 1, den: 4 } },
      },
      {
        text: 'Here is the surprising part: one half and two quarters are the SAME amount of cake. Different cuts, same cake!',
        visual: { kind: 'pie', num: 1, den: 2, second: { num: 2, den: 4 } },
      },
      {
        text: 'Fractions with different names can be equal. The pieces just got smaller — and you got more of them.',
        visual: { kind: 'equations', lines: ['1/2 = 2/4', 'same cake, smaller pieces'] },
      },
    ],
  },
  {
    code: 'compensate_add',
    title: 'Make it friendly, then pay it back',
    emoji: '🤝',
    topic: 'adding',
    minLevel: 3, maxLevel: 4,
    slides: [
      {
        text: 'Adding 29 is awkward. Adding 30 is easy. So do the easy one — and remember you owe a little back.',
        visual: { kind: 'equations', lines: ['47 + 29 = ?', '47 + 30 is easier…'], highlight: 1 },
      },
      {
        text: 'Hop a whole 30 instead of 29. That lands you on 77 — which is one step too far, because 30 was one bigger than the 29 you actually wanted.',
        visual: { kind: 'number_line', from: 45, to: 80, hops: [30], startAt: 47 },
      },
      {
        text: 'So now pay the extra back. Step one down from 77, and there is your answer: seventy-six.',
        visual: { kind: 'number_line', from: 72, to: 80, hops: [-1], startAt: 77 },
      },
      {
        text: 'That is called compensating: borrow a bit to make the number friendly, then pay it back at the end. It works for taking away too — 63 minus 19 is 63 minus 20, plus one back.',
        visual: { kind: 'equations', lines: ['47 + 29', '= 47 + 30 − 1', '= 77 − 1 = 76'], highlight: 1 },
      },
    ],
  },
  {
    code: 'subtract_across_zero',
    title: 'Taking away from a round number',
    emoji: '🕳️',
    topic: 'taking away',
    minLevel: 3, maxLevel: 4,
    slides: [
      {
        text: 'Three hundred take away one hundred and eighty-seven looks horrible. All those zeros to borrow from! But you never have to borrow at all.',
        visual: { kind: 'equations', lines: ['300 − 187 = ?'], highlight: 0 },
      },
      {
        text: 'Do not count back. Count UP from 187 and see how far it is. Thirteen gets you to 200 — a nice round stop. Then a hundred more gets you to 300.',
        visual: { kind: 'number_line', from: 180, to: 310, hops: [13, 100], startAt: 187 },
      },
      {
        text: 'Thirteen and one hundred is one hundred and thirteen. No borrowing, no crossed-out zeros — just two friendly hops.',
        visual: { kind: 'equations', lines: ['187 + 13 = 200', '200 + 100 = 300', '13 + 100 = 113'], highlight: 2 },
      },
    ],
  },
  {
    code: 'round_estimate',
    title: 'Round first, then check yourself',
    emoji: '🎯',
    topic: 'big numbers',
    minLevel: 3, maxLevel: 4,
    slides: [
      {
        text: 'Before you add big numbers, make a guess with ROUND numbers. 297 plus 405? That is about 300 plus 400.',
        visual: { kind: 'equations', lines: ['297 + 405 = ?', '≈ 300 + 400 = 700'], highlight: 1 },
      },
      {
        text: 'Now when you work it out properly and get 702 — you KNOW it is right, because it is close to your guess. If you got 1702, the guess would catch the mistake!',
        visual: { kind: 'equations', lines: ['297 + 405 = 702 ✓', 'close to 700 — sensible!'] },
      },
    ],
  },
];

/** Lessons visible to a learner at the given level: every band that
 *  CONTAINS that level (level 1 → the 1–2 band, level 2 → the 1–2 and
 *  2–3 bands, level 3 → 2–3 and 3–4). A band that merely starts at
 *  level+1 is a whole band ahead and stays hidden until she gets
 *  there — that is what "level 2 would have 2-3" means. */
export function lessonsForLevel(level: number): BunnyLesson[] {
  return BUNNY_LESSONS.filter(l => l.minLevel <= level && l.maxLevel >= level);
}

export function lessonTopics(lessons: BunnyLesson[]): string[] {
  return Array.from(new Set(lessons.map(l => l.topic)));
}
