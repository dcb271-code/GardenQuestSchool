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

        {/* ── 6c. CAVE — natural rocky archway at the far-left edge ──
             The river flows OUT of the cave mouth on the right side,
             so it's clearly the source of the watercourse — not just
             a rectangle plopped in front of the river. Cave occupies
             x:-30 to 230, y:570-740; river starts at x:230, y:705.
             Tapping navigates to the cave's interior route — same
             pattern as Bunny Burrow on the central garden. The three
             cave skills (Hundred's Hollow, Fast Facts, Regroup Ridge)
             live INSIDE the route, not as inline-expand pins on this
             scene. */}
        <g
          style={{ cursor: 'pointer', touchAction: 'manipulation' }}
          onClick={() => router.push(`/garden/habitat/operations_cave?learner=${learnerId}`)}
          // Cave at 50% size, anchored to the LEFT edge. Lifted so
          // its bottom lip sits on the river's bottom bank — the
          // river fills the lower half of the cave mouth, with the
          // upper half showing the dark interior + glow above the
          // water line (so it reads "cave above, river below").
          transform="translate(-4, 336) scale(0.5)"
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

          {/* INTERIOR WATER POOL — the river's source, visible inside
              the cave. Shaded slightly bluer-than-black so the eye
              reads "water flowing out of the dark." */}
          <path
            d="M 24 738
               C 30 720, 60 712, 100 716
               C 130 720, 148 728, 150 740 Z"
            fill="#3F5260" opacity={0.92}
          />
          <path
            d="M 36 734
               C 46 724, 78 720, 110 724
               C 130 728, 144 732, 148 738"
            stroke="#7FA9B0" strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.6}
          />
          {/* tiny ripple on the interior pool */}
          <path d="M 70 728 Q 80 726 90 728" stroke="#FFFFFF" strokeWidth={0.8} fill="none" opacity={0.45} strokeLinecap="round" />
          <path d="M 110 730 Q 120 728 130 730" stroke="#FFFFFF" strokeWidth={0.8} fill="none" opacity={0.4} strokeLinecap="round" />

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
             left edge and walk in to their idle spot in the meadow.
             Same component the central garden uses; the emergeFrom
             prop is what changes per scene. */}
        <SisterWalkers
          target={{ x: 110, y: 460 }}
          walking={false}
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
