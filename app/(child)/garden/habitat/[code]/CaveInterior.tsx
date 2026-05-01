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

// Sleepy bear — peach-belly, dark fur, eyes closed, breathing animation.
// Drawn in the same hand-illustrated style as the SisterWalkers on the
// central garden so the cave's resident reads as part of the same world.
function SleepyBear({ reducedMotion }: { reducedMotion: boolean }) {
  const LINE = '#3F2817';
  const FUR = '#6B4423';
  const FUR_HI = '#8A5A3C';
  const BELLY = '#D4A88A';
  const NOSE = '#2A1810';

  return (
    <g transform="translate(230, 660)">
      {/* ground shadow */}
      <ellipse cx={0} cy={70} rx={80} ry={10} fill="#000" opacity={0.32} />

      {/* TAIL — small fluff behind */}
      <ellipse cx={-58} cy={32} rx={8} ry={6} fill={FUR} stroke={LINE} strokeWidth={1.4} />

      {/* BODY — large round sleeping curl, paws tucked */}
      <ellipse cx={0} cy={36} rx={62} ry={32} fill={FUR} stroke={LINE} strokeWidth={2} />
      {/* belly highlight */}
      <ellipse cx={4} cy={40} rx={42} ry={20} fill={BELLY} opacity={0.85} />
      {/* fur shading on the back */}
      <path
        d="M -56 14 Q -30 4 0 6 Q 32 4 56 14 Q 50 22 30 22 Q 0 16 -28 22 Q -50 22 -56 14 Z"
        fill={FUR_HI} opacity={0.6}
      />

      {/* BACK LEG curled under */}
      <ellipse cx={42} cy={56} rx={20} ry={12} fill={FUR} stroke={LINE} strokeWidth={1.5} />
      <ellipse cx={48} cy={56} rx={6} ry={4} fill={NOSE} opacity={0.55} />
      {/* tiny pad pads */}
      <circle cx={45} cy={54} r={1} fill={NOSE} opacity={0.7} />
      <circle cx={49} cy={54} r={1} fill={NOSE} opacity={0.7} />
      <circle cx={52} cy={56} r={1} fill={NOSE} opacity={0.7} />

      {/* FRONT PAW tucked under chin */}
      <ellipse cx={-30} cy={50} rx={14} ry={8} fill={FUR} stroke={LINE} strokeWidth={1.5} />

      {/* HEAD — resting on the front paw */}
      {/* breathing animation: gentle rotate + scale on the head group */}
      <motion.g
        animate={reducedMotion ? undefined : { y: [0, -1, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* ear back */}
        <ellipse cx={-58} cy={20} rx={8} ry={9} fill={FUR} stroke={LINE} strokeWidth={1.4} />
        <ellipse cx={-58} cy={22} rx={4} ry={5} fill={BELLY} opacity={0.7} />
        {/* ear front */}
        <ellipse cx={-46} cy={14} rx={8} ry={9} fill={FUR} stroke={LINE} strokeWidth={1.4} />
        <ellipse cx={-46} cy={16} rx={4} ry={5} fill={BELLY} opacity={0.7} />
        {/* head */}
        <ellipse cx={-44} cy={32} rx={22} ry={20} fill={FUR} stroke={LINE} strokeWidth={2} />
        {/* muzzle — paler patch */}
        <ellipse cx={-48} cy={42} rx={14} ry={9} fill={BELLY} stroke={LINE} strokeWidth={1.2} />
        {/* nose */}
        <ellipse cx={-58} cy={40} rx={2.6} ry={2} fill={NOSE} stroke={LINE} strokeWidth={0.8} />
        {/* closed-eye crescents — sleeping */}
        <path d="M -52 28 Q -49 30 -46 28" stroke={LINE} strokeWidth={1.3} fill="none" strokeLinecap="round" />
        <path d="M -40 28 Q -37 30 -34 28" stroke={LINE} strokeWidth={1.3} fill="none" strokeLinecap="round" />
        {/* eyebrow tufts */}
        <path d="M -52 25 Q -49 24 -46 25" stroke={LINE} strokeWidth={0.7} fill="none" opacity={0.6} />
        <path d="M -40 25 Q -37 24 -34 25" stroke={LINE} strokeWidth={0.7} fill="none" opacity={0.6} />
        {/* mouth — small content smile */}
        <path d="M -52 46 Q -56 48 -58 47" stroke={LINE} strokeWidth={0.9} fill="none" strokeLinecap="round" />
      </motion.g>

      {/* ZZZ — drifts up from the bear's nose, fades */}
      {!reducedMotion && (
        <>
          <motion.text
            x={-66} y={10} fontSize={14} fontWeight={700}
            fill="#FFFAF2" fontFamily="ui-serif, Georgia, serif" fontStyle="italic"
            initial={{ opacity: 0, y: 14, x: -66 }}
            animate={{ opacity: [0, 0.85, 0], y: [10, -8, -22], x: [-66, -72, -78] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeOut' }}
            style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))' }}
          >z</motion.text>
          <motion.text
            x={-60} y={4} fontSize={11} fontWeight={700}
            fill="#FFFAF2" fontFamily="ui-serif, Georgia, serif" fontStyle="italic"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: [0, 0.7, 0], y: [8, -10, -22], x: [-60, -64, -68] }}
            transition={{ duration: 5, delay: 1.6, repeat: Infinity, ease: 'easeOut' }}
            style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))' }}
          >z</motion.text>
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

        {/* Stalactites hanging from the cave roof */}
        {[
          { x: 180, h: 44 }, { x: 340, h: 60 }, { x: 480, h: 36 },
          { x: 600, h: 70 }, { x: 820, h: 48 }, { x: 960, h: 62 },
          { x: 1100, h: 38 }, { x: 1260, h: 56 },
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

        {/* Hanging lantern + warm glow — anchors the center of the cave */}
        <line x1={720} y1={130} x2={720} y2={250} stroke="#5A3B1F" strokeWidth={2.4} />
        {/* lantern frame */}
        <rect x={708} y={250} width={24} height={28} rx={2} fill="#3F2614" stroke="#1A1208" strokeWidth={1.5} />
        <rect x={712} y={254} width={16} height={20} rx={1} fill="#FFD06B" />
        <line x1={714} y1={254} x2={714} y2={274} stroke="#1A1208" strokeWidth={0.7} />
        <line x1={720} y1={254} x2={720} y2={274} stroke="#1A1208" strokeWidth={0.7} />
        <line x1={726} y1={254} x2={726} y2={274} stroke="#1A1208" strokeWidth={0.7} />
        <path d="M 706 250 L 720 244 L 734 250 Z" fill="#3F2614" stroke="#1A1208" strokeWidth={1.4} />
        {/* warm pool of light from the lantern */}
        <ellipse cx={720} cy={264} rx={180} ry={120} fill="#FFD06B" opacity={0.18} />
        <ellipse cx={720} cy={264} rx={90}  ry={60}  fill="#FFE89A" opacity={0.18} />
        {/* lantern flicker */}
        {!reducedMotion && (
          <motion.rect
            x={712} y={254} width={16} height={20} rx={1} fill="#FFF4C2"
            animate={{ opacity: [0.4, 0.85, 0.5, 0.85, 0.4] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

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
