// app/(child)/garden/habitat/[code]/BunnyBurrowInterior.tsx
//
// Bunny Burrow interior — a cozy, lantern-lit underground den. The
// resident is a bespoke brown rabbit with whisker-twitch + nose-twitch
// animation; the back wall holds the themed skill structure on a
// raised root pedestal; the floor is dressed with hand-illustrated
// mushrooms, leaf piles, moss, twigs, acorn cups (NO emoji); roots
// hang from the ceiling with twisted texture; a small wooden door
// hints at a deeper warren.

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
// BURROW BUNNY — bespoke brown rabbit, sitting upright + alert. Has a
// nose-twitch and an occasional ear-flick. The "resident" of the burrow
// — kid-magnetic without being cartoonish.
// ─────────────────────────────────────────────────────────────────────────
function BurrowBunny({ reducedMotion }: { reducedMotion: boolean }) {
  const LINE = '#3F2614';
  const FUR = '#8A5A3C';
  const FUR_DARK = '#5A3820';
  const FUR_HI = '#B07A52';
  const BELLY = '#F0DCB8';
  const NOSE = '#C38D9E';

  return (
    <g transform="translate(220, 600)">
      {/* ground shadow */}
      <ellipse cx={0} cy={62} rx={40} ry={6} fill="#000" opacity={0.32} />

      {/* HIND LEGS — folded under, visible at the front */}
      <ellipse cx={-22} cy={50} rx={12} ry={9} fill={FUR} stroke={LINE} strokeWidth={1.5} />
      <ellipse cx={22}  cy={50} rx={12} ry={9} fill={FUR} stroke={LINE} strokeWidth={1.5} />
      {/* hind paw pads */}
      <ellipse cx={-26} cy={55} rx={5} ry={3} fill="#3A2418" opacity={0.7} />
      <ellipse cx={26}  cy={55} rx={5} ry={3} fill="#3A2418" opacity={0.7} />

      {/* BODY — pear-shape, narrower at shoulders, wider at haunches */}
      <path
        d="M -20 4
           C -28 0, -30 -10, -22 -18
           C -10 -26, 12 -26, 22 -18
           C 30 -10, 28 0, 22 4
           C 30 14, 32 30, 22 42
           C 10 50, -10 50, -22 42
           C -32 30, -28 14, -20 4 Z"
        fill={FUR} stroke={LINE} strokeWidth={1.8} strokeLinejoin="round"
      />
      {/* belly — paler curve */}
      <path
        d="M -16 14 C -8 22, 8 22, 16 14 C 20 26, 14 38, 4 40 C -4 40, -14 36, -16 22 Z"
        fill={BELLY} opacity={0.85}
      />
      {/* fur shading on the back */}
      <path
        d="M -20 -10 Q -8 -16 0 -16 Q 12 -16 20 -10 Q 14 -6 0 -8 Q -14 -6 -20 -10 Z"
        fill={FUR_HI} opacity={0.55}
      />

      {/* FRONT PAWS — small + compact in front of the body */}
      <ellipse cx={-9} cy={32} rx={5} ry={6} fill={FUR} stroke={LINE} strokeWidth={1.3} />
      <ellipse cx={9}  cy={32} rx={5} ry={6} fill={FUR} stroke={LINE} strokeWidth={1.3} />
      {/* tiny toe lines on the front paws */}
      <line x1={-11} y1={36} x2={-11} y2={38} stroke={LINE} strokeWidth={0.6} />
      <line x1={-9}  y1={37} x2={-9}  y2={39} stroke={LINE} strokeWidth={0.6} />
      <line x1={-7}  y1={36} x2={-7}  y2={38} stroke={LINE} strokeWidth={0.6} />
      <line x1={7}   y1={36} x2={7}   y2={38} stroke={LINE} strokeWidth={0.6} />
      <line x1={9}   y1={37} x2={9}   y2={39} stroke={LINE} strokeWidth={0.6} />
      <line x1={11}  y1={36} x2={11}  y2={38} stroke={LINE} strokeWidth={0.6} />

      {/* COTTONTAIL — fluffy white puff peeking from the side */}
      <circle cx={-26} cy={20} r={6.5} fill="#FFFAF2" stroke={LINE} strokeWidth={1.2} />
      <circle cx={-28} cy={18} r={2.4} fill="#FFFFFF" opacity={0.85} />

      {/* HEAD GROUP — animated y-bob (subtle breathing) and nose twitch */}
      <motion.g
        animate={reducedMotion ? undefined : { y: [0, -1, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* TWO TALL EARS — left twitches occasionally, right is steady */}
        <motion.g
          animate={reducedMotion ? undefined : { rotate: [0, 0, 0, -10, 0, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: '-10px', originY: '-22px' }}
        >
          {/* outer left ear */}
          <path
            d="M -12 -22 C -16 -42, -10 -56, -4 -54
               C 0 -52, 0 -38, -4 -22 Z"
            fill={FUR} stroke={LINE} strokeWidth={1.3} strokeLinejoin="round"
          />
          {/* inner left ear — pink */}
          <path
            d="M -10 -24 C -12 -40, -8 -50, -5 -50
               C -3 -48, -3 -36, -6 -24 Z"
            fill={NOSE} opacity={0.65}
          />
        </motion.g>
        {/* right ear (steady) */}
        <path
          d="M 12 -22 C 16 -42, 10 -56, 4 -54
             C 0 -52, 0 -38, 4 -22 Z"
          fill={FUR} stroke={LINE} strokeWidth={1.3} strokeLinejoin="round"
        />
        <path
          d="M 10 -24 C 12 -40, 8 -50, 5 -50
             C 3 -48, 3 -36, 6 -24 Z"
          fill={NOSE} opacity={0.65}
        />

        {/* HEAD — round but slightly pinched at the muzzle */}
        <path
          d="M -18 -16
             C -22 -22, -16 -30, -8 -30
             C 4 -32, 14 -28, 18 -20
             C 20 -10, 16 0, 6 4
             C -8 4, -20 -2, -18 -16 Z"
          fill={FUR} stroke={LINE} strokeWidth={1.7} strokeLinejoin="round"
        />
        {/* head highlight — top of skull */}
        <path
          d="M -12 -26 Q 0 -30 12 -26 Q 0 -22 -12 -26 Z"
          fill={FUR_HI} opacity={0.6}
        />
        {/* CHEEK FUR — soft tufts at the jowls */}
        <path d="M -18 -8 Q -22 -2 -18 4" stroke={LINE} strokeWidth={0.7} fill="none" opacity={0.6} strokeLinecap="round" />
        <path d="M 18 -8 Q 22 -2 18 4" stroke={LINE} strokeWidth={0.7} fill="none" opacity={0.6} strokeLinecap="round" />

        {/* EYES — big round with bright highlights (kid-magnet) */}
        <circle cx={-8} cy={-16} r={3.5} fill="#FFFAF2" stroke={LINE} strokeWidth={1.0} />
        <circle cx={-8} cy={-16} r={2.6} fill="#1A1208" />
        <circle cx={-7} cy={-17} r={1.0} fill="#FFFFFF" />
        <circle cx={-9} cy={-15.5} r={0.4} fill="#FFFFFF" opacity={0.75} />
        <circle cx={8}  cy={-16} r={3.5} fill="#FFFAF2" stroke={LINE} strokeWidth={1.0} />
        <circle cx={8}  cy={-16} r={2.6} fill="#1A1208" />
        <circle cx={9}  cy={-17} r={1.0} fill="#FFFFFF" />
        <circle cx={7}  cy={-15.5} r={0.4} fill="#FFFFFF" opacity={0.75} />
        {/* tiny eyebrow tufts */}
        <path d="M -12 -20 Q -8 -22 -5 -20" stroke={LINE} strokeWidth={0.7} fill="none" opacity={0.65} strokeLinecap="round" />
        <path d="M 5 -20 Q 8 -22 12 -20" stroke={LINE} strokeWidth={0.7} fill="none" opacity={0.65} strokeLinecap="round" />

        {/* MUZZLE — paler pinched front */}
        <path
          d="M -8 -6 C -10 -2, -6 4, 0 4 C 6 4, 10 -2, 8 -6 Z"
          fill={BELLY} stroke={LINE} strokeWidth={1.0} strokeLinejoin="round"
        />
        {/* NOSE — pink Y-shape, twitches */}
        <motion.g
          animate={reducedMotion ? undefined : { scale: [1, 1.12, 1, 1.08, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: '0px', originY: '-3px' }}
        >
          <path
            d="M -2.5 -4 L 0 -2 L 2.5 -4 L 0 -1 Z"
            fill={NOSE} stroke={LINE} strokeWidth={0.9} strokeLinejoin="round"
          />
        </motion.g>
        {/* mouth — a small Y line below the nose */}
        <line x1={0} y1={-1} x2={0} y2={1} stroke={LINE} strokeWidth={0.8} strokeLinecap="round" />
        <path d="M 0 1 Q -2 3 -3 2" stroke={LINE} strokeWidth={0.8} fill="none" strokeLinecap="round" />
        <path d="M 0 1 Q 2 3 3 2" stroke={LINE} strokeWidth={0.8} fill="none" strokeLinecap="round" />

        {/* WHISKERS — three thin lines on each side of the muzzle */}
        <line x1={-8} y1={-3} x2={-18} y2={-5} stroke={LINE} strokeWidth={0.5} opacity={0.75} />
        <line x1={-8} y1={-1} x2={-19} y2={-1} stroke={LINE} strokeWidth={0.5} opacity={0.75} />
        <line x1={-8} y1={1}  x2={-18} y2={3}  stroke={LINE} strokeWidth={0.5} opacity={0.75} />
        <line x1={8}  y1={-3} x2={18}  y2={-5} stroke={LINE} strokeWidth={0.5} opacity={0.75} />
        <line x1={8}  y1={-1} x2={19}  y2={-1} stroke={LINE} strokeWidth={0.5} opacity={0.75} />
        <line x1={8}  y1={1}  x2={18}  y2={3}  stroke={LINE} strokeWidth={0.5} opacity={0.75} />

        {/* tiny front teeth peeking under the mouth */}
        <rect x={-1.5} y={2} width={3} height={2} rx={0.4} fill="#FFFAF2" stroke={LINE} strokeWidth={0.4} />
        <line x1={0} y1={2} x2={0} y2={4} stroke={LINE} strokeWidth={0.3} />
      </motion.g>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// HAND-DRAWN BURROW DECORATIONS — replace emoji with bespoke SVG
// ─────────────────────────────────────────────────────────────────────────

function MushroomCluster({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* shadow */}
      <ellipse cx={2} cy={6} rx={22} ry={3} fill="#000" opacity={0.22} />
      {/* big mushroom — red cap with white spots */}
      <ellipse cx={0} cy={4} rx={4} ry={3} fill="#FFFAF2" stroke="#5A3B1F" strokeWidth={0.9} />
      <path
        d="M -14 -4 C -16 -14, -6 -20, 0 -20 C 8 -20, 16 -14, 14 -4 Z"
        fill="#C8412B" stroke="#7A2E1F" strokeWidth={1.3} strokeLinejoin="round"
      />
      {/* highlight on the cap */}
      <path d="M -10 -10 Q -4 -16 4 -14" stroke="#E66C53" strokeWidth={1.5} fill="none" strokeLinecap="round" opacity={0.85} />
      {/* white spots */}
      <circle cx={-6} cy={-10} r={1.8} fill="#FFFAF2" />
      <circle cx={4}  cy={-12} r={2.2} fill="#FFFAF2" />
      <circle cx={8}  cy={-6}  r={1.4} fill="#FFFAF2" />
      <circle cx={-9} cy={-5}  r={1.2} fill="#FFFAF2" />
      {/* small mushroom — beside the big one */}
      <ellipse cx={-12} cy={6} rx={2.5} ry={2} fill="#FFFAF2" stroke="#5A3B1F" strokeWidth={0.7} />
      <path
        d="M -18 0 C -20 -6, -14 -10, -10 -10 C -6 -10, -4 -6, -6 0 Z"
        fill="#FFD06B" stroke="#7B4F2C" strokeWidth={0.9} strokeLinejoin="round"
      />
      <circle cx={-12} cy={-6} r={0.8} fill="#FFFAF2" />
      <circle cx={-14} cy={-3} r={0.7} fill="#FFFAF2" />
      {/* tiny mushroom — third in cluster */}
      <ellipse cx={12} cy={6} rx={1.8} ry={1.2} fill="#FFFAF2" stroke="#5A3B1F" strokeWidth={0.6} />
      <path
        d="M 9 2 C 8 -2, 11 -5, 14 -5 C 17 -5, 18 -2, 16 2 Z"
        fill="#E8A87C" stroke="#5A3B1F" strokeWidth={0.7} strokeLinejoin="round"
      />
    </g>
  );
}

function LeafPile({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* shadow */}
      <ellipse cx={0} cy={4} rx={20} ry={3} fill="#000" opacity={0.22} />
      {/* leaf 1 — orange autumn */}
      <path
        d="M -16 0 Q -14 -10 -8 -8 Q -2 -6 -4 2 Q -10 6 -16 0 Z"
        fill="#E8713C" stroke="#5A3B1F" strokeWidth={0.9} strokeLinejoin="round" transform="rotate(-25)"
      />
      <path d="M -12 -2 L -8 -4" stroke="#5A3B1F" strokeWidth={0.5} />
      {/* leaf 2 — yellow */}
      <path
        d="M -4 0 Q 0 -8 6 -6 Q 10 0 4 4 Q -2 4 -4 0 Z"
        fill="#FFD06B" stroke="#5A3B1F" strokeWidth={0.9} strokeLinejoin="round"
      />
      <path d="M -2 0 L 4 -2" stroke="#5A3B1F" strokeWidth={0.5} />
      {/* leaf 3 — red */}
      <path
        d="M 6 -2 Q 12 -10 18 -6 Q 20 0 14 4 Q 8 4 6 -2 Z"
        fill="#C8412B" stroke="#7A2E1F" strokeWidth={0.9} strokeLinejoin="round" transform="rotate(15)"
      />
      <path d="M 10 -2 L 16 -2" stroke="#7A2E1F" strokeWidth={0.5} />
      {/* leaf 4 — small brown */}
      <path
        d="M -8 4 Q -4 -2 2 0 Q 4 4 -2 6 Q -8 6 -8 4 Z"
        fill="#8E6233" stroke="#5A3B1F" strokeWidth={0.7} strokeLinejoin="round" opacity={0.85}
      />
    </g>
  );
}

function MossTuft({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={2} rx={14} ry={3} fill="#000" opacity={0.20} />
      <ellipse cx={0} cy={-1} rx={13} ry={5} fill="#5C7E4F" stroke="#3D5C32" strokeWidth={0.9} />
      <ellipse cx={-2} cy={-3} rx={9} ry={3} fill="#7BA46F" opacity={0.85} />
      {/* tiny grass blades sprouting */}
      <line x1={-6} y1={-3} x2={-7} y2={-9} stroke="#3D5C32" strokeWidth={0.7} strokeLinecap="round" />
      <line x1={-3} y1={-4} x2={-3} y2={-11} stroke="#3D5C32" strokeWidth={0.7} strokeLinecap="round" />
      <line x1={1}  y1={-4} x2={2}  y2={-10} stroke="#3D5C32" strokeWidth={0.7} strokeLinecap="round" />
      <line x1={5}  y1={-4} x2={6}  y2={-9}  stroke="#3D5C32" strokeWidth={0.7} strokeLinecap="round" />
      {/* tiny white floret */}
      <circle cx={3} cy={-7} r={1.2} fill="#FFFAF2" stroke="#A89D8A" strokeWidth={0.4} />
      <circle cx={3} cy={-7} r={0.4} fill="#FFD166" />
    </g>
  );
}

function AcornCup({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={4} rx={9} ry={2} fill="#000" opacity={0.22} />
      {/* cup — rounded with brown bowl */}
      <path
        d="M -8 -4 C -8 4, 8 4, 8 -4 C 8 -6, -8 -6, -8 -4 Z"
        fill="#8E6233" stroke="#5A3B1F" strokeWidth={0.9} strokeLinejoin="round"
      />
      {/* rim highlight */}
      <ellipse cx={0} cy={-4.5} rx={7.5} ry={1.4} fill="#A0703F" />
      {/* tiny cluster of berries inside */}
      <circle cx={-3} cy={-3} r={1.6} fill="#C8412B" stroke="#7A2E1F" strokeWidth={0.4} />
      <circle cx={1}  cy={-3} r={1.6} fill="#C8412B" stroke="#7A2E1F" strokeWidth={0.4} />
      <circle cx={4}  cy={-2} r={1.4} fill="#E66C53" stroke="#7A2E1F" strokeWidth={0.4} />
      <circle cx={-2} cy={-2} r={0.5} fill="#FFFFFF" opacity={0.7} />
    </g>
  );
}

function TwigBundle({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={2} rx={14} ry={2} fill="#000" opacity={0.20} />
      {/* twigs criss-crossing */}
      <line x1={-10} y1={1} x2={8}  y2={-2} stroke="#5A3B1F" strokeWidth={1.4} strokeLinecap="round" />
      <line x1={-9}  y1={-1} x2={9}  y2={2}  stroke="#7B4F2C" strokeWidth={1.2} strokeLinecap="round" />
      <line x1={-8}  y1={2}  x2={10} y2={0}  stroke="#5A3B1F" strokeWidth={1.0} strokeLinecap="round" />
      {/* tiny leaf on one twig */}
      <ellipse cx={6} cy={-2} rx={2} ry={1.2} fill="#7BA46F" stroke="#3D5C32" strokeWidth={0.4} transform="rotate(20 6 -2)" />
    </g>
  );
}

function HangingRoot({ x, length = 100 }: { x: number; length?: number }) {
  // Twisted root that drips from the ceiling. Rendered as a tapered
  // path with a couple of side branches + dangling rootlets.
  const tipX = x + (x % 2 === 0 ? -4 : 6);
  return (
    <g pointerEvents="none">
      {/* main root — tapered curve */}
      <path
        d={`M ${x} 80
            C ${x + 2} ${80 + length * 0.3}, ${x - 4} ${80 + length * 0.6}, ${tipX} ${80 + length}`}
        stroke="#5A3B1F" strokeWidth={3.4} fill="none" strokeLinecap="round"
      />
      {/* lighter inner stripe */}
      <path
        d={`M ${x} 80
            C ${x + 2} ${80 + length * 0.3}, ${x - 4} ${80 + length * 0.6}, ${tipX} ${80 + length}`}
        stroke="#7B4F2C" strokeWidth={1.4} fill="none" strokeLinecap="round" opacity={0.75}
      />
      {/* side rootlet */}
      <path
        d={`M ${x + 1} ${80 + length * 0.4}
            Q ${x + 8} ${80 + length * 0.45}, ${x + 12} ${80 + length * 0.55}`}
        stroke="#5A3B1F" strokeWidth={1.4} fill="none" strokeLinecap="round"
      />
      {/* tiny moss on the upper part */}
      <ellipse cx={x - 1} cy={84 + length * 0.15} rx={4} ry={1.2} fill="#7BA46F" opacity={0.7} />
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
          {/* Underground earthy radial — warm at the lantern center,
              fading to dark soil at the edges. */}
          <radialGradient id="bbGlow" cx="50%" cy="44%" r="68%">
            <stop offset="0%"  stopColor="#FFF5D8" />
            <stop offset="22%" stopColor="#F5D99C" />
            <stop offset="55%" stopColor="#D4A574" />
            <stop offset="85%" stopColor="#7A4F2C" />
            <stop offset="100%" stopColor="#3F2614" />
          </radialGradient>
          <linearGradient id="bbFloor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7A4F2C" stopOpacity={0} />
            <stop offset="60%" stopColor="#5A3820" stopOpacity={0.7} />
            <stop offset="100%" stopColor="#3A2510" stopOpacity={0.95} />
          </linearGradient>
          {/* SOIL TEXTURE pattern — tiny earth specks */}
          <pattern id="bbSoil" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <rect width="30" height="30" fill="transparent" />
            <circle cx="6" cy="8" r="0.6" fill="#3F2614" opacity="0.6" />
            <circle cx="20" cy="14" r="0.5" fill="#5A3820" opacity="0.7" />
            <circle cx="12" cy="22" r="0.7" fill="#3F2614" opacity="0.5" />
          </pattern>
        </defs>

        {/* base wash */}
        <rect width={1440} height={800} fill="url(#bbGlow)" />
        <rect width={1440} height={800} fill="url(#bbSoil)" opacity={0.4} />

        {/* TUNNEL ARCH at the top — domed with root-textured rim */}
        <path
          d="M 0 0 L 0 240
             Q 100 140 240 110
             Q 480 70 720 60
             Q 960 70 1200 110
             Q 1340 140 1440 240
             L 1440 0 Z"
          fill="#3A2510" opacity={0.92}
        />
        {/* rim along the arch — lighter, suggests tunnel mouth */}
        <path
          d="M 0 240
             Q 100 140 240 110
             Q 480 70 720 60
             Q 960 70 1200 110
             Q 1340 140 1440 240"
          stroke="#7A4F2C" strokeWidth={4} fill="none" opacity={0.65} strokeLinecap="round"
        />
        {/* root-tendril texture along the rim */}
        {[120, 280, 440, 600, 760, 920, 1080, 1240].map((rx, i) => (
          <path
            key={`rim-${i}`}
            d={`M ${rx} ${130 + (i % 2) * 8}
                Q ${rx + (i % 2 === 0 ? -4 : 4)} ${145 + (i % 2) * 6}
                  ${rx - 2} ${165 + (i % 2) * 4}`}
            stroke="#5A3820" strokeWidth={1.4} fill="none" strokeLinecap="round" opacity={0.7}
          />
        ))}

        {/* HANGING ROOTS — varied lengths */}
        <HangingRoot x={180} length={110} />
        <HangingRoot x={300} length={80} />
        <HangingRoot x={420} length={130} />
        <HangingRoot x={540} length={70} />
        <HangingRoot x={680} length={100} />
        <HangingRoot x={840} length={90} />
        <HangingRoot x={990} length={120} />
        <HangingRoot x={1130} length={75} />
        <HangingRoot x={1260} length={105} />

        {/* HANGING LANTERN — detailed metal cage with chain links + flame.
            Anchors the warm light source in the center. */}
        <g transform="translate(720, 80)">
          {/* chain — alternating oval links */}
          {[0, 14, 28, 42, 56, 70, 84, 98, 112].map((cy, i) => (
            <ellipse key={`chl-${i}`} cx={0} cy={cy + 6} rx={3} ry={4.5}
                     fill="none" stroke={i % 2 === 0 ? '#5A3B1F' : '#7B4F2C'} strokeWidth={1.4} />
          ))}
          {/* lantern hood */}
          <path d="M -16 124 L 16 124 L 12 116 L -12 116 Z"
                fill="#5A3B1F" stroke="#1A1208" strokeWidth={1.4} strokeLinejoin="round" />
          <line x1={0} y1={113} x2={0} y2={116} stroke="#5A3B1F" strokeWidth={1.6} />
          {/* lantern body — cage shape */}
          <path
            d="M -14 124 L 14 124 L 16 156 L -16 156 Z"
            fill="#3F2614" stroke="#1A1208" strokeWidth={1.5} strokeLinejoin="round"
          />
          {/* glass panel — golden glow inside */}
          <rect x={-11} y={127} width={22} height={26} fill="#FFD06B" />
          {/* cage bars — vertical */}
          <line x1={-7} y1={127} x2={-7} y2={153} stroke="#1A1208" strokeWidth={0.9} />
          <line x1={0}  y1={127} x2={0}  y2={153} stroke="#1A1208" strokeWidth={0.9} />
          <line x1={7}  y1={127} x2={7}  y2={153} stroke="#1A1208" strokeWidth={0.9} />
          {/* base */}
          <path d="M -16 156 L 16 156 L 14 162 L -14 162 Z"
                fill="#5A3B1F" stroke="#1A1208" strokeWidth={1.4} strokeLinejoin="round" />
          {/* flame — animated flicker */}
          <motion.path
            d="M 0 138 C -4 134, -4 128, 0 124 C 4 128, 4 134, 0 138 Z"
            fill="#FFFAF2"
            animate={reducedMotion ? undefined : { scaleY: [1, 1.15, 0.95, 1.1, 1], opacity: [0.85, 1, 0.9, 1, 0.85] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '0px', originY: '138px' }}
          />
          <path d="M 0 137 C -2 134, -2 130, 0 128 C 2 130, 2 134, 0 137 Z"
                fill="#FFD06B" />
          {/* warm pool of light radiates from lantern center */}
          <ellipse cx={0} cy={140} rx={210} ry={140} fill="#FFD06B" opacity={0.18} />
          <ellipse cx={0} cy={140} rx={110} ry={70}  fill="#FFE89A" opacity={0.20} />
        </g>

        {/* FLOOR — earthy gradient + mound */}
        <ellipse cx={720} cy={780} rx={760} ry={70} fill="#7A4F2C" opacity={0.7} />
        <rect x={0} y={620} width={1440} height={180} fill="url(#bbFloor)" />
        {/* visible wood-chip texture on the floor */}
        {[
          { fx: 180,  fy: 720 }, { fx: 320,  fy: 760 }, { fx: 480,  fy: 740 },
          { fx: 620,  fy: 770 }, { fx: 800,  fy: 730 }, { fx: 940,  fy: 760 },
          { fx: 1120, fy: 740 }, { fx: 1280, fy: 770 },
        ].map((c, i) => (
          <ellipse key={`wc-${i}`} cx={c.fx} cy={c.fy}
                   rx={4 + (i % 3)} ry={1.4 + (i % 2) * 0.4}
                   fill="#5A3820" opacity={0.55} transform={`rotate(${(i * 23) % 80 - 40} ${c.fx} ${c.fy})`} />
        ))}

        {/* THEMED SKILL STRUCTURE — sits on a raised root pedestal
            in the center-back of the burrow, glowing under the lantern */}
        <g
          transform="translate(720, 410)"
          style={{ cursor: 'pointer', touchAction: 'manipulation' }}
          onClick={startSkill}
        >
          <circle r={64} fill="transparent" />

          {/* PEDESTAL — gnarled root knot the structure rests on */}
          <g pointerEvents="none">
            <ellipse cx={0} cy={64} rx={62} ry={10} fill="#000" opacity={0.32} />
            {/* knot base */}
            <path
              d="M -54 60
                 C -60 48, -50 38, -34 36
                 C -10 32, 14 32, 38 36
                 C 54 38, 62 50, 56 60 Z"
              fill="#5A3B1F" stroke="#3F2614" strokeWidth={1.5} strokeLinejoin="round"
            />
            {/* root knot rings — concentric circles to suggest wood grain */}
            <ellipse cx={0} cy={48} rx={42} ry={6} fill="none"
                     stroke="#7B4F2C" strokeWidth={1.0} opacity={0.7} />
            <ellipse cx={0} cy={48} rx={32} ry={4.5} fill="none"
                     stroke="#7B4F2C" strokeWidth={0.8} opacity={0.65} />
            <ellipse cx={0} cy={48} rx={20} ry={3} fill="none"
                     stroke="#7B4F2C" strokeWidth={0.7} opacity={0.6} />
            {/* knot top — small darker oval */}
            <ellipse cx={2} cy={46} rx={6} ry={2} fill="#3F2614" opacity={0.6} />
            {/* tiny moss on the pedestal sides */}
            <ellipse cx={-50} cy={56} rx={8} ry={2.4} fill="#5C7E4F" opacity={0.7} />
            <ellipse cx={48} cy={58} rx={6} ry={2} fill="#5C7E4F" opacity={0.65} />
          </g>

          {/* glow halo behind the structure */}
          <circle r={48} fill="#FFD93D" opacity={0.25} />
          <circle r={32} fill="#FFE89A" opacity={0.3} />

          {/* the structure emoji — sits on the pedestal */}
          <text
            textAnchor="middle" fontSize={48} y={6}
            style={{ filter: 'drop-shadow(0 2px 4px rgba(107,68,35,0.6))' }}
          >
            {themedStructureEmoji}
          </text>

          {/* label pill below the pedestal */}
          <rect x={-72} y={72} width={144} height={20} rx={10}
                fill="rgba(255,250,242,0.96)" stroke="#E8A87C" strokeWidth={1.2} />
          <text x={0} y={86} textAnchor="middle" fontSize={11} fontWeight={700} fill="#6b4423">
            {themedStructureLabel}
          </text>
        </g>

        {/* SMALL WOODEN DOOR — rounded archway door at the right side
            of the back wall, hinting at a deeper warren beyond. */}
        <g transform="translate(1180, 480)" pointerEvents="none">
          {/* doorframe shadow */}
          <ellipse cx={2} cy={108} rx={36} ry={6} fill="#000" opacity={0.32} />
          {/* archway frame — wooden planks */}
          <path
            d="M -28 100
               L -28 50
               C -28 28, -10 14, 0 14
               C 10 14, 28 28, 28 50
               L 28 100 Z"
            fill="#5A3B1F" stroke="#1A1208" strokeWidth={1.6} strokeLinejoin="round"
          />
          {/* door — slightly inset, paler wood */}
          <path
            d="M -22 96
               L -22 52
               C -22 34, -10 22, 0 22
               C 10 22, 22 34, 22 52
               L 22 96 Z"
            fill="#7B4F2C" stroke="#3F2614" strokeWidth={1.3} strokeLinejoin="round"
          />
          {/* vertical plank lines on the door */}
          <line x1={-10} y1={28} x2={-10} y2={94} stroke="#5A3B1F" strokeWidth={0.8} opacity={0.7} />
          <line x1={0}   y1={22} x2={0}   y2={94} stroke="#5A3B1F" strokeWidth={0.8} opacity={0.7} />
          <line x1={10}  y1={28} x2={10}  y2={94} stroke="#5A3B1F" strokeWidth={0.8} opacity={0.7} />
          {/* iron horizontal bands */}
          <rect x={-22} y={52} width={44} height={3} fill="#3F2614" />
          <rect x={-22} y={84} width={44} height={3} fill="#3F2614" />
          {/* round door knob */}
          <circle cx={14} cy={70} r={2.8} fill="#FFD06B" stroke="#5A3B1F" strokeWidth={0.8} />
          <circle cx={13} cy={69} r={1} fill="#FFFFFF" opacity={0.65} />
          {/* warm light glowing through the keyhole */}
          <circle cx={14} cy={76} r={1.4} fill="#FFE89A" opacity={0.85} />
        </g>

        {/* THE BURROW BUNNY — bespoke resident */}
        <BurrowBunny reducedMotion={reducedMotion} />

        {/* FLOOR DECORATIONS — bespoke SVG (no emoji) */}
        <MushroomCluster x={420} y={680} scale={1.4} />
        <LeafPile x={580} y={695} scale={1.3} />
        <MossTuft x={840} y={690} scale={1.4} />
        <MushroomCluster x={1020} y={685} scale={1.0} />
        <AcornCup x={520} y={745} scale={1.1} />
        <TwigBundle x={780} y={755} scale={1.2} />
        <MossTuft x={140} y={760} scale={1.0} />
        <AcornCup x={1100} y={760} scale={0.9} />
        <LeafPile x={1280} y={730} scale={1.0} />
        <MushroomCluster x={1340} y={680} scale={0.9} />

        {/* TINY WILDFLOWERS poking through cracks */}
        {[
          { fx: 360, fy: 730, c: '#FFD166' },
          { fx: 720, fy: 740, c: '#E6B0D0' },
          { fx: 940, fy: 720, c: '#FFB7C5' },
          { fx: 1180, fy: 730, c: '#FFD166' },
        ].map((f, i) => (
          <g key={`wf-${i}`} transform={`translate(${f.fx}, ${f.fy})`}>
            <line x1={0} y1={0} x2={0} y2={6} stroke="#5C7E4F" strokeWidth={1.0} strokeLinecap="round" />
            {[0, 72, 144, 216, 288].map(deg => (
              <ellipse key={deg} cx={0} cy={-3} rx={1.5} ry={2.4} fill={f.c}
                       stroke="#8B6938" strokeWidth={0.4} transform={`rotate(${deg})`} />
            ))}
            <circle cx={0} cy={-1} r={1.0} fill="#FFD166" stroke="#8B6938" strokeWidth={0.3} />
          </g>
        ))}

        {/* DISCOVERED SPECIES — animated hop along the floor */}
        {discoveredSpecies.map((sp, i) => {
          const x = 280 + i * 180;
          const y = 600;
          return (
            <motion.g
              key={sp.code}
              animate={reducedMotion ? {} : { y: [0, -8, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
            >
              <text
                x={x} y={y} textAnchor="middle" fontSize={32}
                style={{ filter: 'drop-shadow(0 1px 2px rgba(107,68,35,0.5))' }}
              >
                {sp.emoji}
              </text>
              <rect x={x - 50} y={y + 12} width={100} height={16} rx={4} fill="rgba(149, 184, 143, 0.9)" />
              <text x={x} y={y + 24} textAnchor="middle" fontSize={9} fontWeight={700} fill="#fffaf2">
                {sp.commonName}
              </text>
            </motion.g>
          );
        })}

        {/* UNDISCOVERED SLOTS — bespoke "burrow nook" shapes (not 🐰
            emoji). Each is a small dark rounded niche in the wall
            where a future species might appear. */}
        {Array.from({ length: undiscoveredCount }).map((_, i) => {
          const x = 280 + (discoveredSpecies.length + i) * 180;
          const y = 600;
          return (
            <g key={`undiscovered-${i}`} opacity={0.45}>
              {/* nook silhouette */}
              <path
                d={`M ${x - 16} ${y + 6}
                    C ${x - 18} ${y - 8}, ${x - 6} ${y - 18}, ${x} ${y - 18}
                    C ${x + 6} ${y - 18}, ${x + 18} ${y - 8}, ${x + 16} ${y + 6} Z`}
                fill="#3A2510" stroke="#1A1208" strokeWidth={1.2}
              />
              {/* faint silhouette inside the nook */}
              <ellipse cx={x} cy={y - 4} rx={7} ry={9} fill="#5A3820" opacity={0.55} />
              <text x={x} y={y - 2} textAnchor="middle" fontSize={14} fontStyle="italic"
                    fill="#95876a" opacity={0.85}>?</text>
              <rect x={x - 50} y={y + 12} width={100} height={16} rx={4}
                    fill="rgba(90,69,51,0.75)" stroke="#5A3820" strokeWidth={0.7} />
              <text x={x} y={y + 24} textAnchor="middle" fontSize={9} fontStyle="italic" fill="#C8BCAA">
                undiscovered
              </text>
            </g>
          );
        })}
      </svg>
    </HabitatInteriorLayout>
  );
}
