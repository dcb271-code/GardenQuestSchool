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

        {/* ── 6. WATER FOR THE BRIDGES ──
             Two small streams ONLY where the structure illustrations
             demand them: under mm_big_bridge (400, 660) and under
             mm_skip_bridge (1320, 540). No more decorative-only ponds
             that floated under unrelated structures. */}
        <g pointerEvents="none">
          {/* Big Number Bridge stream — runs SE through the meadow
              hollow, narrow body so the bridge spans it cleanly. */}
          <ellipse cx={400} cy={678} rx={92} ry={14} fill="#6B8E5A" opacity={0.26} />
          <ellipse cx={400} cy={678} rx={82} ry={9} fill="#B2D4D9" />
          <path
            d="M 332 680 Q 400 676 468 680"
            stroke="#8FB7C2" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.6}
          />
          <path d="M 350 678 Q 360 675 372 678" stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.65} strokeLinecap="round" />
          <path d="M 420 680 Q 432 677 446 680" stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.6} strokeLinecap="round" />
          {/* bank stones flanking the bridge approaches */}
          <ellipse cx={326} cy={690} rx={9} ry={5} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.1} />
          <ellipse cx={324} cy={687} rx={6} ry={2.4} fill="#A89D8A" />
          <ellipse cx={478} cy={690} rx={9} ry={5} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.1} />
          <ellipse cx={476} cy={687} rx={6} ry={2.4} fill="#A89D8A" />

          {/* Skip Count Bridge mountain stream — short tumbling watercourse
              between orchard rows so the bridge actually spans water. */}
          <ellipse cx={1320} cy={558} rx={68} ry={11} fill="#6B8E5A" opacity={0.24} />
          <ellipse cx={1320} cy={558} rx={58} ry={7} fill="#B2D4D9" />
          <path
            d="M 1268 558 Q 1320 556 1372 558"
            stroke="#8FB7C2" strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={0.6}
          />
          <path d="M 1284 558 Q 1294 556 1304 558" stroke="#FFFFFF" strokeWidth={0.9} fill="none" opacity={0.6} strokeLinecap="round" />
          <path d="M 1338 558 Q 1348 556 1358 558" stroke="#FFFFFF" strokeWidth={0.9} fill="none" opacity={0.55} strokeLinecap="round" />
          <ellipse cx={1264} cy={566} rx={7} ry={4} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1} />
          <ellipse cx={1378} cy={566} rx={7} ry={4} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1} />
        </g>

        {/* ── 8. PATH SYSTEM ──
             Winds from the lower-left cottage UP through Hollow → over
             BIG BRIDGE → climbs the plateau where Place-Value Heights
             sit on the rolling hills (y:340-470) → drifts right across
             the upper hill band → over SKIP COUNT BRIDGE → glen ridge
             at the top-right. Reads as a real mountain trail that
             actually CLIMBS — not a horizontal stripe at the bottom. */}
        {(() => {
          // Lower spine across foreground meadow — connects cottage
          // and the time/fraction structures
          const lowerSpineD = `M 180 738 C 280 728, 380 720, 480 716 C 580 712, 680 710, 800 710 C 900 716, 980 720, 1060 728`;
          // Cottage approach into Hollow — climbs up-left
          const hollowApproachD = `M 280 718 C 290 690, 300 660, 308 630 C 314 604, 320 580, 328 560`;
          // OVER BIG BRIDGE — flat plank crossing at y:678
          const bigBridgeD = `M 332 678 C 360 678, 380 678, 400 678 C 420 678, 440 678, 470 678`;
          // Plateau climb — Big Bridge → Big Falls → Tens Tower (long climb)
          const plateauClimbD = `M 470 678 C 490 640, 510 580, 528 520 C 540 480, 552 440, 560 410`;
          // Plateau ridge — Tens (560,400) → Three-Digit (680,350) → Mountain (800,380) → Round 100 (920,360)
          const plateauRidgeD = `M 560 410 C 600 380, 640 360, 680 358 C 730 360, 770 372, 800 386 C 850 380, 890 368, 920 366`;
          // Glen connector — Round 100 → Sharing Squirrels → Division Facts → Missing Number
          const glenConnectD = `M 920 366 C 970 380, 1020 408, 1080 422 C 1140 410, 1180 380, 1200 366 C 1240 372, 1290 384, 1320 386`;
          // Lower plateau row — Compare Trees (600,470) → Ten More (740,470) → Round 10 (880,470)
          const lowerRidgeD = `M 600 472 C 670 470, 740 472, 810 470 C 850 470, 870 470, 880 470`;
          // Right fork — lower spine → orchard → Skip Bridge approach
          const orchardClimbD = `M 1060 728 C 1090 690, 1110 650, 1120 620 C 1130 590, 1130 568, 1130 558`;
          // OVER SKIP BRIDGE — flat plank crossing at y:558
          const skipBridgeD = `M 1268 558 C 1290 558, 1310 558, 1320 558 C 1340 558, 1360 558, 1372 558`;
          return (
            <g pointerEvents="none">
              {/* Shadow */}
              {[lowerSpineD, hollowApproachD, plateauClimbD, plateauRidgeD, glenConnectD, lowerRidgeD, orchardClimbD].map((d, i) => (
                <path key={`mmsh-${i}`} d={d} stroke="#A99878" strokeWidth={26} fill="none" strokeLinecap="round" opacity={0.18} />
              ))}
              {/* Bridges (wood plank shadow) */}
              <path d={bigBridgeD}  stroke="#7A5A3A" strokeWidth={26} fill="none" strokeLinecap="round" opacity={0.78} />
              <path d={skipBridgeD} stroke="#7A5A3A" strokeWidth={20} fill="none" strokeLinecap="round" opacity={0.78} />

              {/* Surface — narrows as it climbs (mountain-trail effect) */}
              <path d={lowerSpineD}    stroke="#EAD2A8" strokeWidth={20} fill="none" strokeLinecap="round" opacity={0.88} />
              <path d={hollowApproachD} stroke="#EAD2A8" strokeWidth={18} fill="none" strokeLinecap="round" opacity={0.85} />
              <path d={plateauClimbD}  stroke="#EAD2A8" strokeWidth={16} fill="none" strokeLinecap="round" opacity={0.82} />
              <path d={plateauRidgeD}  stroke="#EAD2A8" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.78} />
              <path d={glenConnectD}   stroke="#EAD2A8" strokeWidth={13} fill="none" strokeLinecap="round" opacity={0.76} />
              <path d={lowerRidgeD}    stroke="#EAD2A8" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.78} />
              <path d={orchardClimbD}  stroke="#EAD2A8" strokeWidth={16} fill="none" strokeLinecap="round" opacity={0.84} />

              {/* Bridge plank surface */}
              <path d={bigBridgeD}  stroke="#C8A57A" strokeWidth={20} fill="none" strokeLinecap="round" opacity={0.94} />
              <path d={skipBridgeD} stroke="#C8A57A" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.94} />
              {[346, 366, 386, 406, 426, 446, 466].map(px => (
                <line key={`bbp-${px}`} x1={px} y1={668} x2={px} y2={688} stroke="#7A5A3A" strokeWidth={1.4} opacity={0.7} />
              ))}
              {[1280, 1296, 1312, 1328, 1344, 1360].map(px => (
                <line key={`sbp-${px}`} x1={px} y1={550} x2={px} y2={566} stroke="#7A5A3A" strokeWidth={1.2} opacity={0.7} />
              ))}

              {/* Highlight ribbon */}
              <path d={lowerSpineD}    stroke="#F7E6C4" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.52} />
              <path d={hollowApproachD} stroke="#F7E6C4" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.48} />
              <path d={plateauClimbD}  stroke="#F7E6C4" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.46} />
              <path d={plateauRidgeD}  stroke="#F7E6C4" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.44} />
              <path d={glenConnectD}   stroke="#F7E6C4" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.42} />
              <path d={lowerRidgeD}    stroke="#F7E6C4" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.44} />
              <path d={orchardClimbD}  stroke="#F7E6C4" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.50} />

              {/* Stepping stones — fewer, only on key approaches */}
              {[
                // lower spine
                { x: 240, y: 730 }, { x: 380, y: 720 }, { x: 540, y: 714 },
                { x: 720, y: 710 }, { x: 880, y: 712 }, { x: 1020, y: 720 },
                // hollow approach
                { x: 290, y: 700 }, { x: 308, y: 640 }, { x: 326, y: 580 },
                // plateau climb (long)
                { x: 488, y: 644 }, { x: 504, y: 590 }, { x: 524, y: 528 }, { x: 548, y: 460 },
                // plateau ridge
                { x: 614, y: 386 }, { x: 720, y: 366 }, { x: 850, y: 376 },
                // glen connector
                { x: 980, y: 380 }, { x: 1060, y: 416 }, { x: 1140, y: 396 }, { x: 1260, y: 376 },
                // lower ridge
                { x: 670, y: 472 }, { x: 810, y: 470 },
                // orchard climb
                { x: 1080, y: 690 }, { x: 1100, y: 644 }, { x: 1120, y: 600 },
              ].map((s, i) => (
                <g key={`mmstn-${i}`}>
                  <ellipse cx={s.x + 1} cy={s.y + 2} rx={8} ry={4.5} fill="#000" opacity={0.16} />
                  <ellipse cx={s.x} cy={s.y} rx={8} ry={4.5} fill="#C9B489" stroke="#8A7050" strokeWidth={1} />
                  <ellipse cx={s.x - 2} cy={s.y - 1.2} rx={3.5} ry={1.4} fill="#E0CBA1" opacity={0.8} />
                </g>
              ))}
            </g>
          );
        })()}

        {/* ── 9. WORD STORIES COTTAGE — lower-left corner ──
             Stories structures now at (70,690), (170,720), (80,760).
             Cottage shifted up so its foundation sits BEHIND mm_stories_plus
             at (70, 690). */}
        <g transform="translate(20, 660)" pointerEvents="none">
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

        {/* ── 10. APPLE ORCHARD ROWS — Multiplication Orchard ──
             Structures: mm_equal_garden (1080,530), mm_array_orchard (1200,580),
             mm_times_to_5 (1100,620), mm_times_to_10 (1240,640).
             Tree rows sit BELOW the structures only, freeing the upper
             orchard band for the path & Skip Bridge approach. */}
        {[1020, 1380].map((tx, i) => (
          <Tree key={`orch-back-${i}`} x={tx} y={630} size={40} variant={i % 2 === 0 ? 1 : 2} />
        ))}
        {[1040, 1170, 1280, 1390].map((tx, i) => (
          <Tree key={`orch-mid-${i}`} x={tx} y={730} size={44} variant={i % 3 === 0 ? 2 : i % 3 === 1 ? 1 : 3} />
        ))}

        {/* ── 11. DIVISION GLEN — pine clearing on the upper hills ──
             Glen structures at y:360-420. Pines flank the clearing
             behind/between, and a few small boulders sit at the foot. */}
        <PineTree x={1030} y={328} size={46} />
        <PineTree x={1140} y={328} size={50} />
        <PineTree x={1260} y={332} size={48} />
        <PineTree x={1370} y={328} size={48} />
        <g pointerEvents="none">
          <ellipse cx={1080} cy={460} rx={14} ry={6} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.2} />
          <ellipse cx={1078} cy={456} rx={9} ry={2.6} fill="#A89D8A" />
          <ellipse cx={1080} cy={454} rx={11} ry={2} fill="#7BA46F" opacity={0.84} />
          <ellipse cx={1320} cy={420} rx={12} ry={5} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.1} />
          <ellipse cx={1318} cy={417} rx={8} ry={2.4} fill="#A89D8A" />
        </g>

        {/* ── 12. FRAMING TREES ──
             Rules: no tree within 60px of any structure; trees only at
             edges and mid-distance. */}

        {/* Distant ridge between peaks (NW between Peak 5 & Peak 3) */}
        <PineTree x={130} y={300} size={44} />
        <PineTree x={460} y={300} size={42} />

        {/* Left edge — hollow entrance framing */}
        <Tree x={50} y={520} size={56} variant={2} />
        <Tree x={300} y={460} size={50} variant={3} />

        {/* Between plateau and Compare Trees row */}
        <Tree x={420} y={580} size={48} variant={1} />

        {/* Bottom-left cottage nook */}
        <Tree x={250} y={760} size={50} variant={2} />

        {/* Far-right edge — separates Glen from frame */}
        <Tree x={1402} y={500} size={50} variant={3} />

        {/* ── 13. GRASS TUFTS + FLOWERS — meadow band, between structures ── */}
        <GrassTuft x={460} y={668} size={20} />
        <GrassTuft x={620} y={672} size={20} />
        <GrassTuft x={1010} y={672} size={20} />
        <GrassTuft x={420} y={780} size={20} />
        <GrassTuft x={1140} y={780} size={22} />
        <Flower x={510} y={680} size={14} />
        <Flower x={580} y={678} size={13} />
        <Flower x={930} y={672} size={14} />
        <Flower x={510} y={780} size={13} />
        <Flower x={800} y={780} size={14} />
        <Flower x={1080} y={780} size={13} />

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
