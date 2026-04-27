// app/(child)/garden/math-mountain/MathMountainScene.tsx
//
// Math Mountain — hand-illustrated SVG, same vocabulary as the central garden.
//
// Composition (back to front):
//   1. Alpine sky gradient (cool lavender-blue to meadow green)
//   2. Five Fuji-style peaks with snow caps + mist band (sun upper-left)
//   3. Three layered hill silhouettes (periwinkle → sage → deeper sage)
//   4. Cluster region tints — soft radial washes that demarcate:
//        Operations Hollow (left, warm amber valley)
//        Place-Value Heights (centre, cooler plateau)
//        Multiplication Orchard (right, warm ochre)
//        Division Glen (upper-right, cool pine-shadow)
//        Measurement Meadow (bottom centre, bright meadow)
//        Word Stories Cottage (bottom-left, cream nook)
//   5. Brook winding through Operations Hollow — enters upper-left,
//      pools at a small pond (Quiet Pond sits on the bank), continues
//      through Rushing Stream → Big Falls, exits lower-left
//   6. One coherent path: starts at Word Stories Cottage, arcs through
//      Measurement Meadow, forks — left branch descends into Operations
//      Hollow and ends at the brook/pond bank; right branch climbs to
//      Place-Value Heights plateau peak; another branch reaches the
//      Multiplication Orchard end and Division Glen
//   7. Apple-orchard tree rows in Multiplication Orchard (right)
//   8. Pine-framed wooded feel for Division Glen (upper-right)
//   9. Stone step terraces in Place-Value Heights
//  10. CozyHouse + cottage garden for Word Stories Cottage
//  11. Framing trees (never overlapping structures)
//  12. Grass tufts + flowers at meadow level only (y > 600)

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MapStructure } from '@/lib/world/gardenMap';
import type { BranchCluster } from '@/lib/world/branchMaps';
import { BRANCH_MAP_WIDTH, BRANCH_MAP_HEIGHT } from '@/lib/world/branchMaps';
import BranchSceneLayout from '@/components/child/garden/BranchSceneLayout';
import {
  Tree, PineTree, Flower, GrassTuft, StructureIllustration,
} from '@/components/child/garden/illustrations';
import type { MathMountainStructureState } from './page';

interface MathMountainSceneProps {
  learnerId: string;
  structures: MapStructure[];
  clusters: BranchCluster[];
  structureStates: Record<string, MathMountainStructureState>;
}

const W = BRANCH_MAP_WIDTH;   // 1440
const H = BRANCH_MAP_HEIGHT;  // 800

// Maps branch structure codes → an existing StructureIllustration code
// when the underlying skill is the same or thematically equivalent.
const ILLUSTRATION_ALIAS: Record<string, string> = {
  mm_butterfly_make10: 'math_butterfly_arrays',  // butterfly = crossing-ten / arrays
  mm_array_orchard:    'math_array_orchard',
  mm_hundreds_hollow:  'math_hundreds_hollow',
  mm_tens_tower:       'math_tens_tower',
  mm_compare_trees:    'math_compare_trees',
  mm_stories_plus:     'math_word_stories',
  mm_stories_minus:    'math_word_stories',
  mm_long_stories:     'math_word_stories',
};

// A stone plinth with the structure emoji sitting on it.
// Rendered at (0,0) — caller wraps in <g transform="translate(x,y)">
function PlinthEmoji({ emoji, size }: { emoji: string; size: number }) {
  const baseW = size * 0.65;
  const baseH = size * 0.18;
  const baseY = size * 0.32;
  return (
    <g>
      {/* shadow under plinth */}
      <ellipse cx={1} cy={baseY + 4} rx={baseW * 0.85} ry={baseH * 0.55} fill="#000" opacity={0.25} />
      {/* plinth base — 3-tone */}
      <ellipse cx={0} cy={baseY} rx={baseW} ry={baseH} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.4} />
      <ellipse cx={0} cy={baseY - 2} rx={baseW * 0.92} ry={baseH * 0.7} fill="#A89D8A" />
      <ellipse cx={-2} cy={baseY - 4} rx={baseW * 0.55} ry={baseH * 0.3} fill="#C9C2B5" opacity={0.85} />
      {/* moss tuft */}
      <ellipse cx={baseW * 0.5} cy={baseY - baseH * 0.4} rx={baseW * 0.18} ry={baseH * 0.35} fill="#7BA46F" opacity={0.85} />
      {/* the emoji sits on the plinth */}
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size * 0.78}
        y={baseY - baseH - size * 0.18}
        style={{ filter: 'drop-shadow(0 1px 2px rgba(107,68,35,0.35))' }}
      >
        {emoji}
      </text>
    </g>
  );
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
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'manipulation' }}
      >
        <defs>
          {/* Alpine sky — cooler than the central garden, reads as mountain morning */}
          <linearGradient id="mmSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#C8D8EC" />
            <stop offset="20%" stopColor="#D9E6F0" />
            <stop offset="38%" stopColor="#EDE5D2" />
            <stop offset="58%" stopColor="#E0DDB8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#CEE3B4" stopOpacity="0" />
          </linearGradient>
          {/* Meadow — same as central garden */}
          <linearGradient id="mmMeadow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#D7EFB9" />
            <stop offset="55%" stopColor="#AED29A" />
            <stop offset="100%" stopColor="#8EB98A" />
          </linearGradient>
          {/* Grass texture pattern */}
          <pattern id="mmGrass" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="transparent" />
            <path d="M 4 36 Q 4 30 6 28" stroke="#7BA46F" strokeWidth="1.2" fill="none" opacity="0.5" />
            <path d="M 20 38 Q 22 32 24 30" stroke="#7BA46F" strokeWidth="1.2" fill="none" opacity="0.45" />
            <path d="M 32 36 Q 30 32 32 28" stroke="#7BA46F" strokeWidth="1.2" fill="none" opacity="0.5" />
          </pattern>
          {/* Sunbeam gradient — angled from upper-left */}
          <linearGradient id="mmSunbeam" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFF5D0" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FFF5D0" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="mmSunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF5B0" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#FFE89A" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FFE89A" stopOpacity="0" />
          </radialGradient>
          {/* Cluster region tints */}
          <radialGradient id="mmHollowTint" cx="20%" cy="68%" r="32%">
            <stop offset="0%" stopColor="#E8C493" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#E8C493" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="mmPlateauTint" cx="50%" cy="48%" r="30%">
            <stop offset="0%" stopColor="#B5BED4" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#B5BED4" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="mmOrchardTint" cx="82%" cy="72%" r="28%">
            <stop offset="0%" stopColor="#E8A87C" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#E8A87C" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="mmGlenTint" cx="82%" cy="32%" r="22%">
            <stop offset="0%" stopColor="#95B88F" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#95B88F" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="mmMeadowTint" cx="55%" cy="92%" r="30%">
            <stop offset="0%" stopColor="#D7EFB9" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#D7EFB9" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="mmCottageTint" cx="8%" cy="95%" r="18%">
            <stop offset="0%" stopColor="#F5EBDC" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#F5EBDC" stopOpacity="0" />
          </radialGradient>
          {/* Brook water */}
          <linearGradient id="mmBrookGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C4DFE4" />
            <stop offset="100%" stopColor="#92BFCA" />
          </linearGradient>
        </defs>

        {/* ── 1. SKY WASH ── */}
        <rect width={W} height={H * 0.58} fill="url(#mmSky)" />
        {/* Meadow fills the rest */}
        <rect width={W} height={H} fill="url(#mmMeadow)" opacity="0.95" />
        <rect width={W} height={H} fill="url(#mmGrass)" />

        {/* ── 2. FUJI PEAKS — five across the back ──
             Central peak (Math Mountain itself) is the tallest.
             Two flanking pairs at decreasing scale and opacity.
             Sun sits upper-LEFT, same as an alternate viewpoint
             of the same mountain world. */}
        <g opacity={0.92}>
          {/* Peak 5 — far-left, faintest, barely-there */}
          <path
            d="M 0 295 Q 55 238 95 185 Q 108 173 122 186 Q 162 238 210 295 Z"
            fill="#DCE0ED" opacity={0.48}
          />

          {/* Peak 3 — left mid-distance */}
          <path
            d="M 160 305 Q 235 230 295 148 Q 315 128 335 148 Q 395 230 455 305 Z"
            fill="#B5BED4" opacity={0.72}
          />
          <path
            d="M 277 172 Q 305 138 322 142 Q 340 147 360 174
               Q 347 170 338 180 Q 326 167 316 180 Q 305 170 295 182
               Q 283 174 277 172 Z"
            fill="#F4F0E3" opacity={0.85}
          />

          {/* Peak 1 — THE BIG ONE, centred slightly left, tallest */}
          <path
            d="M 500 330 Q 610 225 700 68 Q 722 45 745 68 Q 835 225 945 330 Z"
            fill="#7B8AAA"
          />
          {/* Snow crown */}
          <path
            d="M 658 118 Q 695 65 718 62 Q 742 63 782 118
               Q 766 112 755 126 Q 742 110 730 126 Q 716 114 704 128
               Q 688 118 678 130 Q 666 122 658 118 Z"
            fill="#FBF8ED"
          />
          {/* Shadow side — right face darker */}
          <path d="M 742 62 Q 835 225 945 330 L 742 330 Z" fill="#8D97B4" opacity={0.48} />
          {/* Reflected light on left face */}
          <path d="M 700 90 Q 665 185 610 295 Q 645 175 718 70 Z" fill="#C8D0E3" opacity={0.4} />

          {/* Peak 2 — right mid-distance */}
          <path
            d="M 1020 305 Q 1090 230 1150 148 Q 1170 128 1190 148 Q 1248 230 1310 305 Z"
            fill="#B5BED4" opacity={0.72}
          />
          <path
            d="M 1132 172 Q 1160 138 1177 142 Q 1195 147 1215 174
               Q 1202 170 1193 180 Q 1181 167 1171 180 Q 1160 170 1150 182
               Q 1138 174 1132 172 Z"
            fill="#F4F0E3" opacity={0.85}
          />

          {/* Peak 4 — far-right, faintest */}
          <path
            d="M 1290 295 Q 1340 240 1380 188 Q 1392 175 1406 188 Q 1435 240 1460 295 Z"
            fill="#DCE0ED" opacity={0.48}
          />

          {/* Soft mist band — ties peaks to hills, atmospheric bridge */}
          <path
            d="M 0 338 Q 280 320 720 334 T 1440 328 L 1440 372 L 0 372 Z"
            fill="#FFFFFF" opacity={0.36}
          />
        </g>

        {/* ── SUN upper-left, mirroring the opposite perspective of the garden ── */}
        <circle cx={W * 0.14} cy={108} r={85} fill="url(#mmSunGlow)" opacity={0.72} />
        <circle cx={W * 0.14} cy={108} r={30} fill="#FFF2B5" opacity={0.88} />
        {/* Sunbeam rays from upper-left, angling down-right */}
        <g opacity={0.45} style={{ mixBlendMode: 'screen' }} pointerEvents="none">
          {[0, 1, 2, 3, 4].map(i => (
            <polygon
              key={`mmray-${i}`}
              points={`${W * 0.14 - 28},${82} ${W * 0.14 + 36},${82} ${W * 0.14 + 36 + i * 110 + 180},${H} ${W * 0.14 - 28 + i * 110 + 220},${H}`}
              fill="url(#mmSunbeam)"
              opacity={0.2 - i * 0.028}
            />
          ))}
        </g>

        {/* ── 3. LAYERED HILL SILHOUETTES ── */}
        {/* Far hills — periwinkle */}
        <path
          d={`M 0 ${H * 0.44} Q 220 ${H * 0.36} 460 ${H * 0.42} T 900 ${H * 0.39} T ${W} ${H * 0.43} L ${W} ${H * 0.57} L 0 ${H * 0.57} Z`}
          fill="#B8C4DB" opacity={0.52}
        />
        {/* Mid hills — pale sage */}
        <path
          d={`M 0 ${H * 0.52} Q 280 ${H * 0.44} 560 ${H * 0.5} T 1050 ${H * 0.47} T ${W} ${H * 0.51} L ${W} ${H * 0.64} L 0 ${H * 0.64} Z`}
          fill="#A3BEA2" opacity={0.68}
        />
        {/* Near hills — deeper sage */}
        <path
          d={`M 0 ${H * 0.60} Q 320 ${H * 0.53} 680 ${H * 0.58} T ${W} ${H * 0.55} L ${W} ${H * 0.72} L 0 ${H * 0.72} Z`}
          fill="#8AAF84" opacity={0.62}
        />

        {/* ── 4. CLUSTER REGION TINTS ── */}
        <rect width={W} height={H} fill="url(#mmHollowTint)" />
        <rect width={W} height={H} fill="url(#mmPlateauTint)" />
        <rect width={W} height={H} fill="url(#mmOrchardTint)" />
        <rect width={W} height={H} fill="url(#mmGlenTint)" />
        <rect width={W} height={H} fill="url(#mmMeadowTint)" />
        <rect width={W} height={H} fill="url(#mmCottageTint)" />

        {/* ── 5. BROOK — Operations Hollow ──
             Enters from the upper-left slope, widens into a small pool
             (Quiet Pond sits on its bank ~x:340,y:500), continues
             south-east through the hollow, exits lower-left.
             Kept well clear of all structure positions. */}
        <g pointerEvents="none">
          {/* outer wet-earth bank */}
          <path
            d={`M 22 360
                C 55 395, 72 428, 58 465
                C 42 502, 72 528, 115 536
                C 160 544, 210 540, 270 535
                C 318 530, 348 528, 378 538
                C 402 546, 408 558, 392 568
                C 372 580, 330 576, 275 572
                C 210 568, 148 572, 98 580
                C 55 586, 22 582, 12 568
                C 4 556, 12 535, 28 512
                C 46 488, 48 462, 30 432
                C 14 405, 14 380, 22 365 Z`}
            fill="#6B8E5A" opacity={0.30}
          />
          {/* primary water body */}
          <path
            d={`M 30 364
                C 60 398, 76 430, 63 466
                C 50 500, 78 524, 120 530
                C 165 536, 215 532, 272 528
                C 320 524, 348 524, 375 533
                C 396 540, 400 551, 386 560
                C 368 571, 330 568, 275 564
                C 210 559, 148 564, 100 572
                C 60 578, 30 575, 20 563
                C 12 552, 18 532, 35 510
                C 53 487, 55 460, 38 432
                C 23 408, 22 384, 30 368 Z`}
            fill="#B2D4D9"
          />
          {/* depth channel — darkens the thalweg */}
          <path
            d={`M 40 392 C 68 428, 80 462, 68 490 C 58 516, 100 524, 160 528 C 225 532, 290 528, 360 535`}
            stroke="#8FB7C2" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.68}
          />
          {/* shimmer ripples */}
          <path d="M 54 418 Q 64 430 58 444" stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.68} strokeLinecap="round" />
          <path d="M 76 492 Q 98 500 92 514" stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.6} strokeLinecap="round" />
          <path d="M 148 520 Q 172 524 188 520" stroke="#FFFFFF" strokeWidth={1.1} fill="none" opacity={0.7} strokeLinecap="round" />
          <path d="M 248 525 Q 272 522 290 527" stroke="#FFFFFF" strokeWidth={1.1} fill="none" opacity={0.65} strokeLinecap="round" />
          {/* Moss-topped boulders sitting IN the stream */}
          <g>
            <ellipse cx={90} cy={465} rx={15} ry={9} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.5} />
            <ellipse cx={88} cy={461} rx={11} ry={4.5} fill="#A89D8A" />
            <ellipse cx={90} cy={459} rx={13} ry={3} fill="#7BA46F" opacity={0.9} />
          </g>
          <g>
            <ellipse cx={195} cy={520} rx={13} ry={7.5} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.4} />
            <ellipse cx={193} cy={516} rx={9.5} ry={4} fill="#A89D8A" />
            <ellipse cx={195} cy={514} rx={11} ry={2.8} fill="#7BA46F" opacity={0.9} />
          </g>
          <g>
            <ellipse cx={310} cy={528} rx={11} ry={6} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.4} />
            <ellipse cx={308} cy={524} rx={8} ry={3} fill="#A89D8A" />
          </g>
          {/* Dry-bank stones */}
          <ellipse cx={18} cy={458} rx={9} ry={5.5} fill="#C2B4A0" stroke="#6B5D48" strokeWidth={1.2} />
          <ellipse cx={16} cy={455} rx={5} ry={2.2} fill="#D6C9B3" />
          <ellipse cx={14} cy={536} rx={8} ry={4.5} fill="#C2B4A0" stroke="#6B5D48" strokeWidth={1.2} />
          {/* Bank grass tufts — at brook level, well above the "sky" zone */}
          {[[24, 484], [105, 548], [230, 526], [360, 542]].map(([gx, gy], i) => (
            <g key={`mmbt-${i}`} transform={`translate(${gx},${gy})`}>
              <path d="M 0 0 Q -1 -6 -2 -10" stroke="#5C7E4F" strokeWidth={1.3} fill="none" strokeLinecap="round" />
              <path d="M 0 0 Q 1 -7 3 -11" stroke="#5C7E4F" strokeWidth={1.3} fill="none" strokeLinecap="round" />
              <path d="M 0 0 Q 2 -5 5 -9" stroke="#5C7E4F" strokeWidth={1.2} fill="none" strokeLinecap="round" />
            </g>
          ))}
        </g>

        {/* ── 6. COHERENT PATH SYSTEM ──
             Redesigned so EVERY branch ends at a recognizable landmark:
             • Main spine: starts at Word Stories Cottage (lower-left ~x:170,y:760)
               and sweeps right through Measurement Meadow.
             • Left fork: branches off the spine at ~x:490,y:718, arcs left and DOWN
               into Operations Hollow, ENDS at the brook/pond bank (~x:200,y:540).
             • Upper/plateau path: from the brook bank climbs up through Operations
               Hollow and terminates at the highest Place-Value plateau structure
               (mm_three_digit_tower x:720,y:300).
             • Right fork: splits off the spine at ~x:1050,y:706, climbs to Division Glen
               and ends at the highest Glen structure (mm_missing_number x:1320,y:260).
             Same 3-layer (shadow / surface / highlight) + stepping stones style. */}
        {(() => {
          // Main spine: Cottage → Measurement Meadow (ends around x:1300)
          const spineD = `M 170 760 C 280 720, 440 720, 590 712 C 740 702, 860 698, 960 706 C 1070 714, 1180 700, 1300 698`;
          // Left fork: from spine junction (~x:490,y:718) arcs left and curves DOWN
          // ending at the brook bank (x:200, y:540 — the Quiet Pond area)
          const leftForkD = `M 490 718 C 470 680, 440 650, 400 620 C 355 588, 295 565, 235 553 C 210 548, 200 544, 200 540`;
          // Upper path: from the brook bank (x:200,y:540) climbs through Hollow
          // and terminates at the Place-Value Heights peak (x:720,y:300)
          const upperD = `M 200 540 C 240 510, 300 480, 380 460 C 460 440, 530 400, 600 370 C 660 345, 700 320, 720 300`;
          // Right fork: from spine (~x:1050,y:706) climbs to Division Glen
          // ending at mm_missing_number (x:1320,y:260)
          const rightForkD = `M 1050 706 C 1060 648, 1068 580, 1065 545 C 1062 510, 1082 350, 1180 290 C 1240 262, 1290 258, 1320 260`;
          // Orchard spur: short branch from spine end (~x:1300,y:698)
          // sweeps into the Multiplication Orchard and ends at mm_times_to_10 (x:1240,y:680)
          const orchardD = `M 1300 698 C 1350 690, 1400 660, 1420 620 C 1435 580, 1430 560, 1400 550`;
          return (
            <g pointerEvents="none">
              {/* Shadow layer */}
              {[spineD, leftForkD, upperD, rightForkD, orchardD].map((d, i) => (
                <path key={`mmsh-${i}`} d={d} stroke="#A99878" strokeWidth={i < 2 ? 44 : 38} fill="none" strokeLinecap="round" opacity={0.20} />
              ))}
              {/* Surface */}
              {[spineD, leftForkD, upperD, rightForkD, orchardD].map((d, i) => (
                <path key={`mmsu-${i}`} d={d} stroke="#EAD2A8" strokeWidth={i < 2 ? 30 : 26} fill="none" strokeLinecap="round" opacity={0.88} />
              ))}
              {/* Highlight ribbon */}
              {[spineD, leftForkD, upperD, rightForkD, orchardD].map((d, i) => (
                <path key={`mmhi-${i}`} d={d} stroke="#F7E6C4" strokeWidth={i < 2 ? 11 : 9} fill="none" strokeLinecap="round" opacity={0.60} />
              ))}
              {/* Stepping stones */}
              {[
                // spine (Measurement Meadow)
                { x: 230, y: 748 }, { x: 360, y: 728 }, { x: 500, y: 718 },
                { x: 650, y: 710 }, { x: 800, y: 706 }, { x: 950, y: 708 },
                { x: 1110, y: 706 }, { x: 1260, y: 700 },
                // left fork (descending into Hollow toward brook bank)
                { x: 460, y: 685 }, { x: 418, y: 650 }, { x: 370, y: 612 },
                { x: 310, y: 578 }, { x: 250, y: 558 }, { x: 208, y: 544 },
                // upper (brook bank → plateau peak)
                { x: 248, y: 518 }, { x: 315, y: 490 }, { x: 395, y: 462 },
                { x: 480, y: 435 }, { x: 556, y: 404 }, { x: 636, y: 360 },
                { x: 690, y: 324 }, { x: 718, y: 302 },
                // right fork (to Glen peak)
                { x: 1060, y: 650 }, { x: 1062, y: 588 }, { x: 1082, y: 480 },
                { x: 1130, y: 368 }, { x: 1210, y: 296 }, { x: 1300, y: 262 },
                // orchard spur
                { x: 1350, y: 685 }, { x: 1408, y: 638 }, { x: 1416, y: 568 },
              ].map((s, i) => (
                <g key={`mmstn-${i}`}>
                  <ellipse cx={s.x + 1} cy={s.y + 2} rx={11} ry={6} fill="#000" opacity={0.19} />
                  <ellipse cx={s.x} cy={s.y} rx={11} ry={6} fill="#C9B489" stroke="#8A7050" strokeWidth={1.2} />
                  <ellipse cx={s.x - 2} cy={s.y - 1.5} rx={5} ry={2} fill="#E0CBA1" opacity={0.8} />
                </g>
              ))}
            </g>
          );
        })()}

        {/* ── 7. STONE TERRACE STEPS for Place-Value Heights ──
             Three gently-rising horizontal stone ledges suggest a tiered
             alpine plateau. Positioned so they frame the cluster without
             overlapping any structure. */}
        <g pointerEvents="none" opacity={0.72}>
          {/* Terrace 1 — lowest, widest, x:530-640 y:440 */}
          <path d="M 530 445 L 642 445 L 636 458 L 524 458 Z" fill="#A89D8A" stroke="#6B5D48" strokeWidth={1.2} strokeLinejoin="round" />
          <path d="M 535 445 L 637 445" stroke="#C2B4A0" strokeWidth={1} opacity={0.6} />
          {/* Terrace 2 — mid */}
          <path d="M 626 385 L 742 385 L 736 398 L 620 398 Z" fill="#A89D8A" stroke="#6B5D48" strokeWidth={1.2} strokeLinejoin="round" />
          <path d="M 631 385 L 737 385" stroke="#C2B4A0" strokeWidth={1} opacity={0.6} />
          {/* Terrace 3 — upper, narrowest */}
          <path d="M 706 308 L 805 308 L 798 320 L 700 320 Z" fill="#9B9082" stroke="#6B5D48" strokeWidth={1.2} strokeLinejoin="round" />
          <path d="M 711 308 L 800 308" stroke="#C2B4A0" strokeWidth={0.9} opacity={0.55} />
        </g>

        {/* ── 8. WORD STORIES COTTAGE ──
             A small cozy nook in the bottom-left corner. Cottage sits at
             about x:60-160, y:680-760. Structures sit at x:70,y:720 and
             x:70,y:760 and x:170,y:760 so the cottage must be clear of those.
             We place a simple hand-drawn cottage shape to the LEFT of the
             structures, cottage centre ~x:40, y:700. */}
        <g transform="translate(38, 690)" pointerEvents="none">
          {/* Ground shadow */}
          <ellipse cx={28} cy={66} rx={34} ry={6} fill="#000" opacity={0.14} />
          {/* Walls */}
          <rect x={0} y={30} width={56} height={36} rx={3} fill="#F5EBDC" stroke="#5A3B1F" strokeWidth={2} />
          {/* Door */}
          <rect x={22} y={44} width={12} height={22} rx={3} fill="#8B5A2B" stroke="#5A3B1F" strokeWidth={1.5} />
          <circle cx={32} cy={56} r={1.5} fill="#5A3B1F" />
          {/* Window left */}
          <rect x={5} y={38} width={11} height={9} rx={1.5} fill="#BDE3EC" stroke="#5A3B1F" strokeWidth={1.2} />
          <line x1={10} y1={38} x2={10} y2={47} stroke="#5A3B1F" strokeWidth={0.8} />
          <line x1={5} y1={43} x2={16} y2={43} stroke="#5A3B1F" strokeWidth={0.8} />
          {/* Window right */}
          <rect x={40} y={38} width={11} height={9} rx={1.5} fill="#BDE3EC" stroke="#5A3B1F" strokeWidth={1.2} />
          <line x1={45} y1={38} x2={45} y2={47} stroke="#5A3B1F" strokeWidth={0.8} />
          <line x1={40} y1={43} x2={51} y2={43} stroke="#5A3B1F" strokeWidth={0.8} />
          {/* Roof — gabled */}
          <path d="M -6 32 L 28 2 L 62 32 Z" fill="#C38D9E" stroke="#5A3B1F" strokeWidth={2} strokeLinejoin="round" />
          {/* Roof ridge highlight */}
          <path d="M 12 20 L 28 4 L 44 20" stroke="#D4A8B4" strokeWidth={1} fill="none" opacity={0.6} />
          {/* Chimney */}
          <rect x={36} y={4} width={8} height={16} rx={1} fill="#B8A090" stroke="#5A3B1F" strokeWidth={1.5} />
          {/* Chimney smoke puffs */}
          <ellipse cx={40} cy={0} rx={5} ry={4} fill="#E8E0D3" opacity={0.6} />
          <ellipse cx={43} cy={-6} rx={4} ry={3.5} fill="#E8E0D3" opacity={0.4} />
          <ellipse cx={39} cy={-12} rx={3.5} ry={3} fill="#E8E0D3" opacity={0.25} />
          {/* Cottage garden — tiny flowers beside door */}
          <circle cx={17} cy={66} r={3.5} fill="#C38D9E" stroke="#5A3B1F" strokeWidth={0.8} />
          <circle cx={14} cy={64} r={1} fill="#FFD93D" />
          <circle cx={18} cy={64} r={1} fill="#FFD93D" />
          <circle cx={16} cy={62.5} r={1} fill="#FFD93D" />
          <path d="M 17 66 L 17 72" stroke="#6B8E5A" strokeWidth={1.2} strokeLinecap="round" />
          <circle cx={42} cy={66} r={3.5} fill="#E8A87C" stroke="#5A3B1F" strokeWidth={0.8} />
          <circle cx={39} cy={64} r={1} fill="#FFD93D" />
          <circle cx={43} cy={64} r={1} fill="#FFD93D" />
          <circle cx={41} cy={62.5} r={1} fill="#FFD93D" />
          <path d="M 42 66 L 42 72" stroke="#6B8E5A" strokeWidth={1.2} strokeLinecap="round" />
        </g>

        {/* ── 9. APPLE ORCHARD ROWS for Multiplication Orchard ──
             Three rows of apple trees, right foreground (x:950-1440, y:480-720).
             Rows spaced so they frame clusters without hitting structure positions:
             mm_equal_garden x:1080,y:560 | mm_array_orchard x:1200,y:580
             mm_skip_bridge x:1320,y:540  | mm_times_to_5 x:1100,y:660
             mm_times_to_10 x:1240,y:680
             Tree rows at x:960-1000 and x:1370-1430 (flanks), y:500 and y:620. */}
        {/* Row 1 — back row, smaller */}
        {[968, 1040, 1156, 1280, 1380, 1428].map((tx, i) => (
          <Tree key={`orch-back-${i}`} x={tx} y={510} size={42} variant={i % 2 === 0 ? 1 : 2} />
        ))}
        {/* Row 2 — mid row */}
        {[958, 1042, 1168, 1362, 1432].map((tx, i) => (
          <Tree key={`orch-mid-${i}`} x={tx} y={628} size={50} variant={i % 3 === 0 ? 2 : i % 3 === 1 ? 1 : 3} />
        ))}
        {/* Row ground line — ochre orchard floor band */}
        <rect x={945} y={490} width={500} height={8} rx={4} fill="#D4A850" opacity={0.18} />
        <rect x={942} y={608} width={502} height={8} rx={4} fill="#D4A850" opacity={0.15} />

        {/* ── 10. DIVISION GLEN — pine framing (upper-right) ──
             Pines cluster around the glen (x:1100-1320, y:260-300)
             without overlapping. Placed at x:1060,y:240 and x:1380,y:240. */}
        <PineTree x={1062} y={240} size={62} />
        <PineTree x={1390} y={238} size={58} />
        <PineTree x={1430} y={272} size={52} />
        {/* Mossy boulders that give the glen its 'glen' feel */}
        <g pointerEvents="none">
          <ellipse cx={1068} cy={295} rx={18} ry={10} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.5} />
          <ellipse cx={1066} cy={291} rx={13} ry={5} fill="#A89D8A" />
          <ellipse cx={1068} cy={289} rx={15} ry={3.5} fill="#7BA46F" opacity={0.85} />
          <ellipse cx={1382} cy={295} rx={14} ry={8} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.4} />
          <ellipse cx={1380} cy={291} rx={10} ry={4} fill="#A89D8A" />
          <ellipse cx={1382} cy={289} rx={12} ry={3} fill="#7BA46F" opacity={0.85} />
        </g>

        {/* ── 11. FRAMING TREES — edges and mid-distance ──
             Never overlap any structure position.
             Operations Hollow left edge: Trees at x:22-80, y:430-500
             (structures start at x:110 — safe gap of 30px)
             Plateau backdrop: PineTrees upper-centre
             Measurement Meadow frame: Trees at bottom, outside structure range */}

        {/* Left edge — frame the hollow entrance */}
        <Tree x={28} y={435} size={72} variant={2} />
        <Tree x={75} y={418} size={58} variant={3} />

        {/* Upper-centre — alpine pines on the plateau ridge
             (placed at the ridge LINE above the plateau structures, not beside them) */}
        <PineTree x={558} y={300} size={54} />
        <PineTree x={1010} y={318} size={54} />

        {/* Right-centre — trees between Glen and Orchard */}
        <Tree x={1050} y={420} size={58} variant={1} />

        {/* Far-right edge */}
        <Tree x={1440} y={460} size={66} variant={2} />
        <Tree x={1436} y={600} size={58} variant={3} />

        {/* Bottom-left of cottage nook */}
        <Tree x={22} y={648} size={62} variant={1} />

        {/* ── 12. GRASS TUFTS + FLOWERS — meadow level only (y > 600) ── */}
        <GrassTuft x={240} y={748} size={20} />
        <GrassTuft x={490} y={764} size={22} />
        <GrassTuft x={760} y={772} size={20} />
        <GrassTuft x={1040} y={764} size={20} />
        <GrassTuft x={1350} y={756} size={22} />
        <Flower x={310} y={762} size={16} />
        <Flower x={420} y={756} size={15} />
        <Flower x={610} y={768} size={16} />
        <Flower x={870} y={760} size={15} />
        <Flower x={1170} y={762} size={16} />
        <Flower x={1280} y={752} size={15} />
        <Flower x={1400} y={766} size={14} />

        {/* ── Foreground grass silhouette — Miyazaki depth-frame along bottom ── */}
        <g opacity={0.42} pointerEvents="none">
          <path
            d={`M 0 ${H} L 0 ${H - 18} Q 90 ${H - 30} 180 ${H - 20} T 360 ${H - 24} T 540 ${H - 18} T 720 ${H - 26} T 900 ${H - 20} T 1080 ${H - 28} T 1260 ${H - 20} T ${W} ${H - 18} L ${W} ${H} Z`}
            fill="#6B8E5A"
          />
          {[60, 180, 320, 480, 640, 800, 970, 1140, 1310, 1420].map((gx, i) => (
            <path
              key={`mmfg-${i}`}
              d={`M ${gx} ${H - 16} Q ${gx + (i % 2 === 0 ? 3 : -3)} ${H - 36} ${gx + (i % 2 === 0 ? 5 : -5)} ${H - 54}`}
              stroke="#5C7E4F" strokeWidth={2} fill="none" strokeLinecap="round"
            />
          ))}
        </g>

        {/* ── CLUSTER LABELS — softened, name-tag style ── */}
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
                x={avgX - 72} y={avgY - 108} width={144} height={18} rx={9}
                fill="rgba(255,250,242,0.35)" stroke="none"
              />
              <text
                x={avgX} y={avgY - 96} textAnchor="middle"
                fontSize={9} fontWeight={500} fontStyle="italic" fill="#95876a"
              >
                {c.label}
              </text>
            </g>
          );
        })}

        {/* ── STRUCTURES ── */}
        {structures.map(s => {
          const state = structureStates[s.code];
          const completed = state?.completed ?? false;
          const unlocked = state?.unlocked ?? false;
          const isTappedLocked = tappedLocked === s.code;

          // Try to resolve a bespoke illustration (alias → existing code, or same code)
          const illustrationCode = ILLUSTRATION_ALIAS[s.code] ?? s.code;
          const drawn = StructureIllustration({ code: illustrationCode, x: 0, y: 0, size: s.size });

          return (
            <g
              key={s.code}
              transform={`translate(${s.x}, ${s.y})`}
              style={{ cursor: 'pointer', touchAction: 'manipulation' }}
              onClick={() => onStructureTap(s)}
            >
              <circle r={Math.max(s.size * 0.7, 30)} fill="transparent" />
              <g opacity={unlocked ? 1 : 0.35} style={{
                filter: completed
                  ? 'drop-shadow(0 0 6px rgba(255, 217, 61, 0.6))'
                  : unlocked
                    ? 'drop-shadow(0 1px 2px rgba(107,68,35,0.4))'
                    : 'grayscale(0.7)',
              }}>
                {drawn ?? <PlinthEmoji emoji={s.themeEmoji} size={s.size} />}
              </g>
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
