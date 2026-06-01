import { describe, it, expect } from 'vitest';
import { canonicalKeyPath } from '@/lib/naturalist/walkBuilder';

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
