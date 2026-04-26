# Grade 3 Expansion — Brainstorm & Plan

**Status:** Brainstorm. Not yet a plan or implementation spec.
**Premise:** Cecily is a 2nd grader today. Within ~12 months she'll
roll into 3rd grade. The system should grow with her — Grade 3
content needs to be ready before she hits Grade 2 mastery, not after.

---

## How Grade 3 differs from Grade 2

The conceptual shift between Grade 2 and Grade 3 is bigger than
anywhere else in elementary math/reading. By the end of Grade 3 the
child has gone from "two-digit add and subtract" to "multiply and
divide fluently within 100" and from "decode multi-syllable words"
to "read for gist and supporting evidence in a paragraph." The
content scaffold has to shift accordingly:

* **Math** — multiplication and division become the *primary* mode;
  fractions appear for the first time as numbers, not just shapes;
  numbers cross 1,000.
* **Reading** — the unit shifts from word to sentence to paragraph;
  morphology gets richer (prefix/suffix combinations, latin roots);
  fluency targets become the focus.

---

## Math: Grade 3 skill graph

### Multiplication & division (the big one — CCSS 3.OA)

These are the new Grade-3 backbone. Cecily already has the
foundations from Grade 2 (`equal_groups`, `arrays`,
`skip_count_bridge`).

| Skill code | Name | CCSS | Renderer |
|---|---|---|---|
| `math.multiply.facts_to_5` | × tables 0–5 | 3.OA.C.7 | EquationTap |
| `math.multiply.facts_to_10` | × tables 0–10 | 3.OA.C.7 | EquationTap |
| `math.multiply.facts_visual_to_10` | × with array scaffold | 3.OA.A.1 | ArrayGridVisual (already exists) |
| `math.multiply.commutative` | a×b = b×a | 3.OA.B.5 | New: SwapCheck (showing two arrays in different orientations) |
| `math.multiply.distributive` | 7×6 = 7×3 + 7×3 | 3.OA.B.5 | New: SplitArray (one big array shown split into two smaller ones) |
| `math.divide.equal_share` | shared equally between N | 3.OA.A.2 | New: EqualShareVisual (12 cookies into 3 plates) |
| `math.divide.facts_to_10` | ÷ facts within 100 | 3.OA.C.7 | EquationTap |
| `math.divide.unknown_factor` | 8 × ? = 56 | 3.OA.B.6 | EquationTap |

**New renderers needed:**
- `EqualShareVisual` — N items animate into M groups, child reads off how many per group
- `SwapCheck` — two arrays side by side (3×4 vs 4×3), child confirms they have the same total
- `SplitArray` — one large array drawn with a vertical or horizontal divider, child picks the matching sum-of-products expression

### Fractions (CCSS 3.NF)

Brand-new strand. Probably the single hardest concept of Grade 3 to
render well, because the visual matters so much.

| Skill code | Name | CCSS | Renderer |
|---|---|---|---|
| `math.fractions.identify_partsof_whole` | Name the fraction shaded | 3.NF.A.1 | New: FractionPie (pie or bar with shaded parts) |
| `math.fractions.unit_fractions` | 1/N where N=2..8 | 3.NF.A.1 | FractionPie |
| `math.fractions.compare_same_numerator` | 1/4 vs 1/8 | 3.NF.A.3.d | New: FractionCompareVisual (two pies side by side) |
| `math.fractions.compare_same_denominator` | 2/4 vs 3/4 | 3.NF.A.3.d | FractionCompareVisual |
| `math.fractions.equivalent_simple` | 1/2 = 2/4 = 4/8 | 3.NF.A.3 | New: FractionEquivalentVisual |
| `math.fractions.on_number_line` | Place 3/4 on a number line 0..1 | 3.NF.A.2 | New: FractionLine |

**New renderers needed (substantial):**
- `FractionPie` — circular/rectangular bar split into N equal parts, K shaded; multi-choice options or tap-to-shade
- `FractionCompareVisual` — two FractionPie panels with `<` `>` `=` choice
- `FractionEquivalentVisual` — two FractionPies that visually look the same total area shaded; child picks the equivalent fraction
- `FractionLine` — 0—1 number line with N tick marks; child taps where 3/4 lands (or picks from choices if a draggable feels too heavy)

This is the biggest investment because fractions REQUIRE good
visualisations to land. Plan ~3 weeks of design + build for these
four renderers if doing it well.

### Place value to 10,000 (CCSS 3.NBT)

Mostly extends what's already there.

| Skill code | Name | CCSS | Renderer |
|---|---|---|---|
| `math.placevalue.thousands_hundreds_tens_ones` | 4-digit split | 3.NBT.A.1 | PlaceValueSplit (extend existing) |
| `math.placevalue.compare_4digit` | <,>,= for 4-digit | 3.NBT.A.1 | NumberCompare (existing) |
| `math.placevalue.round_nearest_10` | Round to nearest 10 | 3.NBT.A.1 | EquationTap |
| `math.placevalue.round_nearest_100` | Round to nearest 100 | 3.NBT.A.1 | EquationTap |
| `math.add.within_1000` | 3-digit + 3-digit | 3.NBT.A.2 | EquationTap |
| `math.subtract.within_1000` | 3-digit − 3-digit | 3.NBT.A.2 | EquationTap |

The renderer surface already supports these — content authoring only.

### Time intervals + measurement (CCSS 3.MD)

| Skill code | Name | CCSS | Renderer |
|---|---|---|---|
| `math.time.elapsed_intervals` | "Started at 3:15, finished at 3:50 — how long?" | 3.MD.A.1 | New: ClockInterval (two clocks side by side, multiple choice for the gap) |
| `math.measurement.length_inches` | Measure to nearest 1/2, 1/4 inch | 3.MD.B.4 | New: RulerRead |
| `math.measurement.area_count_squares` | Count unit squares to find area | 3.MD.C.6 | ArrayGridVisual (already exists, easy adaptation) |
| `math.measurement.perimeter` | Sum the side lengths | 3.MD.D.8 | New: PerimeterShape (polygon with labelled sides) |

`ClockInterval` is the most useful new one — it builds directly on
the `ClockRead` we just shipped, so the SVG work is mostly already
done.

### Word problems — multi-step (CCSS 3.OA.D.8)

| Skill code | Name | Renderer |
|---|---|---|
| `math.word_problem.multi_step` | "Sam had 24, gave 6 away, then got 8 more. How many now?" | EquationTap |
| `math.word_problem.multiply` | "Each table seats 6. There are 5 tables. How many seats?" | EquationTap |
| `math.word_problem.divide` | "30 cookies shared equally among 6 friends." | EquationTap |

Content-only addition, uses existing renderers.

---

## Reading: Grade 3 skill graph

### Phonics + decoding (mop-up)

Most of the phonics work is done by Grade 3, but a few stragglers:

| Skill code | Name | Notes |
|---|---|---|
| `reading.phonics.silent_letters` | knee, lamb, write, gnome | New skill |
| `reading.phonics.tricky_y` | fly, baby, gym | Extends existing pattern |
| `reading.phonics.diphthongs_oi_oy_ou_ow` | already exists, needs more content |

### Morphology — meaning from word parts (CCSS L.3.4)

This is the big morphological growth area. We have `un-`, `re-`,
`-ed`, `-ing`, `-s`, `-es`, compound words. Need:

| Skill code | Name | Renderer |
|---|---|---|
| `reading.morphology.suffix_ly_ful_less` | quickly, helpful, careless | SightWordTap or DigraphSort |
| `reading.morphology.prefix_pre_dis_mis` | pretest, dishonest, misread | SightWordTap |
| `reading.morphology.suffix_er_est` | bigger, biggest | SightWordTap |
| `reading.morphology.contractions` | don't / do not, it's / it is | New: ContractionMatch (two-column matcher) |
| `reading.vocabulary.synonyms` | "happy" → glad, joyful, cheerful | SightWordTap (pick the synonym) |
| `reading.vocabulary.antonyms` | "happy" → sad | SightWordTap |
| `reading.vocabulary.context_clues` | Sentence with unfamiliar word, infer meaning | SentenceComprehension (extends existing) |

### Comprehension — paragraph level (CCSS RI.3 / RL.3)

The unit shifts from sentence to paragraph. Need a new renderer
that's bigger than `SentenceComprehension`:

| Skill code | Name | Renderer |
|---|---|---|
| `reading.comprehension.paragraph` | 3-5 sentence paragraph + 1-2 questions | New: ParagraphComprehension |
| `reading.comprehension.main_idea` | "What is this passage mostly about?" | ParagraphComprehension |
| `reading.comprehension.supporting_detail` | "Find a detail that supports..." | ParagraphComprehension |
| `reading.comprehension.sequence` | "What happened first/last?" | ParagraphComprehension |
| `reading.comprehension.cause_effect` | "Why did X happen?" | ParagraphComprehension |

`ParagraphComprehension` should be one paragraph + 2-3 questions
shown sequentially (don't swamp the child with all questions at
once). Each question scores its own "item" so we credit careful
reading.

### Fluency (CCSS RF.3.4)

The Grade 3 fluency target is ~120 WPM read aloud accurately. We
already have speech recognition for single words. Extending to
sentence-level fluency:

| Skill code | Name | Renderer |
|---|---|---|
| `reading.fluency.sentence_aloud` | Read this sentence out loud | New: SentenceReadAloud (mic-driven, like ReadAloudSimple but multi-word) |
| `reading.fluency.short_passage` | Read this 2-3 sentence passage | New: PassageReadAloud |

These are **substantial speech-recognition work** — accuracy of
matching for 12+ word strings is the open problem. Easiest first
implementation: declare success if ≥80% of expected words are
present in the transcript in any order. Plan for this to need a
rework after first user testing.

### Writing prompts (Stretch — CCSS W.3)

Probably out of scope for the first Grade 3 push, but flagging:
"Write a sentence about your favourite season" needs an entirely
different input modality (text input + parent review) so it's its
own arc.

---

## Summary of new renderers

| Renderer | Used by | Effort |
|---|---|---|
| `EqualShareVisual` | division concepts | Medium — animate items into groups |
| `SwapCheck` | commutative property | Small — two ArrayGridVisuals + check |
| `SplitArray` | distributive property | Medium — overlay a divider on a grid |
| `FractionPie` | identify, compare | **Large** — pie + bar variants, shading, animation |
| `FractionCompareVisual` | comparing fractions | Small — two FractionPies side by side |
| `FractionEquivalentVisual` | equivalent fractions | Small — uses FractionPie |
| `FractionLine` | fractions on number line | Medium — number-line tick math |
| `ClockInterval` | elapsed time | Small — two ClockReads side by side |
| `RulerRead` | length measurement | Medium — SVG ruler with tick precision |
| `PerimeterShape` | perimeter problems | Small — polygon with labelled sides |
| `ContractionMatch` | contractions | Medium — two-column drag/tap matcher |
| `ParagraphComprehension` | paragraph reading | Medium — multi-question flow |
| `SentenceReadAloud` | sentence fluency | **Large** — speech recognition for multi-word strings |
| `PassageReadAloud` | passage fluency | Large — depends on SentenceReadAloud |

**Total: 14 new renderers.**
**Realistic timeline if I'm the only one building**: ~6-8 weeks of
focused work, in this order:
1. Multi-digit math + word problems (no new renderers, content-only) — 1 week
2. ClockInterval + extending ClockRead — 0.5 week
3. EqualShareVisual + SwapCheck + SplitArray (multiplication/division visuals) — 1 week
4. FractionPie + comparison + equivalent + line (the fractions block) — 2 weeks
5. RulerRead + PerimeterShape — 0.5 week
6. ParagraphComprehension + content — 1 week
7. ContractionMatch + suffix/prefix content — 0.5 week
8. SentenceReadAloud + PassageReadAloud — 1.5 weeks (with iteration)

---

## Garden / world implications

The current garden has structures wired to specific skills. Grade 3
will add ~25 skills. Two paths:

* **A. Same map, deeper structures.** Each existing structure gets a
  Grade 2 + Grade 3 layer. "Tens Tower" stays for Grade 2 place
  value but adds Grade 3 thousands when prereqs are met. Visually
  the structure could grow taller or sprout an extension.
* **B. New map zones.** A "fraction river" zone (water habitats),
  a "multiplication orchard" (rows of trees), a "library" zone for
  paragraph reading. Each zone unlocks when the learner crosses a
  threshold of mastered Grade 2 skills.

**Recommendation: B.** It gives Cecily a concrete sense that she's
"unlocking new territory" as she grows, which fits the world
metaphor. The zones can render as smaller silhouettes from the
current map until unlocked, then bloom into full habitats.

---

## Engine work needed (small)

* Add `grade_level: 3` to the AddLearnerModal grade picker (already
  supported in the schema)
* Extend `baselineEloFor` to handle Grade 3 stretch sub-tier (1300
  baseline + offset)
* Update `masteredSkillsForGrade(3)` and `reviewingSkillsForGrade(3)`
  with the new Grade 3 content above (today they're stubbed with
  Grade-2-aspirational entries that should rotate down to "mastered"
  for a true Grade 3 learner)
* Add zone definitions in `lib/world/zoneProgress.ts` for any new
  zones

---

## What would I build first

If I had to ship one Grade 3 push tomorrow: **ParagraphComprehension
+ paragraph content** (extends an existing renderer pattern, no
fancy SVG, gives instant jump in reading challenge) **+
FractionPie + identify/compare items** (the most Grade-3-feeling
math concept; even one fractions skill makes the level feel
different).

Save the speech-recognition fluency work for a second push — it
needs its own iteration cycle.
