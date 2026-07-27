# Handoff — 2026-07-26 (second)

Continues [`2026-07-26-handoff.md`](./2026-07-26-handoff.md), which covered
`0262c2d`…`3e42760`. This one covers `e73b768`…`41101f8` — 7 commits, ~12,100
lines across 77 files. All pushed to main; Vercel auto-deploys.

**Migration 019 was applied to production**, and a public `bird-photos` bucket
now exists with 33 images in it. That is the first migration in a while — the
run before it was 018 (ikebana) — so if something looks off in the database,
check whether an environment has actually run `npm run db:migrate`.

Read the earlier handoff first if you haven't. Its §2 (patterns) and §3
(gotchas) are still accurate.

---

## 1. What shipped

### Discovered creatures now live somewhere
`6798540`

Before this, discovering a species produced an arrival card and a journal row
— and the world looked *identical* whether you'd found none or all of them.

`lib/world/residents.ts` places discovered creatures **on the garden map**
beside their built habitat. Deterministic ring placement seeded from the
species code, so nothing wanders between renders; spreads to a second ring
when a habitat gets crowded; tappable for a name bubble. A multi-habitat
species (the spotted salamander needs both log pile and pond) settles in
exactly one place.

### All six habitat homes can be entered
`cf1cf76`

Four new interiors — pond, log pile, butterfly bush, ant hill, bee hotel —
joining the bunny burrow. All share one shape: a themed skill stop, the
residents who live there, and "not yet found" slots for the ones who don't yet.
The route dispatch collapsed to a `SIMPLE_INTERIORS` lookup.

Two things worth keeping:

- **A test drove the butterfly bush into existence.** The invariant "every
  habitat a rare visitor lives in can be visited" failed on `butterfly_bush` —
  the luna moth is the reward for the hardest content in the game and its only
  home had no interior. Building it was the right fix; weakening the test would
  have hidden a real dead end.
- **The test then flipped from pinning a gap to asserting an invariant.** It now
  asserts that every species-attracting habitat *has* an interior, **and** the
  inverse — that anything without one attracts no species, because the route
  calls `notFound()` for it. `operations_cave` sits outside both on purpose.

**Bug fixed in passing:** `ArrivalCard` offered "step inside" without checking
`hasHabitatInterior()`, so a first-for-habitat arrival at one of the four
interior-less habitats hit a real 404.

### The bird curriculum, phase 1
`8654837` `7ec3675` `b2c5c43` `c30f1e1` `41101f8`

Cecily asked for bird identification: see them, learn about each, then their
songs, then a game matching a song to the right photo. That sequence is what
Cornell teaches, so the spec kept it.

**Phase 1 — the visual half — is live at `/birds`**, reached by a 🐦 button in
the garden header. Ten Louisville birds in two crews, each with a *Look* unit
and a *Know* unit.

- `lib/world/birdCatalog.ts` — ten birds with verified iNat taxon ids, field
  marks, behaviour, habitat, facts, and voices. The voices are unused until the
  audio phase; they exist so the harvester has something to ask for.
- `lib/birds/curriculum.ts` — 4 units, seeded generator, **strictly sequential**
  unlocking (unlike music's per-strand unlocking — you cannot match a song to a
  photo of a bird you can't yet recognise).
- `lib/birds/photoResolve.ts` — `{birdCode, role}` references resolved at render
  time, with a fallback chain, so an uncurated bird drops its exercise instead
  of rendering a broken image.
- `app/api/birds/practice` — the null-item attempt-row pattern, so birds grow
  garden plants with no change to garden code.
- Migration `019_birds.sql` — `bird_photo` and `bird_audio`.

Three design points that are load-bearing rather than decorative:

- **Cornell's order is the pedagogy.** Size → bill shape → colour → behaviour →
  habitat, with fine field marks last. A generator that drifted into
  name-the-photo only would make the claim false, so a test asserts the Look
  units really do produce `size_anchor` and `bill_face` exercises.
- **Frequency-first, from a real local source.** Louisville Parks publishes a
  *Guide to Feeder Birds of Kentucky* scoring every Kentucky bird 20 (commonest
  at feeders) to 100 (rarest). That is `localPoints`, and it orders the crews.
  Don't reorder them by intuition.
- **`lib/music/review.ts` moved to `lib/learning/review.ts`.** Nothing in it was
  ever music-specific except the comments. Three call sites were repointed
  rather than leaving a re-export shim.

### Two bugs Cecily hit on the device, and a navigation change
`4a15370` `6a10d49` (+ the walk chooser)

**The painted turtle arrived on every single garden visit.** Session-end picks
arrivals with `pickArrivalForSession`, which is badge-aware and correctly
offered her the turtle. The arrival route then re-validated that queued code
with `computeEligibleSpecies` and did not pass the badges — so it rejected the
species it had just been handed, 400'd, and never reached
`clearPendingArrival`. Confirmed against her row: pending was `painted_turtle`,
she holds the `frog_pond` badge, and the turtle was never journalled.

Fixed three ways, in increasing order of usefulness: the route passes badges;
`ArrivalCard` no longer treats a failed POST as success (it was
fire-and-forget, which is why this was silent); and **`researcherBadgeCodes` is
no longer optional** on `computeEligibleSpecies`. The `= []` default is what
let the omission compile, and `[]` is a legitimate value meaning "she has
earned nothing", so no runtime check could ever have caught it.

**Then it still failed, because there were TWO bugs in the same path and I
stopped at the first.** The badge fix was necessary and not sufficient. With
the modal now honestly reporting failure instead of dismissing, Cecily got an
error and a "try again" — which is better than silence, but still broken.

The second cause: **`SPECIES_CATALOG` is one of only two catalogs here that is
not purely config.** `journal_entry` has a foreign key to the `species` table,
so a species needs a real row before it can be discovered. The three rare
visitors were added to the catalog in `b8de8f8` and the world seed was never
re-run, so the route's `.single()` on `species` found nothing and 500'd — and
again never cleared the pending flag. The rows are seeded now (17/17), and
`ensureSpeciesRow()` heals a missing row from the catalog rather than failing
forever, so a future catalog addition cannot strand a child in the same loop.

The lesson is the diagnosis, not the code: the badge theory fit every observed
symptom perfectly, so I shipped it without walking the rest of the path. A
matching explanation is not a verified one. `tests/world/speciesSeedable.test.ts`
now pins that every catalog entry has what the row needs, that the seed derives
from the catalog, and that the self-heal exists.

**Cecily kept being demoted to Level 2.** `scripts/migrate.ts` has no tracking
table and re-applies every migration on every run. Everyone remembered that
means "make schema changes idempotent"; what was missed is that it also means
**a migration must never write a learner's own state**. `008` carried an
unguarded `update learner set grade_level = 2, default_challenge = 'harder'
where id = '1111…'` — and that id is Cecily. Every migrate run reset her level
and silently flipped her difficulty. An audit found it was the only unguarded
write in all 19 migrations. `tests/world/migrationSafety.test.ts` now reads the
`.sql` files and fails on unguarded writes to learner-state tables, hardcoded
learner uuids, or any `grade_level` write that isn't a null backfill.

**Birds moved out of the garden header into a Nature Walk chooser.** The
signpost at the south edge of the Reading Forest now opens `WalkChooser`
("what shall we look for?") instead of going straight to the plant walk, and
the 🐦 header button is gone. `lib/world/walks.ts` is the extension point:
mushrooms, insects, rocks are **one entry in `WALK_KINDS`**, no new button and
no route plumbing. Seasonal notes live there too, and they are load-bearing
rather than decorative — bird *song* is territorial and mostly March–July,
while *calls* are year-round, so the winter note sends her out listening for
the right thing. The Practice Nook lists the walks flat instead of nesting a
second chooser inside a screen that already asks "what shall we do?".

---

## 2. The bug worth reading this document for

**iNaturalist's sex annotation ids are Female = 10 and Male = 11. I had them
inverted.**

The failure mode is the dangerous kind: *nothing went wrong*. The API returned
plenty of real, research-grade, correctly-licensed photographs — they were
simply all of the opposite sex. The harvest reported success. The contact sheets
rendered. The "female cardinal" folder filled with scarlet males.

Worse: I saw the symptom, and **diagnosed it as bad data**. I wrote in a commit
message that iNat's annotation was unreliable for the American Goldfinch. It was
not. My constant was wrong. It surfaced only because the upload validator
flagged a filename that didn't exist on disk, and even then my first instinct
was to doubt the source rather than the code.

Two things to carry forward:

1. `tests/world/inatClient.test.ts` pins both ids. A wrong constant that returns
   *plausible* results is invisible to every other kind of check.
2. When an external source looks wrong, check your own mapping into it first.
   This is the second time in two handoffs I have blamed something external and
   been wrong — the first was reporting 90 undrawn structures that were all
   drawn.

The reassuring half: **everything chosen by eye was right anyway.** A red bird
got filed as male whatever the folder claimed. Looking at the pictures was what
made the error survivable.

---

## 3. Photo curation cannot be automated, and here is the evidence

iNaturalist ranks by favourites, and favourites reward charm, not teaching. From
the top twelve candidates per species:

- The single most-favourited "photograph" of a Northern Cardinal is **a child's
  crayon drawing on a Christmas card**
- The robin set contains **a piece of clipart**
- The chickadee set has a bird **held in a human hand** and a shot that is
  **mostly a black cat**
- One house finch candidate is **a phone screen recording**, UI still in frame
- The house finch's entire first page is **naked nestlings in a porch light**

A photo where the diagnostic mark is hidden is worse than no photo, because the
mark is the whole lesson. The workflow is therefore:

```
npm run birds:harvest -- --all            # or --bird <code> --per-role 30
npm run birds:sheets                      # numbered contact sheets (needs sharp)
#   → look at every one, write selections.json by hand
npm run birds:validate                    # refuses to upload if ANY bird is bad
npm run birds:upload -- --all
```

`--per-role 30` is for species whose top twelve are unusable — blue jay, mourning
dove and house finch all needed it.

**Do not change `storagePathFor()` in `upload-bird-photos.ts`.** The paths read
redundantly (`perched_1_inat_perched_inat_442088234.jpg`) because the staged
filename already carries its harvest role. Changing the format would mean the
existing rows no longer match, the skip-if-exists check would miss, and a rerun
would upload the whole catalog again as duplicate rows. There is a comment
saying so; this is the second place it is written down.

---

## 4. Findings that cost 30 minutes of research — do not rediscover these

Two agents spent ~30 minutes establishing the following, much of it verified
against live services rather than documentation. **The audio phase is unbuilt,
so all of this is still ahead of whoever picks it up** — but the API key now
exists (§5) and every prediction below has since been confirmed against the
live v3 API with a real key. See §4.1.

**Xeno-canto (the bird song source):**

| Fact | Why it matters |
|---|---|
| **API v2 is dead** — 404s with a pointer to v3 | Every blog post and code sample online uses v2 |
| **v3 requires a free API key** | New requirement, not optional |
| **`key=demo` from their own docs only works for the documented example queries** | Verified across ~10 queries. It looks like a working dev key and isn't |
| Tag-less queries are gone; multi-word values need quotes: `sp:"cardinalis cardinalis"` | v2 syntax silently errors |
| `length` is an **`m:ss` string**, not seconds | Parsing as a number gives nonsense |
| `file` serves the **original** — one verified download was a 26.8 MB 24-bit WAV | Budget gigabytes of staging |
| Licence split: **73.3% CC BY-NC-SA, 25.2% CC BY-NC-ND**, ~1.5% everything else | The whole licensing strategy follows from this |
| Filtering to non-ND still leaves **~10,400 grade-A US song recordings** | Excluding ND costs nothing in practice |
| The website sits behind anti-bot proof-of-work; **the API and `/sounds/` do not** | API harvesting works, HTML scraping doesn't |

**ffmpeg:**

| Fact | Why it matters |
|---|---|
| **libopus rejects 44100 Hz** — needs 48000/24000/16000/12000/8000 | The most likely half-day loss in the audio phase |
| `-ss` and `-t` must come **before** `-i` | Otherwise it decodes the whole file first |
| `highpass=f=200` removes wind and traffic rumble | Large perceived-quality win on field recordings |
| A 6-second mono Opus clip at 48k is **~35 KB** | Whole clip library ≈ 3 MB; storage is a non-issue |

**Licensing conclusions, recorded as reasoning so they aren't re-litigated:**

- **Exclude ND entirely.** Whether a 6-second excerpt is a derivative is
  genuinely ambiguous — Creative Commons declined to resolve it *for audio
  specifically* — but we must normalise and filter field recordings, which is
  unambiguously modification. Enforced by a CHECK constraint in migration 019,
  not trusted to a script.
- **NC is fine here, conditionally.** A homeschool app with no sales, ads or
  sponsorship is outside CC's NonCommercial definition. Encoded as `is_nc` so
  that if the app ever monetises, one query finds everything to pull.
- **ShareAlike does not infect the app.** Only the clip must carry CC BY-NC-SA.
  Code, curriculum and database are unaffected.
- **Macaulay Library is not spec-able** — ticket-gated, no media API, and their
  internal search endpoint is now behind proof-of-work.

**Pedagogy, sourced:**

- Cornell's order is **Size & Shape → Colour Pattern → Behaviour → Habitat**,
  field marks last. Sibley supplies the child's version of "shape": **bill and
  face**.
- **Songs are seasonal; calls are year-round.** If the Listen stage lands in
  November, teach calls. The Carolina Wren is the anchor either way — it sings
  *teakettle* all twelve months.
- **Two content corrections.** "Cheeseburger" is the *Black-capped* Chickadee,
  which does not live in Kentucky — ours is the Carolina, singing four-note
  *fee-bee-fee-bay*. And the Red-bellied Woodpecker's red is on its head;
  Louisville Parks' own guide says it should have been "Red-capped".
- **Evidence at exactly her age:** White, Eberstein & Scott (2018), *PLoS ONE* —
  220 children aged 7–10, 12 garden species, six weeks, 8.7/24 → 16.5/24, with
  the **largest gains in the 7–8 cohort**. Their gains came from installing
  feeders and letting children watch, which is the argument for the life-list
  and garden-residents phases being more than decoration.
- **Honest gap:** all child-facing evidence measures *visual* ID. No study
  establishes an age for reliable *audio* ID. The Listen and Match stages are
  ahead of the literature — build them, then watch how she does.

### 4.1 Confirmed against the live API, 2026-07-26

A real key is now in `.env.local`. A probe run confirmed every field prediction
above: `length` really is an `m:ss` **string** (`"0:29"`), `lic` really is a
full versioned URL (`.../by-nc-sa/4.0/`), `file` really serves the **original**
(a `.wav` in the sample), and `sono.small` really does carry the 10-character
code the derived-mp3 shortcut needs.

Coverage for the ten catalogued birds, filtered to the licence and quality the
plan requires — `q:">C" lic:BY-NC-SA cnt:"United States"`:

| bird | songs | calls |
|---|---:|---:|
| northern_cardinal | 387 | 137 |
| carolina_wren | 290 | 149 |
| american_robin | 244 | 197 |
| house_finch | 142 | 99 |
| tufted_titmouse | 136 | 150 |
| mourning_dove | 90 | 11 |
| white_breasted_nuthatch | 85 | 186 |
| american_goldfinch | 75 | 59 |
| carolina_chickadee | 70 | 118 |
| blue_jay | **24** | **285** |

Ample everywhere, and ~49 of every 50 on the first page are long enough to cut
a 6-second window from.

**The counts independently validated the catalog, which was not the point of
running them.** The blue jay's 24 songs against 285 calls is not a gap — Blue
Jays essentially do not sing; they scream *jay! jay!*, and `birdCatalog.ts`
gives the jay two `call` voices and no song. The mourning dove is the mirror
image (90 songs, 11 calls) because the cooing *is* the song, and the catalog
lists exactly one `song`. Both were judgement calls when written; the archive
agrees with both.

**One gap not yet probed:** the goldfinch's `flight_call` (*po-ta-to-chip*) is a
distinct XC type (`type:"flight call"`) and was not counted. Check it before
relying on it.

---

## 5. Blocked on the user

1. ~~A xeno-canto API key.~~ **Done** — in `.env.local` as `XENO_CANTO_KEY`,
   verified working. Local only; production never calls xeno-canto, so it does
   not belong in Vercel. `.env.local` is gitignored (`.gitignore:12`) and has
   never been committed.

2. **Clip windows must be chosen by ear, and Claude cannot hear audio.** This is
   a hard constraint on the audio phase and it is not the same as the photo
   phase. Photo curation worked because images can be read directly; a
   recording cannot be. Nothing in the pipeline can judge whether the cardinal
   is clear at 0:12 or buried under a lawnmower.

   The agreed shape of the work-around, not yet built:

   - **Auto-propose** each window by signal analysis — band-pass to the range
     birds occupy, then take the loudest contiguous six seconds. In a grade-A
     recording the bird is the loud foreground event, so this is a reasonable
     proxy rather than a guess.
   - **Generate a spectrogram per clip** (`ffmpeg -lavfi showspectrumpic`).
     Readable as an image, so it is a check that *can* be made here — and it
     doubles as a teaching asset, since Cornell's *Bird Song Hero* works by
     matching sound to spectrogram (a whistle is one clean line, a nasal note
     is stacked lines).
   - **An audition page** — all ~60 clips with play buttons, spectrograms, and
     a nudge control to shift a window earlier or later, for a human to confirm
     or correct.

   The audition step is a good thing to do *with* Cecily: deciding which
   cardinal sounds most like a cardinal is most of the lesson.

---

## 6. Still undone, carried forward a third time

Both were promised in the roadmap and in the last handoff. They are listed here
again, which is itself the point.

**6.1 — The device pass.** Now the most overdue item in the project, and the
list has grown: four habitat interiors, the residents on the garden map, the
bird hide, and now the **Walk Chooser**. Two specific risks, both unverifiable
from here:

- The bird hide's photo choice buttons. The grids are two-across because of the
  kana lesson, but a photo is a different shape from a character and nobody has
  seen them at real portrait width.
- `WalkChooser` is an HTML modal, not SVG, so the render-a-still trick used for
  every other new scene **does not work on it**. It has never been seen at all,
  by anyone, in any form.

**6.2 — ~~Cecily's actual progress numbers.~~ Done, 2026-07-26.**

| learner | lifetime correct |
|---|---:|
| Cecily | **1,377** |
| Esme | 242 |

The beyond-trellis gates were set from guesswork at 1400 / 1600 / 1800 / 2000
and turn out to be well placed: **the orchard is ~23 correct answers away** —
about one session. Berry patch a few weeks, herb and moon gardens beyond that.
Esme at 242 is nowhere near any of them, which is the concrete size of the
"something for Esme" gap the roadmap keeps naming.

---

## 7. What comes next in the birds, if nobody says otherwise

Ordered by value, from the spec's §8:

1. **Phase 2 — the song game she actually asked for.** No longer blocked on a
   key; the remaining constraint is §5.2 (windows chosen by ear). Build order:
   harvester → ffmpeg clip pipeline with auto-proposed windows → spectrograms →
   audition page → `bird_audio` rows → Credits page → the Listen and Match
   stages. Start `type:call`, not `type:song`, if it is autumn or winter when
   this is picked up — calls are year-round, songs mostly March–July.
2. **Phase 3 — the world.** A `bird_feeder` habitat, birds in `SPECIES_CATALOG`,
   and they become residents on the garden map for free, because that shipped in
   `6798540`. Tappable residents that play their call is the highest value per
   line of code in the whole spec — it turns the garden into a passive review
   surface. Then the **life list**, which is the actual point: logging birds she
   has really seen out of the window.
3. **Phase 4 — depth.** Crews 3–6, the masterclass units (The Three Copycats,
   Boy and Girl, Tricky Twos), spectrograms, seasonal arrivals, and an Esme tier.

---

## 8. Verification state

| Verified how | What |
|---|---|
| Tests (1023 passing) + typecheck + production build | all logic, all catalogs, all gating, all interiors, the bird generator |
| Live data, not fixtures | all 10 birds resolve; across 40 seeds × 4 units, **0 exercises dropped** for a missing photo; both API routes and `/birds` answer off the production build; images publicly reachable with attribution |
| Rendered SVG stills | every habitat interior, residents placement |
| Contact sheets, by eye | all 192 harvested candidates |
| **On the actual device** | **still nothing since the kana fix** |

The 5 failures in `tests/settings/useAccessibilitySettings.test.ts` are
pre-existing and fail on clean main too.

Tests: `npx vitest run tests/ --no-file-parallelism`, and kill `next dev` first.
Both hangs are real and unrelated to each other.

**New dev dependency:** `sharp`, used only by `scripts/bird-contact-sheet.ts`.
Note `sharp.OverlayOptions` is not importable as a namespace under this
tsconfig — type the composite array structurally instead.
