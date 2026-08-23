// app/(child)/garden/habitat/[code]/AntHillInterior.tsx
//
// Inside the ant hill — a cutaway of the colony, the way a nest looks
// in a cross-section diagram, which is the only way anyone ever really
// sees one.
//
// The content follows what the researcher quest already teaches: that
// a colony works because the jobs are divided. So the chambers are
// labelled by what happens in them — the nursery, the fungus garden
// the leafcutters actually farm, the grain store, the queen's chamber
// — and a line of workers marches down the main shaft carrying leaf
// pieces, which is what all that digging is for.

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

/** A rounded chamber hollowed out of the soil. */
function Chamber({
  cx, cy, rx, ry, label,
}: { cx: number; cy: number; rx: number; ry: number; label?: string }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx + 4} ry={ry + 4} fill="#2E1C0E" opacity={0.55} />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#6B4A2A" />
      <ellipse cx={cx - rx * 0.25} cy={cy - ry * 0.3} rx={rx * 0.5} ry={ry * 0.34}
               fill="#7E5A34" opacity={0.7} />
      {label && (
        <text x={cx} y={cy + ry + 15} textAnchor="middle" fontSize={9.5}
              fontStyle="italic" fontWeight={700} fill="#E0CDA8">
          {label}
        </text>
      )}
    </g>
  );
}

/** A worker ant, drawn small — three body segments and six legs. */
function WorkerAnt({ carrying = false }: { carrying?: boolean }) {
  return (
    <g>
      {carrying && (
        <ellipse cx={0} cy={-9} rx={9} ry={5} fill="#5C7E4F" stroke="#3D5C32"
                 strokeWidth={0.9} transform="rotate(-12)" />
      )}
      <ellipse cx={-5.5} cy={0} rx={3.4} ry={2.6} fill="#3A2417" />
      <ellipse cx={0} cy={0} rx={2.4} ry={2} fill="#3A2417" />
      <circle cx={4.6} cy={-0.6} r={2.4} fill="#3A2417" />
      {[-4, 0, 3].map((lx, i) => (
        <g key={i}>
          <line x1={lx} y1={1.4} x2={lx - 2.6} y2={4.4} stroke="#3A2417" strokeWidth={0.8} strokeLinecap="round" />
          <line x1={lx} y1={-1.4} x2={lx - 2.2} y2={-4} stroke="#3A2417" strokeWidth={0.8} strokeLinecap="round" />
        </g>
      ))}
      <line x1={6} y1={-2} x2={9} y2={-5} stroke="#3A2417" strokeWidth={0.8} strokeLinecap="round" />
      <line x1={6} y1={-2.6} x2={9.4} y2={-2.4} stroke="#3A2417" strokeWidth={0.8} strokeLinecap="round" />
    </g>
  );
}

export default function AntHillInterior({
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
    x: 200 + (i % 3) * 250,
    y: 466 + Math.floor(i / 3) * 104,
  });

  return (
    <HabitatInteriorLayout learnerId={learnerId} title="Ant Hill" iconEmoji="🐜">
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="ant-soil" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6E4A28" />
            <stop offset="45%" stopColor="#4E341C" />
            <stop offset="100%" stopColor="#2E1C0E" />
          </linearGradient>
        </defs>

        {/* daylight strip, then everything below is underground */}
        <rect x={0} y={0} width={VB_W} height={62} fill="#CFE3B4" />
        <rect x={0} y={62} width={VB_W} height={VB_H - 62} fill="url(#ant-soil)" />

        {/* the mound on the surface, with its entrance hole */}
        <path d="M 330 62 Q 400 22 452 20 Q 508 22 574 62 Z" fill="#7E5A34" stroke="#3F2614" strokeWidth={2} />
        <ellipse cx={452} cy={60} rx={17} ry={7} fill="#241608" />
        {[350, 380, 520, 552].map((px, i) => (
          <circle key={px} cx={px} cy={52 + (i % 2) * 5} r={2.2} fill="#6B4A2A" />
        ))}

        {/* soil texture — small stones and root threads */}
        {[
          [80, 180], [700, 150], [180, 330], [820, 300], [60, 470], [760, 470], [300, 560],
        ].map(([sx, sy], i) => (
          <ellipse key={i} cx={sx} cy={sy} rx={9} ry={5} fill="#5A3B1F" opacity={0.6}
                   transform={`rotate(${i * 27} ${sx} ${sy})`} />
        ))}
        {[[120, 96], [640, 92], [800, 210]].map(([rx0, ry0], i) => (
          <path key={i} d={`M ${rx0} ${ry0} q 22 34 6 74 q -14 34 8 62`}
                stroke="#5C4426" strokeWidth={2.6} fill="none" opacity={0.55} strokeLinecap="round" />
        ))}

        {/* THE MAIN SHAFT and its side tunnels */}
        <path d="M 452 66 C 448 150, 470 210, 452 280 C 436 350, 464 410, 452 470"
              stroke="#241608" strokeWidth={26} fill="none" strokeLinecap="round" />
        <path d="M 452 150 C 380 158, 300 150, 236 168" stroke="#241608" strokeWidth={20} fill="none" strokeLinecap="round" />
        <path d="M 452 214 C 540 224, 620 214, 690 234" stroke="#241608" strokeWidth={20} fill="none" strokeLinecap="round" />
        <path d="M 452 330 C 372 342, 300 336, 232 356" stroke="#241608" strokeWidth={20} fill="none" strokeLinecap="round" />
        <path d="M 452 392 C 540 402, 618 396, 686 414" stroke="#241608" strokeWidth={20} fill="none" strokeLinecap="round" />

        {/* CHAMBERS — each one a job the colony does */}
        <Chamber cx={214} cy={172} rx={62} ry={40} label="the nursery" />
        <Chamber cx={712} cy={240} rx={68} ry={44} label="the fungus garden" />
        <Chamber cx={210} cy={362} rx={58} ry={38} label="the grain store" />
        <Chamber cx={708} cy={420} rx={62} ry={40} label="the queen's chamber" />

        {/* nursery — pale eggs in a heap */}
        {[[-22, 4], [-12, -6], [-2, 3], [8, -5], [18, 2], [-6, 10], [10, 9]].map(([dx, dy], i) => (
          <ellipse key={i} cx={214 + dx} cy={172 + dy} rx={5.4} ry={3.6}
                   fill="#F0E4CF" stroke="#C6B99E" strokeWidth={0.7} transform={`rotate(${i * 21} ${214 + dx} ${172 + dy})`} />
        ))}

        {/* fungus garden — the crop leafcutters actually eat */}
        {[[-30, 6], [-10, -4], [12, 6], [30, -2], [0, 14]].map(([dx, dy], i) => (
          <g key={i} transform={`translate(${712 + dx}, ${240 + dy})`}>
            <ellipse cx={0} cy={0} rx={13} ry={7} fill="#9FAE86" opacity={0.9} />
            <ellipse cx={-3} cy={-2} rx={6} ry={3} fill="#C4CEA8" opacity={0.9} />
          </g>
        ))}

        {/* grain store — seeds stacked up */}
        {[[-20, 2], [-8, -6], [4, 4], [16, -3], [-2, 11]].map(([dx, dy], i) => (
          <ellipse key={i} cx={210 + dx} cy={362 + dy} rx={6} ry={4.4}
                   fill="#C9A66A" stroke="#8A6238" strokeWidth={0.8} transform={`rotate(${i * 33} ${210 + dx} ${362 + dy})`} />
        ))}

        {/* the queen — bigger, with the workers attending her */}
        <g transform="translate(708, 418)">
          <ellipse cx={10} cy={0} rx={22} ry={11} fill="#4A2E1C" stroke="#2A1810" strokeWidth={1.4} />
          <ellipse cx={-12} cy={-2} rx={9} ry={7} fill="#3A2417" />
          <circle cx={-25} cy={-4} r={6} fill="#3A2417" />
          <ellipse cx={4} cy={-9} rx={13} ry={4} fill="#8A7B5E" opacity={0.6} transform="rotate(-12 4 -9)" />
          <text x={0} y={-24} textAnchor="middle" fontSize={9} fontStyle="italic" fill="#E8D9B8">the queen</text>
          <g transform="translate(-40, 14) scale(0.85)"><WorkerAnt /></g>
          <g transform="translate(34, 16) scale(0.85)"><WorkerAnt /></g>
        </g>

        {/* THE WORKER LINE — marching down the shaft with cut leaves */}
        {[0, 1, 2, 3, 4].map(i => (
          <motion.g key={i}
            animate={reducedMotion ? undefined : { y: [0, 404] }}
            transition={reducedMotion ? undefined : {
              duration: 22, repeat: Infinity, ease: 'linear', delay: i * 4.4,
            }}
          >
            <g transform="translate(452, 78) rotate(90)">
              <WorkerAnt carrying={i % 2 === 0} />
            </g>
          </motion.g>
        ))}

        {/* THE SKILL STOP */}
        <g
          transform="translate(452, 540)"
          style={{ cursor: 'pointer', touchAction: 'manipulation' }}
          onClick={startSkill}
          aria-label={themedStructureLabel}
        >
          <circle r={46} fill="transparent" />
          {!reducedMotion && (
            <motion.circle
              r={36} fill="#FFE89A"
              animate={{ opacity: [0.15, 0.42, 0.15], scale: [0.95, 1.08, 0.95] }}
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

        {/* THE CARRYING LANES — the colony's second lesson. A
            bundle-carrying ant marks the door. */}
        <g
          transform="translate(160, 540)"
          style={{ cursor: 'pointer', touchAction: 'manipulation' }}
          onClick={() => router.push(`/carry?learner=${learnerId}`)}
          role="button"
          aria-label="The Carrying Lanes — help the ants carry tens"
        >
          <circle r={46} fill="transparent" />
          {/* an ant with a "10" bundle on its back */}
          <circle cx={0} cy={-14} r={11} fill="#D9A441" stroke="#8A6534" strokeWidth={2} />
          <text x={0} y={-10} textAnchor="middle" fontSize={10} fontWeight={900} fill="#5E4020">10</text>
          <ellipse cx={-2} cy={0} rx={8} ry={5} fill="#5E3A28" />
          <circle cx={6} cy={-2} r={3.6} fill="#5E3A28" />
          <circle cx={-10} cy={0} r={4} fill="#5E3A28" />
          {[-7, -1, 5].map(lx => (
            <path key={lx} d={`M ${lx} 4 L ${lx - 2} 9`} stroke="#5E3A28" strokeWidth={1.6} strokeLinecap="round" />
          ))}
          <rect x={-64} y={24} width={128} height={19} rx={9}
                fill="rgba(255,250,242,0.94)" stroke="#6b8e5a" strokeWidth={1} />
          <text y={37} textAnchor="middle" fontSize={10} fontWeight={700} fill="#3f2614">
            the carrying lanes
          </text>
        </g>

        {/* RESIDENTS along the lower tunnels */}
        {discoveredSpecies.map((sp, i) => {
          const { x, y } = slot(i);
          return (
            <motion.g key={sp.code}
              animate={reducedMotion ? undefined : { x: [0, 7, 0, -7, 0] }}
              transition={reducedMotion ? undefined : {
                duration: 8 + (i % 3) * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6,
              }}
            >
              <ellipse cx={x} cy={y + 24} rx={24} ry={6} fill="#000" opacity={0.3} />
              <g transform={`translate(${x - 29}, ${y - 29})`}>
                {SpeciesIllustration({ code: sp.code, size: 58 })
                  ?? <text x={29} y={38} textAnchor="middle" fontSize={38}>{sp.emoji}</text>}
              </g>
              <rect x={x - 58} y={y + 30} width={116} height={18} rx={5}
                    fill="rgba(149, 184, 143, 0.92)" />
              <text x={x} y={y + 43} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#fffaf2">
                {sp.commonName}
              </text>
            </motion.g>
          );
        })}

        {/* still to find — an unfinished side tunnel */}
        {Array.from({ length: undiscoveredCount }).map((_, i) => {
          const { x, y } = slot(discoveredSpecies.length + i);
          return (
            <g key={`undiscovered-${i}`} opacity={0.65}>
              <path d={`M ${x - 26} ${y + 6} q 26 -18 52 0`} stroke="#241608" strokeWidth={16}
                    fill="none" strokeLinecap="round" />
              <text x={x} y={y + 2} textAnchor="middle" fontSize={14} fontStyle="italic"
                    fill="#C8B79A" opacity={0.85}>?</text>
              <rect x={x - 58} y={y + 30} width={116} height={18} rx={5}
                    fill="rgba(70, 52, 34, 0.8)" stroke="#5A3820" strokeWidth={0.7} />
              <text x={x} y={y + 43} textAnchor="middle" fontSize={9} fontStyle="italic" fill="#C8BCAA">
                a tunnel not yet dug
              </text>
            </g>
          );
        })}
      </svg>
    </HabitatInteriorLayout>
  );
}
