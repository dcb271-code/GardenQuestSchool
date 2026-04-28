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

        {/* ── 6. LAKE — upper-mid water feature ──
             Centered at (380, 470), rx:108 ry:42. Structures sit AROUND
             it, not inside: Quiet Pond at the western edge as the lily,
             Berry Basket on the NE bank, Big Falls is the southern
             waterfall outflow, Twin Bonds on the meadow above. */}
        <g pointerEvents="none">
          {/* outer wet-earth bank */}
          <ellipse cx={380} cy={470} rx={120} ry={50} fill="#6B8E5A" opacity={0.30} />
          {/* primary water body */}
          <ellipse cx={380} cy={470} rx={108} ry={42} fill="#A8CDD2" />
          {/* deeper center */}
          <ellipse cx={380} cy={470} rx={84} ry={30} fill="#92BEC4" opacity={0.55} />
          {/* lily pads */}
          <ellipse cx={350} cy={462} rx={11} ry={5.5} fill="#5C8A5A" stroke="#3F5A30" strokeWidth={1} opacity={0.86} />
          <ellipse cx={348} cy={460} rx={3.5} ry={1.8} fill="#7BA46F" />
          <ellipse cx={430} cy={458} rx={9} ry={4.5} fill="#5C8A5A" stroke="#3F5A30" strokeWidth={1} opacity={0.86} />
          <ellipse cx={428} cy={456} rx={3} ry={1.6} fill="#7BA46F" />
          <ellipse cx={400} cy={486} rx={8} ry={4} fill="#5C8A5A" stroke="#3F5A30" strokeWidth={1} opacity={0.86} />
          {/* shimmer ripples */}
          <path d="M 372 466 Q 384 462 396 466" stroke="#FFFFFF" strokeWidth={1.1} fill="none" opacity={0.66} strokeLinecap="round" />
          <path d="M 410 478 Q 422 474 434 478" stroke="#FFFFFF" strokeWidth={1.1} fill="none" opacity={0.6} strokeLinecap="round" />
          <path d="M 354 482 Q 364 478 374 482" stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.5} strokeLinecap="round" />
          {/* small fish silhouettes */}
          <path d="M 410 470 q 4 -3 8 0 q -2 2 -2 4 q -4 0 -6 -4 z" fill="#5C7E4F" opacity={0.5} />
          <path d="M 340 488 q 4 -3 8 0 q -2 2 -2 4 q -4 0 -6 -4 z" fill="#5C7E4F" opacity={0.42} />
          {/* moss-topped boulders on the lake banks */}
          <ellipse cx={278} cy={478} rx={10} ry={5.5} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.2} />
          <ellipse cx={276} cy={475} rx={7} ry={2.4} fill="#A89D8A" />
          <ellipse cx={278} cy={473} rx={8.5} ry={1.9} fill="#7BA46F" opacity={0.84} />
          <ellipse cx={486} cy={478} rx={10} ry={5.5} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.2} />
          <ellipse cx={484} cy={475} rx={7} ry={2.4} fill="#A89D8A" />
          <ellipse cx={486} cy={473} rx={8.5} ry={1.9} fill="#7BA46F" opacity={0.84} />
          {/* cattails along south-east bank */}
          {[[460, 502], [474, 508], [490, 504]].map(([cx, cy], i) => (
            <g key={`mmcat-${i}`}>
              <line x1={cx} y1={cy} x2={cx} y2={cy + 18} stroke="#6B8E5A" strokeWidth={1.3} />
              <rect x={cx - 1.5} y={cy - 4} width={3} height={9} rx={1.5} fill="#5A3B1F" />
            </g>
          ))}
        </g>

        {/* ── 6b. WATERFALL — lake outflow cascading down to the river ──
             A thin stream of water drops from the lake's south edge at
             (290, 510) down to the river at (290, 700). Big Falls
             structure sits on this cascade at (290, 580). */}
        <g pointerEvents="none">
          {/* falling-water stream */}
          <path
            d="M 280 510 C 282 540, 278 568, 282 596 C 286 624, 280 656, 282 690"
            stroke="#A8CDD2" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.8}
          />
          <path
            d="M 280 510 C 282 540, 278 568, 282 596 C 286 624, 280 656, 282 690"
            stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.5}
          />
          {/* mist at the bottom where it joins the river */}
          <ellipse cx={282} cy={695} rx={22} ry={6} fill="#FFFFFF" opacity={0.42} />
          <ellipse cx={282} cy={690} rx={16} ry={4} fill="#FFFFFF" opacity={0.32} />
        </g>

        {/* ── 6c. CAVE — lower-left mountain cluster anchor ──
             Rocky cave mouth at x:40-340, y:608-740 holding Hundred's
             Hollow (110,660), Fast Facts (180,700), Regroup Ridge
             (270,670). Stays out of the lake's bounding box. */}
        <g pointerEvents="none">
          {/* outer rocky base */}
          <path
            d="M 36 740 Q 50 700 70 670 Q 100 632 150 622
               Q 220 614 280 622 Q 320 632 340 670 Q 348 706 348 740 Z"
            fill="#7A6B58" stroke="#3F3026" strokeWidth={2}
          />
          {/* cave inner shadow (the dark mouth) */}
          <path
            d="M 88 738 Q 100 706 122 678 Q 158 654 200 654 Q 240 656 270 680
               Q 292 706 296 738 Z"
            fill="#2C2018" opacity={0.78}
          />
          {/* moss along top edge */}
          <path
            d="M 60 678 Q 100 660 145 654 Q 215 650 265 658 Q 305 666 332 680"
            stroke="#7BA46F" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.74}
          />
          {/* lantern hanging in the cave mouth — a warm beacon */}
          <line x1={200} y1={654} x2={200} y2={682} stroke="#5A3B1F" strokeWidth={1.4} />
          <ellipse cx={200} cy={690} rx={6} ry={8} fill="#FFD06B" stroke="#5A3B1F" strokeWidth={1.2} />
          <circle cx={200} cy={690} r={3} fill="#FFF2B5" opacity={0.92} />
          {/* base rocks at the mouth */}
          <ellipse cx={64} cy={742} rx={20} ry={6} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.2} />
          <ellipse cx={336} cy={742} rx={18} ry={6} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.2} />
        </g>

        {/* ── 6d. RIVER — single horizontal river y:692-718 ──
             Flows out of the waterfall (stream from lake) eastward across
             the entire scene. BIG BRIDGE at (540, 700) and SKIP BRIDGE
             at (1320, 700) both span THIS river. Beaver dam at center
             (820, 705) is the visual anchor. River exits stage-right.
             Stays ABOVE the bottom buffer (top of buffer = y:760). */}
        <g pointerEvents="none">
          {/* wet-earth bank, follows river silhouette */}
          <path
            d="M 270 686 C 350 692, 480 696, 600 698 C 760 700, 920 700, 1080 699
               C 1240 697, 1360 695, 1440 694
               L 1440 728 C 1360 728, 1240 730, 1080 730
               C 920 731, 760 730, 600 729 C 480 728, 350 726, 270 720 Z"
            fill="#6B8E5A" opacity={0.30}
          />
          {/* primary water body */}
          <path
            d="M 286 692 C 360 698, 482 702, 602 704 C 760 706, 920 706, 1080 705
               C 1240 703, 1360 701, 1440 700
               L 1440 720 C 1360 720, 1240 722, 1080 722
               C 920 723, 760 722, 602 721 C 482 720, 360 718, 286 712 Z"
            fill="#A8CDD2"
          />
          {/* depth channel */}
          <path
            d="M 300 706 C 460 712, 660 712, 880 712 C 1100 712, 1300 708, 1438 706"
            stroke="#7FA9B0" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.6}
          />
          {/* shimmer ripples spread along the river */}
          {[360, 460, 660, 740, 920, 1000, 1180, 1260, 1400].map((rx, i) => (
            <path
              key={`mmrr-${i}`}
              d={`M ${rx - 8} 708 Q ${rx} 704 ${rx + 8} 708`}
              stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.55 - (i % 2) * 0.08} strokeLinecap="round"
            />
          ))}

          {/* BEAVER DAM at river midpoint (820, 705) — visual anchor.
              Path does NOT cross here; it crosses upstream at Big Bridge
              (540) and downstream at Skip Bridge (1320). */}
          <g transform="translate(820, 706)">
            {/* shadow on water */}
            <ellipse cx={0} cy={6} rx={42} ry={5} fill="#000" opacity={0.18} />
            {/* stacked logs */}
            <rect x={-38} y={-2}  width={76} height={6} rx={3} fill="#8B5A2B" stroke="#5A3B1F" strokeWidth={1.2} />
            <rect x={-32} y={-8}  width={64} height={6} rx={3} fill="#A06B36" stroke="#5A3B1F" strokeWidth={1.2} />
            <rect x={-24} y={-14} width={48} height={6} rx={3} fill="#B47845" stroke="#5A3B1F" strokeWidth={1.1} />
            {/* end-grain rings */}
            <circle cx={-38} cy={1} r={2.4} fill="#7A4A1F" stroke="#5A3B1F" strokeWidth={0.8} />
            <circle cx={38}  cy={1} r={2.4} fill="#7A4A1F" stroke="#5A3B1F" strokeWidth={0.8} />
            {/* small beaver on the dam */}
            <g transform="translate(8, -22)">
              <ellipse cx={0} cy={0} rx={9} ry={6.5} fill="#7A4E2C" stroke="#3F2614" strokeWidth={1.2} />
              <circle cx={6} cy={-2} r={4} fill="#8B5A2B" stroke="#3F2614" strokeWidth={1.1} />
              <circle cx={5.4} cy={-3} r={0.9} fill="#1A0E08" />
              <circle cx={7.5} cy={-3.5} r={0.4} fill="#1A0E08" />
              <ellipse cx={9.4} cy={-1.5} rx={1.3} ry={0.8} fill="#3F2614" />
              <circle cx={4.2} cy={-5} r={1.2} fill="#3F2614" />
              <ellipse cx={-9} cy={2} rx={4} ry={2} fill="#3F2614" stroke="#1A0E08" strokeWidth={0.8} />
            </g>
          </g>

          {/* River-bank stones near each bridge */}
          <ellipse cx={476} cy={722} rx={9} ry={5} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.1} />
          <ellipse cx={604} cy={722} rx={9} ry={5} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.1} />
          <ellipse cx={1262} cy={724} rx={9} ry={5} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.1} />
          <ellipse cx={1382} cy={724} rx={9} ry={5} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.1} />
        </g>

        {/* ── 8. PATH SYSTEM ──
             Designed as parallel strips at distinct y-levels so paths
             never cross. Bottom buffer is y > 760 (clean).
             • Plateau ridge       y:350-400  (upper hills)
             • Glen connector      y:360-420  (continues from plateau)
             • Lower ridge         y:470      (Compare/TenMore/Round10)
             • Two climbs at the ridge ends (W: Compare→Tens, E: R10→R100)
             • Time row            y:540
             • Measurement row     y:620      (Even/Pebble/Pie/Bigger)
             • Cave loop           y:660-700
             • Orchard right cluster (vertical interconnect)
             • North-bank river trail y:680   (cave east → Big Bridge)
             • Big & Skip bridge planks y:700 (over the river)
             • Cottage interconnect y:460-510 (3 stories)
             Connectors are explicit single drops — no zig-zags. */}
        {(() => {
          // 1. COTTAGE: 3 stories interconnected (top-left)
          const cottageInterD = `M 80 470 C 90 488, 100 502, 90 510 M 100 470 C 130 472, 160 470, 175 470`;
          // 2. COTTAGE → LAKE NORTH SHORE (curves over the lake's top)
          const cottageToBerryD = `M 175 470 C 220 442, 280 412, 350 408 C 410 410, 460 422, 510 432`;
          // 3. BERRY → COMPARE TREES (descends to lower ridge)
          const berryToCompareD = `M 510 432 C 540 448, 570 460, 590 470`;
          // 4. LOWER RIDGE
          const lowerRidgeD = `M 590 470 C 660 470, 720 470, 780 470 C 840 470, 870 470, 880 470`;
          // 5. WEST CLIMB — Compare Trees up to Tens Tower
          const climbWestD = `M 590 470 C 580 444, 568 420, 560 400`;
          // 6. PLATEAU RIDGE — Tens → Three-Digit → Mountain Heights → Round 100
          const plateauRidgeD = `M 560 400 C 600 376, 640 356, 680 350 C 720 358, 760 372, 800 380 C 850 376, 890 368, 920 360`;
          // 7. EAST CLIMB — Round 10 up to Round 100
          const climbEastD = `M 880 470 C 900 430, 916 396, 920 360`;
          // 8. GLEN CONNECTOR — Round 100 → Sharing → Division → Missing
          const glenConnectD = `M 920 360 C 970 380, 1020 408, 1060 416 C 1090 420, 1106 416, 1116 410 C 1150 384, 1180 366, 1200 360 C 1240 366, 1290 374, 1320 380`;
          // 9. ROUND 10 → TIME ROW (south drop at x:870)
          const roundToTimeD = `M 880 470 C 870 498, 866 524, 860 540`;
          // 10. TIME ROW
          const timeRowD = `M 660 540 C 710 540, 760 540, 810 540 C 840 540, 856 540, 860 540`;
          // 11. TIME → MEASUREMENT (south drop at x:760)
          const timeToMeasureD = `M 760 540 C 740 568, 720 596, 700 620`;
          // 12. MEASUREMENT ROW
          const measureRowD = `M 700 620 C 750 620, 800 620, 850 620 C 900 620, 950 620, 990 620`;
          // 13. ORCHARD VERTICAL CONNECT — Equal → Array → Times-5 → Times-10
          const orchardConnectD = `M 1080 530 C 1110 540, 1150 555, 1180 570 C 1140 590, 1110 610, 1090 620 C 1140 632, 1190 638, 1230 640`;
          // 14. MEASUREMENT → ORCHARD bridge (Bigger Slice → Times-5)
          const measureToOrchardD = `M 990 620 C 1030 620, 1070 620, 1090 620`;
          // 15. CAVE LOOP — Hundred's, Fast Facts, Regroup interconnect
          const caveLoopD = `M 110 660 C 145 670, 165 690, 180 700 M 180 700 C 215 695, 245 685, 270 670 M 110 660 C 175 658, 230 660, 270 670`;
          // 16. NORTH-BANK RIVER TRAIL — Cave east → Big Bridge approach
          const riverNorthBankD = `M 270 670 C 330 668, 380 666, 420 668 C 450 672, 470 686, 480 700`;
          // 17. BIG BRIDGE plank (crosses river)
          const bigBridgeD = `M 480 700 L 540 700 L 600 700`;
          // 18. EAST OF BIG BRIDGE → measurement row (climb back up)
          const bridgeEastUpD = `M 600 700 C 620 670, 660 640, 700 622`;
          // 19. TIMES-10 → SKIP BRIDGE approach (drops east-south)
          const timesToSkipD = `M 1230 640 C 1280 660, 1310 680, 1320 700`;
          // 20. SKIP BRIDGE plank
          const skipBridgeD = `M 1260 700 L 1320 700 L 1380 700`;

          // All "trail" paths (NOT bridges, NOT cave loop which is special)
          const trails = [
            cottageInterD, cottageToBerryD, berryToCompareD, lowerRidgeD,
            climbWestD, plateauRidgeD, climbEastD, glenConnectD,
            roundToTimeD, timeRowD, timeToMeasureD, measureRowD,
            orchardConnectD, measureToOrchardD, caveLoopD,
            riverNorthBankD, bridgeEastUpD, timesToSkipD,
          ];
          return (
            <g pointerEvents="none">
              {/* Shadow */}
              {trails.map((d, i) => (
                <path key={`mmsh-${i}`} d={d} stroke="#A99878" strokeWidth={18} fill="none" strokeLinecap="round" opacity={0.18} />
              ))}
              {/* Bridge plank shadows */}
              <path d={bigBridgeD}  stroke="#7A5A3A" strokeWidth={24} fill="none" strokeLinecap="round" opacity={0.78} />
              <path d={skipBridgeD} stroke="#7A5A3A" strokeWidth={20} fill="none" strokeLinecap="round" opacity={0.78} />

              {/* Surface */}
              {trails.map((d, i) => (
                <path key={`mmsu-${i}`} d={d} stroke="#EAD2A8" strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.84} />
              ))}
              {/* Bridge plank surfaces */}
              <path d={bigBridgeD}  stroke="#C8A57A" strokeWidth={18} fill="none" strokeLinecap="round" opacity={0.94} />
              <path d={skipBridgeD} stroke="#C8A57A" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.94} />
              {[488, 506, 524, 542, 560, 578, 596].map(px => (
                <line key={`bbp-${px}`} x1={px} y1={690} x2={px} y2={710} stroke="#7A5A3A" strokeWidth={1.3} opacity={0.7} />
              ))}
              {[1268, 1284, 1300, 1316, 1332, 1348, 1372].map(px => (
                <line key={`sbp-${px}`} x1={px} y1={690} x2={px} y2={710} stroke="#7A5A3A" strokeWidth={1.3} opacity={0.7} />
              ))}

              {/* Highlight ribbon */}
              {trails.map((d, i) => (
                <path key={`mmhi-${i}`} d={d} stroke="#F7E6C4" strokeWidth={4.5} fill="none" strokeLinecap="round" opacity={0.46} />
              ))}

              {/* Stepping stones — sparse, only on key approaches */}
              {[
                // cottage to lake-north
                { x: 220, y: 444 }, { x: 290, y: 418 }, { x: 380, y: 410 }, { x: 460, y: 420 },
                // berry to compare
                { x: 540, y: 450 }, { x: 570, y: 462 },
                // lower ridge
                { x: 660, y: 470 }, { x: 800, y: 470 },
                // climbs
                { x: 580, y: 442 }, { x: 902, y: 420 },
                // plateau ridge
                { x: 620, y: 384 }, { x: 720, y: 360 }, { x: 850, y: 376 },
                // glen connector
                { x: 990, y: 388 }, { x: 1140, y: 388 }, { x: 1260, y: 376 },
                // round to time
                { x: 868, y: 506 },
                // time row
                { x: 720, y: 540 }, { x: 810, y: 540 },
                // time to measurement
                { x: 740, y: 580 },
                // measurement row
                { x: 750, y: 620 }, { x: 940, y: 620 },
                // orchard
                { x: 1130, y: 555 }, { x: 1140, y: 600 }, { x: 1180, y: 632 },
                // cave loop
                { x: 150, y: 678 }, { x: 220, y: 692 },
                // north-bank trail
                { x: 330, y: 670 }, { x: 410, y: 670 }, { x: 460, y: 686 },
                // bridge approaches
                { x: 620, y: 680 }, { x: 660, y: 650 },
                { x: 1280, y: 680 }, { x: 1310, y: 698 },
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
