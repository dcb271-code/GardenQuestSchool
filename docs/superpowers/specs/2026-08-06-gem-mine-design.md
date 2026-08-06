# Design — Crystal Cavern

**Requested by Cecily**, in her own words: one of the mountains should have a gem
mine; inside it a "habitat" to learn about gems — *how they are created, how they
differ, colour properties, hardness/carats, value, mining, history*; and maths
exercises attached — *money/selling, weight, maybe geometry*. Level 3, so
Level-3 appropriate.

That is an unusually complete brief. This document is the research behind it and
the decisions it forces, written before building because two of her three maths
ideas do not map onto skills that currently exist.

---

## 1. Kentucky owns this subject, and that is the hook

The locale rule that shaped the bird curriculum applies twice over here. Cecily
lives in a state whose geology is genuinely famous, and every fact below is
checkable.

**Kentucky agate is the official state mineral AND the official state gemstone.**
And the best part is a mistake: for twenty-four years the state had it
*backwards* — coal was designated the state "mineral" in 1998 and agate the state
"rock" in 2000, when coal is a rock and agate is a mineral. In 2024 the
legislature fixed it (HB 378), making coal the state rock and agate both the
state mineral and state gemstone.

That is the whole rock-versus-mineral lesson, handed over as a true story in
which grown-ups got it wrong and had to correct it. It is the same shape as the
Red-bellied Woodpecker's misleading name, which is already the best line in the
bird curriculum.

**Western Kentucky was one of the two most productive fluorite regions in the
United States.** The Illinois–Kentucky Fluorspar District — Crittenden,
Livingston and Caldwell counties — peaked from the 1920s to the 1960s and largely
ended in the 1980s when importing became cheaper. Fluorite was first noticed near
the Crittenden County courthouse in the **1830s, and was thrown away as waste**;
miners called it "spar". A mineral museum in the county still holds the
collection of a man who ran those mines.

A valuable thing sitting in the spoil heap because nobody had looked properly at
it is a good story for a child who is learning to look properly at things.

**Geodes** are abundant in the region and are the single best object for teaching
that the outside of a thing tells you very little.

**Design consequence:** the mine teaches Kentucky minerals first, exactly as the
bird crews are ordered by a Kentucky feeder guide. Agate, fluorite, geode, coal,
quartz, calcite, galena, and the freshwater pearl it replaced as state gemstone.

---

## 2. Where it goes

Math Mountain, and it should be a **habitat with an interior**, which is what
Cecily meant by "a 'habitat' to learn about gems".

There is precedent: `operations_cave` is already a habitat sitting on Math
Mountain with its own interior hosting three skill stops. The gem mine is its
sibling — a second cut into the same mountain, higher up, opened later.

Consequences that follow from the existing machinery:

- A habitat needs a `HABITAT_QUESTS` entry or **it can never be built** (the
  build modal renders null without one), plus `HABITAT_QUESTIONS_L3` and a
  `RESEARCHER_QUESTS` entry.
- Its position must clear every tap circle, label pill and station box — use the
  solver, not the eye.
- If it attracts no species, `residents.test.ts` requires it to have no
  interior… and it *will* have an interior, so it must attract at least one
  "species" or the invariant needs widening. **A mine has no creatures.** This is
  the first real friction and §5 covers it.

---

## 3. The gem catalog

Same shape as `PLANT_CATALOG` / `BIRD_CATALOG` — a typed config array, so adding
a gem is appending an object.

```ts
export interface GemData {
  code: string;
  name: string;                    // 'Kentucky Agate'
  kind: 'mineral' | 'rock' | 'organic';   // the lesson itself
  emoji: string;
  colours: string[];               // what it actually looks like
  mohs: number;                    // 1–10, and comparable to real things
  formedBy: 'igneous' | 'sedimentary' | 'metamorphic' | 'hydrothermal' | 'biological';
  formationStory: string;          // how it got made, for a child
  whereFound: string;              // Kentucky first
  facts: string[];                 // three, like the birds
  /** Rough value per gram in pennies — drives the money maths. */
  valuePerGram: number;
  /** Crystal habit: 'cube' | 'hexagonal prism' | 'none (banded)' … */
  crystalShape: string;
}
```

`mohs` is the load-bearing field. Hardness is the one gem property a child can
*test* — a fingernail is 2.5, a copper coin 3.5, a steel nail 5.5, glass 5.5.
That turns "how do they differ" from a fact to be memorised into an experiment
she can run on a real rock in the garden.

`kind` carries the rock/mineral/organic distinction the state symbols got wrong,
and the freshwater pearl is why `organic` exists.

---

## 4. The maths — and where her three ideas actually land

This is the part that needs a decision. Her three ideas are not equally
supported by the skills that exist.

| Her idea | Maps to | Verdict |
|---|---|---|
| **Money / selling** | `math.multiply.2digit_by_1digit` (0.87), `math.placevalue.round_nearest_100` (0.78), `math.divide.equal_share` (0.70) | **Works today.** "Eleven agates at $14 each", "round the day's haul to the nearest hundred", "split the find between three miners" are all real Level-3 skills wearing a mine costume. |
| **Weight / carats** | *nothing* | **No mass skill exists.** The measurement strand has time, money, fractions, area/perimeter and volume — no weight at any level. |
| **Geometry** | `math.measurement.area_perimeter` (0.92), `math.volume.rectangular` (0.98) | **Both are Level 4–5**, above her band. There is no 2D/3D shape-recognition skill at all. |

Three honest options:

**(a) Build the mine on money maths now.** Fastest, entirely Level-3, and it is
the idea she listed first. Weight and geometry become gem *content* rather than
maths drills — carat weight is a fact printed on a gem card, crystal shape is
something she learns to recognise, neither generates exercises.

**(b) Add a weight/mass skill to the maths pack.** Genuinely missing from the
curriculum regardless of the mine — grams and kilograms belong in a Grade-3
maths pack, and carats are a natural door into them. This is real curriculum
work: a new skill, authored items, a place on the map.

**(c) Add a shapes/solids skill.** Crystal habit is beautiful geometry — fluorite
grows cubes, quartz hexagonal prisms, garnet dodecahedra — and 3D shape naming
is Grade-2/3 content that the pack is simply missing.

**Recommendation: (a) now, (b) next, (c) later.** Ship the mine on money maths so
she gets the thing she asked for, and treat the missing weight skill as its own
piece of curriculum work rather than something smuggled in under a gem.

---

## 5. The friction, stated up front

**A mine has no creatures.** `tests/world/residents.test.ts` asserts that any
habitat with an interior attracts species, and the inverse. The mine breaks both
directions.

Two ways out, and the second is better:

1. Widen the invariant to exempt "workshop" habitats — `operations_cave` is
   already exempted by hand, so the exemption list grows.
2. **Give the mine residents anyway**, and make them the point: a mine is full of
   living things. Cave crickets, bats, salamanders, and the blind cave shrimp
   Kentucky is actually known for. That turns an awkward test into content — and
   Mammoth Cave, the longest cave system in the world, is in Kentucky.

Option 2 is more work and much better. It also gives the researcher quest an
obvious subject: what lives in the dark, and how does it live without light?

**Second friction:** the mine is a maths place with a *science* curriculum
attached, which is a new combination here. Birds and music both write null-item
attempt rows so practice feeds the garden without touching skill state; the gem
lessons should do the same, while the mine's skill stops start real maths
sessions like any habitat interior.

---

## 6. Proposed build order

1. `lib/world/gemCatalog.ts` — eight Kentucky-first gems, hardness and all.
2. `gem_mine` habitat: catalog entry, map position from the solver, build quest,
   L3 tier, researcher quest, illustration.
3. The interior — a mine tunnel: a rail cart, a lantern, a seam of banded agate,
   three maths stops (selling, sharing, rounding) and a gem-study table.
4. `/gems` curriculum — units on rock vs mineral, hardness, how gems form,
   Kentucky's mining history — following the bird module's shape exactly.
5. Cave residents, and the researcher quest about life without light.
6. Photos. Real specimen photographs from iNaturalist, curated by eye, exactly
   as the birds were.

Steps 1–3 are the mine as Cecily described it. Steps 4–6 are what makes it as
good as the bird module.

---

## 7. Her answers, and what they decided

All four questions went to her through the letterbox and came back.

**It is called CRYSTAL CAVERN.** Her name, used everywhere.

**Ruby is her favourite** — which produced the two-shelf structure in §3, because
there are no rubies in Kentucky and the honest answer turned out to be better
than a fudge.

**Creatures: the salamander, plus cave crickets and bats.** So §5 resolves the
good way — the cavern gets residents and they become content rather than an
exemption. Four different answers to "how do you live where there is no light":
the salamander has BIG eyes for the dark, the crickets have eyes and leave at
night to feed (which is what keeps everything else alive down there), the bats
sleep in and feed out, and the Kentucky cave shrimp has no eyes at all.

**Sell or keep? She said BOTH, and better than I asked it.** Her words: gems
should "carry a worth, maybe in money terms, that can be traded for garden goods
(maybe can eventually build garden things?)".

That is an economy, and §8 is what it has to be.

---

## 8. The economy, and the trap it must not fall into

This is the riskiest thing in the whole design, and the risk is already
documented in this project: **the failure mode of this garden is a child
grinding easy content for rewards.** That is why the trellis gate is
mastery-gated rather than count-gated, and why bird units are one-pass. A
currency that buys things is exactly the shape that goes wrong.

### Naming, first — there is a collision

**"Gem" already means something here.** `virtue_gem` is an established reward:
seven virtues, one a day, narrative. Cecily's gems are minerals. Two different
things called gems, in the same garden, would confuse the code and the child.

So: the cavern yields **specimens**, and they sell for **coins**. Virtue gems stay
what they are. Coins also point straight at `math.money.coin_count` and the money
maths she asked for.

### Keep or sell — the decision IS the feature

Every specimen she finds offers a genuine choice:

- **Keep it** — it goes in the display case, and a complete case of Kentucky
  minerals is its own goal.
- **Sell it** — it becomes coins, and coins buy garden things.

She cannot do both with the same stone. That is opportunity cost, it is real
maths, and it is a far better mechanic than either option I offered her.

### Where coins come from, and the ceiling on them

Coins must be bounded by CONTENT and TIME, never by repetition:

- Completing a Crystal Cavern lesson yields a specimen. Lessons are
  one-pass, exactly like bird units, so this is a finite seam.
- A **daily dig** yields one or two specimens, capped per day the way virtue
  gems already are. A day's mining is a small event, not a tap-farm.
- Selling is the only source of coins. There is no coin-per-correct-answer,
  because that is precisely the farmable shape.

Consequence worth stating: **a child who grinds subtract-within-10 all afternoon
earns nothing here.** The cavern pays for going deeper, not for going again.

### What coins buy

Not seeds — those already come from `SEED_EARN_SCHEDULE` on lifetime correct, and
a second route to the same reward would undercut it.

**Garden ornaments**, placed on the map: a bench, a stone lantern, a birdbath, a
sundial, a little bridge. This is the "build garden things" she asked for, it is a
surface that does not exist yet, and it makes the map change in a way that is
hers rather than earned from a skill tree.

It also revives something dormant. Both girls have **zero** decorations placed —
the tiny-garden decor state is empty for both. Giving ornaments a price and a
source may be what that feature was always missing.

### The thing to watch

If specimen value ever becomes the reason she does maths, this has failed. The
mine should be somewhere she wants to go because it is interesting, and the coins
should be a souvenir of having gone.

---

## Sources

- [Kentucky Geological Survey — Kentucky agate](https://www.uky.edu/KGS/rocksmineral/state-agate.php)
- [Kentucky HB 378 (2024), state symbol correction](https://apps.legislature.ky.gov/law/acts/24RS/documents/0032.pdf)
- [LPM — bill correcting decades-old state symbol mix-up](https://www.lpm.org/news/2024-04-03/bill-before-beshear-would-change-ky-state-symbols-correcting-decades-old-mix-up)
- [Kentucky Geological Survey — Western Kentucky Fluorspar District](https://www.uky.edu/KGS/minerals/im_fluorspardistrict.php)
- [WKMS — fluorspar mining in Crittenden County](https://www.wkms.org/business-economy/2026-04-06/fluorspar-mining-put-crittenden-county-on-the-map-100-years-ago-its-importance-to-ai-tech-is-driving-interest-in-the-area-again)
