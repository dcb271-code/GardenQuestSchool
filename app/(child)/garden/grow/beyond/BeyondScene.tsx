// app/(child)/garden/grow/beyond/BeyondScene.tsx
//
// The second grow screen — the garden beyond the trellis. Same
// overhead-meadow language as GrowScene: sky band, meadow, back fence,
// winding path, four organic beds (orchard, berry patch, herb & tea,
// moon garden), plot tap-targets, planted plants, ambient life. The
// sisters emerge through the trellis gate at the WEST edge, which
// leads back to the home garden.
//
// Reached only through the trellis gate (mastery-gated — see
// lib/world/trellisGating.ts); the page redirects if it's still locked.

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { GrowState } from '@/lib/world/growGarden';
import { QUADRANT_LAYOUT, GARDEN_SCREEN } from '@/lib/world/plotLayout';
import { type GardenType } from '@/lib/world/seedEarnSchedule';
import { plantStageFor } from '@/lib/world/plantCatalog';
import { PlantStageIllustration } from '@/components/child/garden/PlantStageIllustration';
import {
  OrchardBackground, BerryBackground, HerbBackground, MoonBackground,
} from '@/components/child/garden/BeyondBackgrounds';
import AmbientLayer from '@/components/child/garden/AmbientLayer';
import SisterWalkers from '@/components/child/garden/SisterWalkers';
import TrellisGate from '@/components/child/garden/TrellisGate';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';
import { usePortraitPan, PanEdgeHints } from '@/components/child/garden/usePortraitPan';
import { useCalmMode } from '@/lib/settings/useCalmMode';
import EmptyPlotPicker from '../EmptyPlotPicker';
import PlantInspectModal from '../PlantInspectModal';
import HarvestCelebration from '../HarvestCelebration';
import SeedInventoryTray from '../SeedInventoryTray';
import EmptyPlotMarker from '../EmptyPlotMarker';
import QuadrantSignModal from '../QuadrantSignModal';

const VB_W = 1440;
const VB_H = 900;

// Same bed footprints as the home screen — the two scenes rhyme.
const ZONES = {
  orchard: { x: 80,  y: 160, w: 520, h: 260 },
  berry:   { x: 800, y: 160, w: 520, h: 260 },
  herb:    { x: 80,  y: 460, w: 520, h: 285 },
  moon:    { x: 800, y: 460, w: 520, h: 285 },
} as const;

const BEYOND_QUADRANTS = ['orchard', 'berry', 'herb', 'moon'] as const;

// Return trellis at the WEST edge — the way home. The sisters emerge
// through it and idle on the grass just inside.
const TRELLIS_POS = { x: 48, y: 700 };
const SISTERS_EMERGE = { x: 52, y: 668 };
const SISTERS_IDLE = { x: 175, y: 640 };

export default function BeyondScene({
  learnerId, state,
}: {
  learnerId: string;
  state: GrowState;
}) {
  const router = useRouter();
  const [pickerPlotCode, setPickerPlotCode] = useState<string | null>(null);
  const [inspectPlotCode, setInspectPlotCode] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [signQuadrant, setSignQuadrant] = useState<GardenType | null>(null);

  const [sisterSpot, setSisterSpot] = useState(SISTERS_IDLE);
  const [sistersWalking, setSistersWalking] = useState(false);
  const walkTimer = useRef<number | undefined>(undefined);
  const walkTo = (x: number, y: number) => {
    setSisterSpot({ x: x - 34, y: y + 22 });
    setSistersWalking(true);
    window.clearTimeout(walkTimer.current);
    walkTimer.current = window.setTimeout(() => setSistersWalking(false), 1350);
  };
  useEffect(() => () => window.clearTimeout(walkTimer.current), []);

  const beyondPlots = state.plots.filter(p => GARDEN_SCREEN[p.plot.garden] === 'beyond');

  // Portrait pan — opens centered on the orchard (the first bed to wake).
  const portraitPan = usePortraitPan({ worldW: VB_W, worldH: VB_H, initialCenterX: 340 });
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
  const calm = useCalmMode();

  // Time-of-day tint — same ramp as GrowScene.
  const [hour, setHour] = useState(12);
  useEffect(() => { setHour(new Date().getHours()); }, []);
  const tint =
    hour < 5  ? 'rgba(40, 50, 100, 0.18)' :
    hour < 7  ? 'rgba(255, 200, 140, 0.04)' :
    hour < 19 ? 'transparent' :
    hour < 21 ? 'rgba(255, 170, 110, 0.05)' :
                'rgba(20, 25, 60, 0.18)';

  return (
    <div className="bg-[#F5EBDC] flex flex-col overflow-hidden" style={{ height: '100dvh', minHeight: '100vh', paddingBottom: 'var(--scene-inset-bottom)' }}>
      <header className="flex items-center justify-between bg-cream/90 backdrop-blur border-b border-ochre/30 px-3 py-2" style={{ paddingTop: 'calc(0.5rem + var(--scene-inset-top))' }}>
        <button
          onClick={() => router.push(`/garden/grow?learner=${learnerId}`)}
          className="text-xl p-1.5 rounded-full bg-white border border-ochre"
          aria-label="back to the garden"
          style={{ minWidth: 40, minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >←</button>
        <h1 className="font-display text-[22px] text-bark" style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
          <span className="italic">beyond</span> the trellis
        </h1>
        <div style={{ width: 40 }} />
      </header>

      <div className="flex-1 relative overflow-hidden">
        <svg {...portraitPan.svgProps} className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="beyond-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor="#F4D9C0" />
              <stop offset="35%" stopColor="#F8E7CD" />
              <stop offset="75%" stopColor="#E9E2C0" />
              <stop offset="100%" stopColor="#CFE3B4" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="beyond-meadow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor="#D7EFB9" />
              <stop offset="55%" stopColor="#AED29A" />
              <stop offset="100%" stopColor="#94BC7E" />
            </linearGradient>
            <pattern id="beyond-grass-tex" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
              <rect width="48" height="48" fill="transparent" />
              <path d="M 6 44 Q 6 38 8 36" stroke="#7BA46F" strokeWidth="1.1" fill="none" opacity="0.45" />
              <path d="M 24 46 Q 26 40 28 38" stroke="#7BA46F" strokeWidth="1.1" fill="none" opacity="0.4" />
              <path d="M 38 44 Q 36 40 38 36" stroke="#7BA46F" strokeWidth="1.1" fill="none" opacity="0.45" />
            </pattern>
            <radialGradient id="beyond-sun-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"  stopColor="#FFF5B0" stopOpacity="0.85" />
              <stop offset="40%" stopColor="#FFE89A" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#FFE89A" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* SKY — thin top wash, sun on the LEFT this time (we walked
              east through the trellis, so the sun sits behind us) */}
          <rect x={0} y={0} width={VB_W} height={90} fill="url(#beyond-sky)" />
          <circle cx={VB_W * 0.16} cy={42} r={36} fill="url(#beyond-sun-glow)" opacity={0.85} />
          <circle cx={VB_W * 0.16} cy={42} r={14} fill="#FFF2B5" opacity={0.92} />
          <g opacity={0.9}>
            <ellipse cx={640} cy={38} rx={40} ry={10} fill="#FFFFFF" stroke="#D8CDB8" strokeWidth={1} />
            <ellipse cx={628} cy={30} rx={19} ry={8} fill="#FFFFFF" />
            <ellipse cx={656} cy={29} rx={21} ry={9} fill="#FFFFFF" />
          </g>
          <g opacity={0.85}>
            <ellipse cx={1180} cy={54} rx={34} ry={9} fill="#FFFFFF" stroke="#D8CDB8" strokeWidth={1} />
            <ellipse cx={1170} cy={46} rx={17} ry={8} fill="#FFFFFF" />
            <ellipse cx={1192} cy={45} rx={19} ry={8} fill="#FFFFFF" />
          </g>

          {/* MEADOW */}
          <rect x={0} y={90} width={VB_W} height={VB_H - 90} fill="url(#beyond-meadow)" opacity={0.96} />
          <rect x={0} y={90} width={VB_W} height={VB_H - 90} fill="url(#beyond-grass-tex)" />

          {/* OVERHEAD TREE CANOPIES along the back — the orchard's wild
              cousins crowding the fence line */}
          <g pointerEvents="none">
            {[
              { cx: 80,   cy: 108, r: 30 },
              { cx: 190,  cy: 100, r: 25 },
              { cx: 300,  cy: 114, r: 29 },
              { cx: 420,  cy: 104, r: 24 },
              { cx: 660,  cy: 110, r: 27 },
              { cx: 1020, cy: 106, r: 26 },
              { cx: 1130, cy: 116, r: 30 },
              { cx: 1240, cy: 103, r: 24 },
              { cx: 1350, cy: 112, r: 28 },
            ].map((t, i) => (
              <g key={`tree-${i}`}>
                <ellipse cx={t.cx + 2} cy={t.cy + 4} rx={t.r * 0.95} ry={t.r * 0.45} fill="#000" opacity={0.18} />
                <circle cx={t.cx} cy={t.cy} r={t.r} fill="#6B8E5A" stroke="#4F6F42" strokeWidth={1.4} />
                <circle cx={t.cx - t.r * 0.25} cy={t.cy - t.r * 0.25} r={t.r * 0.55} fill="#7BA46F" opacity={0.85} />
                <circle cx={t.cx - t.r * 0.4} cy={t.cy - t.r * 0.35} r={t.r * 0.18} fill="#A2C794" opacity={0.7} />
              </g>
            ))}
          </g>

          {/* WOODEN POST-AND-RAIL FENCE — continues from the home screen */}
          <g pointerEvents="none">
            <line x1={20} y1={138} x2={VB_W - 20} y2={138} stroke="#7B4F2C" strokeWidth={4} strokeLinecap="round" />
            <line x1={20} y1={138} x2={VB_W - 20} y2={138} stroke="#A0703F" strokeWidth={1.6} strokeLinecap="round" opacity={0.85} />
            <line x1={20} y1={154} x2={VB_W - 20} y2={154} stroke="#7B4F2C" strokeWidth={4} strokeLinecap="round" />
            <line x1={20} y1={154} x2={VB_W - 20} y2={154} stroke="#A0703F" strokeWidth={1.6} strokeLinecap="round" opacity={0.85} />
            {[40, 220, 400, 580, 760, 940, 1120, 1300, VB_W - 40].map((px, i) => (
              <g key={i}>
                <ellipse cx={px} cy={162} rx={5} ry={1.6} fill="#000" opacity={0.22} />
                <rect x={px - 4} y={130} width={8} height={30} rx={1} fill="#7B4F2C" stroke="#3F2614" strokeWidth={0.9} />
                <path d={`M ${px - 4} 130 L ${px} 126 L ${px + 4} 130 Z`} fill="#5A3B1F" />
                <line x1={px - 2} y1={134} x2={px - 2} y2={158} stroke="#A0703F" strokeWidth={0.8} opacity={0.7} />
              </g>
            ))}
          </g>

          {/* WINDING PATH — enters through the west trellis, rises to a
              central junction, branches to all four beds. Same
              three-layer treatment as the home screen. */}
          {(() => {
            const trunkD = `M 62 690 C 240 660, 420 540, 560 470 S 690 440, 720 430`;
            const toOrch  = `M 720 430 C 580 415, 480 405, 380 365`;
            const toBerry = `M 720 430 C 860 415, 980 405, 1080 365`;
            const toHerb  = `M 720 430 C 580 470, 460 530, 360 605`;
            const toMoon  = `M 720 430 C 860 470, 980 530, 1100 605`;
            const branches = [toOrch, toBerry, toHerb, toMoon];
            return (
              <g pointerEvents="none">
                <path d={trunkD} stroke="#A99878" strokeWidth={48} fill="none" strokeLinecap="round" opacity={0.20} />
                {branches.map((d, i) => (
                  <path key={`s-${i}`} d={d} stroke="#A99878" strokeWidth={36} fill="none" strokeLinecap="round" opacity={0.20} />
                ))}
                <path d={trunkD} stroke="#EAD2A8" strokeWidth={34} fill="none" strokeLinecap="round" opacity={0.92} />
                {branches.map((d, i) => (
                  <path key={`m-${i}`} d={d} stroke="#EAD2A8" strokeWidth={26} fill="none" strokeLinecap="round" opacity={0.88} />
                ))}
                <path d={trunkD} stroke="#F7E6C4" strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.65} />
                {branches.map((d, i) => (
                  <path key={`h-${i}`} d={d} stroke="#F7E6C4" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.6} />
                ))}
                {[
                  { x: 150, y: 672 }, { x: 260, y: 640 }, { x: 380, y: 580 },
                  { x: 490, y: 512 }, { x: 600, y: 458 },
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

          {/* Meadow detail — flowers + tufts on the center strip */}
          <g pointerEvents="none">
            {[
              { fx: 665, fy: 640, c: '#FFD166' }, { fx: 775, fy: 545, c: '#E6B0D0' },
              { fx: 680, fy: 760, c: '#A675B0' }, { fx: 790, fy: 710, c: '#FFB7C5' },
              { fx: 700, fy: 480, c: '#FFD166' }, { fx: 760, fy: 810, c: '#E6B0D0' },
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
            {[
              { tx: 650, ty: 450 }, { tx: 795, ty: 490 }, { tx: 665, ty: 710 },
              { tx: 780, ty: 640 }, { tx: 700, ty: 565 }, { tx: 300, ty: 700 },
              { tx: 460, ty: 640 }, { tx: 180, ty: 740 },
            ].map((t, i) => (
              <g key={i} transform={`translate(${t.tx}, ${t.ty})`}>
                <path d="M 0 0 Q -2 -7 -1 -12" stroke="#5C7E4F" strokeWidth={1.3} fill="none" strokeLinecap="round" />
                <path d="M 0 0 Q 1 -8 3 -12" stroke="#5C7E4F" strokeWidth={1.3} fill="none" strokeLinecap="round" />
                <path d="M 0 0 Q 3 -6 5 -10" stroke="#5C7E4F" strokeWidth={1.2} fill="none" strokeLinecap="round" />
              </g>
            ))}
          </g>

          {/* QUADRANT BACKGROUNDS */}
          <OrchardBackground x={ZONES.orchard.x} y={ZONES.orchard.y} w={ZONES.orchard.w} h={ZONES.orchard.h} />
          <BerryBackground   x={ZONES.berry.x}   y={ZONES.berry.y}   w={ZONES.berry.w}   h={ZONES.berry.h} />
          <HerbBackground    x={ZONES.herb.x}    y={ZONES.herb.y}    w={ZONES.herb.w}    h={ZONES.herb.h} />
          <MoonBackground    x={ZONES.moon.x}    y={ZONES.moon.y}    w={ZONES.moon.w}    h={ZONES.moon.h} />

          {/* Quadrant title pills */}
          {Object.entries(QUADRANT_LAYOUT)
            .filter(([garden]) => GARDEN_SCREEN[garden as GardenType] === 'beyond')
            .map(([garden, q]) => {
              const isOpen = state.openQuadrants.has(garden as GardenType);
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

          {/* Locked-quadrant overlays + explanation signs */}
          {BEYOND_QUADRANTS.filter(q => !state.openQuadrants.has(q)).map(q => {
            const z = ZONES[q];
            return (
              <rect key={`dim-${q}`} x={z.x} y={z.y} width={z.w} height={z.h}
                    rx={48} ry={48} fill="#3F2614" opacity={0.55} pointerEvents="none" />
            );
          })}
          {BEYOND_QUADRANTS.filter(q => !state.openQuadrants.has(q)).map(q => {
            const z = ZONES[q];
            const cx = z.x + z.w / 2;
            const cy = z.y + z.h / 2 + 8;
            return (
              <g
                key={`sign-${q}`}
                transform={`translate(${cx}, ${cy})`}
                style={{ cursor: 'pointer', touchAction: 'manipulation' }}
                onClick={() => setSignQuadrant(q)}
                aria-label={`What is the ${QUADRANT_LAYOUT[q].label}?`}
              >
                <circle r={40} fill="transparent" />
                <rect x={-3} y={-2} width={6} height={34} rx={2} fill="#6B4423" />
                <rect x={-42} y={-30} width={84} height={32} rx={7}
                      fill="#A9774C" stroke="#6B4423" strokeWidth={2} />
                <rect x={-38} y={-26} width={76} height={24} rx={5}
                      fill="#C99A6B" opacity={0.5} />
                <text y={-15} textAnchor="middle" fontSize={13}>🪧</text>
                <text y={-3} textAnchor="middle" fontSize={8.5} fontStyle="italic"
                      fontWeight={700} fill="#3F2614">
                  what grows here?
                </text>
              </g>
            );
          })}

          {/* Empty plot tap targets */}
          {beyondPlots.map(p => {
            if (p.plant) return null;
            const isOpen = state.openQuadrants.has(p.plot.garden);
            return (
              <g key={`empty-${p.plot.code}`}
                 style={{ cursor: isOpen ? 'pointer' : 'not-allowed', touchAction: 'manipulation' }}
                 onClick={() => {
                   if (!isOpen) return;
                   walkTo(p.plot.x, p.plot.y);
                   setPickerPlotCode(p.plot.code);
                 }}
                 opacity={isOpen ? 1 : 0.55}>
                <rect x={p.plot.x - 28} y={p.plot.y - 28} width={56} height={56} fill="transparent" />
                <EmptyPlotMarker garden={p.plot.garden} cx={p.plot.x} cy={p.plot.y} isOpen={isOpen} />
              </g>
            );
          })}

          {/* Planted plants */}
          {beyondPlots.map(p => {
            if (!p.plant) return null;
            const stage = plantStageFor(p.plant.data, p.plant.progress);
            const sizePx = p.plant.isMature ? 64 : 48;
            return (
              <g key={p.plot.code}
                 style={{ cursor: 'pointer', touchAction: 'manipulation' }}
                 onClick={() => {
                   walkTo(p.plot.x, p.plot.y);
                   setInspectPlotCode(p.plot.code);
                 }}>
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

          {/* RETURN TRELLIS — west edge, always open: home is never
              locked behind you. */}
          <g transform={`translate(${TRELLIS_POS.x}, ${TRELLIS_POS.y})`}>
            <TrellisGate
              locked={false}
              flip
              label="home garden"
              reducedMotion={reducedMotion}
              onTap={() => router.push(`/garden/grow?learner=${learnerId}`)}
            />
          </g>

          {/* CECILY & ESME — arrive through the trellis, then walk to
              whatever the child touches. */}
          <SisterWalkers
            target={sisterSpot}
            walking={sistersWalking}
            reducedMotion={reducedMotion}
            emergeFrom={SISTERS_EMERGE}
          />

          {/* AMBIENT LAYER — clouds, butterflies, pollen */}
          <AmbientLayer reducedMotion={reducedMotion || calm} />

          {/* Foreground grass silhouette */}
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

          {/* Time-of-day tint overlay */}
          <rect width={VB_W} height={VB_H} fill={tint} pointerEvents="none" />
        </svg>

        <PanEdgeHints canLeft={portraitPan.canLeft} canRight={portraitPan.canRight} />

        <EmptyPlotPicker
          open={pickerPlotCode !== null}
          onClose={() => setPickerPlotCode(null)}
          learnerId={learnerId}
          plotCode={pickerPlotCode ?? ''}
          plotGarden={state.plots.find(p => p.plot.code === pickerPlotCode)?.plot.garden ?? 'orchard'}
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

        <QuadrantSignModal
          quadrant={signQuadrant}
          cumulativeCorrect={state.cumulativeCorrect}
          onClose={() => setSignQuadrant(null)}
        />
      </div>
    </div>
  );
}
