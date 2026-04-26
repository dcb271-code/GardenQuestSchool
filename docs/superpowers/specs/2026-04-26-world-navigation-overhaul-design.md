# World Navigation Overhaul — Design Spec

**Date:** 2026-04-26
**Status:** Brainstormed; awaiting user review before implementation plan
**Authors:** Dylan + Claude (brainstorming session)
**Related:** `2026-04-22-gardenquestschool-design.md` (original Section 10 World State), `2026-04-25-grade3-expansion-plan.md` (the curriculum that motivated this overhaul)

---

## 1 · Problem

The product has quietly grown a **K–G3 curriculum of ~67 skills** (45 math + 22 reading) with substantial new content (time, money, fractions, multiplication facts, division, 3-digit math, rounding, elapsed time, paragraph comprehension, etc.). The single `/garden` SVG scene only surfaces ~10 of those, and `/explore` only shows 3 picker-recommended candidates at a time.

Result: **most of the curriculum is undiscoverable from the UI**, and the central garden is already visually crowded. There is no way for a learner to navigate intentionally ("I want to do clock reading"), and no place to put future subjects (science, music, art) when their content arrives.

This spec proposes a **hub-and-spoke world navigation overhaul** — Stardew-style branch scenes off the central garden, plus an in-world "graduating-world" unlock model and habitat interiors for depth.

---

## 2 · Design constraints (non-negotiables)

The following constraints come from prior product decisions and apply to every part of this design. They are not up for debate inside this spec — they are inputs.

1. **Aesthetic continuity.** All new SVG art must reuse + extend the existing illustration vocabulary in `components/child/garden/illustrations.tsx` (`Tree`, `PineTree`, `Flower`, `GrassTuft`, `CozyHouse`), the layered hand-painted hill silhouettes, the brook with shimmer ripples, the stepping-stone organic path system, the time-of-day tint, the 2–2.5px dark bark outlines, and the naturalist palette (`#F5EBDC` cream, ochre, terracotta, rose, sage, forest, bark, sun). The new scenes must look like *the same world* — fun, whimsical, Miyazaki-coded Stardew Valley — not a different visual style.
2. **Pedagogical purity.** Existing lint rule (`tests/child-language.test.ts`) forbids gamification language: no coins as currency, no scores, no streaks, no "good job," "great job," "level up," etc. Any new copy in this spec must conform.
3. **Existing design-system rules.** 60pt minimum hit targets. iPad-first. Landscape-friendly (the `100dvh` + flex pattern in the current `GardenScene.tsx` must be preserved). Respect `prefers-reduced-motion` via the existing `useAccessibilitySettings` hook.
4. **Adaptive engine intact.** All new entry points still call `POST /api/session/start` with a skill code. The picker, item Elo, virtue gem detection, narrator moments — none of that changes.
5. **No regressions on existing flows.** Sisters walking to a structure before session start, Luna wandering, ambient layer, time-of-day tint, garden soundtrack toggle, ecology quest modal, arrival celebration with `pendingArrivalSpeciesCode` — all stay.

---

## 3 · Mental model: three kinds of place

| Kind | Examples | Role | Camera / scene |
|------|----------|------|----------------|
| **Central garden** | `/garden` | Home/hub. Foundational starter skills + characters + habitats + ambience. Always feels like "home." | Single 14:8 SVG, existing layout |
| **Branch scenes** | `/garden/math-mountain`, `/garden/reading-forest` | Subject homebases. Hold the rest of the subject's curriculum, organized by strand-cluster. Quieter — places to study. | Each is a routed sub-page, same 14:8 aspect |
| **Habitat interiors** | `/garden/habitat/bunny_burrow` | Atmospheric, themed to the resident species. One themed skill structure + species discovery. Earned through species invitation. | Each is a routed sub-page, same 14:8 aspect, intimate palette |

The central garden is the only scene with Luna, sisters, ambient creatures, time-of-day tint, soundtrack toggle, and quick-start characters. Branches and interiors feel intentional and quieter.

---

## 4 · Central garden — additive-only changes

**Constraint:** the existing layout, paths, cottage position, brook, mountain silhouettes in the sky, all 17 skill structures, all 6 habitats, the stepping-stone path system, the radial zone gradients — **all stay exactly where they are.** Removals are zero by default. The user has hand-tuned this scene; reworking it is forbidden by this spec.

### 4.1 New things to add

1. **Two path-edge extensions** (drawn in the existing `EAD2A8` warm-tan path color, with the same `A99878` shadow underlay) that visually leave the scene:
   - **Right-edge extension toward Math Mountain**: extends the existing main path past `x=1280, y=170` off the right edge. The path appears to head *toward* the existing Fuji peak silhouettes painted in the sky. Add `~3` stepping stones on the extension.
   - **Left-edge extension toward Reading Forest**: a small forest branch off the existing main path near `x=360, y=160`, exiting the left edge. Threads between trees.

2. **Two locked-gate icons** at the path endpoints. Initial state: leafy ivy archway (`🌿` for the schematic; in implementation, a small SVG arch covered in vines). Locked state shows a small dark-banner label with a 🔒 prefix and the destination name.

3. **Three character spots:**
   - **Nana Mira** — placed *on the cottage porch* at approximately `(180, 545)` (just to the right of `CozyHouse` at `(100, 500)`). Reading recommender.
   - **Hodge the Beaver** — placed *on the brook bank* at approximately `(95, 280)` (sitting on a stone in the upper-left brook). Math recommender.
   - **Wanderer's Signpost** — placed *at the path-meadow junction* at approximately `(680, 510)` (where the bunny path branches off the main path). General quick-start, 3–4 carved arms.

### 4.2 Removals

- The `🧭 compass` icon in the header is **removed** (no more `/explore`, see §10).
- All other header elements (back-button, title, music toggle, journal link) stay.

### 4.3 Files modified

- `app/(child)/garden/GardenScene.tsx` — add path extensions, gate icons, character spots; remove compass icon
- `lib/world/gardenMap.ts` — add three new `MapStructure` entries (kind: `'character'` for the three characters; kind: `'gate'` for the two gates); existing entries unchanged

### 4.4 Files created

- `components/child/garden/CharacterSpot.tsx` — renders one character with sleep/awake state, idle bob animation, tap handler
- `components/child/garden/LockedGate.tsx` — renders ivy archway with locked/unlocked state and unlock animation

---

## 5 · Graduating-world unlock model

### 5.1 Unlock criterion

A branch (Math Mountain or Reading Forest) is unlocked for a learner when **3 or more of its foundational starter structures on the central garden have reached their `correctCount` zone-completion target** (the existing target used by `computeStructureProgress` in `lib/world/zoneProgress.ts`).

| Branch | Foundational starter structures (on central garden) | Threshold |
|--------|------------------------------------------------------|-----------|
| Math Mountain | Counting Path, Bee Swarms, Petal Falls, Part & Whole, Garden Stories | 3 of 5 |
| Reading Forest | Word Stump, Blending Brook, Story Log | 2 of 3 |

(Threshold for Reading Forest is 2 of 3, not 3 of 3, so the gate isn't impossible to reach with only 3 starters. Same spirit as the math 3-of-5.)

The starter set lives in a new const `BRANCH_GATING` in `lib/world/gardenMap.ts`:

```ts
export const BRANCH_GATING: Record<BranchCode, GatingRule> = {
  math_mountain: {
    starterStructureCodes: [
      'math_counting_path', 'math_bee_swarm', 'math_petal_falls',
      'math_number_bonds', 'math_word_stories',
    ],
    threshold: 3,
  },
  reading_forest: {
    starterStructureCodes: [
      'reading_book_stump', 'reading_blending_beach', 'reading_readaloud_log',
    ],
    threshold: 2,
  },
};
```

### 5.2 How the threshold is evaluated

A pure function `branchUnlockState(branchCode, correctByCode)` in a new file `lib/world/branchGating.ts`:

```ts
export function branchUnlockState(
  branchCode: BranchCode,
  correctByCode: Map<string, number>,
  structureProgress: Record<string, StructureProgress>,
): { unlocked: boolean; completedCount: number; threshold: number; }
```

Returns whether the branch is unlocked and how many starters are completed. The garden page calls this at server-render time using the same `correctByCode` it already computes from `attempt` rows.

### 5.3 Unlock animation (the graduation moment)

When `branchUnlockState().unlocked` becomes true *between sessions* (i.e., on the next page load after the threshold was crossed), the garden page passes a `justUnlocked: BranchCode | null` prop to `GardenScene`. The corresponding `LockedGate` component runs a **one-time unlock animation** on mount:

1. The 🌿 ivy slides aside (CSS transform 0.8s)
2. The gate icon swaps to 🚪 (or an open wooden archway)
3. The dashed path becomes solid
4. A soft sparkle plays (`playSparkle()` from existing `lib/audio/sfx.ts`)
5. A short narrator beat plays (existing `useNarrator` hook): *"the path opens"* — Hodge or Nana speaks for math/reading respectively

`justUnlocked` detection: write a tiny field `gardenState.unlocked_branches` (a string array) to `world_state.garden` via a server-side update at the end of each session. On the next garden page load, compare current `branchUnlockState` to stored unlocked branches; if a new one appears, set `justUnlocked` for that branch and update the stored array.

### 5.4 Older-learner behavior

For G2 and G3 learners, `masteredSkillsForGrade()` already pre-marks the foundational K–G1 skills as mastered when the learner is created. The `correctCount` for those skills is 0 (since no attempts), but mastery is true. We update the criterion to: **completed = mastery_state === 'mastered' OR correctCount ≥ target.** This way G2/G3 learners enter with the criterion already met → gate is open from session 1.

This logic change goes in `branchUnlockState` and uses the existing `mastered` Set the garden page already computes.

### 5.5 Locked gate interaction

Tapping a locked gate doesn't navigate — it shows a small in-world message: *"the way opens when you've finished a few activities here."* Implementation: a small toast or speech-bubble overlay anchored to the gate icon, dismissed on next tap or after 3 seconds.

### 5.6 Tests for §5

- `branchGating.test.ts`:
  - 3 starters at correctCount target → unlocked
  - 2 starters at correctCount target → locked
  - Mixed: 2 mastered + 1 at-target → unlocked (3 total)
  - All starters mastered (G2 fresh learner) → unlocked
  - Empty input → locked

---

## 6 · Math Mountain (branch scene)

### 6.1 Visual aesthetic

Hand-illustrated 14:8 SVG matching the central garden's vocabulary. Background composition:

- **Sky band** at top (~25% height) with a higher, sharper Fuji-style peak silhouette than the central garden's distant peaks. This is the visible-from-the-central-garden mountain made central. Snow cap. Maybe a circling bird.
- **Plateau / mid-slope** band (middle 40%) with rolling sage hills, a winding stone path, and the two "high" clusters (Place-Value Heights, Division Glen)
- **Foothills + meadow** band (bottom 35%) with the four "low" clusters (Operations Hollow, Multiplication Orchard, Measurement Meadow, Word Problem corner)

Use the same `meadowBase` + `grassTexture` patterns from the central garden for the foreground, the same hill-layer technique (3 hills with decreasing opacity) for the slopes, the same stepping-stone style for the paths.

### 6.2 Strand clusters and their structures

Each cluster has a dashed-frame label visible on idle/hover. Structure codes/positions defined in a new file `lib/world/branchMaps.ts`:

| Cluster | Skill codes (themes) | Approx region |
|---------|----------------------|---------------|
| **Operations Hollow** | `add.within_20.crossing_ten` (Butterfly Clusters), `add.fluency_within_20` (Fast Facts), `add.within_100.no_regrouping` (Hundred's Hollow), `add.within_100.with_regrouping` (Regrouping Ridge), `add.within_1000` (Big Bridge), `subtract.within_20.no_crossing` (Leaf Drops), `subtract.within_20.crossing_ten` (Berry Basket), `subtract.within_100.no_regrouping` (Quiet Pond), `subtract.within_100.with_regrouping` (Rushing Stream), `subtract.within_1000` (Big Falls), `number_bond.within_20` (Twin Blossoms) | Left foreground (x: 100–500, y: 380–700) |
| **Place-Value Heights** | `placevalue.tens_ones` (Tens Tower), `placevalue.hundreds_tens_ones` (3-Digit Tower), `placevalue.compare_2digit` (Compare Trees), `placevalue.compare_3digit` (Mountain Compare), `placevalue.add_subtract_10` (±10 Leaves), `placevalue.round_nearest_10` (Round 10), `placevalue.round_nearest_100` (Round 100) | Center mid-mountain (x: 500–950, y: 200–450) |
| **Multiplication Orchard** | `multiply.equal_groups` (Equal Garden), `multiply.arrays` (Array Orchard), `multiply.skip_count_bridge` (Skip Bridge), `multiply.facts_to_5` (Times 0–5), `multiply.facts_to_10` (Times 0–10) | Right foreground (x: 950–1400, y: 480–700) |
| **Division Glen** | `divide.equal_share` (Sharing Squirrels), `divide.facts_to_10` (Division Facts), `divide.unknown_factor` (Missing Number) | Right mid-mountain (x: 1000–1400, y: 200–400) |
| **Measurement Meadow** | `even_odd.recognize`, `time.read_hour_half`, `time.read_to_5_min`, `time.elapsed_intervals`, `money.coin_count`, `fractions.identify`, `fractions.compare_visual` | Across center-bottom (x: 350–1000, y: 660–780) |
| **Word Stories Cottage** | `word_problem.add_within_20`, `word_problem.subtract_within_20`, `word_problem.two_step` | Bottom-left tucked (x: 50–280, y: 700–780) |

**Note: existing central-garden structures stay on the central garden.** They are NOT duplicated on Math Mountain. The structures listed above for Math Mountain are the ones that are NOT currently on the central garden's `GARDEN_STRUCTURES`. (Two arguably grade-2-ish structures currently on central — `math_butterfly_arrays` for crossing-ten add, and `math_array_orchard` for arrays — are duplicated above for reference but the implementer should choose one home; see §15 open question.)

### 6.3 Per-structure unlock state

Within Math Mountain, each individual structure has its own unlock state derived from skill prereqs (existing logic in `prereqFallback`). Locked structures stay **visible-but-ghosted**: opacity 0.35, grayscale, with a small text label showing the most-immediate unmet prereq. Tapping a locked structure shows the prereq name in a small message.

### 6.4 Header

A `BranchHeader` component:
- Left: `← garden` back button (Link to `/garden?learner=...`)
- Center: scene name "Math Mountain"
- Right: small scene-icon (⛰️)

No music toggle, no journal link in branch headers — those live only on the central garden. The back button preserves `?learner=` to keep the active learner.

### 6.5 What does NOT live in Math Mountain

- Luna does not wander here.
- Sisters do not walk here.
- Quick-start characters (Nana, Hodge, Signpost) do not appear here.
- No habitats here.
- No ambient creatures (birds, bugs).
- Time-of-day tint **does** apply (single global atmosphere across all scenes).
- Garden soundtrack continues if it was already playing.

### 6.6 Files created

- `app/(child)/garden/math-mountain/page.tsx` — server component that fetches the same skill_progress + attempt data as `/garden` does today, computes structure states for each Math Mountain structure, passes to `MathMountainScene`
- `app/(child)/garden/math-mountain/MathMountainScene.tsx` — client component, renders the 14:8 SVG with all structures
- `lib/world/branchMaps.ts` — exports `MATH_MOUNTAIN_STRUCTURES: BranchMapStructure[]` and `READING_FOREST_STRUCTURES: BranchMapStructure[]`, similar shape to existing `GARDEN_STRUCTURES`
- `components/child/garden/BranchHeader.tsx` — shared header for branch scenes
- `components/child/garden/BranchSceneLayout.tsx` — shared 14:8 SVG container that handles time-of-day tint, header, structure rendering

---

## 7 · Reading Forest (branch scene)

Same conventions as Math Mountain. Specifics:

### 7.1 Visual aesthetic

Forest aesthetic: layered tree silhouettes (use existing `Tree` and `PineTree` components dense across the back band), filtered-light dapples, a stream cutting through (reuse the brook style from the central garden), an old oak in the NE morphology grove (large `Tree` instance with extra trunk thickness).

### 7.2 Strand clearings

| Clearing | Skill codes (themes) | Approx region |
|----------|----------------------|---------------|
| **Sight Word Glade** | `sight_words.dolch_first_grade` (Bee Words — currently on central, may move), `sight_words.dolch_second_grade`, `sight_words.dolch_third_grade` | NW (x: 80–340, y: 280–500) |
| **Phonics Path** | `phonics.digraphs` (currently on central, may move), `phonics.initial_blends`, `phonics.silent_e`, `phonics.vowel_teams_ee_ea`, `phonics.vowel_teams_ai_ay`, `phonics.vowel_teams_oa_ow`, `phonics.r_controlled`, `phonics.diphthongs` | Winding through center (x: 400–1200, y: 100–400) |
| **Morphology Grove** | `morphology.inflectional_ed_ing`, `morphology.plural_s_es`, `morphology.compound_words`, `morphology.prefix_un_re` | NE around the old oak (x: 1100–1400, y: 280–500) |
| **Story Rocks** | `read_aloud.longer_words`, `comprehension.short_sentence`, `comprehension.paragraph` | Center back clearing (x: 550–950, y: 580–760) |

(See §15 for the question about whether `digraphs` and `dolch_first_grade` actually move from central to Reading Forest, or stay duplicated as central-garden starters.)

### 7.3 Files created

- `app/(child)/garden/reading-forest/page.tsx` — server component, mirrors math-mountain
- `app/(child)/garden/reading-forest/ReadingForestScene.tsx` — client component
- `READING_FOREST_STRUCTURES` const in `lib/world/branchMaps.ts`

---

## 8 · Habitat interiors — pattern + first instance

### 8.1 The lifecycle of a habitat

| Stage | State | UI behavior |
|-------|-------|-------------|
| 1 | Prereqs not met | Habitat ghosted on central garden. Tap = small message about the unmet prereq. (Existing.) |
| 2 | Prereqs met, not yet built | Habitat shows as a "ghost" outline on central garden. Tap = `HabitatQuestModal` (ecology quest). Complete to build. (Existing.) |
| 3 | Built, no species yet | Habitat shows full illustration. Tap = `SpeciesInfoModal` showing "no residents yet — practice and a creature may visit." (Existing.) |
| 4 | Built, ≥1 species arrived, **interior unlocked** | Habitat illustration is decorated (small bunnies hopping nearby, etc.). Tap = `SpeciesInfoModal` with **new "step inside →" button** that navigates to the interior. (NEW.) |

The transition from stage 3 to stage 4 happens at the moment of the **first species arrival** for that habitat. The arrival celebration UI is augmented:

### 8.2 Arrival invitation (new beat)

Currently, when a session ends and a `pendingArrivalSpeciesCode` is set on `world_state.garden`, the `ArrivalCard` modal opens on the next `/garden` load and shows the welcoming species. We add:

- If the arriving species is the **first species ever** for its habitat (check `journal_entry` count for species belonging to that habitat = 1), the `ArrivalCard` shows an additional invitation line: *"the cottontail says — come visit me inside the bunny burrow!"*
- A new button in the `ArrivalCard`: **"step inside →"** that navigates directly to the habitat interior, dismissing the arrival.
- The existing dismiss button is preserved as the alternative.

The "first species" check goes in the API route that prepares `pendingArrival` data, or in a derived prop on the garden page.

### 8.3 Bunny Burrow interior — concrete implementation

The first push builds **only the Bunny Burrow interior**. Other 5 habitats (frog pond, bee hotel, butterfly bush, ant hill, log pile) keep their stage-3 behavior even after first species arrival; their interiors come in Phase 2.

#### Visual aesthetic

A 14:8 SVG with an **earthy cozy underground** palette — radial gradient from warm cream center fading to deep `#5a3820` brown at edges. SVG composition:

- Tunnel arch silhouette at top (dark brown curve)
- Hanging roots (thin lines drooping from arch)
- A single hanging lantern (warm `#FFD93D` glow circle)
- Soft floor curve (cozy nest hollow ellipses in `#7a5034`)
- Floor decorations: scattered straw (🍂), mushrooms (🍄), ferns (🌿), grass tufts (existing `GrassTuft` component)
- Center-back: the themed skill structure (the glowing one)
- Foreground: animated species (each one a positioned, idle-animated `SpeciesIllustration`)

#### Themed skill structure

Code: a re-skinned subtract-within-10 called **"Petal Counting"** with a bunny-themed renderer variant. For first push, it routes to the existing `subtract_within_10` skill code — no new skill needed, just a themed structure pin in the interior.

#### Resident species

Discovered species: rendered full-color, idle-animated (small hop bob, every 3–4s). Look up via `journal_entry` rows for species whose `habitat_code === 'bunny_burrow'`.

Undiscovered slots: render a fixed number of ghost slots (`SPECIES_CATALOG.filter(s => s.habitatCode === 'bunny_burrow').length` minus discovered count). Show as gray silhouette of the species emoji with `? ? ?` label. Hovering doesn't reveal — discoverability is part of the world's mystery.

#### Header

Same `BranchHeader` shape — left back-button to `/garden?learner=...`, center "Bunny Burrow", right `🐰` icon.

### 8.4 Files created

- `app/(child)/garden/habitat/[code]/page.tsx` — generic dynamic route, dispatches on `code` to a habitat-interior component (only `bunny_burrow` mapped initially)
- `app/(child)/garden/habitat/[code]/BunnyBurrowInterior.tsx` — client component for the bunny burrow scene
- `components/child/garden/HabitatInteriorLayout.tsx` — shared layout (header, time-of-day tint integration)
- `lib/world/habitatInteriors.ts` — config map: `{ bunny_burrow: { themedSkillCode: 'math.subtract.within_10', themeLabel: 'Petal Counting' }, ... }`

### 8.5 Files modified

- `components/child/SpeciesDetailModal.tsx` — accept new `interiorEnabled: boolean` prop; if true, render "step inside →" button at bottom that navigates to `/garden/habitat/${code}?learner=...`
- `components/child/garden/ArrivalCard.tsx` — accept new `isFirstForHabitat: boolean` prop; if true, render the invitation line + the "step inside →" CTA
- `app/(child)/garden/page.tsx` — compute `interiorEnabled` per habitat (true if `journal_entry` count for species-in-this-habitat ≥ 1), pass through to `GardenScene` → `SpeciesDetailModal`
- The arrival API or session-end handler — compute `isFirstForHabitat` for the `pendingArrival` species

---

## 9 · Quick-start characters — Nana, Hodge, Signpost

### 9.1 Daily rotation logic

Exactly **one** of the three characters is the day's "alert" character. The other two are dimmed (eyes closed, slight rocking idle, opacity 0.65).

Selection is deterministic per learner per day: a hash of `learnerId + YYYY-MM-DD` mod 3 picks one of `['nana', 'hodge', 'signpost']`. Pure function, no DB write. Computed at server-render time on `/garden`, passed as a prop.

```ts
// lib/world/characterRotation.ts
export type CharacterCode = 'nana' | 'hodge' | 'signpost';
export function todaysAlertCharacter(learnerId: string, today = new Date()): CharacterCode {
  const dateKey = today.toISOString().slice(0, 10); // YYYY-MM-DD
  const hash = simpleHash(learnerId + dateKey);
  return (['nana', 'hodge', 'signpost'] as const)[hash % 3];
}
```

### 9.2 What each character recommends when alert

- **Nana Mira (reading)**: top reading-skill candidate from the engine for this learner. Re-use the existing `/api/plan/candidates` endpoint, filter to reading skills, take the first.
- **Hodge the Beaver (math)**: top math-skill candidate from the engine. Same source, filter to math skills.
- **Wanderer's Signpost (general)**: top 3–4 candidates across all subjects. Renders as a signpost with multiple carved arms, each labeled with the candidate's structure name + emoji.

The recommendations are computed server-side on the garden page and passed down. Tapping a character launches that recommendation as a session (via `/api/session/start`).

### 9.3 What each character does when sleeping

- Visual: dimmed, eyes closed (a small `z` puff might float above for the cat-style sleep), slight rocking idle motion (CSS keyframe, 0 if reduced-motion).
- Tappable: yes — but tapping shows a small message: *"shh, Nana is resting. ask the Signpost if you want a quick start."* (The non-alert characters point toward the day's alert character.)

### 9.4 Files created

- `lib/world/characterRotation.ts` — pure function for daily rotation
- `lib/world/characterRecommendation.ts` — server-side helper that pulls candidates from `/api/plan/candidates` and partitions by subject
- `components/child/garden/CharacterSpot.tsx` — renders one character with all states (alert, sleeping, tap behavior)

### 9.5 Files modified

- `app/(child)/garden/page.tsx` — compute today's alert + per-character recommendations, pass to `GardenScene`
- `app/(child)/garden/GardenScene.tsx` — render three `CharacterSpot` instances at the configured positions

---

## 10 · `/explore` deletion

The `/explore` route is **fully removed.** All quick-start affordance now lives in the world via §9. The adaptive engine continues to drive what each character recommends — the only thing that changes is the surface where that recommendation appears.

### 10.1 Files deleted

- `app/(child)/explore/page.tsx`
- `app/(child)/explore/ExploreClient.tsx`
- `app/(child)/explore/ExploreHeader.tsx`
- The entire `app/(child)/explore/` directory

### 10.2 Files modified to remove references

- `app/(child)/garden/GardenScene.tsx` — remove the 🧭 compass icon and its `Link`
- Any other place that links to `/explore` — search the codebase

### 10.3 API route preserved

`/api/plan/candidates` stays — it now serves the character recommendations in §9.2.

---

## 11 · Data model changes

### 11.1 New fields (stored)

- `world_state.garden.unlocked_branches: BranchCode[]` — append-only list of branches that have been unlocked for this learner. Used to detect the "just unlocked between sessions" moment for the celebration animation.

### 11.2 No new tables, no new columns on existing tables

Everything else is **derived**:

- Branch unlock state is derived from `skill_progress` + `attempt`
- Habitat interior eligibility is derived from `journal_entry` count for the habitat's species. **Note for implementer:** `species` rows in the DB don't carry a `habitat_code`. Derive the species-to-habitat mapping from `SPECIES_CATALOG` (in-memory): `SPECIES_CATALOG.filter(s => s.habitatCode === habitat.code).map(s => s.code)`, then check whether any of those codes appear in `journal_entry` for this learner.
- Daily character is derived from `learnerId + date`

### 11.3 Migration

A new SQL migration `lib/supabase/migrations/009_world_state_unlocked_branches.sql`:

```sql
-- world_state.garden is a jsonb column. New conventional shape:
--   { pendingArrivalSpeciesCode?: string, unlocked_branches?: string[] }
-- No schema change needed (jsonb is flexible), but include comment + a backfill
-- to populate unlocked_branches based on current skill_progress for each learner.

DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT learner_id FROM world_state LOOP
    -- compute unlocked branches for this learner using SQL or leave empty
    UPDATE world_state
    SET garden = COALESCE(garden, '{}'::jsonb) || jsonb_build_object('unlocked_branches', '[]'::jsonb)
    WHERE learner_id = r.learner_id AND NOT (garden ? 'unlocked_branches');
  END LOOP;
END $$;
```

Backfill rationale: existing learners get an empty array; the next garden page load will compute current unlock state and (if conditions met) trigger the unlock animation on next session boundary. That's fine — older learners may see a delayed graduation moment.

---

## 12 · Routing summary

| URL | Page |
|-----|------|
| `/garden` | central garden (existing, modified) |
| `/garden/math-mountain` | Math Mountain branch (new) |
| `/garden/reading-forest` | Reading Forest branch (new) |
| `/garden/habitat/bunny_burrow` | Bunny Burrow interior (new; only one mapped initially) |
| `/garden/habitat/[code]` | dynamic route for future habitat interiors (returns 404-style "not yet" for unmapped codes in first push) |
| `/lesson/[sessionId]` | unchanged |
| `/complete/[sessionId]` | unchanged |
| `/journal` | unchanged |
| `/habitats` | unchanged (still the flat catalog) |
| `/picker`, `/settings` | unchanged |
| ~~`/explore`~~ | **deleted** |

All garden-family pages preserve `?learner=` query param across navigations.

---

## 13 · Scene transitions

Tapping a path-edge gate (when unlocked), tapping a quick-start character, tapping a structure inside a branch — all navigate via Next.js client-side routing. **No custom slide/fade transitions in first push** — the existing default page transition is fine. (Phase 2 wishlist: a soft fade-in on branch scenes that feels Studio Ghibli.)

The one **exception** is the unlock animation in §5.3 — that's an in-place CSS animation on the gate itself, before any navigation. It plays once when `justUnlocked` matches, then never again.

---

## 14 · First-push scope (the Demonstrative MVP)

### IN SCOPE

- §4 Central garden additive changes (path extensions, gate icons, 3 character spots, header cleanup)
- §5 Graduating-world unlock model (gate state, unlock animation, sparkle moment)
- §6 Math Mountain scene (full layout, all math structures, gating logic)
- §7 Reading Forest scene (full layout, all reading structures, gating logic)
- §8 Bunny Burrow interior + invitation flow + modal "step inside" button (only Bunny Burrow gets an interior)
- §9 Character behavior (Nana, Hodge, Signpost with daily rotation)
- §10 `/explore` deletion
- §11 Data migration for `unlocked_branches`

### PHASE 2 (deferred, tracked here)

- Other 5 habitat interiors (frog pond, bee hotel, ant hill, butterfly bush, log pile) — repeat the §8 pattern
- Splitting Math Mountain into 2–3 sub-scenes if it visually outgrows one screen — the §3 carving rule
- Cottage interior (settings + journal entry + future music corner)
- Music branch when content arrives
- Science branch when content arrives
- Auto-scroll-as-mastered camera on Math Mountain
- Soft fade transitions between scenes
- Hidden/discoverable doorway pattern (one or two magical "secret" entries) per the Direction-3 hybrid we discussed
- **Luna directional wandering** — when Luna is awake and walking, she drifts toward the day's recommended structure. If Cecily follows her, Luna sits down at the structure. Subtle, optional, pure delight. (User asked "maybe the cat could do something" during brainstorming.)

### EXPLICITLY OUT OF SCOPE (everything Plan 4 touched is intact and untouched)

- Virtue gem detection rules
- Field journal layout
- Habitat ecology quest mechanics
- Multi-learner profile UI
- ESLint child-language rule
- AI content generation
- Real ElevenLabs TTS integration

---

## 15 · Open questions / implementer judgment calls

Three items the implementer should decide based on what looks right when implementing — none block the spec:

1. **Two structures may move from central garden to branches if they look better there.** `math_butterfly_arrays` (crossing-ten add) and `math_array_orchard` (multiplication arrays) are already tagged G2 and arguably belong in Math Mountain rather than central garden. Same for `reading_digraph_bridge` and `reading_bee_words` (both G1.5–2). **Default: leave them on central garden** (the user said removals should be minimal). If the implementer finds the central garden visibly cluttered or these specific structures don't fit visually after gates are added, they may move them. Document the decision in the commit.
2. **Cluster label visibility** — always-on, or only shown on idle/hover? **Default: always-on, low-contrast** (dashed frame, ~9.5pt uppercase letterspaced). Re-evaluate after first iteration.
3. **Gate unlock narrator beat copy** — exact words for the *"the path opens"* moment. Two candidates:
   - Hodge for Math Mountain: *"a path I haven't shown you opens — up the mountain we go when you're ready."*
   - Nana Mira for Reading Forest: *"the trees open a way — when you'd like, the forest is waiting."*

Both phrasings avoid coin/gamification language and stay in-character. Implementer may tune.

---

## 16 · Testing approach

### 16.1 Unit tests (new)

- `lib/world/branchGating.test.ts` — covers §5.6
- `lib/world/characterRotation.test.ts`:
  - Same learnerId + same date → same character
  - Different dates → distribution across characters (rough sanity)
  - Same date, different learners → independent rotation
- `lib/world/branchMaps.test.ts` — every structure code in branch maps must reference a real skill code (registry lookup); positions are within map bounds; no overlapping structures (manual placement check)

### 16.2 Component tests (new)

- `components/child/garden/CharacterSpot.test.tsx` — alert state renders awake; sleeping state renders idle; tap fires correct callback
- `components/child/garden/LockedGate.test.tsx` — locked state shows ivy + lock label; unlocked state shows open archway; unlock animation runs when `justUnlocked` prop is true
- `components/child/SpeciesDetailModal.test.tsx` — extended: when `interiorEnabled=true`, "step inside" button is present and links to correct URL

### 16.3 E2E test (new, single happy-path)

`tests/e2e/world-navigation.spec.ts`:

(Note: steps 3 and 10 below would take many sessions to play through naturally. The test should DB-seed the relevant `attempt`/`skill_progress`/`habitat`/`journal_entry` rows to put the learner directly in the desired state, rather than playing 30+ items. Use the existing seeding helpers in the codebase.)

1. Create a fresh G1 learner
2. Verify `/garden` loads with locked Math Mountain gate
3. Seed: 3 starter math structures at correctCount target
4. Reload `/garden` — verify gate is now unlocked, unlock animation fires (once)
5. Tap the gate's unlocked path → navigate to `/garden/math-mountain`
6. Verify Math Mountain renders with cluster labels and locked-structure ghosts
7. Tap a starter unlocked structure → starts session
8. Complete it → return to `/garden`
9. Tap Hodge the Beaver → verify a session starts on a math skill
10. Seed: bunny burrow built + a `pendingArrivalSpeciesCode` for a bunny species + zero prior `journal_entry` rows for any bunny species. Reload `/garden` → verify the `ArrivalCard` includes the invitation copy + step-inside button
11. Tap step-inside → navigate to `/garden/habitat/bunny_burrow`
12. Verify the interior renders, the themed skill structure is present, and the discovered species shows full color

### 16.4 Existing tests that must continue to pass

- `tests/child-language.test.ts` — no new copy in this spec violates the lint rule
- All existing `tests/e2e/*` and component tests

---

## 17 · Implementation suggestion (summary table)

For the implementation plan author's reference. Each row is roughly one task.

| # | Task | Files | Touches |
|---|------|-------|---------|
| 1 | Migration: `unlocked_branches` jsonb field | `lib/supabase/migrations/009_world_state_unlocked_branches.sql` | DB |
| 2 | `branchGating.ts` + tests | `lib/world/branchGating.ts`, `lib/world/branchGating.test.ts` | logic |
| 3 | `characterRotation.ts` + tests | `lib/world/characterRotation.ts`, `lib/world/characterRotation.test.ts` | logic |
| 4 | `characterRecommendation.ts` + tests | `lib/world/characterRecommendation.ts`, `lib/world/characterRecommendation.test.ts` | logic |
| 5 | `branchMaps.ts` (Math Mountain + Reading Forest structures) | `lib/world/branchMaps.ts`, `lib/world/branchMaps.test.ts` | data |
| 6 | `habitatInteriors.ts` config | `lib/world/habitatInteriors.ts` | data |
| 7 | `LockedGate` component + tests | `components/child/garden/LockedGate.tsx`, `.test.tsx` | UI |
| 8 | `CharacterSpot` component + tests | `components/child/garden/CharacterSpot.tsx`, `.test.tsx` | UI |
| 9 | `BranchHeader` + `BranchSceneLayout` | `components/child/garden/BranchHeader.tsx`, `BranchSceneLayout.tsx` | UI |
| 10 | `HabitatInteriorLayout` | `components/child/garden/HabitatInteriorLayout.tsx` | UI |
| 11 | Math Mountain page + scene | `app/(child)/garden/math-mountain/page.tsx`, `MathMountainScene.tsx` | route |
| 12 | Reading Forest page + scene | `app/(child)/garden/reading-forest/page.tsx`, `ReadingForestScene.tsx` | route |
| 13 | Bunny Burrow interior page + scene | `app/(child)/garden/habitat/[code]/page.tsx`, `BunnyBurrowInterior.tsx` | route |
| 14 | Update `gardenMap.ts` with characters + gates | `lib/world/gardenMap.ts` | data |
| 15 | Update `GardenScene.tsx`: remove compass, add path extensions, render gates + characters | `app/(child)/garden/GardenScene.tsx` | UI |
| 16 | Update `garden/page.tsx`: compute branch unlock + character rotation + recommendations + interior eligibility, write `unlocked_branches` to world_state on detection | `app/(child)/garden/page.tsx` | server |
| 17 | Update `SpeciesDetailModal.tsx` and `ArrivalCard.tsx` for "step inside" + invitation copy | `components/child/SpeciesDetailModal.tsx`, `components/child/garden/ArrivalCard.tsx` | UI |
| 18 | Update arrival pipeline to compute `isFirstForHabitat` | wherever pendingArrival is computed | server |
| 19 | Delete `/explore` route + remove all references | `app/(child)/explore/*` (delete), grep + remove links | cleanup |
| 20 | E2E test for full happy path | `tests/e2e/world-navigation.spec.ts` | test |

---

**End of spec.**
