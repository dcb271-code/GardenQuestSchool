// app/(child)/garden/reading-forest/ReadingForestScene.tsx
//
// Reading Forest client scene. Forest aesthetic — woodland canopy,
// dappled light, an old oak in the NE morphology grove. Same
// structure-tap behavior as MathMountainScene.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MapStructure } from '@/lib/world/gardenMap';
import type { BranchCluster } from '@/lib/world/branchMaps';
import { BRANCH_MAP_WIDTH, BRANCH_MAP_HEIGHT } from '@/lib/world/branchMaps';
import BranchSceneLayout from '@/components/child/garden/BranchSceneLayout';
import { Tree, PineTree, Flower, GrassTuft } from '@/components/child/garden/illustrations';
import type { ReadingForestStructureState } from './page';

interface ReadingForestSceneProps {
  learnerId: string;
  structures: MapStructure[];
  clusters: BranchCluster[];
  structureStates: Record<string, ReadingForestStructureState>;
}

export default function ReadingForestScene({
  learnerId, structures, clusters, structureStates,
}: ReadingForestSceneProps) {
  const router = useRouter();
  const [tappedLocked, setTappedLocked] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

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

  const onStructureTap = (s: MapStructure) => {
    const state = structureStates[s.code];
    if (!state?.unlocked) {
      setTappedLocked(s.code);
      window.setTimeout(() => setTappedLocked(null), 2500);
      return;
    }
    if (s.skillCode) startSkill(s.skillCode);
  };

  return (
    <BranchSceneLayout learnerId={learnerId} title="Reading Forest" iconEmoji="🌲">
      <svg
        viewBox={`0 0 ${BRANCH_MAP_WIDTH} ${BRANCH_MAP_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'manipulation' }}
      >
        <defs>
          <linearGradient id="rfSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8E4BE" />
            <stop offset="40%" stopColor="#B8D4A8" />
            <stop offset="100%" stopColor="#7BA46F" />
          </linearGradient>
          <radialGradient id="rfDapple" cx="50%" cy="20%" r="60%">
            <stop offset="0%" stopColor="#FFF5D0" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFF5D0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={BRANCH_MAP_WIDTH} height={BRANCH_MAP_HEIGHT} fill="url(#rfSky)" />
        <rect width={BRANCH_MAP_WIDTH} height={BRANCH_MAP_HEIGHT} fill="url(#rfDapple)" />

        {/* Layered tree silhouettes — dense across the back */}
        {[60, 220, 380, 540, 700, 860, 1020, 1180, 1340].map((x, i) => (
          <g key={`bg-${i}`} opacity="0.6">
            <ellipse cx={x} cy={140} rx={70} ry={50} fill="#6B8E5A" />
            <rect x={x - 4} y={170} width={8} height={20} fill="#6b4423" />
          </g>
        ))}

        {/* Big oak in NE morphology grove */}
        <g>
          <ellipse cx={1190} cy={520} rx={130} ry={90} fill="#4a6c3f" stroke="#6b4423" strokeWidth={2} />
          <rect x={1185} y={580} width={12} height={50} fill="#6b4423" />
        </g>

        {/* Decorative middle-distance trees + flora */}
        <Tree x={120} y={620} size={80} />
        <PineTree x={1370} y={680} size={70} />
        <Tree x={300} y={680} size={60} />
        <PineTree x={460} y={620} size={56} />
        <GrassTuft x={500} y={760} size={22} />
        <GrassTuft x={900} y={770} size={22} />
        <Flower x={400} y={750} size={16} />
        <Flower x={1000} y={760} size={16} />

        {/* Phonics path winding through */}
        <path
          d="M 480 360 Q 540 280 700 220 Q 860 180 1100 220 Q 1200 240 1280 280"
          stroke="#EAD2A8" strokeWidth={28} fill="none" strokeLinecap="round" opacity={0.85}
        />
        <path
          d="M 480 360 Q 540 280 700 220 Q 860 180 1100 220 Q 1200 240 1280 280"
          stroke="#F7E6C4" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.7}
        />

        {/* Cluster labels */}
        {clusters.map(c => {
          const members = c.structureCodes
            .map(code => structures.find(s => s.code === code))
            .filter((s): s is MapStructure => !!s);
          if (members.length === 0) return null;
          const avgX = members.reduce((a, s) => a + s.x, 0) / members.length;
          const avgY = members.reduce((a, s) => a + s.y, 0) / members.length;
          return (
            <g key={c.code} pointerEvents="none">
              <rect
                x={avgX - 90} y={avgY - 110} width={180} height={20} rx={10}
                fill="rgba(255,250,242,0.55)" stroke="#95876a" strokeDasharray="3 2" strokeWidth={1}
              />
              <text
                x={avgX} y={avgY - 96} textAnchor="middle"
                fontSize={11} fontWeight={700} fill="#6b4423"
                style={{ letterSpacing: '1.2px', textTransform: 'uppercase' }}
              >
                {c.label}
              </text>
            </g>
          );
        })}

        {/* Structures */}
        {structures.map(s => {
          const state = structureStates[s.code];
          const completed = state?.completed ?? false;
          const unlocked = state?.unlocked ?? false;
          const isTappedLocked = tappedLocked === s.code;
          return (
            <g
              key={s.code}
              transform={`translate(${s.x}, ${s.y})`}
              style={{ cursor: 'pointer', touchAction: 'manipulation' }}
              onClick={() => onStructureTap(s)}
            >
              <circle r={Math.max(s.size * 0.7, 30)} fill="transparent" />
              <text
                textAnchor="middle"
                fontSize={s.size * 0.7}
                opacity={unlocked ? 1 : 0.35}
                style={{
                  filter: completed
                    ? 'drop-shadow(0 0 6px rgba(255, 217, 61, 0.6))'
                    : unlocked
                      ? 'drop-shadow(0 1px 2px rgba(107,68,35,0.4))'
                      : 'grayscale(0.7)',
                }}
              >
                {s.themeEmoji}
              </text>
              <rect
                x={-50} y={s.size * 0.45} width={100} height={16} rx={4}
                fill={completed ? 'rgba(255,217,61,0.85)' : 'rgba(255,250,242,0.85)'}
              />
              <text
                x={0} y={s.size * 0.55 + 6} textAnchor="middle"
                fontSize={9} fontWeight={600} fill="#6b4423"
              >
                {s.label}
              </text>
              {isTappedLocked && state && (
                <g>
                  <rect
                    x={-90} y={-s.size * 0.9} width={180} height={28} rx={6}
                    fill="#fffaf2" stroke="#c38d9e" strokeWidth={1.5}
                  />
                  <text
                    x={0} y={-s.size * 0.7 + 4} textAnchor="middle"
                    fontSize={10} fontStyle="italic" fill="#6b4423"
                  >
                    {state.prereqDisplay}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </BranchSceneLayout>
  );
}
