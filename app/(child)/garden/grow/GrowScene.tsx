// app/(child)/garden/grow/GrowScene.tsx
//
// Atmospheric scene for /garden/grow. Renders a Miyazaki/Stardew/Animal
// Crossing inspired top-down meadow — sky gradient, distant tree-line,
// meadow, post-and-rail fence, winding stone path, four organic garden
// beds (with bespoke anchors), 16 plot tap-targets, planted plants,
// ambient life, and a wandering chicken. The plot positions and modal
// behavior are unchanged.

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { GrowState } from '@/lib/world/growGarden';
import { QUADRANT_LAYOUT } from '@/lib/world/plotLayout';
import { plantStageFor } from '@/lib/world/plantCatalog';
import { PlantStageIllustration } from '@/components/child/garden/PlantStageIllustration';
import {
  VegetableBackground, FlowerBackground, FruitGroveBackground, JapaneseBackground,
} from '@/components/child/garden/QuadrantBackgrounds';
import AmbientLayer from '@/components/child/garden/AmbientLayer';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';
import EmptyPlotPicker from './EmptyPlotPicker';
import PlantInspectModal from './PlantInspectModal';
import HarvestCelebration from './HarvestCelebration';
import SeedInventoryTray from './SeedInventoryTray';

const VB_W = 1440;
const VB_H = 900;

// Layout for the four garden beds. Bounds are chosen so each plot's
// (x,y) center sits comfortably WITHIN the bed (plots: y=140,320 for
// top zones; y=500,680 for bottom zones — see lib/world/plotLayout.ts).
const ZONES = {
  vegetable: { x: 80,  y: 95,  w: 520, h: 305 },
  fruit:     { x: 800, y: 95,  w: 520, h: 305 },
  flower:    { x: 80,  y: 460, w: 520, h: 285 },
  japanese:  { x: 800, y: 460, w: 520, h: 285 },
} as const;

export default function GrowScene({
  learnerId, state,
}: {
  learnerId: string;
  state: GrowState;
}) {
  const [pickerPlotCode, setPickerPlotCode] = useState<string | null>(null);
  const [inspectPlotCode, setInspectPlotCode] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;

  // Time-of-day tint — same ramp as GardenScene. Initialised to noon for
  // SSR/hydration agreement, then synced to local hour after mount.
  const [hour, setHour] = useState(12);
  useEffect(() => { setHour(new Date().getHours()); }, []);
  const tint =
    hour < 5  ? 'rgba(40, 50, 100, 0.18)' :
    hour < 7  ? 'rgba(255, 200, 140, 0.04)' :
    hour < 19 ? 'transparent' :
    hour < 21 ? 'rgba(255, 170, 110, 0.05)' :
                'rgba(20, 25, 60, 0.18)';

  return (
    <div className="bg-[#F5EBDC] flex flex-col overflow-hidden" style={{ height: '100dvh', minHeight: '100vh' }}>
      <header className="flex items-center justify-between bg-cream/90 backdrop-blur border-b border-ochre/30 px-3 py-2">
        <Link
          href={`/garden?learner=${learnerId}`}
          className="text-xl p-1.5 rounded-full bg-white border border-ochre"
          aria-label="back"
          style={{ minWidth: 40, minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >←</Link>
        <h1 className="font-display text-[22px] text-bark" style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
          <span className="italic">my</span> growing garden
        </h1>
        <div style={{ width: 40 }} />
      </header>

      <div className="flex-1 relative overflow-hidden">
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid meet"
             className="absolute inset-0 w-full h-full" style={{ touchAction: 'manipulation' }}>
          <defs>
            <linearGradient id="grow-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor="#F4D9C0" />
              <stop offset="35%" stopColor="#F8E7CD" />
              <stop offset="75%" stopColor="#E9E2C0" />
              <stop offset="100%" stopColor="#CFE3B4" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="grow-meadow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor="#D7EFB9" />
              <stop offset="55%" stopColor="#AED29A" />
              <stop offset="100%" stopColor="#94BC7E" />
            </linearGradient>
            <pattern id="grow-grass-tex" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
              <rect width="48" height="48" fill="transparent" />
              <path d="M 6 44 Q 6 38 8 36" stroke="#7BA46F" strokeWidth="1.1" fill="none" opacity="0.45" />
              <path d="M 24 46 Q 26 40 28 38" stroke="#7BA46F" strokeWidth="1.1" fill="none" opacity="0.4" />
              <path d="M 38 44 Q 36 40 38 36" stroke="#7BA46F" strokeWidth="1.1" fill="none" opacity="0.45" />
            </pattern>
            <radialGradient id="grow-sun-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"  stopColor="#FFF5B0" stopOpacity="0.85" />
              <stop offset="40%" stopColor="#FFE89A" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#FFE89A" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* OVERHEAD VIEW — the whole scene reads as if you're
              looking down at the garden from above. The horizon is
              compressed into a thin decorative band at the very top
              so the four garden zones never overlap with the "sky."
              No more "top plots floating in the sky" perspective
              collision — everything below y:90 is meadow ground. */}

          {/* SKY — thin top wash (y:0-90) */}
          <rect x={0} y={0} width={VB_W} height={90} fill="url(#grow-sky)" />

          {/* Soft sun in the upper-right corner of the sky band */}
          <circle cx={VB_W * 0.82} cy={42} r={36} fill="url(#grow-sun-glow)" opacity={0.85} />
          <circle cx={VB_W * 0.82} cy={42} r={14} fill="#FFF2B5" opacity={0.92} />

          {/* Two small hand-drawn cumulus clouds in the sky band */}
          <g opacity={0.92}>
            <ellipse cx={260} cy={36} rx={42} ry={11} fill="#FFFFFF" stroke="#D8CDB8" strokeWidth={1.1} />
            <ellipse cx={246} cy={28} rx={20} ry={9} fill="#FFFFFF" />
            <ellipse cx={278} cy={28} rx={22} ry={10} fill="#FFFFFF" />
          </g>
          <g opacity={0.85}>
            <ellipse cx={1050} cy={56} rx={36} ry={9} fill="#FFFFFF" stroke="#D8CDB8" strokeWidth={1} />
            <ellipse cx={1040} cy={48} rx={18} ry={8} fill="#FFFFFF" />
            <ellipse cx={1062} cy={46} rx={20} ry={9} fill="#FFFFFF" />
          </g>

          {/* MEADOW — fills the WHOLE play area from y:90 to bottom */}
          <rect x={0} y={90} width={VB_W} height={VB_H - 90} fill="url(#grow-meadow)" opacity={0.96} />
          <rect x={0} y={90} width={VB_W} height={VB_H - 90} fill="url(#grow-grass-tex)" />

          {/* OVERHEAD TREE CANOPIES along the back of the meadow —
              round green blobs viewed from above (no perspective
              tree-line silhouette). Frames the back edge of the
              garden without conflicting with the overhead plot
              perspective. */}
          <g pointerEvents="none">
            {[
              { cx: 60,   cy: 110, r: 32 },
              { cx: 160,  cy: 100, r: 26 },
              { cx: 250,  cy: 115, r: 30 },
              { cx: 350,  cy: 105, r: 24 },
              { cx: 450,  cy: 112, r: 28 },
              { cx: 1000, cy: 105, r: 26 },
              { cx: 1100, cy: 115, r: 30 },
              { cx: 1200, cy: 102, r: 24 },
              { cx: 1300, cy: 112, r: 28 },
              { cx: 1390, cy: 105, r: 26 },
            ].map((t, i) => (
              <g key={`tree-${i}`}>
                {/* shadow ring under canopy */}
                <ellipse cx={t.cx + 2} cy={t.cy + 4} rx={t.r * 0.95} ry={t.r * 0.45} fill="#000" opacity={0.18} />
                {/* canopy outer */}
                <circle cx={t.cx} cy={t.cy} r={t.r} fill="#6B8E5A" stroke="#4F6F42" strokeWidth={1.4} />
                {/* canopy inner highlight */}
                <circle cx={t.cx - t.r * 0.25} cy={t.cy - t.r * 0.25} r={t.r * 0.55} fill="#7BA46F" opacity={0.85} />
                <circle cx={t.cx - t.r * 0.4} cy={t.cy - t.r * 0.35} r={t.r * 0.18} fill="#A2C794" opacity={0.7} />
              </g>
            ))}
          </g>

          {/* WINDING STONE PATH — enters bottom-center, branches to all 4 zones.
              Same three-layer treatment as the central garden's main path:
              shadow → surface → highlight ribbon, plus stepping stones. */}
          {(() => {
            // Trunk: rises from the bottom-center entrance toward a
            // central junction at (720, 430), just below the fence row.
            const trunkD = `M 720 870 C 700 800, 740 720, 720 640 S 730 530, 720 430`;
            // Branches from the junction to each of the four zones.
            const toVeg   = `M 720 430 C 580 415, 480 405, 380 365`;
            const toFruit = `M 720 430 C 860 415, 980 405, 1080 365`;
            const toFlow  = `M 720 430 C 580 470, 460 530, 360 605`;
            const toJp    = `M 720 430 C 860 470, 980 530, 1100 605`;
            return (
              <g pointerEvents="none">
                {/* shadow base layer */}
                <path d={trunkD}  stroke="#A99878" strokeWidth={48} fill="none" strokeLinecap="round" opacity={0.20} />
                <path d={toVeg}   stroke="#A99878" strokeWidth={36} fill="none" strokeLinecap="round" opacity={0.20} />
                <path d={toFruit} stroke="#A99878" strokeWidth={36} fill="none" strokeLinecap="round" opacity={0.20} />
                <path d={toFlow}  stroke="#A99878" strokeWidth={36} fill="none" strokeLinecap="round" opacity={0.20} />
                <path d={toJp}    stroke="#A99878" strokeWidth={36} fill="none" strokeLinecap="round" opacity={0.20} />
                {/* warm tan surface */}
                <path d={trunkD}  stroke="#EAD2A8" strokeWidth={34} fill="none" strokeLinecap="round" opacity={0.92} />
                <path d={toVeg}   stroke="#EAD2A8" strokeWidth={26} fill="none" strokeLinecap="round" opacity={0.88} />
                <path d={toFruit} stroke="#EAD2A8" strokeWidth={26} fill="none" strokeLinecap="round" opacity={0.88} />
                <path d={toFlow}  stroke="#EAD2A8" strokeWidth={26} fill="none" strokeLinecap="round" opacity={0.88} />
                <path d={toJp}    stroke="#EAD2A8" strokeWidth={26} fill="none" strokeLinecap="round" opacity={0.88} />
                {/* worn-center highlight ribbon */}
                <path d={trunkD}  stroke="#F7E6C4" strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.65} />
                <path d={toVeg}   stroke="#F7E6C4" strokeWidth={9}  fill="none" strokeLinecap="round" opacity={0.6} />
                <path d={toFruit} stroke="#F7E6C4" strokeWidth={9}  fill="none" strokeLinecap="round" opacity={0.6} />
                <path d={toFlow}  stroke="#F7E6C4" strokeWidth={9}  fill="none" strokeLinecap="round" opacity={0.6} />
                <path d={toJp}    stroke="#F7E6C4" strokeWidth={9}  fill="none" strokeLinecap="round" opacity={0.6} />
                {/* stepping stones along the trunk and branches */}
                {[
                  { x: 720, y: 820 }, { x: 715, y: 740 }, { x: 725, y: 660 },
                  { x: 720, y: 580 }, { x: 720, y: 500 },
                  { x: 640, y: 425 }, { x: 540, y: 408 }, { x: 440, y: 385 },
                  { x: 800, y: 425 }, { x: 900, y: 408 }, { x: 1010, y: 385 },
                  { x: 640, y: 460 }, { x: 540, y: 510 }, { x: 440, y: 565 },
                  { x: 800, y: 460 }, { x: 900, y: 510 }, { x: 1020, y: 565 },
                ].map((s, i) => (
                  <g key={i}>
                    <ellipse cx={s.x + 1} cy={s.y + 2} rx={10} ry={5.5} fill="#000" opacity={0.2} />
                    <ellipse cx={s.x} cy={s.y} rx={10} ry={5.5} fill="#C9B489" stroke="#8A7050" strokeWidth={1.1} />
                    <ellipse cx={s.x - 2} cy={s.y - 1.5} rx={4.5} ry={1.8} fill="#E0CBA1" opacity={0.8} />
                  </g>
                ))}
              </g>
            );
          })()}

          {/* WOODEN POST-AND-RAIL FENCE along the very back of the
              meadow, just below the overhead tree canopies. Reads as
              the back boundary of the garden. Compact: top rail at
              y:138, bottom rail at y:154, posts y:130-160. */}
          <g pointerEvents="none">
            <line x1={20} y1={138} x2={VB_W - 20} y2={138} stroke="#7B4F2C" strokeWidth={4} strokeLinecap="round" />
            <line x1={20} y1={138} x2={VB_W - 20} y2={138} stroke="#A0703F" strokeWidth={1.6} strokeLinecap="round" opacity={0.85} />
            <line x1={20} y1={154} x2={VB_W - 20} y2={154} stroke="#7B4F2C" strokeWidth={4} strokeLinecap="round" />
            <line x1={20} y1={154} x2={VB_W - 20} y2={154} stroke="#A0703F" strokeWidth={1.6} strokeLinecap="round" opacity={0.85} />
            {/* posts every ~180px */}
            {[40, 220, 400, 580, 760, 940, 1120, 1300, VB_W - 40].map((px, i) => (
              <g key={i}>
                <ellipse cx={px} cy={162} rx={5} ry={1.6} fill="#000" opacity={0.22} />
                <rect x={px - 4} y={130} width={8} height={30} rx={1} fill="#7B4F2C" stroke="#3F2614" strokeWidth={0.9} />
                <path d={`M ${px - 4} 130 L ${px} 126 L ${px + 4} 130 Z`} fill="#5A3B1F" />
                <line x1={px - 2} y1={134} x2={px - 2} y2={158} stroke="#A0703F" strokeWidth={0.8} opacity={0.7} />
              </g>
            ))}
          </g>

          {/* Meadow detail — scattered flowers and grass tufts BETWEEN the
              zones, on the path-bordered grass strip down the middle and
              along the flanks. None overlap a zone or a path stone. */}
          <g pointerEvents="none">
            {[
              { fx: 660, fy: 640, c: '#FFD166' }, { fx: 780, fy: 540, c: '#E6B0D0' },
              { fx: 660, fy: 770, c: '#A675B0' }, { fx: 800, fy: 720, c: '#FFB7C5' },
              { fx: 690, fy: 470, c: '#FFD166' }, { fx: 778, fy: 805, c: '#E6B0D0' },
              { fx: 700, fy: 410, c: '#FFD166' },
            ].map((f, i) => (
              <g key={i} transform={`translate(${f.fx}, ${f.fy})`}>
                <line x1={0} y1={3} x2={0} y2={11} stroke="#5C7E4F" strokeWidth={1.2} strokeLinecap="round" />
                {[0, 72, 144, 216, 288].map(deg => (
                  <ellipse key={deg} cx={0} cy={-3} rx={2.6} ry={4.2} fill={f.c}
                           stroke="#8B6938" strokeWidth={0.5} transform={`rotate(${deg})`} />
                ))}
                <circle cx={0} cy={0} r={2.2} fill="#FFD166" stroke="#8B6938" strokeWidth={0.4} />
              </g>
            ))}
            {/* small grass tufts */}
            {[
              { tx: 640, ty: 440 }, { tx: 800, ty: 480 }, { tx: 660, ty: 720 },
              { tx: 770, ty: 640 }, { tx: 690, ty: 560 }, { tx: 805, ty: 380 },
            ].map((t, i) => (
              <g key={i} transform={`translate(${t.tx}, ${t.ty})`}>
                <path d="M 0 0 Q -2 -7 -1 -12" stroke="#5C7E4F" strokeWidth={1.3} fill="none" strokeLinecap="round" />
                <path d="M 0 0 Q 1 -8 3 -12" stroke="#5C7E4F" strokeWidth={1.3} fill="none" strokeLinecap="round" />
                <path d="M 0 0 Q 3 -6 5 -10" stroke="#5C7E4F" strokeWidth={1.2} fill="none" strokeLinecap="round" />
              </g>
            ))}
          </g>

          {/* QUADRANT BACKGROUNDS (organic beds) */}
          <VegetableBackground   x={ZONES.vegetable.x} y={ZONES.vegetable.y} w={ZONES.vegetable.w} h={ZONES.vegetable.h} />
          <FruitGroveBackground  x={ZONES.fruit.x}     y={ZONES.fruit.y}     w={ZONES.fruit.w}     h={ZONES.fruit.h} />
          <FlowerBackground      x={ZONES.flower.x}    y={ZONES.flower.y}    w={ZONES.flower.w}    h={ZONES.flower.h} />
          <JapaneseBackground    x={ZONES.japanese.x}  y={ZONES.japanese.y}  w={ZONES.japanese.w}  h={ZONES.japanese.h} />

          {/* Quadrant title pills (kept above each bed) */}
          {Object.entries(QUADRANT_LAYOUT).map(([garden, q]) => {
            const isOpen = state.openQuadrants.has(garden as any);
            return (
              <g key={garden} pointerEvents="none">
                <rect x={q.x - 80} y={q.y - 12} width={160} height={20} rx={10}
                      fill="rgba(255,250,242,0.92)" stroke="#E8A87C" strokeWidth={1} />
                <text x={q.x} y={q.y + 2} textAnchor="middle"
                      fontSize={11} fontStyle="italic" fontWeight={600}
                      fill={isOpen ? '#6b4423' : '#95876a'}>
                  {q.label}{isOpen ? '' : '   🔒'}
                </text>
              </g>
            );
          })}

          {/* Locked-quadrant overlays — soft dim covering the bed area.
              Uses the bed's bounding rect with rounded corners so the
              dim follows the bed's footprint without needing the full
              organic path here. */}
          {!state.openQuadrants.has('flower') && (
            <rect x={ZONES.flower.x} y={ZONES.flower.y}
                  width={ZONES.flower.w} height={ZONES.flower.h}
                  rx={48} ry={48} fill="#3F2614" opacity={0.55} pointerEvents="none" />
          )}
          {!state.openQuadrants.has('fruit') && (
            <rect x={ZONES.fruit.x} y={ZONES.fruit.y}
                  width={ZONES.fruit.w} height={ZONES.fruit.h}
                  rx={48} ry={48} fill="#3F2614" opacity={0.55} pointerEvents="none" />
          )}
          {!state.openQuadrants.has('japanese') && (
            <rect x={ZONES.japanese.x} y={ZONES.japanese.y}
                  width={ZONES.japanese.w} height={ZONES.japanese.h}
                  rx={48} ry={48} fill="#3F2614" opacity={0.55} pointerEvents="none" />
          )}

          {/* Empty plot tap targets */}
          {state.plots.map(p => {
            if (p.plant) return null;
            const isOpen = state.openQuadrants.has(p.plot.garden);
            return (
              <g key={`empty-${p.plot.code}`}
                 style={{ cursor: isOpen ? 'pointer' : 'not-allowed', touchAction: 'manipulation' }}
                 onClick={() => isOpen && setPickerPlotCode(p.plot.code)}>
                <ellipse cx={p.plot.x} cy={p.plot.y} rx={28} ry={18}
                         fill="rgba(0,0,0,0.10)" stroke={isOpen ? '#8B5A2B' : '#5A3B1F'}
                         strokeWidth={1.4} strokeDasharray="4 4" opacity={isOpen ? 0.7 : 0.4} />
                {isOpen && (
                  <text x={p.plot.x} y={p.plot.y + 4} textAnchor="middle"
                        fontSize={18} fill="#6B4423" opacity={0.6}>+</text>
                )}
              </g>
            );
          })}

          {/* Planted plants */}
          {state.plots.map(p => {
            if (!p.plant) return null;
            const stage = plantStageFor(p.plant.data, p.plant.progress);
            const sizePx = p.plant.isMature ? 64 : 48;
            return (
              <g key={p.plot.code}
                 style={{ cursor: 'pointer', touchAction: 'manipulation' }}
                 onClick={() => setInspectPlotCode(p.plot.code)}>
                <rect x={p.plot.x - 36} y={p.plot.y - 36} width={72} height={72} fill="transparent" />
                {p.plant.isMature && (reducedMotion ? (
                  <circle cx={p.plot.x} cy={p.plot.y} r={36} fill="none" stroke="#FFD93D" strokeWidth={2} opacity={0.7} />
                ) : (
                  <motion.circle
                    cx={p.plot.x} cy={p.plot.y} r={36}
                    fill="none" stroke="#FFD93D" strokeWidth={2}
                    initial={{ opacity: 0.4, scale: 0.95 }}
                    animate={{ opacity: [0.4, 0.85, 0.4], scale: [0.95, 1.08, 0.95] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                ))}
                <PlantStageIllustration code={stage.illustration} x={p.plot.x} y={p.plot.y} size={sizePx} />
              </g>
            );
          })}

          {/* AMBIENT LAYER — clouds drift, butterflies/bees, pollen, etc. */}
          <AmbientLayer reducedMotion={reducedMotion} />

          {/* WANDERING CHICKEN — slow back-and-forth in the meadow strip,
              between (650, 770) and (820, 770). Pauses at each end. */}
          <WanderingChicken reducedMotion={reducedMotion} />

          {/* Foreground grass silhouette — Miyazaki-style depth frame
              along the very bottom (above the inventory tray). Kept
              short so the tray still feels grounded against meadow. */}
          <g opacity={0.5} pointerEvents="none">
            <path
              d={`M 0 ${VB_H - 14}
                  Q 80 ${VB_H - 24} 160 ${VB_H - 16}
                  T 320 ${VB_H - 20}
                  T 480 ${VB_H - 14}
                  T 640 ${VB_H - 22}
                  T 800 ${VB_H - 16}
                  T 960 ${VB_H - 24}
                  T 1120 ${VB_H - 16}
                  T 1280 ${VB_H - 22}
                  T ${VB_W} ${VB_H - 14}
                  L ${VB_W} ${VB_H} L 0 ${VB_H} Z`}
              fill="#6B8E5A" />
            {[60, 180, 320, 480, 660, 820, 980, 1140, 1300, 1410].map((gx, i) => (
              <path key={i}
                d={`M ${gx} ${VB_H - 14}
                    Q ${gx + (i % 2 === 0 ? 3 : -3)} ${VB_H - 30}
                      ${gx + (i % 2 === 0 ? 5 : -5)} ${VB_H - 44}`}
                stroke="#5C7E4F" strokeWidth={1.7} fill="none" strokeLinecap="round" />
            ))}
          </g>

          {/* Time-of-day tint overlay — final wash, never blocks input */}
          <rect width={VB_W} height={VB_H} fill={tint} pointerEvents="none" />
        </svg>

        <EmptyPlotPicker
          open={pickerPlotCode !== null}
          onClose={() => setPickerPlotCode(null)}
          learnerId={learnerId}
          plotCode={pickerPlotCode ?? ''}
          plotGarden={state.plots.find(p => p.plot.code === pickerPlotCode)?.plot.garden ?? 'vegetable'}
          earnedSeeds={state.earnedSeeds}
        />

        <PlantInspectModal
          open={inspectPlotCode !== null}
          onClose={() => setInspectPlotCode(null)}
          learnerId={learnerId}
          plotCode={inspectPlotCode ?? ''}
          plant={state.plots.find(p => p.plot.code === inspectPlotCode)?.plant?.data ?? null}
          progress={state.plots.find(p => p.plot.code === inspectPlotCode)?.plant?.progress ?? 0}
          onHarvested={() => {
            setCelebrating(true);
            window.setTimeout(() => setCelebrating(false), 1800);
          }}
        />

        <HarvestCelebration open={celebrating} reducedMotion={reducedMotion} />

        <SeedInventoryTray earnedSeeds={state.earnedSeeds} openQuadrants={state.openQuadrants} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// WANDERING CHICKEN — small farm-vibe ambient creature
// ─────────────────────────────────────────────────────────────────────────

function WanderingChicken({ reducedMotion }: { reducedMotion: boolean }) {
  const LEFT = 650;
  const RIGHT = 820;
  const Y = 768;

  if (reducedMotion) {
    // Static rendering in reduced-motion mode — sits at the midpoint.
    return (
      <g pointerEvents="none" transform={`translate(${(LEFT + RIGHT) / 2}, ${Y})`}>
        <ChickenSprite facing="left" />
      </g>
    );
  }

  // 36s full cycle: walk right (12s) → pause (4s) → walk left (12s) → pause (8s).
  // Use two stacked motion groups so we can independently animate position
  // (the long walk) and the gentle "step" bob.
  return (
    <motion.g
      pointerEvents="none"
      initial={{ x: LEFT, y: Y }}
      animate={{ x: [LEFT, RIGHT, RIGHT, LEFT, LEFT], y: [Y, Y, Y, Y, Y] }}
      transition={{
        duration: 36,
        times: [0, 0.34, 0.45, 0.78, 1],
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* gentle vertical bob to simulate steps */}
      <motion.g
        animate={{ y: [0, -1.2, 0] }}
        transition={{ duration: 0.45, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* facing flips at the midpoint of the walk cycle. We animate
            scaleX on a <g> with no transform-box override — at this
            point the local origin (0,0) is the chicken's anchor (the
            outer group has translated us there) so scaleX flips around
            its body, which is what we want. */}
        <motion.g
          animate={{ scaleX: [1, 1, -1, -1, 1] }}
          transition={{
            duration: 36,
            times: [0, 0.34, 0.45, 0.78, 1],
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <ChickenSprite facing="right" />
        </motion.g>
      </motion.g>
    </motion.g>
  );
}

function ChickenSprite({ facing }: { facing: 'left' | 'right' }) {
  // ~30px wide. Drawn facing right; parent flips scaleX as needed.
  const scale = facing === 'right' ? 1 : -1;
  return (
    <g transform={`scale(${scale}, 1)`}>
      {/* ground shadow */}
      <ellipse cx={0} cy={14} rx={14} ry={2.4} fill="#000" opacity={0.22} />
      {/* tail feathers — small fan behind the body */}
      <path d="M -10 -2 Q -16 -8 -18 -2 Q -16 0 -10 2 Z"
            fill="#FFFFFF" stroke="#5A3B1F" strokeWidth={1} strokeLinejoin="round" />
      {/* body */}
      <ellipse cx={-2} cy={2} rx={11} ry={9} fill="#FFFFFF" stroke="#5A3B1F" strokeWidth={1.2} />
      {/* wing detail */}
      <path d="M -6 -2 Q -2 -4 4 -1 Q -1 4 -6 2 Z"
            fill="#F0E4CF" stroke="#5A3B1F" strokeWidth={0.9} strokeLinejoin="round" />
      {/* head */}
      <circle cx={8} cy={-5} r={5.5} fill="#FFFFFF" stroke="#5A3B1F" strokeWidth={1.2} />
      {/* comb (red) */}
      <path d="M 6 -10 Q 7 -13 9 -11 Q 10 -13 12 -11 Q 13 -13 14 -10 L 13 -8 L 7 -8 Z"
            fill="#D14B3D" stroke="#5A3B1F" strokeWidth={0.9} strokeLinejoin="round" />
      {/* beak (orange) */}
      <path d="M 13 -5 L 18 -4 L 13 -3 Z"
            fill="#E89A3C" stroke="#5A3B1F" strokeWidth={0.8} strokeLinejoin="round" />
      {/* wattle */}
      <path d="M 11 -2 Q 12 1 10 2 Q 9 0 11 -2 Z" fill="#D14B3D" stroke="#5A3B1F" strokeWidth={0.6} />
      {/* eye */}
      <circle cx={9.5} cy={-6} r={0.9} fill="#1F1006" />
      {/* legs */}
      <line x1={-3} y1={10} x2={-3} y2={15} stroke="#3F2614" strokeWidth={1.4} strokeLinecap="round" />
      <line x1={2}  y1={10} x2={2}  y2={15} stroke="#3F2614" strokeWidth={1.4} strokeLinecap="round" />
      {/* feet (3-toe stubs) */}
      <path d="M -5 15 L -1 15 M -3 15 L -3 17" stroke="#3F2614" strokeWidth={1.1} strokeLinecap="round" />
      <path d="M  0 15 L  4 15 M  2 15 L  2 17" stroke="#3F2614" strokeWidth={1.1} strokeLinecap="round" />
    </g>
  );
}
