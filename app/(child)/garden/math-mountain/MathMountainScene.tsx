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

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { MapStructure } from '@/lib/world/gardenMap';
import type { BranchCluster } from '@/lib/world/branchMaps';
import { BRANCH_MAP_WIDTH, BRANCH_MAP_HEIGHT } from '@/lib/world/branchMaps';
import BranchSceneLayout from '@/components/child/garden/BranchSceneLayout';
import AmbientLayer from '@/components/child/garden/AmbientLayer';
import SisterWalkers from '@/components/child/garden/SisterWalkers';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';
import {
  Tree, PineTree, StructureIllustration,
} from '@/components/child/garden/illustrations';
import type { MathMountainStructureState } from './page';

// Local Sway helper — same shape as GardenScene's private Sway: a
// gentle infinite rocking that brings static trees alive. Doesn't gate
// on reducedMotion (it's tiny ambient motion, not a pulse); the
// AmbientLayer handles the user-toggleable reduced-motion behaviour.
function Sway({
  x, y, delay = 0, children,
}: {
  x: number;
  y: number;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.g
      style={{ transformOrigin: `${x}px ${y}px`, transformBox: 'fill-box' as any }}
      animate={{ rotate: [-1.2, 1.2, -1.2] }}
      transition={{ duration: 6 + (delay % 1.2), delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.g>
  );
}

interface MathMountainSceneProps {
  learnerId: string;
  structures: MapStructure[];
  clusters: BranchCluster[];
  structureStates: Record<string, MathMountainStructureState>;
}

const W = BRANCH_MAP_WIDTH;   // 1440
const H = BRANCH_MAP_HEIGHT;  // 800

// Maps branch structure codes → an existing StructureIllustration code.
// Every Mountain skill should resolve to a bespoke hand-drawn
// illustration here; the themeEmoji fallback is only for emergencies.
const ILLUSTRATION_ALIAS: Record<string, string> = {
  mm_butterfly_make10:  'math_butterfly_arrays',
  mm_array_orchard:     'math_array_orchard',
  mm_hundreds_hollow:   'math_hundreds_hollow',
  mm_tens_tower:        'math_tens_tower',
  mm_compare_trees:     'math_compare_trees',
  mm_stories_plus:      'math_word_stories',
  mm_stories_minus:     'math_word_stories',
  mm_long_stories:      'math_word_stories',
  // Phase-3 hand-drawn illustrations
  mm_twin_bonds:        'math_twin_blossoms',
  mm_leaf_drops:        'math_leaf_drops',
  mm_berry_basket:      'math_berry_basket',
  mm_quiet_pond:        'math_quiet_pond',
  mm_sharing_squirrels: 'math_sharing_squirrels',
  mm_garden_clock:      'math_garden_clock',
  mm_sundial:           'math_sundial',
  mm_hourglass:         'math_hourglass',
  mm_even_odd:          'math_even_odd_stones',
  mm_pebble_coins:      'math_pebble_coins',
  mm_pie_slices:        'math_pie_slices',
  mm_bigger_slice:      'math_pie_slices',
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
    // Lifted from y:480 to y:466 — clears more sky above and gives the
    // cabin a more elevated "perched on the foothill" reading now that
    // rocky foothills sit beneath it.
    x: 110, y: 466, label: 'Stories Cabin',
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
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
  const [tappedLocked, setTappedLocked] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [expandedHabitat, setExpandedHabitat] = useState<string | null>(null);
  // Selected structure → triggers a preview modal so kids see the
  // place's name and a one-line frame before jumping into a session.
  // Matches the central garden's tap UX (mountain skipped this step
  // before, which made the world feel mechanical compared to home).
  const [selected, setSelected] = useState<MapStructure | null>(null);

  // SISTERS WANDER LOOP — Cecily + Esme cycle between two rest spots:
  //   • In front of the cottage (around x:130, y:570 — south of the
  //     porch deck so they're visible on the path, not behind the
  //     building)
  //   • In front of the lake (around x:380, y:580 — beside the south
  //     bank so they're not in the water)
  // They walk for ~1.3s and rest for ~7s at each stop. Reduced-motion
  // users skip the loop and just stand at the cottage front.
  const REST_SPOTS = [
    // Nudged 1 more unit lower so the sisters' figures clear the
    // bottom edge of the cottage's "1/3" progress pill entirely.
    { x: 130, y: 577 },   // cottage front
    { x: 380, y: 587 },   // lake front
  ];
  const [wanderIdx, setWanderIdx] = useState(0);
  const [wanderWalking, setWanderWalking] = useState(false);
  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      setWanderWalking(true);
      setWanderIdx(i => (i + 1) % REST_SPOTS.length);
      // walking pose ends after the SisterWalkers transition completes
      window.setTimeout(() => setWanderWalking(false), 1300);
    }, 8000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);
  const wanderTarget = REST_SPOTS[wanderIdx];

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
    // Unlocked → open a preview modal first (parity with garden).
    setSelected(s);
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
             → distant hills → foreground meadow.
             Right-side foreground also gets a pale periwinkle veil
             behind the orchard so the cool-distance contrast carries
             into the foreground (matches the way the garden lets its
             farthest hill colour bleed forward). */}
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
          fill="#8AAF84" opacity={0.55}
        />
        {/* fourth layer — pale periwinkle veil behind the orchard
            foreground (right half only). Pushes the right side back a
            half-step so the warm orchard apples pop against cool
            distance. */}
        <path
          d={`M 700 ${H * 0.62} Q 920 ${H * 0.56} 1120 ${H * 0.60} T ${W} ${H * 0.58} L ${W} ${H * 0.74} L 700 ${H * 0.74} Z`}
          fill="#C8D0E3" opacity={0.22}
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

        {/* ── 6. LAKE — moved DOWN 50px so it's clear of the upper
             spine path (path passes near y:430-460 at the lake's x
             range; lake now centered at y:520 instead of y:470). All
             sub-elements still use the original coords inside this
             group; the transform shifts the whole lake at once. */}
        <g pointerEvents="none" transform="translate(0, 50)">
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
          {/* slow shimmer highlights — same ellipse-pulse the garden's
              pond uses. Two pulses out of phase so the lake never stops
              shifting, but never feels busy. */}
          <motion.ellipse
            cx={356} cy={462} rx={20} ry={5} fill="#FFFFFF"
            animate={reducedMotion ? undefined : { opacity: [0.15, 0.45, 0.15], scaleX: [1, 1.12, 1] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '356px 462px', opacity: 0.32 }}
          />
          <motion.ellipse
            cx={410} cy={482} rx={14} ry={4} fill="#FFFFFF"
            animate={reducedMotion ? undefined : { opacity: [0.1, 0.4, 0.1], scaleX: [1, 1.18, 1] }}
            transition={{ duration: 6.5, delay: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '410px 482px', opacity: 0.28 }}
          />
          {/* concentric ripple — occasional, like a fish surfacing */}
          {!reducedMotion && (
            <motion.ellipse
              cx={390} cy={472} rx={14} ry={5} fill="none" stroke="#FFFFFF" strokeWidth={0.9}
              animate={{ rx: [8, 36], ry: [3, 11], opacity: [0.7, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeOut', repeatDelay: 4 }}
            />
          )}
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

        {/* (Lake-to-river outflow stream removed — both attempts read
            as clumsy. The lake and river live as separate water
            features now; the meadow between them stays open and
            uncluttered.) */}

        {/* ── 6b. MOSSY HILL with CAVE MOUTH + soft FOOTHILLS ──
             COMPLETELY REDESIGNED as a Miyazaki-whimsical hillside.
             A soft round mossy mound sits in the lower-left, contained
             ENTIRELY within the visible canvas (no overflow). The cave
             is a generous arched cavity carved INTO the hillside with
             warm golden light spilling out, hanging vines, mossy rim,
             and stepping stones leading to the river. A crooked pine
             leans on the crest; a worn standing-stone marks the top.
             Foothills extend gently to meet the river on the right.

             LAYERING NOTE: This block renders BEFORE the river (6d),
             so the river will overlap the lower band of this hill.
             The cave mouth is positioned ABOVE the river (top y=600,
             bottom y=685) so its warm glow stays fully visible. The
             threshold boulders + ferns sit JUST AT THE RIVER EDGE,
             reading as the cave-mouth bank from which water flows. */}
        <g pointerEvents="none">
          {/* ── FAR-DISTANT HILL SILHOUETTE ────────────────────────
              Soft mid-tone shape behind the main hill for atmospheric
              depth. */}
          <path
            d="M -10 790
               C 10 700, 50 620, 120 590
               C 200 574, 270 600, 330 660
               C 370 710, 390 760, 400 790 Z"
            fill="#9B8868" opacity={0.45}
          />

          {/* ── MAIN HILL BODY ────────────────────────────────────
              Soft round mound, hand-drawn organic curves only.
              Spans x=-10..240 horizontally, peaking at y=545, base
              at y=790 — fully contained in the viewBox. Warm earthy
              tone (#A8956F) instead of grey stone. */}
          <path
            d="M -10 790
               C -10 720, 0 640, 25 590
               C 50 560, 90 545, 130 545
               C 178 548, 218 575, 240 615
               C 260 650, 268 740, 268 790 Z"
            fill="#A8956F" stroke="#3F2614" strokeWidth={1.6} strokeLinejoin="round"
          />

          {/* HILL SHADOW — right-side falls into shadow, blending
              into the foothills */}
          <path
            d="M 175 600 C 200 625, 230 660, 252 720 C 260 750, 264 780, 268 790
               L 175 790 Z"
            fill="#7A6651" opacity={0.55}
          />

          {/* HILL HIGHLIGHT — sun catches the upper-left curve */}
          <path
            d="M -8 760
               C 0 680, 20 615, 60 565
               C 50 605, 30 660, 18 760 Z"
            fill="#D4BB8E" opacity={0.50}
          />

          {/* ── MOSSY CROWN ───────────────────────────────────────
              Wash of green grass along the top of the hill — a soft
              moss-line that follows the crest. */}
          <path
            d="M 5 600 C 30 572, 70 552, 130 548 C 180 550, 218 572, 245 615"
            stroke="#6B8E5A" strokeWidth={11} fill="none" strokeLinecap="round" opacity={0.85}
          />
          <path
            d="M 12 594 C 36 566, 76 548, 130 544 C 178 546, 215 566, 240 605"
            stroke="#7BA46F" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7}
          />
          {/* tiny grass-tuft accents along the crest */}
          {[
            { tx: 30, ty: 590 }, { tx: 70, ty: 562 },
            { tx: 110, ty: 552 }, { tx: 152, ty: 554 },
            { tx: 195, ty: 572 }, { tx: 228, ty: 600 },
          ].map((t, i) => (
            <g key={`crest-tuft-${i}`} transform={`translate(${t.tx}, ${t.ty})`}>
              <path d="M 0 0 Q -2 -7 -1 -10" stroke="#3D5C32" strokeWidth={1.1} fill="none" strokeLinecap="round" />
              <path d="M 0 0 Q 1 -8 3 -10" stroke="#3D5C32" strokeWidth={1.1} fill="none" strokeLinecap="round" />
              <path d="M 0 0 Q 3 -6 5 -8" stroke="#3D5C32" strokeWidth={1.0} fill="none" strokeLinecap="round" />
            </g>
          ))}

          {/* ── CROOKED PINE on the hill crest — Miyazaki signature.
              Trunk leans, knotted base, three little needle clouds. */}
          <g transform="translate(165, 555)">
            {/* base shadow */}
            <ellipse cx={0} cy={2} rx={5} ry={1.4} fill="#000" opacity={0.25} />
            {/* trunk — leaning right with character */}
            <path d="M 0 0 Q -2 -10 2 -22 Q 6 -32 5 -44"
                  stroke="#3F2614" strokeWidth={3.2} fill="none" strokeLinecap="round" />
            {/* trunk highlight */}
            <path d="M -1 -2 Q -3 -12 1 -24"
                  stroke="#7A5238" strokeWidth={1.1} fill="none" strokeLinecap="round" opacity={0.7} />
            {/* needle clouds — three layered tufts */}
            <ellipse cx={-4} cy={-30} rx={6} ry={3.5} fill="#3D5C32" stroke="#1F3018" strokeWidth={0.9} />
            <ellipse cx={7} cy={-38} rx={5} ry={3.2} fill="#3D5C32" stroke="#1F3018" strokeWidth={0.9} />
            <ellipse cx={4} cy={-46} rx={4} ry={2.6} fill="#5C7E4F" stroke="#1F3018" strokeWidth={0.9} />
            {/* tiny pinecones */}
            <circle cx={-2} cy={-30} r={0.7} fill="#5A3B1F" />
            <circle cx={6} cy={-40} r={0.7} fill="#5A3B1F" />
          </g>

          {/* ── STANDING STONE on the hilltop — small worn obelisk
              with a carved spiral, moss at its base. Adds a "this
              place is OLD" beat without being heavy. */}
          <g transform="translate(95, 552)">
            <ellipse cx={0} cy={2} rx={6} ry={1.2} fill="#000" opacity={0.22} />
            <path d="M -5 0 Q -6 -16 -3 -22 Q 0 -25 3 -22 Q 6 -16 5 0 Z"
                  fill="#9B948A" stroke="#3F3026" strokeWidth={1.4} strokeLinejoin="round" />
            <path d="M -4 -2 Q -5 -14 -2 -20"
                  stroke="#C2BBB0" strokeWidth={1.0} fill="none" strokeLinecap="round" opacity={0.7} />
            {/* tiny carved spiral */}
            <circle cx={1} cy={-13} r={1.3} fill="none" stroke="#3F3026" strokeWidth={0.7} />
            <circle cx={1} cy={-13} r={0.5} fill="#3F3026" />
            {/* moss skirt at the base */}
            <ellipse cx={0} cy={1} rx={6} ry={1.4} fill="#7BA46F" opacity={0.75} />
          </g>

          {/* ── CAVE MOUTH ─────────────────────────────────────────
              Generous arched cavity carved into the hillside. Top
              y=600, bottom y=683 (sits right at the river surface).
              Layered: dark interior → warm glow → mossy rim →
              hanging vines. The river appears to flow OUT from the
              bottom edge of the mouth into the meadow. */}

          {/* dark interior — the cave depth */}
          <path
            d="M 12 683
               C 6 660, 14 632, 36 618
               C 60 606, 92 606, 110 618
               C 124 628, 132 650, 130 670
               C 128 678, 124 682, 118 683 Z"
            fill="#1A0F08"
          />
          {/* deeper shadow pocket toward the back of the cave */}
          <ellipse cx={56} cy={655} rx={36} ry={20} fill="#000" opacity={0.55} />

          {/* WARM GOLDEN INTERIOR GLOW — the Miyazaki signature.
              Three concentric warm-light pools that suggest a fire
              or amber sunset deep in the cave. All sit ABOVE the
              river surface (y≤680) so they read clearly. */}
          <ellipse cx={56} cy={668} rx={38} ry={16} fill="#FFD06B" opacity={0.30} />
          <ellipse cx={58} cy={675} rx={26} ry={9} fill="#FFE89A" opacity={0.45} />
          <ellipse cx={60} cy={679} rx={14} ry={5} fill="#FFFAF2" opacity={0.55} />

          {/* tiny floating amber dust motes inside the cave */}
          <circle cx={40} cy={650} r={0.9} fill="#FFE89A" opacity={0.7} />
          <circle cx={64} cy={644} r={0.7} fill="#FFD06B" opacity={0.65} />
          <circle cx={84} cy={656} r={0.8} fill="#FFE89A" opacity={0.6} />
          <circle cx={50} cy={666} r={0.6} fill="#FFD06B" opacity={0.55} />

          {/* MOSSY RIM along the top of the arch — soft green crust */}
          <path
            d="M 12 644 C 32 614, 60 600, 92 600 C 116 604, 130 624, 132 644"
            stroke="#7BA46F" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.85}
          />
          <path
            d="M 18 636 C 36 612, 62 598, 90 598 C 112 602, 126 618, 128 636"
            stroke="#A2C794" strokeWidth={2.6} fill="none" strokeLinecap="round" opacity={0.7}
          />
          {/* moss tufts at irregular spots along the rim */}
          <circle cx={20} cy={630} r={3} fill="#7BA46F" opacity={0.75} />
          <circle cx={48} cy={612} r={2.5} fill="#A2C794" opacity={0.7} />
          <circle cx={86} cy={612} r={2.8} fill="#7BA46F" opacity={0.7} />
          <circle cx={120} cy={630} r={3} fill="#A2C794" opacity={0.7} />

          {/* HANGING VINES from the cave mouth — five soft strands.
              Originate at y=618 (the rim), drape down 18-26px. */}
          {[
            { vx: 22, len: 22 }, { vx: 42, len: 28 },
            { vx: 64, len: 20 }, { vx: 86, len: 26 }, { vx: 108, len: 18 },
          ].map((v, i) => (
            <g key={`cave-vine-${i}`}>
              <path
                d={`M ${v.vx} 618 Q ${v.vx + 1} ${618 + v.len * 0.6} ${v.vx - 1} ${618 + v.len}`}
                stroke="#5C7E4F" strokeWidth={1.3} fill="none" strokeLinecap="round" opacity={0.82}
              />
              <ellipse cx={v.vx - 1} cy={618 + v.len * 0.5} rx={1.7} ry={1.1}
                       fill="#7BA46F" opacity={0.85}
                       transform={`rotate(${i % 2 === 0 ? -20 : 18} ${v.vx - 1} ${618 + v.len * 0.5})`} />
              <ellipse cx={v.vx - 1} cy={618 + v.len * 0.85} rx={1.5} ry={1.0}
                       fill="#A2C794" opacity={0.78} />
            </g>
          ))}

          {/* ── CAVE-MOUTH THRESHOLD — boulders + ferns flanking the
              entrance, sitting RIGHT at the river edge (y≈685) so
              they read as the bank from which the water emerges. */}
          {/* left boulder cluster */}
          <ellipse cx={6} cy={685} rx={14} ry={5} fill="#7A6B58" stroke="#3F3026" strokeWidth={1.4} />
          <ellipse cx={4} cy={682} rx={9} ry={3} fill="#A89878" opacity={0.85} />
          {/* right boulder cluster */}
          <ellipse cx={130} cy={685} rx={13} ry={5} fill="#7A6B58" stroke="#3F3026" strokeWidth={1.4} />
          <ellipse cx={134} cy={682} rx={8} ry={2.8} fill="#A89878" opacity={0.85} />

          {/* FERNS at left of the mouth — small fronds at the threshold */}
          <g transform="translate(28, 686)">
            <path d="M 0 0 Q -3 -10 -7 -16" stroke="#3F5A30" strokeWidth={1.4} fill="none" strokeLinecap="round" />
            <path d="M 0 0 Q 0 -12 -2 -20" stroke="#3F5A30" strokeWidth={1.4} fill="none" strokeLinecap="round" />
            <path d="M 0 0 Q 3 -10 5 -16" stroke="#3F5A30" strokeWidth={1.3} fill="none" strokeLinecap="round" />
            {/* leaflet pinnae on the central frond */}
            <path d="M 0 -4 Q -2 -5 -3 -3" stroke="#5C7E4F" strokeWidth={0.6} fill="none" />
            <path d="M -1 -10 Q -3 -11 -4 -9" stroke="#5C7E4F" strokeWidth={0.6} fill="none" />
            <path d="M -1 -16 Q -3 -17 -4 -15" stroke="#5C7E4F" strokeWidth={0.6} fill="none" />
          </g>
          {/* FERNS at right of the mouth */}
          <g transform="translate(118, 686)">
            <path d="M 0 0 Q -3 -10 -6 -16" stroke="#3F5A30" strokeWidth={1.4} fill="none" strokeLinecap="round" />
            <path d="M 0 0 Q 0 -12 -1 -18" stroke="#3F5A30" strokeWidth={1.4} fill="none" strokeLinecap="round" />
            <path d="M 0 0 Q 3 -10 4 -16" stroke="#3F5A30" strokeWidth={1.3} fill="none" strokeLinecap="round" />
          </g>

          {/* tiny mushrooms at the threshold — Miyazaki forest detail */}
          <g transform="translate(15, 690)">
            <ellipse cx={0} cy={0} rx={3} ry={1.6} fill="#C84A3A" stroke="#3F2614" strokeWidth={0.7} />
            <rect x={-1} y={0} width={2} height={3} fill="#FFFAF2" stroke="#3F2614" strokeWidth={0.5} />
            <circle cx={-1} cy={-0.3} r={0.5} fill="#FFFAF2" />
            <circle cx={1} cy={0.2} r={0.4} fill="#FFFAF2" />
          </g>

          {/* ── FOOTHILLS extending from hill base to the right ──
              Gentle rolling shapes (NOT jagged rocks) that carry the
              hillside's earthy palette toward the meadow. They sit
              BELOW the river surface so the river covers their crest
              naturally — reading as a low ridge along the river's
              south bank. */}
          <path
            d="M 240 790
               C 270 752, 308 740, 348 744
               C 388 752, 428 760, 460 768
               L 460 800 L 240 800 Z"
            fill="#A8956F" stroke="#3F2614" strokeWidth={1.3} strokeLinejoin="round"
          />
          {/* foothill darker shading */}
          <path
            d="M 360 752 C 400 760, 440 766, 460 770 L 460 800 L 360 800 Z"
            fill="#7A6651" opacity={0.45}
          />
          {/* mossy crest along foothill tops */}
          <path
            d="M 250 768 C 280 750, 320 745, 360 748 C 400 754, 430 762, 455 768"
            stroke="#6B8E5A" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.85}
          />
          <path
            d="M 252 766 C 280 748, 320 743, 360 746 C 400 752, 428 760, 452 766"
            stroke="#7BA46F" strokeWidth={1.8} fill="none" strokeLinecap="round" opacity={0.65}
          />

          {/* tiny pines on the foothill crests */}
          <g transform="translate(290, 745)">
            <line x1={0} y1={0} x2={0} y2={-9} stroke="#3F2614" strokeWidth={1.0} strokeLinecap="round" />
            <path d="M 0 -9 L -3 -6 L 3 -6 Z M 0 -6 L -2.5 -3 L 2.5 -3 Z"
                  fill="#3D5C32" stroke="#1F3018" strokeWidth={0.5} strokeLinejoin="round" />
          </g>
          <g transform="translate(370, 750)">
            <line x1={0} y1={0} x2={0} y2={-8} stroke="#3F2614" strokeWidth={1.0} strokeLinecap="round" />
            <path d="M 0 -8 L -2.5 -5 L 2.5 -5 Z M 0 -5 L -2.5 -2 L 2.5 -2 Z"
                  fill="#3D5C32" stroke="#1F3018" strokeWidth={0.5} strokeLinejoin="round" />
          </g>

          {/* wildflowers scattered on the foothills */}
          {[
            { fx: 270, fy: 760, c: '#FFD166' },
            { fx: 320, fy: 752, c: '#FFB7C5' },
            { fx: 340, fy: 754, c: '#E6B0D0' },
            { fx: 410, fy: 762, c: '#FFD166' },
            { fx: 432, fy: 766, c: '#FFB7C5' },
          ].map((f, i) => (
            <g key={`fh-flower-${i}`} transform={`translate(${f.fx}, ${f.fy})`}>
              {[0, 90, 180, 270].map(deg => (
                <ellipse key={deg} cx={0} cy={-1.3} rx={1} ry={1.7} fill={f.c}
                         stroke="#8B6938" strokeWidth={0.25} transform={`rotate(${deg})`} />
              ))}
              <circle cx={0} cy={0} r={0.7} fill="#FFD166" />
            </g>
          ))}

          {/* a small fern at the foothill's eastern end, near the river bank */}
          <g transform="translate(450, 768)">
            <path d="M 0 0 Q -3 -8 -6 -14" stroke="#3F5A30" strokeWidth={1.2} fill="none" strokeLinecap="round" />
            <path d="M 0 0 Q 0 -10 -1 -16" stroke="#3F5A30" strokeWidth={1.2} fill="none" strokeLinecap="round" />
            <path d="M 0 0 Q 3 -8 4 -14" stroke="#3F5A30" strokeWidth={1.1} fill="none" strokeLinecap="round" />
          </g>
        </g>

        {/* ── 6c. CAVE CLICK-TARGET ─────────────────────────────
             The cave VISUAL is rendered above (section 6b — the cave
             mouth carved into the mossy hillside). This is just an
             invisible hit-target covering that cave-mouth area so a
             tap navigates to the operations_cave habitat interior
             (same pattern as Bunny Burrow). The three cave skills
             (Hundred's Hollow, Fast Facts, Regroup Ridge) live
             INSIDE that route, not as inline-expand pins here. */}
        <g
          style={{ cursor: 'pointer', touchAction: 'manipulation' }}
          onClick={() => router.push(`/garden/habitat/operations_cave?learner=${learnerId}`)}
        >
          {/* invisible hit target — generous box over the new cave
              mouth area (cave mouth top y=600, bottom y=683 sitting
              right at the river edge, horizontal extent x=12..132). */}
          <rect x={-10} y={595} width={150} height={100} fill="transparent" />
          {/* (the cave VISUAL lives in section 6b above as an
              integrated part of the mossy hillside; this wrapper
              just provides the navigation hit-target.) */}
        </g>

        {/* ── 6d. RIVER — emerges from cave, meanders naturally east ──
             The river center-line BENDS: starts high near the cave
             (y:686), descends to its lowest point at the log-jam
             (y:740), climbs back up toward the right-edge garden exit
             (y:680). That gentle 60-pixel vertical wander turns a
             "horizontal strip" into a watercourse with a destination.
             BIG BRIDGE at (540, 700), SKIP BRIDGE at (1320, 700) —
             both bridge decks sit just above the river surface where
             it dips beneath them. Log-jam dam at midpoint (820, 740). */}
        <g pointerEvents="none">
          {/* wet-earth bank — emerges directly from the cave mouth at
              x:71 on the left edge of the scene */}
          <path
            d="M 71 686
               C 110 684, 160 680, 220 681
               C 290 686, 360 689, 440 692
               C 500 700, 540 708, 620 720
               C 720 728, 820 734, 920 730
               C 1010 716, 1100 711, 1200 706
               C 1280 700, 1320 695, 1380 689
               C 1420 680, 1440 673, 1440 673
               L 1440 707
               C 1420 711, 1380 716, 1320 729
               C 1280 734, 1200 740, 1100 746
               C 1010 750, 920 766, 820 770
               C 720 766, 620 758, 540 742
               C 500 738, 440 730, 360 723
               C 290 720, 220 716, 160 712
               C 110 711, 71 706, 71 706 Z"
            fill="#6B8E5A" opacity={0.30}
          />
          {/* primary water body — bends with the bank */}
          <path
            d="M 71 692
               C 110 690, 160 688, 220 685
               C 290 690, 360 693, 440 696
               C 500 706, 540 714, 620 724
               C 720 734, 820 740, 920 736
               C 1010 720, 1100 717, 1200 712
               C 1280 706, 1320 701, 1380 695
               C 1420 686, 1440 679, 1440 679
               L 1440 701
               C 1420 705, 1380 708, 1320 723
               C 1280 728, 1200 734, 1100 740
               C 1010 744, 920 760, 820 762
               C 720 758, 620 750, 540 736
               C 500 730, 440 723, 360 717
               C 290 713, 220 709, 160 706
               C 110 704, 71 700, 71 700 Z"
            fill="#A8CDD2"
          />
          {/* deeper channel — follows the dip from cave-mouth east */}
          <path
            d="M 90 696
               C 160 700, 240 706, 320 714
               C 410 722, 500 728, 600 732
               C 700 738, 800 742, 900 738
               C 1000 728, 1100 720, 1200 712
               C 1320 700, 1438 686"
            stroke="#7FA9B0" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.6}
          />
          {/* shimmer ripples — track the bend */}
          {[
            { x: 130, y: 694 }, { x: 200, y: 692 },
            { x: 280, y: 690 }, { x: 360, y: 698 }, { x: 460, y: 710 },
            { x: 580, y: 722 }, { x: 720, y: 732 }, { x: 880, y: 744 },
            { x: 980, y: 736 }, { x: 1100, y: 726 }, { x: 1240, y: 712 },
            { x: 1380, y: 692 },
          ].map((p, i) => (
            <path
              key={`mmrr-${i}`}
              d={`M ${p.x - 7} ${p.y} Q ${p.x} ${p.y - 4} ${p.x + 7} ${p.y}`}
              stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.55 - (i % 3) * 0.08} strokeLinecap="round"
            />
          ))}

          {/* foam at the cave-mouth source — dense splash where water
              emerges from the dark. Now centered at x:71-95, the
              actual cave mouth on the left edge. */}
          <ellipse cx={75} cy={696} rx={18} ry={6} fill="#FFFFFF" opacity={0.7} />
          <ellipse cx={88} cy={690} rx={12} ry={4} fill="#FFFFFF" opacity={0.6} />
          <ellipse cx={102} cy={696} rx={9} ry={3} fill="#FFFFFF" opacity={0.45} />
          <path d="M 73 686 Q 86 684 100 686" stroke="#FFFFFF" strokeWidth={1.4} fill="none" opacity={0.78} strokeLinecap="round" />
          <path d="M 76 702 Q 90 700 104 702" stroke="#FFFFFF" strokeWidth={1.1} fill="none" opacity={0.65} strokeLinecap="round" />
          <path d="M 96 710 Q 110 708 122 710" stroke="#FFFFFF" strokeWidth={0.9} fill="none" opacity={0.5} strokeLinecap="round" />
          {/* tiny droplets being thrown up at the source */}
          <circle cx={75} cy={680} r={1.2} fill="#FFFFFF" opacity={0.7} />
          <circle cx={84} cy={676} r={1} fill="#FFFFFF" opacity={0.6} />
          <circle cx={92} cy={682} r={0.8} fill="#FFFFFF" opacity={0.55} />

          {/* small reeds along the top bank — y values track the curve */}
          {[[300, 686], [430, 696], [690, 724], [970, 716], [1140, 706], [1380, 686]].map(([rx, ry], i) => (
            <g key={`mmrd-${i}`} transform={`translate(${rx},${ry})`}>
              <line x1={0} y1={0} x2={-1} y2={-12} stroke="#6B8E5A" strokeWidth={1.4} strokeLinecap="round" />
              <line x1={0} y1={0} x2={2} y2={-14} stroke="#6B8E5A" strokeWidth={1.4} strokeLinecap="round" />
              <line x1={0} y1={0} x2={-3} y2={-8} stroke="#6B8E5A" strokeWidth={1.2} strokeLinecap="round" />
            </g>
          ))}

          {/* LOG-JAM DAM at the river's deepest point (820, 740) —
              three logs at natural angles + protruding twigs. Sits
              half-submerged where water piles up against it. */}
          <g transform="translate(820, 740)">
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

          {/* River-bank stones near each bridge approach — north bank
              just before/after the deck. Y values follow the new bend. */}
          <ellipse cx={476} cy={702} rx={9} ry={5} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.1} />
          <ellipse cx={604} cy={744} rx={9} ry={5} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.1} />
          <ellipse cx={1262} cy={702} rx={9} ry={5} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.1} />
          <ellipse cx={1382} cy={689} rx={9} ry={5} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.1} />
        </g>

        {/* ── 8. PATH SYSTEM ──
             Main spine + a loop branch. The spine sweeps west → east
             across the upper meadow. At Tens Tower (560, 400) the
             trail FORKS — one branch continues east along the upper
             route, the other drops south through the lower meadow
             (measurement → orchard) and meets the spine again at the
             lower-right corner exit. Same loop topology a real hiking
             trail would have. */}
        {(() => {
          // ── A. UPPER SPINE — west edge → fork at Tens → exit ──
          const upperSpineD = `M 30 410
            C 80 440, 140 470, 200 470
            C 320 460, 460 420, 560 400
            C 660 410, 760 425, 880 430
            C 1020 450, 1160 480, 1280 530
            C 1340 570, 1400 620, 1440 660`;

          // ── B. LOWER LOOP — fork at Tens → DOWN to the stream →
          // along the stream's north bank → joins the upper spine
          // at the lower-right exit. The loop dips to y:650 in the
          // middle so it's right alongside the river (top y:680). */}
          const lowerLoopD = `M 560 400
            C 540 480, 540 580, 600 640
            C 700 660, 800 660, 900 660
            C 1000 660, 1100 660, 1200 660
            C 1280 660, 1340 640, 1380 620
            C 1410 630, 1430 650, 1440 660`;

          const trails = [upperSpineD, lowerLoopD];
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

              {/* Stepping stones along the upper spine + lower loop.
                  Sparse — ~14 total, picking out the fork and key
                  approaches on each branch. */}
              {[
                // Upper spine, west → east through the fork
                { x: 90, y: 442 },          // sign → cottage
                { x: 250, y: 466 },         // past lake-area
                { x: 420, y: 432 },         // approaching fork
                { x: 670, y: 416 },         // past fork on upper
                { x: 940, y: 432 },         // plateau east
                { x: 1140, y: 478 },        // descending
                { x: 1310, y: 552 },        // toward exit
                { x: 1410, y: 632 },        // exit corner
                // Lower loop, fork → stream → exit
                { x: 548, y: 480 },         // descent from fork
                { x: 580, y: 600 },         // dropping to stream
                { x: 760, y: 658 },         // along stream
                { x: 980, y: 660 },         // along stream
                { x: 1180, y: 660 },        // along stream east
                { x: 1340, y: 638 },        // climbing toward exit
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

        {/* (Bridge SVG block removed — the bridges to nowhere on the
            river were a dead-end design. mm_big_bridge and
            mm_skip_bridge skill structures now render through the
            normal structures.map below, on the lower loop.) */}

        {/* ── 9b. TEA-HOUSE PAVILION ──
             Warm character anchor on the plateau ridge. Pure
             decoration — nothing to tap, just a place for the eye to
             rest. Matches Bachan's Japanese-garden vocabulary back at
             the central scene (torii / stone lantern / bamboo). The
             pavilion sits in the gap above mm_three_digit_tower, in
             the empty band between the painted peaks and the plateau
             structures. */}
        <g transform="translate(680, 296)" pointerEvents="none">
          {/* ground shadow */}
          <ellipse cx={0} cy={20} rx={30} ry={4} fill="#000" opacity={0.20} />
          {/* wooden platform / floor */}
          <rect x={-24} y={14} width={48} height={6} rx={1} fill="#8B5A2B" stroke="#5A3B1F" strokeWidth={1.2} />
          {/* support posts */}
          <rect x={-20} y={-2} width={3} height={16} fill="#5A3B1F" />
          <rect x={17} y={-2} width={3} height={16} fill="#5A3B1F" />
          {/* upturned thatched roof */}
          <path d="M -28 -2 Q -32 -8 -22 -10 L 22 -10 Q 32 -8 28 -2 Z"
                fill="#A06B36" stroke="#5A3B1F" strokeWidth={1.4} strokeLinejoin="round" />
          <path d="M -22 -10 L -8 -22 L 8 -22 L 22 -10 Z"
                fill="#B47845" stroke="#5A3B1F" strokeWidth={1.4} strokeLinejoin="round" />
          {/* roof shingle hint */}
          <path d="M -16 -14 L 16 -14" stroke="#5A3B1F" strokeWidth={0.6} opacity={0.5} />
          <path d="M -10 -18 L 10 -18" stroke="#5A3B1F" strokeWidth={0.6} opacity={0.5} />
          {/* roof finial */}
          <circle cx={0} cy={-23} r={1.6} fill="#5A3B1F" />
          {/* paper lantern hanging under the eaves */}
          <line x1={0} y1={-10} x2={0} y2={-4} stroke="#5A3B1F" strokeWidth={0.8} />
          <ellipse cx={0} cy={-1} rx={4} ry={4.5} fill="#FFD06B" stroke="#5A3B1F" strokeWidth={1} />
          <line x1={-3.5} y1={-1} x2={3.5} y2={-1} stroke="#5A3B1F" strokeWidth={0.5} opacity={0.5} />
          {/* warm glow */}
          <ellipse cx={0} cy={-1} rx={10} ry={9} fill="#FFE89A" opacity={0.25} />
          {/* low railing across the open front */}
          <line x1={-18} y1={9} x2={18} y2={9} stroke="#5A3B1F" strokeWidth={1} />
          <line x1={-12} y1={9} x2={-12} y2={14} stroke="#5A3B1F" strokeWidth={0.6} />
          <line x1={0} y1={9} x2={0} y2={14} stroke="#5A3B1F" strokeWidth={0.6} />
          <line x1={12} y1={9} x2={12} y2={14} stroke="#5A3B1F" strokeWidth={0.6} />
          {/* tiny tea-bowl on the floor */}
          <ellipse cx={-6} cy={11} rx={2.4} ry={1} fill="#FFFAF2" stroke="#5A3B1F" strokeWidth={0.6} />
          {/* steam wisp */}
          {!reducedMotion && (
            <motion.path
              d="M -6 9 Q -4 4 -7 -1 Q -8 -5 -5 -8"
              stroke="#E8E0D3" strokeWidth={1.3} fill="none" strokeLinecap="round"
              animate={{ opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          {reducedMotion && (
            <path d="M -6 9 Q -4 4 -7 -1 Q -8 -5 -5 -8"
                  stroke="#E8E0D3" strokeWidth={1.3} fill="none" strokeLinecap="round" opacity={0.5} />
          )}
        </g>

        {/* ── 9c. STONE CAIRN + INARI MARKER ──
             Tiny shrine-cairn on the orchard's southeastern edge.
             Stacked stones with a small vermilion mini-torii on top —
             reads as "this place has been here a long time." Same
             vocabulary as the central garden's torii at the path
             terminus. Pure decoration. */}
        <g transform="translate(1380, 540)" pointerEvents="none">
          {/* ground shadow */}
          <ellipse cx={0} cy={22} rx={20} ry={3} fill="#000" opacity={0.18} />
          {/* moss patch under the cairn */}
          <ellipse cx={0} cy={21} rx={18} ry={3} fill="#7BA46F" opacity={0.62} />
          {/* base stone */}
          <ellipse cx={0} cy={16} rx={14} ry={6} fill="#A89D8A" stroke="#5A3B1F" strokeWidth={1.2} />
          <ellipse cx={-2} cy={13} rx={8} ry={2.4} fill="#C2B4A0" />
          {/* mid stone */}
          <ellipse cx={-1} cy={6} rx={10} ry={4.5} fill="#8A7E6C" stroke="#5A3B1F" strokeWidth={1.1} />
          <ellipse cx={-3} cy={3.5} rx={5} ry={1.8} fill="#A89D8A" />
          {/* top stone */}
          <ellipse cx={1} cy={-2} rx={7} ry={3.2} fill="#9B948A" stroke="#5A3B1F" strokeWidth={1} />
          {/* tiny mini-torii balanced on top */}
          <rect x={-6} y={-12} width={1.6} height={8} fill="#B8563A" stroke="#5A2818" strokeWidth={0.6} />
          <rect x={4.4} y={-12} width={1.6} height={8} fill="#B8563A" stroke="#5A2818" strokeWidth={0.6} />
          <rect x={-7.5} y={-13} width={15} height={1.4} fill="#8A3F2B" stroke="#5A2818" strokeWidth={0.5} />
          <path d="M -9 -16 Q -10 -18 -7 -18 L 7 -18 Q 10 -18 9 -16 L 7 -14 L -7 -14 Z"
                fill="#B8563A" stroke="#5A2818" strokeWidth={0.6} strokeLinejoin="round" />
          {/* tiny pebble offering at the base */}
          <ellipse cx={9} cy={20} rx={2} ry={0.9} fill="#C2B4A0" stroke="#5A3B1F" strokeWidth={0.5} />
        </g>

        {/* ── 10. APPLE ORCHARD trees — flank the Orchard habitat ──
             Sway-wrapped so the canopy breathes; staggered delays so
             they don't all rock in sync. */}
        <Sway x={1010} y={460} delay={0.2}><Tree x={1010} y={460} size={40} variant={1} /></Sway>
        <Sway x={1380} y={460} delay={1.4}><Tree x={1380} y={460} size={42} variant={2} /></Sway>

        {/* ── 11. DIVISION GLEN — pine clearing flanks the Glen habitat ── */}
        <Sway x={1030} y={324} delay={0.6}><PineTree x={1030} y={324} size={46} /></Sway>
        <Sway x={1140} y={324} delay={1.8}><PineTree x={1140} y={324} size={50} /></Sway>
        <Sway x={1260} y={328} delay={0.0}><PineTree x={1260} y={328} size={48} /></Sway>
        <Sway x={1380} y={324} delay={2.4}><PineTree x={1380} y={324} size={48} /></Sway>

        {/* ── 12. FRAMING TREES ──
             Rules: no tree within 60px of any structure; trees only at
             edges and mid-distance. NONE below y:600 (bottom buffer). */}

        {/* Distant ridge between peaks (NW between Peak 5 & Peak 3) */}
        <Sway x={130} y={300} delay={1.0}><PineTree x={130} y={300} size={44} /></Sway>
        <Sway x={460} y={300} delay={2.1}><PineTree x={460} y={300} size={42} /></Sway>

        {/* Mid-distance pines on the upper hills (between plateau structures) */}
        <Sway x={620} y={310} delay={0.4}><PineTree x={620} y={310} size={40} /></Sway>
        <Sway x={860} y={310} delay={1.6}><PineTree x={860} y={310} size={42} /></Sway>

        {/* Far-right edge — separates Glen from frame */}
        <Sway x={1402} y={460} delay={0.8}><Tree x={1402} y={460} size={50} variant={3} /></Sway>

        {/* ── AMBIENT LIFE ──
             Same shared component the central garden uses: clouds,
             sakura petals, leaves, pollen, an occasional bird, and
             fireflies after dusk. Honours the user's reduced-motion
             toggle internally. Without this layer the mountain felt
             dead next to the central garden's living scene. */}
        <AmbientLayer reducedMotion={reducedMotion} />

        {/* ── SISTER WALKERS ──
             Cecily + Esme emerge from the garden signpost on the
             left edge and then WANDER along the path between two
             rest spots: in front of the cottage and in front of the
             lake. They pause ~7s at each stop. The previous version
             parked them at (110, 460) which was inside/behind the
             cottage; now they rest at y:570 which is south of the
             cottage front edge. */}
        <SisterWalkers
          target={wanderTarget}
          walking={wanderWalking}
          reducedMotion={reducedMotion}
          emergeFrom={{ x: 34, y: 414 }}
        />

        {/* ── Garden exit signpost on the LEFT edge ──
             Mirrors the Forest sign but pointing WEST — central garden
             is to the west of the mountain (you entered through the
             garden's east-side gate). Clickable, routes back to /garden. */}
        <g
          transform="translate(34, 414)"
          style={{ cursor: 'pointer', touchAction: 'manipulation' }}
          onClick={() => router.push(`/garden?learner=${learnerId}`)}
          role="button"
          aria-label="back to garden"
          tabIndex={0}
        >
          {/* invisible hit target */}
          <rect x={-46} y={-44} width={94} height={64} fill="transparent" />
          {/* wooden post + ground shadow */}
          <ellipse cx={0} cy={10} rx={9} ry={2.4} fill="#000" opacity={0.22} />
          <rect x={-3} y={-22} width={6} height={32} rx={2} fill="#8B5A2B" stroke="#5A3B1F" strokeWidth={1.2} />
          {/* sign board with the LEFT-pointing arrow tab */}
          <path
            d="M 32 -34 L -26 -34 Q -30 -34 -32 -32 L -38 -26 L -32 -20 Q -30 -18 -26 -18 L 32 -18 Q 34 -18 34 -20 L 34 -32 Q 34 -34 32 -34 Z"
            fill="#FFFAF2" stroke="#8B5A2B" strokeWidth={1.5} strokeLinejoin="round"
          />
          <text
            x={2} y={-23.5} textAnchor="middle"
            fontSize={9.5} fontWeight={700} fill="#6b4423"
            style={{ userSelect: 'none' }}
          >
            ← garden
          </text>
          {/* tiny rope wrap on the post */}
          <path d="M -3 -8 Q 0 -8 3 -10" stroke="#8A6635" strokeWidth={1} fill="none" strokeLinecap="round" />
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
          // UNIFIED across all branch scenes — same icon size, label
          // box, fontSize so the three worlds read as one design
          // language. Forest also uses these exact values.
          const UNIFORM = 38;
          const HIT = 34;
          const LABEL_Y = 28;
          const LABEL_W = 92;
          const LABEL_H = 17;
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
            // BRIDGE icons — Big Number Bridge + Skip Count Bridge.
            // Drawn BIGGER + BOLDER than before so they read clearly
            // at the small icon size (UNIFORM=38px). The previous
            // version had too much fine detail that disappeared at
            // tile size. Both bridges use the same shape with slight
            // styling difference (Skip Count gets stepping-stone
            // visible spans, Big Number gets a solid plank deck).
            if (code === 'mm_big_bridge' || code === 'mm_skip_bridge') {
              const isSkip = code === 'mm_skip_bridge';
              return (
                <g>
                  {/* STREAM beneath — bold blue ribbon */}
                  <path d="M -19 9 Q -10 7, 0 9 T 19 9"
                        stroke="#7FA9B0" strokeWidth={4} fill="none" strokeLinecap="round" />
                  <path d="M -16 12 Q -6 10, 4 12 T 17 12"
                        stroke="#A8CDD2" strokeWidth={2.6} fill="none" strokeLinecap="round" />
                  <circle cx={-6} cy={7} r={0.9} fill="#FFFFFF" opacity={0.85} />
                  <circle cx={8} cy={11} r={0.7} fill="#FFFFFF" opacity={0.7} />

                  {/* STONE ABUTMENTS at each bank — chunky mossy stones */}
                  <ellipse cx={-18} cy={4} rx={5} ry={2.4} fill="#7A6B58"
                           stroke="#3F3026" strokeWidth={1.0} />
                  <ellipse cx={18}  cy={4} rx={5} ry={2.4} fill="#7A6B58"
                           stroke="#3F3026" strokeWidth={1.0} />
                  <ellipse cx={-18} cy={2} rx={3} ry={1.0} fill="#5C7E4F" opacity={0.7} />
                  <ellipse cx={18}  cy={2} rx={3} ry={1.0} fill="#5C7E4F" opacity={0.7} />

                  {/* STONE ARCH underneath the deck — bigger + bolder
                      so it clearly reads as an arched bridge. Span
                      from x=-16 to x=16 (wider than before). */}
                  <path d="M -16 0 Q 0 -14, 16 0 Q 0 -8, -16 0 Z"
                        fill="#3F2614" />
                  <path d="M -15 -1 Q 0 -13, 15 -1 L 13 -1 Q 0 -10, -13 -1 Z"
                        fill="#C9A66A" stroke="#3F2614" strokeWidth={1.4}
                        strokeLinejoin="round" />
                  {/* CENTER KEYSTONE — chunky trapezoid, clearly visible */}
                  <path d="M -3 -12 L 3 -12 L 2 -7 L -2 -7 Z"
                        fill="#A88044" stroke="#3F2614" strokeWidth={1.0} strokeLinejoin="round" />
                  {/* arch underside highlight */}
                  <path d="M -13 -1 Q 0 -10, 13 -1"
                        stroke="#E2C690" strokeWidth={1.2} fill="none"
                        strokeLinecap="round" opacity={0.85} />

                  {/* WOODEN PLANK DECK across the top — taller + bolder.
                      Spans x=-18 to 18, sits at y=-3. */}
                  <rect x={-18} y={-5} width={36} height={4} fill="#7B4F2C"
                        stroke="#3F2614" strokeWidth={1.2} strokeLinejoin="round" />
                  {/* plank seams — Skip Count gets gaps suggesting
                      stepping spans; Big Number gets solid seams */}
                  {isSkip ? (
                    <>
                      <rect x={-12} y={-5} width={2} height={4} fill="#3F2614" />
                      <rect x={-2}  y={-5} width={2} height={4} fill="#3F2614" />
                      <rect x={8}   y={-5} width={2} height={4} fill="#3F2614" />
                    </>
                  ) : (
                    <>
                      <line x1={-10} y1={-5} x2={-10} y2={-1} stroke="#3F2614" strokeWidth={0.7} />
                      <line x1={-2}  y1={-5} x2={-2}  y2={-1} stroke="#3F2614" strokeWidth={0.7} />
                      <line x1={6}   y1={-5} x2={6}   y2={-1} stroke="#3F2614" strokeWidth={0.7} />
                      <line x1={14}  y1={-5} x2={14}  y2={-1} stroke="#3F2614" strokeWidth={0.7} />
                    </>
                  )}
                  {/* deck top highlight */}
                  <line x1={-17} y1={-4} x2={17} y2={-4} stroke="#A0703F"
                        strokeWidth={0.6} opacity={0.85} strokeLinecap="round" />

                  {/* HANDRAILS — top rail spans the full deck width with
                      bold visible posts at each end + middle */}
                  <line x1={-18} y1={-9} x2={18} y2={-9} stroke="#5A3B1F"
                        strokeWidth={1.6} strokeLinecap="round" />
                  {/* end posts */}
                  <line x1={-18} y1={-9} x2={-18} y2={-5} stroke="#5A3B1F"
                        strokeWidth={1.6} strokeLinecap="round" />
                  <line x1={18}  y1={-9} x2={18}  y2={-5} stroke="#5A3B1F"
                        strokeWidth={1.6} strokeLinecap="round" />
                  {/* middle posts */}
                  <line x1={-9}  y1={-9} x2={-9}  y2={-5} stroke="#5A3B1F"
                        strokeWidth={1.1} strokeLinecap="round" />
                  <line x1={0}   y1={-9} x2={0}   y2={-5} stroke="#5A3B1F"
                        strokeWidth={1.1} strokeLinecap="round" />
                  <line x1={9}   y1={-9} x2={9}   y2={-5} stroke="#5A3B1F"
                        strokeWidth={1.1} strokeLinecap="round" />
                  {/* tiny end-post finials */}
                  <circle cx={-18} cy={-10} r={1.2} fill="#5A3B1F" />
                  <circle cx={18}  cy={-10} r={1.2} fill="#5A3B1F" />
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
            // ── 3-DIGIT TOWER — a small whimsical pagoda-tower with
            //    three stacked tiers, narrower at the top. Soft beige
            //    stone, dark bark outlines, a tiny pennant flag. */
            if (code === 'mm_three_digit_tower') {
              return (
                <g>
                  {/* ground shadow */}
                  <ellipse cx={0} cy={15} rx={11} ry={1.6} fill="#000" opacity={0.22} />
                  {/* base tier (largest) */}
                  <rect x={-10} y={6} width={20} height={9} rx={1.2}
                        fill="#D4B68A" stroke="#3F2614" strokeWidth={1.4} />
                  {/* base roof eaves */}
                  <path d="M -12 6 L 12 6 L 9 3 L -9 3 Z"
                        fill="#7B4F2C" stroke="#3F2614" strokeWidth={1.2} strokeLinejoin="round" />
                  {/* middle tier */}
                  <rect x={-7.5} y={-3} width={15} height={7} rx={1}
                        fill="#E2C290" stroke="#3F2614" strokeWidth={1.3} />
                  <path d="M -9.5 -3 L 9.5 -3 L 7 -5.5 L -7 -5.5 Z"
                        fill="#7B4F2C" stroke="#3F2614" strokeWidth={1.2} strokeLinejoin="round" />
                  {/* top tier (smallest) */}
                  <rect x={-5} y={-10} width={10} height={5.5} rx={0.9}
                        fill="#F0D2A0" stroke="#3F2614" strokeWidth={1.2} />
                  <path d="M -7 -10 L 7 -10 L 5 -12 L -5 -12 Z"
                        fill="#7B4F2C" stroke="#3F2614" strokeWidth={1.1} strokeLinejoin="round" />
                  {/* tiny windows on each tier */}
                  <rect x={-2} y={8} width={4} height={5} rx={0.5} fill="#3F2614" />
                  <rect x={-1.5} y={-1} width={3} height={4} rx={0.4} fill="#3F2614" />
                  <rect x={-1} y={-8} width={2} height={3} rx={0.3} fill="#3F2614" />
                  {/* pennant flag on top — pole + triangle */}
                  <line x1={0} y1={-12} x2={0} y2={-17}
                        stroke="#3F2614" strokeWidth={0.8} strokeLinecap="round" />
                  <path d="M 0 -17 L 4 -16 L 0 -14.5 Z"
                        fill="#C84A3A" stroke="#3F2614" strokeWidth={0.7} strokeLinejoin="round" />
                </g>
              );
            }
            // ── MOUNTAIN HEIGHTS COMPARE — twin snow-capped peaks,
            //    one taller than the other (the "compare" cue). */
            if (code === 'mm_mountain_compare') {
              return (
                <g>
                  {/* ground shadow */}
                  <ellipse cx={0} cy={14} rx={14} ry={1.6} fill="#000" opacity={0.22} />
                  {/* far/smaller peak */}
                  <path d="M -14 13 L -7 -2 L 1 13 Z"
                        fill="#7A6B58" stroke="#3F3026" strokeWidth={1.4} strokeLinejoin="round" />
                  {/* far peak snow cap */}
                  <path d="M -10 4 L -7 -2 L -4 4 L -6 5 L -8 4 Z"
                        fill="#FFFAF2" stroke="#3F3026" strokeWidth={0.9} strokeLinejoin="round" />
                  {/* near/taller peak — overlaps the small one */}
                  <path d="M -3 13 L 6 -10 L 14 13 Z"
                        fill="#9B8868" stroke="#3F3026" strokeWidth={1.5} strokeLinejoin="round" />
                  {/* near peak snow cap — bigger */}
                  <path d="M 1 1 L 6 -10 L 11 1 L 8 3 L 5 2 L 2 3 Z"
                        fill="#FFFAF2" stroke="#3F3026" strokeWidth={1} strokeLinejoin="round" />
                  {/* shading on the near peak's right face */}
                  <path d="M 6 -10 L 14 13 L 9 13 Z"
                        fill="#5C4F3F" opacity={0.45} />
                  {/* sun behind the peaks */}
                  <circle cx={11} cy={-8} r={2.6} fill="#FFD06B" opacity={0.85} />
                </g>
              );
            }
            // ── TEN MORE / TEN LESS — a leaf with two tiny arrow
            //    indicators on either side suggesting bidirectional
            //    movement (±10). Stays in the nature palette. */
            if (code === 'mm_ten_more_less') {
              return (
                <g>
                  {/* ground shadow */}
                  <ellipse cx={0} cy={14} rx={11} ry={1.4} fill="#000" opacity={0.22} />
                  {/* leaf body — almond shape */}
                  <path d="M 0 -12 C 8 -8, 10 4, 0 13 C -10 4, -8 -8, 0 -12 Z"
                        fill="#7BA46F" stroke="#3F5A30" strokeWidth={1.6} strokeLinejoin="round" />
                  {/* leaf vein (center) */}
                  <path d="M 0 -10 L 0 11"
                        stroke="#3F5A30" strokeWidth={1} strokeLinecap="round" opacity={0.85} />
                  {/* side veins */}
                  <path d="M 0 -4 Q -4 -3 -6 -1" stroke="#3F5A30" strokeWidth={0.7} fill="none" opacity={0.7} />
                  <path d="M 0 -4 Q 4 -3 6 -1" stroke="#3F5A30" strokeWidth={0.7} fill="none" opacity={0.7} />
                  <path d="M 0 2 Q -4 3 -6 5" stroke="#3F5A30" strokeWidth={0.7} fill="none" opacity={0.7} />
                  <path d="M 0 2 Q 4 3 6 5" stroke="#3F5A30" strokeWidth={0.7} fill="none" opacity={0.7} />
                  {/* leaf highlight */}
                  <path d="M -3 -8 C -5 -4, -5 0, -3 4"
                        stroke="#A2C794" strokeWidth={1.6} fill="none" strokeLinecap="round" opacity={0.7} />
                  {/* LEFT down-arrow indicator (10 less) */}
                  <g transform="translate(-15, 0)">
                    <line x1={0} y1={-3} x2={0} y2={3}
                          stroke="#3F2614" strokeWidth={1.4} strokeLinecap="round" />
                    <path d="M -2 1 L 0 3 L 2 1"
                          stroke="#3F2614" strokeWidth={1.4} fill="none"
                          strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  {/* RIGHT up-arrow indicator (10 more) */}
                  <g transform="translate(15, 0)">
                    <line x1={0} y1={-3} x2={0} y2={3}
                          stroke="#3F2614" strokeWidth={1.4} strokeLinecap="round" />
                    <path d="M -2 -1 L 0 -3 L 2 -1"
                          stroke="#3F2614" strokeWidth={1.4} fill="none"
                          strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                </g>
              );
            }
            // ── ROUND TO 10 / ROUND TO 100 — a curled fern frond
            //    (koru-style spiral). Round-100 gets a thicker spiral
            //    + a second tiny sprout to differentiate. */
            if (code === 'mm_round_10' || code === 'mm_round_100') {
              const isHundred = code === 'mm_round_100';
              return (
                <g>
                  {/* ground shadow */}
                  <ellipse cx={0} cy={14} rx={10} ry={1.4} fill="#000" opacity={0.22} />
                  {/* stem rising from the base */}
                  <path d="M 0 13 C 2 8, -2 4, 1 -2"
                        stroke="#3F5A30" strokeWidth={2.2} fill="none" strokeLinecap="round" />
                  {/* main spiral frond — koru curl */}
                  <path
                    d={isHundred
                      ? "M 1 -2 C -10 -4, -12 8, -2 9 C 6 9, 7 1, 1 0 C -3 0, -3 5, 1 5"
                      : "M 1 -2 C -8 -3, -10 6, -2 7 C 4 7, 5 1, 1 0"}
                    stroke="#5C7E4F" strokeWidth={isHundred ? 3.2 : 2.6}
                    fill="none" strokeLinecap="round"
                  />
                  {/* highlight along the spiral */}
                  <path
                    d={isHundred
                      ? "M 1 -2 C -8 -3, -10 7, -3 8"
                      : "M 1 -2 C -7 -3, -9 5, -2 6"}
                    stroke="#A2C794" strokeWidth={1.0}
                    fill="none" strokeLinecap="round" opacity={0.75}
                  />
                  {/* tiny dot at the center of the spiral */}
                  <circle cx={1} cy={isHundred ? 4 : 2} r={1} fill="#3F5A30" />
                  {/* a small leaf on the stem for round-100 to read different */}
                  {isHundred && (
                    <>
                      <path d="M 1 4 Q 7 3, 9 -1 Q 5 0, 1 4 Z"
                            fill="#7BA46F" stroke="#3F5A30" strokeWidth={1} strokeLinejoin="round" />
                    </>
                  )}
                </g>
              );
            }
            // ── FAST FACTS — bold lightning bolt (the cave-skill icon
            //    we already use, but exposed on the main scene too so
            //    expanded-cave stops aren't emoji-only). */
            if (code === 'mm_fast_facts') {
              return (
                <g>
                  {/* ground shadow */}
                  <ellipse cx={0} cy={14} rx={9} ry={1.3} fill="#000" opacity={0.22} />
                  {/* bolt back-glow */}
                  <path d="M -1 -13 L -7 4 L -1 4 L 2 13 L 9 -2 L 3 -2 L 6 -13 Z"
                        fill="#FFD06B" opacity={0.55} transform="translate(0.4 0.6)" />
                  {/* bolt body */}
                  <path d="M -1 -13 L -7 4 L -1 4 L 2 13 L 9 -2 L 3 -2 L 6 -13 Z"
                        fill="#FFD93D" stroke="#7B4F2C" strokeWidth={1.6}
                        strokeLinejoin="round" />
                  {/* highlight stroke down the front */}
                  <path d="M -1 -10 L -4 2"
                        stroke="#FFFAF2" strokeWidth={1.2} fill="none"
                        strokeLinecap="round" opacity={0.75} />
                </g>
              );
            }
            // ── REGROUPING RIDGE — three layered ridge silhouettes. */
            if (code === 'mm_regroup_ridge') {
              return (
                <g>
                  {/* ground shadow */}
                  <ellipse cx={0} cy={14} rx={14} ry={1.6} fill="#000" opacity={0.22} />
                  {/* far ridge */}
                  <path d="M -16 6 L -10 -3 L -3 4 L 4 -6 L 12 2 L 16 -1 L 16 13 L -16 13 Z"
                        fill="#9B8868" stroke="#3F3026" strokeWidth={1.4} strokeLinejoin="round" />
                  {/* near ridge — lower + darker */}
                  <path d="M -16 10 L -12 5 L -6 9 L 0 4 L 6 8 L 12 5 L 16 8 L 16 13 L -16 13 Z"
                        fill="#7A6B58" stroke="#3F3026" strokeWidth={1.4} strokeLinejoin="round" />
                  {/* tiny snow caps on the far peaks */}
                  <path d="M -11 -2 L -10 -3 L -8 -1 Z" fill="#FFFAF2" />
                  <path d="M 3 -5 L 4 -6 L 6 -3 Z" fill="#FFFAF2" />
                  {/* a couple of pine silhouettes */}
                  <path d="M -7 9 L -8 6 L -6 6 Z M -6.5 6 L -7.5 4 L -5.5 4 Z"
                        fill="#3D5C32" />
                  <path d="M 5 9 L 4 6 L 6 6 Z" fill="#3D5C32" />
                </g>
              );
            }
            // ── EQUAL GARDENS — three equal flower clusters in a row
            //    (the "equal groups" idea behind multiplication). */
            if (code === 'mm_equal_garden') {
              return (
                <g>
                  {/* ground shadow */}
                  <ellipse cx={0} cy={14} rx={14} ry={1.6} fill="#000" opacity={0.22} />
                  {/* three identical flower bunches */}
                  {[-11, 0, 11].map((cx, i) => (
                    <g key={`fb-${i}`} transform={`translate(${cx}, 4)`}>
                      {/* stem */}
                      <line x1={0} y1={9} x2={0} y2={-2}
                            stroke="#3F5A30" strokeWidth={1.2} strokeLinecap="round" />
                      {/* leaves */}
                      <ellipse cx={-2.5} cy={4} rx={2} ry={1} fill="#5C7E4F"
                               stroke="#3F5A30" strokeWidth={0.6} transform="rotate(-30 -2.5 4)" />
                      <ellipse cx={2.5} cy={6} rx={2} ry={1} fill="#5C7E4F"
                               stroke="#3F5A30" strokeWidth={0.6} transform="rotate(30 2.5 6)" />
                      {/* petals */}
                      <circle cx={0} cy={-5} r={2.2} fill="#FFD93D" stroke="#7B4F2C" strokeWidth={0.7} />
                      <circle cx={-2.4} cy={-3} r={2} fill="#FFD06B" stroke="#7B4F2C" strokeWidth={0.7} />
                      <circle cx={2.4} cy={-3} r={2} fill="#FFD06B" stroke="#7B4F2C" strokeWidth={0.7} />
                      <circle cx={0} cy={-1.5} r={2} fill="#FFB7C5" stroke="#7B4F2C" strokeWidth={0.7} />
                      {/* center */}
                      <circle cx={0} cy={-3} r={1.2} fill="#7B4F2C" />
                    </g>
                  ))}
                </g>
              );
            }
            // ── TIMES TABLES (×) — two crossed leafy twigs forming a
            //    natural "×". Two variants share this drawing. */
            if (code === 'mm_times_to_5' || code === 'mm_times_to_10') {
              const isTen = code === 'mm_times_to_10';
              return (
                <g>
                  {/* ground shadow */}
                  <ellipse cx={0} cy={14} rx={12} ry={1.6} fill="#000" opacity={0.22} />
                  {/* twig 1 — top-left to bottom-right */}
                  <path d="M -11 -10 Q 0 0, 11 11"
                        stroke="#7B4F2C" strokeWidth={3.2} fill="none" strokeLinecap="round" />
                  {/* twig 2 — top-right to bottom-left */}
                  <path d="M 11 -10 Q 0 0, -11 11"
                        stroke="#7B4F2C" strokeWidth={3.2} fill="none" strokeLinecap="round" />
                  {/* twig highlights */}
                  <path d="M -10 -9 Q 0 0, 10 10"
                        stroke="#A0703F" strokeWidth={0.9} fill="none" strokeLinecap="round" opacity={0.7} />
                  <path d="M 10 -9 Q 0 0, -10 10"
                        stroke="#A0703F" strokeWidth={0.9} fill="none" strokeLinecap="round" opacity={0.7} />
                  {/* tiny leaves at twig ends */}
                  <ellipse cx={-12} cy={-11} rx={2.4} ry={1.4} fill="#7BA46F"
                           stroke="#3F5A30" strokeWidth={0.6} transform="rotate(-45 -12 -11)" />
                  <ellipse cx={12} cy={12} rx={2.4} ry={1.4} fill="#7BA46F"
                           stroke="#3F5A30" strokeWidth={0.6} transform="rotate(-45 12 12)" />
                  <ellipse cx={12} cy={-11} rx={2.4} ry={1.4} fill="#7BA46F"
                           stroke="#3F5A30" strokeWidth={0.6} transform="rotate(45 12 -11)" />
                  <ellipse cx={-12} cy={12} rx={2.4} ry={1.4} fill="#7BA46F"
                           stroke="#3F5A30" strokeWidth={0.6} transform="rotate(45 -12 12)" />
                  {/* center dot */}
                  <circle cx={0} cy={0} r={1.8} fill="#FFD93D" stroke="#7B4F2C" strokeWidth={0.8} />
                  {/* extra inner ring on ×10 to differentiate */}
                  {isTen && <circle cx={0} cy={0} r={3.4} fill="none" stroke="#7B4F2C" strokeWidth={0.8} />}
                </g>
              );
            }
            // ── DIVISION FACTS — three stacked pebbles forming a
            //    vertical ÷ shape (top dot, dash, bottom dot). */
            if (code === 'mm_division_facts') {
              return (
                <g>
                  {/* ground shadow */}
                  <ellipse cx={0} cy={14} rx={10} ry={1.5} fill="#000" opacity={0.22} />
                  {/* top pebble */}
                  <ellipse cx={0} cy={-9} rx={3.5} ry={3} fill="#9B948A"
                           stroke="#3F2614" strokeWidth={1.3} />
                  <ellipse cx={-1} cy={-10} rx={1.4} ry={0.8} fill="#C2BBB0" opacity={0.85} />
                  {/* middle dash — long flat stone */}
                  <ellipse cx={0} cy={0} rx={11} ry={2.4} fill="#7A6B58"
                           stroke="#3F2614" strokeWidth={1.4} />
                  <ellipse cx={-2} cy={-1} rx={6} ry={0.9} fill="#A89878" opacity={0.8} />
                  {/* bottom pebble */}
                  <ellipse cx={0} cy={9} rx={3.5} ry={3} fill="#9B948A"
                           stroke="#3F2614" strokeWidth={1.3} />
                  <ellipse cx={-1} cy={8} rx={1.4} ry={0.8} fill="#C2BBB0" opacity={0.85} />
                  {/* a tiny leaf tucked behind the dash */}
                  <ellipse cx={-12} cy={1} rx={2.2} ry={1.1} fill="#7BA46F"
                           stroke="#3F5A30" strokeWidth={0.5} transform="rotate(-25 -12 1)" />
                </g>
              );
            }
            // ── MISSING NUMBER — wooden puzzle piece with a "?" */
            if (code === 'mm_missing_number') {
              return (
                <g>
                  {/* ground shadow */}
                  <ellipse cx={0} cy={14} rx={11} ry={1.5} fill="#000" opacity={0.22} />
                  {/* puzzle piece with classic knob on top + slot on right */}
                  <path
                    d="M -10 -7
                       L -3 -7
                       C -3 -10, 3 -10, 3 -7
                       L 10 -7
                       L 10 -1
                       C 13 -1, 13 5, 10 5
                       L 10 11
                       L -10 11 Z"
                    fill="#D4B68A" stroke="#3F2614" strokeWidth={1.6} strokeLinejoin="round"
                  />
                  {/* wood grain hints */}
                  <path d="M -8 -3 Q 0 -2, 8 -3"
                        stroke="#A0703F" strokeWidth={0.6} fill="none" opacity={0.6} />
                  <path d="M -8 5 Q 0 6, 8 5"
                        stroke="#A0703F" strokeWidth={0.6} fill="none" opacity={0.6} />
                  {/* highlight along the top edge */}
                  <path d="M -9 -6 L -3.5 -6"
                        stroke="#F0D2A0" strokeWidth={0.9} fill="none"
                        strokeLinecap="round" opacity={0.85} />
                  {/* the question mark — burned/etched into the wood */}
                  <text x={0} y={6} textAnchor="middle" fontSize={11}
                        fontWeight={800} fill="#3F2614" fontFamily="Georgia, serif">
                    ?
                  </text>
                </g>
              );
            }
            return null;
          };

          return structures.map(s => {
            // Skip individual structures that belong to a collapsed habitat
            const habitatKey = HABITAT_BY_SKILL[s.code];
            if (habitatKey && expandedHabitat !== habitatKey) return null;

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
                    <circle cx={UNIFORM * 0.4} cy={-UNIFORM * 0.4} r={9}
                            fill="#FFFFFF" stroke="#8A7E6C" strokeWidth={1.3} />
                    <text
                      x={UNIFORM * 0.4} y={-UNIFORM * 0.4 + 3.4}
                      fontSize={11} textAnchor="middle"
                      style={{ userSelect: 'none' }}
                    >🔒</text>
                  </g>
                )}

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

                {/* Label pill — uniform across branches */}
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
              // Stories Cottage v3 — closer to the user's reference
              // photo: STEEPER A-frame roof (~38° pitch), 4 green
              // chairs evenly spaced inside the porch, 4 small
              // rectangular windows in the back wall behind the
              // chairs + 2 triangular gable windows up high, no
              // fascia "nub" along the eave, prominent center
              // staircase leading up to the chairs.
              return (
                <g style={{ filter, opacity: tone }} transform="scale(1.1)">
                  {/* ground shadow */}
                  <ellipse cx={0} cy={50} rx={62} ry={6} fill="#000" opacity={0.20} />

                  {/* DECK SKIRT (under-deck shadow) */}
                  <rect x={-58} y={40} width={116} height={6} fill="#3F2614" stroke="#2A1810" strokeWidth={1} />

                  {/* DECK SURFACE */}
                  <rect x={-58} y={28} width={116} height={12} fill="#A06B36" stroke="#5A3B1F" strokeWidth={1.5} />
                  <line x1={-58} y1={32} x2={58} y2={32} stroke="#5A3B1F" strokeWidth={0.5} opacity={0.55} />
                  <line x1={-58} y1={36} x2={58} y2={36} stroke="#5A3B1F" strokeWidth={0.5} opacity={0.55} />
                  {[-44, -30, -16, -2, 12, 26, 40].map(xi => (
                    <line key={`dp-${xi}`} x1={xi} y1={28} x2={xi} y2={40} stroke="#5A3B1F" strokeWidth={0.4} opacity={0.4} />
                  ))}

                  {/* SIDE RAILINGS — left + right of the central stairs */}
                  <line x1={-58} y1={20} x2={-22} y2={20} stroke="#5A3B1F" strokeWidth={1.4} strokeLinecap="round" />
                  <line x1={-58} y1={20} x2={-58} y2={28} stroke="#5A3B1F" strokeWidth={1.4} strokeLinecap="round" />
                  <line x1={-22} y1={20} x2={-22} y2={28} stroke="#5A3B1F" strokeWidth={1.4} strokeLinecap="round" />
                  {[-50, -42, -34, -28].map(xi => (
                    <line key={`lr-${xi}`} x1={xi} y1={20} x2={xi} y2={28} stroke="#5A3B1F" strokeWidth={0.6} />
                  ))}
                  <line x1={22} y1={20} x2={58} y2={20} stroke="#5A3B1F" strokeWidth={1.4} strokeLinecap="round" />
                  <line x1={58} y1={20} x2={58} y2={28} stroke="#5A3B1F" strokeWidth={1.4} strokeLinecap="round" />
                  <line x1={22} y1={20} x2={22} y2={28} stroke="#5A3B1F" strokeWidth={1.4} strokeLinecap="round" />
                  {[28, 34, 42, 50].map(xi => (
                    <line key={`rr-${xi}`} x1={xi} y1={20} x2={xi} y2={28} stroke="#5A3B1F" strokeWidth={0.6} />
                  ))}

                  {/* CENTRAL STAIRCASE — three steps that LAND FLUSH
                      with the deck surface at y:28 instead of starting
                      at the deck's bottom edge (y:40). Top step is
                      now level with the porch floor like the photo;
                      bottom step lands at ground level (y:40 = the
                      deck-skirt top). Each step 4 units tall. */}
                  <rect x={-22} y={28} width={44} height={4} fill="#D4B58A" stroke="#5A3B1F" strokeWidth={1} />
                  <rect x={-22} y={32} width={44} height={4} fill="#C8A57A" stroke="#5A3B1F" strokeWidth={1} />
                  <rect x={-22} y={36} width={44} height={4} fill="#B89265" stroke="#5A3B1F" strokeWidth={1} />
                  {/* stair side stringers run from deck surface to ground */}
                  <line x1={-22} y1={28} x2={-22} y2={40} stroke="#5A3B1F" strokeWidth={1.2} />
                  <line x1={22} y1={28} x2={22} y2={40} stroke="#5A3B1F" strokeWidth={1.2} />
                  {/* stair handrails — short verticals at each side */}
                  <line x1={-22} y1={22} x2={-22} y2={30} stroke="#5A3B1F" strokeWidth={1.4} strokeLinecap="round" />
                  <line x1={22} y1={22} x2={22} y2={30} stroke="#5A3B1F" strokeWidth={1.4} strokeLinecap="round" />

                  {/* LOG-CABIN BACK WALL — eaves slightly LOWER (y:-9
                      vs the previous y:-12) so the building reads as
                      shorter / wider, and the steeper roof above it
                      reads as more triangular. Wall now spans y:-9 to
                      y:28 (height 37). Renders FIRST so windows,
                      chairs, and front posts layer on top. */}
                  <rect x={-52} y={-9} width={104} height={37} fill="#7A5A3A" stroke="#3F2614" strokeWidth={1.2} />
                  {/* 6 log courses across the wall */}
                  {[-3, 3, 9, 15, 21].map(yi => (
                    <line key={`lg-${yi}`} x1={-52} y1={yi} x2={52} y2={yi} stroke="#5A3B1F" strokeWidth={1} opacity={0.7} />
                  ))}
                  {/* end-cut log nubs at corners (one per course) */}
                  {[-3, 3, 9, 15, 21].map(yi => (
                    <g key={`lc-${yi}`}>
                      <ellipse cx={-52} cy={yi - 2} rx={3} ry={2.4} fill="#A06B36" stroke="#5A3B1F" strokeWidth={0.8} />
                      <ellipse cx={52}  cy={yi - 2} rx={3} ry={2.4} fill="#A06B36" stroke="#5A3B1F" strokeWidth={0.8} />
                    </g>
                  ))}

                  {/* FOUR TALL RECTANGULAR WINDOWS — span y:-5 to y:13
                      (height 18, was 19). Bottom raised by 1 unit so
                      there's a 1-unit gap between the window sill and
                      the green chair backs at y:14. NO mullion
                      cross-bars (panes removed); each window is just
                      a gold-glowing pane in a dark frame. */}
                  {[-32, -12, 8, 28].map(xi => (
                    <g key={`win-${xi}`}>
                      <rect x={xi - 6} y={-5} width={12} height={18} fill="#FFD06B" stroke="#5A3B1F" strokeWidth={1.2} />
                      <rect x={xi - 5} y={-4} width={10} height={16} fill="#FFE89A" opacity={0.65} />
                    </g>
                  ))}

                  {/* FOUR GREEN PORCH CHAIRS — sit on the deck IN
                      FRONT of the windows */}
                  {[-32, -12, 8, 28].map(xi => (
                    <g key={`chair-${xi}`}>
                      <rect x={xi - 4} y={14} width={8} height={10} rx={1} fill="#5C7E4F" stroke="#3F2614" strokeWidth={0.9} />
                      <rect x={xi - 5} y={21} width={10} height={3} fill="#4F6F42" stroke="#3F2614" strokeWidth={0.6} />
                      <line x1={xi - 4} y1={24} x2={xi - 4} y2={28} stroke="#3F2614" strokeWidth={0.7} />
                      <line x1={xi + 4} y1={24} x2={xi + 4} y2={28} stroke="#3F2614" strokeWidth={0.7} />
                      <line x1={xi} y1={15} x2={xi} y2={22} stroke="#3F2614" strokeWidth={0.5} opacity={0.55} />
                    </g>
                  ))}

                  {/* TWO MAIN TIMBER POSTS at the front of the porch */}
                  <rect x={-36} y={-9} width={6} height={37} fill="#8B5A2B" stroke="#3F2614" strokeWidth={1.2} />
                  <rect x={30} y={-9} width={6} height={37} fill="#8B5A2B" stroke="#3F2614" strokeWidth={1.2} />
                  <line x1={-33} y1={-5} x2={-33} y2={26} stroke="#5A3B1F" strokeWidth={0.5} opacity={0.55} />
                  <line x1={33} y1={-5} x2={33} y2={26} stroke="#5A3B1F" strokeWidth={0.5} opacity={0.55} />

                  {/* STRING LIGHTS between the two front posts */}
                  <path d="M -33 3 Q 0 7 33 3" stroke="#5A3B1F" strokeWidth={0.5} fill="none" />
                  {[-22, -10, 0, 10, 22].map(xi => (
                    <ellipse key={`sl-${xi}`} cx={xi} cy={5} rx={1.3} ry={1.6} fill="#FFD06B" stroke="#5A3B1F" strokeWidth={0.5} />
                  ))}

                  {/* STEEPER A-FRAME ROOF — peak at y:-58, eaves at
                      y:-9 (rise 49 over run 132 = ~37° pitch). Reads
                      as much more triangular than the previous
                      gentler version. Eaves overhang the wall edges
                      slightly (-66/+66 vs wall at -52/+52). */}
                  <path d="M -66 -9 L 0 -58 L 66 -9 Z"
                        fill="#7A5A3A" stroke="#3F2614" strokeWidth={2} strokeLinejoin="miter" />
                  {/* roof shake/shingle hint — three subtle horizontal
                      lines parallel to the eave */}
                  <path d="M -56 -16 L 56 -16" stroke="#3F2614" strokeWidth={0.5} opacity={0.4} />
                  <path d="M -44 -25 L 44 -25" stroke="#3F2614" strokeWidth={0.5} opacity={0.4} />
                  <path d="M -30 -36 L 30 -36" stroke="#3F2614" strokeWidth={0.5} opacity={0.4} />

                  {/* HORIZONTAL CROSS BAR at the eave line — chunky
                      timber beam spanning the gable, like the photo's
                      visible tie beam under the roof */}
                  <rect x={-66} y={-11} width={132} height={4} fill="#5A3B1F" stroke="#3F2614" strokeWidth={1} />
                  {/* small wood-grain hint on the beam */}
                  <line x1={-60} y1={-9.5} x2={60} y2={-9.5} stroke="#3F2614" strokeWidth={0.4} opacity={0.55} />

                  {/* TWO TRIANGULAR GABLE WINDOWS — wider and shorter
                      than the previous version (x:±36 at the eave-bar
                      level up to x:0 at y:-42, instead of x:±28 up to
                      y:-50). Reads less spire-y, more like the
                      photo's short-and-wide gable vents. */}
                  <path d="M -36 -14 L -2 -42 L -2 -14 Z" fill="#FFD06B" stroke="#5A3B1F" strokeWidth={1.1} strokeLinejoin="miter" />
                  <path d="M  2 -14 L  2 -42 L 36 -14 Z" fill="#FFD06B" stroke="#5A3B1F" strokeWidth={1.1} strokeLinejoin="miter" />
                  {/* glow inside each */}
                  <path d="M -32 -15 L -3 -38 L -3 -15 Z" fill="#FFE89A" opacity={0.6} />
                  <path d="M  3 -15 L  3 -38 L 32 -15 Z" fill="#FFE89A" opacity={0.6} />
                  {/* king-post divider between the two gable windows */}
                  <line x1={0} y1={-50} x2={0} y2={-14} stroke="#3F2614" strokeWidth={1.4} />
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

          // For cave: hide hover ring + skip illustration; cave SVG
          // handles tapping. Cave navigates to its route; other
          // habitats toggle inline-expand.
          const drawTapTarget = key !== 'cave';
          const handleHabitatTap = key === 'cave'
            ? () => router.push(`/garden/habitat/operations_cave?learner=${learnerId}`)
            : () => setExpandedHabitat(isExpanded ? null : key);

          return (
            <g key={`habitat-${key}`} pointerEvents="auto">
              <g
                transform={`translate(${group.x}, ${group.y})`}
                style={{ cursor: 'pointer', touchAction: 'manipulation' }}
                onClick={handleHabitatTap}
              >
                {drawTapTarget && (
                  <rect x={-60} y={-46} width={120} height={108} fill="transparent" />
                )}
                {!isExpanded && drawTapTarget && anyUnlocked && (
                  <ellipse cx={0} cy={20} rx={50} ry={32} fill="#FFE89A" opacity={0.16} />
                )}
                {!isExpanded && illustration}

                {/* Label banner — sits below the illustration. The
                    cottage habitat needs an extra ~14 units of clearance
                    because its illustration extends further down (deck +
                    stairs scaled 1.1x reach to y≈53). Other habitats
                    keep the original label position. */}
                {!isExpanded && (() => {
                  const labelY = key === 'cottage' ? 56 : 42;
                  return (
                    <>
                      <rect x={-58} y={labelY} width={116} height={17} rx={8.5}
                            fill="#FFFAF2" stroke="#E8A87C" strokeWidth={1.1} />
                      <text x={0} y={labelY + 12.5} textAnchor="middle" fontSize={10}
                            fontWeight={700} fill="#6b4423"
                            style={{ userSelect: 'none' }}>
                        {group.label}
                      </text>
                      <rect x={-22} y={labelY + 19} width={44} height={13} rx={6.5}
                            fill={allCompleted ? '#6B8E5A' : '#FDF6E8'}
                            stroke={allCompleted ? '#4F6F42' : '#C7B89A'}
                            strokeWidth={0.9} />
                      <text x={0} y={labelY + 28.5} textAnchor="middle" fontSize={9}
                            fontWeight={700}
                            fill={allCompleted ? '#FFFFFF' : '#6b4423'}
                            style={{ userSelect: 'none', fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>
                        {completedCount}/{total}
                      </text>
                    </>
                  );
                })()}

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

      {/* ── PREVIEW MODAL ──
           Same look + ergonomics as the central garden's modal so the
           three scenes share one tap-language. Tap a place → see its
           name and a tiny "let's explore" CTA. Locked stops still get
           the inline tooltip (handled inside the SVG above); the
           modal only opens on unlocked taps. */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center p-6 z-20"
            style={{ background: 'radial-gradient(circle at 50% 40%, rgba(20, 25, 40, 0.3), rgba(20, 25, 40, 0.5))' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="bg-cream border-4 border-terracotta rounded-3xl max-w-sm w-full p-6 space-y-4 text-center shadow-2xl"
              initial={{ scale: 0.9, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 8, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 0.9, 0.34, 1] }}
              onClick={e => e.stopPropagation()}
            >
              <div className="text-6xl">{selected.themeEmoji}</div>
              <div>
                <h3
                  className="font-display text-[24px] text-bark leading-tight"
                  style={{ fontWeight: 600, letterSpacing: '-0.01em' }}
                >
                  {selected.label}
                </h3>
                {selected.subLabel && (
                  <div className="font-display italic text-[13px] text-bark/55 mt-0.5 tracking-wider">
                    {selected.subLabel}
                  </div>
                )}
              </div>

              {selected.skillCode && (
                <motion.button
                  onClick={() => startSkill(selected.skillCode!)}
                  disabled={starting}
                  className="w-full bg-forest text-white rounded-full py-4 font-display disabled:opacity-50"
                  style={{ touchAction: 'manipulation', minHeight: 60, fontWeight: 600 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {starting ? 'starting…' : '🔍 start exploring'}
                </motion.button>
              )}

              <motion.button
                onClick={() => setSelected(null)}
                className="w-full bg-white border-2 border-ochre rounded-full py-3 font-display italic text-bark/70"
                style={{ touchAction: 'manipulation', minHeight: 52 }}
                whileTap={{ scale: 0.97 }}
              >
                not yet
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </BranchSceneLayout>
  );
}
