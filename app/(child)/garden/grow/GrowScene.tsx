// app/(child)/garden/grow/GrowScene.tsx
//
// Client scene for /garden/grow. Renders four quadrants with their
// backgrounds, 16 plot positions, and any planted plants. Tap
// handlers + modals are added in subsequent tasks.

'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { GrowState } from '@/lib/world/growGarden';
import { QUADRANT_LAYOUT } from '@/lib/world/plotLayout';
import { plantStageFor } from '@/lib/world/plantCatalog';
import { PlantStageIllustration } from '@/components/child/garden/PlantStageIllustration';
import {
  VegetableBackground, FlowerBackground, FruitGroveBackground, JapaneseBackground,
} from '@/components/child/garden/QuadrantBackgrounds';
import EmptyPlotPicker from './EmptyPlotPicker';
import PlantInspectModal from './PlantInspectModal';

export default function GrowScene({
  learnerId, state,
}: {
  learnerId: string;
  state: GrowState;
}) {
  const [pickerPlotCode, setPickerPlotCode] = useState<string | null>(null);
  const [inspectPlotCode, setInspectPlotCode] = useState<string | null>(null);

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
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid meet"
             className="absolute inset-0 w-full h-full" style={{ touchAction: 'manipulation' }}>
          {/* Quadrant backgrounds (top-left of each quadrant) */}
          <VegetableBackground   x={80}  y={50}  w={520} h={340} />
          <FruitGroveBackground   x={800} y={50}  w={520} h={340} />
          <FlowerBackground       x={80}  y={420} w={520} h={340} />
          <JapaneseBackground     x={800} y={420} w={520} h={340} />

          {/* Quadrant title pills */}
          {Object.entries(QUADRANT_LAYOUT).map(([garden, q]) => {
            const isOpen = state.openQuadrants.has(garden as any);
            return (
              <g key={garden} pointerEvents="none">
                <rect x={q.x - 80} y={q.y - 12} width={160} height={20} rx={10}
                      fill="rgba(255,250,242,0.85)" stroke="#E8A87C" strokeWidth={1} />
                <text x={q.x} y={q.y + 2} textAnchor="middle"
                      fontSize={11} fontStyle="italic" fontWeight={600}
                      fill={isOpen ? '#6b4423' : '#95876a'}>
                  {q.label}{isOpen ? '' : '   🔒'}
                </text>
              </g>
            );
          })}

          {/* Locked-quadrant overlay (dim the whole quadrant box) */}
          {!state.openQuadrants.has('flower') && (
            <rect x={80} y={420} width={520} height={340} fill="#5A3B1F" opacity={0.45} pointerEvents="none" />
          )}
          {!state.openQuadrants.has('fruit') && (
            <rect x={800} y={50} width={520} height={340} fill="#5A3B1F" opacity={0.45} pointerEvents="none" />
          )}
          {!state.openQuadrants.has('japanese') && (
            <rect x={800} y={420} width={520} height={340} fill="#5A3B1F" opacity={0.45} pointerEvents="none" />
          )}

          {/* Empty plot tap targets */}
          {state.plots.map(p => {
            if (p.plant) return null;
            const isOpen = state.openQuadrants.has(p.plot.garden);
            return (
              <g key={`empty-${p.plot.code}`}
                 style={{ cursor: isOpen ? 'pointer' : 'not-allowed', touchAction: 'manipulation' }}
                 onClick={() => isOpen && setPickerPlotCode(p.plot.code)}>
                {/* dashed outline indicating empty plot */}
                <ellipse cx={p.plot.x} cy={p.plot.y} rx={28} ry={18}
                         fill="rgba(0,0,0,0.08)" stroke={isOpen ? '#8B5A2B' : '#5A3B1F'}
                         strokeWidth={1.4} strokeDasharray="4 4" opacity={isOpen ? 0.6 : 0.3} />
                {isOpen && (
                  <text x={p.plot.x} y={p.plot.y + 4} textAnchor="middle"
                        fontSize={18} fill="#6B4423" opacity={0.5}>+</text>
                )}
              </g>
            );
          })}

          {/* Plots: render plant illustration if planted, otherwise nothing yet */}
          {state.plots.map(p => {
            if (!p.plant) return null;
            const stage = plantStageFor(p.plant.data, p.plant.progress);
            const sizePx = p.plant.isMature ? 64 : 48;
            return (
              <g key={p.plot.code}
                 style={{ cursor: 'pointer', touchAction: 'manipulation' }}
                 onClick={() => setInspectPlotCode(p.plot.code)}>
                <rect x={p.plot.x - 36} y={p.plot.y - 36} width={72} height={72} fill="transparent" />
                <PlantStageIllustration code={stage.illustration} x={p.plot.x} y={p.plot.y} size={sizePx} />
              </g>
            );
          })}
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
        />
      </div>
    </div>
  );
}
