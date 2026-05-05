// app/(child)/garden/grow/SeedInventoryTray.tsx
//
// Strip at the bottom of the grow page showing every seed the
// learner has earned. Purely informational — taps go nowhere; the
// kid plants by tapping an empty plot which then opens the picker.
'use client';

import { type PlantData, type GardenType } from '@/lib/world/plantCatalog';
import { PlantStageIllustration } from '@/components/child/garden/PlantStageIllustration';

const QUADRANT_LABEL: Record<GardenType, string> = {
  vegetable: 'veg',
  flower: 'flower',
  fruit: 'fruit',
  japanese: 'japanese',
};

export default function SeedInventoryTray({
  earnedSeeds, openQuadrants,
}: {
  earnedSeeds: PlantData[];
  openQuadrants: Set<GardenType>;
}) {
  if (earnedSeeds.length === 0) return null;
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-cream/90 backdrop-blur border-t border-ochre/30 px-3 py-2 flex items-center gap-2 overflow-x-auto">
      <div className="font-display italic text-[11px] text-bark/55 tracking-[0.15em] uppercase shrink-0 pr-2">
        seeds
      </div>
      {earnedSeeds.map(seed => {
        const ready = openQuadrants.has(seed.garden);
        return (
          <div key={seed.code}
               className={`shrink-0 flex flex-col items-center bg-white rounded-xl border-2 px-2 py-1.5 ${ready ? 'border-ochre' : 'border-ochre/30 opacity-60'}`}
               style={{ minWidth: 60 }}>
            <svg viewBox="-25 -25 50 50" width={36} height={36}>
              <PlantStageIllustration code={seed.stages[0].illustration} x={0} y={0} size={32} />
            </svg>
            <span className="font-display text-[10px] text-bark mt-0.5" style={{ fontWeight: 600 }}>
              {seed.commonName}
            </span>
            {!ready && (
              <span className="font-display italic text-[9px] text-bark/50">
                needs {QUADRANT_LABEL[seed.garden]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
