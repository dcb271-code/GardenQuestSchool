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

// HABITAT GROUPS — clusters that consolidate into ONE marker by default.
// Each habitat uses a BESPOKE illustration as its marker (cottage = a
// cottage, orchard = apple trees, glen = pines, meadow = wildflowers,
// cave = the existing cave SVG). NO orb / glass-ball icons.
// Tap the marker → skills fan out at their original positions; tap
// again → collapses back.
const HABITAT_GROUPS: Record<string, {
  codes: string[]; x: number; y: number; label: string;
}> = {
  cottage: {
    codes: ['mm_stories_plus', 'mm_stories_minus', 'mm_long_stories'],
    x: 110, y: 480, label: 'Stories Cottage',
  },
  cave: {
    codes: ['mm_hundreds_hollow', 'mm_fast_facts', 'mm_regroup_ridge'],
    x: 110, y: 760, label: 'Operations Cave', // label position only — cave SVG itself is the marker
  },
  orchard: {
    codes: ['mm_equal_garden', 'mm_array_orchard', 'mm_times_to_5', 'mm_times_to_10'],
    x: 1150, y: 580, label: 'Apple Orchard',
  },
  glen: {
    codes: ['mm_sharing_squirrels', 'mm_division_facts', 'mm_missing_number'],
    x: 1200, y: 390, label: 'Division Glen',
  },
  measurement: {
    codes: ['mm_even_odd', 'mm_garden_clock', 'mm_sundial', 'mm_hourglass',
            'mm_pebble_coins', 'mm_pie_slices', 'mm_bigger_slice'],
    x: 820, y: 580, label: 'Measurement Meadow',
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
          {/* Miyazaki sky — soft pastel blue at top, fades through cream
              and a hint of warm peach near the horizon. NO greens here:
              the meadow underneath provides the green; the sky should
              feel like watercolor air, not a wash of vegetation. */}
          <linearGradient id="mmSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#B8D2E8" />
            <stop offset="28%" stopColor="#CFE0EE" />
            <stop offset="55%" stopColor="#E8E4D8" />
            <stop offset="78%" stopColor="#F4DCC0" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#F8D6B5" stopOpacity="0" />
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
          <radialGradient id="mmGlenTint" cx="82%" cy="62%" r="14%">
            <stop offset="0%" stopColor="#95B88F" stopOpacity="0.18" />
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

        {/* ── 1. SKY + MEADOW BASE ──
             Sky covers the full viewport. Meadow rect is RESTRICTED to
             the foreground band (y:320+) — previously meadow spanned
             y:0-800 at opacity 0.95, which painted a green wash over
             the sky behind the mountains. */}
        <rect width={W} height={H} fill="url(#mmSky)" />
        <rect x={0} y={320} width={W} height={H - 320} fill="url(#mmMeadow)" opacity="0.95" />

        {/* ── 1b. SOFT MIYAZAKI CLOUDS — billowy painterly puffs ──
             Sit in the gaps BETWEEN the painted Fuji peaks (so they
             don't visually compete). Three layers of soft white shapes
             with gentle lavender-gray shadow underneath each. */}
        <g pointerEvents="none" opacity={0.92}>
          {/* upper-mid cloud (between Peak 3 and Peak 1) */}
          <g>
            <ellipse cx={300} cy={108} rx={64} ry={11} fill="#C8C4D8" opacity={0.35} />
            <ellipse cx={296} cy={94} rx={32} ry={16} fill="#FFFFFF" />
            <ellipse cx={324} cy={92} rx={26} ry={14} fill="#FFFFFF" />
            <ellipse cx={272} cy={92} rx={24} ry={14} fill="#FFFFFF" />
            <ellipse cx={306} cy={98} rx={42} ry={12} fill="#FFFFFF" />
            <ellipse cx={290} cy={86} rx={14} ry={8} fill="#F8FAFD" opacity={0.92} />
          </g>
          {/* tall cloud (above the big peak, drifts to the right) */}
          <g>
            <ellipse cx={580} cy={62} rx={70} ry={10} fill="#C8C4D8" opacity={0.30} />
            <ellipse cx={566} cy={48} rx={28} ry={14} fill="#FFFFFF" />
            <ellipse cx={596} cy={44} rx={32} ry={16} fill="#FFFFFF" />
            <ellipse cx={624} cy={50} rx={24} ry={13} fill="#FFFFFF" />
            <ellipse cx={544} cy={52} rx={20} ry={12} fill="#FFFFFF" />
            <ellipse cx={584} cy={56} rx={48} ry={11} fill="#FFFFFF" />
            <ellipse cx={580} cy={40} rx={16} ry={8} fill="#F8FAFD" opacity={0.92} />
          </g>
          {/* mid-right cloud (between big peak and Peak 2) */}
          <g>
            <ellipse cx={988} cy={96} rx={56} ry={9} fill="#C8C4D8" opacity={0.30} />
            <ellipse cx={974} cy={84} rx={26} ry={13} fill="#FFFFFF" />
            <ellipse cx={1004} cy={80} rx={28} ry={14} fill="#FFFFFF" />
            <ellipse cx={1030} cy={86} rx={20} ry={11} fill="#FFFFFF" />
            <ellipse cx={994} cy={88} rx={40} ry={10} fill="#FFFFFF" />
          </g>
          {/* far-right small cloud */}
          <g>
            <ellipse cx={1340} cy={132} rx={42} ry={7} fill="#C8C4D8" opacity={0.28} />
            <ellipse cx={1330} cy={122} rx={20} ry={10} fill="#FFFFFF" />
            <ellipse cx={1352} cy={120} rx={22} ry={11} fill="#FFFFFF" />
            <ellipse cx={1340} cy={126} rx={28} ry={9} fill="#FFFFFF" />
          </g>
          {/* small wisp upper-far-left */}
          <g>
            <ellipse cx={120} cy={146} rx={34} ry={6} fill="#C8C4D8" opacity={0.25} />
            <ellipse cx={114} cy={138} rx={18} ry={9} fill="#FFFFFF" opacity={0.92} />
            <ellipse cx={130} cy={136} rx={16} ry={8} fill="#FFFFFF" opacity={0.92} />
          </g>
        </g>

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

        {/* (Waterfall removed — was a single thin blue line that read
            as a defect, not a cascade. Big Falls structure sits on the
            lake's south bank instead, at (300, 510), part of the lake
            cluster's water-themed group.) */}

        {/* ── 6c. CAVE — natural rocky archway at the far-left edge ──
             The river flows OUT of the cave mouth on the right side,
             so it's clearly the source of the watercourse — not just
             a rectangle plopped in front of the river. Cave occupies
             x:-30 to 230, y:570-740; river starts at x:230, y:705. */}
        <g
          style={{ cursor: 'pointer', touchAction: 'manipulation' }}
          onClick={() => setExpandedHabitat(expandedHabitat === 'cave' ? null : 'cave')}
        >
          {/* invisible hit target covering the cave area */}
          <rect x={-12} y={616} width={172} height={136} fill="transparent" />

          {/* outer rocky face — smaller (~15% reduction). Extends just
              past the left edge with a whimsical curve (Miyazaki-soft).
              Open at bottom-right for river. */}
          <path
            d="M -12 740
               L -12 706
               C -8 682, 0 656, 14 638
               C 30 622, 54 614, 80 614
               C 108 616, 130 626, 144 644
               C 154 660, 158 680, 154 696
               C 152 702, 150 706, 150 710
               L 150 740
               Z"
            fill="#7A6B58" stroke="#3F3026" strokeWidth={2}
          />
          {/* darker rock shading on the right (depth) */}
          <path
            d="M 124 624 C 138 638, 152 658, 152 680 L 150 710 L 142 710
               C 146 680, 140 644, 130 632 Z"
            fill="#5C4F3F" opacity={0.5}
          />

          {/* inner cave shadow — soft organic opening, opens at the
              bottom-right where river emerges. */}
          <path
            d="M 0 740
               C -4 716, 0 686, 14 664
               C 30 644, 54 634, 78 634
               C 102 636, 122 644, 136 662
               C 146 680, 148 700, 142 712
               C 138 720, 134 730, 132 740
               Z"
            fill="#1A1208" opacity={0.86}
          />
          {/* deeper pocket */}
          <ellipse cx={70} cy={700} rx={40} ry={20} fill="#000" opacity={0.32} />

          {/* mossy rim along the top of the arch */}
          <path
            d="M 4 648 C 22 632, 46 624, 76 622 C 102 622, 124 632, 140 646"
            stroke="#7BA46F" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.82}
          />
          <path
            d="M 16 638 C 32 630, 52 624, 76 626 C 100 630, 118 638, 130 646"
            stroke="#A2C794" strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={0.68}
          />
          {/* moss tufts on the rock face */}
          <circle cx={-4} cy={690} r={4} fill="#7BA46F" opacity={0.7} />
          <circle cx={2} cy={708} r={3} fill="#7BA46F" opacity={0.6} />
          <circle cx={146} cy={668} r={3.5} fill="#7BA46F" opacity={0.7} />
          <circle cx={154} cy={690} r={3} fill="#7BA46F" opacity={0.6} />

          {/* atmospheric warm glow inside (no lantern) — soft suggestion
              of warmth deep in the cave, not a discrete light source. */}
          <ellipse cx={60} cy={696} rx={46} ry={20} fill="#FFE89A" opacity={0.14} />
          <ellipse cx={54} cy={706} rx={28} ry={12} fill="#FFD06B" opacity={0.10} />

          {/* HANGING VINES at the cave mouth — Miyazaki-soft */}
          <g pointerEvents="none">
            <path
              d="M 20 622 C 20 634, 18 646, 22 658 C 24 672, 20 682, 18 692"
              stroke="#5C7E4F" strokeWidth={1.4} fill="none" strokeLinecap="round" opacity={0.85}
            />
            <ellipse cx={22} cy={642} rx={2.6} ry={1.7} fill="#7BA46F" opacity={0.85} transform="rotate(-30 22 642)" />
            <ellipse cx={20} cy={656} rx={2.3} ry={1.5} fill="#A2C794" opacity={0.78} transform="rotate(20 20 656)" />
            <ellipse cx={18} cy={680} rx={2.6} ry={1.7} fill="#7BA46F" opacity={0.85} transform="rotate(-10 18 680)" />

            <path
              d="M 76 614 C 74 628, 78 640, 74 654 C 72 668, 76 678, 74 692"
              stroke="#5C7E4F" strokeWidth={1.3} fill="none" strokeLinecap="round" opacity={0.78}
            />
            <ellipse cx={75} cy={634} rx={2.4} ry={1.6} fill="#7BA46F" opacity={0.8} transform="rotate(15 75 634)" />
            <ellipse cx={74} cy={660} rx={2.2} ry={1.4} fill="#A2C794" opacity={0.74} transform="rotate(-25 74 660)" />
            <ellipse cx={75} cy={682} rx={2.3} ry={1.5} fill="#7BA46F" opacity={0.78} transform="rotate(10 75 682)" />

            <path
              d="M 142 622 C 144 634, 142 646, 146 658 C 148 672, 144 682, 146 692"
              stroke="#5C7E4F" strokeWidth={1.3} fill="none" strokeLinecap="round" opacity={0.82}
            />
            <ellipse cx={144} cy={640} rx={2.5} ry={1.6} fill="#7BA46F" opacity={0.85} transform="rotate(-15 144 640)" />
            <ellipse cx={146} cy={664} rx={2.2} ry={1.4} fill="#A2C794" opacity={0.78} transform="rotate(20 146 664)" />
            <ellipse cx={144} cy={684} rx={2.3} ry={1.5} fill="#7BA46F" opacity={0.82} transform="rotate(-5 144 684)" />
          </g>

          {/* small rocks at the cave mouth ground */}
          <ellipse cx={-6} cy={740} rx={14} ry={4} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.1} />
          <ellipse cx={-4} cy={737} rx={9} ry={2.2} fill="#A89D8A" />
          <ellipse cx={142} cy={740} rx={12} ry={4} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.1} />
          {/* ferns at the entrance */}
          <g transform="translate(2, 740)">
            <path d="M 0 0 Q -3 -10 -7 -16" stroke="#6B8E5A" strokeWidth={1.3} fill="none" strokeLinecap="round" />
            <path d="M 0 0 Q 0 -12 -2 -20" stroke="#6B8E5A" strokeWidth={1.3} fill="none" strokeLinecap="round" />
            <path d="M 0 0 Q 3 -10 5 -16" stroke="#6B8E5A" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          </g>
          <g transform="translate(146, 740)">
            <path d="M 0 0 Q -3 -10 -6 -16" stroke="#6B8E5A" strokeWidth={1.3} fill="none" strokeLinecap="round" />
            <path d="M 0 0 Q 0 -10 1 -18" stroke="#6B8E5A" strokeWidth={1.3} fill="none" strokeLinecap="round" />
          </g>
        </g>

        {/* ── 6d. RIVER — emerges from cave, meanders naturally east ──
             Starts at the cave mouth (x:215, y:706) and bends through
             the meadow with varying width, like a real watercourse.
             BIG BRIDGE at (540, 700), SKIP BRIDGE at (1320, 700).
             Log-jam dam at midpoint (820, 705). */}
        <g pointerEvents="none">
          {/* wet-earth bank — emerges from cave (right edge x:172) */}
          <path
            d="M 148 708
               C 220 700, 290 690, 360 686
               C 440 686, 530 696, 620 702
               C 720 706, 820 700, 920 696
               C 1020 692, 1120 696, 1220 700
               C 1320 702, 1400 696, 1440 694
               L 1440 730
               C 1400 732, 1320 734, 1220 732
               C 1120 730, 1020 732, 920 734
               C 820 736, 720 734, 620 728
               C 530 724, 440 720, 360 720
               C 290 722, 220 728, 178 730
               C 162 728, 152 720, 148 708 Z"
            fill="#6B8E5A" opacity={0.30}
          />
          {/* primary water body — emerges from cave at x:150 */}
          <path
            d="M 150 710
               C 222 704, 296 696, 366 692
               C 446 692, 534 700, 624 706
               C 724 708, 822 704, 922 700
               C 1022 696, 1122 700, 1222 704
               C 1320 706, 1400 702, 1440 700
               L 1440 722
               C 1400 724, 1320 726, 1222 724
               C 1122 722, 1022 724, 922 724
               C 822 726, 724 724, 624 720
               C 534 718, 446 716, 366 716
               C 296 718, 222 722, 184 724
               C 168 720, 156 716, 150 710 Z"
            fill="#A8CDD2"
          />
          {/* deeper channel — meanders through the river */}
          <path
            d="M 240 712 C 320 706, 410 700, 500 706
               C 600 712, 700 716, 800 712
               C 900 708, 1000 710, 1100 712
               C 1200 714, 1320 712, 1438 710"
            stroke="#7FA9B0" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.6}
          />
          {/* shimmer ripples — denser where river is wider */}
          {[
            { x: 280, y: 708 }, { x: 360, y: 700 }, { x: 460, y: 706 },
            { x: 580, y: 712 }, { x: 720, y: 710 }, { x: 880, y: 706 },
            { x: 980, y: 706 }, { x: 1100, y: 710 }, { x: 1240, y: 712 },
            { x: 1380, y: 706 },
          ].map((p, i) => (
            <path
              key={`mmrr-${i}`}
              d={`M ${p.x - 7} ${p.y} Q ${p.x} ${p.y - 4} ${p.x + 7} ${p.y}`}
              stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.55 - (i % 3) * 0.08} strokeLinecap="round"
            />
          ))}

          {/* foam at the cave-mouth source — water emerges */}
          <ellipse cx={158} cy={710} rx={12} ry={4} fill="#FFFFFF" opacity={0.55} />
          <ellipse cx={172} cy={716} rx={8} ry={3} fill="#FFFFFF" opacity={0.40} />
          <path d="M 154 704 Q 162 702 172 706" stroke="#FFFFFF" strokeWidth={1.1} fill="none" opacity={0.65} strokeLinecap="round" />
          <path d="M 164 720 Q 172 718 180 720" stroke="#FFFFFF" strokeWidth={0.9} fill="none" opacity={0.5} strokeLinecap="round" />

          {/* small reeds along the bank */}
          {[[300, 690], [430, 686], [690, 692], [970, 692], [1140, 696], [1380, 692]].map(([rx, ry], i) => (
            <g key={`mmrd-${i}`} transform={`translate(${rx},${ry})`}>
              <line x1={0} y1={0} x2={-1} y2={-12} stroke="#6B8E5A" strokeWidth={1.4} strokeLinecap="round" />
              <line x1={0} y1={0} x2={2} y2={-14} stroke="#6B8E5A" strokeWidth={1.4} strokeLinecap="round" />
              <line x1={0} y1={0} x2={-3} y2={-8} stroke="#6B8E5A" strokeWidth={1.2} strokeLinecap="round" />
            </g>
          ))}

          {/* LOG-JAM DAM at river midpoint (820, 706) — three logs at
              natural angles + protruding twigs. Reads as a beaver dam
              without any cringy cartoon creature. */}
          <g transform="translate(820, 706)">
            <ellipse cx={0} cy={6} rx={42} ry={5} fill="#000" opacity={0.18} />
            <g transform="rotate(-3)">
              <rect x={-40} y={-1} width={80} height={5} rx={2.5} fill="#8B5A2B" stroke="#5A3B1F" strokeWidth={1.1} />
            </g>
            <g transform="rotate(4)">
              <rect x={-34} y={-7} width={68} height={5} rx={2.5} fill="#A06B36" stroke="#5A3B1F" strokeWidth={1.1} />
            </g>
            <g transform="rotate(-2)">
              <rect x={-26} y={-13} width={52} height={5} rx={2.5} fill="#B47845" stroke="#5A3B1F" strokeWidth={1.0} />
            </g>
            <line x1={-32} y1={-1} x2={-44} y2={-6} stroke="#5A3B1F" strokeWidth={1.2} strokeLinecap="round" />
            <line x1={36} y1={-6} x2={48} y2={-12} stroke="#5A3B1F" strokeWidth={1.2} strokeLinecap="round" />
            <line x1={-8} y1={-14} x2={-2} y2={-22} stroke="#5A3B1F" strokeWidth={1} strokeLinecap="round" />
            <circle cx={-40} cy={1.5} r={2.2} fill="#7A4A1F" stroke="#5A3B1F" strokeWidth={0.7} />
            <circle cx={40} cy={1.5} r={2.2} fill="#7A4A1F" stroke="#5A3B1F" strokeWidth={0.7} />
            {/* small foam where water piles up against the dam */}
            <ellipse cx={-30} cy={6} rx={10} ry={2.5} fill="#FFFFFF" opacity={0.4} />
            <ellipse cx={28} cy={4} rx={8} ry={2} fill="#FFFFFF" opacity={0.32} />
          </g>

          {/* River-bank stones near each bridge approach */}
          <ellipse cx={476} cy={724} rx={9} ry={5} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.1} />
          <ellipse cx={604} cy={724} rx={9} ry={5} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.1} />
          <ellipse cx={1262} cy={726} rx={9} ry={5} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.1} />
          <ellipse cx={1382} cy={726} rx={9} ry={5} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.1} />
        </g>

        {/* ── 8. PATH SYSTEM ──
             Holistic redesign:
             • Path enters from the LEFT EDGE (offscreen) and ends at
               the RIGHT EDGE (garden exit) — a complete trail across.
             • Plateau is a CLOSED LOOP: Compare Trees → Ten More →
               Round 10 → Round 100 → Mountain Heights → Three-Digit →
               Tens Tower → back to Compare Trees.
             • Twin Blossoms ↔ Cottage connector.
             • Big Bridge bridges cave-side north bank to measurement
               (south bank), giving it a real destination.
             • Skip Bridge bridges orchard (south bank) to garden-exit
               on right edge, giving it a real destination.
             All curves; no straight horizontal runs. */}
        {(() => {
          // Path enters from left edge, climbs to cottage habitat
          const leftEntryD = `M -20 470
            C 20 466, 60 472, 110 480`;
          // Cottage → Twin Blossoms (above lake, climbs gently NE)
          const cottageToTwinD = `M 110 480
            C 160 460, 220 432, 280 400`;
          // Twin Blossoms → over lake's north shore → Berry Basket
          const lakeNorthD = `M 280 400
            C 340 406, 400 416, 460 424
            C 480 428, 500 432, 510 432`;
          // Berry → descends to Compare Trees
          const berryToCompareD = `M 510 432
            C 534 446, 558 460, 580 466
            C 586 468, 590 470, 590 470`;

          // Plateau LOOP — closed circuit
          // (a) lower ridge: Compare → Ten More → Round 10 (undulating)
          const loopLowerD = `M 590 470
            C 626 462, 660 478, 692 472
            C 720 466, 748 478, 778 472
            C 810 466, 850 478, 880 470`;
          // (b) east climb: Round 10 → Round 100 (winds NE)
          const loopEastClimbD = `M 880 470
            C 902 444, 916 410, 920 380
            C 920 370, 920 364, 920 360`;
          // (c) plateau ridge: Round 100 → Mountain Heights → Three-Digit → Tens (going W)
          const loopRidgeD = `M 920 360
            C 880 372, 840 376, 800 380
            C 760 372, 720 360, 680 350
            C 640 360, 600 380, 560 400`;
          // (d) west climb: Tens → back down to Compare Trees (CLOSES THE LOOP)
          const loopWestClimbD = `M 560 400
            C 568 422, 580 446, 590 470`;

          // Glen connector: Round 100 → Sharing → Division Facts → Missing Number
          const glenConnectD = `M 920 360
            C 956 386, 1000 410, 1042 420
            C 1066 422, 1086 418, 1102 410
            C 1130 388, 1160 370, 1198 362
            C 1230 366, 1262 372, 1296 376
            C 1312 380, 1320 380, 1320 380`;
          // Glen → right edge (garden exit on the upper-right corner)
          const glenToEdgeD = `M 1320 380
            C 1356 376, 1390 374, 1418 374
            C 1430 374, 1438 374, 1440 374`;

          // Round 10 → Measurement habitat (drops south, winding)
          const round10ToMeasureD = `M 880 470
            C 882 498, 870 524, 856 544
            C 842 562, 828 574, 820 580`;

          // Cave east → Big Bridge WEST end (476, 700)
          const caveToBridgeD = `M 148 708
            C 200 698, 270 686, 340 678
            C 400 680, 444 690, 476 700`;

          // (Big Bridge plank rendered separately as a clickable structure;
          //  the bridge SVG sits between (476, 700) and (604, 700).)

          // Big Bridge EAST end (604, 700) → Measurement habitat
          const bridgeToMeasureD = `M 604 700
            C 644 678, 700 654, 752 624
            C 790 604, 814 588, 820 580`;

          // Measurement → Orchard (south bank, east-flowing curve)
          const measureToOrchardD = `M 820 580
            C 920 580, 1020 580, 1100 580
            C 1130 580, 1146 580, 1150 580`;

          // Orchard → Skip Bridge WEST end (1264, 700)
          const orchardToSkipD = `M 1150 580
            C 1188 610, 1224 644, 1248 678
            C 1256 690, 1262 696, 1264 700`;

          // (Skip Bridge plank rendered separately; sits between
          //  (1264, 700) and (1376, 700).)

          // Skip Bridge EAST end (1376, 700) → garden exit on right edge
          const skipToExitD = `M 1376 700
            C 1402 690, 1422 676, 1440 660`;

          // All non-bridge trails
          const trails = [
            leftEntryD, cottageToTwinD, lakeNorthD, berryToCompareD,
            loopLowerD, loopEastClimbD, loopRidgeD, loopWestClimbD,
            glenConnectD, glenToEdgeD, round10ToMeasureD,
            caveToBridgeD, bridgeToMeasureD, measureToOrchardD,
            orchardToSkipD, skipToExitD,
          ];
          return (
            <g pointerEvents="none">
              {/* Shadow */}
              {trails.map((d, i) => (
                <path key={`mmsh-${i}`} d={d} stroke="#A99878" strokeWidth={18} fill="none" strokeLinecap="round" opacity={0.18} />
              ))}
              {/* Surface */}
              {trails.map((d, i) => (
                <path key={`mmsu-${i}`} d={d} stroke="#EAD2A8" strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.84} />
              ))}
              {/* Highlight ribbon */}
              {trails.map((d, i) => (
                <path key={`mmhi-${i}`} d={d} stroke="#F7E6C4" strokeWidth={4.5} fill="none" strokeLinecap="round" opacity={0.46} />
              ))}
              {/* (Bridges drawn separately — they're clickable as their
                  own skill structures now, not part of the path block.) */}

              {/* Stepping stones — sparse, only on key approaches */}
              {[
                // left entry → cottage
                { x: 30, y: 470 }, { x: 70, y: 476 },
                // cottage → twin blossoms
                { x: 160, y: 462 }, { x: 220, y: 432 },
                // twin to lake-north
                { x: 320, y: 408 }, { x: 400, y: 416 }, { x: 480, y: 428 },
                // berry to compare
                { x: 540, y: 450 }, { x: 570, y: 462 },
                // loop lower ridge
                { x: 660, y: 470 }, { x: 800, y: 470 },
                // loop east climb
                { x: 902, y: 420 },
                // loop ridge
                { x: 850, y: 376 }, { x: 740, y: 360 }, { x: 620, y: 380 },
                // loop west climb
                { x: 580, y: 442 },
                // glen connector
                { x: 990, y: 388 }, { x: 1140, y: 386 }, { x: 1260, y: 376 },
                // round 10 → measurement
                { x: 866, y: 510 }, { x: 838, y: 558 },
                // cave east → big bridge
                { x: 280, y: 692 }, { x: 360, y: 680 }, { x: 440, y: 686 },
                // bridge → measurement (south bank)
                { x: 660, y: 678 }, { x: 740, y: 632 }, { x: 800, y: 596 },
                // measurement → orchard
                { x: 920, y: 580 }, { x: 1040, y: 580 },
                // orchard → skip bridge
                { x: 1216, y: 632 }, { x: 1280, y: 680 },
                // skip → exit
                { x: 1410, y: 686 }, { x: 1430, y: 670 },
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

        {/* ── 8b. BRIDGES (clickable skill structures) ──
             Bespoke wooden bridges with arched plank deck, support
             posts, and railings. The bridge SVG itself IS the click
             target for mm_big_bridge and mm_skip_bridge — no redundant
             "shadowy bridge icon" shown elsewhere. */}
        {(() => {
          const renderBridge = (
            code: string,
            cx: number,
            halfWidth: number,
            scale = 1,
          ) => {
            const struct = structures.find(s => s.code === code);
            if (!struct) return null;
            const state = structureStates[code];
            const completed = state?.completed ?? false;
            const unlocked = state?.unlocked ?? false;
            const cy = 700;
            const w = halfWidth;
            const railH = 18 * scale;
            return (
              <g
                key={`bridge-${code}`}
                style={{ cursor: 'pointer', touchAction: 'manipulation',
                  filter: completed
                    ? 'drop-shadow(0 0 6px rgba(255,217,61,0.55))'
                    : unlocked
                      ? 'drop-shadow(0 1.5px 2px rgba(107,68,35,0.42))'
                      : 'grayscale(1) brightness(0.92)',
                  opacity: unlocked ? 1 : 0.62,
                }}
                onClick={() => onStructureTap(struct)}
              >
                {/* invisible enlarged hit target */}
                <rect x={cx - w - 6} y={cy - railH - 14} width={2 * (w + 6)} height={railH + 38} fill="transparent" />

                {/* under-arch shadow on water */}
                <path
                  d={`M ${cx - w} ${cy + 6}
                      C ${cx - w * 0.5} ${cy + 12}, ${cx + w * 0.5} ${cy + 12}, ${cx + w} ${cy + 6}`}
                  stroke="#000" strokeWidth={3} fill="none" opacity={0.22} strokeLinecap="round"
                />

                {/* support posts at each abutment */}
                <rect x={cx - w - 3} y={cy - 4} width={5} height={14 * scale} fill="#5A3B1F" stroke="#3F2614" strokeWidth={1} />
                <rect x={cx + w - 2} y={cy - 4} width={5} height={14 * scale} fill="#5A3B1F" stroke="#3F2614" strokeWidth={1} />

                {/* arched deck base (planks underside) */}
                <path
                  d={`M ${cx - w} ${cy + 4}
                      C ${cx - w * 0.4} ${cy - 4 * scale}, ${cx + w * 0.4} ${cy - 4 * scale}, ${cx + w} ${cy + 4}`}
                  stroke="#7A5A3A" strokeWidth={10 * scale} fill="none" strokeLinecap="round"
                />
                {/* deck top (lighter wood) */}
                <path
                  d={`M ${cx - w} ${cy + 1}
                      C ${cx - w * 0.4} ${cy - 7 * scale}, ${cx + w * 0.4} ${cy - 7 * scale}, ${cx + w} ${cy + 1}`}
                  stroke="#C8A57A" strokeWidth={7 * scale} fill="none" strokeLinecap="round"
                />
                {/* plank cross-lines on the deck */}
                {Array.from({ length: 7 }, (_, i) => {
                  const t = (i + 0.5) / 7;
                  // bezier point at parameter t (approx)
                  const px = cx - w + 2 * w * t;
                  const py = cy - 7 * scale * 4 * t * (1 - t) + 1;
                  return (
                    <line
                      key={`plank-${code}-${i}`}
                      x1={px} y1={py - 4 * scale}
                      x2={px} y2={py + 4 * scale}
                      stroke="#7A5A3A" strokeWidth={1.2} opacity={0.7}
                    />
                  );
                })}

                {/* railings: rope-like top rail + spindles */}
                <path
                  d={`M ${cx - w} ${cy - 5}
                      C ${cx - w * 0.4} ${cy - railH}, ${cx + w * 0.4} ${cy - railH}, ${cx + w} ${cy - 5}`}
                  stroke="#5A3B1F" strokeWidth={1.6} fill="none" strokeLinecap="round"
                />
                {/* spindles dropping from rail to deck */}
                {Array.from({ length: 5 }, (_, i) => {
                  const t = (i + 1) / 6;
                  const px = cx - w + 2 * w * t;
                  // rail y at parameter t (bezier approximation)
                  const railY = cy - 5 - (railH - 5) * 4 * t * (1 - t);
                  const deckY = cy - 7 * scale * 4 * t * (1 - t) + 1;
                  return (
                    <line
                      key={`sp-${code}-${i}`}
                      x1={px} y1={railY}
                      x2={px} y2={deckY}
                      stroke="#5A3B1F" strokeWidth={1.2}
                    />
                  );
                })}

                {/* lock badge if locked, check if completed */}
                {!unlocked && (
                  <g pointerEvents="none">
                    <circle cx={cx} cy={cy - railH - 6} r={8}
                            fill="#FFFFFF" stroke="#8A7E6C" strokeWidth={1.2} />
                    <text x={cx} y={cy - railH - 3} fontSize={10} textAnchor="middle"
                          style={{ userSelect: 'none' }}>🔒</text>
                  </g>
                )}
                {completed && (
                  <g pointerEvents="none">
                    <circle cx={cx} cy={cy - railH - 6} r={8}
                            fill="#6B8E5A" stroke="#4F6F42" strokeWidth={1.2} />
                    <path
                      d={`M ${cx - 3.5} ${cy - railH - 5.5}
                          L ${cx - 0.8} ${cy - railH - 3}
                          L ${cx + 3.5} ${cy - railH - 8}`}
                      stroke="#FFFFFF" strokeWidth={1.6} fill="none"
                      strokeLinecap="round" strokeLinejoin="round"
                    />
                  </g>
                )}

                {/* small label below the bridge */}
                <rect
                  x={cx - 56} y={cy + 18} width={112} height={15} rx={7.5}
                  fill={unlocked ? 'rgba(255,250,242,0.92)' : 'rgba(239,231,212,0.78)'}
                  stroke={unlocked ? '#E8A87C' : '#C7B89A'} strokeWidth={0.9}
                />
                <text x={cx} y={cy + 28.5} textAnchor="middle"
                      fontSize={9} fontWeight={700}
                      fill={unlocked ? '#6b4423' : '#8a7050'}
                      style={{ userSelect: 'none' }}>
                  {struct.label}
                </text>
              </g>
            );
          };
          return (
            <g>
              {renderBridge('mm_big_bridge', 540, 64, 1.0)}
              {renderBridge('mm_skip_bridge', 1320, 56, 0.9)}
            </g>
          );
        })()}

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
          // Bespoke water icons for Rushing Stream + Big Falls — replace
          // emoji with hand-drawn SVG so they don't read as clip art.
          const drawBespoke = (code: string): JSX.Element | null => {
            if (code === 'mm_rushing_stream') {
              return (
                <g>
                  {/* fast curving water with a small cascade-step */}
                  <path d="M -14 -5 Q -8 -11, -2 -5 T 12 -5"
                        stroke="#7FA9B0" strokeWidth={3.2} fill="none" strokeLinecap="round" />
                  <path d="M -16 1 Q -8 -5, 0 1 T 14 1"
                        stroke="#A8CDD2" strokeWidth={2.8} fill="none" strokeLinecap="round" />
                  <path d="M -14 7 Q -6 1, 2 7 T 14 7"
                        stroke="#7FA9B0" strokeWidth={2.4} fill="none" strokeLinecap="round" />
                  {/* sparkle dots */}
                  <circle cx={-8} cy={-9} r={1.1} fill="#FFFFFF" opacity={0.85} />
                  <circle cx={6} cy={-7} r={1} fill="#FFFFFF" opacity={0.7} />
                  <circle cx={-2} cy={-2} r={0.9} fill="#FFFFFF" opacity={0.6} />
                  <circle cx={10} cy={5} r={1} fill="#FFFFFF" opacity={0.7} />
                </g>
              );
            }
            if (code === 'mm_big_falls') {
              return (
                <g>
                  {/* rocky cliff (the falls source) */}
                  <path d="M -14 -10 L -14 -4 L 14 -4 L 14 -10 Q 12 -14 8 -14 L -8 -14 Q -12 -14 -14 -10 Z"
                        fill="#7A6B58" stroke="#3F3026" strokeWidth={1.4} />
                  {/* dark seam at top of cliff */}
                  <path d="M -10 -8 Q 0 -10, 10 -8" stroke="#3F3026" strokeWidth={0.8} fill="none" opacity={0.6} />
                  {/* falling water (vertical bands) */}
                  <path d="M -8 -4 Q -8 0, -7 4 Q -7 7, -6 9" stroke="#A8CDD2" strokeWidth={2.2} fill="none" strokeLinecap="round" />
                  <path d="M -2 -4 Q -1 0, 0 5 Q 0 8, 1 10" stroke="#A8CDD2" strokeWidth={2.6} fill="none" strokeLinecap="round" />
                  <path d="M 6 -4 Q 6 0, 7 4 Q 7 7, 8 9" stroke="#A8CDD2" strokeWidth={2.2} fill="none" strokeLinecap="round" />
                  {/* white-water sheen on the falling water */}
                  <path d="M -7 -2 Q -6 2, -6 6" stroke="#FFFFFF" strokeWidth={0.9} fill="none" opacity={0.7} strokeLinecap="round" />
                  <path d="M 0 -2 Q 1 3, 2 7" stroke="#FFFFFF" strokeWidth={0.9} fill="none" opacity={0.7} strokeLinecap="round" />
                  <path d="M 7 -2 Q 8 2, 8 6" stroke="#FFFFFF" strokeWidth={0.9} fill="none" opacity={0.7} strokeLinecap="round" />
                  {/* pool at the base */}
                  <ellipse cx={0} cy={11} rx={14} ry={3} fill="#A8CDD2" stroke="#7FA9B0" strokeWidth={1} />
                  <ellipse cx={0} cy={10} rx={9} ry={1.6} fill="#FFFFFF" opacity={0.55} />
                  {/* foam splash */}
                  <circle cx={-7} cy={9} r={1.6} fill="#FFFFFF" opacity={0.7} />
                  <circle cx={6} cy={10} r={1.5} fill="#FFFFFF" opacity={0.7} />
                </g>
              );
            }
            return null;
          };

          return structures.map(s => {
            // Skip individual structures that belong to a collapsed habitat
            const habitatKey = HABITAT_BY_SKILL[s.code];
            if (habitatKey && expandedHabitat !== habitatKey) return null;
            // Skip bridge structures — bridges are rendered as their own
            // clickable SVG planks above. No redundant locked-icon overlay.
            if (s.code === 'mm_big_bridge' || s.code === 'mm_skip_bridge') return null;

            const state = structureStates[s.code];
            const completed = state?.completed ?? false;
            const unlocked = state?.unlocked ?? false;
            const isTappedLocked = tappedLocked === s.code;

            const illustrationCode = ILLUSTRATION_ALIAS[s.code] ?? s.code;
            const bespoke = drawBespoke(s.code);
            const drawn = bespoke ?? StructureIllustration({ code: illustrationCode, x: 0, y: 0, size: UNIFORM });

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

        {/* ── HABITATS ── bespoke illustration markers (NOT orbs).
             Cottage = a cottage. Orchard = apple trees. Glen = pines
             with a small squirrel on a stump. Meadow = wildflowers
             with a sundial. Cave is its own SVG (clickable directly,
             see ── 6c. CAVE ──), so the habitat block here just adds
             a label + progress for cave at its position.
             Tapping a marker → its skills fan out; tap again → close. */}
        {Object.entries(HABITAT_GROUPS).map(([key, group]) => {
          const isExpanded = expandedHabitat === key;
          const states = group.codes.map(c => structureStates[c]).filter(Boolean);
          const total = group.codes.length;
          const completedCount = states.filter(s => s?.completed).length;
          const unlockedCount = states.filter(s => s?.unlocked).length;
          const anyUnlocked = unlockedCount > 0;
          const allCompleted = completedCount === total;

          // Render the bespoke illustration for this habitat (when collapsed)
          const illustration = (() => {
            const tone = !anyUnlocked ? 0.62 : 1;
            const filter = allCompleted
              ? 'drop-shadow(0 0 6px rgba(255,217,61,0.55))'
              : 'drop-shadow(0 2px 3px rgba(107,68,35,0.42))';

            if (key === 'cottage') {
              // Woodland cabin — weathered wood plank walls, mossy
              // forest-green roof, warm lit windows, stone chimney.
              // Wrapped in scale(1.1) so it reads ~10% larger than the
              // other habitat markers (it's the visual anchor of the
              // top-left corner).
              return (
                <g style={{ filter, opacity: tone }} transform="scale(1.1)">
                  {/* ground shadow */}
                  <ellipse cx={0} cy={36} rx={38} ry={6} fill="#000" opacity={0.16} />

                  {/* stone foundation */}
                  <rect x={-30} y={32} width={60} height={6} rx={1} fill="#8A7E6C" stroke="#5A3B1F" strokeWidth={1.2} />
                  <line x1={-20} y1={32} x2={-20} y2={38} stroke="#5A3B1F" strokeWidth={0.6} />
                  <line x1={-8} y1={32} x2={-8} y2={38} stroke="#5A3B1F" strokeWidth={0.6} />
                  <line x1={6} y1={32} x2={6} y2={38} stroke="#5A3B1F" strokeWidth={0.6} />
                  <line x1={20} y1={32} x2={20} y2={38} stroke="#5A3B1F" strokeWidth={0.6} />

                  {/* wood plank walls — warm weathered brown */}
                  <rect x={-28} y={0} width={56} height={32} fill="#B47845" stroke="#5A3B1F" strokeWidth={2} />
                  {/* vertical plank seams */}
                  <line x1={-18} y1={2} x2={-18} y2={32} stroke="#5A3B1F" strokeWidth={0.8} opacity={0.6} />
                  <line x1={-8} y1={2} x2={-8} y2={32} stroke="#5A3B1F" strokeWidth={0.8} opacity={0.6} />
                  <line x1={2} y1={2} x2={2} y2={32} stroke="#5A3B1F" strokeWidth={0.8} opacity={0.6} />
                  <line x1={12} y1={2} x2={12} y2={32} stroke="#5A3B1F" strokeWidth={0.8} opacity={0.6} />
                  <line x1={22} y1={2} x2={22} y2={32} stroke="#5A3B1F" strokeWidth={0.8} opacity={0.6} />
                  {/* knot details on the planks */}
                  <circle cx={-14} cy={14} r={0.9} fill="#5A3B1F" opacity={0.7} />
                  <circle cx={6} cy={22} r={0.8} fill="#5A3B1F" opacity={0.6} />
                  <circle cx={18} cy={10} r={0.9} fill="#5A3B1F" opacity={0.7} />

                  {/* door — heavy planks with iron hinges */}
                  <rect x={-6} y={12} width={12} height={20} rx={1} fill="#5A3B1F" stroke="#3F2614" strokeWidth={1.2} />
                  <line x1={0} y1={14} x2={0} y2={30} stroke="#3F2614" strokeWidth={0.8} />
                  <rect x={-5} y={15} width={3} height={1.4} fill="#2A1810" />
                  <rect x={-5} y={28} width={3} height={1.4} fill="#2A1810" />
                  <rect x={2} y={15} width={3} height={1.4} fill="#2A1810" />
                  <rect x={2} y={28} width={3} height={1.4} fill="#2A1810" />
                  <circle cx={3} cy={22} r={0.8} fill="#FFD93D" />

                  {/* warm-lit windows — gold panes */}
                  <rect x={-23} y={8} width={11} height={11} fill="#FFD06B" stroke="#5A3B1F" strokeWidth={1.3} />
                  <line x1={-17.5} y1={8} x2={-17.5} y2={19} stroke="#5A3B1F" strokeWidth={0.8} />
                  <line x1={-23} y1={13.5} x2={-12} y2={13.5} stroke="#5A3B1F" strokeWidth={0.8} />
                  {/* warm glow inside */}
                  <rect x={-22} y={9} width={9} height={9} fill="#FFE89A" opacity={0.6} />

                  <rect x={12} y={8} width={11} height={11} fill="#FFD06B" stroke="#5A3B1F" strokeWidth={1.3} />
                  <line x1={17.5} y1={8} x2={17.5} y2={19} stroke="#5A3B1F" strokeWidth={0.8} />
                  <line x1={12} y1={13.5} x2={23} y2={13.5} stroke="#5A3B1F" strokeWidth={0.8} />
                  <rect x={13} y={9} width={9} height={9} fill="#FFE89A" opacity={0.6} />

                  {/* mossy forest-green roof — pitched, with shingles */}
                  <path d="M -34 2 L 0 -28 L 34 2 Z"
                        fill="#5C7E4F" stroke="#3F5A30" strokeWidth={2} strokeLinejoin="round" />
                  {/* roof shingle rows */}
                  <path d="M -28 -4 L 28 -4" stroke="#3F5A30" strokeWidth={0.7} opacity={0.6} />
                  <path d="M -22 -10 L 22 -10" stroke="#3F5A30" strokeWidth={0.7} opacity={0.6} />
                  <path d="M -16 -16 L 16 -16" stroke="#3F5A30" strokeWidth={0.7} opacity={0.6} />
                  {/* moss patches */}
                  <ellipse cx={-14} cy={-2} rx={6} ry={2} fill="#7BA46F" opacity={0.7} />
                  <ellipse cx={8} cy={-8} rx={5} ry={2} fill="#7BA46F" opacity={0.7} />
                  <ellipse cx={-4} cy={-16} rx={4} ry={1.6} fill="#7BA46F" opacity={0.6} />

                  {/* stone chimney */}
                  <rect x={10} y={-26} width={8} height={16} fill="#8A7E6C" stroke="#5A3B1F" strokeWidth={1.4} />
                  {/* mortar lines on chimney */}
                  <line x1={10} y1={-22} x2={18} y2={-22} stroke="#5A3B1F" strokeWidth={0.6} />
                  <line x1={10} y1={-16} x2={18} y2={-16} stroke="#5A3B1F" strokeWidth={0.6} />
                  <line x1={14} y1={-26} x2={14} y2={-10} stroke="#5A3B1F" strokeWidth={0.5} opacity={0.5} />
                  {/* curling chimney smoke */}
                  <path d="M 14 -28 Q 18 -32 16 -36 Q 14 -40 18 -44 Q 22 -48 19 -52"
                        stroke="#E8E0D3" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.7} />
                  <path d="M 14 -30 Q 11 -34 14 -38 Q 17 -42 14 -46"
                        stroke="#E8E0D3" strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={0.45} />
                </g>
              );
            }
            if (key === 'orchard') {
              return (
                <g style={{ filter, opacity: tone }}>
                  {/* ground shadow */}
                  <ellipse cx={0} cy={32} rx={48} ry={6} fill="#000" opacity={0.16} />
                  {/* left apple tree */}
                  <g transform="translate(-30, 16)">
                    <rect x={-3} y={-4} width={6} height={20} rx={2} fill="#8B5A2B" stroke="#5A3B1F" strokeWidth={1.2} />
                    <ellipse cx={0} cy={-14} rx={20} ry={18} fill="#5C7E4F" stroke="#3F5A30" strokeWidth={1.6} />
                    <ellipse cx={-5} cy={-20} rx={10} ry={7} fill="#7BA46F" />
                    <circle cx={-9} cy={-12} r={2.4} fill="#C53030" stroke="#5A3B1F" strokeWidth={0.7} />
                    <circle cx={4} cy={-16} r={2.4} fill="#C53030" stroke="#5A3B1F" strokeWidth={0.7} />
                    <circle cx={6} cy={-7} r={2.4} fill="#C53030" stroke="#5A3B1F" strokeWidth={0.7} />
                  </g>
                  {/* right apple tree */}
                  <g transform="translate(30, 16)">
                    <rect x={-3} y={-4} width={6} height={20} rx={2} fill="#8B5A2B" stroke="#5A3B1F" strokeWidth={1.2} />
                    <ellipse cx={0} cy={-14} rx={20} ry={18} fill="#5C7E4F" stroke="#3F5A30" strokeWidth={1.6} />
                    <ellipse cx={5} cy={-20} rx={10} ry={7} fill="#7BA46F" />
                    <circle cx={9} cy={-12} r={2.4} fill="#C53030" stroke="#5A3B1F" strokeWidth={0.7} />
                    <circle cx={-4} cy={-16} r={2.4} fill="#C53030" stroke="#5A3B1F" strokeWidth={0.7} />
                    <circle cx={-6} cy={-7} r={2.4} fill="#C53030" stroke="#5A3B1F" strokeWidth={0.7} />
                  </g>
                  {/* basket of apples between trees */}
                  <g transform="translate(0, 26)">
                    <ellipse cx={0} cy={3} rx={11} ry={2.5} fill="#000" opacity={0.16} />
                    <path d="M -10 -2 L -8 4 L 8 4 L 10 -2 Z" fill="#A87B4A" stroke="#5A3B1F" strokeWidth={1.2} />
                    <line x1="-8" y1="-1" x2="-7" y2="3" stroke="#5A3B1F" strokeWidth={0.6} />
                    <line x1="-3" y1="-1" x2="-2" y2="3" stroke="#5A3B1F" strokeWidth={0.6} />
                    <line x1="2" y1="-1" x2="3" y2="3" stroke="#5A3B1F" strokeWidth={0.6} />
                    <line x1="7" y1="-1" x2="8" y2="3" stroke="#5A3B1F" strokeWidth={0.6} />
                    <circle cx={-3} cy={-3} r={2.2} fill="#C53030" stroke="#5A3B1F" strokeWidth={0.6} />
                    <circle cx={3} cy={-4} r={2.2} fill="#C53030" stroke="#5A3B1F" strokeWidth={0.6} />
                    <circle cx={0} cy={-5} r={2} fill="#E04848" />
                  </g>
                </g>
              );
            }
            if (key === 'glen') {
              return (
                <g style={{ filter, opacity: tone }}>
                  <ellipse cx={0} cy={30} rx={44} ry={5} fill="#000" opacity={0.16} />
                  {/* left pine */}
                  <g transform="translate(-26, 14)">
                    <rect x={-2.5} y={4} width={5} height={12} fill="#8B5A2B" stroke="#5A3B1F" strokeWidth={1} />
                    <path d="M -16 6 L 0 -20 L 16 6 Z" fill="#5C7E4F" stroke="#3F5A30" strokeWidth={1.5} strokeLinejoin="round" />
                    <path d="M -12 -2 L 0 -16 L 12 -2 Z" fill="#7BA46F" />
                    <path d="M -8 -10 L 0 -20 L 8 -10" stroke="#3F5A30" strokeWidth={0.8} fill="none" opacity={0.5} />
                  </g>
                  {/* right pine */}
                  <g transform="translate(26, 14)">
                    <rect x={-2.5} y={4} width={5} height={12} fill="#8B5A2B" stroke="#5A3B1F" strokeWidth={1} />
                    <path d="M -16 6 L 0 -20 L 16 6 Z" fill="#5C7E4F" stroke="#3F5A30" strokeWidth={1.5} strokeLinejoin="round" />
                    <path d="M -12 -2 L 0 -16 L 12 -2 Z" fill="#7BA46F" />
                    <path d="M -8 -10 L 0 -20 L 8 -10" stroke="#3F5A30" strokeWidth={0.8} fill="none" opacity={0.5} />
                  </g>
                  {/* small mossy stump in middle */}
                  <g transform="translate(0, 22)">
                    <ellipse cx={0} cy={4} rx={11} ry={3} fill="#000" opacity={0.16} />
                    <ellipse cx={0} cy={2} rx={10} ry={4} fill="#A06B36" stroke="#5A3B1F" strokeWidth={1.1} />
                    <ellipse cx={0} cy={-1} rx={9} ry={3.2} fill="#C9A270" stroke="#5A3B1F" strokeWidth={0.9} />
                    <ellipse cx={0} cy={-1} rx={6} ry={2.1} fill="none" stroke="#8B5A2B" strokeWidth={0.5} />
                    <ellipse cx={0} cy={-1} rx={3.4} ry={1.2} fill="none" stroke="#8B5A2B" strokeWidth={0.5} />
                    <ellipse cx={1} cy={-3} rx={4.5} ry={1.2} fill="#7BA46F" opacity={0.85} />
                  </g>
                  {/* squirrel perched on the stump */}
                  <g transform="translate(2, 11)">
                    {/* tail */}
                    <path d="M -6 -2 Q -12 -8 -10 -16 Q -3 -10 -4 -2 Z"
                          fill="#A06B36" stroke="#5A3B1F" strokeWidth={1.1} strokeLinejoin="round" />
                    <path d="M -10 -16 Q -8 -14 -6 -10" stroke="#C9A270" strokeWidth={1.5} fill="none" opacity={0.7} />
                    {/* body */}
                    <ellipse cx={0} cy={-1} rx={5} ry={4} fill="#A06B36" stroke="#5A3B1F" strokeWidth={1.1} />
                    {/* head */}
                    <circle cx={3.5} cy={-4} r={3.2} fill="#A06B36" stroke="#5A3B1F" strokeWidth={1.1} />
                    {/* ear */}
                    <path d="M 2 -7 L 2.6 -8.6 L 4 -7" fill="#5A3B1F" />
                    {/* eye */}
                    <circle cx={4} cy={-4.4} r={0.6} fill="#1A0E08" />
                    {/* tiny acorn in paws */}
                    <ellipse cx={6.5} cy={-1} rx={1.4} ry={1.7} fill="#8B5A2B" stroke="#5A3B1F" strokeWidth={0.5} />
                    <rect x={6.1} y={-3.2} width={0.8} height={1.2} fill="#5A3B1F" />
                  </g>
                </g>
              );
            }
            if (key === 'measurement') {
              return (
                <g style={{ filter, opacity: tone }}>
                  <ellipse cx={0} cy={30} rx={44} ry={6} fill="#000" opacity={0.14} />
                  {/* central sundial */}
                  <g transform="translate(0, -2)">
                    <rect x={-2.5} y={-6} width={5} height={28} rx={1.5} fill="#A87B4A" stroke="#5A3B1F" strokeWidth={1.2} />
                    <ellipse cx={0} cy={-8} rx={14} ry={2.6} fill="#C9A270" stroke="#5A3B1F" strokeWidth={1.2} />
                    <ellipse cx={0} cy={-8.5} rx={11} ry={1.8} fill="#E0CBA1" />
                    {/* gnomon (sundial pointer) */}
                    <path d="M 0 -8 L -7 -16 L -7 -10 Z" fill="#5A3B1F" />
                    {/* hour ticks */}
                    <line x1={-10} y1={-9} x2={-12} y2={-9} stroke="#5A3B1F" strokeWidth={0.6} />
                    <line x1={10} y1={-9} x2={12} y2={-9} stroke="#5A3B1F" strokeWidth={0.6} />
                    <line x1={0} y1={-9.6} x2={0} y2={-11} stroke="#5A3B1F" strokeWidth={0.6} />
                  </g>
                  {/* flowers around the base */}
                  <g transform="translate(-26, 18)">
                    <line x1={0} y1={6} x2={0} y2={-2} stroke="#6B8E5A" strokeWidth={1.4} strokeLinecap="round" />
                    <circle cx={0} cy={-3} r={4} fill="#C38D9E" stroke="#5A3B1F" strokeWidth={0.8} />
                    <circle cx={-2} cy={-5} r={1.2} fill="#FFD93D" />
                    <circle cx={2} cy={-5} r={1.2} fill="#FFD93D" />
                    <circle cx={0} cy={-2} r={1.2} fill="#FFD93D" />
                  </g>
                  <g transform="translate(-12, 22)">
                    <line x1={0} y1={4} x2={0} y2={-2} stroke="#6B8E5A" strokeWidth={1.3} strokeLinecap="round" />
                    <circle cx={0} cy={-3} r={3.4} fill="#E8A87C" stroke="#5A3B1F" strokeWidth={0.7} />
                    <circle cx={-1.5} cy={-4} r={1} fill="#FFD93D" />
                    <circle cx={1.5} cy={-4} r={1} fill="#FFD93D" />
                  </g>
                  <g transform="translate(14, 22)">
                    <line x1={0} y1={4} x2={0} y2={-2} stroke="#6B8E5A" strokeWidth={1.3} strokeLinecap="round" />
                    <circle cx={0} cy={-3} r={3.4} fill="#FFD93D" stroke="#5A3B1F" strokeWidth={0.7} />
                    <circle cx={0} cy={-3} r={1.2} fill="#E8A87C" />
                  </g>
                  <g transform="translate(28, 18)">
                    <line x1={0} y1={6} x2={0} y2={-2} stroke="#6B8E5A" strokeWidth={1.4} strokeLinecap="round" />
                    <circle cx={0} cy={-3} r={4} fill="#95B88F" stroke="#5A3B1F" strokeWidth={0.8} />
                    <circle cx={0} cy={-3} r={1.4} fill="#FFD93D" />
                  </g>
                </g>
              );
            }
            // CAVE: no marker drawn here — the cave SVG itself is the marker
            return null;
          })();

          // For cave: hide hover ring + skip illustration; cave SVG handles tapping
          const drawTapTarget = key !== 'cave';

          return (
            <g key={`habitat-${key}`} pointerEvents="auto">
              <g
                transform={`translate(${group.x}, ${group.y})`}
                style={{ cursor: 'pointer', touchAction: 'manipulation' }}
                onClick={() => setExpandedHabitat(isExpanded ? null : key)}
              >
                {drawTapTarget && (
                  <rect x={-60} y={-46} width={120} height={108} fill="transparent" />
                )}
                {!isExpanded && drawTapTarget && anyUnlocked && (
                  <ellipse cx={0} cy={20} rx={50} ry={32} fill="#FFE89A" opacity={0.16} />
                )}
                {!isExpanded && illustration}

                {/* Label banner — sits below the illustration (or below
                    the cave SVG for cave). Soft, sign-like. */}
                {!isExpanded && (
                  <>
                    <rect x={-58} y={42} width={116} height={17} rx={8.5}
                          fill="#FFFAF2" stroke="#E8A87C" strokeWidth={1.1} />
                    <text x={0} y={54.5} textAnchor="middle" fontSize={10}
                          fontWeight={700} fill="#6b4423"
                          style={{ userSelect: 'none' }}>
                      {group.label}
                    </text>
                    <rect x={-22} y={61} width={44} height={13} rx={6.5}
                          fill={allCompleted ? '#6B8E5A' : '#FDF6E8'}
                          stroke={allCompleted ? '#4F6F42' : '#C7B89A'}
                          strokeWidth={0.9} />
                    <text x={0} y={70.5} textAnchor="middle" fontSize={9}
                          fontWeight={700}
                          fill={allCompleted ? '#FFFFFF' : '#6b4423'}
                          style={{ userSelect: 'none', fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>
                      {completedCount}/{total}
                    </text>
                  </>
                )}

                {/* Expanded indicator — small dim "tap to close" hint */}
                {isExpanded && drawTapTarget && (
                  <g>
                    <rect x={-46} y={28} width={92} height={14} rx={7}
                          fill="rgba(255,250,242,0.85)" stroke="#E8A87C" strokeWidth={1} />
                    <text x={0} y={38} textAnchor="middle" fontSize={9}
                          fontStyle="italic" fill="#6b4423"
                          style={{ userSelect: 'none' }}>
                      tap to close
                    </text>
                  </g>
                )}
                {isExpanded && !drawTapTarget && (
                  <g>
                    <rect x={-46} y={-32} width={92} height={14} rx={7}
                          fill="rgba(255,250,242,0.85)" stroke="#E8A87C" strokeWidth={1} />
                    <text x={0} y={-22} textAnchor="middle" fontSize={9}
                          fontStyle="italic" fill="#6b4423"
                          style={{ userSelect: 'none' }}>
                      tap cave to close
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
