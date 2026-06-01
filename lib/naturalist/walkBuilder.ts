// lib/naturalist/walkBuilder.ts
//
// Pure traversal of DICHOTOMOUS_KEY: given a target species code,
// returns the ordered list of node ids from root down to the parent
// of that species leaf. The API uses this to build each walk
// session's keyPath.

import {
  DICHOTOMOUS_KEY,
  ROOT_NODE_ID,
  isSpeciesLeaf,
  type KeyChild,
} from '@/lib/world/dichotomousKey';

export function canonicalKeyPath(targetCode: string): string[] {
  // DFS to find the first path from root whose leaf matches targetCode.
  function dfs(nodeId: string, path: string[]): string[] | null {
    const node = DICHOTOMOUS_KEY[nodeId];
    if (!node) return null;
    const next = [...path, nodeId];
    for (const child of [node.leftChild, node.rightChild] as KeyChild[]) {
      if (isSpeciesLeaf(child)) {
        if (child.species === targetCode) return next;
        continue;
      }
      const found = dfs(child, next);
      if (found) return found;
    }
    return null;
  }
  const path = dfs(ROOT_NODE_ID, []);
  if (!path) throw new Error(`canonicalKeyPath: species "${targetCode}" unreachable in DICHOTOMOUS_KEY`);
  return path;
}
