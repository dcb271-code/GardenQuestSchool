// components/child/level0/LadybugArt.tsx
//
// The ladybug, the leaf, and the numeral card — the Ladybug Count's
// three drawn things, used on the game screen and (the ladybug and a
// small leaf) as the invitation on the garden map. Bespoke SVG per
// the standing art ruling.

import React from 'react';

export const INK = '#2A2420';
const SHELL = '#D9402B';
const SHELL_LIGHT = '#E8604A';
const LEAF = '#7BA35A';
const LEAF_DARK = '#5E8443';
const LEAF_VEIN = '#A9C98A';
const CREAM = '#FFFAF2';

/**
 * A ladybug seen from above, ~44 wide, centered at (0,0), facing up.
 * Six legs, a black head with two pale eyes, a center seam, and
 * spots — four, mirrored — big enough that a child can see them and
 * (V2) count them. `tilt` rotates the whole bug so a leafful looks
 * like it landed, not like it was placed.
 */
export function Ladybug({ tilt = 0, size = 44 }: { tilt?: number; size?: number }) {
  const s = size / 44;
  return (
    <g transform={`rotate(${tilt}) scale(${s})`} aria-hidden>
      {/* legs — three a side, angled like they are gripping */}
      {[-1, 1].map(side => (
        <g key={side} transform={`scale(${side} 1)`}>
          <path d="M 12 -8 l 9 -6 M 15 0 l 10 1 M 12 8 l 9 7"
                stroke={INK} strokeWidth={2.4} strokeLinecap="round" fill="none" />
        </g>
      ))}
      {/* shell — a dome, slightly taller than wide */}
      <ellipse cx={0} cy={2} rx={17} ry={20} fill={SHELL} stroke={INK} strokeWidth={2} />
      {/* a highlight so the shell reads as round */}
      <ellipse cx={-6} cy={-6} rx={5} ry={7} fill={SHELL_LIGHT} opacity={0.8} />
      {/* the seam between wing cases */}
      <path d="M 0 -14 V 21" stroke={INK} strokeWidth={2} />
      {/* spots — mirrored pairs, none on the seam */}
      {[[-8, -5], [8, -5], [-9, 9], [9, 9]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.6} fill={INK} />
      ))}
      {/* head */}
      <circle cx={0} cy={-16} r={8} fill={INK} />
      <circle cx={-3.2} cy={-17.5} r={1.7} fill={CREAM} />
      <circle cx={3.2} cy={-17.5} r={1.7} fill={CREAM} />
      {/* antennae */}
      <path d="M -4 -22 q -3 -5 -7 -6 M 4 -22 q 3 -5 7 -6"
            stroke={INK} strokeWidth={1.8} strokeLinecap="round" fill="none" />
    </g>
  );
}

/**
 * One big leaf filling a LEAF_W × LEAF_H (400 × 300) box, stem to
 * the lower left, a midrib and side veins. The ladybugs sit on it.
 */
export function BigLeaf() {
  return (
    <g aria-hidden>
      <path
        d="M 30 260 C 20 150, 110 40, 250 30 C 340 25, 390 80, 385 150
           C 380 230, 300 290, 190 285 C 120 282, 60 275, 30 260 Z"
        fill={LEAF} stroke={LEAF_DARK} strokeWidth={3} strokeLinejoin="round"
      />
      {/* stem */}
      <path d="M 30 260 C 20 272, 12 284, 8 296" stroke={LEAF_DARK} strokeWidth={5} strokeLinecap="round" fill="none" />
      {/* midrib */}
      <path d="M 34 258 C 120 200, 250 110, 372 100" stroke={LEAF_VEIN} strokeWidth={3.5} strokeLinecap="round" fill="none" />
      {/* side veins */}
      {[
        'M 95 215 C 110 170, 130 130, 150 92',
        'M 150 178 C 175 140, 200 100, 225 62',
        'M 212 138 C 240 118, 270 92, 300 60',
        'M 270 118 C 300 110, 330 100, 360 82',
        'M 120 232 C 150 232, 190 240, 230 255',
        'M 190 190 C 230 200, 270 215, 305 240',
        'M 255 152 C 290 165, 330 180, 360 200',
      ].map((d, i) => (
        <path key={i} d={d} stroke={LEAF_VEIN} strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.9} />
      ))}
    </g>
  );
}

/**
 * A numeral card, 96 × 110, centered at (0,0): cream, bark edge, one
 * big digit. `state` colors it — 'wrong' after a tap that was not
 * the count (it wobbles in the scene), 'right' when the ladybugs
 * land on it.
 */
export function NumeralCard({ n, state = 'idle' }: { n: number; state?: 'idle' | 'wrong' | 'right' }) {
  const fill = state === 'right' ? '#E8F0D8' : state === 'wrong' ? '#F3E3D6' : CREAM;
  const edge = state === 'right' ? LEAF_DARK : state === 'wrong' ? '#B98A6A' : '#8A6A48';
  return (
    <g aria-hidden>
      <rect x={-48} y={-55} width={96} height={110} rx={16} fill={fill} stroke={edge} strokeWidth={3} />
      <text y={22} textAnchor="middle" fontSize={64} fontWeight={800} fill={INK}
            style={{ fontFamily: 'inherit' }}>{n}</text>
    </g>
  );
}

/**
 * The invitation on the garden map: a small leaf with three ladybugs
 * on it, ~90 wide, centered at (0,0). Drawn small, so it is drawn
 * simply — the veins are two strokes.
 */
export function LadybugLeafInvitation() {
  return (
    <g aria-hidden>
      <path d="M -44 18 C -46 -6, -24 -26, 6 -28 C 30 -30, 46 -16, 44 4
               C 42 22, 22 34, -6 32 C -24 31, -36 28, -44 18 Z"
            fill={LEAF} stroke={LEAF_DARK} strokeWidth={2} strokeLinejoin="round" />
      <path d="M -40 16 C -14 6, 12 -8, 40 -12" stroke={LEAF_VEIN} strokeWidth={2} strokeLinecap="round" fill="none" />
      <path d="M -12 12 C -6 2, 0 -6, 8 -16 M 10 6 C 16 -2, 22 -8, 30 -18"
            stroke={LEAF_VEIN} strokeWidth={1.4} strokeLinecap="round" fill="none" />
      <g transform="translate(-16 2)"><Ladybug size={22} tilt={-20} /></g>
      <g transform="translate(8 -8)"><Ladybug size={22} tilt={25} /></g>
      <g transform="translate(22 12)"><Ladybug size={22} tilt={-5} /></g>
    </g>
  );
}
