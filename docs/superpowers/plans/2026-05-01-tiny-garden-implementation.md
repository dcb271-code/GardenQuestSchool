# Tiny Garden Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a persistent in-app reward game where the learner earns seeds at cumulative-correct thresholds, plants them in 16 plots across 4 quadrants, and watches every planted plant grow in parallel as she practices anywhere in the app.

**Architecture:** New route `/garden/grow` reads cumulative `attempt` rows + a new `garden_plot` table. All growth state derives from cumulative correct count; no per-plant tick logic. Tap-only iPad-friendly interactions. Session-end page renders new "you earned a seed" celebration cards. Hand-drawn SVG plant stages keyed by `plant_<code>_<stage>` follow the existing `illustrations.tsx` pattern.

**Tech Stack:** Next.js 14 app router, TypeScript, Supabase (postgres), Tailwind, framer-motion, vitest + @testing-library/react for unit tests, Web Audio API (no audio file assets) for sound effects.

**Spec:** `docs/superpowers/specs/2026-05-01-tiny-garden-design.md`

---

## File structure

### New files
```
lib/supabase/migrations/010_garden_plot.sql       — table for plot persistence
lib/world/cumulativeProgress.ts                    — counts learner's lifetime correct attempts
lib/world/seedEarnSchedule.ts                      — earn-thresholds + helpers
lib/world/plantCatalog.ts                          — 10-plant catalog + stage resolver
lib/world/plotLayout.ts                            — 16 plot positions + quadrant metadata
lib/world/growGarden.ts                            — loadGrowState aggregator
components/child/garden/PlantStageIllustration.tsx — switch keyed on plant_<code>_<stage>
app/(child)/garden/grow/page.tsx                   — server component (route entry)
app/(child)/garden/grow/GrowScene.tsx              — client scene (renders quadrants + plots)
app/(child)/garden/grow/EmptyPlotPicker.tsx        — modal: pick seed for empty plot
app/(child)/garden/grow/PlantInspectModal.tsx      — modal: tap planted plot
app/(child)/garden/grow/HarvestCelebration.tsx     — petal burst overlay
app/(child)/garden/grow/SeedInventoryTray.tsx      — bottom strip showing earned seeds
app/(child)/garden/grow/actions.ts                 — server actions: plantSeed, harvest
app/(child)/garden/grow/SeedEarnedCard.tsx         — used by session-end page
tests/world/seedEarnSchedule.test.ts
tests/world/plantCatalog.test.ts
tests/world/growGarden.test.ts
```

### Modified files
```
components/child/garden/illustrations.tsx          — re-export PlantStageIllustration cases (or it can be standalone)
app/(child)/garden/page.tsx                        — pass cumulativeCorrect to GardenScene
app/(child)/garden/GardenScene.tsx                 — conditionally render 🌱 header button
app/(child)/complete/[sessionId]/page.tsx          — compute before/after correct, render SeedEarnedCard
lib/audio/sfx.ts                                   — add playSeedPlant, playHarvest
```

---

## Phase 1 — Data layer

### Task 1: Migration `010_garden_plot.sql`

**Files:**
- Create: `lib/supabase/migrations/010_garden_plot.sql`

- [ ] **Step 1: Write the migration**

```sql
-- 010_garden_plot.sql
--
-- Persistence for the Tiny Garden reward-game. Each row is one
-- planted seed sitting in one plot. When a plant matures and the
-- learner taps "harvest", the row's harvested_at is set rather than
-- deleting the row — keeps the history.
--
-- Idempotent (uses `if not exists`).

create table if not exists garden_plot (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references learner(id) on delete cascade,
  plot_code text not null,                  -- 'veg-1' .. 'japanese-4'
  plant_code text not null,                 -- 'radish' .. 'cherry'
  planted_at_correct integer not null,      -- cumulative correct snapshot
  planted_at timestamptz not null default now(),
  harvested_at timestamptz                  -- null while still in the plot
);

-- One active plant per plot per learner. Allows multiple harvested
-- rows for the same plot over time (history).
create unique index if not exists garden_plot_active_uidx
  on garden_plot(learner_id, plot_code)
  where harvested_at is null;

create index if not exists garden_plot_learner_active_idx
  on garden_plot(learner_id)
  where harvested_at is null;

-- RLS: a learner can only see/modify their own plots.
alter table garden_plot enable row level security;

drop policy if exists "garden_plot owned via learner" on garden_plot;
create policy "garden_plot owned via learner" on garden_plot for all using (
  learner_id in (select id from learner where parent_id = auth.uid())
);
```

- [ ] **Step 2: Apply the migration**

Run: `npm run db:migrate`
Expected: `→ applying 010_garden_plot.sql ... ✓`

- [ ] **Step 3: Verify the table exists**

Connect to the database (e.g. via Supabase dashboard SQL editor) and run:
```sql
select column_name, data_type from information_schema.columns
where table_name = 'garden_plot' order by ordinal_position;
```
Expected output should list: id, learner_id, plot_code, plant_code, planted_at_correct, planted_at, harvested_at.

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/migrations/010_garden_plot.sql
git commit -m "feat(db): add garden_plot table for tiny garden reward-game

Persistence for the new reward-game where learners plant earned
seeds in 16 plots across 4 quadrants. Schema design notes in
the spec at docs/superpowers/specs/2026-05-01-tiny-garden-design.md
section 4.2.

Partial unique index on (learner_id, plot_code) WHERE harvested_at
is null allows the same plot to host successive plants over time
(history) while preventing two simultaneous plants in one plot."
```

---

### Task 2: `lib/world/cumulativeProgress.ts`

**Files:**
- Create: `lib/world/cumulativeProgress.ts`
- Test: `tests/world/cumulativeProgress.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/world/cumulativeProgress.test.ts
import { describe, it, expect, vi } from 'vitest';
import { getCumulativeCorrect } from '@/lib/world/cumulativeProgress';

describe('getCumulativeCorrect', () => {
  it('queries attempt count where outcome=correct for the learner', async () => {
    const eq2 = vi.fn().mockResolvedValue({ count: 42, error: null });
    const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
    const select = vi.fn().mockReturnValue({ eq: eq1 });
    const from = vi.fn().mockReturnValue({ select });
    const db = { from } as any;
    const result = await getCumulativeCorrect(db, 'learner-123');
    expect(result).toBe(42);
    expect(from).toHaveBeenCalledWith('attempt');
    expect(select).toHaveBeenCalledWith('*', { count: 'exact', head: true });
    expect(eq1).toHaveBeenCalledWith('learner_id', 'learner-123');
    expect(eq2).toHaveBeenCalledWith('outcome', 'correct');
  });

  it('returns 0 when count is null', async () => {
    const eq2 = vi.fn().mockResolvedValue({ count: null, error: null });
    const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
    const select = vi.fn().mockReturnValue({ eq: eq1 });
    const db = { from: vi.fn().mockReturnValue({ select }) } as any;
    expect(await getCumulativeCorrect(db, 'l')).toBe(0);
  });

  it('throws on db error', async () => {
    const eq2 = vi.fn().mockResolvedValue({ count: null, error: { message: 'boom' } });
    const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
    const select = vi.fn().mockReturnValue({ eq: eq1 });
    const db = { from: vi.fn().mockReturnValue({ select }) } as any;
    await expect(getCumulativeCorrect(db, 'l')).rejects.toThrow('boom');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/world/cumulativeProgress.test.ts`
Expected: FAIL — "Cannot find module '@/lib/world/cumulativeProgress'"

- [ ] **Step 3: Implement `cumulativeProgress.ts`**

```ts
// lib/world/cumulativeProgress.ts
//
// Counts the learner's lifetime correct attempts. Used as the universal
// "growth point" tick for the Tiny Garden reward-game and as the basis
// for seed-earn thresholds.
//
// IMPORTANT: this query is called on every garden / grow page render,
// so it intentionally uses head:true (no row body) for speed.

import type { SupabaseClient } from '@supabase/supabase-js';

export async function getCumulativeCorrect(
  db: SupabaseClient,
  learnerId: string,
): Promise<number> {
  const { count, error } = await db
    .from('attempt')
    .select('*', { count: 'exact', head: true })
    .eq('learner_id', learnerId)
    .eq('outcome', 'correct');
  if (error) throw new Error(error.message);
  return count ?? 0;
}

// For the session-end celebration card we need the count BEFORE the
// session started. Same shape as above but with a created_at upper bound.
export async function getCumulativeCorrectAt(
  db: SupabaseClient,
  learnerId: string,
  before: Date,
): Promise<number> {
  const { count, error } = await db
    .from('attempt')
    .select('*', { count: 'exact', head: true })
    .eq('learner_id', learnerId)
    .eq('outcome', 'correct')
    .lt('created_at', before.toISOString());
  if (error) throw new Error(error.message);
  return count ?? 0;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/world/cumulativeProgress.test.ts`
Expected: PASS — 3/3 tests green.

- [ ] **Step 5: Commit**

```bash
git add lib/world/cumulativeProgress.ts tests/world/cumulativeProgress.test.ts
git commit -m "feat(world): cumulativeProgress helper for lifetime correct count

Universal 'growth point' tick used by the Tiny Garden reward-game.
getCumulativeCorrect returns the learner's lifetime correct
attempts; getCumulativeCorrectAt returns the count up to a given
timestamp (used by the session-end seed-earned card)."
```

---

### Task 3: `lib/world/seedEarnSchedule.ts`

**Files:**
- Create: `lib/world/seedEarnSchedule.ts`
- Test: `tests/world/seedEarnSchedule.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/world/seedEarnSchedule.test.ts
import { describe, it, expect } from 'vitest';
import {
  SEED_EARN_SCHEDULE,
  getEarnedSeedCodes,
  getOpenQuadrants,
  getSessionSeedEarns,
} from '@/lib/world/seedEarnSchedule';

describe('SEED_EARN_SCHEDULE', () => {
  it('has 10 entries in ascending threshold order', () => {
    expect(SEED_EARN_SCHEDULE).toHaveLength(10);
    for (let i = 1; i < SEED_EARN_SCHEDULE.length; i++) {
      expect(SEED_EARN_SCHEDULE[i].atCorrect).toBeGreaterThan(SEED_EARN_SCHEDULE[i - 1].atCorrect);
    }
  });

  it('first entry is radish at 25', () => {
    expect(SEED_EARN_SCHEDULE[0]).toEqual({ atCorrect: 25, plantCode: 'radish' });
  });
});

describe('getEarnedSeedCodes', () => {
  it('returns empty array below first threshold', () => {
    expect(getEarnedSeedCodes(0)).toEqual([]);
    expect(getEarnedSeedCodes(24)).toEqual([]);
  });
  it('returns radish at 25 cumulative correct', () => {
    expect(getEarnedSeedCodes(25)).toEqual(['radish']);
  });
  it('returns all earned seeds at high count', () => {
    const codes = getEarnedSeedCodes(99999);
    expect(codes).toContain('radish');
    expect(codes).toContain('cherry');
    expect(codes).toHaveLength(10);
  });
});

describe('getOpenQuadrants', () => {
  it('vegetable always open', () => {
    expect(getOpenQuadrants(0).has('vegetable')).toBe(true);
  });
  it('flower opens at 250', () => {
    expect(getOpenQuadrants(249).has('flower')).toBe(false);
    expect(getOpenQuadrants(250).has('flower')).toBe(true);
  });
  it('fruit opens at 700', () => {
    expect(getOpenQuadrants(699).has('fruit')).toBe(false);
    expect(getOpenQuadrants(700).has('fruit')).toBe(true);
  });
  it('japanese opens at 950', () => {
    expect(getOpenQuadrants(949).has('japanese')).toBe(false);
    expect(getOpenQuadrants(950).has('japanese')).toBe(true);
  });
});

describe('getSessionSeedEarns', () => {
  it('detects radish earned when crossing 25 in a single session', () => {
    const earns = getSessionSeedEarns(20, 28);
    expect(earns).toHaveLength(1);
    expect(earns[0].plantCode).toBe('radish');
  });
  it('detects multiple earns crossed in one session', () => {
    const earns = getSessionSeedEarns(20, 80);
    expect(earns.map(e => e.plantCode)).toEqual(['radish', 'mint']);
  });
  it('returns empty when no thresholds crossed', () => {
    expect(getSessionSeedEarns(30, 50)).toEqual([]);
  });
  it('does not double-count thresholds already passed before the session', () => {
    expect(getSessionSeedEarns(25, 30)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/world/seedEarnSchedule.test.ts`
Expected: FAIL — "Cannot find module"

- [ ] **Step 3: Implement `seedEarnSchedule.ts`**

```ts
// lib/world/seedEarnSchedule.ts
//
// When the learner earns each seed in the Tiny Garden reward-game.
// Thresholds are cumulative correct attempts (lifetime). Three of the
// thresholds also OPEN a new garden quadrant — those use the
// `opensQuadrant` field to drive a stronger session-end celebration.
//
// See docs/superpowers/specs/2026-05-01-tiny-garden-design.md §6.

export type GardenType = 'vegetable' | 'flower' | 'fruit' | 'japanese';

export interface SeedEarn {
  atCorrect: number;
  plantCode: string;
  opensQuadrant?: 'flower' | 'fruit' | 'japanese';
}

export const SEED_EARN_SCHEDULE: SeedEarn[] = [
  { atCorrect: 25,   plantCode: 'radish' },
  { atCorrect: 75,   plantCode: 'mint' },
  { atCorrect: 150,  plantCode: 'lettuce' },
  { atCorrect: 250,  plantCode: 'tulip',     opensQuadrant: 'flower' },
  { atCorrect: 375,  plantCode: 'daisy' },
  { atCorrect: 500,  plantCode: 'sunflower' },
  { atCorrect: 700,  plantCode: 'apple',     opensQuadrant: 'fruit' },
  { atCorrect: 950,  plantCode: 'bamboo',    opensQuadrant: 'japanese' },
  { atCorrect: 1250, plantCode: 'bonsai' },
  { atCorrect: 1600, plantCode: 'cherry' },
];

export function getEarnedSeedCodes(cumulativeCorrect: number): string[] {
  return SEED_EARN_SCHEDULE
    .filter(s => cumulativeCorrect >= s.atCorrect)
    .map(s => s.plantCode);
}

export function getOpenQuadrants(cumulativeCorrect: number): Set<GardenType> {
  const open = new Set<GardenType>(['vegetable']);
  for (const s of SEED_EARN_SCHEDULE) {
    if (s.opensQuadrant && cumulativeCorrect >= s.atCorrect) open.add(s.opensQuadrant);
  }
  return open;
}

// Used at session-end to decide whether to render any celebration cards.
// Returns the schedule entries whose threshold was crossed BY this session
// (i.e. > beforeCorrect AND ≤ afterCorrect).
export function getSessionSeedEarns(beforeCorrect: number, afterCorrect: number): SeedEarn[] {
  return SEED_EARN_SCHEDULE.filter(s => s.atCorrect > beforeCorrect && s.atCorrect <= afterCorrect);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/world/seedEarnSchedule.test.ts`
Expected: PASS — all groups green.

- [ ] **Step 5: Commit**

```bash
git add lib/world/seedEarnSchedule.ts tests/world/seedEarnSchedule.test.ts
git commit -m "feat(world): seedEarnSchedule + helpers for tiny garden

10 fixed thresholds (25..1600 cumulative correct) for earning seeds.
Three of them (250 flower, 700 fruit, 950 japanese) also open new
garden quadrants. Helpers: getEarnedSeedCodes, getOpenQuadrants,
getSessionSeedEarns (used by session-end celebration cards)."
```

---

### Task 4: `lib/world/plantCatalog.ts`

**Files:**
- Create: `lib/world/plantCatalog.ts`
- Test: `tests/world/plantCatalog.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/world/plantCatalog.test.ts
import { describe, it, expect } from 'vitest';
import { PLANT_CATALOG, getPlant, plantStageFor } from '@/lib/world/plantCatalog';
import { SEED_EARN_SCHEDULE } from '@/lib/world/seedEarnSchedule';

describe('PLANT_CATALOG', () => {
  it('has an entry for every plant code in the earn schedule', () => {
    for (const earn of SEED_EARN_SCHEDULE) {
      const plant = getPlant(earn.plantCode);
      expect(plant, `missing plant ${earn.plantCode}`).toBeDefined();
    }
  });

  it('every plant has 2-3 facts', () => {
    for (const p of PLANT_CATALOG) {
      expect(p.facts.length, p.code).toBeGreaterThanOrEqual(2);
      expect(p.facts.length, p.code).toBeLessThanOrEqual(3);
    }
  });

  it('every plant has stages sorted ascending by atProgress, starting at 0, ending at 1', () => {
    for (const p of PLANT_CATALOG) {
      expect(p.stages.length, p.code).toBeGreaterThanOrEqual(3);
      expect(p.stages[0].atProgress, p.code).toBe(0);
      expect(p.stages[p.stages.length - 1].atProgress, p.code).toBe(1);
      for (let i = 1; i < p.stages.length; i++) {
        expect(p.stages[i].atProgress, p.code).toBeGreaterThan(p.stages[i - 1].atProgress);
      }
    }
  });

  it('every plant declares a positive growthCost and valid garden type', () => {
    const validGardens = new Set(['vegetable', 'flower', 'fruit', 'japanese']);
    for (const p of PLANT_CATALOG) {
      expect(p.growthCost, p.code).toBeGreaterThan(0);
      expect(validGardens.has(p.garden), `${p.code} → ${p.garden}`).toBe(true);
    }
  });
});

describe('plantStageFor', () => {
  const radish = getPlant('radish')!;

  it('returns the seed stage at progress 0', () => {
    expect(plantStageFor(radish, 0).illustration).toBe('plant_radish_seed');
  });

  it('returns the mature stage at full growthCost', () => {
    expect(plantStageFor(radish, radish.growthCost).illustration).toBe('plant_radish_mature');
  });

  it('clamps overshoot — progress > growthCost still mature', () => {
    expect(plantStageFor(radish, radish.growthCost * 4).illustration).toBe('plant_radish_mature');
  });

  it('picks the highest stage threshold below the current ratio', () => {
    // radish stages at 0, 0.2, 0.5, 1.0
    expect(plantStageFor(radish, radish.growthCost * 0.4).illustration).toBe('plant_radish_sprout');
    expect(plantStageFor(radish, radish.growthCost * 0.6).illustration).toBe('plant_radish_leaves');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/world/plantCatalog.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `plantCatalog.ts`**

```ts
// lib/world/plantCatalog.ts
//
// Real botanical content keyed by plantCode. See spec §5.
// Every plant lists its growth cost (in correct attempts), garden
// quadrant, sun + water needs, 2-3 facts, growing tip, and visual
// stages. Stage atProgress is a fraction (0..1) of growthCost.

import type { GardenType } from './seedEarnSchedule';
export type { GardenType } from './seedEarnSchedule';

export type SunNeed = 'full' | 'partial' | 'shade';
export type WaterNeed = 'low' | 'medium' | 'high';

export interface PlantStage {
  atProgress: number;            // 0.0 .. 1.0
  illustration: string;          // PlantStageIllustration code: plant_<code>_<stage>
}

export interface PlantData {
  code: string;
  commonName: string;
  scientificName: string;
  garden: GardenType;
  growthCost: number;            // correct attempts needed to fully mature
  sun: SunNeed;
  water: WaterNeed;
  facts: string[];               // 2-3 short kid-readable facts
  growingTip: string;
  stages: PlantStage[];          // first atProgress=0, last atProgress=1
}

export const PLANT_CATALOG: PlantData[] = [
  // VEGETABLE
  {
    code: 'radish',
    commonName: 'Radish',
    scientificName: 'Raphanus sativus',
    garden: 'vegetable',
    growthCost: 20,
    sun: 'full',
    water: 'medium',
    facts: [
      'Radishes are one of the fastest vegetables — ready to eat in just a few weeks.',
      'The part you eat grows underground. The leaves up top are also edible.',
      'Radishes were grown in ancient Egypt over 5,000 years ago, before the pyramids.',
    ],
    growingTip: 'Plant in cool weather. Water a little, often.',
    stages: [
      { atProgress: 0,    illustration: 'plant_radish_seed' },
      { atProgress: 0.2,  illustration: 'plant_radish_sprout' },
      { atProgress: 0.5,  illustration: 'plant_radish_leaves' },
      { atProgress: 1,    illustration: 'plant_radish_mature' },
    ],
  },
  {
    code: 'mint',
    commonName: 'Mint',
    scientificName: 'Mentha',
    garden: 'vegetable',
    growthCost: 25,
    sun: 'partial',
    water: 'medium',
    facts: [
      'Mint spreads fast — too fast! Most gardeners grow it in pots so it doesn\'t take over.',
      'There are over 600 kinds of mint. Peppermint and spearmint are the most common.',
      'Bees and butterflies love mint flowers.',
    ],
    growingTip: 'Pinch the tips so it bushes out instead of getting tall.',
    stages: [
      { atProgress: 0,    illustration: 'plant_mint_seed' },
      { atProgress: 0.25, illustration: 'plant_mint_sprout' },
      { atProgress: 0.6,  illustration: 'plant_mint_young' },
      { atProgress: 1,    illustration: 'plant_mint_mature' },
    ],
  },
  {
    code: 'lettuce',
    commonName: 'Lettuce',
    scientificName: 'Lactuca sativa',
    garden: 'vegetable',
    growthCost: 40,
    sun: 'partial',
    water: 'high',
    facts: [
      'Lettuce comes in many shapes — tight heads, loose leaves, frilly, smooth.',
      'Lettuce gets bitter when it\'s too hot. It likes cool weather best.',
      'Romans grew lettuce 2,000 years ago and ate it at the END of meals as a relaxing food.',
    ],
    growingTip: 'Pick the outer leaves; the middle keeps growing.',
    stages: [
      { atProgress: 0,    illustration: 'plant_lettuce_seed' },
      { atProgress: 0.2,  illustration: 'plant_lettuce_sprout' },
      { atProgress: 0.55, illustration: 'plant_lettuce_young' },
      { atProgress: 1,    illustration: 'plant_lettuce_mature' },
    ],
  },
  // FLOWER
  {
    code: 'tulip',
    commonName: 'Tulip',
    scientificName: 'Tulipa',
    garden: 'flower',
    growthCost: 60,
    sun: 'full',
    water: 'low',
    facts: [
      'Tulips grow from bulbs that store food underground all winter.',
      'In the 1600s in Holland, a single tulip bulb could cost more than a house.',
      'There are over 3,000 named varieties of tulip in the world.',
    ],
    growingTip: 'Plant bulbs in autumn so they bloom in spring.',
    stages: [
      { atProgress: 0,    illustration: 'plant_tulip_bulb' },
      { atProgress: 0.25, illustration: 'plant_tulip_spear' },
      { atProgress: 0.6,  illustration: 'plant_tulip_bud' },
      { atProgress: 1,    illustration: 'plant_tulip_bloom' },
    ],
  },
  {
    code: 'daisy',
    commonName: 'Daisy',
    scientificName: 'Bellis perennis',
    garden: 'flower',
    growthCost: 50,
    sun: 'full',
    water: 'medium',
    facts: [
      'A daisy is actually two flowers in one — the white "petals" and the yellow center are different flowers grouped together.',
      'Daisies close up at night and open again in the morning sun.',
      'The name "daisy" comes from "day\'s eye" because the flower looks like a tiny sun.',
    ],
    growingTip: 'Daisies don\'t mind poor soil — they grow well in meadows.',
    stages: [
      { atProgress: 0,    illustration: 'plant_daisy_seed' },
      { atProgress: 0.25, illustration: 'plant_daisy_sprout' },
      { atProgress: 0.6,  illustration: 'plant_daisy_bud' },
      { atProgress: 1,    illustration: 'plant_daisy_bloom' },
    ],
  },
  {
    code: 'sunflower',
    commonName: 'Sunflower',
    scientificName: 'Helianthus annuus',
    garden: 'flower',
    growthCost: 120,
    sun: 'full',
    water: 'medium',
    facts: [
      'Sunflowers turn their heads to follow the sun across the sky each day.',
      'A big sunflower can grow taller than a person — up to 12 feet!',
      'The black seeds in the middle are food for birds, squirrels, and people.',
    ],
    growingTip: 'Plant in the sunniest spot you have, and water deeply.',
    stages: [
      { atProgress: 0,    illustration: 'plant_sunflower_seed' },
      { atProgress: 0.15, illustration: 'plant_sunflower_sprout' },
      { atProgress: 0.4,  illustration: 'plant_sunflower_stalk' },
      { atProgress: 0.7,  illustration: 'plant_sunflower_bud' },
      { atProgress: 1,    illustration: 'plant_sunflower_bloom' },
    ],
  },
  // FRUIT
  {
    code: 'apple',
    commonName: 'Apple sapling',
    scientificName: 'Malus domestica',
    garden: 'fruit',
    growthCost: 300,
    sun: 'full',
    water: 'medium',
    facts: [
      'A real apple tree takes years to make its first fruit. Patience is everything.',
      'There are over 7,500 different kinds of apples in the world.',
      'Apple trees need a cold winter — without it, they don\'t blossom in spring.',
    ],
    growingTip: 'Plant where the tree gets full sun. Water deeply, not often.',
    stages: [
      { atProgress: 0,    illustration: 'plant_apple_seed' },
      { atProgress: 0.1,  illustration: 'plant_apple_sprout' },
      { atProgress: 0.35, illustration: 'plant_apple_twig' },
      { atProgress: 0.7,  illustration: 'plant_apple_young' },
      { atProgress: 1,    illustration: 'plant_apple_mature' },
    ],
  },
  // JAPANESE
  {
    code: 'bamboo',
    commonName: 'Bamboo cluster',
    scientificName: 'Bambusoideae',
    garden: 'japanese',
    growthCost: 100,
    sun: 'partial',
    water: 'medium',
    facts: [
      'Bamboo is the fastest-growing plant on Earth — some kinds grow 3 feet in a single day.',
      'Bamboo isn\'t a tree. It\'s a giant grass.',
      'Pandas eat almost nothing but bamboo — about 30 pounds of it every day.',
    ],
    growingTip: 'Bamboo spreads by underground roots; give it room.',
    stages: [
      { atProgress: 0,    illustration: 'plant_bamboo_seed' },
      { atProgress: 0.2,  illustration: 'plant_bamboo_shoot' },
      { atProgress: 0.55, illustration: 'plant_bamboo_stalk' },
      { atProgress: 1,    illustration: 'plant_bamboo_cluster' },
    ],
  },
  {
    code: 'bonsai',
    commonName: 'Bonsai pine',
    scientificName: 'Pinus thunbergii (trained)',
    garden: 'japanese',
    growthCost: 200,
    sun: 'full',
    water: 'low',
    facts: [
      'A bonsai is a regular tree kept tiny by careful pruning. It isn\'t a special species.',
      'Some bonsai trees in Japan are over 1,000 years old, passed down for generations.',
      'The art of bonsai started in China about 1,500 years ago and spread to Japan.',
    ],
    growingTip: 'Trim the tips, never the trunk. Patience is the whole tradition.',
    stages: [
      { atProgress: 0,    illustration: 'plant_bonsai_seed' },
      { atProgress: 0.2,  illustration: 'plant_bonsai_sprout' },
      { atProgress: 0.55, illustration: 'plant_bonsai_young' },
      { atProgress: 1,    illustration: 'plant_bonsai_mature' },
    ],
  },
  {
    code: 'cherry',
    commonName: 'Cherry blossom',
    scientificName: 'Prunus serrulata',
    garden: 'japanese',
    growthCost: 400,
    sun: 'full',
    water: 'medium',
    facts: [
      'Cherry blossoms (sakura) bloom for only one or two weeks each spring.',
      'In Japan, people gather under the trees to watch the petals fall — a tradition called hanami.',
      'A cherry tree can live for 40 to 100 years; some famous ones in Japan are over 1,000.',
    ],
    growingTip: 'Plant in autumn so roots settle before spring. Don\'t prune the trunk.',
    stages: [
      { atProgress: 0,    illustration: 'plant_cherry_seed' },
      { atProgress: 0.1,  illustration: 'plant_cherry_sprout' },
      { atProgress: 0.4,  illustration: 'plant_cherry_twig' },
      { atProgress: 0.75, illustration: 'plant_cherry_young' },
      { atProgress: 1,    illustration: 'plant_cherry_bloom' },
    ],
  },
];

export function getPlant(code: string): PlantData | undefined {
  return PLANT_CATALOG.find(p => p.code === code);
}

export function plantStageFor(plant: PlantData, progress: number): PlantStage {
  const ratio = Math.min(1, Math.max(0, progress / plant.growthCost));
  let chosen = plant.stages[0];
  for (const s of plant.stages) {
    if (s.atProgress <= ratio) chosen = s;
  }
  return chosen;
}

// "almost ready" / "halfway there" / etc. for the inspect modal.
export function progressHint(plant: PlantData, progress: number): string {
  const ratio = Math.min(1, Math.max(0, progress / plant.growthCost));
  if (ratio >= 1)    return 'ready to pick';
  if (ratio >= 0.75) return 'almost ready';
  if (ratio >= 0.5)  return 'halfway there';
  if (ratio >= 0.25) return 'growing roots';
  if (ratio > 0)     return 'just sprouting';
  return 'just planted';
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/world/plantCatalog.test.ts`
Expected: PASS — all 9 tests green.

- [ ] **Step 5: Commit**

```bash
git add lib/world/plantCatalog.ts tests/world/plantCatalog.test.ts
git commit -m "feat(world): plantCatalog with 10 plants for tiny garden

Real botanical content for 10 plants (3 vegetable, 3 flower,
1 fruit, 3 japanese). Each plant declares growthCost in correct
attempts, sun/water needs, 2-3 kid-readable facts, growing tip,
and 4-5 visual stages keyed by atProgress (0..1).
Helpers: getPlant, plantStageFor (clamps overshoot), progressHint
('almost ready' / 'halfway there' / etc. for the inspect modal)."
```

---

### Task 5: `lib/world/plotLayout.ts`

**Files:**
- Create: `lib/world/plotLayout.ts`
- Test: `tests/world/plotLayout.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/world/plotLayout.test.ts
import { describe, it, expect } from 'vitest';
import { PLOTS, plotsForGarden, getPlot } from '@/lib/world/plotLayout';

describe('PLOTS', () => {
  it('contains exactly 16 plots', () => {
    expect(PLOTS).toHaveLength(16);
  });
  it('has 4 plots per quadrant', () => {
    for (const garden of ['vegetable', 'flower', 'fruit', 'japanese'] as const) {
      expect(plotsForGarden(garden)).toHaveLength(4);
    }
  });
  it('all plot codes are unique', () => {
    const codes = new Set(PLOTS.map(p => p.code));
    expect(codes.size).toBe(16);
  });
  it('plot codes follow the convention <garden>-<n>', () => {
    for (const p of PLOTS) {
      expect(p.code).toMatch(new RegExp(`^${p.garden === 'vegetable' ? 'veg' : p.garden}-[1-4]$`));
    }
  });
});

describe('getPlot', () => {
  it('returns the plot for a known code', () => {
    expect(getPlot('veg-1')?.garden).toBe('vegetable');
  });
  it('returns undefined for unknown', () => {
    expect(getPlot('nope-9')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/world/plotLayout.test.ts`
Expected: FAIL — module missing.

- [ ] **Step 3: Implement `plotLayout.ts`**

```ts
// lib/world/plotLayout.ts
//
// 16 fixed plot positions for the Tiny Garden reward-game. Plots are
// grouped into 4 quadrants of 4 plots each. The plot's `garden` field
// matches the quadrant — and constrains which seeds can be planted in it
// (radish only in vegetable plots, etc.). See spec §7.

import type { GardenType } from './plantCatalog';

export interface PlotData {
  code: string;          // 'veg-1' .. 'japanese-4'
  garden: GardenType;
  x: number;             // plot center x in viewBox (1440 wide)
  y: number;             // plot center y in viewBox (900 tall)
}

export const PLOTS: PlotData[] = [
  // Vegetable (top-left): 2x2
  { code: 'veg-1',      garden: 'vegetable', x: 220,  y: 140 },
  { code: 'veg-2',      garden: 'vegetable', x: 480,  y: 140 },
  { code: 'veg-3',      garden: 'vegetable', x: 220,  y: 320 },
  { code: 'veg-4',      garden: 'vegetable', x: 480,  y: 320 },
  // Fruit (top-right): 2x2 — trees are larger but use same plot count
  { code: 'fruit-1',    garden: 'fruit',     x: 940,  y: 140 },
  { code: 'fruit-2',    garden: 'fruit',     x: 1200, y: 140 },
  { code: 'fruit-3',    garden: 'fruit',     x: 940,  y: 320 },
  { code: 'fruit-4',    garden: 'fruit',     x: 1200, y: 320 },
  // Flower (bottom-left): 2x2
  { code: 'flower-1',   garden: 'flower',    x: 220,  y: 500 },
  { code: 'flower-2',   garden: 'flower',    x: 480,  y: 500 },
  { code: 'flower-3',   garden: 'flower',    x: 220,  y: 680 },
  { code: 'flower-4',   garden: 'flower',    x: 480,  y: 680 },
  // Japanese (bottom-right): 2x2
  { code: 'japanese-1', garden: 'japanese',  x: 940,  y: 500 },
  { code: 'japanese-2', garden: 'japanese',  x: 1200, y: 500 },
  { code: 'japanese-3', garden: 'japanese',  x: 940,  y: 680 },
  { code: 'japanese-4', garden: 'japanese',  x: 1200, y: 680 },
];

export function plotsForGarden(garden: GardenType): PlotData[] {
  return PLOTS.filter(p => p.garden === garden);
}

export function getPlot(code: string): PlotData | undefined {
  return PLOTS.find(p => p.code === code);
}

// Quadrant centroids (used to position the title pill / locked-overlay).
export const QUADRANT_LAYOUT: Record<GardenType, { x: number; y: number; label: string }> = {
  vegetable: { x: 350,  y: 50,  label: 'vegetable patch' },
  fruit:     { x: 1070, y: 50,  label: 'fruit grove' },
  flower:    { x: 350,  y: 410, label: 'flower garden' },
  japanese:  { x: 1070, y: 410, label: 'japanese garden' },
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/world/plotLayout.test.ts`
Expected: PASS — all 6 tests green.

- [ ] **Step 5: Commit**

```bash
git add lib/world/plotLayout.ts tests/world/plotLayout.test.ts
git commit -m "feat(world): 16-plot layout for tiny garden quadrants

4 plots per quadrant (vegetable, fruit, flower, japanese) at fixed
viewBox positions. Helpers: plotsForGarden, getPlot. Quadrant layout
metadata (title position + label) lives alongside the plots."
```

---

### Task 6: `lib/world/growGarden.ts`

**Files:**
- Create: `lib/world/growGarden.ts`
- Test: `tests/world/growGarden.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/world/growGarden.test.ts
import { describe, it, expect, vi } from 'vitest';
import { loadGrowState } from '@/lib/world/growGarden';

function mockDb(plotRows: any[], correctCount: number) {
  // Build a chainable mock that handles both 'attempt' and 'garden_plot' calls.
  const attemptChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockResolvedValue({ data: plotRows, error: null }),
    then: undefined,
  };
  const plotChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockResolvedValue({ data: plotRows, error: null }),
  };
  return {
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'attempt') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ count: correctCount, error: null }),
            }),
          }),
        };
      }
      // garden_plot
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockResolvedValue({ data: plotRows, error: null }),
          }),
        }),
      };
    }),
  } as any;
}

describe('loadGrowState', () => {
  it('returns 0 cumulative + empty plots + only vegetable open at zero progress', async () => {
    const db = mockDb([], 0);
    const state = await loadGrowState(db, 'l');
    expect(state.cumulativeCorrect).toBe(0);
    expect(state.openQuadrants.has('vegetable')).toBe(true);
    expect(state.openQuadrants.has('flower')).toBe(false);
    expect(state.earnedSeeds).toEqual([]);
    expect(state.plots).toHaveLength(16);
    for (const p of state.plots) expect(p.plant).toBeUndefined();
  });

  it('attaches plant data + computes progress relative to planted_at_correct', async () => {
    const db = mockDb(
      [{ plot_code: 'veg-1', plant_code: 'radish', planted_at_correct: 30 }],
      45,
    );
    const state = await loadGrowState(db, 'l');
    const veg1 = state.plots.find(p => p.plot.code === 'veg-1');
    expect(veg1?.plant?.data.code).toBe('radish');
    expect(veg1?.plant?.progress).toBe(15);     // 45 - 30
    expect(veg1?.plant?.isMature).toBe(false);  // radish growthCost is 20
  });

  it('marks mature when progress >= growthCost', async () => {
    const db = mockDb(
      [{ plot_code: 'veg-2', plant_code: 'radish', planted_at_correct: 0 }],
      25,
    );
    const state = await loadGrowState(db, 'l');
    const veg2 = state.plots.find(p => p.plot.code === 'veg-2');
    expect(veg2?.plant?.isMature).toBe(true);
  });

  it('opens flower quadrant at 250 cumulative correct', async () => {
    const db = mockDb([], 260);
    const state = await loadGrowState(db, 'l');
    expect(state.openQuadrants.has('flower')).toBe(true);
    expect(state.openQuadrants.has('fruit')).toBe(false);
    expect(state.earnedSeeds.map(s => s.code)).toContain('tulip');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/world/growGarden.test.ts`
Expected: FAIL — module missing.

- [ ] **Step 3: Implement `growGarden.ts`**

```ts
// lib/world/growGarden.ts
//
// Single aggregator that loads everything the /garden/grow page
// renders. Returns cumulativeCorrect (universal growth tick),
// derived earned seeds, open quadrants, and 16 plots each
// optionally annotated with the plant currently growing in it.
//
// Per-plant progress = cumulativeCorrect - planted_at_correct.
// All plants grow at the same rate (1 correct = +1 to every planted
// plant) — this falls naturally out of the math; no per-plant tick.

import type { SupabaseClient } from '@supabase/supabase-js';
import { getCumulativeCorrect } from './cumulativeProgress';
import {
  getEarnedSeedCodes,
  getOpenQuadrants,
  type GardenType,
} from './seedEarnSchedule';
import { PLANT_CATALOG, getPlant, type PlantData } from './plantCatalog';
import { PLOTS, type PlotData } from './plotLayout';

export interface PlantInPlot {
  data: PlantData;
  progress: number;          // current correct attempts since planted
  isMature: boolean;         // progress >= data.growthCost
  plantedAt: Date;
}

export interface PlotWithPlant {
  plot: PlotData;
  plant?: PlantInPlot;
}

export interface GrowState {
  cumulativeCorrect: number;
  earnedSeeds: PlantData[];                // seeds the learner can plant
  openQuadrants: Set<GardenType>;
  plots: PlotWithPlant[];                  // always 16, plant optional
}

interface GardenPlotRow {
  plot_code: string;
  plant_code: string;
  planted_at_correct: number;
  planted_at?: string;
}

export async function loadGrowState(
  db: SupabaseClient,
  learnerId: string,
): Promise<GrowState> {
  const cumulativeCorrect = await getCumulativeCorrect(db, learnerId);

  const { data: plotRows, error } = await db
    .from('garden_plot')
    .select('plot_code, plant_code, planted_at_correct, planted_at')
    .eq('learner_id', learnerId)
    .is('harvested_at', null);
  if (error) throw new Error(error.message);

  const byPlotCode = new Map<string, GardenPlotRow>();
  for (const row of (plotRows ?? []) as GardenPlotRow[]) {
    byPlotCode.set(row.plot_code, row);
  }

  const plots: PlotWithPlant[] = PLOTS.map(plot => {
    const row = byPlotCode.get(plot.code);
    if (!row) return { plot };
    const data = getPlant(row.plant_code);
    if (!data) return { plot };  // guard: orphan plant_code (shouldn't happen)
    const progress = Math.max(0, cumulativeCorrect - row.planted_at_correct);
    return {
      plot,
      plant: {
        data,
        progress,
        isMature: progress >= data.growthCost,
        plantedAt: row.planted_at ? new Date(row.planted_at) : new Date(0),
      },
    };
  });

  const earnedCodes = getEarnedSeedCodes(cumulativeCorrect);
  const earnedSeeds = earnedCodes
    .map(c => getPlant(c))
    .filter((p): p is PlantData => !!p);

  return {
    cumulativeCorrect,
    earnedSeeds,
    openQuadrants: getOpenQuadrants(cumulativeCorrect),
    plots,
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/world/growGarden.test.ts`
Expected: PASS — all 4 tests green.

- [ ] **Step 5: Commit**

```bash
git add lib/world/growGarden.ts tests/world/growGarden.test.ts
git commit -m "feat(world): growGarden aggregator for tiny garden state

loadGrowState returns cumulativeCorrect + earnedSeeds + openQuadrants
+ 16 plots (each optionally annotated with the plant currently
growing). Per-plant progress = cumulative - planted_at_correct;
parallel growth falls out of the math (no per-plant tick logic)."
```

---

## Phase 2 — Plant illustrations

Each plant gets ONE task that adds all its stages to a single SVG illustration file. The file lives separate from `illustrations.tsx` to keep that file from growing further.

### Task 7: `PlantStageIllustration` switch + 1st plant (Radish)

**Files:**
- Create: `components/child/garden/PlantStageIllustration.tsx`
- Test: `tests/components/PlantStageIllustration.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// tests/components/PlantStageIllustration.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PlantStageIllustration } from '@/components/child/garden/PlantStageIllustration';

function svgWrap(content: React.ReactNode) {
  return <svg>{content}</svg>;
}

describe('PlantStageIllustration', () => {
  it('renders a known plant_radish_seed code', () => {
    const { container } = render(svgWrap(<PlantStageIllustration code="plant_radish_seed" x={0} y={0} size={40} />));
    // The component should produce SVG output, not be null
    expect(container.querySelector('g')).not.toBeNull();
  });

  it('returns null for an unknown code', () => {
    const { container } = render(svgWrap(<PlantStageIllustration code="nope" x={0} y={0} size={40} />));
    expect(container.querySelector('g')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/components/PlantStageIllustration.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the component with all 4 radish stages**

```tsx
// components/child/garden/PlantStageIllustration.tsx
//
// Switch-based renderer for plant stages. Same hand-drawn style as
// illustrations.tsx — naturalist palette, dark bark outlines, slight
// asymmetry. Top-down view, sized for the plot grid (40-80 px wide).
//
// Lives in its own file so we don't keep growing illustrations.tsx.
//
// All stages render at translate(x, y) so they slot into the plot at
// the plot's center.

'use client';

const STROKE = '#5A3B1F';

interface Props {
  code: string;
  x: number;
  y: number;
  size: number;
}

interface StageProps { x: number; y: number; size: number; }

// ─── RADISH ─────────────────────────────────────────────────────────────
function RadishSeed({ x, y, size }: StageProps) {
  // Tiny dot in disturbed soil — 5px wide
  const r = size * 0.06;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={0} rx={r * 4} ry={r * 2} fill="#6B4423" opacity={0.35} />
      <circle cx={0} cy={0} r={r} fill="#3F2614" />
    </g>
  );
}

function RadishSprout({ x, y, size }: StageProps) {
  const h = size * 0.2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={size * 0.05} rx={size * 0.18} ry={size * 0.04} fill="#6B4423" opacity={0.4} />
      <line x1={0} y1={size * 0.05} x2={0} y2={-h} stroke="#7BA46F" strokeWidth={1.6} strokeLinecap="round" />
      <ellipse cx={-size * 0.05} cy={-h * 0.9} rx={size * 0.05} ry={size * 0.07} fill="#95B88F" stroke={STROKE} strokeWidth={0.8} transform={`rotate(-25 ${-size * 0.05} ${-h * 0.9})`} />
      <ellipse cx={size * 0.05} cy={-h * 0.9} rx={size * 0.05} ry={size * 0.07} fill="#7BA46F" stroke={STROKE} strokeWidth={0.8} transform={`rotate(25 ${size * 0.05} ${-h * 0.9})`} />
    </g>
  );
}

function RadishLeaves({ x, y, size }: StageProps) {
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.2} rx={r * 0.55} ry={r * 0.1} fill="#6B4423" opacity={0.38} />
      {[0, 60, 120, 180, 240, 300].map(a => (
        <ellipse key={a} cx={0} cy={-r * 0.25} rx={r * 0.2} ry={r * 0.32} fill="#7BA46F" stroke={STROKE} strokeWidth={1} transform={`rotate(${a})`} />
      ))}
      <circle cx={0} cy={r * 0.05} r={r * 0.06} fill="#5C7E4F" />
    </g>
  );
}

function RadishMature({ x, y, size }: StageProps) {
  const r = size / 2;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={r * 0.4} rx={r * 0.7} ry={r * 0.12} fill="#6B4423" opacity={0.3} />
      {/* leafy tops */}
      {[0, 50, 100, 200, 250, 310].map(a => (
        <ellipse key={a} cx={0} cy={-r * 0.4} rx={r * 0.2} ry={r * 0.4} fill="#7BA46F" stroke={STROKE} strokeWidth={1.1} transform={`rotate(${a})`} />
      ))}
      {/* red bulb peeking from soil */}
      <ellipse cx={0} cy={r * 0.18} rx={r * 0.32} ry={r * 0.36} fill="#C84A3A" stroke={STROKE} strokeWidth={1.4} />
      {/* highlight */}
      <ellipse cx={-r * 0.1} cy={r * 0.1} rx={r * 0.1} ry={r * 0.14} fill="#E6705F" opacity={0.7} />
      {/* root tail */}
      <path d={`M 0 ${r * 0.5} Q ${r * 0.04} ${r * 0.62} 0 ${r * 0.74}`} stroke="#FFFAF2" strokeWidth={1.2} fill="none" strokeLinecap="round" />
    </g>
  );
}

export function PlantStageIllustration({ code, x, y, size }: Props) {
  switch (code) {
    case 'plant_radish_seed':    return <RadishSeed x={x} y={y} size={size} />;
    case 'plant_radish_sprout':  return <RadishSprout x={x} y={y} size={size} />;
    case 'plant_radish_leaves':  return <RadishLeaves x={x} y={y} size={size} />;
    case 'plant_radish_mature':  return <RadishMature x={x} y={y} size={size} />;
    default: return null;
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/components/PlantStageIllustration.test.tsx`
Expected: PASS — both tests green.

- [ ] **Step 5: Commit**

```bash
git add components/child/garden/PlantStageIllustration.tsx tests/components/PlantStageIllustration.test.tsx
git commit -m "feat(illustrations): PlantStageIllustration with 4 radish stages

Switch-based renderer for plant_<code>_<stage> codes. Lives in its
own file so illustrations.tsx doesn't grow further. Radish gets
seed (tiny dot), sprout (single stem with two cotyledons), leaves
(rosette of greens), mature (red bulb + leafy top + root tail)."
```

---

### Tasks 8-16: 9 more plants (one task per plant)

Each plant follows the **identical structure** as Task 7:
1. Add a small `render` test to `tests/components/PlantStageIllustration.test.tsx` for one stage of the new plant.
2. Implement N stage components (matching the spec's stage list for that plant).
3. Add the cases to the `switch` in `PlantStageIllustration.tsx`.
4. Run `npx vitest run tests/components/PlantStageIllustration.test.tsx` — all pass.
5. Commit with message: `feat(illustrations): plant stages for <plantCode>`

**Important visual constraints for every plant** (apply to all 9 tasks below):
- Top-down view (you're looking down at the plot)
- Sized to the `size` prop — early stages should render at ~10-20% of size, mature ~80-100%
- Use `STROKE = '#5A3B1F'` for outlines at strokeWidth 1-1.4 (smaller plants → thinner)
- Naturalist palette: greens `#7BA46F #95B88F #5C7E4F`, browns `#6B4423 #8B5A2B`, blues/cool tones for water plants
- Slight asymmetry — rotate leaves at small angles, jitter small details
- Each stage has the same `<g transform="translate(x,y)">` wrapper

### Task 8: Mint stages

**Stages to draw:**
- `plant_mint_seed` — same disturbed-soil dot pattern as RadishSeed
- `plant_mint_sprout` — single stem with two oval leaves (slightly serrated edge implied by tiny notch)
- `plant_mint_young` — three pairs of opposite leaves on a stem ~30% of size
- `plant_mint_mature` — bushy mound (~70% of size) with rounded leaves clustered tightly, color `#7BA46F`

Add cases for all 4 codes in the switch. Add one test:
```tsx
it('renders plant_mint_mature', () => {
  const { container } = render(svgWrap(<PlantStageIllustration code="plant_mint_mature" x={0} y={0} size={50} />));
  expect(container.querySelector('g')).not.toBeNull();
});
```

Commit: `feat(illustrations): plant stages for mint`

### Task 9: Lettuce stages

**Stages:**
- `plant_lettuce_seed` — dot in soil
- `plant_lettuce_sprout` — small green tuft, looser than mint
- `plant_lettuce_young` — overlapping wide leaves forming a loose rosette ~50%
- `plant_lettuce_mature` — full leafy head ~80% with frilly outer edges. Use 6-8 overlapping `<ellipse>` and outline with `path` for ruffly edge. Color `#95B88F` outer / `#A2C794` inner.

Switch cases + render test for `plant_lettuce_mature`. Commit: `feat(illustrations): plant stages for lettuce`

### Task 10: Tulip stages

**Stages:**
- `plant_tulip_bulb` — small brown ovoid bulb partially buried; brown `#7A4A1F`
- `plant_tulip_spear` — single thin green spear shooting up, ~25% size
- `plant_tulip_bud` — taller stem with closed pointed bud at top in pink/red `#C38D9E`
- `plant_tulip_bloom` — open tulip flower (3 petals visible from above), with two leaves at the base. Petal color `#E8A87C` or `#C38D9E`.

Switch cases + render test. Commit: `feat(illustrations): plant stages for tulip`

### Task 11: Daisy stages

**Stages:**
- `plant_daisy_seed` — soil dot
- `plant_daisy_sprout` — small pair of cotyledons
- `plant_daisy_bud` — stem with closed yellow-green bud
- `plant_daisy_bloom` — classic 8-12 white petals around yellow center, viewed top-down. Petals: `#FFFAF2` with `#E8C493` shadow. Center: `#FFD93D` with `#E8A87C` ring.

Switch cases + render test. Commit: `feat(illustrations): plant stages for daisy`

### Task 12: Sunflower stages

**Stages:** (5 stages)
- `plant_sunflower_seed` — single dark seed in soil
- `plant_sunflower_sprout` — small sprout
- `plant_sunflower_stalk` — tall thin green stalk with two large leaves opposite each other (no flower yet) — render at ~50% width
- `plant_sunflower_bud` — stalk with green bud at top
- `plant_sunflower_bloom` — large yellow head viewed top-down: 12-16 yellow petals around brown center stippled with seeds. Color: petals `#FFD93D` outline `#E8A87C`, center `#5A3B1F` with `#3F2614` seed dots. Use `<circle>` array for seeds.

Switch cases + render test for `plant_sunflower_bloom`. Commit: `feat(illustrations): plant stages for sunflower`

### Task 13: Apple sapling stages

**Stages:** (5 stages)
- `plant_apple_seed` — single seed
- `plant_apple_sprout` — first leaves (rounder than radish)
- `plant_apple_twig` — short bare brown twig with maybe 2 leaves
- `plant_apple_young` — small tree ~50% with rounded green canopy on a brown trunk
- `plant_apple_mature` — taller tree with green canopy and one prominent red apple. Canopy: `#7BA46F` filled, `#5C7E4F` outline. Apple: `#C84A3A` with leaf.

Switch cases + render test. Commit: `feat(illustrations): plant stages for apple`

### Task 14: Bamboo stages

**Stages:**
- `plant_bamboo_seed` — soil disturbance + dot
- `plant_bamboo_shoot` — single thick green shoot pushing up, blunt-tipped
- `plant_bamboo_stalk` — tall single stalk with 2-3 thin pointed leaves at the top, stem `#8CB27A`, node rings at intervals
- `plant_bamboo_cluster` — 4-5 stalks clustered, varying heights, leaves at top of each. Color `#7BA46F`, `#A2C794`.

Switch cases + render test. Commit: `feat(illustrations): plant stages for bamboo`

### Task 15: Bonsai stages

**Stages:**
- `plant_bonsai_seed` — soil dot
- `plant_bonsai_sprout` — tiny pine sprout (single needle tuft)
- `plant_bonsai_young` — small twisted brown trunk with small green needled crown
- `plant_bonsai_mature` — bonsai shape: low broad crown of needles spreading horizontally, contorted trunk. Render in a small ceramic pot indicated by a dark `<rect>` or trapezoid base in `#5A4533`.

Switch cases + render test. Commit: `feat(illustrations): plant stages for bonsai`

### Task 16: Cherry blossom stages

**Stages:** (5 stages)
- `plant_cherry_seed` — pit-like seed
- `plant_cherry_sprout` — single sprout
- `plant_cherry_twig` — bare brown twig
- `plant_cherry_young` — small tree with green leaves, no blossoms
- `plant_cherry_bloom` — taller tree with crown of pink/white cherry blossoms. Use cluster of small `<circle>` in `#FFD6E0` and `#FFFAF2`.

Switch cases + render test. Commit: `feat(illustrations): plant stages for cherry`

---

## Phase 3 — Scene + plots

### Task 17: Quadrant background SVG helpers

**Files:**
- Create: `components/child/garden/QuadrantBackgrounds.tsx`

This is a pure-visual file with 4 React components, one per quadrant. Each renders a rectangle of soil/grass/sand at the quadrant's position with characteristic decoration (furrows for veg, stones for flower, dappled grass for fruit, raked sand for japanese).

- [ ] **Step 1: Create the file**

```tsx
// components/child/garden/QuadrantBackgrounds.tsx
//
// Four quadrant backgrounds rendered as one component each. Each takes
// origin (top-left x,y) and size (w,h). They're decorative SVG only —
// no interactions. Same hand-drawn vocabulary as the rest of the world.

'use client';

const STROKE = '#5A3B1F';

interface BgProps { x: number; y: number; w: number; h: number; }

export function VegetableBackground({ x, y, w, h }: BgProps) {
  // Brown furrowed earth with horizontal furrow lines.
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={0} y={0} width={w} height={h} rx={8} fill="#8B5A2B" stroke={STROKE} strokeWidth={1.5} />
      <rect x={4} y={4} width={w - 8} height={h - 8} rx={6} fill="#6B4423" />
      {[0.2, 0.4, 0.6, 0.8].map((f, i) => (
        <line key={i} x1={12} y1={h * f} x2={w - 12} y2={h * f} stroke="#3F2614" strokeWidth={1} opacity={0.55} />
      ))}
      {/* a few pebbles */}
      <circle cx={w * 0.15} cy={h * 0.7} r={2} fill="#A89D8A" />
      <circle cx={w * 0.75} cy={h * 0.3} r={2.4} fill="#A89D8A" />
    </g>
  );
}

export function FlowerBackground({ x, y, w, h }: BgProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={0} y={0} width={w} height={h} rx={8} fill="#5C7E4F" stroke={STROKE} strokeWidth={1.5} />
      <rect x={4} y={4} width={w - 8} height={h - 8} rx={6} fill="#7BA46F" />
      {/* stone edging */}
      {[0.1, 0.3, 0.5, 0.7, 0.9].map((f, i) => (
        <ellipse key={i} cx={w * f} cy={h - 6} rx={10} ry={4} fill="#A89D8A" stroke={STROKE} strokeWidth={1} />
      ))}
      {/* moss tufts */}
      <ellipse cx={w * 0.2} cy={h * 0.85} rx={6} ry={2} fill="#5C7E4F" opacity={0.6} />
      <ellipse cx={w * 0.8} cy={h * 0.15} rx={6} ry={2} fill="#5C7E4F" opacity={0.6} />
    </g>
  );
}

export function FruitGroveBackground({ x, y, w, h }: BgProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={0} y={0} width={w} height={h} rx={8} fill="#6B8E5A" stroke={STROKE} strokeWidth={1.5} />
      <rect x={4} y={4} width={w - 8} height={h - 8} rx={6} fill="#7BA46F" />
      {/* tree-shape clearings (slightly darker patches) */}
      {[0.25, 0.75].flatMap((fx, ix) =>
        [0.3, 0.7].map((fy, iy) => (
          <ellipse key={`${ix}-${iy}`} cx={w * fx} cy={h * fy} rx={50} ry={45} fill="#5C7E4F" opacity={0.45} />
        ))
      )}
      <ellipse cx={w * 0.1} cy={h * 0.9} rx={5} ry={2} fill="#A89D8A" />
    </g>
  );
}

export function JapaneseBackground({ x, y, w, h }: BgProps) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={0} y={0} width={w} height={h} rx={8} fill="#D8D0C0" stroke={STROKE} strokeWidth={1.5} />
      <rect x={4} y={4} width={w - 8} height={h - 8} rx={6} fill="#E8E0D0" />
      {/* raked sand lines */}
      {[0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85].map((f, i) => (
        <path key={i}
          d={`M 8 ${h * f} Q ${w * 0.5} ${h * f - 3} ${w - 8} ${h * f}`}
          stroke="#B5ACA0" strokeWidth={0.8} fill="none" opacity={0.7} />
      ))}
      {/* stone lantern in corner */}
      <g transform={`translate(${w - 30}, ${h - 30})`}>
        <rect x={-6} y={-2} width={12} height={4} fill="#A89D8A" stroke={STROKE} strokeWidth={0.8} />
        <rect x={-4} y={-12} width={8} height={10} fill="#9B948A" stroke={STROKE} strokeWidth={0.8} />
        <rect x={-3} y={-9} width={6} height={6} fill="#FFD06B" />
        <path d={`M -8 -12 L 0 -18 L 8 -12 Z`} fill="#7F7A70" stroke={STROKE} strokeWidth={0.8} />
      </g>
      {/* small bamboo cluster border */}
      {[10, 18, 26].map(bx => (
        <line key={bx} x1={bx} y1={h - 10} x2={bx + 1} y2={h - 26} stroke="#7BA46F" strokeWidth={2} strokeLinecap="round" />
      ))}
    </g>
  );
}
```

- [ ] **Step 2: No tests** (pure-visual decoration; no logic to test)

- [ ] **Step 3: Commit**

```bash
git add components/child/garden/QuadrantBackgrounds.tsx
git commit -m "feat(illustrations): four quadrant backgrounds for tiny garden

Decorative SVG-only backgrounds for the four /garden/grow quadrants:
vegetable (furrowed earth), flower (stone-edged bed), fruit (dappled
grass with tree-shape clearings), japanese (raked sand with stone
lantern + bamboo border). Hand-drawn style matching the rest of
the world."
```

---

### Task 18: `/garden/grow` server page

**Files:**
- Create: `app/(child)/garden/grow/page.tsx`

- [ ] **Step 1: Implement the server component**

```tsx
// app/(child)/garden/grow/page.tsx
//
// Server component for the Tiny Garden reward-game. Loads everything
// the scene needs via loadGrowState and hands off to GrowScene.

import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import { loadGrowState } from '@/lib/world/growGarden';
import GrowScene from './GrowScene';

export const dynamic = 'force-dynamic';

export default async function GrowPage({
  searchParams,
}: {
  searchParams: { learner?: string };
}) {
  const db = createServiceClient();
  const learnerId = await resolveLearnerId(db, searchParams.learner);
  if (!learnerId) {
    return <div className="p-6">No learner found.</div>;
  }
  const state = await loadGrowState(db, learnerId);

  return <GrowScene learnerId={learnerId} state={state} />;
}
```

- [ ] **Step 2: Verify route resolves**

Run `npm run build` and confirm `/garden/grow` appears in the route list.

- [ ] **Step 3: Commit**

```bash
git add app/\(child\)/garden/grow/page.tsx
git commit -m "feat(grow): /garden/grow server route

Loads cumulative correct + plot state via loadGrowState and passes
to GrowScene. Uses the same active-learner resolution pattern as
the other /garden/* routes."
```

---

### Task 19: `GrowScene` skeleton

**Files:**
- Create: `app/(child)/garden/grow/GrowScene.tsx`

- [ ] **Step 1: Implement the scene with quadrant backgrounds + plots**

```tsx
// app/(child)/garden/grow/GrowScene.tsx
//
// Client scene for /garden/grow. Renders four quadrants with their
// backgrounds, 16 plot positions, and any planted plants. Tap
// handlers + modals are added in subsequent tasks.

'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { GrowState } from '@/lib/world/growGarden';
import { QUADRANT_LAYOUT } from '@/lib/world/plotLayout';
import { plantStageFor } from '@/lib/world/plantCatalog';
import { PlantStageIllustration } from '@/components/child/garden/PlantStageIllustration';
import {
  VegetableBackground, FlowerBackground, FruitGroveBackground, JapaneseBackground,
} from '@/components/child/garden/QuadrantBackgrounds';

export default function GrowScene({
  learnerId, state,
}: {
  learnerId: string;
  state: GrowState;
}) {
  return (
    <div className="bg-[#F5EBDC] flex flex-col overflow-hidden" style={{ height: '100dvh', minHeight: '100vh' }}>
      <header className="flex items-center justify-between bg-cream/90 backdrop-blur border-b border-ochre/30 px-3 py-2">
        <Link
          href={`/garden?learner=${learnerId}`}
          className="text-xl p-1.5 rounded-full bg-white border border-ochre"
          aria-label="back"
          style={{ minWidth: 40, minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >←</Link>
        <h1 className="font-display text-[22px] text-bark" style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
          <span className="italic">my</span> growing garden
        </h1>
        <div style={{ width: 40 }} />
      </header>

      <div className="flex-1 relative overflow-hidden">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid meet"
             className="absolute inset-0 w-full h-full" style={{ touchAction: 'manipulation' }}>
          {/* Quadrant backgrounds (top-left of each quadrant) */}
          <VegetableBackground   x={80}  y={50}  w={520} h={340} />
          <FruitGroveBackground   x={800} y={50}  w={520} h={340} />
          <FlowerBackground       x={80}  y={420} w={520} h={340} />
          <JapaneseBackground     x={800} y={420} w={520} h={340} />

          {/* Quadrant title pills */}
          {Object.entries(QUADRANT_LAYOUT).map(([garden, q]) => {
            const isOpen = state.openQuadrants.has(garden as any);
            return (
              <g key={garden} pointerEvents="none">
                <rect x={q.x - 80} y={q.y - 12} width={160} height={20} rx={10}
                      fill="rgba(255,250,242,0.85)" stroke="#E8A87C" strokeWidth={1} />
                <text x={q.x} y={q.y + 2} textAnchor="middle"
                      fontSize={11} fontStyle="italic" fontWeight={600}
                      fill={isOpen ? '#6b4423' : '#95876a'}>
                  {q.label}{isOpen ? '' : '   🔒'}
                </text>
              </g>
            );
          })}

          {/* Locked-quadrant overlay (dim the whole quadrant box) */}
          {!state.openQuadrants.has('flower') && (
            <rect x={80} y={420} width={520} height={340} fill="#5A3B1F" opacity={0.45} pointerEvents="none" />
          )}
          {!state.openQuadrants.has('fruit') && (
            <rect x={800} y={50} width={520} height={340} fill="#5A3B1F" opacity={0.45} pointerEvents="none" />
          )}
          {!state.openQuadrants.has('japanese') && (
            <rect x={800} y={420} width={520} height={340} fill="#5A3B1F" opacity={0.45} pointerEvents="none" />
          )}

          {/* Plots: render plant illustration if planted, otherwise nothing yet */}
          {state.plots.map(p => {
            if (!p.plant) return null;
            const stage = plantStageFor(p.plant.data, p.plant.progress);
            const sizePx = p.plant.isMature ? 64 : 48;
            return (
              <PlantStageIllustration
                key={p.plot.code}
                code={stage.illustration}
                x={p.plot.x} y={p.plot.y} size={sizePx}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it renders**

Run `npm run dev`, navigate to `/garden/grow?learner=<some-id>`, confirm 4 quadrants render with title pills and locked quadrants are dimmed.

- [ ] **Step 3: Commit**

```bash
git add app/\(child\)/garden/grow/GrowScene.tsx
git commit -m "feat(grow): GrowScene skeleton with 4 quadrants + planted plants

Renders the four quadrant backgrounds at fixed positions, italic
title pills with 🔒 hint for locked quadrants, dim overlay on
unopened quadrants, and any planted plants at their plot positions
using the current stage illustration."
```

---

## Phase 4 — Interactions

### Task 20: Server actions for plant + harvest

**Files:**
- Create: `app/(child)/garden/grow/actions.ts`
- Test: `tests/world/growActions.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/world/growActions.test.ts
//
// Server actions are tested via the helpers they delegate to. We
// extract the plant + harvest LOGIC into pure functions that the
// actions wrap, so we can test them without spinning up a Next runtime.
import { describe, it, expect } from 'vitest';
import {
  validatePlantRequest,
  type GrowState,
} from '@/app/(child)/garden/grow/actions.shared';

const baseState: GrowState = {
  cumulativeCorrect: 100,
  earnedSeeds: [
    { code: 'radish' } as any,
    { code: 'tulip' } as any,
  ] as any,
  openQuadrants: new Set(['vegetable']),
  plots: [
    { plot: { code: 'veg-1', garden: 'vegetable', x: 0, y: 0 } },
    { plot: { code: 'veg-2', garden: 'vegetable', x: 0, y: 0 } },
    { plot: { code: 'flower-1', garden: 'flower', x: 0, y: 0 } },
  ] as any,
};

describe('validatePlantRequest', () => {
  it('accepts a valid plant in an empty plot of matching garden type', () => {
    const r = validatePlantRequest(baseState, 'veg-1', 'radish');
    expect(r.ok).toBe(true);
  });
  it('rejects when plot is occupied', () => {
    const occupied = { ...baseState, plots: [
      { plot: baseState.plots[0].plot, plant: { data: { code: 'radish' } } as any },
    ]};
    const r = validatePlantRequest(occupied as any, 'veg-1', 'radish');
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/occupied/i);
  });
  it('rejects when seed not earned', () => {
    const r = validatePlantRequest(baseState, 'veg-1', 'cherry');
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/not earned/i);
  });
  it('rejects when plot does not exist', () => {
    const r = validatePlantRequest(baseState, 'veg-99', 'radish');
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/no plot/i);
  });
  it('rejects flower seed in vegetable plot (garden mismatch)', () => {
    const r = validatePlantRequest(baseState, 'veg-1', 'tulip');
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/wrong kind/i);
  });
  it('rejects when quadrant is locked', () => {
    // locked flower (not in openQuadrants)
    const r = validatePlantRequest(baseState, 'flower-1', 'tulip');
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/quadrant/i);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/world/growActions.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `actions.shared.ts` and `actions.ts`**

Create `app/(child)/garden/grow/actions.shared.ts`:

```ts
// Pure validation logic shared by the server action and tests. No
// Supabase / Next imports — just data structures so we can unit-test.

import type { GrowState } from '@/lib/world/growGarden';
import { getPlant } from '@/lib/world/plantCatalog';

export type { GrowState };

export type ValidationResult = { ok: true } | { ok: false; reason: string };

export function validatePlantRequest(
  state: GrowState,
  plotCode: string,
  plantCode: string,
): ValidationResult {
  const plotEntry = state.plots.find(p => p.plot.code === plotCode);
  if (!plotEntry) return { ok: false, reason: 'no plot with that code' };
  if (plotEntry.plant) return { ok: false, reason: 'plot is occupied' };
  if (!state.earnedSeeds.some(s => s.code === plantCode)) {
    return { ok: false, reason: 'seed not earned yet' };
  }
  const plant = getPlant(plantCode);
  if (!plant) return { ok: false, reason: 'unknown plant' };
  if (plant.garden !== plotEntry.plot.garden) {
    return { ok: false, reason: `wrong kind of garden — ${plant.commonName} grows in the ${plant.garden} garden` };
  }
  if (!state.openQuadrants.has(plant.garden)) {
    return { ok: false, reason: `that quadrant isn't open yet` };
  }
  return { ok: true };
}
```

Create `app/(child)/garden/grow/actions.ts`:

```ts
// app/(child)/garden/grow/actions.ts
//
// Server actions for planting + harvesting. Both validate via the
// shared helper, then write to garden_plot.

'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';
import { loadGrowState } from '@/lib/world/growGarden';
import { validatePlantRequest } from './actions.shared';

export async function plantSeed(
  learnerId: string,
  plotCode: string,
  plantCode: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const db = createServiceClient();
  const state = await loadGrowState(db, learnerId);
  const valid = validatePlantRequest(state, plotCode, plantCode);
  if (!valid.ok) return valid;

  const { error } = await db.from('garden_plot').insert({
    learner_id: learnerId,
    plot_code: plotCode,
    plant_code: plantCode,
    planted_at_correct: state.cumulativeCorrect,
  });
  if (error) return { ok: false, reason: error.message };

  revalidatePath('/garden/grow');
  return { ok: true };
}

export async function harvestPlant(
  learnerId: string,
  plotCode: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const db = createServiceClient();
  const state = await loadGrowState(db, learnerId);
  const plotEntry = state.plots.find(p => p.plot.code === plotCode);
  if (!plotEntry?.plant) return { ok: false, reason: 'nothing planted here' };
  if (!plotEntry.plant.isMature) return { ok: false, reason: 'not ready yet' };

  const { error } = await db
    .from('garden_plot')
    .update({ harvested_at: new Date().toISOString() })
    .eq('learner_id', learnerId)
    .eq('plot_code', plotCode)
    .is('harvested_at', null);
  if (error) return { ok: false, reason: error.message };

  revalidatePath('/garden/grow');
  return { ok: true };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/world/growActions.test.ts`
Expected: PASS — all 6 tests green.

- [ ] **Step 5: Commit**

```bash
git add app/\(child\)/garden/grow/actions.ts app/\(child\)/garden/grow/actions.shared.ts tests/world/growActions.test.ts
git commit -m "feat(grow): plantSeed + harvestPlant server actions

Pure validation in actions.shared.ts (testable). Server actions
plantSeed and harvestPlant validate then write to garden_plot.
Both call revalidatePath('/garden/grow') so the UI re-fetches."
```

---

### Task 21: `EmptyPlotPicker` modal + plant interaction

**Files:**
- Create: `app/(child)/garden/grow/EmptyPlotPicker.tsx`
- Modify: `app/(child)/garden/grow/GrowScene.tsx`

- [ ] **Step 1: Create the picker modal**

```tsx
// app/(child)/garden/grow/EmptyPlotPicker.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type PlantData } from '@/lib/world/plantCatalog';
import { PlantStageIllustration } from '@/components/child/garden/PlantStageIllustration';
import { plantSeed } from './actions';

export default function EmptyPlotPicker({
  open, onClose, learnerId, plotCode, plotGarden, earnedSeeds,
}: {
  open: boolean;
  onClose: () => void;
  learnerId: string;
  plotCode: string;
  plotGarden: 'vegetable' | 'flower' | 'fruit' | 'japanese';
  earnedSeeds: PlantData[];
}) {
  const [planting, setPlanting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const compatible = earnedSeeds.filter(s => s.garden === plotGarden);

  const onPick = async (plantCode: string) => {
    if (planting) return;
    setPlanting(true);
    setError(null);
    const result = await plantSeed(learnerId, plotCode, plantCode);
    setPlanting(false);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center p-6 z-30"
          style={{ background: 'radial-gradient(circle at 50% 40%, rgba(20, 25, 40, 0.3), rgba(20, 25, 40, 0.5))' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-cream border-4 border-terracotta rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-display text-[20px] text-bark text-center" style={{ fontWeight: 600 }}>
              what would you like to plant?
            </h3>
            {compatible.length === 0 ? (
              <div className="text-center text-bark/60 italic font-display text-[14px] py-4">
                no seeds yet for this garden — keep practicing.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {compatible.map(seed => (
                  <button
                    key={seed.code}
                    onClick={() => onPick(seed.code)}
                    disabled={planting}
                    className="bg-white border-2 border-ochre rounded-2xl p-3 flex flex-col items-center gap-1 disabled:opacity-50"
                    style={{ minHeight: 96, touchAction: 'manipulation' }}
                  >
                    <svg viewBox="-30 -30 60 60" width={50} height={50}>
                      <PlantStageIllustration code={seed.stages[0].illustration} x={0} y={0} size={40} />
                    </svg>
                    <span className="font-display text-[13px] text-bark" style={{ fontWeight: 600 }}>
                      {seed.commonName}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {error && <div className="text-rose font-display text-[12px] italic text-center">{error}</div>}
            <button
              onClick={onClose}
              className="w-full bg-white border-2 border-ochre rounded-full py-2 font-display italic text-bark/70"
              style={{ minHeight: 44, touchAction: 'manipulation' }}
            >
              never mind
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Wire empty-plot taps in `GrowScene.tsx`**

Add this state at the top of `GrowScene`:
```tsx
const [pickerPlotCode, setPickerPlotCode] = useState<string | null>(null);
```

Inside the `<svg>`, add an empty-plot tap target for each plot WITHOUT a plant:
```tsx
{state.plots.map(p => {
  if (p.plant) return null;
  const isOpen = state.openQuadrants.has(p.plot.garden);
  return (
    <g key={`empty-${p.plot.code}`}
       style={{ cursor: isOpen ? 'pointer' : 'not-allowed', touchAction: 'manipulation' }}
       onClick={() => isOpen && setPickerPlotCode(p.plot.code)}>
      {/* dashed outline indicating empty plot */}
      <ellipse cx={p.plot.x} cy={p.plot.y} rx={28} ry={18}
               fill="rgba(0,0,0,0.08)" stroke={isOpen ? '#8B5A2B' : '#5A3B1F'}
               strokeWidth={1.4} strokeDasharray="4 4" opacity={isOpen ? 0.6 : 0.3} />
      {isOpen && (
        <text x={p.plot.x} y={p.plot.y + 4} textAnchor="middle"
              fontSize={18} fill="#6B4423" opacity={0.5}>+</text>
      )}
    </g>
  );
})}
```

After the `</svg>`, render the picker:
```tsx
<EmptyPlotPicker
  open={pickerPlotCode !== null}
  onClose={() => setPickerPlotCode(null)}
  learnerId={learnerId}
  plotCode={pickerPlotCode ?? ''}
  plotGarden={state.plots.find(p => p.plot.code === pickerPlotCode)?.plot.garden ?? 'vegetable'}
  earnedSeeds={state.earnedSeeds}
/>
```

Add the import:
```tsx
import EmptyPlotPicker from './EmptyPlotPicker';
```

- [ ] **Step 3: Manual smoke test**

Run `npm run dev`, navigate to `/garden/grow`, tap an empty veg plot, confirm picker opens with compatible seeds, pick one, confirm a plant appears in that plot after the page reloads.

- [ ] **Step 4: Commit**

```bash
git add app/\(child\)/garden/grow/EmptyPlotPicker.tsx app/\(child\)/garden/grow/GrowScene.tsx
git commit -m "feat(grow): EmptyPlotPicker modal + tap-to-plant flow

Tapping an empty plot opens the picker which shows seeds the
learner has earned, filtered to the plot's garden type. Tap a
seed to plant; revalidatePath('/garden/grow') triggers a refresh.
Locked quadrants don't accept taps."
```

---

### Task 22: `PlantInspectModal`

**Files:**
- Create: `app/(child)/garden/grow/PlantInspectModal.tsx`
- Modify: `app/(child)/garden/grow/GrowScene.tsx`

- [ ] **Step 1: Create the modal**

```tsx
// app/(child)/garden/grow/PlantInspectModal.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type PlantData, plantStageFor, progressHint } from '@/lib/world/plantCatalog';
import { PlantStageIllustration } from '@/components/child/garden/PlantStageIllustration';
import { harvestPlant } from './actions';

const SUN_LABEL = { full: '☀ full sun', partial: '☀ partial sun', shade: '☁ shade' } as const;
const WATER_LABEL = { low: '💧 a little', medium: '💧💧 medium', high: '💧💧💧 lots' } as const;

export default function PlantInspectModal({
  open, onClose, learnerId, plotCode, plant, progress,
}: {
  open: boolean;
  onClose: () => void;
  learnerId: string;
  plotCode: string;
  plant: PlantData | null;
  progress: number;
}) {
  const [harvesting, setHarvesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!plant) return null;
  const stage = plantStageFor(plant, progress);
  const isMature = progress >= plant.growthCost;
  // Pick a stable fact based on plot code (deterministic per plot)
  const factIndex = (plotCode.charCodeAt(plotCode.length - 1) ?? 0) % plant.facts.length;

  const onHarvest = async () => {
    if (harvesting) return;
    setHarvesting(true);
    setError(null);
    const r = await harvestPlant(learnerId, plotCode);
    setHarvesting(false);
    if (!r.ok) { setError(r.reason); return; }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center p-6 z-30"
          style={{ background: 'radial-gradient(circle at 50% 40%, rgba(20, 25, 40, 0.3), rgba(20, 25, 40, 0.5))' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-cream border-4 border-terracotta rounded-3xl max-w-sm w-full p-6 space-y-3 text-center shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <svg viewBox="-60 -60 120 120" width={120} height={120} className="mx-auto">
              <PlantStageIllustration code={stage.illustration} x={0} y={0} size={100} />
            </svg>
            <div>
              <h3 className="font-display text-[22px] text-bark" style={{ fontWeight: 600 }}>{plant.commonName}</h3>
              <div className="font-display italic text-[12px] text-bark/55">{plant.scientificName}</div>
            </div>
            <div className="font-display italic text-[14px] text-forest">{progressHint(plant, progress)}</div>
            <div className="bg-white/70 border-2 border-ochre/40 rounded-xl p-3 text-left text-[14px] text-bark font-display">
              {plant.facts[factIndex]}
            </div>
            <div className="flex justify-around text-[12px] font-display text-bark/70">
              <div>{SUN_LABEL[plant.sun]}</div>
              <div>{WATER_LABEL[plant.water]}</div>
            </div>
            <div className="bg-cream border border-ochre/30 rounded-lg p-2 text-[12px] italic font-display text-bark/70">
              tip: {plant.growingTip}
            </div>
            {isMature && (
              <button onClick={onHarvest} disabled={harvesting}
                      className="w-full bg-forest text-white rounded-full py-3 font-display disabled:opacity-50"
                      style={{ minHeight: 56, fontWeight: 600, touchAction: 'manipulation' }}>
                {harvesting ? 'picking…' : '🧺 harvest'}
              </button>
            )}
            {error && <div className="text-rose text-[12px] italic">{error}</div>}
            <button onClick={onClose}
                    className="w-full bg-white border-2 border-ochre rounded-full py-2 font-display italic text-bark/70"
                    style={{ minHeight: 44, touchAction: 'manipulation' }}>
              {isMature ? 'not yet' : 'ok'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Wire planted-plot taps in `GrowScene.tsx`**

Add state:
```tsx
const [inspectPlotCode, setInspectPlotCode] = useState<string | null>(null);
```

In the planted-plot render block (the existing one that shows `PlantStageIllustration`), wrap each plant in a tappable group:
```tsx
{state.plots.map(p => {
  if (!p.plant) return null;
  const stage = plantStageFor(p.plant.data, p.plant.progress);
  const sizePx = p.plant.isMature ? 64 : 48;
  return (
    <g key={p.plot.code}
       style={{ cursor: 'pointer', touchAction: 'manipulation' }}
       onClick={() => setInspectPlotCode(p.plot.code)}>
      <rect x={p.plot.x - 36} y={p.plot.y - 36} width={72} height={72} fill="transparent" />
      <PlantStageIllustration code={stage.illustration} x={p.plot.x} y={p.plot.y} size={sizePx} />
    </g>
  );
})}
```

Render the inspect modal after the picker:
```tsx
<PlantInspectModal
  open={inspectPlotCode !== null}
  onClose={() => setInspectPlotCode(null)}
  learnerId={learnerId}
  plotCode={inspectPlotCode ?? ''}
  plant={state.plots.find(p => p.plot.code === inspectPlotCode)?.plant?.data ?? null}
  progress={state.plots.find(p => p.plot.code === inspectPlotCode)?.plant?.progress ?? 0}
/>
```

Import:
```tsx
import PlantInspectModal from './PlantInspectModal';
```

- [ ] **Step 3: Manual smoke test**

Tap a planted plot, confirm modal opens with current stage, name, fact, sun/water icons, growing tip. If mature, harvest button appears.

- [ ] **Step 4: Commit**

```bash
git add app/\(child\)/garden/grow/PlantInspectModal.tsx app/\(child\)/garden/grow/GrowScene.tsx
git commit -m "feat(grow): PlantInspectModal — tap-to-inspect + harvest

Tapping a planted plot opens a modal with the plant's current-stage
illustration, common + scientific name, progress hint ('almost
ready' etc.), one rotating fact (deterministic per plot), sun/water
icons, growing tip. Mature plants get a harvest button."
```

---

### Task 23: `HarvestCelebration` overlay + sparkle on mature plants

**Files:**
- Create: `app/(child)/garden/grow/HarvestCelebration.tsx`
- Modify: `app/(child)/garden/grow/GrowScene.tsx`
- Modify: `app/(child)/garden/grow/PlantInspectModal.tsx`

- [ ] **Step 1: Create the celebration overlay**

```tsx
// app/(child)/garden/grow/HarvestCelebration.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';

const PETAL_COLORS = ['#FFB7C5', '#FFD93D', '#E8A87C', '#FFFAF2', '#C38D9E'];

export default function HarvestCelebration({ open }: { open: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.svg
          className="absolute inset-0 w-full h-full pointer-events-none z-40"
          viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid meet"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {Array.from({ length: 30 }, (_, i) => {
            const startX = 720 + (Math.random() - 0.5) * 60;
            const startY = 450 + (Math.random() - 0.5) * 60;
            const endX = startX + (Math.random() - 0.5) * 600;
            const endY = startY + 200 + Math.random() * 300;
            const color = PETAL_COLORS[i % PETAL_COLORS.length];
            return (
              <motion.path key={i}
                d="M 0 -5 Q 4 -2 4 2 Q 3 5 0 6 Q -3 5 -4 2 Q -4 -2 0 -5 Z"
                fill={color} stroke="#5A3B1F" strokeWidth={0.5}
                initial={{ x: startX, y: startY, rotate: 0, opacity: 0 }}
                animate={{ x: endX, y: endY, rotate: 360 + Math.random() * 360, opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.6, delay: i * 0.02, ease: 'easeOut' }} />
            );
          })}
        </motion.svg>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Wire celebration in `GrowScene.tsx`**

Add state:
```tsx
const [celebrating, setCelebrating] = useState(false);
```

Pass an `onHarvested` callback to `PlantInspectModal`:
```tsx
<PlantInspectModal
  // ...existing props
  onHarvested={() => {
    setCelebrating(true);
    window.setTimeout(() => setCelebrating(false), 1800);
  }}
/>
```

Render at the bottom (outside the svg):
```tsx
<HarvestCelebration open={celebrating} />
```

Import:
```tsx
import HarvestCelebration from './HarvestCelebration';
```

- [ ] **Step 3: Update `PlantInspectModal` to call `onHarvested`**

In the props of PlantInspectModal add `onHarvested?: () => void;`. In the `onHarvest` handler, after the successful action call:

```tsx
const onHarvest = async () => {
  if (harvesting) return;
  setHarvesting(true);
  setError(null);
  const r = await harvestPlant(learnerId, plotCode);
  setHarvesting(false);
  if (!r.ok) { setError(r.reason); return; }
  onClose();
  onHarvested?.();
};
```

- [ ] **Step 4: Add a sparkle overlay on mature plants in `GrowScene.tsx`**

Inside the planted-plot render block, when `p.plant.isMature` is true add a pulsing yellow sparkle ring above the illustration:
```tsx
{p.plant.isMature && (
  <motion.circle
    cx={p.plot.x} cy={p.plot.y} r={36}
    fill="none" stroke="#FFD93D" strokeWidth={2}
    initial={{ opacity: 0.4, scale: 0.95 }}
    animate={{ opacity: [0.4, 0.85, 0.4], scale: [0.95, 1.08, 0.95] }}
    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
  />
)}
```

Import `motion` if not already:
```tsx
import { motion } from 'framer-motion';
```

- [ ] **Step 5: Commit**

```bash
git add app/\(child\)/garden/grow/HarvestCelebration.tsx app/\(child\)/garden/grow/GrowScene.tsx app/\(child\)/garden/grow/PlantInspectModal.tsx
git commit -m "feat(grow): HarvestCelebration petal burst + mature sparkle

30 colored petals spray from the page center over 1.6s when a
plant is harvested. Mature plants get a steady yellow sparkle
ring (pulsing 2s) on the plot before they're harvested so the
kid notices they're ready."
```

---

### Task 24: `SeedInventoryTray` at the bottom

**Files:**
- Create: `app/(child)/garden/grow/SeedInventoryTray.tsx`
- Modify: `app/(child)/garden/grow/GrowScene.tsx`

- [ ] **Step 1: Create the tray**

```tsx
// app/(child)/garden/grow/SeedInventoryTray.tsx
//
// Strip at the bottom of the grow page showing every seed the
// learner has earned. Purely informational — taps go nowhere; the
// kid plants by tapping an empty plot which then opens the picker.
'use client';

import { type PlantData, type GardenType } from '@/lib/world/plantCatalog';
import { PlantStageIllustration } from '@/components/child/garden/PlantStageIllustration';

const QUADRANT_LABEL: Record<GardenType, string> = {
  vegetable: 'veg',
  flower: 'flower',
  fruit: 'fruit',
  japanese: 'japanese',
};

export default function SeedInventoryTray({
  earnedSeeds, openQuadrants,
}: {
  earnedSeeds: PlantData[];
  openQuadrants: Set<GardenType>;
}) {
  if (earnedSeeds.length === 0) return null;
  return (
    <div className="bg-cream/90 backdrop-blur border-t border-ochre/30 px-3 py-2 flex items-center gap-2 overflow-x-auto">
      <div className="font-display italic text-[11px] text-bark/55 tracking-[0.15em] uppercase shrink-0 pr-2">
        seeds
      </div>
      {earnedSeeds.map(seed => {
        const ready = openQuadrants.has(seed.garden);
        return (
          <div key={seed.code}
               className={`shrink-0 flex flex-col items-center bg-white rounded-xl border-2 px-2 py-1.5 ${ready ? 'border-ochre' : 'border-ochre/30 opacity-60'}`}
               style={{ minWidth: 60 }}>
            <svg viewBox="-25 -25 50 50" width={36} height={36}>
              <PlantStageIllustration code={seed.stages[0].illustration} x={0} y={0} size={32} />
            </svg>
            <span className="font-display text-[10px] text-bark mt-0.5" style={{ fontWeight: 600 }}>
              {seed.commonName}
            </span>
            {!ready && (
              <span className="font-display italic text-[9px] text-bark/50">
                needs {QUADRANT_LABEL[seed.garden]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Render the tray in `GrowScene.tsx`**

Add an import + render below the SVG (BEFORE the closing div):
```tsx
import SeedInventoryTray from './SeedInventoryTray';
// ...
<SeedInventoryTray earnedSeeds={state.earnedSeeds} openQuadrants={state.openQuadrants} />
```

Place it inside the `<div className="flex-1 relative overflow-hidden">` so it sits at the bottom of the scene (use `absolute bottom-0 left-0 right-0` styling on the tray's outer div).

To anchor at the bottom, change the tray's outer div:
```tsx
<div className="absolute bottom-0 left-0 right-0 bg-cream/90 backdrop-blur border-t border-ochre/30 px-3 py-2 flex items-center gap-2 overflow-x-auto">
```

- [ ] **Step 3: Commit**

```bash
git add app/\(child\)/garden/grow/SeedInventoryTray.tsx app/\(child\)/garden/grow/GrowScene.tsx
git commit -m "feat(grow): SeedInventoryTray showing earned seeds

Bottom strip of the /garden/grow page. Shows the seed-stage icon,
common name, and a 'needs flower' hint if the seed's quadrant
isn't yet open. Purely informational; planting still happens via
empty-plot tap → picker."
```

---

## Phase 5 — Discovery + sound

### Task 25: 🌱 button in garden header

**Files:**
- Modify: `app/(child)/garden/page.tsx` (compute and pass cumulativeCorrect)
- Modify: `app/(child)/garden/GardenScene.tsx` (conditional button)

- [ ] **Step 1: Compute cumulativeCorrect in the page**

In `app/(child)/garden/page.tsx`, just before the GardenScene return, add:
```ts
import { getCumulativeCorrect } from '@/lib/world/cumulativeProgress';
// ...
const cumulativeCorrect = await getCumulativeCorrect(db, learnerId);
```

Pass to GardenScene:
```tsx
<GardenScene /* ...existing props... */ cumulativeCorrect={cumulativeCorrect} />
```

- [ ] **Step 2: Accept and use the prop in `GardenScene.tsx`**

Add to the component's props type:
```ts
cumulativeCorrect?: number;
```
Default 0. Then in the header buttons div (next to the existing 📖 journal Link), add:
```tsx
{cumulativeCorrect >= 25 && (
  <Link
    href={`/garden/grow?learner=${learnerId}`}
    className="text-lg p-1.5 rounded-full bg-white border border-ochre"
    aria-label="grow garden"
    title="Grow Garden"
    style={{ minWidth: 40, minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
  >🌱</Link>
)}
```

- [ ] **Step 3: Manual smoke test**

For a learner with ≥25 correct attempts, verify the 🌱 appears in the header. For a fresh learner, verify it's hidden.

- [ ] **Step 4: Commit**

```bash
git add app/\(child\)/garden/page.tsx app/\(child\)/garden/GardenScene.tsx
git commit -m "feat(grow): 🌱 garden header button (conditional ≥25 correct)

Page computes cumulative correct via getCumulativeCorrect and
passes to GardenScene. Header renders 🌱 button next to 📖
journal once the learner has earned at least one seed; before
that the button is hidden so it doesn't appear before it does
anything."
```

---

### Task 26: Session-end seed-earned cards

**Files:**
- Create: `app/(child)/complete/[sessionId]/SeedEarnedCard.tsx`
- Modify: `app/(child)/complete/[sessionId]/page.tsx`

- [ ] **Step 1: Create the card component**

```tsx
// app/(child)/complete/[sessionId]/SeedEarnedCard.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { type PlantData } from '@/lib/world/plantCatalog';
import { PlantStageIllustration } from '@/components/child/garden/PlantStageIllustration';

const QUADRANT_LABEL: Record<string, string> = {
  flower: 'flower garden',
  fruit: 'fruit grove',
  japanese: 'japanese garden',
};

export default function SeedEarnedCard({
  plant, opensQuadrant, isFirstEver, learnerId, index,
}: {
  plant: PlantData;
  opensQuadrant?: 'flower' | 'fruit' | 'japanese';
  isFirstEver: boolean;
  learnerId: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + index * 0.15, duration: 0.5, ease: [0.22, 0.9, 0.34, 1] }}
      className="bg-cream border-4 border-terracotta rounded-3xl p-5 space-y-3 text-center"
    >
      <svg viewBox="-30 -30 60 60" width={72} height={72} className="mx-auto">
        <PlantStageIllustration code={plant.stages[0].illustration} x={0} y={0} size={50} />
      </svg>
      <h3 className="font-display text-[20px] text-bark" style={{ fontWeight: 600 }}>
        🌱 you earned a seed: {plant.commonName}
        {opensQuadrant && <span className="block text-[14px] italic text-forest mt-1">— and your {QUADRANT_LABEL[opensQuadrant]} opens</span>}
      </h3>
      <p className="font-display italic text-[14px] text-bark/70 leading-snug">
        {plant.facts[0]}
      </p>
      {isFirstEver && (
        <p className="font-display italic text-[12px] text-bark/55">
          open the 🌱 in your garden header any time.
        </p>
      )}
      <Link
        href={`/garden/grow?learner=${learnerId}`}
        className="block w-full bg-forest text-white rounded-full py-3 font-display"
        style={{ touchAction: 'manipulation', minHeight: 56, fontWeight: 600 }}
      >
        🌿 plant it →
      </Link>
    </motion.div>
  );
}
```

- [ ] **Step 2: Compute before/after in the complete page**

In `app/(child)/complete/[sessionId]/page.tsx`, after the existing `gems` query, add:

```ts
import { getCumulativeCorrect, getCumulativeCorrectAt } from '@/lib/world/cumulativeProgress';
import { getSessionSeedEarns } from '@/lib/world/seedEarnSchedule';
import { getPlant } from '@/lib/world/plantCatalog';
import SeedEarnedCard from './SeedEarnedCard';

// ...
const sessionStart = session?.started_at ? new Date(session.started_at) : new Date();
const beforeCount = await getCumulativeCorrectAt(db, session!.learner_id, sessionStart);
const afterCount = await getCumulativeCorrect(db, session!.learner_id);
const seedEarns = getSessionSeedEarns(beforeCount, afterCount);
```

After the existing `<VirtueGemMoment>` block, render the new cards:

```tsx
{seedEarns.length > 0 && (
  <div className="space-y-3 pt-2">
    {seedEarns.map((earn, i) => {
      const plant = getPlant(earn.plantCode);
      if (!plant) return null;
      return (
        <SeedEarnedCard
          key={earn.plantCode}
          plant={plant}
          opensQuadrant={earn.opensQuadrant}
          isFirstEver={beforeCount < 25 && earn.plantCode === 'radish'}
          learnerId={session!.learner_id}
          index={i}
        />
      );
    })}
  </div>
)}
```

- [ ] **Step 3: Manual smoke test**

Stage a learner whose cumulative-correct is just below a threshold; complete a session that pushes them over; verify the celebration card appears at the bottom of the session-end page with the right plant.

- [ ] **Step 4: Commit**

```bash
git add app/\(child\)/complete/\[sessionId\]/SeedEarnedCard.tsx app/\(child\)/complete/\[sessionId\]/page.tsx
git commit -m "feat(grow): session-end celebration cards for newly-earned seeds

CompletePage computes cumulative correct BEFORE and AFTER the
session, calls getSessionSeedEarns to detect any thresholds
crossed, renders SeedEarnedCard for each. The first-ever earn
includes a 'open the 🌱 in your garden header any time' hint."
```

---

### Task 27: `playSeedPlant` + `playHarvest` in sfx

**Files:**
- Modify: `lib/audio/sfx.ts`
- Modify: `app/(child)/garden/grow/EmptyPlotPicker.tsx` (call playSeedPlant on success)
- Modify: `app/(child)/garden/grow/PlantInspectModal.tsx` (call playHarvest on success)

- [ ] **Step 1: Add the two sound functions to `lib/audio/sfx.ts`**

Append to the bottom of the file (after the existing `playSettle` etc.):

```ts
// Soft "earth being patted into place" — short low thump + tiny shake.
export function playSeedPlant() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  // low triangle thump (earth)
  const o1 = ctx.createOscillator();
  o1.type = 'triangle';
  o1.frequency.setValueAtTime(140, now);
  o1.frequency.exponentialRampToValueAtTime(70, now + 0.18);
  const g1 = ctx.createGain();
  g1.gain.setValueAtTime(0, now);
  g1.gain.linearRampToValueAtTime(0.18, now + 0.02);
  g1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
  o1.connect(g1).connect(ctx.destination);
  o1.start(now); o1.stop(now + 0.24);
}

// Soft chime cluster — three rising tones for "harvest gathered".
export function playHarvest() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const freqs = [523.25, 659.25, 783.99]; // C5 E5 G5 — gentle major triad
  freqs.forEach((f, i) => {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(f, now + i * 0.06);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now + i * 0.06);
    g.gain.linearRampToValueAtTime(0.16, now + i * 0.06 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.7);
    o.connect(g).connect(ctx.destination);
    o.start(now + i * 0.06); o.stop(now + i * 0.06 + 0.72);
  });
}
```

- [ ] **Step 2: Call `playSeedPlant` in EmptyPlotPicker on success**

Add `import { playSeedPlant } from '@/lib/audio/sfx';` and call `playSeedPlant()` immediately after the successful `plantSeed` result in `onPick`:
```ts
if (!result.ok) {
  setError(result.reason);
  return;
}
playSeedPlant();
onClose();
```

- [ ] **Step 3: Call `playHarvest` in PlantInspectModal on success**

Add `import { playHarvest } from '@/lib/audio/sfx';` and call after successful `harvestPlant`:
```ts
if (!r.ok) { setError(r.reason); return; }
playHarvest();
onClose();
onHarvested?.();
```

- [ ] **Step 4: Manual smoke test**

Plant a seed → low thump audible. Harvest a mature plant → soft chime cluster audible. With sound disabled in settings, both are silent.

- [ ] **Step 5: Commit**

```bash
git add lib/audio/sfx.ts app/\(child\)/garden/grow/EmptyPlotPicker.tsx app/\(child\)/garden/grow/PlantInspectModal.tsx
git commit -m "feat(grow): playSeedPlant + playHarvest synth SFX

Web Audio API synthesized — no asset files. Plant: low triangle
thump (140→70Hz, 0.22s). Harvest: soft three-tone chime cluster
(C5 E5 G5, gentle major triad). Both honor the existing sound-
effects settings via getCtx()."
```

---

## Phase 6 — Polish

### Task 28: Reduced-motion fallbacks

**Files:**
- Modify: `app/(child)/garden/grow/GrowScene.tsx`
- Modify: `app/(child)/garden/grow/HarvestCelebration.tsx`

- [ ] **Step 1: Wire `useAccessibilitySettings` in GrowScene**

Add import and read setting:
```tsx
import { useAccessibilitySettings } from '@/lib/settings/useAccessibilitySettings';
// ...
const { settings } = useAccessibilitySettings();
const reducedMotion = settings.reducedMotion;
```

For the mature-plant sparkle ring, replace the `<motion.circle>` with conditional:
```tsx
{p.plant.isMature && (reducedMotion ? (
  <circle cx={p.plot.x} cy={p.plot.y} r={36} fill="none" stroke="#FFD93D" strokeWidth={2} opacity={0.7} />
) : (
  <motion.circle
    cx={p.plot.x} cy={p.plot.y} r={36}
    fill="none" stroke="#FFD93D" strokeWidth={2}
    initial={{ opacity: 0.4, scale: 0.95 }}
    animate={{ opacity: [0.4, 0.85, 0.4], scale: [0.95, 1.08, 0.95] }}
    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
  />
))}
```

Pass `reducedMotion` to `HarvestCelebration`:
```tsx
<HarvestCelebration open={celebrating} reducedMotion={reducedMotion} />
```

- [ ] **Step 2: Make HarvestCelebration honor reducedMotion**

In `HarvestCelebration.tsx`, accept `reducedMotion` prop:
```tsx
export default function HarvestCelebration({ open, reducedMotion = false }: { open: boolean; reducedMotion?: boolean }) {
```

When `reducedMotion`, render a static fade-in/out overlay instead of 30 animated petals:
```tsx
if (reducedMotion) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-40"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-6xl">🌷</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

(Keep the existing petal-burst implementation as the `else` branch.)

- [ ] **Step 3: Commit**

```bash
git add app/\(child\)/garden/grow/GrowScene.tsx app/\(child\)/garden/grow/HarvestCelebration.tsx
git commit -m "feat(grow): reduced-motion fallbacks

Mature-plant sparkle becomes a static yellow ring; harvest petal
burst becomes a single fading flower emoji. Reads the existing
useAccessibilitySettings hook the rest of the app uses."
```

---

### Task 29: Final iPad-landscape verification + lint pass

- [ ] **Step 1: Run typecheck and full build**

```bash
npx tsc --noEmit
npx next build
```

Expected: zero errors.

- [ ] **Step 2: Run all tests**

```bash
npx vitest run
```

Expected: all green.

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

Expected: no new violations.

- [ ] **Step 4: Manual iPad-landscape walk-through**

Open on iPad landscape (or Chrome devtools → iPad Pro 12.9" landscape) and verify:
- Garden header shows 🌱 once cumulative ≥ 25
- /garden/grow renders 4 quadrants at correct positions, no clipping
- Empty-plot tap target ≥ 44pt (tap an empty plot in each quadrant)
- Picker modal fits on screen, plants are tappable
- Inspect modal fits on screen, harvest button is tappable
- Petal burst plays on harvest
- Sound effects play (with sound enabled)
- Locked quadrants render with the dim overlay + 🔒 hint and don't accept taps

- [ ] **Step 5: Push the branch**

```bash
git push origin main
```

---

## Self-Review

### Spec coverage check

| Spec section | Implementing task |
|---|---|
| §3.1 First-seed unlock at 25 cumulative | Task 26 (SeedEarnedCard with `isFirstEver` flag) |
| §3.2 🌱 header button | Task 25 |
| §3.3 Subsequent seed earns | Task 26 |
| §4.1 Cumulative correct counter | Task 2 |
| §4.2 garden_plot table | Task 1 |
| §4.3 Plant progress = cumulative - planted_at | Task 6 (loadGrowState) |
| §4.4 Earned seeds (derived) | Task 3 |
| §5 Plant catalog (10 plants) | Task 4 |
| §6 Earning schedule | Task 3 |
| §7.1 Geometry (1440×900 viewBox) | Task 19 |
| §7.2 Plot codes & positions (16 plots) | Task 5 |
| §7.3 Quadrant backgrounds | Task 17 |
| §7.4 Locked quadrant treatment | Task 19 |
| §8 Components (7 new files) | All Phase 3-5 tasks |
| §9 Plant illustrations (~45 stages) | Tasks 7-16 |
| §10.1 Tap empty plot | Task 21 |
| §10.2 Tap planted plot (inspect) | Task 22 |
| §10.3 Harvest | Tasks 22+23 |
| §10.4 Inventory tray | Task 24 |
| §10.5 Progress hint mapping | Task 4 (`progressHint`) |
| §11 Sound | Task 27 |
| §12 Welcome / first-earn moment | Task 26 |
| §13 Cumulative-correct snapshot | Task 26 |
| §14 Header entry button | Task 25 |
| §15 Phase ordering | Tasks 1-29 follow spec phases |

All sections covered.

### Type / signature consistency

- `GrowState`, `PlotWithPlant`, `PlantInPlot`, `PlantData`, `PlantStage`, `SeedEarn`, `GardenType` are defined once in their respective `lib/world/*.ts` files and consistently re-imported.
- `validatePlantRequest` returns `{ ok: true } | { ok: false; reason: string }` everywhere it's referenced.
- Garden type values match exactly across `seedEarnSchedule.ts`, `plantCatalog.ts`, `plotLayout.ts`: `'vegetable' | 'flower' | 'fruit' | 'japanese'`.
- `PlantStageIllustration` cases match the strings in `PLANT_CATALOG[*].stages[*].illustration` (`plant_<code>_<stage>` convention).

### Placeholder scan

No "TBD", "TODO", "fill in details" in any task. All steps include the actual code or commands.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-01-tiny-garden-implementation.md`.**

29 tasks across 6 phases:
- Phase 1 (data layer): Tasks 1-6 — ~0.5 day
- Phase 2 (illustrations): Tasks 7-16 — ~1.5 days
- Phase 3 (scene + plots): Tasks 17-19 — ~1 day
- Phase 4 (interactions): Tasks 20-24 — ~1 day
- Phase 5 (discovery + sound): Tasks 25-27 — ~0.5 day
- Phase 6 (polish): Tasks 28-29 — ~0.5 day

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, two-stage review (spec compliance + code quality) between tasks, fast iteration.

2. **Inline Execution** — execute tasks in this session using `superpowers:executing-plans`, batch execution with checkpoints for review.

**Which approach?**

