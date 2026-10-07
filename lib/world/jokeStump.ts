// lib/world/jokeStump.ts
//
// The Silly Stump — Cecily's idea, specified in her own letter
// (2026-10-06): "a silly stump for jokes and math. It should look like
// a brown stump with green leaves on it. It should have a silly face
// like this 😜 and a section where I could add jokes to it."
//
// Three things live here:
//   - STARTER_JOKES, so the stump has something to say on day one;
//   - RIDDLES, the "math" half — number riddles with one right answer,
//     which count as practice (attempt rows) the way music does;
//   - the kids' own jokes, kept per child in world_state.garden.jokes
//     and SHARED: every child's stump tells every child's jokes, with
//     the teller's name on each. (Owner ruling 2026-10-07: sharing ok.)
//
// Pure — no I/O. The route does the reading and writing.

/* ── jokes ───────────────────────────────────────────────────────── */

export interface Joke {
  id: string;
  /** The question, or the whole joke if it has no punchline. */
  setup: string;
  /** Revealed on a second tap. Optional: some jokes are one line. */
  punchline?: string;
  /** ISO time it was added. */
  addedAt: string;
}

/** A joke as the stump tells it — with who told it. */
export interface ToldJoke {
  id: string;
  setup: string;
  punchline?: string;
  /** A child's first name, or null for the stump's own starter jokes. */
  by: string | null;
}

export const MAX_SETUP_LENGTH = 200;
export const MAX_PUNCHLINE_LENGTH = 200;
/** Plenty for a seven-year-old; keeps one blob from growing forever. */
export const MAX_JOKES_PER_CHILD = 100;

export const STARTER_JOKES: ToldJoke[] = [
  { id: 'starter-6-7', by: null,
    setup: 'Why was 6 afraid of 7?',
    punchline: 'Because 7 8 9!' },
  { id: 'starter-stump', by: null,
    setup: 'What did the tree say when it lost a game?',
    punchline: 'I got stumped!' },
  { id: 'starter-math-book', by: null,
    setup: 'Why was the math book sad?',
    punchline: 'It had too many problems.' },
  { id: 'starter-bee', by: null,
    setup: 'What do you call a bee that can’t make up its mind?',
    punchline: 'A maybe.' },
  { id: 'starter-plus', by: null,
    setup: 'Why do plants hate math?',
    punchline: 'It gives them square roots.' },
  { id: 'starter-frog', by: null,
    setup: 'What does a frog say when it’s happy?',
    punchline: '“Hoppy birthday to me!”' },
  { id: 'starter-eight', by: null,
    setup: 'What did 0 say to 8?',
    punchline: 'Nice belt!' },
  { id: 'starter-owl', by: null,
    setup: 'What do you call an owl that does magic tricks?',
    punchline: 'Hoo-dini!' },
];

/**
 * Add one of HER jokes. Refusals come back in words — the screen
 * shows them as they are (never a silent nothing).
 */
export function addJoke(
  list: Joke[], setup: string, punchline: string | undefined, nowIso: string,
): { list: Joke[]; joke: Joke } | { error: string } {
  const s = setup.trim();
  const p = punchline?.trim() ?? '';
  if (!s) return { error: 'The joke needs some words first!' };
  if (s.length > MAX_SETUP_LENGTH || p.length > MAX_PUNCHLINE_LENGTH) {
    return { error: 'That joke is too long for the stump to remember. Can you make it shorter?' };
  }
  if (list.length >= MAX_JOKES_PER_CHILD) {
    return { error: `The stump is full — it already knows ${MAX_JOKES_PER_CHILD} of your jokes! Take one out to add a new one.` };
  }
  const day = nowIso.slice(0, 10);
  // One past the highest number used today, not a count — after she
  // takes a joke out, a count would hand the next one a used id.
  const nth = 1 + Math.max(0, ...list
    .filter(j => j.id.startsWith(`${day}-`))
    .map(j => Number(j.id.slice(day.length + 1)) || 0));
  const joke: Joke = {
    id: `${day}-${nth}`,
    setup: s,
    ...(p ? { punchline: p } : {}),
    addedAt: nowIso,
  };
  return { list: [joke, ...list], joke };
}

export function removeJoke(list: Joke[], id: string): Joke[] {
  return list.filter(j => j.id !== id);
}

/** Read whatever is in the blob; drop anything malformed. */
export function readJokes(raw: unknown): Joke[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((j): j is Joke =>
    !!j && typeof j.id === 'string' && typeof j.setup === 'string'
    && typeof j.addedAt === 'string'
    && (j.punchline === undefined || typeof j.punchline === 'string'));
}

/**
 * Everything the stump can tell: every child's jokes, newest first,
 * each signed, then the starter jokes. Ids are per child, so the
 * told id is prefixed with the teller to stay unique.
 */
export function jokesToTell(
  byChild: Array<{ learnerId: string; name: string; jokes: Joke[] }>,
): ToldJoke[] {
  const theirs = byChild.flatMap(c => c.jokes.map(j => ({
    id: `${c.learnerId}:${j.id}`,
    setup: j.setup,
    ...(j.punchline ? { punchline: j.punchline } : {}),
    by: c.name,
    at: j.addedAt,
  })));
  theirs.sort((a, b) => b.at.localeCompare(a.at));
  return [...theirs.map(({ at: _at, ...t }) => t), ...STARTER_JOKES];
}

/* ── riddles (the "math" half) ───────────────────────────────────── */

export interface Riddle {
  id: string;
  /** Lowest learner level it is offered at. Level 0 gets level 1's. */
  level: number;
  question: string;
  answer: number;
  /** Said after she answers, right or wrong — always states the answer. */
  because: string;
}

export const RIDDLES: Riddle[] = [
  // Level 1 — counting, adding and taking away within 20
  { id: 'r1-legs', level: 1, answer: 4,
    question: 'A frog has 2 front legs and 2 back legs. How many legs does it have?',
    because: '2 front + 2 back = 4 legs.' },
  { id: 'r1-bees', level: 1, answer: 8,
    question: '5 bees are on a flower. 3 more buzz over. How many bees now?',
    because: '5 + 3 = 8 bees.' },
  { id: 'r1-apples', level: 1, answer: 6,
    question: 'I had 9 apples. A squirrel took 3. How many are left?',
    because: '9 − 3 = 6 apples.' },
  { id: 'r1-before', level: 1, answer: 9,
    question: 'I am the number just before 10. What am I?',
    because: '9 comes just before 10.' },
  { id: 'r1-double', level: 1, answer: 5,
    question: 'If you double me, you get 10. What number am I?',
    because: '5 + 5 = 10, so I am 5.' },
  { id: 'r1-ladybug', level: 1, answer: 7,
    question: 'A ladybug has 3 spots on one wing and 4 on the other. How many spots?',
    because: '3 + 4 = 7 spots.' },

  // Level 2 — to 100, place value, simple equal groups
  { id: 'r2-tens', level: 2, answer: 47,
    question: 'I have 4 tens and 7 ones. What number am I?',
    because: '4 tens is 40, and 7 more is 47.' },
  { id: 'r2-socks', level: 2, answer: 10,
    question: '5 friends each wear 2 socks. How many socks in all?',
    because: '5 groups of 2 is 10 socks.' },
  { id: 'r2-between', level: 2, answer: 50,
    question: 'I am halfway between 40 and 60. What am I?',
    because: '50 is 10 more than 40 and 10 less than 60.' },
  { id: 'r2-dimes', level: 2, answer: 30,
    question: 'How many cents are 3 dimes?',
    because: 'Each dime is 10 cents, so 3 dimes is 30 cents.' },
  { id: 'r2-stairs', level: 2, answer: 35,
    question: 'I am 15 more than 20. What am I?',
    because: '20 + 15 = 35.' },
  { id: 'r2-legs', level: 2, answer: 12,
    question: 'Two bugs each have 6 legs. How many legs together?',
    because: '6 + 6 = 12 legs.' },

  // Level 3 — times tables, sharing, bigger take-aways
  { id: 'r3-spider', level: 3, answer: 24,
    question: '3 spiders have 8 legs each. How many legs?',
    because: '3 × 8 = 24 legs.' },
  { id: 'r3-share', level: 3, answer: 6,
    question: '18 berries are shared by 3 birds, fair and even. How many does each bird get?',
    because: '18 ÷ 3 = 6 berries each.' },
  { id: 'r3-secret', level: 3, answer: 7,
    question: 'Multiply me by 6 and you get 42. What am I?',
    because: '6 × 7 = 42, so I am 7.' },
  { id: 'r3-week', level: 3, answer: 21,
    question: 'How many days are in 3 weeks?',
    because: 'A week is 7 days, and 3 × 7 = 21.' },
  { id: 'r3-rows', level: 3, answer: 36,
    question: 'A garden has 4 rows of 9 carrots. How many carrots?',
    because: '4 × 9 = 36 carrots.' },
  { id: 'r3-hundred', level: 3, answer: 63,
    question: 'I had 100 seeds and planted 37. How many are left?',
    because: '100 − 37 = 63 seeds.' },

  // Level 4 — two-step, bigger facts
  { id: 'r4-eggs', level: 4, answer: 48,
    question: '4 cartons of eggs, a dozen in each. How many eggs?',
    because: 'A dozen is 12, and 4 × 12 = 48.' },
  { id: 'r4-twostep', level: 4, answer: 19,
    question: 'Think of 5. Multiply by 4. Take away 1. What do you have?',
    because: '5 × 4 = 20, and 20 − 1 = 19.' },
  { id: 'r4-minutes', level: 4, answer: 90,
    question: 'How many minutes are in an hour and a half?',
    because: '60 + 30 = 90 minutes.' },
  { id: 'r4-quarters', level: 4, answer: 7,
    question: 'How many quarters make $1.75?',
    because: '4 quarters make $1.00, and 3 more make 75¢: 4 + 3 = 7.' },

  // Level 5 — fractions of amounts, bigger multiplying
  { id: 'r5-half', level: 5, answer: 15,
    question: 'Half of me is 7 and a half. What am I?',
    because: '7½ + 7½ = 15.' },
  { id: 'r5-third', level: 5, answer: 8,
    question: 'What is one third of 24?',
    because: '24 ÷ 3 = 8.' },
  { id: 'r5-feet', level: 5, answer: 36,
    question: 'A foot is 12 inches. How many inches are in 3 feet?',
    because: '3 × 12 = 36 inches.' },
];

/** Riddles offered at a level. Level 0 hears level 1's, read aloud. */
export function riddlesFor(level: number): Riddle[] {
  const lv = Math.max(1, level);
  // Her own band and the one below — enough variety, never too hard.
  return RIDDLES.filter(r => r.level <= lv && r.level >= lv - 1);
}

export function checkRiddle(riddleId: string, answer: number): boolean | null {
  const r = RIDDLES.find(x => x.id === riddleId);
  if (!r) return null;
  return r.answer === answer;
}

/* ── the daily seed cap ──────────────────────────────────────────── */

/**
 * Riddles grow the garden, but only so many a day. Without a cap the
 * stump becomes a seed farm: the same small pool answered over and
 * over. After the cap she can keep playing — it just stops counting,
 * and the screen says so.
 */
export const RIDDLE_SEEDS_PER_DAY = 5;

export interface RiddleDay { day: string; counted: number }

/** May this answer be recorded as practice? Returns the new tally. */
export function countRiddle(
  prev: RiddleDay | undefined, today: string,
): { counts: boolean; next: RiddleDay } {
  const counted = prev?.day === today ? prev.counted : 0;
  if (counted >= RIDDLE_SEEDS_PER_DAY) return { counts: false, next: { day: today, counted } };
  return { counts: true, next: { day: today, counted: counted + 1 } };
}
