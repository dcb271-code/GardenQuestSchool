// app/(child)/garden/habitat/[code]/BunnyBurrowInterior.tsx
//
// Bunny Burrow interior — a COZY WARREN in the Brambly Hedge spirit.
// The room is a low earthen dome: strata bands and pebbles in the soil
// above, a canopy of thick outlined roots arching across the ceiling
// (one dips down as a root-chandelier holding the lantern). The
// furniture forms lived-in vignettes: a sleeping alcove with a
// patchwork quilt, a hearth with a fieldstone surround and mantel,
// a tea table with teapot + two cups, a jar shelf with framed bunny
// portraits, a basket of carrots, a book stack, and a braided rug
// under the Petal Counting pedestal. Carrot bundles and dried flowers
// hang from the roots.
//
// EVERY decorative element is a bespoke SVG path — no emoji (except
// the themed structure emoji, which is content, not decoration).

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { SpeciesData } from '@/lib/world/speciesCatalog';
import HabitatInteriorLayout from '@/components/child/garden/HabitatInteriorLayout';
import BunnyTeachModal from '@/components/child/garden/BunnyTeachModal';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';

interface BunnyBurrowInteriorProps {
  learnerId: string;
  themedSkillCode: string;
  themedStructureLabel: string;
  themedStructureEmoji: string;
  discoveredSpecies: SpeciesData[];
  undiscoveredCount: number;
  /** Learner's level (1–5) — windows which bunny lessons appear. */
  learnerLevel?: number;
}

// Shared ink + wood tones (match components/child/garden/illustrations.tsx)
const INK = '#3F2614';
const WOOD = '#7B4F2C';
const WOOD_DARK = '#5A3B1F';
const WOOD_HI = '#A0703F';
const CREAM = '#FFFDF2';

// ─────────────────────────────────────────────────────────────────────────
// CottontailBunny — front-facing, recognizable, Miyazaki-cute bunny.
// Designed FROM SCRATCH after multiple side-profile attempts read as
// "rolly-poly snails." Big round head, two distinct upright ears with
// pink interiors, two round black eyes with white catchlights, classic
// Y-shaped pink nose, pear-shaped body with cream belly, two tiny front
// paws, fluffy cottontail puff peeking from the side.
//
// Coordinate system: origin (0,0) at the bunny's geometric center.
// Total figure spans ~x: -17..18, y: -28..22 (35 wide × 50 tall) at
// scale 1.
//
// This same figure powers the resident bunny + species cards + the
// global CottontailRabbit illustration (kept in sync intentionally).
// ─────────────────────────────────────────────────────────────────────────
function CottontailBunny({
  scale = 1, reducedMotion,
}: { scale?: number; reducedMotion: boolean }) {
  const STROKE = '#5A3B1F';
  const FUR = '#A8825C';        // warm tan — friendlier than dull brown
  const FUR_HI = '#D4AB7E';     // light cream-tan highlight
  const BELLY = '#F4DFC0';      // pale cream belly + snout patch
  const TAIL = '#FFFDF2';       // cottontail white
  const PINK = '#F8B4B4';       // inner-ear soft pink
  const NOSE = '#E07A8F';       // deeper pink for nose + paw beans

  return (
    // NOTE: the static scale lives on a plain <g>. Putting it on the
    // motion.g's `transform` attribute breaks: framer-motion rewrites
    // that attribute once the y-bob starts, silently dropping the
    // scale (the "tiny bunny" bug in the previous version).
    <g transform={`scale(${scale})`}>
    <motion.g
      animate={reducedMotion ? undefined : { y: [0, -1.2, 0] }}
      transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* ── ground shadow ───────────────────────────────────────── */}
      <ellipse cx={0} cy={22} rx={18} ry={2.8} fill="#000" opacity={0.22} />

      {/* ── EARS (back layer so head covers their roots) ────────── */}
      {/* outer ear shapes — long ovals with slight V-spread */}
      <ellipse cx={-7} cy={-21} rx={3.6} ry={11} fill={FUR}
               stroke={STROKE} strokeWidth={1.6}
               transform="rotate(-7 -7 -21)" />
      <ellipse cx={7}  cy={-21} rx={3.6} ry={11} fill={FUR}
               stroke={STROKE} strokeWidth={1.6}
               transform="rotate(7 7 -21)" />
      {/* inner-ear pink centers */}
      <ellipse cx={-7} cy={-20} rx={1.6} ry={7.5} fill={PINK}
               transform="rotate(-7 -7 -20)" />
      <ellipse cx={7}  cy={-20} rx={1.6} ry={7.5} fill={PINK}
               transform="rotate(7 7 -20)" />

      {/* ── COTTONTAIL PUFF — peeking from behind right hip ───── */}
      <circle cx={16.5} cy={9} r={5.5} fill={TAIL}
              stroke={STROKE} strokeWidth={1.4} />
      <circle cx={15} cy={7.5} r={1.8} fill="#FFFFFF" opacity={0.75} />

      {/* ── BODY — pear-shape, wider at hips, narrower at chest ─ */}
      <path
        d="M -11 -2
           C -14 4, -15 12, -11 18
           C -6 22, 6 22, 11 18
           C 15 12, 14 4, 11 -2
           C 7 -5, -7 -5, -11 -2 Z"
        fill={FUR} stroke={STROKE} strokeWidth={2}
        strokeLinejoin="round"
      />
      {/* belly cream patch — soft oval up the front */}
      <ellipse cx={0} cy={11} rx={7} ry={7.5} fill={BELLY} opacity={0.95} />
      {/* fur highlight on the left flank — soft sweep */}
      <path
        d="M -9 2 C -11 7, -11 12, -8 17"
        stroke={FUR_HI} strokeWidth={2.5} fill="none"
        strokeLinecap="round" opacity={0.55}
      />

      {/* ── FRONT PAWS — two small bumps at the bottom front ──── */}
      <ellipse cx={-5} cy={20} rx={3.6} ry={2.6} fill={FUR}
               stroke={STROKE} strokeWidth={1.4} />
      <ellipse cx={5}  cy={20} rx={3.6} ry={2.6} fill={FUR}
               stroke={STROKE} strokeWidth={1.4} />
      {/* paw beans — tiny pink toe spots */}
      <circle cx={-5.5} cy={20.4} r={0.55} fill={NOSE} />
      <circle cx={-4}   cy={20.4} r={0.55} fill={NOSE} />
      <circle cx={4}    cy={20.4} r={0.55} fill={NOSE} />
      <circle cx={5.5}  cy={20.4} r={0.55} fill={NOSE} />

      {/* ── HEAD — large round, sits on top of body ───────────── */}
      <circle cx={0} cy={-7} r={11.5} fill={FUR}
              stroke={STROKE} strokeWidth={2} />
      {/* forehead highlight wash */}
      <ellipse cx={-3} cy={-12} rx={5.5} ry={3.2}
               fill={FUR_HI} opacity={0.55} />
      {/* lower-face snout patch (lighter) — frames the nose+mouth */}
      <ellipse cx={0} cy={-2} rx={5.5} ry={4.2}
               fill={BELLY} opacity={0.92} />

      {/* ── EYES — large round black with double catchlight ───── */}
      <circle cx={-5} cy={-8.5} r={2.4} fill="#1F1209" />
      <circle cx={5}  cy={-8.5} r={2.4} fill="#1F1209" />
      {/* main catchlight */}
      <circle cx={-4.1} cy={-9.4} r={0.95} fill="#FFFFFF" />
      <circle cx={5.9}  cy={-9.4} r={0.95} fill="#FFFFFF" />
      {/* lower sparkle */}
      <circle cx={-5.6} cy={-7.4} r={0.4} fill="#FFFFFF" opacity={0.75} />
      <circle cx={4.4}  cy={-7.4} r={0.4} fill="#FFFFFF" opacity={0.75} />

      {/* ── NOSE — rounded pink trapezoid (classic bunny shape) ── */}
      <path
        d="M -1.6 -3.2 Q 0 -3.6 1.6 -3.2 Q 1.2 -1.4 0 -0.8 Q -1.2 -1.4 -1.6 -3.2 Z"
        fill={NOSE} stroke={STROKE} strokeWidth={0.7} strokeLinejoin="round"
      />
      {/* mouth Y — short stem then two soft curves */}
      <path d="M 0 -0.8 L 0 0.6"
            stroke={STROKE} strokeWidth={0.7} strokeLinecap="round" />
      <path d="M 0 0.6 Q -1.6 1.7 -2.4 0.7"
            stroke={STROKE} strokeWidth={0.7} fill="none" strokeLinecap="round" />
      <path d="M 0 0.6 Q 1.6 1.7 2.4 0.7"
            stroke={STROKE} strokeWidth={0.7} fill="none" strokeLinecap="round" />

      {/* ── WHISKERS — three on each side, fanning slightly ───── */}
      <path d="M -3 -1.5 L -10 -2.5"
            stroke={STROKE} strokeWidth={0.5} strokeLinecap="round" opacity={0.7} />
      <path d="M -3 0    L -10 0"
            stroke={STROKE} strokeWidth={0.5} strokeLinecap="round" opacity={0.7} />
      <path d="M -3 1.5  L -10 2.5"
            stroke={STROKE} strokeWidth={0.5} strokeLinecap="round" opacity={0.7} />
      <path d="M 3 -1.5 L 10 -2.5"
            stroke={STROKE} strokeWidth={0.5} strokeLinecap="round" opacity={0.7} />
      <path d="M 3 0    L 10 0"
            stroke={STROKE} strokeWidth={0.5} strokeLinecap="round" opacity={0.7} />
      <path d="M 3 1.5  L 10 2.5"
            stroke={STROKE} strokeWidth={0.5} strokeLinecap="round" opacity={0.7} />

      {/* ── CHEEK BLUSH — soft pink rounds under each eye ─────── */}
      <ellipse cx={-7} cy={-3.5} rx={2.2} ry={1.3} fill={NOSE} opacity={0.38} />
      <ellipse cx={7}  cy={-3.5} rx={2.2} ry={1.3} fill={NOSE} opacity={0.38} />
    </motion.g>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// CEILING ROOT CANOPY — thick outlined roots arching across the dome,
// tapering toward the center, with fine root hairs. One root dips down
// at center to hold the lantern (see RootChandelier).
// ─────────────────────────────────────────────────────────────────────────
const ROOT_SEGMENTS: { d: string; w: number }[] = [
  // left main root — thick at the wall, thinner toward center
  { d: 'M 20 560 C 110 385, 205 302, 345 262', w: 15 },
  { d: 'M 345 262 C 465 246, 592 240, 718 240', w: 9 },
  // right main root
  { d: 'M 1420 580 C 1330 395, 1240 308, 1100 266', w: 15 },
  { d: 'M 1100 266 C 980 248, 850 241, 722 240', w: 9 },
  // left secondary root — hugs the rim higher up
  { d: 'M 20 440 C 145 332, 245 282, 385 250', w: 9 },
  { d: 'M 385 250 C 500 228, 600 221, 690 218', w: 5.5 },
  // right secondary root
  { d: 'M 1420 460 C 1295 340, 1200 286, 1060 252', w: 9 },
  { d: 'M 1060 252 C 950 230, 852 223, 760 220', w: 5.5 },
];

const ROOT_HAIRS: { x: number; y: number; dx: number }[] = [
  { x: 175, y: 388, dx: 6 },  { x: 300, y: 292, dx: -5 },
  { x: 452, y: 253, dx: 5 },  { x: 590, y: 243, dx: -4 },
  { x: 250, y: 322, dx: 6 },  { x: 848, y: 244, dx: 4 },
  { x: 990, y: 266, dx: -5 }, { x: 1132, y: 312, dx: 5 },
  { x: 1258, y: 388, dx: -6 },{ x: 1180, y: 340, dx: 4 },
];

function CeilingCanopy() {
  return (
    <g pointerEvents="none">
      {ROOT_SEGMENTS.map((r, i) => (
        <g key={`root-${i}`}>
          <path d={r.d} stroke={INK} strokeWidth={r.w + 3.2}
                fill="none" strokeLinecap="round" />
          <path d={r.d} stroke={WOOD} strokeWidth={r.w}
                fill="none" strokeLinecap="round" />
          <path d={r.d} stroke={WOOD_HI} strokeWidth={r.w * 0.32}
                fill="none" strokeLinecap="round" opacity={0.55} />
        </g>
      ))}
      {/* fine root hairs trailing off the big roots */}
      {ROOT_HAIRS.map((h, i) => (
        <g key={`hair-${i}`}>
          <path d={`M ${h.x} ${h.y} q ${h.dx} 11 ${h.dx * 0.3} 24`}
                stroke={INK} strokeWidth={1.4} fill="none"
                strokeLinecap="round" opacity={0.8} />
          <path d={`M ${h.x + h.dx * 1.6} ${h.y - 4} q ${-h.dx * 0.6} 8 ${-h.dx * 0.2} 15`}
                stroke={INK} strokeWidth={1.0} fill="none"
                strokeLinecap="round" opacity={0.55} />
        </g>
      ))}
      {/* tiny root tips poking through the dome rim */}
      {[
        { x: 268, y: 292, dx: 5 }, { x: 520, y: 232, dx: -4 },
        { x: 930, y: 234, dx: 5 }, { x: 1178, y: 300, dx: -5 },
      ].map((t, i) => (
        <path key={`tip-${i}`}
              d={`M ${t.x} ${t.y} q ${t.dx} 8 ${t.dx * 0.4} 17`}
              stroke={WOOD_DARK} strokeWidth={2.2} fill="none"
              strokeLinecap="round" opacity={0.85} />
      ))}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// ROOT CHANDELIER — the central root dips down and grips the lantern.
// ─────────────────────────────────────────────────────────────────────────
function RootChandelier({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <g pointerEvents="none">
      {/* the dipping root */}
      <path d="M 716 242 C 727 254, 725 272, 722 300"
            stroke={INK} strokeWidth={9.5} fill="none" strokeLinecap="round" />
      <path d="M 716 242 C 727 254, 725 272, 722 300"
            stroke={WOOD} strokeWidth={6} fill="none" strokeLinecap="round" />
      {/* two rootlets gripping the lantern hood */}
      <path d="M 722 296 q -9 6 -12 13" stroke={INK} strokeWidth={2.6}
            fill="none" strokeLinecap="round" />
      <path d="M 722 296 q 9 6 12 13" stroke={INK} strokeWidth={2.6}
            fill="none" strokeLinecap="round" />

      <g transform="translate(721, 306) scale(1.25)">
        {/* glow halo — soft radial falloff */}
        <ellipse cx={0} cy={24} rx={185} ry={125} fill="url(#bbWarmGlow)" opacity={0.55} />
        {/* hood */}
        <path d="M -14 8 L 14 8 L 10 0 L -10 0 Z"
              fill={WOOD_DARK} stroke="#1A1208" strokeWidth={1.4} strokeLinejoin="round" />
        {/* body — cage */}
        <path d="M -12 8 L 12 8 L 14 40 L -14 40 Z"
              fill={INK} stroke="#1A1208" strokeWidth={1.5} strokeLinejoin="round" />
        {/* glass + glow */}
        <rect x={-9.5} y={10.5} width={19} height={26} fill="#FFD06B" />
        <line x1={-5.5} y1={10.5} x2={-5.5} y2={36.5} stroke="#1A1208" strokeWidth={0.9} />
        <line x1={0} y1={10.5} x2={0} y2={36.5} stroke="#1A1208" strokeWidth={0.9} />
        <line x1={5.5} y1={10.5} x2={5.5} y2={36.5} stroke="#1A1208" strokeWidth={0.9} />
        {/* base */}
        <path d="M -14 40 L 14 40 L 12 46 L -12 46 Z"
              fill={WOOD_DARK} stroke="#1A1208" strokeWidth={1.3} strokeLinejoin="round" />
        {/* flame */}
        {!reducedMotion ? (
          <motion.path
            d="M 0 33 C -3 29, -3 24, 0 20 C 3 24, 3 29, 0 33 Z"
            fill="#FFFAF2"
            animate={{ scaleY: [1, 1.15, 0.95, 1.1, 1], opacity: [0.85, 1, 0.9, 1, 0.85] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '0px', originY: '33px' }}
          />
        ) : (
          <path d="M 0 33 C -3 29, -3 24, 0 20 C 3 24, 3 29, 0 33 Z"
                fill="#FFFAF2" opacity={0.9} />
        )}
        <path d="M 0 32 C -2 29.5, -2 26, 0 24 C 2 26, 2 29.5, 0 32 Z" fill="#FFD06B" />
      </g>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// HANGING BUNDLES — carrots or dried flowers tied to the ceiling roots.
// ─────────────────────────────────────────────────────────────────────────
function CarrotBundle({ x, y, drop = 12 }: { x: number; y: number; drop?: number }) {
  return (
    <g transform={`translate(${x}, ${y})`} pointerEvents="none">
      {/* twine from the root */}
      <line x1={0} y1={0} x2={0} y2={drop} stroke="#C9A66A" strokeWidth={1.4} />
      <ellipse cx={0} cy={drop + 1} rx={4} ry={2} fill="#C9A66A" stroke={INK} strokeWidth={0.8} />
      {/* three carrots hanging tips-down, fanned */}
      {[-15, 0, 15].map((deg, i) => (
        <g key={i} transform={`translate(0, ${drop - 12}) rotate(${deg} 0 13)`}>
          {/* greens bunched under the tie */}
          <path d="M -3 15 q -3 7 -1 11 M 0 15 q 0 8 1 12 M 3 15 q 3 7 1 11"
                stroke="#6B8E5A" strokeWidth={1.6} fill="none" strokeLinecap="round" />
          {/* carrot body */}
          <path d="M -4.5 25 C -5 33, -2.5 43, 0 47 C 2.5 43, 5 33, 4.5 25
                   C 3 22.5, -3 22.5, -4.5 25 Z"
                fill="#E8873A" stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
          {/* ridge lines */}
          <path d="M -2.5 30 L 2.5 31 M -2 36 L 2 37" stroke={INK}
                strokeWidth={0.7} strokeLinecap="round" opacity={0.55} />
          <path d="M -2.5 27 C -3 33, -1.5 40, 0 44" stroke="#F5A85E"
                strokeWidth={1.4} fill="none" strokeLinecap="round" opacity={0.7} />
        </g>
      ))}
    </g>
  );
}

function DriedFlowerBundle({ x, y, tone = '#C38D9E' }: { x: number; y: number; tone?: string }) {
  return (
    <g transform={`translate(${x}, ${y})`} pointerEvents="none">
      <line x1={0} y1={0} x2={0} y2={10} stroke="#C9A66A" strokeWidth={1.2} />
      <ellipse cx={0} cy={11} rx={3.5} ry={1.8} fill="#C9A66A" stroke={INK} strokeWidth={0.8} />
      {/* stems fanning downward (hung upside-down to dry) */}
      {[-12, -5, 2, 9, 15].map((dx, i) => (
        <path key={`st-${i}`} d={`M 0 12 Q ${dx * 0.5} 24 ${dx} 38`}
              stroke="#8B6938" strokeWidth={1.2} fill="none" strokeLinecap="round" />
      ))}
      {/* blossom heads at the stem tips */}
      {[
        { dx: -12, c: tone }, { dx: -5, c: '#E8A87C' }, { dx: 2, c: tone },
        { dx: 9, c: '#FFD93D' }, { dx: 15, c: '#E8A87C' },
      ].map((b, i) => (
        <g key={`bl-${i}`} transform={`translate(${b.dx}, ${40 + (i % 2) * 3})`}>
          <circle r={4} fill={b.c} stroke={INK} strokeWidth={0.9} />
          <circle r={1.4} fill={INK} opacity={0.5} />
        </g>
      ))}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SLEEPING ALCOVE — a niche carved into the wall with a patchwork bed.
// Origin: center of the niche at floor level.
// ─────────────────────────────────────────────────────────────────────────
function BedAlcove({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`} pointerEvents="none">
      {/* carved niche — dark arch with double rim */}
      <path d="M -132 8 L -132 -62
               C -132 -152, -62 -188, 0 -188
               C 62 -188, 132 -152, 132 -62
               L 132 8 Z"
            fill="#2E1C0E" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
      <path d="M -120 6 L -120 -60
               C -120 -142, -56 -176, 0 -176
               C 56 -176, 120 -142, 120 -60
               L 120 6 Z"
            fill="#241407" opacity={0.85} />
      <path d="M -120 -60 C -120 -142, -56 -176, 0 -176 C 56 -176, 120 -142, 120 -60"
            stroke="#8B6938" strokeWidth={1.4} fill="none" opacity={0.5} />
      {/* warm candle-light wash inside */}
      <ellipse cx={0} cy={-58} rx={92} ry={62} fill="#8A5225" opacity={0.4} />
      <ellipse cx={0} cy={-42} rx={60} ry={38} fill="#C98B4B" opacity={0.25} />

      {/* bed frame — rail + legs */}
      <rect x={-104} y={-30} width={208} height={16} rx={4}
            fill={WOOD} stroke={INK} strokeWidth={1.6} />
      <line x1={-96} y1={-22} x2={96} y2={-22} stroke={WOOD_HI} strokeWidth={1} opacity={0.6} />
      <rect x={-98} y={-14} width={12} height={16} rx={2} fill={WOOD_DARK} stroke={INK} strokeWidth={1.3} />
      <rect x={86} y={-14} width={12} height={16} rx={2} fill={WOOD_DARK} stroke={INK} strokeWidth={1.3} />
      {/* headboard on the left */}
      <path d="M -116 0 L -116 -92 C -116 -104, -96 -104, -96 -92 L -96 -26 L -116 -26 Z"
            fill={WOOD} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <line x1={-110} y1={-88} x2={-110} y2={-30} stroke={WOOD_DARK} strokeWidth={1} opacity={0.6} />

      {/* mattress */}
      <rect x={-100} y={-52} width={200} height={26} rx={10}
            fill="#F5EBDC" stroke={INK} strokeWidth={1.5} />
      {/* pillow */}
      <ellipse cx={-70} cy={-56} rx={27} ry={13} fill={CREAM} stroke={INK} strokeWidth={1.4} />
      <path d="M -88 -58 Q -70 -64 -52 -58" stroke={INK} strokeWidth={0.8}
            fill="none" opacity={0.4} />

      {/* PATCHWORK QUILT — draped over the right two-thirds */}
      <path d="M -34 -56
               C -20 -60, 88 -60, 100 -54
               L 104 -30 L 104 -6 L 88 -6 L 88 -26 L -34 -26 Z"
            fill="#C38D9E" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      {/* patches — sage + ochre squares */}
      <rect x={-26} y={-52} width={30} height={24} fill="#95B88F" opacity={0.95} />
      <rect x={36} y={-52} width={30} height={24} fill="#E8C493" opacity={0.95} />
      <rect x={5} y={-52} width={30} height={11} fill="#E8C493" opacity={0.9} />
      <rect x={66} y={-40} width={30} height={12} fill="#95B88F" opacity={0.9} />
      <rect x={88} y={-26} width={16} height={20} fill="#95B88F" opacity={0.9} />
      {/* stitch dashes along patch seams + border */}
      <path d="M -26 -40 L 96 -40 M 5 -52 L 5 -28 M 36 -52 L 36 -28 M 66 -52 L 66 -28"
            stroke={CREAM} strokeWidth={0.9} strokeDasharray="3 3" opacity={0.85} fill="none" />
      <path d="M -32 -29 C -18 -33, 84 -33, 98 -29"
            stroke={CREAM} strokeWidth={0.9} strokeDasharray="3 3" opacity={0.85} fill="none" />
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// HEARTH — fieldstone surround, arched firebox with layered flames,
// mantel shelf with plant + clock, glow pool on the floor in front.
// Origin: floor center of the firebox.
// ─────────────────────────────────────────────────────────────────────────
const HEARTH_STONES: { x: number; y: number; rx: number; ry: number; t: 0 | 1 | 2 }[] = [
  { x: -80, y: -8,   rx: 20, ry: 15, t: 0 },
  { x: -86, y: -46,  rx: 17, ry: 14, t: 1 },
  { x: -76, y: -84,  rx: 18, ry: 13, t: 2 },
  { x: -52, y: -114, rx: 17, ry: 13, t: 0 },
  { x: -20, y: -132, rx: 18, ry: 12, t: 1 },
  { x: 16,  y: -133, rx: 17, ry: 12, t: 2 },
  { x: 50,  y: -116, rx: 17, ry: 13, t: 1 },
  { x: 76,  y: -86,  rx: 18, ry: 14, t: 0 },
  { x: 86,  y: -46,  rx: 17, ry: 14, t: 2 },
  { x: 80,  y: -8,   rx: 20, ry: 15, t: 1 },
];
const STONE_FILLS = ['#A08B6C', '#8A755C', '#97826A'] as const;

function Hearth({ x, y, reducedMotion }: { x: number; y: number; reducedMotion: boolean }) {
  return (
    <g transform={`translate(${x}, ${y})`} pointerEvents="none">
      {/* glow pool on the floor in front */}
      <ellipse cx={0} cy={34} rx={185} ry={40} fill="#FFD06B" opacity={0.20} />
      <ellipse cx={0} cy={30} rx={115} ry={26} fill="#FFE89A" opacity={0.26} />

      {/* soot-darkened wall behind the surround */}
      <ellipse cx={0} cy={-80} rx={110} ry={90} fill="#241407" opacity={0.35} />

      {/* FIREBOX — arched opening */}
      <path d="M -58 4 L -58 -66
               C -58 -108, -30 -126, 0 -126
               C 30 -126, 58 -108, 58 -66
               L 58 4 Z"
            fill="#1F1108" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      {/* warm inner glow of the box */}
      <ellipse cx={0} cy={-38} rx={44} ry={44} fill="#7A3A18" opacity={0.55} />
      <ellipse cx={0} cy={-24} rx={34} ry={24} fill="#B85C22" opacity={0.4} />

      {/* logs */}
      <g>
        <rect x={-30} y={-16} width={60} height={9} rx={4.5}
              fill={WOOD_DARK} stroke="#1A0F08" strokeWidth={1.2}
              transform="rotate(-7 0 -12)" />
        <rect x={-28} y={-12} width={56} height={9} rx={4.5}
              fill={WOOD} stroke="#1A0F08" strokeWidth={1.2}
              transform="rotate(6 0 -8)" />
        <circle cx={26} cy={-6} r={3.2} fill="#C9A66A" stroke="#1A0F08" strokeWidth={0.8} />
      </g>

      {/* FLAMES — layered: gold outer, cream inner */}
      {!reducedMotion ? (
        <>
          <motion.path
            d="M 0 -14 C -18 -26, -16 -48, -6 -60 C -4 -50, 2 -48, 2 -58
               C 12 -48, 16 -30, 0 -14 Z"
            fill="#FFB84D"
            animate={{ scaleY: [1, 1.14, 0.94, 1.08, 1], scaleX: [1, 0.96, 1.04, 0.98, 1] }}
            transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '0px', originY: '-14px' }}
          />
          <motion.path
            d="M 0 -15 C -10 -24, -9 -38, -2 -47 C 0 -40, 4 -39, 4 -45
               C 9 -37, 9 -24, 0 -15 Z"
            fill="#FFD06B"
            animate={{ scaleY: [1, 1.1, 0.92, 1.16, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            style={{ originX: '0px', originY: '-15px' }}
          />
          <motion.path
            d="M 0 -16 C -5 -21, -4 -30, 0 -35 C 4 -30, 5 -21, 0 -16 Z"
            fill="#FFF3D6"
            animate={{ scaleY: [1, 1.2, 0.9, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
            style={{ originX: '0px', originY: '-16px' }}
          />
        </>
      ) : (
        <>
          <path d="M 0 -14 C -18 -26, -16 -48, -6 -60 C -4 -50, 2 -48, 2 -58
                   C 12 -48, 16 -30, 0 -14 Z" fill="#FFB84D" />
          <path d="M 0 -15 C -10 -24, -9 -38, -2 -47 C 0 -40, 4 -39, 4 -45
                   C 9 -37, 9 -24, 0 -15 Z" fill="#FFD06B" />
          <path d="M 0 -16 C -5 -21, -4 -30, 0 -35 C 4 -30, 5 -21, 0 -16 Z" fill="#FFF3D6" />
        </>
      )}
      {/* embers */}
      <circle cx={-16} cy={-6} r={1.8} fill="#FFD06B" opacity={0.95} />
      <circle cx={8} cy={-4} r={1.5} fill="#FF9152" opacity={0.9} />
      <circle cx={18} cy={-8} r={1.3} fill="#FFD06B" opacity={0.85} />

      {/* FIELDSTONE SURROUND — chunky varied stones ringing the box */}
      {HEARTH_STONES.map((s, i) => (
        <g key={`fs-${i}`}>
          <ellipse cx={s.x + 1.5} cy={s.y + 2} rx={s.rx} ry={s.ry}
                   fill="#1A0F08" opacity={0.35} />
          <ellipse cx={s.x} cy={s.y} rx={s.rx} ry={s.ry}
                   fill={STONE_FILLS[s.t]} stroke={INK} strokeWidth={1.6} />
          <ellipse cx={s.x - s.rx * 0.28} cy={s.y - s.ry * 0.3}
                   rx={s.rx * 0.42} ry={s.ry * 0.3} fill="#C2B096" opacity={0.55} />
        </g>
      ))}

      {/* hearthstone slab */}
      <rect x={-96} y={2} width={192} height={13} rx={6}
            fill="#8A755C" stroke={INK} strokeWidth={1.6} />
      <line x1={-84} y1={6} x2={84} y2={6} stroke="#C2B096" strokeWidth={1} opacity={0.5} />

      {/* MANTEL SHELF */}
      <rect x={-108} y={-152} width={216} height={13} rx={3}
            fill={WOOD} stroke={INK} strokeWidth={1.8} />
      <line x1={-100} y1={-146} x2={100} y2={-146} stroke={WOOD_HI} strokeWidth={1} opacity={0.6} />
      <path d="M -96 -139 L -88 -128 L -80 -139 Z" fill={WOOD_DARK} stroke={INK} strokeWidth={1} />
      <path d="M 80 -139 L 88 -128 L 96 -139 Z" fill={WOOD_DARK} stroke={INK} strokeWidth={1} />

      {/* mantel: potted plant */}
      <g transform="translate(-62, -152)">
        <path d="M -9 0 L -11 -14 L 11 -14 L 9 0 Z"
              fill="#A0563B" stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
        <rect x={-12} y={-18} width={24} height={5} rx={2}
              fill="#C97551" stroke={INK} strokeWidth={1.1} />
        <path d="M 0 -18 Q -8 -30 -4 -38 M 0 -18 Q 1 -32 6 -38 M 0 -18 Q 8 -26 11 -30"
              stroke="#6B8E5A" strokeWidth={2} fill="none" strokeLinecap="round" />
        <ellipse cx={-4} cy={-38} rx={3.4} ry={5} fill="#7BA46F" stroke="#3D5C32" strokeWidth={0.8}
                 transform="rotate(-16 -4 -38)" />
        <ellipse cx={6} cy={-38} rx={3.2} ry={4.6} fill="#95B88F" stroke="#3D5C32" strokeWidth={0.8}
                 transform="rotate(10 6 -38)" />
        <ellipse cx={11} cy={-30} rx={2.8} ry={4} fill="#7BA46F" stroke="#3D5C32" strokeWidth={0.8}
                 transform="rotate(35 11 -30)" />
      </g>
      {/* mantel: little round clock */}
      <g transform="translate(56, -170)">
        <rect x={-4} y={12} width={8} height={6} fill={WOOD_DARK} stroke={INK} strokeWidth={1} />
        <circle r={14} fill="#C9A66A" stroke={INK} strokeWidth={1.6} />
        <circle r={10} fill="#F5EBDC" stroke={INK} strokeWidth={1} />
        <circle cx={0} cy={-16} r={2.4} fill="#C9A66A" stroke={INK} strokeWidth={1} />
        <line x1={0} y1={0} x2={0} y2={-6.5} stroke={INK} strokeWidth={1.4} strokeLinecap="round" />
        <line x1={0} y1={0} x2={4.5} y2={2.5} stroke={INK} strokeWidth={1.2} strokeLinecap="round" />
        <circle r={1.2} fill={INK} />
      </g>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JAR SHELF — wooden shelf with ceramic jars (kept from previous pass).
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
// FRAMED PORTRAIT — oval frame with a bunny silhouette, hung on a nail.
// ─────────────────────────────────────────────────────────────────────────
function FramedPortrait({ x, y, s = 1, frame = '#C9A66A' }: {
  x: number; y: number; s?: number; frame?: string;
}) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`} pointerEvents="none">
      {/* nail + string */}
      <circle cx={0} cy={-34} r={1.8} fill={WOOD_DARK} stroke={INK} strokeWidth={0.8} />
      <path d="M 0 -34 L -13 -22 M 0 -34 L 13 -22" stroke={INK} strokeWidth={0.9} opacity={0.8} />
      {/* frame */}
      <ellipse cx={1.5} cy={2} rx={20} ry={26} fill="#1A0F08" opacity={0.35} />
      <ellipse cx={0} cy={0} rx={20} ry={26} fill={frame} stroke={INK} strokeWidth={1.8} />
      <ellipse cx={0} cy={0} rx={14.5} ry={20} fill="#F5EBDC" stroke={INK} strokeWidth={1} />
      {/* bunny silhouette — head + ears in profile-ish bust */}
      <ellipse cx={-3} cy={-8} rx={3} ry={8.5} fill="#6B4423" transform="rotate(-10 -3 -8)" />
      <ellipse cx={4} cy={-8} rx={3} ry={8.5} fill="#6B4423" transform="rotate(9 4 -8)" />
      <circle cx={0} cy={2} r={8} fill="#6B4423" />
      <path d="M -9 14 Q 0 8 9 14 L 9 16 Q 0 12 -9 16 Z" fill="#6B4423" />
      {/* glass glint */}
      <path d="M -8 -12 Q -3 -16 3 -14" stroke="#FFFFFF" strokeWidth={1.4}
            fill="none" strokeLinecap="round" opacity={0.45} />
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// TEA TABLE — round wooden table with a sage teapot and two cups.
// Origin: floor contact point under the table's center.
// ─────────────────────────────────────────────────────────────────────────
function TeaTable({ x, y, reducedMotion }: { x: number; y: number; reducedMotion: boolean }) {
  return (
    <g transform={`translate(${x}, ${y})`} pointerEvents="none">
      <ellipse cx={0} cy={3} rx={52} ry={8} fill="#000" opacity={0.25} />
      {/* legs — splayed */}
      <path d="M -32 -50 L -42 0" stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <path d="M -32 -50 L -42 0" stroke={WOOD} strokeWidth={4} strokeLinecap="round" />
      <path d="M 32 -50 L 42 0" stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <path d="M 32 -50 L 42 0" stroke={WOOD} strokeWidth={4} strokeLinecap="round" />
      <path d="M 0 -52 L 0 -6" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      <path d="M 0 -52 L 0 -6" stroke={WOOD_DARK} strokeWidth={3.4} strokeLinecap="round" />
      {/* tabletop — thick disk */}
      <ellipse cx={0} cy={-54} rx={54} ry={15} fill={WOOD} stroke={INK} strokeWidth={1.8} />
      <ellipse cx={0} cy={-58} rx={52} ry={13} fill={WOOD_HI} stroke={INK} strokeWidth={1.4} />
      <ellipse cx={-10} cy={-60} rx={28} ry={6} fill="#C39061" opacity={0.6} />

      {/* TEAPOT — plump sage pot with spout + handle */}
      <g transform="translate(-16, -66)">
        <ellipse cx={0} cy={6} rx={15} ry={3} fill="#000" opacity={0.2} />
        <ellipse cx={0} cy={-4} rx={14.5} ry={11.5} fill="#95B88F" stroke={INK} strokeWidth={1.6} />
        {/* spout */}
        <path d="M 13 -7 C 19 -9, 22 -13, 22 -17 L 25 -15 C 25 -10, 21 -5, 14 -3 Z"
              fill="#95B88F" stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
        {/* handle */}
        <path d="M -13 -9 C -21 -11, -22 -1, -14 1"
              stroke={INK} strokeWidth={3.6} fill="none" strokeLinecap="round" />
        <path d="M -13 -9 C -21 -11, -22 -1, -14 1"
              stroke="#95B88F" strokeWidth={1.8} fill="none" strokeLinecap="round" />
        {/* lid */}
        <ellipse cx={0} cy={-14} rx={7.5} ry={2.6} fill="#7BA46F" stroke={INK} strokeWidth={1.2} />
        <circle cx={0} cy={-17.5} r={2.4} fill="#E8C493" stroke={INK} strokeWidth={1.1} />
        {/* belly highlight + little flower motif */}
        <ellipse cx={-5} cy={-8} rx={5} ry={3.4} fill="#B8D4A8" opacity={0.7} />
        <circle cx={3} cy={-3} r={1.1} fill="#C38D9E" />
        <circle cx={5.5} cy={-4.5} r={1.1} fill="#C38D9E" />
        <circle cx={4.5} cy={-1.5} r={0.8} fill="#FFD93D" />
        {/* steam from the spout */}
        {!reducedMotion ? (
          <motion.path
            d="M 24 -19 C 22 -25, 26 -30, 24 -37"
            stroke="#FFFAF2" strokeWidth={1.4} fill="none" strokeLinecap="round"
            animate={{ opacity: [0.15, 0.6, 0.15], y: [0, -4, -8] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        ) : (
          <path d="M 24 -19 C 22 -25, 26 -30, 24 -37"
                stroke="#FFFAF2" strokeWidth={1.4} fill="none"
                strokeLinecap="round" opacity={0.45} />
        )}
      </g>

      {/* TWO CUPS — one for each bunny */}
      {[{ cx: 20, cy: -62 }, { cx: 36, cy: -55 }].map((c, i) => (
        <g key={`cup-${i}`} transform={`translate(${c.cx}, ${c.cy})`}>
          <ellipse cx={0} cy={1.5} rx={8} ry={2.2} fill={CREAM} stroke={INK} strokeWidth={0.9} />
          <path d="M -5 0 L -5 -6 C -5 -8, 5 -8, 5 -6 L 5 0 Z"
                fill={CREAM} stroke={INK} strokeWidth={1.1} strokeLinejoin="round" />
          <ellipse cx={0} cy={-6} rx={5} ry={1.4} fill={WOOD_HI} />
          <path d="M 5 -5 Q 9 -5 9 -3 Q 9 -1 5 -2"
                stroke={INK} strokeWidth={1} fill="none" strokeLinecap="round" />
          <circle cx={-1.5} cy={-3} r={0.7} fill="#C38D9E" />
        </g>
      ))}

      {/* a spare carrot lying by the table leg */}
      <g transform="translate(58, -5) rotate(18)">
        <path d="M -10 0 C -10 -3, -4 -4, 2 -3 C 8 -2.4, 12 -1, 12 0.5
                 C 12 2, 8 3, 2 3 C -4 3.4, -10 3, -10 0 Z"
              fill="#E8873A" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
        <path d="M 12 0.5 q 6 -3 9 -1 M 12 0.5 q 7 1 9 4"
              stroke="#6B8E5A" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        <path d="M -5 -1 L -5 1.6 M 1 -1.4 L 1 2" stroke={INK} strokeWidth={0.6} opacity={0.5} />
      </g>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// BASKET — woven basket with carrots poking out.
// ─────────────────────────────────────────────────────────────────────────
function CarrotBasket({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`} pointerEvents="none">
      <ellipse cx={0} cy={2} rx={36} ry={6} fill="#000" opacity={0.25} />
      {/* carrots inside (drawn before the basket front) */}
      <g transform="translate(-10, -34) rotate(-22)">
        <path d="M -3.5 0 C -4 6, -2 12, 0 15 C 2 12, 4 6, 3.5 0 C 2 -2, -2 -2, -3.5 0 Z"
              fill="#E8873A" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
        <path d="M -2 -2 q -3 -6 -1 -10 M 1 -2 q 1 -7 3 -9"
              stroke="#6B8E5A" strokeWidth={1.5} fill="none" strokeLinecap="round" />
      </g>
      <g transform="translate(8, -36) rotate(14)">
        <path d="M -3.5 0 C -4 6, -2 12, 0 15 C 2 12, 4 6, 3.5 0 C 2 -2, -2 -2, -3.5 0 Z"
              fill="#F5A85E" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
        <path d="M -2 -2 q -3 -6 -2 -10 M 1 -2 q 2 -6 4 -8"
              stroke="#6B8E5A" strokeWidth={1.5} fill="none" strokeLinecap="round" />
      </g>
      {/* basket body */}
      <path d="M -32 -24 C -34 -8, -28 0, 0 0 C 28 0, 34 -8, 32 -24 Z"
            fill="#C9A66A" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      {/* weave — horizontal arcs + stagger dashes */}
      <path d="M -32 -17 C -20 -13, 20 -13, 32 -17 M -31 -9 C -18 -5, 18 -5, 31 -9"
            stroke={INK} strokeWidth={0.9} fill="none" opacity={0.5} />
      <path d="M -22 -22 L -20 -4 M -8 -23 L -7 -2 M 8 -23 L 7 -2 M 22 -22 L 20 -4"
            stroke={INK} strokeWidth={0.8} strokeDasharray="4 3" opacity={0.4} fill="none" />
      {/* rim */}
      <path d="M -33 -24 C -16 -29, 16 -29, 33 -24 C 16 -20, -16 -20, -33 -24 Z"
            fill="#D8B687" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
      {/* handle */}
      <path d="M -20 -26 C -12 -46, 12 -46, 20 -26"
            stroke={INK} strokeWidth={4.6} fill="none" strokeLinecap="round" />
      <path d="M -20 -26 C -12 -46, 12 -46, 20 -26"
            stroke="#C9A66A" strokeWidth={2.4} fill="none" strokeLinecap="round" />
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// BOOK STACK — three chunky books by the hearth.
// ─────────────────────────────────────────────────────────────────────────
function BookStack({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`} pointerEvents="none">
      <ellipse cx={0} cy={2} rx={26} ry={4.5} fill="#000" opacity={0.25} />
      <g transform="rotate(-2)">
        <rect x={-22} y={-10} width={44} height={10} rx={2}
              fill="#95B88F" stroke={INK} strokeWidth={1.4} />
        <line x1={-18} y1={-2.5} x2={18} y2={-2.5} stroke={CREAM} strokeWidth={1.6} />
      </g>
      <g transform="rotate(3)">
        <rect x={-19} y={-19} width={38} height={9} rx={2}
              fill="#C97551" stroke={INK} strokeWidth={1.4} />
        <line x1={-15} y1={-12.4} x2={15} y2={-12.4} stroke={CREAM} strokeWidth={1.5} />
      </g>
      <g transform="rotate(-3)">
        <rect x={-15} y={-27} width={30} height={8} rx={2}
              fill="#7FA9B0" stroke={INK} strokeWidth={1.4} />
        <line x1={-11} y1={-21.2} x2={11} y2={-21.2} stroke={CREAM} strokeWidth={1.4} />
        {/* ribbon bookmark */}
        <path d="M 8 -27 L 8 -31 L 11 -29 Z" fill="#C38D9E" stroke={INK} strokeWidth={0.7} />
      </g>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Floor slots for discovered species + undiscovered nooks. The burrow
// hosts a single species today (cottontail), but the list is safe for
// a few more.
// ─────────────────────────────────────────────────────────────────────────
const SPECIES_SLOTS = [
  { x: 1058, y: 696 },
  { x: 1330, y: 692 },
  { x: 240, y: 698 },
];
function speciesSlot(i: number) {
  return SPECIES_SLOTS[Math.min(i, SPECIES_SLOTS.length - 1)];
}

// ─────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────

export default function BunnyBurrowInterior({
  learnerId, themedSkillCode, themedStructureLabel, themedStructureEmoji,
  discoveredSpecies, undiscoveredCount, learnerLevel = 2,
}: BunnyBurrowInteriorProps) {
  const router = useRouter();
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
  const [starting, setStarting] = useState(false);
  const [teachOpen, setTeachOpen] = useState(false);

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

  // The room cavity — a low earthen dome. Everything outside it is
  // packed soil strata.
  const ROOM_PATH =
    'M 40 800 L 40 620 C 40 380, 205 210, 720 210 C 1235 210, 1400 380, 1400 620 L 1400 800 Z';
  const RIM_ARC =
    'M 40 620 C 40 380, 205 210, 720 210 C 1235 210, 1400 380, 1400 620';

  return (
    <HabitatInteriorLayout learnerId={learnerId} title="Bunny Burrow" iconEmoji="🐰">
      <svg
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'manipulation' }}
      >
        <defs>
          {/* warm interior light — brightest around the hearth/lantern axis */}
          <radialGradient id="bbWarmGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE9A8" stopOpacity={1} />
            <stop offset="55%" stopColor="#FFD98A" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#FFD98A" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="bbRoom" cx="52%" cy="66%" r="72%">
            <stop offset="0%"  stopColor="#F2D5A2" />
            <stop offset="35%" stopColor="#DDB279" />
            <stop offset="70%" stopColor="#B0854F" />
            <stop offset="100%" stopColor="#7A5530" />
          </radialGradient>
          <linearGradient id="bbFloorShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7A4F2C" stopOpacity={0} />
            <stop offset="60%" stopColor="#5A3820" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#33200E" stopOpacity={0.9} />
          </linearGradient>
          {/* soil specks for wall texture */}
          <pattern id="bbSoil" x="0" y="0" width="34" height="34" patternUnits="userSpaceOnUse">
            <circle cx="7" cy="9" r="0.9" fill="#3F2614" opacity="0.5" />
            <circle cx="22" cy="16" r="0.7" fill="#5A3820" opacity="0.6" />
            <circle cx="13" cy="26" r="1" fill="#3F2614" opacity="0.4" />
            <circle cx="28" cy="30" r="0.6" fill="#8B6938" opacity="0.5" />
          </pattern>
          {/* plank floor */}
          <pattern id="bbPlanks" x="0" y="0" width="120" height="20" patternUnits="userSpaceOnUse">
            <rect width="120" height="20" fill="#5A3B1F" />
            <line x1="0" y1="0" x2="120" y2="0" stroke="#3F2614" strokeWidth="1" />
            <line x1="0" y1="20" x2="120" y2="20" stroke="#3F2614" strokeWidth="1" />
            <line x1="0" y1="0" x2="0" y2="20" stroke="#3F2614" strokeWidth="0.8" />
            <line x1="60" y1="0" x2="60" y2="20" stroke="#3F2614" strokeWidth="0.6" />
            <line x1="120" y1="0" x2="120" y2="20" stroke="#3F2614" strokeWidth="0.8" />
            <path d="M 4 4 Q 30 6 60 4 T 116 4" stroke="#7B4F2C" strokeWidth="0.5" fill="none" opacity="0.5" />
            <path d="M 4 14 Q 30 12 60 14 T 116 14" stroke="#7B4F2C" strokeWidth="0.5" fill="none" opacity="0.5" />
          </pattern>
          <clipPath id="bbRoomClip">
            <path d={ROOM_PATH} />
          </clipPath>
        </defs>

        {/* ══ SOIL SURROUND — packed earth outside the dome ══════════ */}
        <rect width={1440} height={800} fill="#4A2C15" />
        {/* strata bands — wavy warm soil layers */}
        <path d="M 0 0 L 1440 0 L 1440 74 Q 1250 88 1060 76 T 700 82 T 340 70 T 0 80 Z"
              fill="#33200E" />
        <path d="M 0 148 Q 200 134 400 146 T 780 140 T 1160 150 T 1440 138
                 L 1440 74 Q 1250 88 1060 76 T 700 82 T 340 70 T 0 80 Z"
              fill="#3F2712" />
        {/* third, lighter band just above the dome shoulders */}
        <path d="M 0 226 Q 220 210 440 224 T 860 216 T 1260 228 T 1440 214
                 L 1440 148 Q 1160 158 880 148 T 400 154 T 0 148 Z"
              fill="#543317" />
        <rect width={1440} height={800} fill="url(#bbSoil)" opacity={0.6} />
        {/* embedded pebbles in the soil */}
        {[
          { x: 140, y: 112, r: 11 }, { x: 425, y: 55, r: 8 }, { x: 640, y: 128, r: 9 },
          { x: 985, y: 52, r: 10 }, { x: 1235, y: 118, r: 12 }, { x: 60, y: 205, r: 9 },
          { x: 1392, y: 196, r: 10 }, { x: 820, y: 96, r: 7 },
          { x: 292, y: 192, r: 8 }, { x: 742, y: 178, r: 7 }, { x: 1130, y: 190, r: 9 },
          { x: 518, y: 172, r: 6 },
        ].map((p, i) => (
          <g key={`soilpeb-${i}`}>
            <ellipse cx={p.x + 1} cy={p.y + 1.5} rx={p.r} ry={p.r * 0.72}
                     fill="#1A0F08" opacity={0.4} />
            <ellipse cx={p.x} cy={p.y} rx={p.r} ry={p.r * 0.72}
                     fill={i % 2 === 0 ? '#8B7355' : '#75604A'}
                     stroke={INK} strokeWidth={1.3} />
            <ellipse cx={p.x - p.r * 0.3} cy={p.y - p.r * 0.28}
                     rx={p.r * 0.4} ry={p.r * 0.2} fill="#B5A084" opacity={0.6} />
          </g>
        ))}
        {/* root cross-sections — cut roots showing rings */}
        {[{ x: 322, y: 138 }, { x: 1082, y: 92 }, { x: 555, y: 62 }].map((rc, i) => (
          <g key={`rootx-${i}`}>
            <circle cx={rc.x} cy={rc.y} r={10} fill={WOOD} stroke={INK} strokeWidth={1.5} />
            <circle cx={rc.x} cy={rc.y} r={6} fill="none" stroke={WOOD_HI} strokeWidth={1.1} opacity={0.8} />
            <circle cx={rc.x} cy={rc.y} r={2} fill={INK} opacity={0.7} />
            <path d={`M ${rc.x + 9} ${rc.y - 3} q 8 -2 13 -7 M ${rc.x - 9} ${rc.y + 3} q -8 3 -12 8`}
                  stroke={INK} strokeWidth={1.6} fill="none" strokeLinecap="round" opacity={0.7} />
          </g>
        ))}
        {/* a tiny worm wriggling through the soil */}
        <path d="M 880 168 q 6 -7 12 0 q 6 7 12 0"
              stroke="#D89AA6" strokeWidth={3.4} fill="none" strokeLinecap="round" />
        <circle cx={905} cy={166} r={0.9} fill={INK} />

        {/* ══ ROOM CAVITY — warm dome interior ══════════════════════ */}
        <path d={ROOM_PATH} fill="url(#bbRoom)" />
        <g clipPath="url(#bbRoomClip)">
          {/* inner shadow just inside the rim */}
          <path d={RIM_ARC} stroke="#2A1808" strokeWidth={26} fill="none" opacity={0.25} />
          {/* interior strata — subtle warm bands in the wall itself */}
          <path d="M 40 352 Q 380 330 720 346 T 1400 338 L 1400 376 Q 1060 390 720 378 T 40 388 Z"
                fill="#C79A6B" opacity={0.30} />
          <path d="M 40 470 Q 400 450 760 464 T 1400 454 L 1400 494 Q 1040 508 680 496 T 40 504 Z"
                fill="#A87C4F" opacity={0.24} />
          <path d="M 40 572 Q 400 556 760 568 T 1400 560"
                stroke="#8B6938" strokeWidth={2.5} fill="none" opacity={0.28} />
          {/* faint contour arcs echoing the dome */}
          <path d="M 84 660 C 84 424, 236 258, 720 252 C 1204 258, 1356 424, 1356 660"
                stroke="#8B6938" strokeWidth={2} fill="none" opacity={0.3} />
          <path d="M 130 680 C 130 452, 275 292, 720 286 C 1165 292, 1310 452, 1310 680"
                stroke="#8B6938" strokeWidth={1.6} fill="none" opacity={0.22} />
          {/* soil specks on the interior walls */}
          <rect width={1440} height={800} fill="url(#bbSoil)" opacity={0.35} />
          {/* pebbles embedded in the interior wall */}
          {[
            { x: 100, y: 520, r: 9 }, { x: 152, y: 402, r: 7 }, { x: 1338, y: 486, r: 10 },
            { x: 1290, y: 590, r: 7 }, { x: 560, y: 528, r: 6 }, { x: 806, y: 492, r: 7 },
            { x: 250, y: 470, r: 6 }, { x: 1120, y: 430, r: 6 },
          ].map((p, i) => (
            <g key={`wallpeb-${i}`} opacity={0.85}>
              <ellipse cx={p.x} cy={p.y} rx={p.r} ry={p.r * 0.75}
                       fill={i % 2 === 0 ? '#C4A87F' : '#B29469'}
                       stroke={INK} strokeWidth={1.1} />
              <ellipse cx={p.x - p.r * 0.3} cy={p.y - p.r * 0.25}
                       rx={p.r * 0.4} ry={p.r * 0.22} fill="#E3CBA2" opacity={0.7} />
            </g>
          ))}
          {/* one root cross-section peeking through the back wall */}
          <g opacity={0.9}>
            <circle cx={700} cy={392} r={8} fill={WOOD} stroke={INK} strokeWidth={1.3} />
            <circle cx={700} cy={392} r={4.6} fill="none" stroke={WOOD_HI} strokeWidth={1} opacity={0.8} />
            <circle cx={700} cy={392} r={1.6} fill={INK} opacity={0.7} />
          </g>
        </g>
        {/* dome rim — chunky ink outline with a warm inner lip */}
        <path d={RIM_ARC} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d="M 52 620 C 52 388, 212 220, 720 220 C 1228 220, 1388 388, 1388 620"
              stroke="#8B6938" strokeWidth={2} fill="none" opacity={0.6} />

        {/* ══ CEILING ROOT CANOPY ═══════════════════════════════════ */}
        <CeilingCanopy />

        {/* bundles hanging from the roots */}
        <DriedFlowerBundle x={262} y={318} />
        <CarrotBundle x={548} y={242} drop={48} />
        <DriedFlowerBundle x={1148} y={322} tone="#A675B0" />

        {/* root chandelier + lantern over the center */}
        <RootChandelier reducedMotion={reducedMotion} />

        {/* ══ FLOOR ═════════════════════════════════════════════════ */}
        <rect x={0} y={640} width={1440} height={160} fill="url(#bbPlanks)" opacity={0.9} />
        {/* wall/floor junction shadow */}
        <rect x={0} y={640} width={1440} height={14} fill="#2A1808" opacity={0.35} />
        <line x1={0} y1={640} x2={1440} y2={640} stroke={INK} strokeWidth={2.5} opacity={0.8} />
        <rect x={0} y={620} width={1440} height={180} fill="url(#bbFloorShade)" />

        {/* ══ WALL VIGNETTES (back to front) ════════════════════════ */}

        {/* tiny carved candle niche on the mid wall */}
        <g transform="translate(618, 462)" pointerEvents="none">
          <path d="M -20 16 L -20 -8 C -20 -22, -8 -27, 0 -27 C 8 -27, 20 -22, 20 -8 L 20 16 Z"
                fill="#2E1C0E" stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
          <path d="M -14 14 L -14 -7 C -14 -17, -6 -21, 0 -21 C 6 -21, 14 -17, 14 -7 L 14 14 Z"
                fill="#241407" opacity={0.85} />
          <ellipse cx={0} cy={2} rx={13} ry={11} fill="url(#bbWarmGlow)" opacity={0.9} />
          {/* candle */}
          <rect x={-4} y={-1} width={8} height={13} rx={2}
                fill={CREAM} stroke={INK} strokeWidth={1.1} />
          <path d="M -4 1 q 2 2 4 0 q 2 -2 4 0" stroke="#E3D6BC" strokeWidth={1} fill="none" />
          <path d="M 0 -3 C -2.4 -6, -2.4 -10, 0 -12.5 C 2.4 -10, 2.4 -6, 0 -3 Z"
                fill="#FFD06B" stroke="#B85C22" strokeWidth={0.7} />
          <circle cx={0} cy={-7.5} r={1.4} fill="#FFFAF2" />
          {/* saucer */}
          <ellipse cx={0} cy={12.5} rx={7.5} ry={2.2} fill="#C97551" stroke={INK} strokeWidth={1} />
        </g>

        {/* sleeping alcove with patchwork bed */}
        <BedAlcove x={322} y={642} />

        {/* hearth — the warm heart of the burrow */}
        <Hearth x={950} y={642} reducedMotion={reducedMotion} />

        {/* jar shelf + framed bunny portraits on the right wall */}
        <JarShelf x={1240} y={452} />
        <FramedPortrait x={1198} y={382} s={1} />
        <FramedPortrait x={1286} y={402} s={0.78} frame="#C38D9E" />

        {/* ROUND DOOR — left wall, leads deeper into the warren.
            Scaled up so it reads bunny-sized next to the residents. */}
        <g transform="translate(140, 514) scale(1.35)" pointerEvents="none">
          <ellipse cx={2} cy={104} rx={38} ry={6} fill="#000" opacity={0.32} />
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
          {/* half-round welcome mat */}
          <path d="M -40 103 Q 0 74 40 103 Z"
                fill="#E8C493" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
          <path d="M -27 100 Q 0 82 27 100" stroke="#C9A66A" strokeWidth={1.6}
                fill="none" opacity={0.9} />
          <path d="M -14 101 Q 0 92 14 101" stroke="#C97551" strokeWidth={1.4}
                fill="none" opacity={0.8} />
          {/* tiny boots beside the door */}
          <g transform="translate(46, 88)">
            <path d="M 0 12 L 0 0 C 0 -2, 6 -2, 6 0 L 6 6 L 12 8 C 14 9, 13 12, 11 12 Z"
                  fill="#A0563B" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
            <rect x={-0.5} y={-3} width={7} height={3.4} rx={1.4}
                  fill="#C9A66A" stroke={INK} strokeWidth={0.9} />
            <g transform="translate(14, 0)">
              <path d="M 0 12 L 0 0 C 0 -2, 6 -2, 6 0 L 6 6 L 12 8 C 14 9, 13 12, 11 12 Z"
                    fill="#A0563B" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
              <rect x={-0.5} y={-3} width={7} height={3.4} rx={1.4}
                    fill="#C9A66A" stroke={INK} strokeWidth={0.9} />
            </g>
          </g>
        </g>

        {/* ══ FLOOR VIGNETTES ═══════════════════════════════════════ */}

        {/* BRAIDED RUG — concentric two-tone rings under the pedestal */}
        <g transform="translate(720, 700)" pointerEvents="none">
          <ellipse cx={3} cy={4} rx={150} ry={34} fill="#1A0F08" opacity={0.3} />
          <ellipse cx={0} cy={0} rx={150} ry={34} fill="#B86B4C" stroke={INK} strokeWidth={1.6} />
          <ellipse cx={0} cy={0} rx={125} ry={27.5} fill="#E3B380" stroke="#8B5A33" strokeWidth={0.9} />
          <ellipse cx={0} cy={0} rx={100} ry={21.5} fill="#B86B4C" stroke="#8B5A33" strokeWidth={0.9} />
          <ellipse cx={0} cy={0} rx={75} ry={15.5} fill="#E3B380" stroke="#8B5A33" strokeWidth={0.9} />
          <ellipse cx={0} cy={0} rx={50} ry={10} fill="#B86B4C" stroke="#8B5A33" strokeWidth={0.9} />
          <ellipse cx={0} cy={0} rx={25} ry={5} fill="#E3B380" stroke="#8B5A33" strokeWidth={0.9} />
          {/* braid stitch marks on alternating rings */}
          <ellipse cx={0} cy={0} rx={137} ry={30.5} fill="none" stroke="#8B5A33"
                   strokeWidth={2.2} strokeDasharray="7 9" opacity={0.45} />
          <ellipse cx={0} cy={0} rx={87} ry={18.5} fill="none" stroke="#8B5A33"
                   strokeWidth={2} strokeDasharray="6 8" opacity={0.4} />
        </g>

        {/* TEA TABLE — the resident bunny's spot */}
        <g transform="translate(622, 714) scale(1.2)">
          <TeaTable x={0} y={0} reducedMotion={reducedMotion} />
        </g>

        {/* THE BURROW BUNNY — sitting by the tea table. Tap to open
            the bunny's little school: tricks and mental-math lessons,
            no quizzes. Native SVG hit target (iPad-safe). */}
        <g
          transform="translate(484, 628)"
          style={{ cursor: 'pointer', touchAction: 'manipulation' }}
          onClick={() => setTeachOpen(true)}
          role="button"
          aria-label="ask the bunny to teach you a trick"
        >
          <circle r={96} cy={30} fill="transparent" />
          <CottontailBunny scale={4.6} reducedMotion={reducedMotion} />
          {/* thought bubble invitation */}
          <g transform="translate(78, -66)" pointerEvents="none">
            <circle cx={-26} cy={30} r={5} fill="#FFFAF2" stroke="#3F2614" strokeWidth={1.4} />
            <circle cx={-14} cy={16} r={8} fill="#FFFAF2" stroke="#3F2614" strokeWidth={1.5} />
            <ellipse cx={12} cy={-6} rx={30} ry={22} fill="#FFFAF2" stroke="#3F2614" strokeWidth={1.8} />
            <text x={12} y={2} textAnchor="middle" fontSize={20} fontWeight={800} fill="#6B4423">?</text>
          </g>
        </g>

        {/* basket of carrots + books by the hearth */}
        <CarrotBasket x={1122} y={716} />
        <BookStack x={1198} y={722} />

        {/* THEMED SKILL STRUCTURE — root-knot pedestal on the rug,
            lit from above by the root chandelier */}
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

        {/* DISCOVERED SPECIES — bespoke small bunny SVG (NOT emoji)
            for the cottontail, placed in the hearth-rug vignette so
            the scale reads. */}
        {discoveredSpecies.map((sp, i) => {
          const { x, y } = speciesSlot(i);
          // Special-case the cottontail rabbit: use the bespoke SVG
          // bunny so we don't render a "disembodied 🐰 emoji" in
          // this scene. The species code is 'cottontail_rabbit'.
          const isBunny = sp.code === 'cottontail_rabbit';
          return (
            <motion.g
              key={sp.code}
              animate={reducedMotion ? {} : { y: [0, -6, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
            >
              {isBunny ? (
                /* SPECIES-CARD BUNNY: scale 1.6 (~56×80px); front paws
                   (internal y=20) land just above the label ribbon. */
                <g transform={`translate(${x}, ${y - 33})`}>
                  <CottontailBunny scale={1.6} reducedMotion={reducedMotion} />
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
            the wall near the floor. Each is a dark rounded niche with a
            faint silhouette inside, suggesting "a future resident might
            settle here". NOT 🐰 emoji. */}
        {Array.from({ length: undiscoveredCount }).map((_, i) => {
          const { x, y } = speciesSlot(discoveredSpecies.length + i);
          return (
            <g key={`undiscovered-${i}`} opacity={0.6}>
              {/* nook silhouette — a small archway carved into the wall */}
              <path
                d={`M ${x - 18} ${y + 10}
                    L ${x - 18} ${y - 6}
                    C ${x - 18} ${y - 18}, ${x - 6} ${y - 22}, ${x} ${y - 22}
                    C ${x + 6} ${y - 22}, ${x + 18} ${y - 18}, ${x + 18} ${y - 6}
                    L ${x + 18} ${y + 10} Z`}
                fill="#1A0F08" stroke="#3F2614" strokeWidth={1.3}
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
      <BunnyTeachModal
        open={teachOpen}
        learnerLevel={learnerLevel}
        onClose={() => setTeachOpen(false)}
      />
    </HabitatInteriorLayout>
  );
}
