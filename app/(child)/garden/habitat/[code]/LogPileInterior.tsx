// app/(child)/garden/habitat/[code]/LogPileInterior.tsx
//
// Inside the log pile — the dim, damp world under stacked wood, which
// is the point the researcher quest makes: a rotting log holds more
// living things than a healthy tree.
//
// Layout: a wall of stacked log ends at the back with bracket fungi
// growing off them, a soft leaf-litter floor where the residents live,
// and shafts of light coming through the gaps between logs.

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

export default function LogPileInterior({
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
    x: 150 + (i % 4) * 200,
    y: 396 + Math.floor(i / 4) * 112,
  });

  // Stacked log ends across the back wall.
  const logs = [
    { cx: 90, cy: 150, r: 62 }, { cx: 218, cy: 132, r: 52 },
    { cx: 336, cy: 158, r: 58 }, { cx: 470, cy: 128, r: 48 },
    { cx: 588, cy: 154, r: 60 }, { cx: 716, cy: 134, r: 50 },
    { cx: 836, cy: 160, r: 56 },
    { cx: 156, cy: 262, r: 54 }, { cx: 404, cy: 268, r: 50 },
    { cx: 652, cy: 264, r: 52 }, { cx: 850, cy: 272, r: 46 },
  ];

  return (
    <HabitatInteriorLayout learnerId={learnerId} title="Log Pile" iconEmoji="🪵">
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 w-full h-full">
        <defs>
          <radialGradient id="log-shaft" cx="50%" cy="0%" r="80%">
            <stop offset="0%" stopColor="#FFE89A" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#FFE89A" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="log-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6B4E30" />
            <stop offset="100%" stopColor="#48331E" />
          </linearGradient>
        </defs>

        <rect x={0} y={0} width={VB_W} height={VB_H} fill="#2A1C10" />

        {/* light coming through the gaps in the stack */}
        {[210, 520, 780].map((sx, i) => (
          <motion.ellipse key={sx}
            cx={sx} cy={260} rx={110} ry={230} fill="url(#log-shaft)"
            animate={reducedMotion ? undefined : { opacity: [0.7, 1, 0.7] }}
            transition={reducedMotion ? undefined : {
              duration: 6 + i * 2, repeat: Infinity, ease: 'easeInOut',
            }}
          />
        ))}

        {/* STACKED LOG ENDS */}
        {logs.map((l, i) => (
          <g key={i}>
            <circle cx={l.cx} cy={l.cy} r={l.r} fill="#6E4A28" stroke="#2A1C10" strokeWidth={3} />
            <circle cx={l.cx} cy={l.cy} r={l.r * 0.82} fill="#8A6238" />
            {/* growth rings */}
            {[0.66, 0.5, 0.34, 0.18].map(f => (
              <circle key={f} cx={l.cx + (i % 2 ? 2 : -2)} cy={l.cy} r={l.r * f}
                      fill="none" stroke="#6E4A28" strokeWidth={1.4} opacity={0.85} />
            ))}
            <circle cx={l.cx + (i % 2 ? 3 : -3)} cy={l.cy} r={2.4} fill="#4A3018" />
            {/* a radial crack, as old wood does */}
            <line x1={l.cx} y1={l.cy} x2={l.cx + l.r * 0.78} y2={l.cy - l.r * 0.4}
                  stroke="#4A3018" strokeWidth={1.6} opacity={0.7} />
            {/* moss along the top edge */}
            <path d={`M ${l.cx - l.r * 0.7} ${l.cy - l.r * 0.66}
                      q ${l.r * 0.7} ${-l.r * 0.28} ${l.r * 1.4} 0`}
                  stroke="#5C7E4F" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.75} />
            {/* bracket fungi on a few */}
            {i % 3 === 0 && (
              <g>
                <ellipse cx={l.cx + l.r * 0.86} cy={l.cy + 8} rx={16} ry={7}
                         fill="#C98A5A" stroke="#5A3B1F" strokeWidth={1.2} />
                <ellipse cx={l.cx + l.r * 0.86} cy={l.cy + 5} rx={11} ry={4}
                         fill="#E0AE7E" opacity={0.85} />
                <ellipse cx={l.cx + l.r * 0.72} cy={l.cy + 22} rx={11} ry={5}
                         fill="#B57C4E" stroke="#5A3B1F" strokeWidth={1} />
              </g>
            )}
          </g>
        ))}

        {/* THE SKILL STOP — counting beetles in pairs */}
        <g
          transform="translate(112, 330)"
          style={{ cursor: 'pointer', touchAction: 'manipulation' }}
          onClick={startSkill}
          aria-label={themedStructureLabel}
        >
          <circle r={46} fill="transparent" />
          {!reducedMotion && (
            <motion.circle
              r={38} fill="#FFE89A"
              animate={{ opacity: [0.15, 0.42, 0.15], scale: [0.95, 1.08, 0.95] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          <text y={8} textAnchor="middle" fontSize={32}>{themedStructureEmoji}</text>
          <rect x={-60} y={26} width={120} height={19} rx={9}
                fill="rgba(255,250,242,0.94)" stroke="#6b8e5a" strokeWidth={1} />
          <text y={39} textAnchor="middle" fontSize={10} fontWeight={700} fill="#3f2614">
            {starting ? 'starting…' : themedStructureLabel}
          </text>
        </g>

        {/* LEAF-LITTER FLOOR */}
        <path d={`M 0 340 Q 220 316 460 336 T ${VB_W} 326 L ${VB_W} ${VB_H} L 0 ${VB_H} Z`}
              fill="url(#log-floor)" />
        {[
          { x: 70, y: 366, r: -20 }, { x: 250, y: 352, r: 14 }, { x: 430, y: 372, r: -8 },
          { x: 610, y: 350, r: 22 }, { x: 790, y: 368, r: -16 }, { x: 340, y: 566, r: 10 },
          { x: 700, y: 578, r: -24 },
        ].map((lf, i) => (
          <ellipse key={i} cx={lf.x} cy={lf.y} rx={22} ry={9}
                   fill={i % 2 ? '#8A5E32' : '#A0703F'} stroke="#3F2614" strokeWidth={1}
                   opacity={0.85} transform={`rotate(${lf.r} ${lf.x} ${lf.y})`} />
        ))}

        {/* RESIDENTS in the litter */}
        {discoveredSpecies.map((sp, i) => {
          const { x, y } = slot(i);
          return (
            <motion.g key={sp.code}
              animate={reducedMotion ? undefined : { x: [0, 5, 0, -5, 0] }}
              transition={reducedMotion ? undefined : {
                duration: 9 + (i % 4), repeat: Infinity, ease: 'easeInOut', delay: i * 0.5,
              }}
            >
              <ellipse cx={x} cy={y + 26} rx={26} ry={6} fill="#000" opacity={0.3} />
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

        {/* still to find — a dark crevice with eyes in it */}
        {Array.from({ length: undiscoveredCount }).map((_, i) => {
          const { x, y } = slot(discoveredSpecies.length + i);
          return (
            <g key={`undiscovered-${i}`} opacity={0.7}>
              <ellipse cx={x} cy={y + 6} rx={28} ry={16} fill="#160D06"
                       stroke="#3F2614" strokeWidth={1.4} />
              <circle cx={x - 7} cy={y + 2} r={2.2} fill="#C8BCAA" opacity={0.75} />
              <circle cx={x + 7} cy={y + 2} r={2.2} fill="#C8BCAA" opacity={0.75} />
              <rect x={x - 58} y={y + 32} width={116} height={18} rx={5}
                    fill="rgba(70, 52, 34, 0.8)" stroke="#5A3820" strokeWidth={0.7} />
              <text x={x} y={y + 45} textAnchor="middle" fontSize={9} fontStyle="italic" fill="#C8BCAA">
                something in there
              </text>
            </g>
          );
        })}
      </svg>
    </HabitatInteriorLayout>
  );
}
