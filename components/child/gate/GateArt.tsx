// components/child/gate/GateArt.tsx
//
// The morning gate's drawn things: six chore icons in one style (a
// 48-unit box, one ink weight, two or three flat fills, no gradients),
// the tick box, and the sunrise that fills the pause. Bespoke SVG per
// the standing art ruling; drawn to sit beside 20px text without
// shouting.

import React from 'react';
import { motion } from 'framer-motion';
import type { ChoreIcon } from '@/lib/gate/morning';

const INK = '#3F2614';
const CREAM = '#FFFAF2';
const SW = 2.2;

/** A chore's icon, in a 48 × 48 box at (0,0). */
export function ChoreGlyph({ icon }: { icon: ChoreIcon }) {
  switch (icon) {
    case 'clothes':
      // a t-shirt, hanging square
      return (
        <g fill="#7FA6C9" stroke={INK} strokeWidth={SW} strokeLinejoin="round">
          <path d="M 16 8 L 24 12 L 32 8 L 42 13 L 38 21 L 34 19 L 34 40 L 14 40 L 14 19 L 10 21 L 6 13 Z" />
          <path d="M 19 9 Q 24 15 29 9" fill="none" />
        </g>
      );
    case 'dishes':
      // a plate with a cup beside it
      return (
        <g stroke={INK} strokeWidth={SW} strokeLinejoin="round">
          <ellipse cx="20" cy="30" rx="15" ry="6" fill={CREAM} />
          <ellipse cx="20" cy="30" rx="8" ry="3" fill="#E8DCC8" />
          <path d="M 31 12 H 43 V 24 Q 43 30 37 30 Q 31 30 31 24 Z" fill="#C9A063" />
          <path d="M 43 15 Q 48 15 48 19 Q 48 23 43 23" fill="none" />
        </g>
      );
    case 'toys':
      // three blocks, one on top
      return (
        <g stroke={INK} strokeWidth={SW} strokeLinejoin="round">
          <rect x="8" y="24" width="15" height="15" rx="2" fill="#D9402B" />
          <rect x="25" y="24" width="15" height="15" rx="2" fill="#F5D98F" />
          <rect x="16.5" y="9" width="15" height="15" rx="2" fill="#7BA35A" />
          <circle cx="15.5" cy="31.5" r="2.4" fill={CREAM} />
          <path d="M 29.5 28 h 6 M 32.5 25 v 6" fill="none" strokeLinecap="round" />
          <path d="M 21 16.5 h 6" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'bed':
      // a made bed, pillow and quilt
      return (
        <g stroke={INK} strokeWidth={SW} strokeLinejoin="round">
          <path d="M 6 20 H 42 V 36 H 6 Z" fill="#E8B4C0" />
          <path d="M 6 26 H 42" fill="none" />
          <rect x="9" y="14" width="12" height="7" rx="2.5" fill={CREAM} />
          <path d="M 6 36 V 41 M 42 36 V 41 M 6 12 V 20" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'teeth':
      // a toothbrush, bristles up
      return (
        <g stroke={INK} strokeWidth={SW} strokeLinejoin="round">
          <path d="M 12 40 L 30 14" strokeWidth={5} strokeLinecap="round" stroke="#7FA6C9" />
          <path d="M 12 40 L 30 14" fill="none" strokeLinecap="round" />
          <path d="M 28 8 L 40 16 L 36 21 L 26 13 Z" fill={CREAM} />
          <path d="M 30 8 L 32 5 M 34 10 L 36 7 M 38 13 L 40 10" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'backpack':
      // a school bag, ready by the door
      return (
        <g stroke={INK} strokeWidth={SW} strokeLinejoin="round">
          <path d="M 12 16 Q 12 8 24 8 Q 36 8 36 16 V 40 H 12 Z" fill="#7BA35A" />
          <rect x="16" y="24" width="16" height="12" rx="3" fill="#F5D98F" />
          <path d="M 19 8 Q 24 2 29 8" fill="none" />
          <path d="M 16 24 H 32" fill="none" />
        </g>
      );
  }
}

/** A big tick box: 40 units, cream when empty, green with a drawn check when ticked. */
export function TickBox({ ticked }: { ticked: boolean }) {
  return (
    <svg viewBox="0 0 40 40" width={44} height={44} aria-hidden>
      <rect x="3" y="3" width="34" height="34" rx="8" fill={ticked ? '#6B8E5A' : CREAM} stroke={ticked ? '#4A6B3A' : '#8A6A48'} strokeWidth={3} />
      {ticked && <path d="M 11 21 L 17.5 27.5 L 29.5 13.5" fill="none" stroke={CREAM} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

/**
 * The sunrise: the sun climbs over the hills across the pause and the
 * sky warms. `ms` is what is left; the climb spans exactly that, so a
 * refresh mid-pause resumes at the right height. No numbers.
 */
export function Sunrise({ ms, total, reduced }: { ms: number; total: number; reduced: boolean }) {
  const secs = Math.max(0.05, ms / 1000);
  const from = 1 - ms / total;              // progress already made, 0..1
  const sunY = (p: number) => 118 - p * 70; // horizon-ish to high
  return (
    <svg viewBox="0 0 320 180" width="100%" style={{ maxWidth: 420 }} aria-hidden>
      <defs>
        <clipPath id="sky"><rect x="0" y="0" width="320" height="122" /></clipPath>
      </defs>
      {/* sky, warming */}
      <motion.rect x="0" y="0" width="320" height="122"
        initial={{ fill: reduced ? '#F6E2B8' : mix('#C9D6E8', '#F6E2B8', from) }}
        animate={{ fill: '#F6E2B8' }}
        transition={{ duration: reduced ? 0 : secs, ease: 'linear' }} />
      {/* the sun, climbing */}
      <g clipPath="url(#sky)">
        <motion.g
          initial={{ y: reduced ? sunY(1) : sunY(from) }}
          animate={{ y: sunY(1) }}
          transition={{ duration: reduced ? 0 : secs, ease: 'linear' }}
        >
          {[0, 45, 90, 135].map(a => (
            <path key={a} d="M 160 -34 V -46 M 160 34 V 46" transform={`rotate(${a} 160 0)`}
                  stroke="#E8A83A" strokeWidth={4} strokeLinecap="round" opacity={0.85} />
          ))}
          <circle cx="160" cy="0" r="24" fill="#F5C842" stroke="#E8A83A" strokeWidth={3} />
        </motion.g>
      </g>
      {/* hills, front to back */}
      <path d="M 0 122 Q 90 70 200 118 Q 260 96 320 112 V 180 H 0 Z" fill="#8FB07A" />
      <path d="M 0 140 Q 70 110 150 138 Q 230 122 320 140 V 180 H 0 Z" fill="#6E9A5B" />
      {/* the garden fence, and the gate in it */}
      {[70, 90, 110, 210, 230, 250].map(x => (
        <rect key={x} x={x} y={132} width={6} height={30} rx={2} fill={CREAM} stroke={INK} strokeWidth={1.5} />
      ))}
      <rect x="66" y="140" width="52" height="4" fill={CREAM} stroke={INK} strokeWidth={1.2} />
      <rect x="206" y="140" width="52" height="4" fill={CREAM} stroke={INK} strokeWidth={1.2} />
      <path d="M 132 162 V 134 Q 160 118 188 134 V 162" fill="none" stroke={INK} strokeWidth={2.5} />
      <path d="M 140 162 V 138 M 150 162 V 131 M 160 162 V 129 M 170 162 V 131 M 180 162 V 138" stroke={INK} strokeWidth={2} strokeLinecap="round" />
      {/* ground */}
      <rect x="0" y="162" width="320" height="18" fill="#8A6238" />
    </svg>
  );
}

/** Linear blend of two hex colors, for the sky's starting shade. */
function mix(a: string, b: string, t: number): string {
  const p = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const [r1, g1, b1] = p(a), [r2, g2, b2] = p(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * Math.min(1, Math.max(0, t))).toString(16).padStart(2, '0');
  return `#${c(r1, r2)}${c(g1, g2)}${c(b1, b2)}`;
}
