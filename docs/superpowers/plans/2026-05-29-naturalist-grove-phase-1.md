# Naturalist Grove — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the data foundation for the Naturalist Grove module — Supabase schema, a 10-species pilot catalog (Tulip Poplar, Eastern Redbud, Flowering Dogwood, Eastern White Pine, Shagbark Hickory, Virginia Bluebells, Mayapple, Trillium, Cardinal Flower, Common Milkweed), and local-dev tooling that fetches CC-licensed photos from iNaturalist + Wikimedia Commons and uploads them to a public Supabase Storage bucket. No UI in this phase — acceptance is purely "catalog queryable from TS, SQL inserts can simulate exposures, photos load from Supabase Storage."

**Architecture:** Migration `011_naturalist.sql` adds three tables (`flora_review`, `flora_photo`, `key_node_photo`) parallel to existing world tables, with RLS policies that match existing conventions. A catalog file `lib/world/floraCatalog.ts` mirrors the shape of `habitatCatalog.ts`. Two scripts (`scripts/seed-flora-photos.ts` for harvesting candidates, `scripts/upload-flora-photos.ts` for uploading curated selections) live alongside `scripts/seed-world.ts`. The intermediate curation step is a hand-edited JSON file (`scripts/staging/<code>/selections.json`) — no admin UI ships in Phase 1.

**Tech Stack:** Next.js 14, TypeScript 5, Supabase Postgres + Storage, `@supabase/supabase-js` v2.104, `postgres` (for migration runner), Vitest + jsdom for tests, `tsx` as script runner, Node 18+ built-in `fetch`.

**Spec reference:** `docs/superpowers/specs/2026-05-29-naturalist-grove-design.md`, especially §4 (Architecture), §5 (Data Model), §8 (Photo Pipeline), §11 (Implementation Phasing).

---

## File Structure

| File | Created/Modified | Responsibility |
|---|---|---|
| `lib/supabase/migrations/011_naturalist.sql` | **Create** | Three tables + indexes + RLS for the naturalist module. |
| `lib/world/floraCatalog.ts` | **Create** | `FloraData` type + `FLORA_CATALOG` array (10 species pilot). |
| `tests/world/floraCatalog.test.ts` | **Create** | Catalog invariants: required fields present, codes unique, season values valid, etc. |
| `tests/naturalist/floraSchema.test.ts` | **Create** | Integration test against dev DB: insert/read a `flora_review` row, verify constraints. |
| `scripts/seed-flora-photos.ts` | **Create** | CLI: harvest candidate photos from iNat + Wikimedia for one or all species, stage to `scripts/staging/<code>/`. |
| `scripts/upload-flora-photos.ts` | **Create** | CLI: read `scripts/staging/<code>/selections.json`, upload chosen photos to Supabase Storage, insert `flora_photo` rows. |
| `scripts/naturalist/inatClient.ts` | **Create** | Pure helper module wrapping the iNat HTTP API (testable in isolation). |
| `scripts/naturalist/wikimediaClient.ts` | **Create** | Pure helper module wrapping Wikimedia Commons HTTP API. |
| `tests/naturalist/inatClient.test.ts` | **Create** | Unit test for iNat URL builder + response parser. |
| `tests/naturalist/wikimediaClient.test.ts` | **Create** | Unit test for Wikimedia URL builder + response parser. |
| `scripts/staging/.gitkeep` | **Create** | Empty file so the dir exists in git but staged photos stay un-committed. |
| `scripts/staging/.gitignore` | **Create** | Ignore everything except `selections.json` files. |
| `docs/naturalist-photo-curation.md` | **Create** | Author-facing doc explaining the harvest → tag → upload workflow. |
| `package.json` | **Modify** | Add `naturalist:harvest` and `naturalist:upload` npm scripts. |

**Test conventions:** vitest config (`vitest.config.ts`) includes `tests/**/*.test.{ts,tsx}` with `jsdom` env. The `@/` alias resolves to project root. Sample tests like `tests/engine/spacedReview.test.ts` show the expected style.

**Migration runner:** `npm run db:migrate` (= `tsx scripts/migrate.ts`) reads `DATABASE_URL` from `.env.local` and applies every `lib/supabase/migrations/*.sql` in alphabetical order. Each migration must be idempotent — use `if not exists` everywhere.

---

## Task 1: FloraData type + empty catalog skeleton

**Files:**
- Create: `lib/world/floraCatalog.ts`
- Create: `tests/world/floraCatalog.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/world/floraCatalog.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { FLORA_CATALOG, type FloraData } from '@/lib/world/floraCatalog';

describe('FLORA_CATALOG — shape', () => {
  it('is an array', () => {
    expect(Array.isArray(FLORA_CATALOG)).toBe(true);
  });

  it('every entry has a non-empty string code', () => {
    for (const f of FLORA_CATALOG) {
      expect(typeof f.code).toBe('string');
      expect(f.code.length).toBeGreaterThan(0);
    }
  });

  it('every code is unique', () => {
    const codes = FLORA_CATALOG.map(f => f.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('FloraData type is importable', () => {
    const sample: FloraData = {
      code: 'sample',
      commonName: 'Sample',
      scientificName: 'Sampleus testus',
      kind: 'tree',
      localTier: 'hyper_local',
      emoji: '🌳',
      seasons: ['spring'],
      notableFeatures: ['none'],
      facts: ['none'],
      wikiSpecies: 'Sampleus_testus',
      inatTaxonId: 1,
      photoRoles: ['whole'],
    };
    expect(sample.code).toBe('sample');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/world/floraCatalog.test.ts`
Expected: FAIL with "Cannot find module '@/lib/world/floraCatalog'".

- [ ] **Step 3: Write minimal implementation**

Create `lib/world/floraCatalog.ts`:

```ts
// lib/world/floraCatalog.ts
//
// Catalog of trees + wildflowers + ferns + shrubs that Cecily can
// identify in the Naturalist Grove module. Parallel to
// speciesCatalog.ts (which covers fauna like ants + butterflies).
//
// Phase 1 pilot: 10 species (5 trees, 5 flowers) covering spring,
// summer, fall, winter so the seasonal walk-selection algorithm in
// Phase 3 has content year-round. Phase 5 expands to ~55.
//
// Design spec: docs/superpowers/specs/2026-05-29-naturalist-grove-design.md §5

export type FloraKind = 'tree' | 'flower' | 'fern' | 'shrub';
export type Season = 'spring' | 'summer' | 'fall' | 'winter';
export type LocalTier = 'hyper_local' | 'canonical_native';
export type PhotoRole = 'whole' | 'leaf' | 'bark' | 'flower' | 'fruit';

export interface FloraData {
  code: string;                  // 'red_maple', 'eastern_redbud'
  commonName: string;            // "Red Maple"
  scientificName: string;        // "Acer rubrum"
  kind: FloraKind;
  localTier: LocalTier;
  emoji: string;                 // fallback / journal chip
  seasons: Season[];             // when this species is visibly identifiable
  notableFeatures: string[];     // ['lobed leaf', 'red samaras', 'smooth grey bark']
  facts: string[];               // 2-3 short kid-readable facts
  wikiSpecies: string;           // 'Acer_rubrum' — for Wikimedia category lookup
  inatTaxonId: number;           // iNaturalist taxon id
  photoRoles: PhotoRole[];       // which photo roles exist for this species
}

export const FLORA_CATALOG: FloraData[] = [];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/world/floraCatalog.test.ts`
Expected: PASS (4 passed). The "every code is unique" test trivially passes on an empty array.

- [ ] **Step 5: Commit**

```bash
git add lib/world/floraCatalog.ts tests/world/floraCatalog.test.ts
git commit -m "feat(naturalist): FloraData type + empty FLORA_CATALOG skeleton"
```

---

## Task 2: Catalog invariant tests (set up validation before seeding)

**Files:**
- Modify: `tests/world/floraCatalog.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `tests/world/floraCatalog.test.ts`:

```ts
describe('FLORA_CATALOG — invariants per entry', () => {
  const VALID_KINDS = new Set(['tree', 'flower', 'fern', 'shrub']);
  const VALID_SEASONS = new Set(['spring', 'summer', 'fall', 'winter']);
  const VALID_LOCAL_TIERS = new Set(['hyper_local', 'canonical_native']);
  const VALID_PHOTO_ROLES = new Set(['whole', 'leaf', 'bark', 'flower', 'fruit']);

  for (const f of FLORA_CATALOG) {
    describe(`${f.code}`, () => {
      it('has valid kind', () => {
        expect(VALID_KINDS.has(f.kind)).toBe(true);
      });
      it('has valid localTier', () => {
        expect(VALID_LOCAL_TIERS.has(f.localTier)).toBe(true);
      });
      it('has at least one season', () => {
        expect(f.seasons.length).toBeGreaterThan(0);
      });
      it('every season is valid', () => {
        for (const s of f.seasons) expect(VALID_SEASONS.has(s)).toBe(true);
      });
      it('has at least one notable feature', () => {
        expect(f.notableFeatures.length).toBeGreaterThan(0);
      });
      it('has 1-3 facts', () => {
        expect(f.facts.length).toBeGreaterThanOrEqual(1);
        expect(f.facts.length).toBeLessThanOrEqual(3);
      });
      it('wikiSpecies is non-empty', () => {
        expect(f.wikiSpecies.length).toBeGreaterThan(0);
      });
      it('inatTaxonId is a positive integer', () => {
        expect(Number.isInteger(f.inatTaxonId)).toBe(true);
        expect(f.inatTaxonId).toBeGreaterThan(0);
      });
      it('has at least one photoRole', () => {
        expect(f.photoRoles.length).toBeGreaterThan(0);
      });
      it('every photoRole is valid', () => {
        for (const r of f.photoRoles) expect(VALID_PHOTO_ROLES.has(r)).toBe(true);
      });
      it('photoRoles are unique', () => {
        expect(new Set(f.photoRoles).size).toBe(f.photoRoles.length);
      });
    });
  }
});
```

- [ ] **Step 2: Run tests to verify they pass on the empty catalog**

Run: `npx vitest run tests/world/floraCatalog.test.ts`
Expected: PASS (4 prior tests still pass). The new `describe` loop generates zero `it`s because the catalog is empty — that's fine, vitest doesn't error on an empty describe.

- [ ] **Step 3: Commit**

```bash
git add tests/world/floraCatalog.test.ts
git commit -m "test(naturalist): per-entry invariants for FLORA_CATALOG"
```

---

## Task 3: Seed 5 trees in FLORA_CATALOG

**Files:**
- Modify: `lib/world/floraCatalog.ts`

- [ ] **Step 1: Add the five tree entries**

Replace `export const FLORA_CATALOG: FloraData[] = [];` in `lib/world/floraCatalog.ts` with:

```ts
export const FLORA_CATALOG: FloraData[] = [
  // ─── TREES ─────────────────────────────────────────────────────────

  {
    code: 'tulip_poplar',
    commonName: 'Tulip Poplar',
    scientificName: 'Liriodendron tulipifera',
    kind: 'tree',
    localTier: 'hyper_local',
    emoji: '🌳',
    seasons: ['spring', 'summer', 'fall', 'winter'],
    notableFeatures: [
      'four-lobed leaf with a flat top',
      'tulip-shaped greenish-orange flower in late spring',
      'tall straight grey trunk',
    ],
    facts: [
      'The Tulip Poplar is the state tree of Kentucky.',
      'Its flowers look like little tulips — that is how it got its name.',
      'It can grow taller than almost any other tree in the eastern forest.',
    ],
    wikiSpecies: 'Liriodendron_tulipifera',
    inatTaxonId: 48719,
    photoRoles: ['whole', 'leaf', 'bark', 'flower'],
  },

  {
    code: 'eastern_redbud',
    commonName: 'Eastern Redbud',
    scientificName: 'Cercis canadensis',
    kind: 'tree',
    localTier: 'hyper_local',
    emoji: '🌳',
    seasons: ['spring', 'summer', 'fall', 'winter'],
    notableFeatures: [
      'magenta-pink flowers all along bare branches in very early spring',
      'heart-shaped leaves',
      'thin twisty trunk',
    ],
    facts: [
      'Redbuds bloom before they grow leaves — the pink flowers come straight out of the bark.',
      'You can eat redbud flowers in a salad.',
      'A redbud rarely grows taller than about 25 feet.',
    ],
    wikiSpecies: 'Cercis_canadensis',
    inatTaxonId: 49083,
    photoRoles: ['whole', 'leaf', 'flower'],
  },

  {
    code: 'flowering_dogwood',
    commonName: 'Flowering Dogwood',
    scientificName: 'Cornus florida',
    kind: 'tree',
    localTier: 'hyper_local',
    emoji: '🌳',
    seasons: ['spring', 'summer', 'fall', 'winter'],
    notableFeatures: [
      'four white "petals" that are really leaves around the real tiny flowers in the middle',
      'red berries in fall',
      'bumpy alligator-skin bark',
    ],
    facts: [
      'The big white "petals" are not really petals — they are special leaves called bracts.',
      'Dogwood berries feed birds through the fall and winter.',
      'Its leaves turn deep red in autumn.',
    ],
    wikiSpecies: 'Cornus_florida',
    inatTaxonId: 48835,
    photoRoles: ['whole', 'leaf', 'bark', 'flower', 'fruit'],
  },

  {
    code: 'eastern_white_pine',
    commonName: 'Eastern White Pine',
    scientificName: 'Pinus strobus',
    kind: 'tree',
    localTier: 'hyper_local',
    emoji: '🌲',
    seasons: ['spring', 'summer', 'fall', 'winter'],
    notableFeatures: [
      'long soft needles in bundles of five',
      'long slender cones',
      'tall straight trunk with horizontal branches',
    ],
    facts: [
      'White pines hold their needles in groups of FIVE — count them on your fingers: W-H-I-T-E.',
      'They can live for more than 200 years.',
      'You will see lots of them in the Red River Gorge.',
    ],
    wikiSpecies: 'Pinus_strobus',
    inatTaxonId: 47561,
    photoRoles: ['whole', 'leaf', 'bark', 'fruit'],
  },

  {
    code: 'shagbark_hickory',
    commonName: 'Shagbark Hickory',
    scientificName: 'Carya ovata',
    kind: 'tree',
    localTier: 'hyper_local',
    emoji: '🌳',
    seasons: ['spring', 'summer', 'fall', 'winter'],
    notableFeatures: [
      'shaggy bark that peels off in long curling strips',
      'leaves made of five leaflets in a row',
      'thick-shelled nuts in fall',
    ],
    facts: [
      'You can spot a Shagbark Hickory from far away — its bark looks like it is peeling in long strips.',
      'Squirrels love hickory nuts.',
      'A Shagbark can live for more than 200 years.',
    ],
    wikiSpecies: 'Carya_ovata',
    inatTaxonId: 60703,
    photoRoles: ['whole', 'leaf', 'bark', 'fruit'],
  },
];
```

- [ ] **Step 2: Run tests to verify all invariants hold**

Run: `npx vitest run tests/world/floraCatalog.test.ts`
Expected: PASS — invariant tests now run for all 5 species; all pass.

- [ ] **Step 3: Commit**

```bash
git add lib/world/floraCatalog.ts
git commit -m "feat(naturalist): seed 5 trees in FLORA_CATALOG"
```

---

## Task 4: Seed 5 wildflowers in FLORA_CATALOG

**Files:**
- Modify: `lib/world/floraCatalog.ts`

- [ ] **Step 1: Append flower entries**

In `lib/world/floraCatalog.ts`, before the closing `];` of `FLORA_CATALOG`, append (keeping the comment line and preceding tree entries intact):

```ts
  // ─── WILDFLOWERS ───────────────────────────────────────────────────

  {
    code: 'virginia_bluebells',
    commonName: 'Virginia Bluebells',
    scientificName: 'Mertensia virginica',
    kind: 'flower',
    localTier: 'hyper_local',
    emoji: '🌸',
    seasons: ['spring'],
    notableFeatures: [
      'pink buds that open into sky-blue trumpet-shaped flowers',
      'oval blue-green leaves',
      'grows in big patches in damp woods',
    ],
    facts: [
      'The flower buds start out pink and turn blue as they open.',
      'Virginia Bluebells are a spring ephemeral — they appear, bloom, and disappear in just a few weeks.',
      'You can find them in the Red River Gorge in April.',
    ],
    wikiSpecies: 'Mertensia_virginica',
    inatTaxonId: 56889,
    photoRoles: ['whole', 'flower', 'leaf'],
  },

  {
    code: 'mayapple',
    commonName: 'Mayapple',
    scientificName: 'Podophyllum peltatum',
    kind: 'flower',
    localTier: 'hyper_local',
    emoji: '🌿',
    seasons: ['spring', 'summer'],
    notableFeatures: [
      'big umbrella-shaped leaf',
      'single white flower hidden under the leaf',
      'green apple-shaped fruit (only ripe fruit is safe — everything else is toxic)',
    ],
    facts: [
      'The leaf looks like a tiny green umbrella.',
      'The white flower hides under the leaf — you have to bend down to see it.',
      'Only the ripe yellow fruit is safe to eat. Every other part of the plant is toxic.',
    ],
    wikiSpecies: 'Podophyllum_peltatum',
    inatTaxonId: 49108,
    photoRoles: ['whole', 'leaf', 'flower', 'fruit'],
  },

  {
    code: 'trillium',
    commonName: 'Trillium',
    scientificName: 'Trillium',
    kind: 'flower',
    localTier: 'hyper_local',
    emoji: '🌸',
    seasons: ['spring'],
    notableFeatures: [
      'three petals',
      'three leaves',
      'one flower per stem, on the forest floor',
    ],
    facts: [
      'Everything about a Trillium comes in threes — three petals, three leaves, three sepals.',
      'Trilliums are spring ephemerals and take up to seven years to bloom for the first time.',
      'Please never pick a Trillium — it might not bloom again for many years.',
    ],
    wikiSpecies: 'Trillium',
    inatTaxonId: 50872,
    photoRoles: ['whole', 'flower', 'leaf'],
  },

  {
    code: 'cardinal_flower',
    commonName: 'Cardinal Flower',
    scientificName: 'Lobelia cardinalis',
    kind: 'flower',
    localTier: 'hyper_local',
    emoji: '🌺',
    seasons: ['summer'],
    notableFeatures: [
      'bright scarlet-red flowers in a tall spike',
      'long pointed dark green leaves',
      'grows near streams and wet meadows',
    ],
    facts: [
      'It is named after the red robes of Catholic cardinals.',
      'Hummingbirds love Cardinal Flowers — the long red tubes fit a hummingbird beak perfectly.',
      'It grows in wet places near streams.',
    ],
    wikiSpecies: 'Lobelia_cardinalis',
    inatTaxonId: 51385,
    photoRoles: ['whole', 'flower', 'leaf'],
  },

  {
    code: 'common_milkweed',
    commonName: 'Common Milkweed',
    scientificName: 'Asclepias syriaca',
    kind: 'flower',
    localTier: 'hyper_local',
    emoji: '🌸',
    seasons: ['summer', 'fall'],
    notableFeatures: [
      'pink-purple ball-shaped flower clusters',
      'broad oval leaves',
      'long pointy seedpods that split open with silky white floss in fall',
    ],
    facts: [
      'Monarch butterflies lay their eggs only on milkweed plants — the caterpillars eat nothing else.',
      'The stems make a sticky white sap that looks like milk if you snap a leaf.',
      'The seedpods split open in fall and float their seeds away on silky white parachutes.',
    ],
    wikiSpecies: 'Asclepias_syriaca',
    inatTaxonId: 54776,
    photoRoles: ['whole', 'flower', 'leaf', 'fruit'],
  },
```

- [ ] **Step 2: Add the final count assertion test**

In `tests/world/floraCatalog.test.ts`, append a new `describe`:

```ts
describe('FLORA_CATALOG — pilot composition', () => {
  it('contains exactly 10 species', () => {
    expect(FLORA_CATALOG.length).toBe(10);
  });

  it('contains 5 trees and 5 flowers', () => {
    const trees = FLORA_CATALOG.filter(f => f.kind === 'tree');
    const flowers = FLORA_CATALOG.filter(f => f.kind === 'flower');
    expect(trees.length).toBe(5);
    expect(flowers.length).toBe(5);
  });

  it('covers all four seasons across the catalog', () => {
    const allSeasons = new Set(FLORA_CATALOG.flatMap(f => f.seasons));
    expect(allSeasons.has('spring')).toBe(true);
    expect(allSeasons.has('summer')).toBe(true);
    expect(allSeasons.has('fall')).toBe(true);
    expect(allSeasons.has('winter')).toBe(true);
  });
});
```

- [ ] **Step 3: Run tests to verify all pass**

Run: `npx vitest run tests/world/floraCatalog.test.ts`
Expected: PASS. All 10 entries pass invariants; composition asserts pass (winter coverage comes from the four trees that include 'winter' in their seasons).

- [ ] **Step 4: Commit**

```bash
git add lib/world/floraCatalog.ts tests/world/floraCatalog.test.ts
git commit -m "feat(naturalist): seed 5 wildflowers — catalog complete for Phase 1"
```

---

## Task 5: Migration 011 — three naturalist tables + RLS

**Files:**
- Create: `lib/supabase/migrations/011_naturalist.sql`

- [ ] **Step 1: Verify migration runner config**

Run: `cat .env.local | grep -E '^DATABASE_URL='`
Expected: a line beginning with `DATABASE_URL=postgresql://...`. If absent, the migration cannot apply — STOP and ask the user to populate `.env.local` from the Supabase dashboard (Settings → Database → Connection String → URI).

- [ ] **Step 2: Write the migration**

Create `lib/supabase/migrations/011_naturalist.sql`:

```sql
-- 011_naturalist.sql
--
-- Schema for the Naturalist Grove module (real-world tree + wildflower
-- identification via dichotomous field-key + spaced repetition).
--
-- Adds three tables:
--   flora_review      — per-learner exposure tracking (SM-2 lite spacing)
--   flora_photo       — per-species curated photos with CC attribution
--   key_node_photo    — generic comparison photos used in the dichotomous key
--
-- Idempotent — uses `if not exists` and `drop policy if exists`.
--
-- Design spec: docs/superpowers/specs/2026-05-29-naturalist-grove-design.md §4

-- ── flora_review ─────────────────────────────────────────────────────
-- One row per (learner, flora_code). exposures + next_review_at drive
-- the spaced-repetition picker in Phase 3.
create table if not exists flora_review (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references learner(id) on delete cascade,
  flora_code text not null,                  -- references FLORA_CATALOG[].code in code
  exposures integer not null default 0,
  last_seen_at timestamptz,
  next_review_at timestamptz,
  ease_factor double precision not null default 2.5,
  photo_roles_seen text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique(learner_id, flora_code)
);

create index if not exists flora_review_due_idx
  on flora_review (learner_id, next_review_at);

alter table flora_review enable row level security;

drop policy if exists "flora_review owned via learner" on flora_review;
create policy "flora_review owned via learner" on flora_review for all using (
  learner_id in (select id from learner where parent_id = auth.uid())
);

-- ── flora_photo ──────────────────────────────────────────────────────
-- Curated photos per (flora_code, role, tier). Photos are NOT picked at
-- runtime from third-party APIs — they are pre-curated, uploaded to
-- Supabase Storage, and metadata is logged here for attribution.
create table if not exists flora_photo (
  id uuid primary key default gen_random_uuid(),
  flora_code text not null,
  role text not null,                        -- 'whole'|'leaf'|'bark'|'flower'|'fruit'
  tier integer not null default 1,           -- 1=clear  2=in-habitat  3=hard
  storage_path text not null,                -- '<flora_code>/<role>_<tier>_<id>.jpg'
  source text not null,                      -- 'inat' | 'wikimedia'
  source_url text not null,
  photographer text,
  license_code text not null,                -- 'cc0'|'cc-by'|'cc-by-sa'
  alt_text text not null,
  created_at timestamptz not null default now(),
  constraint flora_photo_role_valid check (
    role in ('whole','leaf','bark','flower','fruit')
  ),
  constraint flora_photo_tier_valid check (tier between 1 and 3),
  constraint flora_photo_license_valid check (
    license_code in ('cc0','cc-by','cc-by-sa')
  )
);

create index if not exists flora_photo_pick_idx
  on flora_photo (flora_code, role, tier);

alter table flora_photo enable row level security;

-- flora_photo: anyone (even anonymous) can read; only service-role can write.
drop policy if exists "flora_photo public read" on flora_photo;
create policy "flora_photo public read" on flora_photo
  for select using (true);

-- ── key_node_photo ───────────────────────────────────────────────────
-- Generic comparison photos shown in dichotomous-key steps. These are
-- not species-specific — they illustrate features ("here is what a
-- needle looks like, here is what a broad leaf looks like").
create table if not exists key_node_photo (
  id uuid primary key default gen_random_uuid(),
  node_id text not null,                     -- 'root.left', 'broadleaf.lobed_or_simple.right' etc.
  storage_path text not null,
  source text not null,
  source_url text not null,
  photographer text,
  license_code text not null,
  alt_text text not null,
  created_at timestamptz not null default now(),
  constraint key_node_photo_license_valid check (
    license_code in ('cc0','cc-by','cc-by-sa')
  )
);

create index if not exists key_node_photo_node_idx
  on key_node_photo (node_id);

alter table key_node_photo enable row level security;

drop policy if exists "key_node_photo public read" on key_node_photo;
create policy "key_node_photo public read" on key_node_photo
  for select using (true);
```

- [ ] **Step 3: Apply the migration**

Run: `npm run db:migrate`
Expected output (last lines):
```
✓ 011_naturalist.sql applied
✓ All migrations applied
```
If you see a Postgres error about `learner` not existing, check that earlier migrations applied — `001_identity.sql` defines `learner`.

- [ ] **Step 4: Verify the tables and policies exist**

Connect with psql or run this via the supabase studio SQL editor:
```sql
select table_name from information_schema.tables
  where table_schema = 'public'
    and table_name in ('flora_review', 'flora_photo', 'key_node_photo')
  order by table_name;
```
Expected: three rows returned in alphabetical order.

```sql
select schemaname, tablename, policyname from pg_policies
  where tablename in ('flora_review', 'flora_photo', 'key_node_photo')
  order by tablename, policyname;
```
Expected: three rows — one policy per table.

- [ ] **Step 5: Commit**

```bash
git add lib/supabase/migrations/011_naturalist.sql
git commit -m "feat(naturalist): migration 011 — flora_review + flora_photo + key_node_photo"
```

---

## Task 6: Integration test — flora_review insert/read round-trip

**Files:**
- Create: `tests/naturalist/floraSchema.test.ts`
- Modify: `vitest.config.ts` (only if `tests/naturalist/` is not already covered by the include glob — it is via `tests/**/*.test.{ts,tsx}`, so no edit needed)

This test verifies the migration produced a usable schema by inserting a row, reading it back, updating it, and cleaning up. It runs against the dev DB so `DATABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`) must be set in `.env.local`.

- [ ] **Step 1: Inspect the existing tests/setup.ts to understand env-loading conventions**

Run: `cat tests/setup.ts`
If it already loads `dotenv` from `.env.local`, the new test will pick env vars up automatically. If not, the test below loads them itself via `dotenv/config`.

- [ ] **Step 2: Write the failing test**

Create `tests/naturalist/floraSchema.test.ts`:

```ts
import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Skip the whole suite if the dev DB isn't configured locally — CI
// without supabase creds shouldn't fail this. Run locally to exercise.
const RUN = !!(URL && KEY);

describe.skipIf(!RUN)('flora_review — schema round-trip', () => {
  let supabase: SupabaseClient;
  let learnerId: string;
  let createdRowId: string | null = null;

  beforeAll(async () => {
    supabase = createClient(URL!, KEY!);
    // Reuse an existing learner row — the integration test does not
    // create or delete a learner because that cascades to many tables.
    const { data: learners, error } = await supabase
      .from('learner').select('id').limit(1);
    if (error) throw error;
    if (!learners || learners.length === 0) {
      throw new Error(
        'No learner rows exist in the dev DB. Run `npm run db:seed` first.'
      );
    }
    learnerId = learners[0].id;
  });

  afterAll(async () => {
    if (createdRowId) {
      await supabase.from('flora_review').delete().eq('id', createdRowId);
    }
  });

  it('accepts an insert with all required columns', async () => {
    const { data, error } = await supabase
      .from('flora_review')
      .insert({
        learner_id: learnerId,
        flora_code: 'test_pilot_species',
        exposures: 1,
        last_seen_at: new Date().toISOString(),
        next_review_at: new Date(Date.now() + 86_400_000).toISOString(),
        photo_roles_seen: ['leaf'],
      })
      .select('id, exposures, photo_roles_seen')
      .single();

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.exposures).toBe(1);
    expect(data!.photo_roles_seen).toEqual(['leaf']);
    createdRowId = data!.id;
  });

  it('updates exposures + photo_roles_seen on subsequent identifications', async () => {
    expect(createdRowId).not.toBeNull();
    const { data, error } = await supabase
      .from('flora_review')
      .update({
        exposures: 2,
        photo_roles_seen: ['leaf', 'bark'],
        last_seen_at: new Date().toISOString(),
      })
      .eq('id', createdRowId!)
      .select('exposures, photo_roles_seen')
      .single();

    expect(error).toBeNull();
    expect(data!.exposures).toBe(2);
    expect(data!.photo_roles_seen).toEqual(['leaf', 'bark']);
  });

  it('rejects a second insert for the same (learner, flora_code)', async () => {
    const { error } = await supabase
      .from('flora_review')
      .insert({
        learner_id: learnerId,
        flora_code: 'test_pilot_species',  // duplicate
        exposures: 1,
      });

    // Postgres unique violation code is 23505
    expect(error).not.toBeNull();
    expect(error!.code).toBe('23505');
  });
});
```

- [ ] **Step 3: Run the test**

Run: `npx vitest run tests/naturalist/floraSchema.test.ts`

If `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`:
Expected: PASS — 3 tests pass.

If those env vars are absent:
Expected: SKIP — vitest reports the suite as skipped (`describe.skipIf(!RUN)`). That is intentional behavior so CI without secrets does not fail.

- [ ] **Step 4: Commit**

```bash
git add tests/naturalist/floraSchema.test.ts
git commit -m "test(naturalist): flora_review schema round-trip integration test"
```

---

## Task 7: iNaturalist client helper + unit test

**Files:**
- Create: `scripts/naturalist/inatClient.ts`
- Create: `tests/naturalist/inatClient.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/naturalist/inatClient.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  buildInatObservationsUrl,
  parseInatResponse,
  largeUrlFor,
  type InatPhoto,
} from '@/scripts/naturalist/inatClient';

describe('inatClient.buildInatObservationsUrl', () => {
  it('builds a URL with taxon_id + research-grade + CC licenses', () => {
    const url = buildInatObservationsUrl({ taxonId: 47561, perPage: 50 });
    expect(url).toContain('https://api.inaturalist.org/v1/observations');
    expect(url).toContain('taxon_id=47561');
    expect(url).toContain('quality_grade=research');
    expect(url).toContain('photos=true');
    expect(url).toContain('per_page=50');
    expect(url).toContain('order_by=votes');
    expect(url).toContain('license=cc0%2Ccc-by%2Ccc-by-sa');
  });

  it('caps perPage at 200 (iNat API limit)', () => {
    const url = buildInatObservationsUrl({ taxonId: 1, perPage: 9999 });
    expect(url).toContain('per_page=200');
  });

  it('defaults perPage to 100', () => {
    const url = buildInatObservationsUrl({ taxonId: 1 });
    expect(url).toContain('per_page=100');
  });
});

describe('inatClient.largeUrlFor', () => {
  it('converts a square.jpg URL into a large.jpg URL', () => {
    const small = 'https://static.inaturalist.org/photos/123/square.jpg?12345';
    expect(largeUrlFor(small)).toBe(
      'https://static.inaturalist.org/photos/123/large.jpg?12345'
    );
  });

  it('preserves non-square URLs unchanged', () => {
    const original = 'https://static.inaturalist.org/photos/123/original.jpeg';
    expect(largeUrlFor(original)).toBe(
      'https://static.inaturalist.org/photos/123/large.jpeg'
    );
  });
});

describe('inatClient.parseInatResponse', () => {
  it('extracts photo metadata from a typical observations response', () => {
    const raw = {
      total_results: 1,
      results: [{
        id: 99,
        uri: 'https://www.inaturalist.org/observations/99',
        taxon: { id: 47561, name: 'Pinus strobus' },
        photos: [
          {
            id: 500,
            license_code: 'cc-by',
            attribution: '(c) Pat Patterson, some rights reserved (CC BY)',
            url: 'https://static.inaturalist.org/photos/500/square.jpg',
            original_dimensions: { width: 2000, height: 1500 },
          },
          {
            id: 501,
            license_code: 'cc-by-nc',  // not in allowed list
            attribution: '(c) X, CC BY-NC',
            url: 'https://static.inaturalist.org/photos/501/square.jpg',
          },
        ],
      }],
    };

    const photos: InatPhoto[] = parseInatResponse(raw);

    expect(photos).toHaveLength(1);
    expect(photos[0].id).toBe(500);
    expect(photos[0].licenseCode).toBe('cc-by');
    expect(photos[0].photographer).toBe('Pat Patterson');
    expect(photos[0].largeUrl).toContain('/photos/500/large.jpg');
    expect(photos[0].observationUrl).toBe(
      'https://www.inaturalist.org/observations/99'
    );
  });

  it('returns an empty array when there are no results', () => {
    expect(parseInatResponse({ total_results: 0, results: [] })).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/naturalist/inatClient.test.ts`
Expected: FAIL with "Cannot find module '@/scripts/naturalist/inatClient'".

- [ ] **Step 3: Implement the client**

Create `scripts/naturalist/inatClient.ts`:

```ts
// scripts/naturalist/inatClient.ts
//
// Thin wrapper around the iNaturalist v1 API for the Naturalist Grove
// photo-harvest pipeline. Pure functions only — no I/O lives here; the
// caller (`scripts/seed-flora-photos.ts`) does fetch + file writes.
//
// API reference: https://api.inaturalist.org/v1/docs/

const ALLOWED_LICENSES = ['cc0', 'cc-by', 'cc-by-sa'] as const;
type AllowedLicense = (typeof ALLOWED_LICENSES)[number];

export interface InatPhoto {
  id: number;
  largeUrl: string;             // resolved /large.jpg variant
  licenseCode: AllowedLicense;
  photographer: string;         // attribution string with "(c) " and license stripped
  attributionRaw: string;
  observationUrl: string;
  width?: number;
  height?: number;
}

export interface BuildOptions {
  taxonId: number;
  perPage?: number;             // default 100, max 200
}

export function buildInatObservationsUrl(opts: BuildOptions): string {
  const perPage = Math.min(opts.perPage ?? 100, 200);
  const u = new URL('https://api.inaturalist.org/v1/observations');
  u.searchParams.set('taxon_id', String(opts.taxonId));
  u.searchParams.set('quality_grade', 'research');
  u.searchParams.set('photos', 'true');
  u.searchParams.set('order_by', 'votes');
  u.searchParams.set('per_page', String(perPage));
  u.searchParams.set('license', ALLOWED_LICENSES.join(','));
  return u.toString();
}

export function largeUrlFor(squareOrOriginalUrl: string): string {
  // iNat photo URLs follow the pattern:
  //   https://static.inaturalist.org/photos/<id>/<variant>.<ext>?<cache-buster>
  // Variants: square (75px), small (240px), medium (500px), large (1024px), original.
  return squareOrOriginalUrl.replace(
    /\/(square|small|medium|original)\.(jpg|jpeg|png)/i,
    '/large.$2'
  );
}

function stripAttribution(raw: string): string {
  // Typical iNat format: "(c) Pat Patterson, some rights reserved (CC BY)"
  // We extract just "Pat Patterson".
  const m = raw.match(/^\(c\)\s*([^,]+?)\s*,/);
  return m ? m[1].trim() : raw.trim();
}

function isAllowedLicense(code: string): code is AllowedLicense {
  return (ALLOWED_LICENSES as readonly string[]).includes(code);
}

export function parseInatResponse(raw: unknown): InatPhoto[] {
  const r = raw as {
    results?: Array<{
      id: number;
      uri: string;
      photos?: Array<{
        id: number;
        license_code?: string | null;
        attribution?: string;
        url?: string;
        original_dimensions?: { width: number; height: number };
      }>;
    }>;
  };

  const out: InatPhoto[] = [];
  if (!Array.isArray(r.results)) return out;

  for (const obs of r.results) {
    if (!Array.isArray(obs.photos)) continue;
    for (const p of obs.photos) {
      const lic = p.license_code ?? '';
      if (!isAllowedLicense(lic)) continue;
      if (!p.url) continue;
      out.push({
        id: p.id,
        largeUrl: largeUrlFor(p.url),
        licenseCode: lic,
        photographer: stripAttribution(p.attribution ?? 'Unknown'),
        attributionRaw: p.attribution ?? '',
        observationUrl: obs.uri,
        width: p.original_dimensions?.width,
        height: p.original_dimensions?.height,
      });
    }
  }
  return out;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/naturalist/inatClient.test.ts`
Expected: PASS — 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add scripts/naturalist/inatClient.ts tests/naturalist/inatClient.test.ts
git commit -m "feat(naturalist): iNaturalist client helper + tests"
```

---

## Task 8: Wikimedia Commons client helper + unit test

**Files:**
- Create: `scripts/naturalist/wikimediaClient.ts`
- Create: `tests/naturalist/wikimediaClient.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/naturalist/wikimediaClient.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  buildWikimediaCategoryUrl,
  parseWikimediaResponse,
  type WikimediaPhoto,
} from '@/scripts/naturalist/wikimediaClient';

describe('wikimediaClient.buildWikimediaCategoryUrl', () => {
  it('builds a URL targeting the species category with imageinfo', () => {
    const url = buildWikimediaCategoryUrl('Pinus_strobus');
    expect(url).toContain('https://commons.wikimedia.org/w/api.php');
    expect(url).toContain('action=query');
    expect(url).toContain('generator=categorymembers');
    expect(url).toContain('gcmtitle=Category%3APinus_strobus');
    expect(url).toContain('gcmtype=file');
    expect(url).toContain('prop=imageinfo');
    expect(url).toContain('iiprop=url%7Cextmetadata');
    expect(url).toContain('format=json');
    expect(url).toContain('formatversion=2');
  });
});

describe('wikimediaClient.parseWikimediaResponse', () => {
  it('extracts CC-licensed photos and strips HTML from Artist', () => {
    const raw = {
      query: {
        pages: [
          {
            pageid: 123,
            title: 'File:Pinus strobus needles.jpg',
            imageinfo: [{
              url: 'https://upload.wikimedia.org/wikipedia/commons/a/b/Pinus_strobus_needles.jpg',
              descriptionurl: 'https://commons.wikimedia.org/wiki/File:Pinus_strobus_needles.jpg',
              extmetadata: {
                LicenseShortName: { value: 'CC BY-SA 4.0' },
                Artist: { value: '<a href="//commons.wikimedia.org/wiki/User:Jane">Jane Doe</a>' },
              },
            }],
          },
          {
            pageid: 456,
            title: 'File:Pinus strobus protected.jpg',
            imageinfo: [{
              url: 'https://upload.wikimedia.org/wikipedia/commons/.../x.jpg',
              descriptionurl: 'https://commons.wikimedia.org/wiki/File:Pinus_strobus_protected.jpg',
              extmetadata: {
                LicenseShortName: { value: 'All rights reserved' },
                Artist: { value: 'Someone' },
              },
            }],
          },
        ],
      },
    };

    const photos: WikimediaPhoto[] = parseWikimediaResponse(raw);

    expect(photos).toHaveLength(1);
    expect(photos[0].pageId).toBe(123);
    expect(photos[0].title).toBe('File:Pinus strobus needles.jpg');
    expect(photos[0].photographer).toBe('Jane Doe');
    expect(photos[0].licenseCode).toBe('cc-by-sa');
    expect(photos[0].directUrl).toContain('Pinus_strobus_needles.jpg');
    expect(photos[0].sourceUrl).toBe(
      'https://commons.wikimedia.org/wiki/File:Pinus_strobus_needles.jpg'
    );
  });

  it('returns empty array when query.pages is missing', () => {
    expect(parseWikimediaResponse({})).toEqual([]);
    expect(parseWikimediaResponse({ query: {} })).toEqual([]);
  });

  it('handles old formatversion=1 page structure (object map)', () => {
    const raw = {
      query: {
        pages: {
          '123': {
            pageid: 123,
            title: 'File:Foo.jpg',
            imageinfo: [{
              url: 'https://upload.wikimedia.org/x/Foo.jpg',
              descriptionurl: 'https://commons.wikimedia.org/wiki/File:Foo.jpg',
              extmetadata: {
                LicenseShortName: { value: 'CC0' },
                Artist: { value: 'Anon' },
              },
            }],
          },
        },
      },
    };
    const photos = parseWikimediaResponse(raw);
    expect(photos).toHaveLength(1);
    expect(photos[0].licenseCode).toBe('cc0');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/naturalist/wikimediaClient.test.ts`
Expected: FAIL with "Cannot find module '@/scripts/naturalist/wikimediaClient'".

- [ ] **Step 3: Implement the client**

Create `scripts/naturalist/wikimediaClient.ts`:

```ts
// scripts/naturalist/wikimediaClient.ts
//
// Thin wrapper around the Wikimedia Commons MediaWiki API for the
// Naturalist Grove photo-harvest pipeline. Pure functions only.
//
// API reference: https://commons.wikimedia.org/w/api.php

type AllowedLicense = 'cc0' | 'cc-by' | 'cc-by-sa';

export interface WikimediaPhoto {
  pageId: number;
  title: string;
  directUrl: string;            // upload.wikimedia.org/...
  sourceUrl: string;            // commons.wikimedia.org/wiki/File:...
  photographer: string;
  licenseCode: AllowedLicense;
}

export function buildWikimediaCategoryUrl(speciesCategory: string): string {
  const u = new URL('https://commons.wikimedia.org/w/api.php');
  u.searchParams.set('action', 'query');
  u.searchParams.set('generator', 'categorymembers');
  u.searchParams.set('gcmtitle', `Category:${speciesCategory}`);
  u.searchParams.set('gcmtype', 'file');
  u.searchParams.set('gcmlimit', '50');
  u.searchParams.set('prop', 'imageinfo');
  u.searchParams.set('iiprop', 'url|extmetadata');
  u.searchParams.set('format', 'json');
  u.searchParams.set('formatversion', '2');
  return u.toString();
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function classifyLicense(shortName: string): AllowedLicense | null {
  const s = shortName.toLowerCase();
  if (s.startsWith('cc0') || s.includes('public domain')) return 'cc0';
  if (s.includes('cc by-sa') || s.includes('cc-by-sa')) return 'cc-by-sa';
  if (s.includes('cc by') || s.includes('cc-by')) {
    // Reject NC + ND variants — design spec keeps strict CC0/CC-BY/CC-BY-SA.
    if (s.includes('-nc') || s.includes(' nc') || s.includes('-nd') || s.includes(' nd')) {
      return null;
    }
    return 'cc-by';
  }
  return null;
}

export function parseWikimediaResponse(raw: unknown): WikimediaPhoto[] {
  const r = raw as { query?: { pages?: unknown } };
  if (!r.query || r.query.pages == null) return [];

  // formatversion=2 returns pages as an array; formatversion=1 returns an object map.
  const pagesIter: Array<{
    pageid?: number;
    title?: string;
    imageinfo?: Array<{
      url?: string;
      descriptionurl?: string;
      extmetadata?: Record<string, { value?: string }>;
    }>;
  }> = Array.isArray(r.query.pages)
    ? (r.query.pages as Array<any>)
    : Object.values(r.query.pages as Record<string, any>);

  const out: WikimediaPhoto[] = [];
  for (const p of pagesIter) {
    const info = p.imageinfo?.[0];
    if (!info?.url || !info.descriptionurl) continue;

    const licenseRaw = info.extmetadata?.LicenseShortName?.value ?? '';
    const licenseCode = classifyLicense(licenseRaw);
    if (!licenseCode) continue;

    const artistRaw = info.extmetadata?.Artist?.value ?? 'Unknown';
    out.push({
      pageId: p.pageid ?? 0,
      title: p.title ?? '',
      directUrl: info.url,
      sourceUrl: info.descriptionurl,
      photographer: stripHtml(artistRaw),
      licenseCode,
    });
  }
  return out;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/naturalist/wikimediaClient.test.ts`
Expected: PASS — 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add scripts/naturalist/wikimediaClient.ts tests/naturalist/wikimediaClient.test.ts
git commit -m "feat(naturalist): Wikimedia Commons client helper + tests"
```

---

## Task 9: seed-flora-photos.ts CLI — harvest candidates to staging

**Files:**
- Create: `scripts/seed-flora-photos.ts`
- Create: `scripts/staging/.gitignore`
- Create: `scripts/staging/.gitkeep`

- [ ] **Step 1: Verify scripts/staging will be present + ignored**

Create `scripts/staging/.gitignore`:

```gitignore
# Ignore everything in staging EXCEPT:
#  - the .gitkeep that makes the dir exist
#  - selections.json files (the hand-edited tagging output)
#  - the .gitignore itself
*
!.gitignore
!.gitkeep
!*/
!*/selections.json
```

Create `scripts/staging/.gitkeep` (empty file):

```bash
touch scripts/staging/.gitkeep
```

- [ ] **Step 2: Write the harvest script**

Create `scripts/seed-flora-photos.ts`:

```ts
#!/usr/bin/env tsx
/**
 * Harvests CC-licensed candidate photos for one or all flora species
 * from iNaturalist and Wikimedia Commons. Stages results under
 *   scripts/staging/<flora_code>/
 * with a candidates.json describing each file's source, photographer,
 * license, and original URL.
 *
 * Usage:
 *   npm run naturalist:harvest -- --species tulip_poplar
 *   npm run naturalist:harvest -- --all
 *
 * After running, hand-author selections.json (see docs/naturalist-photo-curation.md)
 * then run `npm run naturalist:upload -- --species <code>`.
 */

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { FLORA_CATALOG, type FloraData } from '../lib/world/floraCatalog';
import { buildInatObservationsUrl, parseInatResponse, type InatPhoto } from './naturalist/inatClient';
import { buildWikimediaCategoryUrl, parseWikimediaResponse, type WikimediaPhoto } from './naturalist/wikimediaClient';

const STAGING_ROOT = join(process.cwd(), 'scripts', 'staging');

interface CandidateRecord {
  source: 'inat' | 'wikimedia';
  filename: string;             // relative to scripts/staging/<flora_code>/
  photographer: string;
  licenseCode: string;
  sourceUrl: string;
  originalDownloadUrl: string;
}

function parseArgs(): { species: string[]; all: boolean } {
  const args = process.argv.slice(2);
  const species: string[] = [];
  let all = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--all') { all = true; continue; }
    if (args[i] === '--species' && args[i + 1]) {
      species.push(args[i + 1]);
      i++;
    }
  }
  return { species, all };
}

async function downloadPhoto(url: string, outPath: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Download failed (${res.status}): ${url}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(outPath, buf);
}

async function harvestSpecies(species: FloraData): Promise<void> {
  const dir = join(STAGING_ROOT, species.code);
  await mkdir(dir, { recursive: true });
  console.log(`\n→ ${species.code} (${species.commonName})`);

  const records: CandidateRecord[] = [];

  // ── iNaturalist ──────────────────────────────────────────────────
  try {
    const inatUrl = buildInatObservationsUrl({ taxonId: species.inatTaxonId, perPage: 50 });
    console.log(`  • iNat: ${inatUrl}`);
    const res = await fetch(inatUrl);
    if (!res.ok) throw new Error(`iNat HTTP ${res.status}`);
    const json = await res.json();
    const photos: InatPhoto[] = parseInatResponse(json);
    console.log(`    → ${photos.length} CC-licensed candidates`);

    // Limit to 20 per source per species to keep staging dir manageable
    for (const p of photos.slice(0, 20)) {
      const filename = `inat_${p.id}.jpg`;
      const out = join(dir, filename);
      if (existsSync(out)) {
        console.log(`    ↳ skip ${filename} (already downloaded)`);
      } else {
        await downloadPhoto(p.largeUrl, out);
        console.log(`    ↳ saved ${filename}`);
      }
      records.push({
        source: 'inat',
        filename,
        photographer: p.photographer,
        licenseCode: p.licenseCode,
        sourceUrl: p.observationUrl,
        originalDownloadUrl: p.largeUrl,
      });
    }
  } catch (e) {
    console.error(`  ! iNat failed for ${species.code}:`, (e as Error).message);
  }

  // ── Wikimedia Commons ────────────────────────────────────────────
  try {
    const wikiUrl = buildWikimediaCategoryUrl(species.wikiSpecies);
    console.log(`  • Wikimedia: ${wikiUrl}`);
    const res = await fetch(wikiUrl);
    if (!res.ok) throw new Error(`Wikimedia HTTP ${res.status}`);
    const json = await res.json();
    const photos: WikimediaPhoto[] = parseWikimediaResponse(json);
    console.log(`    → ${photos.length} CC-licensed candidates`);

    for (const p of photos.slice(0, 20)) {
      const ext = (p.directUrl.match(/\.(jpg|jpeg|png|webp)(\?|$)/i)?.[1] ?? 'jpg').toLowerCase();
      const filename = `wikimedia_${p.pageId}.${ext}`;
      const out = join(dir, filename);
      if (existsSync(out)) {
        console.log(`    ↳ skip ${filename} (already downloaded)`);
      } else {
        await downloadPhoto(p.directUrl, out);
        console.log(`    ↳ saved ${filename}`);
      }
      records.push({
        source: 'wikimedia',
        filename,
        photographer: p.photographer,
        licenseCode: p.licenseCode,
        sourceUrl: p.sourceUrl,
        originalDownloadUrl: p.directUrl,
      });
    }
  } catch (e) {
    console.error(`  ! Wikimedia failed for ${species.code}:`, (e as Error).message);
  }

  // ── Merge into candidates.json (additive) ────────────────────────
  const candidatesPath = join(dir, 'candidates.json');
  let existing: CandidateRecord[] = [];
  if (existsSync(candidatesPath)) {
    try { existing = JSON.parse(await readFile(candidatesPath, 'utf-8')); } catch {}
  }
  const byFilename = new Map<string, CandidateRecord>();
  for (const r of existing) byFilename.set(r.filename, r);
  for (const r of records) byFilename.set(r.filename, r);  // newer wins
  const merged = Array.from(byFilename.values());
  await writeFile(candidatesPath, JSON.stringify(merged, null, 2));
  console.log(`  ✓ ${merged.length} candidates total in ${candidatesPath}`);
}

async function main() {
  const { species, all } = parseArgs();
  if (!all && species.length === 0) {
    console.error('Usage:');
    console.error('  npm run naturalist:harvest -- --species <code>');
    console.error('  npm run naturalist:harvest -- --all');
    process.exit(1);
  }

  const targets = all
    ? FLORA_CATALOG
    : FLORA_CATALOG.filter(f => species.includes(f.code));

  if (targets.length === 0) {
    console.error(`No matching species in FLORA_CATALOG for: ${species.join(', ')}`);
    process.exit(1);
  }

  console.log(`Harvesting ${targets.length} species...`);
  for (const sp of targets) {
    await harvestSpecies(sp);
  }
  console.log(`\n✓ Done. Hand-edit selections.json in each species dir to choose role + tier.`);
  console.log(`  See docs/naturalist-photo-curation.md for the format.`);
}

main().catch(e => { console.error(e); process.exit(1); });
```

- [ ] **Step 3: Add the npm script**

Edit `package.json` (in the `"scripts"` block, after `"db:seed"`):

```json
    "db:seed": "tsx scripts/seed.ts",
    "naturalist:harvest": "tsx scripts/seed-flora-photos.ts",
    "naturalist:upload": "tsx scripts/upload-flora-photos.ts"
```

- [ ] **Step 4: Smoke-test with one species (network-dependent)**

Run: `npm run naturalist:harvest -- --species tulip_poplar`

Expected output (abridged):
```
Harvesting 1 species...

→ tulip_poplar (Tulip Poplar)
  • iNat: https://api.inaturalist.org/v1/observations?...
    → N CC-licensed candidates
    ↳ saved inat_xxxx.jpg
    ...
  • Wikimedia: https://commons.wikimedia.org/w/api.php?...
    → M CC-licensed candidates
    ...
  ✓ K candidates total in scripts/staging/tulip_poplar/candidates.json

✓ Done. Hand-edit selections.json in each species dir to choose role + tier.
```

Verify: `ls scripts/staging/tulip_poplar/` shows downloaded `.jpg` files and `candidates.json`.

If the iNat or Wikimedia call fails (rate-limited, offline), the script logs the error and continues with the other source — the test is just that *some* candidates land.

- [ ] **Step 5: Commit**

```bash
git add scripts/seed-flora-photos.ts scripts/staging/.gitkeep scripts/staging/.gitignore package.json
git commit -m "feat(naturalist): seed-flora-photos.ts CLI — harvest candidates from iNat + Wikimedia"
```

(Note: the downloaded `.jpg`s under `scripts/staging/tulip_poplar/` should NOT be committed — they are ignored by `scripts/staging/.gitignore`. Verify with `git status`.)

---

## Task 10: upload-flora-photos.ts CLI — selections.json → Storage + DB

**Files:**
- Create: `scripts/upload-flora-photos.ts`

The intermediate **manual tagging step** between harvest and upload is a hand-edited `selections.json` file the curator creates per species. Format example (shown in the docs Task 12 — engineer reads docs first if confused).

- [ ] **Step 1: Write the upload script**

Create `scripts/upload-flora-photos.ts`:

```ts
#!/usr/bin/env tsx
/**
 * Reads a hand-authored selections.json under scripts/staging/<code>/,
 * uploads each chosen photo to the Supabase Storage `flora-photos`
 * bucket, and inserts one flora_photo row per upload.
 *
 * selections.json format (see docs/naturalist-photo-curation.md):
 *   [
 *     {
 *       "filename": "inat_500.jpg",
 *       "role": "leaf",           // 'whole'|'leaf'|'bark'|'flower'|'fruit'
 *       "tier": 1,                // 1|2|3
 *       "altText": "Eastern White Pine, single five-needle bundle"
 *     },
 *     ...
 *   ]
 *
 * Re-runnable: if a flora_photo row already exists with the same
 * (flora_code, role, tier, storage_path), the script skips it.
 *
 * Usage:
 *   npm run naturalist:upload -- --species tulip_poplar
 *   npm run naturalist:upload -- --all
 */

import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { FLORA_CATALOG, type FloraData, type PhotoRole } from '../lib/world/floraCatalog';

const BUCKET = 'flora-photos';
const STAGING_ROOT = join(process.cwd(), 'scripts', 'staging');

interface SelectionRecord {
  filename: string;
  role: PhotoRole;
  tier: 1 | 2 | 3;
  altText: string;
}

interface CandidateRecord {
  source: 'inat' | 'wikimedia';
  filename: string;
  photographer: string;
  licenseCode: string;
  sourceUrl: string;
  originalDownloadUrl: string;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('✗ NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

function parseArgs(): { species: string[]; all: boolean } {
  const args = process.argv.slice(2);
  const species: string[] = [];
  let all = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--all') { all = true; continue; }
    if (args[i] === '--species' && args[i + 1]) {
      species.push(args[i + 1]);
      i++;
    }
  }
  return { species, all };
}

async function ensureBucket(): Promise<void> {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw error;
  if (buckets?.some(b => b.name === BUCKET)) {
    console.log(`✓ Bucket '${BUCKET}' already exists`);
    return;
  }
  console.log(`→ Creating bucket '${BUCKET}' (public read)`);
  const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,  // 10 MB per photo
  });
  if (createErr) throw createErr;
  console.log(`✓ Bucket '${BUCKET}' created`);
}

async function uploadSpecies(species: FloraData): Promise<void> {
  const dir = join(STAGING_ROOT, species.code);
  const selPath = join(dir, 'selections.json');
  const candPath = join(dir, 'candidates.json');

  if (!existsSync(selPath)) {
    console.log(`  ↳ skip ${species.code} (no selections.json — nothing to upload)`);
    return;
  }
  if (!existsSync(candPath)) {
    console.error(`  ! ${species.code}: candidates.json missing — re-run harvest first`);
    return;
  }

  const selections: SelectionRecord[] = JSON.parse(await readFile(selPath, 'utf-8'));
  const candidates: CandidateRecord[] = JSON.parse(await readFile(candPath, 'utf-8'));
  const candByFile = new Map(candidates.map(c => [c.filename, c]));

  console.log(`\n→ ${species.code} (${selections.length} selections)`);

  for (const sel of selections) {
    const cand = candByFile.get(sel.filename);
    if (!cand) {
      console.error(`  ! ${sel.filename} listed in selections.json but not in candidates.json — skipping`);
      continue;
    }
    const sourceFile = join(dir, sel.filename);
    if (!existsSync(sourceFile)) {
      console.error(`  ! ${sourceFile} missing on disk — skipping`);
      continue;
    }

    const ext = extname(sel.filename).replace('.', '').toLowerCase() || 'jpg';
    const storagePath = `${species.code}/${sel.role}_${sel.tier}_${cand.source}_${cand.filename.replace(/\.[^.]+$/, '')}.${ext}`;

    // Check if already exists in DB (idempotent skip)
    const { data: existing } = await supabase
      .from('flora_photo')
      .select('id')
      .eq('storage_path', storagePath)
      .maybeSingle();
    if (existing) {
      console.log(`  ↳ skip ${storagePath} (already in DB)`);
      continue;
    }

    // Upload to Storage (upsert so re-runs replace bytes)
    const bytes = await readFile(sourceFile);
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, bytes, {
        contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        upsert: true,
      });
    if (upErr) {
      console.error(`  ! upload failed for ${storagePath}: ${upErr.message}`);
      continue;
    }

    // Insert metadata row
    const { error: insErr } = await supabase.from('flora_photo').insert({
      flora_code: species.code,
      role: sel.role,
      tier: sel.tier,
      storage_path: storagePath,
      source: cand.source,
      source_url: cand.sourceUrl,
      photographer: cand.photographer,
      license_code: cand.licenseCode,
      alt_text: sel.altText,
    });
    if (insErr) {
      console.error(`  ! DB insert failed for ${storagePath}: ${insErr.message}`);
      // Roll back the upload to avoid orphaned Storage objects
      await supabase.storage.from(BUCKET).remove([storagePath]);
      continue;
    }
    console.log(`  ✓ ${storagePath}`);
  }
}

async function main() {
  const { species, all } = parseArgs();
  if (!all && species.length === 0) {
    console.error('Usage:');
    console.error('  npm run naturalist:upload -- --species <code>');
    console.error('  npm run naturalist:upload -- --all');
    process.exit(1);
  }

  await ensureBucket();

  const targets = all
    ? FLORA_CATALOG
    : FLORA_CATALOG.filter(f => species.includes(f.code));

  if (targets.length === 0) {
    console.error(`No matching species in FLORA_CATALOG for: ${species.join(', ')}`);
    process.exit(1);
  }

  for (const sp of targets) {
    await uploadSpecies(sp);
  }
  console.log(`\n✓ Done.`);
}

main().catch(e => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Smoke-test the bucket-creation path**

Make sure there are no selections.json files yet (so the script does the bucket-create then exits without uploads).

Run: `npm run naturalist:upload -- --species tulip_poplar`

Expected output:
```
→ Creating bucket 'flora-photos' (public read)
✓ Bucket 'flora-photos' created

→ tulip_poplar (0 selections)
  ↳ skip tulip_poplar (no selections.json — nothing to upload)

✓ Done.
```

Subsequent runs report `✓ Bucket 'flora-photos' already exists`. Verify in Supabase Studio: Storage → buckets → `flora-photos` exists with public read.

- [ ] **Step 3: Smoke-test with one real selection**

Hand-author `scripts/staging/tulip_poplar/selections.json` with ONE entry pointing at a real downloaded filename. Use a filename from `candidates.json`:

```json
[
  {
    "filename": "inat_REAL_ID_HERE.jpg",
    "role": "leaf",
    "tier": 1,
    "altText": "Tulip Poplar leaf, four-lobed flat-top, clear reference"
  }
]
```

Run: `npm run naturalist:upload -- --species tulip_poplar`

Expected output (abridged):
```
✓ Bucket 'flora-photos' already exists

→ tulip_poplar (1 selections)
  ✓ tulip_poplar/leaf_1_inat_inat_REAL_ID_HERE.jpg

✓ Done.
```

Verify via Supabase Studio:
1. Storage: a file exists at `flora-photos/tulip_poplar/leaf_1_inat_inat_REAL_ID_HERE.jpg`.
2. SQL editor: `select * from flora_photo where flora_code = 'tulip_poplar';` returns one row with `role='leaf'`, `tier=1`, `license_code='cc-by'` (or whatever the source reported).
3. Open the public URL in a browser (Storage → click file → Get URL → public URL) and confirm the photo loads.

- [ ] **Step 4: Re-run idempotency check**

Run the same upload command again: `npm run naturalist:upload -- --species tulip_poplar`
Expected: `↳ skip tulip_poplar/leaf_1_inat_... (already in DB)` — no duplicate row created.

- [ ] **Step 5: Commit (without selections.json from smoke test)**

```bash
git add scripts/upload-flora-photos.ts
git commit -m "feat(naturalist): upload-flora-photos.ts CLI — selections to Storage + DB"
```

(Note: the smoke-test selections.json IS git-tracked per `.gitignore` rules above; commit it if you want to preserve the example, or delete it before the final phase-1 wrap so each species gets a real, curated selections.json later.)

---

## Task 11: Curation workflow documentation

**Files:**
- Create: `docs/naturalist-photo-curation.md`

- [ ] **Step 1: Write the doc**

Create `docs/naturalist-photo-curation.md`:

```markdown
# Naturalist Grove — Photo Curation Workflow

This is the V1 hand-curated workflow for the Naturalist Grove module.
Phase 5 will replace it with a parent-zone admin UI; for now, curation
is done with a text editor + the two CLIs below.

## One-time setup

Make sure these are set in `.env.local`:

```
DATABASE_URL=postgresql://postgres:...@db.xxx.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ey...
```

Get them from Supabase Dashboard → Settings → API and Settings → Database → Connection String.

## Workflow per species

### 1. Harvest candidates from iNat + Wikimedia

```bash
npm run naturalist:harvest -- --species tulip_poplar
```

This downloads up to 40 CC-licensed candidate photos (20 from each
source) into `scripts/staging/tulip_poplar/` and writes
`candidates.json` listing every photo with its photographer, license,
and source URL.

The downloaded `.jpg` files are git-ignored. `candidates.json` and
`selections.json` (next step) are tracked.

### 2. Review the candidates in your file browser

Open `scripts/staging/tulip_poplar/` and look through each downloaded
photo. Decide which ones to keep, what role each one shows, and how
hard it is to read at a glance.

### 3. Author selections.json

Create `scripts/staging/tulip_poplar/selections.json` with one entry
per photo you want in the app. Each entry needs:

- `filename`: the file in this directory you are tagging (must also
  appear in `candidates.json`)
- `role`: one of `whole`, `leaf`, `bark`, `flower`, `fruit`
- `tier`: difficulty — `1` (clear isolated reference), `2` (in
  habitat with other plants visible), or `3` (partial view, hard
  lighting, season variant)
- `altText`: short description for screen readers (`"<commonName>
  <role>, <one-liner>"` is a good template)

Example:

```json
[
  {
    "filename": "inat_104857.jpg",
    "role": "leaf",
    "tier": 1,
    "altText": "Tulip Poplar leaf, four-lobed flat-top, clear reference"
  },
  {
    "filename": "wikimedia_22198.jpg",
    "role": "flower",
    "tier": 1,
    "altText": "Tulip Poplar flower close-up, orange band on greenish petals"
  },
  {
    "filename": "inat_5582901.jpg",
    "role": "bark",
    "tier": 1,
    "altText": "Tulip Poplar bark, straight grey trunk with shallow furrows"
  }
]
```

**Goal per species:** 3-5 photos × 3-5 roles × 3 tiers ≈ 12-20 entries.
Start with tier 1 only for Phase 1 — add tiers 2 and 3 in Phase 5.

### 4. Upload selections to Supabase Storage + DB

```bash
npm run naturalist:upload -- --species tulip_poplar
```

This:
- Creates the `flora-photos` Storage bucket (first run only)
- Uploads each selected photo to
  `flora-photos/<flora_code>/<role>_<tier>_<source>_<id>.<ext>`
- Inserts one `flora_photo` row per photo with full attribution

Re-runs are idempotent — already-uploaded photos are skipped.

### 5. Verify

In Supabase Studio:

```sql
select role, tier, license_code, source, alt_text
from flora_photo
where flora_code = 'tulip_poplar'
order by role, tier;
```

You should see one row per `selections.json` entry. Click any photo
in the Storage UI to copy a public URL and confirm it loads in your
browser.

## Curating all species at once

```bash
npm run naturalist:harvest -- --all
# ... hand-author every selections.json ...
npm run naturalist:upload -- --all
```

## Re-running for a species

If you want to add more photos later, repeat steps 1-4. `--all` for
the harvest is also additive — new candidates are merged into the
existing `candidates.json` (newer wins on duplicate filenames).

## Removing a bad photo

1. Delete the row: `delete from flora_photo where id = '<uuid>'`.
2. Delete the Storage object via Supabase Studio.
3. Delete the entry from `selections.json` so re-runs do not re-upload.
```

- [ ] **Step 2: Commit**

```bash
git add docs/naturalist-photo-curation.md
git commit -m "docs(naturalist): hand-curation workflow for Phase 1"
```

---

## Task 12: Wrap-up — full pipeline end-to-end on one species (acceptance)

This task verifies the Phase 1 acceptance criteria by walking through the entire pipeline for ONE species and one role/tier slot, end to end. No code changes — pure verification + commit of the resulting selections.json so the next engineer can see a working example.

**Files:**
- Modify (or create): `scripts/staging/tulip_poplar/selections.json` (committed as a working example)

- [ ] **Step 1: Catalog is queryable from TS (acceptance #1)**

Run: `npx vitest run tests/world/floraCatalog.test.ts`
Expected: PASS — 10 species pass all invariants.

- [ ] **Step 2: SQL inserts can simulate exposures (acceptance #2)**

Run: `npx vitest run tests/naturalist/floraSchema.test.ts`
Expected: PASS (if dev DB creds are present in `.env.local`) — three round-trip tests pass against the real `flora_review` table.

- [ ] **Step 3: Photos load from Supabase Storage (acceptance #3)**

If not done already during Task 10 step 3:

a. `npm run naturalist:harvest -- --species tulip_poplar`
b. Hand-edit `scripts/staging/tulip_poplar/selections.json` with at least one tier-1 leaf, bark, and flower entry (3 entries minimum) using filenames present in `candidates.json`.
c. `npm run naturalist:upload -- --species tulip_poplar`
d. In Supabase Studio → Storage → `flora-photos` bucket → `tulip_poplar/` folder: open any uploaded file's public URL in a browser tab. Confirm the photo renders.
e. In Supabase Studio → SQL editor:
   ```sql
   select role, tier, photographer, license_code, alt_text, storage_path
     from flora_photo where flora_code = 'tulip_poplar' order by role;
   ```
   Confirm one row per selection with attribution intact.

- [ ] **Step 4: Commit the working selections.json as an example**

```bash
git add scripts/staging/tulip_poplar/selections.json
git commit -m "chore(naturalist): example selections.json for tulip_poplar"
```

(The `.jpg` files in `scripts/staging/tulip_poplar/` stay ignored; only the JSON tagging file is committed so future curators have a concrete example.)

- [ ] **Step 5: Push the whole phase**

```bash
git push
```

Phase 1 is complete. The data foundation is in place. Next: Phase 2 (walk page + API).

---

## Self-Review

**1. Spec coverage check:**

| Phase-1 acceptance from spec §11 | Task |
|---|---|
| `flora_review` table | Task 5 |
| `flora_photo` table | Task 5 |
| `key_node_photo` table | Task 5 |
| `FLORA_CATALOG` with 10 species (5 trees + 5 flowers) | Tasks 1-4 |
| `FloraData` TS type | Task 1 |
| Manual photo curation via local-dev tooling (no admin UI) | Tasks 7, 8, 9, 10, 11 |
| Supabase Storage `flora-photos` bucket | Task 10 (created idempotently by upload script) |
| Catalog queryable from TS | Task 12 step 1 |
| SQL inserts simulate exposures | Task 6 + Task 12 step 2 |
| Photos load from Supabase Storage | Task 10 step 3 + Task 12 step 3 |

All Phase-1 acceptance items have a task. The admin curation UI is correctly **out of scope** (Phase 5 per spec).

**2. Placeholder scan:**
- No "TBD" / "TODO" / "implement later" anywhere.
- Every code block is complete and runnable.
- "Add appropriate error handling" never appears — errors are explicit per script (network failures logged + continued; DB insert failures logged + rollback).
- "Similar to Task N" never appears — all code is inlined.

**3. Type consistency check:**
- `FloraData` defined in Task 1 with fields `code, commonName, scientificName, kind, localTier, emoji, seasons, notableFeatures, facts, wikiSpecies, inatTaxonId, photoRoles`.
- Tasks 3 + 4 use those exact field names.
- `PhotoRole` enum (`'whole'|'leaf'|'bark'|'flower'|'fruit'`) used identically in Task 1 (type), Task 5 (SQL check constraint), Task 10 (selection record type), Task 11 (docs).
- `LocalTier` (`'hyper_local'|'canonical_native'`) used in Task 1 (type) and Tasks 3 + 4 (catalog entries).
- `Season` (`'spring'|'summer'|'fall'|'winter'`) used in Task 1 (type), Task 4 (composition test), Tasks 3 + 4 (data).
- iNat client interface `InatPhoto` (Task 7) and Wikimedia `WikimediaPhoto` (Task 8) are independently consumed by `CandidateRecord` in Task 9 — the mapping is explicit (source field discriminates which fields apply).
- Storage path convention `{flora_code}/{role}_{tier}_{source}_{id}.{ext}` defined in Task 10 + Task 11 docs match.
- `flora_photo` SQL columns (`flora_code, role, tier, storage_path, source, source_url, photographer, license_code, alt_text`) in Task 5 match the insert object in Task 10.
- `flora_review` SQL columns (`learner_id, flora_code, exposures, last_seen_at, next_review_at, ease_factor, photo_roles_seen`) in Task 5 match the insert/update objects in Task 6.

Plan is internally consistent.
