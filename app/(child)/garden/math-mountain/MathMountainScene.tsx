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

// HABITAT GROUPS — clusters that consolidate into ONE icon by default.
// Click the habitat icon → its skills fan out and become individually
// clickable. Click again (or anywhere outside) → collapses back.
// This is the "container habitat" pattern — like Bunny Burrow on the
// central garden, but inline (no route navigation needed).
const HABITAT_GROUPS: Record<string, {
  codes: string[]; x: number; y: number; label: string; icon: string;
}> = {
  cottage: {
    codes: ['mm_stories_plus', 'mm_stories_minus', 'mm_long_stories'],
    x: 110, y: 470, label: 'Stories Cottage', icon: '📖',
  },
  cave: {
    codes: ['mm_hundreds_hollow', 'mm_fast_facts', 'mm_regroup_ridge'],
    x: 190, y: 680, label: 'Operations Cave', icon: '🕳️',
  },
  orchard: {
    codes: ['mm_equal_garden', 'mm_array_orchard', 'mm_times_to_5', 'mm_times_to_10'],
    x: 1150, y: 580, label: 'Apple Orchard', icon: '🍎',
  },
  glen: {
    codes: ['mm_sharing_squirrels', 'mm_division_facts', 'mm_missing_number'],
    x: 1200, y: 390, label: 'Division Glen', icon: '🐿️',
  },
  measurement: {
    codes: ['mm_even_odd', 'mm_garden_clock', 'mm_sundial', 'mm_hourglass',
            'mm_pebble_coins', 'mm_pie_slices', 'mm_bigger_slice'],
    x: 820, y: 580, label: 'Measurement Meadow', icon: '⏳',
  },
};
const HABITAT_BY_SKILL: Record<string, string> = Object.entries(HABITAT_GROUPS)
  .reduce((acc, [k, g]) => { g.codes.forEach(c => { acc[c] = k; }); return acc; }, {} as Record<string, string>);

export default function MathMountainScene({
  learnerId, structures, clusters, structureStates,
}: MathMountainSceneProps) {
  const router = useRouter();
  const [tappedLocked, setTappedLocked] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [expandedHabitat, setExpandedHabitat] = useState<string | null>(null);

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
             Winding bezier curves only — no horizontal straight runs.
             Organic mountain trail logic: trails meander, climbs zig
             gently, the lake has a path looping AROUND it (figure-8
             with the cottage trail). Stays above the bottom buffer. */}
        {(() => {
          // SINGLE WINDING TRAIL split into chained segments. Each segment
          // ends where the next begins so the eye reads it as one path.

          // Cottage cluster — soft S between the 3 stories
          const cottageInterD = `M 80 460
            C 70 472, 78 488, 90 510
            M 100 480
            C 130 472, 158 466, 175 470`;
          // Cottage → loops around lake's NORTH shore
          const lakeLoopNorthD = `M 175 470
            C 200 444, 240 416, 290 408
            C 350 402, 410 412, 462 426
            C 482 432, 500 434, 510 432`;
          // Berry → undulates down to Compare Trees
          const berryToCompareD = `M 510 432
            C 532 444, 552 458, 568 466
            C 578 470, 586 470, 590 470`;
          // Lower ridge — three soft humps Compare → Ten More → Round 10
          const lowerRidgeD = `M 590 470
            C 624 462, 658 478, 692 472
            C 720 466, 748 478, 778 472
            C 808 466, 840 478, 880 470`;
          // West climb — Compare Trees winds NW up to Tens Tower
          const climbWestD = `M 590 470
            C 584 446, 590 422, 572 410
            C 562 404, 558 402, 560 400`;
          // Plateau ridge — Tens dips down to Three-Digit, climbs to Mountain, descends to Round 100
          const plateauRidgeD = `M 560 400
            C 588 388, 620 376, 652 360
            C 668 352, 678 350, 680 350
            C 712 360, 740 376, 770 380
            C 786 382, 794 384, 800 380
            C 832 372, 866 364, 902 360
            C 916 360, 920 360, 920 360`;
          // East climb — winds NE
          const climbEastD = `M 880 470
            C 894 444, 906 416, 916 388
            C 918 376, 920 366, 920 360`;
          // Glen connector — Round 100 → Sharing → Division → Missing (loops)
          const glenConnectD = `M 920 360
            C 956 388, 996 414, 1042 422
            C 1070 422, 1090 416, 1102 408
            C 1126 388, 1156 372, 1186 364
            C 1196 360, 1200 360, 1200 360
            C 1230 366, 1262 372, 1296 376
            C 1312 380, 1320 380, 1320 380`;
          // Round 10 → Time Row — winding south
          const roundToTimeD = `M 880 470
            C 882 498, 876 520, 866 534
            C 862 540, 860 540, 860 540`;
          // Time row — undulating between 3 time pieces
          const timeRowD = `M 660 540
            C 692 532, 724 548, 760 540
            C 794 532, 826 548, 860 540`;
          // Time → Measurement — soft S
          const timeToMeasureD = `M 760 540
            C 754 562, 738 588, 718 608
            C 706 616, 700 620, 700 620`;
          // Measurement row — undulating
          const measureRowD = `M 700 620
            C 740 612, 778 626, 802 620
            C 836 612, 866 628, 902 620
            C 938 614, 970 626, 990 620`;
          // Equal Garden → Array (curve down)
          const orchardUpperD = `M 1080 530
            C 1106 540, 1140 552, 1168 564
            C 1176 568, 1180 570, 1180 570`;
          // Array → Times-5 (curve down-left)
          const orchardMidD = `M 1180 570
            C 1162 588, 1130 604, 1106 614
            C 1096 618, 1090 620, 1090 620`;
          // Times-5 → Times-10 (curve right)
          const orchardLowerD = `M 1090 620
            C 1130 626, 1170 634, 1206 638
            C 1220 640, 1230 640, 1230 640`;
          // Measurement → Orchard (Bigger Slice → Times-5, curve)
          const measureToOrchardD = `M 990 620
            C 1020 614, 1056 622, 1090 620`;
          // Cave loop — loops around the 3 cave structures
          const caveLoopD = `M 110 660
            C 130 642, 158 638, 180 644
            C 220 650, 246 660, 270 670
            C 244 690, 214 700, 180 700
            C 144 700, 122 686, 110 660 Z`;
          // North-bank trail — cave east meanders to Big Bridge
          const riverNorthBankD = `M 270 670
            C 308 660, 350 660, 386 666
            C 420 672, 446 686, 470 696
            C 478 698, 480 700, 480 700`;
          // Big Bridge plank (gentle arch over river)
          const bigBridgeD = `M 480 700
            C 504 696, 540 694, 600 700`;
          // East of Big Bridge → up to measurement row
          const bridgeEastUpD = `M 600 700
            C 622 670, 656 640, 692 624
            C 698 622, 700 620, 700 620`;
          // Times-10 → Skip Bridge approach
          const timesToSkipD = `M 1230 640
            C 1268 658, 1298 680, 1316 696
            C 1320 700, 1320 700, 1320 700`;
          // Skip Bridge plank (gentle arch)
          const skipBridgeD = `M 1260 700
            C 1290 696, 1326 694, 1380 700`;

          // All non-bridge trails (cave loop is included; bridges drawn separately)
          const trails = [
            cottageInterD, lakeLoopNorthD, berryToCompareD, lowerRidgeD,
            climbWestD, plateauRidgeD, climbEastD, glenConnectD,
            roundToTimeD, timeRowD, timeToMeasureD, measureRowD,
            orchardUpperD, orchardMidD, orchardLowerD, measureToOrchardD,
            caveLoopD, riverNorthBankD, bridgeEastUpD, timesToSkipD,
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

        {/* Cottage SVG removed — the cottage habitat icon now anchors
            the cluster on its own. */}

        {/* ── 10. APPLE ORCHARD trees — flank the Orchard habitat ── */}
        <Tree x={1010} y={460} size={40} variant={1} />
        <Tree x={1380} y={460} size={42} variant={2} />

        {/* ── 11. DIVISION GLEN — pine clearing flanks the Glen habitat ── */}
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
          // Smaller, less clip-arty icons (was 44 → now 30)
          const UNIFORM = 30;
          const HIT = 30;
          const LABEL_Y = 22;
          const LABEL_W = 88;
          const LABEL_H = 15;
          return structures.map(s => {
            // Skip individual structures that belong to a collapsed habitat
            const habitatKey = HABITAT_BY_SKILL[s.code];
            if (habitatKey && expandedHabitat !== habitatKey) return null;

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

                {unlocked && !completed && (
                  <circle r={UNIFORM * 0.7} fill="#FFE89A" opacity={0.20} />
                )}

                <g style={{
                  filter: completed
                    ? 'drop-shadow(0 0 5px rgba(255, 217, 61, 0.55))'
                    : unlocked
                      ? 'drop-shadow(0 1px 1.5px rgba(107,68,35,0.40))'
                      : 'grayscale(1) brightness(0.92)',
                  opacity: unlocked ? 1 : 0.58,
                }}>
                  {drawn ?? (
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={24}
                      y={0}
                    >
                      {s.themeEmoji}
                    </text>
                  )}
                </g>

                {!unlocked && (
                  <g pointerEvents="none">
                    <circle cx={UNIFORM * 0.42} cy={-UNIFORM * 0.42} r={7}
                            fill="#FFFFFF" stroke="#8A7E6C" strokeWidth={1.1} />
                    <text
                      x={UNIFORM * 0.42} y={-UNIFORM * 0.42 + 2.6}
                      fontSize={9} textAnchor="middle"
                      style={{ userSelect: 'none' }}
                    >🔒</text>
                  </g>
                )}

                {completed && (
                  <g pointerEvents="none">
                    <circle cx={UNIFORM * 0.42} cy={-UNIFORM * 0.42} r={7}
                            fill="#6B8E5A" stroke="#4F6F42" strokeWidth={1.1} />
                    <path
                      d={`M ${UNIFORM * 0.42 - 3} ${-UNIFORM * 0.42 + 0.4}
                          L ${UNIFORM * 0.42 - 0.8} ${-UNIFORM * 0.42 + 2.6}
                          L ${UNIFORM * 0.42 + 3} ${-UNIFORM * 0.42 - 2}`}
                      stroke="#FFFFFF" strokeWidth={1.6} fill="none"
                      strokeLinecap="round" strokeLinejoin="round"
                    />
                  </g>
                )}

                {/* Label pill — softer, smaller */}
                <rect
                  x={-LABEL_W / 2} y={LABEL_Y} width={LABEL_W} height={LABEL_H} rx={LABEL_H / 2}
                  fill={completed ? '#FFF6CC' : unlocked ? 'rgba(255,250,242,0.92)' : 'rgba(239,231,212,0.78)'}
                  stroke={completed ? '#D4B43E' : unlocked ? '#E8A87C' : '#C7B89A'}
                  strokeWidth={0.9}
                />
                <text
                  x={0} y={LABEL_Y + 11} textAnchor="middle"
                  fontSize={8.5} fontWeight={600}
                  fill={unlocked ? '#6b4423' : '#8a7050'}
                  style={{ userSelect: 'none' }}
                >
                  {s.label}
                </text>

                {isTappedLocked && state && (
                  <g pointerEvents="none">
                    <rect
                      x={-86} y={-UNIFORM * 1.4} width={172} height={26} rx={8}
                      fill="#fffaf2" stroke="#c38d9e" strokeWidth={1.3}
                    />
                    <text
                      x={0} y={-UNIFORM * 1.1} textAnchor="middle"
                      fontSize={9.5} fontStyle="italic" fill="#6b4423"
                    >
                      {state.prereqDisplay}
                    </text>
                  </g>
                )}
              </g>
            );
          });
        })()}

        {/* ── HABITATS ── single-icon clusters that expand on tap.
             Each habitat shows the cluster name + progress badge.
             Tapping reveals the individual skills inside; tapping a
             skill (or anywhere) to start a lesson, tapping the habitat
             icon again collapses back. */}
        {Object.entries(HABITAT_GROUPS).map(([key, group]) => {
          const isExpanded = expandedHabitat === key;
          const states = group.codes.map(c => structureStates[c]).filter(Boolean);
          const total = group.codes.length;
          const completedCount = states.filter(s => s?.completed).length;
          const unlockedCount = states.filter(s => s?.unlocked).length;
          const anyUnlocked = unlockedCount > 0;
          const allCompleted = completedCount === total;

          return (
            <g key={`habitat-${key}`} pointerEvents="auto">
              <g
                transform={`translate(${group.x}, ${group.y})`}
                style={{ cursor: 'pointer', touchAction: 'manipulation' }}
                onClick={() => setExpandedHabitat(isExpanded ? null : key)}
              >
                {/* big circular hit target + soft hover ring */}
                <circle r={42} fill="transparent" />
                {!isExpanded && anyUnlocked && (
                  <circle r={36} fill="#FFE89A" opacity={0.22} />
                )}

                {/* hand-drawn habitat marker — wood-stake banner */}
                {!isExpanded && (
                  <g style={{
                    filter: allCompleted
                      ? 'drop-shadow(0 0 6px rgba(255,217,61,0.55))'
                      : 'drop-shadow(0 2px 3px rgba(107,68,35,0.42))',
                    opacity: anyUnlocked ? 1 : 0.62,
                  }}>
                    {/* wooden plinth */}
                    <ellipse cx={0} cy={28} rx={32} ry={5} fill="#000" opacity={0.20} />
                    <ellipse cx={0} cy={26} rx={30} ry={6} fill="#A87B4A" stroke="#5A3B1F" strokeWidth={1.2} />
                    <ellipse cx={0} cy={24} rx={26} ry={3} fill="#C9A270" />
                    {/* round emblem disk */}
                    <circle r={26} fill="#FFFAF2" stroke="#5A3B1F" strokeWidth={1.8} />
                    <circle r={22} fill="#F5EBDC" />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={26}
                      y={2}
                      style={{ userSelect: 'none', filter: anyUnlocked ? '' : 'grayscale(1)' }}
                    >
                      {group.icon}
                    </text>
                    {/* progress arc — fraction of completed skills */}
                    {total > 0 && (() => {
                      const angle = (completedCount / total) * 360;
                      const rad = (a: number) => (a - 90) * Math.PI / 180;
                      const endX = 23 * Math.cos(rad(angle));
                      const endY = 23 * Math.sin(rad(angle));
                      const large = angle > 180 ? 1 : 0;
                      if (completedCount === 0) return null;
                      return (
                        <path
                          d={`M 0 -23 A 23 23 0 ${large} 1 ${endX.toFixed(1)} ${endY.toFixed(1)}`}
                          stroke="#6B8E5A" strokeWidth={3.5} fill="none" strokeLinecap="round"
                        />
                      );
                    })()}
                  </g>
                )}

                {/* Collapsed-state label banner */}
                {!isExpanded && (
                  <>
                    <rect x={-58} y={42} width={116} height={18} rx={9}
                          fill="#FFFAF2" stroke="#E8A87C" strokeWidth={1.3} />
                    <text x={0} y={55} textAnchor="middle" fontSize={10}
                          fontWeight={700} fill="#6b4423"
                          style={{ userSelect: 'none' }}>
                      {group.label}
                    </text>
                    <rect x={-22} y={62} width={44} height={14} rx={7}
                          fill={allCompleted ? '#6B8E5A' : '#FDF6E8'}
                          stroke={allCompleted ? '#4F6F42' : '#C7B89A'}
                          strokeWidth={1} />
                    <text x={0} y={72} textAnchor="middle" fontSize={9}
                          fontWeight={700}
                          fill={allCompleted ? '#FFFFFF' : '#6b4423'}
                          style={{ userSelect: 'none', fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>
                      {completedCount}/{total}
                    </text>
                  </>
                )}

                {/* Expanded-state — show small dim ring + close hint */}
                {isExpanded && (
                  <g>
                    <circle r={36} fill="rgba(255,250,242,0.42)" stroke="#E8A87C" strokeWidth={1.5} strokeDasharray="3 4" />
                    <text textAnchor="middle" dominantBaseline="central"
                          fontSize={20} y={-1} opacity={0.6}>{group.icon}</text>
                    <rect x={-46} y={28} width={92} height={14} rx={7}
                          fill="rgba(255,250,242,0.85)" stroke="#E8A87C" strokeWidth={1} />
                    <text x={0} y={38} textAnchor="middle" fontSize={9}
                          fontStyle="italic" fill="#6b4423"
                          style={{ userSelect: 'none' }}>
                      tap to close
                    </text>
                  </g>
                )}
              </g>
            </g>
          );
        })}
      </svg>
    </BranchSceneLayout>
  );
}
