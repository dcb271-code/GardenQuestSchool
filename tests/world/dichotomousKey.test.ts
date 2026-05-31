import { describe, it, expect } from 'vitest';
import {
  DICHOTOMOUS_KEY,
  ROOT_NODE_ID,
  isSpeciesLeaf,
  type KeyNode,
  type KeyChild,
} from '@/lib/world/dichotomousKey';
import { FLORA_CATALOG } from '@/lib/world/floraCatalog';

function walkToSpecies(targetCode: string): string[] {
  // BFS from root looking for a leaf with the target species code.
  // Returns the path of node ids; throws if not reachable.
  const queue: Array<{ nodeId: string; path: string[] }> = [
    { nodeId: ROOT_NODE_ID, path: [ROOT_NODE_ID] },
  ];
  const visited = new Set<string>([ROOT_NODE_ID]);
  while (queue.length) {
    const { nodeId, path } = queue.shift()!;
    const node = DICHOTOMOUS_KEY[nodeId];
    if (!node) throw new Error(`Node ${nodeId} not in DICHOTOMOUS_KEY`);
    for (const child of [node.leftChild, node.rightChild]) {
      if (isSpeciesLeaf(child)) {
        if (child.species === targetCode) return path;
        continue;
      }
      if (visited.has(child)) continue;
      visited.add(child);
      queue.push({ nodeId: child, path: [...path, child] });
    }
  }
  throw new Error(`Species ${targetCode} unreachable from root`);
}

describe('DICHOTOMOUS_KEY — structure', () => {
  it(`has a root node at "${ROOT_NODE_ID}"`, () => {
    expect(DICHOTOMOUS_KEY[ROOT_NODE_ID]).toBeDefined();
  });

  it('every node id matches the entry key', () => {
    for (const [id, node] of Object.entries(DICHOTOMOUS_KEY)) {
      expect(node.id).toBe(id);
    }
  });

  it('every child reference resolves (no orphan ids)', () => {
    for (const node of Object.values(DICHOTOMOUS_KEY)) {
      for (const child of [node.leftChild, node.rightChild]) {
        if (isSpeciesLeaf(child)) continue;
        expect(DICHOTOMOUS_KEY[child], `child ${child} of ${node.id}`).toBeDefined();
      }
    }
  });

  it('every species leaf references a valid flora_code', () => {
    const codes = new Set(FLORA_CATALOG.map(f => f.code));
    for (const node of Object.values(DICHOTOMOUS_KEY)) {
      for (const child of [node.leftChild, node.rightChild]) {
        if (!isSpeciesLeaf(child)) continue;
        expect(codes.has(child.species), `leaf species ${child.species}`).toBe(true);
      }
    }
  });

  it('every comparison photo references a valid flora_code + role', () => {
    const codes = new Set(FLORA_CATALOG.map(f => f.code));
    const validRoles = new Set(['whole', 'leaf', 'bark', 'flower', 'fruit']);
    for (const node of Object.values(DICHOTOMOUS_KEY)) {
      for (const ref of [node.leftPhoto, node.rightPhoto]) {
        expect(codes.has(ref.floraCode), `${node.id} photo ref ${ref.floraCode}`).toBe(true);
        expect(validRoles.has(ref.role), `${node.id} photo role ${ref.role}`).toBe(true);
      }
    }
  });
});

describe('DICHOTOMOUS_KEY — reachability', () => {
  const SPECIES_CODES = [
    'tulip_poplar', 'eastern_redbud', 'flowering_dogwood',
    'eastern_white_pine', 'shagbark_hickory',
    'virginia_bluebells', 'mayapple', 'trillium',
    'cardinal_flower', 'common_milkweed',
  ];

  for (const code of SPECIES_CODES) {
    it(`${code} is reachable from root`, () => {
      const path = walkToSpecies(code);
      expect(path.length).toBeGreaterThanOrEqual(1);
      expect(path[0]).toBe(ROOT_NODE_ID);
    });
  }

  it('all 10 pilot species are reachable', () => {
    for (const code of SPECIES_CODES) {
      expect(() => walkToSpecies(code)).not.toThrow();
    }
  });
});
