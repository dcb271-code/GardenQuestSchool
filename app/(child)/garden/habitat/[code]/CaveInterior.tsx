// app/(child)/garden/habitat/[code]/CaveInterior.tsx
//
// Operations Cave interior — a deep, mossy cave at the foot of Math
// Mountain. Hosts three regrouping/operations skill stones, plus a
// sleepy bear napping near the warm lantern glow. Same atmospheric
// vocabulary as the Bunny Burrow but stone-and-mineral rather than
// earth-and-root.
//
// The three skills (Hundred's Hollow, Fast Facts, Regrouping Ridge)
// no longer live on the Math Mountain map directly — they're rendered
// here as glowing pins inside the cave. Their unlock + completion
// state is computed server-side in page.tsx and passed in.

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
  skillStops: CaveSkillStop[];        // exactly three stops, in render order
  discoveredSpecies: SpeciesData[];
  undiscoveredCount: number;
}

// Sleeping black bear — curled on a moss pillow, with a tiny field
// mouse companion tucked against its belly. Whimsical but grounded:
// real bear proportions (boxy snout, small rounded ears, broad
// shoulders), no cartoon Zzz text, just a slow breathing rise + fall
// and an occasional ear twitch. Companion mouse breathes too.
function SleepyBear({ reducedMotion }: { reducedMotion: boolean }) {
  const LINE = '#2A1810';
  const FUR = '#5A3A22';
  const FUR_DARK = '#3F2817';
  const FUR_HI = '#7A5236';
  const BELLY = '#C49972';
  const PAW_PAD = '#3A2418';
  const NOSE = '#1A0F08';
  const CLAW = '#1A0F08';

  return (
    <g transform="translate(245, 650)">
      {/* MOSS PILLOW — bedding the bear's head + body. A slightly
          irregular soft mound the bear is curled on top of. */}
      <g pointerEvents="none">
        <ellipse cx={0} cy={78} rx={102} ry={14} fill="#000" opacity={0.32} />
        {/* moss base — darker olive */}
        <path
          d="M -94 76
             C -98 64, -86 56, -68 56
             C -40 50, -10 48, 22 50
             C 56 48, 84 54, 96 64
             C 100 72, 96 78, 88 80
             L -86 80 Z"
          fill="#5C7E4F" stroke="#3D5C32" strokeWidth={1.4} strokeLinejoin="round"
        />
        {/* moss highlights — brighter green tufts on top */}
        <ellipse cx={-60} cy={58} rx={20} ry={4} fill="#7BA46F" opacity={0.85} />
        <ellipse cx={0}   cy={54} rx={28} ry={5} fill="#7BA46F" opacity={0.80} />
        <ellipse cx={60}  cy={58} rx={22} ry={4.5} fill="#7BA46F" opacity={0.85} />
        {/* tiny moss bobbles — texture */}
        {[-72, -42, -18, 12, 38, 62, 84].map((mx, i) => (
          <circle key={`mb-${i}`} cx={mx} cy={56 + (i % 2) * 2}
                  r={2.2 + (i % 3) * 0.4} fill="#A2C794" opacity={0.65} />
        ))}
        {/* a couple of tiny clover leaves poking through the moss */}
        <g transform="translate(-30, 56)" opacity={0.85}>
          <circle cx={-2} cy={-1} r={1.6} fill="#7BA46F" stroke="#3D5C32" strokeWidth={0.4} />
          <circle cx={2}  cy={-1} r={1.6} fill="#7BA46F" stroke="#3D5C32" strokeWidth={0.4} />
          <circle cx={0}  cy={-3} r={1.6} fill="#7BA46F" stroke="#3D5C32" strokeWidth={0.4} />
        </g>
        <g transform="translate(46, 56)" opacity={0.80}>
          <circle cx={-2} cy={-1} r={1.4} fill="#A2C794" stroke="#5C7E4F" strokeWidth={0.4} />
          <circle cx={2}  cy={-1} r={1.4} fill="#A2C794" stroke="#5C7E4F" strokeWidth={0.4} />
          <circle cx={0}  cy={-3} r={1.4} fill="#A2C794" stroke="#5C7E4F" strokeWidth={0.4} />
        </g>
      </g>

      {/* TAIL — short stubby fluff behind the rump */}
      <ellipse cx={62} cy={28} rx={6} ry={5} fill={FUR_DARK} stroke={LINE} strokeWidth={1.3} />

      {/* BODY — broad-shouldered curl. Gently breathing (slow scaleY). */}
      <motion.g
        animate={reducedMotion ? undefined : { scaleY: [1, 1.025, 1], scaleX: [1, 0.998, 1] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ originX: '0.5px', originY: '40px' }}
      >
        {/* main body curl */}
        <path
          d="M -68 18
             C -76 10, -72 -2, -56 -8
             C -34 -16, 4 -18, 36 -14
             C 60 -10, 76 -2, 78 14
             C 80 28, 70 44, 52 50
             C 30 56, 0 58, -28 56
             C -52 54, -66 46, -70 32
             C -72 26, -70 22, -68 18 Z"
          fill={FUR} stroke={LINE} strokeWidth={2} strokeLinejoin="round"
        />
        {/* darker shadow under the body — defines weight */}
        <path
          d="M -50 50 C -20 60, 30 60, 60 48 C 50 56, 30 60, 0 60 C -30 60, -48 56, -50 50 Z"
          fill={FUR_DARK} opacity={0.5}
        />
        {/* belly patch — paler curve, the cream front */}
        <path
          d="M -36 28 C -10 38, 28 36, 50 22 C 56 36, 48 50, 22 54 C -6 56, -28 50, -36 38 Z"
          fill={BELLY} opacity={0.78}
        />
        {/* fur shading on the back — long lighter strokes suggest
            individual fur tufts */}
        <path
          d="M -56 -2 Q -30 -10 0 -10 Q 32 -10 56 -2 Q 50 6 30 4 Q 0 -2 -28 4 Q -50 6 -56 -2 Z"
          fill={FUR_HI} opacity={0.55}
        />
        {/* a few hand-drawn fur strokes — mid-back */}
        <path d="M -30 -4 Q -28 -8 -25 -10" stroke={FUR_DARK} strokeWidth={0.7} fill="none" opacity={0.55} strokeLinecap="round" />
        <path d="M -10 -8 Q -8 -12 -5 -14" stroke={FUR_DARK} strokeWidth={0.7} fill="none" opacity={0.55} strokeLinecap="round" />
        <path d="M 14 -8 Q 16 -12 19 -14" stroke={FUR_DARK} strokeWidth={0.7} fill="none" opacity={0.55} strokeLinecap="round" />
        <path d="M 38 -4 Q 40 -8 43 -10" stroke={FUR_DARK} strokeWidth={0.7} fill="none" opacity={0.55} strokeLinecap="round" />

        {/* BACK LEG — large curled paw under rear haunch */}
        <ellipse cx={56} cy={42} rx={22} ry={13} fill={FUR} stroke={LINE} strokeWidth={1.5} />
        <ellipse cx={64} cy={43} rx={9} ry={6.5} fill={PAW_PAD} opacity={0.85} />
        {/* paw pad detail */}
        <circle cx={62} cy={40} r={1.5} fill={PAW_PAD} />
        <circle cx={66} cy={41} r={1.5} fill={PAW_PAD} />
        <circle cx={68} cy={45} r={1.5} fill={PAW_PAD} />
        <circle cx={64} cy={47} r={1.5} fill={PAW_PAD} />
        {/* claws — three small dark crescents */}
        <path d="M 70 36 Q 73 35 73 38" stroke={CLAW} strokeWidth={1.0} fill="none" strokeLinecap="round" />
        <path d="M 73 39 Q 76 38 76 41" stroke={CLAW} strokeWidth={1.0} fill="none" strokeLinecap="round" />
        <path d="M 75 43 Q 77 43 77 46" stroke={CLAW} strokeWidth={1.0} fill="none" strokeLinecap="round" />

        {/* FRONT PAW — folded under the chin, with claws */}
        <ellipse cx={-32} cy={36} rx={18} ry={10} fill={FUR} stroke={LINE} strokeWidth={1.5} />
        <ellipse cx={-42} cy={38} rx={7} ry={5} fill={PAW_PAD} opacity={0.85} />
        <circle cx={-40} cy={36} r={1.3} fill={PAW_PAD} />
        <circle cx={-44} cy={37} r={1.3} fill={PAW_PAD} />
        <circle cx={-46} cy={40} r={1.3} fill={PAW_PAD} />
        {/* front claws */}
        <path d="M -50 34 Q -52 33 -52 36" stroke={CLAW} strokeWidth={0.9} fill="none" strokeLinecap="round" />
        <path d="M -48 38 Q -50 38 -50 41" stroke={CLAW} strokeWidth={0.9} fill="none" strokeLinecap="round" />
      </motion.g>

      {/* HEAD — rests on the moss pillow, gentle breathing-tied micro
          motion + an occasional ear twitch. */}
      <motion.g
        animate={reducedMotion ? undefined : { y: [0, -1, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* far ear (back) — peeks above the head */}
        <g>
          <ellipse cx={-46} cy={6} rx={7} ry={8} fill={FUR_DARK} stroke={LINE} strokeWidth={1.3} />
          <ellipse cx={-46} cy={8} rx={3.5} ry={4.5} fill={BELLY} opacity={0.6} />
        </g>
        {/* near ear — twitches occasionally */}
        <motion.g
          animate={reducedMotion ? undefined : { rotate: [0, 0, 0, 0, -8, 0, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: '-32px', originY: '4px' }}
        >
          <ellipse cx={-32} cy={-2} rx={8} ry={9} fill={FUR} stroke={LINE} strokeWidth={1.4} />
          <ellipse cx={-32} cy={0} rx={4} ry={5} fill={BELLY} opacity={0.7} />
        </motion.g>
        {/* head body — slightly squarer than circle (real bear shape) */}
        <path
          d="M -50 14
             C -52 4, -42 -6, -28 -8
             C -10 -10, 8 -8, 14 6
             C 16 22, 6 32, -14 32
             C -34 32, -50 24, -50 14 Z"
          fill={FUR} stroke={LINE} strokeWidth={2} strokeLinejoin="round"
        />
        {/* head highlight — top of the muzzle */}
        <path
          d="M -34 -4 Q -22 -6 -8 -2 Q -22 0 -34 -2 Z"
          fill={FUR_HI} opacity={0.6}
        />
        {/* MUZZLE — protruding boxy snout, paler */}
        <path
          d="M -42 18
             C -44 14, -42 10, -36 8
             C -28 6, -14 6, -8 10
             C -4 14, -6 22, -14 24
             C -28 26, -40 24, -42 18 Z"
          fill={BELLY} stroke={LINE} strokeWidth={1.3} strokeLinejoin="round"
        />
        {/* nose — chunky black with a small highlight */}
        <ellipse cx={-12} cy={14} rx={3.6} ry={2.6} fill={NOSE} stroke={LINE} strokeWidth={0.9} />
        <ellipse cx={-13} cy={13} rx={1.2} ry={0.7} fill="#FFFFFF" opacity={0.55} />
        {/* nose-to-mouth philtrum line */}
        <line x1={-12} y1={16.5} x2={-12} y2={20} stroke={LINE} strokeWidth={0.7} />
        {/* CLOSED EYES — gentle upturned crescents (sleepy + content) */}
        <path d="M -32 4 Q -28 8 -24 4" stroke={LINE} strokeWidth={1.4} fill="none" strokeLinecap="round" />
        <path d="M -16 4 Q -12 8 -8 4" stroke={LINE} strokeWidth={1.4} fill="none" strokeLinecap="round" />
        {/* tiny eyelash hints */}
        <path d="M -32 5 L -33 7" stroke={LINE} strokeWidth={0.5} strokeLinecap="round" />
        <path d="M -28 6 L -28 8" stroke={LINE} strokeWidth={0.5} strokeLinecap="round" />
        <path d="M -16 5 L -17 7" stroke={LINE} strokeWidth={0.5} strokeLinecap="round" />
        <path d="M -12 6 L -12 8" stroke={LINE} strokeWidth={0.5} strokeLinecap="round" />
        {/* mouth — slight curve, small content smile around the philtrum */}
        <path d="M -16 20 Q -12 22 -8 20" stroke={LINE} strokeWidth={0.9} fill="none" strokeLinecap="round" />
        <path d="M -8 20 Q -10 24 -14 23" stroke={LINE} strokeWidth={0.9} fill="none" strokeLinecap="round" />
        {/* whiskers — three tiny lines on each side of the muzzle */}
        <line x1={-40} y1={16} x2={-46} y2={14} stroke={LINE} strokeWidth={0.5} opacity={0.7} />
        <line x1={-40} y1={18} x2={-47} y2={18} stroke={LINE} strokeWidth={0.5} opacity={0.7} />
        <line x1={-40} y1={20} x2={-46} y2={22} stroke={LINE} strokeWidth={0.5} opacity={0.7} />
      </motion.g>

      {/* COMPANION FIELD MOUSE — curled against the bear's belly,
          tiny + sleeping. Brown-grey with a paler underside, big
          floppy ear, long tail wrapped around itself. */}
      <motion.g
        animate={reducedMotion ? undefined : { scaleY: [1, 1.04, 1] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ originX: '-4px', originY: '50px' }}
      >
        {/* mouse body */}
        <ellipse cx={-4} cy={50} rx={11} ry={6.5} fill="#9C8466" stroke="#3F2817" strokeWidth={0.9} />
        {/* belly */}
        <ellipse cx={-4} cy={52} rx={8} ry={4} fill="#D8C8A8" opacity={0.8} />
        {/* head */}
        <circle cx={4} cy={48} r={4.5} fill="#9C8466" stroke="#3F2817" strokeWidth={0.8} />
        {/* big floppy ear */}
        <ellipse cx={6} cy={45} rx={3} ry={3.5} fill="#9C8466" stroke="#3F2817" strokeWidth={0.7} />
        <ellipse cx={6} cy={45.5} rx={1.6} ry={2.2} fill="#FFB7C5" opacity={0.8} />
        {/* far ear hint */}
        <ellipse cx={2} cy={44.5} rx={2.4} ry={2.8} fill="#7A6A52" stroke="#3F2817" strokeWidth={0.6} />
        {/* nose */}
        <circle cx={8} cy={49} r={0.7} fill="#3F2817" />
        {/* closed eye crescent */}
        <path d="M 4 47 Q 6 48 7 47" stroke="#3F2817" strokeWidth={0.7} fill="none" strokeLinecap="round" />
        {/* tail — long thin curl wrapped around the body */}
        <path
          d="M -14 50 C -22 50, -22 56, -12 56 C 0 56, 0 50, -8 50"
          stroke="#3F2817" strokeWidth={1.2} fill="none" strokeLinecap="round"
        />
        {/* tiny whiskers */}
        <line x1={8} y1={49} x2={11} y2={48} stroke="#3F2817" strokeWidth={0.4} />
        <line x1={8} y1={50} x2={11} y2={50.5} stroke="#3F2817" strokeWidth={0.4} />
      </motion.g>

      {/* a couple of soft warm light particles drifting up off the
          bear (instead of cartoon Zzz). Read as warmth from the
          breathing creature, not as sleep onomatopoeia. */}
      {!reducedMotion && (
        <>
          <motion.circle
            cx={-14} cy={6} r={1.4} fill="#FFE89A"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: [0, 0.7, 0], y: [6, -10, -28] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.circle
            cx={-10} cy={2} r={1.0} fill="#FFE89A"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: [0, 0.55, 0], y: [4, -14, -32] }}
            transition={{ duration: 6, delay: 2.4, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.circle
            cx={-18} cy={4} r={0.8} fill="#FFD06B"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: [0, 0.45, 0], y: [5, -12, -28] }}
            transition={{ duration: 6, delay: 4.0, repeat: Infinity, ease: 'easeOut' }}
          />
        </>
      )}
    </g>
  );
}

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

  // Three stop positions in the cave — left, center-back, right.
  // Center is right under the lantern glow so it reads as the
  // primary stop.
  const STOP_POSITIONS: Array<{ x: number; y: number }> = [
    { x: 470, y: 500 },   // left wall
    { x: 720, y: 380 },   // center-back, under lantern
    { x: 990, y: 500 },   // right wall
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
          {/* Stone-cool radial — cooler than the bunny burrow's earthy
              tone so the two interiors feel distinct. */}
          <radialGradient id="caveGlow" cx="50%" cy="46%" r="65%">
            <stop offset="0%" stopColor="#FFE89A" stopOpacity={0.85} />
            <stop offset="20%" stopColor="#D4B57A" />
            <stop offset="50%" stopColor="#7A6B58" />
            <stop offset="85%" stopColor="#3A2E22" />
            <stop offset="100%" stopColor="#1A1208" />
          </radialGradient>
          <linearGradient id="caveFloor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5A4533" stopOpacity={0} />
            <stop offset="60%" stopColor="#3A2E22" stopOpacity={0.7} />
            <stop offset="100%" stopColor="#1A1208" stopOpacity={0.95} />
          </linearGradient>
        </defs>

        {/* base wash */}
        <rect width={1440} height={800} fill="url(#caveGlow)" />

        {/* Cave-mouth silhouette at the top — reads as "the entrance is
            behind/above us as we look in." Inverted arch hugs the upper
            edge so the cave feels enclosed. */}
        <path
          d="M 0 0 L 0 240
             Q 100 160 220 130
             Q 380 100 540 90
             Q 720 84 900 90
             Q 1060 100 1220 130
             Q 1340 160 1440 240
             L 1440 0 Z"
          fill="#1A1208" opacity={0.92}
        />

        {/* MINERAL VEINS — pale streaks through the dark cave wall.
            Adds geological character to the otherwise flat darkness. */}
        <g pointerEvents="none">
          <path d="M 60 240 Q 120 220 180 250 Q 240 280 300 260"
                stroke="#A8B4C8" strokeWidth={1.2} fill="none" opacity={0.35} strokeLinecap="round" />
          <path d="M 60 240 Q 120 220 180 250 Q 240 280 300 260"
                stroke="#FFFFFF" strokeWidth={0.4} fill="none" opacity={0.3} strokeLinecap="round" />
          <path d="M 1100 260 Q 1180 240 1260 270 Q 1340 290 1400 270"
                stroke="#A8B4C8" strokeWidth={1.2} fill="none" opacity={0.35} strokeLinecap="round" />
          <path d="M 1100 260 Q 1180 240 1260 270 Q 1340 290 1400 270"
                stroke="#FFFFFF" strokeWidth={0.4} fill="none" opacity={0.3} strokeLinecap="round" />
          <path d="M 200 540 Q 140 580 80 560"
                stroke="#A8B4C8" strokeWidth={1.0} fill="none" opacity={0.30} strokeLinecap="round" />
          <path d="M 1240 560 Q 1320 580 1380 540"
                stroke="#A8B4C8" strokeWidth={1.0} fill="none" opacity={0.30} strokeLinecap="round" />
        </g>

        {/* CAVE PICTOGRAPHS — simple ochre wall drawings on the back
            wall behind the central skill stop. Like ancient cave
            paintings: a stick-figure deer, a stick-figure sun, a
            small handprint. Reads as "this place has history." */}
        <g pointerEvents="none" opacity={0.55}>
          {/* deer outline */}
          <g transform="translate(610, 320)">
            <path d="M 0 0 L 0 -10 L -3 -14 L -3 -10 M 0 -10 L 6 -10 L 9 -14 L 9 -10
                     M 0 -3 L 14 -3 L 14 -10 L 18 -10 L 18 -16 L 22 -16 L 22 -10 L 26 -10 L 26 -3
                     M 14 -3 L 14 6 M 22 -3 L 22 6"
                  stroke="#C4763A" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          {/* sun pictograph */}
          <g transform="translate(680, 280)">
            <circle cx={0} cy={0} r={6} fill="none" stroke="#C4763A" strokeWidth={1.6} />
            {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
              const rad = (deg * Math.PI) / 180;
              return (
                <line key={deg} x1={Math.cos(rad) * 8} y1={Math.sin(rad) * 8}
                      x2={Math.cos(rad) * 13} y2={Math.sin(rad) * 13}
                      stroke="#C4763A" strokeWidth={1.4} strokeLinecap="round" />
              );
            })}
          </g>
          {/* small handprint — five fingers + palm */}
          <g transform="translate(820, 320)">
            <ellipse cx={0} cy={2} rx={5} ry={6} fill="#C4763A" />
            <ellipse cx={-5} cy={-3} rx={1.4} ry={3} fill="#C4763A" transform="rotate(-30 -5 -3)" />
            <ellipse cx={-2} cy={-7} rx={1.4} ry={3.5} fill="#C4763A" />
            <ellipse cx={2}  cy={-8} rx={1.4} ry={3.5} fill="#C4763A" />
            <ellipse cx={5}  cy={-6} rx={1.4} ry={3} fill="#C4763A" />
            <ellipse cx={7}  cy={-2} rx={1.4} ry={2.5} fill="#C4763A" transform="rotate(30 7 -2)" />
          </g>
          {/* spiral pictograph */}
          <g transform="translate(880, 280)">
            <path d="M 0 0 Q 4 -4 8 0 Q 8 6 0 6 Q -8 6 -8 -2 Q -8 -10 4 -10 Q 14 -10 14 0"
                  stroke="#C4763A" strokeWidth={1.4} fill="none" strokeLinecap="round" />
          </g>
        </g>

        {/* Stalactites hanging from the cave roof — varied shapes.
            One drips water (animated). */}
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
            {/* small wet sheen on the tip of each stalactite */}
            <ellipse cx={st.x} cy={130 + st.h - 1} rx={1.5} ry={0.6}
                     fill="#A8CDD2" opacity={0.6} />
            {/* dripping water animation on one chosen stalactite */}
            {st.drips && !reducedMotion && (
              <>
                <motion.circle
                  cx={st.x} cy={130 + st.h + 6} r={1.6} fill="#A8CDD2"
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: [0, 0.85, 0.85, 0], y: [0, 60, 110, 130] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeIn', times: [0, 0.05, 0.85, 1] }}
                />
                {/* impact ripple at the floor */}
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

        {/* HANGING BATS — three tiny silhouettes hanging upside-down
            from the cave ceiling, far back. Just enough to register as
            "bats live here" without dominating. */}
        {[
          { x: 270,  rotation: 8 },
          { x: 740,  rotation: -6 },
          { x: 1180, rotation: 4 },
        ].map((b, i) => (
          <g key={`bat-${i}`} transform={`translate(${b.x}, 130) rotate(${b.rotation})`} pointerEvents="none">
            {/* tether line */}
            <line x1={0} y1={0} x2={0} y2={2} stroke="#1A1208" strokeWidth={0.8} />
            {/* body — small dark teardrop hanging upside down */}
            <ellipse cx={0} cy={8} rx={3} ry={5} fill="#1A1208" />
            {/* folded wings — dark V shapes */}
            <path d="M 0 6 L -7 4 L -5 10 Z" fill="#1A1208" />
            <path d="M 0 6 L 7 4 L 5 10 Z" fill="#1A1208" />
            {/* tiny ear bumps */}
            <circle cx={-1.2} cy={4} r={0.8} fill="#1A1208" />
            <circle cx={1.2}  cy={4} r={0.8} fill="#1A1208" />
          </g>
        ))}

        {/* Hanging moss + vines from the upper-back */}
        {[210, 380, 660, 850, 1080, 1280].map((x, i) => (
          <g key={`vine-${i}`}>
            <path
              d={`M ${x} 120 Q ${x + (i % 2 === 0 ? -3 : 4)} 160 ${x - 4} 200`}
              stroke="#5C7E4F" strokeWidth={1.3} fill="none" strokeLinecap="round" opacity={0.7}
            />
            <ellipse cx={x - 2} cy={148} rx={2.4} ry={1.6} fill="#7BA46F" opacity={0.78} />
            <ellipse cx={x - 4} cy={178} rx={2} ry={1.4} fill="#A2C794" opacity={0.66} />
          </g>
        ))}

        {/* Glowing crystals embedded in the walls — small bluish gems */}
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

        {/* Floor — dark stone with a soft gradient toward the bottom */}
        <ellipse cx={720} cy={760} rx={760} ry={70} fill="#3A2E22" opacity={0.85} />
        <rect x={0} y={620} width={1440} height={180} fill="url(#caveFloor)" />

        {/* STALAGMITES rising from the floor — counterparts to the
            hanging stalactites, varied widths/heights. */}
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
            {/* lighter stripe — texture */}
            <path
              d={`M ${sg.x - sg.w * 0.5} 720 L ${sg.x + sg.w * 0.2} 720 L ${sg.x - sg.w * 0.1} ${720 - sg.h * 0.7}`}
              stroke="#5A4533" strokeWidth={0.8} fill="none" opacity={0.6}
            />
            {/* tiny moss clump at the base of one */}
            {i === 1 && (
              <ellipse cx={sg.x} cy={720} rx={sg.w * 0.7} ry={2} fill="#5C7E4F" opacity={0.6} />
            )}
          </g>
        ))}

        {/* GLOWING MUSHROOMS clustered near the back wall — bioluminescent
            blue-green (matches the gem palette). Adds magical undergrowth. */}
        {[
          { x: 360, y: 690, scale: 1.2, glow: '#B5DDE6' },
          { x: 870, y: 696, scale: 1.0, glow: '#B5DDE6' },
          { x: 1250, y: 690, scale: 1.1, glow: '#C8E5EC' },
        ].map((m, i) => (
          <g key={`gmu-${i}`} transform={`translate(${m.x}, ${m.y}) scale(${m.scale})`} pointerEvents="none">
            {/* glow halo */}
            {!reducedMotion && (
              <motion.ellipse
                cx={0} cy={-8} rx={20} ry={14} fill={m.glow}
                animate={{ opacity: [0.10, 0.28, 0.10] }}
                transition={{ duration: 4 + i * 0.6, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            {/* shadow */}
            <ellipse cx={2} cy={6} rx={14} ry={2.5} fill="#000" opacity={0.4} />
            {/* tall stalk */}
            <path d="M -2 4 C -3 -2, -3 -8, -2 -10 L 2 -10 C 3 -8, 3 -2, 2 4 Z"
                  fill="#FFFAF2" stroke="#5A4533" strokeWidth={0.8} strokeLinejoin="round" />
            {/* glowing cap */}
            <path d="M -10 -8 C -12 -16, -4 -22, 0 -22 C 4 -22, 12 -16, 10 -8 Z"
                  fill={m.glow} stroke="#5A8F95" strokeWidth={1.0} strokeLinejoin="round" />
            {/* cap inner highlight */}
            <path d="M -6 -14 Q 0 -20 6 -16" stroke="#FFFFFF" strokeWidth={1.2}
                  fill="none" opacity={0.65} strokeLinecap="round" />
            {/* gill underside */}
            <path d="M -8 -8 L -8 -6 M -4 -10 L -4 -8 M 0 -10 L 0 -8 M 4 -10 L 4 -8 M 8 -8 L 8 -6"
                  stroke="#5A8F95" strokeWidth={0.7} opacity={0.7} />
            {/* tiny smaller mushroom beside */}
            <path d="M -16 -2 C -18 -8, -12 -10, -10 -10 L -10 -8 L -8 -2 Z"
                  fill={m.glow} stroke="#5A8F95" strokeWidth={0.7} strokeLinejoin="round" opacity={0.85} />
          </g>
        ))}

        {/* SMALL STONE CAIRN beside the bear — feels like someone built
            it. Adds purposeful inhabited-ness to the cave. */}
        <g transform="translate(120, 700)" pointerEvents="none">
          <ellipse cx={0} cy={26} rx={20} ry={3} fill="#000" opacity={0.32} />
          {/* base stone */}
          <ellipse cx={0} cy={20} rx={18} ry={5} fill="#7A6B58" stroke="#3F3026" strokeWidth={1.2} />
          <ellipse cx={-2} cy={18} rx={14} ry={3} fill="#9B8868" opacity={0.7} />
          {/* mid stone */}
          <ellipse cx={1} cy={11} rx={13} ry={4} fill="#5A4533" stroke="#1A1208" strokeWidth={1.2} />
          <ellipse cx={-1} cy={9} rx={9} ry={2} fill="#7A6B58" opacity={0.7} />
          {/* small top stone */}
          <ellipse cx={0} cy={4} rx={8} ry={2.5} fill="#7A6B58" stroke="#3F3026" strokeWidth={1.0} />
          <ellipse cx={-1} cy={3} rx={5} ry={1.4} fill="#9B8868" opacity={0.7} />
          {/* tiny moss tuft on the base */}
          <ellipse cx={-14} cy={20} rx={4} ry={1.6} fill="#5C7E4F" opacity={0.65} />
        </g>

        {/* River outflow at the right — mirrors the cave-mouth river on
            the Mountain scene. The cave is the river's source; here we
            see it pooling in a small stone basin before it flows out. */}
        <g pointerEvents="none">
          <ellipse cx={1280} cy={740} rx={130} ry={22} fill="#4A6E72" opacity={0.6} />
          <ellipse cx={1280} cy={736} rx={114} ry={18} fill="#7FA9B0" />
          <ellipse cx={1280} cy={732} rx={92} ry={12} fill="#A8CDD2" opacity={0.7} />
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
        </g>

        {/* HANGING LANTERN — proper chain (not a straight line),
            ornate cage frame, flickering flame inside. Anchors the
            center of the cave with warmth. */}
        {/* CHAIN — 8 alternating oval links from ceiling to lantern hood */}
        {[130, 144, 158, 172, 186, 200, 214, 228, 242].map((cy, i) => (
          <ellipse key={`cvl-${i}`} cx={720} cy={cy + 6} rx={3.2} ry={5}
                   fill="none" stroke={i % 2 === 0 ? '#5A3B1F' : '#7B4F2C'}
                   strokeWidth={1.5} />
        ))}
        {/* lantern HOOD — pitched cap on top */}
        <path d="M 700 254 L 740 254 L 736 244 L 704 244 Z"
              fill="#5A3B1F" stroke="#1A1208" strokeWidth={1.4} strokeLinejoin="round" />
        <path d="M 706 244 L 720 238 L 734 244 Z"
              fill="#3F2614" stroke="#1A1208" strokeWidth={1.4} strokeLinejoin="round" />
        {/* small finial on the hood top */}
        <circle cx={720} cy={236} r={1.6} fill="#5A3B1F" stroke="#1A1208" strokeWidth={0.8} />
        {/* lantern BODY — cage frame */}
        <path d="M 702 254 L 738 254 L 740 286 L 700 286 Z"
              fill="#3F2614" stroke="#1A1208" strokeWidth={1.5} strokeLinejoin="round" />
        {/* glass panel — golden glow inside */}
        <rect x={708} y={258} width={24} height={24} fill="#FFD06B" />
        {/* horizontal cage band at top + bottom */}
        <line x1={702} y1={262} x2={738} y2={262} stroke="#1A1208" strokeWidth={0.9} />
        <line x1={702} y1={278} x2={738} y2={278} stroke="#1A1208" strokeWidth={0.9} />
        {/* vertical cage bars */}
        <line x1={714} y1={258} x2={714} y2={282} stroke="#1A1208" strokeWidth={0.9} />
        <line x1={720} y1={258} x2={720} y2={282} stroke="#1A1208" strokeWidth={0.9} />
        <line x1={726} y1={258} x2={726} y2={282} stroke="#1A1208" strokeWidth={0.9} />
        {/* corner rivets */}
        <circle cx={704} cy={258} r={1.1} fill="#5A3B1F" stroke="#1A1208" strokeWidth={0.4} />
        <circle cx={736} cy={258} r={1.1} fill="#5A3B1F" stroke="#1A1208" strokeWidth={0.4} />
        <circle cx={704} cy={282} r={1.1} fill="#5A3B1F" stroke="#1A1208" strokeWidth={0.4} />
        <circle cx={736} cy={282} r={1.1} fill="#5A3B1F" stroke="#1A1208" strokeWidth={0.4} />
        {/* lantern BASE */}
        <path d="M 700 286 L 740 286 L 738 292 L 702 292 Z"
              fill="#5A3B1F" stroke="#1A1208" strokeWidth={1.3} strokeLinejoin="round" />
        {/* FLAME inside — animated flicker shape */}
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
        {/* inner flame glow */}
        <path d="M 720 277 C 718 274, 718 270, 720 268 C 722 270, 722 274, 720 277 Z"
              fill="#FFD06B" />
        {/* warm pool of light from the lantern */}
        <ellipse cx={720} cy={290} rx={210} ry={140} fill="#FFD06B" opacity={0.18} />
        <ellipse cx={720} cy={290} rx={110}  ry={70}  fill="#FFE89A" opacity={0.20} />

        {/* Sleeping bear */}
        <SleepyBear reducedMotion={reducedMotion} />

        {/* SKILL STOPS — the three cave skills as glowing pins */}
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

              {/* warm halo behind unlocked structures */}
              {stop.unlocked && !stop.completed && (
                <circle r={36} fill="#FFE89A" opacity={0.22} />
              )}
              {stop.completed && (
                <circle r={40} fill="#FFD93D" opacity={0.28} />
              )}

              {/* stone plinth — the cave is rocky, so structures sit on a
                  small mossy stone */}
              <ellipse cx={2} cy={26} rx={32} ry={6} fill="#000" opacity={0.4} />
              <ellipse cx={0} cy={22} rx={28} ry={9} fill="#5A4533" stroke="#1A1208" strokeWidth={1.4} />
              <ellipse cx={-2} cy={19} rx={22} ry={5} fill="#7A6B58" />
              <ellipse cx={0} cy={16} rx={24} ry={4} fill="#7BA46F" opacity={0.7} />

              {/* the structure emoji itself */}
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

              {/* lock badge */}
              {!stop.unlocked && (
                <g pointerEvents="none">
                  <circle cx={20} cy={-22} r={10}
                          fill="#FFFAF2" stroke="#8A7E6C" strokeWidth={1.3} />
                  <text x={20} y={-19} fontSize={12} textAnchor="middle"
                        style={{ userSelect: 'none' }}>🔒</text>
                </g>
              )}

              {/* completed check */}
              {stop.completed && (
                <g pointerEvents="none">
                  <circle cx={20} cy={-22} r={10}
                          fill="#6B8E5A" stroke="#4F6F42" strokeWidth={1.3} />
                  <path
                    d="M 16 -22 L 19 -19 L 24 -25"
                    stroke="#FFFFFF" strokeWidth={1.8} fill="none"
                    strokeLinecap="round" strokeLinejoin="round"
                  />
                </g>
              )}

              {/* label pill */}
              <rect
                x={-58} y={32} width={116} height={18} rx={9}
                fill={stop.completed ? '#FFF6CC' : stop.unlocked ? '#FFFAF2' : '#3A2E22'}
                stroke={stop.completed ? '#D4B43E' : stop.unlocked ? '#E8A87C' : '#5A4533'}
                strokeWidth={1.2}
              />
              <text
                x={0} y={45} textAnchor="middle"
                fontSize={10.5} fontWeight={700}
                fill={stop.unlocked ? '#6b4423' : '#C8BCAA'}
                style={{ userSelect: 'none' }}
              >
                {stop.label}
              </text>

              {/* prereq tooltip on locked tap */}
              {isTappedLocked && (
                <g pointerEvents="none">
                  <rect
                    x={-100} y={-72} width={200} height={28} rx={8}
                    fill="#fffaf2" stroke="#c38d9e" strokeWidth={1.5}
                  />
                  <text
                    x={0} y={-54} textAnchor="middle"
                    fontSize={10} fontStyle="italic" fill="#6b4423"
                  >
                    {stop.prereqDisplay || 'finish an earlier stop first'}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* DISCOVERED SPECIES — small animated figures along the floor.
            None for now (operations_cave attractsSpeciesCodes is empty),
            but the slot is here so when species are added later they
            appear automatically. */}
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

        {/* UNDISCOVERED SLOTS — only show if there are species to discover */}
        {undiscoveredCount > 0 && Array.from({ length: undiscoveredCount }).map((_, i) => {
          const x = 320 + (discoveredSpecies.length + i) * 150;
          const y = 730;
          return (
            <g key={`undiscovered-${i}`} opacity={0.25}>
              <text x={x} y={y} textAnchor="middle" fontSize={28} style={{ filter: 'grayscale(1)' }}>
                ❓
              </text>
              <rect x={x - 50} y={y + 8} width={100} height={16} rx={4} fill="rgba(90,69,51,0.85)" />
              <text x={x} y={y + 20} textAnchor="middle" fontSize={9} fontStyle="italic" fill="#C8BCAA">
                ? ? ?
              </text>
            </g>
          );
        })}
      </svg>
    </HabitatInteriorLayout>
  );
}
