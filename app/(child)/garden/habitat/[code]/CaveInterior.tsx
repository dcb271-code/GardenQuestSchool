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
// SLEEPING BEAR — black bear curled in a TIGHT C-CURL on its side.
// Pose: head tucked toward chest, knees drawn up, tail at rear, like
// a sleeping cat. The body has REAL ANATOMICAL STRUCTURE — visible
// shoulder, hip, ribcage, and a clear dip between head and shoulder
// (no melted-blob look). Drawn as a few large structural shapes
// rather than many small ellipses or one amorphous silhouette.
// ─────────────────────────────────────────────────────────────────────────
function SleepyBear({ reducedMotion }: { reducedMotion: boolean }) {
  const LINE = '#1A1208';
  const FUR = '#3A2A1A';
  const FUR_DARK = '#1F1408';
  const FUR_HI = '#5A4030';
  const BELLY = '#7A5836';
  const PAW_PAD = '#2A1810';
  const NOSE = '#0A0604';

  return (
    <g transform="translate(330, 690)">
      {/* GROUND SHADOW — compact, follows the curl */}
      <ellipse cx={0} cy={56} rx={110} ry={10} fill="#000" opacity={0.42} />

      {/* TAIL — small fluffy stub at the back (left side from viewer) */}
      <path
        d="M -88 22
           C -98 18, -100 8, -90 4
           C -78 4, -72 14, -76 22
           C -80 26, -86 26, -88 22 Z"
        fill={FUR_DARK} stroke={LINE} strokeWidth={1.4} strokeLinejoin="round"
      />
      <path d="M -94 12 Q -88 8 -82 12"
            stroke={FUR_HI} strokeWidth={1.0} fill="none" opacity={0.7} strokeLinecap="round" />

      {/* HIND LEG / HAUNCH — drawn AS ITS OWN SHAPE behind the body so
          the curl looks anatomically real, not a single melted blob.
          Shows the rounded knee + tucked back foot with toe pads. */}
      <path
        d="M -52 24
           C -76 30, -86 46, -68 56
           C -50 60, -28 56, -22 44
           C -22 36, -34 26, -52 24 Z"
        fill={FUR} stroke={LINE} strokeWidth={1.7} strokeLinejoin="round"
      />
      {/* knee/thigh shading */}
      <path
        d="M -60 30 Q -76 36 -76 48 Q -64 54 -52 50 Q -56 40 -60 30 Z"
        fill={FUR_DARK} opacity={0.55} pointerEvents="none"
      />
      {/* tucked back paw with pads */}
      <ellipse cx={-30} cy={48} rx={10} ry={5} fill={FUR_DARK} stroke={LINE} strokeWidth={1.2} />
      <ellipse cx={-26} cy={48} rx={5} ry={2.4} fill={PAW_PAD} opacity={0.85} />
      <circle cx={-29} cy={47} r={0.8} fill={PAW_PAD} />
      <circle cx={-25} cy={48} r={0.8} fill={PAW_PAD} />
      <circle cx={-22} cy={49} r={0.8} fill={PAW_PAD} />
      {/* claws */}
      <path d="M -22 46 Q -20 45 -19 47" stroke={LINE} strokeWidth={0.9} fill="none" strokeLinecap="round" />
      <path d="M -20 49 Q -18 48 -17 50" stroke={LINE} strokeWidth={0.9} fill="none" strokeLinecap="round" />

      {/* MAIN BODY — rounded BACK silhouette of the curl. Drawn as a
          firm arched shape with VISIBLE shoulder and hip bumps. The
          head is a separate shape that fits into a clear notch on
          the right (front) of the body. */}
      <motion.path
        d="
          M -78 8
          C -88 -4, -82 -22, -60 -28
          C -36 -32, -8 -32, 18 -26
          C 38 -20, 50 -8, 52 8
          C 50 22, 36 32, 12 36
          C -16 38, -50 36, -68 30
          C -82 24, -84 16, -78 8 Z
        "
        fill={FUR} stroke={LINE} strokeWidth={2}
        animate={reducedMotion ? undefined : { scaleY: [1, 1.030, 1] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ originX: '0px', originY: '6px' }}
      />

      {/* SHOULDER BUMP — defined raised bump where the front leg meets
          the body. A subtle highlight curve gives the silhouette a
          REAL shoulder, breaking the "melting" feel. */}
      <path
        d="M 28 -22 Q 44 -16 50 -2 Q 38 -10 24 -16 Z"
        fill={FUR_HI} opacity={0.6} pointerEvents="none"
      />
      {/* HIP BUMP — same on the rear */}
      <path
        d="M -76 0 Q -82 -10 -68 -22 Q -56 -16 -56 -4 Q -68 -8 -76 0 Z"
        fill={FUR_HI} opacity={0.55} pointerEvents="none"
      />
      {/* RIBCAGE shading underneath the body */}
      <path
        d="M -50 18 C -20 30, 20 30, 40 22 L 36 32 C 8 38, -28 36, -54 28 Z"
        fill={FUR_DARK} opacity={0.55} pointerEvents="none"
      />
      {/* light fur highlight along the top of the back */}
      <path
        d="M -64 -20 Q -30 -30 0 -30 Q 28 -30 44 -22 Q 14 -26 -14 -24 Q -42 -22 -64 -20 Z"
        fill={FUR_HI} opacity={0.5} pointerEvents="none"
      />
      {/* fur stroke marks suggesting individual tufts on the back */}
      {[
        { sx: -50, sy: -22 }, { sx: -28, sy: -26 },
        { sx: -8,  sy: -28 }, { sx: 14,  sy: -28 },
        { sx: 32,  sy: -22 },
      ].map((s, i) => (
        <path
          key={`fs-${i}`}
          d={`M ${s.sx} ${s.sy} q -2 -3 -4 -5`}
          stroke={FUR_DARK} strokeWidth={0.7} fill="none" opacity={0.55}
          strokeLinecap="round" pointerEvents="none"
        />
      ))}

      {/* FRONT PAW — visible peeking from under the chin, both forepaws
          tucked together. Drawn as one defined shape with toe pads. */}
      <path
        d="M 30 18 C 44 22, 56 28, 58 36
           C 56 42, 46 44, 36 42
           C 26 40, 22 32, 24 24
           C 26 20, 28 18, 30 18 Z"
        fill={FUR} stroke={LINE} strokeWidth={1.5} strokeLinejoin="round"
      />
      {/* darker shadow under the paw */}
      <path
        d="M 36 30 C 46 32, 54 36, 54 40 C 46 42, 38 40, 32 36 Z"
        fill={FUR_DARK} opacity={0.55} pointerEvents="none"
      />
      <ellipse cx={48} cy={36} rx={6} ry={2.4} fill={PAW_PAD} opacity={0.85} />
      <circle cx={45} cy={34} r={0.8} fill={PAW_PAD} />
      <circle cx={49} cy={35} r={0.8} fill={PAW_PAD} />
      <circle cx={52} cy={37} r={0.8} fill={PAW_PAD} />
      <circle cx={49} cy={38} r={0.8} fill={PAW_PAD} />
      {/* claws */}
      <path d="M 56 31 Q 58 30 58 32" stroke={LINE} strokeWidth={0.9} fill="none" strokeLinecap="round" />
      <path d="M 58 34 Q 60 33 60 35" stroke={LINE} strokeWidth={0.9} fill="none" strokeLinecap="round" />
      <path d="M 58 37 Q 60 36 60 38" stroke={LINE} strokeWidth={0.9} fill="none" strokeLinecap="round" />

      {/* HEAD — drawn as a separate shape that nestles into a clear
          NECK NOTCH on the right side of the body. The head's chin
          rests on the front paw. Boxy real-bear snout, single visible
          closed eye, ears. */}
      <motion.g
        animate={reducedMotion ? undefined : { y: [0, -1.4, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* HEAD silhouette — wedge-shaped, not perfectly round */}
        <path
          d="M 18 -22
             C 14 -34, 28 -42, 46 -42
             C 64 -42, 76 -36, 80 -22
             C 84 -12, 86 -2, 84 8
             C 80 18, 68 22, 54 22
             C 38 22, 22 18, 18 6
             C 14 -4, 14 -14, 18 -22 Z"
          fill={FUR} stroke={LINE} strokeWidth={2} strokeLinejoin="round"
        />
        {/* CHEEK SHADING — defines the side of the head */}
        <path
          d="M 24 0 Q 30 14 50 16 Q 64 16 70 8 Q 56 12 40 8 Q 28 4 24 0 Z"
          fill={FUR_DARK} opacity={0.45} pointerEvents="none"
        />
        {/* TOP-OF-HEAD highlight */}
        <path
          d="M 26 -36 Q 46 -42 66 -36 Q 46 -32 26 -36 Z"
          fill={FUR_HI} opacity={0.65}
        />
        {/* BROW RIDGE — a defined bony brow above the eye */}
        <path
          d="M 50 -16 Q 58 -22 66 -16 L 66 -12 Q 58 -16 50 -12 Z"
          fill={FUR_DARK} opacity={0.55} pointerEvents="none"
        />

        {/* MUZZLE — protruding boxy snout, paler. Drawn AS ITS OWN
            SHAPE jutting forward from the head, not blended into it. */}
        <path
          d="M 70 -2
             C 78 -2, 86 0, 88 6
             C 88 10, 84 14, 78 14
             C 70 14, 64 12, 62 6
             C 62 0, 66 -2, 70 -2 Z"
          fill={BELLY} stroke={LINE} strokeWidth={1.4} strokeLinejoin="round"
        />
        {/* muzzle bridge shading — small darker stripe along the top */}
        <path d="M 64 0 Q 76 -2 86 2" stroke={LINE} strokeWidth={0.7}
              fill="none" opacity={0.5} strokeLinecap="round" />

        {/* far ear (back of head) */}
        <path
          d="M 28 -34
             C 22 -42, 26 -50, 32 -50
             C 38 -48, 40 -42, 38 -34 Z"
          fill={FUR_DARK} stroke={LINE} strokeWidth={1.3} strokeLinejoin="round"
        />
        {/* near ear — twitches occasionally */}
        <motion.g
          animate={reducedMotion ? undefined : { rotate: [0, 0, 0, -10, 0, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: '54px', originY: '-38px' }}
        >
          <path
            d="M 50 -32
               C 46 -42, 54 -50, 62 -48
               C 68 -46, 68 -38, 64 -32 Z"
            fill={FUR} stroke={LINE} strokeWidth={1.3} strokeLinejoin="round"
          />
          {/* pink inner ear */}
          <path
            d="M 54 -34
               C 52 -42, 58 -46, 62 -44
               C 64 -42, 64 -36, 60 -32 Z"
            fill={BELLY} opacity={0.7}
          />
        </motion.g>

        {/* NOSE — chunky black tip with highlight */}
        <ellipse cx={86} cy={6} rx={3.4} ry={2.6} fill={NOSE} stroke={LINE} strokeWidth={0.9} />
        <ellipse cx={85} cy={5} rx={1.0} ry={0.6} fill="#FFFFFF" opacity={0.55} />
        {/* nostril hint */}
        <ellipse cx={87} cy={7} rx={0.6} ry={0.4} fill={LINE} opacity={0.7} />
        {/* philtrum line */}
        <line x1={86} y1={9} x2={86} y2={12} stroke={LINE} strokeWidth={0.7} />

        {/* CLOSED EYE — gentle upturned crescent, sleeping + content */}
        <path d="M 56 -8 Q 62 -4 68 -8"
              stroke={LINE} strokeWidth={1.6} fill="none" strokeLinecap="round" />
        {/* eyelashes */}
        <path d="M 57 -7 L 56 -5" stroke={LINE} strokeWidth={0.5} strokeLinecap="round" />
        <path d="M 62 -5 L 62 -3" stroke={LINE} strokeWidth={0.5} strokeLinecap="round" />
        <path d="M 67 -7 L 68 -5" stroke={LINE} strokeWidth={0.5} strokeLinecap="round" />

        {/* MOUTH — small content smile below the muzzle */}
        <path d="M 80 14 Q 78 18 74 17" stroke={LINE} strokeWidth={1.0} fill="none" strokeLinecap="round" />
        <path d="M 84 14 Q 86 18 84 20" stroke={LINE} strokeWidth={1.0} fill="none" strokeLinecap="round" />

        {/* WHISKERS — three thin lines on each side of the muzzle */}
        <line x1={62} y1={6}  x2={56} y2={4} stroke={LINE} strokeWidth={0.5} opacity={0.6} />
        <line x1={62} y1={9}  x2={56} y2={9} stroke={LINE} strokeWidth={0.5} opacity={0.6} />
        <line x1={88} y1={4}  x2={94} y2={2} stroke={LINE} strokeWidth={0.5} opacity={0.6} />
        <line x1={88} y1={8}  x2={94} y2={9} stroke={LINE} strokeWidth={0.5} opacity={0.6} />
      </motion.g>

      {/* WARM GLOW catching the face */}
      <ellipse cx={60} cy={0} rx={70} ry={42} fill="#FFD06B" opacity={0.10} pointerEvents="none" />

      {/* SOFT BREATH PARTICLES drifting up from the muzzle */}
      {!reducedMotion && (
        <>
          <motion.circle
            cx={92} cy={-2} r={1.4} fill="#FFE89A"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: [0, 0.6, 0], y: [6, -10, -28] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.circle
            cx={96} cy={-6} r={1.0} fill="#FFE89A"
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
// CAMPFIRE — stone ring, crossed logs, layered hand-drawn flames (outer
// gold flame + inner cream tongue, both outlined), embers and a thin
// curling smoke wisp. The hearth is the warm heart of the den.
// ─────────────────────────────────────────────────────────────────────────
function Campfire({ x, y, reducedMotion }: { x: number; y: number; reducedMotion: boolean }) {
  const INK = '#3F2614';
  return (
    <g transform={`translate(${x}, ${y})`} pointerEvents="none">
      {/* warm glow pool on the cave floor */}
      <ellipse cx={0} cy={6} rx={160} ry={60} fill="url(#warmPool)" />
      <ellipse cx={0} cy={6} rx={95} ry={36} fill="url(#warmPool)" opacity={0.8} />

      {/* charred ground */}
      <ellipse cx={0} cy={12} rx={38} ry={10} fill="#1A0F08" />

      {/* CROSSED LOGS — two chunky logs with visible end-grain */}
      <g transform="rotate(-14 0 8)">
        <rect x={-30} y={4} width={60} height={9} rx={4.5}
              fill="#5A3B1F" stroke={INK} strokeWidth={1.4} />
        <path d="M -26 7 L 22 7" stroke={INK} strokeWidth={0.8} opacity={0.5} />
        <ellipse cx={30} cy={8.5} rx={3} ry={4.5} fill="#8A5A30" stroke={INK} strokeWidth={1.2} />
        <ellipse cx={30} cy={8.5} rx={1.3} ry={2} fill="#5A3B1F" opacity={0.8} />
      </g>
      <g transform="rotate(16 0 10)">
        <rect x={-28} y={6} width={56} height={8} rx={4}
              fill="#6B4423" stroke={INK} strokeWidth={1.4} />
        <ellipse cx={-28} cy={10} rx={2.8} ry={4} fill="#8A5A30" stroke={INK} strokeWidth={1.2} />
        <ellipse cx={-28} cy={10} rx={1.2} ry={1.8} fill="#5A3B1F" opacity={0.8} />
      </g>

      {/* FLAMES — outer gold flame with an inner cream tongue, outlined */}
      <motion.g
        animate={reducedMotion ? undefined : {
          scaleY: [1, 1.12, 0.94, 1.07, 1],
          scaleX: [1, 0.97, 1.03, 0.98, 1],
        }}
        transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
        style={{ originX: '0px', originY: '10px' }}
      >
        <path
          d="M 0 10
             C -16 6, -20 -6, -14 -16
             C -11 -21, -13 -28, -8 -34
             C -7 -28, -3 -26, -2 -31
             C 0 -38, -2 -44, 2 -50
             C 4 -42, 10 -38, 12 -30
             C 14 -24, 10 -21, 13 -14
             C 17 -4, 12 6, 0 10 Z"
          fill="#F5A623" stroke="#7A4F00" strokeWidth={1.6} strokeLinejoin="round"
        />
        <motion.path
          d="M 0 8
             C -8 5, -10 -3, -7 -9
             C -5 -13, -6 -17, -2 -22
             C -1 -17, 3 -16, 4 -20
             C 6 -14, 8 -10, 7 -5
             C 6 2, 5 6, 0 8 Z"
          fill="#FFF3D6" stroke="#E8A87C" strokeWidth={1.1} strokeLinejoin="round"
          animate={reducedMotion ? undefined : { scaleY: [1, 0.9, 1.1, 0.95, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: '0px', originY: '8px' }}
        />
      </motion.g>

      {/* embers */}
      <circle cx={-10} cy={11} r={1.6} fill="#FF9152" opacity={0.95} />
      <circle cx={4} cy={13} r={1.8} fill="#FFD166" opacity={0.95} />
      <circle cx={14} cy={11} r={1.2} fill="#FF9152" opacity={0.85} />
      <circle cx={-2} cy={9} r={1.1} fill="#FFF3D6" opacity={0.9} />

      {/* STONE RING — irregular outlined stones, varied size and tilt */}
      {[
        { ax: -44, ay: 10, rx: 8.5, ry: 5.5, rot: -8, c: '#8A7458' },
        { ax: -30, ay: 17, rx: 7, ry: 5, rot: 10, c: '#6E5B47' },
        { ax: -12, ay: 21, rx: 9, ry: 5.5, rot: -4, c: '#8A7458' },
        { ax: 8, ay: 22, rx: 7.5, ry: 5, rot: 6, c: '#7A664F' },
        { ax: 27, ay: 18, rx: 8, ry: 5.5, rot: -10, c: '#8A7458' },
        { ax: 43, ay: 11, rx: 7, ry: 5, rot: 8, c: '#6E5B47' },
      ].map((s, i) => (
        <g key={`ring-${i}`} transform={`rotate(${s.rot} ${s.ax} ${s.ay})`}>
          <ellipse cx={s.ax + 1} cy={s.ay + 2} rx={s.rx} ry={s.ry * 0.7} fill="#000" opacity={0.35} />
          <ellipse cx={s.ax} cy={s.ay} rx={s.rx} ry={s.ry}
                   fill={s.c} stroke="#3F3026" strokeWidth={1.3} />
          <ellipse cx={s.ax - s.rx * 0.25} cy={s.ay - s.ry * 0.35} rx={s.rx * 0.45} ry={s.ry * 0.3}
                   fill="#A89274" opacity={0.75} />
        </g>
      ))}

      {/* SMOKE WISP — thin curling line drifting up from the flames */}
      {!reducedMotion ? (
        <motion.path
          d="M 2 -52 C -6 -68, 8 -80, 0 -98 C -7 -112, 5 -124, 0 -140"
          stroke="#C8BCAA" strokeWidth={2.6} fill="none" strokeLinecap="round"
          animate={{ opacity: [0, 0.3, 0.18, 0.3, 0], x: [0, 3, -2, 2, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : (
        <path d="M 2 -52 C -6 -68, 8 -80, 0 -98 C -7 -112, 5 -124, 0 -140"
              stroke="#C8BCAA" strokeWidth={2.6} fill="none" strokeLinecap="round" opacity={0.22} />
      )}

      {/* rising sparks */}
      {!reducedMotion && (
        <>
          <motion.circle
            cx={3} cy={-40} r={1.1} fill="#FFD166"
            animate={{ opacity: [0, 0.85, 0], y: [0, -38, -74], x: [0, 5, -2] }}
            transition={{ duration: 3.1, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.circle
            cx={-4} cy={-44} r={0.8} fill="#FFF3D6"
            animate={{ opacity: [0, 0.7, 0], y: [0, -40, -80], x: [0, -4, 3] }}
            transition={{ duration: 3.6, delay: 1.4, repeat: Infinity, ease: 'easeOut' }}
          />
        </>
      )}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// STALACTITE — rounded organic drippy cone. Drawn BEFORE the ceiling
// mass so its flat top tucks underneath the ceiling's wavy edge. Each
// gets a lighter left-edge highlight; some hang a water drop.
// ─────────────────────────────────────────────────────────────────────────
function Stalactite({
  x, y, w, h, lean = 0, drop = false, reducedMotion,
}: {
  x: number; y: number; w: number; h: number;
  lean?: number; drop?: boolean; reducedMotion: boolean;
}) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${lean})`}>
      <path
        d={`M ${-w} 0
            L ${w} 0
            C ${w * 0.85} ${h * 0.3}, ${w * 0.45} ${h * 0.48}, ${w * 0.32} ${h * 0.6}
            C ${w * 0.2} ${h * 0.72}, ${w * 0.16} ${h * 0.88}, 0 ${h}
            C ${-w * 0.2} ${h * 0.82}, ${-w * 0.28} ${h * 0.66}, ${-w * 0.42} ${h * 0.54}
            C ${-w * 0.58} ${h * 0.42}, ${-w * 0.84} ${h * 0.26}, ${-w} 0 Z`}
        fill="#4A382A" stroke="#241812" strokeWidth={1.4} strokeLinejoin="round"
      />
      {/* left-edge highlight */}
      <path
        d={`M ${-w * 0.55} ${h * 0.14}
            C ${-w * 0.45} ${h * 0.34}, ${-w * 0.28} ${h * 0.52}, ${-w * 0.1} ${h * 0.8}`}
        stroke="#6E5640" strokeWidth={Math.max(1.8, w * 0.18)} fill="none"
        strokeLinecap="round" opacity={0.85}
      />
      {drop && (
        <>
          <ellipse cx={0} cy={h - 1} rx={w * 0.18} ry={w * 0.1} fill="#A8CDD2" opacity={0.6} />
          {!reducedMotion ? (
            <motion.path
              d={`M 0 ${h + 2} C -2.4 ${h + 5.4}, -2.4 ${h + 8.4}, 0 ${h + 9.6}
                  C 2.4 ${h + 8.4}, 2.4 ${h + 5.4}, 0 ${h + 2} Z`}
              fill="#A8CDD2"
              animate={{ opacity: [0, 0.85, 0.85, 0], scaleY: [0.5, 1, 1, 0.6] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ originX: '0px', originY: `${h + 2}px` }}
            />
          ) : (
            <path
              d={`M 0 ${h + 2} C -2.4 ${h + 5.4}, -2.4 ${h + 8.4}, 0 ${h + 9.6}
                  C 2.4 ${h + 8.4}, 2.4 ${h + 5.4}, 0 ${h + 2} Z`}
              fill="#A8CDD2" opacity={0.6}
            />
          )}
        </>
      )}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// GLOW-CRYSTAL CLUSTER — 3-5 faceted shards growing out of a dark wall
// pocket, each outlined with a highlight face, under a soft glow halo.
// ─────────────────────────────────────────────────────────────────────────
function CrystalCluster({
  x, y, s = 1, hue = 'amethyst', flip = false, reducedMotion, delay = 0,
}: {
  x: number; y: number; s?: number; hue?: 'amethyst' | 'gold';
  flip?: boolean; reducedMotion: boolean; delay?: number;
}) {
  const [dark, mid, hi, glow] = hue === 'gold'
    ? ['#A87718', '#E8B84D', '#FFE89A', '#FFD166']
    : ['#6E4E96', '#9B76C4', '#D4BEEA', '#B893E8'];

  const shards = [
    { a: -34, len: 26, w: 6 },
    { a: -12, len: 38, w: 8 },
    { a: 8, len: 30, w: 7 },
    { a: 30, len: 22, w: 5.5 },
    { a: 48, len: 15, w: 4.5 },
  ];

  return (
    <g transform={`translate(${x}, ${y}) scale(${flip ? -s : s}, ${s})`}>
      {/* glow halo */}
      {!reducedMotion ? (
        <motion.ellipse
          cx={0} cy={-14} rx={46} ry={34} fill={glow}
          animate={{ opacity: [0.1, 0.22, 0.1] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay }}
        />
      ) : (
        <ellipse cx={0} cy={-14} rx={46} ry={34} fill={glow} opacity={0.15} />
      )}
      {/* dark wall pocket the shards grow from */}
      <path
        d="M -26 6 C -30 -4, -18 -10, 0 -10 C 18 -10, 30 -4, 26 6 C 16 12, -16 12, -26 6 Z"
        fill="#1E140C" stroke="#241812" strokeWidth={1.2}
      />
      {/* shards fanning out of the pocket */}
      {shards.map((sh, i) => (
        <g key={`sh-${i}`} transform={`translate(${(i - 2) * 7}, 0) rotate(${sh.a})`}>
          <path
            d={`M ${-sh.w} 2
                L ${-sh.w * 0.72} ${-sh.len * 0.72}
                L 0 ${-sh.len}
                L ${sh.w * 0.72} ${-sh.len * 0.72}
                L ${sh.w} 2 Z`}
            fill={mid} stroke={dark} strokeWidth={1.3} strokeLinejoin="round"
          />
          {/* lit facet */}
          <path
            d={`M ${-sh.w * 0.72} ${-sh.len * 0.72} L ${-sh.w * 0.15} ${-sh.len * 0.8}
                L ${-sh.w * 0.2} 2 L ${-sh.w} 2 Z`}
            fill={hi} opacity={0.8}
          />
          <line x1={0} y1={-sh.len} x2={-sh.w * 0.15} y2={-sh.len * 0.8}
                stroke={dark} strokeWidth={0.7} opacity={0.7} />
        </g>
      ))}
      {/* base rubble */}
      <ellipse cx={-18} cy={8} rx={5} ry={2.4} fill="#55412F" stroke="#241812" strokeWidth={0.9} />
      <ellipse cx={17} cy={9} rx={4} ry={2} fill="#4A382A" stroke="#241812" strokeWidth={0.8} />
      {/* sparkles */}
      <circle cx={-6} cy={-30} r={1.2} fill="#FFFFFF" opacity={0.85} />
      <circle cx={10} cy={-20} r={0.9} fill="#FFFFFF" opacity={0.7} />
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SLEEPING BAT — hangs upside-down from the ceiling, wings wrapped like
// a little cloak, closed happy eyes and rosy cheeks. Cute, not spooky.
// ─────────────────────────────────────────────────────────────────────────
function Bat({ s = 1, sway = 0, reducedMotion }: { s?: number; sway?: number; reducedMotion: boolean }) {
  const BODY = '#5C4A66';
  const WING = '#4A3A54';
  const INK = '#2A1D30';
  return (
    <g transform={`scale(${s})`}>
      {/* feet gripping the ceiling */}
      <path d="M -3 -2 L -3 4 M 3 -2 L 3 4" stroke={INK} strokeWidth={1.4} strokeLinecap="round" />
      <motion.g
        animate={reducedMotion ? undefined : { rotate: [sway, -sway, sway] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ originX: '0px', originY: '3px' }}
      >
        {/* body — hanging teardrop */}
        <path
          d="M -7 6 C -9 16, -7 26, 0 30 C 7 26, 9 16, 7 6 C 4 2, -4 2, -7 6 Z"
          fill={BODY} stroke={INK} strokeWidth={1.3} strokeLinejoin="round"
        />
        {/* wings wrapped like a cloak */}
        <path d="M -7 7 C -8 14, -6 22, -1 26 C -3 20, -3 12, -2 7 Z"
              fill={WING} stroke={INK} strokeWidth={1} strokeLinejoin="round" />
        <path d="M 7 7 C 8 14, 6 22, 1 26 C 3 20, 3 12, 2 7 Z"
              fill={WING} stroke={INK} strokeWidth={1} strokeLinejoin="round" />
        {/* head at the bottom (upside-down) */}
        <circle cx={0} cy={30} r={6.5} fill={BODY} stroke={INK} strokeWidth={1.3} />
        {/* ears pointing down */}
        <path d="M -4 34 L -6 41 L -1 37 Z" fill={BODY} stroke={INK} strokeWidth={1} strokeLinejoin="round" />
        <path d="M 4 34 L 6 41 L 1 37 Z" fill={BODY} stroke={INK} strokeWidth={1} strokeLinejoin="round" />
        {/* closed happy eyes + tiny smile */}
        <path d="M -3.6 29 Q -2.4 27.6 -1.2 29" stroke="#F0E6D2" strokeWidth={1} fill="none" strokeLinecap="round" />
        <path d="M 1.2 29 Q 2.4 27.6 3.6 29" stroke="#F0E6D2" strokeWidth={1} fill="none" strokeLinecap="round" />
        <path d="M -1 32 Q 0 33 1 32" stroke="#F0E6D2" strokeWidth={0.9} fill="none" strokeLinecap="round" />
        {/* rosy cheeks */}
        <circle cx={-4.4} cy={30.5} r={1.1} fill="#C38D9E" opacity={0.7} />
        <circle cx={4.4} cy={30.5} r={1.1} fill="#C38D9E" opacity={0.7} />
      </motion.g>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// GLOW MUSHROOM CLUSTER — three spotted caps of different heights with
// tiny gill lines and a shared soft glow halo.
// ─────────────────────────────────────────────────────────────────────────
function MushroomCluster({
  x, y, s = 1, flip = false, reducedMotion, delay = 0,
}: {
  x: number; y: number; s?: number; flip?: boolean;
  reducedMotion: boolean; delay?: number;
}) {
  const CAP = '#6FBFB4';
  const CAP_DK = '#4E9C92';
  const SPOT = '#D8F5F0';
  const STEM = '#F0E6D2';
  const INK = '#3F3026';
  const shrooms = [
    { mx: -14, h: 18, cw: 12, tilt: -8 },
    { mx: 2, h: 28, cw: 16, tilt: 3 },
    { mx: 17, h: 14, cw: 10, tilt: 10 },
  ];
  return (
    <g transform={`translate(${x}, ${y}) scale(${flip ? -s : s}, ${s})`}>
      {!reducedMotion ? (
        <motion.ellipse
          cx={2} cy={-16} rx={38} ry={26} fill="#9FE8DE"
          animate={{ opacity: [0.08, 0.2, 0.08] }}
          transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut', delay }}
        />
      ) : (
        <ellipse cx={2} cy={-16} rx={38} ry={26} fill="#9FE8DE" opacity={0.13} />
      )}
      <ellipse cx={2} cy={2} rx={26} ry={4} fill="#000" opacity={0.35} />
      {shrooms.map((m, i) => (
        <g key={`mu-${i}`} transform={`translate(${m.mx}, 0) rotate(${m.tilt})`}>
          {/* stem */}
          <path
            d={`M ${-m.cw * 0.22} 0
                C ${-m.cw * 0.3} ${-m.h * 0.5}, ${-m.cw * 0.2} ${-m.h * 0.8}, ${-m.cw * 0.16} ${-m.h}
                L ${m.cw * 0.16} ${-m.h}
                C ${m.cw * 0.2} ${-m.h * 0.8}, ${m.cw * 0.3} ${-m.h * 0.5}, ${m.cw * 0.22} 0 Z`}
            fill={STEM} stroke={INK} strokeWidth={1.1} strokeLinejoin="round"
          />
          {/* gill lines under the cap rim */}
          {[-0.5, -0.15, 0.2, 0.55].map((t, gi) => (
            <line key={`gl-${gi}`} x1={m.cw * t} y1={-m.h + 1} x2={m.cw * t * 0.5} y2={-m.h + 4}
                  stroke={CAP_DK} strokeWidth={0.8} opacity={0.8} />
          ))}
          {/* cap */}
          <path
            d={`M ${-m.cw} ${-m.h}
                C ${-m.cw * 1.05} ${-m.h - m.cw * 0.9}, ${-m.cw * 0.4} ${-m.h - m.cw * 1.25}, 0 ${-m.h - m.cw * 1.25}
                C ${m.cw * 0.4} ${-m.h - m.cw * 1.25}, ${m.cw * 1.05} ${-m.h - m.cw * 0.9}, ${m.cw} ${-m.h}
                Q 0 ${-m.h + 3} ${-m.cw} ${-m.h} Z`}
            fill={CAP} stroke={INK} strokeWidth={1.3} strokeLinejoin="round"
          />
          {/* spots */}
          <circle cx={-m.cw * 0.4} cy={-m.h - m.cw * 0.5} r={m.cw * 0.14} fill={SPOT} opacity={0.9} />
          <circle cx={m.cw * 0.25} cy={-m.h - m.cw * 0.8} r={m.cw * 0.11} fill={SPOT} opacity={0.85} />
          <circle cx={m.cw * 0.55} cy={-m.h - m.cw * 0.35} r={m.cw * 0.09} fill={SPOT} opacity={0.8} />
          {/* cap highlight */}
          <path
            d={`M ${-m.cw * 0.55} ${-m.h - m.cw * 0.75}
                Q 0 ${-m.h - m.cw * 1.1} ${m.cw * 0.35} ${-m.h - m.cw * 0.85}`}
            stroke="#B9EFE8" strokeWidth={1.4} fill="none" opacity={0.7} strokeLinecap="round"
          />
        </g>
      ))}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// STOP CANDLE — a small candle on a rock, keeping each skill alcove lit.
// ─────────────────────────────────────────────────────────────────────────
function StopCandle({
  x, y, reducedMotion, delay = 0,
}: { x: number; y: number; reducedMotion: boolean; delay?: number }) {
  return (
    <g transform={`translate(${x}, ${y})`} pointerEvents="none">
      <ellipse cx={0} cy={8} rx={10} ry={3} fill="#000" opacity={0.35} />
      {/* rock base */}
      <path d="M -9 8 C -11 3, -6 0, 0 0 C 7 0, 11 3, 9 8 Z"
            fill="#6E5B47" stroke="#3F3026" strokeWidth={1.2} strokeLinejoin="round" />
      {/* wax */}
      <path d="M -4 0 L -4 -12 C -4 -14, 4 -14, 4 -12 L 4 0 Z"
            fill="#F0E6D2" stroke="#8B6938" strokeWidth={1.1} strokeLinejoin="round" />
      {/* wax drip */}
      <path d="M -4 -8 C -5.5 -6, -5.5 -3, -4 -2 Z" fill="#FFFAF2" stroke="#8B6938" strokeWidth={0.7} />
      {/* flame */}
      {!reducedMotion ? (
        <motion.path
          d="M 0 -14 C -2.6 -18, -1.6 -22, 0 -24 C 1.6 -22, 2.6 -18, 0 -14 Z"
          fill="#FFD166" stroke="#B8860B" strokeWidth={0.9}
          animate={{ scaleY: [1, 1.25, 0.9, 1.15, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay }}
          style={{ originX: '0px', originY: '-14px' }}
        />
      ) : (
        <path d="M 0 -14 C -2.6 -18, -1.6 -22, 0 -24 C 1.6 -22, 2.6 -18, 0 -14 Z"
              fill="#FFD166" stroke="#B8860B" strokeWidth={0.9} />
      )}
      <circle cx={0} cy={-19} r={1.1} fill="#FFF3D6" />
      {/* glow */}
      <ellipse cx={0} cy={-16} rx={16} ry={14} fill="#FFD166" opacity={0.16} />
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// CAVE SKILL ICONS — bespoke SVG markers for each skill stop. Each
// icon is a small storybook scene tile (~40px) that sits on the stone
// slab where its skill stop lives. NO emoji.
// ─────────────────────────────────────────────────────────────────────────
function CaveSkillIcon({
  code, completed, unlocked,
}: { code: string; completed: boolean; unlocked: boolean }) {
  const opacity = unlocked ? 1 : 0.62;
  const filter = unlocked ? undefined : 'grayscale(1) brightness(0.65)';

  // FAST FACTS — stylized lightning bolt as a glowing crystal shard
  if (code === 'mm_fast_facts') {
    return (
      <g transform="translate(0, -6)" style={{ opacity, filter }}>
        {completed && (
          <circle cx={0} cy={0} r={26} fill="#FFD93D" opacity={0.35} />
        )}
        {/* outer glow halo */}
        <ellipse cx={0} cy={4} rx={20} ry={26} fill="#FFD06B" opacity={0.30} />
        {/* lightning bolt — 8-point zigzag, golden */}
        <path
          d="M 6 -22
             L -8 -2
             L 0 -2
             L -6 18
             L -10 22
             L -2 22
             L 4 8
             L -3 8
             L 6 -22 Z
             M 6 -22 L 12 -22 L 0 -2 L -2 -2 Z"
          fill="#FFD06B" stroke="#7A4F00" strokeWidth={1.4} strokeLinejoin="round"
        />
        {/* inner highlight on the bolt */}
        <path
          d="M 4 -18 L -4 -3 L 1 -3 L -3 12"
          stroke="#FFFAF2" strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.85}
        />
        {/* sparkle dots around the bolt */}
        <circle cx={-14} cy={-12} r={1.2} fill="#FFFAF2" opacity={0.85} />
        <circle cx={14}  cy={-6}  r={0.9} fill="#FFFAF2" opacity={0.75} />
        <circle cx={12}  cy={14}  r={1.0} fill="#FFFAF2" opacity={0.80} />
      </g>
    );
  }

  // HUNDRED'S HOLLOW — a hollow oak tree silhouette with a dark
  // knot-hole (the "hollow") and a faint glow inside
  if (code === 'mm_hundreds_hollow') {
    return (
      <g transform="translate(0, -6)" style={{ opacity, filter }}>
        {completed && (
          <circle cx={0} cy={0} r={26} fill="#FFD93D" opacity={0.35} />
        )}
        {/* shadow at the trunk base */}
        <ellipse cx={0} cy={20} rx={18} ry={3} fill="#000" opacity={0.4} />
        {/* trunk — broad, with a hollow knothole */}
        <path
          d="M -8 18
             L -10 4
             C -10 -4, -8 -10, -2 -12
             L 4 -12
             C 8 -10, 10 -4, 8 4
             L 6 18
             C 4 22, -4 22, -8 18 Z"
          fill="#7B4F2C" stroke="#3F2614" strokeWidth={1.5} strokeLinejoin="round"
        />
        {/* bark texture lines */}
        <path d="M -7 12 Q -5 6 -6 0" stroke="#5A3B1F" strokeWidth={0.6} fill="none" opacity={0.7} />
        <path d="M 5 12 Q 7 6 6 0" stroke="#5A3B1F" strokeWidth={0.6} fill="none" opacity={0.7} />
        {/* THE HOLLOW — dark oval opening with warm glow inside */}
        <ellipse cx={0} cy={4} rx={5} ry={6} fill="#1A0F08" stroke="#3F2614" strokeWidth={0.9} />
        <ellipse cx={-1} cy={5} rx={3.5} ry={4.5} fill="#FFD06B" opacity={0.5} />
        <ellipse cx={-1.5} cy={4} rx={1.5} ry={2.5} fill="#FFE89A" opacity={0.7} />
        {/* small twig roots at the base */}
        <path d="M -8 18 Q -14 20 -16 18" stroke="#3F2614" strokeWidth={1.4} fill="none" strokeLinecap="round" />
        <path d="M 8 18 Q 14 20 16 18" stroke="#3F2614" strokeWidth={1.4} fill="none" strokeLinecap="round" />
        {/* leafy CANOPY above the trunk — three overlapping organic blobs */}
        <circle cx={-10} cy={-16} r={9} fill="#5C7E4F" stroke="#3D5C32" strokeWidth={1.2} />
        <circle cx={8}   cy={-18} r={10} fill="#7BA46F" stroke="#3D5C32" strokeWidth={1.2} />
        <circle cx={0}   cy={-22} r={9} fill="#5C7E4F" stroke="#3D5C32" strokeWidth={1.2} />
        {/* canopy highlights */}
        <circle cx={-12} cy={-19} r={3} fill="#A2C794" opacity={0.7} />
        <circle cx={4}   cy={-22} r={3.5} fill="#A2C794" opacity={0.7} />
        {/* tiny acorn hanging from the canopy */}
        <ellipse cx={6} cy={-10} rx={1.4} ry={1.8} fill="#7B4F2C" stroke="#3F2614" strokeWidth={0.5} />
        <path d="M 4.6 -11.5 Q 6 -12 7.4 -11.5" stroke="#5A3B1F" strokeWidth={0.6} fill="none" />
      </g>
    );
  }

  // REGROUPING RIDGE — three mountain peaks with snow caps + a pale
  // moon behind, like a tiny landscape carved into the slab
  if (code === 'mm_regroup_ridge') {
    return (
      <g transform="translate(0, -6)" style={{ opacity, filter }}>
        {completed && (
          <circle cx={0} cy={0} r={26} fill="#FFD93D" opacity={0.35} />
        )}
        {/* sky disc / glow */}
        <circle cx={0} cy={0} r={22} fill="#F5D99C" opacity={0.55} />
        {/* moon behind the peaks */}
        <circle cx={-10} cy={-10} r={5.5} fill="#FFFAF2" stroke="#C9A66A" strokeWidth={0.8} />
        <circle cx={-12} cy={-12} r={2.4} fill="#FFE89A" opacity={0.7} />
        <circle cx={-9}  cy={-8}  r={0.8} fill="#C9A66A" opacity={0.6} />
        <circle cx={-7}  cy={-11} r={0.6} fill="#C9A66A" opacity={0.5} />
        {/* MOUNTAIN RIDGE — three peaks of varying heights */}
        {/* far-left smaller peak */}
        <path
          d="M -22 18 L -14 -2 L -6 18 Z"
          fill="#5A8F95" stroke="#1F4E54" strokeWidth={1.3} strokeLinejoin="round"
        />
        {/* middle tallest peak */}
        <path
          d="M -10 18 L 2 -16 L 14 18 Z"
          fill="#3F5260" stroke="#1A2530" strokeWidth={1.4} strokeLinejoin="round"
        />
        {/* right medium peak */}
        <path
          d="M 8 18 L 16 -6 L 22 18 Z"
          fill="#5A8F95" stroke="#1F4E54" strokeWidth={1.3} strokeLinejoin="round"
        />
        {/* SNOW CAPS on the peaks */}
        <path d="M -16 4 L -14 -2 L -12 4 L -14 6 Z" fill="#FFFAF2" stroke="#A8B4C8" strokeWidth={0.6} strokeLinejoin="round" />
        <path d="M -2 -8 L 2 -16 L 6 -8 L 4 -6 L 0 -6 Z" fill="#FFFAF2" stroke="#A8B4C8" strokeWidth={0.7} strokeLinejoin="round" />
        <path d="M 14 0 L 16 -6 L 18 0 L 16 2 Z" fill="#FFFAF2" stroke="#A8B4C8" strokeWidth={0.6} strokeLinejoin="round" />
        {/* shaded right side of middle peak */}
        <path d="M 2 -16 L 14 18 L 8 18 Z" fill="#1A2530" opacity={0.45} />
        {/* tiny pine silhouette at the base of the middle peak */}
        <g transform="translate(-2, 16)">
          <line x1={0} y1={0} x2={0} y2={4} stroke="#3F2614" strokeWidth={0.7} />
          <path d="M 0 0 L -2 -3 L 2 -3 Z M 0 -3 L -2 -6 L 2 -6 Z M 0 -6 L -1.5 -8 L 1.5 -8 Z"
                fill="#3D5C32" stroke="#1F3018" strokeWidth={0.5} strokeLinejoin="round" />
        </g>
        {/* ground line at the base */}
        <line x1={-22} y1={18} x2={22} y2={18} stroke="#3F2614" strokeWidth={0.9} opacity={0.7} />
      </g>
    );
  }

  // fallback: render the original emoji if an unknown code is passed
  return null;
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

  // Three skill stop positions — a journey through the den: the first
  // stop at floor level beside the hearth, then up carved steps to a
  // mid rock ledge, finishing on the high ledge above the spring pool.
  const STOP_POSITIONS: Array<{ x: number; y: number }> = [
    { x: 620, y: 598 },   // floor level, beside the hearth
    { x: 968, y: 478 },   // mid rock ledge
    { x: 1240, y: 376 },  // upper ledge — end of the climb
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
          {/* soft warm light pool — the only gradient in the scene */}
          <radialGradient id="warmPool" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE89A" stopOpacity={0.5} />
            <stop offset="55%" stopColor="#FFD166" stopOpacity={0.16} />
            <stop offset="100%" stopColor="#FFD166" stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* ══ BACK WALL — layered rock strata, warm browns over deep dark ══ */}
        <rect width={1440} height={800} fill="#2A1D14" />

        {/* upper strata band */}
        <path d="M 0 180 C 240 150, 480 190, 720 172 C 960 156, 1200 196, 1440 168 L 1440 420 L 0 420 Z"
              fill="#3E2E22" />
        {/* middle strata band */}
        <path d="M 0 330 C 200 300, 430 350, 700 330 C 980 310, 1220 356, 1440 326 L 1440 560 L 0 560 Z"
              fill="#4A382A" />
        <path d="M 0 330 C 200 300, 430 350, 700 330 C 980 310, 1220 356, 1440 326"
              stroke="#241812" strokeWidth={2} fill="none" opacity={0.35} />
        <path d="M 0 336 C 200 306, 430 356, 700 336 C 980 316, 1220 362, 1440 332"
              stroke="#6E5640" strokeWidth={1.4} fill="none" opacity={0.3} />
        {/* lower strata band — warmest, catches the firelight */}
        <path d="M 0 490 C 260 462, 500 506, 740 488 C 1000 470, 1240 512, 1440 484 L 1440 700 L 0 700 Z"
              fill="#5C4632" />
        <path d="M 0 490 C 260 462, 500 506, 740 488 C 1000 470, 1240 512, 1440 484"
              stroke="#241812" strokeWidth={2} fill="none" opacity={0.35} />
        <path d="M 0 497 C 260 469, 500 513, 740 495 C 1000 477, 1240 519, 1440 491"
              stroke="#7A6350" strokeWidth={1.4} fill="none" opacity={0.35} />

        {/* plum shadow pooling in the cave corners */}
        <path d="M 0 160 C 120 240, 150 460, 90 700 L 0 700 Z" fill="#3A2438" opacity={0.45} />
        <path d="M 1440 160 C 1330 250, 1300 470, 1360 700 L 1440 700 Z" fill="#3A2438" opacity={0.45} />

        {/* embedded boulders in the wall */}
        <g pointerEvents="none">
          <path d="M 150 420 C 138 392, 166 372, 204 376 C 240 380, 256 404, 244 428 C 226 446, 170 444, 150 420 Z"
                fill="#55412F" stroke="#241812" strokeWidth={1.6} strokeLinejoin="round" />
          <path d="M 166 392 Q 196 380 224 392 Q 196 390 166 392 Z" fill="#7A6350" opacity={0.6} />
          <path d="M 990 300 C 978 276, 1004 260, 1038 264 C 1068 268, 1080 290, 1068 310 C 1050 326, 1006 322, 990 300 Z"
                fill="#4E3A28" stroke="#241812" strokeWidth={1.5} strokeLinejoin="round" />
          <path d="M 1004 278 Q 1030 268 1054 280 Q 1028 276 1004 278 Z" fill="#6E5640" opacity={0.55} />
          <path d="M 420 250 C 412 232, 432 220, 458 224 C 480 228, 488 244, 478 260 C 464 272, 432 268, 420 250 Z"
                fill="#4E3A28" stroke="#241812" strokeWidth={1.4} strokeLinejoin="round" />
          <path d="M 432 234 Q 452 226 470 236 Q 450 232 432 234 Z" fill="#6E5640" opacity={0.55} />
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
                <line key={deg}
                      x1={Number((Math.cos(rad) * 9).toFixed(3))} y1={Number((Math.sin(rad) * 9).toFixed(3))}
                      x2={Number((Math.cos(rad) * 14).toFixed(3))} y2={Number((Math.sin(rad) * 14).toFixed(3))}
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

        {/* ══ CEILING — stalactites first, then the dark rock mass over
            their tops so each hangs from the wavy ceiling edge ══ */}
        {[
          { x: 130,  y: 148, w: 13, h: 62, lean: -4 },
          { x: 215,  y: 156, w: 11, h: 46, lean: 5 },
          { x: 330,  y: 156, w: 16, h: 88, lean: 2, drop: true },
          { x: 452,  y: 142, w: 10, h: 52, lean: -6 },
          { x: 545,  y: 154, w: 12, h: 70, lean: 3 },
          { x: 660,  y: 140, w: 10, h: 42, lean: -3 },
          { x: 800,  y: 156, w: 14, h: 80, lean: 4 },
          { x: 960,  y: 146, w: 9,  h: 48, lean: -5 },
          { x: 1015, y: 142, w: 12, h: 64, lean: 2, drop: true },
          { x: 1128, y: 150, w: 15, h: 84, lean: -2 },
          { x: 1252, y: 158, w: 11, h: 44, lean: 6 },
          { x: 1352, y: 146, w: 12, h: 58, lean: -4 },
        ].map((st, i) => (
          <Stalactite key={`stal-${i}`} {...st} reducedMotion={reducedMotion} />
        ))}
        <path
          d="M 0 0 L 1440 0 L 1440 150
             C 1400 176, 1350 158, 1300 170
             C 1246 184, 1210 156, 1150 162
             C 1090 168, 1060 148, 1000 152
             C 940 156, 900 178, 840 170
             C 780 162, 760 140, 700 144
             C 640 148, 620 170, 560 168
             C 500 166, 470 144, 410 150
             C 350 156, 330 180, 270 174
             C 210 168, 180 148, 120 156
             C 70 162, 40 150, 0 164 Z"
          fill="#1A1208"
        />
        {/* ceiling rock texture — sweeping arch strata inside the dark mass */}
        <path d="M 0 60 C 260 96, 520 110, 720 108 C 940 106, 1200 88, 1440 56"
              stroke="#2E211A" strokeWidth={30} fill="none" opacity={0.55} />
        <path d="M 0 108 C 280 138, 560 150, 760 148 C 980 146, 1220 128, 1440 100"
              stroke="#241812" strokeWidth={16} fill="none" opacity={0.8} />
        <path d="M 120 40 C 300 58, 420 66, 560 64" stroke="#2E211A" strokeWidth={8} fill="none" opacity={0.5} strokeLinecap="round" />
        <path d="M 880 62 C 1040 70, 1180 62, 1300 48" stroke="#2E211A" strokeWidth={8} fill="none" opacity={0.5} strokeLinecap="round" />
        {/* pale mineral flecks in the ceiling */}
        <circle cx={240} cy={92} r={1.6} fill="#8A7458" opacity={0.5} />
        <circle cx={480} cy={70} r={1.3} fill="#8A7458" opacity={0.45} />
        <circle cx={704} cy={96} r={1.8} fill="#8A7458" opacity={0.5} />
        <circle cx={1000} cy={78} r={1.4} fill="#8A7458" opacity={0.45} />
        <circle cx={1260} cy={98} r={1.6} fill="#8A7458" opacity={0.5} />
        {/* faint warm edge light where the lantern glow reaches the ceiling */}
        <path d="M 560 168 C 620 170, 640 148, 700 144 C 760 140, 780 162, 840 170"
              stroke="#5C4632" strokeWidth={2} fill="none" opacity={0.5} />

        {/* hanging moss strands swaying from the ceiling edge */}
        {[
          { x: 178, y: 152, len: 46, sway: -5 },
          { x: 508, y: 162, len: 34, sway: 4 },
          { x: 742, y: 148, len: 40, sway: -4 },
          { x: 1076, y: 158, len: 30, sway: 5 },
          { x: 1310, y: 164, len: 44, sway: -6 },
        ].map((mv, i) => (
          <g key={`moss-${i}`} pointerEvents="none" opacity={0.85}>
            <path d={`M ${mv.x} ${mv.y} C ${mv.x + mv.sway} ${mv.y + mv.len * 0.4}, ${mv.x - mv.sway} ${mv.y + mv.len * 0.7}, ${mv.x + mv.sway * 0.6} ${mv.y + mv.len}`}
                  stroke="#5C7E4F" strokeWidth={1.6} fill="none" strokeLinecap="round" />
            <path d={`M ${mv.x + 6} ${mv.y} C ${mv.x + 6 - mv.sway} ${mv.y + mv.len * 0.3}, ${mv.x + 6 + mv.sway} ${mv.y + mv.len * 0.55}, ${mv.x + 6 - mv.sway * 0.4} ${mv.y + mv.len * 0.75}`}
                  stroke="#4F6F42" strokeWidth={1.3} fill="none" strokeLinecap="round" />
            <ellipse cx={mv.x + mv.sway * 0.5} cy={mv.y + mv.len * 0.55} rx={2.2} ry={1.4} fill="#7BA46F" opacity={0.8} />
            <ellipse cx={mv.x + mv.sway * 0.6} cy={mv.y + mv.len * 0.95} rx={2} ry={1.3} fill="#6B8E5A" opacity={0.8} />
          </g>
        ))}

        {/* thick roots poking through the ceiling */}
        <g pointerEvents="none">
          <path d="M 380 150 C 372 190, 396 214, 380 252 C 372 272, 380 288, 374 300"
                stroke="#6B4423" strokeWidth={7} fill="none" strokeLinecap="round" />
          <path d="M 380 152 C 373 190, 395 214, 380 250"
                stroke="#8A5A30" strokeWidth={2.5} fill="none" strokeLinecap="round" opacity={0.7} />
          <path d="M 392 206 C 404 220, 402 236, 410 246" stroke="#6B4423" strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M 1210 165 C 1220 196, 1200 216, 1212 248 C 1220 268, 1208 280, 1214 294"
                stroke="#5A3B1F" strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M 1198 204 C 1188 216, 1192 230, 1184 238" stroke="#5A3B1F" strokeWidth={3.5} fill="none" strokeLinecap="round" />
          <path d="M 246 158 C 252 184, 240 200, 248 224" stroke="#6B4423" strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>

        {/* SLEEPING BAT FAMILY — hanging together from the ceiling edge */}
        <g transform="translate(886, 160)" pointerEvents="none">
          <Bat s={1.25} sway={2.5} reducedMotion={reducedMotion} />
          <g transform="translate(-32, 4)"><Bat s={0.75} sway={3.5} reducedMotion={reducedMotion} /></g>
          <g transform="translate(30, 6)"><Bat s={0.68} sway={3} reducedMotion={reducedMotion} /></g>
        </g>

        {/* ══ FLOOR — stone floor with flagstones and pebbles ══ */}
        <path d="M 0 648 C 180 630, 400 656, 640 644 C 900 632, 1150 658, 1440 640 L 1440 800 L 0 800 Z"
              fill="#3A2C20" />
        <path d="M 0 648 C 180 630, 400 656, 640 644 C 900 632, 1150 658, 1440 640"
              stroke="#241812" strokeWidth={2} fill="none" opacity={0.5} />
        {/* deeper foreground strip */}
        <path d="M 0 760 C 300 744, 700 768, 1050 752 C 1250 744, 1350 758, 1440 750 L 1440 800 L 0 800 Z"
              fill="#2A1D14" />

        {/* flagstones — organic outlined slabs, varied sizes and angles */}
        {[
          { fx: 150,  fy: 700, rx: 42, ry: 12, rot: -6 },
          { fx: 260,  fy: 738, rx: 34, ry: 10, rot: 8 },
          { fx: 560,  fy: 720, rx: 46, ry: 13, rot: 3 },
          { fx: 690,  fy: 690, rx: 30, ry: 9,  rot: -10 },
          { fx: 790,  fy: 742, rx: 40, ry: 11, rot: 5 },
          { fx: 930,  fy: 700, rx: 34, ry: 10, rot: -4 },
          { fx: 1040, fy: 748, rx: 30, ry: 9,  rot: 9 },
          { fx: 610,  fy: 774, rx: 36, ry: 10, rot: -3 },
        ].map((f, i) => (
          <g key={`flag-${i}`} transform={`rotate(${f.rot} ${f.fx} ${f.fy})`} pointerEvents="none">
            <path
              d={`M ${f.fx - f.rx} ${f.fy}
                  C ${f.fx - f.rx * 0.9} ${f.fy - f.ry}, ${f.fx - f.rx * 0.3} ${f.fy - f.ry * 1.3}, ${f.fx + f.rx * 0.2} ${f.fy - f.ry * 1.1}
                  C ${f.fx + f.rx * 0.8} ${f.fy - f.ry * 0.9}, ${f.fx + f.rx} ${f.fy - f.ry * 0.2}, ${f.fx + f.rx * 0.85} ${f.fy + f.ry * 0.5}
                  C ${f.fx + f.rx * 0.4} ${f.fy + f.ry}, ${f.fx - f.rx * 0.5} ${f.fy + f.ry}, ${f.fx - f.rx} ${f.fy} Z`}
              fill="#453424" stroke="#241812" strokeWidth={1.2} opacity={0.9}
            />
            <path d={`M ${f.fx - f.rx * 0.6} ${f.fy - f.ry * 0.5} Q ${f.fx} ${f.fy - f.ry * 0.9} ${f.fx + f.rx * 0.5} ${f.fy - f.ry * 0.5}`}
                  stroke="#5C4632" strokeWidth={1} fill="none" opacity={0.6} />
          </g>
        ))}
        {/* scattered pebbles */}
        {[
          { px: 350, py: 762, r: 5 }, { px: 505, py: 690, r: 4 },
          { px: 875, py: 758, r: 6 }, { px: 1105, py: 700, r: 4.5 },
          { px: 220, py: 682, r: 3.5 },
        ].map((p, i) => (
          <g key={`peb-${i}`} pointerEvents="none">
            <ellipse cx={p.px} cy={p.py} rx={p.r} ry={p.r * 0.62}
                     fill={i % 2 === 0 ? '#6E5B47' : '#55412F'} stroke="#241812" strokeWidth={0.9} />
            <ellipse cx={p.px - p.r * 0.3} cy={p.py - p.r * 0.25} rx={p.r * 0.4} ry={p.r * 0.2}
                     fill="#8A7458" opacity={0.6} />
          </g>
        ))}
        {/* rounded floor rocks against the left wall */}
        <g pointerEvents="none">
          <path d="M 40 668 C 36 640, 62 628, 88 636 C 110 644, 116 664, 106 676 C 84 686, 52 684, 40 668 Z"
                fill="#4E3A28" stroke="#241812" strokeWidth={1.6} strokeLinejoin="round" />
          <path d="M 56 642 Q 76 634 94 644 Q 74 640 56 642 Z" fill="#6E5640" opacity={0.6} />
        </g>

        {/* bear paw prints wandering from the hearth toward the steps */}
        {[
          { x: 560, y: 668, r: -14 },
          { x: 596, y: 682, r: 6 },
          { x: 640, y: 672, r: -8 },
          { x: 676, y: 686, r: 10 },
          { x: 714, y: 676, r: -4 },
        ].map((pp, i) => (
          <g key={`paw-${i}`} transform={`translate(${pp.x}, ${pp.y}) rotate(${pp.r})`} opacity={0.4} pointerEvents="none">
            <ellipse cx={0} cy={0} rx={4.6} ry={3.4} fill="#241812" />
            <circle cx={-3.4} cy={-4} r={1.3} fill="#241812" />
            <circle cx={-1} cy={-5} r={1.3} fill="#241812" />
            <circle cx={1.6} cy={-4.6} r={1.3} fill="#241812" />
            <circle cx={3.8} cy={-3} r={1.2} fill="#241812" />
          </g>
        ))}

        {/* ══ ROCK LEDGES — a terraced path climbing the right wall ══ */}
        <g pointerEvents="none">
          {/* upper ledge */}
          <path
            d="M 1080 452 C 1110 428, 1160 418, 1230 420 C 1310 422, 1370 434, 1440 428
               L 1440 560 C 1360 570, 1240 566, 1160 550 C 1100 538, 1070 500, 1080 452 Z"
            fill="#4E3A28" stroke="#241812" strokeWidth={1.8} strokeLinejoin="round"
          />
          {/* upper ledge top surface */}
          <path
            d="M 1080 452 C 1110 428, 1160 418, 1230 420 C 1310 422, 1370 434, 1440 428
               L 1440 446 C 1360 452, 1250 448, 1170 452 C 1120 456, 1090 460, 1080 452 Z"
            fill="#6E5640"
          />
          <path d="M 1092 446 Q 1240 428 1420 436" stroke="#8A7458" strokeWidth={1.6} fill="none" opacity={0.6} />

          {/* mid ledge */}
          <path
            d="M 820 556 C 850 532, 910 520, 980 522 C 1060 524, 1110 540, 1130 560
               C 1140 588, 1110 618, 1040 628 C 950 638, 860 626, 826 600 C 806 584, 804 570, 820 556 Z"
            fill="#55412F" stroke="#241812" strokeWidth={1.8} strokeLinejoin="round"
          />
          <path
            d="M 820 556 C 850 532, 910 520, 980 522 C 1060 524, 1110 540, 1130 560
               C 1120 570, 1060 576, 980 574 C 900 572, 840 568, 820 556 Z"
            fill="#7A6350"
          />
          <path d="M 842 552 Q 980 534 1110 556" stroke="#9B8868" strokeWidth={1.6} fill="none" opacity={0.55} />
          {/* strata cracks + embedded stones on the ledge faces */}
          <path d="M 900 586 Q 940 596 1000 596 Q 1060 594 1096 582" stroke="#241812" strokeWidth={1.2} fill="none" opacity={0.45} />
          <path d="M 868 576 Q 872 592 862 606" stroke="#241812" strokeWidth={1} fill="none" opacity={0.4} />
          <ellipse cx={1030} cy={604} rx={10} ry={5} fill="#6E5B47" stroke="#241812" strokeWidth={1} opacity={0.9} />
          <path d="M 1150 476 Q 1230 496 1330 500 Q 1390 500 1436 492" stroke="#241812" strokeWidth={1.2} fill="none" opacity={0.4} />
          <path d="M 1246 470 Q 1252 492 1244 512" stroke="#241812" strokeWidth={1} fill="none" opacity={0.35} />
          <ellipse cx={1352} cy={526} rx={12} ry={6} fill="#5F4A36" stroke="#241812" strokeWidth={1} opacity={0.9} />
          {/* mossy tufts on the ledge edges */}
          <ellipse cx={860} cy={560} rx={12} ry={3} fill="#5C7E4F" opacity={0.7} />
          <ellipse cx={1120} cy={452} rx={10} ry={2.6} fill="#5C7E4F" opacity={0.6} />

          {/* carved steps: floor → mid ledge → upper ledge */}
          {[
            { sx: 726,  sy: 648, rx: 26, ry: 7 },
            { sx: 762,  sy: 622, rx: 24, ry: 6.5 },
            { sx: 796,  sy: 596, rx: 25, ry: 7 },
            { sx: 828,  sy: 572, rx: 23, ry: 6 },
            { sx: 1082, sy: 540, rx: 24, ry: 6.5 },
            { sx: 1108, sy: 512, rx: 23, ry: 6 },
            { sx: 1128, sy: 484, rx: 24, ry: 6.5 },
            { sx: 1148, sy: 458, rx: 22, ry: 6 },
          ].map((s, i) => (
            <g key={`step-${i}`}>
              <ellipse cx={s.sx + 2} cy={s.sy + 3} rx={s.rx} ry={s.ry} fill="#000" opacity={0.3} />
              <ellipse cx={s.sx} cy={s.sy} rx={s.rx} ry={s.ry}
                       fill="#6E5B47" stroke="#241812" strokeWidth={1.3} />
              <ellipse cx={s.sx - 3} cy={s.sy - 1.5} rx={s.rx * 0.6} ry={s.ry * 0.45}
                       fill="#8A7458" opacity={0.7} />
            </g>
          ))}
        </g>

        {/* ══ GLOW-CRYSTAL CLUSTERS — growing from wall pockets ══ */}
        <CrystalCluster x={140} y={480} s={1} reducedMotion={reducedMotion} />
        <CrystalCluster x={345} y={302} s={0.75} hue="gold" reducedMotion={reducedMotion} delay={1.3} />
        <CrystalCluster x={1330} y={280} s={0.9} flip reducedMotion={reducedMotion} delay={0.7} />
        <CrystalCluster x={1392} y={432} s={0.65} hue="gold" flip reducedMotion={reducedMotion} delay={2.1} />

        {/* ══ GLOW MUSHROOM CLUSTERS in the dark corners ══ */}
        <MushroomCluster x={190} y={676} s={1.05} reducedMotion={reducedMotion} />
        <MushroomCluster x={868} y={664} s={0.8} flip reducedMotion={reducedMotion} delay={1.2} />
        <MushroomCluster x={1078} y={744} s={0.9} reducedMotion={reducedMotion} delay={2} />

        {/* ══ SPRING POOL — organic shore, ripples, glow reflection, koi ══ */}
        <g pointerEvents="none">
          {/* outlined organic shore */}
          <path
            d="M 1146 742 C 1160 720, 1210 708, 1272 706 C 1340 704, 1400 714, 1424 734
               C 1440 750, 1420 772, 1360 780 C 1290 788, 1200 784, 1164 768 C 1142 758, 1138 750, 1146 742 Z"
            fill="#55412F" stroke="#241812" strokeWidth={1.8} strokeLinejoin="round"
          />
          {/* water */}
          <path
            d="M 1162 742 C 1176 726, 1220 716, 1274 714 C 1332 712, 1384 722, 1404 736
               C 1416 748, 1400 764, 1350 770 C 1288 776, 1210 774, 1180 762 C 1160 754, 1156 748, 1162 742 Z"
            fill="#3E5F66"
          />
          <path
            d="M 1180 740 C 1196 730, 1234 724, 1278 722 C 1326 720, 1366 728, 1382 738
               C 1390 746, 1378 756, 1338 760 C 1288 764, 1222 762, 1198 754 C 1184 748, 1176 744, 1180 740 Z"
            fill="#567F86" opacity={0.85}
          />
          {/* warm glow reflection from the hearth-light */}
          <ellipse cx={1250} cy={740} rx={40} ry={9} fill="#FFD166" opacity={0.22} />
          {/* ripple arcs */}
          <path d="M 1216 738 Q 1240 732 1264 738" stroke="#A8CDD2" strokeWidth={1.3} fill="none" opacity={0.6} strokeLinecap="round" />
          <path d="M 1300 750 Q 1326 744 1350 750" stroke="#A8CDD2" strokeWidth={1.2} fill="none" opacity={0.5} strokeLinecap="round" />
          <path d="M 1252 758 Q 1272 753 1292 758" stroke="#A8CDD2" strokeWidth={1} fill="none" opacity={0.45} strokeLinecap="round" />
          {/* koi silhouette gliding under the surface */}
          <motion.g
            animate={reducedMotion ? undefined : { x: [0, 26, 0], y: [0, -4, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path
              d="M 1276 748 C 1288 742, 1304 742, 1314 748 C 1304 754, 1288 754, 1276 748 Z
                 M 1276 748 C 1270 743, 1264 743, 1260 746 C 1266 748, 1266 749, 1260 751 C 1264 754, 1270 753, 1276 748 Z"
              fill="#E8845C" opacity={0.75}
            />
            <circle cx={1308} cy={746} r={1.2} fill="#3F2614" opacity={0.7} />
          </motion.g>
          {/* shore stones + fern */}
          <ellipse cx={1152} cy={764} rx={9} ry={4} fill="#6E5B47" stroke="#241812" strokeWidth={1.1} />
          <ellipse cx={1418} cy={758} rx={8} ry={3.6} fill="#55412F" stroke="#241812" strokeWidth={1} />
          <g transform="translate(1408, 726)">
            <path d="M 0 0 Q -5 -12 -10 -18" stroke="#6B8E5A" strokeWidth={1.6} fill="none" strokeLinecap="round" />
            <path d="M 0 0 Q 0 -14 -2 -22" stroke="#7BA46F" strokeWidth={1.6} fill="none" strokeLinecap="round" />
            <path d="M 0 0 Q 5 -11 8 -17" stroke="#6B8E5A" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          </g>
        </g>

        {/* warm pools of light from the lantern and hearth */}
        <ellipse cx={720} cy={320} rx={280} ry={185} fill="url(#warmPool)" />
        <ellipse cx={440} cy={670} rx={320} ry={150} fill="url(#warmPool)" />

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
        <ellipse cx={720} cy={290} rx={230} ry={150} fill="url(#warmPool)" />
        <ellipse cx={720} cy={290} rx={120} ry={76} fill="url(#warmPool)" opacity={0.8} />

        {/* CAMPFIRE — the hearth in front of the bear */}
        <Campfire x={490} y={700} reducedMotion={reducedMotion} />

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
              <circle r={46} fill="transparent" />

              {/* CARVED ALCOVE — a rounded niche cut into the cave wall */}
              <path
                d="M -48 44 L -48 -8 C -48 -42, -22 -58, 0 -58 C 22 -58, 48 -42, 48 -8 L 48 44 Z"
                fill="#241812" opacity={0.9}
              />
              <path
                d="M -48 44 L -48 -8 C -48 -42, -22 -58, 0 -58 C 22 -58, 48 -42, 48 -8 L 48 44"
                fill="none" stroke="#241812" strokeWidth={3}
              />
              {/* carved rim highlight */}
              <path
                d="M -43 42 L -43 -8 C -43 -38, -20 -53, 0 -53 C 20 -53, 43 -38, 43 -8 L 43 42"
                fill="none" stroke="#7A6350" strokeWidth={1.6} opacity={0.6}
              />
              {/* warm candle-light inside the niche */}
              <ellipse cx={0} cy={-2} rx={38} ry={42} fill="#FFD166"
                       opacity={stop.unlocked ? 0.13 : 0.05} />

              {stop.unlocked && !stop.completed && (
                <circle r={34} fill="#FFE89A" opacity={0.16} />
              )}
              {stop.completed && (
                <circle r={38} fill="#FFD93D" opacity={0.2} />
              )}

              {/* CHUNKY ROCK PLINTH the skill tile sits on */}
              <ellipse cx={2} cy={47} rx={44} ry={7.5} fill="#000" opacity={0.4} />
              <path
                d="M -30 16 C -35 12, -31 7, -24 7 L 24 7 C 31 7, 35 12, 30 16
                   L 34 38 C 36 44, 26 47, 0 47 C -26 47, -36 44, -34 38 Z"
                fill="#5F4A36" stroke="#3F3026" strokeWidth={1.6} strokeLinejoin="round"
              />
              {/* top slab */}
              <ellipse cx={0} cy={8} rx={30} ry={6.5} fill="#8A7458" stroke="#3F3026" strokeWidth={1.4} />
              <ellipse cx={-3} cy={6.5} rx={22} ry={3.4} fill="#A89274" opacity={0.85} />
              {/* front-face cracks + base shading */}
              <path d="M -8 20 Q -5 28 -10 36" stroke="#3F3026" strokeWidth={1} fill="none" opacity={0.6} />
              <path d="M 14 22 Q 17 30 14 38" stroke="#3F3026" strokeWidth={0.9} fill="none" opacity={0.45} />
              <path d="M -34 39 C -18 44, 18 44, 34 39 L 34 40 C 26 47, -26 47, -34 40 Z"
                    fill="#241812" opacity={0.55} />
              {/* moss tuft on one corner */}
              <ellipse cx={-23} cy={11} rx={8} ry={2.2} fill="#5C7E4F" opacity={0.75} />

              {/* small candle keeping the alcove lit */}
              <StopCandle x={-46} y={36} reducedMotion={reducedMotion} delay={i * 0.7} />

              {/* BESPOKE SKILL ICON — rests on the plinth's top slab */}
              <g
                style={{
                  filter: stop.completed
                    ? 'drop-shadow(0 0 8px rgba(255, 217, 61, 0.75))'
                    : stop.unlocked
                      ? 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.55))'
                      : undefined,
                }}
              >
                <CaveSkillIcon code={stop.code} completed={stop.completed} unlocked={stop.unlocked} />
              </g>

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

              <rect x={-58} y={52} width={116} height={18} rx={9}
                    fill={stop.completed ? '#FFF6CC' : stop.unlocked ? '#FFFAF2' : '#3A2E22'}
                    stroke={stop.completed ? '#D4B43E' : stop.unlocked ? '#E8A87C' : '#5A4533'}
                    strokeWidth={1.2} />
              <text x={0} y={65} textAnchor="middle"
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
