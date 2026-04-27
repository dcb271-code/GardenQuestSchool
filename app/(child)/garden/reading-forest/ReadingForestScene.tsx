// app/(child)/garden/reading-forest/ReadingForestScene.tsx
//
// Reading Forest — hand-illustrated SVG, same vocabulary as the central garden.
//
// Design rules now in force:
//   LAYERING (back to front):
//     1. Warm forest-filtered sky — amber-cream at top fading to deep sage
//     2. Far tree-line silhouette — dark organic crenellated band at y:85-175.
//        NO structures inside or above this band.
//     3. Mid tree-line — Tree/PineTree pairs at y:230-265 (distant canopy)
//     4. Mist band — atmospheric white wash between tree-line and floor
//     5. Forest floor hill layers (mid-sage, deeper sage)
//     6. Grass texture — same pattern as the central garden
//     7. Cluster region tints (Glade, Grove, Rocks)
//     8. Brook — enters LEFT edge at ~y:508, flows as a quiet horizontal body
//        through x:0-430, y:496-574. Stays entirely BELOW y:490 so it never
//        clips into the Sight Word Glade (y:360-510) or Phonics Path (y:220-370).
//        The brook is crossed by the Digraph Bridge path at a deliberate ford:
//        rf_digraphs is at x:480, y:360 — the path dips south briefly to
//        pass OVER the water body that the bridge illustration spans.
//     9. Wooden bridge at rf_digraphs ford (drawn behind the structure)
//    10. Phonics Path — ONE continuous stepping-stone trail:
//          Glade edge (x:380, y:370) → through phonics band (y:220-370) →
//          south through Morphology Grove → Story Rocks clearing →
//          loop-back south arc → reconnects to Glade edge
//        A garden-exit narrowing spur exits right edge at y:260.
//    11. Sight Word Glade — open oval clearing NW, wildflower clusters,
//        framing trees (all above y:490 to clear brook zone)
//    12. Ancient oak — Morphology Grove anchor (NE, x:1380, y:440)
//    13. Story Rocks — mossy boulder semicircle ~x:598-875, y:640-745
//    14. Framing trees — no tree within 60px of any structure; no tree
//        inside brook zone (x:0-430, y:496-580)
//    15. Dappled light shafts from upper canopy (no mixBlendMode)
//    16. Grass tufts + flowers — forest floor only (y > 630)
//    17. Foreground grass silhouette
//    18. Cluster labels
//    19. Structures — locked = soft circle silhouette; unlocked = illustration
//        or emoji with warm drop-shadow (no plinth geometry).

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MapStructure } from '@/lib/world/gardenMap';
import type { BranchCluster } from '@/lib/world/branchMaps';
import { BRANCH_MAP_WIDTH, BRANCH_MAP_HEIGHT } from '@/lib/world/branchMaps';
import BranchSceneLayout from '@/components/child/garden/BranchSceneLayout';
import { Tree, PineTree, Flower, GrassTuft, StructureIllustration } from '@/components/child/garden/illustrations';
import type { ReadingForestStructureState } from './page';

interface ReadingForestSceneProps {
  learnerId: string;
  structures: MapStructure[];
  clusters: BranchCluster[];
  structureStates: Record<string, ReadingForestStructureState>;
}

const W = BRANCH_MAP_WIDTH;   // 1440
const H = BRANCH_MAP_HEIGHT;  // 800

// Maps branch structure codes → an existing StructureIllustration code
const ILLUSTRATION_ALIAS: Record<string, string> = {
  rf_dolch_first:    'reading_bee_words',
  rf_dolch_second:   'reading_bee_words',
  rf_dolch_third:    'reading_bee_words',
  rf_digraphs:       'reading_digraph_bridge',
  rf_initial_blends: 'reading_blending_beach',
  rf_longer_words:   'reading_readaloud_log',
  rf_sentence:       'reading_book_stump',
  rf_paragraph:      'reading_book_stump',
};

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
          {/* Forest-filtered sky — warm amber light at top, deepening forest below */}
          <linearGradient id="rfSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#F2E8C8" />
            <stop offset="14%" stopColor="#E2DDB8" />
            <stop offset="28%" stopColor="#CFDC9E" />
            <stop offset="44%" stopColor="#AECF90" />
            <stop offset="64%" stopColor="#8EBF85" />
            <stop offset="100%" stopColor="#6B8E5A" />
          </linearGradient>
          {/* Canopy dapple glow — warm top centre */}
          <radialGradient id="rfDappleTop" cx="50%" cy="8%" r="55%">
            <stop offset="0%" stopColor="#FFF5D0" stopOpacity="0.42" />
            <stop offset="65%" stopColor="#FFF5D0" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#FFF5D0" stopOpacity="0" />
          </radialGradient>
          {/* Light shafts */}
          <linearGradient id="rfShaft" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#FFF5D0" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFF5D0" stopOpacity="0" />
          </linearGradient>
          {/* Glade clearing tint — warm amber oval, NW */}
          <radialGradient id="rfGladeTint" cx="15%" cy="52%" r="20%">
            <stop offset="0%" stopColor="#F9EDCC" stopOpacity="0.52" />
            <stop offset="100%" stopColor="#F9EDCC" stopOpacity="0" />
          </radialGradient>
          {/* Morphology Grove tint — deep forest-green, NE */}
          <radialGradient id="rfGroveTint" cx="86%" cy="65%" r="24%">
            <stop offset="0%" stopColor="#4F6F42" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#4F6F42" stopOpacity="0" />
          </radialGradient>
          {/* Story Rocks clearing tint — warm stone, centre-bottom */}
          <radialGradient id="rfRocksTint" cx="50%" cy="88%" r="20%">
            <stop offset="0%" stopColor="#C8BCAA" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#C8BCAA" stopOpacity="0" />
          </radialGradient>
          {/* Forest floor grass texture — identical to central garden */}
          <pattern id="rfGrass" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="transparent" />
            <path d="M 4 36 Q 4 30 6 28" stroke="#7BA46F" strokeWidth="1.2" fill="none" opacity="0.28" />
            <path d="M 20 38 Q 22 32 24 30" stroke="#7BA46F" strokeWidth="1.2" fill="none" opacity="0.24" />
            <path d="M 32 36 Q 30 32 32 28" stroke="#7BA46F" strokeWidth="1.2" fill="none" opacity="0.28" />
          </pattern>
        </defs>

        {/* ── 1. SKY + CANOPY WASH ── */}
        <rect width={W} height={H} fill="url(#rfSky)" />
        <rect width={W} height={H} fill="url(#rfDappleTop)" />

        {/* ── 2. FAR TREE-LINE — organic crenellated band at y:85-175 ──
             NO structures ever placed inside this band. */}
        <g opacity={0.54}>
          <path
            d={`M 0 178 Q 60 146 110 156 Q 145 128 175 146 Q 210 116 250 138 Q 285 106 320 130
                Q 358 102 395 126 Q 430 96 468 120 Q 510 93 552 116 Q 592 98 630 116
                Q 668 88 708 110 Q 748 94 788 112 Q 828 90 868 108 Q 910 94 948 112
                Q 990 98 1028 118 Q 1068 102 1110 122 Q 1148 104 1190 126 Q 1228 106 1272 128
                Q 1310 110 1350 136 Q 1388 116 1420 140 Q 1440 146 1440 158 L 1440 178 L 0 178 Z`}
            fill="#4F6F42"
          />
        </g>

        {/* ── 3. MID TREE-LINE — Tree/PineTree at y:232-262, distant canopy ──
             All placed well above the Glade (y:360+) and Phonics Path (y:220+).
             30px edge buffer from both sides. */}
        <Tree  x={58}   y={246} size={76} variant={1} />
        <PineTree x={108}  y={236} size={70} />
        <PineTree x={170}  y={250} size={64} />
        <Tree  x={234}  y={240} size={70} variant={2} />
        <PineTree x={304}  y={248} size={62} />
        <Tree  x={370}  y={242} size={68} variant={3} />
        <PineTree x={440}  y={254} size={58} />
        {/* gap at phonics path entry ~x:480 */}
        <PineTree x={1252} y={248} size={62} />
        <Tree  x={1320} y={242} size={68} variant={2} />
        <PineTree x={1384} y={250} size={70} />

        {/* ── 4. MIST BAND ── */}
        <path
          d={`M 0 ${H * 0.36} Q 360 ${H * 0.34} 720 ${H * 0.37} T ${W} ${H * 0.36}
              L ${W} ${H * 0.43} L 0 ${H * 0.43} Z`}
          fill="#FFFFFF" opacity={0.26}
        />

        {/* ── 5. FOREST FLOOR HILL LAYERS ── */}
        <path
          d={`M 0 ${H * 0.50} Q 240 ${H * 0.45} 500 ${H * 0.49} T 980 ${H * 0.46} T ${W} ${H * 0.50} L ${W} ${H * 0.64} L 0 ${H * 0.64} Z`}
          fill="#7BA46F" opacity={0.50}
        />
        <path
          d={`M 0 ${H * 0.60} Q 280 ${H * 0.55} 580 ${H * 0.59} T 1060 ${H * 0.57} T ${W} ${H * 0.61} L ${W} ${H * 0.75} L 0 ${H * 0.75} Z`}
          fill="#6B8E5A" opacity={0.56}
        />

        {/* ── 6. GRASS TEXTURE — restricted to FLOOR band only (y>340).
             Previously spanned the full viewport, so the grass-tuft
             pattern was visible across the canopy/sky too — read as
             "the sky has grass in it." Floor-only now. */}
        <rect x={0} y={340} width={W} height={H - 340} fill="url(#rfGrass)" />

        {/* ── 7. CLUSTER REGION TINTS ── */}
        <rect width={W} height={H} fill="url(#rfGladeTint)" />
        <rect width={W} height={H} fill="url(#rfGroveTint)" />
        <rect width={W} height={H} fill="url(#rfRocksTint)" />

        {/* ── 8. BROOK — lower-left horizontal body ──
             Flows from LEFT edge at y≈508, arcs gently, exits back toward the
             left at y≈560. Stays BELOW y:490 so it's entirely clear of:
               • Sight Word Glade (y:360-510, but brook is at x<430 only)
               • Phonics Path structures (y:220-370)
               • rf_digraphs at (480, 360) — the bridge is east of the brook's exit
             The path dips OVER the brook via a stepping stone ford just east of
             the brook exit (~x:450, y:500). */}
        <g pointerEvents="none">
          {/* outer wet-earth bank */}
          <path
            d={`M 0 508
                Q 55 496 120 506 Q 200 518 290 512 Q 358 508 410 520
                Q 432 530 428 542 Q 422 556 390 550 Q 320 542 240 548
                Q 155 554 80 562 Q 32 568 0 562 Z`}
            fill="#6B8E5A" opacity={0.28}
          />
          {/* primary water body */}
          <path
            d={`M 0 512
                Q 56 502 120 511 Q 200 522 290 516 Q 356 512 408 522
                Q 430 532 424 542 Q 418 552 388 546 Q 318 540 240 545
                Q 156 550 82 557 Q 36 562 0 558 Z`}
            fill="#B2D4D9"
          />
          {/* depth channel */}
          <path
            d="M 30 524 Q 110 516 210 526 Q 300 534 400 528"
            stroke="#8FB7C2" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.64}
          />
          {/* shimmer ripples */}
          <path d="M 55 522 Q 78 518 100 524" stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.68} strokeLinecap="round" />
          <path d="M 170 528 Q 192 524 212 530" stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.64} strokeLinecap="round" />
          <path d="M 288 526 Q 308 522 330 530" stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.66} strokeLinecap="round" />
          {/* moss-topped boulders in stream */}
          <g>
            <ellipse cx={148} cy={516} rx={13} ry={7.5} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.4} />
            <ellipse cx={146} cy={512} rx={9.5} ry={3.5} fill="#A89D8A" />
            <ellipse cx={148} cy={510} rx={11} ry={2.8} fill="#7BA46F" opacity={0.88} />
          </g>
          <g>
            <ellipse cx={260} cy={522} rx={11} ry={6} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.4} />
            <ellipse cx={258} cy={518} rx={8} ry={3} fill="#A89D8A" />
            <ellipse cx={260} cy={516} rx={9} ry={2.2} fill="#7BA46F" opacity={0.88} />
          </g>
          {/* bank grass tufts */}
          {[[18, 538], [108, 546], [222, 538], [372, 542]].map(([gx, gy], i) => (
            <g key={`rfbt-${i}`} transform={`translate(${gx},${gy})`}>
              <path d="M 0 0 Q -1 -6 -2 -10" stroke="#5C7E4F" strokeWidth={1.3} fill="none" strokeLinecap="round" />
              <path d="M 0 0 Q 1 -7 3 -11" stroke="#5C7E4F" strokeWidth={1.3} fill="none" strokeLinecap="round" />
              <path d="M 0 0 Q 2 -5 5 -9" stroke="#5C7E4F" strokeWidth={1.2} fill="none" strokeLinecap="round" />
            </g>
          ))}
          {/* Cattail at bank */}
          <g transform="translate(40, 494)">
            <path d="M 0 0 Q -1 -12 -2 -22" stroke="#6B8E5A" strokeWidth={1.5} fill="none" strokeLinecap="round" />
            <ellipse cx={-2} cy={-24} rx={1.6} ry={5} fill="#7B4F2C" stroke="#3F2817" strokeWidth={0.8} />
          </g>
        </g>

        {/* The orphan bridge graphic at (452, 490) was removed — the
            actual brook body sits at y:512-562, so the bridge floated
            above empty meadow and the V-shape path dip below it had
            nothing to cross. The rf_digraphs structure already renders
            as a hand-drawn DigraphBridge illustration via the
            ILLUSTRATION_ALIAS map; that illustration carries the
            "bridge" visual at the structure's own position. */}

        {/* ── 10. PHONICS PATH ──
             Complete loop: Glade edge → phonics band → Grove → Story Rocks →
             loop-back → Glade edge. Garden-exit spur exits right at y:260.
             Path dips south at ~x:450 to cross the brook ford (bridge above). */}
        {(() => {
          // Segment 1: Glade edge → through phonics structures → Diphthong Cove
          // Smooth meander through the phonics band (no V-dip — the
          // previous dip was meant to cross a "bridge ford" but the
          // bridge graphic was orphaned and the dip read as a sharp V).
          const seg1D = `M 380 370
            C 420 348, 460 332, 510 320
            C 560 308, 600 290, 640 270
            C 680 252, 720 234, 760 230
            C 800 226, 838 246, 870 254
            C 912 264, 950 232, 990 228
            C 1030 226, 1064 254, 1104 260
            C 1144 266, 1180 232, 1218 230
            C 1252 230, 1280 250, 1280 268`;
          // Segment 2: Diphthong Cove → drops SE → loops back SW to Story Rocks
          const seg2D = `M 1280 268
            C 1308 278, 1268 364, 1230 430
            C 1192 494, 1162 518, 1142 548
            C 1118 576, 1054 608, 984 638
            C 904 666, 832 676, 778 684
            C 748 690, 726 692, 732 684`;
          // Loop-back: Story Rocks → south-west arc → Glade edge
          const loopBackD = `M 732 684
            C 702 698, 642 714, 562 722
            C 482 728, 412 722, 342 704
            C 282 688, 222 664, 182 632
            C 150 604, 142 572, 162 534
            C 182 498, 220 466, 270 436
            C 312 410, 350 392, 380 370`;
          // Garden exit: from Diphthong Cove (1280, 268) east → right edge at y:260
          const gardenExitLowerD = `M 1280 268 C 1318 264, 1362 260, 1400 260`;
          const gardenExitUpperD = `M 1400 260 C 1420 260, 1432 260, 1440 260`;
          return (
            <g pointerEvents="none">
              {/* Shadow */}
              <path d={seg1D}      stroke="#A99878" strokeWidth={36} fill="none" strokeLinecap="round" opacity={0.19} />
              <path d={seg2D}      stroke="#A99878" strokeWidth={36} fill="none" strokeLinecap="round" opacity={0.19} />
              <path d={loopBackD}  stroke="#A99878" strokeWidth={32} fill="none" strokeLinecap="round" opacity={0.17} />
              <path d={gardenExitLowerD} stroke="#A99878" strokeWidth={30} fill="none" strokeLinecap="round" opacity={0.17} />
              <path d={gardenExitUpperD} stroke="#A99878" strokeWidth={20} fill="none" strokeLinecap="round" opacity={0.13} />
              {/* Surface */}
              <path d={seg1D}      stroke="#EAD2A8" strokeWidth={24} fill="none" strokeLinecap="round" opacity={0.86} />
              <path d={seg2D}      stroke="#EAD2A8" strokeWidth={24} fill="none" strokeLinecap="round" opacity={0.86} />
              <path d={loopBackD}  stroke="#EAD2A8" strokeWidth={20} fill="none" strokeLinecap="round" opacity={0.80} />
              <path d={gardenExitLowerD} stroke="#EAD2A8" strokeWidth={20} fill="none" strokeLinecap="round" opacity={0.80} />
              <path d={gardenExitUpperD} stroke="#EAD2A8" strokeWidth={13} fill="none" strokeLinecap="round" opacity={0.72} />
              {/* Highlight ribbon */}
              <path d={seg1D}      stroke="#F7E6C4" strokeWidth={9}  fill="none" strokeLinecap="round" opacity={0.56} />
              <path d={seg2D}      stroke="#F7E6C4" strokeWidth={9}  fill="none" strokeLinecap="round" opacity={0.56} />
              <path d={loopBackD}  stroke="#F7E6C4" strokeWidth={7}  fill="none" strokeLinecap="round" opacity={0.48} />
              <path d={gardenExitLowerD} stroke="#F7E6C4" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.48} />
              <path d={gardenExitUpperD} stroke="#F7E6C4" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.40} />
              {/* Stepping stones */}
              {[
                // seg 1 — smooth meander through phonics band (no dip)
                { x: 408, y: 354 }, { x: 444, y: 338 }, { x: 484, y: 326 },
                { x: 524, y: 314 }, { x: 564, y: 302 }, { x: 604, y: 286 },
                { x: 644, y: 268 }, { x: 684, y: 250 }, { x: 724, y: 234 },
                { x: 764, y: 230 }, { x: 804, y: 240 }, { x: 844, y: 250 },
                { x: 884, y: 256 }, { x: 924, y: 240 }, { x: 964, y: 228 },
                { x: 1004, y: 232 }, { x: 1044, y: 250 }, { x: 1084, y: 260 },
                { x: 1124, y: 256 }, { x: 1164, y: 234 }, { x: 1204, y: 230 },
                { x: 1244, y: 240 }, { x: 1278, y: 262 },
                // seg 2 — drop to Story Rocks
                { x: 1298, y: 320 }, { x: 1268, y: 390 }, { x: 1238, y: 452 },
                { x: 1200, y: 510 }, { x: 1162, y: 546 }, { x: 1110, y: 582 },
                { x: 1052, y: 612 }, { x: 988, y: 636 }, { x: 918, y: 656 },
                { x: 848, y: 668 }, { x: 784, y: 680 }, { x: 740, y: 686 },
                // loop-back
                { x: 706, y: 696 }, { x: 628, y: 716 }, { x: 538, y: 724 },
                { x: 448, y: 720 }, { x: 364, y: 702 }, { x: 294, y: 678 },
                { x: 238, y: 646 }, { x: 196, y: 610 }, { x: 168, y: 570 },
                { x: 164, y: 524 }, { x: 186, y: 482 }, { x: 230, y: 450 },
                { x: 280, y: 424 }, { x: 332, y: 400 }, { x: 364, y: 382 },
                // garden exit
                { x: 1322, y: 263 }, { x: 1370, y: 260 }, { x: 1412, y: 260 },
              ].map((s, i) => (
                <g key={`rfph-${i}`}>
                  <ellipse cx={s.x + 1} cy={s.y + 2} rx={9} ry={5} fill="#000" opacity={0.17} />
                  <ellipse cx={s.x} cy={s.y} rx={9} ry={5} fill="#C9B489" stroke="#8A7050" strokeWidth={1.1} />
                  <ellipse cx={s.x - 2} cy={s.y - 1.2} rx={4} ry={1.6} fill="#E0CBA1" opacity={0.8} />
                </g>
              ))}
            </g>
          );
        })()}

        {/* ── Garden exit signpost at right edge ── */}
        <g transform="translate(1422, 258)" pointerEvents="none">
          <rect x={-3} y={-22} width={6} height={30} rx={2} fill="#8B5A2B" stroke="#5A3B1F" strokeWidth={1.2} />
          <rect x={-28} y={-34} width={56} height={16} rx={3} fill="#F5EBDC" stroke="#8B5A2B" strokeWidth={1.5} />
          <text x={-20} y={-22} fontSize={8} fill="#6b4423" fontWeight={600} fontFamily="serif">← garden</text>
        </g>

        {/* ── 11. SIGHT WORD GLADE — open clearing NW ──
             All three rf_dolch structures now at (140,400), (240,440), (160,490)
             — within the glade oval (x:80-340, y:360-510).
             Brook is at x:0-430, y:496-574, so rf_dolch_third at (160,490)
             is just ABOVE the brook — safe but close. Glade floor oval here. */}
        <ellipse cx={198} cy={438} rx={158} ry={110} fill="#E8D8A8" opacity={0.18} stroke="#B89A60" strokeWidth={1} strokeDasharray="4 6" />
        {/* Wildflower clusters in the glade — stays above brook at y<490 */}
        {[
          { x: 108, y: 440, c: '#C38D9E' }, { x: 128, y: 456, c: '#FFD93D' },
          { x: 152, y: 446, c: '#E8A87C' }, { x: 106, y: 460, c: '#95B88F' },
          { x: 314, y: 418, c: '#C38D9E' }, { x: 330, y: 434, c: '#FFD93D' },
          { x: 348, y: 420, c: '#E8A87C' }, { x: 310, y: 438, c: '#95B88F' },
          { x: 200, y: 472, c: '#C38D9E' }, { x: 218, y: 484, c: '#FFD93D' },
          { x: 258, y: 468, c: '#95B88F' }, { x: 242, y: 480, c: '#FFD93D' },
        ].map((f, i) => (
          <Flower key={`glade-fl-${i}`} x={f.x} y={f.y} size={12} />
        ))}
        {/* Framing trees around glade — all above y:490 to clear brook */}
        <Tree x={72}  y={358} size={66} variant={2} />
        <Tree x={358} y={328} size={60} variant={1} />
        <Tree x={70}  y={478} size={62} variant={3} />
        <Tree x={360} y={472} size={58} variant={2} />

        {/* ── 12. ANCIENT OAK — Morphology Grove anchor (NE) ──
             Centre at x:1382, y:440 — flanks the grove on the right. */}
        <g transform="translate(1382, 440)" pointerEvents="none">
          {/* root flare */}
          <path d="M -18 112 Q -28 100 -22 88 L -14 90 Q -16 102 -8 110 Z"
            fill="#8B5A2B" stroke="#5A3B1F" strokeWidth={1.5} strokeLinejoin="round" opacity={0.78} />
          <path d="M 18 112 Q 28 100 22 88 L 14 90 Q 16 102 8 110 Z"
            fill="#8B5A2B" stroke="#5A3B1F" strokeWidth={1.5} strokeLinejoin="round" opacity={0.78} />
          <path d="M 0 120 Q -4 108 -2 95 L 4 95 Q 4 108 2 120 Z" fill="#9B6535" opacity={0.48} />
          {/* Trunk */}
          <path
            d={`M -18 114 Q -24 72 -18 38 Q -14 16 -8 -5 L 8 -5
                Q 14 16 18 38 Q 24 72 18 114 Z`}
            fill="#8B5A2B" stroke="#5A3B1F" strokeWidth={2.2} strokeLinejoin="round"
          />
          <path d="M -8 80 Q -4 40 -2 0" stroke="#5A3B1F" strokeWidth={0.9} fill="none" opacity={0.40} />
          <path d="M 6 82 Q 4 42 2 0" stroke="#5A3B1F" strokeWidth={0.7} fill="none" opacity={0.30} />
          {/* Outer canopy */}
          <path
            d={`M -112 -12 Q -132 -68 -80 -108 Q -32 -140 18 -138
                Q 88 -126 118 -82 Q 132 -30 102 2 Q 52 22 2 18
                Q -64 22 -108 0 Q -120 -6 -112 -12 Z`}
            fill="#5C7E4F" stroke="#3F5A30" strokeWidth={2.2} strokeLinejoin="round"
          />
          {/* Mid-tone layer */}
          <path
            d={`M -88 -26 Q -102 -68 -58 -98 Q -18 -122 22 -118
                Q 75 -108 96 -72 Q 106 -30 78 -8 Q 32 8 -4 2
                Q -55 4 -88 -26 Z`}
            fill="#7BA46F"
          />
          {/* Highlight */}
          <path
            d={`M -42 -68 Q -22 -90 8 -90 Q 30 -84 34 -62 Q 28 -44 4 -46 Q -22 -48 -42 -68 Z`}
            fill="#A2C794" opacity={0.78}
          />
          <circle cx={-18} cy={-74} r={4} fill="#FFFFFF" opacity={0.33} />
          <circle cx={14} cy={-55} r={3} fill="#FFFFFF" opacity={0.22} />
        </g>

        {/* Grove framing trees */}
        <Tree x={1182} y={428} size={60} variant={2} />
        <PineTree x={1320} y={432} size={56} />

        {/* ── 13. STORY ROCKS — semicircle of mossy boulders ──
             rf_longer_words (660,620), rf_sentence (800,660), rf_paragraph (740,720).
             Boulders frame the clearing, not on structures. */}
        <g pointerEvents="none">
          {[
            { x: 598, y: 648, rx: 25, ry: 14 },
            { x: 618, y: 696, rx: 20, ry: 11 },
            { x: 616, y: 738, rx: 21, ry: 12 },
            { x: 706, y: 608, rx: 18, ry: 10 },
            { x: 768, y: 606, rx: 22, ry: 12 },
            { x: 856, y: 638, rx: 20, ry: 12 },
            { x: 870, y: 688, rx: 23, ry: 13 },
            { x: 850, y: 736, rx: 17, ry: 10 },
          ].map((r, i) => (
            <g key={`srk-${i}`}>
              <ellipse cx={r.x + 2} cy={r.y + 4} rx={r.rx} ry={r.ry * 0.44} fill="#000" opacity={0.18} />
              <ellipse cx={r.x} cy={r.y} rx={r.rx} ry={r.ry} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.5} />
              <ellipse cx={r.x - 2} cy={r.y - 2} rx={r.rx * 0.7} ry={r.ry * 0.55} fill="#A89D8A" />
              <ellipse cx={r.x} cy={r.y - 4} rx={r.rx * 0.82} ry={r.ry * 0.36} fill="#7BA46F" opacity={0.80} />
              <circle cx={r.x - r.rx * 0.36} cy={r.y - r.ry * 0.16} r={1.3} fill="#8FB67A" />
            </g>
          ))}
        </g>

        {/* ── 14. FRAMING TREES ──
             RULE: no tree within 60px of any structure position.
             RULE: no tree in brook zone (x:0-430, y:496-580).
             All x values 30px+ from scene edges. */}

        {/* South glade edge — must clear brook zone so x>430 or y<490 */}
        <Tree x={494} y={482} size={54} variant={1} />

        {/* Below Phonics Path band — between structure positions */}
        <Tree x={534} y={454} size={52} variant={2} />
        <Tree x={756} y={464} size={50} variant={3} />
        <Tree x={956} y={454} size={50} variant={1} />

        {/* Between Story Rocks and Morphology Grove */}
        <Tree x={1056} y={506} size={64} variant={2} />

        {/* Bottom corners — all outside brook zone */}
        <Tree x={60}   y={638} size={70} variant={2} />
        <Tree x={316}  y={648} size={56} variant={3} />
        <Tree x={1340} y={674} size={64} variant={1} />
        <PineTree x={1382} y={668} size={70} />

        {/* ── 15. DAPPLED LIGHT SHAFTS ── */}
        <g opacity={0.38} pointerEvents="none">
          {[0, 1, 2, 3, 4].map(i => (
            <polygon
              key={`rfsh-${i}`}
              points={`${320 + i * 200},70 ${380 + i * 200},70 ${450 + i * 200 + 60},${H * 0.62} ${270 + i * 200 + 60},${H * 0.62}`}
              fill="url(#rfShaft)"
              opacity={0.34 - i * 0.05}
            />
          ))}
        </g>

        {/* ── 16. GRASS TUFTS + FLOWERS — forest floor only (y > 630) ── */}
        <GrassTuft x={258} y={748} size={22} />
        <GrassTuft x={430} y={762} size={20} />
        <GrassTuft x={556} y={768} size={22} />
        <GrassTuft x={938} y={758} size={20} />
        <GrassTuft x={1120} y={766} size={22} />
        <GrassTuft x={1264} y={752} size={20} />
        <Flower x={196} y={742} size={14} />
        <Flower x={356} y={752} size={13} />
        <Flower x={484} y={758} size={14} />
        <Flower x={628} y={762} size={13} />
        <Flower x={864} y={754} size={14} />
        <Flower x={1002} y={762} size={13} />
        <Flower x={1194} y={750} size={14} />
        <Flower x={1312} y={760} size={13} />

        {/* ── Foreground grass silhouette — depth frame ── */}
        <g opacity={0.44} pointerEvents="none">
          <path
            d={`M 0 ${H} L 0 ${H - 16} Q 100 ${H - 28} 200 ${H - 18} T 400 ${H - 22} T 600 ${H - 16} T 800 ${H - 24} T 1000 ${H - 18} T 1200 ${H - 26} T ${W} ${H - 16} L ${W} ${H} Z`}
            fill="#5C7E4F"
          />
          {[58, 178, 322, 482, 642, 812, 982, 1152, 1322, 1422].map((gx, i) => (
            <path
              key={`rffg-${i}`}
              d={`M ${gx} ${H - 14} Q ${gx + (i % 2 === 0 ? 4 : -4)} ${H - 34} ${gx + (i % 2 === 0 ? 6 : -6)} ${H - 52}`}
              stroke="#4F6F42" strokeWidth={2} fill="none" strokeLinecap="round"
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
            Same locked/unlocked design as Math Mountain:
            LOCKED = quiet dashed circle + faint emoji (no plinth block)
            UNLOCKED = bespoke illustration or emoji with drop-shadow (no plinth) */}
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
                  <g>
                    <circle r={UNIFORM * 0.52} fill="rgba(160,180,140,0.20)" stroke="rgba(107,130,80,0.32)" strokeWidth={1.5} strokeDasharray="4 3" />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={18}
                      y={0}
                      fill="rgba(79,111,66,0.28)"
                    >
                      {s.themeEmoji}
                    </text>
                  </g>
                )}

                {/* Label pill */}
                <rect
                  x={-50} y={LABEL_Y} width={100} height={14} rx={4}
                  fill={completed ? 'rgba(255,217,61,0.85)' : unlocked ? 'rgba(255,250,242,0.85)' : 'rgba(218,232,214,0.68)'}
                />
                <text
                  x={0} y={LABEL_Y + 10} textAnchor="middle"
                  fontSize={9} fontWeight={600}
                  fill={unlocked ? '#6b4423' : 'rgba(79,111,66,0.55)'}
                >
                  {s.label}
                </text>

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
