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
import { motion, AnimatePresence } from 'framer-motion';
import type { MapStructure } from '@/lib/world/gardenMap';
import type { BranchCluster } from '@/lib/world/branchMaps';
import { BRANCH_MAP_WIDTH, BRANCH_MAP_HEIGHT } from '@/lib/world/branchMaps';
import BranchSceneLayout from '@/components/child/garden/BranchSceneLayout';
import AmbientLayer from '@/components/child/garden/AmbientLayer';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';
import { Tree, PineTree, Flower, GrassTuft, StructureIllustration } from '@/components/child/garden/illustrations';
import type { ReadingForestStructureState } from './page';

// Local Sway helper — same shape as GardenScene's private Sway. Gentle
// infinite rocking that brings static trees alive. Doesn't gate on
// reducedMotion (it's tiny ambient motion, not a pulse).
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

interface ReadingForestSceneProps {
  learnerId: string;
  structures: MapStructure[];
  clusters: BranchCluster[];
  structureStates: Record<string, ReadingForestStructureState>;
}

const W = BRANCH_MAP_WIDTH;   // 1440
const H = BRANCH_MAP_HEIGHT;  // 800

// Maps branch structure codes → an existing StructureIllustration code.
// Every Forest skill should resolve to a bespoke hand-drawn illustration
// here; the themeEmoji fallback is only for emergencies.
const ILLUSTRATION_ALIAS: Record<string, string> = {
  rf_dolch_first:    'reading_bee_words',
  rf_dolch_second:   'reading_bee_words',
  rf_dolch_third:    'reading_bee_words',
  rf_digraphs:       'reading_digraph_bridge',
  rf_initial_blends: 'reading_blending_beach',
  rf_silent_e:       'reading_silent_e_spring',
  rf_vowel_ee_ea:    'reading_vowel_team_ee',
  rf_vowel_ai_ay:    'reading_vowel_team_ai',
  rf_vowel_oa_ow:    'reading_vowel_team_oa',
  rf_r_controlled:   'reading_r_controlled',
  rf_diphthongs:     'reading_diphthong_shell',
  rf_ed_ing:         'reading_word_endings',
  rf_plurals:        'reading_plurals_patch',
  rf_compounds:      'reading_compound_nest',
  rf_prefixes:       'reading_prefix_acorns',
  rf_longer_words:   'reading_readaloud_log',
  rf_sentence:       'reading_book_stump',
  rf_paragraph:      'reading_book_stump',
};

// HABITAT GROUPS — same pattern Math Mountain uses to consolidate
// dense skill clusters into a single tap-to-expand marker. The
// Phonics Path was 8 emoji clip-art structures across x:480-1200; now
// they collapse to one bespoke trail-signpost marker, expanding when
// tapped. Cuts the upper canopy from "8 structures + a path" down to
// "one place sign + a path" until the kid wants to dive in.
const HABITAT_GROUPS: Record<string, {
  codes: string[]; x: number; y: number; label: string;
}> = {
  phonics_band: {
    codes: ['rf_digraphs', 'rf_initial_blends', 'rf_silent_e',
            'rf_vowel_ee_ea', 'rf_vowel_ai_ay', 'rf_vowel_oa_ow',
            'rf_r_controlled', 'rf_diphthongs'],
    x: 840, y: 200, label: 'Phonics Path',
  },
};
const HABITAT_BY_SKILL: Record<string, string> = Object.entries(HABITAT_GROUPS)
  .reduce((acc, [k, g]) => { g.codes.forEach(c => { acc[c] = k; }); return acc; }, {} as Record<string, string>);

export default function ReadingForestScene({
  learnerId, structures, clusters, structureStates,
}: ReadingForestSceneProps) {
  const router = useRouter();
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
  const [tappedLocked, setTappedLocked] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  // Selected structure → preview modal, parity with garden tap UX.
  const [selected, setSelected] = useState<MapStructure | null>(null);
  // Which habitat group is currently expanded. Tapping the marker
  // toggles; tapping again collapses back to the marker.
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
    // Unlocked → preview modal first (parity with garden).
    setSelected(s);
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

        {/* ── 1b. PERIWINKLE DISTANCE WASH ──
             Soft cool-blue band sitting BEHIND the mid-trees. Garden
             hills are tinted #B8C4DB at low opacity to push the eye
             back; the forest had no equivalent depth cue, so the
             middle distance felt flat. This rect lives between the
             tree-line silhouette and the mid-canopy band. */}
        <rect x={0} y={170} width={W} height={140} fill="#B8C4DB" opacity={0.18} />

        {/* ── 1c. CREAM DRIFT CLOUDS ──
             Two soft puffs sitting in the sky-gaps between treeline
             dips so the canopy ceiling has somewhere light for the eye
             to rest. Painterly, no animation — these are static
             watercolor-style shapes (AmbientLayer adds drifters). */}
        <g pointerEvents="none" opacity={0.78}>
          <g>
            <ellipse cx={232} cy={108} rx={42} ry={9} fill="#F8EFD2" opacity={0.35} />
            <ellipse cx={222} cy={96}  rx={20} ry={11} fill="#FFF8E2" />
            <ellipse cx={244} cy={94}  rx={22} ry={12} fill="#FFF8E2" />
            <ellipse cx={232} cy={102} rx={32} ry={10} fill="#FFF8E2" />
          </g>
          <g>
            <ellipse cx={1180} cy={104} rx={46} ry={9} fill="#F8EFD2" opacity={0.35} />
            <ellipse cx={1166} cy={92}  rx={22} ry={12} fill="#FFF8E2" />
            <ellipse cx={1196} cy={90}  rx={24} ry={13} fill="#FFF8E2" />
            <ellipse cx={1180} cy={98}  rx={36} ry={10} fill="#FFF8E2" />
          </g>
        </g>

        {/* ── 2. FAR TREE-LINE — organic crenellated band at y:85-175 ──
             NO structures ever placed inside this band.
             Dips deeply to y:168 around x:230, x:720, x:1180 so the
             warm amber sky breathes through the canopy in three places.
             Without these gaps the green sky/canopy felt airless. */}
        <g opacity={0.54}>
          <path
            d={`M 0 178
                Q 60 146 110 156
                Q 145 128 175 146
                Q 200 158 230 168
                Q 270 158 305 138
                Q 350 110 395 126
                Q 430 96 468 120
                Q 510 93 552 116
                Q 600 130 660 158
                Q 700 168 740 158
                Q 790 132 840 118
                Q 880 102 920 110
                Q 970 118 1020 124
                Q 1080 148 1140 166
                Q 1180 168 1220 152
                Q 1280 132 1330 124
                Q 1388 116 1420 140
                Q 1440 146 1440 158
                L 1440 178 L 0 178 Z`}
            fill="#4F6F42"
          />
        </g>

        {/* ── 3. MID TREE-LINE — Tree/PineTree at y:232-262, distant canopy ──
             All placed well above the Glade (y:360+) and Phonics Path (y:220+).
             30px edge buffer from both sides. Sway-wrapped with
             staggered delays so the canopy whole breathes without
             rocking in unison. */}
        <Sway x={58}   y={246} delay={0.0}><Tree  x={58}   y={246} size={76} variant={1} /></Sway>
        <Sway x={108}  y={236} delay={1.1}><PineTree x={108}  y={236} size={70} /></Sway>
        <Sway x={170}  y={250} delay={2.2}><PineTree x={170}  y={250} size={64} /></Sway>
        <Sway x={234}  y={240} delay={0.6}><Tree  x={234}  y={240} size={70} variant={2} /></Sway>
        <Sway x={304}  y={248} delay={1.7}><PineTree x={304}  y={248} size={62} /></Sway>
        <Sway x={370}  y={242} delay={0.3}><Tree  x={370}  y={242} size={68} variant={3} /></Sway>
        <Sway x={440}  y={254} delay={2.4}><PineTree x={440}  y={254} size={58} /></Sway>
        {/* gap at phonics path entry ~x:480 */}
        {/* The right-side mid-tree-line previously held three trees at
            x:1252 / 1320 / 1384 — the new spine A path runs through
            (1218, 230) → (1290, 268) → (1440, 260), so the path was
            painting on top of those trees. Trees removed here; the
            far tree-line silhouette + morphology grove + bottom corner
            still anchor the right side. */}

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

        {/* ── 8. BROOK — flows the full width of the forest ──
             Was a short pool from x:380-836 sitting only beneath the
             Digraph Bridge. Now enters from the left edge, gently
             descends as it flows east (a real watercourse), passes
             UNDER the bridge at x:480, continues past the morphology
             grove, exits off the right edge. Same Miyazaki-stream
             vocabulary the central garden's brook uses, just longer. */}
        <g pointerEvents="none">
          {/* wet-earth bank — top edge then bottom edge */}
          <path
            d="M -10 376
               C 80 380, 180 384, 280 384
               C 360 384, 420 378, 480 380
               C 540 384, 600 392, 660 404
               C 740 416, 820 428, 920 436
               C 1000 442, 1080 446, 1160 450
               C 1240 452, 1340 454, 1450 458
               L 1450 478
               C 1340 474, 1240 472, 1160 470
               C 1080 466, 1000 462, 920 456
               C 820 448, 740 436, 660 420
               C 600 408, 540 400, 480 396
               C 420 394, 360 400, 280 404
               C 180 404, 80 400, -10 396 Z"
            fill="#6B8E5A" opacity={0.26}
          />
          {/* primary water body — slightly inside the bank */}
          <path
            d="M -10 380
               C 80 384, 180 388, 280 388
               C 360 388, 420 382, 480 384
               C 540 388, 600 396, 660 408
               C 740 420, 820 432, 920 440
               C 1000 446, 1080 450, 1160 454
               C 1240 456, 1340 458, 1450 462
               L 1450 472
               C 1340 470, 1240 468, 1160 466
               C 1080 462, 1000 458, 920 452
               C 820 444, 740 432, 660 416
               C 600 404, 540 396, 480 392
               C 420 390, 360 396, 280 400
               C 180 400, 80 396, -10 392 Z"
            fill="#B2D4D9"
          />
          {/* depth channel — winds the full length */}
          <path
            d="M 60 384
               C 200 388, 360 392, 500 388
               C 620 396, 760 416, 920 432
               C 1080 442, 1240 450, 1440 460"
            stroke="#8FB7C2" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.58}
          />
          {/* shimmer ripples — distributed along the new full length */}
          <path d="M 132 386 Q 146 382 162 386" stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.6} strokeLinecap="round" />
          <path d="M 332 388 Q 346 384 362 388" stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.62} strokeLinecap="round" />
          <path d="M 432 384 Q 446 380 462 384" stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.66} strokeLinecap="round" />
          <path d="M 502 388 Q 516 384 532 388" stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.62} strokeLinecap="round" />
          <path d="M 622 402 Q 636 398 652 402" stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.55} strokeLinecap="round" />
          <path d="M 762 422 Q 776 418 792 422" stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.5} strokeLinecap="round" />
          <path d="M 902 436 Q 916 432 932 436" stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.5} strokeLinecap="round" />
          <path d="M 1062 448 Q 1076 444 1092 448" stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.48} strokeLinecap="round" />
          <path d="M 1232 454 Q 1246 450 1262 454" stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.48} strokeLinecap="round" />
          <path d="M 1372 460 Q 1386 456 1402 460" stroke="#FFFFFF" strokeWidth={1} fill="none" opacity={0.46} strokeLinecap="round" />
          {/* slow shimmer pulses — three across the new length so the
              whole brook breathes, never in unison */}
          <motion.ellipse
            cx={260} cy={388} rx={18} ry={4} fill="#FFFFFF"
            animate={reducedMotion ? undefined : { opacity: [0.12, 0.42, 0.12], scaleX: [1, 1.14, 1] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '260px 388px', opacity: 0.28 }}
          />
          <motion.ellipse
            cx={760} cy={420} rx={20} ry={4} fill="#FFFFFF"
            animate={reducedMotion ? undefined : { opacity: [0.1, 0.4, 0.1], scaleX: [1, 1.16, 1] }}
            transition={{ duration: 6.5, delay: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '760px 420px', opacity: 0.26 }}
          />
          <motion.ellipse
            cx={1200} cy={454} rx={18} ry={4} fill="#FFFFFF"
            animate={reducedMotion ? undefined : { opacity: [0.1, 0.36, 0.1], scaleX: [1, 1.18, 1] }}
            transition={{ duration: 7.2, delay: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '1200px 454px', opacity: 0.22 }}
          />
          {/* concentric ripple — leaf falling under the bridge */}
          {!reducedMotion && (
            <motion.ellipse
              cx={520} cy={388} rx={10} ry={3} fill="none" stroke="#FFFFFF" strokeWidth={0.9}
              animate={{ rx: [6, 28], ry: [2, 8], opacity: [0.7, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: 'easeOut', repeatDelay: 4.5 }}
            />
          )}
          {/* moss-topped boulders along the top bank, at irregular
              intervals so the watercourse reads as natural */}
          {[
            { x: 138, y: 372 }, { x: 398, y: 380 }, { x: 566, y: 396 },
            { x: 820, y: 422 }, { x: 1100, y: 446 }, { x: 1320, y: 454 },
          ].map((b, i) => (
            <g key={`rfbb-${i}`}>
              <ellipse cx={b.x} cy={b.y + 4} rx={10} ry={5.5} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1.2} />
              <ellipse cx={b.x - 2} cy={b.y + 1} rx={7} ry={2.6} fill="#A89D8A" />
              <ellipse cx={b.x} cy={b.y - 1} rx={8} ry={2} fill="#7BA46F" opacity={0.88} />
            </g>
          ))}
          {/* bank grass tufts — bottom bank, distributed full length */}
          {[
            [80, 408], [240, 412], [400, 414], [560, 414],
            [720, 432], [880, 450], [1040, 462], [1220, 470], [1380, 472],
          ].map(([gx, gy], i) => (
            <g key={`rfbt-${i}`} transform={`translate(${gx},${gy})`}>
              <path d="M 0 0 Q -1 -6 -2 -10" stroke="#5C7E4F" strokeWidth={1.2} fill="none" strokeLinecap="round" />
              <path d="M 0 0 Q 1 -7 3 -11" stroke="#5C7E4F" strokeWidth={1.2} fill="none" strokeLinecap="round" />
              <path d="M 0 0 Q 2 -5 5 -9" stroke="#5C7E4F" strokeWidth={1.1} fill="none" strokeLinecap="round" />
            </g>
          ))}
        </g>

        {/* The orphan bridge graphic at (452, 490) was removed — the
            actual brook body sits at y:512-562, so the bridge floated
            above empty meadow and the V-shape path dip below it had
            nothing to cross. The rf_digraphs structure already renders
            as a hand-drawn DigraphBridge illustration via the
            ILLUSTRATION_ALIAS map; that illustration carries the
            "bridge" visual at the structure's own position. */}

        {/* ── 10. PHONICS PATH ──
             Two long ribbons, no closed loop. The previous loop-back
             from Story Rocks → SW arc → glade entry made the trail
             read as a track / racing circuit. Now:
               A. PHONICS SPINE — pulls into the glade from rf_dolch_third,
                  winds NE over the Digraph Bridge, climbs the phonics
                  band, exits at the right edge garden-exit. One
                  continuous S-flowing meander.
               B. STORY DROP — branches from spine A near Diphthong
                  Cove, falls SE through Morphology Grove, ends at
                  Story Rocks. Dead-end scenic spur.
             Glade structures are accessed by stepping off spine A
             (they're a clearing, not waypoints). */}
        {(() => {
          // ── A. PHONICS SPINE — glade → bridge → phonics → exit ──
          const phonicsSpineD = `M 160 494
            C 220 478, 280 446, 340 410
            C 380 380, 410 370, 470 360
            C 500 360, 530 358, 540 358
            C 580 348, 620 320, 660 295
            C 700 270, 740 240, 780 232
            C 820 226, 858 248, 890 254
            C 924 262, 956 232, 990 228
            C 1030 226, 1064 254, 1104 260
            C 1144 266, 1180 232, 1218 230
            C 1252 230, 1280 250, 1290 268
            C 1340 262, 1390 260, 1440 260`;

          // ── B. STORY DROP — Diphthong → Grove → Story Rocks ──
          const storyDropD = `M 1290 268
            C 1310 290, 1280 360, 1230 430
            C 1190 494, 1160 518, 1140 548
            C 1118 576, 1054 608, 984 638
            C 904 666, 832 676, 778 684`;

          return (
            <g pointerEvents="none">
              {/* Shadow */}
              <path d={phonicsSpineD} stroke="#A99878" strokeWidth={36} fill="none" strokeLinecap="round" opacity={0.19} />
              <path d={storyDropD}    stroke="#A99878" strokeWidth={32} fill="none" strokeLinecap="round" opacity={0.17} />
              {/* Surface */}
              <path d={phonicsSpineD} stroke="#EAD2A8" strokeWidth={24} fill="none" strokeLinecap="round" opacity={0.86} />
              <path d={storyDropD}    stroke="#EAD2A8" strokeWidth={20} fill="none" strokeLinecap="round" opacity={0.80} />
              {/* Highlight ribbon */}
              <path d={phonicsSpineD} stroke="#F7E6C4" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.56} />
              <path d={storyDropD}    stroke="#F7E6C4" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.48} />
              {/* Stepping stones — meaningful approaches only, ~18 total */}
              {[
                // A. spine (glade entry → bridge → phonics → exit)
                { x: 240, y: 460 },         // glade-to-bridge climb
                { x: 360, y: 396 },
                { x: 470, y: 360 },         // on the bridge
                { x: 614, y: 322 },         // climbing out of crossing
                { x: 740, y: 240 },         // upper phonics
                { x: 860, y: 248 },
                { x: 980, y: 230 },
                { x: 1100, y: 258 },
                { x: 1218, y: 230 },        // r-controlled / diphthong area
                { x: 1310, y: 268 },        // spine-spur junction
                { x: 1380, y: 260 },        // garden exit approach
                // B. story drop
                { x: 1230, y: 430 },        // entry to morphology grove
                { x: 1140, y: 548 },        // grove mid
                { x: 984, y: 638 },         // approach story rocks
                { x: 850, y: 670 },         // story rocks edge
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

        {/* ── 10b. FOOTBRIDGES — where path A crosses the brook ──
             Path A descends from the glade NE toward the Digraph
             Bridge; in doing so it crosses the brook around x:380.
             Path B drops from Diphthong Cove SE through the morphology
             grove and crosses the brook around x:1210. Without bridges
             the tan path painted directly over the blue brook —
             readable to an adult, but a kid asked "where's the bridge?"
             Two small wooden footbridges now span those crossings. */}
        {([
          { cx: 380, cy: 386, halfW: 30, key: 'fb-glade' },
          { cx: 1210, cy: 452, halfW: 30, key: 'fb-grove' },
        ] as const).map(b => (
          <g key={b.key} pointerEvents="none">
            {/* under-arch shadow on the water */}
            <path
              d={`M ${b.cx - b.halfW} ${b.cy + 6}
                  C ${b.cx - b.halfW * 0.5} ${b.cy + 12}, ${b.cx + b.halfW * 0.5} ${b.cy + 12}, ${b.cx + b.halfW} ${b.cy + 6}`}
              stroke="#000" strokeWidth={2.5} fill="none" opacity={0.22} strokeLinecap="round"
            />
            {/* abutment posts at each end */}
            <rect x={b.cx - b.halfW - 3} y={b.cy - 4} width={5} height={12} fill="#5A3B1F" stroke="#3F2614" strokeWidth={0.9} />
            <rect x={b.cx + b.halfW - 2} y={b.cy - 4} width={5} height={12} fill="#5A3B1F" stroke="#3F2614" strokeWidth={0.9} />
            {/* deck — slight arch */}
            <path
              d={`M ${b.cx - b.halfW} ${b.cy}
                  Q ${b.cx} ${b.cy - 6} ${b.cx + b.halfW} ${b.cy}
                  L ${b.cx + b.halfW} ${b.cy + 4}
                  Q ${b.cx} ${b.cy - 2} ${b.cx - b.halfW} ${b.cy + 4} Z`}
              fill="#A06B36" stroke="#5A3B1F" strokeWidth={1.4} strokeLinejoin="round"
            />
            {/* plank lines */}
            <line x1={b.cx - b.halfW * 0.5} y1={b.cy - 3.5} x2={b.cx - b.halfW * 0.5} y2={b.cy + 3} stroke="#5A3B1F" strokeWidth={0.6} opacity={0.6} />
            <line x1={b.cx} y1={b.cy - 5} x2={b.cx} y2={b.cy + 2} stroke="#5A3B1F" strokeWidth={0.6} opacity={0.6} />
            <line x1={b.cx + b.halfW * 0.5} y1={b.cy - 3.5} x2={b.cx + b.halfW * 0.5} y2={b.cy + 3} stroke="#5A3B1F" strokeWidth={0.6} opacity={0.6} />
            {/* railing posts (4) */}
            <line x1={b.cx - b.halfW * 0.7} y1={b.cy - 2} x2={b.cx - b.halfW * 0.7} y2={b.cy - 9} stroke="#5A3B1F" strokeWidth={1.1} strokeLinecap="round" />
            <line x1={b.cx - b.halfW * 0.25} y1={b.cy - 4} x2={b.cx - b.halfW * 0.25} y2={b.cy - 11} stroke="#5A3B1F" strokeWidth={1.1} strokeLinecap="round" />
            <line x1={b.cx + b.halfW * 0.25} y1={b.cy - 4} x2={b.cx + b.halfW * 0.25} y2={b.cy - 11} stroke="#5A3B1F" strokeWidth={1.1} strokeLinecap="round" />
            <line x1={b.cx + b.halfW * 0.7} y1={b.cy - 2} x2={b.cx + b.halfW * 0.7} y2={b.cy - 9} stroke="#5A3B1F" strokeWidth={1.1} strokeLinecap="round" />
            {/* railing top rail — gentle arch */}
            <path
              d={`M ${b.cx - b.halfW * 0.7} ${b.cy - 9}
                  Q ${b.cx} ${b.cy - 12} ${b.cx + b.halfW * 0.7} ${b.cy - 9}`}
              stroke="#5A3B1F" strokeWidth={1.3} fill="none" strokeLinecap="round"
            />
          </g>
        ))}

        {/* ── Garden exit signpost at right edge ──
             Arrow points RIGHT — the central garden is east of the
             forest, so to walk back to it you walk right off the
             screen. Sign uses the same font family + weight as the
             structure labels so it reads as part of the same world,
             not a stranger label. */}
        <g transform="translate(1408, 258)" pointerEvents="none">
          {/* wooden post — slight shadow so it sits on the ground */}
          <ellipse cx={0} cy={10} rx={9} ry={2.4} fill="#000" opacity={0.22} />
          <rect x={-3} y={-22} width={6} height={32} rx={2} fill="#8B5A2B" stroke="#5A3B1F" strokeWidth={1.2} />
          {/* sign board with the right-pointing arrow tab */}
          <path
            d="M -32 -34 L 26 -34 Q 30 -34 32 -32 L 38 -26 L 32 -20 Q 30 -18 26 -18 L -32 -18 Q -34 -18 -34 -20 L -34 -32 Q -34 -34 -32 -34 Z"
            fill="#FFFAF2" stroke="#8B5A2B" strokeWidth={1.5} strokeLinejoin="round"
          />
          <text
            x={-2} y={-23.5} textAnchor="middle"
            fontSize={9.5} fontWeight={700} fill="#6b4423"
            style={{ userSelect: 'none' }}
          >
            garden →
          </text>
          {/* tiny rope wrap on the post */}
          <path d="M -3 -8 Q 0 -8 3 -10" stroke="#8A6635" strokeWidth={1} fill="none" strokeLinecap="round" />
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
        <Sway x={72}  y={358} delay={0.5}><Tree x={72}  y={358} size={66} variant={2} /></Sway>
        <Sway x={358} y={328} delay={1.6}><Tree x={358} y={328} size={60} variant={1} /></Sway>
        <Sway x={70}  y={478} delay={2.3}><Tree x={70}  y={478} size={62} variant={3} /></Sway>
        <Sway x={360} y={472} delay={0.9}><Tree x={360} y={472} size={58} variant={2} /></Sway>

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
        <Sway x={1182} y={428} delay={1.2}><Tree x={1182} y={428} size={60} variant={2} /></Sway>
        <Sway x={1320} y={432} delay={2.5}><PineTree x={1320} y={432} size={56} /></Sway>

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
        <Sway x={494} y={482} delay={0.7}><Tree x={494} y={482} size={54} variant={1} /></Sway>

        {/* Below Phonics Path band — between structure positions */}
        <Sway x={534} y={454} delay={1.9}><Tree x={534} y={454} size={52} variant={2} /></Sway>
        <Sway x={756} y={464} delay={0.2}><Tree x={756} y={464} size={50} variant={3} /></Sway>
        <Sway x={956} y={454} delay={2.1}><Tree x={956} y={454} size={50} variant={1} /></Sway>

        {/* Between Story Rocks and Morphology Grove */}
        <Sway x={1056} y={506} delay={1.0}><Tree x={1056} y={506} size={64} variant={2} /></Sway>

        {/* Bottom corners — all outside brook zone.
            SW: one corner Tree only, to balance the SE pine.
            SE: a single PineTree at the corner, sized to match its
            siblings (was size:70 with another Tree size:64 only 42px
            away — read as a giant tree with a small one inside it).
            Now one corner anchor at x:1390 size:58. */}
        <Sway x={60}   y={638} delay={0.4}><Tree x={60}   y={638} size={68} variant={2} /></Sway>
        <Sway x={316}  y={648} delay={1.5}><Tree x={316}  y={648} size={56} variant={3} /></Sway>
        <Sway x={1390} y={672} delay={0.1}><PineTree x={1390} y={672} size={58} /></Sway>

        {/* ── 14b. READING NOOK ──
             Warm character anchor tucked under the SW framing tree.
             Tartan blanket on the moss with an open book, a small
             lantern hanging from a low branch, and a steaming teacup.
             Pure decoration; the kind of moment that says "someone
             reads here." Same role the cozy-house porch plays in the
             central garden. */}
        <g transform="translate(160, 690)" pointerEvents="none">
          {/* shadow under the blanket */}
          <ellipse cx={0} cy={20} rx={32} ry={5} fill="#000" opacity={0.18} />
          {/* tartan blanket — soft red base with cross-hatch */}
          <path d="M -28 4 L 30 8 L 28 22 L -30 18 Z"
                fill="#C38D9E" stroke="#5A3B1F" strokeWidth={1.2} strokeLinejoin="round" />
          {/* tartan stripes */}
          <line x1={-12} y1={5} x2={-14} y2={20} stroke="#FFFAF2" strokeWidth={1.1} opacity={0.75} />
          <line x1={2} y1={6} x2={0} y2={21} stroke="#FFFAF2" strokeWidth={1.1} opacity={0.75} />
          <line x1={16} y1={7} x2={14} y2={21} stroke="#FFFAF2" strokeWidth={1.1} opacity={0.75} />
          <line x1={-26} y1={11} x2={28} y2={14} stroke="#FFFAF2" strokeWidth={1} opacity={0.65} />
          {/* open book — two leaves */}
          <path d="M -10 0 L 0 -2 L 0 8 L -10 10 Z"
                fill="#FFFAF2" stroke="#5A3B1F" strokeWidth={1.1} strokeLinejoin="round" />
          <path d="M 0 -2 L 10 0 L 10 10 L 0 8 Z"
                fill="#FDF6E8" stroke="#5A3B1F" strokeWidth={1.1} strokeLinejoin="round" />
          {/* book spine */}
          <line x1={0} y1={-2} x2={0} y2={8} stroke="#5A3B1F" strokeWidth={0.8} />
          {/* page-line hints */}
          <line x1={-7} y1={2} x2={-3} y2={1.2} stroke="#8A7E6C" strokeWidth={0.4} />
          <line x1={-7} y1={4} x2={-3} y2={3.4} stroke="#8A7E6C" strokeWidth={0.4} />
          <line x1={-7} y1={6} x2={-3} y2={5.4} stroke="#8A7E6C" strokeWidth={0.4} />
          <line x1={3} y1={1.5} x2={7} y2={2} stroke="#8A7E6C" strokeWidth={0.4} />
          <line x1={3} y1={3.6} x2={7} y2={4.1} stroke="#8A7E6C" strokeWidth={0.4} />
          <line x1={3} y1={5.7} x2={7} y2={6.2} stroke="#8A7E6C" strokeWidth={0.4} />
          {/* teacup at the corner */}
          <path d="M 18 6 Q 18 12 23 12 Q 28 12 28 6 Z"
                fill="#FFFAF2" stroke="#5A3B1F" strokeWidth={0.9} strokeLinejoin="round" />
          {/* cup handle */}
          <path d="M 28 7 Q 30.5 7.5 30 10 Q 28 10 28 9.5"
                stroke="#5A3B1F" strokeWidth={0.9} fill="none" />
          {/* tea inside */}
          <ellipse cx={23} cy={7} rx={4} ry={1} fill="#8B5A2B" opacity={0.85} />
          {/* steam */}
          {!reducedMotion && (
            <motion.path
              d="M 21 5 Q 19 0 22 -4 Q 24 -7 22 -10"
              stroke="#E8E0D3" strokeWidth={1.1} fill="none" strokeLinecap="round"
              animate={{ opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          {reducedMotion && (
            <path d="M 21 5 Q 19 0 22 -4 Q 24 -7 22 -10"
                  stroke="#E8E0D3" strokeWidth={1.1} fill="none" strokeLinecap="round" opacity={0.5} />
          )}
          {/* lantern hanging from above (string + small lantern) */}
          <line x1={-22} y1={-30} x2={-22} y2={-12} stroke="#5A3B1F" strokeWidth={0.7} />
          <ellipse cx={-22} cy={-9} rx={4} ry={4.5} fill="#FFD06B" stroke="#5A3B1F" strokeWidth={1} />
          <line x1={-25.5} y1={-9} x2={-18.5} y2={-9} stroke="#5A3B1F" strokeWidth={0.5} opacity={0.5} />
          {/* warm glow */}
          <ellipse cx={-22} cy={-9} rx={11} ry={10} fill="#FFE89A" opacity={0.22} />
        </g>

        {/* ── 14c. OWL PERCH IN MORPHOLOGY GROVE ──
             A small owl on a mossy stump just below the ancient oak,
             with stacked acorns at the base. Awake at dusk/night via
             time-of-day tint (just a static figure though — full
             alertness logic is overkill here). */}
        <g transform="translate(1382, 540)" pointerEvents="none">
          {/* shadow */}
          <ellipse cx={0} cy={36} rx={16} ry={3} fill="#000" opacity={0.2} />
          {/* mossy stump */}
          <ellipse cx={0} cy={32} rx={14} ry={5} fill="#6B4423" stroke="#3F2614" strokeWidth={1.2} />
          <rect x={-12} y={20} width={24} height={14} fill="#8B5A2B" stroke="#5A3B1F" strokeWidth={1.4} />
          <ellipse cx={0} cy={20} rx={12} ry={3.5} fill="#A06B36" stroke="#5A3B1F" strokeWidth={1.2} />
          {/* concentric ring on the stump top (tree rings) */}
          <ellipse cx={0} cy={20} rx={9} ry={2.6} fill="none" stroke="#5A3B1F" strokeWidth={0.5} opacity={0.55} />
          <ellipse cx={0} cy={20} rx={5} ry={1.5} fill="none" stroke="#5A3B1F" strokeWidth={0.5} opacity={0.55} />
          {/* moss on the stump's edge */}
          <ellipse cx={-9} cy={19} rx={5} ry={1.6} fill="#7BA46F" opacity={0.85} />
          <ellipse cx={6} cy={19.5} rx={4} ry={1.4} fill="#7BA46F" opacity={0.78} />
          {/* OWL — body */}
          <ellipse cx={0} cy={9} rx={8} ry={11} fill="#A89D8A" stroke="#3F2614" strokeWidth={1.3} />
          {/* belly-feather highlight */}
          <ellipse cx={0} cy={12} rx={5} ry={6} fill="#C8BCAA" />
          {/* wing markings */}
          <path d="M -7 6 Q -3 10 -7 14" stroke="#3F2614" strokeWidth={0.6} fill="none" />
          <path d="M 7 6 Q 3 10 7 14" stroke="#3F2614" strokeWidth={0.6} fill="none" />
          {/* head */}
          <ellipse cx={0} cy={1} rx={7} ry={6} fill="#A89D8A" stroke="#3F2614" strokeWidth={1.3} />
          {/* ear-tufts */}
          <path d="M -6 -3 L -7 -7 L -4 -4 Z" fill="#3F2614" />
          <path d="M 6 -3 L 7 -7 L 4 -4 Z" fill="#3F2614" />
          {/* facial disc — pale heart-shape */}
          <path d="M -4 -1 Q -5 4 -1 5 Q 1 5 4 4 Q 5 -1 4 -3 Q 0 -2 -4 -1 Z"
                fill="#FFFAF2" stroke="#3F2614" strokeWidth={0.7} />
          {/* eyes — big round, golden */}
          <circle cx={-2.4} cy={1} r={1.7} fill="#FFD93D" stroke="#3F2614" strokeWidth={0.5} />
          <circle cx={2.4} cy={1} r={1.7} fill="#FFD93D" stroke="#3F2614" strokeWidth={0.5} />
          <circle cx={-2.4} cy={1} r={0.7} fill="#3F2614" />
          <circle cx={2.4} cy={1} r={0.7} fill="#3F2614" />
          {/* beak */}
          <path d="M 0 3 L -1 5 L 1 5 Z" fill="#5A3B1F" />
          {/* feet */}
          <line x1={-3} y1={20} x2={-3} y2={22} stroke="#5A3B1F" strokeWidth={1.2} strokeLinecap="round" />
          <line x1={3} y1={20} x2={3} y2={22} stroke="#5A3B1F" strokeWidth={1.2} strokeLinecap="round" />
          {/* stacked acorns at the base */}
          <g transform="translate(-15, 33)">
            <ellipse cx={0} cy={-1} rx={2.4} ry={3} fill="#7A4A1F" stroke="#3F2614" strokeWidth={0.7} />
            <path d="M -2.4 -3 Q 0 -5 2.4 -3" stroke="#3F2614" strokeWidth={0.7} fill="#5A3B1F" />
            <line x1={0} y1={-5} x2={0} y2={-6.5} stroke="#3F2614" strokeWidth={0.7} />
          </g>
          <g transform="translate(-12, 30)">
            <ellipse cx={0} cy={-1} rx={2.2} ry={2.8} fill="#7A4A1F" stroke="#3F2614" strokeWidth={0.7} />
            <path d="M -2.2 -2.8 Q 0 -4.6 2.2 -2.8" stroke="#3F2614" strokeWidth={0.7} fill="#5A3B1F" />
          </g>
        </g>

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

        {/* ── AMBIENT LIFE ──
             Same shared component the central garden uses: clouds,
             sakura petals, leaves, pollen, an occasional bird, and
             fireflies after dusk. The forest's tree-line dips at
             x:230 / 720 / 1180 give the clouds visible space to drift
             through. */}
        <AmbientLayer reducedMotion={reducedMotion} />

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
            Matches the central garden + Math Mountain treatment.
            UNLOCKED  → illustration / emoji with warm drop-shadow.
            LOCKED    → SAME illustration, grayscale + dimmed, with a
                        white lock badge in the upper-right corner.
            COMPLETED → warm gold drop-shadow + check badge.
            Label pill: rounded white pill with terracotta hairline. */}
        {(() => {
          const UNIFORM = 44;
          const HIT = 36;
          const LABEL_Y = 30;
          const LABEL_W = 92;
          const LABEL_H = 17;
          return structures.map(s => {
            // Skip rendering if this skill belongs to a habitat group
            // that isn't currently expanded. Mountain uses the same
            // pattern; the habitat marker takes the visual place of
            // the dense cluster until tapped.
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
                  <circle r={UNIFORM * 0.78} fill="#FFE89A" opacity={0.18} />
                )}

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

                <rect
                  x={-LABEL_W / 2} y={LABEL_Y} width={LABEL_W} height={LABEL_H} rx={LABEL_H / 2}
                  fill={completed ? '#FFF6CC' : unlocked ? '#FFFAF2' : '#EDEAD8'}
                  stroke={completed ? '#D4B43E' : unlocked ? '#E8A87C' : '#B5BFA0'}
                  strokeWidth={1.2}
                  opacity={unlocked || completed ? 0.96 : 0.78}
                />
                <text
                  x={0} y={LABEL_Y + 12} textAnchor="middle"
                  fontSize={9.5} fontWeight={700}
                  fill={unlocked ? '#6b4423' : '#6f7d5a'}
                  style={{ userSelect: 'none' }}
                >
                  {s.label}
                </text>

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

        {/* ── HABITAT MARKERS — collapse dense clusters into one icon ── */}
        {Object.entries(HABITAT_GROUPS).map(([key, group]) => {
          const isExpanded = expandedHabitat === key;
          const states = group.codes.map(c => structureStates[c]).filter(Boolean);
          const total = group.codes.length;
          const completedCount = states.filter(s => s?.completed).length;
          const unlockedCount = states.filter(s => s?.unlocked).length;
          const anyUnlocked = unlockedCount > 0;
          const allCompleted = completedCount === total;

          // Bespoke phonics-trail signpost — a wooden post with three
          // hand-painted arrow-boards (ch / ee / ai) pointing different
          // ways. Reads as "phonics trail crossroad" without competing
          // with any of the structure illustrations.
          const illustration = (() => {
            const tone = !anyUnlocked ? 0.62 : 1;
            const filter = allCompleted
              ? 'drop-shadow(0 0 6px rgba(255,217,61,0.55))'
              : 'drop-shadow(0 2px 3px rgba(107,68,35,0.42))';
            return (
              <g style={{ filter, opacity: tone }}>
                {/* ground shadow */}
                <ellipse cx={0} cy={42} rx={22} ry={4} fill="#000" opacity={0.20} />
                {/* base rocks */}
                <ellipse cx={-8} cy={40} rx={9} ry={3} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1} />
                <ellipse cx={9} cy={40} rx={7} ry={2.6} fill="#8A7E6C" stroke="#3F3026" strokeWidth={1} />
                {/* main wooden post */}
                <rect x={-3} y={-22} width={6} height={62} rx={1.4} fill="#8B5A2B" stroke="#5A3B1F" strokeWidth={1.4} />
                {/* knot detail on post */}
                <circle cx={0} cy={6} r={1} fill="#5A3B1F" opacity={0.7} />
                {/* arrow-board 1 — points NW, "ch" */}
                <path
                  d="M -32 -16 L -10 -14 L -10 -4 L -32 -2 L -36 -8 Z"
                  fill="#FFFAF2" stroke="#5A3B1F" strokeWidth={1.4} strokeLinejoin="round"
                />
                <text x={-22} y={-7} fontSize={9} fontWeight={700}
                      fill="#6b4423" textAnchor="middle"
                      fontFamily="ui-serif, Georgia, serif" fontStyle="italic"
                      style={{ userSelect: 'none' }}>ch</text>
                {/* arrow-board 2 — points E, "ee" (slightly lower) */}
                <path
                  d="M 4 -8 L 30 -10 L 36 -4 L 30 2 L 4 0 Z"
                  fill="#FDF6E8" stroke="#5A3B1F" strokeWidth={1.4} strokeLinejoin="round"
                />
                <text x={20} y={-1} fontSize={9} fontWeight={700}
                      fill="#6b4423" textAnchor="middle"
                      fontFamily="ui-serif, Georgia, serif" fontStyle="italic"
                      style={{ userSelect: 'none' }}>ee</text>
                {/* arrow-board 3 — points W, "ai" (lowest, peeling) */}
                <path
                  d="M -30 8 L -8 6 L -8 18 L -30 20 L -34 14 Z"
                  fill="#FFFAF2" stroke="#5A3B1F" strokeWidth={1.4} strokeLinejoin="round"
                />
                <text x={-20} y={15} fontSize={9} fontWeight={700}
                      fill="#6b4423" textAnchor="middle"
                      fontFamily="ui-serif, Georgia, serif" fontStyle="italic"
                      style={{ userSelect: 'none' }}>ai</text>
                {/* tiny rope wrapping the post */}
                <path d="M -3 -14 Q 0 -14 3 -16" stroke="#8A6635" strokeWidth={1.1} fill="none" strokeLinecap="round" />
                <path d="M -3 -10 Q 0 -10 3 -12" stroke="#8A6635" strokeWidth={1.1} fill="none" strokeLinecap="round" />
              </g>
            );
          })();

          return (
            <g key={`rfhab-${key}`} pointerEvents="auto">
              <g
                transform={`translate(${group.x}, ${group.y})`}
                style={{ cursor: 'pointer', touchAction: 'manipulation' }}
                onClick={() => setExpandedHabitat(isExpanded ? null : key)}
              >
                <rect x={-50} y={-30} width={100} height={92} fill="transparent" />
                {!isExpanded && anyUnlocked && (
                  <ellipse cx={0} cy={20} rx={48} ry={28} fill="#FFE89A" opacity={0.16} />
                )}
                {!isExpanded && illustration}

                {/* Label + progress pill — only when collapsed */}
                {!isExpanded && (
                  <>
                    <rect x={-58} y={50} width={116} height={17} rx={8.5}
                          fill="#FFFAF2" stroke="#E8A87C" strokeWidth={1.1} />
                    <text x={0} y={62} textAnchor="middle" fontSize={10}
                          fontWeight={700} fill="#6b4423"
                          style={{ userSelect: 'none' }}>
                      {group.label}
                    </text>
                    <rect x={-22} y={69} width={44} height={13} rx={6.5}
                          fill={allCompleted ? '#6B8E5A' : '#FDF6E8'}
                          stroke={allCompleted ? '#4F6F42' : '#C7B89A'}
                          strokeWidth={0.9} />
                    <text x={0} y={78.5} textAnchor="middle" fontSize={9}
                          fontWeight={700}
                          fill={allCompleted ? '#FFFFFF' : '#6b4423'}
                          style={{ userSelect: 'none', fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>
                      {completedCount}/{total}
                    </text>
                  </>
                )}

                {/* "tap to close" hint when expanded */}
                {isExpanded && (
                  <g>
                    <rect x={-46} y={28} width={92} height={14} rx={7}
                          fill="rgba(255,250,242,0.85)" stroke="#E8A87C" strokeWidth={1} />
                    <text x={0} y={38} textAnchor="middle" fontSize={9}
                          fontStyle="italic" fill="#6b4423"
                          style={{ userSelect: 'none' }}>
                      tap signpost to close
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
           three scenes share one tap-language. */}
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
