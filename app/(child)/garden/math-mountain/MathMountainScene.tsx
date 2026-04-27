// app/(child)/garden/math-mountain/MathMountainScene.tsx
//
// Math Mountain client scene. SVG-based, 14:8 aspect, hand-illustrated
// in the same vocabulary as the central garden. Background composition
// (sky, big central peak, plateau, foothill meadow) is laid in here
// using the same illustration components.
//
// Structures within Math Mountain unlock based on their skill prereqs.
// Locked structures are visible-but-ghosted with a tap-to-show prereq
// message.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MapStructure } from '@/lib/world/gardenMap';
import type { BranchCluster } from '@/lib/world/branchMaps';
import { BRANCH_MAP_WIDTH, BRANCH_MAP_HEIGHT } from '@/lib/world/branchMaps';
import BranchSceneLayout from '@/components/child/garden/BranchSceneLayout';
import {
  Tree, PineTree, Flower, GrassTuft,
} from '@/components/child/garden/illustrations';
import type { MathMountainStructureState } from './page';

interface MathMountainSceneProps {
  learnerId: string;
  structures: MapStructure[];
  clusters: BranchCluster[];
  structureStates: Record<string, MathMountainStructureState>;
}

export default function MathMountainScene({
  learnerId, structures, clusters, structureStates,
}: MathMountainSceneProps) {
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
    <BranchSceneLayout learnerId={learnerId} title="Math Mountain" iconEmoji="⛰️">
      <svg
        viewBox={`0 0 ${BRANCH_MAP_WIDTH} ${BRANCH_MAP_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'manipulation' }}
      >
        {/* Sky → meadow gradient (alpine palette) */}
        <defs>
          <linearGradient id="mmSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#DCE3F0" />
            <stop offset="38%" stopColor="#E6DFFF" />
            <stop offset="55%" stopColor="#F6EAD4" />
            <stop offset="100%" stopColor="#CEE3B4" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="mmMeadow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D7EFB9" />
            <stop offset="55%" stopColor="#AED29A" />
            <stop offset="100%" stopColor="#8EB98A" />
          </linearGradient>
        </defs>
        <rect width={BRANCH_MAP_WIDTH} height={BRANCH_MAP_HEIGHT * 0.55} fill="url(#mmSky)" />
        <rect width={BRANCH_MAP_WIDTH} height={BRANCH_MAP_HEIGHT} fill="url(#mmMeadow)" opacity="0.95" />

        {/* Central peak — bigger Fuji silhouette than central garden */}
        <g opacity="0.9">
          <path
            d="M 540 360 Q 640 240 720 60 Q 740 40 760 60 Q 840 240 940 360 Z"
            fill="#7B8AAA"
          />
          <path
            d="M 690 110 Q 720 64 740 60 Q 760 64 790 110 Q 776 108 766 118 Q 754 102 744 118 Q 732 108 720 120 Q 706 112 690 110 Z"
            fill="#FBF8ED"
          />
          {/* Side peaks */}
          <path d="M 80 340 Q 200 200 320 340 Z" fill="#A3ACC8" opacity="0.85" />
          <path d="M 1100 340 Q 1220 220 1360 340 Z" fill="#A3ACC8" opacity="0.85" />
        </g>

        {/* Layered hills */}
        <path
          d={`M 0 ${BRANCH_MAP_HEIGHT * 0.50} Q 220 ${BRANCH_MAP_HEIGHT * 0.42} 460 ${BRANCH_MAP_HEIGHT * 0.48} T 900 ${BRANCH_MAP_HEIGHT * 0.45} T ${BRANCH_MAP_WIDTH} ${BRANCH_MAP_HEIGHT * 0.49} L ${BRANCH_MAP_WIDTH} ${BRANCH_MAP_HEIGHT * 0.62} L 0 ${BRANCH_MAP_HEIGHT * 0.62} Z`}
          fill="#A3BEA2" opacity="0.7"
        />
        <path
          d={`M 0 ${BRANCH_MAP_HEIGHT * 0.58} Q 300 ${BRANCH_MAP_HEIGHT * 0.50} 640 ${BRANCH_MAP_HEIGHT * 0.56} T ${BRANCH_MAP_WIDTH} ${BRANCH_MAP_HEIGHT * 0.53} L ${BRANCH_MAP_WIDTH} ${BRANCH_MAP_HEIGHT * 0.7} L 0 ${BRANCH_MAP_HEIGHT * 0.7} Z`}
          fill="#8AAF84" opacity="0.7"
        />

        {/* Decorative trees + grass to soften the cluster spaces */}
        <Tree x={60}   y={580} size={70} />
        <PineTree x={1380} y={580} size={70} />
        <Tree x={1380} y={680} size={56} />
        <PineTree x={60}  y={680} size={56} />
        <GrassTuft x={500} y={770} size={20} />
        <GrassTuft x={900} y={780} size={20} />
        <Flower x={420} y={760} size={16} />
        <Flower x={1020} y={760} size={16} />

        {/* Cluster labels */}
        {clusters.map(c => {
          // Average position of cluster's structures, used as anchor.
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
              {/* hit area — meets 60pt min */}
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
