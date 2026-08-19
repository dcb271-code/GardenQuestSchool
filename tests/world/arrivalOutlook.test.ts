import { describe, it, expect } from 'vitest';
import { arrivalOutlook, outlookMessage } from '@/lib/world/arrivalOutlook';
import { SPECIES_CATALOG } from '@/lib/world/speciesCatalog';
import { HABITAT_CATALOG } from '@/lib/world/habitatCatalog';

/**
 * "way do the animals not uriveing at their habits" — the animals WERE
 * all arrived; nothing said so. A full garden must say it is full, and
 * say what would bring more, in words a child can act on.
 */

const ALL_HABITATS = HABITAT_CATALOG.map(h => h.code);
const ATTRACTABLE = SPECIES_CATALOG.filter(s => s.habitatReqCodes.length > 0);

describe('arrival outlook', () => {
  it('stays quiet while animals can still arrive', () => {
    const o = arrivalOutlook(ALL_HABITATS, [], ALL_HABITATS, SPECIES_CATALOG);
    expect(o.waitingNow).toBeGreaterThan(0);
    expect(outlookMessage(o)).toBeNull();
  });

  it("speaks when full, and names what to do — Cecily's real state", () => {
    // Her seven built habitats, all their species discovered, three
    // badges — the exact shape her letter came from.
    const built = ['bunny_burrow', 'log_pile', 'frog_pond', 'ant_hill',
                   'bee_hotel', 'butterfly_bush', 'bird_feeder'];
    const badges = ['ant_hill', 'frog_pond', 'bird_feeder'];
    const discovered = ATTRACTABLE
      .filter(s =>
        s.habitatReqCodes.every(h => built.includes(h)) &&
        (!s.requiresResearcherBadge || s.habitatReqCodes.every(h => badges.includes(h))))
      .map(s => s.code);

    const o = arrivalOutlook(built, discovered, badges, SPECIES_CATALOG);
    expect(o.waitingNow).toBe(0);
    const msg = outlookMessage(o)!;
    expect(msg).toContain('full');
    // The two real moves are both named: build the owl box, earn the
    // log pile badge.
    expect(msg.toLowerCase()).toContain('owl box');
    expect(msg.toLowerCase()).toContain('log pile');
    expect(msg.toLowerCase()).toContain('badge');
  });

  it('the best move leads: unlocks sort by how many animals they free', () => {
    const o = arrivalOutlook([], [], [], SPECIES_CATALOG);
    for (let i = 1; i < o.unlocks.length; i++) {
      expect(o.unlocks[i - 1].speciesCount).toBeGreaterThanOrEqual(o.unlocks[i].speciesCount);
    }
  });

  it('celebrates a truly complete journal instead of nagging', () => {
    const o = arrivalOutlook(
      ALL_HABITATS, ATTRACTABLE.map(s => s.code), ALL_HABITATS, SPECIES_CATALOG,
    );
    expect(o.waitingNow).toBe(0);
    expect(o.unlocks).toHaveLength(0);
    expect(outlookMessage(o)).toContain('found them all');
  });

  it('never blames the arrival system for bloom or dig species', () => {
    const o = arrivalOutlook([], [], [], SPECIES_CATALOG);
    expect(o.attractable).toBe(ATTRACTABLE.length);
    expect(o.attractable).toBeLessThan(SPECIES_CATALOG.length);
  });
});
