// app/(child)/garden/habitat/[code]/OwlBoxInterior.tsx
//
// The owl box — the Reading Forest's first habitat.
//
// Cecily spotted the hole before anyone else: every animal home in this
// world was in the garden, and the two on the mountain are the cave and
// her cavern. The Forest had nothing.
//
// You are UP AT THE BOX, at night, level with the hole. That is the
// whole idea — a screech-owl is the size of a soda can and lives in
// ordinary neighborhoods, and almost nobody ever sees one, so the
// screen puts her where a person cannot normally stand.
//
// Night, because both residents are nocturnal. Going to see them at
// noon would be a lie, and it also gives the Forest a scene that looks
// like nothing else in the app.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { SpeciesData } from '@/lib/world/speciesCatalog';
import { SpeciesIllustration } from '@/components/child/garden/speciesIllustrations';
import HabitatInteriorLayout from '@/components/child/garden/HabitatInteriorLayout';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';

const VB_W = 700;
const VB_H = 1100;

/** Fixed scatter, so the sky is the same sky every visit. */
const STARS = Array.from({ length: 70 }, (_, i) => {
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233) * 12345.6789;
  return {
    x: (a - Math.floor(a)) * VB_W,
    y: (b - Math.floor(b)) * 620,
    r: 0.7 + (a - Math.floor(a)) * 1.4,
    o: 0.3 + (b - Math.floor(b)) * 0.55,
  };
});

export default function OwlBoxInterior({
  learnerId, themedSkillCode, themedStructureLabel, themedStructureEmoji,
  discoveredSpecies, undiscoveredCount,
}: {
  learnerId: string;
  themedSkillCode: string;
  themedStructureLabel: string;
  themedStructureEmoji: string;
  discoveredSpecies: SpeciesData[];
  undiscoveredCount: number;
}) {
  const router = useRouter();
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
  const [starting, setStarting] = useState(false);

  const startSkill = async () => {
    if (starting) return;
    setStarting(true);
    try {
      const res = await fetch('/api/session', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, skillCode: themedSkillCode }),
      });
      const d = await res.json();
      if (d.sessionId) router.push(`/lesson/${d.sessionId}`);
      else setStarting(false);
    } catch { setStarting(false); }
  };

  // Along the branch, in front of the trunk.
  const slot = (i: number) => ({ x: 118 + (i % 3) * 232, y: 830 + Math.floor(i / 3) * 116 });

  return (
    <HabitatInteriorLayout learnerId={learnerId} title="Owl Box" iconEmoji="🦉">
      <div aria-hidden className="absolute inset-0"
           style={{ background: 'linear-gradient(#0A1024, #16223E 45%, #1E2A22)' }} />
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="ob-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0A1024" />
            <stop offset="100%" stopColor="#26364E" />
          </linearGradient>
          <linearGradient id="ob-bark" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2E2519" />
            <stop offset="35%" stopColor="#5A4A32" />
            <stop offset="100%" stopColor="#241C12" />
          </linearGradient>
          <radialGradient id="ob-moon" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F6F1DC" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#F6F1DC" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x={-40} y={-40} width={VB_W + 80} height={720} fill="url(#ob-sky)" />
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#EAF0FF" opacity={s.o} />
        ))}
        <circle cx={558} cy={150} r={92} fill="url(#ob-moon)" />
        <circle cx={558} cy={150} r={44} fill="#F8F3DE" />
        <circle cx={544} cy={138} r={8} fill="#E4DCC0" opacity={0.6} />
        <circle cx={572} cy={162} r={11} fill="#E4DCC0" opacity={0.5} />

        {/* far woods, so the tree stands in front of something */}
        {[[60, 640, 90], [180, 660, 70], [300, 636, 100], [470, 664, 78], [620, 644, 92]]
          .map(([tx, ty, th], i) => (
          <g key={i} opacity={0.5}>
            <rect x={tx - 5} y={ty - th * 0.3} width={10} height={th * 0.4} fill="#16221A" />
            <path d={`M ${tx} ${ty - th} L ${tx - 38} ${ty - th * 0.25} L ${tx + 38} ${ty - th * 0.25} Z`}
                  fill="#1B2A20" />
          </g>
        ))}

        {/* the forest floor, a long way down */}
        <path d={`M -40 690 Q 240 664 ${VB_W + 40} 700 L ${VB_W + 40} ${VB_H + 40} L -40 ${VB_H + 40} Z`}
              fill="#1A2418" />

        {/* ── THE TRUNK — she is level with it, high up ─────────── */}
        <rect x={196} y={-40} width={210} height={VB_H + 80} fill="url(#ob-bark)" />
        {[212, 246, 288, 330, 372].map(bx => (
          <path key={bx} d={`M ${bx} -20 q ${bx % 3 ? 8 : -8} 300 0 620 q ${bx % 2 ? -6 : 6} 300 0 520`}
                stroke="#1E1710" strokeWidth={3} fill="none" opacity={0.55} />
        ))}

        {/* a branch running out to the right, for perching on */}
        <path d="M 400 742 Q 520 726 660 748" stroke="#3E3222" strokeWidth={22}
              fill="none" strokeLinecap="round" />
        <path d="M 400 738 Q 520 722 660 744" stroke="#5A4A32" strokeWidth={9}
              fill="none" strokeLinecap="round" />

        {/* ── THE BOX ────────────────────────────────────────────── */}
        <g transform="translate(300, 330)">
          <ellipse cx={4} cy={172} rx={92} ry={12} fill="#000" opacity={0.3} />
          {/* body */}
          <rect x={-84} y={0} width={168} height={168} rx={4}
                fill="#8A6238" stroke="#3F2C1A" strokeWidth={4} />
          {/* plank lines, so it is boards somebody cut */}
          {[42, 84, 126].map(y => (
            <line key={y} x1={-84} y1={y} x2={84} y2={y} stroke="#5C3F22" strokeWidth={2.5} />
          ))}
          {/* sloped roof with an overhang, to keep rain off the hole */}
          <path d="M -100 4 L 100 4 L 84 -26 L -84 -26 Z"
                fill="#6B4A28" stroke="#3F2C1A" strokeWidth={4} strokeLinejoin="round" />
          {/* THE HOLE — small on purpose, which is a quest question */}
          <circle cx={0} cy={62} r={30} fill="#0D0A06" stroke="#3F2C1A" strokeWidth={4} />
          <path d="M -26 48 A 30 30 0 0 1 20 42" stroke="#A87A4A" strokeWidth={4}
                fill="none" strokeLinecap="round" opacity={0.55} />
          {/* the owl looking out of it */}
          <g transform="translate(0, 66)">
            <motion.g
              animate={reducedMotion ? undefined : { y: [0, -2.5, 0] }}
              transition={reducedMotion ? undefined : { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ellipse cx={0} cy={4} rx={19} ry={17} fill="#8A8074" />
              <path d="M -14 -8 L -17 -20 L -7 -13 Z" fill="#8A8074" />
              <path d="M 14 -8 L 17 -20 L 7 -13 Z" fill="#8A8074" />
              <path d="M -13 -6 Q 0 -12 13 -6 Q 15 6 0 10 Q -15 6 -13 -6 Z" fill="#CFC6B6" />
              <circle cx={-6} cy={-1} r={5.5} fill="#F5C542" />
              <circle cx={6} cy={-1} r={5.5} fill="#F5C542" />
              <circle cx={-6} cy={-1} r={2.8} fill="#1A140E" />
              <circle cx={6} cy={-1} r={2.8} fill="#1A140E" />
              <path d="M 0 3 L -2.5 8 Q 0 10 2.5 8 Z" fill="#D8C9A8" />
            </motion.g>
          </g>
          {/* mounting strap and the shavings ledge */}
          <rect x={-96} y={54} width={12} height={80} rx={3} fill="#4E463C" stroke="#2A241C" strokeWidth={2} />
          <rect x={84} y={54} width={12} height={80} rx={3} fill="#4E463C" stroke="#2A241C" strokeWidth={2} />
        </g>

        {/* ── THE NIGHT LOG — the reading stop ───────────────────── */}
        <g transform="translate(546, 690)"
           style={{ cursor: 'pointer', touchAction: 'manipulation' }}
           onClick={startSkill} role="button" aria-label={themedStructureLabel}>
          <rect x={-96} y={-72} width={192} height={150} fill="transparent" />
          {!reducedMotion && (
            <motion.ellipse cx={0} cy={0} rx={62} ry={44} fill="#FFE89A"
              animate={{ opacity: [0.08, 0.24, 0.08] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }} />
          )}
          {/* a notebook propped in the fork of the branch */}
          <g transform="rotate(-8)">
            <rect x={-46} y={-40} width={92} height={68} rx={4}
                  fill="#F2E8D0" stroke="#5A4A32" strokeWidth={3} />
            <rect x={-46} y={-40} width={20} height={68} rx={4} fill="#C07A4E" stroke="#5A4A32" strokeWidth={3} />
            {[-24, -12, 0, 12].map(y => (
              <line key={y} x1={-18} y1={y} x2={38} y2={y} stroke="#9A8C76" strokeWidth={2.2} />
            ))}
          </g>
          <rect x={-72} y={40} width={144} height={20} rx={10}
                fill="rgba(255,250,242,0.94)" stroke="#6b8e5a" strokeWidth={1.2} />
          <text y={54} textAnchor="middle" fontSize={11} fontWeight={700} fill="#3f2614">
            {starting ? 'starting…' : themedStructureLabel}
          </text>
        </g>

        {/* ── who has been seen at the box ───────────────────────── */}
        {discoveredSpecies.map((sp, i) => {
          const { x, y } = slot(i);
          return (
            <motion.g key={sp.code}
              animate={reducedMotion ? undefined : { y: [0, -4, 0] }}
              transition={reducedMotion ? undefined : {
                duration: 3.4 + (i % 3) * 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4,
              }}
            >
              <g transform={`translate(${x - 34}, ${y - 34})`}>
                {SpeciesIllustration({ code: sp.illustrationKey, size: 68 })
                  ?? <text x={34} y={44} textAnchor="middle" fontSize={40}>{sp.emoji}</text>}
              </g>
              <rect x={x - 66} y={y + 38} width={132} height={19} rx={5}
                    fill="rgba(20,28,20,0.85)" />
              <text x={x} y={y + 51} textAnchor="middle" fontSize={9.5}
                    fontWeight={700} fill="#DCE8CE">
                {sp.commonName}
              </text>
            </motion.g>
          );
        })}
        {Array.from({ length: undiscoveredCount }).map((_, i) => {
          const { x, y } = slot(discoveredSpecies.length + i);
          return (
            <g key={`unknown-${i}`} opacity={0.45}>
              <text x={x} y={y + 6} textAnchor="middle" fontSize={22}
                    fontStyle="italic" fill="#8FA6D8">?</text>
              <rect x={x - 66} y={y + 38} width={132} height={19} rx={5}
                    fill="rgba(20,28,20,0.6)" />
              <text x={x} y={y + 51} textAnchor="middle" fontSize={9}
                    fontStyle="italic" fill="#AFC4EA">
                not yet
              </text>
            </g>
          );
        })}
      </svg>
    </HabitatInteriorLayout>
  );
}
