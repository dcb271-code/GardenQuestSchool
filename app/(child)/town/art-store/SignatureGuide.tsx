'use client';

// The dotted name over a painting, for Sign Her Name. Pure drawing:
// the Easel owns the tracing state and the ink; this only shows the
// dots — finished letters vanish (her own line is there now), the
// current letter's next dot is big, letters still to come are faint.
// pointer-events: none, so the finger reaches the canvas beneath.

import React from 'react';
import { LETTER_GUIDES, checkpoints, nextDot, type TraceProgress } from '@/lib/level0/signature';

export const SIG_BOX = 68;      // one letter's box, in canvas units — 8 letters fit a 640 canvas
export const SIG_GAP = 8;
export const SIG_MARGIN = 20;

/** Where letter `i` of `n` sits on a CANVAS_W × CANVAS_H painting. */
export function letterOrigin(i: number, n: number, canvasW: number, canvasH: number): [number, number] {
  const total = n * (SIG_BOX + SIG_GAP) - SIG_GAP;
  return [canvasW - SIG_MARGIN - total + i * (SIG_BOX + SIG_GAP), canvasH - SIG_MARGIN - SIG_BOX];
}

export default function SignatureGuide({
  letters, current, progress, canvasW, canvasH,
}: {
  letters: string[];
  /** Index of the letter being traced; letters before it are finished. */
  current: number;
  progress: TraceProgress;
  canvasW: number;
  canvasH: number;
}) {
  const s = SIG_BOX / 100;
  return (
    <svg viewBox={`0 0 ${canvasW} ${canvasH}`} className="absolute inset-0 w-full h-full"
         style={{ pointerEvents: 'none' }} aria-hidden>
      {letters.map((ch, i) => {
        if (i < current) return null;
        const guide = LETTER_GUIDES[ch];
        const [ox, oy] = letterOrigin(i, letters.length, canvasW, canvasH);
        const isCurrent = i === current;
        const next = isCurrent ? nextDot(guide, progress) : null;
        return (
          <g key={i} transform={`translate(${ox} ${oy}) scale(${s})`} opacity={isCurrent ? 1 : 0.35}>
            {/* the letter's shape, dotted */}
            {guide.map((stroke, k) => (
              <polyline key={k} points={stroke.map(p => p.join(',')).join(' ')}
                        fill="none" stroke="#8A6A48" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round"
                        strokeDasharray="1 11" opacity={0.7} />
            ))}
            {/* the dots to pass */}
            {guide.map((stroke, k) => checkpoints(stroke).map((d, j) => {
              const passed = isCurrent && (k < progress.stroke || (k === progress.stroke && j < progress.dot));
              if (passed) return null;
              return <circle key={`${k}-${j}`} cx={d[0]} cy={d[1]} r={6} fill="#C9A063" stroke="#8A6A48" strokeWidth={2} />;
            }))}
            {/* the next dot, big */}
            {next && (
              <circle cx={next[0]} cy={next[1]} r={13} fill="#E8913A" stroke="#2A2420" strokeWidth={3} />
            )}
          </g>
        );
      })}
    </svg>
  );
}
