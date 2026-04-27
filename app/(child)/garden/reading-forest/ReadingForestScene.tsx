// app/(child)/garden/reading-forest/ReadingForestScene.tsx
//
// Reading Forest client scene. Hand-illustrated 14:8 SVG using the
// same vocabulary as the central garden — same tree style (Tree
// component variants), same brook ripple style, same stepping-stone
// path system, same naturalist palette. Composition:
//
//   • Soft morning sky filtered through a forest canopy
//   • Three layered tree-line silhouettes for depth (far → mid → near)
//   • Dappled sun shafts through the canopy
//   • A brook winding through the lower-left, with shimmer + boulders
//   • A grand old oak in the NE for the Morphology Grove (multi-layered
//     foliage + trunk + roots, not just an ellipse)
//   • A stepping-stone Phonics Path winding through the middle
//   • A clearing of mossy boulders for Story Rocks at the back

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

const W = BRANCH_MAP_WIDTH;
const H = BRANCH_MAP_HEIGHT;

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
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'manipulation' }}
      >
        <defs>
          {/* Forest canopy: light filters down from above. */}
          <linearGradient id="rfSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#F4ECCB" />
            <stop offset="22%" stopColor="#DCE5BD" />
            <stop offset="50%" stopColor="#A2C794" />
            <stop offset="80%" stopColor="#7BA46F" />
            <stop offset="100%" stopColor="#5C7E4F" />
          </linearGradient>
          <radialGradient id="rfDapple" cx="50%" cy="15%" r="65%">
            <stop offset="0%" stopColor="#FFF5D0" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#FFF5D0" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#FFF5D0" stopOpacity="0" />
          </radialGradient>
          <pattern id="rfFloor" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <rect width="60" height="60" fill="transparent" />
            <ellipse cx="10" cy="50" rx="3" ry="1" fill="#5C7E4F" opacity="0.35" />
            <path d="M 28 56 Q 30 50 32 48" stroke="#7BA46F" strokeWidth="1.0" fill="none" opacity="0.55" />
            <ellipse cx="48" cy="40" rx="2.5" ry="0.8" fill="#4F6F42" opacity="0.4" />
          </pattern>
          <linearGradient id="rfShaft" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFF5D0" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFF5D0" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Sky / canopy filter */}
        <rect width={W} height={H} fill="url(#rfSky)" />
        <rect width={W} height={H} fill="url(#rfDapple)" />
        <rect width={W} height={H} fill="url(#rfFloor)" />

        {/* ===== Layered forest depth ===== */}
        {/* Far tree-line — soft, blended into the canopy */}
        <g opacity={0.5}>
          {[40, 130, 220, 320, 420, 520, 620, 720, 820, 920, 1020, 1120, 1220, 1320, 1410].map((cx, i) => (
            <ellipse key={`far-${i}`} cx={cx} cy={130 + (i % 3) * 12} rx={50 + (i % 4) * 8} ry={32 + (i % 3) * 4}
              fill="#5C7E4F" />
          ))}
        </g>
        {/* Mid tree-line — clearer silhouettes with trunks */}
        <g opacity={0.75}>
          {[80, 240, 400, 560, 720, 880, 1040, 1200, 1360].map((cx, i) => (
            <g key={`mid-${i}`}>
              <ellipse cx={cx} cy={195 + (i % 2) * 14} rx={64} ry={42} fill="#4F6F42" />
              <rect x={cx - 4} y={225} width={8} height={28} fill="#6b4423" />
            </g>
          ))}
        </g>
        {/* Mist band where the tree-line meets the floor */}
        <path
          d={`M 0 ${H * 0.36} Q 360 ${H * 0.34} 720 ${H * 0.37} T ${W} ${H * 0.36}
              L ${W} ${H * 0.42} L 0 ${H * 0.42} Z`}
          fill="#FFFFFF" opacity={0.32}
        />

        {/* ===== Dappled sun shafts down through the canopy ===== */}
        <g opacity={0.55} style={{ mixBlendMode: 'screen' }} pointerEvents="none">
          {[0, 1, 2, 3].map(i => (
            <polygon
              key={`shaft-${i}`}
              points={`${280 + i * 280},80 ${340 + i * 280},80 ${410 + i * 280 + 80},${H} ${260 + i * 280 + 80},${H}`}
              fill="url(#rfShaft)"
              opacity={0.4 - i * 0.08}
            />
          ))}
        </g>

        {/* ===== Forest floor — gentle hill layers ===== */}
        <path
          d={`M 0 ${H * 0.46} Q 220 ${H * 0.42} 460 ${H * 0.46} T 900 ${H * 0.44} T ${W} ${H * 0.47} L ${W} ${H * 0.6} L 0 ${H * 0.6} Z`}
          fill="#7BA46F" opacity={0.55}
        />
        <path
          d={`M 0 ${H * 0.55} Q 260 ${H * 0.5} 520 ${H * 0.54} T 980 ${H * 0.51} T ${W} ${H * 0.55} L ${W} ${H * 0.7} L 0 ${H * 0.7} Z`}
          fill="#6B8E5A" opacity={0.6}
        />

        {/* ===== Brook winding through lower-left =====
             Continues from the central garden's brook (which enters
             the upper-left of the central scene); here it has
             travelled deeper into the forest. */}
        <g pointerEvents="none">
          <path
            d={`M 0 540 Q 60 530 130 545 Q 220 565 320 555
                Q 380 548 410 568 Q 430 582 410 595 Q 380 605 320 596
                Q 220 588 130 600 Q 50 612 0 600 Z`}
            fill="#6B8E5A" opacity={0.32}
          />
          <path
            d={`M 0 545 Q 60 535 130 548 Q 220 568 320 558
                Q 376 552 405 570 Q 422 580 405 590 Q 376 600 320 591
                Q 220 583 130 596 Q 50 608 0 596 Z`}
            fill="#B2D4D9"
          />
          <path
            d={`M 30 565 Q 100 555 200 575 Q 290 588 380 580`}
            stroke="#8FB7C2" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.65}
          />
          <path d={`M 60 562 Q 80 558 100 564`} stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.7} strokeLinecap="round" />
          <path d={`M 180 578 Q 200 573 220 580`} stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.65} strokeLinecap="round" />
          <path d={`M 300 583 Q 320 578 340 585`} stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.7} strokeLinecap="round" />
          {/* boulders */}
          <g>
            <ellipse cx={150} cy={555} rx={14} ry={8} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.5} />
            <ellipse cx={150} cy={551} rx={11} ry={4.5} fill="#A89D8A" />
            <ellipse cx={150} cy={549} rx={12} ry={3} fill="#7BA46F" opacity={0.9} />
          </g>
          <g>
            <ellipse cx={260} cy={570} rx={11} ry={6} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.4} />
            <ellipse cx={260} cy={566} rx={8} ry={3.5} fill="#A89D8A" />
            <ellipse cx={260} cy={565} rx={9} ry={2.5} fill="#7BA46F" opacity={0.9} />
          </g>
        </g>

        {/* ===== The grand old oak — anchors the Morphology Grove =====
             Hand-built (not a Tree component) so it reads as a single
             ancient tree with character. Multi-layer canopy + thick
             trunk + visible roots. */}
        <g transform="translate(1200, 460)">
          {/* root flare */}
          <path d="M -28 130 Q -22 116 -10 110 L 10 110 Q 22 116 28 130 Z"
            fill="#6b4423" opacity={0.45} />
          {/* trunk */}
          <path
            d="M -16 130 Q -22 80 -18 30 Q -16 5 -10 -10 L 10 -10
               Q 16 5 18 30 Q 22 80 16 130 Z"
            fill="#8B5A2B" stroke="#5A3B1F" strokeWidth={2.2} strokeLinejoin="round"
          />
          {/* bark texture */}
          <path d="M -8 70 Q -4 30 0 -5" stroke="#5A3B1F" strokeWidth={0.9} fill="none" opacity={0.45} />
          <path d="M 6 75 Q 4 30 -2 -5" stroke="#5A3B1F" strokeWidth={0.7} fill="none" opacity={0.35} />
          {/* outer canopy — dark hull */}
          <path
            d={`M -130 -10 Q -150 -75 -90 -120 Q -30 -155 30 -150
                Q 100 -135 130 -85 Q 145 -25 110 5 Q 50 25 0 18
                Q -75 25 -120 0 Q -135 -5 -130 -10 Z`}
            fill="#4f6e3f" stroke="#3a5230" strokeWidth={2.4} strokeLinejoin="round"
          />
          {/* mid-tone layer */}
          <path
            d={`M -100 -25 Q -115 -70 -70 -105 Q -20 -130 25 -125
                Q 80 -115 105 -75 Q 115 -30 85 -8 Q 35 8 -5 2
                Q -65 5 -100 -25 Z`}
            fill="#6b8e5a"
          />
          {/* highlight */}
          <path
            d={`M -50 -65 Q -30 -90 0 -90 Q 25 -85 30 -65 Q 25 -50 0 -50 Q -30 -52 -50 -65 Z`}
            fill="#A2C794" opacity={0.85}
          />
        </g>

        {/* ===== Mossy boulders for Story Rocks ===== */}
        <g>
          {[
            { x: 660, y: 660, w: 28, h: 16 },
            { x: 720, y: 700, w: 22, h: 12 },
            { x: 800, y: 680, w: 26, h: 15 },
            { x: 870, y: 720, w: 20, h: 11 },
            { x: 760, y: 740, w: 18, h: 10 },
          ].map((r, i) => (
            <g key={`rock-${i}`}>
              <ellipse cx={r.x + 1.5} cy={r.y + 3} rx={r.w} ry={r.h * 0.45} fill="#000" opacity={0.22} />
              <ellipse cx={r.x} cy={r.y} rx={r.w} ry={r.h} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.5} />
              <ellipse cx={r.x - 2} cy={r.y - 2} rx={r.w * 0.7} ry={r.h * 0.5} fill="#A89D8A" />
              <ellipse cx={r.x} cy={r.y - 4} rx={r.w * 0.8} ry={r.h * 0.35} fill="#7BA46F" opacity={0.85} />
              <circle cx={r.x - r.w * 0.4} cy={r.y - r.h * 0.2} r={1.2} fill="#8FB67A" />
            </g>
          ))}
        </g>

        {/* ===== Phonics Path — winding stepping-stone trail ===== */}
        {(() => {
          const pathD = `M 380 380 Q 460 320 580 290 Q 720 250 880 250 Q 1020 260 1140 280 Q 1220 300 1280 320`;
          return (
            <g pointerEvents="none">
              <path d={pathD} stroke="#A99878" strokeWidth={36} fill="none" strokeLinecap="round" opacity={0.22} />
              <path d={pathD} stroke="#EAD2A8" strokeWidth={24} fill="none" strokeLinecap="round" opacity={0.85} />
              <path d={pathD} stroke="#F7E6C4" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.55} />
              {[
                { x: 420, y: 350 }, { x: 510, y: 312 }, { x: 620, y: 282 },
                { x: 740, y: 262 }, { x: 860, y: 252 }, { x: 980, y: 258 },
                { x: 1100, y: 274 }, { x: 1220, y: 298 },
              ].map((s, i) => (
                <g key={`rf-stone-${i}`}>
                  <ellipse cx={s.x + 1} cy={s.y + 2} rx={9} ry={5} fill="#000" opacity={0.2} />
                  <ellipse cx={s.x} cy={s.y} rx={9} ry={5} fill="#C9B489" stroke="#8A7050" strokeWidth={1.1} />
                  <ellipse cx={s.x - 2} cy={s.y - 1.2} rx={4} ry={1.7} fill="#E0CBA1" opacity={0.8} />
                </g>
              ))}
            </g>
          );
        })()}

        {/* ===== Decorative trees + flora ===== */}
        <Tree x={130} y={620} size={88} variant={1} />
        <Tree x={310} y={680} size={64} variant={2} />
        <PineTree x={1380} y={680} size={70} />
        <PineTree x={460} y={620} size={54} />
        <Tree x={580} y={760} size={42} variant={3} />
        <GrassTuft x={520} y={770} size={22} />
        <GrassTuft x={920} y={770} size={22} />
        <GrassTuft x={1080} y={780} size={20} />
        <Flower x={420} y={760} size={16} />
        <Flower x={1000} y={760} size={16} />
        <Flower x={1280} y={770} size={14} />

        {/* ===== Cluster labels ===== */}
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
                fill="rgba(255,250,242,0.65)" stroke="#95876a" strokeDasharray="3 2" strokeWidth={1}
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

        {/* ===== Structures ===== */}
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
