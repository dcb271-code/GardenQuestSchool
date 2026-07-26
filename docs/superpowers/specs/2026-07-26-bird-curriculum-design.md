# Bird Identification — design spec

**Date:** 2026-07-26
**For:** Cecily (7, Level 3), with an Esme path noted where it's cheap
**Asked for:** "a bird identification curriculum — should start with visual recognition and
learning about each, native local birds first, then learning their song, then a game of matching
the song to a photo of the correct bird"

That request is already the right pedagogical sequence, and the research below mostly confirms it.
This spec fills in *which* birds, *where the media comes from*, and *how it plugs into the world we
already have*.

---

## 0. The one-paragraph version

Twenty-odd year-round Louisville birds, grouped into **crews of five**. Each crew is worked through
four stages in order — **Look** (who is this?), **Know** (how does it live?), **Listen** (what does
it say?), **Match** (song → photo). Photos come from the flora pipeline we already built, pointed at
new taxa. Songs come from **xeno-canto**, trimmed to 6-second clips with ffmpeg. Practice writes
null-item `attempt` rows, so birds earn garden seeds like everything else. Later, a bird feeder
habitat lets the birds she has learned actually show up in the garden — and a life list lets her log
the ones she sees out the window, which is the whole point.

---

## 1. What the research changed about the plan

I researched bird pedagogy and audio licensing before writing this. Five findings materially
changed the design; they are the load-bearing parts of this spec.

### 1.1 Shape before colour — but bill-and-face is the child's version of shape

Cornell's **Four Keys to ID** are ordered deliberately: **Size & Shape → Colour Pattern → Behaviour
→ Habitat**, and only *then* fine field marks. Their words: *"when it comes to making
identifications, size and shape are the first pieces of information you should take note of"* and
*"field marks are very important, after you've placed your bird in the right group."*

But raw silhouette is abstract for a 7-year-old. Sibley's *Birding Basics* gives the concrete
version: **focus on the bill and the face.** A child can see "fat cone beak for cracking seeds"
versus "chisel beak for drilling wood" long before they can see body proportions. So the Look stage
teaches shape *as bill-and-face*, then colour, then behaviour.

**Design consequence:** the Look stage is not just "photo → name." It has a `bill_face` and a
`silhouette` exercise before the colour ones, and a `size_anchor` exercise using the standard
birder's ladder — *sparrow-sized / robin-sized / crow-sized*.

### 1.2 Frequency-first — and Louisville already ranked them for us

Sibley: *"Your first 25 or 50 species are the hardest ones to learn"* — focus on the birds in your
own yard. Cornell operationalises this as "Birds Near Me."

The find that matters: **Louisville Parks and Recreation, *Guide to Feeder Birds of Kentucky*
(2018)** narrows Kentucky's 360+ species to the 71 that visit feeders, and then assigns each one a
point value **by actual local feeder frequency — 20 points for the commonest, 100 for the rarest.**

That is a locally-calibrated difficulty ladder with a gamification hook already attached, produced
by the city this family lives in. **We adopt it directly** as `localPoints` on every catalog entry:
crews are ordered by it, and the journal shows the score so a rare sighting feels rare.

### 1.3 Season-gate everything — it dissolves half the hard problems

Fewer than 20 species are true year-round Louisville residents. Several of the classic confusion
pairs separate on the *calendar* alone:

| Pair | Resolved by season |
|---|---|
| House Finch vs Purple Finch | House is year-round; Purple is Oct–May only |
| Chipping vs American Tree Sparrow | Chipping is a summer yard bird; Tree Sparrow is Oct–Mar |
| Carolina vs House Wren | Carolina year-round; House Wren summer only |

**Design consequence:** `season: 'year_round' | 'winter' | 'summer' | 'migrant'` on every bird.
Crews 1–4 are year-round and always available. Crews 5–6 are season-gated against the existing
`lib/world/season.ts` — a winter crew that appears in October is a genuine, delightful event, and it
teaches that birds *move*.

### 1.4 Start with calls, not songs

Songs are seasonal — they're for defending territory and attracting a mate, so they mostly happen
March–July. **Calls are year-round.** If she starts this curriculum in July, songs are fine; if the
Listen stage lands in November, most of what she can actually hear out the window is calls:
chickadee *chick-a-dee-dee-dee*, cardinal *tick*, nuthatch *yank-yank*, jay *jay!*, crow *caw*,
goldfinch *po-ta-to-chip*.

**Design consequence:** every bird carries a `voices[]` array, each tagged `song | call | drum |
flight_call`. The Listen stage teaches **call first, song second**, and a `song_or_call` exercise
makes the distinction explicit ("the song is the long fancy one; the call is the short everyday
one"). The **Carolina Wren is the exception that anchors the whole thing — it sings *teakettle*
all year long**, so it's the first song taught regardless of month.

### 1.5 Two content corrections worth writing down

- **Do not teach "cheeseburger" for the chickadee.** That mnemonic is attached to the *Black-capped*
  Chickadee, which is not a Louisville bird — Carolina Chickadee is the year-round resident here, and
  its song is a four-note *fee-bee-fee-bay*. (Cornell also lists "cheeseburger" under Carolina *Wren*,
  so the phrase is doubly ambiguous. We use *teakettle* for the wren and avoid "cheeseburger"
  entirely.)
- **The Red-bellied Woodpecker is misnamed and she should know it.** The Louisville guide says it
  outright: *"'Red-capped' Woodpecker would be more appropriate."* Its red belly is nearly invisible;
  the red is on its head, which is exactly why people call it a Red-headed Woodpecker — a different,
  much rarer bird. This is a great early lesson that names can lie and field marks can't.

### 1.6 The evidence that this works at exactly her age

White, Eberstein & Scott (2018), *PLoS ONE* — 220 children aged 7–10, eight schools, six weeks, 12
common garden species. Pre-test 8.7/24 → post-test 16.5/24, an 89.6% gain, with **87.6% of children
improving and the largest gains in the 7–8 cohort.** The structure they used: a short ID workshop,
two weeks of baseline observation, then *feeders installed* and four more weeks of watching.

That study is close to a template, and it argues for the world-integration phase (§6) being more
than decoration: the birds arriving is the reward that drove their results.

One honest gap: **all the child-facing evidence measures *visual* ID.** I found no study establishing
an age at which children reliably do *audio* ID, and no head-to-head of mnemonics vs spectrograms vs
tone-training in kids. The Listen and Match stages are ahead of the literature. Build them, then
watch how she actually does.

---

## 2. The catalog

### 2.1 Types — `lib/world/birdCatalog.ts`

```ts
export type BirdSeason = 'year_round' | 'winter' | 'summer' | 'migrant';
export type SizeAnchor = 'sparrow' | 'robin' | 'crow' | 'goose';
export type BillShape  = 'cone' | 'chisel' | 'tweezers' | 'hook' | 'needle' | 'all_purpose';
export type ToneQuality = 'whistle' | 'buzzy' | 'trill' | 'nasal' | 'harsh' | 'flute' | 'chatter';
export type PitchShape  = 'rising' | 'falling' | 'flat' | 'wandering';
export type VoiceKind   = 'song' | 'call' | 'drum' | 'flight_call';

export interface BirdVoice {
  kind: VoiceKind;
  /** 'teakettle-teakettle-teakettle'. NULL is meaningful — see `note`. */
  mnemonic: string | null;
  tone: ToneQuality;
  pitchShape: PitchShape;
  /** The mimic rule: mockingbird 3+, thrasher 2, catbird 1. Null where it doesn't apply. */
  repeats: number | null;
  /** Kid-facing description, and the ONLY teaching hook where mnemonic is null. */
  note: string;
}

export interface BirdData {
  code: string;                 // 'northern_cardinal'
  commonName: string;
  scientificName: string;
  inatTaxonId: number;          // for the photo harvester
  xcQuery: string;              // 'gen:cardinalis sp:cardinalis' for the audio harvester
  emoji: string;
  crew: string;                 // crew code, see §2.3
  season: BirdSeason;
  /** Louisville Parks feeder-frequency points: 20 commonest … 100 rarest. Null = not a feeder bird. */
  localPoints: 20 | 40 | 60 | 80 | 100 | null;
  sizeAnchor: SizeAnchor;
  bill: BillShape;
  /** One-line gestalt, the Cornell "colour pattern" sense — not a diagnostic spot. */
  colourHook: string;
  fieldMarks: string[];
  behaviour: string[];
  habitat: string[];
  facts: string[];              // the "learning about each" the request asked for
  /** Male and female look different — cardinal, goldfinch, bluebird, red-winged blackbird. */
  dimorphic: boolean;
  introduced?: boolean;         // starling, house sparrow — a real lesson
  voices: BirdVoice[];
  confusableWith?: string[];    // drives distractor choice AND the Tricky Twos units
}
```

`confusableWith` does double duty: it picks *hard* distractors in quizzes (a Downy's wrong answer
should be a Hairy, never a cardinal), and it generates the confusion-pair masterclass units.

### 2.2 The birds

`LP` = Louisville Parks feeder-frequency points. All Crew 1–4 birds are year-round residents.

**Crew 1 — The Everyday Five** (unmistakable, at the feeder daily)

| Bird | LP | Hook | Voice |
|---|---|---|---|
| Northern Cardinal | 20 | **Kentucky's state bird.** Male scarlet, female warm buff with a red bill — the first dimorphism lesson | song *birdie-birdie-birdie* / *what-cheer*; call a sharp *tick* |
| Blue Jay | 20 | Blue, crested, loud | screamed *jay! jay!*; **imitates a Red-shouldered Hawk** |
| Mourning Dove | 20 | Long pointed tail; wings *whistle* on takeoff | mournful *coo-OO-oo, oo, oo* — often mistaken for an owl |
| Carolina Chickadee | 20 | Tiny, black cap and bib, white cheek | *chick-a-dee-dee-dee*; song *fee-bee-fee-bay* |
| American Robin | — | Orange breast; runs-stops-runs on the lawn | *cheerily, cheer-up, cheerio* |

**Crew 2 — The Little Gang** (small, travel together in winter flocks)

| Bird | LP | Hook | Voice |
|---|---|---|---|
| Tufted Titmouse | 20 | Grey with a crest and a big dark eye | clear *peter-peter-peter* |
| White-breasted Nuthatch | 20 | **Walks head-first DOWN a tree** — pure behaviour key | nasal *yank-yank* |
| Carolina Wren | 20 | Rusty, bold white eyebrow, tail cocked up | *teakettle-teakettle-teakettle* — **sings all year** |
| American Goldfinch | 20 | **Bright yellow in summer, drab olive in winter** — same bird, different coat | flight call *po-ta-to-chip!* |
| House Finch | 20 | Red forehead and bib; **streaky flanks** | long warbling jumble |

**Crew 3 — Drummers and Big Voices**

| Bird | LP | Hook | Voice |
|---|---|---|---|
| Downy Woodpecker | 40 | **Stubby bill, about a third of the head** | *pik*; a whinny that falls downhill; drums |
| Red-bellied Woodpecker | 20 | Zebra back, red *cap* — the misnamed one (§1.5) | rolling *churr* |
| Northern Flicker | 60 | Brown woodpecker that feeds **on the ground**, ants | *wicka-wicka-wicka*, ringing *kleer* |
| American Crow | 60 | All black, sleek, clever | *caw* — and that's all there is |
| Northern Mockingbird | 60 | Grey, white wing flashes, sings at night | mimic — **repeats each phrase 3+ times** |

**Crew 4 — Newcomers and the Blackbird Problem**

| Bird | LP | Hook | Voice |
|---|---|---|---|
| European Starling | 40 | Short square tail, winter speckles, yellow bill in spring | **introduced** ~1890; a mimic with whistles and rattles |
| House Sparrow | 40 | Chunky; male has a black bib | **introduced**; *"doesn't sing, chirps and chatters"* |
| Common Grackle | 40 | Long keel tail, pale yellow eye, iridescent | *"sounds like an old, rusty swing-set"* — Louisville Parks' own line |
| Song Sparrow | 40 | Streaks converging to a **central breast spot** | 2–4 clear notes, then a jumbled trill |
| Eastern Bluebird | 100 | Blue back, orange breast; **common in fields, rare at feeders** — hence LP100 | soft *chur-lee* |

**Crew 5 — Winter Visitors** (season-gated, ~Oct–Apr)

Dark-eyed Junco (LP20, *"snowbird"*) · White-throated Sparrow (LP20, *Oh sweet Ca-na-da*) ·
Purple Finch (LP40, the House Finch confusion) · Yellow-bellied Sapsucker (LP80) ·
Brown Creeper (LP100, *Trees, beautiful trees*)

**Crew 6 — Summer Visitors** (season-gated, ~Apr–Sep)

Ruby-throated Hummingbird (LP40) · Indigo Bunting (LP40) · Chipping Sparrow (LP40) ·
Gray Catbird (*mew*; says each phrase **once**) · Brown Thrasher (LP80; repeats each phrase **twice**)

### 2.3 Masterclass units — cross-crew, unlock after their members

These are where the skill actually forms.

- **The Three Copycats** — Mockingbird (3+) / Thrasher (2) / Catbird (1). One countable rule solves
  all three mimics. This is the single best rule in the whole curriculum: it's a *rule*, not a
  memorisation, and it works on birds that never sing the same phrase twice.
- **Boy and Girl** — dimorphism: cardinal, goldfinch (seasonal!), bluebird, red-winged blackbird,
  and the Downy's red nape patch. Teaches that one species has several looks.
- **Tricky Twos** — the confusion pairs, one per lesson, each with its *actual* separator:
  Downy/Hairy (**bill length vs head**), House/Purple Finch (**streaky flanks vs plain belly**),
  Titmouse/Nuthatch (**crest vs walks-down-the-tree**), Chipping/Tree Sparrow (**black eyeline vs
  brown, plus the "tie tack" breast spot**), Red-bellied/Red-headed (**barred back vs solid red head**).
- **Say Your Name** — Killdeer, Eastern Phoebe, Whip-poor-will, Bobwhite, Chickadee, Pewee.
- **The Blackbird Problem** — Grackle / Starling / Cowbird / female Red-winged, sorted by tail shape
  and bill.

---

## 3. Curriculum structure

### 3.1 Units are (crew × stage)

Mirrors `lib/music/curriculum.ts` exactly — one flat typed array, per-chain unlocking.

```
crew1_look   →  crew1_know  →  crew1_listen  →  crew1_match
                                                    ↓
crew2_look   →  crew2_know  →  crew2_listen  →  crew2_match
                                                    ↓
                                                  …etc
```

Within a crew, stages unlock in order (this is the sequence the request asked for). A crew's `look`
unlocks when the previous crew's `match` is passed. Masterclass units unlock when every member crew
is complete. A final `mixed_match` boss draws from every bird learned so far.

```ts
export type Stage = 'look' | 'know' | 'listen' | 'match';
export const STAGE_LABEL: Record<Stage, string> = {
  look: 'who is it?', know: 'how it lives', listen: 'what it says', match: 'name that tune',
};
export const STAGE_EMOJI: Record<Stage, string> = { look: '👀', know: '📖', listen: '👂', match: '🎯' };

export interface BirdUnit {
  code: string;            // 'crew1_look'
  title: string;
  crew: string;
  stage: Stage;
  blurb: string;
  teach: TeachPage[];      // same shape as music's, with bird figures
  birdCodes: string[];
  exerciseCount: number;
  outro: string;
  /** Season-gated units are hidden entirely out of season. */
  requiresSeason?: BirdSeason;
}
```

### 3.2 Exercise kinds

```ts
export type BirdExercise =
  // LOOK — Cornell's order: shape, then colour, then marks
  | { kind: 'silhouette';  prompt: string; birdCode: string; choices: string[]; correctIndex: number; hint: string }
  | { kind: 'bill_face';   prompt: string; birdCode: string; choices: string[]; correctIndex: number; hint: string }
  | { kind: 'size_anchor'; prompt: string; birdCode: string; choices: SizeAnchor[]; correctIndex: number; hint: string }
  | { kind: 'photo_name';  prompt: string; photo: BirdPhotoRef; choices: string[]; correctIndex: number; hint: string }
  | { kind: 'name_photo';  prompt: string; birdCode: string; photos: BirdPhotoRef[]; correctIndex: number; hint: string }
  | { kind: 'field_mark';  prompt: string; photo: BirdPhotoRef; choices: string[]; correctIndex: number; hint: string }
  // KNOW
  | { kind: 'behaviour';   prompt: string; choices: string[]; correctIndex: number; hint: string }
  | { kind: 'habitat';     prompt: string; choices: string[]; correctIndex: number; hint: string }
  | { kind: 'season';      prompt: string; choices: string[]; correctIndex: number; hint: string }
  | { kind: 'true_false';  prompt: string; answer: boolean; hint: string }
  // LISTEN
  | { kind: 'mnemonic';    prompt: string; clip: BirdClipRef; choices: string[]; correctIndex: number; hint: string }
  | { kind: 'song_or_call';prompt: string; clip: BirdClipRef; answer: VoiceKind; hint: string }
  | { kind: 'pitch_shape'; prompt: string; clip: BirdClipRef; answer: PitchShape; hint: string }
  | { kind: 'repetitions'; prompt: string; clip: BirdClipRef; answer: number; hint: string }
  | { kind: 'tone';        prompt: string; clip: BirdClipRef; choices: ToneQuality[]; correctIndex: number; hint: string }
  // MATCH — the requested game
  | { kind: 'song_to_photo';    prompt: string; clip: BirdClipRef; photos: BirdPhotoRef[]; correctIndex: number; hint: string }
  | { kind: 'which_did_you_hear'; prompt: string; clips: BirdClipRef[]; targetBirdCode: string; correctIndex: number; hint: string };
```

**`pitch_shape` is a deliberate cross-link to the music room.** She has already completed
`high_and_low`, `same_or_different`, and `hear_step_or_skip` in the `ear` strand. "Does this bird's
song go up, down, or stay flat?" is the identical skill applied to a chickadee. Worth saying so out
loud in the teach page — transfer that a child *notices* is transfer that sticks.

### 3.3 Difficulty ramps inside a unit

`song_to_photo` and `photo_name` start at **2 choices**, go to 3, then 4, and only then start
drawing distractors from `confusableWith`. Same generator, a `choiceCount` that walks up with the
exercise index.

---

## 4. Media pipeline

### 4.1 Photos — clone the flora pipeline

`scripts/naturalist/inatClient.ts` already does exactly the right thing (research-grade only,
`license=cc0,cc-by,cc-by-sa`, vote-ordered, `/large.jpg` rewriting, attribution stripping). Point it
at bird taxa. New npm scripts mirroring the existing four:

```
birds:harvest      tsx scripts/seed-bird-photos.ts
birds:validate     tsx scripts/validate-bird-selections.ts
birds:upload       tsx scripts/upload-bird-photos.ts
```

**Bird photo roles differ from plants** and need their own vocabulary — plants don't have sexes or
flight:

```ts
export type BirdPhotoRole =
  | 'perched'      // the default portrait
  | 'flight'
  | 'male' | 'female' | 'juvenile'
  | 'head'         // for bill-and-face exercises
  | 'back'         // for the zebra-back / streaky-back marks
  | 'silhouette';  // often derived, not harvested — see below
```

`silhouette` photos will rarely exist on iNat. Generate them: take a tier-1 `perched` photo and
render a hard black shape, or draw them as SVG in the same house style as the habitat interiors.
**Drawn silhouettes are the better call** — they're cleaner, they're on-brand, and they sidestep the
question of whether a heavy image filter is a derivative work.

**Curation quality gate.** The flora memory records the lesson: *rank by iNat faves, surface the
art, view every candidate before selecting*. The bird equivalent is stricter, because a bird photo
that doesn't show the diagnostic mark is actively miseducational. **A Downy Woodpecker photo where
the bill is hidden behind a branch is worse than no photo.** Selection must be by eye, per role.

### 4.2 Audio — xeno-canto, and here is exactly what's true

This is the first recorded audio asset in the codebase. Everything today is Web Audio synthesis or
TTS. The findings below were verified live against the API on 2026-07-26 — several of them are traps
that would cost a day each if discovered during implementation.

**The API:**

- **api/2 is dead.** It returns a 404 with a message pointing at v3. Do not build against v2.
- Base URL is `https://xeno-canto.org/api/3/recordings`, and **a free API key is now required.**
- **The documented `key=demo` only works for the documented example queries** and errors on anything
  else. It is not a usable development key.
- Tag-less queries are gone; multi-word values must be quoted: `sp:"cardinalis cardinalis"`.
- Rate limiting was explicitly *lifted* when the key requirement came in. But the Terms still say
  mass automated downloading is *"(actively) discouraged."* A few hundred files at a polite rate,
  once, at build time, is fine — and their terms invite you to just email them if it grows.
- The website is behind an anti-bot proof-of-work wall; **the API and `/sounds/` endpoints are not.**
  So an API-driven harvester works and HTML scraping does not.

**The licensing, which is the part that actually constrains the design.** Measured distribution
across 1,025,621 bird recordings:

| Licence | Share |
|---|---|
| CC BY-NC-SA | **73.3%** |
| CC BY-NC-ND | 25.2% |
| CC BY-SA / CC0 / CC BY-NC / CC BY | 1.5% combined |

Two conclusions:

1. **Hard-exclude ND at ingest** — reject any recording whose licence URL contains `-nd/`. Whether a
   6-second excerpt of an ND work is a "derivative" is genuinely ambiguous (Creative Commons
   declined to resolve it for audio specifically), but the moment we add loudness normalisation and
   a high-pass filter — which we must, for field recordings — it is unambiguously modified, and
   publishing it would violate the licence. Filtering `lic:BY-NC-SA` still leaves **~10,400
   grade-A US song recordings.** There is no reason to go near the ambiguity.
2. **NC is fine for this app, conditionally.** CC defines NonCommercial as *"not primarily intended
   for or directed towards commercial advantage or monetary compensation."* A homeschool app with no
   sales, ads, subscription, or sponsorship is comfortably outside that. Vercel being a company is
   irrelevant. **But this must be encoded as a data flag, not a comment:** every clip row carries
   `is_nc boolean`, so that if the app ever monetises, one query finds everything that has to be
   pulled.

**ShareAlike does *not* infect the app.** Verified against the CC FAQ: a collection containing
SA-licensed works need not itself be SA. Only the *clip* — as adapted material — must be offered
under CC BY-NC-SA 4.0-or-later. App code, curriculum, and database are unaffected. One sub-condition
to honour: don't DRM the clips or impose terms restricting redownload.

**Attribution.** Xeno-canto's canonical citation is `{recordist}, XC{id}. Accessible at
www.xeno-canto.org/{id}.` The CC 4.0 obligations (creator, licence notice + link, source link,
**and an indication that we modified it**) are satisfiable via a single in-app **Credits page** —
CC explicitly allows a hyperlink to a resource containing the required information. Note that some
recordings are CC 3.0 or 2.5, which additionally require the *title*, so store `file-name` too.

Store **the full licence URL verbatim** — do not normalise to "CC BY-NC-SA", because versions vary
(4.0, 3.0, 2.5 all present in a single sample).

**The clip pipeline.** Recording lengths in a measured sample: median 23s, p25 11s, max 329s. Some
are shorter than 6s and must be skipped. Formats are ~78% mp3 / ~21% wav, and `file` serves the
**original** — one verified download was a 26.8 MB 24-bit WAV. Budget for gigabytes of staging.

```bash
ffmpeg -y -ss <start> -t 6 -i input.wav \
  -af "highpass=f=200,loudnorm=I=-16:TP=-1.5:LRA=11,\
afade=t=in:st=0:d=0.15,afade=t=out:st=5.85:d=0.15" \
  -ac 1 -ar 48000 -c:a libopus -b:a 48k clip.opus     # ≈35 KB
```

Gotchas confirmed by actually running it:
- **libopus rejects 44100 Hz.** Must be 48000 (or 24000/16000/12000/8000). This will bite whoever
  implements it if it isn't called out.
- `-ss`/`-t` go **before** `-i` for fast seeking.
- `highpass=f=200` removes wind and traffic rumble and is a big perceived-quality win on field
  recordings. Ship an `.m4a` AAC fallback for older Safari.
- Verify real duration with `ffprobe`; the API's `length` field is an `m:ss` **string**, not seconds.

Total storage: ~40 KB/clip × ~25 species × 3 voices ≈ **3 MB**. Trivial.

**Clip selection must be by ear, and that is the expensive part.** The `-ss` start offset can't be
chosen automatically with any confidence — field recordings have wind, voices, car doors, and long
silences. The manifest carries `clipStartSec` per selection and a human sets it. (The API's
`annotation-set` field looks purpose-built for finding a clean window, but coverage is unmeasured —
worth checking before relying on it.)

**Spectrograms.** Cornell's *Bird Song Hero* teaches song by matching sound to spectrogram, because
it *"enlists your visual brain"* — and crucially it makes timbre into visible geometry (a whistle is
one clean line; a nasal sound is stacked lines). Xeno-canto returns spectrogram PNGs in the `sono`
field, but **those are for the full recording and won't match our 6-second window.** Generate our own
from the trimmed clip with `ffmpeg -lavfi showspectrumpic`. This is a Phase 4 nice-to-have, but it's
cheap once the clips exist, and it doubles as the accessibility fallback (§7).

### 4.3 Fallback sources, ranked

1. **Xeno-canto** filtered to non-ND — the only source with song/call typing, A–E quality grading,
   and length filtering. Primary.
2. **iNaturalist** with `sound_license=cc0,cc-by,cc-by-sa` — note this is a *separate parameter* from
   `license`. ~2,000 freely-licensed sound observations for a common species, no key needed, and we
   already have the client. Genuinely free licences, but no song/call typing and no quality rating,
   so heavier curation.
3. **Wikimedia Commons** — pre-filtered to derivative-safe licences by policy, clean metadata API.
   Thin coverage.
4. **NPS / USFWS public domain** — perfect licence, ~25 species total. Backfill only.
5. **Macaulay Library** — best recordings in the world, but ticket-gated with a human in the loop and
   **no media API**. Manual fallback only; not spec-able.
6. **Internet Archive** — licensing unverifiable. Skip.

---

## 5. Storage, schema, and progress

### 5.1 Migration `019_birds.sql`

Two content tables, service-role write, public read — same shape as `flora_photo` in migration 011.

```sql
create table if not exists bird_photo (
  id uuid primary key default gen_random_uuid(),
  bird_code text not null,
  role text not null,
  tier integer not null default 1,
  storage_path text not null,
  source text not null,                    -- 'inat' | 'wikimedia'
  source_url text not null,
  photographer text,
  license_code text not null,
  alt_text text not null,
  created_at timestamptz not null default now(),
  constraint bird_photo_role_valid check (
    role in ('perched','flight','male','female','juvenile','head','back','silhouette')),
  constraint bird_photo_tier_valid check (tier between 1 and 3),
  constraint bird_photo_license_valid check (license_code in ('cc0','cc-by','cc-by-sa'))
);

create table if not exists bird_audio (
  id uuid primary key default gen_random_uuid(),
  bird_code text not null,
  kind text not null,                      -- 'song' | 'call' | 'drum' | 'flight_call'
  storage_path text not null,              -- the 6s opus clip
  fallback_path text,                      -- .m4a for older Safari
  spectrogram_path text,                   -- generated; nullable until Phase 4
  source text not null default 'xeno_canto',
  source_id text not null,                 -- 'XC1154497'
  source_url text not null,
  recordist text not null,
  license_url text not null,               -- VERBATIM, versions vary
  is_nc boolean not null,                  -- pull these if the app ever monetises
  original_title text,                     -- CC 3.0/2.5 require the title
  locality text, recorded_on date,
  clip_start_sec numeric not null,
  clip_len_sec numeric not null,
  modifications text not null,             -- 'trimmed to 6s, normalised, high-pass 200Hz, opus'
  created_at timestamptz not null default now(),
  constraint bird_audio_kind_valid check (kind in ('song','call','drum','flight_call')),
  constraint bird_audio_not_nd check (license_url not like '%-nd/%')
);
```

That last constraint is the licensing rule enforced in the database rather than trusted to a script.

Buckets: `bird-photos` and `bird-audio`, both public, mirroring `flora-photos`.
`next.config.mjs` already allows `*.supabase.co` public storage paths, so photos need no config
change; audio is served via plain `<audio src>` and isn't subject to the image config at all.

### 5.2 Progress — `world_state.garden` jsonb, no migration

Following the established convention:

- `bird_units: string[]` — completed unit codes
- `bird_review: ReviewMap` — **import `lib/music/review.ts` directly.** That file is fully generic
  (`recordResult`, `BOX_DAYS {1,3,7,16,35}`, `badgeFor`); only its comments mention music. Do not
  duplicate it — move it to `lib/learning/review.ts` and re-export from the music path so nothing
  breaks.
- `bird_lifelist: Record<string, { firstSeen: string; count: number; note?: string }>` — §6.2

### 5.3 Practice API — `app/api/birds/practice/route.ts`

Copy `app/api/music/practice/route.ts` verbatim and change three strings. The pattern that makes
this cheap:

```ts
const rows = results.map(r => ({
  learner_id, session_id: null, item_id: null,
  outcome: r.correct ? 'correct' : 'incorrect',
  response: { source: 'birds', unit: unit.code, stage: unit.stage, exercise: r.exerciseKind },
  time_ms: r.timeMs ?? null, retry_count: r.retries,
}));
await db.from('attempt').insert(rows);
```

`getCumulativeCorrect()` counts by `learner_id` + `outcome` only, so **birds feed garden seeds with
zero changes to garden code**, while attempt→item→skill queries skip null-item rows and maths/reading
skill state stays uncorrupted.

Virtue grants: `'curiosity'` on unit completion (matching Japanese), and `'noticing'` on a life-list
entry — noticing is exactly the virtue for spotting a bird out of the window.

---

## 6. World integration

### 6.1 The bird feeder habitat

Add `bird_feeder` to `HABITAT_CATALOG` — the eighth habitat, gated on a maths skill like the others.
Then add the Crew 1–2 birds to `SPECIES_CATALOG` with `habitatReqCodes: ['bird_feeder']`.

Everything downstream then works for free, because it was built last week:

- `computeEligibleSpecies` / `pickArrivalForSession` → birds arrive after focus sessions
- `placeResidents` → **learned birds appear on the garden map** beside the feeder
- `ArrivalCard` already routes anything matching `/bird/` to the `'fly'` animation
- A `BirdFeederInterior` following the shape of the other five: themed skill stop, residents,
  "not yet found" slots

The art precedent already exists too — there's a birdhouse in `BeyondBackgrounds.tsx`, a bird bath in
`QuadrantBackgrounds.tsx`, and an ambient `Bird()` in `AmbientLayer.tsx`.

**Resident birds should be tappable to play their call.** That's the highest-value single feature in
this whole spec per line of code: it turns the garden into a passive review surface she'll hit
dozens of times without it feeling like practice.

### 6.2 The life list — the actual point

Everything above is preparation for this. A **life list** where she logs birds she has *actually
seen*, out the window or on a walk:

- Entry from the garden and from the `/birds` home
- "I saw one!" → date, optional note, optional which-yard
- The journal shows her list sorted by the Louisville rarity points, so a Brown Creeper (100) sits
  above a cardinal (20) and *feels* like an event
- First sighting of a species grants the `'noticing'` virtue gem (1/day cap already enforced)
- Species she has logged get a small mark in the curriculum, because "I have met this one" is a
  different and better kind of knowing than "I passed the quiz"

The PLoS ONE study is the argument: their gains came from installing feeders and letting children
*watch*, not from instruction. The app should be the field guide, not the whole experience.

### 6.3 Entry points

Follow the music precedent: a route at `/birds`, reached by a 🐦 button in the garden header next to
🎹, plus a door from the bird feeder interior once that exists. Season-gated crews simply don't
render out of season.

---

## 7. Constraints that must not be forgotten

**Touch targets.** The kana bug is the precedent: Cecily could not reliably tap between four
characters across at portrait width. **No four-across grids.** Photo choice grids are **2 columns
in portrait**, images at least 140px tall. This applies to `song_to_photo` most of all — it's the
headline feature and it's four photos by default. Ramp 2 → 3 → 4 as *rows*, never as a 4-wide row.

**Audio needs a visual fallback.** Any exercise whose prompt is a sound must remain answerable — or
at least explicable — with sound off: show the mnemonic text and (Phase 4) the spectrogram. Sound
can be off for device reasons, accessibility reasons, or because a sibling is asleep.

**iOS autoplay is already solved** — `components/shared/AudioUnlocker.tsx` plays a silent data-URI
MP3 on first tap and is mounted in the root layout. Bird clips inherit that unlock. Do not add a
second unlock mechanism.

**Preload the clip before showing the question.** A 4-second stall between "listen" and hearing
anything will read as broken. Prefetch the next exercise's clip during the current one, the way
`prefetchJapanese` does for TTS.

**Never let a wrong answer end the question.** Both existing modules re-ask and show the hint on a
wrong tap; only a first-try correct counts for accuracy. Match that.

**Anti-farming.** Garden economy memory: the failure mode is grinding easy content for seeds. Bird
units are one-pass-completable and then live on Leitner review, so re-grinding a completed unit
yields review value but shouldn't yield unbounded seeds. Cap or decay repeat-completion credit, the
way trellis gating uses mastery rather than counts.

**Tests run with `--no-file-parallelism`** or the suite hangs, and `next dev` must not be running.

---

## 8. Phasing

**Phase 1 — Visual (no audio, no legal surface).** `birdCatalog.ts` with Crews 1–2 · photo
harvest/curate/upload · migration 019 · `/birds` route with Look + Know stages · practice API ·
garden header button. *Ships the first half of the request and is verifiable entirely with tests and
rendered stills.*

**Phase 2 — Audio.** Xeno-canto harvester · ffmpeg clip pipeline · `bird_audio` + Credits page ·
Listen stage · **Match stage — song → photo, the requested game.** *Blocked on an API key (§9).*

**Phase 3 — World.** `bird_feeder` habitat and interior · birds as species and residents · tappable
residents that sing · **the life list.**

**Phase 4 — Depth.** Crews 3–6 · masterclass units (Copycats, Boy and Girl, Tricky Twos) ·
spectrograms · seasonal arrivals · an Esme tier (Crew 1 only, two-choice, colour-and-name, no audio
discrimination).

Phase 1 is a real deliverable on its own: she'd be able to identify twenty Louisville birds by sight,
which is more than most adults.

---

## 9. Decisions needed before Phase 2

1. **A xeno-canto account and API key.** Free, but it requires registering an account, which is
   yours to do — I won't create accounts. Register at xeno-canto.org, verify the email, and the key
   is on the account page. Their docs ask that apps use an app-specific key rather than a personal
   one. Put it in `.env.local` as `XENO_CANTO_KEY` (build-time only; it never reaches the browser).
2. **Confirm the non-commercial commitment.** ~73% of xeno-canto's catalogue is NC. That's fine for a
   family homeschool app, and the `is_nc` flag means it's reversible — but if there's any chance this
   becomes something sold or ad-supported, say so now and we restrict to the ~1.2% freely-licensed
   slice or lean on iNaturalist instead.
3. **Clip curation is a listening job.** Choosing the 6-second window per recording can't be
   automated reliably. Roughly 25 birds × 2–3 voices ≈ 60 clips to audition. I can pre-filter to
   grade-A recordings and propose windows; someone has to confirm them by ear. Worth knowing that
   cost before Phase 2 starts — it may be a nice thing to do *with* Cecily.

---

## 10. Sources

Cornell Lab: [Four Keys to ID](https://www.allaboutbirds.org/news/four-keys-to-bird-identification/) ·
[How to Learn Bird Songs and Calls](https://www.allaboutbirds.org/news/how-to-learn-bird-songs-and-calls/) ·
[Basic Parts of a Bird Song](https://www.allaboutbirds.org/news/parts-bird-song-rhythm-repetition-pitch-tone/) ·
[30 Mnemonics](https://www.allaboutbirds.org/news/30-mnemonics-help-remember-bird-calls/) ·
[Bird Song Hero](https://academy.allaboutbirds.org/bird-song-hero/) ·
[Project FeederWatch — Tricky Bird IDs](https://feederwatch.org/learn/tricky-bird-ids/)

Sibley: [Advice to Beginning Birders](https://birdnote.org/podcasts/birdnote-daily/advice-beginning-birders-david-sibley) ·
[Birding Basics](https://www.sibleyguides.com/about/sibleys-birding-basics/)

Local: [**Guide to Feeder Birds of Kentucky**](https://louisvilleky.gov/sites/default/files/2021-05/bird-book_2018.pdf),
Louisville Parks and Recreation, 2018 — *the primary local source; frequency points, field marks, and
seasonal windows throughout §2 come from here* ·
[Beckham Bird Club](https://www.beckhambirdclub.org/) (Louisville, weekly field trips since 1935)

Audio: [xeno-canto API v3](https://xeno-canto.org/explore/api) ·
[search tags](https://xeno-canto.org/help/search) · [Terms](https://xeno-canto.org/about/terms) ·
[CC FAQ](https://creativecommons.org/faq/) ·
[CC BY-NC-SA 4.0 legal code](https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode.en)

Research: White, Eberstein & Scott (2018), [Birds in the playground](https://pmc.ncbi.nlm.nih.gov/articles/PMC5839573/),
*PLoS ONE* 13(3) · Husby & Hristov (2024), *Journal of Biological Education* 59(4) ·
[Great Backyard Bird Count](https://www.birdcount.org/)

*Note on the Louisville guide: it uses 2018-era taxonomy ("Rock Dove", *Carduelis tristis*). Its
frequency judgements and field marks are sound; update the names against current eBird taxonomy when
authoring the catalog.*
