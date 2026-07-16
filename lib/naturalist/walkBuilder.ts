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

export type KeySide = 'left' | 'right';

export interface KeyPathStep {
  nodeId: string;
  correctSide: KeySide;
}

// Which side of `nodeId` leads (eventually) to `targetCode`?
function sideToward(nodeId: string, nextOnPath: string | null, targetCode: string): KeySide {
  const node = DICHOTOMOUS_KEY[nodeId];
  const matches = (child: KeyChild) =>
    isSpeciesLeaf(child) ? child.species === targetCode : child === nextOnPath;
  if (matches(node.leftChild)) return 'left';
  if (matches(node.rightChild)) return 'right';
  throw new Error(`sideToward: node "${nodeId}" does not lead to "${targetCode}"`);
}

/**
 * The canonical path annotated with the correct answer at each step —
 * this is what lets the walk actually CHECK the child's taps instead
 * of advancing on any answer.
 */
export function canonicalKeySteps(targetCode: string): KeyPathStep[] {
  const path = canonicalKeyPath(targetCode);
  return path.map((nodeId, i) => ({
    nodeId,
    correctSide: sideToward(nodeId, path[i + 1] ?? null, targetCode),
  }));
}

/**
 * Photo roles in which the target species itself appears along its own
 * key path — i.e. the features the questions actually interrogate
 * (a wildflower keyed by flower color → 'flower'). The mystery photo
 * must come from one of these roles, otherwise the child is asked
 * "what color are the flowers?" while looking at a photo of leaves.
 */
export function keyEvidenceRoles(targetCode: string): string[] {
  const roles: string[] = [];
  for (const { nodeId } of canonicalKeySteps(targetCode)) {
    const node = DICHOTOMOUS_KEY[nodeId];
    for (const ref of [node.leftPhoto, node.rightPhoto]) {
      if (ref.floraCode === targetCode && !roles.includes(ref.role)) {
        roles.push(ref.role);
      }
    }
  }
  return roles;
}

/**
 * De-duplicate key steps across a walk: for species after the first,
 * drop LEADING steps the child has already answered earlier this walk
 * with the same correct side ("broad flat leaves" for the third time
 * in a row teaches nothing). A step where the answer DIFFERS from what
 * they answered before is kept — that's real discrimination, e.g.
 * "red flowers? …yes for cardinal, no for milkweed". From the first
 * kept step onward everything is kept, so each path stays contiguous.
 */
export function dedupeWalkSteps(perSpecies: KeyPathStep[][]): KeyPathStep[][] {
  const answered = new Map<string, KeySide>();
  return perSpecies.map(steps => {
    let firstKept = 0;
    while (
      firstKept < steps.length - 1 && // always keep at least the final step
      answered.get(steps[firstKept].nodeId) === steps[firstKept].correctSide
    ) {
      firstKept++;
    }
    for (const s of steps) answered.set(s.nodeId, s.correctSide);
    return steps.slice(firstKept);
  });
}
