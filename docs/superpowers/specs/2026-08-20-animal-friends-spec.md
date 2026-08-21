# Animal Friends V1 — spec

*2026-08-20. Cecily's answer to the animals-or-capabilities question,
in her words: "more for the animals that I have, not more animals."
Owner-approved scope: V1 = adoption at the animal + earned names +
the friend walks with her + the announcement letter.*

## The finding this spec is built on

A complete Garden Friend companion system already exists — bond XP
capped at 2/day, feed/play, nickname → bandana → flower crown,
napping-never-suffering invariants — and its table is EMPTY. Adoption
lives three steps deep in the journal. This is the third
built-but-undiscovered feature (Luna's adventure, the owl box). V1 is
therefore mostly SURFACING and CONNECTING, not new mechanics.

## A1 — adoption where the animals are

The resident tap bubble (which already offers the treat button) gains
**"make it your garden friend"** — calling the existing
`/api/companion/adopt`, which already handles discovery checks and
re-adoption with preserved bond history. After adoption the page
refreshes so the companion appears. The button hides for the species
that already IS the current friend.

The journal path stays; this is a second door, like the kitchen.

## A2 — earned names, for any animal

- Feeding an animal on **three distinct days** makes it *known*.
  Distinct-days tracking (`feedDays`) joins the treats state; the
  server records it inside the existing feed action. Same spaced-days
  shape as the crow's gold frames — a mechanic she just learned.
- A known, unnamed animal's bubble offers **"name it"**: a small
  input, max 20 characters, her words untouched (the American-English
  guard never edits a child's own text).
- Names live in `garden.animal_names` (speciesCode → name) and
  display wherever the species name shows in the garden bubble:
  "Clover — Eastern Cottontail".
- Naming is free of economy: no coins, no gems, nothing farmable.
  The reward IS the name.
- The companion nickname remains what it is; if she names a species
  that is also the companion, the companion nickname wins on the
  companion spot (one animal, one name shown at a time).

## C — the friend walks with her

When the sisters walk to a destination, the adopted companion
follows, trailing behind on a delay. Pure presentation: same target,
longer spring, small offset, respecting reduced-motion. It naps at
its spot when nobody is walking.

## The letter

Announced on her next unanswered letter (no forced overwrites). The
letter names all three: tap an animal to make it your garden friend,
feed an animal three different days and it will want a name from you,
and your friend now walks with you.

## Out of scope (V2+, recorded)

True-behavior tricks (rabbit thump, waggle dance aimed at real
flowers, fake nut burial, firefly patterns) — six bespoke animations,
own art budget. Time-of-day presence — additive-only if ever.
Pet room — house phase 3 territory.

## Tests

- feedDays: distinct-day accumulation, known at 3, idempotent within
  a day.
- Name validation: length, non-empty after trim, control characters
  stripped; refusals in words.
- Known gating server-side: naming an unknown animal is refused.
