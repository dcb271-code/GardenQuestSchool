// tests/world/residents.test.ts
import { describe, it, expect } from 'vitest';
import { placeResidents, habitatsWithResidents, residentGreeting } from '@/lib/world/residents';
import { SPECIES_CATALOG } from '@/lib/world/speciesCatalog';
import { HABITAT_CATALOG } from '@/lib/world/habitatCatalog';
import { GARDEN_STRUCTURES } from '@/lib/world/gardenMap';
import { hasHabitatInterior } from '@/lib/world/habitatInteriors';

describe('placeResidents', () => {
  it('places nothing for a learner who has discovered nothing', () => {
    expect(placeResidents({ discoveredCodes: [], builtHabitatCodes: ['ant_hill'] })).toEqual([]);
  });

  it('a creature cannot live in a habitat that was never built', () => {
    const out = placeResidents({ discoveredCodes: ['leafcutter_ant'], builtHabitatCodes: [] });
    expect(out).toEqual([]);
  });

  it('places a discovered creature beside its habitat marker', () => {
    const out = placeResidents({
      discoveredCodes: ['leafcutter_ant'],
      builtHabitatCodes: ['ant_hill'],
    });
    expect(out).toHaveLength(1);
    const structure = GARDEN_STRUCTURES.find(
      s => s.kind === 'habitat' && s.habitatCode === 'ant_hill',
    )!;
    // Near the marker, but never sitting on top of it.
    const dist = Math.hypot(out[0].x - structure.x, out[0].y - structure.y);
    expect(dist).toBeGreaterThan(20);
    expect(dist).toBeLessThan(130);
  });

  it('never stacks two creatures in the same spot', () => {
    const antSpecies = SPECIES_CATALOG
      .filter(s => s.habitatReqCodes.includes('ant_hill'))
      .map(s => s.code);
    const out = placeResidents({
      discoveredCodes: antSpecies,
      builtHabitatCodes: ['ant_hill'],
    });
    expect(out.length).toBe(antSpecies.length);
    for (let i = 0; i < out.length; i++) {
      for (let j = i + 1; j < out.length; j++) {
        const d = Math.hypot(out[i].x - out[j].x, out[i].y - out[j].y);
        expect(d, `${out[i].species.code} overlaps ${out[j].species.code}`).toBeGreaterThan(24);
      }
    }
  });

  it('a multi-habitat species settles in ONE place, not two', () => {
    // The spotted salamander needs both the log pile and the pond.
    const out = placeResidents({
      discoveredCodes: ['spotted_salamander'],
      builtHabitatCodes: ['log_pile', 'frog_pond'],
    });
    expect(out).toHaveLength(1);
    expect(['log_pile', 'frog_pond']).toContain(out[0].habitatCode);
  });

  it('is deterministic — creatures do not wander between renders', () => {
    const args = {
      discoveredCodes: ['tree_frog', 'spring_peeper', 'painted_turtle'],
      builtHabitatCodes: ['frog_pond'],
    };
    expect(placeResidents(args)).toEqual(placeResidents(args));
  });

  it('handles more creatures than there are slots without overlapping', () => {
    // The worst case is the whole catalog discovered at once, which is
    // also the case that broke: the bird feeder alone attracts TEN
    // species, where nothing before it attracted more than four.
    const all = SPECIES_CATALOG.map(s => s.code);
    const out = placeResidents({
      discoveredCodes: all,
      builtHabitatCodes: HABITAT_CATALOG.map(h => h.code),
    });
    for (let i = 0; i < out.length; i++) {
      for (let j = i + 1; j < out.length; j++) {
        if (out[i].habitatCode !== out[j].habitatCode) continue;
        const d = Math.hypot(out[i].x - out[j].x, out[i].y - out[j].y);
        expect(d, `${out[i].species.code} overlaps ${out[j].species.code}`).toBeGreaterThan(24);
      }
    }
  });

  it('creatures from ADJACENT habitats do not overlap either', () => {
    // This comparison used to be skipped outright — the loop above
    // `continue`d whenever two residents belonged to different
    // habitats, so nothing checked the space BETWEEN habitats. That
    // was harmless while rings were small and habitats far apart. The
    // bird feeder sits 208 units from the log pile and its outer ring
    // reaches 98, so two habitats' residents can now genuinely meet in
    // the middle.
    const out = placeResidents({
      discoveredCodes: SPECIES_CATALOG.map(s => s.code),
      builtHabitatCodes: HABITAT_CATALOG.map(h => h.code),
    });
    for (let i = 0; i < out.length; i++) {
      for (let j = i + 1; j < out.length; j++) {
        if (out[i].habitatCode === out[j].habitatCode) continue;
        const d = Math.hypot(out[i].x - out[j].x, out[i].y - out[j].y);
        expect(
          d,
          `${out[i].species.code} (${out[i].habitatCode}) overlaps ` +
          `${out[j].species.code} (${out[j].habitatCode})`,
        ).toBeGreaterThan(24);
      }
    }
  });

  it('a resident never sits on a structure that is not its own home', () => {
    // Overlapping its OWN habitat is fine and often right — a frog on
    // its pond reads correctly, and the pond marker is 140 wide. What
    // must never happen is a resident covering a DIFFERENT structure:
    // that steals the tap, which is exactly how Mirror Tarns became
    // unreachable on the branch maps.
    const out = placeResidents({
      discoveredCodes: SPECIES_CATALOG.map(s => s.code),
      builtHabitatCodes: HABITAT_CATALOG.map(h => h.code),
    });
    for (const r of out) {
      for (const struct of GARDEN_STRUCTURES) {
        if (struct.habitatCode === r.habitatCode) continue;
        const d = Math.hypot(r.x - struct.x, r.y - struct.y);
        expect(
          d,
          `${r.species.code} (${r.habitatCode}) sits on ${struct.code}`,
        ).toBeGreaterThan(struct.size / 2);
      }
    }
  });

  it('the rare visitors get a home once their habitats are built and found', () => {
    const out = placeResidents({
      discoveredCodes: ['painted_turtle', 'luna_moth'],
      builtHabitatCodes: ['frog_pond', 'butterfly_bush'],
    });
    expect(out.map(r => r.species.code).sort()).toEqual(['luna_moth', 'painted_turtle']);
  });

  it('greets a resident by name and home', () => {
    const [r] = placeResidents({
      discoveredCodes: ['painted_turtle'],
      builtHabitatCodes: ['frog_pond'],
    });
    expect(residentGreeting(r)).toContain('Painted Turtle');
    expect(residentGreeting(r)).toContain('frog pond');
  });

  it('reports which habitats have someone living in them', () => {
    const out = placeResidents({
      discoveredCodes: ['tree_frog', 'ladybug'],
      builtHabitatCodes: ['frog_pond', 'log_pile'],
    });
    expect(habitatsWithResidents(out).sort()).toEqual(['frog_pond', 'log_pile']);
  });
});

describe('habitat interiors', () => {
  it('every habitat a RARE visitor lives in can be visited', () => {
    // This is the invariant that matters: the reward for the hardest
    // content in the game must have somewhere to be.
    const rareHabitats = Array.from(new Set(
      SPECIES_CATALOG
        .filter(s => s.requiresResearcherBadge)
        .flatMap(s => s.habitatReqCodes),
    ));
    expect(rareHabitats.length).toBeGreaterThan(0);
    for (const code of rareHabitats) {
      expect(hasHabitatInterior(code), `${code} hosts a rare visitor but can't be entered`).toBe(true);
    }
  });

  it('every habitat that is a HOME can now be visited', () => {
    // operations_cave is excluded on purpose — it's the maths cave at
    // the foot of the mountain, not somewhere a creature lives.
    const homes = HABITAT_CATALOG.filter(h => h.attractsSpeciesCodes.length > 0);
    // Not pinned to a number — adding a habitat that attracts species
    // should make this test DEMAND an interior, not fail an arithmetic
    // assertion and get the number bumped.
    expect(homes.length).toBeGreaterThan(0);
    for (const h of homes) {
      expect(hasHabitatInterior(h.code), `${h.code} has no interior`).toBe(true);
    }
  });

  it('"step inside" is never offered where there is nowhere to go', () => {
    // The inverse of the above: anything without an interior must not
    // be reachable, because the route calls notFound() for it.
    for (const h of HABITAT_CATALOG) {
      if (hasHabitatInterior(h.code)) continue;
      expect(h.attractsSpeciesCodes.length, `${h.code} attracts species but can't be entered`).toBe(0);
    }
  });
});
