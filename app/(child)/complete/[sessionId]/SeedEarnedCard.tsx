'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { type PlantData, type GardenType } from '@/lib/world/plantCatalog';
import { PlantStageIllustration } from '@/components/child/garden/PlantStageIllustration';

const QUADRANT_LABEL: Record<string, string> = {
  flower: 'flower garden',
  fruit: 'fruit grove',
  japanese: 'japanese garden',
  orchard: 'orchard',
  berry: 'berry patch',
  herb: 'herb & tea garden',
  moon: 'moon garden',
};

export default function SeedEarnedCard({
  plant, opensQuadrant, isFirstEver, learnerId, index,
}: {
  plant: PlantData;
  opensQuadrant?: Exclude<GardenType, 'vegetable'>;
  isFirstEver: boolean;
  learnerId: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + index * 0.15, duration: 0.5, ease: [0.22, 0.9, 0.34, 1] }}
      className="bg-cream border-4 border-terracotta rounded-3xl p-5 space-y-3 text-center"
    >
      <svg viewBox="-30 -30 60 60" width={72} height={72} className="mx-auto">
        <PlantStageIllustration code={plant.stages[0].illustration} x={0} y={0} size={50} />
      </svg>
      <h3 className="font-display text-[20px] text-bark" style={{ fontWeight: 600 }}>
        🌱 you earned a seed: {plant.commonName}
        {opensQuadrant && <span className="block text-[14px] italic text-forest mt-1">— and your {QUADRANT_LABEL[opensQuadrant]} opens</span>}
      </h3>
      <p className="font-display italic text-[14px] text-bark/70 leading-snug">
        {plant.facts[0]}
      </p>
      {isFirstEver && (
        <p className="font-display italic text-[12px] text-bark/55">
          open the 🌱 in your garden header any time.
        </p>
      )}
      <Link
        href={`/garden/grow?learner=${learnerId}`}
        className="block w-full bg-forest text-white rounded-full py-3 font-display"
        style={{ touchAction: 'manipulation', minHeight: 56, fontWeight: 600 }}
      >
        🌿 plant it →
      </Link>
    </motion.div>
  );
}
