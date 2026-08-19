# The Crow's Picture Cache — spec

*2026-08-19. Designed WITH the owner across a working session; every
rhyme and anchor below was individually approved, two were rejected
and rebuilt (the tadpole stories, the feeler story), and the design
rule that survived contact is recorded first because it is the whole
point.*

## The rule everything obeys

**The answer must be DERIVABLE from the scene.** A mnemonic where the
story and the number are merely adjacent swaps its bindings under
pressure ("two tadpoles hatched at 81 — why not 48?"). Every anchor
below is one of: a countable arrangement IN the picture, a true fact
about the animal's body or life, a shape the characters' own parts
construct, or arithmetic itself. When she blanks on a rhyme, the
derivation is still there — the mnemonic degrades into *thinking*,
never into noise.

## Why this, why now

The owner's brief: she is not ready for division or order of
operations; she needs addition speed, multi-digit addition, and the
times tables — with strong visual mnemonics, not more drills. Her
data agrees: every multiplication fact she misses involves 6, 7, 8
or 9, and 27 recent sessions of table-grinding have not moved it.
Retention is the gap, and retention is what mnemonics are for.

This spec is the first of three animals agreed in the brainstorm:

1. **The crow** (this spec) — the stubborn six facts + the nines.
2. **The ant hill** (companion spec, later) — carrying/regrouping
   for 3–4-digit addition: ten one-ants bundle and CARRY over the
   column wall. `math.add.within_1000` exists; 4-digit is a thin
   new skill.
3. **The hummingbird** (companion spec, later) — `add.fluency_within_20`
   as daily nectar rounds. Speed as flavor, NEVER a visible clock
   (the workshop's no-timer rule stands).

## The character alphabet

Four garden citizens whose SHAPE is their digit, with the digit
ghosted into the body in every drawing, forever, so the identity is
renewed on every sighting:

| Digit | Character | Why the shape works | Where she knows it from |
|---|---|---|---|
| 6 | the Snail | shell spiral is a 6 | the log pile |
| 7 | the Flag | letterbox flag in profile is a 7 | HER letterbox |
| 8 | the Bee | head + body, two stacked circles | the bee hotel |
| 9 | the Tadpole | round head, curling tail | the frog pond |

The keeper is **the Crow** — because corvids genuinely cache
thousands of seeds and remember every hiding spot. The picture wall
is the crow's cache. (Checkable, like everything here; it is also
cousin to Luna's crows-remember-faces feeding fact.)

## The six scenes

Only the 6–8 upper square needs pictures (six facts). The nines get
the finger trick; everything smaller is Pip's splitting work.

**6×6 = 36 — the growing shell.** True biology: snail shells add
whorls as they age. The little snail's shell hasn't finished curling
— still a **3** (a 3 is literally an unfinished 6). Grandma's is a
full **6**. Small-before-big gives the left-to-right read.
> *"The little snail's shell hasn't curled all the way — still a
> three! Grandma's is a six. Thirty-six."*

**6×7 = 42 — snail mail.** A week is seven days — not a story
choice, a fact. The snail promises delivery in six weeks. The
calendar in the picture is six rows of seven days — secretly the
array — with day 42 circled and the letterbox flag popping up.
> *"Six weeks of seven days it's due — snail mail comes on day
> forty-two."*

**6×8 = 48 — the honeycomb.** The garden's two HOUSE animals: the
snail carries one house; the bee builds hundreds. A honeycomb cell
has six walls — that is just what bees build. Eight rooms, six walls
apiece: count them, 48. The scene IS the multiplication; no digit
assembly, no reversal hazard.
> *"Eight honey rooms, six walls apiece — forty-eight walls, and the
> snail signs the lease."*

**7×7 = 49 — the star quilt.** Flags have stars; the real flag has
fifty. The two little flags sew themselves a star quilt to become a
real flag — seven rows of seven — and hold it up beside the pole:
**one star short of fifty.** The 7×7 grid is countable in the
picture; 49 = 50 − 1 is the useful way to hold 49 forever; the
missing-star hole glows at the center.
> *"Seven rows of seven stars shine — one short of fifty:
> forty-nine."*

**7×8 = 56 — the famous fence.** Posts numbered 5, 6, 7, 8; the flag
stands on post 7, the bee on post 8; the answer is reading the fence
from the start. **The crow must say out loud that this works exactly
once in the whole times table** — otherwise a sharp child derives
6×7 = 45 from posts 4-5-6-7. One-of-a-kind is itself memorable, and
the inoculation is honest math.
> *"Five, six, seven, eight — read the fence and don't be late:
> fifty-six is seven times eight."*

**8×8 = 64 — bee anatomy.** A bee has six legs and four wings. True.
Legs are DOWN, wings are UP; the count reads bottom-to-top, and the
rhyme lands the ones digit on the final rhyme so a mangled recall
self-corrects.
> *"Six legs on the floor, four wings that soar — the bee counts up:
> sixty-four."*

**Every nine — the finger trick.** Ten fingers up, fold the one
you're multiplying: fingers left of the fold are tens, right are
ones. 7×9 → fold the 7th → 6|3. Taught as "the tadpole hides behind
one finger."
> *"Ten fingers up, fold one down — tens on the left, ones on the
> right, the answer's found."*

## Design rules (enforced, not aspirational)

- **Scenes read left to right, tens first.** Where the number is
  counted whole (quilt, honeycomb) there is no order at all — the
  strongest kind.
- **The rhyme's final number word carries the ones digit.**
- **One picture per fact-pair.** 8×7 summons the same scene as 7×8 —
  and she is TOLD this arithmetic: six pictures cover twelve
  orderings; the whole stubborn zone is six memories.
- **Both directions in practice.** "7×8?" is half the job; the crow
  also deals the product — "56: whose picture is this?" — and asks
  "which two live in the fence story?" so recall binds both ways.
- **No timers, no streaks** (house rules, unchanged).

## Where it lives, what it touches

A **crow perched at Pip's workshop** (`/times-table`) — a sixth tool
tab: `learn | split | practice | cards | chart | crow`. Pip teaches
structure; the crow keeps memories. Different jobs, said that way.

- Teach mode: meet each scene with its rhyme spoken aloud (the
  workshop's speech tooling, degrading silently like Pip's).
- Practice mode: `multiplicationFactAccuracy` (exists) picks which
  pictures she sees most — worst facts first, exactly like Pip's
  Practice. A wrong answer or a help tap fades the PICTURE in, not
  the number: recalling the scene is the act.
- A fact that holds across spaced visits turns its frame gold on the
  cache wall. Recording goes through the same attempt pipeline as
  the workshop's Practice tool, so the chart, the larder and the
  mastery stones all see crow work with no special case.
- State: `world_state.garden.crow_cache` (jsonb convention, no
  migration) — per-fact teach-seen + gold-frame dates.

## Art rules

- Each character's digit is ghosted into its body in EVERY drawing.
- The six scenes are load-bearing curriculum: **proof-render and
  LOOK, with one explicit check per scene** — the unfinished shell
  must read as a 3, the crossed posts must read as their numerals,
  the honeycomb walls and quilt stars must be countable, the bee's
  legs six and wings four. A scene whose digits do not read is a
  promise broken; iterate until they do.
- The crow is drawn as a crow (all-black, heavy bill, intelligent
  eye) — not a raven, not generic-bird.

## Phases

1. Characters + the six scenes + rhymes, teach mode, on the wall.
2. Practice mode, both directions, gold frames, fact-accuracy wiring.
3. The finger trick as its own teach page (hands art, step by step).
4. (Separate specs) the ant hill's carrying; the hummingbird's
   nectar rounds.

## Explicitly out

- No new skills needed — this serves `math.multiply.facts_to_10`.
- No division, no order of operations (owner's explicit boundary).
- No coin/stone/gem rewards. Mastery already pays a stone once via
  the existing transition award; the crow adds NOTHING to the
  economy. Gold frames are memory made visible, not currency.
