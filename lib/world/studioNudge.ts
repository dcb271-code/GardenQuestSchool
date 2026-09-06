// lib/world/studioNudge.ts
//
// The knock at the studio door.
//
// The art store has no natural end — the making is free forever, and
// that is exactly why a child can vanish into it for an hour. The
// owner asked for a nudge back toward learning.
//
// WHAT THIS IS NOT: a countdown, a clock, a lockout, or a penalty.
// The child UI shows no timer anywhere in this app (that rule is
// older than this file and it is a good one), and nothing here ever
// takes the brush away. It knocks, it names ONE true thing waiting
// elsewhere, and it can always be waved off. Painting is never
// interrupted mid-stroke by a machine.

/** Minutes of continuous studio time before each knock. */
export const NUDGE_MINUTES = [20, 40, 65] as const;

export interface StudioErrand {
  /** Where the nudge would send her. */
  href: string;
  /** What is actually waiting — TRUE things only, never invented. */
  what: string;
}

/**
 * Which knock (if any) is due. Returns the index into NUDGE_MINUTES,
 * or null. `alreadyKnocked` is how many knocks have been shown, so a
 * dismissed knock does not immediately return.
 */
export function knockDue(minutes: number, alreadyKnocked: number): number | null {
  if (alreadyKnocked >= NUDGE_MINUTES.length) return null;
  return minutes >= NUDGE_MINUTES[alreadyKnocked] ? alreadyKnocked : null;
}

/**
 * The words. They escalate in FIRMNESS, never in guilt: the third
 * knock is direct, but nobody is ever told they have done something
 * wrong by painting. No praise-as-control, no coins, no counting.
 */
export function knockWords(
  index: number, errand: StudioErrand | null, name: string,
): { title: string; body: string; goLabel: string; stayLabel: string } {
  const thing = errand?.what;
  if (index === 0) {
    return {
      title: 'Somebody knocked',
      // No trailing pronoun: the errand may be singular or plural
      // ("a letter" / "3 letters"), and "whenever you want it" was
      // wrong for half of them.
      body: thing
        ? `It is quiet in here — good painting weather. ${thing}, whenever you like.`
        : 'It is quiet in here — good painting weather. The garden is still out there too.',
      goLabel: 'go see',
      stayLabel: 'keep painting',
    };
  }
  if (index === 1) {
    return {
      title: 'Knocking again',
      body: thing
        ? `You have been in the studio a good long while, ${name}. ${thing} — it will not take long, and the easel keeps everything exactly where you left it.`
        : `You have been in the studio a good long while, ${name}. The easel keeps everything exactly where you left it if you want to stretch your legs.`,
      goLabel: 'okay, let us go',
      stayLabel: 'not yet',
    };
  }
  return {
    title: 'Last knock, promise',
    body: thing
      ? `${thing}. Go do that one thing, then come straight back — your paints are not going anywhere, and neither am I.`
      : 'Go and do one learning thing, then come straight back — your paints are not going anywhere, and neither am I.',
    goLabel: 'fine, I am going',
    stayLabel: 'one more minute',
  };
}
