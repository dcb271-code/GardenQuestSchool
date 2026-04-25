'use client';

import { useState } from 'react';
import JournalSpeciesCard from '@/components/child/JournalSpeciesCard';
import SpeciesDetailModal from '@/components/child/SpeciesDetailModal';
import { SPECIES_CATALOG, type SpeciesData } from '@/lib/world/speciesCatalog';

export default function SpeciesGrid({ unlockedCodes }: { unlockedCodes: string[] }) {
  const unlocked = new Set(unlockedCodes);
  const [openSpecies, setOpenSpecies] = useState<SpeciesData | null>(null);

  return (
    <>
      <div className="space-y-3">
        {SPECIES_CATALOG.map((s, i) => (
          <div
            key={s.code}
            onClick={() => unlocked.has(s.code) && setOpenSpecies(s)}
            className={unlocked.has(s.code) ? 'cursor-pointer' : ''}
            role={unlocked.has(s.code) ? 'button' : undefined}
            tabIndex={unlocked.has(s.code) ? 0 : undefined}
            onKeyDown={e => {
              if (unlocked.has(s.code) && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                setOpenSpecies(s);
              }
            }}
          >
            <JournalSpeciesCard species={s} unlocked={unlocked.has(s.code)} index={i} />
          </div>
        ))}
      </div>

      <SpeciesDetailModal
        species={openSpecies}
        open={!!openSpecies}
        onClose={() => setOpenSpecies(null)}
      />
    </>
  );
}
