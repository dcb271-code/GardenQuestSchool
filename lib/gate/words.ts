// lib/gate/words.ts
//
// Everything the morning gate says. Esme cannot read, so each of
// these is spoken; Cecily can, so they are also on the screen. No
// clock anywhere — "it is early" is as precise as a child needs.

export const GATE_WORDS = {
  /** The code screen. */
  early: (name: string) =>
    `Good morning, ${name}. It is early. The garden opens at eight. A grown-up has today's code — ask them, and tap it in.`,
  codeWrong: 'That is not today\'s code. Ask a grown-up for it.',
  codeRight: 'That is it! The door is open.',
  codeLabel: "today's code",
  codeEnter: 'open',
  codeClear: 'clear',

  /** The chores screen. */
  choresIntro: (name: string) => `Before the garden, ${name}, three quick questions.`,
  yes: 'yes',
  notYet: 'not yet',
  /** After the answers. Honest either way — the pause happens regardless. */
  allDone: 'Good. The garden is waking up. It takes a little while.',
  someLeft: (labels: string[]) =>
    `Okay. Go and ${labels.join(', and ')} — the garden is waking up while you do. It takes a little while.`,
  /** The door, after the pause. */
  open: 'The garden is open. Go in!',
  goIn: 'go in',

  back: 'back to the profiles',
};

/** For "go and ___": the chore as a thing to do, not a thing done. */
export const CHORE_TODO: Record<string, string> = {
  dressed: 'get dressed',
  dishes: 'put your dishes away',
  toys: 'put some toys away',
};
