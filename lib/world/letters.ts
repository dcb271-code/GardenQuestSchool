// lib/world/letters.ts
//
// The letterbox: a child writing directly to whoever builds this.
//
// Cecily asked for it herself — "is there a way she could directly
// message you, or post somewhere you could read from, to then update
// things / add things of her interest". Everything in this app has so
// far been built FOR her from an adult reading her data. This is the
// first channel pointing the other way.
//
// Deliberately not a form. No categories, no bug/feature dropdown, no
// character limit she can hit mid-thought. A seven-year-old writing to
// somebody about her own garden should be writing a letter, not filing
// a ticket.
//
// Stored in world_state.garden.letters, following the same convention
// as bird_lifelist and music_units — no migration, and it works the
// moment it deploys. Read with `npm run letters`, which is also how a
// reply gets written back.

/** A letter she wrote, and the reply if one has been written. */
export interface Letter {
  /** Stable id so a reply can find its letter. */
  id: string;
  text: string;
  /** ISO date — the day she sent it. */
  sentAt: string;
  /** Written back by `npm run letters --reply`. Absent until then. */
  reply?: string;
  repliedAt?: string;
  /** Set once she has seen the reply, so the badge can clear. */
  readAt?: string;
}

export type Letterbox = Letter[];

/** Longest a letter may be. Generous — she should never hit it. */
export const MAX_LETTER_LENGTH = 2000;

/**
 * Ids are derived from the send time rather than random, so the same
 * letter written twice cannot collide and a human reading the raw
 * jsonb can see the order at a glance.
 */
export function letterId(sentAtIso: string, existing: Letterbox): string {
  const day = sentAtIso.slice(0, 10);
  const nth = existing.filter(l => l.id.startsWith(day)).length + 1;
  return `${day}-${nth}`;
}

export function addLetter(
  box: Letterbox, text: string, sentAtIso: string,
): { box: Letterbox; letter: Letter } | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const letter: Letter = {
    id: letterId(sentAtIso, box),
    text: trimmed.slice(0, MAX_LETTER_LENGTH),
    sentAt: sentAtIso,
  };
  // Newest first — she should see what she just wrote at the top.
  return { box: [letter, ...box], letter };
}

/** Replies she has not opened yet. Drives the badge on the letterbox. */
export function unreadReplies(box: Letterbox): Letter[] {
  return box.filter(l => l.reply && !l.readAt);
}

/** Mark every delivered reply as seen. */
export function markRepliesRead(box: Letterbox, nowIso: string): Letterbox {
  return box.map(l => (l.reply && !l.readAt ? { ...l, readAt: nowIso } : l));
}

/** Attach a reply to one letter. Used by the reading script. */
export function replyTo(
  box: Letterbox, id: string, reply: string, nowIso: string,
): Letterbox {
  // A fresh reply is unread BY DEFINITION. Without clearing readAt, a
  // second reply to the same letter inherits the first one's read
  // mark and is born invisible — written, saved, and never flagged.
  return box.map(l =>
    l.id === id
      ? { ...l, reply: reply.trim(), repliedAt: nowIso, readAt: undefined }
      : l,
  );
}
