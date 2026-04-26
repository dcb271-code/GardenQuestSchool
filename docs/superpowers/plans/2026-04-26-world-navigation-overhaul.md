# World Navigation Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the first-push MVP from §14 of the [world-navigation-overhaul design spec](../specs/2026-04-26-world-navigation-overhaul-design.md) — a hub-and-spoke world (central garden + Math Mountain + Reading Forest), a graduating-world unlock model, three quick-start characters with daily rotation, the Bunny Burrow interior with first-arrival invitation, and `/explore` deletion.

**Architecture:** New routed branch scenes (`/garden/math-mountain`, `/garden/reading-forest`, `/garden/habitat/[code]`) extend the central garden via path-edge gates. Pure-logic helpers (`branchGating`, `characterRotation`, `branchMaps`) drive what the engine surfaces in-world; the central garden gets *additive-only* changes (path extensions, ivy gates, three character spots). Habitat interiors are unlocked by species-arrival invitation — a small new beat in the existing arrival flow. One jsonb-shape migration adds `unlocked_branches` to `world_state.garden`. No new tables.

**Tech Stack:** Next.js 14 (App Router) · TypeScript · Tailwind · framer-motion · Supabase (Postgres) · vitest + @testing-library/react · Playwright (E2E).

---

## Pre-flight context for the implementer

The implementer should skim these before starting:

1. **The spec.** `docs/superpowers/specs/2026-04-26-world-navigation-overhaul-design.md` — the full design. This plan implements its §14 first-push MVP scope.
2. **CLAUDE.md** at the repo root — project-wide conventions.
3. **`lib/world/zoneProgress.ts`** — defines `ZONE_COMPLETION_TARGET = 10` and `computeStructureProgress`. The new `branchGating` reuses these.
4. **`lib/world/gardenMap.ts`** — `MapStructure` type and the existing 22 garden structures. Several tasks add new `MapStructure` entries here.
5. **`app/(child)/garden/GardenScene.tsx`** — the existing central garden client component. Two tasks modify it.
6. **`app/(child)/garden/page.tsx`** — the existing central garden server component. One task augments it.
7. **`tests/world/arrivals.test.ts`** and **`tests/world/gardenLayout.test.ts`** — reference patterns for vitest unit tests.
8. **`tests/setup.ts`** — vitest jsdom setup file (just imports `@testing-library/jest-dom/vitest`).
9. **`vitest.config.ts`** — vitest configuration; component tests live as `tests/**/*.test.{ts,tsx}` and are jsdom-mocked.
10. **`tests/e2e/first-lesson.spec.ts`** — reference Playwright pattern. (Note: this test references `/explore` and is broken; Task 18 fixes it.)

### Style and constraint reminders (non-negotiable, from spec §2)

- All copy in this work must conform to the lint rule in `tests/child-language.test.ts`: **no coins-as-currency, no scores, no streaks, no "good job" / "great job" / "level up."** New narrator copy in this plan has been hand-checked against that rule.
- New SVG art must reuse the existing illustration vocabulary (`Tree`, `PineTree`, `Flower`, `GrassTuft`, `CozyHouse` from `components/child/garden/illustrations.tsx`), the layered hill silhouettes, the brook ripple style, the stepping-stone organic path system, the time-of-day tint, the 2–2.5px dark bark outlines, the naturalist palette.
- 60pt minimum hit targets. Respect `prefers-reduced-motion` via `useAccessibilitySettings` hook (existing).
- Existing flows MUST NOT regress: sisters walking, Luna wandering, ambient creatures, time-of-day tint, garden soundtrack toggle, ecology quest modal, arrival celebration.

### Real-data catch-out from recon

The spec uses the loose phrase "habitat code" when describing species-to-habitat lookup, but the actual TypeScript type uses `habitatReqCodes: string[]` (plural array, since a species may require multiple habitats). All code in this plan uses the real field name.

### Branch + commits

All work happens on a new branch `world-navigation-overhaul`. Every task ends in a commit. PRs are out of scope for this plan — the user will open the PR after the plan is fully executed.

---

## File structure (what gets created vs. modified vs. deleted)

### Create

```
lib/supabase/migrations/009_world_state_unlocked_branches.sql
lib/world/branchGating.ts                  + tests/world/branchGating.test.ts
lib/world/characterRotation.ts             + tests/world/characterRotation.test.ts
lib/world/characterRecommendation.ts       + tests/world/characterRecommendation.test.ts
lib/world/branchMaps.ts                    + tests/world/branchMaps.test.ts
lib/world/habitatInteriors.ts
components/child/garden/LockedGate.tsx     + tests/components/LockedGate.test.tsx
components/child/garden/CharacterSpot.tsx  + tests/components/CharacterSpot.test.tsx
components/child/garden/BranchHeader.tsx
components/child/garden/BranchSceneLayout.tsx
components/child/garden/HabitatInteriorLayout.tsx
app/(child)/garden/math-mountain/page.tsx
app/(child)/garden/math-mountain/MathMountainScene.tsx
app/(child)/garden/reading-forest/page.tsx
app/(child)/garden/reading-forest/ReadingForestScene.tsx
app/(child)/garden/habitat/[code]/page.tsx
app/(child)/garden/habitat/[code]/BunnyBurrowInterior.tsx
tests/e2e/world-navigation.spec.ts
```

### Modify

```
lib/world/gardenMap.ts                     # add gate + character entries
app/(child)/garden/GardenScene.tsx         # remove compass icon, render path extensions, gates, characters
app/(child)/garden/page.tsx                # compute branch unlock + character rotation + recommendations + interior eligibility, write unlocked_branches to world_state
components/child/SpeciesDetailModal.tsx    # add "step inside →" button when interiorEnabled
components/child/garden/ArrivalCard.tsx    # add invitation copy + step-inside CTA when isFirstForHabitat
app/(child)/complete/[sessionId]/CompleteActions.tsx  # change /explore link to /garden
tests/e2e/first-lesson.spec.ts             # remove /explore URL assertion
tests/e2e/first-reading-lesson.spec.ts     # remove /explore URL assertion
```

### Delete

```
app/(child)/explore/page.tsx
app/(child)/explore/ExploreClient.tsx
app/(child)/explore/ExploreHeader.tsx
app/(child)/explore/                       # whole directory
```

---

## Task 0: Set up the working branch

**Files:**
- (none — git only)

- [ ] **Step 1: Create and check out the feature branch**

```bash
cd /c/Users/dylan/GardenQuestSchool
git status                # expect clean working tree, on main
git checkout -b world-navigation-overhaul
```

Expected: `Switched to a new branch 'world-navigation-overhaul'`.

- [ ] **Step 2: Confirm the branch is set up**

```bash
git branch --show-current
git log --oneline -1
```

Expected: outputs `world-navigation-overhaul` and the spec commit `50a05c4 docs: world navigation overhaul design spec` (or whichever commit on main is latest).

---

## Task 1: Migration — add `unlocked_branches` jsonb field

**Why:** §11 of the spec. The central garden page needs a place to remember "which branches has this learner already had the unlock-celebration animation for" so we don't replay it on every load. We use the existing `world_state.garden` jsonb column with a new conventional key `unlocked_branches: string[]`.

**Files:**
- Create: `lib/supabase/migrations/009_world_state_unlocked_branches.sql`

- [ ] **Step 1: Write the migration**

```sql
-- lib/supabase/migrations/009_world_state_unlocked_branches.sql
--
-- World-navigation overhaul: introduce `unlocked_branches` inside the
-- existing world_state.garden jsonb column. This is the "have we already
-- played the unlock-celebration for this branch?" memory — without it
-- the LockedGate component would replay the ivy-slides-aside animation
-- on every garden page load after the gate criterion is met.
--
-- Conventional shape after this migration:
--   world_state.garden = {
--     pendingArrivalSpeciesCode?: string,   -- existing
--     unlocked_branches?: string[]          -- new (e.g. ["math_mountain"])
--   }
--
-- No DDL needed (jsonb is flexible). This migration is data-only:
-- it backfills an empty array on every existing world_state row so
-- application code can rely on the key being present and iterable.
--
-- Idempotent — safe to re-run. Each run is a no-op for rows that
-- already contain the key.

do $$
declare r record;
begin
  for r in select learner_id from world_state loop
    update world_state
       set garden = coalesce(garden, '{}'::jsonb)
                    || jsonb_build_object('unlocked_branches', '[]'::jsonb)
     where learner_id = r.learner_id
       and not (coalesce(garden, '{}'::jsonb) ? 'unlocked_branches');
  end loop;
end $$;
```

- [ ] **Step 2: Apply the migration**

The user prefers running migrations themselves via the Supabase SQL editor (per project memory). Tell them:

```
Migration 009 is ready. Apply it via the Supabase SQL editor by pasting the
contents of `lib/supabase/migrations/009_world_state_unlocked_branches.sql`,
then run it. It's idempotent — safe to run multiple times.
```

After application, verify with a sanity SELECT in the SQL editor:

```sql
select learner_id, garden -> 'unlocked_branches' as branches
from world_state limit 5;
```

Expected: every row has `[]` (or its previously-existing array) under `unlocked_branches`.

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/migrations/009_world_state_unlocked_branches.sql
git commit -m "migration: add unlocked_branches to world_state.garden jsonb"
```

---

## Task 2: `branchGating.ts` — pure logic for the unlock criterion

**Why:** §5 of the spec. Pure function that decides whether a branch (Math Mountain or Reading Forest) is unlocked for a given learner, based on their starter-structure completion state. Reused by `garden/page.tsx` server-side.

**Files:**
- Create: `lib/world/branchGating.ts`
- Create: `tests/world/branchGating.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/world/branchGating.test.ts
import { describe, it, expect } from 'vitest';
import {
  BRANCH_GATING,
  isStructureCompletedForGating,
  isBranchUnlocked,
  type BranchCode,
} from '@/lib/world/branchGating';
import { ZONE_COMPLETION_TARGET } from '@/lib/world/zoneProgress';
import { GARDEN_STRUCTURES } from '@/lib/world/gardenMap';

const target = ZONE_COMPLETION_TARGET;

describe('branchGating', () => {
  describe('BRANCH_GATING constant', () => {
    it('defines a rule for math_mountain with 5 starters and threshold 3', () => {
      expect(BRANCH_GATING.math_mountain.starterStructureCodes).toHaveLength(5);
      expect(BRANCH_GATING.math_mountain.threshold).toBe(3);
    });

    it('defines a rule for reading_forest with 3 starters and threshold 2', () => {
      expect(BRANCH_GATING.reading_forest.starterStructureCodes).toHaveLength(3);
      expect(BRANCH_GATING.reading_forest.threshold).toBe(2);
    });

    it('every starter structure code resolves to a real garden structure', () => {
      const allBranches: BranchCode[] = ['math_mountain', 'reading_forest'];
      for (const branch of allBranches) {
        for (const code of BRANCH_GATING[branch].starterStructureCodes) {
          const found = GARDEN_STRUCTURES.find(s => s.code === code);
          expect(found, `${branch} starter ${code} must exist in GARDEN_STRUCTURES`).toBeDefined();
          expect(found?.kind, `${code} must be a skill structure`).toBe('skill');
        }
      }
    });
  });

  describe('isStructureCompletedForGating', () => {
    const fakeStruct = {
      code: 'math_bee_swarm',
      kind: 'skill' as const,
      skillCode: 'math.add.within_20.no_crossing',
      label: 'Bee Swarms',
      themeEmoji: '🐝',
      x: 0, y: 0, size: 60,
      zone: 'meadow' as const,
    };

    it('returns true when the underlying skill is mastered', () => {
      const completed = isStructureCompletedForGating(
        'math_bee_swarm',
        [fakeStruct],
        new Map(),
        new Set(['math.add.within_20.no_crossing']),
        target,
      );
      expect(completed).toBe(true);
    });

    it('returns true when correctCount meets target', () => {
      const completed = isStructureCompletedForGating(
        'math_bee_swarm',
        [fakeStruct],
        new Map([['math.add.within_20.no_crossing', target]]),
        new Set(),
        target,
      );
      expect(completed).toBe(true);
    });

    it('returns false when neither mastery nor target met', () => {
      const completed = isStructureCompletedForGating(
        'math_bee_swarm',
        [fakeStruct],
        new Map([['math.add.within_20.no_crossing', target - 1]]),
        new Set(),
        target,
      );
      expect(completed).toBe(false);
    });

    it('returns false when the structure code is unknown', () => {
      const completed = isStructureCompletedForGating(
        'no_such_code',
        [fakeStruct],
        new Map(),
        new Set(),
        target,
      );
      expect(completed).toBe(false);
    });
  });

  describe('isBranchUnlocked', () => {
    it('unlocks math_mountain when 3 of 5 starters are completed', () => {
      const completedSet = new Set([
        'math_counting_path', 'math_bee_swarm', 'math_petal_falls',
      ]);
      expect(isBranchUnlocked('math_mountain', code => completedSet.has(code))).toBe(true);
    });

    it('keeps math_mountain locked when only 2 of 5 starters are completed', () => {
      const completedSet = new Set(['math_counting_path', 'math_bee_swarm']);
      expect(isBranchUnlocked('math_mountain', code => completedSet.has(code))).toBe(false);
    });

    it('unlocks reading_forest when 2 of 3 starters are completed', () => {
      const completedSet = new Set(['reading_book_stump', 'reading_blending_beach']);
      expect(isBranchUnlocked('reading_forest', code => completedSet.has(code))).toBe(true);
    });

    it('keeps reading_forest locked when only 1 of 3 starters are completed', () => {
      const completedSet = new Set(['reading_book_stump']);
      expect(isBranchUnlocked('reading_forest', code => completedSet.has(code))).toBe(false);
    });
  });
});
```

- [ ] **Step 2: Run tests — expect failure (module does not exist)**

```bash
cd /c/Users/dylan/GardenQuestSchool
npx vitest run tests/world/branchGating.test.ts
```

Expected: failure with "Cannot find module '@/lib/world/branchGating'".

- [ ] **Step 3: Implement `branchGating.ts`**

```ts
// lib/world/branchGating.ts
//
// Decides whether a "branch scene" (Math Mountain, Reading Forest) is
// reachable from the central garden for a given learner. The branch
// gates open after a learner has completed N of their subject's
// starter structures on the central garden — the "graduating-world"
// model from §5 of the world-navigation-overhaul design spec.
//
// "Completed" = either the underlying skill is mastered (which is
// auto-set for grade-2/3 learners via masteredSkillsForGrade), or
// the cumulative correctCount on the structure's skill has reached
// ZONE_COMPLETION_TARGET. Together this means: G1 learners earn
// the gate by playing; older learners walk through it on day one.

import type { MapStructure } from './gardenMap';

export type BranchCode = 'math_mountain' | 'reading_forest';

export interface GatingRule {
  starterStructureCodes: string[];
  threshold: number;
}

export const BRANCH_GATING: Record<BranchCode, GatingRule> = {
  math_mountain: {
    starterStructureCodes: [
      'math_counting_path',  // skip_2s
      'math_bee_swarm',      // add.within_20.no_crossing
      'math_petal_falls',    // subtract.within_10
      'math_number_bonds',   // number_bond.within_10
      'math_word_stories',   // word_problem.add_within_20
    ],
    threshold: 3,
  },
  reading_forest: {
    starterStructureCodes: [
      'reading_book_stump',     // dolch_primer
      'reading_blending_beach', // cvc_blend
      'reading_readaloud_log',  // read_aloud.simple
    ],
    threshold: 2,
  },
};

/**
 * For unlock-gating purposes, is this central-garden structure considered
 * "complete"? True if the structure's underlying skill is in the mastered
 * set OR if the cumulative correctCount on it has reached the target.
 *
 * Returns false for unknown structure codes so a typo can't accidentally
 * unlock a branch.
 */
export function isStructureCompletedForGating(
  structureCode: string,
  structures: MapStructure[],
  correctByCode: Map<string, number>,
  mastered: Set<string>,
  target: number,
): boolean {
  const struct = structures.find(s => s.code === structureCode);
  if (!struct || struct.kind !== 'skill' || !struct.skillCode) return false;
  if (mastered.has(struct.skillCode)) return true;
  return (correctByCode.get(struct.skillCode) ?? 0) >= target;
}

/**
 * Is this branch unlocked for the learner? Pass in a predicate that
 * answers "is this central-garden structure complete?" — typically
 * built by composing `isStructureCompletedForGating` with the page
 * layer's existing `correctByCode` and `mastered` set.
 */
export function isBranchUnlocked(
  branchCode: BranchCode,
  isStructureCompleted: (structureCode: string) => boolean,
): boolean {
  const rule = BRANCH_GATING[branchCode];
  let count = 0;
  for (const code of rule.starterStructureCodes) {
    if (isStructureCompleted(code)) count++;
  }
  return count >= rule.threshold;
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npx vitest run tests/world/branchGating.test.ts
```

Expected: 9 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/world/branchGating.ts tests/world/branchGating.test.ts
git commit -m "feat(world): branch gating logic for graduating-world unlock"
```

---

## Task 3: `characterRotation.ts` — daily quick-start character pick

**Why:** §9.1 of the spec. Pure function that deterministically picks one of {nana, hodge, signpost} as today's "alert" character for a given learner. Hash of `learnerId + YYYY-MM-DD`.

**Files:**
- Create: `lib/world/characterRotation.ts`
- Create: `tests/world/characterRotation.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/world/characterRotation.test.ts
import { describe, it, expect } from 'vitest';
import {
  todaysAlertCharacter,
  CHARACTER_CODES,
  type CharacterCode,
} from '@/lib/world/characterRotation';

const LEARNER_A = '11111111-1111-1111-1111-111111111111';
const LEARNER_B = '22222222-2222-2222-2222-222222222222';
const DAY_1 = new Date('2026-04-26T10:00:00Z');
const DAY_2 = new Date('2026-04-27T10:00:00Z');

describe('characterRotation', () => {
  it('CHARACTER_CODES is a frozen tuple of three names', () => {
    expect(CHARACTER_CODES).toEqual(['nana', 'hodge', 'signpost']);
  });

  it('returns one of the three character codes', () => {
    const code = todaysAlertCharacter(LEARNER_A, DAY_1);
    expect(CHARACTER_CODES).toContain(code);
  });

  it('is deterministic: same learner + same date → same character', () => {
    const a1 = todaysAlertCharacter(LEARNER_A, DAY_1);
    const a2 = todaysAlertCharacter(LEARNER_A, DAY_1);
    expect(a1).toBe(a2);
  });

  it('time of day does not change the result', () => {
    const morning = new Date('2026-04-26T03:00:00Z');
    const evening = new Date('2026-04-26T22:00:00Z');
    expect(todaysAlertCharacter(LEARNER_A, morning))
      .toBe(todaysAlertCharacter(LEARNER_A, evening));
  });

  it('different learners on the same day can get different characters', () => {
    // We can't assert "always different" (that would constrain the hash);
    // we assert that across 30 learner-ids on the same day at least 2 of
    // the 3 characters appear — which fails only if the hash collapses.
    const seen = new Set<CharacterCode>();
    for (let i = 0; i < 30; i++) {
      const fakeLearner = `00000000-0000-0000-0000-${String(i).padStart(12, '0')}`;
      seen.add(todaysAlertCharacter(fakeLearner, DAY_1));
    }
    expect(seen.size).toBeGreaterThanOrEqual(2);
  });

  it('same learner across many days hits all three characters', () => {
    const seen = new Set<CharacterCode>();
    const start = new Date('2026-04-26T10:00:00Z').getTime();
    for (let i = 0; i < 30; i++) {
      const day = new Date(start + i * 24 * 3600 * 1000);
      seen.add(todaysAlertCharacter(LEARNER_A, day));
    }
    expect(seen.size).toBe(3);
  });

  it('day boundary changes the result deterministically', () => {
    const d1 = todaysAlertCharacter(LEARNER_B, DAY_1);
    const d2 = todaysAlertCharacter(LEARNER_B, DAY_2);
    // We can't insist they differ (1 in 3 chance they don't), but we can
    // insist that BOTH are valid character codes — that's enough to
    // confirm the date is being included in the hash key without crashing.
    expect(CHARACTER_CODES).toContain(d1);
    expect(CHARACTER_CODES).toContain(d2);
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npx vitest run tests/world/characterRotation.test.ts
```

Expected: failure with "Cannot find module '@/lib/world/characterRotation'".

- [ ] **Step 3: Implement `characterRotation.ts`**

```ts
// lib/world/characterRotation.ts
//
// Daily-deterministic pick of which quick-start character is "alert"
// today on the central garden. Pure function — no DB writes, no calls
// to the engine. Hash of (learnerId + YYYY-MM-DD) mod 3.
//
// Why deterministic per day: if the picker were random, the same
// learner could see Nana alert at 9am and Hodge alert at 9:01am, which
// would feel arbitrary. Daily rotation gives the world a "today's
// person" rhythm that's quietly stable.

export const CHARACTER_CODES = ['nana', 'hodge', 'signpost'] as const;
export type CharacterCode = typeof CHARACTER_CODES[number];

/**
 * Java-style String.hashCode — small, fast, no deps.
 * Returns a non-negative integer.
 */
function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function todaysAlertCharacter(
  learnerId: string,
  today: Date = new Date(),
): CharacterCode {
  // YYYY-MM-DD in UTC; we don't care about timezone here because the
  // rotation cadence is "once per UTC day" and that's stable enough
  // for a 7-year-old's daily rhythm.
  const dateKey = today.toISOString().slice(0, 10);
  const h = simpleHash(learnerId + dateKey);
  return CHARACTER_CODES[h % CHARACTER_CODES.length];
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npx vitest run tests/world/characterRotation.test.ts
```

Expected: 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/world/characterRotation.ts tests/world/characterRotation.test.ts
git commit -m "feat(world): daily character rotation for quick-start spots"
```

---

## Task 4: `branchMaps.ts` — structure positions for Math Mountain & Reading Forest

**Why:** §6 + §7 of the spec. Both branch scenes need structure data (which skills, where on the map). Same shape as the existing `GARDEN_STRUCTURES` for consistency.

**Files:**
- Create: `lib/world/branchMaps.ts`
- Create: `tests/world/branchMaps.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/world/branchMaps.test.ts
import { describe, it, expect } from 'vitest';
import {
  MATH_MOUNTAIN_STRUCTURES,
  READING_FOREST_STRUCTURES,
  MATH_MOUNTAIN_CLUSTERS,
  READING_FOREST_CLUSTERS,
  BRANCH_MAP_WIDTH,
  BRANCH_MAP_HEIGHT,
} from '@/lib/world/branchMaps';
import { MATH_SKILLS } from '@/lib/packs/math/skills';
import { READING_SKILLS } from '@/lib/packs/reading/skills';

const allMathCodes = new Set(MATH_SKILLS.map(s => s.code));
const allReadingCodes = new Set(READING_SKILLS.map(s => s.code));

describe('branchMaps', () => {
  describe('Math Mountain', () => {
    it('every structure references a real math skill', () => {
      for (const s of MATH_MOUNTAIN_STRUCTURES) {
        expect(s.skillCode, `${s.code} must have a skillCode`).toBeTruthy();
        expect(
          allMathCodes.has(s.skillCode!),
          `${s.code} → ${s.skillCode} must be a real math skill`,
        ).toBe(true);
      }
    });

    it('every position is inside the branch map bounds', () => {
      for (const s of MATH_MOUNTAIN_STRUCTURES) {
        expect(s.x, `${s.code} x in bounds`).toBeGreaterThanOrEqual(0);
        expect(s.x, `${s.code} x in bounds`).toBeLessThanOrEqual(BRANCH_MAP_WIDTH);
        expect(s.y, `${s.code} y in bounds`).toBeGreaterThanOrEqual(0);
        expect(s.y, `${s.code} y in bounds`).toBeLessThanOrEqual(BRANCH_MAP_HEIGHT);
      }
    });

    it('structure codes are unique', () => {
      const codes = MATH_MOUNTAIN_STRUCTURES.map(s => s.code);
      expect(new Set(codes).size).toBe(codes.length);
    });

    it('every cluster is non-empty and references real structure codes', () => {
      const allCodes = new Set(MATH_MOUNTAIN_STRUCTURES.map(s => s.code));
      for (const cluster of MATH_MOUNTAIN_CLUSTERS) {
        expect(cluster.structureCodes.length).toBeGreaterThan(0);
        for (const code of cluster.structureCodes) {
          expect(allCodes.has(code), `cluster ${cluster.label} references unknown ${code}`).toBe(true);
        }
      }
    });

    it('does not duplicate any central-garden starter structure codes', () => {
      // Math Mountain should not contain the 5 central-garden math starters
      // (those stay on the central garden, per the additive-only spec).
      const starters = new Set([
        'math_counting_path', 'math_bee_swarm', 'math_petal_falls',
        'math_number_bonds', 'math_word_stories',
      ]);
      for (const s of MATH_MOUNTAIN_STRUCTURES) {
        expect(starters.has(s.code), `${s.code} must not duplicate a central-garden starter`).toBe(false);
      }
    });
  });

  describe('Reading Forest', () => {
    it('every structure references a real reading skill', () => {
      for (const s of READING_FOREST_STRUCTURES) {
        expect(s.skillCode, `${s.code} must have a skillCode`).toBeTruthy();
        expect(
          allReadingCodes.has(s.skillCode!),
          `${s.code} → ${s.skillCode} must be a real reading skill`,
        ).toBe(true);
      }
    });

    it('every position is inside the branch map bounds', () => {
      for (const s of READING_FOREST_STRUCTURES) {
        expect(s.x).toBeGreaterThanOrEqual(0);
        expect(s.x).toBeLessThanOrEqual(BRANCH_MAP_WIDTH);
        expect(s.y).toBeGreaterThanOrEqual(0);
        expect(s.y).toBeLessThanOrEqual(BRANCH_MAP_HEIGHT);
      }
    });

    it('structure codes are unique', () => {
      const codes = READING_FOREST_STRUCTURES.map(s => s.code);
      expect(new Set(codes).size).toBe(codes.length);
    });

    it('every cluster is non-empty and references real structure codes', () => {
      const allCodes = new Set(READING_FOREST_STRUCTURES.map(s => s.code));
      for (const cluster of READING_FOREST_CLUSTERS) {
        expect(cluster.structureCodes.length).toBeGreaterThan(0);
        for (const code of cluster.structureCodes) {
          expect(allCodes.has(code), `cluster ${cluster.label} references unknown ${code}`).toBe(true);
        }
      }
    });

    it('does not duplicate any central-garden starter structure codes', () => {
      const starters = new Set([
        'reading_book_stump', 'reading_blending_beach', 'reading_readaloud_log',
      ]);
      for (const s of READING_FOREST_STRUCTURES) {
        expect(starters.has(s.code)).toBe(false);
      }
    });
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npx vitest run tests/world/branchMaps.test.ts
```

Expected: failure with "Cannot find module '@/lib/world/branchMaps'".

- [ ] **Step 3: Implement `branchMaps.ts`**

```ts
// lib/world/branchMaps.ts
//
// Per-branch map data: which skill structures live on Math Mountain vs.
// Reading Forest, where they're positioned, and how they cluster by
// strand. Branch maps reuse the same MapStructure shape as the central
// garden so rendering can share components.
//
// Cluster groupings come from §6.2 (math) and §7.2 (reading) of the
// world-navigation-overhaul design spec. Position numbers are
// approximate — the implementer may nudge them after seeing the actual
// SVG render.

import type { MapStructure } from './gardenMap';

export const BRANCH_MAP_WIDTH = 1440;
export const BRANCH_MAP_HEIGHT = 800;

export interface BranchCluster {
  code: string;
  label: string;
  structureCodes: string[];
}

// ─── MATH MOUNTAIN ──────────────────────────────────────────────────
//
// Vertical metaphor: harder content sits higher up the mountain.
// Five clusters around a central peak silhouette + a Word Stories
// cottage in the bottom-left corner.

export const MATH_MOUNTAIN_STRUCTURES: MapStructure[] = [
  // ─── Operations Hollow (left foreground) ────────────────────────
  { code: 'mm_butterfly_make10', kind: 'skill', skillCode: 'math.add.within_20.crossing_ten',
    label: 'Butterfly Clusters', subLabel: 'make-10 add', themeEmoji: '🦋',
    x: 240, y: 560, size: 64, zone: 'math' },
  { code: 'mm_fast_facts', kind: 'skill', skillCode: 'math.add.fluency_within_20',
    label: 'Fast Facts', subLabel: 'quick recall', themeEmoji: '⚡',
    x: 360, y: 580, size: 60, zone: 'math' },
  { code: 'mm_hundreds_hollow', kind: 'skill', skillCode: 'math.add.within_100.no_regrouping',
    label: "Hundred's Hollow", subLabel: '2-digit add', themeEmoji: '🌳',
    x: 160, y: 620, size: 64, zone: 'math' },
  { code: 'mm_regroup_ridge', kind: 'skill', skillCode: 'math.add.within_100.with_regrouping',
    label: 'Regrouping Ridge', subLabel: '2-digit regroup', themeEmoji: '⛰️',
    x: 280, y: 660, size: 64, zone: 'math' },
  { code: 'mm_big_bridge', kind: 'skill', skillCode: 'math.add.within_1000',
    label: 'Big Number Bridge', subLabel: '3-digit add', themeEmoji: '🌉',
    x: 410, y: 670, size: 60, zone: 'math' },
  { code: 'mm_leaf_drops', kind: 'skill', skillCode: 'math.subtract.within_20.no_crossing',
    label: 'Leaf Drops', subLabel: 'subtract within 20', themeEmoji: '🍂',
    x: 110, y: 500, size: 60, zone: 'math' },
  { code: 'mm_berry_basket', kind: 'skill', skillCode: 'math.subtract.within_20.crossing_ten',
    label: 'Berry Basket', subLabel: 'subtract make-10', themeEmoji: '🫐',
    x: 220, y: 480, size: 60, zone: 'math' },
  { code: 'mm_quiet_pond', kind: 'skill', skillCode: 'math.subtract.within_100.no_regrouping',
    label: 'Quiet Pond', subLabel: '2-digit subtract', themeEmoji: '🪷',
    x: 340, y: 500, size: 60, zone: 'math' },
  { code: 'mm_rushing_stream', kind: 'skill', skillCode: 'math.subtract.within_100.with_regrouping',
    label: 'Rushing Stream', subLabel: '2-digit regroup', themeEmoji: '🌊',
    x: 440, y: 540, size: 60, zone: 'math' },
  { code: 'mm_big_falls', kind: 'skill', skillCode: 'math.subtract.within_1000',
    label: 'Big Number Falls', subLabel: '3-digit subtract', themeEmoji: '🏞️',
    x: 510, y: 580, size: 60, zone: 'math' },
  { code: 'mm_twin_bonds', kind: 'skill', skillCode: 'math.number_bond.within_20',
    label: 'Twin Blossoms', subLabel: 'bonds to 20', themeEmoji: '🌷',
    x: 380, y: 460, size: 56, zone: 'math' },

  // ─── Place-Value Heights (center, mid-mountain) ─────────────────
  { code: 'mm_tens_tower', kind: 'skill', skillCode: 'math.placevalue.tens_ones',
    label: 'Tens Tower', subLabel: 'tens & ones', themeEmoji: '🏯',
    x: 600, y: 360, size: 64, zone: 'math' },
  { code: 'mm_three_digit_tower', kind: 'skill', skillCode: 'math.placevalue.hundreds_tens_ones',
    label: 'Three-Digit Tower', subLabel: 'hundreds, tens, ones', themeEmoji: '🏛️',
    x: 720, y: 300, size: 64, zone: 'math' },
  { code: 'mm_compare_trees', kind: 'skill', skillCode: 'math.placevalue.compare_2digit',
    label: 'Compare Trees', subLabel: 'compare 2-digit', themeEmoji: '🌲',
    x: 540, y: 420, size: 60, zone: 'math' },
  { code: 'mm_mountain_compare', kind: 'skill', skillCode: 'math.placevalue.compare_3digit',
    label: 'Mountain Heights', subLabel: 'compare 3-digit', themeEmoji: '🏔️',
    x: 820, y: 360, size: 60, zone: 'math' },
  { code: 'mm_ten_more_less', kind: 'skill', skillCode: 'math.placevalue.add_subtract_10',
    label: 'Ten More, Ten Less', subLabel: '±10 mentally', themeEmoji: '🍃',
    x: 660, y: 460, size: 60, zone: 'math' },
  { code: 'mm_round_10', kind: 'skill', skillCode: 'math.placevalue.round_nearest_10',
    label: 'Round to 10', subLabel: 'nearest ten', themeEmoji: '🌀',
    x: 860, y: 440, size: 60, zone: 'math' },
  { code: 'mm_round_100', kind: 'skill', skillCode: 'math.placevalue.round_nearest_100',
    label: 'Round to 100', subLabel: 'nearest hundred', themeEmoji: '🌀',
    x: 940, y: 380, size: 60, zone: 'math' },

  // ─── Multiplication Orchard (right foreground) ──────────────────
  { code: 'mm_equal_garden', kind: 'skill', skillCode: 'math.multiply.equal_groups',
    label: 'Equal Gardens', subLabel: 'equal groups', themeEmoji: '🌻',
    x: 1080, y: 560, size: 60, zone: 'math' },
  { code: 'mm_array_orchard', kind: 'skill', skillCode: 'math.multiply.arrays',
    label: 'Array Orchard', subLabel: 'rows × columns', themeEmoji: '🍎',
    x: 1200, y: 580, size: 64, zone: 'math' },
  { code: 'mm_skip_bridge', kind: 'skill', skillCode: 'math.multiply.skip_count_bridge',
    label: 'Skip Count Bridge', subLabel: 'skip → multiply', themeEmoji: '🌉',
    x: 1320, y: 540, size: 60, zone: 'math' },
  { code: 'mm_times_to_5', kind: 'skill', skillCode: 'math.multiply.facts_to_5',
    label: 'Times Tables ×0–×5', subLabel: 'multiplication facts', themeEmoji: '✖️',
    x: 1100, y: 660, size: 60, zone: 'math' },
  { code: 'mm_times_to_10', kind: 'skill', skillCode: 'math.multiply.facts_to_10',
    label: 'Times Tables ×0–×10', subLabel: 'all the facts', themeEmoji: '✖️',
    x: 1240, y: 680, size: 60, zone: 'math' },

  // ─── Division Glen (right, behind orchard) ──────────────────────
  { code: 'mm_sharing_squirrels', kind: 'skill', skillCode: 'math.divide.equal_share',
    label: 'Sharing Squirrels', subLabel: 'share equally', themeEmoji: '🐿️',
    x: 1100, y: 280, size: 60, zone: 'math' },
  { code: 'mm_division_facts', kind: 'skill', skillCode: 'math.divide.facts_to_10',
    label: 'Division Facts', subLabel: 'division facts', themeEmoji: '➗',
    x: 1220, y: 300, size: 60, zone: 'math' },
  { code: 'mm_missing_number', kind: 'skill', skillCode: 'math.divide.unknown_factor',
    label: 'Missing Number', subLabel: 'find the factor', themeEmoji: '🧩',
    x: 1320, y: 260, size: 60, zone: 'math' },

  // ─── Measurement Meadow (across center-bottom) ──────────────────
  { code: 'mm_even_odd', kind: 'skill', skillCode: 'math.even_odd.recognize',
    label: 'Even & Odd Stones', subLabel: 'even or odd?', themeEmoji: '🪨',
    x: 540, y: 720, size: 56, zone: 'math' },
  { code: 'mm_garden_clock', kind: 'skill', skillCode: 'math.time.read_hour_half',
    label: 'Garden Clock', subLabel: 'hour & half', themeEmoji: '🕐',
    x: 640, y: 700, size: 60, zone: 'math' },
  { code: 'mm_sundial', kind: 'skill', skillCode: 'math.time.read_to_5_min',
    label: 'Sundial', subLabel: 'to 5 minutes', themeEmoji: '🕰️',
    x: 720, y: 730, size: 60, zone: 'math' },
  { code: 'mm_hourglass', kind: 'skill', skillCode: 'math.time.elapsed_intervals',
    label: 'Hourglass', subLabel: 'time passed', themeEmoji: '⌛',
    x: 800, y: 700, size: 60, zone: 'math' },
  { code: 'mm_pebble_coins', kind: 'skill', skillCode: 'math.money.coin_count',
    label: 'Pebble Coins', subLabel: 'count coins', themeEmoji: '🪙',
    x: 880, y: 730, size: 60, zone: 'math' },
  { code: 'mm_pie_slices', kind: 'skill', skillCode: 'math.fractions.identify',
    label: 'Pie Slices', subLabel: 'name the fraction', themeEmoji: '🥧',
    x: 980, y: 720, size: 60, zone: 'math' },
  { code: 'mm_bigger_slice', kind: 'skill', skillCode: 'math.fractions.compare_visual',
    label: 'Bigger Slice', subLabel: 'which is bigger?', themeEmoji: '🍰',
    x: 1060, y: 750, size: 60, zone: 'math' },

  // ─── Word Stories Cottage (bottom-left tucked) ─────────────────
  { code: 'mm_stories_plus', kind: 'skill', skillCode: 'math.word_problem.add_within_20',
    label: 'Garden Stories +', subLabel: 'add in a story', themeEmoji: '📖',
    x: 70, y: 720, size: 56, zone: 'math' },
  { code: 'mm_stories_minus', kind: 'skill', skillCode: 'math.word_problem.subtract_within_20',
    label: 'Garden Stories −', subLabel: 'subtract in a story', themeEmoji: '📖',
    x: 70, y: 760, size: 56, zone: 'math' },
  { code: 'mm_long_stories', kind: 'skill', skillCode: 'math.word_problem.two_step',
    label: 'Long Stories', subLabel: 'two-step', themeEmoji: '📜',
    x: 170, y: 760, size: 56, zone: 'math' },
];

export const MATH_MOUNTAIN_CLUSTERS: BranchCluster[] = [
  { code: 'operations_hollow', label: 'Operations Hollow',
    structureCodes: [
      'mm_butterfly_make10', 'mm_fast_facts', 'mm_hundreds_hollow',
      'mm_regroup_ridge', 'mm_big_bridge', 'mm_leaf_drops', 'mm_berry_basket',
      'mm_quiet_pond', 'mm_rushing_stream', 'mm_big_falls', 'mm_twin_bonds',
    ] },
  { code: 'place_value_heights', label: 'Place-Value Heights',
    structureCodes: [
      'mm_tens_tower', 'mm_three_digit_tower', 'mm_compare_trees',
      'mm_mountain_compare', 'mm_ten_more_less', 'mm_round_10', 'mm_round_100',
    ] },
  { code: 'multiplication_orchard', label: 'Multiplication Orchard',
    structureCodes: [
      'mm_equal_garden', 'mm_array_orchard', 'mm_skip_bridge',
      'mm_times_to_5', 'mm_times_to_10',
    ] },
  { code: 'division_glen', label: 'Division Glen',
    structureCodes: ['mm_sharing_squirrels', 'mm_division_facts', 'mm_missing_number'] },
  { code: 'measurement_meadow', label: 'Measurement Meadow',
    structureCodes: [
      'mm_even_odd', 'mm_garden_clock', 'mm_sundial', 'mm_hourglass',
      'mm_pebble_coins', 'mm_pie_slices', 'mm_bigger_slice',
    ] },
  { code: 'word_stories_cottage', label: 'Word Stories Cottage',
    structureCodes: ['mm_stories_plus', 'mm_stories_minus', 'mm_long_stories'] },
];

// ─── READING FOREST ─────────────────────────────────────────────────

export const READING_FOREST_STRUCTURES: MapStructure[] = [
  // ─── Sight Word Glade (NW) ──────────────────────────────────────
  { code: 'rf_dolch_first', kind: 'skill', skillCode: 'reading.sight_words.dolch_first_grade',
    label: 'Bee Words', subLabel: 'Dolch 1st grade', themeEmoji: '🌼',
    x: 140, y: 400, size: 64, zone: 'reading' },
  { code: 'rf_dolch_second', kind: 'skill', skillCode: 'reading.sight_words.dolch_second_grade',
    label: 'Petal Words', subLabel: 'Dolch 2nd grade', themeEmoji: '🌸',
    x: 280, y: 380, size: 60, zone: 'reading' },
  { code: 'rf_dolch_third', kind: 'skill', skillCode: 'reading.sight_words.dolch_third_grade',
    label: 'Wildflower Words', subLabel: 'Dolch 3rd grade', themeEmoji: '🌷',
    x: 200, y: 480, size: 60, zone: 'reading' },

  // ─── Phonics Path (winding through center) ──────────────────────
  { code: 'rf_digraphs', kind: 'skill', skillCode: 'reading.phonics.digraphs',
    label: 'Digraph Bridge', subLabel: 'ch · sh · th', themeEmoji: '🌉',
    x: 480, y: 360, size: 60, zone: 'reading' },
  { code: 'rf_initial_blends', kind: 'skill', skillCode: 'reading.phonics.initial_blends',
    label: 'Blending Bend', subLabel: 'consonant blends', themeEmoji: '🔗',
    x: 580, y: 280, size: 60, zone: 'reading' },
  { code: 'rf_silent_e', kind: 'skill', skillCode: 'reading.phonics.silent_e',
    label: 'Silent-e Spring', subLabel: 'magic-e', themeEmoji: '✨',
    x: 700, y: 220, size: 60, zone: 'reading' },
  { code: 'rf_vowel_ee_ea', kind: 'skill', skillCode: 'reading.phonics.vowel_teams_ee_ea',
    label: 'Ee/Ea Glade', subLabel: 'long e teams', themeEmoji: '🌿',
    x: 800, y: 260, size: 60, zone: 'reading' },
  { code: 'rf_vowel_ai_ay', kind: 'skill', skillCode: 'reading.phonics.vowel_teams_ai_ay',
    label: 'Ai/Ay Hollow', subLabel: 'long a teams', themeEmoji: '🌿',
    x: 900, y: 220, size: 60, zone: 'reading' },
  { code: 'rf_vowel_oa_ow', kind: 'skill', skillCode: 'reading.phonics.vowel_teams_oa_ow',
    label: 'Oa/Ow Path', subLabel: 'long o teams', themeEmoji: '🌿',
    x: 1000, y: 260, size: 60, zone: 'reading' },
  { code: 'rf_r_controlled', kind: 'skill', skillCode: 'reading.phonics.r_controlled',
    label: 'R-Controlled Ridge', subLabel: 'ar/er/ir/or/ur', themeEmoji: '🐎',
    x: 1100, y: 220, size: 60, zone: 'reading' },
  { code: 'rf_diphthongs', kind: 'skill', skillCode: 'reading.phonics.diphthongs',
    label: 'Diphthong Cove', subLabel: 'oi/oy, ou/ow', themeEmoji: '🐚',
    x: 1200, y: 260, size: 60, zone: 'reading' },

  // ─── Morphology Grove (NE around the old oak) ───────────────────
  { code: 'rf_ed_ing', kind: 'skill', skillCode: 'reading.morphology.inflectional_ed_ing',
    label: 'Word Endings', subLabel: '-ed / -ing', themeEmoji: '🍃',
    x: 1140, y: 460, size: 60, zone: 'reading' },
  { code: 'rf_plurals', kind: 'skill', skillCode: 'reading.morphology.plural_s_es',
    label: 'Plurals Patch', subLabel: '-s / -es', themeEmoji: '🌱',
    x: 1280, y: 480, size: 60, zone: 'reading' },
  { code: 'rf_compounds', kind: 'skill', skillCode: 'reading.morphology.compound_words',
    label: 'Compound Nests', subLabel: 'compound words', themeEmoji: '🪺',
    x: 1100, y: 540, size: 60, zone: 'reading' },
  { code: 'rf_prefixes', kind: 'skill', skillCode: 'reading.morphology.prefix_un_re',
    label: 'Prefix Acorns', subLabel: 'un- / re-', themeEmoji: '🌰',
    x: 1240, y: 580, size: 60, zone: 'reading' },

  // ─── Story Rocks (center back clearing) ─────────────────────────
  { code: 'rf_longer_words', kind: 'skill', skillCode: 'reading.read_aloud.longer_words',
    label: 'Long-Word Boulder', subLabel: 'multi-syllable read', themeEmoji: '📚',
    x: 660, y: 620, size: 60, zone: 'reading' },
  { code: 'rf_sentence', kind: 'skill', skillCode: 'reading.comprehension.short_sentence',
    label: 'Sentence Stones', subLabel: 'read & answer', themeEmoji: '📜',
    x: 800, y: 660, size: 60, zone: 'reading' },
  { code: 'rf_paragraph', kind: 'skill', skillCode: 'reading.comprehension.paragraph',
    label: 'Paragraph Pavers', subLabel: 'longer reading', themeEmoji: '📰',
    x: 740, y: 720, size: 60, zone: 'reading' },
];

export const READING_FOREST_CLUSTERS: BranchCluster[] = [
  { code: 'sight_word_glade', label: 'Sight Word Glade',
    structureCodes: ['rf_dolch_first', 'rf_dolch_second', 'rf_dolch_third'] },
  { code: 'phonics_path', label: 'Phonics Path',
    structureCodes: [
      'rf_digraphs', 'rf_initial_blends', 'rf_silent_e',
      'rf_vowel_ee_ea', 'rf_vowel_ai_ay', 'rf_vowel_oa_ow',
      'rf_r_controlled', 'rf_diphthongs',
    ] },
  { code: 'morphology_grove', label: 'Morphology Grove',
    structureCodes: ['rf_ed_ing', 'rf_plurals', 'rf_compounds', 'rf_prefixes'] },
  { code: 'story_rocks', label: 'Story Rocks',
    structureCodes: ['rf_longer_words', 'rf_sentence', 'rf_paragraph'] },
];
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npx vitest run tests/world/branchMaps.test.ts
```

Expected: 10 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/world/branchMaps.ts tests/world/branchMaps.test.ts
git commit -m "feat(world): branch map data for Math Mountain + Reading Forest"
```

---

## Task 5: `habitatInteriors.ts` — config for which habitats have interiors

**Why:** §8.4 of the spec. Single source of truth: which habitats have implemented interiors, and what themed skill each one hosts inside. Only `bunny_burrow` is mapped in the first push.

**Files:**
- Create: `lib/world/habitatInteriors.ts`

- [ ] **Step 1: Write the file (no tests — pure data, validated by branch-map-style tests in later tasks)**

```ts
// lib/world/habitatInteriors.ts
//
// Which habitats have built interiors, and what themed skill each one
// hosts inside. Only bunny_burrow is mapped in the first push (§14 of
// the design spec); the other five habitat interiors are Phase 2.
//
// `themedSkillCode` is the skill that the interior's central glowing
// structure starts a session on. It does NOT add new content — it
// reuses an existing skill code and just dresses it in the habitat's
// theme.

export interface HabitatInteriorConfig {
  themedSkillCode: string;
  themedStructureLabel: string;  // displayed under the glowing pin in the interior
  themedStructureEmoji: string;
}

export const HABITAT_INTERIORS: Record<string, HabitatInteriorConfig> = {
  bunny_burrow: {
    themedSkillCode: 'math.subtract.within_10',
    themedStructureLabel: 'Petal Counting',
    themedStructureEmoji: '🌺',
  },
};

export function hasHabitatInterior(habitatCode: string): boolean {
  return habitatCode in HABITAT_INTERIORS;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/world/habitatInteriors.ts
git commit -m "feat(world): habitat interior config (bunny_burrow only in MVP)"
```

---

## Task 6: `characterRecommendation.ts` — server-side helper for character quick-starts

**Why:** §9.2 of the spec. Each character offers a different recommendation: Nana → reading, Hodge → math, Signpost → mixed top-N. This wraps the existing `/api/plan/candidates` endpoint and partitions by subject.

**Files:**
- Create: `lib/world/characterRecommendation.ts`
- Create: `tests/world/characterRecommendation.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/world/characterRecommendation.test.ts
import { describe, it, expect } from 'vitest';
import { partitionRecommendations } from '@/lib/world/characterRecommendation';

const fakeCandidates = [
  { skillCode: 'math.add.within_10', title: 'Bee Swarms', themeEmoji: '🐝', skillHint: 'add' },
  { skillCode: 'reading.sight_words.dolch_primer', title: 'Word Stump', themeEmoji: '🌳', skillHint: 'sight words' },
  { skillCode: 'math.multiply.equal_groups', title: 'Equal Gardens', themeEmoji: '🌻', skillHint: 'groups' },
  { skillCode: 'reading.phonics.cvc_blend', title: 'Blending Brook', themeEmoji: '🪨', skillHint: 'blend' },
  { skillCode: 'math.subtract.within_10', title: 'Petal Falls', themeEmoji: '🌺', skillHint: 'subtract' },
];

describe('characterRecommendation', () => {
  it('Hodge gets the first math candidate', () => {
    const out = partitionRecommendations(fakeCandidates);
    expect(out.hodge?.skillCode).toBe('math.add.within_10');
  });

  it('Nana gets the first reading candidate', () => {
    const out = partitionRecommendations(fakeCandidates);
    expect(out.nana?.skillCode).toBe('reading.sight_words.dolch_primer');
  });

  it('Signpost gets up to 4 mixed-subject candidates in order', () => {
    const out = partitionRecommendations(fakeCandidates);
    expect(out.signpost.length).toBe(4);
    expect(out.signpost[0].skillCode).toBe('math.add.within_10');
  });

  it('handles missing math candidates gracefully', () => {
    const onlyReading = fakeCandidates.filter(c => c.skillCode.startsWith('reading.'));
    const out = partitionRecommendations(onlyReading);
    expect(out.hodge).toBeNull();
    expect(out.nana?.skillCode).toBe('reading.sight_words.dolch_primer');
  });

  it('handles missing reading candidates gracefully', () => {
    const onlyMath = fakeCandidates.filter(c => c.skillCode.startsWith('math.'));
    const out = partitionRecommendations(onlyMath);
    expect(out.nana).toBeNull();
    expect(out.hodge?.skillCode).toBe('math.add.within_10');
  });

  it('handles empty input', () => {
    const out = partitionRecommendations([]);
    expect(out.hodge).toBeNull();
    expect(out.nana).toBeNull();
    expect(out.signpost).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npx vitest run tests/world/characterRecommendation.test.ts
```

Expected: failure with "Cannot find module '@/lib/world/characterRecommendation'".

- [ ] **Step 3: Implement `characterRecommendation.ts`**

```ts
// lib/world/characterRecommendation.ts
//
// Partitions the engine's candidate list into per-character
// recommendations. The actual fetch from /api/plan/candidates happens
// in the garden page server component; this file just slices the
// returned candidates into the right buckets per character.
//
// Hodge (beaver, math affinity) → first math candidate
// Nana Mira (reading affinity) → first reading candidate
// Wanderer's Signpost → up to 4 candidates, mixed subjects, in engine order

export interface RecommendedCandidate {
  skillCode: string;
  title: string;
  themeEmoji: string;
  skillHint: string;
}

export interface CharacterRecommendations {
  hodge: RecommendedCandidate | null;
  nana: RecommendedCandidate | null;
  signpost: RecommendedCandidate[];
}

const SIGNPOST_ARMS = 4;

export function partitionRecommendations(
  candidates: RecommendedCandidate[],
): CharacterRecommendations {
  const hodge = candidates.find(c => c.skillCode.startsWith('math.')) ?? null;
  const nana = candidates.find(c => c.skillCode.startsWith('reading.')) ?? null;
  const signpost = candidates.slice(0, SIGNPOST_ARMS);
  return { hodge, nana, signpost };
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npx vitest run tests/world/characterRecommendation.test.ts
```

Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/world/characterRecommendation.ts tests/world/characterRecommendation.test.ts
git commit -m "feat(world): partition engine candidates per character"
```

---

## Task 7: `LockedGate` component + tests

**Why:** §4 of the spec. Renders the ivy archway at a path-edge, in either locked or unlocked state, with a one-shot unlock animation when `justUnlocked` is true.

**Files:**
- Create: `components/child/garden/LockedGate.tsx`
- Create: `tests/components/LockedGate.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
// tests/components/LockedGate.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LockedGate from '@/components/child/garden/LockedGate';

describe('LockedGate', () => {
  it('renders locked state by default with destination label', () => {
    render(
      <LockedGate
        destinationLabel="Math Mountain"
        unlocked={false}
        justUnlocked={false}
        onTapWhenLocked={() => {}}
        onTapWhenUnlocked={() => {}}
      />,
    );
    // The locked label includes the destination name
    expect(screen.getByText(/Math Mountain/i)).toBeInTheDocument();
    // Locked state shows lock affordance — assert via aria-label
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', expect.stringMatching(/locked/i));
  });

  it('renders unlocked state without lock affordance', () => {
    render(
      <LockedGate
        destinationLabel="Math Mountain"
        unlocked={true}
        justUnlocked={false}
        onTapWhenLocked={() => {}}
        onTapWhenUnlocked={() => {}}
      />,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', expect.stringMatching(/to math mountain/i));
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-label', expect.stringMatching(/locked/i));
  });

  it('fires onTapWhenLocked when locked and tapped', () => {
    const onLocked = vi.fn();
    const onUnlocked = vi.fn();
    render(
      <LockedGate
        destinationLabel="Reading Forest"
        unlocked={false}
        justUnlocked={false}
        onTapWhenLocked={onLocked}
        onTapWhenUnlocked={onUnlocked}
      />,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onLocked).toHaveBeenCalledOnce();
    expect(onUnlocked).not.toHaveBeenCalled();
  });

  it('fires onTapWhenUnlocked when unlocked and tapped', () => {
    const onLocked = vi.fn();
    const onUnlocked = vi.fn();
    render(
      <LockedGate
        destinationLabel="Reading Forest"
        unlocked={true}
        justUnlocked={false}
        onTapWhenLocked={onLocked}
        onTapWhenUnlocked={onUnlocked}
      />,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onUnlocked).toHaveBeenCalledOnce();
    expect(onLocked).not.toHaveBeenCalled();
  });

  it('adds an unlock-animation class when justUnlocked is true', () => {
    render(
      <LockedGate
        destinationLabel="Math Mountain"
        unlocked={true}
        justUnlocked={true}
        onTapWhenLocked={() => {}}
        onTapWhenUnlocked={() => {}}
      />,
    );
    // The button itself doesn't have to carry the class — but some
    // element in the rendered tree should have a class signalling
    // the just-unlocked state.
    const node = document.querySelector('[data-just-unlocked="true"]');
    expect(node).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npx vitest run tests/components/LockedGate.test.tsx
```

Expected: failure with "Cannot find module '@/components/child/garden/LockedGate'".

- [ ] **Step 3: Implement `LockedGate.tsx`**

```tsx
// components/child/garden/LockedGate.tsx
//
// Ivy archway at a path-edge of the central garden. Locked initially:
// the gate is wrapped in vines, with a small dark-banner label
// reading "🔒 to {destination}". When unlocked, the vines visually
// slide aside, the lock disappears, and the label brightens.
//
// `justUnlocked` is a one-shot flag: when true, the component runs
// the vine-slide-aside animation on mount (intended to fire exactly
// once, the first time the learner sees the gate post-unlock). The
// caller is responsible for clearing it via the world_state
// unlocked_branches list.

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';

interface LockedGateProps {
  destinationLabel: string;
  unlocked: boolean;
  justUnlocked: boolean;
  onTapWhenLocked: () => void;
  onTapWhenUnlocked: () => void;
}

export default function LockedGate({
  destinationLabel,
  unlocked,
  justUnlocked,
  onTapWhenLocked,
  onTapWhenUnlocked,
}: LockedGateProps) {
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (justUnlocked && !reducedMotion) {
      setAnimating(true);
      const t = setTimeout(() => setAnimating(false), 1200);
      return () => clearTimeout(t);
    }
  }, [justUnlocked, reducedMotion]);

  const ariaLabel = unlocked
    ? `path to ${destinationLabel}`
    : `gate locked — finish a few activities to open the way to ${destinationLabel}`;

  return (
    <div
      data-just-unlocked={animating ? 'true' : 'false'}
      style={{ display: 'inline-block', textAlign: 'center', minWidth: 60, minHeight: 60 }}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => (unlocked ? onTapWhenUnlocked() : onTapWhenLocked())}
        style={{
          background: 'none', border: 'none', padding: 4, cursor: 'pointer',
          minWidth: 60, minHeight: 60,
        }}
      >
        <motion.span
          aria-hidden
          animate={animating ? { rotate: [0, -8, 4, 0], scale: [1, 1.1, 0.96, 1] } : {}}
          transition={{ duration: 1.0, ease: 'easeOut' }}
          style={{ fontSize: 30, opacity: unlocked ? 1 : 0.85, display: 'inline-block' }}
        >
          {unlocked ? '🚪' : '🌿'}
        </motion.span>
      </button>
      <div
        style={{
          fontSize: 9, fontWeight: 700, marginTop: 2,
          padding: '2px 6px', borderRadius: 6,
          background: unlocked ? 'rgba(255, 250, 242, 0.9)' : 'rgba(107, 68, 35, 0.9)',
          color: unlocked ? '#6b4423' : '#fffaf2',
          display: 'inline-block', whiteSpace: 'nowrap',
        }}
      >
        {unlocked ? `to ${destinationLabel} →` : `🔒 to ${destinationLabel}`}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npx vitest run tests/components/LockedGate.test.tsx
```

Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add components/child/garden/LockedGate.tsx tests/components/LockedGate.test.tsx
git commit -m "feat(garden): LockedGate component for branch path-edges"
```

---

## Task 8: `CharacterSpot` component + tests

**Why:** §9 of the spec. Renders one quick-start character (Nana / Hodge / Signpost) with awake / sleeping state.

**Files:**
- Create: `components/child/garden/CharacterSpot.tsx`
- Create: `tests/components/CharacterSpot.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
// tests/components/CharacterSpot.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CharacterSpot from '@/components/child/garden/CharacterSpot';

describe('CharacterSpot', () => {
  it('renders the character name as accessible label', () => {
    render(
      <CharacterSpot
        characterCode="nana"
        name="Nana Mira"
        emoji="👵"
        alert={true}
        recommendation="Word Stump — sight words"
        onTap={() => {}}
      />,
    );
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      expect.stringMatching(/nana mira/i),
    );
  });

  it('shows recommendation hint when alert', () => {
    render(
      <CharacterSpot
        characterCode="nana"
        name="Nana Mira"
        emoji="👵"
        alert={true}
        recommendation="Word Stump — sight words"
        onTap={() => {}}
      />,
    );
    expect(screen.getByText(/Word Stump/i)).toBeInTheDocument();
  });

  it('does NOT show recommendation hint when sleeping', () => {
    render(
      <CharacterSpot
        characterCode="hodge"
        name="Hodge"
        emoji="🦫"
        alert={false}
        recommendation="Bee Swarms — addition"
        onTap={() => {}}
      />,
    );
    expect(screen.queryByText(/Bee Swarms/i)).not.toBeInTheDocument();
  });

  it('fires onTap when clicked', () => {
    const onTap = vi.fn();
    render(
      <CharacterSpot
        characterCode="signpost"
        name="Wanderer's Signpost"
        emoji="🪧"
        alert={true}
        recommendation="quick start"
        onTap={onTap}
      />,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onTap).toHaveBeenCalledOnce();
  });

  it('marks awake / asleep via data-state attribute', () => {
    const { rerender } = render(
      <CharacterSpot
        characterCode="hodge"
        name="Hodge"
        emoji="🦫"
        alert={true}
        recommendation="x"
        onTap={() => {}}
      />,
    );
    expect(document.querySelector('[data-state="awake"]')).not.toBeNull();
    rerender(
      <CharacterSpot
        characterCode="hodge"
        name="Hodge"
        emoji="🦫"
        alert={false}
        recommendation="x"
        onTap={() => {}}
      />,
    );
    expect(document.querySelector('[data-state="asleep"]')).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npx vitest run tests/components/CharacterSpot.test.tsx
```

Expected: failure with "Cannot find module '@/components/child/garden/CharacterSpot'".

- [ ] **Step 3: Implement `CharacterSpot.tsx`**

```tsx
// components/child/garden/CharacterSpot.tsx
//
// One quick-start character on the central garden — Nana Mira on the
// cottage porch, Hodge the Beaver by the brook, the Wanderer's
// Signpost at the path-meadow junction. Today's "alert" character
// (picked by characterRotation) is awake, eyes-open, with a small
// hover hint showing what they recommend. The other two are dimmed
// with a slight idle bob, eyes closed.

'use client';

import { motion } from 'framer-motion';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';
import type { CharacterCode } from '@/lib/world/characterRotation';

interface CharacterSpotProps {
  characterCode: CharacterCode;
  name: string;
  emoji: string;
  alert: boolean;
  recommendation: string;
  onTap: () => void;
}

export default function CharacterSpot({
  characterCode,
  name,
  emoji,
  alert,
  recommendation,
  onTap,
}: CharacterSpotProps) {
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;

  // Aria label: the alert character includes their recommendation hint;
  // the sleeping ones note that they're resting so screen readers can
  // explain why nothing happens on tap. Tap still fires either way —
  // the parent decides what to do.
  const ariaLabel = alert
    ? `${name} — ${recommendation}`
    : `${name} is resting`;

  return (
    <button
      type="button"
      data-state={alert ? 'awake' : 'asleep'}
      aria-label={ariaLabel}
      onClick={onTap}
      style={{
        background: 'none', border: 'none', padding: 4, cursor: 'pointer',
        minWidth: 60, minHeight: 60, textAlign: 'center', lineHeight: 1,
        display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2,
      }}
    >
      <motion.span
        aria-hidden
        animate={
          reducedMotion
            ? {}
            : alert
              ? { y: [0, -2, 0] }
              : { rotate: [-2, 2, -2] }
        }
        transition={{
          duration: alert ? 1.6 : 3.0,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
        style={{
          fontSize: 22,
          opacity: alert ? 1 : 0.55,
          filter: alert
            ? 'drop-shadow(0 1px 2px rgba(107,68,35,0.4))'
            : 'grayscale(0.4)',
        }}
      >
        {emoji}
      </motion.span>
      <span
        style={{
          fontSize: 8, fontWeight: 700, padding: '2px 5px', borderRadius: 4,
          background: 'rgba(195, 141, 158, 0.95)', color: '#fffaf2',
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </span>
      {alert && (
        <span
          style={{
            fontSize: 8, color: '#6b4423', marginTop: 1,
            background: 'rgba(255,250,242,0.85)', padding: '1px 4px',
            borderRadius: 4, whiteSpace: 'nowrap', fontStyle: 'italic',
          }}
        >
          {recommendation}
        </span>
      )}
    </button>
  );
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npx vitest run tests/components/CharacterSpot.test.tsx
```

Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add components/child/garden/CharacterSpot.tsx tests/components/CharacterSpot.test.tsx
git commit -m "feat(garden): CharacterSpot for Nana / Hodge / Signpost"
```

---

## Task 9: `BranchHeader` and `BranchSceneLayout` — shared branch scaffolding

**Why:** §6 + §7 of the spec. Both branch scenes share a header (back-to-garden + scene name + scene icon) and a 14:8 SVG container. Extract to keep Math Mountain and Reading Forest small and consistent.

**Files:**
- Create: `components/child/garden/BranchHeader.tsx`
- Create: `components/child/garden/BranchSceneLayout.tsx`

- [ ] **Step 1: Write `BranchHeader.tsx`**

```tsx
// components/child/garden/BranchHeader.tsx
//
// Shared header across branch scenes (Math Mountain, Reading Forest).
// Mirrors the central garden's header in shape and size, but does NOT
// include the music toggle, journal link, or compass — branches are
// quieter scenes for focused study.

'use client';

import Link from 'next/link';

interface BranchHeaderProps {
  learnerId: string;
  title: string;
  iconEmoji: string;  // small scene-icon shown on the right
}

export default function BranchHeader({ learnerId, title, iconEmoji }: BranchHeaderProps) {
  const backHref = `/garden?learner=${learnerId}`;
  return (
    <div
      className="flex items-center justify-between bg-cream/90 backdrop-blur border-b border-ochre/30 px-3 py-2 landscape:py-1.5"
    >
      <Link
        href={backHref}
        className="text-xl p-1.5 rounded-full bg-white border border-ochre landscape:p-1"
        aria-label="back to garden"
        style={{ minWidth: 40, minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      >←</Link>
      <h1
        className="font-display text-[22px] landscape:text-[18px] text-bark"
        style={{ fontWeight: 600, letterSpacing: '-0.01em' }}
      >
        {title}
      </h1>
      <span
        aria-hidden
        className="text-2xl landscape:text-xl"
        style={{ minWidth: 40, minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}
      >
        {iconEmoji}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Write `BranchSceneLayout.tsx`**

```tsx
// components/child/garden/BranchSceneLayout.tsx
//
// Shared layout container for branch scenes (Math Mountain, Reading
// Forest). Reuses the same viewport pattern as GardenScene: 100dvh
// flex column with a compact header + flex-1 SVG area, so the scene
// fills the screen on iPad landscape without a cap.
//
// The actual SVG content (background gradient, hills, structures) is
// passed in as `children` — branch-specific. This layout owns: header,
// time-of-day tint overlay, viewport sizing, and the back-to-garden
// navigation chrome.

'use client';

import { useEffect, useState } from 'react';
import BranchHeader from './BranchHeader';

export interface BranchSceneLayoutProps {
  learnerId: string;
  title: string;
  iconEmoji: string;
  children: React.ReactNode;  // the inner SVG (viewBox=0 0 1440 800)
}

export default function BranchSceneLayout({
  learnerId, title, iconEmoji, children,
}: BranchSceneLayoutProps) {
  // Time-of-day tint — initialised to noon (transparent) and updated
  // after mount so SSR + hydration always agree (no flash of darkness).
  // Same logic as GardenScene so the world feels uniform.
  const [hour, setHour] = useState(12);
  useEffect(() => { setHour(new Date().getHours()); }, []);
  const tint =
    hour < 5  ? 'rgba(40, 50, 100, 0.18)' :
    hour < 7  ? 'rgba(255, 200, 140, 0.04)' :
    hour < 19 ? 'transparent' :
    hour < 21 ? 'rgba(255, 170, 110, 0.05)' :
                'rgba(20, 25, 60, 0.18)';

  return (
    <div
      className="bg-[#F5EBDC] flex flex-col overflow-hidden"
      style={{ height: '100dvh', minHeight: '100vh' }}
    >
      <BranchHeader learnerId={learnerId} title={title} iconEmoji={iconEmoji} />
      <div className="flex-1 relative overflow-hidden">
        {children}
        {tint !== 'transparent' && (
          <div
            aria-hidden
            style={{
              position: 'absolute', inset: 0, background: tint,
              pointerEvents: 'none', mixBlendMode: 'multiply',
            }}
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/child/garden/BranchHeader.tsx components/child/garden/BranchSceneLayout.tsx
git commit -m "feat(garden): BranchHeader + BranchSceneLayout scaffolding"
```

---

## Task 10: `HabitatInteriorLayout` — shared interior scaffolding

**Why:** §8.4 of the spec. Same viewport/header pattern as branch scenes, but with an "interior" warm/intimate vibe. Children fill the SVG area.

**Files:**
- Create: `components/child/garden/HabitatInteriorLayout.tsx`

- [ ] **Step 1: Write `HabitatInteriorLayout.tsx`**

```tsx
// components/child/garden/HabitatInteriorLayout.tsx
//
// Shared layout for habitat interior scenes (Bunny Burrow first;
// frog pond, bee hotel, etc. follow the same pattern in Phase 2).
// Same viewport sizing as BranchSceneLayout, but visually warmer
// and more enclosed — interiors are atmospheric, not full landscapes.

'use client';

import { useEffect, useState } from 'react';
import BranchHeader from './BranchHeader';

interface HabitatInteriorLayoutProps {
  learnerId: string;
  title: string;
  iconEmoji: string;
  children: React.ReactNode;
}

export default function HabitatInteriorLayout({
  learnerId, title, iconEmoji, children,
}: HabitatInteriorLayoutProps) {
  const [hour, setHour] = useState(12);
  useEffect(() => { setHour(new Date().getHours()); }, []);
  // Interiors are warmer-by-default than branches — even at night
  // the lantern keeps things glowing.
  const tint =
    hour < 5  ? 'rgba(60, 30, 80, 0.10)' :
    hour < 19 ? 'transparent' :
                'rgba(40, 25, 60, 0.12)';

  return (
    <div
      className="bg-[#3a2510] flex flex-col overflow-hidden"
      style={{ height: '100dvh', minHeight: '100vh' }}
    >
      <BranchHeader learnerId={learnerId} title={title} iconEmoji={iconEmoji} />
      <div className="flex-1 relative overflow-hidden">
        {children}
        {tint !== 'transparent' && (
          <div
            aria-hidden
            style={{
              position: 'absolute', inset: 0, background: tint,
              pointerEvents: 'none', mixBlendMode: 'multiply',
            }}
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/child/garden/HabitatInteriorLayout.tsx
git commit -m "feat(garden): HabitatInteriorLayout scaffolding"
```

---

## Task 11: Math Mountain page + scene

**Why:** §6 of the spec. The branch scene proper. Server component fetches the learner's progress; client component renders the SVG with structures.

**Files:**
- Create: `app/(child)/garden/math-mountain/page.tsx`
- Create: `app/(child)/garden/math-mountain/MathMountainScene.tsx`

- [ ] **Step 1: Write the server page `app/(child)/garden/math-mountain/page.tsx`**

```tsx
// app/(child)/garden/math-mountain/page.tsx
//
// Math Mountain server component — mirrors the central garden's data
// fetching pattern. Computes per-structure unlock state for every
// math-mountain structure, then hands off to MathMountainScene.

import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import { MATH_SKILLS } from '@/lib/packs/math/skills';
import { MATH_MOUNTAIN_STRUCTURES, MATH_MOUNTAIN_CLUSTERS } from '@/lib/world/branchMaps';
import { ZONE_COMPLETION_TARGET } from '@/lib/world/zoneProgress';
import MathMountainScene from './MathMountainScene';

export const dynamic = 'force-dynamic';

export interface MathMountainStructureState {
  unlocked: boolean;
  completed: boolean;
  correctCount: number;
  target: number;
  prereqDisplay: string;
}

export default async function MathMountainPage({
  searchParams,
}: {
  searchParams: { learner?: string };
}) {
  const db = createServiceClient();
  const learnerId = await resolveLearnerId(db, searchParams.learner);
  if (!learnerId) {
    return <div className="p-6">No learner found.</div>;
  }

  const { data: progress } = await db
    .from('skill_progress')
    .select('mastery_state, skill:skill_id(code)')
    .eq('learner_id', learnerId);
  const mastered = new Set(
    (progress ?? [])
      .filter((p: any) => p.mastery_state === 'mastered')
      .map((p: any) => p.skill.code),
  );

  const { data: attemptRows } = await db
    .from('attempt')
    .select('outcome, item:item_id(skill:skill_id(code))')
    .eq('learner_id', learnerId)
    .eq('outcome', 'correct');
  const correctByCode = new Map<string, number>();
  for (const row of attemptRows ?? []) {
    const code = (row as any).item?.skill?.code;
    if (!code) continue;
    correctByCode.set(code, (correctByCode.get(code) ?? 0) + 1);
  }

  const skillNameByCode = new Map(MATH_SKILLS.map(s => [s.code, s.name]));

  const structureStates: Record<string, MathMountainStructureState> = {};
  for (const s of MATH_MOUNTAIN_STRUCTURES) {
    if (!s.skillCode) continue;
    const skill = MATH_SKILLS.find(x => x.code === s.skillCode);
    const correctCount = correctByCode.get(s.skillCode) ?? 0;
    const completed = mastered.has(s.skillCode) || correctCount >= ZONE_COMPLETION_TARGET;
    // A structure is unlocked when its skill's prereqs are all mastered.
    const unmetPrereqs = skill
      ? skill.prereqSkillCodes.filter(c => !mastered.has(c))
      : [];
    const unlocked = unmetPrereqs.length === 0;
    structureStates[s.code] = {
      unlocked,
      completed,
      correctCount,
      target: ZONE_COMPLETION_TARGET,
      prereqDisplay: unlocked
        ? ''
        : `Finish ${unmetPrereqs.map(c => skillNameByCode.get(c) ?? c).join(', ')} first`,
    };
  }

  return (
    <MathMountainScene
      learnerId={learnerId}
      structures={MATH_MOUNTAIN_STRUCTURES}
      clusters={MATH_MOUNTAIN_CLUSTERS}
      structureStates={structureStates}
    />
  );
}
```

- [ ] **Step 2: Write the client scene `app/(child)/garden/math-mountain/MathMountainScene.tsx`**

```tsx
// app/(child)/garden/math-mountain/MathMountainScene.tsx
//
// Math Mountain client scene. SVG-based, 14:8 aspect, hand-illustrated
// in the same vocabulary as the central garden. Background composition
// (sky, big central peak, plateau, foothill meadow) is laid in here
// using the same illustration components.
//
// Structures within Math Mountain unlock based on their skill prereqs.
// Locked structures are visible-but-ghosted with a tap-to-show prereq
// message.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MapStructure } from '@/lib/world/gardenMap';
import type { BranchCluster } from '@/lib/world/branchMaps';
import { BRANCH_MAP_WIDTH, BRANCH_MAP_HEIGHT } from '@/lib/world/branchMaps';
import BranchSceneLayout from '@/components/child/garden/BranchSceneLayout';
import {
  Tree, PineTree, Flower, GrassTuft,
} from '@/components/child/garden/illustrations';
import type { MathMountainStructureState } from './page';

interface MathMountainSceneProps {
  learnerId: string;
  structures: MapStructure[];
  clusters: BranchCluster[];
  structureStates: Record<string, MathMountainStructureState>;
}

export default function MathMountainScene({
  learnerId, structures, clusters, structureStates,
}: MathMountainSceneProps) {
  const router = useRouter();
  const [tappedLocked, setTappedLocked] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const startSkill = async (skillCode: string) => {
    if (starting) return;
    setStarting(true);
    const res = await fetch('/api/session/start', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ learnerId, skillCode }),
    });
    const { sessionId } = await res.json();
    router.push(`/lesson/${sessionId}`);
  };

  const onStructureTap = (s: MapStructure) => {
    const state = structureStates[s.code];
    if (!state?.unlocked) {
      setTappedLocked(s.code);
      window.setTimeout(() => setTappedLocked(null), 2500);
      return;
    }
    if (s.skillCode) startSkill(s.skillCode);
  };

  return (
    <BranchSceneLayout learnerId={learnerId} title="Math Mountain" iconEmoji="⛰️">
      <svg
        viewBox={`0 0 ${BRANCH_MAP_WIDTH} ${BRANCH_MAP_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'manipulation' }}
      >
        {/* Sky → meadow gradient (alpine palette) */}
        <defs>
          <linearGradient id="mmSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#DCE3F0" />
            <stop offset="38%" stopColor="#E6DFFF" />
            <stop offset="55%" stopColor="#F6EAD4" />
            <stop offset="100%" stopColor="#CEE3B4" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="mmMeadow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D7EFB9" />
            <stop offset="55%" stopColor="#AED29A" />
            <stop offset="100%" stopColor="#8EB98A" />
          </linearGradient>
        </defs>
        <rect width={BRANCH_MAP_WIDTH} height={BRANCH_MAP_HEIGHT * 0.55} fill="url(#mmSky)" />
        <rect width={BRANCH_MAP_WIDTH} height={BRANCH_MAP_HEIGHT} fill="url(#mmMeadow)" opacity="0.95" />

        {/* Central peak — bigger Fuji silhouette than central garden */}
        <g opacity="0.9">
          <path
            d="M 540 360 Q 640 240 720 60 Q 740 40 760 60 Q 840 240 940 360 Z"
            fill="#7B8AAA"
          />
          <path
            d="M 690 110 Q 720 64 740 60 Q 760 64 790 110 Q 776 108 766 118 Q 754 102 744 118 Q 732 108 720 120 Q 706 112 690 110 Z"
            fill="#FBF8ED"
          />
          {/* Side peaks */}
          <path d="M 80 340 Q 200 200 320 340 Z" fill="#A3ACC8" opacity="0.85" />
          <path d="M 1100 340 Q 1220 220 1360 340 Z" fill="#A3ACC8" opacity="0.85" />
        </g>

        {/* Layered hills */}
        <path
          d={`M 0 ${BRANCH_MAP_HEIGHT * 0.50} Q 220 ${BRANCH_MAP_HEIGHT * 0.42} 460 ${BRANCH_MAP_HEIGHT * 0.48} T 900 ${BRANCH_MAP_HEIGHT * 0.45} T ${BRANCH_MAP_WIDTH} ${BRANCH_MAP_HEIGHT * 0.49} L ${BRANCH_MAP_WIDTH} ${BRANCH_MAP_HEIGHT * 0.62} L 0 ${BRANCH_MAP_HEIGHT * 0.62} Z`}
          fill="#A3BEA2" opacity="0.7"
        />
        <path
          d={`M 0 ${BRANCH_MAP_HEIGHT * 0.58} Q 300 ${BRANCH_MAP_HEIGHT * 0.50} 640 ${BRANCH_MAP_HEIGHT * 0.56} T ${BRANCH_MAP_WIDTH} ${BRANCH_MAP_HEIGHT * 0.53} L ${BRANCH_MAP_WIDTH} ${BRANCH_MAP_HEIGHT * 0.7} L 0 ${BRANCH_MAP_HEIGHT * 0.7} Z`}
          fill="#8AAF84" opacity="0.7"
        />

        {/* Decorative trees + grass to soften the cluster spaces */}
        <Tree x={60}   y={580} size={70} />
        <PineTree x={1380} y={580} size={70} />
        <Tree x={1380} y={680} size={56} />
        <PineTree x={60}  y={680} size={56} />
        <GrassTuft x={500} y={770} size={20} />
        <GrassTuft x={900} y={780} size={20} />
        <Flower x={420} y={760} size={16} />
        <Flower x={1020} y={760} size={16} />

        {/* Cluster labels */}
        {clusters.map(c => {
          // Average position of cluster's structures, used as anchor.
          const members = c.structureCodes
            .map(code => structures.find(s => s.code === code))
            .filter((s): s is MapStructure => !!s);
          if (members.length === 0) return null;
          const avgX = members.reduce((a, s) => a + s.x, 0) / members.length;
          const avgY = members.reduce((a, s) => a + s.y, 0) / members.length;
          return (
            <g key={c.code} pointerEvents="none">
              <rect
                x={avgX - 90} y={avgY - 110} width={180} height={20} rx={10}
                fill="rgba(255,250,242,0.55)" stroke="#95876a" strokeDasharray="3 2" strokeWidth={1}
              />
              <text
                x={avgX} y={avgY - 96} textAnchor="middle"
                fontSize={11} fontWeight={700} fill="#6b4423"
                style={{ letterSpacing: '1.2px', textTransform: 'uppercase' }}
              >
                {c.label}
              </text>
            </g>
          );
        })}

        {/* Structures */}
        {structures.map(s => {
          const state = structureStates[s.code];
          const completed = state?.completed ?? false;
          const unlocked = state?.unlocked ?? false;
          const isTappedLocked = tappedLocked === s.code;
          return (
            <g
              key={s.code}
              transform={`translate(${s.x}, ${s.y})`}
              style={{ cursor: 'pointer', touchAction: 'manipulation' }}
              onClick={() => onStructureTap(s)}
            >
              {/* hit area — meets 60pt min */}
              <circle r={Math.max(s.size * 0.7, 30)} fill="transparent" />
              <text
                textAnchor="middle"
                fontSize={s.size * 0.7}
                opacity={unlocked ? 1 : 0.35}
                style={{
                  filter: completed
                    ? 'drop-shadow(0 0 6px rgba(255, 217, 61, 0.6))'
                    : unlocked
                      ? 'drop-shadow(0 1px 2px rgba(107,68,35,0.4))'
                      : 'grayscale(0.7)',
                }}
              >
                {s.themeEmoji}
              </text>
              <rect
                x={-50} y={s.size * 0.45} width={100} height={16} rx={4}
                fill={completed ? 'rgba(255,217,61,0.85)' : 'rgba(255,250,242,0.85)'}
              />
              <text
                x={0} y={s.size * 0.55 + 6} textAnchor="middle"
                fontSize={9} fontWeight={600} fill="#6b4423"
              >
                {s.label}
              </text>
              {isTappedLocked && state && (
                <g>
                  <rect
                    x={-90} y={-s.size * 0.9} width={180} height={28} rx={6}
                    fill="#fffaf2" stroke="#c38d9e" strokeWidth={1.5}
                  />
                  <text
                    x={0} y={-s.size * 0.7 + 4} textAnchor="middle"
                    fontSize={10} fontStyle="italic" fill="#6b4423"
                  >
                    {state.prereqDisplay}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </BranchSceneLayout>
  );
}
```

- [ ] **Step 3: Sanity-build to make sure it compiles**

```bash
npx next build 2>&1 | head -40
```

Expected: build succeeds (or fails only with errors unrelated to math-mountain). If math-mountain-related errors, fix imports/types.

- [ ] **Step 4: Commit**

```bash
git add app/\(child\)/garden/math-mountain/
git commit -m "feat(garden): Math Mountain branch scene"
```

---

## Task 12: Reading Forest page + scene

**Why:** §7 of the spec. Same shape as Math Mountain but with forest aesthetic and reading skill data.

**Files:**
- Create: `app/(child)/garden/reading-forest/page.tsx`
- Create: `app/(child)/garden/reading-forest/ReadingForestScene.tsx`

- [ ] **Step 1: Write the server page**

```tsx
// app/(child)/garden/reading-forest/page.tsx
//
// Reading Forest server component — mirrors Math Mountain. Same data-
// fetch pattern, different skill catalog and structure list.

import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import { READING_SKILLS } from '@/lib/packs/reading/skills';
import { READING_FOREST_STRUCTURES, READING_FOREST_CLUSTERS } from '@/lib/world/branchMaps';
import { ZONE_COMPLETION_TARGET } from '@/lib/world/zoneProgress';
import ReadingForestScene from './ReadingForestScene';

export const dynamic = 'force-dynamic';

export interface ReadingForestStructureState {
  unlocked: boolean;
  completed: boolean;
  correctCount: number;
  target: number;
  prereqDisplay: string;
}

export default async function ReadingForestPage({
  searchParams,
}: {
  searchParams: { learner?: string };
}) {
  const db = createServiceClient();
  const learnerId = await resolveLearnerId(db, searchParams.learner);
  if (!learnerId) {
    return <div className="p-6">No learner found.</div>;
  }

  const { data: progress } = await db
    .from('skill_progress')
    .select('mastery_state, skill:skill_id(code)')
    .eq('learner_id', learnerId);
  const mastered = new Set(
    (progress ?? [])
      .filter((p: any) => p.mastery_state === 'mastered')
      .map((p: any) => p.skill.code),
  );

  const { data: attemptRows } = await db
    .from('attempt')
    .select('outcome, item:item_id(skill:skill_id(code))')
    .eq('learner_id', learnerId)
    .eq('outcome', 'correct');
  const correctByCode = new Map<string, number>();
  for (const row of attemptRows ?? []) {
    const code = (row as any).item?.skill?.code;
    if (!code) continue;
    correctByCode.set(code, (correctByCode.get(code) ?? 0) + 1);
  }

  const skillNameByCode = new Map(READING_SKILLS.map(s => [s.code, s.name]));

  const structureStates: Record<string, ReadingForestStructureState> = {};
  for (const s of READING_FOREST_STRUCTURES) {
    if (!s.skillCode) continue;
    const skill = READING_SKILLS.find(x => x.code === s.skillCode);
    const correctCount = correctByCode.get(s.skillCode) ?? 0;
    const completed = mastered.has(s.skillCode) || correctCount >= ZONE_COMPLETION_TARGET;
    const unmetPrereqs = skill
      ? skill.prereqSkillCodes.filter(c => !mastered.has(c))
      : [];
    const unlocked = unmetPrereqs.length === 0;
    structureStates[s.code] = {
      unlocked,
      completed,
      correctCount,
      target: ZONE_COMPLETION_TARGET,
      prereqDisplay: unlocked
        ? ''
        : `Finish ${unmetPrereqs.map(c => skillNameByCode.get(c) ?? c).join(', ')} first`,
    };
  }

  return (
    <ReadingForestScene
      learnerId={learnerId}
      structures={READING_FOREST_STRUCTURES}
      clusters={READING_FOREST_CLUSTERS}
      structureStates={structureStates}
    />
  );
}
```

- [ ] **Step 2: Write the client scene**

```tsx
// app/(child)/garden/reading-forest/ReadingForestScene.tsx
//
// Reading Forest client scene. Forest aesthetic — woodland canopy,
// dappled light, an old oak in the NE morphology grove. Same
// structure-tap behavior as MathMountainScene.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MapStructure } from '@/lib/world/gardenMap';
import type { BranchCluster } from '@/lib/world/branchMaps';
import { BRANCH_MAP_WIDTH, BRANCH_MAP_HEIGHT } from '@/lib/world/branchMaps';
import BranchSceneLayout from '@/components/child/garden/BranchSceneLayout';
import { Tree, PineTree, Flower, GrassTuft } from '@/components/child/garden/illustrations';
import type { ReadingForestStructureState } from './page';

interface ReadingForestSceneProps {
  learnerId: string;
  structures: MapStructure[];
  clusters: BranchCluster[];
  structureStates: Record<string, ReadingForestStructureState>;
}

export default function ReadingForestScene({
  learnerId, structures, clusters, structureStates,
}: ReadingForestSceneProps) {
  const router = useRouter();
  const [tappedLocked, setTappedLocked] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const startSkill = async (skillCode: string) => {
    if (starting) return;
    setStarting(true);
    const res = await fetch('/api/session/start', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ learnerId, skillCode }),
    });
    const { sessionId } = await res.json();
    router.push(`/lesson/${sessionId}`);
  };

  const onStructureTap = (s: MapStructure) => {
    const state = structureStates[s.code];
    if (!state?.unlocked) {
      setTappedLocked(s.code);
      window.setTimeout(() => setTappedLocked(null), 2500);
      return;
    }
    if (s.skillCode) startSkill(s.skillCode);
  };

  return (
    <BranchSceneLayout learnerId={learnerId} title="Reading Forest" iconEmoji="🌲">
      <svg
        viewBox={`0 0 ${BRANCH_MAP_WIDTH} ${BRANCH_MAP_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'manipulation' }}
      >
        <defs>
          <linearGradient id="rfSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8E4BE" />
            <stop offset="40%" stopColor="#B8D4A8" />
            <stop offset="100%" stopColor="#7BA46F" />
          </linearGradient>
          <radialGradient id="rfDapple" cx="50%" cy="20%" r="60%">
            <stop offset="0%" stopColor="#FFF5D0" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFF5D0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={BRANCH_MAP_WIDTH} height={BRANCH_MAP_HEIGHT} fill="url(#rfSky)" />
        <rect width={BRANCH_MAP_WIDTH} height={BRANCH_MAP_HEIGHT} fill="url(#rfDapple)" />

        {/* Layered tree silhouettes — dense across the back */}
        {[60, 220, 380, 540, 700, 860, 1020, 1180, 1340].map((x, i) => (
          <g key={`bg-${i}`} opacity="0.6">
            <ellipse cx={x} cy={140} rx={70} ry={50} fill="#6B8E5A" />
            <rect x={x - 4} y={170} width={8} height={20} fill="#6b4423" />
          </g>
        ))}

        {/* Big oak in NE morphology grove */}
        <g>
          <ellipse cx={1190} cy={520} rx={130} ry={90} fill="#4a6c3f" stroke="#6b4423" strokeWidth={2} />
          <rect x={1185} y={580} width={12} height={50} fill="#6b4423" />
        </g>

        {/* Decorative middle-distance trees + flora */}
        <Tree x={120} y={620} size={80} />
        <PineTree x={1370} y={680} size={70} />
        <Tree x={300} y={680} size={60} />
        <PineTree x={460} y={620} size={56} />
        <GrassTuft x={500} y={760} size={22} />
        <GrassTuft x={900} y={770} size={22} />
        <Flower x={400} y={750} size={16} />
        <Flower x={1000} y={760} size={16} />

        {/* Phonics path winding through */}
        <path
          d="M 480 360 Q 540 280 700 220 Q 860 180 1100 220 Q 1200 240 1280 280"
          stroke="#EAD2A8" strokeWidth={28} fill="none" strokeLinecap="round" opacity={0.85}
        />
        <path
          d="M 480 360 Q 540 280 700 220 Q 860 180 1100 220 Q 1200 240 1280 280"
          stroke="#F7E6C4" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.7}
        />

        {/* Cluster labels */}
        {clusters.map(c => {
          const members = c.structureCodes
            .map(code => structures.find(s => s.code === code))
            .filter((s): s is MapStructure => !!s);
          if (members.length === 0) return null;
          const avgX = members.reduce((a, s) => a + s.x, 0) / members.length;
          const avgY = members.reduce((a, s) => a + s.y, 0) / members.length;
          return (
            <g key={c.code} pointerEvents="none">
              <rect
                x={avgX - 90} y={avgY - 110} width={180} height={20} rx={10}
                fill="rgba(255,250,242,0.55)" stroke="#95876a" strokeDasharray="3 2" strokeWidth={1}
              />
              <text
                x={avgX} y={avgY - 96} textAnchor="middle"
                fontSize={11} fontWeight={700} fill="#6b4423"
                style={{ letterSpacing: '1.2px', textTransform: 'uppercase' }}
              >
                {c.label}
              </text>
            </g>
          );
        })}

        {/* Structures */}
        {structures.map(s => {
          const state = structureStates[s.code];
          const completed = state?.completed ?? false;
          const unlocked = state?.unlocked ?? false;
          const isTappedLocked = tappedLocked === s.code;
          return (
            <g
              key={s.code}
              transform={`translate(${s.x}, ${s.y})`}
              style={{ cursor: 'pointer', touchAction: 'manipulation' }}
              onClick={() => onStructureTap(s)}
            >
              <circle r={Math.max(s.size * 0.7, 30)} fill="transparent" />
              <text
                textAnchor="middle"
                fontSize={s.size * 0.7}
                opacity={unlocked ? 1 : 0.35}
                style={{
                  filter: completed
                    ? 'drop-shadow(0 0 6px rgba(255, 217, 61, 0.6))'
                    : unlocked
                      ? 'drop-shadow(0 1px 2px rgba(107,68,35,0.4))'
                      : 'grayscale(0.7)',
                }}
              >
                {s.themeEmoji}
              </text>
              <rect
                x={-50} y={s.size * 0.45} width={100} height={16} rx={4}
                fill={completed ? 'rgba(255,217,61,0.85)' : 'rgba(255,250,242,0.85)'}
              />
              <text
                x={0} y={s.size * 0.55 + 6} textAnchor="middle"
                fontSize={9} fontWeight={600} fill="#6b4423"
              >
                {s.label}
              </text>
              {isTappedLocked && state && (
                <g>
                  <rect
                    x={-90} y={-s.size * 0.9} width={180} height={28} rx={6}
                    fill="#fffaf2" stroke="#c38d9e" strokeWidth={1.5}
                  />
                  <text
                    x={0} y={-s.size * 0.7 + 4} textAnchor="middle"
                    fontSize={10} fontStyle="italic" fill="#6b4423"
                  >
                    {state.prereqDisplay}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </BranchSceneLayout>
  );
}
```

- [ ] **Step 3: Build sanity-check**

```bash
npx next build 2>&1 | head -40
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add app/\(child\)/garden/reading-forest/
git commit -m "feat(garden): Reading Forest branch scene"
```

---

## Task 13: Bunny Burrow interior page + scene

**Why:** §8.3 of the spec. The first habitat interior. Atmospheric earthy underground palette + one themed skill structure (Petal Counting → subtract within 10) + discovered/undiscovered species display.

**Files:**
- Create: `app/(child)/garden/habitat/[code]/page.tsx`
- Create: `app/(child)/garden/habitat/[code]/BunnyBurrowInterior.tsx`

- [ ] **Step 1: Write the server page (dynamic route, dispatches on `code`)**

```tsx
// app/(child)/garden/habitat/[code]/page.tsx
//
// Habitat interior dynamic route. Currently only `bunny_burrow` is
// implemented — the spec defers other interiors to Phase 2. Returns a
// 404-style fallback for unmapped habitat codes.

import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import { hasHabitatInterior, HABITAT_INTERIORS } from '@/lib/world/habitatInteriors';
import { SPECIES_CATALOG } from '@/lib/world/speciesCatalog';
import { HABITAT_CATALOG } from '@/lib/world/habitatCatalog';
import BunnyBurrowInterior from './BunnyBurrowInterior';

export const dynamic = 'force-dynamic';

export default async function HabitatInteriorPage({
  params, searchParams,
}: {
  params: { code: string };
  searchParams: { learner?: string };
}) {
  const code = params.code;
  if (!hasHabitatInterior(code)) notFound();

  const habitat = HABITAT_CATALOG.find(h => h.code === code);
  if (!habitat) notFound();

  const db = createServiceClient();
  const learnerId = await resolveLearnerId(db, searchParams.learner);
  if (!learnerId) {
    return <div className="p-6">No learner found.</div>;
  }

  // Which species belong to this habitat? Derived from the in-memory
  // SPECIES_CATALOG: any species whose habitatReqCodes array includes
  // this habitat's code.
  const allHabitatSpecies = SPECIES_CATALOG.filter(s =>
    s.habitatReqCodes.includes(code),
  );

  // Which of those has the learner discovered? Look up journal_entry rows.
  const { data: journalRows } = await db
    .from('journal_entry')
    .select('species:species_id(code)')
    .eq('learner_id', learnerId);
  const discoveredCodes = new Set(
    (journalRows ?? []).map((r: any) => r.species?.code).filter(Boolean),
  );

  const discoveredSpecies = allHabitatSpecies.filter(s => discoveredCodes.has(s.code));
  const undiscoveredCount = allHabitatSpecies.length - discoveredSpecies.length;

  const cfg = HABITAT_INTERIORS[code];

  // For now we only have one interior implementation — Bunny Burrow —
  // so the dispatch is hardcoded. When Phase 2 adds more, dispatch
  // becomes a switch.
  if (code === 'bunny_burrow') {
    return (
      <BunnyBurrowInterior
        learnerId={learnerId}
        themedSkillCode={cfg.themedSkillCode}
        themedStructureLabel={cfg.themedStructureLabel}
        themedStructureEmoji={cfg.themedStructureEmoji}
        discoveredSpecies={discoveredSpecies}
        undiscoveredCount={undiscoveredCount}
      />
    );
  }

  notFound();
}
```

- [ ] **Step 2: Write the Bunny Burrow scene**

```tsx
// app/(child)/garden/habitat/[code]/BunnyBurrowInterior.tsx
//
// Bunny Burrow interior — cozy, atmospheric. One themed skill structure
// in the center-back (Petal Counting), animated discovered species
// hopping in the foreground, ghost slots for undiscovered species.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { SpeciesData } from '@/lib/world/speciesCatalog';
import HabitatInteriorLayout from '@/components/child/garden/HabitatInteriorLayout';
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';

interface BunnyBurrowInteriorProps {
  learnerId: string;
  themedSkillCode: string;
  themedStructureLabel: string;
  themedStructureEmoji: string;
  discoveredSpecies: SpeciesData[];
  undiscoveredCount: number;
}

export default function BunnyBurrowInterior({
  learnerId, themedSkillCode, themedStructureLabel, themedStructureEmoji,
  discoveredSpecies, undiscoveredCount,
}: BunnyBurrowInteriorProps) {
  const router = useRouter();
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
  const [starting, setStarting] = useState(false);

  const startSkill = async () => {
    if (starting) return;
    setStarting(true);
    const res = await fetch('/api/session/start', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ learnerId, skillCode: themedSkillCode }),
    });
    const { sessionId } = await res.json();
    router.push(`/lesson/${sessionId}`);
  };

  return (
    <HabitatInteriorLayout learnerId={learnerId} title="Bunny Burrow" iconEmoji="🐰">
      <svg
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'manipulation' }}
      >
        {/* Underground earthy radial gradient */}
        <defs>
          <radialGradient id="bbGlow" cx="50%" cy="60%" r="70%">
            <stop offset="0%" stopColor="#fff5d8" />
            <stop offset="25%" stopColor="#f5d99c" />
            <stop offset="55%" stopColor="#d4a574" />
            <stop offset="90%" stopColor="#8a5a3c" />
            <stop offset="100%" stopColor="#5a3820" />
          </radialGradient>
        </defs>
        <rect width={1440} height={800} fill="url(#bbGlow)" />

        {/* Tunnel arch silhouette at top */}
        <path
          d="M 0 0 L 0 220 Q 160 110 360 80 Q 720 30 1080 80 Q 1280 110 1440 220 L 1440 0 Z"
          fill="#3a2510" opacity="0.85"
        />

        {/* Hanging roots */}
        {[180, 320, 480, 640, 800, 980, 1180, 1320].map((x, i) => (
          <path
            key={`root-${i}`}
            d={`M ${x} 80 Q ${x + 4} 130 ${x - 6} 180`}
            stroke="#6b4423" strokeWidth={1.5} fill="none" opacity={0.6}
          />
        ))}

        {/* Hanging lantern + glow */}
        <line x1={720} y1={80} x2={720} y2={170} stroke="#6b4423" strokeWidth={2} />
        <circle cx={720} cy={190} r={32} fill="#FFD93D" opacity={0.95} />
        <circle cx={720} cy={190} r={70} fill="#FFD93D" opacity={0.18} />

        {/* Soft floor curve */}
        <ellipse cx={720} cy={780} rx={760} ry={70} fill="#7a5034" opacity={0.7} />
        <ellipse cx={720} cy={790} rx={680} ry={45} fill="#5a3820" opacity={0.5} />

        {/* Floor decorations */}
        <text x={400} y={650} textAnchor="middle" fontSize={20}>🍂</text>
        <text x={1020} y={650} textAnchor="middle" fontSize={20}>🍄</text>
        <text x={200} y={730} textAnchor="middle" fontSize={18}>🌿</text>
        <text x={1240} y={730} textAnchor="middle" fontSize={18}>🌾</text>

        {/* Themed skill structure (center-back, glowing) */}
        <g
          transform="translate(720, 440)"
          style={{ cursor: 'pointer', touchAction: 'manipulation' }}
          onClick={startSkill}
        >
          <circle r={50} fill="transparent" />
          <text
            textAnchor="middle" fontSize={42}
            style={{ filter: 'drop-shadow(0 0 10px rgba(255, 217, 61, 0.7))' }}
          >
            {themedStructureEmoji}
          </text>
          <rect x={-70} y={36} width={140} height={20} rx={6} fill="rgba(232, 196, 147, 0.95)" />
          <text x={0} y={50} textAnchor="middle" fontSize={11} fontWeight={700} fill="#6b4423">
            {themedStructureLabel}
          </text>
        </g>

        {/* Discovered species — animated hop */}
        {discoveredSpecies.map((sp, i) => {
          const x = 280 + i * 180;
          const y = 600;
          return (
            <motion.g
              key={sp.code}
              animate={reducedMotion ? {} : { y: [0, -8, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
            >
              <text
                x={x} y={y} textAnchor="middle" fontSize={32}
                style={{ filter: 'drop-shadow(0 1px 2px rgba(107,68,35,0.5))' }}
              >
                {sp.emoji}
              </text>
              <rect x={x - 50} y={y + 12} width={100} height={16} rx={4} fill="rgba(149, 184, 143, 0.9)" />
              <text x={x} y={y + 24} textAnchor="middle" fontSize={9} fontWeight={700} fill="#fffaf2">
                {sp.commonName}
              </text>
            </motion.g>
          );
        })}

        {/* Undiscovered slots — ghost outlines */}
        {Array.from({ length: undiscoveredCount }).map((_, i) => {
          const x = 280 + (discoveredSpecies.length + i) * 180;
          const y = 600;
          return (
            <g key={`undiscovered-${i}`} opacity={0.25}>
              <text x={x} y={y} textAnchor="middle" fontSize={32} style={{ filter: 'grayscale(1)' }}>
                🐰
              </text>
              <rect x={x - 50} y={y + 12} width={100} height={16} rx={4} fill="rgba(220,210,190,0.65)" />
              <text x={x} y={y + 24} textAnchor="middle" fontSize={9} fontStyle="italic" fill="#95876a">
                ? ? ?
              </text>
            </g>
          );
        })}
      </svg>
    </HabitatInteriorLayout>
  );
}
```

- [ ] **Step 3: Build sanity-check**

```bash
npx next build 2>&1 | head -40
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add "app/(child)/garden/habitat/"
git commit -m "feat(garden): Bunny Burrow interior + dynamic habitat route"
```

---

## Task 14: Update `gardenMap.ts` — add gate + character entries

**Why:** §4 of the spec. Adds the new gate and character entries to the central garden's structure list. The `MapStructure` type needs a new `kind` to support these (`'gate' | 'character'`).

**Files:**
- Modify: `lib/world/gardenMap.ts`

- [ ] **Step 1: Update `gardenMap.ts` to extend `MapStructure` with new kinds and append the new entries**

Read the current file first to confirm it matches the patch below; then apply.

```ts
// In lib/world/gardenMap.ts:

// Extend the kind union and add optional fields for gates + characters:
export interface MapStructure {
  code: string;
  kind: 'skill' | 'habitat' | 'gate' | 'character';
  skillCode?: string;
  habitatCode?: string;
  // New: gates carry the destination branch code so the page knows where
  // to navigate when tapped + unlocked.
  branchCode?: 'math_mountain' | 'reading_forest';
  // New: characters carry which character they are; the recommendation is
  // computed in the page layer and passed in via props, not via the map.
  characterCode?: 'nana' | 'hodge' | 'signpost';
  label: string;
  subLabel?: string;
  themeEmoji: string;
  x: number;
  y: number;
  size: number;
  zone: 'reading' | 'math' | 'water' | 'meadow' | 'bunny';
}

// Append these entries to GARDEN_STRUCTURES (do not remove or move
// existing entries):

  // --- Path-edge gates (NW = Reading Forest, NE = Math Mountain) ---
  {
    code: 'gate_math_mountain',
    kind: 'gate',
    branchCode: 'math_mountain',
    label: 'to Math Mountain',
    themeEmoji: '🌿',
    x: 1410, y: 90, size: 56,
    zone: 'math',
  },
  {
    code: 'gate_reading_forest',
    kind: 'gate',
    branchCode: 'reading_forest',
    label: 'to Reading Forest',
    themeEmoji: '🌿',
    x: 30, y: 130, size: 56,
    zone: 'reading',
  },

  // --- Quick-start characters ---
  {
    code: 'char_nana_mira',
    kind: 'character',
    characterCode: 'nana',
    label: 'Nana Mira',
    themeEmoji: '👵',
    x: 200, y: 545, size: 48,    // on the cottage porch
    zone: 'meadow',
  },
  {
    code: 'char_hodge',
    kind: 'character',
    characterCode: 'hodge',
    label: 'Hodge',
    themeEmoji: '🦫',
    x: 110, y: 280, size: 44,    // on the brook bank
    zone: 'reading',
  },
  {
    code: 'char_signpost',
    kind: 'character',
    characterCode: 'signpost',
    label: 'Wanderer',
    themeEmoji: '🪧',
    x: 680, y: 510, size: 48,    // path-meadow junction
    zone: 'meadow',
  },
```

Apply via Edit tool against the existing file:

```typescript
// 1. Modify the MapStructure interface (find the existing one)
// 2. Append the 5 new entries inside the GARDEN_STRUCTURES array,
//    right before the closing `];`
```

- [ ] **Step 2: Run existing tests to confirm no regression**

```bash
npx vitest run tests/world/
```

Expected: all existing world tests still pass (arrivals, gardenLayout, branchGating, characterRotation, branchMaps, characterRecommendation).

- [ ] **Step 3: Commit**

```bash
git add lib/world/gardenMap.ts
git commit -m "feat(garden): add gate + character map entries; widen MapStructure kinds"
```

---

## Task 15: Update `GardenScene.tsx` — render gates, characters, path extensions; remove compass

**Why:** §4 of the spec. Existing layout stays; we add rendering for the new map entries (gates, characters, path-edge extensions) and remove the compass icon from the header.

**Files:**
- Modify: `app/(child)/garden/GardenScene.tsx`

- [ ] **Step 1: Read the current file to locate exact spots to modify**

```bash
npx wc -l "app/(child)/garden/GardenScene.tsx"
```

Then open it and locate:
1. The `<Link href={`/explore?learner=${learnerId}`}>...🧭</Link>` block in the header — remove it
2. The `import` line for `Link` — keep (still used by the back button)
3. The structure rendering loop in the SVG — locate and add a switch on `s.kind` so 'skill', 'habitat', 'gate', 'character' all render correctly
4. The path-overlay JSX — extend the existing main path with two new dashed extensions

- [ ] **Step 2: Apply the changes**

Apply these specific edits:

**Edit A — remove the compass icon from the header.** Find this block (around line 184):

```tsx
          <Link
            href={`/explore?learner=${learnerId}`}
            className="text-lg p-1.5 rounded-full bg-white border border-ochre"
            aria-label="compass — choose a quest"
            title="Compass"
            style={{ minWidth: 40, minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >🧭</Link>
```

Delete the entire `<Link>` block.

**Edit B — pass the new props in.** Locate the `interface StructureState` block in `GardenScene.tsx` (~line 23) and ensure it has `unlocksLabel?: string | null` (already there). Also extend the component props to receive the new fields:

```tsx
export default function GardenScene({
  learnerId,
  firstName = null,
  structureStates,
  pendingArrival,
  branchUnlock,           // NEW: { math_mountain: { unlocked, justUnlocked }, reading_forest: { ... } }
  characterRotation,      // NEW: { alertCharacterCode: 'nana' | 'hodge' | 'signpost' }
  characterRecs,          // NEW: { hodge?: { skillCode, structureLabel }, nana?: ..., signpost: [...] }
  interiorEnabledByHabitat, // NEW: Record<habitatCode, boolean>
}: {
  learnerId: string;
  firstName?: string | null;
  structureStates: Record<string, StructureState>;
  pendingArrival: SpeciesData | null;
  branchUnlock: Record<'math_mountain' | 'reading_forest', { unlocked: boolean; justUnlocked: boolean; }>;
  characterRotation: { alertCharacterCode: 'nana' | 'hodge' | 'signpost' };
  characterRecs: {
    hodge: { skillCode: string; structureLabel: string } | null;
    nana: { skillCode: string; structureLabel: string } | null;
    signpost: Array<{ skillCode: string; structureLabel: string }>;
  };
  interiorEnabledByHabitat: Record<string, boolean>;
}) {
```

**Edit C — add the path extensions.** In the path overlay block (look for `mainD = …`), add two extensions:

```tsx
            // Existing:
            const mainD = `M 360 160 C 400 280, 420 370, ...`;
            // NEW: extension off the right edge toward Math Mountain
            const mathMountainExtD = `M 1280 170 C 1340 130, 1380 110, 1430 90`;
            // NEW: extension off the left edge toward Reading Forest
            const readingForestExtD = `M 360 160 C 280 150, 180 140, 30 130`;
```

And inside the `<g>` rendering paths, add (after the inner highlight ribbon):

```tsx
            {/* New path-edge extensions (dashed when locked, solid when unlocked) */}
            <path
              d={mathMountainExtD}
              stroke={branchUnlock.math_mountain.unlocked ? '#EAD2A8' : '#A99878'}
              strokeWidth={branchUnlock.math_mountain.unlocked ? 24 : 12}
              fill="none" strokeLinecap="round"
              strokeDasharray={branchUnlock.math_mountain.unlocked ? undefined : '8 6'}
              opacity={0.85}
            />
            <path
              d={readingForestExtD}
              stroke={branchUnlock.reading_forest.unlocked ? '#EAD2A8' : '#A99878'}
              strokeWidth={branchUnlock.reading_forest.unlocked ? 24 : 12}
              fill="none" strokeLinecap="round"
              strokeDasharray={branchUnlock.reading_forest.unlocked ? undefined : '8 6'}
              opacity={0.85}
            />
```

**Edit D — render gates and characters in the structure loop.** Find the existing loop that maps `GARDEN_STRUCTURES` to clickable groups. Add branches for the new kinds:

```tsx
        {GARDEN_STRUCTURES.map(s => {
          if (s.kind === 'gate') {
            const branch = s.branchCode!;
            const u = branchUnlock[branch];
            return (
              <foreignObject
                key={s.code}
                x={s.x - 60} y={s.y - 30} width={120} height={70}
              >
                <LockedGate
                  destinationLabel={s.label.replace(/^to /, '')}
                  unlocked={u.unlocked}
                  justUnlocked={u.justUnlocked}
                  onTapWhenLocked={() => {/* no-op; LockedGate shows its own toast */}}
                  onTapWhenUnlocked={() => router.push(
                    branch === 'math_mountain'
                      ? `/garden/math-mountain?learner=${learnerId}`
                      : `/garden/reading-forest?learner=${learnerId}`
                  )}
                />
              </foreignObject>
            );
          }
          if (s.kind === 'character') {
            const code = s.characterCode!;
            const rec = code === 'hodge' ? characterRecs.hodge
              : code === 'nana' ? characterRecs.nana
              : characterRecs.signpost[0] ?? null;
            const isAlert = characterRotation.alertCharacterCode === code;
            return (
              <foreignObject
                key={s.code}
                x={s.x - 50} y={s.y - 40} width={100} height={90}
              >
                <CharacterSpot
                  characterCode={code}
                  name={s.label}
                  emoji={s.themeEmoji}
                  alert={isAlert}
                  recommendation={rec?.structureLabel ?? '…'}
                  onTap={() => {
                    if (rec?.skillCode) startSkill(rec.skillCode);
                  }}
                />
              </foreignObject>
            );
          }
          // Existing skill/habitat rendering — leave unchanged
          // ... (existing structure rendering code)
        })}
```

The existing skill/habitat rendering goes inside the same map; structure as `if (s.kind === 'gate') return ...; if (s.kind === 'character') return ...; /* else existing rendering */`.

**Edit E — add imports at the top:**

```tsx
import LockedGate from '@/components/child/garden/LockedGate';
import CharacterSpot from '@/components/child/garden/CharacterSpot';
```

- [ ] **Step 3: Build sanity-check**

```bash
npx next build 2>&1 | head -60
```

Expected: build succeeds. If type errors appear about missing props on `GardenScene`, that's expected — Task 16 wires the page to provide them.

- [ ] **Step 4: Commit**

```bash
git add "app/(child)/garden/GardenScene.tsx"
git commit -m "feat(garden): render gates, characters, path extensions; remove compass"
```

---

## Task 16: Update `app/(child)/garden/page.tsx` — compute branch unlock + character data + interior eligibility

**Why:** §5, §9, §11 of the spec. The server component now needs to:

1. Compute `branchUnlock` for both branches using `branchGating`
2. Detect "just unlocked between sessions" by comparing current state to stored `unlocked_branches`, then write the new state back
3. Pick today's alert character via `characterRotation`
4. Fetch candidate recommendations from `/api/plan/candidates` and partition via `characterRecommendation`
5. Compute `interiorEnabledByHabitat` (true for habitats where ≥1 of their species exists in `journal_entry`)

All five passed to `GardenScene` via the new props.

**Files:**
- Modify: `app/(child)/garden/page.tsx`

- [ ] **Step 1: Apply the changes**

Add at the top:

```tsx
import {
  BRANCH_GATING,
  isStructureCompletedForGating,
  isBranchUnlocked,
  type BranchCode,
} from '@/lib/world/branchGating';
import { todaysAlertCharacter } from '@/lib/world/characterRotation';
import {
  partitionRecommendations,
  type RecommendedCandidate,
} from '@/lib/world/characterRecommendation';
import { hasHabitatInterior } from '@/lib/world/habitatInteriors';
import { ZONE_COMPLETION_TARGET } from '@/lib/world/zoneProgress';
```

Inside `GardenPage` after the existing data fetches (specifically: after `correctByCode` and `mastered` are built, and after `worldStateRow` is fetched), add:

```tsx
  // ─── Branch unlock state ─────────────────────────────────────────
  const isCompleted = (structureCode: string) =>
    isStructureCompletedForGating(
      structureCode, GARDEN_STRUCTURES, correctByCode, mastered, ZONE_COMPLETION_TARGET,
    );
  const branchCodes: BranchCode[] = ['math_mountain', 'reading_forest'];
  const previouslyUnlocked = new Set<string>(
    (worldStateRow?.garden as Record<string, any> | null)?.unlocked_branches ?? [],
  );
  const nowUnlocked = new Set<string>();
  const branchUnlock: Record<BranchCode, { unlocked: boolean; justUnlocked: boolean }> = {
    math_mountain: { unlocked: false, justUnlocked: false },
    reading_forest: { unlocked: false, justUnlocked: false },
  };
  for (const code of branchCodes) {
    const unlocked = isBranchUnlocked(code, isCompleted);
    const justUnlocked = unlocked && !previouslyUnlocked.has(code);
    branchUnlock[code] = { unlocked, justUnlocked };
    if (unlocked) nowUnlocked.add(code);
  }

  // Persist newly-unlocked branches so the just-unlocked animation
  // only fires once. We only write if the set changed (avoids
  // unnecessary writes on every load).
  const newlyUnlocked = [...nowUnlocked].filter(c => !previouslyUnlocked.has(c));
  if (newlyUnlocked.length > 0) {
    const updatedGarden = {
      ...(worldStateRow?.garden as Record<string, any> | null ?? {}),
      unlocked_branches: [...previouslyUnlocked, ...newlyUnlocked],
    };
    await db.from('world_state')
      .update({ garden: updatedGarden })
      .eq('learner_id', learnerId);
  }

  // ─── Character rotation + recommendations ───────────────────────
  const alertCharacterCode = todaysAlertCharacter(learnerId);

  // Fetch engine candidates. The /api/plan/candidates endpoint accepts
  // ?learner=... and returns { candidates: [...] }.
  //
  // NOTE: server-side self-fetch needs an absolute URL. NEXT_PUBLIC_BASE_URL
  // is documented as the env for this in the genetic-variants-portal project
  // (and the same pattern is recommended here). If that env is unset in
  // production, fall back to VERCEL_URL with https:// prefix. If the
  // implementer encounters self-fetch issues in prod, the cleaner fix is to
  // refactor /api/plan/candidates into a shared lib function and import it
  // directly here — a separate task, not in scope for this plan.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const candidatesRes = await fetch(
    `${baseUrl}/api/plan/candidates?learner=${learnerId}`,
    { cache: 'no-store' },
  );
  const { candidates = [] } = (await candidatesRes.json()) as { candidates: RecommendedCandidate[] };
  const partitioned = partitionRecommendations(candidates);

  // The renderer wants {skillCode, structureLabel}; map from the candidate's
  // `title` field which is already the human label.
  const characterRecs = {
    hodge: partitioned.hodge ? { skillCode: partitioned.hodge.skillCode, structureLabel: partitioned.hodge.title } : null,
    nana: partitioned.nana ? { skillCode: partitioned.nana.skillCode, structureLabel: partitioned.nana.title } : null,
    signpost: partitioned.signpost.map(c => ({ skillCode: c.skillCode, structureLabel: c.title })),
  };

  // ─── Habitat interior eligibility ────────────────────────────────
  // For each built habitat that has an implemented interior, check if
  // any of its species is in the learner's journal.
  const journalCodes = new Set(
    (await db.from('journal_entry').select('species:species_id(code)').eq('learner_id', learnerId))
      .data?.map((r: any) => r.species?.code).filter(Boolean) ?? [],
  );
  const interiorEnabledByHabitat: Record<string, boolean> = {};
  for (const habitat of HABITAT_CATALOG) {
    if (!hasHabitatInterior(habitat.code)) continue;
    if (!builtSet.has(habitat.code)) continue;
    const habitatSpecies = SPECIES_CATALOG.filter(s => s.habitatReqCodes.includes(habitat.code));
    interiorEnabledByHabitat[habitat.code] = habitatSpecies.some(s => journalCodes.has(s.code));
  }
```

Then update the `<GardenScene>` invocation to pass the new props:

```tsx
  return (
    <GardenScene
      learnerId={learnerId}
      firstName={firstName}
      structureStates={structureStates}
      pendingArrival={pendingArrival}
      branchUnlock={branchUnlock}
      characterRotation={{ alertCharacterCode }}
      characterRecs={characterRecs}
      interiorEnabledByHabitat={interiorEnabledByHabitat}
    />
  );
```

Also at the top of the file, add an import for SPECIES_CATALOG if not already present:

```tsx
import { SPECIES_CATALOG } from '@/lib/world/speciesCatalog';
```

- [ ] **Step 2: Build + dev sanity-check**

```bash
npx next build 2>&1 | head -60
```

Expected: build succeeds, no type errors.

- [ ] **Step 3: Commit**

```bash
git add "app/(child)/garden/page.tsx"
git commit -m "feat(garden): wire branch unlock, character rotation, interior eligibility"
```

---

## Task 17: Update `SpeciesDetailModal.tsx` and `ArrivalCard.tsx` — invitation flow

**Why:** §8 of the spec. Once an interior is enabled, the species-info modal gets a "step inside →" button. Also, when the FIRST species arrives at a habitat, the arrival card includes invitation copy + a step-inside CTA.

**Files:**
- Modify: `components/child/SpeciesDetailModal.tsx`
- Modify: `components/child/garden/ArrivalCard.tsx`

- [ ] **Step 1: Read both files first**

```bash
npx wc -l components/child/SpeciesDetailModal.tsx components/child/garden/ArrivalCard.tsx
```

- [ ] **Step 2: Add `interiorHabitatCode` prop + step-inside button to `SpeciesDetailModal.tsx`**

Add to the props interface:

```tsx
interface SpeciesDetailModalProps {
  // existing props...
  interiorHabitatCode?: string | null;   // NEW: when present, render the "step inside" CTA
  learnerId?: string;                    // NEW: needed to construct the URL
}
```

In the JSX, after the main content area but before the close button, add:

```tsx
        {interiorHabitatCode && learnerId && (
          <a
            href={`/garden/habitat/${interiorHabitatCode}?learner=${learnerId}`}
            className="block w-full mt-4 text-center rounded-2xl px-4 py-3 font-display text-bark border-4 border-sage bg-sage/10 hover:bg-sage/20"
            style={{ minHeight: 60, fontWeight: 600, touchAction: 'manipulation' }}
          >
            <span className="text-xl mr-2" aria-hidden>🚪</span>
            step inside →
          </a>
        )}
```

In `GardenScene.tsx`, the existing habitat-tap path already calls `setSelected(s)` to open the modal (search for the `// Built → open info modal` comment in `onStructureTap`). Where the modal is rendered (search for `<SpeciesDetailModal` — currently it may be rendered conditionally on `selected`), add the two new props by reading from the new `interiorEnabledByHabitat` prop on `GardenScene`:

```tsx
{selected && selected.kind === 'habitat' && selected.habitatCode && (
  <SpeciesDetailModal
    /* existing props */
    interiorHabitatCode={
      interiorEnabledByHabitat[selected.habitatCode] ? selected.habitatCode : null
    }
    learnerId={learnerId}
  />
)}
```

If `SpeciesDetailModal` is currently rendered for a different shape (e.g., for skill structures too), gate the new props inside the JSX so they're only added for habitats — never for skills.

- [ ] **Step 3: Add invitation copy + step-inside CTA to `ArrivalCard.tsx`**

Add to the props interface:

```tsx
export default function ArrivalCard({
  species,
  learnerId,
  onDismiss,
  isFirstForHabitat = false,         // NEW
  habitatCode = null,                // NEW (the habitat the species arrived at, when first)
}: {
  species: SpeciesData;
  learnerId: string;
  onDismiss: () => void;
  isFirstForHabitat?: boolean;
  habitatCode?: string | null;
})
```

In the JSX content, after the existing welcome text but before the dismiss button, conditionally render:

```tsx
        {isFirstForHabitat && habitatCode && (
          <div className="mt-4 text-center">
            <p
              className="font-display italic text-[18px] text-bark/85 leading-snug"
              style={{ fontWeight: 500 }}
            >
              the {species.commonName.toLowerCase()} says — come visit me inside!
            </p>
            <a
              href={`/garden/habitat/${habitatCode}?learner=${learnerId}`}
              onClick={() => { /* navigation supersedes onDismiss */ }}
              className="inline-block mt-3 rounded-2xl px-5 py-3 font-display text-white bg-sage border-4 border-sage"
              style={{ minHeight: 60, fontWeight: 600, touchAction: 'manipulation' }}
            >
              <span className="text-xl mr-2" aria-hidden>🚪</span>
              step inside →
            </a>
          </div>
        )}
```

Note: the new copy "come visit me inside!" passes the language lint (no "great job", no "good job", no coins, etc.). Verify by running the lint test in Step 5.

- [ ] **Step 4: Wire `isFirstForHabitat` and `habitatCode` from the page**

In `app/(child)/garden/page.tsx` where `pendingArrival` is computed, derive whether this is the first arrival for its habitat:

```tsx
  let pendingArrivalIsFirstForHabitat = false;
  let pendingArrivalHabitatCode: string | null = null;
  if (pendingArrival) {
    // The species's habitatReqCodes is an array — find a habitat the
    // learner has built that's also in that array. (For the first push
    // we only care about bunny_burrow; the lookup naturally returns
    // the right habitat for any species in the catalog.)
    pendingArrivalHabitatCode = pendingArrival.habitatReqCodes
      .find(c => builtSet.has(c)) ?? null;
    if (pendingArrivalHabitatCode) {
      // Count how many species in this habitat the learner has already
      // discovered. If it's exactly 1 (this species, just arrived), it's
      // the first.
      const habitatSpeciesCodes = SPECIES_CATALOG
        .filter(s => s.habitatReqCodes.includes(pendingArrivalHabitatCode!))
        .map(s => s.code);
      const discoveredFromThisHabitat = habitatSpeciesCodes.filter(c => journalCodes.has(c));
      // The arriving species hasn't been written to journal yet (the
      // arrival modal does that on dismiss), so "first" = no existing
      // discoveries for this habitat.
      pendingArrivalIsFirstForHabitat = discoveredFromThisHabitat.length === 0;
    }
  }
```

Then pass into `<GardenScene>` (which then passes to `<ArrivalCard>`):

```tsx
      pendingArrivalIsFirstForHabitat={pendingArrivalIsFirstForHabitat}
      pendingArrivalHabitatCode={pendingArrivalHabitatCode}
```

In `GardenScene.tsx`, add these props to the interface and forward into `<ArrivalCard>`:

```tsx
        <ArrivalCard
          species={arrival}
          learnerId={learnerId}
          onDismiss={() => setArrival(null)}
          isFirstForHabitat={pendingArrivalIsFirstForHabitat}
          habitatCode={pendingArrivalHabitatCode}
        />
```

- [ ] **Step 5: Run lint test**

```bash
npx vitest run tests/child-language.test.ts
```

Expected: still passes — the new copy ("come visit me inside!") doesn't include any banned terms.

- [ ] **Step 6: Build sanity-check**

```bash
npx next build 2>&1 | head -40
```

Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add components/child/SpeciesDetailModal.tsx components/child/garden/ArrivalCard.tsx \
        components/child/garden/GardenScene.tsx "app/(child)/garden/page.tsx"
git commit -m "feat(garden): habitat invitation flow — first-arrival CTA + step-inside button"
```

---

## Task 18: Delete `/explore` route + clean up references

**Why:** §10 of the spec. `/explore` is replaced by the in-world quick-start characters. All references must be updated.

**Files:**
- Delete: `app/(child)/explore/page.tsx`
- Delete: `app/(child)/explore/ExploreClient.tsx`
- Delete: `app/(child)/explore/ExploreHeader.tsx`
- Modify: `app/(child)/complete/[sessionId]/CompleteActions.tsx`
- Modify: `tests/e2e/first-lesson.spec.ts`
- Modify: `tests/e2e/first-reading-lesson.spec.ts`

- [ ] **Step 1: Delete the `/explore` route directory**

```bash
rm -r "app/(child)/explore"
```

- [ ] **Step 2: Update `CompleteActions.tsx`**

Replace line 16:

```tsx
    { href: `/explore?learner=${learnerId}`, emoji: '🧭', label: 'another quest' },
```

With:

```tsx
    { href: `/garden?learner=${learnerId}`, emoji: '🌿', label: 'back to garden' },
```

(Remove the now-redundant first row since both rows would point to /garden — keep only the original first row at line 15: `{ href: \`/garden?learner=${learnerId}\`, emoji: '🌿', label: 'garden', primary: true },` and delete the line that previously linked to /explore.)

So the `actions` array becomes:

```tsx
  const actions: ActionDef[] = [
    { href: `/garden?learner=${learnerId}`, emoji: '🌿', label: 'garden',   primary: true },
    { href: `/journal?learner=${learnerId}`, emoji: '📖', label: 'journal' },
    { href: '/picker', emoji: '🏡', label: 'home' },
  ];
```

The grid is now 3 buttons instead of 4. The existing `grid-cols-2` will lay them out as 2 + 1; consider switching to `grid-cols-1` for a clean stacked column on the completion screen, but this is optional polish.

- [ ] **Step 3: Update both e2e tests to remove the `/explore` URL assertion**

`tests/e2e/first-lesson.spec.ts` — find:

```ts
  await expect(page).toHaveURL(/\/explore/);
  await page.waitForLoadState('networkidle');
```

Replace with:

```ts
  await expect(page).toHaveURL(/\/garden/);
  await page.waitForLoadState('networkidle');
```

Also update the click target — the test expects to find a clickable card after the URL change. The garden's structures are SVG `<g>` elements with click handlers, not HTML `<button>` elements. Update the click logic:

```ts
  // Find a clickable structure in the garden — the alert character is
  // a simple, reliably-tappable affordance.
  const alertCharacter = page.locator('[data-state="awake"]').first();
  await expect(alertCharacter).toBeVisible({ timeout: 10_000 });
  await alertCharacter.click();
```

`tests/e2e/first-reading-lesson.spec.ts` — apply the equivalent change.

- [ ] **Step 4: Run all unit tests to confirm no regressions**

```bash
npx vitest run
```

Expected: all unit + component tests pass (the new ones from Tasks 2–8, plus the existing ones).

- [ ] **Step 5: Run lint test**

```bash
npx vitest run tests/child-language.test.ts
```

Expected: pass.

- [ ] **Step 6: Run a build to confirm no broken imports**

```bash
npx next build 2>&1 | head -60
```

Expected: build succeeds. If "Cannot find module" errors mention `/explore`, search and remove leftover references.

```bash
npx grep -rn "/explore" "app/" "components/" "lib/" "tests/" 2>/dev/null
```

Expected: zero results.

- [ ] **Step 7: Commit**

```bash
git add -u
git commit -m "feat(garden): delete /explore route and clean up all references"
```

---

## Task 19: New E2E test — full happy path

**Why:** §16.3 of the spec. Verifies the whole world-navigation flow end to end: locked gate → seed completion → unlock animation → branch scene → start a session → return → tap character → bunny burrow interior + invitation.

**Files:**
- Create: `tests/e2e/world-navigation.spec.ts`

- [ ] **Step 1: Write the e2e test**

The test seeds DB state directly (per the spec note, playing 30+ items is impractical for an e2e test). It uses Postgres directly via `postgres` (already a dev dep).

```ts
// tests/e2e/world-navigation.spec.ts
//
// End-to-end happy path for the world navigation overhaul: confirms
// that the branch gate unlocks after seeding completion of starter
// structures, the branch scene renders, and the bunny burrow invitation
// flow surfaces a step-inside CTA.

import { test, expect } from '@playwright/test';
import postgres from 'postgres';

// The project uses Supabase. For e2e seeding we connect directly to the
// underlying Postgres via the same DATABASE_URL the supabase CLI uses
// (or POSTGRES_URL — confirm from .env.local). If neither is set, the
// implementer may need to add it to the playwright config's env passthrough.
const DB_URL = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';
if (!DB_URL) throw new Error('Set DATABASE_URL or POSTGRES_URL for e2e DB seeding');
const sql = postgres(DB_URL, { onnotice: () => {} });

const TEST_LEARNER_NAME = 'WorldNavTest';
const ZONE_TARGET = 10;  // matches ZONE_COMPLETION_TARGET

async function findTestLearner() {
  const rows = await sql<{ id: string }[]>`
    select id from learner where first_name = ${TEST_LEARNER_NAME} limit 1
  `;
  return rows[0]?.id ?? null;
}

async function createTestLearner() {
  const [row] = await sql<{ id: string }[]>`
    insert into learner (first_name, avatar_key, grade_level, default_challenge)
    values (${TEST_LEARNER_NAME}, 'fox', 1, 'normal')
    returning id
  `;
  // Initialize world_state so the page can update it
  await sql`insert into world_state (learner_id, garden) values (${row.id}, '{}'::jsonb)`;
  return row.id;
}

async function cleanupTestLearner(id: string) {
  await sql`delete from attempt where learner_id = ${id}`;
  await sql`delete from journal_entry where learner_id = ${id}`;
  await sql`delete from habitat where learner_id = ${id}`;
  await sql`delete from skill_progress where learner_id = ${id}`;
  await sql`delete from world_state where learner_id = ${id}`;
  await sql`delete from learner where id = ${id}`;
}

async function seedCompletion(learnerId: string, skillCode: string) {
  // Insert ZONE_TARGET correct attempts on this skill so the structure
  // is considered "completed" for branch gating.
  const skill = await sql<{ id: string }[]>`
    select id from skill where code = ${skillCode} limit 1
  `;
  if (!skill[0]) throw new Error(`Skill ${skillCode} not found`);
  const items = await sql<{ id: string }[]>`
    select id from item where skill_id = ${skill[0].id} limit 1
  `;
  if (!items[0]) throw new Error(`No item for skill ${skillCode}`);
  for (let i = 0; i < ZONE_TARGET; i++) {
    await sql`
      insert into attempt (learner_id, item_id, outcome, started_at, ended_at)
      values (${learnerId}, ${items[0].id}, 'correct', now(), now())
    `;
  }
}

test.describe('world navigation', () => {
  let learnerId: string;

  test.beforeAll(async () => {
    const existing = await findTestLearner();
    if (existing) await cleanupTestLearner(existing);
    learnerId = await createTestLearner();
  });

  test.afterAll(async () => {
    await cleanupTestLearner(learnerId);
    await sql.end();
  });

  test('locked gate → seed unlock → branch scene → step inside', async ({ page }) => {
    // 1. Garden loads with locked Math Mountain gate
    await page.goto(`/garden?learner=${learnerId}`);
    await expect(page.getByLabel(/gate locked.*Math Mountain/i)).toBeVisible({ timeout: 10_000 });

    // 2. Seed 3 of 5 starter math completions
    await seedCompletion(learnerId, 'math.counting.skip_2s');
    await seedCompletion(learnerId, 'math.add.within_20.no_crossing');
    await seedCompletion(learnerId, 'math.subtract.within_10');

    // 3. Reload — gate should be unlocked
    await page.goto(`/garden?learner=${learnerId}`);
    await expect(page.getByLabel(/path to Math Mountain/i)).toBeVisible({ timeout: 10_000 });

    // 4. Tap the unlocked gate → navigate to Math Mountain
    await page.getByLabel(/path to Math Mountain/i).click();
    await expect(page).toHaveURL(/\/garden\/math-mountain/);
    await page.waitForLoadState('networkidle');

    // 5. Confirm a known cluster label is visible
    await expect(page.getByText(/Operations Hollow/i)).toBeVisible();

    // 6. Back to garden via the back button
    await page.getByLabel(/back to garden/i).click();
    await expect(page).toHaveURL(/\/garden(\?|$)/);

    // 7. Seed a built bunny_burrow + a journal_entry for a bunny species
    //    so the interior becomes accessible.
    await sql`
      insert into habitat (learner_id, habitat_type_id)
      select ${learnerId}, id from habitat_type where code = 'bunny_burrow'
    `;
    const bunnySpecies = await sql<{ id: string; code: string }[]>`
      select id, code from species
       where 'bunny_burrow' = any(habitat_req_codes) limit 1
    `;
    expect(bunnySpecies[0]).toBeTruthy();
    await sql`
      insert into journal_entry (learner_id, species_id)
      values (${learnerId}, ${bunnySpecies[0].id})
    `;

    // 8. Reload garden → tap the bunny burrow → modal with "step inside"
    await page.goto(`/garden?learner=${learnerId}`);
    await page.getByText(/Bunny Burrow/i).first().click();
    await expect(page.getByText(/step inside/i)).toBeVisible({ timeout: 5_000 });

    // 9. Tap step inside → navigate to interior
    await page.getByText(/step inside/i).click();
    await expect(page).toHaveURL(/\/garden\/habitat\/bunny_burrow/);

    // 10. Confirm interior renders with the themed structure label
    await expect(page.getByText(/Petal Counting/i)).toBeVisible({ timeout: 10_000 });
  });
});
```

- [ ] **Step 2: Run the e2e test**

```bash
npx playwright test tests/e2e/world-navigation.spec.ts
```

Expected: pass. If it fails on the seed step, ensure `DATABASE_URL` env var is set in your `.env.local` and matches the local dev DB.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/world-navigation.spec.ts
git commit -m "test(e2e): full happy path for world navigation overhaul"
```

---

## Task 20: Final sweep — all tests + build

**Files:**
- (none — verification only)

- [ ] **Step 1: Run all unit + component tests**

```bash
npx vitest run
```

Expected: all pass.

- [ ] **Step 2: Run lint test specifically**

```bash
npx vitest run tests/child-language.test.ts
```

Expected: pass.

- [ ] **Step 3: Run e2e tests**

```bash
npx playwright test
```

Expected: all pass (including the new world-navigation test and the updated first-lesson / first-reading-lesson tests).

- [ ] **Step 4: Production build**

```bash
npx next build
```

Expected: clean build, no warnings about unused imports, no broken type errors. The new routes show up in the build output:

```
λ /garden/math-mountain
λ /garden/reading-forest
λ /garden/habitat/[code]
```

- [ ] **Step 5: Manual smoke-test in dev (optional but recommended)**

```bash
npx next start &
# Open http://localhost:3000 and:
#   - Pick a profile that already has 3+ starter math completions
#   - Confirm Math Mountain gate is unlocked
#   - Tap it → Math Mountain loads → tap an unlocked structure → session
#   - Return to garden via back button
#   - Tap the alert character → session starts
#   - Build the bunny burrow if not yet built; complete a session that
#     yields a bunny arrival; verify the invitation copy + step-inside
#     button on the arrival card
```

- [ ] **Step 6: Final commit (only if any docs/README updates emerge)**

```bash
git status
# If clean, no commit needed. If anything remains, commit it descriptively.
```

---

## Done checklist

- [ ] Migration 009 applied to local + production DBs (the user runs prod migration via the Supabase SQL editor)
- [ ] All 20 tasks complete with green tests at each step
- [ ] Final `npx next build` is clean
- [ ] Final `npx playwright test` is green
- [ ] User manually smoke-tested at least one happy path
- [ ] User opens a PR (out of plan scope)

---

## Out of scope reminders

Per spec §14, these are explicitly Phase 2 and not part of this plan:

- Other 5 habitat interiors (frog pond, bee hotel, ant hill, butterfly bush, log pile)
- Splitting Math Mountain into sub-scenes
- Cottage interior (settings + journal entry + future music corner)
- Music branch / Science branch
- Auto-scroll-as-mastered camera on Math Mountain
- Soft fade transitions between scenes
- Hidden/discoverable doorway pattern
- Luna directional wandering

If the implementer wants to make any of these "while I'm in here" decisions, they should consult the user first — these are all individually meaningful design questions per the spec.
