// app/(child)/garden/habitat/[code]/ButterflyBushInterior.tsx
//
// Inside the butterfly bush — standing under the arching sprays,
// looking up through them.
//
// Built because a test caught something the design had missed: the
// luna moth is a rare, researcher-badge-gated reward, and its only
// home had no interior. A creature that hard to earn needs somewhere
// to be found.
//
// The scene runs at dusk on purpose. Butterflies work the flowers by
// day and the luna moth only flies at night, so a bush at twilight is
// the one moment both belong in the same picture.

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

/** A cone of tiny florets — a buddleia spray, which is what draws them. */
function FlowerSpray({ x, y, rot, hue }: { x: number; y: number; rot: number; hue: string }) {
  const florets: Array<{ fx: number; fy: number; r: number }> = [];
  for (let row = 0; row < 7; row++) {
    const count = 5 - Math.floor(row / 2);
    const width = 22 - row * 2.4;
    for (let c = 0; c < count; c++) {
      florets.push({
        fx: -width / 2 + (c * width) / Math.max(count - 1, 1),
        fy: row * 9,
        r: 4.4 - row * 0.32,
      });
    }
  }
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rot})`}>
      <line x1={0} y1={0} x2={0} y2={-30} stroke="#4F6F42" strokeWidth={3} strokeLinecap="round" />
      {florets.map((f, i) => (
        <g key={i}>
          <circle cx={f.fx} cy={-f.fy - 4} r={f.r} fill={hue} opacity={0.95} />
          <circle cx={f.fx} cy={-f.fy - 4} r={f.r * 0.34} fill="#FFE89A" opacity={0.85} />
        </g>
      ))}
    </g>
  );
}

export default function ButterflyBushInterior({
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
    y: 384 + Math.floor(i / 4) * 112,
  });

  return (
    <HabitatInteriorLayout learnerId={learnerId} title="Butterfly Bush" iconEmoji="🦋">
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="bush-dusk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8B98A" />
            <stop offset="40%" stopColor="#C79A9E" />
            <stop offset="100%" stopColor="#6E6A8E" />
          </linearGradient>
          <radialGradient id="bush-moon" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFDF2" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FFFDF2" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bush-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5C6E4A" />
            <stop offset="100%" stopColor="#3B4A32" />
          </linearGradient>
        </defs>

        {/* dusk sky, seen up through the bush */}
        <rect x={0} y={0} width={VB_W} height={VB_H} fill="url(#bush-dusk)" />
        <circle cx={738} cy={96} r={62} fill="url(#bush-moon)" />
        <circle cx={738} cy={96} r={22} fill="#FFFBEA" opacity={0.9} />
        {[[120, 70], [270, 44], [430, 82], [560, 52], [840, 60], [200, 128], [640, 116]].map(
          ([sx, sy], i) => (
            <motion.circle key={i} cx={sx} cy={sy} r={1.7} fill="#FFFDF2"
              animate={reducedMotion ? undefined : { opacity: [0.35, 0.9, 0.35] }}
              transition={reducedMotion ? undefined : {
                duration: 3 + (i % 4), repeat: Infinity, ease: 'easeInOut', delay: i * 0.4,
              }} />
          ))}

        {/* ARCHING BRANCHES — the bush you are standing under */}
        {[
          { d: 'M -20 300 C 120 120, 300 70, 470 96', w: 13 },
          { d: 'M 920 320 C 780 140, 600 78, 452 100', w: 13 },
          { d: 'M 60 360 C 170 250, 300 210, 430 214', w: 8 },
          { d: 'M 850 372 C 740 260, 610 218, 486 220', w: 8 },
        ].map((b, i) => (
          <path key={i} d={b.d} stroke="#4A5A3A" strokeWidth={b.w} fill="none" strokeLinecap="round" />
        ))}

        {/* leaves along the branches */}
        {[
          [110, 214, -34], [186, 168, -22], [268, 132, -12], [352, 108, -4],
          [548, 106, 8], [640, 126, 18], [724, 162, 28], [800, 210, 38],
          [150, 292, -30], [300, 236, -14], [600, 238, 14], [758, 296, 30],
        ].map(([lx, ly, rot], i) => (
          <motion.ellipse key={i} cx={lx} cy={ly} rx={26} ry={9}
            fill={i % 2 ? '#4F6F42' : '#5C7E4F'} stroke="#38492E" strokeWidth={1.2}
            transform={`rotate(${rot} ${lx} ${ly})`}
            animate={reducedMotion ? undefined : { rotate: [rot - 2, rot + 2, rot - 2] }}
            transition={reducedMotion ? undefined : {
              duration: 6 + (i % 3), repeat: Infinity, ease: 'easeInOut', delay: i * 0.25,
            }}
            style={{ transformOrigin: `${lx}px ${ly}px` }}
          />
        ))}

        {/* THE FLOWER SPRAYS — what the whole bush is for */}
        <FlowerSpray x={232} y={216} rot={-16} hue="#A87BC4" />
        <FlowerSpray x={392} y={182} rot={-5} hue="#C489C9" />
        <FlowerSpray x={546} y={186} rot={7} hue="#A87BC4" />
        <FlowerSpray x={700} y={228} rot={18} hue="#B98AD0" />
        <FlowerSpray x={128} y={288} rot={-26} hue="#C489C9" />
        <FlowerSpray x={806} y={300} rot={26} hue="#A87BC4" />

        {/* THE SKILL STOP — nectar counting */}
        <g
          transform="translate(452, 300)"
          style={{ cursor: 'pointer', touchAction: 'manipulation' }}
          onClick={startSkill}
          aria-label={themedStructureLabel}
        >
          <circle r={48} fill="transparent" />
          {!reducedMotion && (
            <motion.circle
              r={38} fill="#FFE89A"
              animate={{ opacity: [0.18, 0.46, 0.18], scale: [0.95, 1.09, 0.95] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          <text y={8} textAnchor="middle" fontSize={32}>{themedStructureEmoji}</text>
          <rect x={-64} y={26} width={128} height={19} rx={9}
                fill="rgba(255,250,242,0.94)" stroke="#6b8e5a" strokeWidth={1} />
          <text y={39} textAnchor="middle" fontSize={10} fontWeight={700} fill="#3f2614">
            {starting ? 'starting…' : themedStructureLabel}
          </text>
        </g>

        {/* ground */}
        <path d={`M 0 ${VB_H - 96} Q 240 ${VB_H - 118} 500 ${VB_H - 100} T ${VB_W} ${VB_H - 108}
                  L ${VB_W} ${VB_H} L 0 ${VB_H} Z`}
              fill="url(#bush-ground)" />

        {/* RESIDENTS — drifting, because these ones fly */}
        {discoveredSpecies.map((sp, i) => {
          const { x, y } = slot(i);
          return (
            <motion.g key={sp.code}
              animate={reducedMotion ? undefined : { y: [0, -9, 0], x: [0, 5, 0, -5, 0] }}
              transition={reducedMotion ? undefined : {
                duration: 5 + (i % 3), repeat: Infinity, ease: 'easeInOut', delay: i * 0.5,
              }}
            >
              <g transform={`translate(${x - 32}, ${y - 32})`}>
                {SpeciesIllustration({ code: sp.code, size: 64 })
                  ?? <text x={32} y={42} textAnchor="middle" fontSize={40}>{sp.emoji}</text>}
              </g>
              <rect x={x - 58} y={y + 34} width={116} height={18} rx={5}
                    fill="rgba(149, 184, 143, 0.92)" />
              <text x={x} y={y + 47} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#fffaf2">
                {sp.commonName}
              </text>
            </motion.g>
          );
        })}

        {/* still to find — a shape passing behind the flowers */}
        {Array.from({ length: undiscoveredCount }).map((_, i) => {
          const { x, y } = slot(discoveredSpecies.length + i);
          return (
            <g key={`undiscovered-${i}`} opacity={0.6}>
              <ellipse cx={x - 11} cy={y} rx={15} ry={8} fill="#5A5470"
                       transform={`rotate(-18 ${x - 11} ${y})`} />
              <ellipse cx={x + 11} cy={y} rx={15} ry={8} fill="#5A5470"
                       transform={`rotate(18 ${x + 11} ${y})`} />
              <text x={x} y={y + 5} textAnchor="middle" fontSize={14} fontStyle="italic"
                    fill="#DCD6EA" opacity={0.85}>?</text>
              <rect x={x - 58} y={y + 34} width={116} height={18} rx={5}
                    fill="rgba(70, 66, 96, 0.75)" stroke="#5A5470" strokeWidth={0.7} />
              <text x={x} y={y + 47} textAnchor="middle" fontSize={9} fontStyle="italic" fill="#DCD6EA">
                a shape in the dusk
              </text>
            </g>
          );
        })}
      </svg>
    </HabitatInteriorLayout>
  );
}
