// app/(child)/garden/grow/EmptyPlotPicker.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type PlantData } from '@/lib/world/plantCatalog';
import { PlantStageIllustration } from '@/components/child/garden/PlantStageIllustration';
import { plantSeed } from './actions';
import { playSeedPlant } from '@/lib/audio/sfx';

export default function EmptyPlotPicker({
  open, onClose, learnerId, plotCode, plotGarden, earnedSeeds,
}: {
  open: boolean;
  onClose: () => void;
  learnerId: string;
  plotCode: string;
  plotGarden: 'vegetable' | 'flower' | 'fruit' | 'japanese';
  earnedSeeds: PlantData[];
}) {
  const [planting, setPlanting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const compatible = earnedSeeds.filter(s => s.garden === plotGarden);

  const onPick = async (plantCode: string) => {
    if (planting) return;
    setPlanting(true);
    setError(null);
    const result = await plantSeed(learnerId, plotCode, plantCode);
    setPlanting(false);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    playSeedPlant();
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
            className="bg-cream border-4 border-terracotta rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-display text-[20px] text-bark text-center" style={{ fontWeight: 600 }}>
              what would you like to plant?
            </h3>
            {compatible.length === 0 ? (
              <div className="text-center text-bark/60 italic font-display text-[14px] py-4">
                no seeds yet for this garden — keep practicing.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {compatible.map(seed => (
                  <button
                    key={seed.code}
                    onClick={() => onPick(seed.code)}
                    disabled={planting}
                    className="bg-white border-2 border-ochre rounded-2xl p-3 flex flex-col items-center gap-1 disabled:opacity-50"
                    style={{ minHeight: 96, touchAction: 'manipulation' }}
                  >
                    <svg viewBox="-30 -30 60 60" width={50} height={50}>
                      <PlantStageIllustration code={seed.stages[0].illustration} x={0} y={0} size={40} />
                    </svg>
                    <span className="font-display text-[13px] text-bark" style={{ fontWeight: 600 }}>
                      {seed.commonName}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {error && <div className="text-rose font-display text-[12px] italic text-center">{error}</div>}
            <button
              onClick={onClose}
              className="w-full bg-white border-2 border-ochre rounded-full py-2 font-display italic text-bark/70"
              style={{ minHeight: 44, touchAction: 'manipulation' }}
            >
              never mind
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
