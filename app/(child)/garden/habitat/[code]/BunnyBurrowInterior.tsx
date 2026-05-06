// app/(child)/garden/habitat/[code]/BunnyBurrowInterior.tsx
//
// Bunny Burrow interior — a homely underground PARLOUR. Composition
// is intentional, not decorative: a built-in HEARTH alcove on the
// back wall casts the room's warm light; a hanging lantern provides
// secondary glow; a small cottontail rabbit sits in side profile by
// a tiny side table with a teacup; the themed skill structure rests
// on a braided rug in the foreground. SHELVES on the right wall hold
// clay jars; HANGING DRIED HERBS bundle from the ceiling beams; a
// wooden door on the left leads deeper into the warren.
//
// EVERY decorative element is a bespoke SVG path — no emoji.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { SpeciesData } from '@/lib/world/speciesCatalog';
import HabitatInteriorLayout from '@/components/child/garden/HabitatInteriorLayout';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';

interface BunnyBurrowInteriorProps {
  learnerId: string;
  themedSkillCode: string;
  themedStructureLabel: string;
  themedStructureEmoji: string;
  discoveredSpecies: SpeciesData[];
  undiscoveredCount: number;
}

// ─────────────────────────────────────────────────────────────────────────
// CottontailBunny — side-profile rabbit facing right with REAL ANATOMY.
// Pose drawn with structural definition, not stacked circles:
//   • Distinct shoulder bump where neck meets back
//   • Distinct hip bump where back meets haunch
//   • Defined chest curve descending into belly fluff
//   • Wedge-shaped head (not a circle) with a defined cheek + jaw
//   • Almond-shaped eye (not a perfect circle)
//   • Folded near-ear with visible inner ridge + tip notch
//   • Hind leg as a clear L-shape (thigh visible, foot extending forward)
//   • Cottontail as a textured fluffy puff with visible tufts
// ─────────────────────────────────────────────────────────────────────────
function CottontailBunny({
  scale = 1, reducedMotion,
}: { scale?: number; reducedMotion: boolean }) {
  const LINE = '#3F2614';
  const FUR = '#8A5A3C';
  const FUR_DARK = '#5A3820';
  const FUR_HI = '#B07A52';
  const BELLY = '#F0DCB8';
  const NOSE_PINK = '#C38D9E';
  const TAIL_WHITE = '#FFFAF2';
  const TAIL_SHADE = '#E0D6BC';

  return (
    <g transform={`scale(${scale})`}>
      {/* ground shadow */}
      <ellipse cx={2} cy={56} rx={28} ry={4} fill="#000" opacity={0.32} />

      {/* COTTONTAIL — fluffy puff at the back, drawn as TEXTURED
          irregular shape (not a smooth circle). Has visible tufts
          radiating outward. */}
      <g>
        {/* base cloud silhouette — irregular bumpy outline */}
        <path
          d="M -28 26
             C -34 22, -34 16, -28 14
             C -26 10, -22 10, -20 12
             C -18 8, -14 8, -12 12
             C -10 10, -10 16, -14 18
             C -12 22, -16 28, -20 28
             C -22 32, -28 32, -28 26 Z"
          fill={TAIL_WHITE} stroke={LINE} strokeWidth={1.2} strokeLinejoin="round"
        />
        {/* fur tuft ridges — tiny arcs suggesting fluff direction */}
        <path d="M -28 18 Q -25 17 -23 19" stroke={TAIL_SHADE} strokeWidth={0.8} fill="none" strokeLinecap="round" />
        <path d="M -25 24 Q -22 23 -20 25" stroke={TAIL_SHADE} strokeWidth={0.8} fill="none" strokeLinecap="round" />
        <path d="M -18 14 Q -16 13 -14 15" stroke={TAIL_SHADE} strokeWidth={0.8} fill="none" strokeLinecap="round" />
        {/* highlight sparkle */}
        <ellipse cx={-22} cy={16} rx={3} ry={2} fill="#FFFFFF" opacity={0.85} />
      </g>

      {/* HIND LEG / HAUNCH — clear L-shape: thigh bulge running back-
          and-down, foot extending forward at the bottom.
          Drawn as TWO defined shapes (thigh + foot) joined together,
          not a single bean. */}
      {/* THIGH — visible bulge above and behind the hip */}
      <path
        d="M -14 50
           C -20 48, -22 38, -16 30
           C -8 22, 4 22, 14 28
           C 16 36, 12 46, 4 50
           C -4 54, -10 54, -14 50 Z"
        fill={FUR} stroke={LINE} strokeWidth={1.6} strokeLinejoin="round"
      />
      {/* thigh shading — defines the muscle */}
      <path
        d="M -14 38 Q -8 30, 0 32 Q -2 40, -8 44 Q -14 46, -14 38 Z"
        fill={FUR_DARK} opacity={0.5}
      />
      {/* FOOT — long flat shape extending FORWARD from the haunch */}
      <path
        d="M -2 50
           C 2 48, 18 48, 22 50
           C 24 54, 22 56, 16 56
           L -2 56
           C -6 54, -6 52, -2 50 Z"
        fill={FUR} stroke={LINE} strokeWidth={1.5} strokeLinejoin="round"
      />
      {/* foot pad — paler underside */}
      <ellipse cx={12} cy={54} rx={8} ry={1.6} fill={FUR_DARK} opacity={0.6} />
      <circle cx={8} cy={54} r={0.8} fill={LINE} />
      <circle cx={13} cy={55} r={0.8} fill={LINE} />
      <circle cx={17} cy={54} r={0.8} fill={LINE} />
      {/* small claw hint */}
      <path d="M 21 53 Q 22 52 22 53.5" stroke={LINE} strokeWidth={0.6} fill="none" strokeLinecap="round" />

      {/* BODY — drawn AS TWO joined sections (chest bulge + belly curve)
          to give visible STRUCTURE, not a single round teardrop. The
          shoulder + hip bumps create a defined silhouette. */}
      <path
        d="
          M -16 32
          C -22 24, -22 12, -16 4         /* hip bump on the left */
          C -12 -4, -2 -10, 6 -10         /* up over the back */
          C 16 -8, 24 -2, 24 6            /* shoulder bump on the right */
          C 26 16, 22 28, 14 32           /* descending front of chest */
          C 6 36, -8 38, -16 32 Z         /* under-belly back to hip */
        "
        fill={FUR} stroke={LINE} strokeWidth={1.7} strokeLinejoin="round"
      />
      {/* BELLY — defined paler curve along the lower-front of the body */}
      <path
        d="M -2 26 C 6 32, 16 32, 22 26 C 24 18, 18 14, 10 16 C 0 18, -4 22, -2 26 Z"
        fill={BELLY} opacity={0.85}
      />
      {/* CHEST DIVISION LINE — subtle curve separating the chest from
          the belly fluff (gives the body structural definition) */}
      <path d="M 8 6 Q 18 12 22 22" stroke={FUR_DARK} strokeWidth={0.7} fill="none" opacity={0.55} strokeLinecap="round" />
      {/* SHOULDER curve — subtle highlight on the upper-front bump */}
      <path
        d="M 12 -8 Q 22 -2 24 8 Q 18 0 8 -2 Z"
        fill={FUR_HI} opacity={0.55}
      />
      {/* HIP curve — same on the rear */}
      <path
        d="M -16 -2 Q -22 6 -16 16 Q -10 8 -10 -2 Z"
        fill={FUR_HI} opacity={0.5}
      />
      {/* FUR DIRECTION lines along the back — short angled strokes */}
      <path d="M -8 -8 Q -10 -10 -12 -8" stroke={FUR_DARK} strokeWidth={0.5} fill="none" opacity={0.6} strokeLinecap="round" />
      <path d="M 0 -10 Q -2 -12 -4 -10" stroke={FUR_DARK} strokeWidth={0.5} fill="none" opacity={0.6} strokeLinecap="round" />
      <path d="M 8 -8 Q 6 -10 4 -8" stroke={FUR_DARK} strokeWidth={0.5} fill="none" opacity={0.6} strokeLinecap="round" />
      <path d="M 16 -4 Q 14 -6 12 -4" stroke={FUR_DARK} strokeWidth={0.5} fill="none" opacity={0.6} strokeLinecap="round" />

      {/* SINGLE FRONT PAW visible from the side — clearly a leg
          extending downward, not a chest bump. Defined ankle + foot. */}
      <path
        d="M 14 28
           C 18 30, 22 36, 22 42
           C 22 46, 18 48, 14 46
           C 10 42, 10 32, 14 28 Z"
        fill={FUR} stroke={LINE} strokeWidth={1.3} strokeLinejoin="round"
      />
      {/* paw shadow underside */}
      <ellipse cx={18} cy={46} rx={4} ry={1.6} fill={FUR_DARK} opacity={0.55} />
      {/* toe lines */}
      <line x1={20} y1={45} x2={20} y2={47} stroke={LINE} strokeWidth={0.6} />
      <line x1={18} y1={46} x2={18} y2={48} stroke={LINE} strokeWidth={0.6} />
      <line x1={16} y1={45} x2={16} y2={47} stroke={LINE} strokeWidth={0.6} />

      {/* HEAD GROUP — animated breathing bob */}
      <motion.g
        animate={reducedMotion ? undefined : { y: [0, -1, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* FAR EAR (back) — slim peeking behind the near ear */}
        <path
          d="M 4 -10 C 2 -28, 6 -40, 10 -40
             C 12 -38, 12 -24, 10 -10 Z"
          fill={FUR_DARK} stroke={LINE} strokeWidth={1.3} strokeLinejoin="round"
        />
        {/* NEAR EAR — has a defined fold ridge + tip notch (not a smooth
            ellipse). Twitches occasionally. */}
        <motion.g
          animate={reducedMotion ? undefined : { rotate: [0, 0, 0, -10, 0, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: '12px', originY: '-10px' }}
        >
          {/* outer ear shape — slightly pinched at the tip */}
          <path
            d="M 8 -10
               C 6 -28, 10 -42, 16 -44
               L 18 -42
               C 22 -32, 22 -22, 20 -14
               L 18 -10 Z"
            fill={FUR} stroke={LINE} strokeWidth={1.3} strokeLinejoin="round"
          />
          {/* inner pink ear */}
          <path
            d="M 10 -12 C 8 -28, 14 -40, 17 -38
               C 19 -36, 19 -24, 16 -12 Z"
            fill={NOSE_PINK} opacity={0.65}
          />
          {/* CENTER FOLD RIDGE inside the ear — subtle crease */}
          <path d="M 14 -14 Q 14 -28 16 -38"
                stroke={NOSE_PINK} strokeWidth={0.6} fill="none" opacity={0.7} strokeLinecap="round" />
          {/* small fur tuft at the ear base */}
          <path d="M 8 -10 L 6 -7 M 10 -10 L 9 -7"
                stroke={FUR_DARK} strokeWidth={0.5} strokeLinecap="round" />
        </motion.g>

        {/* HEAD — WEDGE silhouette tapering into the muzzle, not a
            circle. Has a defined CROWN, BROW, CHEEK, and JAW. */}
        <path
          d="
            M -4 -8
            C -6 -16, 2 -22, 12 -22       /* crown of skull */
            C 22 -22, 28 -18, 30 -12      /* brow tapering forward */
            C 32 -6, 30 0, 24 4           /* tapering toward muzzle */
            C 22 8, 16 12, 10 12          /* cheek line */
            C -2 14, -6 6, -4 -8 Z         /* jaw curve back to start */
          "
          fill={FUR} stroke={LINE} strokeWidth={1.7} strokeLinejoin="round"
        />
        {/* CROWN HIGHLIGHT — top of the skull */}
        <path
          d="M 0 -18 Q 14 -22 26 -18 Q 14 -14 0 -18 Z"
          fill={FUR_HI} opacity={0.65}
        />
        {/* CHEEK shading — paler patch defining the lower jaw */}
        <path d="M 4 0 Q 12 8 22 6 Q 22 2 14 0 Q 6 -2 4 0 Z"
              fill={BELLY} opacity={0.5} />
        {/* BROW RIDGE above the eye — gives the face structure */}
        <path d="M 12 -18 Q 18 -22 24 -18"
              stroke={FUR_DARK} strokeWidth={0.8} fill="none" opacity={0.65} strokeLinecap="round" />

        {/* EYE — almond-shaped (not a perfect circle), with iris +
            highlight + lower eyelid line */}
        <path
          d="M 13 -12 Q 16 -14 19 -12 Q 18 -8 16 -8 Q 14 -8 13 -12 Z"
          fill="#FFFAF2" stroke={LINE} strokeWidth={1.0} strokeLinejoin="round"
        />
        <ellipse cx={16} cy={-11} rx={2} ry={2.4} fill="#1A1208" />
        <circle cx={17} cy={-12} r={0.9} fill="#FFFFFF" />
        <circle cx={15} cy={-10.5} r={0.4} fill="#FFFFFF" opacity={0.7} />
        {/* lower eyelid line — adds depth */}
        <path d="M 13 -10 Q 16 -8 19 -10" stroke={LINE} strokeWidth={0.6}
              fill="none" opacity={0.55} strokeLinecap="round" />

        {/* MUZZLE — paler defined wedge at the front of the head */}
        <path
          d="M 22 -2 C 26 -2, 30 0, 30 4
             C 30 6, 28 8, 24 8
             C 18 8, 16 4, 18 0
             C 20 -2, 22 -2, 22 -2 Z"
          fill={BELLY} stroke={LINE} strokeWidth={1.0} strokeLinejoin="round"
        />
        {/* PINK NOSE TIP — twitches */}
        <motion.path
          d="M 28 -2 C 30 -2, 32 0, 31 2
             C 30 3, 28 3, 27 2
             C 26 0, 27 -2, 28 -2 Z"
          fill={NOSE_PINK} stroke={LINE} strokeWidth={0.8} strokeLinejoin="round"
          animate={reducedMotion ? undefined : { scale: [1, 1.18, 1, 1.10, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: '29px', originY: '0px' }}
        />
        {/* MOUTH — small line below the nose with a tiny smile curve */}
        <line x1={28} y1={3} x2={28} y2={5} stroke={LINE} strokeWidth={0.6} strokeLinecap="round" />
        <path d="M 28 5 Q 26 7 24 5" stroke={LINE} strokeWidth={0.7} fill="none" strokeLinecap="round" />
        <path d="M 28 5 Q 30 7 31 5" stroke={LINE} strokeWidth={0.6} fill="none" strokeLinecap="round" />

        {/* WHISKERS — three on each side, slightly varied lengths */}
        <line x1={20} y1={1} x2={12} y2={-1}  stroke={LINE} strokeWidth={0.5} opacity={0.75} />
        <line x1={20} y1={3} x2={11} y2={3}   stroke={LINE} strokeWidth={0.5} opacity={0.75} />
        <line x1={20} y1={5} x2={12} y2={7}   stroke={LINE} strokeWidth={0.5} opacity={0.75} />
        <line x1={32} y1={0} x2={40} y2={-2}  stroke={LINE} strokeWidth={0.5} opacity={0.75} />
        <line x1={32} y1={2} x2={40} y2={2}   stroke={LINE} strokeWidth={0.5} opacity={0.75} />
        <line x1={32} y1={4} x2={40} y2={6}   stroke={LINE} strokeWidth={0.5} opacity={0.75} />
      </motion.g>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// HEARTH ALCOVE — built-in fireplace cut into the back wall. Glowing
// embers with subtle flame, stone hearth surround. The PRIMARY warm
// light source of the burrow.
// ─────────────────────────────────────────────────────────────────────────
function HearthAlcove({ x, y, reducedMotion }: { x: number; y: number; reducedMotion: boolean }) {
  return (
    <g transform={`translate(${x}, ${y})`} pointerEvents="none">
      {/* warm glow spilling out — wide soft halo */}
      <ellipse cx={0} cy={20} rx={140} ry={80} fill="#FFD06B" opacity={0.22} />
      <ellipse cx={0} cy={28} rx={90} ry={50} fill="#FFE89A" opacity={0.30} />

      {/* alcove ARCH SHADOW — the dark depth behind */}
      <path
        d="M -40 36
           L -40 -8
           C -40 -28, -22 -42, 0 -42
           C 22 -42, 40 -28, 40 -8
           L 40 36 Z"
        fill="#1A0F08" opacity={0.92}
      />

      {/* STONE SURROUND — built-up stones arching around the alcove mouth */}
      {[
        { ax: -48, ay: 36, r: 8 },
        { ax: -50, ay: 12, r: 9 },
        { ax: -46, ay: -10, r: 8 },
        { ax: -36, ay: -28, r: 7 },
        { ax: -22, ay: -38, r: 8 },
        { ax: -8,  ay: -44, r: 7 },
        { ax: 8,   ay: -44, r: 7 },
        { ax: 22,  ay: -38, r: 8 },
        { ax: 36,  ay: -28, r: 7 },
        { ax: 46,  ay: -10, r: 8 },
        { ax: 50,  ay: 12, r: 9 },
        { ax: 48,  ay: 36, r: 8 },
      ].map((s, i) => (
        <g key={`hs-${i}`}>
          <ellipse cx={s.ax + 0.6} cy={s.ay + 1} rx={s.r} ry={s.r * 0.7}
                   fill="#000" opacity={0.32} />
          <ellipse cx={s.ax} cy={s.ay} rx={s.r} ry={s.r * 0.7}
                   fill={i % 2 === 0 ? '#9B8868' : '#7A6B58'}
                   stroke="#3F3026" strokeWidth={0.9} />
          <ellipse cx={s.ax - 1.5} cy={s.ay - 1} rx={s.r * 0.45} ry={s.r * 0.22}
                   fill="#C2B5A2" opacity={0.7} />
        </g>
      ))}

      {/* HEARTH FLOOR — flat slab at the base */}
      <rect x={-44} y={32} width={88} height={8} fill="#5A4533" stroke="#1A0F08" strokeWidth={1.2} />
      <line x1={-44} y1={36} x2={44} y2={36} stroke="#3F2E20" strokeWidth={0.5} opacity={0.75} />

      {/* LOGS — two small charred logs in the back */}
      <ellipse cx={-12} cy={28} rx={14} ry={3} fill="#1A0F08" />
      <ellipse cx={-12} cy={26} rx={14} ry={3.5} fill="#3F2614" stroke="#1A0F08" strokeWidth={0.9} />
      <line x1={-22} y1={26} x2={-2} y2={26} stroke="#1A0F08" strokeWidth={0.7} opacity={0.6} />
      <ellipse cx={10} cy={28} rx={12} ry={3} fill="#1A0F08" />
      <ellipse cx={10} cy={26} rx={12} ry={3.5} fill="#3F2614" stroke="#1A0F08" strokeWidth={0.9} />

      {/* GLOWING EMBERS — small bright spots between/under the logs */}
      <circle cx={-6}  cy={28} r={1.6} fill="#FFD06B" opacity={0.95} />
      <circle cx={2}   cy={29} r={1.8} fill="#FF9152" opacity={0.95} />
      <circle cx={8}   cy={28} r={1.4} fill="#FFD06B" opacity={0.9} />
      <circle cx={-14} cy={29} r={1.0} fill="#FF9152" opacity={0.85} />
      <circle cx={16}  cy={29} r={1.2} fill="#FFD06B" opacity={0.85} />

      {/* SMALL FLAMES — animated flicker, a few licks of fire */}
      {!reducedMotion ? (
        <>
          <motion.path
            d="M -4 24 C -8 18, -8 12, -4 8 C 0 12, 0 18, -4 24 Z"
            fill="#FFFAF2"
            animate={{ scaleY: [1, 1.18, 0.95, 1.10, 1], opacity: [0.85, 1, 0.92, 1, 0.85] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '-4px', originY: '24px' }}
          />
          <motion.path
            d="M 6 24 C 3 19, 3 14, 6 10 C 9 14, 9 19, 6 24 Z"
            fill="#FFD06B"
            animate={{ scaleY: [1, 1.10, 0.92, 1.18, 1], opacity: [0.9, 1, 0.85, 1, 0.9] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            style={{ originX: '6px', originY: '24px' }}
          />
        </>
      ) : (
        <>
          <path d="M -4 24 C -8 18, -8 12, -4 8 C 0 12, 0 18, -4 24 Z" fill="#FFFAF2" opacity={0.9} />
          <path d="M 6 24 C 3 19, 3 14, 6 10 C 9 14, 9 19, 6 24 Z" fill="#FFD06B" opacity={0.9} />
        </>
      )}

      {/* TINY SOOT MARK — black smudge above the alcove from years of fires */}
      <path
        d="M -12 -36 Q -4 -42 0 -38 Q 4 -42 12 -36 Q 8 -32 0 -34 Q -8 -32 -12 -36 Z"
        fill="#1A0F08" opacity={0.55}
      />
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JAR SHELF — wooden shelf with ceramic jars. Sits on the back wall.
// ─────────────────────────────────────────────────────────────────────────
function JarShelf({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`} pointerEvents="none">
      {/* shadow on the wall behind the shelf */}
      <rect x={-58} y={28} width={116} height={6} fill="#1A0F08" opacity={0.50} />
      {/* shelf plank */}
      <rect x={-60} y={20} width={120} height={6} fill="#7B4F2C" stroke="#3F2614" strokeWidth={1.2} />
      <line x1={-60} y1={22.5} x2={60} y2={22.5} stroke="#A0703F" strokeWidth={0.5} opacity={0.7} />
      {/* end-grain caps */}
      <rect x={-62} y={20} width={2} height={6} fill="#5A3B1F" />
      <rect x={60} y={20} width={2} height={6} fill="#5A3B1F" />
      {/* small bracket triangles under the shelf */}
      <path d="M -54 26 L -50 32 L -46 26 Z" fill="#3F2614" />
      <path d="M 46 26 L 50 32 L 54 26 Z" fill="#3F2614" />

      {/* JARS — varied sizes/colors, lined up on the shelf */}
      {/* tall amber jar */}
      <g transform="translate(-44, 6)">
        <ellipse cx={0} cy={14} rx={6.5} ry={1.6} fill="#000" opacity={0.32} />
        <path d="M -6 12 L -6 -2 C -6 -4, 6 -4, 6 -2 L 6 12 Z"
              fill="#A0563B" stroke="#5A3B1F" strokeWidth={1.0} strokeLinejoin="round" />
        <ellipse cx={0} cy={-2} rx={6} ry={1.6} fill="#C97551" stroke="#5A3B1F" strokeWidth={0.9} />
        {/* cork lid */}
        <rect x={-4} y={-7} width={8} height={4} fill="#C9A66A" stroke="#5A3B1F" strokeWidth={0.7} />
        <ellipse cx={0} cy={-7} rx={4} ry={1.2} fill="#D8B687" />
        {/* little label */}
        <rect x={-4} y={2} width={8} height={6} fill="#FFFAF2" stroke="#5A3B1F" strokeWidth={0.5} />
        <line x1={-3} y1={4} x2={3} y2={4} stroke="#5A3B1F" strokeWidth={0.4} />
        <line x1={-3} y1={6} x2={3} y2={6} stroke="#5A3B1F" strokeWidth={0.4} />
      </g>
      {/* short blue jar */}
      <g transform="translate(-26, 8)">
        <ellipse cx={0} cy={12} rx={5.5} ry={1.4} fill="#000" opacity={0.30} />
        <path d="M -5 10 L -5 0 C -5 -2, 5 -2, 5 0 L 5 10 Z"
              fill="#7FA9B0" stroke="#3F5260" strokeWidth={1.0} strokeLinejoin="round" />
        <ellipse cx={0} cy={0} rx={5} ry={1.4} fill="#A8CDD2" stroke="#3F5260" strokeWidth={0.9} />
        {/* lid */}
        <ellipse cx={0} cy={-2} rx={5.5} ry={1.6} fill="#5A3B1F" stroke="#3F2614" strokeWidth={0.7} />
      </g>
      {/* round green jar */}
      <g transform="translate(-8, 6)">
        <ellipse cx={0} cy={14} rx={7} ry={1.6} fill="#000" opacity={0.32} />
        <ellipse cx={0} cy={6} rx={7} ry={8} fill="#5C7E4F" stroke="#3D5C32" strokeWidth={1.0} />
        <ellipse cx={-2} cy={2} rx={4} ry={3} fill="#7BA46F" opacity={0.6} />
        {/* cork lid */}
        <rect x={-4} y={-3} width={8} height={3} fill="#C9A66A" stroke="#5A3B1F" strokeWidth={0.7} />
        <ellipse cx={0} cy={-3} rx={4} ry={1} fill="#D8B687" />
      </g>
      {/* small clay pot */}
      <g transform="translate(10, 9)">
        <ellipse cx={0} cy={11} rx={5} ry={1.4} fill="#000" opacity={0.30} />
        <path d="M -4 9 L -5 -1 L 5 -1 L 4 9 Z"
              fill="#A0563B" stroke="#5A3B1F" strokeWidth={1.0} strokeLinejoin="round" />
        <ellipse cx={0} cy={-1} rx={5} ry={1.4} fill="#C97551" stroke="#5A3B1F" strokeWidth={0.9} />
      </g>
      {/* tall purple bottle */}
      <g transform="translate(28, 4)">
        <ellipse cx={0} cy={16} rx={5} ry={1.4} fill="#000" opacity={0.30} />
        <path d="M -3 14 L -3 -2 C -3 -4, 3 -4, 3 -2 L 3 14
                 C 3 15, -3 15, -3 14 Z"
              fill="#A675B0" stroke="#6B3F7A" strokeWidth={1.0} strokeLinejoin="round" />
        <rect x={-1.5} y={-7} width={3} height={5} fill="#A675B0" stroke="#6B3F7A" strokeWidth={0.7} />
        {/* tiny cork */}
        <rect x={-1.5} y={-9} width={3} height={2} fill="#C9A66A" />
      </g>
      {/* stack of small books */}
      <g transform="translate(46, 10)">
        <rect x={-7} y={4} width={14} height={3} fill="#5C7E4F" stroke="#3D5C32" strokeWidth={0.7} />
        <rect x={-6} y={1} width={12} height={3} fill="#A0563B" stroke="#5A3B1F" strokeWidth={0.7} />
        <rect x={-5} y={-2} width={10} height={3} fill="#7FA9B0" stroke="#3F5260" strokeWidth={0.7} />
      </g>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// HangingHerbs — bundled dried herbs hung from a beam by string.
// ─────────────────────────────────────────────────────────────────────────
function HangingHerbs({ x, y, color = '#7BA46F' }: { x: number; y: number; color?: string }) {
  return (
    <g transform={`translate(${x}, ${y})`} pointerEvents="none">
      {/* string from the ceiling beam */}
      <line x1={0} y1={0} x2={0} y2={6} stroke="#5A3B1F" strokeWidth={0.7} />
      {/* tied knot */}
      <ellipse cx={0} cy={6} rx={2.5} ry={1} fill="#5A3B1F" />
      <line x1={-2} y1={6} x2={-2} y2={4} stroke="#5A3B1F" strokeWidth={0.5} />
      {/* bunch — drooping leaves */}
      <path d="M -8 6 L -10 22 M -4 6 L -5 28 M 0 8 L 1 30 M 4 6 L 5 28 M 8 6 L 10 22"
            stroke={color} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      {/* leaf clusters at the end of each strand */}
      <ellipse cx={-10} cy={22} rx={2.4} ry={4} fill={color} stroke="#3D5C32" strokeWidth={0.5} transform="rotate(-15 -10 22)" />
      <ellipse cx={-5} cy={28} rx={2.6} ry={4.5} fill={color} stroke="#3D5C32" strokeWidth={0.5} transform="rotate(-8 -5 28)" />
      <ellipse cx={1}  cy={30} rx={2.8} ry={5}   fill={color} stroke="#3D5C32" strokeWidth={0.5} />
      <ellipse cx={5}  cy={28} rx={2.6} ry={4.5} fill={color} stroke="#3D5C32" strokeWidth={0.5} transform="rotate(8 5 28)" />
      <ellipse cx={10} cy={22} rx={2.4} ry={4}   fill={color} stroke="#3D5C32" strokeWidth={0.5} transform="rotate(15 10 22)" />
      {/* twine wrap at the top */}
      <path d="M -6 8 Q 0 10 6 8" stroke="#C9A66A" strokeWidth={0.8} fill="none" strokeLinecap="round" />
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// HangingRoot — twisted root from the ceiling
// ─────────────────────────────────────────────────────────────────────────
function HangingRoot({ x, length = 100 }: { x: number; length?: number }) {
  const tipX = x + (x % 2 === 0 ? -4 : 6);
  return (
    <g pointerEvents="none">
      <path
        d={`M ${x} 90
            C ${x + 2} ${90 + length * 0.3}, ${x - 4} ${90 + length * 0.6}, ${tipX} ${90 + length}`}
        stroke="#5A3B1F" strokeWidth={3.0} fill="none" strokeLinecap="round"
      />
      <path
        d={`M ${x} 90
            C ${x + 2} ${90 + length * 0.3}, ${x - 4} ${90 + length * 0.6}, ${tipX} ${90 + length}`}
        stroke="#7B4F2C" strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.7}
      />
      <ellipse cx={x - 1} cy={94 + length * 0.15} rx={3.5} ry={1.0} fill="#7BA46F" opacity={0.65} />
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SideTable + Teacup — small wooden table beside the bunny with a
// steaming teacup. Reads as "this is someone's parlor".
// ─────────────────────────────────────────────────────────────────────────
function SideTableWithTea({ x, y, reducedMotion }: { x: number; y: number; reducedMotion: boolean }) {
  return (
    <g transform={`translate(${x}, ${y})`} pointerEvents="none">
      {/* shadow */}
      <ellipse cx={0} cy={36} rx={22} ry={3} fill="#000" opacity={0.30} />
      {/* central pedestal leg — turned wood */}
      <path d="M -3 32 L -3 8 C -3 4, 3 4, 3 8 L 3 32 Z"
            fill="#7B4F2C" stroke="#3F2614" strokeWidth={1.0} strokeLinejoin="round" />
      {/* turning rings on the leg */}
      <ellipse cx={0} cy={14} rx={3.5} ry={1.0} fill="#5A3B1F" />
      <ellipse cx={0} cy={20} rx={4} ry={1.2} fill="#5A3B1F" />
      <ellipse cx={0} cy={28} rx={4.5} ry={1.4} fill="#5A3B1F" />
      {/* foot — wider base */}
      <ellipse cx={0} cy={32} rx={9} ry={2} fill="#5A3B1F" stroke="#3F2614" strokeWidth={0.9} />
      {/* tabletop */}
      <ellipse cx={0} cy={4} rx={16} ry={4} fill="#1A0F08" opacity={0.45} />
      <ellipse cx={0} cy={2} rx={16} ry={4.5} fill="#A0703F" stroke="#3F2614" strokeWidth={1.2} />
      <ellipse cx={-2} cy={0.5} rx={11} ry={2.4} fill="#C39061" opacity={0.7} />

      {/* TEACUP on the table */}
      {/* saucer */}
      <ellipse cx={0} cy={-2} rx={10} ry={2.4} fill="#FFFAF2" stroke="#5A3B1F" strokeWidth={0.9} />
      <ellipse cx={0} cy={-2.6} rx={8} ry={1.6} fill="#FFE89A" opacity={0.4} />
      {/* cup */}
      <path d="M -6 -4 L -6 -10 C -6 -12, 6 -12, 6 -10 L 6 -4 Z"
            fill="#FFFAF2" stroke="#5A3B1F" strokeWidth={1.0} strokeLinejoin="round" />
      <ellipse cx={0} cy={-10} rx={6} ry={1.6} fill="#7B4F2C" />
      <ellipse cx={0} cy={-10.5} rx={5} ry={1.2} fill="#A0703F" />
      {/* handle */}
      <path d="M 6 -8 Q 11 -8 11 -10 Q 11 -12 6 -10"
            stroke="#5A3B1F" strokeWidth={1.0} fill="none" strokeLinecap="round" />
      {/* tiny floral motif on the cup */}
      <circle cx={-2} cy={-7} r={0.7} fill="#C8412B" />
      <circle cx={2}  cy={-7} r={0.7} fill="#C8412B" />
      <circle cx={0}  cy={-6} r={0.7} fill="#FFD166" />

      {/* STEAM rising from the cup — three soft wisps */}
      {!reducedMotion ? (
        <>
          <motion.path
            d="M -3 -12 C -5 -16, -3 -20, -2 -24"
            stroke="#FFFAF2" strokeWidth={1.0} fill="none" strokeLinecap="round"
            animate={{ opacity: [0.2, 0.7, 0.2], y: [0, -3, -6] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.path
            d="M 0 -12 C 2 -16, 0 -20, 1 -24"
            stroke="#FFFAF2" strokeWidth={1.0} fill="none" strokeLinecap="round"
            animate={{ opacity: [0.2, 0.7, 0.2], y: [0, -3, -6] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          />
          <motion.path
            d="M 3 -12 C 5 -16, 3 -20, 4 -24"
            stroke="#FFFAF2" strokeWidth={1.0} fill="none" strokeLinecap="round"
            animate={{ opacity: [0.2, 0.6, 0.2], y: [0, -3, -6] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
          />
        </>
      ) : (
        <path d="M -2 -12 C 0 -16, -2 -20, -1 -24" stroke="#FFFAF2" strokeWidth={1.0} fill="none" strokeLinecap="round" opacity={0.5} />
      )}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────

export default function BunnyBurrowInterior({
  learnerId, themedSkillCode, themedStructureLabel, themedStructureEmoji,
  discoveredSpecies, undiscoveredCount,
}: BunnyBurrowInteriorProps) {
  const router = useRouter();
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
  const [starting, setStarting] = useState(false);

  const startSkill = async () => {
    if (starting) return;
    setStarting(true);
    const res = await fetch('/api/session/start', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ learnerId, skillCode: themedSkillCode }),
    });
    const { sessionId } = await res.json();
    router.push(`/lesson/${sessionId}`);
  };

  return (
    <HabitatInteriorLayout learnerId={learnerId} title="Bunny Burrow" iconEmoji="🐰">
      <svg
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'manipulation' }}
      >
        <defs>
          <radialGradient id="bbGlow" cx="50%" cy="50%" r="65%">
            <stop offset="0%"  stopColor="#FFE8B8" />
            <stop offset="22%" stopColor="#F5CB88" />
            <stop offset="55%" stopColor="#C49566" />
            <stop offset="85%" stopColor="#6B4423" />
            <stop offset="100%" stopColor="#3F2614" />
          </radialGradient>
          <linearGradient id="bbFloor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7A4F2C" stopOpacity={0} />
            <stop offset="60%" stopColor="#5A3820" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#3A2510" stopOpacity={0.95} />
          </linearGradient>
          {/* SOIL TEXTURE pattern — tiny earth specks */}
          <pattern id="bbSoil" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <rect width="30" height="30" fill="transparent" />
            <circle cx="6" cy="8" r="0.6" fill="#3F2614" opacity="0.6" />
            <circle cx="20" cy="14" r="0.5" fill="#5A3820" opacity="0.7" />
            <circle cx="12" cy="22" r="0.7" fill="#3F2614" opacity="0.5" />
          </pattern>
          {/* PLANK FLOOR pattern */}
          <pattern id="bbPlanks" x="0" y="0" width="120" height="20" patternUnits="userSpaceOnUse">
            <rect width="120" height="20" fill="#5A3B1F" />
            <line x1="0" y1="0" x2="120" y2="0" stroke="#3F2614" strokeWidth="1" />
            <line x1="0" y1="20" x2="120" y2="20" stroke="#3F2614" strokeWidth="1" />
            <line x1="0" y1="0" x2="0" y2="20" stroke="#3F2614" strokeWidth="0.8" />
            <line x1="60" y1="0" x2="60" y2="20" stroke="#3F2614" strokeWidth="0.6" />
            <line x1="120" y1="0" x2="120" y2="20" stroke="#3F2614" strokeWidth="0.8" />
            {/* wood grain */}
            <path d="M 4 4 Q 30 6 60 4 T 116 4" stroke="#7B4F2C" strokeWidth="0.5" fill="none" opacity="0.5" />
            <path d="M 4 14 Q 30 12 60 14 T 116 14" stroke="#7B4F2C" strokeWidth="0.5" fill="none" opacity="0.5" />
          </pattern>
        </defs>

        {/* base wash */}
        <rect width={1440} height={800} fill="url(#bbGlow)" />
        <rect width={1440} height={800} fill="url(#bbSoil)" opacity={0.4} />

        {/* TUNNEL ARCH at the top */}
        <path
          d="M 0 0 L 0 240
             Q 100 140 240 110
             Q 480 70 720 60
             Q 960 70 1200 110
             Q 1340 140 1440 240
             L 1440 0 Z"
          fill="#3A2510" opacity={0.94}
        />
        {/* lighter rim along the arch */}
        <path
          d="M 0 240
             Q 100 140 240 110
             Q 480 70 720 60
             Q 960 70 1200 110
             Q 1340 140 1440 240"
          stroke="#7A4F2C" strokeWidth={4} fill="none" opacity={0.7} strokeLinecap="round"
        />
        {/* root-tendril texture along the arch rim */}
        {[120, 280, 440, 600, 760, 920, 1080, 1240].map((rx, i) => (
          <path
            key={`rim-${i}`}
            d={`M ${rx} ${130 + (i % 2) * 8}
                Q ${rx + (i % 2 === 0 ? -4 : 4)} ${145 + (i % 2) * 6}
                  ${rx - 2} ${165 + (i % 2) * 4}`}
            stroke="#5A3820" strokeWidth={1.4} fill="none" strokeLinecap="round" opacity={0.7}
          />
        ))}

        {/* CEILING BEAM — runs across the top of the chamber, visible
            wood beam from which lantern + herbs hang */}
        <rect x={0} y={208} width={1440} height={14} fill="#5A3B1F" stroke="#3F2614" strokeWidth={1.2} />
        <line x1={0} y1={212} x2={1440} y2={212} stroke="#7B4F2C" strokeWidth={0.7} opacity={0.7} />
        <line x1={0} y1={218} x2={1440} y2={218} stroke="#7B4F2C" strokeWidth={0.7} opacity={0.7} />
        {/* end-grain notches every 240px */}
        {[0, 240, 480, 720, 960, 1200, 1440].map((bx, i) => (
          <rect key={`bn-${i}`} x={bx - 4} y={208} width={8} height={14} fill="#3F2614" opacity={0.7} />
        ))}

        {/* HANGING ROOTS — fewer than before, only above the ceiling beam */}
        <HangingRoot x={180} length={70} />
        <HangingRoot x={420} length={90} />
        <HangingRoot x={1020} length={80} />
        <HangingRoot x={1260} length={75} />

        {/* HANGING HERBS — bundles tied to the ceiling beam */}
        <HangingHerbs x={300} y={222} color="#7BA46F" />
        <HangingHerbs x={420} y={222} color="#A8341F" />
        <HangingHerbs x={1080} y={222} color="#A675B0" />
        <HangingHerbs x={1200} y={222} color="#7BA46F" />

        {/* HEARTH ALCOVE — back-center, the warm light source */}
        <HearthAlcove x={720} y={400} reducedMotion={reducedMotion} />

        {/* HANGING LANTERN — chain from the ceiling beam, hangs in
            front of the hearth as secondary light */}
        <g transform="translate(360, 222)">
          {/* chain — 6 oval links */}
          {[0, 14, 28, 42, 56, 70].map((cy, i) => (
            <ellipse key={`chl-${i}`} cx={0} cy={cy + 6} rx={3} ry={4.5}
                     fill="none" stroke={i % 2 === 0 ? '#5A3B1F' : '#7B4F2C'} strokeWidth={1.4} />
          ))}
          {/* lantern HOOD */}
          <path d="M -16 86 L 16 86 L 12 78 L -12 78 Z"
                fill="#5A3B1F" stroke="#1A1208" strokeWidth={1.4} strokeLinejoin="round" />
          {/* lantern body — cage */}
          <path
            d="M -14 86 L 14 86 L 16 118 L -16 118 Z"
            fill="#3F2614" stroke="#1A1208" strokeWidth={1.5} strokeLinejoin="round"
          />
          {/* glass + glow */}
          <rect x={-11} y={89} width={22} height={26} fill="#FFD06B" />
          {/* cage bars vertical */}
          <line x1={-7} y1={89} x2={-7} y2={115} stroke="#1A1208" strokeWidth={0.9} />
          <line x1={0}  y1={89} x2={0}  y2={115} stroke="#1A1208" strokeWidth={0.9} />
          <line x1={7}  y1={89} x2={7}  y2={115} stroke="#1A1208" strokeWidth={0.9} />
          {/* corner rivets */}
          <circle cx={-12} cy={91} r={1.0} fill="#5A3B1F" />
          <circle cx={12}  cy={91} r={1.0} fill="#5A3B1F" />
          <circle cx={-12} cy={113} r={1.0} fill="#5A3B1F" />
          <circle cx={12}  cy={113} r={1.0} fill="#5A3B1F" />
          {/* base */}
          <path d="M -16 118 L 16 118 L 14 124 L -14 124 Z"
                fill="#5A3B1F" stroke="#1A1208" strokeWidth={1.3} strokeLinejoin="round" />
          {/* flame */}
          {!reducedMotion ? (
            <motion.path
              d="M 0 110 C -3 106, -3 100, 0 96 C 3 100, 3 106, 0 110 Z"
              fill="#FFFAF2"
              animate={{ scaleY: [1, 1.15, 0.95, 1.10, 1], opacity: [0.85, 1, 0.9, 1, 0.85] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ originX: '0px', originY: '110px' }}
            />
          ) : (
            <path d="M 0 110 C -3 106, -3 100, 0 96 C 3 100, 3 106, 0 110 Z" fill="#FFFAF2" opacity={0.9} />
          )}
          <path d="M 0 109 C -2 106, -2 102, 0 100 C 2 102, 2 106, 0 109 Z" fill="#FFD06B" />
          {/* glow halo */}
          <ellipse cx={0} cy={104} rx={140} ry={90} fill="#FFD06B" opacity={0.16} />
        </g>

        {/* JAR SHELF — right wall, between hearth and door */}
        <JarShelf x={1080} y={420} />

        {/* WOODEN DOOR — left wall, leads deeper */}
        <g transform="translate(160, 480)" pointerEvents="none">
          <ellipse cx={2} cy={108} rx={36} ry={6} fill="#000" opacity={0.32} />
          {/* archway frame */}
          <path
            d="M -28 100 L -28 50
               C -28 28, -10 14, 0 14
               C 10 14, 28 28, 28 50
               L 28 100 Z"
            fill="#5A3B1F" stroke="#1A1208" strokeWidth={1.6} strokeLinejoin="round"
          />
          {/* door */}
          <path
            d="M -22 96 L -22 52
               C -22 34, -10 22, 0 22
               C 10 22, 22 34, 22 52
               L 22 96 Z"
            fill="#7B4F2C" stroke="#3F2614" strokeWidth={1.3} strokeLinejoin="round"
          />
          {/* plank lines */}
          <line x1={-10} y1={28} x2={-10} y2={94} stroke="#5A3B1F" strokeWidth={0.8} opacity={0.7} />
          <line x1={0}   y1={22} x2={0}   y2={94} stroke="#5A3B1F" strokeWidth={0.8} opacity={0.7} />
          <line x1={10}  y1={28} x2={10}  y2={94} stroke="#5A3B1F" strokeWidth={0.8} opacity={0.7} />
          {/* iron bands */}
          <rect x={-22} y={52} width={44} height={3} fill="#3F2614" />
          <rect x={-22} y={84} width={44} height={3} fill="#3F2614" />
          {/* door knob */}
          <circle cx={14} cy={70} r={2.8} fill="#FFD06B" stroke="#5A3B1F" strokeWidth={0.8} />
          <circle cx={13} cy={69} r={1} fill="#FFFFFF" opacity={0.65} />
          {/* keyhole glow */}
          <circle cx={14} cy={76} r={1.4} fill="#FFE89A" opacity={0.85} />
        </g>

        {/* PLANK FLOOR — wooden floorboards visible at the bottom */}
        <rect x={0} y={680} width={1440} height={120} fill="url(#bbPlanks)" opacity={0.85} />
        <rect x={0} y={620} width={1440} height={180} fill="url(#bbFloor)" />

        {/* WOVEN RUG — under the themed structure pedestal */}
        <g transform="translate(720, 690)" pointerEvents="none">
          <ellipse cx={2} cy={4} rx={140} ry={26} fill="#1A0F08" opacity={0.30} />
          <ellipse cx={0} cy={0} rx={142} ry={26}
                   fill="#A85940" stroke="#5A3B1F" strokeWidth={1.2} />
          <ellipse cx={0} cy={0} rx={120} ry={20} fill="none"
                   stroke="#FFD06B" strokeWidth={0.9} opacity={0.7} />
          <ellipse cx={0} cy={0} rx={92} ry={14} fill="none"
                   stroke="#5A3B1F" strokeWidth={0.7} opacity={0.7} />
          <ellipse cx={0} cy={0} rx={64} ry={9} fill="#7B4F2C" stroke="#5A3B1F" strokeWidth={0.7} />
          {/* tassels at the rug edge */}
          {[-138, -120, -100, -80, 80, 100, 120, 138].map((rx, i) => (
            <line key={`rt-${i}`} x1={rx} y1={20} x2={rx + (i % 2 === 0 ? -1 : 1)} y2={26}
                  stroke="#A85940" strokeWidth={0.8} strokeLinecap="round" />
          ))}
          {/* tiny diamond pattern around the inner ring */}
          {[-70, -35, 0, 35, 70].map((dx, i) => (
            <path key={`rd-${i}`} d={`M ${dx} -8 L ${dx + 4} -4 L ${dx} 0 L ${dx - 4} -4 Z`}
                  fill="#FFD06B" stroke="#5A3B1F" strokeWidth={0.5} opacity={0.85} />
          ))}
        </g>

        {/* THEMED SKILL STRUCTURE — sits on a root-knot pedestal in the
            center foreground, on top of the rug, lit by lantern + hearth */}
        <g
          transform="translate(720, 620)"
          style={{ cursor: 'pointer', touchAction: 'manipulation' }}
          onClick={startSkill}
        >
          <circle r={66} fill="transparent" />

          {/* PEDESTAL — gnarled root knot */}
          <g pointerEvents="none">
            <ellipse cx={0} cy={64} rx={62} ry={10} fill="#000" opacity={0.32} />
            <path
              d="M -54 60 C -60 48, -50 38, -34 36
                 C -10 32, 14 32, 38 36
                 C 54 38, 62 50, 56 60 Z"
              fill="#5A3B1F" stroke="#3F2614" strokeWidth={1.5} strokeLinejoin="round"
            />
            <ellipse cx={0} cy={48} rx={42} ry={6} fill="none"
                     stroke="#7B4F2C" strokeWidth={1.0} opacity={0.7} />
            <ellipse cx={0} cy={48} rx={32} ry={4.5} fill="none"
                     stroke="#7B4F2C" strokeWidth={0.8} opacity={0.65} />
            <ellipse cx={0} cy={48} rx={20} ry={3} fill="none"
                     stroke="#7B4F2C" strokeWidth={0.7} opacity={0.6} />
            <ellipse cx={2} cy={46} rx={6} ry={2} fill="#3F2614" opacity={0.6} />
            <ellipse cx={-50} cy={56} rx={8} ry={2.4} fill="#5C7E4F" opacity={0.7} />
            <ellipse cx={48}  cy={58} rx={6} ry={2}   fill="#5C7E4F" opacity={0.65} />
          </g>

          {/* glow halo */}
          <circle r={48} fill="#FFD93D" opacity={0.25} />
          <circle r={32} fill="#FFE89A" opacity={0.30} />

          {/* the structure emoji */}
          <text
            textAnchor="middle" fontSize={48} y={6}
            style={{ filter: 'drop-shadow(0 2px 4px rgba(107,68,35,0.6))' }}
          >
            {themedStructureEmoji}
          </text>

          {/* label pill */}
          <rect x={-72} y={72} width={144} height={20} rx={10}
                fill="rgba(255,250,242,0.96)" stroke="#E8A87C" strokeWidth={1.2} />
          <text x={0} y={86} textAnchor="middle" fontSize={11} fontWeight={700} fill="#6b4423">
            {themedStructureLabel}
          </text>
        </g>

        {/* THE BURROW BUNNY — sits in side profile, facing right toward
            the side table + teacup. The "resident". */}
        <g transform="translate(360, 660)">
          <CottontailBunny scale={1.6} reducedMotion={reducedMotion} />
        </g>

        {/* SIDE TABLE WITH TEACUP — beside the bunny */}
        <SideTableWithTea x={460} y={690} reducedMotion={reducedMotion} />

        {/* DISCOVERED SPECIES — bespoke small bunny SVG (NOT emoji)
            for the cottontail. They walk in profile along the floor
            with a gentle hop. */}
        {discoveredSpecies.map((sp, i) => {
          const x = 1120 + i * 110;
          const y = 690;
          // Special-case the cottontail: use the bespoke SVG bunny so
          // we don't render a "disembodied 🐰 emoji" in this scene.
          const isBunny = sp.code === 'cottontail';
          return (
            <motion.g
              key={sp.code}
              animate={reducedMotion ? {} : { y: [0, -6, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
            >
              {isBunny ? (
                <g transform={`translate(${x}, ${y})`}>
                  <CottontailBunny scale={0.8} reducedMotion={reducedMotion} />
                </g>
              ) : (
                <text
                  x={x} y={y} textAnchor="middle" fontSize={32}
                  style={{ filter: 'drop-shadow(0 1px 2px rgba(107,68,35,0.5))' }}
                >
                  {sp.emoji}
                </text>
              )}
              <rect x={x - 50} y={y + 22} width={100} height={16} rx={4}
                    fill="rgba(149, 184, 143, 0.9)" />
              <text x={x} y={y + 34} textAnchor="middle" fontSize={9} fontWeight={700} fill="#fffaf2">
                {sp.commonName}
              </text>
            </motion.g>
          );
        })}

        {/* UNDISCOVERED SLOTS — bespoke "burrow nook" niches dug into
            the back wall. Each is a dark rounded niche with a faint
            silhouette inside, suggesting "a future resident might
            settle here". NOT 🐰 emoji. */}
        {Array.from({ length: undiscoveredCount }).map((_, i) => {
          const x = 1120 + (discoveredSpecies.length + i) * 110;
          const y = 690;
          return (
            <g key={`undiscovered-${i}`} opacity={0.55}>
              {/* nook silhouette — a small archway carved into the wall */}
              <path
                d={`M ${x - 18} ${y + 10}
                    L ${x - 18} ${y - 6}
                    C ${x - 18} ${y - 18}, ${x - 6} ${y - 22}, ${x} ${y - 22}
                    C ${x + 6} ${y - 22}, ${x + 18} ${y - 18}, ${x + 18} ${y - 6}
                    L ${x + 18} ${y + 10} Z`}
                fill="#1A0F08" stroke="#3A2510" strokeWidth={1.3}
              />
              {/* faint ear-shapes inside hinting "something lives here" */}
              <ellipse cx={x - 4} cy={y - 8} rx={1.6} ry={4} fill="#5A3820" opacity={0.55} />
              <ellipse cx={x + 4} cy={y - 8} rx={1.6} ry={4} fill="#5A3820" opacity={0.55} />
              {/* question mark in the depths */}
              <text x={x} y={y - 2} textAnchor="middle" fontSize={12} fontStyle="italic"
                    fill="#7A6A52" opacity={0.85}>?</text>
              <rect x={x - 50} y={y + 22} width={100} height={16} rx={4}
                    fill="rgba(90,69,51,0.75)" stroke="#5A3820" strokeWidth={0.7} />
              <text x={x} y={y + 34} textAnchor="middle" fontSize={9} fontStyle="italic" fill="#C8BCAA">
                undiscovered
              </text>
            </g>
          );
        })}
      </svg>
    </HabitatInteriorLayout>
  );
}
