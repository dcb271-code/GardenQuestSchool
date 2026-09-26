// components/child/level0/BasketArt.tsx
//
// Bunny's Basket's drawn things: a woven basket, a carrot, and the
// invitation on the garden map (the bunny between two little
// baskets). The bunny itself is the Play Barn's BunnyFigure — the
// same bunny everywhere she meets it. Bespoke SVG per the standing
// art ruling.

import React from 'react';
import { BunnyFigure } from '@/app/(child)/town/play-barn/art';

const INK = '#2A2420';
const WEAVE = '#C9A063';
const WEAVE_DARK = '#9C7440';
const WEAVE_LIGHT = '#E2BF85';
const CARROT = '#E8792C';
const CARROT_DARK = '#C45F1C';
const CARROT_LEAF = '#5E8443';

export const BASKET_W = 150;
export const BASKET_H = 110;

/**
 * A carrot standing up, ~28 wide × 60 tall, its tip at (0, 30) and
 * its leafy top at (0, -30). Drawn standing so a row of them reads
 * as a row of carrots in a basket, not a pile of orange.
 */
export function Carrot() {
  return (
    <g aria-hidden>
      <path d="M -11 -8 Q -12 14 0 30 Q 12 14 11 -8 Q 0 -13 -11 -8 Z"
            fill={CARROT} stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
      {/* the little ridges */}
      <path d="M -7 0 h 12 M -6 9 h 10 M -4 18 h 6" stroke={CARROT_DARK} strokeWidth={1.4} strokeLinecap="round" />
      {/* leaves */}
      <path d="M 0 -9 C -3 -16, -10 -22, -12 -30 M 0 -9 C 1 -18, 2 -24, 0 -32 M 0 -9 C 3 -16, 9 -22, 12 -30"
            stroke={CARROT_LEAF} strokeWidth={3} strokeLinecap="round" fill="none" />
    </g>
  );
}

/**
 * A woven basket, BASKET_W × BASKET_H, centered at (0,0), with `count`
 * carrots standing in it. The front lip is drawn LAST so the carrots
 * sit inside, not on. Two baskets side by side are the same size, so
 * "more" can only mean carrots.
 */
export function Basket({ count, state = 'idle' }: { count: number; state?: 'idle' | 'wrong' | 'right' }) {
  const edge = state === 'right' ? '#5E8443' : state === 'wrong' ? '#B98A6A' : WEAVE_DARK;
  const carrotXs = Array.from({ length: count }, (_, i) =>
    count === 1 ? 0 : -50 + i * (100 / (count - 1)));
  return (
    <g aria-hidden>
      {/* handle */}
      <path d="M -50 -20 C -40 -70, 40 -70, 50 -20" fill="none" stroke={WEAVE_DARK} strokeWidth={7} strokeLinecap="round" />
      <path d="M -50 -20 C -40 -70, 40 -70, 50 -20" fill="none" stroke={WEAVE} strokeWidth={3.5} strokeLinecap="round" />
      {/* back wall */}
      <path d="M -70 -14 L -60 50 L 60 50 L 70 -14 Z" fill={WEAVE_DARK} />
      {/* carrots, standing up OUT of the basket so every one is
          countable — only their tips are hidden by the front wall.
          The first draw buried them to the leaves, and "more" was
          invisible. */}
      {carrotXs.map((x, i) => (
        <g key={i} transform={`translate(${x} -30)`}><Carrot /></g>
      ))}
      {/* front wall — a woven face */}
      <path d="M -72 -8 L -60 52 L 60 52 L 72 -8 Z" fill={WEAVE} stroke={edge} strokeWidth={3} strokeLinejoin="round" />
      {[8, 22, 36].map(y => (
        <path key={y} d={`M ${-68 + y * 0.18} ${y} H ${68 - y * 0.18}`} stroke={WEAVE_DARK} strokeWidth={2} opacity={0.7} />
      ))}
      {[-45, -25, -5, 15, 35].map(x => (
        <path key={x} d={`M ${x} -6 L ${x - 6} 50`} stroke={WEAVE_LIGHT} strokeWidth={2.5} opacity={0.7} />
      ))}
      {/* rim */}
      <rect x={-75} y={-14} width={150} height={12} rx={6} fill={WEAVE_LIGHT} stroke={edge} strokeWidth={3} />
    </g>
  );
}

/**
 * The invitation on the garden map: the bunny sitting between two
 * little baskets, one fuller than the other, ~110 wide, centered at
 * (0,0).
 */
export function BunnyBasketInvitation() {
  return (
    <g aria-hidden>
      <g transform="translate(-58 14) scale(0.32)"><Basket count={2} /></g>
      <g transform="translate(58 14) scale(0.32)"><Basket count={4} /></g>
      <g transform="translate(-29 -32) scale(0.9)"><BunnyFigure /></g>
    </g>
  );
}
