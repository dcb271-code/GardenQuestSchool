# Handoff — 2026-07-26 (second)

Continues [`2026-07-26-handoff.md`](./2026-07-26-handoff.md), which covered
`0262c2d`…`3e42760`. This one covers `e73b768`…`cf1cf76` — two feature
commits — and then hands over a **specced but unbuilt** bird identification
curriculum.

Read the earlier handoff first if you haven't. Its §2 (patterns) and §3
(gotchas) are still accurate and still the fastest way to avoid wasting a day.

---

## 1. What shipped since the last handoff

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
residents who live there, and "not yet found" slots for the ones who don't
yet. The route dispatch collapsed to a `SIMPLE_INTERIORS` lookup.

Two things worth keeping:

- **A test drove the butterfly bush into existence.** The invariant "every
  habitat a rare visitor lives in can be visited" failed on `butterfly_bush`
  — the luna moth is the reward for the hardest content in the game and its
  only home had no interior. Building it was the right fix; weakening the
  test would have hidden a real dead end.
- **The test then flipped from pinning a gap to asserting an invariant.** It
  used to enumerate which habitats still lacked interiors. It now asserts
  that every species-attracting habitat *has* one, **and** the inverse — that
  anything without an interior attracts no species, because the route calls
  `notFound()` for it. `operations_cave` sits outside both on purpose; it's
  the maths cave at the foot of the mountain, not somewhere a creature lives.

**Bug fixed in passing:** `ArrivalCard` offered "step inside" without checking
`hasHabitatInterior()`, so a first-for-habitat arrival at one of the four
interior-less habitats hit a real 404.

---

## 2. Queued and unbuilt: the bird curriculum

**Spec:** [`2026-07-26-bird-curriculum-design.md`](./2026-07-26-bird-curriculum-design.md)

Cecily asked for bird identification: visual recognition first, then learning
about each bird, then their songs, then a game matching a song to the right
photo. That sequence turns out to be what Cornell teaches, so the spec keeps
it and fills in which birds, where the media comes from, and how it plugs into
the world.

**Nothing has been built.** No code, no catalog, no migration. The spec is the
deliverable so far.

### 2.1 Findings that cost 30 minutes of research — do not rediscover these

This is the highest-value part of this document. Two agents spent ~30 minutes
and ~250k tokens establishing the following, several of it verified against
live services rather than documentation.

**Xeno-canto (the bird song source):**

| Fact | Why it matters |
|---|---|
| **API v2 is dead** — returns 404 with a pointer to v3 | Every blog post and code sample you'll find online uses v2 |
| **v3 requires a free API key** | New requirement; not optional |
| **`key=demo` from their own docs only works for the documented example queries** | Verified by testing ~10 queries. It looks like a working dev key and isn't |
| Tag-less queries are gone; multi-word values need quotes: `sp:"cardinalis cardinalis"` | v2 syntax silently errors |
| `length` is an **`m:ss` string**, not seconds | Parsing it as a number gives nonsense |
| `file` serves the **original** — one verified download was a 26.8 MB 24-bit WAV | Budget gigabytes of staging, not megabytes |
| Licence split: **73.3% CC BY-NC-SA, 25.2% CC BY-NC-ND**, ~1.5% everything else | The whole licensing strategy follows from this |
| Filtering to non-ND still leaves **~10,400 grade-A US song recordings** | Excluding ND costs nothing in practice |
| The website is behind an anti-bot proof-of-work wall; **the API and `/sounds/` are not** | API harvesting works, HTML scraping doesn't |

**ffmpeg:**

| Fact | Why it matters |
|---|---|
| **libopus rejects 44100 Hz** — needs 48000/24000/16000/12000/8000 | The single most likely half-day loss in this whole project |
| `-ss` and `-t` must come **before** `-i` for fast seeking | Otherwise it decodes the whole file first |
| `highpass=f=200` removes wind and traffic rumble | Large perceived-quality win on field recordings |
| A 6-second mono Opus clip at 48k is **~35 KB** | Whole clip library ≈ 3 MB. Storage is a non-issue |

**Licensing conclusions (reasoning recorded so it isn't re-litigated):**

- **Exclude ND entirely.** Whether a 6-second excerpt is a "derivative" is
  genuinely ambiguous — Creative Commons declined to resolve it *for audio
  specifically* — but we must loudness-normalise and high-pass filter field
  recordings, which is unambiguously modification. Enforced by a DB CHECK
  constraint, not trusted to a script.
- **NC is fine here, conditionally.** CC defines NonCommercial as "not
  primarily intended for or directed towards commercial advantage." A
  homeschool app with no sales, ads, or sponsorship is comfortably outside it;
  Vercel being a company is irrelevant. Encoded as an `is_nc` column so that
  if the app ever monetises, one query finds everything to pull.
- **ShareAlike does not infect the app.** Verified against the CC FAQ: a
  collection containing SA works need not itself be SA. Only the *clip* must
  carry CC BY-NC-SA. App code, curriculum, and database are unaffected.
- **Macaulay Library is not spec-able.** Best recordings in the world, but
  ticket-gated with a human in the loop and no media API. Their internal
  search endpoint is now behind the same proof-of-work wall — an unambiguous
  "do not automate this."

**Pedagogy, sourced:**

- Cornell's order is **Size & Shape → Colour Pattern → Behaviour → Habitat**,
  and field marks come *after* placing the bird in a group. Sibley supplies
  the child's version of "shape": **bill and face**.
- **Louisville Parks publishes a *Guide to Feeder Birds of Kentucky*** scoring
  every bird 20 (commonest at KY feeders) to 100 (rarest). A locally
  calibrated difficulty ladder with a gamification hook, published by this
  family's own city. The spec adopts it directly as `localPoints`.
- **Songs are seasonal; calls are year-round.** If the Listen stage lands in
  November, teach calls. The Carolina Wren is the anchor either way — it
  sings *teakettle* all twelve months.
- **Two content corrections.** "Cheeseburger" is the *Black-capped* Chickadee,
  which is not a Louisville bird — ours is the Carolina, singing four-note
  *fee-bee-fee-bay*. And the Red-bellied Woodpecker's red is on its head;
  Louisville Parks' own guide says it should have been called "Red-capped."
- **Evidence at exactly her age:** White, Eberstein & Scott (2018), *PLoS ONE*
  — 220 children aged 7–10, 12 garden species, six weeks. 8.7/24 → 16.5/24,
  87.6% of children improved, **largest gains in the 7–8 cohort**. Their gains
  came from installing feeders and letting children *watch*, which is the
  argument for the life-list and garden-residents phases being more than
  decoration.
- **Honest gap:** all child-facing evidence measures *visual* ID. No study
  establishes an age for reliable *audio* ID, and no head-to-head of mnemonics
  vs spectrograms vs tone-training in children exists. The Listen and Match
  stages are ahead of the literature. Build them, then watch how she does.

### 2.2 Blocked on the user

1. **A xeno-canto API key.** Free, but requires registering an account —
   that's theirs to do, not mine. Goes in `.env.local` as `XENO_CANTO_KEY`,
   build-time only.
2. **Confirming the app stays non-commercial**, since ~73% of the catalogue is
   NC-licensed. Reversible via the `is_nc` flag, but better decided up front.
3. **Clip windows must be chosen by ear.** ~60 clips (25 birds × 2–3 voices).
   Can't be automated reliably — field recordings have wind, voices, car
   doors, long silences. Might be a good thing to do *with* Cecily.

Phase 1 (visual only, ~20 birds by sight) is blocked on none of this and is a
real deliverable on its own.

### 2.3 A refactor the spec depends on

`lib/music/review.ts` is **fully generic** — `recordResult`, `BOX_DAYS`,
`badgeFor` know nothing about music; only the comments mention it. Birds want
the same Leitner scheduling. **Move it to `lib/learning/review.ts` and
re-export from the music path** rather than duplicating it. This is the first
time a second subject has wanted an existing subject's machinery, and copying
it would be the wrong precedent to set.

---

## 3. Still undone, carried forward again

Both of these were promised in the last handoff and in the roadmap. Neither has
happened. They are listed third because they keep getting listed third, which
is itself the problem.

**3.1 — The device pass.** Everything shipped since 2026-07-19 has been
verified by tests and rendered SVG stills only. The sole exception is the kana
grid fix, and only via Cecily's report. **Five brand-new full-screen scenes**
(four habitat interiors plus residents on the garden map) have never been
touched on the Cozyla. This is the largest risk in the codebase.

**3.2 — Cecily's actual progress numbers.** The beyond-trellis gates
(1400/1600/1800/2000 lifetime-correct) and the Japanese unlock pacing are still
set from guesswork. Nobody has checked where she actually sits, so it is
unknown whether the orchard is days away or months. This is a single query.

---

## 4. Verification state

| Verified how | What |
|---|---|
| Tests (635) + typecheck + build | all logic, all catalogs, all gating, all interiors |
| Rendered SVG stills | every interior including the two newest, residents placement |
| **On the actual device** | **still nothing since the kana fix** |
| Live service checks | xeno-canto API v3 behaviour, licence counts, ffmpeg pipeline (run end to end, output sizes measured) |
| **Not verified at all** | anything in the bird spec that isn't in the row above — no bird code exists yet |

Tests: `npx vitest run tests/ --no-file-parallelism`, and kill `next dev`
first. Both hangs are real and unrelated to each other.
