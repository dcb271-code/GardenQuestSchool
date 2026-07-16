import { describe, it, expect } from 'vitest';
import {
  canonicalKeyPath, canonicalKeySteps, keyEvidenceRoles, dedupeWalkSteps,
} from '@/lib/naturalist/walkBuilder';

describe('canonicalKeyPath', () => {
  it('returns a single node for the species at the first split', () => {
    // Eastern White Pine is the left-child of the root.
    const path = canonicalKeyPath('eastern_white_pine');
    expect(path).toEqual(['root']);
  });

  it('returns the full path for a deep leaf', () => {
    // mayapple sits behind: root → tree_or_flower → flower_red →
    //   flower_blue → flower_three_petals → flower_umbrella
    const path = canonicalKeyPath('mayapple');
    expect(path).toEqual([
      'root',
      'tree_or_flower',
      'flower_red',
      'flower_blue',
      'flower_three_petals',
      'flower_umbrella',
    ]);
  });

  it('every pilot species resolves to a non-empty path starting at root', () => {
    const codes = [
      'tulip_poplar', 'eastern_redbud', 'flowering_dogwood',
      'eastern_white_pine', 'shagbark_hickory',
      'virginia_bluebells', 'mayapple', 'trillium',
      'cardinal_flower', 'common_milkweed',
    ];
    for (const code of codes) {
      const path = canonicalKeyPath(code);
      expect(path.length).toBeGreaterThanOrEqual(1);
      expect(path[0]).toBe('root');
    }
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
    expect(walk[0].map(s => s.nodeId)).toEqual(['root', 'tree_or_flower', 'flower_red']);
    // milkweed: root + tree_or_flower were answered the same way, but
    // flower_red flips from left (cardinal) to right — kept from there.
    expect(walk[1].map(s => s.nodeId)).toEqual([
      'flower_red', 'flower_blue', 'flower_three_petals', 'flower_umbrella',
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
    expect(walk[0].length).toBe(6);
  });
});
