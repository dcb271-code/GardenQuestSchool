# Munch Patch & the Play Barn — spec

*2026-08-29. Owner approved the four calls: bunny-muncher first, the
crow partnered in for times tables, a groundhog instead of Troggles
with a no-lose rule, and the Arcade as the bike's second road. Owner
priorities, in order: accurate above all else, fun, whimsical,
inventive, educational.*

## Lineage, honestly stated

This is Number Munchers (MECC, 1986) wearing the garden's clothes:
a grid of answers, a rule card, a hungry hero, a wandering nuisance.
Word Munchers is the same engine with word rules and ships LATER on
this engine (see V2). Math Blaster is deliberately NOT cloned: its
core loop — rapid facts under pressure — is already what the
hummingbird's nectar rounds do, our way (no clock shown, speed
mentioned only on a personal best). If arcade energy is wanted
there, we extend nectar rounds; we do not build a parallel shooter.

What the lineage teaches and we keep: the rule card turns *recall*
into *discrimination* — the child judges twenty candidates instead
of producing one answer. That is a genuinely different muscle from
the crow (production: "what IS 7×8?") and the hummingbird (speed).
The three together cover remember-it, say-it-fast, and spot-it —
which is the whole of fluency.

## The Play Barn — road #2

The ride sheet in `GardenScene.tsx` currently has one live
destination (the Art Store) and a dashed "more roads someday" row.
The barn makes that promise true:

- New row on the destination sheet: **🛑🎪 The Play Barn** — "games
  in the hayloft" — above the dashed row, which stays (there are
  still more roads someday).
- The riding interstitial is currently hardcoded to push
  `/town/art-store` after its 1700ms ride. Refactor: `ride(dest:
  string)` takes the destination route; the interstitial itself is
  destination-agnostic (same bike, same rolling world). Reduced
  motion skips it, as now.
- Route: `/town/play-barn`. Add to `scripts/smoke-routes.mjs`
  (the art store is at line ~44 of that list; the barn goes beside
  it).

Inside the barn: hay bales, a string of little flags, ONE game stall
for V1 (the Munch Patch), a **prize shelf** (see rewards), and a
dashed empty stall — "more games someday" — the roads pattern,
repeated one level down. The crow perches on the barn's weathervane
(see the crow partnership).

No gates. Any level, all three children, nothing requires reading
(rule cards are listenable — see input & accessibility).

## The game: one round of Munch Patch

1. **Pick a crate.** The child picks a rule from labeled veggie
   crates (the rules offered depend on level — see catalog). Each
   crate label is plain words plus a speaker button.
2. **The patch.** A garden bed grid, **5×4 = 20 tiles** (4×5 in
   portrait). Each tile grows one veggie with a face: a numeral
   ("42") or a little expression ("4+7"), per the rule type. The
   bunny waits in its burrow at the bottom edge, off-grid.
3. **Munch.** Tap a tile: the bunny hops there tile-by-tile
   (~220ms/hop, orthogonal, column-then-row) and eats the veggie it
   was sent to. Passing over a veggie does NOT eat it — choosing is
   the game.
4. **Judgment.** Eat a right one: crunch, sparkle, the tile becomes
   nibbled soil. Eat a wrong one: the bunny wrinkles its nose and
   spits it out — "blech!" — and a small card explains WHY in
   derivable terms (see accuracy). The tasted veggie stays on its
   tile, bitten and inert. No penalty of any kind.
5. **The groundhog** trundles through periodically (see below).
6. **Clear.** The round ends when every correct veggie is eaten.
   A harvest tally card: what you munched, anything the groundhog
   made off with, and — first clear of the day only — a prize
   veggie for the shelf.

No timer. No clock anywhere on screen. No lives, no game over, no
way to lose. The round ends exactly one way: you cleared it.

## Accuracy above all: two hard rules

**1. The server is the referee.** The client reports which faces
were munched; the SERVER recomputes correctness from the rule and
the face value — the same principle as the cavern's "you can only
bank a stone you were actually given." A client that lies about
correctness changes nothing: attempts are recorded with the
server's verdict, and the prize is granted only on a server-verified
clear.

**2. Wrongness must be shown, not asserted.** Every "blech" card is
COMPUTED from the rule and the face — never canned text:

- `eat_number` (target 5, munched 6): both numerals shown big, side
  by side — "That one is a 6. We are eating 5s."
- `sum_equals` (target 12, munched "4+7"): the sum is computed and
  shown — "4 + 7 makes 11, not 12."
- `bigger_than` (pivot 25, munched 23): a three-number stretch of
  the number line — "23 comes before 25."
- `multiple_of` (k=6, munched 26): the skip-count chain, computed,
  bracketing the wrong value — "6, 12, 18, **24, 26?, 30** — 26 is
  not a landing spot." The chain shown contains ONLY true multiples
  plus the munched value in its sorted position.

This is the muncher's version of the crow's law ("the answer must be
derivable from the scene"): the *wrongness* must be derivable from
the card.

## Rules catalog, by level

Level comes from `learner.grade_level` (levels 1–5; the column keeps
its old name), fetched the way `app/(child)/garden/page.tsx` does.
A child sees every crate at or below their level **plus exactly one
stretch crate** from the next level up, labeled with a little
sprout 🌱 — the same hardest-first-within-reach philosophy as the
L3+ signpost, without locking anything. The V1 catalog tops out at
L3, so L3+ children see the full catalog and no sprout — the
sprout appears only where a harder crate exists to offer.

| Rule | Faces | Correct when | First offered |
|---|---|---|---|
| `eat_number` {target} | numerals 0–10 | face === target | L1 (Esme) |
| `bigger_than` {pivot} | numerals 0–99 | face > pivot | L2 |
| `sum_equals` {target ≤ 20} | "a+b", no regrouping bias | a+b === target | L2 (Otto: `math.add.within_20.no_crossing` is his live skill) |
| `multiple_of` {k: 2–5} | numerals k..k×10 | face % k === 0 | L3 |
| `multiple_of` {k: 6–9} | numerals k..k×10 | face % k === 0 | L3 (the crow's territory) |
| `sum_equals` {target ≤ 100} | "a+b" two-digit, regrouping likely | a+b === target | L3 (feeds the carry workshop's skill) |

**Board generation** (`makeBoard(rule, seed)`) is seeded and
deterministic for a given seed, with invariants that are UNIT
TESTED across many seeds, not trusted from templates:

- 6–9 correct tiles per 20; the rest distractors.
- Every tile is re-checked against the predicate at generation
  time: every correct tile passes, every distractor fails. A
  distractor that accidentally satisfies the rule is a generator
  bug the test suite must catch (e.g. for `multiple_of 6`,
  candidate near-misses like 44 and 26 are verified non-multiples
  at runtime — never assumed).
- Distractors are DESIGNED traps, not noise: off-by-one
  (`k·m ± 1`), neighbors' multiples (multiples of k−1 or k+1 that
  are not multiples of k), digit swaps of true answers *where the
  swap is not itself an answer* — for k=8, 24 is a multiple and 42
  is not, a perfect trap; for k=6 that same swap must be REJECTED
  because 42 is a multiple of 6, which is exactly why every
  candidate is re-checked instead of trusted — and for sums: ±1
  and ±10 errors, the actual mistakes children make.
- `sum_equals` faces are unique as strings (no two "4+7" tiles).
  Numeral rules may repeat values; duplicates are unambiguous
  because correctness is a pure function of the face.

## The crow partnership (the discoverability fix)

Cecily has never opened the crow's picture cache — zero state —
while grinding `math.multiply.facts_to_10` in tiny sessions. The barn
recruits her where she already plays:

- The crow sits on the barn's weathervane, visible from the game.
- After any `multiple_of` round with k in 6–9, the tally card gains
  one extra line from the crow: "I keep pictures for the tricky
  ones. Want to see the honeycomb?" — linking to `/times-table`
  (existing route). The named scene is found by filtering
  `CROW_SCENES` for `a === k || b === k` (`sceneForFact` needs both
  factors, which a multiples round does not have): 6 matches the
  shell, snail mail, and the honeycomb; 7 matches snail mail, the
  quilt, and the fence; 8 matches the honeycomb, the fence, and the
  bee; 9 has no scene and gets the finger trick instead. Pick one
  match, date-seeded. One line, one link, never a detour forced.
- Munch results do NOT write crow gold-fact progress.
  `recordCrowResults` has a strict meaning (first-try production
  across days); recognition munches would pollute it. The two
  systems share a bird, not a ledger.

## The groundhog (no-lose, by construction)

- One groundhog. Every 10–14 seconds he emerges from a hole at the
  edge, walks a straight row or column at ~1 tile/second, and exits
  the far side. Predictable, visible, avoidable.
- He EATS what he walks over. A distractor he eats is simply gone
  (he likes weeds; occasionally he is accidentally helpful). A
  CORRECT veggie he eats regrows ~4 seconds later on a random empty
  tile — and one always exists, because the tile he just emptied
  qualifies. That is the invariant, unit-tested at the reducer
  level: **the board is always completable**. The groundhog can
  reshuffle the work; he can never steal the win.
- Boundary case, stated so it cannot leak: a round is cleared only
  when every correct tile has been munched **by the bunny**. A
  correct veggie in the groundhog's belly awaiting regrow counts as
  uneaten — if he grabs the last one, the round stays open the few
  seconds until it sprouts back and the bunny finishes the job.
- Collision (bunny and groundhog on the same tile): the bunny is
  startled, hops home to the burrow, and the groundhog tips his
  hat. Nothing else happens. Getting caught costs the trip back —
  spatial comedy, not punishment.
- Reduced motion / calm mode (the existing settings hooks): the
  groundhog naps by the fence, visibly snoring, for the whole
  round. Hops become fades. The game quietly becomes pure choosing.

## Input & accessibility

- Tap-to-hop only in V1 — no d-pad, no new input idiom to teach.
  Tiles are ≥56px touch targets at phone width.
- Every crate label and every "blech" card has a speaker button
  through the existing TTS route (`app/api/tts`) — Esme cannot read
  the rule, and must not need to.
- All child-facing strings obey `tests/child-language.test.ts` and
  American English (`americanSpelling.test.ts`). What that test
  ACTUALLY bans today: "daily streak", "level up", coin-economy
  phrasing ("earn coins", "coin balance", "currency"), and "good
  job"/"great job" — the last being exactly the phrase a tally card
  invites, so write the card's praise as specifics ("you found all
  seven"). And since this spec means "no streak language" more
  broadly than the test enforces, part of this feature is
  tightening the test's pattern from `/daily\s*streak/i` to
  `/\bstreak/i`.

## Rewards & the economy

- Every munch — right or wrong — writes a null-item attempt row on
  the established pattern (birds, gems, crow, hummingbird, music,
  and others): the `outcome` column carries the server's verdict
  and `response` carries `{ source: 'munch', rule, face }`.
  Practice feeds the garden's seed economy exactly like every other
  subject; munching never touches math skill state.
- **No coins. Ever.** The anti-farming ledger gains no source.
- The bounded prize: the FIRST server-verified clear each day earns
  one **prize veggie** — a small catalog of county-fair absurdities
  (the Enormous Pumpkin, the Blue-Ribbon Zucchini, the Very Long
  Carrot, the Cabbage of Unusual Size…), picked date-seeded, kept
  in `garden.arcade.munch.prizes`, and displayed on the barn's
  prize shelf with its date, museum-style. Second and later clears
  are cheerfully allowed and pay nothing (the hummingbird's flower
  rule, word for word). Prize veggies are display pieces in V1; if
  the food shop ships, they are obvious future kitchen guests.

## State & API

```jsonc
// world_state.garden.arcade (new key, additive — no migration)
{
  "munch": {
    "prizeDate": "2026-08-29",          // todayKey of last prize
    "prizes": [{ "code": "enormous_pumpkin", "date": "2026-08-29" }],
    "cleared": { "multiple_of_6": 3 }   // counts, not streaks
  }
}
```

`POST /api/arcade/munch` — zod-validated:
`{ learnerId, rule: { type, ...params }, seed, munches:
[{ tile, face }] }`. The **seed is the keystone**: the server runs
`makeBoard(rule, seed)` itself and gets the exact board the child
played — which is why the generator must be deterministic. From
there: every munch is verified against the server's own board
(tile index must hold that face; correctness comes from the
server's predicate, parsing "a+b" faces with a strict regex),
attempt rows are inserted with the SERVER's verdicts, and `cleared`
is not even in the payload — the server derives it: every correct
TILE (by index, since numeral faces repeat) munched by the bunny.
A client that invents munches for faces the board never grew, or
repeats a tile, changes nothing. Then grant/deny the daily prize
via `todayKey()` and upsert `garden.arcade`. Refusals reach the
child in words, per house law — no silent `{}`.

## Files

- `lib/packs/math/munch.ts` — rule types, `offeredRules(level)`,
  `makeBoard(rule, seed)`, `checkFace(rule, face)`,
  `whyWrong(rule, face)` (computed cards), `PRIZE_VEGGIES`,
  `recordClear` reducer, groundhog regrow reducer.
- `tests/world/munchRules.test.ts` — generator invariants across
  seeds; `whyWrong` accuracy (the skip-count chain contains only
  true multiples; computed sums are right); referee behavior;
  regrow completability; prize cap.
- `app/api/arcade/munch/route.ts`.
- `app/(child)/town/play-barn/page.tsx` + `PlayBarnScene.tsx`
  (barn, stall, prize shelf, crow on the weathervane).
- `app/(child)/town/play-barn/MunchPatch.tsx` (the game).
- `GardenScene.tsx` — destination row + `ride(dest)` refactor.
- `scripts/smoke-routes.mjs` — add `/town/play-barn`.

## Build order

1. **Engine + tests.** `munch.ts` and its test file, green, before
   any pixels. The referee and the generators are the product.
2. **API.** The route + referee tests.
3. **Barn + game.** Scene, game component, sounds (crunch is new;
   `playHarvest` on clear, `playSparkle` on prize).
4. **The ride + art pass + letters.** Destination row, interstitial
   refactor, proof-render gates, announcements.

## Art gates (all standing rules apply)

Proof-render and LOOK, at 3× for sprites: the barn exterior and
interior; the bunny (it is the game's face); the groundhog's walk
as multi-frame captures; the wrong-munch "blech" face; the prize
shelf with a veggie on it; a full playthrough recorded at phone
width. Everything stands on something, with a shadow at its feet.
Position on plain outer `<g>`, animation on inner groups only —
the framer-motion transform rule, now sighted four times.

## Letters

After deploy, green-paper announcements to all three — each child
gets their own reason:

- **Otto's** names a crate that is truly his: sums within 20
  without crossing — his live skill — not "make ten," which is
  precisely the crossing move his skill excludes and therefore his
  SPROUT crate, mentioned as the one to grow into. The barn is the
  first thing built to his level since the treats; he reads his
  mail after midnight, and a new place to ride might be the first
  thing that pulls him past the letterbox.
- **Esme's** is mostly pictures and short words: bunny, veggies,
  the nap-taking groundhog.
- **Cecily's** mentions the crow on the weathervane by name.

Send via `npm run letters -- --send`, with owner review of drafts
first (current norm for this channel).

## V2 on this engine (recorded, not built)

Word Munchers = new rule types over string faces —
`rhymes_with`, `real_word`, `starts_with_sound` — same board, same
bunny, same groundhog, same referee (predicates live server-side;
rhyme/word lists are data, and `whyWrong` says the two words aloud
via TTS). Reading Forest theming. Also parked: a second groundhog
at higher levels, prize-veggie kitchen integration, more barn
stalls.

## Open questions for the owner

1. Prize-veggie art: drawn SVG catalog (like species art) or emoji
   + name in V1? (Spec assumes drawn — the shelf is a trophy case
   and deserves it — but it is the largest art line-item.)
2. Should Otto's announcement come from a SISTER instead of the
   builder? Cecily now can. We cannot write it for her — but the
   builder's letter to Cecily could mention the barn is new and
   Otto has not seen it, and let nature take its course.
