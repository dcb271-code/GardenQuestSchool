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
  Tree, PineTree, StructureIllustration,
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
             Compressed vertically: peaks now sit in the upper third
             (y:64-280) so the meadow band gets more breathing room.
             No structure sits above y:430. Sun upper-left. */}
        <g opacity={0.90}>
          {/* Peak 5 — far-left, faintest */}
          <path
            d="M 0 248 Q 55 200 95 156 Q 108 146 122 156 Q 162 200 210 248 Z"
            fill="#DCE0ED" opacity={0.46}
          />
          {/* Peak 3 — left mid-distance */}
          <path
            d="M 160 256 Q 235 196 295 130 Q 315 114 335 130 Q 395 196 455 256 Z"
            fill="#B5BED4" opacity={0.70}
          />
          <path
            d="M 277 148 Q 305 120 322 124 Q 340 128 360 150
               Q 347 146 338 154 Q 326 144 316 154 Q 305 146 295 156
               Q 283 150 277 148 Z"
            fill="#F4F0E3" opacity={0.85}
          />
          {/* Peak 1 — THE BIG ONE, centred slightly left, tallest */}
          <path
            d="M 500 278 Q 610 188 700 64 Q 722 46 745 64 Q 835 188 945 278 Z"
            fill="#7B8AAA"
          />
          <path
            d="M 658 104 Q 695 60 718 58 Q 742 59 782 104
               Q 766 100 755 110 Q 742 96 730 110 Q 716 102 704 112
               Q 688 104 678 114 Q 666 108 658 104 Z"
            fill="#FBF8ED"
          />
          <path d="M 742 58 Q 835 188 945 278 L 742 278 Z" fill="#8D97B4" opacity={0.46} />
          <path d="M 700 78 Q 665 156 610 248 Q 645 148 718 64 Z" fill="#C8D0E3" opacity={0.38} />
          {/* Peak 2 — right mid-distance */}
          <path
            d="M 1020 256 Q 1090 196 1150 130 Q 1170 114 1190 130 Q 1248 196 1310 256 Z"
            fill="#B5BED4" opacity={0.70}
          />
          <path
            d="M 1132 148 Q 1160 120 1177 124 Q 1195 128 1215 150
               Q 1202 146 1193 154 Q 1181 144 1171 154 Q 1160 146 1150 156
               Q 1138 150 1132 148 Z"
            fill="#F4F0E3" opacity={0.85}
          />
          {/* Peak 4 — far-right, faintest */}
          <path
            d="M 1290 248 Q 1340 204 1380 162 Q 1392 152 1406 162 Q 1435 204 1460 248 Z"
            fill="#DCE0ED" opacity={0.46}
          />
          {/* Mist band — ties peaks to hills */}
          <path
            d="M 0 286 Q 280 270 720 282 T 1440 276 L 1440 320 L 0 320 Z"
            fill="#FFFFFF" opacity={0.34}
          />
        </g>

        {/* ── 3. SUN upper-left ── */}
        <circle cx={W * 0.14} cy={88} r={78} fill="url(#mmSunGlow)" opacity={0.70} />
        <circle cx={W * 0.14} cy={88} r={28} fill="#FFF2B5" opacity={0.88} />
        <g opacity={0.30} pointerEvents="none">
          {[0, 1, 2, 3, 4].map(i => (
            <polygon
              key={`mmray-${i}`}
              points={`${W * 0.14 - 26},${66} ${W * 0.14 + 34},${66} ${W * 0.14 + 34 + i * 110 + 180},${H} ${W * 0.14 - 26 + i * 110 + 220},${H}`}
              fill="url(#mmSunbeam)"
              opacity={0.18 - i * 0.025}
            />
          ))}
        </g>

        {/* ── 4. LAYERED HILL SILHOUETTES ──
             Pulled up so they sit between the peaks (y:280) and the
             meadow band (y:430+). Reads as proper recession from peaks
             → distant hills → foreground meadow. */}
        <path
          d={`M 0 ${H * 0.40} Q 220 ${H * 0.33} 460 ${H * 0.38} T 900 ${H * 0.35} T ${W} ${H * 0.39} L ${W} ${H * 0.50} L 0 ${H * 0.50} Z`}
          fill="#B8C4DB" opacity={0.50}
        />
        <path
          d={`M 0 ${H * 0.46} Q 280 ${H * 0.39} 560 ${H * 0.45} T 1050 ${H * 0.42} T ${W} ${H * 0.46} L ${W} ${H * 0.56} L 0 ${H * 0.56} Z`}
          fill="#A3BEA2" opacity={0.66}
        />
        <path
          d={`M 0 ${H * 0.52} Q 320 ${H * 0.46} 680 ${H * 0.50} T ${W} ${H * 0.48} L ${W} ${H * 0.62} L 0 ${H * 0.62} Z`}
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

        {/* ── 6. CAVE ENTRANCE — Operations Hollow anchor ──
             A mountain cave at lower-left (x:60-340, y:520-635) that
             gathers Hundred's Hollow, Fast Facts, and Regroup Ridge into
             one visual feature. Reduces the scene's "loose icon" feel —
             these structures read as INSIDE the cave clearing. */}
        <g pointerEvents="none">
          {/* outer rocky base */}
          <path
            d="M 40 638 Q 60 600 80 580 Q 110 540 160 525
               Q 220 515 270 525 Q 320 540 348 580 Q 360 610 358 638 Z"
            fill="#7A6B58" stroke="#3F3026" strokeWidth={2}
          />
          {/* cave inner shadow (the dark mouth) */}
          <path
            d="M 100 632 Q 110 600 130 580 Q 165 555 200 555 Q 240 558 270 580
               Q 290 605 295 632 Z"
            fill="#2C2018" opacity={0.78}
          />
          {/* moss along top edge */}
          <path
            d="M 70 580 Q 100 568 140 562 Q 200 558 250 564 Q 300 570 332 584"
            stroke="#7BA46F" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.74}
          />
          {/* lantern hanging in the cave mouth — a warm beacon */}
          <line x1={200} y1={555} x2={200} y2={580} stroke="#5A3B1F" strokeWidth={1.4} />
          <ellipse cx={200} cy={588} rx={6} ry={8} fill="#FFD06B" stroke="#5A3B1F" strokeWidth={1.2} />
          <circle cx={200} cy={588} r={3} fill="#FFF2B5" opacity={0.92} />
          {/* base rocks at the mouth */}
          <ellipse cx={70} cy={638} rx={20} ry={6} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.2} />
          <ellipse cx={340} cy={636} rx={18} ry={6} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.2} />
        </g>

        {/* ── 6b. LAKE — center-left mid-band, gathers water structures ──
             Quiet Pond, Big Falls, Berry Basket, Rushing Stream all
             cluster around / on this lake, so the cluster reads as one
             coherent water feature instead of four floating icons. */}
        <g pointerEvents="none">
          {/* outer wet-earth bank */}
          <ellipse cx={420} cy={510} rx={170} ry={68} fill="#6B8E5A" opacity={0.32} />
          {/* primary water body */}
          <ellipse cx={420} cy={510} rx={155} ry={56} fill="#A8CDD2" />
          {/* deeper center */}
          <ellipse cx={420} cy={510} rx={120} ry={40} fill="#92BEC4" opacity={0.6} />
          {/* lily pads */}
          <ellipse cx={330} cy={500} rx={12} ry={6} fill="#5C8A5A" stroke="#3F5A30" strokeWidth={1} opacity={0.86} />
          <ellipse cx={328} cy={498} rx={4} ry={2} fill="#7BA46F" />
          <ellipse cx={490} cy={494} rx={10} ry={5} fill="#5C8A5A" stroke="#3F5A30" strokeWidth={1} opacity={0.86} />
          <ellipse cx={488} cy={492} rx={3.5} ry={1.8} fill="#7BA46F" />
          <ellipse cx={398} cy={530} rx={9} ry={4.5} fill="#5C8A5A" stroke="#3F5A30" strokeWidth={1} opacity={0.86} />
          {/* shimmer ripples */}
          <path d="M 358 506 Q 372 502 388 506" stroke="#FFFFFF" strokeWidth={1.2} fill="none" opacity={0.66} strokeLinecap="round" />
          <path d="M 444 514 Q 460 510 476 514" stroke="#FFFFFF" strokeWidth={1.2} fill="none" opacity={0.62} strokeLinecap="round" />
          <path d="M 396 524 Q 408 520 422 524" stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.55} strokeLinecap="round" />
          {/* small fish silhouette */}
          <path d="M 460 520 q 4 -3 8 0 q -2 2 -2 4 q -4 0 -6 -4 z" fill="#5C7E4F" opacity={0.5} />
          <path d="M 360 516 q 4 -3 8 0 q -2 2 -2 4 q -4 0 -6 -4 z" fill="#5C7E4F" opacity={0.45} />
          {/* moss-topped boulders on the lake banks */}
          <ellipse cx={282} cy={520} rx={11} ry={6} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.2} />
          <ellipse cx={280} cy={517} rx={7} ry={2.6} fill="#A89D8A" />
          <ellipse cx={282} cy={515} rx={9} ry={2} fill="#7BA46F" opacity={0.84} />
          <ellipse cx={560} cy={500} rx={11} ry={6} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.2} />
          <ellipse cx={558} cy={497} rx={7} ry={2.6} fill="#A89D8A" />
          <ellipse cx={560} cy={495} rx={9} ry={2} fill="#7BA46F" opacity={0.84} />
          {/* cattails along left bank */}
          {[[270, 480], [294, 478], [288, 462]].map(([cx, cy], i) => (
            <g key={`mmcat-${i}`}>
              <line x1={cx} y1={cy} x2={cx} y2={cy + 22} stroke="#6B8E5A" strokeWidth={1.4} />
              <rect x={cx - 1.5} y={cy - 4} width={3} height={9} rx={1.5} fill="#5A3B1F" />
            </g>
          ))}
        </g>

        {/* ── 6c. RIVER + BEAVER DAM — central horizontal accent ──
             Flows from the lake outflow (right of lake) eastward through
             the mid-meadow corridor at y:572-588. Big Number Bridge spans
             its source; the river meanders across the scene with a small
             beaver dam mid-way, and exits stage-right under the orchard.
             Sits ABOVE the bottom buffer (no river below y:600). */}
        <g pointerEvents="none">
          {/* lake outflow → main river body */}
          <path
            d="M 568 524 C 600 540, 620 562, 640 576
               C 720 580, 800 582, 880 580
               C 960 578, 1040 580, 1100 582
               C 1180 584, 1260 580, 1330 574
               C 1380 570, 1420 568, 1440 568
               L 1440 596 C 1420 596, 1380 598, 1330 600
               C 1260 604, 1180 608, 1100 606
               C 1040 605, 960 602, 880 604
               C 800 605, 720 604, 640 600
               C 620 590, 600 568, 568 552 Z"
            fill="#6B8E5A" opacity={0.28}
          />
          <path
            d="M 580 532 C 612 548, 632 568, 650 580
               C 728 584, 808 586, 884 584
               C 962 582, 1042 584, 1102 586
               C 1180 587, 1258 583, 1326 578
               C 1378 574, 1418 572, 1440 572
               L 1440 592 C 1418 592, 1378 594, 1326 596
               C 1258 600, 1180 604, 1102 602
               C 1042 601, 962 599, 884 600
               C 808 601, 728 600, 650 596
               C 632 588, 612 572, 580 558 Z"
            fill="#A8CDD2"
          />
          {/* depth channel */}
          <path
            d="M 600 560 C 700 588, 900 590, 1100 590 C 1280 588, 1400 580, 1438 580"
            stroke="#7FA9B0" strokeWidth={3.4} fill="none" strokeLinecap="round" opacity={0.6}
          />
          {/* shimmer ripples spread along the river */}
          {[680, 760, 920, 1000, 1180, 1260, 1380].map((rx, i) => (
            <path
              key={`mmrr-${i}`}
              d={`M ${rx - 9} 584 Q ${rx} 580 ${rx + 9} 584`}
              stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.55 - (i % 2) * 0.08} strokeLinecap="round"
            />
          ))}

          {/* BEAVER DAM at the river midpoint (x:840, y:580) — small log
              pile crossing the river. The path does NOT cross here — it
              crosses upstream at Big Bridge and downstream at Skip Bridge.
              This is a pure visual anchor. */}
          <g transform="translate(840, 580)">
            {/* shadow on water */}
            <ellipse cx={0} cy={6} rx={42} ry={5} fill="#000" opacity={0.18} />
            {/* logs (stacked) */}
            <rect x={-38} y={-2}  width={76} height={6} rx={3} fill="#8B5A2B" stroke="#5A3B1F" strokeWidth={1.2} />
            <rect x={-32} y={-8}  width={64} height={6} rx={3} fill="#A06B36" stroke="#5A3B1F" strokeWidth={1.2} />
            <rect x={-24} y={-14} width={48} height={6} rx={3} fill="#B47845" stroke="#5A3B1F" strokeWidth={1.1} />
            {/* end-grain rings on protruding logs */}
            <circle cx={-38} cy={1} r={2.4} fill="#7A4A1F" stroke="#5A3B1F" strokeWidth={0.8} />
            <circle cx={38}  cy={1} r={2.4} fill="#7A4A1F" stroke="#5A3B1F" strokeWidth={0.8} />
            {/* a small beaver perched on top */}
            <g transform="translate(8, -22)">
              <ellipse cx={0} cy={0} rx={9} ry={6.5} fill="#7A4E2C" stroke="#3F2614" strokeWidth={1.2} />
              <circle cx={6} cy={-2} r={4} fill="#8B5A2B" stroke="#3F2614" strokeWidth={1.1} />
              <circle cx={5.4} cy={-3} r={0.9} fill="#1A0E08" />
              <circle cx={7.5} cy={-3.5} r={0.4} fill="#1A0E08" />
              <ellipse cx={9.4} cy={-1.5} rx={1.3} ry={0.8} fill="#3F2614" />
              {/* tiny ear */}
              <circle cx={4.2} cy={-5} r={1.2} fill="#3F2614" />
              {/* paddle tail */}
              <ellipse cx={-9} cy={2} rx={4} ry={2} fill="#3F2614" stroke="#1A0E08" strokeWidth={0.8} />
            </g>
          </g>

          {/* SKIP COUNT BRIDGE crossing — small spillway from upper-right
              that meets the river. The bridge spans this stream cleanly. */}
          <ellipse cx={1320} cy={530} rx={64} ry={11} fill="#6B8E5A" opacity={0.24} />
          <ellipse cx={1320} cy={530} rx={54} ry={7} fill="#A8CDD2" />
          <path
            d="M 1270 530 Q 1320 526 1370 530"
            stroke="#7FA9B0" strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={0.6}
          />
          <ellipse cx={1264} cy={538} rx={7} ry={4} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1} />
          <ellipse cx={1378} cy={538} rx={7} ry={4} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1} />
        </g>

        {/* ── 8. PATH SYSTEM ──
             Stays ENTIRELY ABOVE y:625 — bottom 22% of the scene is a
             clean meadow buffer with no path or icons.
             Trail: cottage cluster → cave → climbs the lake bank →
             over BIG BRIDGE (river source) → up the plateau → ridges →
             over SKIP BRIDGE (orchard stream) → glen.
             Path NEVER crosses the river except at the two bridges. */}
        {(() => {
          // Cottage approach (top-left corner, around story books)
          const cottageApproachD = `M 130 530 C 180 528, 240 524, 300 514`;
          // Around the cave clearing into the lake bank
          const caveToLakeD = `M 240 600 C 220 580, 240 560, 260 548 C 282 540, 308 538, 332 538`;
          // Lake-bank climb (north shore) → up to plateau
          const lakeNorthD = `M 332 538 C 380 470, 430 432, 480 416 C 520 408, 548 408, 558 408`;
          // Plateau ridge — Tens → Three-Digit → Mountain Heights → Round 100
          const plateauRidgeD = `M 560 400 C 610 372, 650 354, 690 352 C 730 356, 770 372, 800 384 C 850 380, 890 368, 920 364`;
          // Glen connector — Round 100 → Sharing → Division Facts → Missing
          const glenConnectD = `M 920 364 C 970 376, 1020 400, 1060 416 C 1090 420, 1110 416, 1120 408 C 1150 376, 1180 362, 1200 362 C 1240 366, 1290 376, 1320 380`;
          // Lower-plateau row — Compare Trees → Ten More → Round 10
          const lowerRidgeD = `M 596 462 C 668 466, 740 466, 812 468 C 850 468, 872 470, 880 470`;
          // OVER BIG BRIDGE — flat plank crossing the lake-outflow river
          const bigBridgeD = `M 480 590 C 510 590, 530 590, 540 590 C 560 590, 580 590, 600 590`;
          // From Big Bridge → climbs back to lower ridge
          const bigBridgeApproachD = `M 600 590 C 614 560, 600 510, 596 462`;
          // Right fork — lower ridge → through Time pieces → orchard climb
          const timeRowConnectD = `M 880 470 C 880 500, 800 528, 760 532 C 720 536, 690 536, 680 540`;
          const orchardClimbD = `M 880 470 C 940 480, 1010 498, 1060 510 C 1080 514, 1080 510, 1080 510`;
          // OVER SKIP BRIDGE — flat plank crossing the orchard stream
          const skipBridgeD = `M 1270 530 C 1296 530, 1310 530, 1320 530 C 1340 530, 1360 530, 1370 530`;
          // From orchard climb → up to Skip Bridge
          const orchardToSkipD = `M 1080 510 C 1140 514, 1200 530, 1268 530`;
          return (
            <g pointerEvents="none">
              {/* Shadow */}
              {[cottageApproachD, caveToLakeD, lakeNorthD, plateauRidgeD, glenConnectD, lowerRidgeD, bigBridgeApproachD, timeRowConnectD, orchardClimbD, orchardToSkipD].map((d, i) => (
                <path key={`mmsh-${i}`} d={d} stroke="#A99878" strokeWidth={20} fill="none" strokeLinecap="round" opacity={0.18} />
              ))}
              {/* Bridges (wood plank shadow) */}
              <path d={bigBridgeD}  stroke="#7A5A3A" strokeWidth={24} fill="none" strokeLinecap="round" opacity={0.78} />
              <path d={skipBridgeD} stroke="#7A5A3A" strokeWidth={18} fill="none" strokeLinecap="round" opacity={0.78} />

              {/* Surface — narrows as it climbs */}
              <path d={cottageApproachD} stroke="#EAD2A8" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.84} />
              <path d={caveToLakeD}      stroke="#EAD2A8" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.84} />
              <path d={lakeNorthD}       stroke="#EAD2A8" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.82} />
              <path d={plateauRidgeD}    stroke="#EAD2A8" strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.78} />
              <path d={glenConnectD}     stroke="#EAD2A8" strokeWidth={11} fill="none" strokeLinecap="round" opacity={0.76} />
              <path d={lowerRidgeD}      stroke="#EAD2A8" strokeWidth={13} fill="none" strokeLinecap="round" opacity={0.80} />
              <path d={bigBridgeApproachD} stroke="#EAD2A8" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.82} />
              <path d={timeRowConnectD}  stroke="#EAD2A8" strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.74} />
              <path d={orchardClimbD}    stroke="#EAD2A8" strokeWidth={13} fill="none" strokeLinecap="round" opacity={0.78} />
              <path d={orchardToSkipD}   stroke="#EAD2A8" strokeWidth={13} fill="none" strokeLinecap="round" opacity={0.80} />

              {/* Bridge plank surfaces */}
              <path d={bigBridgeD}  stroke="#C8A57A" strokeWidth={18} fill="none" strokeLinecap="round" opacity={0.94} />
              <path d={skipBridgeD} stroke="#C8A57A" strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.94} />
              {[488, 506, 524, 542, 560, 578, 596].map(px => (
                <line key={`bbp-${px}`} x1={px} y1={580} x2={px} y2={600} stroke="#7A5A3A" strokeWidth={1.3} opacity={0.7} />
              ))}
              {[1280, 1296, 1312, 1328, 1344, 1360].map(px => (
                <line key={`sbp-${px}`} x1={px} y1={522} x2={px} y2={538} stroke="#7A5A3A" strokeWidth={1.2} opacity={0.7} />
              ))}

              {/* Highlight ribbon */}
              {[cottageApproachD, caveToLakeD, lakeNorthD, plateauRidgeD, glenConnectD, lowerRidgeD, bigBridgeApproachD, timeRowConnectD, orchardClimbD, orchardToSkipD].map((d, i) => (
                <path key={`mmhi-${i}`} d={d} stroke="#F7E6C4" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.46} />
              ))}

              {/* Stepping stones — sparse, only on key approaches */}
              {[
                // cottage approach
                { x: 200, y: 528 }, { x: 270, y: 520 },
                // cave-to-lake
                { x: 250, y: 580 }, { x: 282, y: 552 },
                // lake-north climb
                { x: 360, y: 500 }, { x: 410, y: 444 }, { x: 470, y: 416 },
                // plateau ridge
                { x: 620, y: 376 }, { x: 720, y: 358 }, { x: 850, y: 380 },
                // glen connector
                { x: 990, y: 386 }, { x: 1080, y: 414 }, { x: 1180, y: 372 }, { x: 1260, y: 376 },
                // lower ridge
                { x: 660, y: 466 }, { x: 800, y: 468 },
                // big-bridge approach (going back up after bridge crossing)
                { x: 600, y: 562 }, { x: 596, y: 524 },
                // orchard climb
                { x: 940, y: 480 }, { x: 1020, y: 500 },
              ].map((s, i) => (
                <g key={`mmstn-${i}`}>
                  <ellipse cx={s.x + 1} cy={s.y + 2} rx={7} ry={4} fill="#000" opacity={0.16} />
                  <ellipse cx={s.x} cy={s.y} rx={7} ry={4} fill="#C9B489" stroke="#8A7050" strokeWidth={1} />
                  <ellipse cx={s.x - 1.5} cy={s.y - 1} rx={3} ry={1.3} fill="#E0CBA1" opacity={0.8} />
                </g>
              ))}
            </g>
          );
        })()}

        {/* ── 9. WORD STORIES COTTAGE — top-left corner ──
             Stories now at (70,480), (60,530), (160,510). Cottage SVG
             sits above the structures so it reads as a small reading
             nook anchoring the cluster. */}
        <g transform="translate(20, 410)" pointerEvents="none">
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
        </g>

        {/* ── 10. APPLE ORCHARD ROWS — flank Multiplication Orchard ──
             Trees ABOVE the cluster (between hills and structures) so
             they don't violate the bottom buffer. */}
        <Tree x={1010} y={460} size={40} variant={1} />
        <Tree x={1380} y={460} size={42} variant={2} />

        {/* ── 11. DIVISION GLEN — pine clearing on the upper hills ──
             Glen structures at y:360-420. Pines flank the clearing
             behind, and small boulders sit at the foot of each. */}
        <PineTree x={1030} y={324} size={46} />
        <PineTree x={1140} y={324} size={50} />
        <PineTree x={1260} y={328} size={48} />
        <PineTree x={1380} y={324} size={48} />

        {/* ── 12. FRAMING TREES ──
             Rules: no tree within 60px of any structure; trees only at
             edges and mid-distance. NONE below y:600 (bottom buffer). */}

        {/* Distant ridge between peaks (NW between Peak 5 & Peak 3) */}
        <PineTree x={130} y={300} size={44} />
        <PineTree x={460} y={300} size={42} />

        {/* Mid-distance pines on the upper hills (between plateau structures) */}
        <PineTree x={620} y={310} size={40} />
        <PineTree x={860} y={310} size={42} />

        {/* Far-right edge — separates Glen from frame */}
        <Tree x={1402} y={460} size={50} variant={3} />

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
            Matches the central-garden treatment so all three scenes share
            one structure language:
            UNLOCKED  → bespoke illustration (or plain emoji fallback) at
                        UNIFORM size with a warm drop-shadow.
            LOCKED    → SAME illustration/emoji, but desaturated + dimmed
                        (grayscale 1, opacity .55, brightness .92) with a
                        small white lock badge in the upper-right corner —
                        same pattern as the central garden's `<Structure>`.
                        No more dashed-circle "clipart" silhouette.
            COMPLETED → warm gold drop-shadow glow.
            Label pill: rounded white pill with terracotta hairline (unlocked)
                        or muted bone (locked). Shorter width so adjacent
                        plateau structures don't form a single beige band
                        — that was the "weird block shadows" problem. */}
        {(() => {
          const UNIFORM = 44;
          const HIT = 36;
          const LABEL_Y = 30;
          const LABEL_W = 92;
          const LABEL_H = 17;
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

                {/* Unlocked-pulse halo (active stops feel alive) */}
                {unlocked && !completed && (
                  <circle r={UNIFORM * 0.78} fill="#FFE89A" opacity={0.22} />
                )}

                {/* Illustration — always rendered; locked just gets a
                    grayscale/opacity treatment the way the garden does. */}
                <g style={{
                  filter: completed
                    ? 'drop-shadow(0 0 6px rgba(255, 217, 61, 0.60))'
                    : unlocked
                      ? 'drop-shadow(0 1.5px 2px rgba(107,68,35,0.42))'
                      : 'grayscale(1) brightness(0.92)',
                  opacity: unlocked ? 1 : 0.58,
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

                {/* Lock badge — small white circle in upper-right
                    (matches central garden Structure component) */}
                {!unlocked && (
                  <g pointerEvents="none">
                    <circle cx={UNIFORM * 0.4} cy={-UNIFORM * 0.4} r={9}
                            fill="#FFFFFF" stroke="#8A7E6C" strokeWidth={1.3} />
                    <text
                      x={UNIFORM * 0.4} y={-UNIFORM * 0.4 + 3.4}
                      fontSize={11} textAnchor="middle"
                      style={{ userSelect: 'none' }}
                    >🔒</text>
                  </g>
                )}

                {/* Completed checkmark badge */}
                {completed && (
                  <g pointerEvents="none">
                    <circle cx={UNIFORM * 0.4} cy={-UNIFORM * 0.4} r={9}
                            fill="#6B8E5A" stroke="#4F6F42" strokeWidth={1.3} />
                    <path
                      d={`M ${UNIFORM * 0.4 - 4} ${-UNIFORM * 0.4 + 0.5}
                          L ${UNIFORM * 0.4 - 1} ${-UNIFORM * 0.4 + 3.5}
                          L ${UNIFORM * 0.4 + 4} ${-UNIFORM * 0.4 - 2.5}`}
                      stroke="#FFFFFF" strokeWidth={1.8} fill="none"
                      strokeLinecap="round" strokeLinejoin="round"
                    />
                  </g>
                )}

                {/* Label pill — refined, rounded, soft hairline */}
                <rect
                  x={-LABEL_W / 2} y={LABEL_Y} width={LABEL_W} height={LABEL_H} rx={LABEL_H / 2}
                  fill={completed ? '#FFF6CC' : unlocked ? '#FFFAF2' : '#EFE7D4'}
                  stroke={completed ? '#D4B43E' : unlocked ? '#E8A87C' : '#C7B89A'}
                  strokeWidth={1.2}
                  opacity={unlocked || completed ? 0.96 : 0.78}
                />
                <text
                  x={0} y={LABEL_Y + 12} textAnchor="middle"
                  fontSize={9.5} fontWeight={700}
                  fill={unlocked ? '#6b4423' : '#8a7050'}
                  style={{ userSelect: 'none' }}
                >
                  {s.label}
                </text>

                {/* Lock hint tooltip on tap */}
                {isTappedLocked && state && (
                  <g pointerEvents="none">
                    <rect
                      x={-90} y={-UNIFORM * 1.1} width={180} height={28} rx={8}
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
