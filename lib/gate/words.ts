// lib/gate/words.ts
//
// Everything the morning gate says. Esme cannot read, so each of
// these is spoken; Cecily can, so they are also on the screen. No
// clock anywhere — "it is early" is as precise as a child needs.

export const GATE_WORDS = {
  /** The code screen. */
  early: (name: string, hourWord: string) =>
    `Good morning, ${name}. It is early. The garden opens at ${hourWord}. A grown-up has today's code — ask them, and tap it in.`,
  codeWrong: 'That is not today\'s code. Ask a grown-up for it.',
  codeRight: 'That is it! The door is open.',
  codeLabel: "today's code",
  codeEnter: 'open',
  codeClear: 'clear',

  /** The checklist. */
  choresIntro: (name: string) => `Before the garden, ${name}: which of these have you done? Tap at least one.`,
  tickOne: 'Tap at least one thing you have done.',
  done: 'done',
  /** After the answers. Honest either way — the pause happens regardless. */
  allDone: 'All of them! The garden is waking up. It takes a little while.',
  someLeft: (todos: string[]) =>
    `Good. And you can still ${todos.join(', and ')} — the garden is waking up while you do. It takes a little while.`,
  /** The door, after the pause. */
  open: 'The garden is open. Go in!',
  goIn: 'go in',

  back: 'back to the profiles',
};

/** "8" → "eight o'clock", for the spoken sentence. */
export function hourWord(hour: number): string {
  const words = ['midnight', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'noon'];
  const w = words[hour] ?? String(hour);
  return hour === 0 || hour === 12 ? w : `${w} o'clock`;
}
