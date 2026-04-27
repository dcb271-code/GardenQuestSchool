// app/(child)/garden/habitat/[code]/BunnyBurrowInterior.tsx
//
// Bunny Burrow interior — cozy, atmospheric. One themed skill structure
// in the center-back (Petal Counting), animated discovered species
// hopping in the foreground, ghost slots for undiscovered species.

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
        {/* Underground earthy radial gradient */}
        <defs>
          <radialGradient id="bbGlow" cx="50%" cy="60%" r="70%">
            <stop offset="0%" stopColor="#fff5d8" />
            <stop offset="25%" stopColor="#f5d99c" />
            <stop offset="55%" stopColor="#d4a574" />
            <stop offset="90%" stopColor="#8a5a3c" />
            <stop offset="100%" stopColor="#5a3820" />
          </radialGradient>
        </defs>
        <rect width={1440} height={800} fill="url(#bbGlow)" />

        {/* Tunnel arch silhouette at top */}
        <path
          d="M 0 0 L 0 220 Q 160 110 360 80 Q 720 30 1080 80 Q 1280 110 1440 220 L 1440 0 Z"
          fill="#3a2510" opacity="0.85"
        />

        {/* Hanging roots */}
        {[180, 320, 480, 640, 800, 980, 1180, 1320].map((x, i) => (
          <path
            key={`root-${i}`}
            d={`M ${x} 80 Q ${x + 4} 130 ${x - 6} 180`}
            stroke="#6b4423" strokeWidth={1.5} fill="none" opacity={0.6}
          />
        ))}

        {/* Hanging lantern + glow */}
        <line x1={720} y1={80} x2={720} y2={170} stroke="#6b4423" strokeWidth={2} />
        <circle cx={720} cy={190} r={32} fill="#FFD93D" opacity={0.95} />
        <circle cx={720} cy={190} r={70} fill="#FFD93D" opacity={0.18} />

        {/* Soft floor curve */}
        <ellipse cx={720} cy={780} rx={760} ry={70} fill="#7a5034" opacity={0.7} />
        <ellipse cx={720} cy={790} rx={680} ry={45} fill="#5a3820" opacity={0.5} />

        {/* Floor decorations */}
        <text x={400} y={650} textAnchor="middle" fontSize={20}>🍂</text>
        <text x={1020} y={650} textAnchor="middle" fontSize={20}>🍄</text>
        <text x={200} y={730} textAnchor="middle" fontSize={18}>🌿</text>
        <text x={1240} y={730} textAnchor="middle" fontSize={18}>🌾</text>

        {/* Themed skill structure (center-back, glowing) */}
        <g
          transform="translate(720, 440)"
          style={{ cursor: 'pointer', touchAction: 'manipulation' }}
          onClick={startSkill}
        >
          <circle r={50} fill="transparent" />
          <text
            textAnchor="middle" fontSize={42}
            style={{ filter: 'drop-shadow(0 0 10px rgba(255, 217, 61, 0.7))' }}
          >
            {themedStructureEmoji}
          </text>
          <rect x={-70} y={36} width={140} height={20} rx={6} fill="rgba(232, 196, 147, 0.95)" />
          <text x={0} y={50} textAnchor="middle" fontSize={11} fontWeight={700} fill="#6b4423">
            {themedStructureLabel}
          </text>
        </g>

        {/* Discovered species — animated hop */}
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

        {/* Undiscovered slots — ghost outlines */}
        {Array.from({ length: undiscoveredCount }).map((_, i) => {
          const x = 280 + (discoveredSpecies.length + i) * 180;
          const y = 600;
          return (
            <g key={`undiscovered-${i}`} opacity={0.25}>
              <text x={x} y={y} textAnchor="middle" fontSize={32} style={{ filter: 'grayscale(1)' }}>
                🐰
              </text>
              <rect x={x - 50} y={y + 12} width={100} height={16} rx={4} fill="rgba(220,210,190,0.65)" />
              <text x={x} y={y + 24} textAnchor="middle" fontSize={9} fontStyle="italic" fill="#95876a">
                ? ? ?
              </text>
            </g>
          );
        })}
      </svg>
    </HabitatInteriorLayout>
  );
}
