// app/(child)/garden/habitat/[code]/PondInterior.tsx
//
// Inside the frog pond — the water's edge, seen low and close, the way
// a child lying on the bank would see it.
//
// Built because four of the six habitats had no interior at all, so
// "step inside" was a dead end (and, until today, a 404). The pond
// matters most of the four: it is where the painted turtle and the
// spotted salamander arrive, and those two are the reward for the
// hardest content in the game — they needed somewhere to be.
//
// Layout, back to front: a reed-lined far bank, the open water with
// lily pads and light on it, a submerged shelf where the residents
// gather, and the near bank you are lying on.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { SpeciesData } from '@/lib/world/speciesCatalog';
import { SpeciesIllustration } from '@/components/child/garden/speciesIllustrations';
import HabitatInteriorLayout from '@/components/child/garden/HabitatInteriorLayout';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';

const VB_W = 900;
const VB_H = 620;

export default function PondInterior({
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
      const res = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ learnerId, skillCode: themedSkillCode }),
      });
      const { sessionId } = await res.json();
      if (sessionId) router.push(`/lesson/${sessionId}`);
      else setStarting(false);
    } catch {
      setStarting(false);
    }
  };

  // Residents stand on the submerged shelf, left to right.
  const slot = (i: number) => ({
    x: 150 + (i % 4) * 200,
    y: 372 + Math.floor(i / 4) * 116,
  });

  return (
    <HabitatInteriorLayout learnerId={learnerId} title="Frog Pond" iconEmoji="🐸">
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="pond-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#CFE3D6" />
            <stop offset="100%" stopColor="#A8C7B4" />
          </linearGradient>
          <linearGradient id="pond-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8FB9C0" />
            <stop offset="45%" stopColor="#6F9EA8" />
            <stop offset="100%" stopColor="#4E7A85" />
          </linearGradient>
          <radialGradient id="pond-light" cx="50%" cy="20%" r="60%">
            <stop offset="0%" stopColor="#FFFDF2" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FFFDF2" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* far bank + sky slot */}
        <rect x={0} y={0} width={VB_W} height={150} fill="url(#pond-sky)" />
        <path d={`M 0 128 Q 220 108 460 126 T ${VB_W} 118 L ${VB_W} 165 L 0 165 Z`}
              fill="#5C7E4F" />
        {/* reeds along the far bank */}
        {[40, 96, 150, 215, 300, 372, 455, 520, 600, 668, 742, 820, 872].map((rx, i) => (
          <g key={rx}>
            <motion.g
              animate={reducedMotion ? undefined : { rotate: [-2, 2, -2] }}
              transition={reducedMotion ? undefined : {
                duration: 5 + (i % 4), repeat: Infinity, ease: 'easeInOut', delay: i * 0.3,
              }}
              style={{ transformOrigin: `${rx}px 160px` }}
            >
              <line x1={rx} y1={162} x2={rx + (i % 2 ? 5 : -5)} y2={162 - 48 - (i % 3) * 16}
                    stroke="#4F6F42" strokeWidth={2.4} strokeLinecap="round" />
              {i % 3 === 0 && (
                <ellipse cx={rx + (i % 2 ? 5 : -5)} cy={162 - 52 - (i % 3) * 16}
                         rx={3.4} ry={9} fill="#6E4A28" stroke="#3F2614" strokeWidth={0.8} />
              )}
            </motion.g>
          </g>
        ))}

        {/* THE WATER */}
        <rect x={0} y={160} width={VB_W} height={VB_H - 160} fill="url(#pond-water)" />
        <rect x={0} y={160} width={VB_W} height={220} fill="url(#pond-light)" />

        {/* surface ripples */}
        {[200, 240, 286, 330].map((ry, i) => (
          <motion.path
            key={ry}
            d={`M 0 ${ry} Q 150 ${ry - 7} 300 ${ry} T 600 ${ry} T ${VB_W} ${ry - 4}`}
            stroke="#BFE0E4" strokeWidth={1.6} fill="none" opacity={0.4}
            animate={reducedMotion ? undefined : { x: [0, 16, 0] }}
            transition={reducedMotion ? undefined : {
              duration: 7 + i, repeat: Infinity, ease: 'easeInOut',
            }}
          />
        ))}

        {/* lily pads floating on the surface */}
        {[
          { x: 120, y: 232, r: 34 }, { x: 300, y: 210, r: 26 },
          { x: 640, y: 226, r: 30 }, { x: 800, y: 254, r: 22 },
        ].map((p, i) => (
          <motion.g key={i}
            animate={reducedMotion ? undefined : { y: [0, -3, 0] }}
            transition={reducedMotion ? undefined : {
              duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6,
            }}
          >
            <ellipse cx={p.x + 2} cy={p.y + 4} rx={p.r} ry={p.r * 0.42}
                     fill="#2E4A3E" opacity={0.3} />
            <ellipse cx={p.x} cy={p.y} rx={p.r} ry={p.r * 0.42}
                     fill="#5C7E4F" stroke="#3D5C32" strokeWidth={1.4} />
            <path d={`M ${p.x} ${p.y} L ${p.x + p.r * 0.72} ${p.y - p.r * 0.24}`}
                  stroke="#3D5C32" strokeWidth={1} />
            {i === 0 && (
              <g>
                <circle cx={p.x - 6} cy={p.y - 8} r={7} fill="#FFB7C5" stroke="#9B6A8A" strokeWidth={1} />
                <circle cx={p.x - 6} cy={p.y - 8} r={2.6} fill="#FFE89A" />
              </g>
            )}
          </motion.g>
        ))}

        {/* a sunken log — the shelf residents gather on */}
        <g>
          <ellipse cx={VB_W / 2} cy={452} rx={400} ry={44} fill="#3E5F62" opacity={0.55} />
          <rect x={70} y={410} width={760} height={30} rx={15}
                fill="#6E5A44" stroke="#3F2614" strokeWidth={2} opacity={0.92} />
          {[160, 300, 450, 600, 730].map(mx => (
            <ellipse key={mx} cx={mx} cy={414} rx={30} ry={6} fill="#5C7E4F" opacity={0.6} />
          ))}
        </g>

        {/* THE SKILL STOP — counting lily pads */}
        <g
          transform="translate(760, 168)"
          style={{ cursor: 'pointer', touchAction: 'manipulation' }}
          onClick={startSkill}
          aria-label={themedStructureLabel}
        >
          <circle r={46} fill="transparent" />
          {!reducedMotion && (
            <motion.circle
              r={38} fill="#FFE89A"
              animate={{ opacity: [0.15, 0.4, 0.15], scale: [0.95, 1.08, 0.95] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          <text y={8} textAnchor="middle" fontSize={34}>{themedStructureEmoji}</text>
          <rect x={-62} y={26} width={124} height={19} rx={9}
                fill="rgba(255,250,242,0.94)" stroke="#6b8e5a" strokeWidth={1} />
          <text y={39} textAnchor="middle" fontSize={10} fontWeight={700} fill="#3f2614">
            {starting ? 'starting…' : themedStructureLabel}
          </text>
        </g>

        {/* RESIDENTS on the log */}
        {discoveredSpecies.map((sp, i) => {
          const { x, y } = slot(i);
          return (
            <motion.g key={sp.code}
              animate={reducedMotion ? undefined : { y: [0, -5, 0] }}
              transition={reducedMotion ? undefined : {
                duration: 2.8 + (i % 3) * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.35,
              }}
            >
              <ellipse cx={x} cy={y + 26} rx={26} ry={6} fill="#000" opacity={0.2} />
              <g transform={`translate(${x - 30}, ${y - 30})`}>
                {SpeciesIllustration({ code: sp.code, size: 60 })
                  ?? <text x={30} y={40} textAnchor="middle" fontSize={40}>{sp.emoji}</text>}
              </g>
              <rect x={x - 58} y={y + 32} width={116} height={18} rx={5}
                    fill="rgba(149, 184, 143, 0.92)" />
              <text x={x} y={y + 45} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#fffaf2">
                {sp.commonName}
              </text>
            </motion.g>
          );
        })}

        {/* still to find — ripples where someone might surface */}
        {Array.from({ length: undiscoveredCount }).map((_, i) => {
          const { x, y } = slot(discoveredSpecies.length + i);
          return (
            <g key={`undiscovered-${i}`} opacity={0.65}>
              <ellipse cx={x} cy={y + 10} rx={26} ry={9} fill="none"
                       stroke="#BFE0E4" strokeWidth={1.4} opacity={0.7} />
              <ellipse cx={x} cy={y + 10} rx={15} ry={5} fill="none"
                       stroke="#BFE0E4" strokeWidth={1.1} opacity={0.5} />
              <text x={x} y={y + 2} textAnchor="middle" fontSize={15} fontStyle="italic"
                    fill="#DCEEF0" opacity={0.8}>?</text>
              <rect x={x - 58} y={y + 32} width={116} height={18} rx={5}
                    fill="rgba(60, 90, 96, 0.7)" stroke="#4E7A85" strokeWidth={0.7} />
              <text x={x} y={y + 45} textAnchor="middle" fontSize={9} fontStyle="italic" fill="#CFE3E6">
                not yet found
              </text>
            </g>
          );
        })}

        {/* near bank — the ground you're lying on */}
        <path d={`M 0 ${VB_H - 54} Q 240 ${VB_H - 74} 520 ${VB_H - 58} T ${VB_W} ${VB_H - 66}
                  L ${VB_W} ${VB_H} L 0 ${VB_H} Z`}
              fill="#6B5A3E" stroke="#3F2614" strokeWidth={2} />
        {[60, 190, 330, 500, 660, 800].map((gx, i) => (
          <path key={gx}
                d={`M ${gx} ${VB_H - 56} q ${i % 2 ? 5 : -5} -16 ${i % 2 ? 9 : -9} -26`}
                stroke="#5C7E4F" strokeWidth={2.2} fill="none" strokeLinecap="round" />
        ))}
      </svg>
    </HabitatInteriorLayout>
  );
}
