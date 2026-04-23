'use client';

import type { SpeciesData } from '@/lib/world/speciesCatalog';

export default function JournalSpeciesCard({
  species, unlocked,
}: { species: SpeciesData; unlocked: boolean }) {
  return (
    <div className={`border-4 rounded-2xl p-4 flex items-start gap-3 ${
      unlocked ? 'bg-white border-sage' : 'bg-gray-50 border-gray-200 opacity-60'
    }`}>
      <div className="text-5xl">{unlocked ? species.emoji : '❓'}</div>
      <div className="flex-1">
        <div className="text-kid-sm font-bold text-bark">
          {unlocked ? species.commonName : 'Not yet seen'}
        </div>
        {unlocked && (
          <>
            <div className="text-xs italic opacity-70">{species.scientificName}</div>
            <div className="text-sm mt-2 text-bark/80">{species.funFact}</div>
          </>
        )}
        {!unlocked && (
          <div className="text-xs mt-1 opacity-70">
            Build a {species.habitatReqCodes.join(' + ')} to see this one.
          </div>
        )}
      </div>
    </div>
  );
}
