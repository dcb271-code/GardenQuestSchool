// app/(child)/garden/reading-forest/ReadingForestScene.tsx
//
// Reading Forest — hand-illustrated SVG, same vocabulary as the central garden.
//
// Composition (back to front):
//   1. Warm forest-filtered sky — amber-cream upper band that fades into
//      a deep forest-green lower band, suggesting light coming through canopy
//   2. Far tree-line silhouettes — dark, blended band at the skyline
//   3. Mid tree-line — clearer shapes, trunks visible, painted as proper
//      organic forms (not ellipses), using Tree + PineTree components
//   4. Mist band — thin atmospheric white wash between tree-line and floor
//   5. Forest floor hill layers — two gentle slopes, darker as they come forward
//   6. Cluster region tints:
//        Sight Word Glade (NW, x:80-340, y:280-500) — warm amber clearing
//        Phonics Path (central band) — no tint, the path IS the demarcation
//        Morphology Grove (NE, x:1060-1430, y:400-650) — deep forest-green wash
//        Story Rocks (centre-back, x:580-900, y:580-760) — soft stone-grey wash
//   7. Brook — flows lower-left, enters from left edge ~y:500, arcs through
//      x:0-420, exits bottom-left. Kept entirely below y:490 so it never
//      clips into Phonics Path (y:220-360) or Sight Word Glade (y:280-480).
//      Trees/flora at x:0-420 must be above y:490 or to the right of x:480.
//   8. Phonics Path — ONE continuous stepping-stone trail starting at the
//      Sight Word Glade edge, winding east through phonics structures,
//      dropping SE toward Morphology Grove, looping back SW to Story Rocks,
//      and terminating at the central clearing near the boulder semicircle.
//   9. Glade clearing — open oval in the NW (Sight Word Glade), surrounded
//      by framing trees, filled with wildflower clusters
//  10. Ancient oak — anchors the Morphology Grove (NE), organic multi-tone
//      canopy, thick trunk, root flare, lighter than the central garden oaks
//  11. Story Rocks — five mossy boulders arranged in a deliberate semicircle
//      at ~x:660-850, y:640-720 (structures at x:660-800, y:620-720)
//  12. Framing trees — distinct lines, NEVER overlapping path or structures.
//      No tree centres within brook area (x:0-420, y:490-620)
//  13. Dappled light shafts through canopy (mixBlendMode screen)
//  14. Grass tufts + flowers at forest floor only (y > 620)

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
// when the underlying skill is the same or thematically equivalent.
const ILLUSTRATION_ALIAS: Record<string, string> = {
  rf_dolch_first:    'reading_bee_words',      // sight words = bee words
  rf_dolch_second:   'reading_bee_words',
  rf_dolch_third:    'reading_bee_words',
  rf_digraphs:       'reading_digraph_bridge',
  rf_initial_blends: 'reading_blending_beach',
  rf_longer_words:   'reading_readaloud_log',  // read-aloud = reading log
  rf_sentence:       'reading_book_stump',
  rf_paragraph:      'reading_book_stump',
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
            <stop offset="18%" stopColor="#E0DDB5" />
            <stop offset="38%" stopColor="#C0D9A0" />
            <stop offset="62%" stopColor="#8EBF85" />
            <stop offset="100%" stopColor="#6B8E5A" />
          </linearGradient>
          {/* Canopy dapple overlay — warm circle at the top-centre */}
          <radialGradient id="rfDappleTop" cx="50%" cy="8%" r="55%">
            <stop offset="0%" stopColor="#FFF5D0" stopOpacity="0.45" />
            <stop offset="65%" stopColor="#FFF5D0" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#FFF5D0" stopOpacity="0" />
          </radialGradient>
          {/* Light shafts */}
          <linearGradient id="rfShaft" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#FFF5D0" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#FFF5D0" stopOpacity="0" />
          </linearGradient>
          {/* Glade clearing tint — warm amber oval, NW */}
          <radialGradient id="rfGladeTint" cx="15%" cy="50%" r="22%">
            <stop offset="0%" stopColor="#F9EDCC" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#F9EDCC" stopOpacity="0" />
          </radialGradient>
          {/* Morphology Grove tint — deep forest-green, NE */}
          <radialGradient id="rfGroveTint" cx="86%" cy="65%" r="25%">
            <stop offset="0%" stopColor="#4F6F42" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4F6F42" stopOpacity="0" />
          </radialGradient>
          {/* Story Rocks clearing tint — warm stone, centre-bottom */}
          <radialGradient id="rfRocksTint" cx="50%" cy="88%" r="22%">
            <stop offset="0%" stopColor="#C8BCAA" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#C8BCAA" stopOpacity="0" />
          </radialGradient>
          {/* Brook water */}
          <linearGradient id="rfBrookGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C4DFE4" />
            <stop offset="100%" stopColor="#92BFCA" />
          </linearGradient>
        </defs>

        {/* ── 1. SKY + CANOPY WASH ── */}
        <rect width={W} height={H} fill="url(#rfSky)" />
        <rect width={W} height={H} fill="url(#rfDappleTop)" />

        {/* ── 2. FAR TREE-LINE — blended dark silhouette at the skyline ──
             A single organic band with varied crenellations.
             Kept at y:85-180 — well above Sight Word Glade (y:280+). */}
        <g opacity={0.55}>
          <path
            d={`M 0 180 Q 60 148 110 158 Q 145 130 175 148 Q 210 118 250 140 Q 285 108 320 132
                Q 358 104 395 128 Q 430 98 468 122 Q 510 95 552 118 Q 592 100 630 118
                Q 668 90 708 112 Q 748 96 788 114 Q 828 92 868 110 Q 910 96 948 114
                Q 990 100 1028 120 Q 1068 104 1110 124 Q 1148 106 1190 128 Q 1228 108 1272 130
                Q 1310 112 1350 138 Q 1388 118 1420 142 Q 1440 148 1440 160 L 1440 180 L 0 180 Z`}
            fill="#4F6F42"
          />
        </g>

        {/* ── 3. MID TREE-LINE — clearer shapes, some trunks visible ──
             Rendered as pairs of Tree / PineTree at specific x coords.
             ALL placed at y:220-265 — well clear of Glade (y:280+)
             and Phonics Path (y:220-360). These read as distant canopy,
             not foreground objects. */}
        <Tree  x={42}   y={248} size={78} variant={1} />
        <PineTree x={105}  y={238} size={72} />
        <PineTree x={168}  y={252} size={66} />
        <Tree  x={232}  y={242} size={72} variant={2} />
        <PineTree x={302}  y={250} size={64} />
        <Tree  x={368}  y={244} size={70} variant={3} />
        <PineTree x={438}  y={256} size={60} />
        {/* gap here — the Phonics Path begins at x:480 — leave open */}
        <PineTree x={1250} y={250} size={64} />
        <Tree  x={1318} y={244} size={70} variant={2} />
        <PineTree x={1388} y={252} size={72} />
        <Tree  x={1430} y={244} size={68} variant={1} />

        {/* ── 4. MIST BAND — atmospheric wash between tree-line and floor ── */}
        <path
          d={`M 0 ${H * 0.36} Q 360 ${H * 0.34} 720 ${H * 0.37} T ${W} ${H * 0.36}
              L ${W} ${H * 0.43} L 0 ${H * 0.43} Z`}
          fill="#FFFFFF" opacity={0.28}
        />

        {/* ── 5. FOREST FLOOR HILL LAYERS ── */}
        {/* Back slope — mid-sage */}
        <path
          d={`M 0 ${H * 0.50} Q 240 ${H * 0.45} 500 ${H * 0.49} T 980 ${H * 0.46} T ${W} ${H * 0.50} L ${W} ${H * 0.64} L 0 ${H * 0.64} Z`}
          fill="#7BA46F" opacity={0.52}
        />
        {/* Near slope — deeper sage */}
        <path
          d={`M 0 ${H * 0.60} Q 280 ${H * 0.55} 580 ${H * 0.59} T 1060 ${H * 0.57} T ${W} ${H * 0.61} L ${W} ${H * 0.75} L 0 ${H * 0.75} Z`}
          fill="#6B8E5A" opacity={0.58}
        />

        {/* ── 6. CLUSTER REGION TINTS ── */}
        <rect width={W} height={H} fill="url(#rfGladeTint)" />
        <rect width={W} height={H} fill="url(#rfGroveTint)" />
        <rect width={W} height={H} fill="url(#rfRocksTint)" />

        {/* ── 7. BROOK — lower-left only ──
             Flows along the bottom-left. Enters from left edge at y:510,
             arcs gently to exit at bottom-left corner.
             Max x extent: ~430, y range: 500-580.
             Brook area: x:0-430, y:490-620 — kept clear of all tree/flora. */}
        <g pointerEvents="none">
          {/* wet-earth bank */}
          <path
            d={`M 0 512
                Q 55 498 120 508 Q 200 520 290 514 Q 358 510 400 524
                Q 432 535 428 548 Q 422 562 388 556 Q 320 548 240 554
                Q 155 560 80 568 Q 32 576 0 568 Z`}
            fill="#6B8E5A" opacity={0.30}
          />
          {/* primary water body */}
          <path
            d={`M 0 516
                Q 55 504 120 513 Q 200 524 290 518 Q 355 514 396 527
                Q 424 536 420 546 Q 415 556 384 550 Q 318 543 240 549
                Q 155 555 80 563 Q 34 570 0 563 Z`}
            fill="#B2D4D9"
          />
          {/* depth channel */}
          <path
            d="M 30 528 Q 110 518 210 530 Q 300 540 390 535"
            stroke="#8FB7C2" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.65}
          />
          {/* shimmer */}
          <path d="M 55 524 Q 78 520 100 526" stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.7} strokeLinecap="round" />
          <path d="M 170 530 Q 192 526 212 532" stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.65} strokeLinecap="round" />
          <path d="M 285 530 Q 308 526 330 533" stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.68} strokeLinecap="round" />
          {/* moss-topped boulders */}
          <g>
            <ellipse cx={145} cy={518} rx={14} ry={8} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.5} />
            <ellipse cx={143} cy={514} rx={10} ry={4} fill="#A89D8A" />
            <ellipse cx={145} cy={512} rx={12} ry={3} fill="#7BA46F" opacity={0.9} />
          </g>
          <g>
            <ellipse cx={258} cy={524} rx={11} ry={6.5} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.4} />
            <ellipse cx={256} cy={520} rx={8} ry={3.5} fill="#A89D8A" />
            <ellipse cx={258} cy={518} rx={9} ry={2.5} fill="#7BA46F" opacity={0.9} />
          </g>
          {/* bank grass tufts at brook level */}
          {[[18, 540], [108, 548], [220, 540], [370, 546]].map(([gx, gy], i) => (
            <g key={`rfbt-${i}`} transform={`translate(${gx},${gy})`}>
              <path d="M 0 0 Q -1 -6 -2 -10" stroke="#5C7E4F" strokeWidth={1.3} fill="none" strokeLinecap="round" />
              <path d="M 0 0 Q 1 -7 3 -11" stroke="#5C7E4F" strokeWidth={1.3} fill="none" strokeLinecap="round" />
              <path d="M 0 0 Q 2 -5 5 -9" stroke="#5C7E4F" strokeWidth={1.2} fill="none" strokeLinecap="round" />
            </g>
          ))}
        </g>

        {/* ── 8. PHONICS PATH ──
             Redesigned as a single continuous meander that visits all four cluster
             regions instead of stopping mid-forest.

             Route:
               • Starts at the Sight Word Glade clearing edge (x:380, y:368)
               • Winds east through the Phonics Path structures (y:220-360 band)
               • Drops south-east toward the Morphology Grove (passes near the
                 ancient oak at x:1382, threading between grove structures)
               • Loops back south-west to Story Rocks (x:730, y:680)
               • Terminates at the central clearing near the boulder semicircle

             Phonics structures it visits:
               rf_digraphs      x:480,  y:360
               rf_initial_blends x:580, y:280
               rf_silent_e      x:700,  y:220
               rf_vowel_ee_ea   x:800,  y:260
               rf_vowel_ai_ay   x:900,  y:220
               rf_vowel_oa_ow   x:1000, y:260
               rf_r_controlled  x:1100, y:220
               rf_diphthongs    x:1200, y:260
             Then loops down to Morphology Grove (x:1140-1280, y:460-580)
             and returns to Story Rocks (x:660-800, y:620-720).

             The path is split into two bezier segments joined at the
             diphthong cove (x:1200, y:260) for a natural meander look. */}
        {(() => {
          // Segment 1: Glade edge → through phonics structures → Diphthong Cove
          const seg1D = `M 380 368
            C 420 350, 448 350, 480 358
            C 510 368, 545 300, 580 285
            C 620 265, 660 234, 700 225
            C 740 216, 768 248, 800 255
            C 836 264, 868 226, 900 222
            C 934 220, 968 252, 1000 258
            C 1036 268, 1068 226, 1100 222
            C 1136 220, 1168 252, 1200 258`;
          // Segment 2: Diphthong Cove → drops SE through Morphology Grove →
          // loops SW back to Story Rocks clearing
          const seg2D = `M 1200 258
            C 1230 268, 1258 350, 1220 420
            C 1185 490, 1160 510, 1140 540
            C 1115 570, 1050 600, 980 630
            C 900 660, 830 670, 780 678
            C 748 686, 720 688, 730 680`;
          return (
            <g pointerEvents="none">
              {/* Shadow */}
              <path d={seg1D} stroke="#A99878" strokeWidth={38} fill="none" strokeLinecap="round" opacity={0.20} />
              <path d={seg2D} stroke="#A99878" strokeWidth={38} fill="none" strokeLinecap="round" opacity={0.20} />
              {/* Surface */}
              <path d={seg1D} stroke="#EAD2A8" strokeWidth={26} fill="none" strokeLinecap="round" opacity={0.86} />
              <path d={seg2D} stroke="#EAD2A8" strokeWidth={26} fill="none" strokeLinecap="round" opacity={0.86} />
              {/* Highlight */}
              <path d={seg1D} stroke="#F7E6C4" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.58} />
              <path d={seg2D} stroke="#F7E6C4" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.58} />
              {/* Stepping stones — seg 1 (phonics band) */}
              {[
                { x: 415, y: 362 }, { x: 450, y: 354 }, { x: 480, y: 356 },
                { x: 525, y: 304 }, { x: 568, y: 284 }, { x: 612, y: 256 },
                { x: 655, y: 234 }, { x: 698, y: 224 }, { x: 742, y: 238 },
                { x: 786, y: 255 }, { x: 830, y: 238 }, { x: 872, y: 224 },
                { x: 916, y: 222 }, { x: 958, y: 248 }, { x: 1000, y: 257 },
                { x: 1044, y: 248 }, { x: 1085, y: 226 }, { x: 1130, y: 222 },
                { x: 1172, y: 248 }, { x: 1198, y: 256 },
                // seg 2 (loop down to Story Rocks)
                { x: 1225, y: 310 }, { x: 1230, y: 380 }, { x: 1205, y: 444 },
                { x: 1165, y: 498 }, { x: 1110, y: 542 }, { x: 1040, y: 584 },
                { x: 968, y: 618 }, { x: 900, y: 646 }, { x: 835, y: 664 },
                { x: 780, y: 676 }, { x: 740, y: 682 },
              ].map((s, i) => (
                <g key={`rfph-${i}`}>
                  <ellipse cx={s.x + 1} cy={s.y + 2} rx={9} ry={5} fill="#000" opacity={0.18} />
                  <ellipse cx={s.x} cy={s.y} rx={9} ry={5} fill="#C9B489" stroke="#8A7050" strokeWidth={1.1} />
                  <ellipse cx={s.x - 2} cy={s.y - 1.2} rx={4} ry={1.7} fill="#E0CBA1" opacity={0.8} />
                </g>
              ))}
            </g>
          );
        })()}

        {/* ── Tiny wooden plank bridge at rf_digraphs (x:480, y:360) ──
             Hand-drawn, three planks across a shallow gap. NOT clip-art.
             Placed slightly below the path stones so it reads as
             the path crossing a tiny rivulet. */}
        <g transform="translate(478, 362)" pointerEvents="none">
          {/* shadow under bridge */}
          <ellipse cx={0} cy={16} rx={28} ry={4} fill="#000" opacity={0.14} />
          {/* side rails */}
          <path d="M -22 -6 L -22 14" stroke="#6B4423" strokeWidth={2.5} strokeLinecap="round" />
          <path d="M  22 -6 L  22 14" stroke="#6B4423" strokeWidth={2.5} strokeLinecap="round" />
          {/* top rail */}
          <path d="M -22 -6 L 22 -6" stroke="#8B5A2B" strokeWidth={2} strokeLinecap="round" />
          {/* planks — 4 planks across */}
          {[-14, -5, 4, 13].map((px, i) => (
            <rect key={`plank-${i}`} x={px} y={-2} width={6} height={14} rx={1}
              fill="#A87C50" stroke="#5A3B1F" strokeWidth={1} />
          ))}
          {/* plank highlight */}
          <rect x={-14} y={-2} width={28} height={2.5} rx={1} fill="#C9A070" opacity={0.5} />
          {/* tiny trickle beneath */}
          <path d="M -18 18 Q 0 14 18 18" stroke="#8FB7C2" strokeWidth={1.5} fill="none" opacity={0.7} strokeLinecap="round" />
        </g>

        {/* ── 9. SIGHT WORD GLADE — open clearing, NW ──
             The glade is an open oval at roughly x:80-380, y:320-520.
             Sight Word structures sit within it (x:140,y:400 / x:280,y:380 / x:200,y:480).
             We paint the clearing floor lighter (done via rfGladeTint radial),
             then surround it with framing trees and wildflower clusters. */}
        {/* Glade floor oval — slightly lighter earth tone */}
        <ellipse cx={215} cy={430} rx={168} ry={115} fill="#E8D8A8" opacity={0.20} stroke="#B89A60" strokeWidth={1} strokeDasharray="4 6" />
        {/* Wildflower clusters IN the glade — at glade level, NOT sky level */}
        {[
          { x: 112, y: 440, c: '#C38D9E' }, { x: 130, y: 460, c: '#FFD93D' },
          { x: 158, y: 448, c: '#E8A87C' }, { x: 108, y: 464, c: '#95B88F' },
          { x: 310, y: 420, c: '#C38D9E' }, { x: 330, y: 438, c: '#FFD93D' },
          { x: 348, y: 424, c: '#E8A87C' }, { x: 315, y: 442, c: '#95B88F' },
          { x: 168, y: 500, c: '#C38D9E' }, { x: 185, y: 515, c: '#FFD93D' },
          { x: 200, y: 505, c: '#E8A87C' }, { x: 220, y: 516, c: '#C38D9E' },
          { x: 255, y: 490, c: '#95B88F' }, { x: 240, y: 504, c: '#FFD93D' },
        ].map((f, i) => (
          <Flower key={`glade-fl-${i}`} x={f.x} y={f.y} size={13} />
        ))}
        {/* Framing trees around the glade perimeter — all above y:490 to clear brook */}
        <Tree x={72} y={360} size={68} variant={2} />
        <Tree x={360} y={330} size={62} variant={1} />
        {/* South glade trees moved up-bank (clear of brook area x:0-430, y:490-620) */}
        <Tree x={68} y={482} size={64} variant={3} />
        <Tree x={368} y={478} size={60} variant={2} />

        {/* ── 10. ANCIENT OAK — Morphology Grove anchor (NE) ──
             Morphology Grove structures: x:1100-1280, y:460-580.
             Oak centre at x:1380, y:440 — flanks the grove on the right
             without overlapping any structure. Multi-tone canopy,
             organic trunk with root flare, lighter colours than the
             central garden's oaks to feel like a different species. */}
        <g transform="translate(1382, 440)" pointerEvents="none">
          {/* root flare — three visible buttress roots */}
          <path d="M -18 112 Q -28 100 -22 88 L -14 90 Q -16 102 -8 110 Z"
            fill="#8B5A2B" stroke="#5A3B1F" strokeWidth={1.5} strokeLinejoin="round" opacity={0.8} />
          <path d="M 18 112 Q 28 100 22 88 L 14 90 Q 16 102 8 110 Z"
            fill="#8B5A2B" stroke="#5A3B1F" strokeWidth={1.5} strokeLinejoin="round" opacity={0.8} />
          <path d="M 0 120 Q -4 108 -2 95 L 4 95 Q 4 108 2 120 Z"
            fill="#9B6535" opacity={0.5} />
          {/* Trunk — thick, slightly asymmetric S-curve, warm bark */}
          <path
            d={`M -18 114 Q -24 72 -18 38 Q -14 16 -8 -5 L 8 -5
                Q 14 16 18 38 Q 24 72 18 114 Z`}
            fill="#8B5A2B" stroke="#5A3B1F" strokeWidth={2.2} strokeLinejoin="round"
          />
          {/* Bark striations */}
          <path d="M -8 80 Q -4 40 -2 0" stroke="#5A3B1F" strokeWidth={0.9} fill="none" opacity={0.42} />
          <path d="M 6 82 Q 4 42 2 0" stroke="#5A3B1F" strokeWidth={0.7} fill="none" opacity={0.32} />
          {/* Outer canopy — dark hull, lighter than central garden oak */}
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
          {/* Highlight — catches light from upper-left */}
          <path
            d={`M -42 -68 Q -22 -90 8 -90 Q 30 -84 34 -62 Q 28 -44 4 -46 Q -22 -48 -42 -68 Z`}
            fill="#A2C794" opacity={0.80}
          />
          {/* Small dapple dots */}
          <circle cx={-18} cy={-74} r={4} fill="#FFFFFF" opacity={0.35} />
          <circle cx={14} cy={-55} r={3} fill="#FFFFFF" opacity={0.25} />
        </g>

        {/* Additional grove trees flanking the oak */}
        <Tree x={1182} y={428} size={62} variant={2} />
        <PineTree x={1438} y={438} size={58} />

        {/* ── 11. STORY ROCKS — semicircle of mossy boulders ──
             Structures: rf_longer_words x:660,y:620 | rf_sentence x:800,y:660
             rf_paragraph x:740,y:720
             Boulders are placed AROUND the structures in a loose
             semicircle, not on top of them. They frame the "sitting
             circle" that the story structures occupy. */}
        <g pointerEvents="none">
          {[
            // Left arc of semicircle
            { x: 598, y: 652, rx: 26, ry: 15 },
            { x: 620, y: 700, rx: 20, ry: 12 },
            { x: 618, y: 742, rx: 22, ry: 13 },
            // Top of arc (behind the clearing)
            { x: 708, y: 608, rx: 18, ry: 10 },
            { x: 770, y: 606, rx: 22, ry: 12 },
            // Right arc
            { x: 858, y: 640, rx: 20, ry: 12 },
            { x: 872, y: 690, rx: 24, ry: 14 },
            { x: 852, y: 740, rx: 18, ry: 10 },
          ].map((r, i) => (
            <g key={`srk-${i}`}>
              <ellipse cx={r.x + 2} cy={r.y + 4} rx={r.rx} ry={r.ry * 0.45} fill="#000" opacity={0.20} />
              <ellipse cx={r.x} cy={r.y} rx={r.rx} ry={r.ry} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.5} />
              <ellipse cx={r.x - 2} cy={r.y - 2} rx={r.rx * 0.7} ry={r.ry * 0.55} fill="#A89D8A" />
              <ellipse cx={r.x} cy={r.y - 4} rx={r.rx * 0.82} ry={r.ry * 0.38} fill="#7BA46F" opacity={0.82} />
              <circle cx={r.x - r.rx * 0.38} cy={r.y - r.ry * 0.18} r={1.4} fill="#8FB67A" />
            </g>
          ))}
        </g>

        {/* ── 12. FRAMING TREES ──
             Placed in distinct clusters, never overlapping path or structures.
             CRITICAL: no tree centre within brook area x:0-430, y:490-620.

             Key structural positions to avoid:
               rf_digraphs x:480,y:360 — no tree within 60px
               rf_initial_blends x:580,y:280 — no tree within 60px
               Morphology structures x:1100-1280, y:460-580 — trees only at flanks
               Story Rocks structures x:660-800, y:620-720 — trees at x<600 or x>870

             Framing clusters:
               • Left mid (flanking Glade on its south side): glade trees at y<490 above
               • South-left safe zone: x>430 or y<490
               • Centre (flanking Phonics Path from below): x:485-1000, y:460-510
               • Right mid (between Grove and story area): x:1055-1070, y:500-580
               • Bottom corners: below y:625 */}

        {/* South of glade — moved to x:490+ to clear brook zone */}
        <Tree x={492} y={488} size={56} variant={1} />

        {/* Framing the south side of Phonics Path — trees at ~y:460-510, between path structures */}
        {/* Gap between rf_digraphs(x:480) and rf_initial_blends(x:580): Trees at x:530 */}
        <Tree x={532} y={460} size={54} variant={2} />
        {/* Gap between rf_silent_e(x:700) and rf_vowel_ee_ea(x:800): Trees at x:752 */}
        <Tree x={754} y={470} size={50} variant={3} />
        {/* Gap between rf_vowel_ai_ay(x:900) and rf_vowel_oa_ow(x:1000): Trees at x:952 */}
        <Tree x={954} y={460} size={52} variant={1} />

        {/* Between Story Rocks and Morphology Grove */}
        <Tree x={1058} y={508} size={66} variant={2} />

        {/* Bottom corners — forest floor framing (all outside brook zone) */}
        <Tree x={22} y={638} size={72} variant={2} />
        <Tree x={315} y={650} size={58} variant={3} />
        <Tree x={1342} y={676} size={66} variant={1} />
        <PineTree x={1432} y={668} size={72} />

        {/* ── 13. DAPPLED LIGHT SHAFTS ──
             4-5 soft beams angling from upper-centre through the canopy.
             Only above the floor layer — they fade before reaching y:500. */}
        <g opacity={0.4} pointerEvents="none">{/* no mixBlendMode — Firefox compat */}
          {[0, 1, 2, 3, 4].map(i => (
            <polygon
              key={`rfsh-${i}`}
              points={`${320 + i * 200},72 ${380 + i * 200},72 ${450 + i * 200 + 60},${H * 0.62} ${270 + i * 200 + 60},${H * 0.62}`}
              fill="url(#rfShaft)"
              opacity={0.35 - i * 0.05}
            />
          ))}
        </g>

        {/* ── 14. GRASS TUFTS + FLOWERS — forest floor only (y > 620) ── */}
        <GrassTuft x={258} y={748} size={22} />
        <GrassTuft x={430} y={762} size={20} />
        <GrassTuft x={554} y={768} size={22} />
        <GrassTuft x={936} y={758} size={20} />
        <GrassTuft x={1118} y={766} size={22} />
        <GrassTuft x={1262} y={752} size={20} />
        <Flower x={198} y={742} size={15} />
        <Flower x={356} y={752} size={14} />
        <Flower x={482} y={758} size={15} />
        <Flower x={626} y={762} size={14} />
        <Flower x={862} y={754} size={15} />
        <Flower x={1000} y={762} size={14} />
        <Flower x={1192} y={750} size={15} />
        <Flower x={1310} y={760} size={14} />

        {/* ── Foreground grass silhouette — depth-frame along bottom ── */}
        <g opacity={0.45} pointerEvents="none">
          <path
            d={`M 0 ${H} L 0 ${H - 16} Q 100 ${H - 28} 200 ${H - 18} T 400 ${H - 22} T 600 ${H - 16} T 800 ${H - 24} T 1000 ${H - 18} T 1200 ${H - 26} T ${W} ${H - 16} L ${W} ${H} Z`}
            fill="#5C7E4F"
          />
          {[55, 175, 320, 480, 640, 810, 980, 1150, 1320, 1420].map((gx, i) => (
            <path
              key={`rffg-${i}`}
              d={`M ${gx} ${H - 14} Q ${gx + (i % 2 === 0 ? 4 : -4)} ${H - 34} ${gx + (i % 2 === 0 ? 6 : -6)} ${H - 52}`}
              stroke="#4F6F42" strokeWidth={2} fill="none" strokeLinecap="round"
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

        {/* ── STRUCTURES ──
            Same uniform-size treatment as Math Mountain — see comment
            there for rationale. */}
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
                <g opacity={unlocked ? 1 : 0.35} style={{
                  filter: completed
                    ? 'drop-shadow(0 0 6px rgba(255, 217, 61, 0.6))'
                    : unlocked
                      ? 'drop-shadow(0 1px 2px rgba(107,68,35,0.4))'
                      : 'grayscale(0.7)',
                }}>
                  {drawn ?? <PlinthEmoji emoji={s.themeEmoji} size={UNIFORM} />}
                </g>
                <rect
                  x={-50} y={LABEL_Y} width={100} height={14} rx={4}
                  fill={completed ? 'rgba(255,217,61,0.85)' : 'rgba(255,250,242,0.85)'}
                />
                <text
                  x={0} y={LABEL_Y + 10} textAnchor="middle"
                  fontSize={9} fontWeight={600} fill="#6b4423"
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
