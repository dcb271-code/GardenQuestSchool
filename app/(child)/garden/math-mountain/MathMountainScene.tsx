// app/(child)/garden/math-mountain/MathMountainScene.tsx
//
// Math Mountain client scene. SVG-based, 14:8 aspect, hand-illustrated
// in the same vocabulary as the central garden — same palette, same
// mountain silhouette technique, same layered hills, same stepping
// stones, same brook ripple style. Composition:
//
//   • Pre-dawn alpine sky → meadow gradient
//   • 5 Fuji-style peaks across the back, with snow caps + mist band
//   • Soft morning sun with sunbeams from the upper-LEFT
//   • Three layered hill silhouettes (periwinkle → sage → forest)
//   • A brook winding through Operations Hollow (left foreground) —
//     the strand owns the water-themed structures (Quiet Pond,
//     Rushing Stream, Berry Basket, Big Falls), so a real stream
//     anchors them
//   • Stepping-stone meadow path snaking between the cluster regions,
//     same C9B489 → 8A7050 stone style as the central garden
//   • Decorative trees + grass tufts + flowers framing the edges

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

const W = BRANCH_MAP_WIDTH;
const H = BRANCH_MAP_HEIGHT;

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
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'manipulation' }}
      >
        <defs>
          {/* Same multi-stop sky as the central garden, slightly cooler
              palette to read as alpine morning */}
          <linearGradient id="mmSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#D4DFEF" />
            <stop offset="22%" stopColor="#E2DFF2" />
            <stop offset="42%" stopColor="#F2E7D6" />
            <stop offset="60%" stopColor="#E2E0BE" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#CEE3B4" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="mmMeadow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#D7EFB9" />
            <stop offset="55%" stopColor="#AED29A" />
            <stop offset="100%" stopColor="#8EB98A" />
          </linearGradient>
          <pattern id="mmGrass" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="transparent" />
            <path d="M 4 36 Q 4 30 6 28" stroke="#7BA46F" strokeWidth="1.2" fill="none" opacity="0.5" />
            <path d="M 20 38 Q 22 32 24 30" stroke="#7BA46F" strokeWidth="1.2" fill="none" opacity="0.45" />
            <path d="M 32 36 Q 30 32 32 28" stroke="#7BA46F" strokeWidth="1.2" fill="none" opacity="0.5" />
          </pattern>
          <linearGradient id="mmSunbeam" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFF5D0" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FFF5D0" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="mmSunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF5B0" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#FFE89A" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FFE89A" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sky band */}
        <rect width={W} height={H * 0.55} fill="url(#mmSky)" />
        {/* Meadow base + grass texture */}
        <rect width={W} height={H} fill="url(#mmMeadow)" opacity="0.95" />
        <rect width={W} height={H} fill="url(#mmGrass)" />

        {/* ===== FUJI PEAKS — five across the back, with snow + mist =====
             Same technique as the central garden's mountain range,
             different composition: one bigger central peak (Math
             Mountain itself) with two flanking pairs at decreasing
             distance, all painted before the hill layers so the hill
             washes sit atop them. */}
        <g opacity={0.9}>
          {/* Peak 5 — far-left, smallest + most faded */}
          <path
            d="M 60 280 Q 110 220 150 160 Q 165 148 180 162 Q 220 220 270 280 Z"
            fill="#DCE0ED" opacity={0.55}
          />

          {/* Peak 3 — left mid-distance */}
          <path
            d="M 220 290 Q 280 220 340 130 Q 360 113 380 132 Q 440 220 490 290 Z"
            fill="#B5BED4" opacity={0.78}
          />
          <path
            d="M 320 158 Q 350 122 367 126 Q 384 130 405 160
               Q 392 156 382 166 Q 370 152 360 168 Q 348 158 338 168
               Q 328 162 320 158 Z"
            fill="#F4F0E3" opacity={0.85}
          />

          {/* Peak 1 — THE BIG ONE, central, tall, classic Fuji */}
          <path
            d="M 540 320 Q 640 220 720 60 Q 740 40 760 60 Q 840 220 940 320 Z"
            fill="#7B8AAA"
          />
          {/* snow cap with crown drip */}
          <path
            d="M 685 110 Q 720 60 740 60 Q 760 60 795 110
               Q 780 106 770 118 Q 758 102 748 118 Q 736 108 724 122
               Q 710 110 700 122 Q 690 116 685 110 Z"
            fill="#FBF8ED"
          />
          {/* shadow side */}
          <path
            d="M 740 60 Q 840 220 940 320 L 740 320 Z"
            fill="#8D97B4" opacity={0.5}
          />

          {/* Peak 2 — right mid-distance */}
          <path
            d="M 990 290 Q 1050 220 1110 130 Q 1130 113 1150 132 Q 1210 220 1260 290 Z"
            fill="#B5BED4" opacity={0.78}
          />
          <path
            d="M 1090 158 Q 1120 122 1137 126 Q 1154 130 1175 160
               Q 1162 156 1152 166 Q 1140 152 1130 168 Q 1118 158 1108 168
               Q 1098 162 1090 158 Z"
            fill="#F4F0E3" opacity={0.85}
          />

          {/* Peak 4 — far-right, faded */}
          <path
            d="M 1240 280 Q 1290 220 1330 160 Q 1345 148 1360 162 Q 1395 220 1430 280 Z"
            fill="#DCE0ED" opacity={0.55}
          />

          {/* Mist band — soft white wash that ties peaks to hills */}
          <path
            d="M 60 320 Q 300 305 700 318 T 1380 312 Q 1420 318 1440 322
               L 1440 360 L 60 360 Z"
            fill="#FFFFFF" opacity={0.38}
          />
        </g>

        {/* ===== Soft sun with glow — upper-LEFT this time =====
             (central garden's sun is upper-right, so Math Mountain
             reads like a different perspective on the same world) */}
        <circle cx={W * 0.18} cy={120} r={90} fill="url(#mmSunGlow)" opacity={0.75} />
        <circle cx={W * 0.18} cy={120} r={32} fill="#FFF2B5" opacity={0.9} />

        {/* Sunbeam rays from upper-left, angled down-right */}
        <g opacity={0.5} style={{ mixBlendMode: 'screen' }} pointerEvents="none">
          {[0, 1, 2, 3, 4].map(i => (
            <polygon
              key={`ray-${i}`}
              points={`${W * 0.18 - 30},${90} ${W * 0.18 + 40},${90} ${W * 0.18 + 40 + i * 120 + 200},${H} ${W * 0.18 - 30 + i * 120 + 240},${H}`}
              fill="url(#mmSunbeam)"
              opacity={0.22 - i * 0.03}
            />
          ))}
        </g>

        {/* ===== Layered hills — same technique as the central garden ===== */}
        <g opacity={0.78}>
          <path
            d={`M 0 ${H * 0.46} Q 220 ${H * 0.36} 460 ${H * 0.42} T 900 ${H * 0.39} T ${W} ${H * 0.43} L ${W} ${H * 0.6} L 0 ${H * 0.6} Z`}
            fill="#B8C4DB" opacity={0.55}
          />
          <path
            d={`M 0 ${H * 0.53} Q 220 ${H * 0.44} 460 ${H * 0.51} T 900 ${H * 0.48} T ${W} ${H * 0.52} L ${W} ${H * 0.66} L 0 ${H * 0.66} Z`}
            fill="#A3BEA2" opacity={0.7}
          />
          <path
            d={`M 0 ${H * 0.61} Q 300 ${H * 0.54} 640 ${H * 0.59} T ${W} ${H * 0.56} L ${W} ${H * 0.72} L 0 ${H * 0.72} Z`}
            fill="#8AAF84" opacity={0.65}
          />
        </g>

        {/* ===== Brook — water for Operations Hollow's pond/stream/falls
             structures. Enters lower-left, widens at a small pool, then
             fades into the meadow. Same palette + ripple style as the
             central garden's brook. */}
        <g pointerEvents="none">
          {/* wet-earth bank */}
          <path
            d={`M 30 580 Q 60 540 100 530 Q 200 520 320 540 Q 380 552 420 575
                Q 440 588 425 600 Q 410 612 380 605 Q 320 595 240 600
                Q 160 605 100 615 Q 50 622 25 605 Q 12 595 30 580 Z`}
            fill="#6B8E5A" opacity={0.32}
          />
          {/* primary water body */}
          <path
            d={`M 38 583 Q 70 545 108 535 Q 205 525 320 545 Q 376 556 412 578
                Q 428 590 415 599 Q 400 608 376 600 Q 320 590 245 595
                Q 165 600 108 612 Q 60 619 35 602 Q 24 593 38 583 Z`}
            fill="#B2D4D9"
          />
          {/* depth channel */}
          <path
            d={`M 60 580 Q 110 558 200 562 Q 290 568 380 582`}
            stroke="#8FB7C2" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.68}
          />
          {/* shimmer ripples */}
          <path d={`M 90 582 Q 110 578 130 583`} stroke="#FFFFFF" strokeWidth={1.1} fill="none" opacity={0.7} strokeLinecap="round" />
          <path d={`M 200 580 Q 220 575 240 582`} stroke="#FFFFFF" strokeWidth={1.1} fill="none" opacity={0.65} strokeLinecap="round" />
          <path d={`M 320 590 Q 340 585 360 593`} stroke="#FFFFFF" strokeWidth={1.1} fill="none" opacity={0.7} strokeLinecap="round" />
          {/* moss-topped boulders in the brook */}
          <g>
            <ellipse cx={150} cy={570} rx={14} ry={8} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.5} />
            <ellipse cx={150} cy={566} rx={11} ry={4.5} fill="#A89D8A" />
            <ellipse cx={150} cy={564} rx={12} ry={3} fill="#7BA46F" opacity={0.9} />
          </g>
          <g>
            <ellipse cx={280} cy={580} rx={11} ry={6} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.4} />
            <ellipse cx={280} cy={576} rx={8} ry={3.5} fill="#A89D8A" />
            <ellipse cx={280} cy={575} rx={9} ry={2.5} fill="#7BA46F" opacity={0.9} />
          </g>
        </g>

        {/* ===== Stepping-stone meadow path — winds through the cluster
             regions, same C9B489/8A7050 stone style as the central garden's */}
        {(() => {
          const pathD = `M 80 720 C 200 680, 360 700, 520 680 C 680 660, 840 700, 1000 670 C 1180 640, 1340 690, 1420 720`;
          return (
            <g pointerEvents="none">
              <path d={pathD} stroke="#A99878" strokeWidth={42} fill="none" strokeLinecap="round" opacity={0.22} />
              <path d={pathD} stroke="#EAD2A8" strokeWidth={28} fill="none" strokeLinecap="round" opacity={0.88} />
              <path d={pathD} stroke="#F7E6C4" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.6} />
              {[
                { x: 140, y: 712 }, { x: 280, y: 696 }, { x: 420, y: 690 },
                { x: 580, y: 678 }, { x: 740, y: 680 }, { x: 900, y: 678 },
                { x: 1060, y: 666 }, { x: 1220, y: 668 }, { x: 1360, y: 700 },
              ].map((s, i) => (
                <g key={`mm-stone-${i}`}>
                  <ellipse cx={s.x + 1} cy={s.y + 2} rx={11} ry={6} fill="#000" opacity={0.2} />
                  <ellipse cx={s.x} cy={s.y} rx={11} ry={6} fill="#C9B489" stroke="#8A7050" strokeWidth={1.2} />
                  <ellipse cx={s.x - 2} cy={s.y - 1.5} rx={5} ry={2} fill="#E0CBA1" opacity={0.8} />
                </g>
              ))}
            </g>
          );
        })()}

        {/* ===== Decorative flora — frame the cluster regions ===== */}
        <Tree x={70} y={500} size={70} variant={1} />
        <PineTree x={1380} y={520} size={70} />
        <Tree x={1380} y={680} size={56} variant={2} />
        <PineTree x={50} y={680} size={56} />
        <Tree x={460} y={620} size={48} variant={3} />
        <Tree x={1020} y={620} size={48} variant={1} />
        <GrassTuft x={460} y={760} size={20} />
        <GrassTuft x={760} y={770} size={20} />
        <GrassTuft x={1080} y={760} size={20} />
        <Flower x={380} y={760} size={16} />
        <Flower x={620} y={770} size={16} />
        <Flower x={1140} y={770} size={16} />
        <Flower x={1280} y={760} size={16} />

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
