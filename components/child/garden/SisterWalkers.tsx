'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Where the sisters live when they're not wandering — just in front of
// the cozy house porch.
export const SISTERS_HOME = { x: 220, y: 600 };

// On a fresh page load, the sisters emerge from the house's red door.
// House is at (100, 500) size 140 → door bottom at ~(110, 543).
const DOOR_EMERGE = { x: 110, y: 548 };

// Esme trails Cecily at a constant offset (Piglet-following-Pooh).
const ESME_OFFSET = { x: 24, y: 10 };

// Walk duration feels consistent regardless of distance.
const WALK_DURATION_MS = 1200;

export default function SisterWalkers({
  target,
  walking,
  reducedMotion = false,
}: {
  target: { x: number; y: number };
  walking: boolean;
  reducedMotion?: boolean;
}) {
  // Welcome cutscene on mount: sisters emerge from the door, then
  // walk to their idle "home" position. We consider them walking for
  // the duration of that first journey.
  const [mountWalking, setMountWalking] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setMountWalking(false), WALK_DURATION_MS + 200);
    return () => clearTimeout(t);
  }, []);

  const isWalking = walking || mountWalking;

  const esmeTarget = {
    x: target.x - ESME_OFFSET.x,
    y: target.y + ESME_OFFSET.y,
  };

  const cecilyTransition = reducedMotion
    ? { duration: 0.01 }
    : { duration: WALK_DURATION_MS / 1000, ease: [0.42, 0, 0.4, 1] as any };
  const esmeTransition = reducedMotion
    ? { duration: 0.01 }
    : { duration: WALK_DURATION_MS / 1000, ease: [0.42, 0, 0.4, 1] as any, delay: 0.18 };

  return (
    <g pointerEvents="none">
      {/* Esme — trails behind, renders behind when they overlap */}
      <motion.g
        initial={{ x: DOOR_EMERGE.x - ESME_OFFSET.x, y: DOOR_EMERGE.y + ESME_OFFSET.y, opacity: 0 }}
        animate={{ x: esmeTarget.x, y: esmeTarget.y, opacity: 1 }}
        transition={esmeTransition}
      >
        <Esme walking={isWalking} reducedMotion={reducedMotion} />
      </motion.g>

      {/* Cecily — leader, renders on top */}
      <motion.g
        initial={{ x: DOOR_EMERGE.x, y: DOOR_EMERGE.y, opacity: 0 }}
        animate={{ x: target.x, y: target.y, opacity: 1 }}
        transition={cecilyTransition}
      >
        <Cecily walking={isWalking} reducedMotion={reducedMotion} />
      </motion.g>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Shared palette — warm, realistic tones for quarter-Japanese kids.
// Skin: warm peach. Hair: chestnut brown (not black). Eyes: dark brown
// with a subtle almond shape (not round dots).
// ─────────────────────────────────────────────────────────────────────────

const EYE_DARK = '#3B2515';      // dark warm brown
const LINE = '#3F2817';          // outline color
const SKIN_C = '#F4C9A0';        // warm peach (Cecily)
const SKIN_E = '#F8D4AC';        // slightly lighter (Esme/toddler)
const HAIR_DARK = '#4E3325';     // chestnut-espresso
const HAIR_HIGHLIGHT = '#6B4B34';

// ─────────────────────────────────────────────────────────────────────────
// CECILY — 7yo, thin. Butter-yellow dress with terracotta trim + sage sash.
// Chestnut hair in low pigtails. Face is clearly visible — hair sits
// behind the head and only light bangs on the forehead.
// ─────────────────────────────────────────────────────────────────────────

function Cecily({ walking, reducedMotion }: { walking: boolean; reducedMotion: boolean }) {
  const DRESS = '#FFD98A';         // butter yellow
  const TRIM = '#E8A87C';          // terracotta hem
  const SASH = '#95B88F';          // sage sash

  const bobAnim = reducedMotion ? {} : walking ? { y: [0, -3, 0, -3, 0] } : { y: [0, -1, 0] };
  const bobTransition = reducedMotion
    ? {}
    : walking
      ? { duration: 0.55, repeat: Infinity, ease: 'easeInOut' as const }
      : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' as const };

  return (
    <motion.g animate={bobAnim} transition={bobTransition} style={{ transformOrigin: '0px 0px' }}>
      {/* ground shadow */}
      <ellipse cx={0} cy={22} rx={10} ry={2.5} fill="#000" opacity={0.22} />

      {/* BACK HAIR — sits behind everything else. Two low pigtails
          sticking out behind the head and a small back-pony silhouette. */}
      <motion.g
        animate={reducedMotion ? {} : walking ? { rotate: [-3, 3, -3] } : { rotate: [-1, 1, -1] }}
        transition={reducedMotion ? {} : walking
          ? { duration: 0.55, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '0px -10px' }}
      >
        {/* back halo (hair behind head) */}
        <ellipse cx={0} cy={-10} rx={6.2} ry={5.8} fill={HAIR_DARK} />
        {/* left low pigtail */}
        <path
          d="M -5 -8 Q -8 -6 -9 -3 Q -8 -1 -6 -2 Q -5 -4 -4 -6 Z"
          fill={HAIR_DARK}
          stroke={LINE}
          strokeWidth={0.6}
          strokeLinejoin="round"
        />
        {/* right low pigtail */}
        <path
          d="M 5 -8 Q 8 -6 9 -3 Q 8 -1 6 -2 Q 5 -4 4 -6 Z"
          fill={HAIR_DARK}
          stroke={LINE}
          strokeWidth={0.6}
          strokeLinejoin="round"
        />
      </motion.g>

      {/* LEGS — thin strokes with walking scissor */}
      <motion.g
        animate={reducedMotion ? {} : walking ? { rotate: [-8, 8, -8] } : { rotate: 0 }}
        transition={reducedMotion ? {} : walking
          ? { duration: 0.55, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0 }}
        style={{ transformOrigin: '-2px 16px' }}
      >
        <line x1={-2} y1={16} x2={-2} y2={22} stroke={LINE} strokeWidth={1.7} strokeLinecap="round" />
      </motion.g>
      <motion.g
        animate={reducedMotion ? {} : walking ? { rotate: [8, -8, 8] } : { rotate: 0 }}
        transition={reducedMotion ? {} : walking
          ? { duration: 0.55, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0 }}
        style={{ transformOrigin: '2px 16px' }}
      >
        <line x1={2} y1={16} x2={2} y2={22} stroke={LINE} strokeWidth={1.7} strokeLinecap="round" />
      </motion.g>

      {/* SKIRT with flutter */}
      <motion.g
        animate={reducedMotion ? {} : walking ? { skewX: [0, -2, 0, 2, 0] } : { skewX: [0, 0.5, 0] }}
        transition={reducedMotion ? {} : walking
          ? { duration: 0.55, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path
          d="M -7 2 Q -10 9 -11 16 Q -8 17 0 17 Q 8 17 11 16 Q 10 9 7 2 Z"
          fill={DRESS} stroke={LINE} strokeWidth={1.2} strokeLinejoin="round"
        />
        {/* Hem trim */}
        <path d="M -11 16 Q -8 17 0 17 Q 8 17 11 16" stroke={TRIM} strokeWidth={1} fill="none" />
      </motion.g>

      {/* BODICE */}
      <rect x={-5.5} y={-2} width={11} height={6} rx={1} fill={DRESS} stroke={LINE} strokeWidth={1.2} />
      {/* sage sash */}
      <rect x={-6} y={2} width={12} height={1.6} fill={SASH} stroke={LINE} strokeWidth={0.5} />

      {/* ARMS — small skin-colored stubs */}
      <motion.g
        animate={reducedMotion ? {} : walking ? { rotate: [8, -8, 8] } : { rotate: 0 }}
        transition={reducedMotion ? {} : walking
          ? { duration: 0.55, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0 }}
        style={{ transformOrigin: '-5px -1px' }}
      >
        <line x1={-5.5} y1={-1} x2={-7} y2={4} stroke={SKIN_C} strokeWidth={1.8} strokeLinecap="round" />
      </motion.g>
      <motion.g
        animate={reducedMotion ? {} : walking ? { rotate: [-8, 8, -8] } : { rotate: 0 }}
        transition={reducedMotion ? {} : walking
          ? { duration: 0.55, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0 }}
        style={{ transformOrigin: '5px -1px' }}
      >
        <line x1={5.5} y1={-1} x2={7} y2={4} stroke={SKIN_C} strokeWidth={1.8} strokeLinecap="round" />
      </motion.g>

      {/* NECK */}
      <rect x={-1.2} y={-4} width={2.4} height={2.5} fill={SKIN_C} />

      {/* HEAD — warm peach, properly visible */}
      <ellipse cx={0} cy={-8} rx={5.5} ry={6} fill={SKIN_C} stroke={LINE} strokeWidth={1.1} />

      {/* LIGHT BANGS — only at the very top of the forehead, asymmetric
          sweep. Does NOT cover the eye area. */}
      <path
        d="M -4.8 -11.8
           Q -3 -13.5 0 -13.2
           Q 3 -13.5 4.8 -11.8
           Q 3.4 -11.4 2 -11.3
           Q 0 -11.2 -2 -11.3
           Q -3.4 -11.4 -4.8 -11.8 Z"
        fill={HAIR_DARK} stroke={LINE} strokeWidth={0.8} strokeLinejoin="round"
      />
      {/* tiny highlight on bangs */}
      <path d="M -2 -13 Q -0.5 -13.3 1 -13" stroke={HAIR_HIGHLIGHT} strokeWidth={0.6} fill="none" strokeLinecap="round" opacity={0.7} />

      {/* EYES — warm brown almond-shape (not dark dots) */}
      <ellipse cx={-2} cy={-8} rx={0.9} ry={1.2} fill={EYE_DARK} />
      <ellipse cx={2} cy={-8} rx={0.9} ry={1.2} fill={EYE_DARK} />
      {/* eye highlights */}
      <circle cx={-1.7} cy={-8.4} r={0.3} fill="#FFFFFF" />
      <circle cx={2.3} cy={-8.4} r={0.3} fill="#FFFFFF" />

      {/* soft eyebrows */}
      <path d="M -3 -10.2 Q -2 -10.5 -1 -10.3" stroke={HAIR_DARK} strokeWidth={0.5} fill="none" strokeLinecap="round" />
      <path d="M 1 -10.3 Q 2 -10.5 3 -10.2" stroke={HAIR_DARK} strokeWidth={0.5} fill="none" strokeLinecap="round" />

      {/* CHEEK BLUSH */}
      <ellipse cx={-3} cy={-6.2} rx={1} ry={0.55} fill="#F8B4B4" opacity={0.75} />
      <ellipse cx={3} cy={-6.2} rx={1} ry={0.55} fill="#F8B4B4" opacity={0.75} />

      {/* MOUTH — tiny soft smile */}
      <path d="M -1 -5.5 Q 0 -4.8 1 -5.5" stroke={LINE} strokeWidth={0.7} fill="none" strokeLinecap="round" />

      {/* small freckle */}
      <circle cx={-0.5} cy={-7} r={0.25} fill="#C29670" opacity={0.75} />
    </motion.g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// ESME — 3yo, chubbier. Pink pinafore with cream collar. Small top bun
// with a pink bow. Face proportionally bigger (toddler). Warm peach skin.
// ─────────────────────────────────────────────────────────────────────────

function Esme({ walking, reducedMotion }: { walking: boolean; reducedMotion: boolean }) {
  const PINAFORE = '#F5A8C2';   // pink
  const UNDER = '#FFFDF2';      // cream
  const BOW = '#E8708C';

  const bobAnim = reducedMotion ? {} : walking ? { y: [0, -2.5, 0, -2.5, 0] } : { y: [0, -0.8, 0] };
  const bobTransition = reducedMotion
    ? {}
    : walking
      ? { duration: 0.5, repeat: Infinity, ease: 'easeInOut' as const }
      : { duration: 3.6, repeat: Infinity, ease: 'easeInOut' as const };

  return (
    <motion.g animate={bobAnim} transition={bobTransition} style={{ transformOrigin: '0px 0px' }}>
      {/* shadow */}
      <ellipse cx={0} cy={17} rx={8} ry={2} fill="#000" opacity={0.22} />

      {/* BACK HAIR halo — behind head, no face coverage */}
      <motion.g
        animate={reducedMotion ? {} : walking ? { rotate: [-2, 2, -2] } : { rotate: 0 }}
        transition={reducedMotion ? {} : walking
          ? { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0 }}
        style={{ transformOrigin: '0px -5px' }}
      >
        <ellipse cx={0} cy={-6} rx={6} ry={5.7} fill={HAIR_DARK} />
      </motion.g>

      {/* LEGS */}
      <motion.g
        animate={reducedMotion ? {} : walking ? { rotate: [-10, 10, -10] } : { rotate: 0 }}
        transition={reducedMotion ? {} : walking
          ? { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0 }}
        style={{ transformOrigin: '-1.5px 12px' }}
      >
        <line x1={-1.5} y1={12} x2={-1.5} y2={17} stroke={LINE} strokeWidth={1.6} strokeLinecap="round" />
      </motion.g>
      <motion.g
        animate={reducedMotion ? {} : walking ? { rotate: [10, -10, 10] } : { rotate: 0 }}
        transition={reducedMotion ? {} : walking
          ? { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0 }}
        style={{ transformOrigin: '1.5px 12px' }}
      >
        <line x1={1.5} y1={12} x2={1.5} y2={17} stroke={LINE} strokeWidth={1.6} strokeLinecap="round" />
      </motion.g>

      {/* PINAFORE */}
      <path
        d="M -5 0 Q -7 6 -7 12 Q -4 13 0 13 Q 4 13 7 12 Q 7 6 5 0 Z"
        fill={PINAFORE} stroke={LINE} strokeWidth={1.1} strokeLinejoin="round"
      />
      {/* Cream collar */}
      <rect x={-5} y={0} width={10} height={2} fill={UNDER} stroke={LINE} strokeWidth={0.8} />
      {/* hem peek of underdress */}
      <path d="M -7 12 Q -4 13 0 13 Q 4 13 7 12 L 7 13.2 L -7 13.2 Z" fill={UNDER} opacity={0.75} />

      {/* ARMS — skin stubs */}
      <motion.g
        animate={reducedMotion ? {} : walking ? { rotate: [8, -8, 8] } : { rotate: 0 }}
        transition={reducedMotion ? {} : walking
          ? { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0 }}
        style={{ transformOrigin: '-4px 2px' }}
      >
        <line x1={-4.5} y1={2} x2={-5.5} y2={5} stroke={SKIN_E} strokeWidth={1.6} strokeLinecap="round" />
      </motion.g>
      <motion.g
        animate={reducedMotion ? {} : walking ? { rotate: [-8, 8, -8] } : { rotate: 0 }}
        transition={reducedMotion ? {} : walking
          ? { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0 }}
        style={{ transformOrigin: '4px 2px' }}
      >
        <line x1={4.5} y1={2} x2={5.5} y2={5} stroke={SKIN_E} strokeWidth={1.6} strokeLinecap="round" />
      </motion.g>

      {/* HEAD — bigger proportionally (toddler) */}
      <ellipse cx={0} cy={-5} rx={5.5} ry={5.8} fill={SKIN_E} stroke={LINE} strokeWidth={1.1} />

      {/* TOP BUN — perched above, small and tidy */}
      <ellipse cx={0} cy={-11.5} rx={2.4} ry={2} fill={HAIR_DARK} stroke={LINE} strokeWidth={0.7} />
      {/* pink bow */}
      <path d="M -2.4 -12 L -1 -11 L -2.4 -10 Z" fill={BOW} stroke={LINE} strokeWidth={0.5} strokeLinejoin="round" />
      <path d="M 2.4 -12 L 1 -11 L 2.4 -10 Z" fill={BOW} stroke={LINE} strokeWidth={0.5} strokeLinejoin="round" />
      <circle cx={0} cy={-11} r={0.5} fill={BOW} stroke={LINE} strokeWidth={0.4} />

      {/* LIGHT BANGS — soft wisp only at top of forehead */}
      <path
        d="M -4 -9
           Q -2 -10 0 -9.7
           Q 2 -10 4 -9
           Q 2.5 -8.6 1 -8.5
           Q 0 -8.4 -1 -8.5
           Q -2.5 -8.6 -4 -9 Z"
        fill={HAIR_DARK} stroke={LINE} strokeWidth={0.7} strokeLinejoin="round"
      />

      {/* EYES — bigger, round for toddler cuteness, warm brown */}
      <ellipse cx={-1.8} cy={-5} rx={1.1} ry={1.35} fill={EYE_DARK} />
      <ellipse cx={1.8} cy={-5} rx={1.1} ry={1.35} fill={EYE_DARK} />
      <circle cx={-1.5} cy={-5.4} r={0.4} fill="#FFFFFF" />
      <circle cx={2.1} cy={-5.4} r={0.4} fill="#FFFFFF" />

      {/* CHEEK BLUSH — prominent for baby face */}
      <ellipse cx={-3.2} cy={-3} rx={1.2} ry={0.6} fill="#F8A4BC" opacity={0.8} />
      <ellipse cx={3.2} cy={-3} rx={1.2} ry={0.6} fill="#F8A4BC" opacity={0.8} />

      {/* MOUTH — open-mouth happy baby smile */}
      <path d="M -1 -2.5 Q 0 -1.6 1 -2.5" stroke={LINE} strokeWidth={0.7} fill="none" strokeLinecap="round" />
      <circle cx={0} cy={-2.1} r={0.25} fill={BOW} opacity={0.6} />
    </motion.g>
  );
}
