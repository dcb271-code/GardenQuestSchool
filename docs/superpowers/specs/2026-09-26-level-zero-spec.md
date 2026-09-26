# Level 0 — spec

*2026-09-26. Owner asked for a Level 0 curriculum for Esme, who just
turned four: alphabet and numbers, game-shaped, nothing that needs
reading (everything can be read aloud). Owner chose four games for
V1: the Ladybug Count, Bunny's Basket, Sign Her Name, and Mail She
Can Read. Letter Seeds and the Echo Bird are V2.*

## Why, honestly stated

Two problems. The second is the bigger one.

**There is nothing under the floor.** Math's lowest skill is
`math.counting.to_20` (catalog level 0.1). Reading's two roots,
`dolch_primer` and `cvc_blend` (0.2), both assume a child who can
already decode. No letter names, no letter sounds, no counting to
ten, no numeral recognition. Every item in the catalog has text in
its prompt, and the narrator waits 4.5 seconds before speaking "so a
child who's reading along has time" — the wrong default for a child
who cannot read at all.

**Esme's record is Cecily's.** Her `skill_progress` shows 27 mastered
skills including silent-e, compound words, Dolch second grade and
multiplication arrays (50 attempts). Her sister did those. The planner
believes the data, so this month it served her `compare_2digit`
(17/36) and `add_within_100` (11/27). And the planner is built to
push *away* from the floor: `sessionPlanner` adds `level × 20` to
prefer harder material and `focusPlanner` refuses to lead with
anything 0.35 below the frontier. If Level 0 content existed today,
she would never be shown it.

So this is a band, a rebaseline, and a different kind of session — not
ten more skill rows.

## Design rules

- **Ears, not eyes.** Every prompt is spoken, immediately. On-screen
  text is decoration for the adult; the 🔊 button is the primary
  control and is big.
- **One tap, big targets, at most three choices.** No typing, no
  drag. She is four.
- **No way to lose.** The Munch Patch rule. A wrong tap makes the
  thing wiggle and the narrator says the answer; the round ends one
  way: you finished it.
- **The world asks.** Children do what the world *shows*, not what it
  *permits* (handoff 09-14). Level 0 is not a menu item. A creature
  comes to her.
- **The server is the referee**, wrongness is computed never canned,
  refusals reach her in words, bespoke SVGs viewed twice, US English,
  no clocks. The standing rules.
- **Her sister helping is fine** — on Level 0 content. Cecily reading
  a prompt aloud is scaffolding. Cecily answering multiplication is a
  different child's data. Nothing in V1 records help; it does not
  need to, because there is nothing on Level 0 worth a seven-year-old
  faking.

## The band

### Shape: a curriculum module, not skill rows

Level 0 follows the birds / gems / music pattern (`lib/birds/`,
`lib/gems/`, `lib/music/`): a hand-authored catalog in
`lib/level0/curriculum.ts`, exercises generated from it with a seeded
generator, rounds recorded as **null-item attempt rows** tagged
`response.source`. That pattern already grows the garden with no
special case and cannot accidentally mark a math skill practiced.

No new rows in the `skill` table, no new strands, no seeded items, no
Elo. The pre-skills below are catalog entries in the module. The
graph stays connected conceptually: graduation from Level 0 *is* the
existing Level-1 baseline, which marks `counting.to_20` mastered and
puts `add.within_10` and `cvc_blend` in review.

### Pre-skills

**Numbers** — `pre.count_to_5`, `pre.count_to_10`, `pre.subitize_1_3`,
`pre.numeral_1_5`, `pre.numeral_1_10`, `pre.more_fewer`,
`pre.one_more`.

**Letters** — `pre.letters.own_name` (E, S, M — her name first, the
four highest-value letters there are), `pre.letters.family` (C, O,
the initials of the people who write to her), `pre.letters.shapes`
(O, S, T, X, I — visually unmistakable), then the rest of the upper
case in chunks of five; `pre.letter_sounds.initial`.

Only the number strand and `letters.own_name` have games in V1 (see
below). The catalog carries the whole list so V2 does not redesign
the band.

### Mastery, without Leitner

A pure function `preSkillStatus(attempts)` in the module decides
`new | practicing | mastered` from attempt rows alone: mastered when
the last 20 answers on that pre-skill are ≥ 85% correct across at
least three distinct days. No `skill_progress` writes at Level 0.
The garden page and the parent card call it; nothing else needs to.

### Graduation is a parent's tap

When every V1 pre-skill is mastered, `LearnerCard` shows "ready for
Level 1" beside the level picker. The parent moves her to Level 1
and applies the baseline — the mechanism that exists today. A
four-year-old is not auto-promoted.

### Plumbing

1. **Migration `022_level_zero.sql`**: `learner_grade_level_chk`
   becomes `between 0 and 5`. Idempotent, touches no learner state
   (the warning in `008` stands).
2. **`lib/learner/baseline.ts`**: `LearnerLevel` gains `0`;
   `BASE_ELO_BY_LEVEL[0] = 800`; `masteredSkillsForLevel(0)` returns
   `[]` (today `level <= 1` returns `KINDERGARTEN`, which would lie
   for her); `reviewingSkillsForLevel(0)` returns `[]`. `MIN_LEVEL`
   exported beside `MAX_LEVEL`.
3. **Level 0 has no expeditions.** `/api/plan/candidates` returns the
   Level 0 invitations (below) instead of skill candidates, and the
   lesson entry points on the map (structure stops, compass, focus)
   route to them. This is the seam most likely to leave something
   unreachable — see verification.
4. **Audit `grade_level` falsiness.** `?? 2` survives a 0; any
   `|| 2` or `if (level)` does not. Grep before shipping.
5. **`useNarrator` gains `{ immediate: true }`**, which skips
   `FIRST_PROMPT_DELAY_MS`. Level 0 screens and the read-to-me button
   pass it. Nothing else changes for readers.
6. **Parent card**: level picker accepts 0, labeled "Level 0 —
   letters and numbers, spoken".

### Rebaselining Esme

A one-off script, `scripts/rebaseline-level0.ts <FirstName>`, run by
the owner, never by seed:

- Sets `grade_level = 0`.
- For every `skill_progress` row in `mastered` or `review`, sets
  `mastery_state = 'new'`, appends a `state_transitions` entry
  `{ to: 'new', from: <old>, at, reason: 'rebaseline-level0' }`.
- **Deletes nothing.** Every attempt row, session row and Elo stays.
  Attempts are history; mastery states are the planner's opinion, and
  the opinion is wrong. The transition log makes it reversible by
  hand.
- Prints what it changed and refuses to run twice (the reason string
  is the guard).

Her 51 paintings, 28 letters, seven habitats and the sun quilt are
`world_state` and are not touched.

## The four games

Each game: one bespoke SVG scene, prompts spoken via
`useNarrator(…, { immediate: true })`, a big 🔊 replay, at most three
tap targets, a server route that is the referee, null-item attempts
with `response.source`. Nothing shows a clock, a score, or a streak.

### 1. The Ladybug Count

*Teaches `count_to_5`, `count_to_10`, `subitize_1_3`, `numeral_1_5`,
`numeral_1_10`.*

**Where.** On the garden map, a leaf near her letterbox. When ladybugs
are on it (always, at Level 0) it is the invitation: they crawl a
little. Tap the leaf.

**The loop.** A big leaf, *n* ladybugs (n from the pre-skill's
range). Narrator: *"How many ladybugs? Tap each one."* Tapping a
ladybug says its number aloud — *one, two, three* — and it lifts off.
When the last one flies, the narrator says the total and three big
numerals appear: *"Tap the 4."* Tap it; the numeral grows, the
ladybugs land on it in a row, done. Next leaf.

**Subitizing** is the same screen with the ladybugs already sitting
in a dice pattern and the narrator asking *"How many? Don't count —
just look"* — the numerals appear at once, no tapping ladybugs.
Wrong tap: the numeral wobbles, the ladybugs rearrange into countable
rows, narrator counts them, try again. The child always finishes.

**Accuracy.** The round is `{ seed, preSkill }`; the server regrows
the same leaf (ladybug count, numeral choices) from the seed and
judges each tap. One attempt row per numeral tap, `{ source:
'ladybug', preSkill, asked: 4, chosen: 3 }`. Ladybug taps are not
attempts — counting aloud is the lesson, not the test.

**Progression.** The module picks the pre-skill: count_to_5 until
mastered, then to_10; numeral_1_5 is interleaved once count_to_5 is
practicing; subitize is interleaved every third leaf. Server-side,
from `preSkillStatus`.

**Art.** Ladybugs with visible spots (the spots are for V2 dot
counting), a leaf with veins, numerals drawn as cards the ladybugs
can land on. Looked at twice.

### 2. Bunny's Basket

*Teaches `more_fewer`, `one_more`, and re-uses counting.*

**Where.** The bunny already stands in the garden (tap → the fireside
school, `BunnyTeachModal`). At Level 0 the bunny holds two baskets
instead; the school is Level 1+.

**The loop.** Two baskets of carrots, 1–5 each, never equal in V1.
Narrator: *"Which basket has more carrots?"* Tap. Right: the bunny
hops to it and eats one, crunch. Wrong: the carrots line up in two
rows so the longer row is plain, narrator counts each, try again.

Then **one more**: *"Put one more carrot in this basket."* Tap the
basket; a carrot drops in; narrator: *"Three… and one more is four."*
The child taps the numeral for the new total from three cards. That
is the whole bridge into `add.within_10`, and it is one tap.

**Accuracy.** Server regrows both baskets from `{ seed }`. Attempts:
`{ source: 'basket', preSkill: 'more_fewer', left: 3, right: 5,
chosen: 'right' }` and `{ preSkill: 'one_more', from: 3, chosen: 4 }`.
"More" is decided by the server's own counts, never the client's.

**Art.** Two woven baskets, carrots with leaf tops, the same bunny.
The baskets are side by side, same size, so *more* means carrots,
not basket.

### 3. Sign Her Name

*Teaches `letters.own_name`. Not scored — finished or not finished.*

**Where.** The easel in the art store, after save. Every one of her
51 paintings would have carried this. A dotted E S M E appears at the
bottom corner of the saved picture with a small brush: *"Sign it!"*
Skippable with one tap; the picture is already saved.

**The loop.** Each letter is a dotted guide with numbered start dots
(bespoke, not a font). She traces with a finger. A letter is
*finished* when the stroke passed its checkpoint dots in order — a
connect-the-dots rule, derivable, no handwriting recognition. As each
letter finishes the narrator says its name: *"E… S… M… E — Esme!"*
The signature is burned into the painting's PNG in her own wobbly
line, and shows in the gallery, on the reading-room wall and in her
room upstairs.

**Recording.** One attempt row per finished letter, `{ source:
'signature', letter: 'S' }`, always `correct` — there is no wrong
signature. It grows the garden like any practice.

**Not Esme-specific.** Any child at any level gets the signature step
with their own first name; Cecily and Otto will use it too. The
learner's `first_name` is the guide. Names longer than eight letters
get initials — nobody in this family, but the rule exists.

### 4. Mail She Can Read

*Not a lesson. The highest-value Level 0 feature in the app.*

Cecily and Otto write to Esme constantly and she cannot read a word
of it. A 🔊 on every letter in `LetterScene` — the child's own, the
builder's replies, sibling mail — reads it aloud: *"From Cecily:"*
then the text verbatim. The write screen's recipient chips speak the
name on tap, and the "write back" button says who it answers.

**Verbatim means verbatim.** Keyboard songs are read as the voice
reads them; emoji are read by name, which is delightful and correct.
Never summarize, never skip, never editorialize a child's letter.
Letters longer than the TTS cap (800 chars) are read in chunks with
no gap the child can notice.

**Not gated.** Every profile gets it. It uses `buildTtsUrl` directly
the way `ReadAloudSimple` does — no first-prompt delay, no
auto-play; a letter speaks only when tapped.

**Recording.** None. Reading your mail is not practice.

## What she sees, day one

Her garden, unchanged — habitats, paintings, the sun quilt. Two new
things on the map: ladybugs on a leaf by her letterbox, and the bunny
holding baskets. Her letterbox, with a speaker on every envelope. The
art store, which now asks her to sign. No compass, no expedition, no
structure stop that leads to a lesson she cannot read.

A letter from the builder, read aloud when she taps it, that asks her
one question.

## Verification

- Tests: the seeded generators (same seed, same leaf); the referee
  routes refuse a board they did not grow; `preSkillStatus` mastery
  thresholds; `masteredSkillsForLevel(0)` is empty; the signature
  checkpoint rule; the child-language test over every new string.
- `npm run smoke` after build, with the new routes added.
- **Proof-render every scene and look twice**: ladybugs, baskets,
  the dotted name.
- **The unreachability check**, by hand, as a Level 0 learner in the
  Friends profile: every tappable thing on the garden map either opens
  a Level 0 game or is honest about being for later. Then wipe the
  robot's traces.
- Real-browser walk of read-to-me on a letter with emoji and on a
  keyboard song, listening.
- The rebaseline script run on a copy of Esme's rows first, diffed.

## V2, named so V1 stays small

Letter Seeds (plant a letter, it grows into its word — letter
*sounds*), the Echo Bird (rhyme and initial sound, zero print), dot
counting on the ladybugs' backs, equal baskets ("the same"), lower
case, a Level 0 answer to what Esme wants next — asked in a letter
she can hear.

## Open questions for the owner

1. Level 0 replaces the expedition path entirely. Should the existing
   map structure stops be hidden at Level 0, or shown dimmed with the
   narrator saying "that one is for later"? (Spec assumes dimmed and
   honest.)
2. Otto is Level 1 with 10 lifetime attempts. Level 0 would fit him
   too, and Bunny's Basket in particular. Not proposed here; noted.
