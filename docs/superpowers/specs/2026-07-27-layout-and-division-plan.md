# Plan — map layout fixes, and splitting division out of multiplication

**Date:** 2026-07-26
**From:** four issues reported after a real session on the Cozyla.

Three are layout collisions with exact coordinates; one is a curriculum change.
Ordered by "is it stopping her playing right now".

---

## P0 — Mirror Tarns cannot be tapped

**Severity: highest.** This isn't cosmetic; a stop on the map is unreachable and
tapping it does the opposite of what she wants.

`MathMountainScene.tsx:2426-2428` draws the High Meadow station's *close* target
as `x -60 y -46 w 120 h 108` at `translate(860, 305)` — absolute **800–920 ×
259–367**. It is gated only on `drawTapTarget = key !== 'cave'`, **not on
whether the station is expanded**, and it is the last painted element in the
whole scene, so it wins every hit test in its box.

Mirror Tarns sits at **(820, 260)** — its centre is *inside* that rect, by 20
units in x and **1 unit in y**. Measured:

| | |
|---|---|
| Mirror Tarns tap circle stolen | **~44%** — the entire bottom-right, i.e. where a right-handed finger lands |
| Its label pill | **100% inside** the close rect for x ≥ 800 — tapping the words always closes |
| What's left to open the lesson | an upper-left crescent ~15 world units ≈ **18 px**, against a 44 pt minimum |

**Two other stops are hit by the same rect**, and these are broken even when the
station is *collapsed*, because it renders unconditionally:
`mm_mountain_compare` "Mountain Heights" (800, 380) and `mm_round_100` (920,
360). `mm4_leftover_rocks` (920, 260) loses its lower-left quadrant.

**Fix:** gate the rect on `isExpanded`, and when expanded shrink it to the
visible "tap to close" pill (`x -46 y 28 w 92 h 14`). Right now the real close
target is ~10× the area of the thing that *looks* like the close target, and
offset upward from it — so even an adult would mis-tap.

**Guard:** there is no spacing or overlap test anywhere.
`tests/world/branchMaps.test.ts` only checks skill codes and 0–1440/0–800
bounds. Add an assertion that no `HABITAT_GROUPS` tap box contains any
`MapStructure` centre.

---

## P0 — the Nature Walk signpost is buried

`rf_paragraph` "Paragraph Pavers" is at **(740, 720)**; the signpost hit rect is
**660–780 × 706–792**. They are **37.7 units apart**.

- The paver's transparent `r=34` tap circle overlaps **75% of itself** into the
  signpost's rect, covering **58% of the visible sign board face**.
- Its label pill (694–786 × 748–765) is the white plate sitting over the post.
- **Z-order decides it:** the signpost is drawn at `:660`, the structures block
  at `:1206`. The paver is painted later, so taps in the overlap open the
  Paragraph Pavers lesson and never the walk chooser. Roughly the upper-centre
  third of the sign is dead.

**Fix:** move `rf_paragraph` (`branchMaps.ts:368`) — it needs `y ≤ 640`, or `x`
outside 626–814, remembering the label pill extends `y + 45` and `x ± 46`. Then
move the signpost group to render *after* the structures block so it can never
be painted over again.

**Same bug class, same scene, not yet reported:** the phonics habitat marker's
tap rect (`:1405`, 790–890 × 170–262) contains the exact centre of
`rf_vowel_ee_ea` "Ee/Ea Glade" at **(800, 260)**.

---

## P1 — High Meadow is too crowded to read

The 15 Level-4 stops are two hand-typed rows on a 100-unit pitch (y = 260 and
y = 185). The centres are fine — minimum separation is 90.1 units. **The
footprints are not:**

- Label pills are **92 wide on a 100-unit pitch** → 8 units of gap, about 9 px
  on the tablet. Adjacent pills read as one continuous beige band.
- Row A's "✨ next" beacon ribbon ends at y 213; Row B's label pill starts at
  y 213. They abut exactly.
- Total expanded width is **792 world units** against a **~713-unit portrait
  window** — she physically cannot see the whole station without panning.

**Fix options, cheapest first:** shorten labels; widen the pitch past 100 and
wrap to three rows so the block fits 713 units; or split the station (see P2 —
moving division out removes stops from here anyway).

---

## P2 — a division station further up the mountain

**Cecily is a Level-3 learner at 1,377 lifetime correct who is barely doing
division.** The ask: separate division from multiplication, and put the
division ladder in a new station up the mountain as a harder Level-3 goal.

### What exists today

Division is **real, authored content** — not stub skill codes:

| skill | level | items | where it lives now |
|---|---|---:|---|
| `math.divide.equal_share` | 0.70 | 19 | Division Glen |
| `math.divide.facts_to_10` | 0.80 | 55 | Division Glen |
| `math.divide.unknown_factor` | 0.82 | 20 | Division Glen |
| `math.divide.with_remainders` | 0.89 | 36 | **High Meadow** (`mm4_leftover_rocks`) |
| `math.divide.long_division` | 0.96 | 28 | **The Summit** (`mm5_long_stair`) |
| | | **158** | |

Two structural facts to design around:

1. **There is no `division` strand.** All five division skills sit inside the
   `multiplication` strand ("Multiplication Foundations") in
   `lib/packs/math/strands.ts`. That is the actual "division isn't separated"
   problem, underneath the map.
2. **A "station" is two unsynchronised things.** `BranchCluster` in
   `branchMaps.ts` is a label drawn at the members' centroid — purely visual.
   `HABITAT_GROUPS` in `MathMountainScene.tsx:136` is the real collapse/expand
   marker, hardcoded in the component. Nothing keeps the two lists in agreement,
   and there is **no station-level gating at all** — a structure unlocks iff
   every `prereqSkillCodes` entry is mastered. "Further up the mountain" is
   currently only a y-coordinate plus a prereq chain.

### Why Cecily isn't doing division

At Level 3, `masteredSkillsForLevel` pre-masters `multiply.equal_groups`, so
`divide.equal_share` unlocks on day one — but `divide.facts_to_10` requires
`multiply.facts_to_10` **mastered**, which is in her *working* band, not
pre-mastered. So the division ladder stalls at one stop until multiplication
facts are finished. That is defensible pedagogically (you do need the facts),
but it means division reads as an afterthought rather than a destination.

### Proposed shape

1. **Give division its own strand** in `strands.ts` and re-point the five
   `math.divide.*` skills at it. This is the change that actually "separates
   division from multiplication" everywhere — compass, planner, recommendations
   — not just on the map.
2. **New station: "Sharing Ledge"** (name TBD with Cecily), placed above
   Division Glen and below High Meadow. Holds `divide.equal_share`,
   `divide.facts_to_10`, `divide.unknown_factor`, plus `mm4_leftover_rocks`
   moved *out* of High Meadow — which also relieves P1 by one stop.
3. **Leave `divide.long_division` on the Summit.** It is Level 5; hauling it
   down would misrepresent its difficulty.
4. **Retire or shrink Division Glen** so there aren't two division places.
5. Because there is no station gating, "up the mountain" must be expressed as
   y-coordinate + the existing prereq chain. If we want the station to feel
   *earned*, the cheapest honest lever is to require `multiply.facts_to_5`
   rather than `facts_to_10` for `divide.facts_to_10`, opening the ladder
   earlier without pretending she's ready for long division.

### Files this touches

`lib/packs/math/strands.ts` · `skills.ts` (re-parent + prereqs) · `themes.ts`
(map names) · optionally `hints.tsx` · `lib/world/branchMaps.ts`
(`MATH_MOUNTAIN_STRUCTURES` + `MATH_MOUNTAIN_CLUSTERS`) ·
`MathMountainScene.tsx` (`HABITAT_GROUPS`, the station art `if` chain ~`:2218`,
the hardcoded trail path `:2047`) · `markerIcons.tsx` / `ILLUSTRATION_ALIAS`
for art coverage · `lib/learner/baseline.ts` level bands · tests
`branchMaps.test.ts`, `branchArtCoverage.test.tsx`.

**No new items needed** — 94 division items already exist in the Grade-3 band.
This is re-parenting and re-placing, not authoring.

---

## Unreproduced — residents clustering at the bunny burrow

Reported: "many of the animal friends are clustered together, overlapping around
the bunny burrow."

**I could not reproduce this**, either against Cecily's real data or against a
worst case with every species discovered:

- Her 15 discovered species place as ant_hill 2 · butterfly_bush 3 ·
  bee_hotel 3 · log_pile 3 · frog_pond 3 · **bunny_burrow 1**
- Zero resident pairs closer than 40 units
- Zero residents within 46 units of any non-habitat garden structure
- Nothing at all within 120 units of the burrow marker (330, 670)
- `GardenScene` renders at `translate(r.x, r.y)`, so the model matches the draw

So either it is something my model doesn't capture, or it is a different set of
elements than I think ("animal friends" may mean the companion, the walkers, or
the journal rather than map residents).

**Needed: a screenshot.** This is precisely the class of thing the device pass
exists to catch, and it is the fourth reason that pass is overdue.

One honest gap found while looking: `tests/world/residents.test.ts` deliberately
skips cross-habitat comparisons —

```ts
if (out[i].habitatCode !== out[j].habitatCode) continue;
```

— so residents of *adjacent* habitats are unguarded. `frog_pond ↔
butterfly_bush` are 152 apart and `bee_hotel ↔ butterfly_bush` 146, which with
±56 ring offsets could touch at higher discovery counts than exist today. Worth
removing that `continue` regardless of what the screenshot shows.

---

## Suggested order

1. **P0 Mirror Tarns** — a stop is unreachable and mis-taps close the station.
2. **P0 signpost** — the new walk chooser is partly unreachable, so the birds
   are too. Plus the same fix for the Ee/Ea Glade collision.
3. **Overlap tests** for both scenes, so this class stops recurring. There is
   currently nothing.
4. **P1 High Meadow** — partly relieved by P2.
5. **P2 division** — the real curriculum work, and the only one that needs a
   conversation about naming and pacing before I build it.
6. **Residents** — blocked on a screenshot.
