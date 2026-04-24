'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// Where the sisters live when they're not wandering — just in front of
// the cozy house porch. Chosen so they don't overlap the house but feel
// like they "came from home."
export const SISTERS_HOME = { x: 220, y: 600 };

// Constant offset between Cecily and Esme so Esme always trails behind
// like Piglet following Pooh. Slight y offset so they aren't stacked.
const ESME_OFFSET = { x: 28, y: 10 };

// Walk duration regardless of distance (feels consistent, never too slow).
const WALK_DURATION_MS = 1200;

// The sister-walker render lives INSIDE the SVG scene. Takes Cecily's
// target and a walking flag.
export default function SisterWalkers({
  target,
  walking,
  reducedMotion = false,
}: {
  target: { x: number; y: number };
  walking: boolean;
  reducedMotion?: boolean;
}) {
  // Esme's target is Cecily's minus a small offset so she lags behind.
  const esmeTarget = { x: target.x - ESME_OFFSET.x, y: target.y + ESME_OFFSET.y };

  // Cecily: animate with a moderate ease
  const cecilyTransition = reducedMotion
    ? { duration: 0.01 }
    : { duration: WALK_DURATION_MS / 1000, ease: [0.42, 0, 0.4, 1] as any };

  // Esme: same animation curve but slight delay so she visibly trails
  const esmeTransition = reducedMotion
    ? { duration: 0.01 }
    : { duration: WALK_DURATION_MS / 1000, ease: [0.42, 0, 0.4, 1] as any, delay: 0.15 };

  return (
    <g pointerEvents="none">
      {/* Esme first so Cecily renders on top when close */}
      <motion.g
        animate={{ x: esmeTarget.x, y: esmeTarget.y }}
        transition={esmeTransition}
      >
        <Esme walking={walking} reducedMotion={reducedMotion} />
      </motion.g>

      <motion.g
        animate={{ x: target.x, y: target.y }}
        transition={cecilyTransition}
      >
        <Cecily walking={walking} reducedMotion={reducedMotion} />
      </motion.g>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// CECILY — 7-year-old, thin, flowy butter-yellow dress with sage sash.
// Miyazaki-style simple face: two dots for eyes, small pink blush, soft hair.
// ─────────────────────────────────────────────────────────────────────────

function Cecily({ walking, reducedMotion }: { walking: boolean; reducedMotion: boolean }) {
  const STROKE = '#3F2817';
  const SKIN = '#F6D6B4';
  const HAIR = '#4A3420';
  const DRESS_MAIN = '#FFD98A';      // butter yellow — pops against meadow green
  const DRESS_TRIM = '#E8A87C';      // terracotta trim
  const SASH = '#95B88F';            // sage sash (ties her to the world)

  // Idle breathing + walking bob. Walking is a faster vertical bob.
  const bobAnim = reducedMotion
    ? {}
    : walking
      ? { y: [0, -3, 0, -3, 0] }
      : { y: [0, -1, 0] };
  const bobTransition = reducedMotion
    ? {}
    : walking
      ? { duration: 0.55, repeat: Infinity, ease: 'easeInOut' as const }
      : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' as const };

  // Hair flutter — more pronounced while walking
  const hairAnim = reducedMotion
    ? {}
    : walking
      ? { rotate: [-4, 4, -4] }
      : { rotate: [-2, 2, -2] };
  const hairTransition = reducedMotion
    ? {}
    : walking
      ? { duration: 0.5, repeat: Infinity, ease: 'easeInOut' as const }
      : { duration: 4, repeat: Infinity, ease: 'easeInOut' as const };

  return (
    <motion.g
      animate={bobAnim}
      transition={bobTransition}
      style={{ transformOrigin: '0px 0px' }}
    >
      {/* ground shadow */}
      <ellipse cx={0} cy={22} rx={10} ry={2.5} fill="#000" opacity={0.22} />

      {/* LEGS — two thin strokes below the dress, with a simple walk cycle */}
      <motion.g
        animate={reducedMotion ? {} : walking ? { rotate: [-8, 8, -8] } : { rotate: 0 }}
        transition={reducedMotion ? {} : walking
          ? { duration: 0.55, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0 }}
        style={{ transformOrigin: '-2px 16px' }}
      >
        <line x1={-2} y1={16} x2={-2} y2={22} stroke={STROKE} strokeWidth={1.7} strokeLinecap="round" />
      </motion.g>
      <motion.g
        animate={reducedMotion ? {} : walking ? { rotate: [8, -8, 8] } : { rotate: 0 }}
        transition={reducedMotion ? {} : walking
          ? { duration: 0.55, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0 }}
        style={{ transformOrigin: '2px 16px' }}
      >
        <line x1={2} y1={16} x2={2} y2={22} stroke={STROKE} strokeWidth={1.7} strokeLinecap="round" />
      </motion.g>

      {/* DRESS — A-line skirt with flutter, + sash */}
      <motion.g
        animate={reducedMotion ? {} : walking ? { skewX: [0, -2, 0, 2, 0] } : { skewX: [0, 0.5, 0] }}
        transition={reducedMotion ? {} : walking
          ? { duration: 0.55, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Skirt */}
        <path
          d="M -7 2 Q -10 9 -11 16 Q -8 17 0 17 Q 8 17 11 16 Q 10 9 7 2 Z"
          fill={DRESS_MAIN}
          stroke={STROKE}
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
        {/* Hem trim */}
        <path d="M -11 16 Q -8 17 0 17 Q 8 17 11 16" stroke={DRESS_TRIM} strokeWidth={1} fill="none" />
      </motion.g>

      {/* BODICE (top of dress) */}
      <rect x={-5.5} y={-2} width={11} height={6} rx={1} fill={DRESS_MAIN} stroke={STROKE} strokeWidth={1.2} />
      {/* Sage sash */}
      <rect x={-6} y={2} width={12} height={1.6} fill={SASH} stroke={STROKE} strokeWidth={0.5} />

      {/* ARMS — small stubs peeking out */}
      <motion.g
        animate={reducedMotion ? {} : walking ? { rotate: [8, -8, 8] } : { rotate: 0 }}
        transition={reducedMotion ? {} : walking
          ? { duration: 0.55, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0 }}
        style={{ transformOrigin: '-5px -1px' }}
      >
        <line x1={-5.5} y1={-1} x2={-7} y2={4} stroke={SKIN} strokeWidth={1.6} strokeLinecap="round" />
      </motion.g>
      <motion.g
        animate={reducedMotion ? {} : walking ? { rotate: [-8, 8, -8] } : { rotate: 0 }}
        transition={reducedMotion ? {} : walking
          ? { duration: 0.55, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0 }}
        style={{ transformOrigin: '5px -1px' }}
      >
        <line x1={5.5} y1={-1} x2={7} y2={4} stroke={SKIN} strokeWidth={1.6} strokeLinecap="round" />
      </motion.g>

      {/* NECK */}
      <rect x={-1.2} y={-4} width={2.4} height={2.5} fill={SKIN} />

      {/* HEAD — slight egg shape */}
      <ellipse cx={0} cy={-8} rx={5.5} ry={6} fill={SKIN} stroke={STROKE} strokeWidth={1.2} />

      {/* HAIR — long back-flowing strands (with flutter) */}
      <motion.g animate={hairAnim} transition={hairTransition} style={{ transformOrigin: '0px -8px' }}>
        {/* back hair */}
        <path
          d="M -5.5 -11 Q -7 -14 -5 -15 Q 0 -17 5 -15 Q 7 -14 5.5 -11
             Q 6 -6 7 -1 Q 6 2 4 1 Q 2 -3 0 -3 Q -2 -3 -4 1 Q -6 2 -7 -1 Q -6 -6 -5.5 -11 Z"
          fill={HAIR}
          stroke={STROKE}
          strokeWidth={1}
          strokeLinejoin="round"
        />
        {/* forelock (bangs) */}
        <path
          d="M -4 -12 Q -2 -14 0 -13 Q 2 -14 4 -12 Q 3 -9 2 -10 Q 0 -11 -2 -10 Q -3 -9 -4 -12 Z"
          fill={HAIR}
          stroke={STROKE}
          strokeWidth={0.8}
        />
      </motion.g>

      {/* EYES — two simple Miyazaki dots */}
      <circle cx={-1.8} cy={-8} r={0.9} fill={STROKE} />
      <circle cx={1.8} cy={-8} r={0.9} fill={STROKE} />
      {/* tiny eye highlights */}
      <circle cx={-1.5} cy={-8.3} r={0.3} fill="#FFFFFF" />
      <circle cx={2.1} cy={-8.3} r={0.3} fill="#FFFFFF" />

      {/* CHEEK BLUSH */}
      <ellipse cx={-2.8} cy={-6.5} rx={1} ry={0.5} fill="#F8B4B4" opacity={0.75} />
      <ellipse cx={2.8} cy={-6.5} rx={1} ry={0.5} fill="#F8B4B4" opacity={0.75} />

      {/* MOUTH — tiny soft curve */}
      <path d="M -0.8 -6 Q 0 -5.5 0.8 -6" stroke={STROKE} strokeWidth={0.7} fill="none" strokeLinecap="round" />
    </motion.g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// ESME — 3-year-old, chubbier, pink pinafore with cream underdress.
// Miyazaki-toddler face: even bigger head proportionally, tiny everything.
// ─────────────────────────────────────────────────────────────────────────

function Esme({ walking, reducedMotion }: { walking: boolean; reducedMotion: boolean }) {
  const STROKE = '#3F2817';
  const SKIN = '#F8DCC0';
  const HAIR = '#5B3F28';
  const PINAFORE = '#F5A8C2';   // pink
  const UNDER = '#FFFDF2';      // cream collar + sleeves

  const bobAnim = reducedMotion
    ? {}
    : walking
      ? { y: [0, -2.5, 0, -2.5, 0] }
      : { y: [0, -0.8, 0] };
  const bobTransition = reducedMotion
    ? {}
    : walking
      ? { duration: 0.5, repeat: Infinity, ease: 'easeInOut' as const }
      : { duration: 3.6, repeat: Infinity, ease: 'easeInOut' as const };

  return (
    <motion.g
      animate={bobAnim}
      transition={bobTransition}
      style={{ transformOrigin: '0px 0px' }}
    >
      {/* shadow */}
      <ellipse cx={0} cy={17} rx={8} ry={2} fill="#000" opacity={0.22} />

      {/* LEGS — very short */}
      <motion.g
        animate={reducedMotion ? {} : walking ? { rotate: [-10, 10, -10] } : { rotate: 0 }}
        transition={reducedMotion ? {} : walking
          ? { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0 }}
        style={{ transformOrigin: '-1.5px 12px' }}
      >
        <line x1={-1.5} y1={12} x2={-1.5} y2={17} stroke={STROKE} strokeWidth={1.6} strokeLinecap="round" />
      </motion.g>
      <motion.g
        animate={reducedMotion ? {} : walking ? { rotate: [10, -10, 10] } : { rotate: 0 }}
        transition={reducedMotion ? {} : walking
          ? { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0 }}
        style={{ transformOrigin: '1.5px 12px' }}
      >
        <line x1={1.5} y1={12} x2={1.5} y2={17} stroke={STROKE} strokeWidth={1.6} strokeLinecap="round" />
      </motion.g>

      {/* PINAFORE — rounder, shorter than Cecily's dress */}
      <path
        d="M -5 0 Q -7 6 -7 12 Q -4 13 0 13 Q 4 13 7 12 Q 7 6 5 0 Z"
        fill={PINAFORE}
        stroke={STROKE}
        strokeWidth={1.1}
        strokeLinejoin="round"
      />

      {/* Cream collar + peek of underdress at bottom */}
      <rect x={-5} y={0} width={10} height={2} fill={UNDER} stroke={STROKE} strokeWidth={0.8} />
      <path d="M -7 12 Q -4 13 0 13 Q 4 13 7 12 L 7 13 L -7 13 Z" fill={UNDER} opacity={0.8} />

      {/* ARMS — tiny stubs */}
      <motion.g
        animate={reducedMotion ? {} : walking ? { rotate: [8, -8, 8] } : { rotate: 0 }}
        transition={reducedMotion ? {} : walking
          ? { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0 }}
        style={{ transformOrigin: '-4px 2px' }}
      >
        <line x1={-4.5} y1={2} x2={-5.5} y2={5} stroke={SKIN} strokeWidth={1.5} strokeLinecap="round" />
      </motion.g>
      <motion.g
        animate={reducedMotion ? {} : walking ? { rotate: [-8, 8, -8] } : { rotate: 0 }}
        transition={reducedMotion ? {} : walking
          ? { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0 }}
        style={{ transformOrigin: '4px 2px' }}
      >
        <line x1={4.5} y1={2} x2={5.5} y2={5} stroke={SKIN} strokeWidth={1.5} strokeLinecap="round" />
      </motion.g>

      {/* HEAD — bigger proportionally (toddler babyface) */}
      <ellipse cx={0} cy={-5} rx={5.5} ry={5.8} fill={SKIN} stroke={STROKE} strokeWidth={1.2} />

      {/* HAIR — single top knot with wispy strands */}
      <ellipse cx={0} cy={-11} rx={2.2} ry={1.8} fill={HAIR} stroke={STROKE} strokeWidth={0.9} />
      <path
        d="M -5 -9 Q -6 -7 -5 -5 Q -5 -2 -3 -1
           L 3 -1 Q 5 -2 5 -5 Q 6 -7 5 -9
           Q 3 -10 0 -10 Q -3 -10 -5 -9 Z"
        fill={HAIR}
        stroke={STROKE}
        strokeWidth={0.9}
        strokeLinejoin="round"
      />
      {/* bow */}
      <circle cx={0} cy={-12.5} r={0.8} fill={PINAFORE} stroke={STROKE} strokeWidth={0.5} />

      {/* EYES — bigger for cuteness */}
      <circle cx={-1.8} cy={-5} r={1} fill={STROKE} />
      <circle cx={1.8} cy={-5} r={1} fill={STROKE} />
      <circle cx={-1.5} cy={-5.3} r={0.35} fill="#FFFFFF" />
      <circle cx={2.1} cy={-5.3} r={0.35} fill="#FFFFFF" />

      {/* CHEEK BLUSH */}
      <ellipse cx={-3} cy={-3.2} rx={1.1} ry={0.55} fill="#F8A4BC" opacity={0.8} />
      <ellipse cx={3} cy={-3.2} rx={1.1} ry={0.55} fill="#F8A4BC" opacity={0.8} />

      {/* MOUTH — tiny happy smile */}
      <path d="M -1 -2.5 Q 0 -1.8 1 -2.5" stroke={STROKE} strokeWidth={0.7} fill="none" strokeLinecap="round" />
    </motion.g>
  );
}
