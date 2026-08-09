// lib/world/pip.ts
//
// Pip, who keeps the times tables on Math Mountain.
//
// Hodge has the estimation duel and Nana has the garden. Multiplication
// had nobody — it had a workshop with no one in it, which is a room and
// not a teacher.
//
// WHY A CHIPMUNK. The eastern chipmunk lives on exactly the rocky
// wooded slopes Math Mountain is made of, and its whole life is the
// thing multiplication is: it fills its cheeks, carries a fixed load,
// and stacks the same load again and again in a larder underground.
// Equal groups, repeated. A chipmunk really does haul the same-sized
// pouch a hundred times over, and a real larder really is found in
// tidy separated piles. The model is not a mascot bolted onto the
// maths — it is what the animal actually does.
//
// WHAT HE IS FOR. Cecily's ×6–×10 band sits at 66% while ×0–×5 reads
// 87%, and every fact she misses has a 6, 7, 8 or 9 in it. She does not
// need more questions; she has done 109 of them. She needs somebody to
// SAY the sevens out loud while she watches them stack up, and then to
// ask her only the ones she actually misses.
//
// He speaks everything. That is deliberate and not decoration: times
// tables are learned by ear as much as by eye — the rhythm of "seven,
// fourteen, twenty-one" is doing real work that a silent grid cannot.

import type { LearnerLevel } from '@/lib/learner/baseline';

export const PIP = {
  code: 'pip',
  name: 'Pip',
  species: 'Eastern chipmunk',
  scientificName: 'Tamias striatus',
  /** Said once, the first time she meets him. */
  greeting:
    "I'm Pip. I carry nuts to my larder — the same number in my cheeks, over and over, until there's a pile. That's all a times table is: the same number, over and over. Want me to count some out with you?",
  facts: [
    'A chipmunk can carry about as much in its cheek pouches as its whole head weighs.',
    'One chipmunk may store thousands of seeds in a single winter larder, in tidy separate piles.',
    'Its burrow can be thirty feet long, with the front door hidden under a rock or a log.',
  ],
} as const;

/* ─── who gets to meet him ────────────────────────────────────────── */

/**
 * The skills that mean a learner is ready for the real table.
 *
 * The point of the gate is NOT to make him a reward. It is that he
 * teaches ×6–×10 by splitting them into fives and doubles, and that
 * only helps somebody who already owns equal groups, arrays, and the
 * small facts. Meeting him earlier would be meeting a stranger talking
 * about something you cannot use yet.
 *
 * ×0, ×1 and ×10 live inside facts_to_5 and by_10s_100s — they are one
 * rule each rather than facts, and having them is exactly what makes
 * the rest worth teaching.
 */
export const PIP_PREREQ_SKILLS = [
  'math.multiply.equal_groups',
  'math.multiply.arrays',
  'math.multiply.facts_to_5',
] as const;

/** Lifetime-correct fallback, so a gate that opened can never re-shut. */
const MONOTONIC_CORRECT = 20;

/**
 * Whether Pip is out on the mountain.
 *
 * MONOTONIC on purpose, the way every other gate in this world is:
 * mastery decays with time, and a teacher who vanishes because a child
 * did not practise for a fortnight is a punishment dressed as a
 * feature. Once she has done the work, he stays.
 *
 * "Roughly" is honest here — this asks for the conceptual base and the
 * small facts, not a perfect record.
 */
export function pipAppears(input: {
  level: LearnerLevel | number;
  mathMountainUnlocked: boolean;
  masteredCodes: string[];
  /** skill code → lifetime correct answers. */
  correctBySkill: Map<string, number>;
}): boolean {
  if (input.level < 3) return false;
  if (!input.mathMountainUnlocked) return false;
  const mastered = new Set(input.masteredCodes);
  return PIP_PREREQ_SKILLS.every(code =>
    mastered.has(code) || (input.correctBySkill.get(code) ?? 0) >= MONOTONIC_CORRECT);
}

/** Why he is not here yet, for the locked-stop hint. */
export function pipLockedReason(input: {
  level: LearnerLevel | number;
  mathMountainUnlocked: boolean;
}): string {
  if (input.level < 3) {
    return 'Somebody lives up here who only comes out for Level 3 climbers.';
  }
  if (!input.mathMountainUnlocked) return 'Open Math Mountain first.';
  return 'Learn equal groups, arrays and the small times tables, and he will come out.';
}

/* ─── what he says ────────────────────────────────────────────────── */

/**
 * Counting a table out loud.
 *
 * Spoken as "seven. fourteen. twenty-one." rather than as sums, because
 * the run of numbers is the thing that sticks — it is a tune before it
 * is arithmetic, and a child who can chant the sevens can recover 7×6
 * by counting on her fingers even on a bad day.
 */
export function skipCountLine(table: number, upTo = 10): string {
  const nums = Array.from({ length: upTo }, (_, i) => (i + 1) * table);
  return nums.join('. ') + '.';
}

/** How he introduces a table before counting it. */
export function tableIntro(table: number): string {
  return `The ${table} times table. ${table} in every pouch. Here we go.`;
}

/** What he says when she gets one right — varied, never gushing. */
export const PIP_PRAISE = [
  'That is the one.',
  'Straight in the larder.',
  'Yes. Next.',
  'Got it.',
  'That is it exactly.',
] as const;

/**
 * What he says when she does not.
 *
 * Never "wrong". He gives the answer and the route to it, because the
 * failure mode here is a child who already believes she is bad at the
 * sevens.
 */
export function pipCorrection(a: number, b: number, explain: string): string {
  return `${a} times ${b} is ${a * b}. ${explain}`;
}

export function pipPraise(i: number): string {
  return PIP_PRAISE[i % PIP_PRAISE.length];
}
