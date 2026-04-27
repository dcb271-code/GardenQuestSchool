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
             ONE coherent trail. Reads left-to-right like the central
             garden: Cottage → Measurement Meadow spine across the bottom
             → branches: NW into Operations Hollow → over BIG BRIDGE →
             N into Place-Value Heights plateau → NE through Multiplication
             Orchard → over SKIP COUNT BRIDGE → up into Division Glen.
             Both bridges visibly cross water bodies drawn above. */}
        {(() => {
          // Spine across the bottom — narrows at edges, fattest mid
          const spineD = `M 210 758 C 320 738, 480 728, 640 724 C 800 720, 920 716, 1060 720 C 1190 724, 1320 716, 1402 720`;
          // Left fork up into Operations Hollow (bypasses brook to its east)
          const leftForkD = `M 340 730 C 332 700, 326 672, 332 644 C 340 616, 360 600, 386 596`;
          // OVER BIG BRIDGE: short flat segment crossing the stream at x:400, y:660
          const bigBridgeD = `M 332 678 C 360 678, 380 678, 400 678 C 420 678, 440 678, 470 678`;
          // From bridge → climbs N to plateau (Tens Tower at 560,540)
          const plateauClimbD = `M 470 678 C 500 644, 520 600, 540 560 C 552 540, 558 538, 560 540`;
          // Plateau ridge: connects Tens → Three-Digit → Mountain Heights → Round 100
          const plateauRidgeD = `M 560 540 C 620 530, 680 528, 740 530 C 800 532, 860 534, 920 532 C 950 530, 968 528, 970 528`;
          // Plateau spur south: Compare Trees & Ten More/Less (lower row)
          const plateauSpurD = `M 620 540 C 640 570, 660 600, 680 612 C 710 618, 730 614, 730 612`;
          // Right fork from spine into Multiplication Orchard
          const rightForkD = `M 1080 720 C 1090 700, 1100 680, 1100 660 C 1100 640, 1095 620, 1090 600 C 1085 584, 1080 572, 1080 562`;
          // OVER SKIP COUNT BRIDGE: short flat segment crossing stream at 1320, 540
          const skipBridgeD = `M 1268 558 C 1290 558, 1310 558, 1320 558 C 1340 558, 1360 558, 1372 558`;
          // From skip bridge → up into Division Glen
          const glenClimbD = `M 1320 558 C 1308 528, 1300 500, 1300 480 C 1304 470, 1310 466, 1320 462`;
          // Glen ridge: Sharing → Division Facts → Missing Number
          const glenRidgeD = `M 1090 462 C 1140 460, 1180 466, 1220 470 C 1260 472, 1300 466, 1320 462`;
          return (
            <g pointerEvents="none">
              {/* Shadow */}
              {[spineD, leftForkD, plateauClimbD, plateauRidgeD, plateauSpurD, rightForkD, glenClimbD, glenRidgeD].map((d, i) => (
                <path key={`mmsh-${i}`} d={d} stroke="#A99878" strokeWidth={32} fill="none" strokeLinecap="round" opacity={0.18} />
              ))}
              {/* Bridge segments slightly fatter (wood plank look) */}
              <path d={bigBridgeD}  stroke="#7A5A3A" strokeWidth={26} fill="none" strokeLinecap="round" opacity={0.78} />
              <path d={skipBridgeD} stroke="#7A5A3A" strokeWidth={20} fill="none" strokeLinecap="round" opacity={0.78} />

              {/* Surface */}
              {[spineD, leftForkD, plateauClimbD, plateauRidgeD, plateauSpurD, rightForkD, glenClimbD, glenRidgeD].map((d, i) => (
                <path key={`mmsu-${i}`} d={d} stroke="#EAD2A8" strokeWidth={22} fill="none" strokeLinecap="round" opacity={0.88} />
              ))}
              {/* Bridge plank surface */}
              <path d={bigBridgeD}  stroke="#C8A57A" strokeWidth={20} fill="none" strokeLinecap="round" opacity={0.94} />
              <path d={skipBridgeD} stroke="#C8A57A" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.94} />
              {/* Plank cross-lines */}
              {[346, 366, 386, 406, 426, 446, 466].map(px => (
                <line key={`bbp-${px}`} x1={px} y1={668} x2={px} y2={688} stroke="#7A5A3A" strokeWidth={1.4} opacity={0.7} />
              ))}
              {[1280, 1296, 1312, 1328, 1344, 1360].map(px => (
                <line key={`sbp-${px}`} x1={px} y1={550} x2={px} y2={566} stroke="#7A5A3A" strokeWidth={1.2} opacity={0.7} />
              ))}

              {/* Highlight ribbon */}
              {[spineD, leftForkD, plateauClimbD, plateauRidgeD, plateauSpurD, rightForkD, glenClimbD, glenRidgeD].map((d, i) => (
                <path key={`mmhi-${i}`} d={d} stroke="#F7E6C4" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.50} />
              ))}

              {/* Stepping stones — sparser, only on softer-tread sections */}
              {[
                // spine
                { x: 260, y: 750 }, { x: 410, y: 730 }, { x: 560, y: 724 },
                { x: 720, y: 720 }, { x: 880, y: 718 }, { x: 1040, y: 720 },
                { x: 1200, y: 718 }, { x: 1340, y: 718 },
                // left fork → bridge approach
                { x: 336, y: 706 }, { x: 332, y: 672 }, { x: 348, y: 644 },
                // plateau climb (after bridge)
                { x: 484, y: 656 }, { x: 506, y: 622 }, { x: 526, y: 588 }, { x: 546, y: 558 },
                // plateau ridge
                { x: 600, y: 538 }, { x: 660, y: 532 }, { x: 720, y: 530 },
                { x: 780, y: 530 }, { x: 840, y: 530 }, { x: 900, y: 528 }, { x: 940, y: 528 },
                // plateau spur south
                { x: 640, y: 568 }, { x: 670, y: 596 }, { x: 700, y: 612 },
                // right fork up to skip bridge
                { x: 1090, y: 692 }, { x: 1100, y: 660 }, { x: 1094, y: 622 }, { x: 1086, y: 588 },
                // glen ridge
                { x: 1140, y: 462 }, { x: 1200, y: 466 }, { x: 1260, y: 466 }, { x: 1310, y: 462 },
              ].map((s, i) => (
                <g key={`mmstn-${i}`}>
                  <ellipse cx={s.x + 1} cy={s.y + 2} rx={9} ry={5} fill="#000" opacity={0.16} />
                  <ellipse cx={s.x} cy={s.y} rx={9} ry={5} fill="#C9B489" stroke="#8A7050" strokeWidth={1.1} />
                  <ellipse cx={s.x - 2} cy={s.y - 1.2} rx={4} ry={1.6} fill="#E0CBA1" opacity={0.8} />
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
             mm_times_to_5 (1100,660), mm_times_to_10 (1240,680).
             (Skip Count Bridge sits ABOVE this, spanning its own stream.)
             Tree rows flank the cluster without hitting structures. The
             yellow row-marker rects were removed — they read as "weird
             shaded rectangles" rather than apple rows. */}
        {[1010, 1140, 1380].map((tx, i) => (
          <Tree key={`orch-back-${i}`} x={tx} y={606} size={42} variant={i % 2 === 0 ? 1 : 2} />
        ))}
        {[1042, 1170, 1280, 1390].map((tx, i) => (
          <Tree key={`orch-mid-${i}`} x={tx} y={720} size={46} variant={i % 3 === 0 ? 2 : i % 3 === 1 ? 1 : 3} />
        ))}

        {/* ── 11. DIVISION GLEN — mossy boulders + pine framing ──
             Glen structures now at y:462-470 (mid-meadow band).
             Boulders sit BELOW each structure as a base, not on top. */}
        <g pointerEvents="none">
          <ellipse cx={1090} cy={500} rx={20} ry={9} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.4} />
          <ellipse cx={1088} cy={496} rx={14} ry={4} fill="#A89D8A" />
          <ellipse cx={1090} cy={494} rx={16} ry={2.8} fill="#7BA46F" opacity={0.84} />
          <ellipse cx={1320} cy={500} rx={17} ry={9} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.4} />
          <ellipse cx={1318} cy={496} rx={11} ry={4} fill="#A89D8A" />
          <ellipse cx={1320} cy={494} rx={13} ry={2.8} fill="#7BA46F" opacity={0.84} />
          <ellipse cx={1210} cy={508} rx={14} ry={7} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.3} />
          <ellipse cx={1208} cy={504} rx={9} ry={3} fill="#A89D8A" />
        </g>

        {/* ── 12. FRAMING TREES ──
             Rules: no tree within 60px of any structure; trees only at
             edges and mid-distance. */}

        {/* Distant ridge above the plateau */}
        <PineTree x={400} y={344} size={48} />
        <PineTree x={1010} y={344} size={48} />

        {/* Left edge — hollow entrance framing */}
        <Tree x={70} y={482} size={58} variant={2} />
        <Tree x={250} y={500} size={48} variant={1} />

        {/* Between plateau and orchard */}
        <PineTree x={1010} y={540} size={48} />

        {/* Bottom-left cottage nook */}
        <Tree x={62} y={648} size={60} variant={2} />

        {/* Far-right edge */}
        <Tree x={1402} y={420} size={56} variant={3} />

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
