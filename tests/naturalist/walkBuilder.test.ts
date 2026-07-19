import { describe, it, expect } from 'vitest';
import {
  canonicalKeyPath, canonicalKeySteps, keyEvidenceRoles, dedupeWalkSteps,
} from '@/lib/naturalist/walkBuilder';
import { FLORA_CATALOG } from '@/lib/world/floraCatalog';

describe('canonicalKeyPath', () => {
  it('returns a single node for the species at the first split', () => {
    // Eastern White Pine is the left-child of the root.
    const path = canonicalKeyPath('eastern_white_pine');
    expect(path).toEqual(['root']);
  });

  it('returns the full path for a deep leaf', () => {
    const path = canonicalKeyPath('mayapple');
    expect(path).toEqual([
      'root',
      'leaf_compound',
      'tree_or_flower',
      'flower_red',
      'flower_water',
      'flower_orange',
      'flower_blue',
      'flower_yellow',
      'flower_three_petals',
      'flower_umbrella',
    ]);
  });

  it('every catalog species resolves to a non-empty path starting at root', () => {
    for (const { code } of FLORA_CATALOG) {
      const path = canonicalKeyPath(code);
      expect(path.length, `${code} should be reachable`).toBeGreaterThanOrEqual(1);
      expect(path[0]).toBe('root');
    }
  });

  it('reaches poison ivy through the leaflet-count branch', () => {
    expect(canonicalKeyPath('poison_ivy')).toEqual([
      'root',
      'leaf_compound',
      'compound_count',
      'three_leaflet_ground',
      'three_leaflet_stalk',
      'three_leaflet_pairs',
    ]);
  });

  it('separates poison ivy from each of its real lookalikes', () => {
    // Every lookalike must end on a DIFFERENT leaf than poison ivy,
    // and each split must be a real field mark, not a coin flip.
    const ivy = canonicalKeySteps('poison_ivy');
    for (const code of ['virginia_creeper', 'box_elder', 'fragrant_sumac']) {
      const other = canonicalKeySteps(code);
      const diverge = other.find((s, i) => ivy[i] && ivy[i].nodeId === s.nodeId
        && ivy[i].correctSide !== s.correctSide);
      expect(diverge, `${code} must diverge from poison ivy somewhere`).toBeDefined();
    }
    // and the specific marks:
    // creeper leaves the ivy path at leaflet count (5 vs 3)
    expect(canonicalKeySteps('virginia_creeper').map(s => s.nodeId))
      .toContain('many_leaflet_group');
    // sumac splits on the middle-leaflet stalk
    expect(canonicalKeySteps('fragrant_sumac').at(-1))
      .toEqual({ nodeId: 'three_leaflet_stalk', correctSide: 'right' });
    // box elder splits on opposite-vs-alternate leaves
    expect(canonicalKeySteps('box_elder').at(-1))
      .toEqual({ nodeId: 'three_leaflet_pairs', correctSide: 'left' });
  });

  it('throws if species code is not a leaf in the tree', () => {
    expect(() => canonicalKeyPath('nonexistent_species'))
      .toThrow(/unreachable|not found/i);
  });
});

describe('canonicalKeySteps', () => {
  it('annotates each step with the side that leads to the species', () => {
    expect(canonicalKeySteps('eastern_white_pine')).toEqual([
      { nodeId: 'root', correctSide: 'left' },
    ]);
    expect(canonicalKeySteps('cardinal_flower')).toEqual([
      { nodeId: 'root', correctSide: 'right' },
      { nodeId: 'leaf_compound', correctSide: 'right' },
      { nodeId: 'tree_or_flower', correctSide: 'right' },
      { nodeId: 'flower_red', correctSide: 'left' },
    ]);
    // milkweed ends on the RIGHT of the final fork
    const milkweed = canonicalKeySteps('common_milkweed');
    expect(milkweed[milkweed.length - 1]).toEqual({
      nodeId: 'flower_umbrella', correctSide: 'right',
    });
  });
});

describe('keyEvidenceRoles', () => {
  it('returns the roles the key path interrogates for the species itself', () => {
    // milkweed appears in its own path only as a flower photo — so the
    // mystery photo must show flowers, not a young leaves-only plant.
    expect(keyEvidenceRoles('common_milkweed')).toEqual(['flower']);
    // pine is keyed by its needles
    expect(keyEvidenceRoles('eastern_white_pine')).toEqual(['leaf']);
  });
});

describe('dedupeWalkSteps', () => {
  it('drops leading steps already answered identically this walk', () => {
    const walk = dedupeWalkSteps([
      canonicalKeySteps('cardinal_flower'),
      canonicalKeySteps('common_milkweed'),
    ]);
    // cardinal keeps its full path
    expect(walk[0].map(s => s.nodeId)).toEqual([
      'root', 'leaf_compound', 'tree_or_flower', 'flower_red',
    ]);
    // milkweed: root + tree_or_flower were answered the same way, but
    // flower_red flips from left (cardinal) to right — kept from there.
    expect(walk[1].map(s => s.nodeId)).toEqual([
      'flower_red', 'flower_water', 'flower_orange', 'flower_blue',
      'flower_yellow', 'flower_three_petals', 'flower_umbrella',
    ]);
  });

  it('always keeps at least the final step', () => {
    const walk = dedupeWalkSteps([
      canonicalKeySteps('mayapple'),
      canonicalKeySteps('common_milkweed'),
    ]);
    // mayapple's path answers everything up to flower_umbrella(left);
    // milkweed differs only at flower_umbrella(right) — one real step.
    expect(walk[1].map(s => s.nodeId)).toEqual(['flower_umbrella']);
    const repeat = dedupeWalkSteps([
      canonicalKeySteps('cardinal_flower'),
      canonicalKeySteps('cardinal_flower'),
    ]);
    expect(repeat[1].length).toBeGreaterThanOrEqual(1);
  });

  it('does not trim anything for the first species', () => {
    const walk = dedupeWalkSteps([canonicalKeySteps('common_milkweed')]);
    expect(walk[0]).toEqual(canonicalKeySteps('common_milkweed'));
  });
});

describe('poison ivy safety invariants', () => {
  const ivy = FLORA_CATALOG.find(f => f.code === 'poison_ivy')!;

  it('poison ivy is flagged as a touch hazard and carries a safety note', () => {
    expect(ivy.hazard).toBe('touch');
    expect(ivy.safetyNote).toBeTruthy();
    // The note must tell her she does NOT need to be certain — that is
    // the whole lesson, and the thing a quiz format tends to lose.
    expect(ivy.safetyNote!.toLowerCase()).toMatch(/do not need to be sure|leave it alone/);
  });

  it('the lookalikes are flagged so their reveal can reassure', () => {
    for (const code of ['virginia_creeper', 'box_elder', 'fragrant_sumac']) {
      const sp = FLORA_CATALOG.find(f => f.code === code)!;
      expect(sp.hazardLookalike, `${code} should be a flagged lookalike`).toBe(true);
      expect(sp.hazard, `${code} is harmless and must not be a hazard`).toBeUndefined();
    }
  });

  it('every three-leaflet plant in the key is either the hazard or a flagged lookalike', () => {
    // If a fourth three-leaflet species is ever added and NOT flagged,
    // its reveal would silently skip the reassurance and the child
    // would be left thinking it might be poison ivy.
    const threeLeaflet = FLORA_CATALOG.filter(f =>
      canonicalKeyPath(f.code).includes('three_leaflet_stalk'));
    expect(threeLeaflet.length).toBeGreaterThanOrEqual(3);
    for (const sp of threeLeaflet) {
      expect(!!sp.hazard || !!sp.hazardLookalike, `${sp.code} must be flagged`).toBe(true);
    }
  });

  it('poison ivy is keyed on leaflet features, never on flowers', () => {
    // Its flowers are tiny and easy to miss; keying on them would make
    // the mystery photo unanswerable half the year.
    const roles = keyEvidenceRoles('poison_ivy');
    expect(roles).toContain('leaf');
    expect(roles).not.toContain('flower');
  });

  it('the leaflet count is asked early, not buried behind unrelated questions', () => {
    const steps = canonicalKeySteps('poison_ivy').map(s => s.nodeId);
    expect(steps.indexOf('compound_count')).toBeLessThanOrEqual(2);
  });
});
