// components/child/garden/SillyStumpArt.tsx
//
// The Silly Stump, drawn to Cecily's spec (letter 2026-10-06): "a brown
// stump with green leaves on it" and "a silly face like this 😜" —
// one eye open, one squeezed in a wink, tongue out. Bespoke SVG per
// the standing art ruling; used on the map and on the stump's screen.

import React from 'react';

const BARK = '#8A5A34';
const BARK_DARK = '#6B4226';
const BARK_LINE = '#5A361E';
const CUT = '#DDBF8E';
const RING = '#B8925E';
const LEAF = '#6B8E5A';
const LEAF_LIGHT = '#8DB36B';
const INK = '#2A1A10';

function Leaf({ x, y, angle, scale = 1, light = false }: {
  x: number; y: number; angle: number; scale?: number; light?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
      <path d="M 0 0 Q 7 -6 0 -20 Q -7 -6 0 0 Z"
            fill={light ? LEAF_LIGHT : LEAF} stroke="#4E6B40" strokeWidth="0.9" />
      <path d="M 0 -1 L 0 -17" stroke="#4E6B40" strokeWidth="0.7" />
    </g>
  );
}

/**
 * The stump as a plain SVG GROUP, origin at the base center, about 96
 * units wide and 104 tall (leaves included). `tongue={false}` tucks
 * the tongue back in, for a little animation on its own screen.
 */
export function SillyStumpGroup({ tongue = true }: { tongue?: boolean }) {
  return (
    <g aria-hidden>
      {/* ground shadow */}
      <ellipse cx="0" cy="2" rx="44" ry="7" fill="rgba(60,40,20,0.22)" />

      {/* roots flaring into the ground */}
      <path d="M -40 2 Q -30 -6 -28 -16 L -18 -14 Q -24 -4 -30 2 Z" fill={BARK_DARK} />
      <path d="M 40 2 Q 30 -6 28 -16 L 18 -14 Q 24 -4 30 2 Z" fill={BARK_DARK} />

      {/* the trunk */}
      <path d="M -32 -2 Q -34 -40 -30 -66 L 30 -66 Q 34 -40 32 -2 Q 0 6 -32 -2 Z"
            fill={BARK} stroke={BARK_LINE} strokeWidth="1.6" />
      {/* bark grooves, kept to the sides so the face stays clear */}
      <path d="M -24 -60 Q -27 -40 -24 -8" stroke={BARK_LINE} strokeWidth="1.4" fill="none" opacity="0.7" />
      <path d="M 24 -60 Q 27 -40 24 -8" stroke={BARK_LINE} strokeWidth="1.4" fill="none" opacity="0.7" />
      <path d="M -28 -30 Q -30 -20 -28 -12" stroke={BARK_LINE} strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M 28 -50 Q 30 -42 28 -34" stroke={BARK_LINE} strokeWidth="1" fill="none" opacity="0.5" />

      {/* the cut top, with rings */}
      <ellipse cx="0" cy="-66" rx="30" ry="9" fill={CUT} stroke={BARK_LINE} strokeWidth="1.6" />
      <ellipse cx="0" cy="-66" rx="20" ry="5.8" fill="none" stroke={RING} strokeWidth="1" />
      <ellipse cx="0" cy="-66" rx="11" ry="3.2" fill="none" stroke={RING} strokeWidth="1" />
      <ellipse cx="0" cy="-66" rx="3.5" ry="1.2" fill={RING} />

      {/* green leaves sprouting from the rim and one side */}
      <Leaf x={-22} y={-68} angle={-38} />
      <Leaf x={-14} y={-72} angle={-12} scale={1.15} light />
      <Leaf x={18} y={-70} angle={30} scale={1.05} />
      <Leaf x={24} y={-67} angle={58} scale={0.85} light />
      <path d="M 31 -40 q 5 -3 6 -10" stroke="#4E6B40" strokeWidth="1.2" fill="none" />
      <Leaf x={37} y={-49} angle={28} scale={0.62} light />

      {/* ── the silly face 😜 ── */}
      {/* left eye: wide open, looking a little up */}
      <ellipse cx="-11" cy="-44" rx="7" ry="8" fill="#FFFDF5" stroke={INK} strokeWidth="1.4" />
      <circle cx="-10" cy="-46" r="3.6" fill={INK} />
      <circle cx="-8.8" cy="-47.4" r="1.2" fill="#FFFDF5" />
      {/* right eye: squeezed shut in a wink */}
      <path d="M 6 -48 L 15 -44 L 6 -40" stroke={INK} strokeWidth="2.4"
            fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* eyebrows, cocked */}
      <path d="M -18 -56 Q -11 -60 -5 -56" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M 5 -54 Q 11 -55 17 -51" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* rosy cheeks */}
      <ellipse cx="-20" cy="-32" rx="5" ry="3" fill="#E8907A" opacity="0.6" />
      <ellipse cx="19" cy="-32" rx="5" ry="3" fill="#E8907A" opacity="0.6" />
      {/* big grin */}
      <path d="M -15 -31 Q 0 -14 15 -31 Z" fill="#5A1E1E" stroke={INK}
            strokeWidth="1.6" strokeLinejoin="round" />
      {/* tongue out, tipped to one side */}
      {tongue && (
        <g>
          <path d="M 0 -24 Q -1 -12 7 -11 Q 14 -12 12 -22 Q 7 -27 0 -24 Z"
                fill="#E8758A" stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M 6 -23 Q 6.5 -18 6.8 -14" stroke="#B8506A" strokeWidth="1" fill="none" />
        </g>
      )}
    </g>
  );
}

/** A self-contained <svg> version, `size` pixels tall. */
export function SillyStumpArt({ size = 120, tongue = true }: { size?: number; tongue?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="-50 -96 100 104" role="img"
         aria-label="the Silly Stump — a brown stump with green leaves and a silly face">
      <SillyStumpGroup tongue={tongue} />
    </svg>
  );
}
