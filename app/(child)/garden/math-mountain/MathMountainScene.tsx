// app/(child)/garden/math-mountain/MathMountainScene.tsx
//
// Math Mountain — hand-illustrated SVG, same vocabulary as the central garden.
//
// Design rules now in force:
//   LAYERING (back to front):
//     1. Alpine sky gradient (cool lavender-blue → meadow green)
//     2. Five Fuji-style peaks — THE PEAK SILHOUETTE ZONE is above y≈390.
//        NO structures ever placed above y:420 (see branchMaps.ts).
//     3. Sun upper-left with glow + sunbeams
//     4. Three layered hill silhouettes (periwinkle → sage → deeper sage)
//     5. Cluster region tints
//     6. Grass texture
//     7. Brook — enters upper-left slope, flows south through the hollow
//        (x:40-200, y:380-620). The brook's wet body is drawn first so
//        the path and structures layer on top of the bank.
//     8. Stone terracing for Place-Value Heights (purely decorative; behind structures)
//     9. Path system — spineD runs along Measurement Meadow at y≈700;
//        branches climb left into the hollow, right into Division Glen.
//        Path NEVER crosses the brook except at mm_big_bridge (the bridge
//        crossing is the one deliberate water-path intersection).
//    10. Word Stories Cottage (drawn before trees so foliage overlaps naturally)
//    11. Apple orchard rows (Multiplication Orchard, right foreground)
//    12. Division Glen boulders + pine framing (upper-right, y:350-500)
//    13. Framing trees — edges and mid-distance only. Never overlapping
//        path or structure positions. Rules:
//          • No tree within 60px of any structure x,y
//          • No tree inside the brook body (x:40-220, y:380-620)
//          • Trees cluster at scene edges, at mid-distance between clusters,
//            on the ridge above Place-Value Heights
//    14. Grass tufts + flowers — meadow level only (y > 640)
//    15. Foreground grass silhouette — depth frame along bottom
//    16. Cluster labels
//    17. Structures — locked structures render as a soft circle silhouette
//        (no emoji/plinth block); unlocked emoji-fallback structures render
//        emoji at size 36 with a warm drop-shadow (no plinth).
//
//   BROOK GEOMETRY:
//     Enters at upper-left (~x:60, y:380), flows south-west, pools slightly,
//     exits lower-left (~x:60, y:620). Stays entirely left of x:250.
//     mm_big_bridge (x:400, y:660) is positioned as the path crossing —
//     NOT over the brook itself (brook exits at x<250, so the bridge is
//     downstream where the path crosses a shallow ford).

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
  mm_butterfly_make10: 'math_butterfly_arrays',
  mm_array_orchard:    'math_array_orchard',
  mm_hundreds_hollow:  'math_hundreds_hollow',
  mm_tens_tower:       'math_tens_tower',
  mm_compare_trees:    'math_compare_trees',
  mm_stories_plus:     'math_word_stories',
  mm_stories_minus:    'math_word_stories',
  mm_long_stories:     'math_word_stories',
};

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
            <stop offset="22%" stopColor="#D9E6F0" />
            <stop offset="40%" stopColor="#EDE5D2" />
            <stop offset="60%" stopColor="#E0DDB8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#CEE3B4" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="mmMeadow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#D7EFB9" />
            <stop offset="55%" stopColor="#AED29A" />
            <stop offset="100%" stopColor="#8EB98A" />
          </linearGradient>
          <pattern id="mmGrass" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="transparent" />
            <path d="M 4 36 Q 4 30 6 28" stroke="#7BA46F" strokeWidth="1.2" fill="none" opacity="0.32" />
            <path d="M 20 38 Q 22 32 24 30" stroke="#7BA46F" strokeWidth="1.2" fill="none" opacity="0.28" />
            <path d="M 32 36 Q 30 32 32 28" stroke="#7BA46F" strokeWidth="1.2" fill="none" opacity="0.32" />
          </pattern>
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
          <radialGradient id="mmHollowTint" cx="22%" cy="76%" r="26%">
            <stop offset="0%" stopColor="#E8C493" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#E8C493" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="mmPlateauTint" cx="50%" cy="58%" r="24%">
            <stop offset="0%" stopColor="#B5BED4" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#B5BED4" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="mmOrchardTint" cx="82%" cy="74%" r="24%">
            <stop offset="0%" stopColor="#E8A87C" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#E8A87C" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="mmGlenTint" cx="82%" cy="50%" r="20%">
            <stop offset="0%" stopColor="#95B88F" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#95B88F" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="mmMeadowTint" cx="55%" cy="92%" r="28%">
            <stop offset="0%" stopColor="#D7EFB9" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#D7EFB9" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="mmCottageTint" cx="8%" cy="95%" r="16%">
            <stop offset="0%" stopColor="#F5EBDC" stopOpacity="0.50" />
            <stop offset="100%" stopColor="#F5EBDC" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── 1. SKY + MEADOW BASE ── */}
        <rect width={W} height={H * 0.58} fill="url(#mmSky)" />
        <rect width={W} height={H} fill="url(#mmMeadow)" opacity="0.95" />

        {/* ── 2. FUJI PEAKS — five across the back ──
             THE PEAK SILHOUETTE ZONE: the big central peak's flanks
             reach down to approximately y:390 at their widest. No structure
             sits above y:420. Sun upper-left. */}
        <g opacity={0.90}>
          {/* Peak 5 — far-left, faintest */}
          <path
            d="M 0 295 Q 55 238 95 185 Q 108 173 122 186 Q 162 238 210 295 Z"
            fill="#DCE0ED" opacity={0.46}
          />
          {/* Peak 3 — left mid-distance */}
          <path
            d="M 160 305 Q 235 230 295 148 Q 315 128 335 148 Q 395 230 455 305 Z"
            fill="#B5BED4" opacity={0.70}
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
          <path
            d="M 658 118 Q 695 65 718 62 Q 742 63 782 118
               Q 766 112 755 126 Q 742 110 730 126 Q 716 114 704 128
               Q 688 118 678 130 Q 666 122 658 118 Z"
            fill="#FBF8ED"
          />
          <path d="M 742 62 Q 835 225 945 330 L 742 330 Z" fill="#8D97B4" opacity={0.46} />
          <path d="M 700 90 Q 665 185 610 295 Q 645 175 718 70 Z" fill="#C8D0E3" opacity={0.38} />
          {/* Peak 2 — right mid-distance */}
          <path
            d="M 1020 305 Q 1090 230 1150 148 Q 1170 128 1190 148 Q 1248 230 1310 305 Z"
            fill="#B5BED4" opacity={0.70}
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
            fill="#DCE0ED" opacity={0.46}
          />
          {/* Mist band — ties peaks to hills */}
          <path
            d="M 0 338 Q 280 320 720 334 T 1440 328 L 1440 372 L 0 372 Z"
            fill="#FFFFFF" opacity={0.34}
          />
        </g>

        {/* ── 3. SUN upper-left ── */}
        <circle cx={W * 0.14} cy={108} r={85} fill="url(#mmSunGlow)" opacity={0.70} />
        <circle cx={W * 0.14} cy={108} r={30} fill="#FFF2B5" opacity={0.88} />
        <g opacity={0.34} pointerEvents="none">
          {[0, 1, 2, 3, 4].map(i => (
            <polygon
              key={`mmray-${i}`}
              points={`${W * 0.14 - 28},${82} ${W * 0.14 + 36},${82} ${W * 0.14 + 36 + i * 110 + 180},${H} ${W * 0.14 - 28 + i * 110 + 220},${H}`}
              fill="url(#mmSunbeam)"
              opacity={0.2 - i * 0.028}
            />
          ))}
        </g>

        {/* ── 4. LAYERED HILL SILHOUETTES ── */}
        <path
          d={`M 0 ${H * 0.44} Q 220 ${H * 0.36} 460 ${H * 0.42} T 900 ${H * 0.39} T ${W} ${H * 0.43} L ${W} ${H * 0.57} L 0 ${H * 0.57} Z`}
          fill="#B8C4DB" opacity={0.50}
        />
        <path
          d={`M 0 ${H * 0.52} Q 280 ${H * 0.44} 560 ${H * 0.50} T 1050 ${H * 0.47} T ${W} ${H * 0.51} L ${W} ${H * 0.64} L 0 ${H * 0.64} Z`}
          fill="#A3BEA2" opacity={0.66}
        />
        <path
          d={`M 0 ${H * 0.60} Q 320 ${H * 0.53} 680 ${H * 0.58} T ${W} ${H * 0.55} L ${W} ${H * 0.72} L 0 ${H * 0.72} Z`}
          fill="#8AAF84" opacity={0.60}
        />

        {/* ── 5. CLUSTER REGION TINTS ── */}
        <rect width={W} height={H} fill="url(#mmHollowTint)" />
        <rect width={W} height={H} fill="url(#mmPlateauTint)" />
        <rect width={W} height={H} fill="url(#mmOrchardTint)" />
        <rect width={W} height={H} fill="url(#mmGlenTint)" />
        <rect width={W} height={H} fill="url(#mmMeadowTint)" />
        <rect width={W} height={H} fill="url(#mmCottageTint)" />
        {/* Grass texture above zone tints — restricted to MEADOW band
            only (y>320). Previously this rect spanned the full viewport
            so the grass-tuft pattern was visible across the sky too,
            which read as "the sky has grass in it." */}
        <rect x={0} y={320} width={W} height={H - 320} fill="url(#mmGrass)" />

        {/* ── 6. BROOK — Operations Hollow ──
             Enters from upper-left slope (~x:70, y:380), flows south in a
             tight meandering channel, exits lower-left (~x:70, y:620).
             Stays within x:40-220, y:380-630 — clear of all structure positions.
             The ONE path crossing (mm_big_bridge at x:400, y:660) is EAST of
             the brook exit, so path and brook never cross. */}
        {/* Pond removed from Math Mountain entirely. Structures in
            the lower-left (Word Stories Cottage, Operations Hollow's
            water-themed Quiet Pond / Rushing Stream / Berry Basket /
            Big Falls) carry the water theme through their own
            illustrations — the map doesn't need a literal lake. */}

        {/* Stone terracing was removed — the three small filled
            quadrilaterals were reading as "weird shaded rectangles"
            scattered across the plateau. The cluster-tint radial
            already demarcates Place-Value Heights without geometric
            terraces. */}

        {/* ── 8. PATH SYSTEM ──
             • Spine: Word Stories Cottage → Measurement Meadow (bottom, y≈720)
             • Left fork: branches off spine at x≈340, arcs into Operations Hollow,
               ENDS at the brook bank just east of the brook (x≈280, y≈600).
               The ONE water crossing is mm_big_bridge at x:400,y:660 — path
               crosses the dried rocky ford below the brook exit.
             • Plateau climb: from hollow bank, arcs up through Place-Value Heights
               (y:430-520), ends at upper plateau structure.
             • Right fork: from spine at x≈1060, climbs to Division Glen (y≈380-450).
             • Orchard spur: wraps around the Multiplication Orchard. */}
        {(() => {
          // Spine: Cottage corner → full Measurement Meadow width
          const spineD = `M 200 755 C 320 730, 480 722, 640 718 C 800 714, 920 710, 1060 716 C 1190 722, 1320 712, 1400 718`;
          // Left fork: spine at ~x:340 → hollow structures ending at brook bank
          const leftForkD = `M 340 726 C 320 700, 300 672, 285 645 C 272 620, 268 600, 272 582`;
          // Brook-bank to Plateau (staying east of brook body at x:220+)
          const plateauD = `M 272 582 C 310 560, 370 538, 430 520 C 480 504, 520 490, 548 472 C 568 458, 576 446, 580 436`;
          // Plateau upper taper (narrower, reads as a high mountain trail)
          const plateauUpperD = `M 580 436 C 620 428, 660 430, 700 432`;
          // Right fork lower: from spine → Division Glen foreground
          const rightForkD = `M 1060 716 C 1068 676, 1072 618, 1072 565 C 1072 520, 1076 490, 1082 462 C 1086 440, 1090 420, 1096 400`;
          // Right fork taper (ends at Glen foot)
          const rightForkUpperD = `M 1096 400 C 1148 392, 1210 392, 1270 392`;
          // Orchard spur: from spine end → wraps the orchard
          const orchardD = `M 1400 718 C 1420 690, 1425 650, 1418 616 C 1410 584, 1402 562, 1390 548`;
          return (
            <g pointerEvents="none">
              {/* Shadow layer */}
              {[spineD, leftForkD, plateauD, rightForkD, orchardD].map((d, i) => (
                <path key={`mmsh-${i}`} d={d} stroke="#A99878" strokeWidth={44} fill="none" strokeLinecap="round" opacity={0.19} />
              ))}
              <path d={plateauUpperD} stroke="#A99878" strokeWidth={32} fill="none" strokeLinecap="round" opacity={0.15} />
              <path d={rightForkUpperD} stroke="#A99878" strokeWidth={32} fill="none" strokeLinecap="round" opacity={0.15} />
              {/* Surface */}
              {[spineD, leftForkD, plateauD, rightForkD, orchardD].map((d, i) => (
                <path key={`mmsu-${i}`} d={d} stroke="#EAD2A8" strokeWidth={30} fill="none" strokeLinecap="round" opacity={0.88} />
              ))}
              <path d={plateauUpperD} stroke="#EAD2A8" strokeWidth={20} fill="none" strokeLinecap="round" opacity={0.76} />
              <path d={rightForkUpperD} stroke="#EAD2A8" strokeWidth={20} fill="none" strokeLinecap="round" opacity={0.76} />
              {/* Highlight ribbon */}
              {[spineD, leftForkD, plateauD, rightForkD, orchardD].map((d, i) => (
                <path key={`mmhi-${i}`} d={d} stroke="#F7E6C4" strokeWidth={11} fill="none" strokeLinecap="round" opacity={0.58} />
              ))}
              <path d={plateauUpperD} stroke="#F7E6C4" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.48} />
              <path d={rightForkUpperD} stroke="#F7E6C4" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.48} />
              {/* Stepping stones */}
              {[
                // spine (Measurement Meadow)
                { x: 260, y: 742 }, { x: 400, y: 728 }, { x: 540, y: 720 },
                { x: 680, y: 716 }, { x: 820, y: 714 }, { x: 960, y: 716 },
                { x: 1130, y: 720 }, { x: 1300, y: 714 },
                // left fork (down into hollow toward brook bank)
                { x: 320, y: 710 }, { x: 308, y: 684 }, { x: 295, y: 656 },
                { x: 284, y: 630 }, { x: 276, y: 606 },
                // plateau lower (brook bank up to plateau structures)
                { x: 298, y: 572 }, { x: 346, y: 548 }, { x: 402, y: 528 },
                { x: 452, y: 512 }, { x: 504, y: 494 }, { x: 546, y: 474 },
                { x: 570, y: 454 }, { x: 576, y: 438 },
                // plateau upper taper
                { x: 626, y: 430 }, { x: 672, y: 430 },
                // right fork lower (to Glen foot)
                { x: 1066, y: 672 }, { x: 1068, y: 620 }, { x: 1072, y: 566 },
                { x: 1076, y: 522 }, { x: 1082, y: 482 }, { x: 1088, y: 440 }, { x: 1094, y: 410 },
                // right fork taper
                { x: 1156, y: 392 }, { x: 1228, y: 392 },
                // orchard spur
                { x: 1412, y: 682 }, { x: 1420, y: 644 }, { x: 1412, y: 596 }, { x: 1394, y: 554 },
              ].map((s, i) => (
                <g key={`mmstn-${i}`}>
                  <ellipse cx={s.x + 1} cy={s.y + 2} rx={11} ry={6} fill="#000" opacity={0.18} />
                  <ellipse cx={s.x} cy={s.y} rx={11} ry={6} fill="#C9B489" stroke="#8A7050" strokeWidth={1.2} />
                  <ellipse cx={s.x - 2} cy={s.y - 1.5} rx={5} ry={2} fill="#E0CBA1" opacity={0.8} />
                </g>
              ))}
            </g>
          );
        })()}

        {/* ── 9. WORD STORIES COTTAGE — lower-left corner ──
             Structures (mm_stories_plus/minus/long_stories) sit to the
             RIGHT of this cottage at x:70-200, y:720-760. Cottage sits
             to the left at x:30-90, y:690. */}
        <g transform="translate(38, 692)" pointerEvents="none">
          <ellipse cx={28} cy={66} rx={34} ry={6} fill="#000" opacity={0.12} />
          <rect x={0} y={30} width={56} height={36} rx={3} fill="#F5EBDC" stroke="#5A3B1F" strokeWidth={2} />
          <rect x={22} y={44} width={12} height={22} rx={3} fill="#8B5A2B" stroke="#5A3B1F" strokeWidth={1.5} />
          <circle cx={32} cy={56} r={1.5} fill="#5A3B1F" />
          <rect x={5} y={38} width={11} height={9} rx={1.5} fill="#BDE3EC" stroke="#5A3B1F" strokeWidth={1.2} />
          <line x1={10} y1={38} x2={10} y2={47} stroke="#5A3B1F" strokeWidth={0.8} />
          <line x1={5} y1={43} x2={16} y2={43} stroke="#5A3B1F" strokeWidth={0.8} />
          <rect x={40} y={38} width={11} height={9} rx={1.5} fill="#BDE3EC" stroke="#5A3B1F" strokeWidth={1.2} />
          <line x1={45} y1={38} x2={45} y2={47} stroke="#5A3B1F" strokeWidth={0.8} />
          <line x1={40} y1={43} x2={51} y2={43} stroke="#5A3B1F" strokeWidth={0.8} />
          {/* Gabled roof */}
          <path d="M -6 32 L 28 2 L 62 32 Z" fill="#C38D9E" stroke="#5A3B1F" strokeWidth={2} strokeLinejoin="round" />
          <path d="M 12 20 L 28 4 L 44 20" stroke="#D4A8B4" strokeWidth={1} fill="none" opacity={0.6} />
          <rect x={36} y={4} width={8} height={16} rx={1} fill="#B8A090" stroke="#5A3B1F" strokeWidth={1.5} />
          {/* Chimney smoke */}
          <ellipse cx={40} cy={0}  rx={5} ry={4}   fill="#E8E0D3" opacity={0.60} />
          <ellipse cx={43} cy={-6} rx={4} ry={3.5} fill="#E8E0D3" opacity={0.40} />
          <ellipse cx={39} cy={-12} rx={3.5} ry={3} fill="#E8E0D3" opacity={0.24} />
          {/* Cottage garden flowers */}
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

        {/* ── 10. APPLE ORCHARD ROWS — Multiplication Orchard (right foreground) ──
             Structures: mm_equal_garden (1080,560), mm_array_orchard (1200,580),
             mm_skip_bridge (1320,540), mm_times_to_5 (1100,660), mm_times_to_10 (1240,680).
             Tree rows flank the cluster without hitting structure positions. */}
        {[988, 1056, 1148, 1265, 1380].map((tx, i) => (
          <Tree key={`orch-back-${i}`} x={tx} y={508} size={40} variant={i % 2 === 0 ? 1 : 2} />
        ))}
        {[978, 1050, 1155, 1362].map((tx, i) => (
          <Tree key={`orch-mid-${i}`} x={tx} y={628} size={48} variant={i % 3 === 0 ? 2 : i % 3 === 1 ? 1 : 3} />
        ))}
        <rect x={958} y={488} width={442} height={7} rx={3.5} fill="#D4A850" opacity={0.16} />
        <rect x={955} y={608} width={432} height={7} rx={3.5} fill="#D4A850" opacity={0.13} />

        {/* ── 11. DIVISION GLEN — mossy boulders + pine framing ──
             Glen structures now at y:380-450 (foreground meadow).
             Boulders sit AROUND the structure positions, not on top. */}
        <g pointerEvents="none">
          <ellipse cx={1050} cy={366} rx={18} ry={10} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.4} />
          <ellipse cx={1048} cy={362} rx={13} ry={5} fill="#A89D8A" />
          <ellipse cx={1050} cy={360} rx={15} ry={3.5} fill="#7BA46F" opacity={0.84} />
          <ellipse cx={1368} cy={366} rx={14} ry={8} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.4} />
          <ellipse cx={1366} cy={362} rx={10} ry={4} fill="#A89D8A" />
          <ellipse cx={1368} cy={360} rx={12} ry={3} fill="#7BA46F" opacity={0.84} />
          <ellipse cx={1240} cy={370} rx={12} ry={7} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.3} />
          <ellipse cx={1238} cy={366} rx={8} ry={3} fill="#A89D8A" />
        </g>

        {/* ── 12. FRAMING TREES ──
             Rules: no tree within 60px of any structure; no tree in brook body
             (x:40-220, y:380-630); trees only at edges and mid-distance. */}

        {/* Ridge line above Place-Value Heights plateau */}
        <PineTree x={490} y={348} size={54} />
        <PineTree x={1008} y={358} size={52} />

        {/* Left edge — hollow entrance framing (clear of brook x:40-220) */}
        <Tree x={240} y={390} size={62} variant={2} />

        {/* Between Glen and Orchard at mid height */}
        <PineTree x={1068} y={450} size={56} />
        <Tree x={1390} y={440} size={60} variant={1} />

        {/* Far-right edge */}
        <Tree x={1398} y={600} size={54} variant={3} />

        {/* Bottom-left cottage nook */}
        <Tree x={62} y={648} size={60} variant={2} />

        {/* ── 13. GRASS TUFTS + FLOWERS — meadow level only (y > 640) ── */}
        <GrassTuft x={220} y={752} size={20} />
        <GrassTuft x={460} y={764} size={22} />
        <GrassTuft x={740} y={772} size={20} />
        <GrassTuft x={1020} y={764} size={20} />
        <GrassTuft x={1340} y={756} size={22} />
        <Flower x={310} y={762} size={15} />
        <Flower x={420} y={756} size={14} />
        <Flower x={600} y={768} size={15} />
        <Flower x={860} y={760} size={14} />
        <Flower x={1160} y={762} size={15} />
        <Flower x={1280} y={752} size={14} />
        <Flower x={1398} y={766} size={13} />

        {/* ── Foreground grass silhouette ── */}
        <g opacity={0.40} pointerEvents="none">
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

        {/* ── CLUSTER LABELS — softened italic name-tags ── */}
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

        {/* ── STRUCTURES ──
            UNIFORM visual size regardless of s.size in branchMaps.ts.
            LOCKED structures: render as a quiet circle silhouette with the label
              only — no emoji, no plinth. This avoids the "grayed-out clipart"
              problem. The circle communicates "a stop that will open here."
            UNLOCKED structures with a bespoke illustration: render the illustration.
            UNLOCKED structures with emoji-only fallback: render the emoji at a
              consistent size with a warm drop-shadow. No plinth ellipse.
            COMPLETED structures: warm gold drop-shadow glow. */}
        {(() => {
          const UNIFORM = 44;
          const HIT = 36;
          const LABEL_Y = 28;
          return structures.map(s => {
            const state = structureStates[s.code];
            const completed = state?.completed ?? false;
            const unlocked = state?.unlocked ?? false;
            const isTappedLocked = tappedLocked === s.code;

            const illustrationCode = ILLUSTRATION_ALIAS[s.code] ?? s.code;
            const drawn = StructureIllustration({ code: illustrationCode, x: 0, y: 0, size: UNIFORM });

            return (
              <g
                key={s.code}
                transform={`translate(${s.x}, ${s.y})`}
                style={{ cursor: 'pointer', touchAction: 'manipulation' }}
                onClick={() => onStructureTap(s)}
              >
                <circle r={HIT} fill="transparent" />

                {unlocked ? (
                  /* Unlocked — full illustration or plain emoji */
                  <g style={{
                    filter: completed
                      ? 'drop-shadow(0 0 6px rgba(255, 217, 61, 0.60))'
                      : 'drop-shadow(0 1.5px 2px rgba(107,68,35,0.42))',
                  }}>
                    {drawn ?? (
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={36}
                        y={0}
                      >
                        {s.themeEmoji}
                      </text>
                    )}
                  </g>
                ) : (
                  /* Locked — soft circle silhouette only, no emoji block */
                  <g>
                    <circle r={UNIFORM * 0.52} fill="rgba(180,170,155,0.22)" stroke="rgba(140,120,90,0.35)" strokeWidth={1.5} strokeDasharray="4 3" />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={18}
                      y={0}
                      fill="rgba(107,68,35,0.30)"
                    >
                      {s.themeEmoji}
                    </text>
                  </g>
                )}

                {/* Label pill */}
                <rect
                  x={-50} y={LABEL_Y} width={100} height={14} rx={4}
                  fill={completed ? 'rgba(255,217,61,0.85)' : unlocked ? 'rgba(255,250,242,0.85)' : 'rgba(230,220,208,0.70)'}
                />
                <text
                  x={0} y={LABEL_Y + 10} textAnchor="middle"
                  fontSize={9} fontWeight={600}
                  fill={unlocked ? '#6b4423' : 'rgba(107,68,35,0.55)'}
                >
                  {s.label}
                </text>

                {/* Lock hint tooltip on tap */}
                {isTappedLocked && state && (
                  <g>
                    <rect
                      x={-90} y={-UNIFORM * 1.1} width={180} height={28} rx={6}
                      fill="#fffaf2" stroke="#c38d9e" strokeWidth={1.5}
                    />
                    <text
                      x={0} y={-UNIFORM * 0.85} textAnchor="middle"
                      fontSize={10} fontStyle="italic" fill="#6b4423"
                    >
                      {state.prereqDisplay}
                    </text>
                  </g>
                )}
              </g>
            );
          });
        })()}
      </svg>
    </BranchSceneLayout>
  );
}
