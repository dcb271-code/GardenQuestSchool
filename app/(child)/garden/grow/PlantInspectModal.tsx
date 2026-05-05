// app/(child)/garden/grow/PlantInspectModal.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type PlantData, plantStageFor, progressHint } from '@/lib/world/plantCatalog';
import { PlantStageIllustration } from '@/components/child/garden/PlantStageIllustration';
import { harvestPlant } from './actions';

const SUN_LABEL = { full: '☀ full sun', partial: '☀ partial sun', shade: '☁ shade' } as const;
const WATER_LABEL = { low: '💧 a little', medium: '💧💧 medium', high: '💧💧💧 lots' } as const;

export default function PlantInspectModal({
  open, onClose, learnerId, plotCode, plant, progress,
}: {
  open: boolean;
  onClose: () => void;
  learnerId: string;
  plotCode: string;
  plant: PlantData | null;
  progress: number;
}) {
  const [harvesting, setHarvesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!plant) return null;
  const stage = plantStageFor(plant, progress);
  const isMature = progress >= plant.growthCost;
  // Pick a stable fact based on plot code (deterministic per plot)
  const factIndex = (plotCode.charCodeAt(plotCode.length - 1) ?? 0) % plant.facts.length;

  const onHarvest = async () => {
    if (harvesting) return;
    setHarvesting(true);
    setError(null);
    const r = await harvestPlant(learnerId, plotCode);
    setHarvesting(false);
    if (!r.ok) { setError(r.reason); return; }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center p-6 z-30"
          style={{ background: 'radial-gradient(circle at 50% 40%, rgba(20, 25, 40, 0.3), rgba(20, 25, 40, 0.5))' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-cream border-4 border-terracotta rounded-3xl max-w-sm w-full p-6 space-y-3 text-center shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <svg viewBox="-60 -60 120 120" width={120} height={120} className="mx-auto">
              <PlantStageIllustration code={stage.illustration} x={0} y={0} size={100} />
            </svg>
            <div>
              <h3 className="font-display text-[22px] text-bark" style={{ fontWeight: 600 }}>{plant.commonName}</h3>
              <div className="font-display italic text-[12px] text-bark/55">{plant.scientificName}</div>
            </div>
            <div className="font-display italic text-[14px] text-forest">{progressHint(plant, progress)}</div>
            <div className="bg-white/70 border-2 border-ochre/40 rounded-xl p-3 text-left text-[14px] text-bark font-display">
              {plant.facts[factIndex]}
            </div>
            <div className="flex justify-around text-[12px] font-display text-bark/70">
              <div>{SUN_LABEL[plant.sun]}</div>
              <div>{WATER_LABEL[plant.water]}</div>
            </div>
            <div className="bg-cream border border-ochre/30 rounded-lg p-2 text-[12px] italic font-display text-bark/70">
              tip: {plant.growingTip}
            </div>
            {isMature && (
              <button onClick={onHarvest} disabled={harvesting}
                      className="w-full bg-forest text-white rounded-full py-3 font-display disabled:opacity-50"
                      style={{ minHeight: 56, fontWeight: 600, touchAction: 'manipulation' }}>
                {harvesting ? 'picking…' : '🧺 harvest'}
              </button>
            )}
            {error && <div className="text-rose text-[12px] italic">{error}</div>}
            <button onClick={onClose}
                    className="w-full bg-white border-2 border-ochre rounded-full py-2 font-display italic text-bark/70"
                    style={{ minHeight: 44, touchAction: 'manipulation' }}>
              {isMature ? 'not yet' : 'ok'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
