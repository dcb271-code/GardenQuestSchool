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

/**
 * Rings of offsets around a habitat marker, in draw order.
 *
 * Two rings, not one repeated at a wider radius. The old scheme reused
 * six hand-placed offsets and pushed each extra lap 45% further out,
 * which put resident 7 only 23 units from resident 1 — under the 24
 * the overlap test demands. Nobody noticed because no habitat had
 * more than four species. The bird feeder has TEN, so the seventh
 * bird sitting on the first was suddenly the normal case.
 *
 * Ring 1: 6 slots at r≈52 (chord ≈ 52). Ring 2: 8 slots at r≈92,
 * rotated half a step so nothing lines up radially (chord ≈ 70,
 * radial gap 40). Fourteen creatures fit before any lapping at all.
 */
const SLOTS: Array<{ dx: number; dy: number }> = [
  ...Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 + Math.PI * 0.16;
    return { dx: Math.cos(a) * 56, dy: Math.sin(a) * 40 };
  }),
  ...Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    return { dx: Math.cos(a) * 98, dy: Math.sin(a) * 70 };
  }),
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
    // Past both rings, push a further lap out rather than overlapping.
    // 0.55 per lap keeps the radial gap wider than the jitter below can
    // close (jitter is ±3 in x, ±2 in y).
    const spread = 1 + Math.floor(n / SLOTS.length) * 0.55;

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
