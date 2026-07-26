// lib/world/residents.ts
//
// Where a discovered creature LIVES on the central garden map.
//
// The gap this closes: discovering a species used to produce an
// arrival card and a journal entry, and nothing else. The garden
// looked identical whether a child had found nothing or everything,
// which makes the reward for the hardest content in the game — the
// researcher badge and its rare visitors — feel like filling in a
// form. Creatures should move in.
//
// A resident is placed near the habitat that attracted it, in a
// deterministic ring so it doesn't jump around between renders, and
// never on top of the habitat's own marker.

import { HABITAT_CATALOG } from './habitatCatalog';
import { SPECIES_CATALOG, type SpeciesData } from './speciesCatalog';
import { GARDEN_STRUCTURES } from './gardenMap';

export interface Resident {
  species: SpeciesData;
  habitatCode: string;
  x: number;
  y: number;
  /** Staggers the idle animation so they don't bob in unison. */
  phase: number;
  /** Small size variation, so a row of them doesn't look stamped. */
  scale: number;
}

/** Ring of offsets around a habitat marker, in draw order. */
const SLOTS: Array<{ dx: number; dy: number }> = [
  { dx: -44, dy: 26 },
  { dx: 46, dy: 22 },
  { dx: -30, dy: -34 },
  { dx: 38, dy: -30 },
  { dx: 4, dy: 44 },
  { dx: -56, dy: -6 },
];

/**
 * Place every discovered species next to its habitat.
 *
 * Only habitats the learner has actually BUILT count — a creature
 * can't live in a home that isn't there. A species needing several
 * habitats settles at the first built one, so the spotted salamander
 * (pond + log pile) picks a side rather than appearing twice.
 */
export function placeResidents({
  discoveredCodes,
  builtHabitatCodes,
  speciesCatalog = SPECIES_CATALOG,
}: {
  discoveredCodes: string[];
  builtHabitatCodes: string[];
  speciesCatalog?: SpeciesData[];
}): Resident[] {
  const discovered = new Set(discoveredCodes);
  const built = new Set(builtHabitatCodes);

  // How many are already sitting at each habitat, so slots don't collide.
  const usedSlots: Record<string, number> = {};
  const out: Resident[] = [];

  for (const species of speciesCatalog) {
    if (!discovered.has(species.code)) continue;

    const habitatCode = species.habitatReqCodes.find(c => built.has(c));
    if (!habitatCode) continue;

    const structure = GARDEN_STRUCTURES.find(
      s => s.kind === 'habitat' && s.habitatCode === habitatCode,
    );
    if (!structure) continue;

    const n = usedSlots[habitatCode] ?? 0;
    usedSlots[habitatCode] = n + 1;
    const slot = SLOTS[n % SLOTS.length];
    // Beyond one full ring, push further out rather than overlapping.
    const spread = 1 + Math.floor(n / SLOTS.length) * 0.45;

    // Deterministic per-species jitter, so the garden looks arranged by
    // nature rather than by a grid — but identically on every render.
    const seed = species.code.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

    out.push({
      species,
      habitatCode,
      x: structure.x + slot.dx * spread + ((seed % 7) - 3),
      y: structure.y + slot.dy * spread + ((seed % 5) - 2),
      phase: (seed % 20) / 10,
      scale: 0.9 + ((seed % 4) * 0.06),
    });
  }

  return out;
}

/** Which built habitats have at least one resident? */
export function habitatsWithResidents(residents: Resident[]): string[] {
  return Array.from(new Set(residents.map(r => r.habitatCode)));
}

/** Kid-facing line for the resident's tap bubble. */
export function residentGreeting(r: Resident): string {
  const habitat = HABITAT_CATALOG.find(h => h.code === r.habitatCode);
  return habitat
    ? `${r.species.commonName} — lives in your ${habitat.name.toLowerCase()}`
    : r.species.commonName;
}
