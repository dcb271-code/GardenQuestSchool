# Naturalist Grove — Phase 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add spaced repetition (SM-2 lite), seasonal + spacing-aware species selection, photo-role rotation, difficulty-tier escalation, and a quick-recognize retrieval-practice shortcut to the Naturalist Grove walk — so re-exposures expand over time, surface a different photo angle each time, and let fluent learners self-test.

**Architecture:** Two new pure modules — `lib/naturalist/spacing.ts` (interval/role/tier math) and `lib/world/season.ts` (month→season + seasonal catalog filter) — are unit-tested in isolation. A new spacing-aware `selectWalkSpecies()` in `lib/naturalist/walkSelection.ts` weights three buckets (50% due / 30% new / 20% wildcard) and reuses the existing `pickWalkSpecies` for within-bucket sampling. The walk API queries each learner's `flora_review` rows, feeds them to `selectWalkSpecies`, and uses per-species `exposures`/`photo_roles_seen` to choose photo tier + role; the identified API writes back `next_review_at`. The walk page gains a quick-recognize intro branch.

**Tech Stack:** Next.js 14 App Router, TypeScript 5, Supabase (`@supabase/supabase-js` v2.104, service-role client via `lib/supabase/server.ts`), Vitest + jsdom, zod, framer-motion. Alias `@/` = project root.

**Spec reference:** `docs/superpowers/specs/2026-05-29-naturalist-grove-design.md` §3 (spaced + interleaved repetition) and §6 (walk selection algorithm).

**Phase 1 + 2 landed:**
- `lib/naturalist/walkSelection.ts` → `pickWalkSpecies(pool, n, rng)` Fisher-Yates (keep — `selectWalkSpecies` calls it)
- `lib/world/floraCatalog.ts` → `FLORA_CATALOG`, `FloraData`, `PhotoRole`, `Season`
- `flora_review` columns: `id, learner_id, flora_code, exposures, last_seen_at, next_review_at, ease_factor (default 2.5), photo_roles_seen (text[])`
- `flora_photo` rows: **tier 1 only** (Phase 1 seeded just tier 1) — tier 2/3 selection MUST gracefully fall back
- Walk API: `app/api/naturalist/walk/route.ts` (picks random species, tier-1 photos)
- Identified API: `app/api/naturalist/walk/identified/route.ts` (upserts exposures, no next_review_at yet)
- Walk page: `app/(child)/naturalist/walk/page.tsx` (intro → key → reveal → done; records hardcoded `photoRole: 'whole'`)

---

## File Structure

| File | Created/Modified | Responsibility |
|---|---|---|
| `lib/naturalist/spacing.ts` | **Create** | Pure SM-2 lite: `nextReviewAt`, `isDue`, `nextRoleForExposure`, `tierForExposures`, `INTERVALS_DAYS`. |
| `tests/naturalist/spacing.test.ts` | **Create** | Interval math, role rotation, tier thresholds, due check. |
| `lib/world/season.ts` | **Create** | `currentSeason(month)` + `floraCodesInSeason(season)`. |
| `tests/world/season.test.ts` | **Create** | Month→season mapping, seasonal filter. |
| `lib/naturalist/walkSelection.ts` | **Modify** | Add `selectWalkSpecies(opts)` spacing-aware picker. Keep `pickWalkSpecies`. |
| `tests/naturalist/selectWalkSpecies.test.ts` | **Create** | Bucket weighting, dedup, season filter, fallbacks. |
| `app/api/naturalist/walk/route.ts` | **Modify** | Query `flora_review`, use `selectWalkSpecies` + tier + role rotation; add `showQuickRecognize`. |
| `app/api/naturalist/walk/identified/route.ts` | **Modify** | Set `next_review_at` via `nextReviewAt`. |
| `app/(child)/naturalist/walk/page.tsx` | **Modify** | Quick-recognize intro branch; record actual `photoRole`. |

**Test conventions:** `import { describe, it, expect } from 'vitest'`. Pure functions take injected RNG/clock so tests are deterministic. Run a single suite with `npx vitest run <path>`.

---

## Task 1: spacing.ts — SM-2 lite pure functions

**Files:**
- Create: `lib/naturalist/spacing.ts`
- Create: `tests/naturalist/spacing.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/naturalist/spacing.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  INTERVALS_DAYS,
  nextReviewAt,
  isDue,
  nextRoleForExposure,
  tierForExposures,
} from '@/lib/naturalist/spacing';

describe('spacing.INTERVALS_DAYS', () => {
  it('is the SM-2 lite ladder', () => {
    expect(INTERVALS_DAYS).toEqual([1, 3, 7, 14, 30, 60]);
  });
});

describe('spacing.nextReviewAt', () => {
  const from = new Date('2026-06-02T00:00:00.000Z');

  it('exposures=1 → +1 day', () => {
    expect(nextReviewAt(1, from).toISOString()).toBe('2026-06-03T00:00:00.000Z');
  });
  it('exposures=2 → +3 days', () => {
    expect(nextReviewAt(2, from).toISOString()).toBe('2026-06-05T00:00:00.000Z');
  });
  it('exposures=3 → +7 days', () => {
    expect(nextReviewAt(3, from).toISOString()).toBe('2026-06-09T00:00:00.000Z');
  });
  it('exposures=6 → +60 days', () => {
    expect(nextReviewAt(6, from).toISOString()).toBe('2026-08-01T00:00:00.000Z');
  });
  it('exposures beyond ladder caps at +60 days', () => {
    expect(nextReviewAt(99, from).toISOString()).toBe('2026-08-01T00:00:00.000Z');
  });
  it('exposures=0 or negative treated as first interval (+1 day)', () => {
    expect(nextReviewAt(0, from).toISOString()).toBe('2026-06-03T00:00:00.000Z');
    expect(nextReviewAt(-5, from).toISOString()).toBe('2026-06-03T00:00:00.000Z');
  });
});

describe('spacing.isDue', () => {
  const now = new Date('2026-06-02T12:00:00.000Z');
  it('null next_review_at is always due', () => {
    expect(isDue(null, now)).toBe(true);
  });
  it('past date is due', () => {
    expect(isDue(new Date('2026-06-01T00:00:00.000Z'), now)).toBe(true);
  });
  it('exact-now is due', () => {
    expect(isDue(new Date('2026-06-02T12:00:00.000Z'), now)).toBe(true);
  });
  it('future date is not due', () => {
    expect(isDue(new Date('2026-06-03T00:00:00.000Z'), now)).toBe(false);
  });
  it('accepts ISO strings too', () => {
    expect(isDue('2026-06-01T00:00:00.000Z', now)).toBe(true);
    expect(isDue('2026-06-03T00:00:00.000Z', now)).toBe(false);
  });
});

describe('spacing.nextRoleForExposure', () => {
  const roles = ['whole', 'leaf', 'bark', 'flower'] as const;

  it('prefers the first never-seen role', () => {
    expect(nextRoleForExposure(roles, ['whole'])).toBe('leaf');
    expect(nextRoleForExposure(roles, ['whole', 'leaf'])).toBe('bark');
  });
  it('returns the first role when nothing seen', () => {
    expect(nextRoleForExposure(roles, [])).toBe('whole');
  });
  it('cycles once all roles seen', () => {
    // rolesSeen length 4 → index 4 % 4 = 0 → 'whole'
    expect(nextRoleForExposure(roles, ['whole', 'leaf', 'bark', 'flower'])).toBe('whole');
    // length 5 → 5 % 4 = 1 → 'leaf'
    expect(nextRoleForExposure(roles, ['whole', 'leaf', 'bark', 'flower', 'whole'])).toBe('leaf');
  });
  it('ignores seen roles not in the species photoRoles list', () => {
    expect(nextRoleForExposure(['whole', 'leaf'], ['fruit'])).toBe('whole');
  });
  it('throws on empty photoRoles', () => {
    expect(() => nextRoleForExposure([], [])).toThrow(/photoRoles/i);
  });
});

describe('spacing.tierForExposures', () => {
  it('exposures < 3 → tier 1', () => {
    expect(tierForExposures(0)).toBe(1);
    expect(tierForExposures(2)).toBe(1);
  });
  it('3 <= exposures < 10 → tier 2', () => {
    expect(tierForExposures(3)).toBe(2);
    expect(tierForExposures(9)).toBe(2);
  });
  it('exposures >= 10 → tier 3', () => {
    expect(tierForExposures(10)).toBe(3);
    expect(tierForExposures(50)).toBe(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx vitest run tests/naturalist/spacing.test.ts`
Expected: FAIL with "Cannot find module '@/lib/naturalist/spacing'".

- [ ] **Step 3: Implement**

Create `lib/naturalist/spacing.ts`:

```ts
// lib/naturalist/spacing.ts
//
// SM-2 "lite" spacing for the Naturalist Grove module. Pure functions —
// the caller injects the clock so tests are deterministic.
//
// Design spec: docs/superpowers/specs/2026-05-29-naturalist-grove-design.md §6

// Expanding review ladder, in days. exposures=1 → INTERVALS_DAYS[0], etc.
export const INTERVALS_DAYS = [1, 3, 7, 14, 30, 60] as const;

// Given how many times a learner has now identified a species, returns
// when it should next surface for review. Clamps to the ladder ends.
export function nextReviewAt(exposures: number, from: Date): Date {
  const idx = Math.min(Math.max(exposures, 1), INTERVALS_DAYS.length) - 1;
  const days = INTERVALS_DAYS[idx];
  const d = new Date(from.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

// Is a species due for review? null/undefined next-review = never scheduled = due.
export function isDue(nextReview: Date | string | null | undefined, now: Date): boolean {
  if (nextReview == null) return true;
  const t = typeof nextReview === 'string' ? new Date(nextReview) : nextReview;
  return t.getTime() <= now.getTime();
}

// Interleaved practice: pick the photo role to show next. Prefer the first
// role this learner has NOT yet seen for this species; once all seen, cycle.
export function nextRoleForExposure<T extends string>(
  photoRoles: readonly T[],
  rolesSeen: readonly string[],
): T {
  if (photoRoles.length === 0) {
    throw new Error('nextRoleForExposure: photoRoles must be non-empty');
  }
  const unseen = photoRoles.filter(r => !rolesSeen.includes(r));
  if (unseen.length > 0) return unseen[0];
  // All roles seen — count only roles relevant to this species.
  const seenRelevant = rolesSeen.filter(r => (photoRoles as readonly string[]).includes(r));
  return photoRoles[seenRelevant.length % photoRoles.length];
}

// Progressive difficulty: clearer reference photos early, harder later.
export function tierForExposures(exposures: number): 1 | 2 | 3 {
  if (exposures < 3) return 1;
  if (exposures < 10) return 2;
  return 3;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx vitest run tests/naturalist/spacing.test.ts`
Expected: PASS — all tests (≈ 22).

- [ ] **Step 5: Commit**

```bash
cd /c/Users/dylan/GardenQuestSchool && git add lib/naturalist/spacing.ts tests/naturalist/spacing.test.ts && git commit -m "feat(naturalist): spacing.ts — SM-2 lite intervals + role rotation + tier"
```

---

## Task 2: season.ts — month→season + seasonal catalog filter

**Files:**
- Create: `lib/world/season.ts`
- Create: `tests/world/season.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/world/season.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { currentSeason, floraCodesInSeason } from '@/lib/world/season';
import { FLORA_CATALOG } from '@/lib/world/floraCatalog';

describe('currentSeason', () => {
  it('maps spring months (Mar–May)', () => {
    expect(currentSeason(3)).toBe('spring');
    expect(currentSeason(4)).toBe('spring');
    expect(currentSeason(5)).toBe('spring');
  });
  it('maps summer months (Jun–Aug)', () => {
    expect(currentSeason(6)).toBe('summer');
    expect(currentSeason(7)).toBe('summer');
    expect(currentSeason(8)).toBe('summer');
  });
  it('maps fall months (Sep–Nov)', () => {
    expect(currentSeason(9)).toBe('fall');
    expect(currentSeason(10)).toBe('fall');
    expect(currentSeason(11)).toBe('fall');
  });
  it('maps winter months (Dec, Jan, Feb)', () => {
    expect(currentSeason(12)).toBe('winter');
    expect(currentSeason(1)).toBe('winter');
    expect(currentSeason(2)).toBe('winter');
  });
  it('throws on out-of-range months', () => {
    expect(() => currentSeason(0)).toThrow(/month/i);
    expect(() => currentSeason(13)).toThrow(/month/i);
  });
});

describe('floraCodesInSeason', () => {
  it('returns only species whose seasons include the given season', () => {
    const spring = floraCodesInSeason('spring');
    for (const code of spring) {
      const sp = FLORA_CATALOG.find(f => f.code === code)!;
      expect(sp.seasons).toContain('spring');
    }
  });
  it('summer includes cardinal_flower (summer bloomer)', () => {
    expect(floraCodesInSeason('summer')).toContain('cardinal_flower');
  });
  it('winter excludes spring-only ephemerals like virginia_bluebells', () => {
    expect(floraCodesInSeason('winter')).not.toContain('virginia_bluebells');
  });
  it('winter still has content (evergreen trees seeded all-season)', () => {
    expect(floraCodesInSeason('winter').length).toBeGreaterThan(0);
  });
  it('every returned code is a real catalog code', () => {
    const all = new Set(FLORA_CATALOG.map(f => f.code));
    for (const code of floraCodesInSeason('fall')) {
      expect(all.has(code)).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx vitest run tests/world/season.test.ts`
Expected: FAIL with "Cannot find module '@/lib/world/season'".

- [ ] **Step 3: Implement**

Create `lib/world/season.ts`:

```ts
// lib/world/season.ts
//
// Season helpers for the Naturalist Grove walk picker. Pure functions.
// Northern-hemisphere meteorological seasons (Louisville KY / RRG).
//
// Design spec: docs/superpowers/specs/2026-05-29-naturalist-grove-design.md §6

import { FLORA_CATALOG, type Season } from './floraCatalog';

// month is 1-12 (January = 1). Caller passes new Date().getMonth() + 1.
export function currentSeason(month: number): Season {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error(`currentSeason: month must be 1-12, got ${month}`);
  }
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter'; // 12, 1, 2
}

// All flora codes whose `seasons` array includes the given season.
export function floraCodesInSeason(season: Season): string[] {
  return FLORA_CATALOG
    .filter(f => f.seasons.includes(season))
    .map(f => f.code);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx vitest run tests/world/season.test.ts`
Expected: PASS — all tests (≈ 11).

- [ ] **Step 5: Commit**

```bash
cd /c/Users/dylan/GardenQuestSchool && git add lib/world/season.ts tests/world/season.test.ts && git commit -m "feat(naturalist): season.ts — month→season + seasonal catalog filter"
```

---

## Task 3: selectWalkSpecies — spacing-aware bucket picker

**Files:**
- Modify: `lib/naturalist/walkSelection.ts`
- Create: `tests/naturalist/selectWalkSpecies.test.ts`

Adds `selectWalkSpecies` while keeping the existing `pickWalkSpecies`. Three buckets weight which species fill the walk: DUE (50%), NEW (30%), WILDCARD (20%). Deterministic given an injected RNG.

- [ ] **Step 1: Write the failing test**

Create `tests/naturalist/selectWalkSpecies.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { selectWalkSpecies, type ReviewRow } from '@/lib/naturalist/walkSelection';

function seededRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEASON_POOL = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
const NOW = new Date('2026-06-02T12:00:00.000Z');

describe('selectWalkSpecies', () => {
  it('returns n distinct codes from the season pool', () => {
    const picked = selectWalkSpecies({
      seasonPool: SEASON_POOL,
      reviewRows: [],
      n: 3,
      now: NOW,
      rng: seededRng(1),
    });
    expect(picked).toHaveLength(3);
    expect(new Set(picked).size).toBe(3);
    for (const c of picked) expect(SEASON_POOL).toContain(c);
  });

  it('is deterministic given the same seed', () => {
    const opts = { seasonPool: SEASON_POOL, reviewRows: [] as ReviewRow[], n: 4, now: NOW };
    const a = selectWalkSpecies({ ...opts, rng: seededRng(7) });
    const b = selectWalkSpecies({ ...opts, rng: seededRng(7) });
    expect(a).toEqual(b);
  });

  it('only picks season-appropriate species (never out-of-season)', () => {
    const reviewRows: ReviewRow[] = [
      // a due row that is OUT of season must not be selected
      { flora_code: 'OUT_OF_SEASON', exposures: 2, next_review_at: '2026-01-01T00:00:00.000Z', photo_roles_seen: [] },
    ];
    const picked = selectWalkSpecies({
      seasonPool: SEASON_POOL, reviewRows, n: 4, now: NOW, rng: seededRng(2),
    });
    expect(picked).not.toContain('OUT_OF_SEASON');
  });

  it('prefers DUE species when many are due', () => {
    // Make a,b,c,d,e all due; f-j are new. With n=3 and 50% due weight,
    // at least one due species should appear across deterministic runs.
    const reviewRows: ReviewRow[] = ['a', 'b', 'c', 'd', 'e'].map(code => ({
      flora_code: code, exposures: 2,
      next_review_at: '2026-05-01T00:00:00.000Z', // past = due
      photo_roles_seen: [],
    }));
    const due = new Set(['a', 'b', 'c', 'd', 'e']);
    let dueHits = 0;
    for (let seed = 0; seed < 20; seed++) {
      const picked = selectWalkSpecies({
        seasonPool: SEASON_POOL, reviewRows, n: 3, now: NOW, rng: seededRng(seed),
      });
      if (picked.some(c => due.has(c))) dueHits++;
    }
    expect(dueHits).toBeGreaterThan(15); // due appears in the vast majority
  });

  it('falls back gracefully when n exceeds distinct available', () => {
    const picked = selectWalkSpecies({
      seasonPool: ['x', 'y'], reviewRows: [], n: 4, now: NOW, rng: seededRng(3),
    });
    // Can only return 2 distinct even though 4 requested.
    expect(picked).toHaveLength(2);
    expect(new Set(picked).size).toBe(2);
  });

  it('does not select a future-review species into the DUE bucket but may still wildcard it', () => {
    const reviewRows: ReviewRow[] = [
      { flora_code: 'a', exposures: 3, next_review_at: '2026-12-31T00:00:00.000Z', photo_roles_seen: [] },
    ];
    // 'a' is not due, but it IS season-appropriate, so wildcard may still pick it.
    // Just assert no crash and valid output.
    const picked = selectWalkSpecies({
      seasonPool: SEASON_POOL, reviewRows, n: 3, now: NOW, rng: seededRng(4),
    });
    expect(picked).toHaveLength(3);
    for (const c of picked) expect(SEASON_POOL).toContain(c);
  });

  it('throws if n < 1', () => {
    expect(() => selectWalkSpecies({
      seasonPool: SEASON_POOL, reviewRows: [], n: 0, now: NOW, rng: seededRng(0),
    })).toThrow(/at least 1/i);
  });

  it('returns empty array when season pool is empty', () => {
    const picked = selectWalkSpecies({
      seasonPool: [], reviewRows: [], n: 3, now: NOW, rng: seededRng(0),
    });
    expect(picked).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx vitest run tests/naturalist/selectWalkSpecies.test.ts`
Expected: FAIL with "selectWalkSpecies is not a function" or "ReviewRow not exported".

- [ ] **Step 3: Implement (append to existing file)**

Append to `lib/naturalist/walkSelection.ts` (keep the existing `Rng` type + `pickWalkSpecies`). Add after the existing function:

```ts
import { isDue } from './spacing';

// A subset of a flora_review row — only the fields the picker needs.
export interface ReviewRow {
  flora_code: string;
  exposures: number;
  next_review_at: string | null;
  photo_roles_seen: string[];
}

export interface SelectWalkOptions {
  seasonPool: readonly string[];   // flora codes appropriate for the current season
  reviewRows: readonly ReviewRow[]; // this learner's flora_review rows (any season)
  n: number;                        // how many species to pick (2-4)
  now: Date;
  rng: Rng;
}

// Spacing-aware species picker. Fills the walk from three weighted buckets:
//   DUE      (50%): season-appropriate species past their next_review_at
//   NEW      (30%): season-appropriate species the learner has never seen
//   WILDCARD (20%): any season-appropriate species
// Picks are de-duplicated; if a bucket runs dry the remaining slots fall
// through to the other buckets so we always return min(n, distinct pool).
export function selectWalkSpecies(opts: SelectWalkOptions): string[] {
  const { seasonPool, reviewRows, n, now, rng } = opts;
  if (n < 1) throw new Error('selectWalkSpecies: n must be at least 1');
  if (seasonPool.length === 0) return [];

  const seasonSet = new Set(seasonPool);
  const seenCodes = new Set(reviewRows.map(r => r.flora_code));

  // DUE: season-appropriate AND past next_review_at
  const dueCodes = reviewRows
    .filter(r => seasonSet.has(r.flora_code) && isDue(r.next_review_at, now))
    .map(r => r.flora_code);

  // NEW: season-appropriate AND never seen
  const newCodes = seasonPool.filter(c => !seenCodes.has(c));

  // WILDCARD: any season-appropriate
  const wildCodes = [...seasonPool];

  // Weighted bucket order. We draw one code at a time: roll the weighted
  // die to choose a bucket, then take a random unused code from it. If the
  // chosen bucket is exhausted, fall through to the next non-empty bucket.
  const buckets: Array<{ weight: number; pool: string[] }> = [
    { weight: 0.5, pool: shuffle(dueCodes, rng) },
    { weight: 0.3, pool: shuffle(newCodes, rng) },
    { weight: 0.2, pool: shuffle(wildCodes, rng) },
  ];

  const picked: string[] = [];
  const used = new Set<string>();
  const target = Math.min(n, new Set(seasonPool).size);

  let guard = 0;
  while (picked.length < target && guard < 1000) {
    guard++;
    const bucket = chooseBucket(buckets, rng);
    // Try chosen bucket first, then any non-empty bucket as fallback.
    const order = bucket ? [bucket, ...buckets.filter(b => b !== bucket)] : buckets;
    let took = false;
    for (const b of order) {
      while (b.pool.length > 0) {
        const code = b.pool.pop()!;
        if (!used.has(code)) {
          used.add(code);
          picked.push(code);
          took = true;
          break;
        }
      }
      if (took) break;
    }
    if (!took) break; // all buckets exhausted
  }

  return picked;
}

function shuffle(arr: readonly string[], rng: Rng): string[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Weighted pick among buckets that still have items. Returns null if all empty.
function chooseBucket(
  buckets: Array<{ weight: number; pool: string[] }>,
  rng: Rng,
): { weight: number; pool: string[] } | null {
  const live = buckets.filter(b => b.pool.length > 0);
  if (live.length === 0) return null;
  const total = live.reduce((s, b) => s + b.weight, 0);
  let roll = rng() * total;
  for (const b of live) {
    roll -= b.weight;
    if (roll <= 0) return b;
  }
  return live[live.length - 1];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx vitest run tests/naturalist/selectWalkSpecies.test.ts`
Expected: PASS — all tests (≈ 8).

Also run the existing picker test to confirm no regression:
Run: `cd /c/Users/dylan/GardenQuestSchool && npx vitest run tests/naturalist/walkSelection.test.ts`
Expected: PASS — 6 tests still pass.

- [ ] **Step 5: Commit**

```bash
cd /c/Users/dylan/GardenQuestSchool && git add lib/naturalist/walkSelection.ts tests/naturalist/selectWalkSpecies.test.ts && git commit -m "feat(naturalist): selectWalkSpecies — spacing-aware weighted bucket picker"
```

---

## Task 4: Walk API — spacing + tier + role rotation + quick-recognize flag

**Files:**
- Modify: `app/api/naturalist/walk/route.ts`

Changes:
1. Query the learner's `flora_review` rows up front.
2. Compute current season, replace `pickWalkSpecies(...)` with `selectWalkSpecies(...)`.
3. Load `flora_photo` rows WITHOUT the `tier` filter (so tier 2/3 fallback works), select per-species tier via `tierForExposures(exposures)` with graceful fallback.
4. Hero + reveal photo role selection uses `nextRoleForExposure(photoRoles, rolesSeen)`.
5. Add `showQuickRecognize: exposures >= 5` and `exposures` + `chosenRole` to each species payload.

- [ ] **Step 1: Replace the route file**

Overwrite `app/api/naturalist/walk/route.ts` with:

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { createServiceClient } from '@/lib/supabase/server';
import { FLORA_CATALOG, type FloraData, type PhotoRole } from '@/lib/world/floraCatalog';
import { DICHOTOMOUS_KEY } from '@/lib/world/dichotomousKey';
import { canonicalKeyPath } from '@/lib/naturalist/walkBuilder';
import { selectWalkSpecies, type ReviewRow } from '@/lib/naturalist/walkSelection';
import { publicUrlFor } from '@/lib/naturalist/floraPhotoStorage';
import { currentSeason, floraCodesInSeason } from '@/lib/world/season';
import { tierForExposures, nextRoleForExposure } from '@/lib/naturalist/spacing';

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
  exposures: number;
  showQuickRecognize: boolean;
  heroPhoto: PhotoRef | null;
  heroRole: PhotoRole | null;
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

// Pick a photo for (code, role) preferring `tier`, falling back to any tier.
// Returns null if no photo of that role exists at all.
function pickRowTiered(
  rows: FloraPhotoRow[],
  floraCode: string,
  role: PhotoRole,
  tier: number,
  rng: () => number,
): FloraPhotoRow | null {
  const sameRole = rows.filter(r => r.flora_code === floraCode && r.role === role);
  if (sameRole.length === 0) return null;
  const preferred = sameRole.filter(r => r.tier === tier);
  const pool = preferred.length > 0 ? preferred : sameRole;
  return pool[Math.floor(rng() * pool.length)];
}

function pickRowAnyRole(
  rows: FloraPhotoRow[],
  floraCode: string,
  tier: number,
  rng: () => number,
): FloraPhotoRow | null {
  const any = rows.filter(r => r.flora_code === floraCode);
  if (any.length === 0) return null;
  const preferred = any.filter(r => r.tier === tier);
  const pool = preferred.length > 0 ? preferred : any;
  return pool[Math.floor(rng() * pool.length)];
}

function placeholderPhoto(alt: string): PhotoRef {
  return {
    url: '',
    alt,
    attribution: { photographer: null, licenseCode: 'cc0', sourceUrl: '' },
  };
}

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const rng = Math.random;
  const n = body.n ?? (2 + Math.floor(rng() * 3)); // 2..4

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return NextResponse.json({ error: 'supabase url missing' }, { status: 500 });

  const db = createServiceClient();

  // 1. Load this learner's review history.
  const { data: reviewData, error: reviewErr } = await db
    .from('flora_review')
    .select('flora_code, exposures, next_review_at, photo_roles_seen')
    .eq('learner_id', body.learnerId);
  if (reviewErr) return NextResponse.json({ error: reviewErr.message }, { status: 500 });
  const reviewRows: ReviewRow[] = (reviewData ?? []).map(r => ({
    flora_code: r.flora_code,
    exposures: r.exposures ?? 0,
    next_review_at: r.next_review_at,
    photo_roles_seen: Array.isArray(r.photo_roles_seen) ? r.photo_roles_seen : [],
  }));
  const reviewByCode = new Map(reviewRows.map(r => [r.flora_code, r]));

  // 2. Spacing-aware species pick (seasonal + due/new/wildcard buckets).
  const now = new Date();
  const season = currentSeason(now.getMonth() + 1);
  const seasonPool = floraCodesInSeason(season);
  const picked = selectWalkSpecies({ seasonPool, reviewRows, n, now, rng });

  if (picked.length === 0) {
    return NextResponse.json({ error: 'no species available this season' }, { status: 500 });
  }

  // 3. Load all referenced photo rows in one shot — NO tier filter so
  //    tier 2/3 requests can gracefully fall back to whatever exists.
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
    .in('flora_code', Array.from(referencedCodes));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rows: FloraPhotoRow[] = photoRows ?? [];

  // 4. Build each species payload.
  const speciesPayloads: WalkSpeciesPayload[] = picked.map((code, idx) => {
    const sp = FLORA_CATALOG.find(f => f.code === code) as FloraData;
    const review = reviewByCode.get(code);
    const exposures = review?.exposures ?? 0;
    const rolesSeen = review?.photo_roles_seen ?? [];
    const tier = tierForExposures(exposures);

    // Hero photo: role chosen by interleaved-practice rotation.
    const heroRole = nextRoleForExposure(sp.photoRoles, rolesSeen);
    const heroRow = pickRowTiered(rows, code, heroRole, tier, rng)
      ?? pickRowAnyRole(rows, code, tier, rng);
    const heroPhoto = heroRow ? toPhotoRef(heroRow, baseUrl) : null;

    // KeyPath: resolve each node's photo pair (key comparison photos
    // always use tier 1 reference shots regardless of learner exposure).
    const pathNodeIds = canonicalKeyPath(code);
    const keyPath: KeyStepResolved[] = pathNodeIds.map(nid => {
      const node = DICHOTOMOUS_KEY[nid];
      const lRow = pickRowTiered(rows, node.leftPhoto.floraCode, node.leftPhoto.role, 1, rng)
        ?? pickRowAnyRole(rows, node.leftPhoto.floraCode, 1, rng);
      const rRow = pickRowTiered(rows, node.rightPhoto.floraCode, node.rightPhoto.role, 1, rng)
        ?? pickRowAnyRole(rows, node.rightPhoto.floraCode, 1, rng);
      return {
        nodeId: nid,
        question: node.question,
        leftLabel: node.leftLabel,
        rightLabel: node.rightLabel,
        leftPhoto: lRow ? toPhotoRef(lRow, baseUrl) : placeholderPhoto(node.leftLabel),
        rightPhoto: rRow ? toPhotoRef(rRow, baseUrl) : placeholderPhoto(node.rightLabel),
      };
    });

    // RevealPhotos: up to 3 distinct roles for this species (tier-preferred).
    const revealRows: FloraPhotoRow[] = [];
    for (const role of sp.photoRoles) {
      const r = pickRowTiered(rows, code, role, tier, rng);
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
      exposures,
      showQuickRecognize: exposures >= 5,
      heroPhoto,
      heroRole: heroRow ? heroRole : null,
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
```

- [ ] **Step 2: Verify TS compiles**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx tsc --noEmit -p . 2>&1 | head -20`
Expected: no output.

- [ ] **Step 3: Smoke-test the route**

```bash
cd /c/Users/dylan/GardenQuestSchool && npm run dev > /tmp/dev_p3t4.log 2>&1 &
for i in {1..30}; do if grep -q "Ready in\|Local:" /tmp/dev_p3t4.log 2>/dev/null; then echo READY; break; fi; sleep 1; done

cat > /tmp/gl_p3t4.ts << 'EOF'
import { config } from 'dotenv'; import { resolve } from 'node:path';
config({ path: resolve(process.cwd(), '.env.local') });
import { createClient } from '@supabase/supabase-js';
(async () => {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await s.from('learner').select('id').limit(1);
  console.log(data?.[0]?.id ?? 'NONE');
})();
EOF
LEARNER_ID=$(cd /c/Users/dylan/GardenQuestSchool && npx tsx /tmp/gl_p3t4.ts 2>/dev/null | tail -1)
echo "Learner: $LEARNER_ID"

curl -sS -X POST http://localhost:3000/api/naturalist/walk -H 'Content-Type: application/json' -d "{\"learnerId\":\"$LEARNER_ID\",\"n\":3}" | python -c "
import json, sys
d = json.load(sys.stdin)
print('walk id:', d.get('id'))
for s in d['species']:
    print(f\"  - {s['commonName']}: exposures={s['exposures']}, quickRecognize={s['showQuickRecognize']}, heroRole={s.get('heroRole')}, keyPath={len(s['keyPath'])}, reveal={len(s['revealPhotos'])}\")
"

pkill -f "next dev" 2>/dev/null; pkill -f "node.*next" 2>/dev/null; sleep 2
rm -f /tmp/dev_p3t4.log /tmp/gl_p3t4.ts
```

Expected: walk returns 3 species, each showing `exposures=0`, `quickRecognize=False` (fresh learner), `heroRole` populated (e.g. `whole`), keyPath length ≥ 1, reveal ≥ 1. No errors.

- [ ] **Step 4: Commit**

```bash
cd /c/Users/dylan/GardenQuestSchool && git add app/api/naturalist/walk/route.ts && git commit -m "feat(naturalist): walk API uses spacing picker + tier + role rotation + quick-recognize flag"
```

---

## Task 5: Identified API — write next_review_at

**Files:**
- Modify: `app/api/naturalist/walk/identified/route.ts`

After bumping `exposures`, compute and persist `next_review_at` via `nextReviewAt(newExposures, now)`. `ease_factor` stays at its DB default (2.5) — no quality grading in v1.

- [ ] **Step 1: Replace the route file**

Overwrite `app/api/naturalist/walk/identified/route.ts` with:

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { nextReviewAt } from '@/lib/naturalist/spacing';

const Body = z.object({
  learnerId: z.string().min(1),
  floraCode: z.string().min(1),
  photoRole: z.string().optional(),  // role of the hero photo Cecily just saw
});

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();
  const now = new Date();
  const nowIso = now.toISOString();

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
    const newExposures = existing.exposures + 1;
    const { data: updated, error: upErr } = await db
      .from('flora_review')
      .update({
        exposures: newExposures,
        last_seen_at: nowIso,
        next_review_at: nextReviewAt(newExposures, now).toISOString(),
        photo_roles_seen: nextRoles,
      })
      .eq('id', existing.id)
      .select('id, exposures, next_review_at')
      .single();
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
    return NextResponse.json({
      id: updated!.id,
      exposures: updated!.exposures,
      nextReviewAt: updated!.next_review_at,
      isNew: false,
    });
  }

  const { data: created, error: insErr } = await db
    .from('flora_review')
    .insert({
      learner_id: body.learnerId,
      flora_code: body.floraCode,
      exposures: 1,
      last_seen_at: nowIso,
      next_review_at: nextReviewAt(1, now).toISOString(),
      photo_roles_seen: body.photoRole ? [body.photoRole] : [],
    })
    .select('id, exposures, next_review_at')
    .single();
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
  return NextResponse.json({
    id: created!.id,
    exposures: created!.exposures,
    nextReviewAt: created!.next_review_at,
    isNew: true,
  });
}
```

- [ ] **Step 2: Verify TS compiles**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx tsc --noEmit -p . 2>&1 | head -10`
Expected: no output.

- [ ] **Step 3: Smoke-test**

```bash
cd /c/Users/dylan/GardenQuestSchool && npm run dev > /tmp/dev_p3t5.log 2>&1 &
for i in {1..30}; do if grep -q "Ready in\|Local:" /tmp/dev_p3t5.log 2>/dev/null; then echo READY; break; fi; sleep 1; done

cat > /tmp/gl_p3t5.ts << 'EOF'
import { config } from 'dotenv'; import { resolve } from 'node:path';
config({ path: resolve(process.cwd(), '.env.local') });
import { createClient } from '@supabase/supabase-js';
(async () => {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await s.from('learner').select('id').limit(1);
  console.log(data?.[0]?.id ?? 'NONE');
})();
EOF
LEARNER_ID=$(cd /c/Users/dylan/GardenQuestSchool && npx tsx /tmp/gl_p3t5.ts 2>/dev/null | tail -1)

echo "First (new, exposures=1, +1 day):"
curl -sS -X POST http://localhost:3000/api/naturalist/walk/identified -H 'Content-Type: application/json' -d "{\"learnerId\":\"$LEARNER_ID\",\"floraCode\":\"trillium\",\"photoRole\":\"whole\"}"
echo ""
echo "Second (exposures=2, +3 days):"
curl -sS -X POST http://localhost:3000/api/naturalist/walk/identified -H 'Content-Type: application/json' -d "{\"learnerId\":\"$LEARNER_ID\",\"floraCode\":\"trillium\",\"photoRole\":\"leaf\"}"
echo ""

# Cleanup
cat > /tmp/cl_p3t5.ts << EOF2
import { config } from 'dotenv'; import { resolve } from 'node:path';
config({ path: resolve(process.cwd(), '.env.local') });
import { createClient } from '@supabase/supabase-js';
(async () => {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  await s.from('flora_review').delete().eq('flora_code', 'trillium');
  console.log('cleaned');
})();
EOF2
cd /c/Users/dylan/GardenQuestSchool && npx tsx /tmp/cl_p3t5.ts 2>/dev/null | tail -1
pkill -f "next dev" 2>/dev/null; pkill -f "node.*next" 2>/dev/null; sleep 2
rm -f /tmp/dev_p3t5.log /tmp/gl_p3t5.ts /tmp/cl_p3t5.ts
```

Expected: first response `exposures:1, isNew:true, nextReviewAt` ≈ now+1day; second `exposures:2, isNew:false, nextReviewAt` ≈ now+3days. Cleanup prints `cleaned`.

- [ ] **Step 4: Commit**

```bash
cd /c/Users/dylan/GardenQuestSchool && git add app/api/naturalist/walk/identified/route.ts && git commit -m "feat(naturalist): identified API persists next_review_at via SM-2 lite"
```

---

## Task 6: Walk page — quick-recognize branch + record actual role

**Files:**
- Modify: `app/(child)/naturalist/walk/page.tsx`

Changes:
1. Extend the `WalkSpecies` interface with `exposures: number`, `showQuickRecognize: boolean`, `heroRole: string | null`.
2. Add a `'quick'` phase. When a species has `showQuickRecognize`, the intro shows two extra buttons: "I think so" (→ straight to reveal) and "Let me check" (→ normal key flow). The plain "Begin →" intro is used when `showQuickRecognize` is false.
3. `recordIdentified` sends the species' actual `heroRole` (fallback `'whole'`) instead of the hardcoded literal.

- [ ] **Step 1: Update the WalkSpecies interface**

In `app/(child)/naturalist/walk/page.tsx`, find the `interface WalkSpecies {` block and add three fields. Replace:

```tsx
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
```

with:

```tsx
interface WalkSpecies {
  position: number;
  floraCode: string;
  commonName: string;
  scientificName: string;
  notableFeatures: string[];
  facts: string[];
  emoji: string;
  exposures: number;
  showQuickRecognize: boolean;
  heroPhoto: KeyPhotoRef | null;
  heroRole: string | null;
  keyPath: KeyStepResolved[];
  revealPhotos: KeyPhotoRef[];
}
```

- [ ] **Step 2: Update recordIdentified to send the actual role**

Find the `recordIdentified` callback and replace its body's `photoRole: 'whole'` line. Replace:

```tsx
        body: JSON.stringify({
          learnerId,
          floraCode: sp.floraCode,
          photoRole: 'whole',
        }),
```

with:

```tsx
        body: JSON.stringify({
          learnerId,
          floraCode: sp.floraCode,
          photoRole: sp.heroRole ?? 'whole',
        }),
```

- [ ] **Step 3: Update handleIntroBegin to branch on quick-recognize**

Find `handleIntroBegin`. Replace:

```tsx
  const handleIntroBegin = useCallback(() => {
    if (!current) return;
    if (current.keyPath.length === 0) setPhase('reveal');
    else setPhase('key');
  }, [current]);
```

with:

```tsx
  const handleIntroBegin = useCallback(() => {
    if (!current) return;
    if (current.showQuickRecognize) { setPhase('quick'); return; }
    if (current.keyPath.length === 0) setPhase('reveal');
    else setPhase('key');
  }, [current]);

  // Quick-recognize: "I think so" → straight to reveal (retrieval practice).
  const handleQuickKnow = useCallback(() => {
    setPhase('reveal');
  }, []);

  // Quick-recognize: "Let me check" → fall through to the key flow.
  const handleQuickCheck = useCallback(() => {
    if (!current) return;
    if (current.keyPath.length === 0) setPhase('reveal');
    else setPhase('key');
  }, [current]);
```

- [ ] **Step 4: Add 'quick' to the Phase type**

Find `type Phase =` and add `'quick'`. Replace:

```tsx
type Phase = 'loading' | 'intro' | 'key' | 'reveal' | 'done' | 'error';
```

with:

```tsx
type Phase = 'loading' | 'intro' | 'quick' | 'key' | 'reveal' | 'done' | 'error';
```

- [ ] **Step 5: Render the quick-recognize phase**

In the `<AnimatePresence mode="wait">` block, immediately AFTER the `{phase === 'intro' && (...)}` motion block and BEFORE `{phase === 'key' && ...}`, insert this new block:

```tsx
          {phase === 'quick' && (
            <motion.div
              key={`quick-${current.floraCode}`}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center px-4 text-center max-w-2xl"
            >
              <p className="text-lg md:text-xl text-bark/70 mb-6">
                Do you already know this one?
              </p>
              <div className="w-full max-w-md rounded-3xl overflow-hidden border-4 border-bark/15 bg-cream shadow-md aspect-square relative mb-6">
                {current.heroPhoto?.url
                  ? <img src={current.heroPhoto.url} alt={current.heroPhoto.alt} className="w-full h-full object-cover" />
                  : <div className="absolute inset-0 flex items-center justify-center text-7xl">{current.emoji}</div>
                }
              </div>
              <div className="flex gap-3 flex-wrap justify-center">
                <button
                  type="button"
                  onClick={handleQuickKnow}
                  className="px-8 py-4 rounded-full bg-forest text-cream font-display text-xl shadow-md"
                  style={{ minHeight: 60, touchAction: 'manipulation' }}
                >
                  I think so
                </button>
                <button
                  type="button"
                  onClick={handleQuickCheck}
                  className="px-8 py-4 rounded-full bg-bark/15 text-bark font-display text-xl shadow-md"
                  style={{ minHeight: 60, touchAction: 'manipulation' }}
                >
                  Let me check
                </button>
              </div>
            </motion.div>
          )}
```

- [ ] **Step 6: Verify TS compiles**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx tsc --noEmit -p . 2>&1 | head -20`
Expected: no output.

- [ ] **Step 7: Commit**

```bash
cd /c/Users/dylan/GardenQuestSchool && git add 'app/(child)/naturalist/walk/page.tsx' && git commit -m "feat(naturalist): walk page quick-recognize branch + record actual photo role"
```

---

## Task 7: End-to-end acceptance — full spacing loop + push

**Files:** No new files; verification + push.

- [ ] **Step 1: Run all Phase 3 unit tests**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx vitest run tests/naturalist/spacing.test.ts tests/world/season.test.ts tests/naturalist/selectWalkSpecies.test.ts tests/naturalist/walkSelection.test.ts 2>&1 | tail -12`
Expected: all 4 files pass (≈ 47 tests).

- [ ] **Step 2: Full project test sweep (no regressions)**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx vitest run tests/world/dichotomousKey.test.ts tests/world/floraCatalog.test.ts tests/naturalist/walkBuilder.test.ts tests/naturalist/floraPhotoStorage.test.ts tests/child-language.test.ts 2>&1 | tail -10`
Expected: all pass.

- [ ] **Step 3: TS clean**

Run: `cd /c/Users/dylan/GardenQuestSchool && npx tsc --noEmit -p . 2>&1 | head -10`
Expected: no output.

- [ ] **Step 4: Live spacing-loop verification**

This proves the whole loop: walk → identify → next_review_at set → re-walk respects it.

```bash
cd /c/Users/dylan/GardenQuestSchool && npm run dev > /tmp/dev_p3t7.log 2>&1 &
for i in {1..30}; do if grep -q "Ready in\|Local:" /tmp/dev_p3t7.log 2>/dev/null; then echo READY; break; fi; sleep 1; done

cat > /tmp/p3verify.ts << 'EOF'
import { config } from 'dotenv'; import { resolve } from 'node:path';
config({ path: resolve(process.cwd(), '.env.local') });
import { createClient } from '@supabase/supabase-js';
(async () => {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await s.from('learner').select('id').limit(1);
  const learner = data?.[0]?.id;
  console.log('LEARNER', learner);

  // Simulate 5 prior exposures of common_milkweed so it triggers quick-recognize
  await s.from('flora_review').delete().eq('learner_id', learner).eq('flora_code', 'common_milkweed');
  await s.from('flora_review').insert({
    learner_id: learner, flora_code: 'common_milkweed', exposures: 5,
    last_seen_at: new Date(Date.now() - 90*86400000).toISOString(),
    next_review_at: new Date(Date.now() - 86400000).toISOString(), // due (past)
    photo_roles_seen: ['whole','flower','leaf'],
  });
  console.log('SEEDED common_milkweed exposures=5 due');
})();
EOF
SEED=$(cd /c/Users/dylan/GardenQuestSchool && npx tsx /tmp/p3verify.ts 2>/dev/null)
echo "$SEED"
LEARNER_ID=$(echo "$SEED" | grep LEARNER | awk '{print $2}')

echo "=== Walk (milkweed should show quickRecognize=True since exposures>=5) ==="
curl -sS -X POST http://localhost:3000/api/naturalist/walk -H 'Content-Type: application/json' -d "{\"learnerId\":\"$LEARNER_ID\",\"n\":4}" | python -c "
import json,sys
d=json.load(sys.stdin)
mw=[s for s in d['species'] if s['floraCode']=='common_milkweed']
if mw:
    s=mw[0]
    print(f\"milkweed in walk: exposures={s['exposures']} quickRecognize={s['showQuickRecognize']} heroRole={s.get('heroRole')}\")
else:
    print('milkweed not in this walk (random) — re-run if needed; not a failure')
print('species this walk:', [s['floraCode'] for s in d['species']])
"

# Cleanup the seeded row
cat > /tmp/p3clean.ts << EOF3
import { config } from 'dotenv'; import { resolve } from 'node:path';
config({ path: resolve(process.cwd(), '.env.local') });
import { createClient } from '@supabase/supabase-js';
(async () => {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  await s.from('flora_review').delete().eq('flora_code', 'common_milkweed');
  console.log('cleaned');
})();
EOF3
cd /c/Users/dylan/GardenQuestSchool && npx tsx /tmp/p3clean.ts 2>/dev/null | tail -1
pkill -f "next dev" 2>/dev/null; pkill -f "node.*next" 2>/dev/null; sleep 2
rm -f /tmp/dev_p3t7.log /tmp/p3verify.ts /tmp/p3clean.ts
```

Expected: if milkweed appears in the walk, `quickRecognize=True`, `exposures=5`. (If it doesn't appear, that's random chance — re-run; the unit tests already prove the bucket logic. Not a blocker.)

- [ ] **Step 5: Push**

```bash
cd /c/Users/dylan/GardenQuestSchool && git push 2>&1 | tail -3
```

- [ ] **Step 6: Final state check**

```bash
cd /c/Users/dylan/GardenQuestSchool && git status && git log --oneline origin/main..HEAD
```
Expected: clean tree, no unpushed commits.

---

## Self-Review

**1. Spec coverage:**

| Spec §3 / §6 requirement | Task |
|---|---|
| SM-2 lite intervals [1,3,7,14,30,60] | Task 1 (`nextReviewAt`, `INTERVALS_DAYS`) |
| Photo-role rotation (prefer unseen, then cycle) | Task 1 (`nextRoleForExposure`) + Task 4 (hero/reveal use it) |
| Difficulty tier escalation (1/2/3 by exposures) | Task 1 (`tierForExposures`) + Task 4 (with tier-1 fallback) |
| Seasonal filtering | Task 2 (`currentSeason`, `floraCodesInSeason`) + Task 4 |
| 50/30/20 due/new/wildcard buckets | Task 3 (`selectWalkSpecies`) + Task 4 |
| `next_review_at` written on identify | Task 5 |
| Quick-recognize after 5 exposures | Task 4 (`showQuickRecognize` flag) + Task 6 (UI branch) |
| Identical reveal regardless of path | Task 6 (both quick paths land on `reveal`) |

Out of scope (Phase 4) correctly excluded: signpost, journal tab, attribution overlay UI.

**2. Placeholder scan:** No TBD/TODO. Every code step shows complete code. Tier-2/3 fallback is concretely specified (query without tier filter; `pickRowTiered` prefers requested tier, falls back to same-role any-tier; `pickRowAnyRole` falls back further). Error handling explicit (500s on DB errors, empty-season guard, best-effort identify in page unchanged).

**3. Type consistency:**
- `ReviewRow { flora_code, exposures, next_review_at, photo_roles_seen }` defined in Task 3, imported + used in Task 4. Matches.
- `nextReviewAt(exposures, from)` signature consistent Task 1 → Task 5.
- `nextRoleForExposure(photoRoles, rolesSeen)` consistent Task 1 → Task 4.
- `tierForExposures(exposures)` consistent Task 1 → Task 4.
- `currentSeason(month)` + `floraCodesInSeason(season)` consistent Task 2 → Task 4.
- `selectWalkSpecies({ seasonPool, reviewRows, n, now, rng })` consistent Task 3 → Task 4.
- Walk payload adds `exposures`, `showQuickRecognize`, `heroRole` — consumed by the page's `WalkSpecies` interface in Task 6. Matches.
- `isDue` imported into walkSelection.ts (Task 3) from spacing.ts (Task 1). Order: Task 1 lands spacing.ts before Task 3 needs it. Correct.

Plan is internally consistent.
