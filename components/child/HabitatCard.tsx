'use client';

import type { HabitatTypeData } from '@/lib/world/habitatCatalog';

export default function HabitatCard({
  habitat, unlocked, prereqDisplayNames,
}: {
  habitat: HabitatTypeData;
  unlocked: boolean;
  prereqDisplayNames: string[];
}) {
  return (
    <div className={`border-4 rounded-2xl p-4 ${
      unlocked ? 'bg-cream border-terracotta' : 'bg-gray-50 border-gray-200 opacity-70'
    }`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="text-5xl">{habitat.emoji}</div>
        <div>
          <div className="text-kid-sm font-bold text-bark">{habitat.name}</div>
          {unlocked
            ? <div className="text-xs text-forest">✓ unlocked</div>
            : <div className="text-xs opacity-70">locked</div>}
        </div>
      </div>
      <div className="text-sm text-bark/80">{habitat.description}</div>
      {!unlocked && prereqDisplayNames.length > 0 && (
        <div className="text-xs mt-2 opacity-80">
          Master: <strong>{prereqDisplayNames.join(', ')}</strong>
        </div>
      )}
    </div>
  );
}
