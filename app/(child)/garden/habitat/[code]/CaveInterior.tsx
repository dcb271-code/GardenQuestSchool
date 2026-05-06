// app/(child)/garden/habitat/[code]/CaveInterior.tsx
//
// Operations Cave interior — an old, lived-in mountain cavern. The
// composition centers on a STONE HEARTH where a long-burning fire
// throws warm light across the back wall; an OLD BLACK BEAR lies
// stretched out asleep beside the embers; CAVE PICTOGRAPHS in ochre
// adorn the back wall (deer, sun, handprint, spiral); MINERAL VEINS
// streak through the rock; STALACTITES drip from above, STALAGMITES
// rise from below; BIOLUMINESCENT MUSHROOMS glow in the dark corners;
// a small RIVER POOL exits at the right where the river that emerges
// from the cave-mouth on the Math Mountain map originates.
//
// The three skill stops are NATURAL STONE FORMATIONS — flat slabs
// shaped by water — not generic plinths.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { SpeciesData } from '@/lib/world/speciesCatalog';
import HabitatInteriorLayout from '@/components/child/garden/HabitatInteriorLayout';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';

export interface CaveSkillStop {
  code: string;
  skillCode: string;
  label: string;
  subLabel?: string;
  emoji: string;
  unlocked: boolean;
  completed: boolean;
  prereqDisplay: string;
}

interface CaveInteriorProps {
  learnerId: string;
  skillStops: CaveSkillStop[];
  discoveredSpecies: SpeciesData[];
  undiscoveredCount: number;
}

// ─────────────────────────────────────────────────────────────────────────
// SLEEPING BEAR — black bear lying STRETCHED OUT on its side asleep,
// facing right. Drawn as ONE big organic silhouette path (not a stack
// of round ellipses) with details layered on top. Pose is closer to
// a real sleeping animal — long horizontal shape, head resting on a
// front paw, hind legs trailing back, tail tucked.
// ─────────────────────────────────────────────────────────────────────────
function SleepyBear({ reducedMotion }: { reducedMotion: boolean }) {
  const LINE = '#1A1208';
  const FUR = '#3A2A1A';
  const FUR_DARK = '#1F1408';
  const FUR_HI = '#5A4030';
  const BELLY = '#7A5836';
  const PAW_PAD = '#1A1208';
  const NOSE = '#0A0604';

  return (
    <g transform="translate(310, 700)">
      {/* GROUND SHADOW — long horizontal under the bear's whole body */}
      <ellipse cx={10} cy={42} rx={140} ry={10} fill="#000" opacity={0.40} />

      {/* MAIN BODY SILHOUETTE — single flowing path that traces the
          ENTIRE bear from head-tip to tail-tip in one go. No stacked
          ellipses. The bear is lying on its right side with the head
          forward (right), back arched along the top, hind legs trailing
          to the left, tail at the very back. */}
      <motion.path
        d="
          M -130 28
          C -136 24, -134 16, -126 12
          C -118 8, -100 6, -82 8
          L -68 4
          C -58 -2, -42 -8, -22 -10
          L -8 -14
          C 4 -18, 18 -20, 32 -18
          C 48 -16, 60 -10, 70 0
          C 82 8, 92 14, 100 22
          C 108 28, 110 34, 106 40
          L 96 42
          C 84 44, 70 44, 56 40
          L 40 38
          C 28 36, 16 32, 0 28
          L -20 26
          C -38 22, -56 22, -74 26
          L -90 32
          C -104 38, -120 38, -130 28 Z
        "
        fill={FUR} stroke={LINE} strokeWidth={2}
        animate={reducedMotion ? undefined : { scaleY: [1, 1.025, 1] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ originX: '0px', originY: '20px' }}
      />

      {/* DARKER UNDERBELLY SHADING — runs along the bottom of the body */}
      <path
        d="M -120 30 C -90 38, -50 42, 0 38 C 50 36, 80 36, 100 38
           L 96 42 C 70 44, 30 42, -10 38 C -50 34, -90 36, -120 30 Z"
        fill={FUR_DARK} opacity={0.55} pointerEvents="none"
      />

      {/* BACK HIGHLIGHT — lighter fur tone along the top of the body */}
      <path
        d="M -100 12 Q -60 4, -10 -8 Q 30 -16, 60 -10 Q 80 -4, 90 4
           Q 60 0, 30 -4 Q -10 -10, -50 -2 Q -80 6, -100 12 Z"
        fill={FUR_HI} opacity={0.45} pointerEvents="none"
      />

      {/* HAND-DRAWN FUR STROKES along the back — suggesting individual
          tufts. Short curves angled toward the rear. */}
      {[
        { sx: -90, sy: 8, dx: -6, dy: -4 },
        { sx: -60, sy: 0, dx: -6, dy: -5 },
        { sx: -30, sy: -8, dx: -6, dy: -5 },
        { sx: 0,   sy: -12, dx: -5, dy: -5 },
        { sx: 26,  sy: -14, dx: -5, dy: -4 },
        { sx: 50,  sy: -10, dx: -4, dy: -4 },
        { sx: 70,  sy: -2, dx: -3, dy: -4 },
      ].map((s, i) => (
        <path
          key={`fb-${i}`}
          d={`M ${s.sx} ${s.sy} q ${s.dx * 0.5} ${s.dy * 0.6} ${s.dx} ${s.dy}`}
          stroke={FUR_DARK} strokeWidth={0.7} fill="none" opacity={0.55}
          strokeLinecap="round" pointerEvents="none"
        />
      ))}

      {/* TAIL — short stubby fluff at the very back-left */}
      <path
        d="M -128 18 C -134 14, -136 10, -132 6 C -126 4, -120 8, -120 14
           C -120 20, -126 22, -128 18 Z"
        fill={FUR} stroke={LINE} strokeWidth={1.2} pointerEvents="none"
      />
      <path
        d="M -130 14 Q -128 12, -126 14"
        stroke={FUR_HI} strokeWidth={1.0} fill="none" opacity={0.65} strokeLinecap="round" pointerEvents="none"
      />

      {/* HIND LEG — folded back, visible at the bottom-rear of the body.
          A single curve that flows out of the body silhouette. */}
      <path
        d="M -78 28 C -82 36, -76 44, -64 44 C -52 44, -44 38, -42 32
           C -50 30, -68 26, -78 28 Z"
        fill={FUR_DARK} stroke={LINE} strokeWidth={1.4} strokeLinejoin="round" pointerEvents="none"
      />
      {/* hind paw pad */}
      <ellipse cx={-58} cy={42} rx={5} ry={2} fill={PAW_PAD} opacity={0.8} pointerEvents="none" />
      <circle cx={-60} cy={42} r={0.7} fill={PAW_PAD} pointerEvents="none" />
      <circle cx={-56} cy={43} r={0.7} fill={PAW_PAD} pointerEvents="none" />
      <circle cx={-54} cy={41} r={0.7} fill={PAW_PAD} pointerEvents="none" />
      {/* hind claws — small dark crescents */}
      <path d="M -52 32 Q -50 31 -50 33" stroke={LINE} strokeWidth={0.8} fill="none" strokeLinecap="round" pointerEvents="none" />
      <path d="M -50 35 Q -48 34 -48 36" stroke={LINE} strokeWidth={0.8} fill="none" strokeLinecap="round" pointerEvents="none" />

      {/* FRONT PAW — extended forward in front of the muzzle, head rests
          on it. Single flowing shape. */}
      <path
        d="M 70 24 C 84 22, 100 24, 110 32 C 114 38, 110 42, 102 42
           C 88 42, 76 38, 70 32 C 66 28, 66 26, 70 24 Z"
        fill={FUR} stroke={LINE} strokeWidth={1.4} strokeLinejoin="round" pointerEvents="none"
      />
      {/* front paw pad */}
      <ellipse cx={100} cy={38} rx={6} ry={2.4} fill={PAW_PAD} opacity={0.85} pointerEvents="none" />
      <circle cx={97} cy={36} r={0.8} fill={PAW_PAD} pointerEvents="none" />
      <circle cx={101} cy={37} r={0.8} fill={PAW_PAD} pointerEvents="none" />
      <circle cx={104} cy={39} r={0.8} fill={PAW_PAD} pointerEvents="none" />
      <circle cx={101} cy={40} r={0.8} fill={PAW_PAD} pointerEvents="none" />
      {/* front claws */}
      <path d="M 108 32 Q 110 31 110 33" stroke={LINE} strokeWidth={0.8} fill="none" strokeLinecap="round" pointerEvents="none" />
      <path d="M 110 34 Q 112 33 112 35" stroke={LINE} strokeWidth={0.8} fill="none" strokeLinecap="round" pointerEvents="none" />
      <path d="M 110 37 Q 112 36 112 38" stroke={LINE} strokeWidth={0.8} fill="none" strokeLinecap="round" pointerEvents="none" />

      {/* HEAD — rests on the front paw. Single path, profile view, with
          a boxy real-bear snout. */}
      <motion.g
        animate={reducedMotion ? undefined : { y: [0, -1, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* head silhouette — single shape from forehead to chin */}
        <path
          d="M 30 -10
             C 24 -22, 36 -34, 54 -34
             C 70 -34, 80 -28, 84 -16
             C 86 -10, 88 -4, 92 2
             C 96 8, 92 14, 86 16
             C 80 20, 70 22, 60 22
             C 48 24, 38 22, 32 16
             C 28 8, 28 -2, 30 -10 Z"
          fill={FUR} stroke={LINE} strokeWidth={2} strokeLinejoin="round"
        />
        {/* MUZZLE — protruding boxy snout, paler */}
        <path
          d="M 80 6 C 86 8, 92 8, 96 4
             C 100 0, 100 -6, 96 -10
             C 92 -12, 84 -10, 80 -6
             C 78 -2, 78 2, 80 6 Z"
          fill={BELLY} stroke={LINE} strokeWidth={1.3} strokeLinejoin="round"
        />
        {/* head highlight on top of skull */}
        <path d="M 36 -28 Q 56 -34, 76 -28 Q 56 -24, 36 -28 Z"
              fill={FUR_HI} opacity={0.6} />

        {/* far ear (back-left, smaller) */}
        <path
          d="M 36 -22 C 30 -28, 32 -36, 38 -36 C 42 -34, 44 -28, 42 -22 Z"
          fill={FUR_DARK} stroke={LINE} strokeWidth={1.2}
        />
        {/* near ear (right, closer to viewer, occasionally twitches) */}
        <motion.g
          animate={reducedMotion ? undefined : { rotate: [0, 0, 0, -8, 0, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: '60px', originY: '-30px' }}
        >
          <path
            d="M 54 -22 C 50 -32, 56 -38, 64 -36
               C 70 -34, 70 -26, 66 -22 Z"
            fill={FUR} stroke={LINE} strokeWidth={1.3} strokeLinejoin="round"
          />
          {/* inner ear pinkish */}
          <path
            d="M 56 -24 C 54 -30, 60 -34, 64 -32
               C 66 -30, 66 -26, 62 -24 Z"
            fill={BELLY} opacity={0.7}
          />
        </motion.g>

        {/* NOSE — chunky black tip, with subtle highlight */}
        <ellipse cx={96} cy={-2} rx={3.4} ry={2.6} fill={NOSE} stroke={LINE} strokeWidth={0.9} />
        <ellipse cx={95} cy={-3} rx={1.0} ry={0.6} fill="#FFFFFF" opacity={0.5} />
        {/* philtrum — small line from nose down */}
        <line x1={96} y1={1} x2={96} y2={4} stroke={LINE} strokeWidth={0.7} />

        {/* CLOSED EYE — single visible eye on this side, gentle upturned
            crescent (sleeping + content) */}
        <path d="M 64 -16 Q 70 -12 76 -16"
              stroke={LINE} strokeWidth={1.5} fill="none" strokeLinecap="round" />
        {/* eyelashes */}
        <path d="M 65 -15 L 64 -13" stroke={LINE} strokeWidth={0.5} strokeLinecap="round" />
        <path d="M 70 -13 L 70 -11" stroke={LINE} strokeWidth={0.5} strokeLinecap="round" />
        <path d="M 75 -15 L 76 -13" stroke={LINE} strokeWidth={0.5} strokeLinecap="round" />
        {/* eyebrow ridge */}
        <path d="M 64 -20 Q 70 -22 76 -20"
              stroke={LINE} strokeWidth={0.7} fill="none" opacity={0.65} strokeLinecap="round" />

        {/* MOUTH — small content curve below the muzzle */}
        <path d="M 88 6 Q 86 10, 82 9" stroke={LINE} strokeWidth={1.0} fill="none" strokeLinecap="round" />
        <path d="M 92 6 Q 94 10, 92 12" stroke={LINE} strokeWidth={1.0} fill="none" strokeLinecap="round" />

        {/* WHISKERS */}
        <line x1={84} y1={2} x2={92} y2={1}  stroke={LINE} strokeWidth={0.5} opacity={0.6} />
        <line x1={84} y1={4} x2={94} y2={5}  stroke={LINE} strokeWidth={0.5} opacity={0.6} />
      </motion.g>

      {/* WARM GLOW around the head — suggests the fire's light catching
          the bear's face */}
      <ellipse cx={70} cy={-10} rx={70} ry={40} fill="#FFD06B" opacity={0.10} pointerEvents="none" />

      {/* SOFT BREATH PARTICLES drifting up from the muzzle (replaces
          cartoon Zzz). */}
      {!reducedMotion && (
        <>
          <motion.circle
            cx={102} cy={-8} r={1.4} fill="#FFE89A"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: [0, 0.6, 0], y: [6, -10, -28] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.circle
            cx={106} cy={-12} r={1.0} fill="#FFE89A"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: [0, 0.5, 0], y: [4, -14, -32] }}
            transition={{ duration: 6, delay: 2.4, repeat: Infinity, ease: 'easeOut' }}
          />
        </>
      )}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// FIRE PIT — stone ring around glowing logs and embers, animated flicker.
// Sits in front of the bear as the warmth source.
// ─────────────────────────────────────────────────────────────────────────
function FirePit({ x, y, reducedMotion }: { x: number; y: number; reducedMotion: boolean }) {
  return (
    <g transform={`translate(${x}, ${y})`} pointerEvents="none">
      {/* glow halo on the cave floor */}
      <ellipse cx={0} cy={4} rx={130} ry={50} fill="#FFD06B" opacity={0.22} />
      <ellipse cx={0} cy={4} rx={80}  ry={30} fill="#FFE89A" opacity={0.30} />

      {/* RING OF STONES around the pit — 8 stones arranged in an oval */}
      {[
        { ax: -40, ay: 12, r: 7 },
        { ax: -26, ay: 18, r: 8 },
        { ax: -8,  ay: 22, r: 7 },
        { ax: 12,  ay: 22, r: 8 },
        { ax: 30,  ay: 18, r: 7 },
        { ax: 42,  ay: 12, r: 8 },
        { ax: 36,  ay: 4,  r: 6 },
        { ax: -34, ay: 4,  r: 6 },
      ].map((s, i) => (
        <g key={`fs-${i}`}>
          <ellipse cx={s.ax + 0.6} cy={s.ay + 1.5} rx={s.r} ry={s.r * 0.55}
                   fill="#000" opacity={0.32} />
          <ellipse cx={s.ax} cy={s.ay} rx={s.r} ry={s.r * 0.55}
                   fill={i % 2 === 0 ? '#9B948A' : '#7F7A70'}
                   stroke="#3F3026" strokeWidth={0.9} />
          <ellipse cx={s.ax - 1} cy={s.ay - 1} rx={s.r * 0.45} ry={s.r * 0.20}
                   fill="#C2B5A2" opacity={0.7} />
        </g>
      ))}

      {/* CHARRED GROUND inside the ring — dark patch */}
      <ellipse cx={0} cy={14} rx={32} ry={9} fill="#1A0F08" />

      {/* LOGS — two charred logs criss-crossing */}
      <ellipse cx={-4} cy={12} rx={22} ry={3} fill="#1A0F08" />
      <ellipse cx={-4} cy={10} rx={22} ry={3.5} fill="#3F2614" stroke="#1A0F08" strokeWidth={1.0}
               transform="rotate(-8 -4 10)" />
      <line x1={-26} y1={10} x2={18} y2={10} stroke="#1A1208" strokeWidth={0.7} opacity={0.6} />
      <ellipse cx={2} cy={14} rx={18} ry={3} fill="#1A0F08" />
      <ellipse cx={2} cy={12} rx={18} ry={3.5} fill="#3F2614" stroke="#1A0F08" strokeWidth={1.0}
               transform="rotate(12 2 12)" />

      {/* GLOWING EMBERS — bright spots between the logs */}
      <circle cx={-6}  cy={14} r={1.6} fill="#FFD06B" opacity={0.95} />
      <circle cx={2}   cy={15} r={1.8} fill="#FF9152" opacity={0.95} />
      <circle cx={10}  cy={14} r={1.4} fill="#FFD06B" opacity={0.9} />
      <circle cx={-14} cy={15} r={1.0} fill="#FF9152" opacity={0.85} />
      <circle cx={16}  cy={15} r={1.2} fill="#FFD06B" opacity={0.85} />
      <circle cx={6}   cy={11} r={1.0} fill="#FFFAF2" opacity={0.85} />

      {/* FLAMES — three licks animated */}
      {!reducedMotion ? (
        <>
          <motion.path
            d="M -4 8 C -8 0, -8 -8, -4 -14 C 0 -8, 0 0, -4 8 Z"
            fill="#FFFAF2"
            animate={{ scaleY: [1, 1.20, 0.90, 1.10, 1], opacity: [0.85, 1, 0.92, 1, 0.85] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '-4px', originY: '8px' }}
          />
          <motion.path
            d="M 6 8 C 3 2, 3 -4, 6 -10 C 9 -4, 9 2, 6 8 Z"
            fill="#FFD06B"
            animate={{ scaleY: [1, 1.10, 0.92, 1.18, 1], opacity: [0.9, 1, 0.85, 1, 0.9] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            style={{ originX: '6px', originY: '8px' }}
          />
          <motion.path
            d="M 14 10 C 12 6, 12 0, 14 -4 C 16 0, 16 6, 14 10 Z"
            fill="#FF9152"
            animate={{ scaleY: [1, 1.08, 0.95, 1.05, 1], opacity: [0.85, 1, 0.9, 1, 0.85] }}
            transition={{ duration: 2.0, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            style={{ originX: '14px', originY: '10px' }}
          />
        </>
      ) : (
        <>
          <path d="M -4 8 C -8 0, -8 -8, -4 -14 C 0 -8, 0 0, -4 8 Z" fill="#FFFAF2" opacity={0.9} />
          <path d="M 6 8 C 3 2, 3 -4, 6 -10 C 9 -4, 9 2, 6 8 Z" fill="#FFD06B" opacity={0.9} />
        </>
      )}

      {/* RISING SPARKS — tiny bright dots drifting up from the fire */}
      {!reducedMotion && (
        <>
          <motion.circle
            cx={2} cy={-14} r={1.0} fill="#FFD06B"
            animate={{ opacity: [0, 0.85, 0], y: [-14, -50, -90], x: [0, 4, -2] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.circle
            cx={-2} cy={-16} r={0.8} fill="#FFFAF2"
            animate={{ opacity: [0, 0.7, 0], y: [-16, -54, -100], x: [0, -3, 4] }}
            transition={{ duration: 3.6, delay: 1.2, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.circle
            cx={6} cy={-16} r={0.7} fill="#FF9152"
            animate={{ opacity: [0, 0.6, 0], y: [-16, -48, -88], x: [0, 5, 0] }}
            transition={{ duration: 3.4, delay: 2.0, repeat: Infinity, ease: 'easeOut' }}
          />
        </>
      )}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────

export default function CaveInterior({
  learnerId, skillStops, discoveredSpecies, undiscoveredCount,
}: CaveInteriorProps) {
  const router = useRouter();
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
  const [starting, setStarting] = useState(false);
  const [tappedLocked, setTappedLocked] = useState<string | null>(null);

  const startSkill = async (skillCode: string) => {
    if (starting) return;
    setStarting(true);
    const res = await fetch('/api/session/start', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ learnerId, skillCode }),
    });
    const { sessionId } = await res.json();
    router.push(`/lesson/${sessionId}`);
  };

  const onStopTap = (stop: CaveSkillStop) => {
    if (!stop.unlocked) {
      setTappedLocked(stop.code);
      window.setTimeout(() => setTappedLocked(null), 2500);
      return;
    }
    startSkill(stop.skillCode);
  };

  // Three skill stop positions — re-spaced to flank the central
  // fire pit + bear without crowding them.
  const STOP_POSITIONS: Array<{ x: number; y: number }> = [
    { x: 720, y: 380 },   // center-back, on a stone slab
    { x: 980, y: 550 },   // right side, nearer the river basin
    { x: 1180, y: 420 },  // far right, higher up
  ];

  return (
    <HabitatInteriorLayout learnerId={learnerId} title="Operations Cave" iconEmoji="🕳️">
      <svg
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'manipulation' }}
      >
        <defs>
          <radialGradient id="caveGlow" cx="42%" cy="58%" r="68%">
            <stop offset="0%" stopColor="#FFD89A" stopOpacity={0.85} />
            <stop offset="18%" stopColor="#C9986C" />
            <stop offset="48%" stopColor="#6E5640" />
            <stop offset="82%" stopColor="#2E2218" />
            <stop offset="100%" stopColor="#1A1208" />
          </radialGradient>
          <linearGradient id="caveFloor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5A4533" stopOpacity={0} />
            <stop offset="60%" stopColor="#3A2E22" stopOpacity={0.7} />
            <stop offset="100%" stopColor="#1A1208" stopOpacity={0.95} />
          </linearGradient>
          {/* STONE WALL TEXTURE */}
          <pattern id="caveStone" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <rect width="60" height="60" fill="transparent" />
            <circle cx="12" cy="14" r="0.7" fill="#1A1208" opacity="0.5" />
            <circle cx="32" cy="22" r="0.6" fill="#1A1208" opacity="0.4" />
            <circle cx="48" cy="38" r="0.8" fill="#1A1208" opacity="0.5" />
            <circle cx="22" cy="46" r="0.6" fill="#5A4533" opacity="0.5" />
            <circle cx="6"  cy="40" r="0.5" fill="#5A4533" opacity="0.4" />
          </pattern>
        </defs>

        {/* base wash */}
        <rect width={1440} height={800} fill="url(#caveGlow)" />
        <rect width={1440} height={800} fill="url(#caveStone)" opacity={0.5} />

        {/* CAVE-MOUTH SILHOUETTE at the top — inverted arch */}
        <path
          d="M 0 0 L 0 240
             Q 100 160 220 130
             Q 380 100 540 90
             Q 720 84 900 90
             Q 1060 100 1220 130
             Q 1340 160 1440 240
             L 1440 0 Z"
          fill="#1A1208" opacity={0.94}
        />

        {/* MINERAL VEINS — pale streaks through the dark walls */}
        <g pointerEvents="none">
          <path d="M 60 240 Q 120 220 180 250 Q 240 280 300 260"
                stroke="#A8B4C8" strokeWidth={1.2} fill="none" opacity={0.40} strokeLinecap="round" />
          <path d="M 60 240 Q 120 220 180 250 Q 240 280 300 260"
                stroke="#FFFFFF" strokeWidth={0.4} fill="none" opacity={0.30} strokeLinecap="round" />
          <path d="M 1100 260 Q 1180 240 1260 270 Q 1340 290 1400 270"
                stroke="#A8B4C8" strokeWidth={1.2} fill="none" opacity={0.40} strokeLinecap="round" />
          <path d="M 1100 260 Q 1180 240 1260 270 Q 1340 290 1400 270"
                stroke="#FFFFFF" strokeWidth={0.4} fill="none" opacity={0.30} strokeLinecap="round" />
          <path d="M 200 540 Q 140 580 80 560"
                stroke="#A8B4C8" strokeWidth={1.0} fill="none" opacity={0.30} strokeLinecap="round" />
          <path d="M 1240 560 Q 1320 580 1380 540"
                stroke="#A8B4C8" strokeWidth={1.0} fill="none" opacity={0.30} strokeLinecap="round" />
        </g>

        {/* CAVE PICTOGRAPHS — ochre wall drawings on the back wall */}
        <g pointerEvents="none" opacity={0.65}>
          {/* horse / deer outline */}
          <g transform="translate(560, 320)">
            <path
              d="M 0 0 L 8 -2 L 14 -8 L 22 -8 L 26 -4 L 28 -10 L 32 -10 L 34 -4 L 38 -4
                 L 38 4 L 30 6 L 28 12 L 24 12 L 24 6 L 14 6 L 14 12 L 10 12 L 10 6 L 0 4 Z"
              fill="#C4763A" stroke="#7A4621" strokeWidth={1.0} strokeLinejoin="round"
            />
            {/* tail flick */}
            <path d="M 38 0 L 44 -4" stroke="#C4763A" strokeWidth={1.4} strokeLinecap="round" />
            {/* eye */}
            <circle cx={4} cy={-1} r={0.6} fill="#7A4621" />
          </g>
          {/* sun pictograph */}
          <g transform="translate(700, 280)">
            <circle cx={0} cy={0} r={7} fill="#C4763A" opacity={0.8} />
            <circle cx={0} cy={0} r={4} fill="#FFD06B" opacity={0.55} />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => {
              const rad = (deg * Math.PI) / 180;
              return (
                <line key={deg} x1={Math.cos(rad) * 9} y1={Math.sin(rad) * 9}
                      x2={Math.cos(rad) * 14} y2={Math.sin(rad) * 14}
                      stroke="#C4763A" strokeWidth={1.4} strokeLinecap="round" />
              );
            })}
          </g>
          {/* small handprint */}
          <g transform="translate(820, 320)">
            <ellipse cx={0} cy={2} rx={5} ry={6.5} fill="#C4763A" />
            <ellipse cx={-5} cy={-3} rx={1.4} ry={3} fill="#C4763A" transform="rotate(-30 -5 -3)" />
            <ellipse cx={-2} cy={-7} rx={1.4} ry={3.5} fill="#C4763A" />
            <ellipse cx={2}  cy={-8} rx={1.4} ry={3.5} fill="#C4763A" />
            <ellipse cx={5}  cy={-6} rx={1.4} ry={3} fill="#C4763A" />
            <ellipse cx={7}  cy={-2} rx={1.4} ry={2.5} fill="#C4763A" transform="rotate(30 7 -2)" />
          </g>
          {/* spiral pictograph */}
          <g transform="translate(900, 280)">
            <path d="M 0 0 Q 4 -4 8 0 Q 8 6 0 6 Q -8 6 -8 -2 Q -8 -10 4 -10 Q 14 -10 14 0"
                  stroke="#C4763A" strokeWidth={1.6} fill="none" strokeLinecap="round" />
          </g>
          {/* tally marks below the pictographs */}
          <g transform="translate(648, 360)" stroke="#C4763A" strokeWidth={1.0} strokeLinecap="round">
            <line x1={0}  y1={0} x2={0}  y2={10} />
            <line x1={4}  y1={0} x2={4}  y2={10} />
            <line x1={8}  y1={0} x2={8}  y2={10} />
            <line x1={12} y1={0} x2={12} y2={10} />
            <line x1={-2} y1={5} x2={14} y2={3} />
          </g>
        </g>

        {/* STALACTITES from the ceiling — varied, with one dripping water */}
        {[
          { x: 180, h: 44 }, { x: 340, h: 60 }, { x: 480, h: 36 },
          { x: 600, h: 70, drips: true }, { x: 820, h: 48 },
          { x: 960, h: 62 }, { x: 1100, h: 38 }, { x: 1260, h: 56 },
        ].map((st, i) => (
          <g key={`stal-${i}`}>
            <path
              d={`M ${st.x - 12} 130 L ${st.x + 12} 130 L ${st.x} ${130 + st.h} Z`}
              fill="#3A2E22" stroke="#1A1208" strokeWidth={1.4} strokeLinejoin="round"
            />
            <path
              d={`M ${st.x - 8} 132 L ${st.x + 4} 132 L ${st.x - 2} ${130 + st.h * 0.7}`}
              stroke="#5A4533" strokeWidth={0.8} fill="none" opacity={0.6}
            />
            <ellipse cx={st.x} cy={130 + st.h - 1} rx={1.5} ry={0.6}
                     fill="#A8CDD2" opacity={0.6} />
            {st.drips && !reducedMotion && (
              <>
                <motion.circle
                  cx={st.x} cy={130 + st.h + 6} r={1.6} fill="#A8CDD2"
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: [0, 0.85, 0.85, 0], y: [0, 60, 110, 130] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeIn', times: [0, 0.05, 0.85, 1] }}
                />
                <motion.ellipse
                  cx={st.x} cy={730} rx={6} ry={1.6} fill="none"
                  stroke="#A8CDD2" strokeWidth={0.7}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: [0, 0.55, 0], scale: [0.4, 1.6, 2.4] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeOut', times: [0.85, 0.95, 1] }}
                  style={{ transformOrigin: `${st.x}px 730px` }}
                />
              </>
            )}
          </g>
        ))}

        {/* HANGING BATS — three small silhouettes from the ceiling */}
        {[
          { x: 270,  rotation: 8 },
          { x: 740,  rotation: -6 },
          { x: 1180, rotation: 4 },
        ].map((b, i) => (
          <g key={`bat-${i}`} transform={`translate(${b.x}, 130) rotate(${b.rotation})`} pointerEvents="none">
            <line x1={0} y1={0} x2={0} y2={2} stroke="#1A1208" strokeWidth={0.8} />
            <ellipse cx={0} cy={8} rx={3} ry={5} fill="#1A1208" />
            <path d="M 0 6 L -7 4 L -5 10 Z" fill="#1A1208" />
            <path d="M 0 6 L 7 4 L 5 10 Z" fill="#1A1208" />
            <circle cx={-1.2} cy={4} r={0.8} fill="#1A1208" />
            <circle cx={1.2}  cy={4} r={0.8} fill="#1A1208" />
          </g>
        ))}

        {/* HANGING MOSS + VINES from the upper-back */}
        {[210, 380, 1080, 1280].map((x, i) => (
          <g key={`vine-${i}`}>
            <path
              d={`M ${x} 120 Q ${x + (i % 2 === 0 ? -3 : 4)} 160 ${x - 4} 200`}
              stroke="#5C7E4F" strokeWidth={1.3} fill="none" strokeLinecap="round" opacity={0.7}
            />
            <ellipse cx={x - 2} cy={148} rx={2.4} ry={1.6} fill="#7BA46F" opacity={0.78} />
            <ellipse cx={x - 4} cy={178} rx={2} ry={1.4} fill="#A2C794" opacity={0.66} />
          </g>
        ))}

        {/* GLOWING CRYSTALS in the walls */}
        {[
          { x: 90,   y: 320, r: 6,  c: '#B5DAE1' },
          { x: 1380, y: 360, r: 7,  c: '#B5DAE1' },
          { x: 130,  y: 580, r: 5,  c: '#B5DAE1' },
          { x: 1340, y: 600, r: 6,  c: '#B5DAE1' },
        ].map((g, i) => (
          <g key={`gem-${i}`}>
            <ellipse cx={g.x} cy={g.y} rx={g.r * 2.4} ry={g.r * 1.6} fill={g.c} opacity={0.18} />
            <path
              d={`M ${g.x} ${g.y - g.r} L ${g.x + g.r} ${g.y} L ${g.x} ${g.y + g.r} L ${g.x - g.r} ${g.y} Z`}
              fill="#E0F0F4" stroke="#5A8F95" strokeWidth={1}
            />
            {!reducedMotion && (
              <motion.circle
                cx={g.x} cy={g.y - g.r * 0.4} r={g.r * 0.3} fill="#FFFFFF"
                animate={{ opacity: [0.3, 0.85, 0.3] }}
                transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </g>
        ))}

        {/* FLOOR — dark stone gradient */}
        <ellipse cx={720} cy={760} rx={760} ry={70} fill="#3A2E22" opacity={0.85} />
        <rect x={0} y={620} width={1440} height={180} fill="url(#caveFloor)" />

        {/* STALAGMITES rising from the floor */}
        {[
          { x: 90,   h: 60, w: 18 },
          { x: 380,  h: 40, w: 14 },
          { x: 540,  h: 70, w: 22 },
          { x: 1110, h: 48, w: 16 },
          { x: 1380, h: 55, w: 18 },
        ].map((sg, i) => (
          <g key={`sgm-${i}`} pointerEvents="none">
            <path
              d={`M ${sg.x - sg.w} 720 L ${sg.x + sg.w} 720 L ${sg.x} ${720 - sg.h} Z`}
              fill="#3A2E22" stroke="#1A1208" strokeWidth={1.4} strokeLinejoin="round"
            />
            <path
              d={`M ${sg.x - sg.w * 0.5} 720 L ${sg.x + sg.w * 0.2} 720 L ${sg.x - sg.w * 0.1} ${720 - sg.h * 0.7}`}
              stroke="#5A4533" strokeWidth={0.8} fill="none" opacity={0.6}
            />
            {i === 1 && (
              <ellipse cx={sg.x} cy={720} rx={sg.w * 0.7} ry={2} fill="#5C7E4F" opacity={0.6} />
            )}
          </g>
        ))}

        {/* GLOWING MUSHROOMS in the dark corners */}
        {[
          { x: 200, y: 690, scale: 1.1, glow: '#B5DDE6' },
          { x: 870, y: 696, scale: 1.0, glow: '#B5DDE6' },
          { x: 1250, y: 690, scale: 1.1, glow: '#C8E5EC' },
        ].map((m, i) => (
          <g key={`gmu-${i}`} transform={`translate(${m.x}, ${m.y}) scale(${m.scale})`} pointerEvents="none">
            {!reducedMotion && (
              <motion.ellipse
                cx={0} cy={-8} rx={20} ry={14} fill={m.glow}
                animate={{ opacity: [0.10, 0.28, 0.10] }}
                transition={{ duration: 4 + i * 0.6, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            <ellipse cx={2} cy={6} rx={14} ry={2.5} fill="#000" opacity={0.4} />
            <path d="M -2 4 C -3 -2, -3 -8, -2 -10 L 2 -10 C 3 -8, 3 -2, 2 4 Z"
                  fill="#FFFAF2" stroke="#5A4533" strokeWidth={0.8} strokeLinejoin="round" />
            <path d="M -10 -8 C -12 -16, -4 -22, 0 -22 C 4 -22, 12 -16, 10 -8 Z"
                  fill={m.glow} stroke="#5A8F95" strokeWidth={1.0} strokeLinejoin="round" />
            <path d="M -6 -14 Q 0 -20 6 -16" stroke="#FFFFFF" strokeWidth={1.2}
                  fill="none" opacity={0.65} strokeLinecap="round" />
            <path d="M -8 -8 L -8 -6 M -4 -10 L -4 -8 M 0 -10 L 0 -8 M 4 -10 L 4 -8 M 8 -8 L 8 -6"
                  stroke="#5A8F95" strokeWidth={0.7} opacity={0.7} />
            <path d="M -16 -2 C -18 -8, -12 -10, -10 -10 L -10 -8 L -8 -2 Z"
                  fill={m.glow} stroke="#5A8F95" strokeWidth={0.7} strokeLinejoin="round" opacity={0.85} />
          </g>
        ))}

        {/* RIVER POOL at the right — pooling stone basin where the
            river that flows out of the cave on the Math Mountain map
            originates. */}
        <g pointerEvents="none">
          {/* basin stone rim */}
          <ellipse cx={1280} cy={745} rx={140} ry={26} fill="#5A4533" stroke="#1A1208" strokeWidth={1.5} />
          <ellipse cx={1280} cy={744} rx={134} ry={23} fill="#3A2E22" />
          {/* water shadow */}
          <ellipse cx={1280} cy={742} rx={130} ry={22} fill="#4A6E72" opacity={0.7} />
          {/* main water */}
          <ellipse cx={1280} cy={738} rx={114} ry={18} fill="#7FA9B0" />
          {/* highlight */}
          <ellipse cx={1280} cy={734} rx={92} ry={12} fill="#A8CDD2" opacity={0.7} />
          {/* shimmer */}
          <path d="M 1230 728 Q 1250 724 1270 728" stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.5} strokeLinecap="round" />
          <path d="M 1290 738 Q 1310 734 1330 738" stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.45} strokeLinecap="round" />
          {!reducedMotion && (
            <motion.ellipse
              cx={1280} cy={734} rx={20} ry={6} fill="#FFFFFF"
              animate={{ opacity: [0.1, 0.35, 0.1], scaleX: [1, 1.14, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '1280px 734px', opacity: 0.22 }}
            />
          )}
          {/* small stones around the pool rim */}
          <ellipse cx={1150} cy={758} rx={6} ry={2} fill="#9B948A" stroke="#5A4533" strokeWidth={0.7} />
          <ellipse cx={1410} cy={760} rx={7} ry={2.2} fill="#7F7A70" stroke="#3F3026" strokeWidth={0.7} />
          {/* fern beside the pool */}
          <g transform="translate(1410, 720)">
            <path d="M 0 0 Q -4 -10 -8 -16" stroke="#6B8E5A" strokeWidth={1.4} fill="none" strokeLinecap="round" />
            <path d="M 0 0 Q 0 -12 -2 -20" stroke="#6B8E5A" strokeWidth={1.4} fill="none" strokeLinecap="round" />
            <path d="M 0 0 Q 4 -10 6 -16" stroke="#6B8E5A" strokeWidth={1.3} fill="none" strokeLinecap="round" />
          </g>
        </g>

        {/* CENTRAL HANGING LANTERN — chain + cage frame + flame */}
        {/* CHAIN — 9 oval links from ceiling to lantern hood */}
        {[130, 144, 158, 172, 186, 200, 214, 228, 242].map((cy, i) => (
          <ellipse key={`cvl-${i}`} cx={720} cy={cy + 6} rx={3.2} ry={5}
                   fill="none" stroke={i % 2 === 0 ? '#5A3B1F' : '#7B4F2C'}
                   strokeWidth={1.5} />
        ))}
        <path d="M 700 254 L 740 254 L 736 244 L 704 244 Z"
              fill="#5A3B1F" stroke="#1A1208" strokeWidth={1.4} strokeLinejoin="round" />
        <path d="M 706 244 L 720 238 L 734 244 Z"
              fill="#3F2614" stroke="#1A1208" strokeWidth={1.4} strokeLinejoin="round" />
        <circle cx={720} cy={236} r={1.6} fill="#5A3B1F" stroke="#1A1208" strokeWidth={0.8} />
        <path d="M 702 254 L 738 254 L 740 286 L 700 286 Z"
              fill="#3F2614" stroke="#1A1208" strokeWidth={1.5} strokeLinejoin="round" />
        <rect x={708} y={258} width={24} height={24} fill="#FFD06B" />
        <line x1={702} y1={262} x2={738} y2={262} stroke="#1A1208" strokeWidth={0.9} />
        <line x1={702} y1={278} x2={738} y2={278} stroke="#1A1208" strokeWidth={0.9} />
        <line x1={714} y1={258} x2={714} y2={282} stroke="#1A1208" strokeWidth={0.9} />
        <line x1={720} y1={258} x2={720} y2={282} stroke="#1A1208" strokeWidth={0.9} />
        <line x1={726} y1={258} x2={726} y2={282} stroke="#1A1208" strokeWidth={0.9} />
        <circle cx={704} cy={258} r={1.1} fill="#5A3B1F" stroke="#1A1208" strokeWidth={0.4} />
        <circle cx={736} cy={258} r={1.1} fill="#5A3B1F" stroke="#1A1208" strokeWidth={0.4} />
        <circle cx={704} cy={282} r={1.1} fill="#5A3B1F" stroke="#1A1208" strokeWidth={0.4} />
        <circle cx={736} cy={282} r={1.1} fill="#5A3B1F" stroke="#1A1208" strokeWidth={0.4} />
        <path d="M 700 286 L 740 286 L 738 292 L 702 292 Z"
              fill="#5A3B1F" stroke="#1A1208" strokeWidth={1.3} strokeLinejoin="round" />
        {!reducedMotion ? (
          <motion.path
            d="M 720 278 C 716 274, 716 268, 720 264 C 724 268, 724 274, 720 278 Z"
            fill="#FFFAF2"
            animate={{ scaleY: [1, 1.15, 0.9, 1.1, 1], opacity: [0.85, 1, 0.9, 1, 0.85] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '720px', originY: '278px' }}
          />
        ) : (
          <path
            d="M 720 278 C 716 274, 716 268, 720 264 C 724 268, 724 274, 720 278 Z"
            fill="#FFFAF2"
          />
        )}
        <path d="M 720 277 C 718 274, 718 270, 720 268 C 722 270, 722 274, 720 277 Z"
              fill="#FFD06B" />
        <ellipse cx={720} cy={290} rx={210} ry={140} fill="#FFD06B" opacity={0.18} />
        <ellipse cx={720} cy={290} rx={110}  ry={70}  fill="#FFE89A" opacity={0.20} />

        {/* FIRE PIT — in front of the bear, between the bear and viewer.
            Primary warmth source on the floor. */}
        <FirePit x={490} y={700} reducedMotion={reducedMotion} />

        {/* SLEEPING BEAR — long horizontal silhouette beside the fire */}
        <SleepyBear reducedMotion={reducedMotion} />

        {/* SKILL STOPS — the three cave skills as glowing pins on
            natural-looking flat stone slabs */}
        {skillStops.map((stop, i) => {
          const pos = STOP_POSITIONS[i] ?? STOP_POSITIONS[0];
          const isTappedLocked = tappedLocked === stop.code;
          return (
            <g
              key={stop.code}
              transform={`translate(${pos.x}, ${pos.y})`}
              style={{ cursor: 'pointer', touchAction: 'manipulation' }}
              onClick={() => onStopTap(stop)}
              role="button"
              aria-label={`${stop.label}${stop.unlocked ? '' : ' (locked)'}`}
              tabIndex={0}
            >
              <circle r={42} fill="transparent" />

              {stop.unlocked && !stop.completed && (
                <circle r={36} fill="#FFE89A" opacity={0.22} />
              )}
              {stop.completed && (
                <circle r={40} fill="#FFD93D" opacity={0.28} />
              )}

              {/* FLAT STONE SLAB — water-shaped slab the structure rests
                  on. Asymmetric, with moss patches + small stone chips. */}
              <ellipse cx={2} cy={26} rx={32} ry={6} fill="#000" opacity={0.4} />
              {/* slab base — broader, uneven */}
              <path
                d="M -34 24 C -32 14, -22 14, -10 16
                   C 4 14, 18 14, 28 18
                   C 36 22, 36 28, 30 30
                   C 16 32, 0 32, -14 30
                   C -28 30, -36 28, -34 24 Z"
                fill="#5A4533" stroke="#1A1208" strokeWidth={1.4} strokeLinejoin="round"
              />
              {/* slab top — slightly raised + lighter */}
              <ellipse cx={0} cy={20} rx={26} ry={6} fill="#7A6B58" stroke="#3F3026" strokeWidth={0.9} />
              <ellipse cx={-2} cy={18} rx={20} ry={3.5} fill="#9B8868" opacity={0.7} />
              {/* moss patch on the slab */}
              <ellipse cx={-14} cy={20} rx={8} ry={2} fill="#7BA46F" opacity={0.7} />
              <ellipse cx={18} cy={22} rx={5} ry={1.6} fill="#5C7E4F" opacity={0.6} />
              {/* tiny chips around the base */}
              <ellipse cx={-32} cy={28} rx={3} ry={1.2} fill="#7A6B58" stroke="#3F3026" strokeWidth={0.5} />
              <ellipse cx={32} cy={28} rx={2.5} ry={1.0} fill="#9B8868" stroke="#3F3026" strokeWidth={0.4} />

              {/* the structure emoji */}
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={36}
                y={-6}
                style={{
                  filter: stop.completed
                    ? 'drop-shadow(0 0 8px rgba(255, 217, 61, 0.75))'
                    : stop.unlocked
                      ? 'drop-shadow(0 1px 3px rgba(255, 220, 130, 0.55))'
                      : 'grayscale(1) brightness(0.7)',
                  opacity: stop.unlocked ? 1 : 0.62,
                }}
              >
                {stop.emoji}
              </text>

              {!stop.unlocked && (
                <g pointerEvents="none">
                  <circle cx={20} cy={-22} r={10}
                          fill="#FFFAF2" stroke="#8A7E6C" strokeWidth={1.3} />
                  <text x={20} y={-19} fontSize={12} textAnchor="middle"
                        style={{ userSelect: 'none' }}>🔒</text>
                </g>
              )}

              {stop.completed && (
                <g pointerEvents="none">
                  <circle cx={20} cy={-22} r={10}
                          fill="#6B8E5A" stroke="#4F6F42" strokeWidth={1.3} />
                  <path d="M 16 -22 L 19 -19 L 24 -25"
                        stroke="#FFFFFF" strokeWidth={1.8} fill="none"
                        strokeLinecap="round" strokeLinejoin="round" />
                </g>
              )}

              <rect x={-58} y={36} width={116} height={18} rx={9}
                    fill={stop.completed ? '#FFF6CC' : stop.unlocked ? '#FFFAF2' : '#3A2E22'}
                    stroke={stop.completed ? '#D4B43E' : stop.unlocked ? '#E8A87C' : '#5A4533'}
                    strokeWidth={1.2} />
              <text x={0} y={49} textAnchor="middle"
                    fontSize={10.5} fontWeight={700}
                    fill={stop.unlocked ? '#6b4423' : '#C8BCAA'}
                    style={{ userSelect: 'none' }}>
                {stop.label}
              </text>

              {isTappedLocked && (
                <g pointerEvents="none">
                  <rect x={-100} y={-72} width={200} height={28} rx={8}
                        fill="#fffaf2" stroke="#c38d9e" strokeWidth={1.5} />
                  <text x={0} y={-54} textAnchor="middle"
                        fontSize={10} fontStyle="italic" fill="#6b4423">
                    {stop.prereqDisplay || 'finish an earlier stop first'}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* DISCOVERED SPECIES — animated figures along the floor */}
        {discoveredSpecies.map((sp, i) => {
          const x = 320 + i * 150;
          const y = 730;
          return (
            <motion.g
              key={sp.code}
              animate={reducedMotion ? {} : { y: [0, -6, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
            >
              <text
                x={x} y={y} textAnchor="middle" fontSize={28}
                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
              >
                {sp.emoji}
              </text>
              <rect x={x - 50} y={y + 8} width={100} height={16} rx={4} fill="rgba(149, 184, 143, 0.9)" />
              <text x={x} y={y + 20} textAnchor="middle" fontSize={9} fontWeight={700} fill="#fffaf2">
                {sp.commonName}
              </text>
            </motion.g>
          );
        })}

        {/* UNDISCOVERED SLOTS — only render if there are any */}
        {undiscoveredCount > 0 && Array.from({ length: undiscoveredCount }).map((_, i) => {
          const x = 320 + (discoveredSpecies.length + i) * 150;
          const y = 730;
          return (
            <g key={`undiscovered-${i}`} opacity={0.45}>
              {/* niche silhouette in the back wall */}
              <path
                d={`M ${x - 18} ${y + 6}
                    L ${x - 18} ${y - 8}
                    C ${x - 18} ${y - 20}, ${x - 6} ${y - 24}, ${x} ${y - 24}
                    C ${x + 6} ${y - 24}, ${x + 18} ${y - 20}, ${x + 18} ${y - 8}
                    L ${x + 18} ${y + 6} Z`}
                fill="#1A0F08" stroke="#3A2510" strokeWidth={1.2}
              />
              <text x={x} y={y - 4} textAnchor="middle" fontSize={14} fontStyle="italic"
                    fill="#7A6A52" opacity={0.85}>?</text>
              <rect x={x - 50} y={y + 8} width={100} height={16} rx={4}
                    fill="rgba(90,69,51,0.85)" stroke="#5A3820" strokeWidth={0.7} />
              <text x={x} y={y + 20} textAnchor="middle" fontSize={9} fontStyle="italic" fill="#C8BCAA">
                undiscovered
              </text>
            </g>
          );
        })}
      </svg>
    </HabitatInteriorLayout>
  );
}
