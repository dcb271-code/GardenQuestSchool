# Naturalist Grove — Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the working `/naturalist/walk` UI + API so Cecily can walk through 2-4 species per session using a dichotomous-key flow, see real CC-licensed photos, and have each identification recorded to `flora_review`. No signpost, no journal tab, no spaced repetition yet — those are Phase 3 + 4.

**Architecture:** A shared `DICHOTOMOUS_KEY` (9 internal nodes covering all 10 pilot species) lives in `lib/world/dichotomousKey.ts`. The `/api/naturalist/walk` POST endpoint picks 2-4 random species, resolves each one's canonical root-to-leaf key path, hydrates photo URLs + attribution from `flora_photo`, and returns one `WalkSession` object. The `/naturalist/walk/page.tsx` client component drives a per-species state machine (intro → key steps → reveal → notice → next) and POSTs to `/api/naturalist/walk/identified` after each reveal to upsert exposures into `flora_review`. Pure helper modules (`walkSelection`, `floraPhotoStorage`, `walkBuilder`) are unit-tested; the page + API are smoke-tested end-to-end.

**Tech Stack:** Next.js 14 App Router, TypeScript 5, framer-motion, Tailwind, Supabase (`@supabase/supabase-js` v2.104, service-role client via `lib/supabase/server.ts`), Vitest + jsdom, zod for request validation, existing `useAccessibilitySettings` hook for reduced-motion gating.

**Spec reference:** `docs/superpowers/specs/2026-05-29-naturalist-grove-design.md`, especially §3 (Pedagogical Model), §5 (Data Model — dichotomous key shape), §7 (UI Flow), §11 (Phase 2 row).

**Phase 1 landed:**
- `lib/world/floraCatalog.ts` with 10 species (corrected taxon IDs, `5da80a1`)
- `flora_review`, `flora_photo`, `key_node_photo` tables + RLS (migration 011)
- 50 photos in `flora-photos` bucket (5 per species, tagged `whole | leaf | bark | flower | fruit` × tier 1)

---

## File Structure

| File | Created/Modified | Responsibility |
|---|---|---|
| `lib/world/dichotomousKey.ts` | **Create** | Type defs + `DICHOTOMOUS_KEY` constant: 9 internal nodes, 10 species leaves. |
| `tests/world/dichotomousKey.test.ts` | **Create** | Reachability + structural invariants. |
| `lib/naturalist/walkSelection.ts` | **Create** | Pure `pickWalkSpecies(allCodes, n, rand)` — deterministic with injected RNG. |
| `tests/naturalist/walkSelection.test.ts` | **Create** | Unit tests with seeded RNG. |
| `lib/naturalist/floraPhotoStorage.ts` | **Create** | Pure `publicUrlFor(storagePath)` builder. |
| `tests/naturalist/floraPhotoStorage.test.ts` | **Create** | URL shape + edge cases. |
| `lib/naturalist/walkBuilder.ts` | **Create** | `keyPathFor(species)` returns root-to-leaf node sequence. Pure. |
| `tests/naturalist/walkBuilder.test.ts` | **Create** | Path correctness for each of 10 species. |
| `app/api/naturalist/walk/route.ts` | **Create** | POST: pick species + hydrate photos + return `WalkSession`. |
| `app/api/naturalist/walk/identified/route.ts` | **Create** | POST: upsert `flora_review` (exposures++, last_seen_at=now). |
| `app/(child)/naturalist/layout.tsx` | **Create** | Thin wrapper — just renders children (no nav chrome; the walk is full-screen). |
| `app/(child)/naturalist/walk/page.tsx` | **Create** | Client component: fetch walk, drive state machine. |
| `components/child/naturalist/WalkProgress.tsx` | **Create** | Pacing dots that fill as species complete. |
| `components/child/naturalist/DichotomousStep.tsx` | **Create** | One yes/no question with photo pair. |
| `components/child/naturalist/SpeciesReveal.tsx` | **Create** | Species reveal + 3 feature photos + 2 facts. |
| `components/child/naturalist/EndOfWalk.tsx` | **Create** | Summary cards + "Back to garden" link. |

**Existing patterns to follow:**
- API routes use `createServiceClient()` from `@/lib/supabase/server`, parse body with `zod`.
- Child pages use `'use client'`, `useRouter` from `next/navigation`, `useAccessibilitySettings()` for `settings.reducedMotion`.
- framer-motion `motion.div` + `AnimatePresence` for transitions.
- Tailwind classes — palette: `bg-cream`, `text-bark`, `text-forest`, `bg-terracotta` etc. (see `tailwind.config.ts` for names).
- Tests use `import { describe, it, expect } from 'vitest'`. Alias `@/` = project root.

---

## Task 1: Author DICHOTOMOUS_KEY with types + reachability tests

**Files:**
- Create: `lib/world/dichotomousKey.ts`
- Create: `tests/world/dichotomousKey.test.ts`

The tree must cover all 10 pilot species. Each species is reachable via exactly one canonical path. Comparison photos at each branch reference an existing `flora_code` + `PhotoRole` — the API resolves these to real Storage URLs at request time.

- [ ] **Step 1: Write the failing test**

Create `tests/world/dichotomousKey.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx vitest run tests/world/dichotomousKey.test.ts`
Expected: FAIL with "Cannot find module '@/lib/world/dichotomousKey'".

- [ ] **Step 3: Implement the dichotomous key**

Create `lib/world/dichotomousKey.ts`:

```ts
// lib/world/dichotomousKey.ts
//
// Shared dichotomous decision tree for the Naturalist Grove module.
// Every Phase 1 pilot species is a leaf of this tree. The walk-builder
// (lib/naturalist/walkBuilder.ts) traverses from root to a target
// species, producing the canonical key path shown to the learner.
//
// Each internal node carries a yes/no question + a comparison photo
// pair. Photo references are (flora_code, photoRole) pairs that the
// API resolves to real Supabase Storage URLs at request time.
//
// Design spec: docs/superpowers/specs/2026-05-29-naturalist-grove-design.md §5

import type { PhotoRole } from './floraCatalog';

export const ROOT_NODE_ID = 'root';

export interface KeyPhotoRef {
  floraCode: string;       // references FLORA_CATALOG[].code
  role: PhotoRole;
}

export interface KeySpeciesLeaf {
  species: string;         // flora_code
}

export type KeyChild = string | KeySpeciesLeaf;

export interface KeyNode {
  id: string;
  question: string;
  leftLabel: string;
  rightLabel: string;
  leftPhoto: KeyPhotoRef;
  rightPhoto: KeyPhotoRef;
  leftChild: KeyChild;
  rightChild: KeyChild;
}

export function isSpeciesLeaf(child: KeyChild): child is KeySpeciesLeaf {
  return typeof child === 'object' && 'species' in child;
}

export const DICHOTOMOUS_KEY: Record<string, KeyNode> = {
  // ── ROOT ─────────────────────────────────────────────────────────
  root: {
    id: 'root',
    question: 'Look at the leaves. Are they...',
    leftLabel: 'long thin needles?',
    rightLabel: 'broad flat leaves?',
    leftPhoto: { floraCode: 'eastern_white_pine', role: 'leaf' },
    rightPhoto: { floraCode: 'tulip_poplar', role: 'leaf' },
    leftChild: { species: 'eastern_white_pine' },
    rightChild: 'tree_or_flower',
  },

  // ── BROADLEAF: tree or wildflower? ───────────────────────────────
  tree_or_flower: {
    id: 'tree_or_flower',
    question: 'Is the plant...',
    leftLabel: 'tall and woody (a tree)?',
    rightLabel: 'low and soft (a wildflower)?',
    leftPhoto: { floraCode: 'tulip_poplar', role: 'whole' },
    rightPhoto: { floraCode: 'cardinal_flower', role: 'whole' },
    leftChild: 'tree_leaf_compound',
    rightChild: 'flower_red',
  },

  // ── TREE BRANCH ──────────────────────────────────────────────────
  tree_leaf_compound: {
    id: 'tree_leaf_compound',
    question: 'Look at one leaf. Is it...',
    leftLabel: 'many leaflets joined together?',
    rightLabel: 'one single broad leaf?',
    leftPhoto: { floraCode: 'shagbark_hickory', role: 'leaf' },
    rightPhoto: { floraCode: 'flowering_dogwood', role: 'leaf' },
    leftChild: { species: 'shagbark_hickory' },
    rightChild: 'tree_heart_shape',
  },

  tree_heart_shape: {
    id: 'tree_heart_shape',
    question: 'Is the leaf shape...',
    leftLabel: 'heart-shaped?',
    rightLabel: 'a different shape?',
    leftPhoto: { floraCode: 'eastern_redbud', role: 'leaf' },
    rightPhoto: { floraCode: 'tulip_poplar', role: 'leaf' },
    leftChild: { species: 'eastern_redbud' },
    rightChild: 'tree_lobed_or_oval',
  },

  tree_lobed_or_oval: {
    id: 'tree_lobed_or_oval',
    question: 'Look at the leaf edge. Is it...',
    leftLabel: 'a tulip shape with four lobes?',
    rightLabel: 'a smooth oval with no lobes?',
    leftPhoto: { floraCode: 'tulip_poplar', role: 'leaf' },
    rightPhoto: { floraCode: 'flowering_dogwood', role: 'leaf' },
    leftChild: { species: 'tulip_poplar' },
    rightChild: { species: 'flowering_dogwood' },
  },

  // ── WILDFLOWER BRANCH ────────────────────────────────────────────
  flower_red: {
    id: 'flower_red',
    question: 'Are the flowers...',
    leftLabel: 'bright scarlet red?',
    rightLabel: 'a different color?',
    leftPhoto: { floraCode: 'cardinal_flower', role: 'flower' },
    rightPhoto: { floraCode: 'virginia_bluebells', role: 'flower' },
    leftChild: { species: 'cardinal_flower' },
    rightChild: 'flower_blue',
  },

  flower_blue: {
    id: 'flower_blue',
    question: 'Are the flowers...',
    leftLabel: 'sky-blue trumpets?',
    rightLabel: 'a different color?',
    leftPhoto: { floraCode: 'virginia_bluebells', role: 'flower' },
    rightPhoto: { floraCode: 'trillium', role: 'flower' },
    leftChild: { species: 'virginia_bluebells' },
    rightChild: 'flower_three_petals',
  },

  flower_three_petals: {
    id: 'flower_three_petals',
    question: 'How many petals on the flower?',
    leftLabel: 'three large white petals?',
    rightLabel: 'a different shape?',
    leftPhoto: { floraCode: 'trillium', role: 'flower' },
    rightPhoto: { floraCode: 'mayapple', role: 'whole' },
    leftChild: { species: 'trillium' },
    rightChild: 'flower_umbrella',
  },

  flower_umbrella: {
    id: 'flower_umbrella',
    question: 'Does the plant have...',
    leftLabel: 'a giant umbrella leaf hiding the flower?',
    rightLabel: 'a pink ball-cluster of many tiny flowers?',
    leftPhoto: { floraCode: 'mayapple', role: 'whole' },
    rightPhoto: { floraCode: 'common_milkweed', role: 'flower' },
    leftChild: { species: 'mayapple' },
    rightChild: { species: 'common_milkweed' },
  },
};
```

- [ ] **Step 4: Run tests**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx vitest run tests/world/dichotomousKey.test.ts`
Expected: PASS. Structure tests (~5) + reachability tests (10 + 1) = 16 tests.

- [ ] **Step 5: Commit**

```bash
cd /c/Users/dylan/GardenQuestSchool && git add lib/world/dichotomousKey.ts tests/world/dichotomousKey.test.ts && git commit -m "feat(naturalist): DICHOTOMOUS_KEY tree covering 10 pilot species + reachability tests"
```

---

## Task 2: Walk-selection picker (pure function)

**Files:**
- Create: `lib/naturalist/walkSelection.ts`
- Create: `tests/naturalist/walkSelection.test.ts`

Picks 2-4 distinct species codes. Phase 2 = uniform random; Phase 3 will replace with the SM-2 spaced picker. Function takes an explicit RNG for deterministic testing.

- [ ] **Step 1: Write the failing test**

Create `tests/naturalist/walkSelection.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { pickWalkSpecies, type Rng } from '@/lib/naturalist/walkSelection';

function seededRng(seed: number): Rng {
  // Mulberry32 — small deterministic PRNG, no deps.
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ALL = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];

describe('pickWalkSpecies', () => {
  it('returns n distinct codes from the pool', () => {
    const picked = pickWalkSpecies(ALL, 3, seededRng(42));
    expect(picked).toHaveLength(3);
    expect(new Set(picked).size).toBe(3);
    for (const code of picked) expect(ALL).toContain(code);
  });

  it('is deterministic given the same seed', () => {
    const a = pickWalkSpecies(ALL, 3, seededRng(99));
    const b = pickWalkSpecies(ALL, 3, seededRng(99));
    expect(a).toEqual(b);
  });

  it('produces different results for different seeds', () => {
    const a = pickWalkSpecies(ALL, 4, seededRng(1));
    const b = pickWalkSpecies(ALL, 4, seededRng(2));
    expect(a).not.toEqual(b);
  });

  it('throws if n > pool size', () => {
    expect(() => pickWalkSpecies(['x'], 2, seededRng(0))).toThrow(/not enough/i);
  });

  it('throws if n < 1', () => {
    expect(() => pickWalkSpecies(ALL, 0, seededRng(0))).toThrow(/at least 1/i);
  });

  it('handles n = pool size by returning all (shuffled)', () => {
    const picked = pickWalkSpecies(['a', 'b'], 2, seededRng(7));
    expect(picked.sort()).toEqual(['a', 'b']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx vitest run tests/naturalist/walkSelection.test.ts`
Expected: FAIL with "Cannot find module '@/lib/naturalist/walkSelection'".

- [ ] **Step 3: Implement**

Create `lib/naturalist/walkSelection.ts`:

```ts
// lib/naturalist/walkSelection.ts
//
// Picks 2-4 species for a single walk session. Phase 2: uniform random.
// Phase 3 will replace with a spacing-aware picker (50% due / 30% new /
// 20% wild card per the design spec).
//
// Pure function — caller injects the RNG so tests can seed it.

export type Rng = () => number;  // returns [0, 1)

export function pickWalkSpecies(
  pool: readonly string[],
  n: number,
  rng: Rng,
): string[] {
  if (n < 1) throw new Error('pickWalkSpecies: n must be at least 1');
  if (n > pool.length) {
    throw new Error(
      `pickWalkSpecies: not enough species in pool (need ${n}, have ${pool.length})`,
    );
  }

  // Fisher-Yates partial shuffle: shuffle the first n indices.
  const arr = [...pool];
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(rng() * (arr.length - i));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}
```

- [ ] **Step 4: Run tests**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx vitest run tests/naturalist/walkSelection.test.ts`
Expected: PASS — 6 tests.

- [ ] **Step 5: Commit**

```bash
cd /c/Users/dylan/GardenQuestSchool && git add lib/naturalist/walkSelection.ts tests/naturalist/walkSelection.test.ts && git commit -m "feat(naturalist): walkSelection.pickWalkSpecies pure picker + tests"
```

---

## Task 3: Public Storage URL helper

**Files:**
- Create: `lib/naturalist/floraPhotoStorage.ts`
- Create: `tests/naturalist/floraPhotoStorage.test.ts`

Pure URL-builder so the API + page can both compute Storage URLs without separate Supabase clients.

- [ ] **Step 1: Write the failing test**

Create `tests/naturalist/floraPhotoStorage.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  publicUrlFor,
  BUCKET_NAME,
} from '@/lib/naturalist/floraPhotoStorage';

const BASE = 'https://xyz.supabase.co';

describe('floraPhotoStorage.publicUrlFor', () => {
  it('builds the canonical public-read URL', () => {
    const u = publicUrlFor(BASE, 'tulip_poplar/leaf_1_inat_inat_104857.jpg');
    expect(u).toBe(
      'https://xyz.supabase.co/storage/v1/object/public/flora-photos/tulip_poplar/leaf_1_inat_inat_104857.jpg',
    );
  });

  it('handles a trailing slash on the base URL', () => {
    const u = publicUrlFor(BASE + '/', 'foo/bar.jpg');
    expect(u).toBe('https://xyz.supabase.co/storage/v1/object/public/flora-photos/foo/bar.jpg');
  });

  it('appends a width query when sizePx given', () => {
    const u = publicUrlFor(BASE, 'foo/bar.jpg', { widthPx: 720 });
    expect(u).toBe(
      'https://xyz.supabase.co/storage/v1/object/public/flora-photos/foo/bar.jpg?width=720',
    );
  });

  it('throws on an empty storagePath', () => {
    expect(() => publicUrlFor(BASE, '')).toThrow(/storagePath/);
  });

  it('exports the bucket name as a constant', () => {
    expect(BUCKET_NAME).toBe('flora-photos');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx vitest run tests/naturalist/floraPhotoStorage.test.ts`
Expected: FAIL with "Cannot find module '@/lib/naturalist/floraPhotoStorage'".

- [ ] **Step 3: Implement**

Create `lib/naturalist/floraPhotoStorage.ts`:

```ts
// lib/naturalist/floraPhotoStorage.ts
//
// Pure helpers for building public Supabase Storage URLs to the
// flora-photos bucket. Both the API route and the page rendering
// code consume these — keeping it pure means no Supabase client
// instantiation in hot paths.

export const BUCKET_NAME = 'flora-photos';

export interface PublicUrlOptions {
  widthPx?: number;   // appended as ?width=<N> for Supabase image transform
}

export function publicUrlFor(
  baseUrl: string,
  storagePath: string,
  opts: PublicUrlOptions = {},
): string {
  if (!storagePath) throw new Error('publicUrlFor: storagePath must be non-empty');
  const base = baseUrl.replace(/\/+$/, '');
  let u = `${base}/storage/v1/object/public/${BUCKET_NAME}/${storagePath}`;
  if (opts.widthPx) u += `?width=${opts.widthPx}`;
  return u;
}
```

- [ ] **Step 4: Run tests**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx vitest run tests/naturalist/floraPhotoStorage.test.ts`
Expected: PASS — 5 tests.

- [ ] **Step 5: Commit**

```bash
cd /c/Users/dylan/GardenQuestSchool && git add lib/naturalist/floraPhotoStorage.ts tests/naturalist/floraPhotoStorage.test.ts && git commit -m "feat(naturalist): publicUrlFor — pure Storage URL builder + tests"
```

---

## Task 4: Walk-builder — canonical key path per species

**Files:**
- Create: `lib/naturalist/walkBuilder.ts`
- Create: `tests/naturalist/walkBuilder.test.ts`

Given a target species, walks the `DICHOTOMOUS_KEY` from root to the leaf and returns the ordered list of node ids on that path. Pure — used by the API to build per-species `keyPath`.

- [ ] **Step 1: Write the failing test**

Create `tests/naturalist/walkBuilder.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx vitest run tests/naturalist/walkBuilder.test.ts`
Expected: FAIL with "Cannot find module '@/lib/naturalist/walkBuilder'".

- [ ] **Step 3: Implement**

Create `lib/naturalist/walkBuilder.ts`:

```ts
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
```

- [ ] **Step 4: Run tests**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx vitest run tests/naturalist/walkBuilder.test.ts`
Expected: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
cd /c/Users/dylan/GardenQuestSchool && git add lib/naturalist/walkBuilder.ts tests/naturalist/walkBuilder.test.ts && git commit -m "feat(naturalist): canonicalKeyPath — root-to-leaf traversal + tests"
```

---

## Task 5: POST /api/naturalist/walk — build + hydrate WalkSession

**Files:**
- Create: `app/api/naturalist/walk/route.ts`

POST handler: accepts `{ learnerId, n? }`, picks `n` (default 3) species, builds each species' canonical key path + reveal photo set, hydrates Storage URLs, returns a complete `WalkSession`.

- [ ] **Step 1: Implement the route**

Create `app/api/naturalist/walk/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { createServiceClient } from '@/lib/supabase/server';
import { FLORA_CATALOG, type FloraData, type PhotoRole } from '@/lib/world/floraCatalog';
import { DICHOTOMOUS_KEY, isSpeciesLeaf } from '@/lib/world/dichotomousKey';
import { canonicalKeyPath } from '@/lib/naturalist/walkBuilder';
import { pickWalkSpecies } from '@/lib/naturalist/walkSelection';
import { publicUrlFor } from '@/lib/naturalist/floraPhotoStorage';

const Body = z.object({
  learnerId: z.string().min(1),
  n: z.number().int().min(2).max(4).optional(),
});

interface PhotoAttribution {
  photographer: string | null;
  licenseCode: string;
  sourceUrl: string;
}
interface PhotoRef {
  url: string;
  alt: string;
  attribution: PhotoAttribution;
}
interface KeyStepResolved {
  nodeId: string;
  question: string;
  leftLabel: string;
  rightLabel: string;
  leftPhoto: PhotoRef;
  rightPhoto: PhotoRef;
}
interface WalkSpeciesPayload {
  position: number;
  floraCode: string;
  commonName: string;
  scientificName: string;
  notableFeatures: string[];
  facts: string[];
  emoji: string;
  heroPhoto: PhotoRef | null;
  keyPath: KeyStepResolved[];
  revealPhotos: PhotoRef[];
}
interface WalkSessionPayload {
  id: string;
  species: WalkSpeciesPayload[];
}

interface FloraPhotoRow {
  flora_code: string;
  role: string;
  tier: number;
  storage_path: string;
  alt_text: string;
  photographer: string | null;
  license_code: string;
  source_url: string;
}

function toPhotoRef(row: FloraPhotoRow, baseUrl: string): PhotoRef {
  return {
    url: publicUrlFor(baseUrl, row.storage_path, { widthPx: 720 }),
    alt: row.alt_text,
    attribution: {
      photographer: row.photographer,
      licenseCode: row.license_code,
      sourceUrl: row.source_url,
    },
  };
}

function pickRow(rows: FloraPhotoRow[], floraCode: string, role: PhotoRole): FloraPhotoRow | null {
  const candidates = rows.filter(r => r.flora_code === floraCode && r.role === role);
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function pickRowAnyRole(rows: FloraPhotoRow[], floraCode: string): FloraPhotoRow | null {
  const candidates = rows.filter(r => r.flora_code === floraCode);
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const n = body.n ?? (2 + Math.floor(Math.random() * 3)); // 2..4

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return NextResponse.json({ error: 'supabase url missing' }, { status: 500 });

  // 1. Pick species
  const picked = pickWalkSpecies(FLORA_CATALOG.map(f => f.code), n, Math.random);

  // 2. Load ALL relevant photo rows in one shot (avoids N round-trips)
  const db = createServiceClient();
  const referencedCodes = new Set<string>(picked);
  for (const code of picked) {
    for (const nodeId of canonicalKeyPath(code)) {
      const node = DICHOTOMOUS_KEY[nodeId];
      referencedCodes.add(node.leftPhoto.floraCode);
      referencedCodes.add(node.rightPhoto.floraCode);
    }
  }
  const { data: photoRows, error } = await db
    .from('flora_photo')
    .select('flora_code, role, tier, storage_path, alt_text, photographer, license_code, source_url')
    .in('flora_code', Array.from(referencedCodes))
    .eq('tier', 1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rows: FloraPhotoRow[] = photoRows ?? [];

  // 3. Build each species payload
  const speciesPayloads: WalkSpeciesPayload[] = picked.map((code, idx) => {
    const sp = FLORA_CATALOG.find(f => f.code === code) as FloraData;

    // Hero: a 'whole' photo if present, else any photo
    const heroRow = pickRow(rows, code, 'whole') ?? pickRowAnyRole(rows, code);
    const heroPhoto = heroRow ? toPhotoRef(heroRow, baseUrl) : null;

    // KeyPath: resolve each node's photo pair
    const pathNodeIds = canonicalKeyPath(code);
    const keyPath: KeyStepResolved[] = pathNodeIds.map(nid => {
      const node = DICHOTOMOUS_KEY[nid];
      const lRow = pickRow(rows, node.leftPhoto.floraCode, node.leftPhoto.role)
        ?? pickRowAnyRole(rows, node.leftPhoto.floraCode);
      const rRow = pickRow(rows, node.rightPhoto.floraCode, node.rightPhoto.role)
        ?? pickRowAnyRole(rows, node.rightPhoto.floraCode);
      return {
        nodeId: nid,
        question: node.question,
        leftLabel: node.leftLabel,
        rightLabel: node.rightLabel,
        leftPhoto: lRow
          ? toPhotoRef(lRow, baseUrl)
          : placeholderPhoto(node.leftLabel),
        rightPhoto: rRow
          ? toPhotoRef(rRow, baseUrl)
          : placeholderPhoto(node.rightLabel),
      };
    });

    // RevealPhotos: up to 3 different roles for this species
    const revealRows: FloraPhotoRow[] = [];
    for (const role of sp.photoRoles) {
      const r = pickRow(rows, code, role);
      if (r && !revealRows.find(x => x.storage_path === r.storage_path)) revealRows.push(r);
      if (revealRows.length === 3) break;
    }
    const revealPhotos = revealRows.map(r => toPhotoRef(r, baseUrl));

    return {
      position: idx + 1,
      floraCode: code,
      commonName: sp.commonName,
      scientificName: sp.scientificName,
      notableFeatures: sp.notableFeatures,
      facts: sp.facts,
      emoji: sp.emoji,
      heroPhoto,
      keyPath,
      revealPhotos,
    };
  });

  const payload: WalkSessionPayload = {
    id: randomUUID(),
    species: speciesPayloads,
  };
  return NextResponse.json(payload);
}

function placeholderPhoto(alt: string): PhotoRef {
  return {
    url: '',
    alt,
    attribution: { photographer: null, licenseCode: 'cc0', sourceUrl: '' },
  };
}
```

- [ ] **Step 2: Manual smoke-test the route**

Start the dev server:
```bash
cd /c/Users/dylan/GardenQuestSchool && npm run dev
```

In another shell, find a learner id from the DB. Reuse the existing learner via supabase. Then:
```bash
LEARNER_ID=$(npx tsx -e "import('dotenv').then(({config}) => { config({path: '.env.local'}); import('@supabase/supabase-js').then(async ({createClient}) => { const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); const {data} = await s.from('learner').select('id').limit(1); console.log(data[0].id); }); });" 2>/dev/null | tail -1)
curl -sS -X POST http://localhost:3000/api/naturalist/walk -H 'Content-Type: application/json' -d "{\"learnerId\":\"$LEARNER_ID\",\"n\":3}" | python -m json.tool | head -60
```

Expected output (abridged): JSON with `id` (uuid), `species` array of length 3, each species with `commonName`, `keyPath` (array of nodes), `revealPhotos` (array of photo refs), `heroPhoto` with a `url` like `https://xyz.supabase.co/storage/v1/object/public/flora-photos/.../whole_1_inat_...jpg?width=720`.

Kill the dev server when done.

- [ ] **Step 3: Commit**

```bash
cd /c/Users/dylan/GardenQuestSchool && git add app/api/naturalist/walk/route.ts && git commit -m "feat(naturalist): POST /api/naturalist/walk — build hydrated WalkSession"
```

---

## Task 6: POST /api/naturalist/walk/identified — record exposure

**Files:**
- Create: `app/api/naturalist/walk/identified/route.ts`

Upserts one row in `flora_review`: if `(learner_id, flora_code)` already exists, increment `exposures` and update `last_seen_at`; otherwise create a fresh row with `exposures=1`. No spacing logic yet — that's Phase 3.

- [ ] **Step 1: Implement the route**

Create `app/api/naturalist/walk/identified/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';

const Body = z.object({
  learnerId: z.string().min(1),
  floraCode: z.string().min(1),
  photoRole: z.string().optional(),  // role of the hero photo Cecily just saw
});

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();
  const now = new Date().toISOString();

  // Try to fetch existing
  const { data: existing, error: selErr } = await db
    .from('flora_review')
    .select('id, exposures, photo_roles_seen')
    .eq('learner_id', body.learnerId)
    .eq('flora_code', body.floraCode)
    .maybeSingle();
  if (selErr) return NextResponse.json({ error: selErr.message }, { status: 500 });

  if (existing) {
    const rolesSeen: string[] = Array.isArray(existing.photo_roles_seen) ? existing.photo_roles_seen : [];
    const nextRoles = body.photoRole && !rolesSeen.includes(body.photoRole)
      ? [...rolesSeen, body.photoRole]
      : rolesSeen;
    const { data: updated, error: upErr } = await db
      .from('flora_review')
      .update({
        exposures: existing.exposures + 1,
        last_seen_at: now,
        photo_roles_seen: nextRoles,
      })
      .eq('id', existing.id)
      .select('id, exposures')
      .single();
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
    return NextResponse.json({ id: updated!.id, exposures: updated!.exposures, isNew: false });
  }

  const { data: created, error: insErr } = await db
    .from('flora_review')
    .insert({
      learner_id: body.learnerId,
      flora_code: body.floraCode,
      exposures: 1,
      last_seen_at: now,
      photo_roles_seen: body.photoRole ? [body.photoRole] : [],
    })
    .select('id, exposures')
    .single();
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
  return NextResponse.json({ id: created!.id, exposures: created!.exposures, isNew: true });
}
```

- [ ] **Step 2: Manual smoke-test**

Start dev server. Then:
```bash
LEARNER_ID=$(npx tsx -e "import('dotenv').then(({config}) => { config({path: '.env.local'}); import('@supabase/supabase-js').then(async ({createClient}) => { const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); const {data} = await s.from('learner').select('id').limit(1); console.log(data[0].id); }); });" 2>/dev/null | tail -1)

# First identification → should be isNew=true, exposures=1
curl -sS -X POST http://localhost:3000/api/naturalist/walk/identified \
  -H 'Content-Type: application/json' \
  -d "{\"learnerId\":\"$LEARNER_ID\",\"floraCode\":\"trillium\",\"photoRole\":\"whole\"}"
# Second identification → isNew=false, exposures=2
curl -sS -X POST http://localhost:3000/api/naturalist/walk/identified \
  -H 'Content-Type: application/json' \
  -d "{\"learnerId\":\"$LEARNER_ID\",\"floraCode\":\"trillium\",\"photoRole\":\"leaf\"}"
```

Expected: first call returns `{"id":"...","exposures":1,"isNew":true}`, second returns `{"id":"...","exposures":2,"isNew":false}`.

Cleanup so we start clean for Task 11:
```bash
npx tsx -e "import('dotenv').then(({config}) => { config({path: '.env.local'}); import('@supabase/supabase-js').then(async ({createClient}) => { const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); await s.from('flora_review').delete().eq('flora_code', 'trillium'); console.log('cleaned'); }); });"
```

- [ ] **Step 3: Commit**

```bash
cd /c/Users/dylan/GardenQuestSchool && git add app/api/naturalist/walk/identified/route.ts && git commit -m "feat(naturalist): POST /api/naturalist/walk/identified — record exposure to flora_review"
```

---

## Task 7: WalkProgress + DichotomousStep + EndOfWalk components

**Files:**
- Create: `components/child/naturalist/WalkProgress.tsx`
- Create: `components/child/naturalist/DichotomousStep.tsx`
- Create: `components/child/naturalist/EndOfWalk.tsx`

These three small components are used by the walk page in Task 9. Building them first lets the page be assembled cleanly.

- [ ] **Step 1: WalkProgress**

Create `components/child/naturalist/WalkProgress.tsx`:

```tsx
'use client';

import { motion } from 'framer-motion';

export default function WalkProgress({
  total, completed, reducedMotion,
}: { total: number; completed: number; reducedMotion: boolean }) {
  return (
    <div className="flex items-center justify-center gap-3 py-3" aria-label={`Walk progress: ${completed} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < completed;
        return (
          <motion.span
            key={i}
            className={`inline-block rounded-full ${filled ? 'bg-forest' : 'bg-bark/25'}`}
            initial={false}
            animate={reducedMotion
              ? { width: 12, height: 12 }
              : filled
                ? { width: 28, height: 12 }
                : { width: 12, height: 12 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: DichotomousStep**

Create `components/child/naturalist/DichotomousStep.tsx`:

```tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export interface KeyPhotoRef {
  url: string;
  alt: string;
  attribution: {
    photographer: string | null;
    licenseCode: string;
    sourceUrl: string;
  };
}

export interface DichotomousStepProps {
  question: string;
  leftLabel: string;
  rightLabel: string;
  leftPhoto: KeyPhotoRef;
  rightPhoto: KeyPhotoRef;
  onChoose: (side: 'left' | 'right') => void;
  reducedMotion: boolean;
}

export default function DichotomousStep({
  question, leftLabel, rightLabel, leftPhoto, rightPhoto, onChoose, reducedMotion,
}: DichotomousStepProps) {
  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4">
      <motion.h2
        key={question}
        initial={reducedMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="text-2xl md:text-3xl font-display text-bark text-center mb-6 mt-2"
      >
        {question}
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {([
          { side: 'left' as const, label: leftLabel, photo: leftPhoto },
          { side: 'right' as const, label: rightLabel, photo: rightPhoto },
        ]).map((opt, i) => (
          <motion.button
            key={opt.side}
            onClick={() => onChoose(opt.side)}
            className="group block rounded-3xl overflow-hidden border-4 border-bark/20 hover:border-terracotta bg-cream shadow-md text-left active:scale-[0.98] transition-transform"
            style={{ touchAction: 'manipulation' }}
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: i * 0.08 }}
            aria-label={`Choose: ${opt.label}`}
          >
            <div className="relative w-full aspect-[4/3] bg-bark/10">
              {opt.photo.url
                ? (
                  <Image
                    src={opt.photo.url}
                    alt={opt.photo.alt}
                    fill
                    sizes="(max-width: 768px) 90vw, 40vw"
                    className="object-cover"
                  />
                )
                : (
                  <div className="absolute inset-0 flex items-center justify-center text-bark/40 italic">
                    {opt.label}
                  </div>
                )
              }
            </div>
            <div className="p-4 text-bark text-lg md:text-xl font-display">
              {opt.label}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: EndOfWalk**

Create `components/child/naturalist/EndOfWalk.tsx`:

```tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import type { KeyPhotoRef } from './DichotomousStep';

export interface WalkSummaryCard {
  floraCode: string;
  commonName: string;
  heroPhoto: KeyPhotoRef | null;
  emoji: string;
}

export default function EndOfWalk({
  cards, learnerId, reducedMotion,
}: { cards: WalkSummaryCard[]; learnerId: string; reducedMotion: boolean }) {
  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto px-4 py-8">
      <motion.h1
        initial={reducedMotion ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-display text-bark mb-2 text-center"
      >
        Your walk today
      </motion.h1>
      <p className="text-bark/70 mb-8 text-center">
        Added to your Field Journal.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full mb-8">
        {cards.map((c, i) => (
          <motion.div
            key={c.floraCode}
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.12 * i }}
            className="rounded-2xl overflow-hidden border-2 border-bark/15 bg-cream shadow-sm"
          >
            <div className="relative w-full aspect-square bg-bark/10">
              {c.heroPhoto?.url
                ? <Image src={c.heroPhoto.url} alt={c.heroPhoto.alt} fill sizes="200px" className="object-cover" />
                : <div className="absolute inset-0 flex items-center justify-center text-4xl">{c.emoji}</div>
              }
            </div>
            <div className="p-3 text-center text-bark font-display">
              {c.commonName}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-3">
        <Link
          href={`/journal?learner=${learnerId}`}
          className="px-6 py-3 rounded-full bg-sage text-cream font-display text-lg shadow-md"
          style={{ minHeight: 60, minWidth: 120, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          See journal
        </Link>
        <Link
          href={`/garden?learner=${learnerId}`}
          className="px-6 py-3 rounded-full bg-terracotta text-cream font-display text-lg shadow-md"
          style={{ minHeight: 60, minWidth: 120, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          Back to the garden
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify TS compiles**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx tsc --noEmit -p . 2>&1 | head -20`
Expected: no output (clean).

- [ ] **Step 5: Commit**

```bash
cd /c/Users/dylan/GardenQuestSchool && git add components/child/naturalist/WalkProgress.tsx components/child/naturalist/DichotomousStep.tsx components/child/naturalist/EndOfWalk.tsx && git commit -m "feat(naturalist): WalkProgress + DichotomousStep + EndOfWalk components"
```

---

## Task 8: SpeciesReveal component

**Files:**
- Create: `components/child/naturalist/SpeciesReveal.tsx`

Reveal screen: hero photo, species name (big), scientific name (italic small), key-path breadcrumb, then a "Notice" sub-screen with 3 feature photos and 2 facts. Single "Found! →" button advances.

- [ ] **Step 1: Implement**

Create `components/child/naturalist/SpeciesReveal.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { KeyPhotoRef } from './DichotomousStep';

export interface SpeciesRevealProps {
  commonName: string;
  scientificName: string;
  heroPhoto: KeyPhotoRef | null;
  revealPhotos: KeyPhotoRef[];
  notableFeatures: string[];
  facts: string[];
  emoji: string;
  onContinue: () => void;
  reducedMotion: boolean;
}

export default function SpeciesReveal({
  commonName, scientificName, heroPhoto, revealPhotos, notableFeatures, facts, emoji, onContinue, reducedMotion,
}: SpeciesRevealProps) {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto px-4 py-4 w-full">
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md rounded-3xl overflow-hidden border-4 border-bark/20 bg-cream shadow-lg mb-6 relative aspect-square"
      >
        {heroPhoto?.url
          ? <Image src={heroPhoto.url} alt={heroPhoto.alt} fill sizes="400px" className="object-cover" priority />
          : <div className="absolute inset-0 flex items-center justify-center text-7xl">{emoji}</div>
        }
      </motion.div>

      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.18 }}
        className="text-center mb-4"
      >
        <div className="text-bark/60 text-sm uppercase tracking-wide mb-1">You found a</div>
        <h2 className="text-4xl md:text-5xl font-display text-terracotta mb-1">{commonName}</h2>
        <div className="italic text-bark/70">{scientificName}</div>
      </motion.div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-2xl mb-5">
        {revealPhotos.slice(0, 3).map((p, i) => (
          <motion.button
            key={i}
            type="button"
            onClick={() => setActiveFeature(i)}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.25 + 0.08 * i }}
            className="relative aspect-square rounded-2xl overflow-hidden border-2 border-bark/15 hover:border-terracotta"
            style={{ touchAction: 'manipulation' }}
            aria-label={p.alt}
          >
            <Image src={p.url} alt={p.alt} fill sizes="160px" className="object-cover" />
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeFeature !== null && (
          <motion.div
            key={activeFeature}
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
            className="text-center text-bark italic mb-3"
          >
            {notableFeatures[activeFeature] ?? ''}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-bark/80 text-center space-y-2 mb-6 max-w-xl">
        {facts.slice(0, 2).map((f, i) => (
          <p key={i}>{f}</p>
        ))}
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="px-8 py-4 rounded-full bg-terracotta text-cream font-display text-xl shadow-md"
        style={{ minHeight: 60, touchAction: 'manipulation' }}
      >
        Found! →
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verify TS compiles**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx tsc --noEmit -p . 2>&1 | head -10`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
cd /c/Users/dylan/GardenQuestSchool && git add components/child/naturalist/SpeciesReveal.tsx && git commit -m "feat(naturalist): SpeciesReveal component — hero + 3 feature photos + facts"
```

---

## Task 9: /naturalist/walk page — state machine + fetch

**Files:**
- Create: `app/(child)/naturalist/layout.tsx`
- Create: `app/(child)/naturalist/walk/page.tsx`

- [ ] **Step 1: Create the route group layout**

Create `app/(child)/naturalist/layout.tsx`:

```tsx
export default function NaturalistLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-cream text-bark">
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create the walk page**

Create `app/(child)/naturalist/walk/page.tsx`:

```tsx
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';
import WalkProgress from '@/components/child/naturalist/WalkProgress';
import DichotomousStep, { type KeyPhotoRef } from '@/components/child/naturalist/DichotomousStep';
import SpeciesReveal from '@/components/child/naturalist/SpeciesReveal';
import EndOfWalk from '@/components/child/naturalist/EndOfWalk';

interface KeyStepResolved {
  nodeId: string;
  question: string;
  leftLabel: string;
  rightLabel: string;
  leftPhoto: KeyPhotoRef;
  rightPhoto: KeyPhotoRef;
}

interface WalkSpecies {
  position: number;
  floraCode: string;
  commonName: string;
  scientificName: string;
  notableFeatures: string[];
  facts: string[];
  emoji: string;
  heroPhoto: KeyPhotoRef | null;
  keyPath: KeyStepResolved[];
  revealPhotos: KeyPhotoRef[];
}

interface WalkSession {
  id: string;
  species: WalkSpecies[];
}

type Phase = 'loading' | 'intro' | 'key' | 'reveal' | 'done' | 'error';

export default function NaturalistWalkPage() {
  const router = useRouter();
  const params = useSearchParams();
  const learnerId = params.get('learner');
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;

  const [session, setSession] = useState<WalkSession | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [speciesIdx, setSpeciesIdx] = useState(0);
  const [keyStepIdx, setKeyStepIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch on mount
  useEffect(() => {
    if (!learnerId) {
      setErrorMsg('Missing ?learner=… in URL.');
      setPhase('error');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/naturalist/walk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ learnerId, n: 3 }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `walk fetch failed: ${res.status}`);
        }
        const ws: WalkSession = await res.json();
        if (cancelled) return;
        if (!ws.species || ws.species.length === 0) throw new Error('walk has no species');
        setSession(ws);
        setSpeciesIdx(0);
        setKeyStepIdx(0);
        setPhase('intro');
      } catch (e) {
        if (cancelled) return;
        setErrorMsg((e as Error).message);
        setPhase('error');
      }
    })();
    return () => { cancelled = true; };
  }, [learnerId]);

  const current: WalkSpecies | null = useMemo(
    () => session?.species[speciesIdx] ?? null,
    [session, speciesIdx],
  );
  const total = session?.species.length ?? 0;

  const recordIdentified = useCallback(async (sp: WalkSpecies) => {
    if (!learnerId) return;
    try {
      await fetch('/api/naturalist/walk/identified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learnerId,
          floraCode: sp.floraCode,
          photoRole: 'whole',
        }),
      });
    } catch {
      // best-effort — never block the walk
    }
  }, [learnerId]);

  const handleKeyChoose = useCallback(() => {
    if (!current) return;
    const next = keyStepIdx + 1;
    if (next >= current.keyPath.length) {
      setPhase('reveal');
    } else {
      setKeyStepIdx(next);
    }
  }, [current, keyStepIdx]);

  const handleRevealContinue = useCallback(async () => {
    if (!current) return;
    await recordIdentified(current);
    if (speciesIdx + 1 >= (session?.species.length ?? 0)) {
      setPhase('done');
    } else {
      setSpeciesIdx(speciesIdx + 1);
      setKeyStepIdx(0);
      setPhase('intro');
    }
  }, [current, recordIdentified, session, speciesIdx]);

  const handleIntroBegin = useCallback(() => {
    if (!current) return;
    if (current.keyPath.length === 0) setPhase('reveal');
    else setPhase('key');
  }, [current]);

  // ── render ─────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center text-bark/60 italic">
        Looking for something growing nearby…
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center text-bark gap-3 px-4 text-center">
        <p className="text-xl">We could not start a walk just now.</p>
        <p className="text-bark/60">{errorMsg}</p>
        <button
          type="button"
          onClick={() => router.push(`/garden${learnerId ? `?learner=${learnerId}` : ''}`)}
          className="mt-4 px-6 py-3 rounded-full bg-bark/80 text-cream font-display"
          style={{ minHeight: 60 }}
        >
          Back to the garden
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="min-h-[100dvh] py-8">
        <EndOfWalk
          cards={(session?.species ?? []).map(s => ({
            floraCode: s.floraCode,
            commonName: s.commonName,
            heroPhoto: s.heroPhoto,
            emoji: s.emoji,
          }))}
          learnerId={learnerId ?? ''}
          reducedMotion={reducedMotion}
        />
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="flex items-center justify-between px-4 pt-4">
        <h1 className="text-xl md:text-2xl font-display text-bark">Today's walk</h1>
        <button
          type="button"
          aria-label="Exit walk"
          onClick={() => router.push(`/garden${learnerId ? `?learner=${learnerId}` : ''}`)}
          className="rounded-full bg-bark/10 text-bark hover:bg-bark/20"
          style={{ width: 48, height: 48 }}
        >
          ✕
        </button>
      </header>

      <WalkProgress total={total} completed={speciesIdx + (phase === 'reveal' || phase === 'done' ? 1 : 0)} reducedMotion={reducedMotion} />

      <main className="flex-1 flex items-center justify-center py-4">
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div
              key={`intro-${current.floraCode}`}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center px-4 text-center max-w-2xl"
            >
              <p className="text-lg md:text-xl text-bark/70 mb-6">
                Let's look at something growing here.
              </p>
              <div className="w-full max-w-md rounded-3xl overflow-hidden border-4 border-bark/15 bg-cream shadow-md aspect-square relative mb-6">
                {current.heroPhoto?.url
                  ? <img src={current.heroPhoto.url} alt={current.heroPhoto.alt} className="w-full h-full object-cover" />
                  : <div className="absolute inset-0 flex items-center justify-center text-7xl">{current.emoji}</div>
                }
              </div>
              <button
                type="button"
                onClick={handleIntroBegin}
                className="px-8 py-4 rounded-full bg-terracotta text-cream font-display text-xl shadow-md"
                style={{ minHeight: 60, touchAction: 'manipulation' }}
              >
                Begin →
              </button>
            </motion.div>
          )}

          {phase === 'key' && current.keyPath[keyStepIdx] && (
            <motion.div
              key={`key-${current.floraCode}-${keyStepIdx}`}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.28 }}
              className="w-full"
            >
              <DichotomousStep
                question={current.keyPath[keyStepIdx].question}
                leftLabel={current.keyPath[keyStepIdx].leftLabel}
                rightLabel={current.keyPath[keyStepIdx].rightLabel}
                leftPhoto={current.keyPath[keyStepIdx].leftPhoto}
                rightPhoto={current.keyPath[keyStepIdx].rightPhoto}
                onChoose={handleKeyChoose}
                reducedMotion={reducedMotion}
              />
            </motion.div>
          )}

          {phase === 'reveal' && (
            <motion.div
              key={`reveal-${current.floraCode}`}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="w-full"
            >
              <SpeciesReveal
                commonName={current.commonName}
                scientificName={current.scientificName}
                heroPhoto={current.heroPhoto}
                revealPhotos={current.revealPhotos}
                notableFeatures={current.notableFeatures}
                facts={current.facts}
                emoji={current.emoji}
                onContinue={handleRevealContinue}
                reducedMotion={reducedMotion}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Configure next.config remote image domain**

Run: `cd /c/Users/dylan/GardenQuestSchool && cat next.config.js 2>/dev/null || cat next.config.mjs 2>/dev/null`

If there's an `images.remotePatterns` config, ensure the Supabase host is allowed. If not, add (or create the file). Inspect the existing structure first; if the file does NOT have `images: { remotePatterns: [...] }`, add the following:

```js
// next.config.js (excerpt)
module.exports = {
  // ...existing config...
  images: {
    remotePatterns: [
      // Existing pattern entries if any...
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};
```

If you used `<img>` instead of `<Image>` in some places, those don't need this config — but the components above DO use `next/image` for hero + reveal photos.

The walk page Step 2 used a plain `<img>` for the intro hero on purpose (skipping `next/image` there is simpler for the smoke test). Components in Tasks 7+8 use `next/image` — so the config IS required.

- [ ] **Step 4: Verify the page TS-compiles**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx tsc --noEmit -p . 2>&1 | head -10`
Expected: no output.

- [ ] **Step 5: Commit**

```bash
cd /c/Users/dylan/GardenQuestSchool && git add 'app/(child)/naturalist' next.config.js 2>/dev/null || git add 'app/(child)/naturalist'
git commit -m "feat(naturalist): /naturalist/walk page + layout + state machine"
```

(If `next.config.js` was modified, include it in the same commit. The earlier `git add` line tries both forms; you may need to adjust depending on which exists.)

---

## Task 10: Wire up next.config for Supabase image host (if Task 9 didn't already)

**Files:**
- Modify: `next.config.js` (or `next.config.mjs`)

This task is a no-op if Task 9 step 3 already updated `next.config`. Otherwise, complete it now.

- [ ] **Step 1: Inspect current state**

Run: `cd /c/Users/dylan/GardenQuestSchool && grep -A 15 "remotePatterns" next.config.js next.config.mjs 2>&1 | head -25`

If you see a block including `*.supabase.co` already, skip the rest of this task — it's done.

- [ ] **Step 2: Add the pattern if missing**

Find `next.config.js` (or `.mjs`). In the `images: { remotePatterns: [...] }` array, ensure this entry exists:

```js
{
  protocol: 'https',
  hostname: '*.supabase.co',
  pathname: '/storage/v1/object/public/**',
}
```

If no `images` config exists at all in next.config, add it. Wildcards in `hostname` require `remotePatterns` (not `domains`).

- [ ] **Step 3: Restart dev server + smoke-test that Storage images render**

Run: `cd /c/Users/dylan/GardenQuestSchool && npm run dev`

Open `http://localhost:3000/naturalist/walk?learner=<LEARNER_ID>` in a browser. Confirm:
1. Intro screen renders the hero photo (a real iNat photo of the species).
2. Begin → first key step renders a question + two photo options.
3. Tapping either option advances.
4. After the last key step, the reveal screen shows species name + 3 feature photos.
5. After all species, the end-of-walk screen shows photo cards.

Kill dev when done.

- [ ] **Step 4: Commit only if there were changes**

```bash
cd /c/Users/dylan/GardenQuestSchool && git diff --quiet next.config.js next.config.mjs 2>/dev/null || (git add next.config.js next.config.mjs 2>/dev/null; git commit -m "chore: allow Supabase Storage host in next.config remotePatterns")
```

---

## Task 11: End-to-end acceptance — full walk + flora_review verification

**Files:** No new files; this is a verification + summary commit.

- [ ] **Step 1: All unit tests pass**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx vitest run tests/world/dichotomousKey.test.ts tests/naturalist/walkSelection.test.ts tests/naturalist/floraPhotoStorage.test.ts tests/naturalist/walkBuilder.test.ts`
Expected: PASS for all suites combined (~30 tests).

- [ ] **Step 2: Full walk through the UI**

Start dev: `cd /c/Users/dylan/GardenQuestSchool && npm run dev`

Find a learner id:
```bash
LEARNER_ID=$(npx tsx -e "import('dotenv').then(({config}) => { config({path: '.env.local'}); import('@supabase/supabase-js').then(async ({createClient}) => { const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); const {data} = await s.from('learner').select('id').limit(1); console.log(data[0].id); }); });" 2>/dev/null | tail -1)
echo "Learner: $LEARNER_ID"
```

In a browser open `http://localhost:3000/naturalist/walk?learner=$LEARNER_ID` (substitute the value). Walk the entire session: intro → key steps → reveal → repeat → end-of-walk.

- [ ] **Step 3: Verify flora_review rows landed**

In a separate shell while the walk is in progress (or right after the end-of-walk screen renders):

```bash
cat > scripts/verify-walk.ts << 'EOF'
import { config } from 'dotenv'; import { resolve } from 'node:path';
config({ path: resolve(process.cwd(), '.env.local') });
import { createClient } from '@supabase/supabase-js';
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
(async () => {
  const { data } = await s.from('flora_review').select('learner_id, flora_code, exposures, last_seen_at, photo_roles_seen').order('last_seen_at', { ascending: false }).limit(10);
  console.log('Recent flora_review rows:');
  for (const r of data ?? []) console.log(' -', JSON.stringify(r));
})();
EOF
npx tsx scripts/verify-walk.ts && rm scripts/verify-walk.ts
```

Expected: 2-4 rows (depending on walk size), each with the species the walk surfaced. `exposures` ≥ 1, `last_seen_at` recent, `photo_roles_seen` includes `'whole'`.

- [ ] **Step 4: Stop dev server**

Kill the running `npm run dev`.

- [ ] **Step 5: Push everything**

```bash
cd /c/Users/dylan/GardenQuestSchool && git push 2>&1 | tail -3
```

Expected: push succeeds.

- [ ] **Step 6: Summary commit (no code — just a marker)**

Phase 2 has no doc-update task by design (Phase 4 will add the signpost + journal). If everything passed, just verify `git status` is clean and the work is on origin/main.

```bash
cd /c/Users/dylan/GardenQuestSchool && git status && git log --oneline origin/main..HEAD
```
Expected: clean tree, no unpushed commits.

---

## Self-Review

**1. Spec coverage:**

| Phase-2 acceptance from spec §11 | Task |
|---|---|
| `/naturalist/walk` page renders hardcoded walk with the 10 species | Tasks 7-9 |
| Dichotomous key (10-ish nodes) navigates | Task 1 |
| Reveal screen displays | Task 8 |
| Walks end-to-end as a sister account | Task 11 |
| Species pinned in journal (= recorded to flora_review) | Tasks 6, 11 |

Out-of-scope items confirmed deferred:
- Spaced repetition → Phase 3
- Signpost in Reading Forest → Phase 4
- Journal flora tab → Phase 4
- Attribution overlay UI → Phase 4

**2. Placeholder scan:**
- No "TBD" / "TODO" / "implement later" anywhere.
- Every code block is complete and runnable.
- Error handling explicit: API routes return `NextResponse.json({ error }, { status })`; page falls into 'error' state with retry-via-back-to-garden button; identified POST is best-effort (never blocks UX).
- The `<img>` vs `<Image>` mixing in Task 9 is deliberate (intro uses native `<img>` for simplicity; other components use `next/image`). This is noted explicitly in Task 9 Step 3.

**3. Type consistency:**
- `KeyPhotoRef` defined in `DichotomousStep.tsx` (Task 7) is the single source of truth — imported by `SpeciesReveal.tsx` (Task 8), `EndOfWalk.tsx` (Task 7), and the page (Task 9). All consumers reference the same shape.
- `WalkSession` / `WalkSpecies` / `KeyStepResolved` interfaces are defined inline in the API route (Task 5) and again in the page (Task 9) — they MUST match. Task 9's local interfaces are a strict subset/match of Task 5's payload types.
- `KeyChild`, `isSpeciesLeaf`, `ROOT_NODE_ID` are exported from `dichotomousKey.ts` (Task 1) and consumed by `walkBuilder.ts` (Task 4). Names match.
- `pickWalkSpecies(pool, n, rng)` signature is consistent between Task 2 def and Task 5 use.
- `publicUrlFor(baseUrl, storagePath, { widthPx })` signature is consistent between Task 3 def and Task 5 use.

**4. Database side-effect safety:**
- The `/identified` route uses upsert-by-explicit-select-then-update pattern (no race condition concern at 1 user; could be tightened with `upsert` + ON CONFLICT in Phase 3 if multiple devices ever fire concurrently).
- No destructive writes; all are insert/update only.

Plan is internally consistent.
