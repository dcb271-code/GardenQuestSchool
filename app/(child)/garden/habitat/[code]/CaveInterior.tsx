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

              {/* CHUNKY STONE PEDESTAL — taller, more substantial rock
                  formation that the icon clearly SITS ON. Has a visible
                  3D front face (showing stone "thickness") + flat top
                  surface at y=8 where the icon's bottom rests. No more
                  floating icon. */}
              {/* shadow on the cave floor */}
              <ellipse cx={2} cy={42} rx={40} ry={7} fill="#000" opacity={0.45} />

              {/* base — the part below the flat top. Drawn as a chunky
                  stacked-stone shape with a clear front face. */}
              <path
                d="M -38 38
                   C -40 28, -32 18, -18 16
                   C -2 14, 16 14, 30 18
                   C 40 22, 42 32, 38 40
                   C 22 44, 0 44, -16 42
                   C -30 42, -40 40, -38 38 Z"
                fill="#5A4533" stroke="#1A1208" strokeWidth={1.6} strokeLinejoin="round"
              />
              {/* darker shadow on the base front face */}
              <path
                d="M -34 30 C -16 36, 18 36, 36 30 L 38 40 C 22 44, 0 44, -16 42 C -30 42, -40 40, -38 38 Z"
                fill="#1A1208" opacity={0.55}
              />
              {/* small visible stones stacked on the base (2-3 boulders
                  to suggest the pedestal was BUILT, not just a rock) */}
              <ellipse cx={-22} cy={26} rx={9} ry={6} fill="#7A6B58" stroke="#3F3026" strokeWidth={1.0} />
              <ellipse cx={-24} cy={24} rx={5} ry={2.4} fill="#9B8868" opacity={0.7} />
              <ellipse cx={20} cy={26} rx={11} ry={6} fill="#7A6B58" stroke="#3F3026" strokeWidth={1.0} />
              <ellipse cx={18} cy={24} rx={7} ry={2.6} fill="#9B8868" opacity={0.7} />

              {/* FLAT TOP SURFACE — wide oval that's clearly a flat
                  shelf for the icon to rest on. Lighter color than
                  the base for contrast. */}
              <ellipse cx={0} cy={14} rx={34} ry={7} fill="#9B8868" stroke="#3F3026" strokeWidth={1.4} />
              {/* top highlight — paler */}
              <ellipse cx={-2} cy={12} rx={28} ry={4} fill="#C2B098" opacity={0.85} />
              {/* small mossy edge on the top */}
              <ellipse cx={-22} cy={14} rx={7} ry={1.6} fill="#7BA46F" opacity={0.75} />
              <ellipse cx={20} cy={15} rx={5} ry={1.4} fill="#5C7E4F" opacity={0.65} />
              {/* tiny stone chips around the foot of the pedestal */}
              <ellipse cx={-36} cy={42} rx={4} ry={1.4} fill="#7A6B58" stroke="#3F3026" strokeWidth={0.6} />
              <ellipse cx={36}  cy={42} rx={3.5} ry={1.2} fill="#9B8868" stroke="#3F3026" strokeWidth={0.5} />
              <ellipse cx={-30} cy={45} rx={2.5} ry={1.0} fill="#9B8868" opacity={0.7} />

              {/* BESPOKE SVG ICON for the cave skill — sits directly
                  ON the flat top of the pedestal (the icon's internal
                  bottom at y~12-16 lands on the pedestal top zone
                  y=7-21, so the icon visibly rests on the stone). */}
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
