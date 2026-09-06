// components/child/garden/LetterboxArt.tsx
//
// The one drawn letterbox, used everywhere a letterbox appears: the
// garden map, the letters screen, the sibling recipient chips, the
// paint panel. Bespoke SVG per the standing art ruling. The flag is
// ALWAYS signal-red when up — a raised flag is a message, not decor.

import React from 'react';
import { getLetterboxColor } from '@/lib/world/letterbox';

/** A small drawn emblem centered at (0,0), ~12 units across. */
export function EmblemArt({ code, tint = '#FFFAF2' }: { code: string; tint?: string }) {
  switch (code) {
    case 'flower':
      return (
        <g aria-hidden>
          {[0, 60, 120, 180, 240, 300].map(a => (
            <ellipse key={a} cx="0" cy="-3.6" rx="2.1" ry="3.4"
                     transform={`rotate(${a})`} fill={tint} opacity="0.92" />
          ))}
          <circle r="2.2" fill="#E8B93A" />
        </g>
      );
    case 'star':
      return (
        <path d="M 0 -5.4 L 1.55 -1.65 L 5.4 -1.4 L 2.45 1.2 L 3.35 5
                 L 0 2.85 L -3.35 5 L -2.45 1.2 L -5.4 -1.4 L -1.55 -1.65 Z"
              fill={tint} aria-hidden />
      );
    case 'bird':
      return (
        <g aria-hidden>
          <ellipse cx="-0.6" cy="0.8" rx="4" ry="2.9" fill={tint} />
          <circle cx="3" cy="-1.8" r="2.2" fill={tint} />
          <path d="M 4.9 -2.1 L 7 -1.5 L 4.9 -0.9 Z" fill="#E8B93A" />
          <path d="M -3.6 0.4 L -6.4 -1.6 L -3.2 -1.2 Z" fill={tint} />
        </g>
      );
    case 'bee':
      // Cream body, bold dark stripes — yellow-on-yellow was
      // invisible on the sunflower box, and a bee IS its stripes.
      return (
        <g aria-hidden>
          <ellipse cx="-0.2" cy="0.8" rx="4.2" ry="3.1" fill={tint} />
          <path d="M -1.8 -2.1 v 5.8 M 0.8 -2.1 v 5.8" stroke="#2A2420"
                strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="4.2" cy="-0.2" r="2" fill="#2A2420" />
          <ellipse cx="-1.8" cy="-3.4" rx="2.8" ry="1.6" fill={tint}
                   stroke="#2A2420" strokeWidth="0.7"
                   transform="rotate(-24 -1.8 -3.4)" />
        </g>
      );
    case 'snail':
      return (
        <g aria-hidden>
          <path d="M -4.6 3 Q 0 4.6 4.8 3 L 4.8 1.6 Q 0 3 -4.6 1.4 Z" fill={tint} />
          <circle cx="-0.4" cy="-0.8" r="3.2" fill={tint} />
          <path d="M -0.4 -0.8 m 0 -2 a 2 2 0 1 1 -2 2" fill="none"
                stroke="#3F2614" strokeWidth="1" opacity="0.5" />
          <path d="M 3.4 1.6 q 1.6 -2.6 1.2 -4.4 M 4.6 -2.8 l 0.8 -1.4"
                stroke={tint} strokeWidth="1.1" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'moon':
      return (
        <path d="M 1.6 -5 A 5.2 5.2 0 1 0 1.6 5 A 4.1 4.1 0 1 1 1.6 -5 Z"
              fill={tint} aria-hidden />
      );
    default:
      return null;
  }
}

/**
 * The letterbox on its post as a plain SVG GROUP, origin at the
 * post's base center — the exact footprint of the original map
 * letterbox, so GardenScene swaps it in without moving anything.
 * Use LetterboxArt for a self-contained <svg> version.
 */
export function LetterboxGroup({
  colorCode, emblem, flagUp,
}: {
  colorCode: string;
  emblem?: string;
  flagUp: boolean;
}) {
  const c = getLetterboxColor(colorCode);
  return (
    <g aria-hidden>
      <ellipse cx={0} cy={34} rx={16} ry={4} fill="#000" opacity={0.18} />
      {/* post */}
      <rect x={-4} y={-6} width={8} height={40} rx={2}
            fill="#8B5A2B" stroke="#5A3B1F" strokeWidth={1.6} />
      {/* box */}
      <rect x={-19} y={-32} width={38} height={28} rx={4}
            fill={c.body} stroke="#3F2614" strokeWidth={2} />
      {/* the little door seam */}
      <path d="M -19 -22 L 0 -12 L 19 -22" fill="none"
            stroke="#3F2614" strokeWidth={1.4} opacity={0.55} />
      {/* lid */}
      <rect x={-13} y={-38} width={26} height={7} rx={3}
            fill={c.lid} stroke="#3F2614" strokeWidth={1.4} />
      {/* the emblem, painted on the door */}
      {emblem && (
        <g transform="translate(0, -24) scale(1.15)">
          <EmblemArt code={emblem} />
        </g>
      )}
      {/* the flag — signal red when up, and NEVER a custom color */}
      <g transform={`translate(19, ${flagUp ? -38 : -18})`}>
        <rect x={-1.5} y={-10} width={3} height={16} rx={1}
              fill="#8B5A2B" stroke="#5A3B1F" strokeWidth={1} />
        <path d="M 1.5 -10 L 13 -6.5 L 1.5 -3 Z"
              fill={flagUp ? '#C94C3E' : '#B9B0A1'}
              stroke="#3F2614" strokeWidth={1.2} strokeLinejoin="round" />
      </g>
    </g>
  );
}

/** Self-contained letterbox for HTML contexts (chips, panels). */
export function LetterboxArt({
  colorCode, emblem, flagUp, size = 80,
}: {
  colorCode: string;
  emblem?: string;
  flagUp: boolean;
  size?: number;
}) {
  return (
    <svg width={size} height={size * 1.13} viewBox="-40 -52 80 90" aria-hidden>
      <LetterboxGroup colorCode={colorCode} emblem={emblem} flagUp={flagUp} />
    </svg>
  );
}
