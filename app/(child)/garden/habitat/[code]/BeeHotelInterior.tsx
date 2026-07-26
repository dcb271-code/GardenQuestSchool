// app/(child)/garden/habitat/[code]/BeeHotelInterior.tsx
//
// Inside the bee hotel — the tubes cut open lengthwise, so you can see
// what a mason bee actually builds in there.
//
// This is the one habitat whose interior teaches something you cannot
// see from outside, and it is exactly what the researcher quest says:
// each egg is sealed in its own mud room with a packed lunch of pollen
// beside it. Drawing the cells in a row makes that legible instantly —
// egg, pollen loaf, mud wall, egg, pollen loaf, mud wall.
//
// The tubes are deliberately different widths, because that is the
// real reason a good bee hotel has several sizes: different species
// need different doorways.

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

/**
 * One nesting tube in cross-section: a row of sealed cells, each an
 * egg with its pollen loaf, divided by mud walls.
 */
function NestTube({
  y, height, cells, filled, label,
}: { y: number; height: number; cells: number; filled: number; label?: string }) {
  const x0 = 118;
  const x1 = 806;
  const cellW = (x1 - x0) / cells;
  return (
    <g>
      {/* the hollow stem */}
      <rect x={x0 - 16} y={y} width={x1 - x0 + 32} height={height} rx={height / 2}
            fill="#C9A66A" stroke="#7B5230" strokeWidth={2.4} />
      <rect x={x0 - 8} y={y + 4} width={x1 - x0 + 16} height={height - 8} rx={(height - 8) / 2}
            fill="#3A2A18" />
      {/* the open end, at the left — where she flies in */}
      <ellipse cx={x0 - 12} cy={y + height / 2} rx={7} ry={height / 2 - 4} fill="#241708" />

      {Array.from({ length: cells }).map((_, i) => {
        const cx = x0 + i * cellW + cellW / 2;
        const done = i < filled;
        return (
          <g key={i}>
            {/* mud dividing wall */}
            <rect x={x0 + i * cellW - 3} y={y + 4} width={6} height={height - 8}
                  fill="#8A6238" opacity={done ? 1 : 0.35} />
            {done && (
              <>
                {/* pollen loaf — the packed lunch */}
                <ellipse cx={cx + cellW * 0.16} cy={y + height * 0.62} rx={cellW * 0.2} ry={height * 0.2}
                         fill="#E8C04A" stroke="#B99A2E" strokeWidth={1} />
                {/* the egg */}
                <ellipse cx={cx - cellW * 0.14} cy={y + height * 0.45} rx={cellW * 0.1} ry={height * 0.16}
                         fill="#FFFDF2" stroke="#D8CDB8" strokeWidth={0.9}
                         transform={`rotate(-18 ${cx - cellW * 0.14} ${y + height * 0.45})`} />
              </>
            )}
          </g>
        );
      })}
      {/* the final seal at the far end */}
      <rect x={x1 - 3} y={y + 4} width={6} height={height - 8} fill="#8A6238" />
      {label && (
        <text x={x1 + 30} y={y + height / 2 + 3.5} fontSize={9.5} fontStyle="italic"
              fontWeight={700} fill="#E8D9B8">{label}</text>
      )}
    </g>
  );
}

export default function BeeHotelInterior({
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

  const slot = (i: number) => ({
    x: 168 + (i % 4) * 192,
    y: 500 + Math.floor(i / 4) * 100,
  });

  return (
    <HabitatInteriorLayout learnerId={learnerId} title="Bee Hotel" iconEmoji="🐝">
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="bee-wood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8A6238" />
            <stop offset="100%" stopColor="#5E4224" />
          </linearGradient>
          <radialGradient id="bee-warm" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFE89A" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FFE89A" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x={0} y={0} width={VB_W} height={VB_H} fill="url(#bee-wood)" />
        <rect x={0} y={0} width={VB_W} height={VB_H} fill="url(#bee-warm)" />

        {/* woodgrain on the back wall of the hotel */}
        {[40, 130, 232, 348, 470, 566, 660]. map((gy, i) => (
          <path key={gy} d={`M 0 ${gy} q 220 ${i % 2 ? 12 : -12} 450 0 t 450 ${i % 2 ? -8 : 8}`}
                stroke="#4E3A20" strokeWidth={2} fill="none" opacity={0.5} />
        ))}

        <text x={VB_W / 2} y={44} textAnchor="middle" fontSize={12} fontStyle="italic"
              fontWeight={700} fill="#F0E4CF">
          the tubes, cut open — one room per egg
        </text>

        {/* THE NESTING TUBES, in three widths */}
        <NestTube y={72} height={54} cells={5} filled={4} label="wide" />
        <NestTube y={162} height={42} cells={6} filled={5} label="middling" />
        <NestTube y={240} height={32} cells={7} filled={3} label="narrow" />
        <NestTube y={306} height={44} cells={6} filled={2} label="middling" />

        {/* an annotation pointing at one finished cell */}
        <g>
          <line x1={250} y1={132} x2={250} y2={150} stroke="#F0E4CF" strokeWidth={1.2} strokeDasharray="3 3" />
          <text x={250} y={150} textAnchor="middle" fontSize={9} fontStyle="italic" fill="#F0E4CF"
                dy={-22}>egg + its packed lunch</text>
        </g>

        {/* a mason bee arriving with mud for the next wall */}
        <motion.g
          animate={reducedMotion ? undefined : { x: [-60, 40, -60], y: [0, -10, 0] }}
          transition={reducedMotion ? undefined : { duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        >
          <g transform="translate(96, 400)">
            <ellipse cx={-14} cy={2} rx={7} ry={5} fill="#6B4A2A" stroke="#3F2614" strokeWidth={1} />
            <text x={-14} y={-10} textAnchor="middle" fontSize={8} fontStyle="italic" fill="#E8D9B8">mud</text>
            <ellipse cx={2} cy={0} rx={9} ry={6} fill="#C9A66A" stroke="#5A3B1F" strokeWidth={1.2} />
            {[-3, 1, 5].map(sx => (
              <rect key={sx} x={sx} y={-5} width={2.4} height={10} fill="#3A2417" opacity={0.85} />
            ))}
            <circle cx={12} cy={-2} r={4} fill="#3A2417" />
            <motion.ellipse cx={0} cy={-7} rx={9} ry={3.4} fill="#DCE6EC" opacity={0.8}
              animate={reducedMotion ? undefined : { ry: [3.4, 1.6, 3.4] }}
              transition={reducedMotion ? undefined : { duration: 0.22, repeat: Infinity }} />
          </g>
        </motion.g>

        {/* THE SKILL STOP — number bonds, echoing the cells */}
        <g
          transform="translate(452, 418)"
          style={{ cursor: 'pointer', touchAction: 'manipulation' }}
          onClick={startSkill}
          aria-label={themedStructureLabel}
        >
          <circle r={46} fill="transparent" />
          {!reducedMotion && (
            <motion.circle
              r={36} fill="#FFE89A"
              animate={{ opacity: [0.18, 0.46, 0.18], scale: [0.95, 1.09, 0.95] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          <text y={8} textAnchor="middle" fontSize={30}>{themedStructureEmoji}</text>
          <rect x={-64} y={24} width={128} height={19} rx={9}
                fill="rgba(255,250,242,0.94)" stroke="#6b8e5a" strokeWidth={1} />
          <text y={37} textAnchor="middle" fontSize={10} fontWeight={700} fill="#3f2614">
            {starting ? 'starting…' : themedStructureLabel}
          </text>
        </g>

        {/* the sunlit doorway strip along the bottom */}
        <rect x={0} y={VB_H - 84} width={VB_W} height={84} fill="#4E3A20" />
        <rect x={0} y={VB_H - 84} width={VB_W} height={5} fill="#8A6238" />

        {/* RESIDENTS on the landing board */}
        {discoveredSpecies.map((sp, i) => {
          const { x, y } = slot(i);
          return (
            <motion.g key={sp.code}
              animate={reducedMotion ? undefined : { y: [0, -7, 0] }}
              transition={reducedMotion ? undefined : {
                duration: 3.4 + (i % 3) * 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4,
              }}
            >
              <g transform={`translate(${x - 29}, ${y - 29})`}>
                {SpeciesIllustration({ code: sp.code, size: 58 })
                  ?? <text x={29} y={38} textAnchor="middle" fontSize={38}>{sp.emoji}</text>}
              </g>
              <rect x={x - 56} y={y + 30} width={112} height={18} rx={5}
                    fill="rgba(149, 184, 143, 0.92)" />
              <text x={x} y={y + 43} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#fffaf2">
                {sp.commonName}
              </text>
            </motion.g>
          );
        })}

        {/* still to find — an empty tube waiting for a tenant */}
        {Array.from({ length: undiscoveredCount }).map((_, i) => {
          const { x, y } = slot(discoveredSpecies.length + i);
          return (
            <g key={`undiscovered-${i}`} opacity={0.7}>
              <rect x={x - 24} y={y - 12} width={48} height={26} rx={13}
                    fill="#241708" stroke="#7B5230" strokeWidth={1.6} />
              <text x={x} y={y + 6} textAnchor="middle" fontSize={13} fontStyle="italic"
                    fill="#C8B79A" opacity={0.85}>?</text>
              <rect x={x - 56} y={y + 30} width={112} height={18} rx={5}
                    fill="rgba(70, 52, 34, 0.8)" stroke="#5A3820" strokeWidth={0.7} />
              <text x={x} y={y + 43} textAnchor="middle" fontSize={9} fontStyle="italic" fill="#C8BCAA">
                a room to let
              </text>
            </g>
          );
        })}
      </svg>
    </HabitatInteriorLayout>
  );
}
