// lib/world/walks.ts
//
// What kind of walk are we going on today?
//
// The bird hide used to be a button in the garden header, next to the
// music room. That was wrong twice over: the header was already at
// four icons and doesn't scale, and more importantly it framed birds
// as a separate app rather than as a thing you go outside and look
// for.
//
// Going for a walk and choosing what to notice is how naturalising
// actually works. It also means mushrooms, insects, rocks and mosses
// are each ONE ENTRY IN THIS ARRAY — no new button, no new route
// plumbing, no redesign.
//
// Seasonal notes are here rather than in the component because they
// are content, and because they are the honest reason a walk feels
// different in November than in July.

import type { Season } from './floraCatalog';

export interface WalkKind {
  code: string;
  /** What she is going to look for. */
  title: string;
  blurb: string;
  emoji: string;
  /** Where the walk lives. */
  path: string;
  /**
   * A season-specific line, shown under the blurb. Null means nothing
   * worth saying this season — better than inventing filler.
   */
  note: (season: Season) => string | null;
}

export const WALK_KINDS: WalkKind[] = [
  {
    code: 'flora',
    title: 'Trees and Flowers',
    blurb: 'Meet a plant, look at it properly, and learn to tell it apart.',
    emoji: '🍃',
    path: '/naturalist/walk',
    note: season => {
      if (season === 'spring') return 'Spring — wildflowers are out on the forest floor.';
      if (season === 'summer') return 'Summer — everything is in full leaf.';
      if (season === 'fall') return 'Autumn — this is the season for seeds and berries.';
      return 'Winter — no leaves, so this is the season to learn bark and buds.';
    },
  },
  {
    code: 'birds',
    title: 'Birds',
    blurb: 'The birds outside your own window, commonest first.',
    emoji: '🐦',
    path: '/birds',
    note: season => {
      // True and load-bearing: songs are territorial and mostly
      // March–July, calls happen all year. It changes what she should
      // expect to hear before she even goes outside.
      if (season === 'spring') return 'Spring — the singing season. Everyone is loud right now.';
      if (season === 'summer') return 'Summer — still singing, but quieter by August.';
      if (season === 'fall') return 'Autumn — mostly calls now, not songs. Listen for short notes.';
      return 'Winter — calls, not songs. The Carolina Wren sings anyway; it always does.';
    },
  },
  // Mushrooms, insects, rocks, mosses: add an entry here.
];

export function getWalk(code: string): WalkKind | undefined {
  return WALK_KINDS.find(w => w.code === code);
}

export function walkHref(walk: WalkKind, learnerId: string): string {
  return `${walk.path}?learner=${encodeURIComponent(learnerId)}`;
}
