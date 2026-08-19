# The Gem Curriculum — spec

*2026-08-18. The unbuilt half of Cecily's Crystal Cavern commission:
"a habitat inside to learn how gems form, how they differ, color,
hardness/carats, value, mining and history." The cavern ships digging,
keep-or-sell, and the shop; this is the LEARNING she asked for, in the
bird module's shape. See `2026-08-06-gem-mine-design.md` §4 and §6
step 4 — this spec turns that step into a buildable plan.*

*Why now: she has run through the world's content — all 25 species
arrived, all 4 creatures met, the Forest "finished." Her real
curriculum runway is 21 untouched skills of hard math. The gem
curriculum is the rare build that is world-content AND real science
AND a thing she asked for by name, at once.*

## What already exists (build on, do not duplicate)

| Piece | Where | State |
|---|---|---|
| `GemData` catalog — 13 stones, `mohs`, `kind`, `formedBy`, `formationStory`, `facts[3]`, `crystalShape` | `lib/world/gemCatalog.ts` | live |
| `HARDNESS_TESTS` (fingernail 2.5, copper coin 3.5, steel nail 5.5, glass 5.5, file 7) + `scratchTestFor` | `lib/world/gemCatalog.ts` | live |
| Crystal-habit drawings (cube, rhombohedron, prisms, octahedron, dodecahedron) | `GemSpecimen.tsx` | live, proof-rendered |
| The unit pattern: crews → stages → teach pages → generated exercises → one-pass units | `lib/birds/curriculum.ts` | the template |
| Practice that counts without touching skills: null-item attempt rows, `source` tag | `app/api/birds/practice/route.ts` | the template |
| Earned stones waiting in `cavern.pending` with keep-or-sell and an "earned" banner | `lib/world/cavern.ts` | live |

## The shape

**Two crews, mirroring her display case.** The SEAM crew first —
agate, fluorite, geode, coal, quartz, calcite, galena, pearl — exactly
as the bird crews are ordered by a Kentucky feeder guide. The CASE
crew (ruby, sapphire, garnet, emerald, diamond) is phase two.

**Four seam units, one-pass, ~6 teach pages + 8 exercises each:**

1. **"Rock, Mineral, or Once Alive?"** — the `kind` field as
   curriculum. Led by the true story: for twenty-four years Kentucky
   called coal a mineral and agate a rock, backwards, until the
   legislature fixed it in 2024. Grown-ups got it wrong and had to
   check — which is the scientific method arriving as gossip.
   Exercises: classify each seam stone; spot what makes pearl the odd
   one out (`organic` — something ALIVE made it).

2. **"The Scratch Test"** — `mohs` as an experiment she can run.
   Teach the ladder in objects she owns (`HARDNESS_TESTS`), then:
   which scratches which, what a fingernail can mark, why the test
   only works one way. Ends with the real assignment: go scratch a
   rock from the garden with a penny. `scratchTestFor` returning null
   for the case gems is the cliffhanger for phase two.

3. **"How Stones Get Made"** — `formedBy` + `formationStory`. Water
   carrying dissolved rock into cracks (fluorite, calcite), a swamp
   pressed flat for millions of years (coal), a mussel coating a
   grain of sand (pearl), a hollow bubble lined from the inside
   (geode). Exercises: match stone to origin; "which took a living
   creature?"; "which grew inside a bubble?"

4. **"The Spar Nobody Wanted"** — the mining history. Fluorite found
   near the Crittenden County courthouse in the 1830s and thrown away
   as waste for decades; western Kentucky becoming one of the two
   great fluorspar districts in America; the museum that keeps the
   old miner's collection. The lesson under the story: a valuable
   thing sat in the spoil heap because nobody looked properly.
   Exercises drawn from the story and the catalog `facts`.

**Exercise kinds, all generated from `GEM_CATALOG`** (no hand-authored
question text that can drift from the catalog — the bird rule):

```ts
| { kind: 'kind_sort' }      // rock, mineral, or once alive?
| { kind: 'harder_which' }   // two stones, which is harder (mohs)
| { kind: 'scratch_test' }   // will a copper coin scratch calcite?
| { kind: 'origin_match' }   // which stone did water build?
| { kind: 'shape_spot' }     // which grows cubes with no one cutting?
| { kind: 'story' }          // from facts[], history unit only
```

`shape_spot` renders the existing `GemSpecimen` drawings as the
choices — the display case art doing double duty as curriculum, the
same way sighting photos feed the bird exercises.

## What finishing a unit pays

**One specimen, once, ever, per unit — the unit's own subject stone**
(scratch test pays a fluorite, formation pays a geode, history pays a
fluorite's companion calcite, rock-vs-mineral pays the agate). It
lands in `cavern.pending` with the earned banner, so keep-or-sell
still happens and the case can complete through study as well as luck.

This adds a third coin source to the shop's anti-farming ledger and
must be recorded there: **selling a lesson stone — one per unit, ever
— bounded by CONTENT**, the same bound as mastery stones. Units are
one-pass; there is nothing to grind. No coin, no stone, no anything
is ever paid per correct answer.

## Where she finds it

A **study table in the Crystal Cavern interior** — she asked to learn
*inside* the cavern, and the interior already has the composition for
one more stop — linking to `/gems`, a route in the bird module's
mold. The route also appears beside `/birds` wherever that is linked.
No new habitat, no map surgery: the cavern IS the habitat.

## Progress and practice

- `world_state.garden.gem_units` — passed units, mirroring
  `bird_units`. One-pass; a failed run just doesn't record.
- Every answered exercise writes a null-item attempt row with
  `source: 'gems'` — so studying minerals grows plants in the garden
  and feeds the seed schedule, with no special case anywhere, and no
  math skill is ever marked practiced by it.
- Review rows via `recordResult` like birds, so Hodge's review
  machinery sees gem knowledge decay.

## Gates

Level 3, the cavern's own gate — if she can enter the cavern she can
study at its table. Esme reaches it when she reaches it; a simple
tier is phase-two work IF her rows ever show her bouncing off it (the
bird-tier lesson: build the ramp when the child appears, not before).

## Phase two (not now, recorded so it is not forgotten)

- The CASE crew: ruby and sapphire are the same mineral wearing
  different trace metals; diamond as the hardness king nothing she
  owns can scratch; garnet's twelve faces as geometry you can hold.
- Real specimen photographs from iNaturalist, curated by eye, IF the
  drawings prove insufficient — for minerals the habit diagrams may
  teach better than photos, the reverse of the birds.
- A weight/mass skill for the math pack ("carats") — still the
  answer to §4 of the design doc, still real curriculum work, still
  not to be smuggled in under a gem.

## Build order

1. `lib/gems/curriculum.ts` — units, teach pages, exercise
   generators, all reading `GEM_CATALOG`. Tests pin: every seam stone
   taught somewhere, every exercise answerable from the catalog, no
   unit references a stone the catalog lacks, `story` questions match
   `facts` verbatim.
2. `/gems` route + scene, `app/api/gems/practice` (bird practice
   route with `source: 'gems'` and the unit-stone award).
3. The study table in `CrystalCavernInterior` linking to it.
4. Letterbox letter to Cecily: the cavern can teach her now.

Steps 1–3 are one build session in the bird module's footsteps; the
patterns are all proven.
