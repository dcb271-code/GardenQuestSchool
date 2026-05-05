# Tiny Garden — Reward Game Design Spec

> Status: design-approved 2026-05-01. Ready for implementation.

## 1. Overview

A persistent in-app side-game where the learner (Cecily) plants and grows seeds earned through practice. Plants grow in parallel as she answers more questions correctly across the rest of the app. The game is a quiet, intrinsic-reward layer — no scores, no streaks, no extrinsic praise — that reinforces curiosity, patience, and gardening literacy.

**Core loop:** practice anywhere → cumulative correct attempts go up → at certain thresholds new seeds are earned → seeds get planted in plots → all planted plants grow on every correct answer (parallel growth) → mature plants get harvested into the journal → empty plots accept any earned seed.

## 2. Pedagogical alignment

- **No coins, no scores, no "great job!".** Lint rule already enforces this; the spec must respect it.
- Real botanical content: each plant has accurate facts, sun/water needs, growing tips. The reward is the same kind of "small, true thing" the rest of the app offers.
- Plants **never wilt or die.** No punishment for not playing for a while. The garden waits.
- Each correct answer feeds the whole garden — a metaphor for "every bit of practice nourishes everything you've planted."

## 3. Discovery & access

### 3.1 First-seed unlock
At **25 cumulative correct attempts** (lifetime, across all sessions), the learner is awarded their first seed (Radish). The session-end page (`complete/[sessionId]/page.tsx`) renders a celebration card at the bottom of the layout:

> **🌱 You earned a seed: Radish**
> A fast little root vegetable. Plant it in your garden and it'll be ready to pick before long.
> [ plant it → ]

The button routes to `/garden/grow?learner=...`.

### 3.2 Header entry button
After the first seed is earned, a **🌱 grow** button appears in the central garden header next to the existing 📖 journal button:

```
[← back] [my garden]  [♪] [📖] [🌱]
```

Hidden until first earn so the button doesn't appear before it does anything.

### 3.3 Subsequent seed earns
At each later threshold (75, 150, 250, 375, 500, 700, 950, 1250, 1600 cumulative correct), the same celebration card appears at the bottom of the session-end page. When the threshold ALSO opens a new quadrant (Flower at 250, Fruit at 700, Japanese at 950), the card uses warmer language:

> **🌷 You earned a seed: Tulip — and your flower garden opens!**

## 4. Data model

### 4.1 Cumulative correct counter
Already derivable from the existing `attempt` table:

```sql
select count(*) from attempt
where learner_id = $1 and outcome = 'correct';
```

No new column needed. A helper `getCumulativeCorrect(learnerId)` lives in `lib/world/cumulativeProgress.ts`.

### 4.2 Garden plot table
New Supabase table `garden_plot`:

```sql
create table garden_plot (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references learner(id) on delete cascade,
  plot_code text not null,             -- 'veg-1' .. 'japanese-4'
  plant_code text not null,            -- 'radish' .. 'cherry'
  planted_at_correct integer not null, -- cumulative correct snapshot at planting
  planted_at timestamptz not null default now(),
  harvested_at timestamptz,            -- null while growing or mature-but-unharvested
  unique(learner_id, plot_code) where harvested_at is null
);

create index on garden_plot(learner_id) where harvested_at is null;
```

The partial unique index allows the same plot to host successive plants (radish → harvest → tulip in the same plot) but prevents two simultaneous plants in one plot.

### 4.3 Plant progress
Plant progress = `cumulativeCorrect - planted_at_correct`. Mature when progress ≥ `plant.growthCost`.

### 4.4 Earned seeds
Derived (not stored). `getEarnedSeedCodes(cumulativeCorrect)` returns the array of all `plantCode`s earned so far based on `SEED_EARN_SCHEDULE`. Cecily's "inventory" is just `earnedCodes - codesCurrentlyPlanted` for empty-plot picker, or `earnedCodes` for the full library after first plant.

## 5. Plant catalog

File: `lib/world/plantCatalog.ts`

```ts
export type GardenType = 'vegetable' | 'flower' | 'fruit' | 'japanese';
export type SunNeed   = 'full' | 'partial' | 'shade';
export type WaterNeed = 'low' | 'medium' | 'high';

export interface PlantStage {
  // Plant renders this stage when (currentProgress / growthCost) >= atProgress.
  // Stages are sorted ascending by atProgress; the highest threshold met wins.
  atProgress: number;            // 0.0 .. 1.0
  illustration: string;          // PlantStageIllustration code
}

export interface PlantData {
  code: string;
  commonName: string;
  scientificName: string;
  garden: GardenType;
  growthCost: number;            // correct attempts needed to fully mature
  sun: SunNeed;
  water: WaterNeed;
  facts: string[];               // 2-3 short, kid-readable facts
  growingTip: string;            // single-sentence garden tip
  stages: PlantStage[];          // visual progression
}

export const PLANT_CATALOG: PlantData[] = [
  // VEGETABLE QUADRANT
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

  // FLOWER QUADRANT
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

  // FRUIT QUADRANT
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

  // JAPANESE QUADRANT
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
  const ratio = Math.min(1, progress / plant.growthCost);
  // pick the highest stage whose atProgress is ≤ ratio
  let chosen = plant.stages[0];
  for (const s of plant.stages) {
    if (s.atProgress <= ratio) chosen = s;
  }
  return chosen;
}
```

## 6. Seed earning schedule

File: `lib/world/seedEarnSchedule.ts`

```ts
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

export function getOpenQuadrants(cumulativeCorrect: number): Set<'vegetable' | 'flower' | 'fruit' | 'japanese'> {
  // vegetable always open; others open at their schedule entry
  const open = new Set<'vegetable' | 'flower' | 'fruit' | 'japanese'>(['vegetable']);
  for (const s of SEED_EARN_SCHEDULE) {
    if (s.opensQuadrant && cumulativeCorrect >= s.atCorrect) open.add(s.opensQuadrant);
  }
  return open;
}

// Detect seeds NEWLY earned by a session (used at session-end to show
// the celebration card). Pass cumulative-correct BEFORE the session
// and AFTER, returns the array of seed earns that triggered in between.
export function getSessionSeedEarns(beforeCorrect: number, afterCorrect: number): SeedEarn[] {
  return SEED_EARN_SCHEDULE.filter(s => s.atCorrect > beforeCorrect && s.atCorrect <= afterCorrect);
}
```

## 7. Plot layout

### 7.1 Geometry
Scene viewBox 1440 × 900 (taller than the main garden to fit the inventory tray at the bottom).

```
y:0 ────────────────────────────────────────────
       VEGETABLE QUADRANT  │  FRUIT QUADRANT
       (always open)       │  (opens at 700)
       4 plots             │  4 plots
y:400 ──────────────────────┼─────────────────────
       FLOWER QUADRANT     │  JAPANESE QUADRANT
       (opens at 250)      │  (opens at 950)
       4 plots             │  4 plots
y:780 ──────────────────────────────────────────
       INVENTORY TRAY (full width)
y:900 ──────────────────────────────────────────
```

### 7.2 Plot codes & positions

```ts
export interface PlotData {
  code: string;
  garden: GardenType;
  x: number; y: number;       // center of the plot in viewBox coords
}

export const PLOTS: PlotData[] = [
  // Vegetable (top-left): 2x2 grid
  { code: 'veg-1',      garden: 'vegetable', x: 220,  y: 140 },
  { code: 'veg-2',      garden: 'vegetable', x: 480,  y: 140 },
  { code: 'veg-3',      garden: 'vegetable', x: 220,  y: 320 },
  { code: 'veg-4',      garden: 'vegetable', x: 480,  y: 320 },
  // Fruit (top-right): 2x2 grid (trees are bigger; same plot count)
  { code: 'fruit-1',    garden: 'fruit',     x: 940,  y: 140 },
  { code: 'fruit-2',    garden: 'fruit',     x: 1200, y: 140 },
  { code: 'fruit-3',    garden: 'fruit',     x: 940,  y: 320 },
  { code: 'fruit-4',    garden: 'fruit',     x: 1200, y: 320 },
  // Flower (bottom-left): 2x2 grid
  { code: 'flower-1',   garden: 'flower',    x: 220,  y: 500 },
  { code: 'flower-2',   garden: 'flower',    x: 480,  y: 500 },
  { code: 'flower-3',   garden: 'flower',    x: 220,  y: 680 },
  { code: 'flower-4',   garden: 'flower',    x: 480,  y: 680 },
  // Japanese (bottom-right): 2x2 grid
  { code: 'japanese-1', garden: 'japanese',  x: 940,  y: 500 },
  { code: 'japanese-2', garden: 'japanese',  x: 1200, y: 500 },
  { code: 'japanese-3', garden: 'japanese',  x: 940,  y: 680 },
  { code: 'japanese-4', garden: 'japanese',  x: 1200, y: 680 },
];
```

### 7.3 Quadrant backgrounds
- **Vegetable**: brown furrowed earth, stake markers on each plot, occasional pebble. Cool tones (deep brown, terracotta).
- **Flower**: green flower bed with small stone edging, scattered moss. Warmer tones.
- **Fruit grove**: dappled grass with tree-shaped clearings (slightly darker green where each tree grows). Wider plot spacing visually.
- **Japanese**: raked white-grey sand with a low border of bamboo, a small koi pond in the corner, a single stone lantern. Plots have small zen circles around them.

A simple title pill at the top-left of each quadrant (e.g., italic "vegetable patch" same style as the central garden zone labels).

### 7.4 Locked quadrant treatment
Locked quadrants are still visible but rendered at 0.4 opacity with a soft "🔒" badge in the corner and an italic hint:

> "🔒 opens when you earn your first flower seed"

So Cecily can see what's coming.

## 8. Components

```
app/(child)/garden/grow/
  page.tsx                    server component, loads everything
  GrowScene.tsx               client component, renders the scene + handles taps
  SeedInventoryTray.tsx       bottom-strip inventory of unplanted seeds
  PlantInspectModal.tsx       pops on tap of a planted plot
  EmptyPlotPicker.tsx         pops on tap of an empty plot, lists earned seeds
  HarvestCelebration.tsx      petal burst + journal-card flash on harvest
  layout.tsx                  reuses BranchSceneLayout pattern

lib/world/
  plantCatalog.ts             PLANT_CATALOG, getPlant, plantStageFor
  seedEarnSchedule.ts         SEED_EARN_SCHEDULE + helpers
  cumulativeProgress.ts       getCumulativeCorrect(learnerId)
  growGarden.ts               ALL the grow-state logic in one place

components/child/garden/
  PlantStageIllustration.tsx  switch-based renderer for plant_<code>_<stage>
```

`growGarden.ts` exports a single function `loadGrowState(learnerId, db)` that returns:

```ts
interface GrowState {
  cumulativeCorrect: number;
  earnedSeeds: PlantData[];
  openQuadrants: Set<GardenType>;
  plots: Array<{
    plot: PlotData;
    plant?: { data: PlantData; progress: number; isMature: boolean; plantedAt: Date };
  }>;
}
```

## 9. Plant illustrations

File: `components/child/garden/PlantStageIllustration.tsx`

A switch-based renderer keyed on `plant_<code>_<stage>`. Each stage is a small (~40-80px wide) top-down view of the plant at that growth stage. Same hand-illustrated style as the existing `illustrations.tsx` library.

**Stage count per plant:** 4-5 stages (seed, sprout, young, near-mature, mature). Total ~45 stage illustrations for the v1 catalog of 10 plants.

Visual scaling:
- Seed: tiny dot (~5px) — barely visible
- Sprout: 10-15px — first green
- Young: 20-30px — recognizable shape
- Near-mature: 35-50px — most of full size, no flower/fruit yet
- Mature: 50-80px — full size with flower/fruit feature

Mature plants get a subtle sparkle overlay (animated `<motion.circle>` opacity pulse) so the kid notices they're ready.

## 10. Interactions

### 10.1 Tap empty plot
1. Tap → `EmptyPlotPicker` modal opens
2. Modal shows a grid of seed cards from `earnedSeeds` filtered by `seed.garden === plot.garden` (only seeds compatible with this quadrant)
3. If no compatible seeds: card shows "no seeds yet for this kind of garden — keep practicing"
4. Tap a seed → modal closes, plot gets a new `garden_plot` row, `playSeedPlant()` fires, sprout-stage illustration appears

### 10.2 Tap planted plot
1. Tap → `PlantInspectModal` opens
2. Shows: large illustration of current stage, plant name, italic scientific name, current progress hint ("just sprouting" / "halfway there" / "almost ready" / "ready to pick"), one rotating fact (deterministic from session id), sun/water icons, growing tip
3. If mature: button at bottom: "🧺 harvest" (or "🌷 pick" for flowers, "🍎 pick" for fruit)
4. Otherwise: "ok" button to close

### 10.3 Harvest
1. Tap harvest → `HarvestCelebration` overlays a gentle petal burst (motion library, 1.5s)
2. `garden_plot.harvested_at = now()`
3. Journal entry created (new "garden harvest" subcategory in the journal)
4. `playHarvest()` fires
5. Plot becomes empty again, ready for re-planting

### 10.4 Inventory tray (bottom of grow page)
- Shows up to 8 seed cards (60px each) in a horizontal scroll
- Each card: small seed illustration + name + "(needs flower bed)" hint if quadrant locked
- Purely informational — planting still happens via tap-empty-plot. The tray exists so the kid can SEE what she has.
- If there are unplanted earned seeds, a soft pulse on the tray draws attention.

### 10.5 Progress hint mapping
```
0%       "just planted"
0-25%    "just sprouting"
25-50%   "growing roots"
50-75%   "halfway there"
75-99%   "almost ready"
100%+    "ready to pick"
```

## 11. Sound

File: `lib/audio/sfx.ts` (extend existing module).

Add two new sound effects:
- `playSeedPlant()` — soft earth-crunch / spade in soil. ~0.4s.
- `playHarvest()` — light wind-chime / petal flutter. ~0.6s.

Both honor the existing audio settings (`useAccessibilitySettings` mute toggle, soundtrack volume).

Source recommendation: hand-recorded or royalty-free from Freesound (CC0). Two short WAV/MP3 files added to `public/audio/` and decoded once at first play.

## 12. Welcome / first-earn moment

When `getSessionSeedEarns(before, after)` returns earns at session-end:

```tsx
// Inside CompletePage, after the existing gem moments:
{seedEarns.map(earn => (
  <SeedEarnedCard
    key={earn.plantCode}
    plant={getPlant(earn.plantCode)!}
    isFirstEver={cumulativeCorrectBefore < 25 && earn.plantCode === 'radish'}
    opensQuadrant={earn.opensQuadrant}
    learnerId={learnerId}
  />
))}
```

`SeedEarnedCard` renders:
- Hand-drawn illustration of the seed (the seed-stage version of the plant)
- Title: "🌱 You earned a seed: {commonName}"
- One sentence about the plant
- "🌿 plant it →" button → `/garden/grow?learner=...`

The first-ever earn includes an extra line: "Open the 🌱 in your garden header any time."

## 13. Cumulative-correct snapshot

Two values needed at session-end:
- `cumulativeCorrectBefore` = sum of correct attempts before this session started
- `cumulativeCorrectAfter` = sum of correct attempts after this session ends

Computed in `complete/[sessionId]/page.tsx`:

```ts
const sessionStart = session.started_at;
const { count: beforeCount } = await db
  .from('attempt')
  .select('*', { count: 'exact', head: true })
  .eq('learner_id', session.learner_id)
  .eq('outcome', 'correct')
  .lt('created_at', sessionStart);
const { count: afterCount } = await db
  .from('attempt')
  .select('*', { count: 'exact', head: true })
  .eq('learner_id', session.learner_id)
  .eq('outcome', 'correct');
const seedEarns = getSessionSeedEarns(beforeCount ?? 0, afterCount ?? 0);
```

## 14. Header entry button

In `GardenScene.tsx`, the header already has 📖 journal:

```tsx
<Link href={`/journal?learner=${learnerId}`} ...>📖</Link>
```

Add a sibling, conditionally rendered when `cumulativeCorrect >= 25`:

```tsx
{cumulativeCorrect >= 25 && (
  <Link href={`/garden/grow?learner=${learnerId}`}
    aria-label="grow garden"
    className="text-lg p-1.5 rounded-full bg-white border border-ochre"
  >🌱</Link>
)}
```

`GardenPage` (the server component) needs to compute `cumulativeCorrect` once and pass it down.

## 15. Implementation phases

### Phase 1 — Data layer (~0.5 day)
- Migration for `garden_plot` table
- `lib/world/cumulativeProgress.ts`
- `lib/world/plantCatalog.ts` (10 plants, content authoring)
- `lib/world/seedEarnSchedule.ts`
- `lib/world/growGarden.ts` with `loadGrowState`
- Unit-test `getEarnedSeedCodes`, `getSessionSeedEarns`, `plantStageFor`, `getOpenQuadrants`

### Phase 2 — Plant illustrations (~1.5 days)
- `PlantStageIllustration.tsx` switch-based renderer
- ~45 stage SVG illustrations, top-down view, ~40-80px wide
- Hand-drawn style matching existing `illustrations.tsx`
- Per plant, 4-5 stages. Group similar (radish/lettuce sprout share base shape) for efficiency.

### Phase 3 — Scene + plots (~1 day)
- `app/(child)/garden/grow/page.tsx` server component
- `GrowScene.tsx` client component
- 4-quadrant SVG with backgrounds (vegetable furrows, flower bed, grove, raked sand)
- Plot rendering (empty + planted)
- Locked quadrant treatment

### Phase 4 — Interactions (~1 day)
- `EmptyPlotPicker` modal
- `PlantInspectModal`
- `HarvestCelebration` (petal burst + journal write)
- `SeedInventoryTray` at the bottom

### Phase 5 — Discovery + sound (~0.5 day)
- 🌱 button in garden header (conditional render)
- `SeedEarnedCard` in session-end page
- Compute before/after cumulative correct in CompletePage
- Add `playSeedPlant`, `playHarvest` sound effects + audio assets

### Phase 6 — Polish (~0.5 day)
- Mature-plant sparkle overlay (subtle pulse)
- Progress hint copy review
- Reduced-motion fallbacks for sparkle/petal-burst
- Verify on iPad landscape

**Total: ~5 days for v1 with 10 plants and 4 quadrants.**

## 16. MVP scope (if shipping faster)

**Drop:** Fruit + Japanese quadrants. Apple, bamboo, bonsai, cherry plants. Sound effects.

**Keep:** Vegetable + flower quadrants. 6 plants (radish, mint, lettuce, tulip, daisy, sunflower). Seed earn schedule capped at 500 cumulative.

**Estimate:** ~2.5 days for MVP.

## 17. Future extensions (out of scope for v1)

- Seasons (winter dormancy, spring planting windows)
- Wildlife visitors attracted by mature plants (bees on sunflowers, hummingbirds on daisies)
- Plant trades between learners (multiplayer)
- Parent-zone authoring tool for adding new plants
- Save-the-seeds: harvest yields seeds back to inventory for next planting
- Plot upgrades (raised beds, trellises, greenhouses)
- A sketchbook mode where the kid can draw her plant in the journal

## 18. Open follow-ups (defer answers; have the implementer flag during build)

- Audio assets — use Freesound CC0 or hand-record? (lean Freesound for v1)
- Whether `garden_plot.harvested_at` rows should be cleaned up after N days, or kept forever as "garden history"
- Should the 🌱 header button also appear in branch (math-mountain / reading-forest) headers?
- Whether the inventory tray should show plants she's earned but lock-tagged for unopened quadrants, or hide them entirely
