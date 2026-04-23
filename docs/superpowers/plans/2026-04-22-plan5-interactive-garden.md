# Plan 5 — Interactive Garden + Species Arrivals

**Goal:** Give Cecily a garden she can actually look at and build in. SVG-based scene with a 4×6 habitat grid (tap-to-place), Luna wandering, ambient plant animation, and species that arrive (with a celebratory card) when their habitat prereqs are satisfied.

**Architecture:** The garden lives at `/garden?learner=X`. All state is in the existing `habitat` and `journal_entry` tables. An SVG scene component reads `world_state.garden` (grid layout) + placed habitats; Luna and ambient creatures are framer-motion animations driven by a simple tick loop. Species arrivals are computed server-side on page load: compare unlocked species to eligible ones (all habitat_req_codes satisfied by placed habitats), and if new ones are eligible, write one `journal_entry` and return it as `arrived` for the UI to celebrate.

**Tech Stack:** Unchanged. Leverages existing framer-motion, SVG, Supabase.

**DoD:**
- `/garden?learner=X` renders the scene: grass background, placed habitats as emoji tiles, Luna animated, butterflies/bees floating ambiently
- Tap an unlocked habitat in the tray → it goes into tap-to-place mode → tap a grid cell → placed (writes to DB)
- First visit after placing a new habitat: if any species becomes newly-eligible, the page shows an arrival card: *"A monarch butterfly arrived!"* with the fun fact. Journal entry auto-written.
- Already-placed habitats cannot be placed twice
- Luna wanders the grid at a leisurely pace (one cell per ~4s)
- Day-phase is a simple time-of-day tint (dawn / day / dusk / night) — computed from `new Date().getHours()`, not stored
- Scene is iPad-responsive (full-viewport SVG, touch-action manipulation)
- Picker → Garden button added; Journal cross-links to Garden
- Unit tests for placement eligibility + arrival detection

---

## File Structure

```
lib/world/
├── gardenLayout.ts          # Grid constants + placement helpers
├── arrivals.ts              # computeNewArrivals(placedHabitats, unlockedSpecies)
└── habitatCatalog.ts        # (existing, no change)

app/(child)/
└── garden/
    ├── page.tsx             # Server page: load state, compute arrivals
    └── GardenScene.tsx      # Client SVG scene + place-mode interaction

components/child/garden/
├── GardenGrid.tsx           # SVG grid background + placed habitat tiles
├── LunaWanderer.tsx         # Animated cat that hops between cells
├── AmbientCreatures.tsx     # Background fluttering insects
├── HabitatTray.tsx          # Bottom-sheet of unlocked habitats
└── ArrivalCard.tsx          # Modal when a species arrives

app/api/
├── garden/route.ts          # GET garden state + habitat placements + unlock status
├── garden/place/route.ts    # POST place a habitat
└── garden/arrival/route.ts  # POST mark species as arrived (creates journal entry)

tests/
├── world/
│   ├── arrivals.test.ts
│   └── gardenLayout.test.ts
```

---

## Tasks (execute in order)

### Task 1: gardenLayout.ts — grid + helpers

File `lib/world/gardenLayout.ts`:
- Export `GRID_COLS = 6` and `GRID_ROWS = 4`
- Export `type GridPos = { x: number; y: number }`
- Export `isValidCell(pos: GridPos): boolean` — in bounds
- Export `cellsEqual(a: GridPos, b: GridPos): boolean`

### Task 2: arrivals.ts — pure detection function + tests

File `lib/world/arrivals.ts`:
- Export `computeEligibleSpecies(placedHabitatCodes: string[], speciesCatalog): SpeciesData[]` — filter to species whose `habitat_req_codes` are all present in `placedHabitatCodes`
- Export `computeNewArrivals(placedHabitatCodes, alreadyUnlockedCodes, speciesCatalog): SpeciesData[]` — eligible species that are NOT already unlocked

Tests:
- No habitats → no eligible species
- Ant hill placed → eligible: leafcutter_ant, carpenter_ant
- Already-unlocked species filtered out

### Task 3: API — GET /api/garden

`app/api/garden/route.ts` GET:
- Returns `{ placedHabitats: [{code, position}], unlockedSpeciesCodes: [], lunaPosition }`
- Pulls from `habitat` table (learner's placed instances) + `journal_entry` + `world_state.cat_companion`

### Task 4: API — POST /api/garden/place

`app/api/garden/place/route.ts` POST:
- Body: `{ learnerId, habitatCode, position: {x, y} }`
- Validates: habitat exists, prereqs mastered, cell not occupied, habitat not already placed
- Inserts into `habitat` table
- Returns updated placed list

### Task 5: API — POST /api/garden/arrival

`app/api/garden/arrival/route.ts` POST:
- Body: `{ learnerId, speciesCode }`
- Validates species is eligible + not already in journal
- Inserts `journal_entry`
- Returns `{ arrived: SpeciesData, journalEntryId }`

### Task 6: Page shell — `app/(child)/garden/page.tsx`

Server component:
- Read learnerId from searchParams
- Load placed habitats, unlocked species
- Compute `computeNewArrivals()` → if any, pick one, show `ArrivalCard` client-side prompting user to tap "Welcome them in!" which POSTs to /garden/arrival
- Renders `<GardenScene placedHabitats={...} lunaStart={...} />`

### Task 7: GardenScene client — SVG scene + place mode

`app/(child)/garden/GardenScene.tsx`:
- `'use client'`
- SVG viewBox 600×400, grid 6×4 cells (100px each)
- Background: gradient sky → grass
- Time-of-day tint via overlay rect opacity based on hour
- Places each habitat at grid position using emoji
- Luna + ambient children components
- Tap-to-place mode: activated by selecting habitat from tray; grid cells show dashed outlines; tap a cell → POST + refresh

### Task 8: GardenGrid component

`components/child/garden/GardenGrid.tsx`:
- Renders SVG grid lines (soft)
- Accepts `onCellTap(pos)` when in place mode
- Highlights valid cells in place mode

### Task 9: LunaWanderer component

`components/child/garden/LunaWanderer.tsx`:
- Takes current grid cells + occupied cells (can walk freely over habitats, she's a cat)
- Every 4s picks a random adjacent cell and animates there with framer-motion
- Respects `reduced-motion` class → stays still

### Task 10: AmbientCreatures

`components/child/garden/AmbientCreatures.tsx`:
- 3-5 small emoji (🦋 🐝 🐞) floating at random positions with sine-wave animation
- Respects reduced-motion

### Task 11: HabitatTray

`components/child/garden/HabitatTray.tsx`:
- Bottom sheet listing unlocked-but-not-yet-placed habitats
- Tap → activates place mode for that habitat

### Task 12: ArrivalCard

`components/child/garden/ArrivalCard.tsx`:
- Modal overlay with the species emoji, common name, fun fact, a "Welcome them!" button
- On click → POST /api/garden/arrival → dismiss + refresh

### Task 13: Cross-links

- Picker page: add `🌿 Garden` link
- Journal page: add "View garden" link if learner has placed habitats
- Complete page (session-end): after gems, add "🌿 Visit garden?" button

### Task 14: Verify + deploy

- Unit tests pass
- Build passes
- E2E still passes (may need update for new picker nav)
- Seed: no changes needed (catalogs already seeded)
- Deploy
- README update

---

Out of scope (defer): weather, seasons, animated habitat construction, plants growing over time, terrain editing (grass/water/path), Luna interaction (tapping her for a purr sound).

(Plan kept terser than Plans 1/2/4 per user request for momentum.)
