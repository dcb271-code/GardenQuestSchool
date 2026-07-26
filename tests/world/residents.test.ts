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
    const all = SPECIES_CATALOG.map(s => s.code);
    const out = placeResidents({
      discoveredCodes: all,
      builtHabitatCodes: HABITAT_CATALOG.map(h => h.code),
    });
    for (let i = 0; i < out.length; i++) {
      for (let j = i + 1; j < out.length; j++) {
        if (out[i].habitatCode !== out[j].habitatCode) continue;
        const d = Math.hypot(out[i].x - out[j].x, out[i].y - out[j].y);
        expect(d).toBeGreaterThan(24);
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

  it('pins which habitats are visitable, so the gap stays visible', () => {
    // Two homes still have no interior. That is a known gap, not an
    // accident — and the ArrivalCard no longer offers to step into
    // them, which used to be a 404.
    const visitable = HABITAT_CATALOG
      .filter(h => hasHabitatInterior(h.code))
      .map(h => h.code)
      .sort();
    expect(visitable).toEqual(
      ['bunny_burrow', 'butterfly_bush', 'frog_pond', 'log_pile', 'operations_cave'],
    );
    for (const code of ['ant_hill', 'bee_hotel']) {
      expect(hasHabitatInterior(code), `${code} — still to build`).toBe(false);
    }
  });
});
