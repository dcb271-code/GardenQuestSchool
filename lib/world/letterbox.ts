// lib/world/letterbox.ts
//
// Custom letterboxes — each child paints their own mailbox and picks
// an emblem for the door. The style shows everywhere their mail
// lives: the garden map, the letters screen, and the recipient chips
// their siblings see (so "which box is whose" is answered by LOOKING,
// which matters in a family with shared names on one tablet).
//
// Free, no gates: it is their mailbox. The FLAG is not stylable —
// flag-up red is a signal, not a decoration, and signals do not
// change per child.

export interface LetterboxColor {
  code: string;
  name: string;
  /** Box body fill. */
  body: string;
  /** Lid + darker trim. */
  lid: string;
}

export const LETTERBOX_COLORS: LetterboxColor[] = [
  { code: 'green', name: 'garden green', body: '#6B8E5A', lid: '#5C7E4F' },
  { code: 'red', name: 'barn red', body: '#C05548', lid: '#A6443A' },
  { code: 'blue', name: 'creek blue', body: '#4A7BA6', lid: '#3D6689' },
  { code: 'yellow', name: 'sunflower yellow', body: '#D9A62E', lid: '#BC8F26' },
  { code: 'purple', name: 'thistle purple', body: '#7A5A8C', lid: '#684C77' },
  { code: 'pink', name: 'rose pink', body: '#D083A0', lid: '#B56D89' },
];

/** Emblem codes — each is a small drawn picture in LetterboxArt. */
export const LETTERBOX_EMBLEMS = [
  'flower', 'star', 'bird', 'bee', 'snail', 'moon',
] as const;
export type LetterboxEmblem = (typeof LETTERBOX_EMBLEMS)[number];

export interface LetterboxStyle {
  color: string;
  emblem?: string;
}

/** The default: every box starts garden green, no emblem. */
export const DEFAULT_LETTERBOX: LetterboxStyle = { color: 'green' };

export function getLetterboxColor(code: string): LetterboxColor {
  return LETTERBOX_COLORS.find(c => c.code === code) ?? LETTERBOX_COLORS[0];
}

/**
 * Read whatever is in the blob and return something drawable —
 * unknown codes fall back to the default rather than crashing a
 * sibling's chip row.
 */
export function resolveLetterboxStyle(raw: unknown): LetterboxStyle {
  const r = (raw ?? {}) as Record<string, unknown>;
  const color = LETTERBOX_COLORS.some(c => c.code === r.color)
    ? (r.color as string) : DEFAULT_LETTERBOX.color;
  const emblem = LETTERBOX_EMBLEMS.includes(r.emblem as LetterboxEmblem)
    ? (r.emblem as string) : undefined;
  return { color, ...(emblem ? { emblem } : {}) };
}

/** Set the style, refusing nonsense in words. `emblem: null` clears it. */
export function setLetterboxStyle(
  color: string, emblem: string | null,
): { style: LetterboxStyle } | { error: string } {
  if (!LETTERBOX_COLORS.some(c => c.code === color)) {
    return { error: 'That is not one of the paints on the shelf.' };
  }
  if (emblem !== null && !LETTERBOX_EMBLEMS.includes(emblem as LetterboxEmblem)) {
    return { error: 'That is not one of the emblems in the drawer.' };
  }
  return { style: { color, ...(emblem ? { emblem } : {}) } };
}
