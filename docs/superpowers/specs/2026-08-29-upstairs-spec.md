# Upstairs — house phase 3: the bedrooms

*2026-08-29. The customer request arrived in writing: "Dear garden
builder I wont to go upstairs but I cant please get it fixed this
month." (Cecily, 2026-08-29-2 — note she set a deadline.) The
builder's reply promised it as next on the list and made one
specific commitment: "upstairs is where the bedrooms go, and a
bedroom is a good place to hang a LOT more pictures than two." The
art-store spec sequenced this deliberately: "her own room becomes
the big gallery LATER." It is later.*

## What upstairs is

The stairs in the entry hall already climb left out of frame, and an
honest little sign on the rail says "upstairs" (HouseScene.tsx ~554
— the sign exists today as a promise). Phase 3 makes the stairs a
real doorway: tap them, arrive at **the landing** — a hallway with
one bedroom door per child, each with a drawn name plate. Every
child's door is there, whoever is signed in — like the coat hooks
downstairs, with ONE deliberate difference the code must state: the
coat hooks render every `learner` row, and that includes
**Friends**, the shared tablet profile. Friends gets a coat hook (a
tablet can visit) but NOT a bedroom (a tablet does not sleep) — the
landing filters `first_name === 'Friends'` out of the door list,
with a comment saying why. Three doors, three plates.

- **Your own door** opens your room, and you can change it.
- **A sibling's door** opens THEIR room, read-only — you visit, you
  do not redecorate. Visiting pairs naturally with sibling mail:
  see Esme's wall, write to Esme about it. HONESTY ABOUT THE TRUST
  MODEL: the APIs in this app take `learnerId` in the body with no
  session identity — the server cannot know who is asking, so
  read-only visiting is a UI property, not an API guarantee. That
  is the same trust model as everything else on the family tablet
  and fine at this scale; the test suite asserts what is actually
  true (the visiting view issues no mutating requests), not an
  architecture claim the routes cannot back.
- **An empty room is a real case, not an edge case** — Otto's would
  be empty today. A visitor to an empty room sees the bed (default
  quilt), bare wall slots, bare shelf, and one warm line on the
  door card: "{name} has not decorated yet." Nothing sad, nothing
  missing-looking; an undecorated room is an invitation, and the
  natural next sibling letter writes itself.
- **No gates, no costs.** "Nobody earns their own front door"
  extends upstairs: the room, the quilts, the hanging, the shelf —
  all free. The economy sells nothing here in V1 (V2 may add shop
  decor; recorded below).

## The room, V1 — three fixtures, all of them hers

**1. The gallery wall — the point of the whole floor.** SIX frame
slots (the reading room has two; the promise was "a LOT more").
Hanging works exactly like the reading-room wall: pick a slot, pick
a picture from your own gallery, ownership checked server-side;
store frames render their borders; `<image href>` from the public
artwork bucket. The galleries have exploded since the store opened
— Cecily has 34 pieces today and Esme 37 — so six slots is not
"hang everything," it is CURATION: choosing this week's best six is
its own activity, and rotating the wall is why the room stays
alive. (Otto has zero pieces; see the empty-room rule below.)

**2. The bed, with a choice of quilt.** Four drawn quilts, picked
freely and swappable anytime: `patch` (default patchwork),
`star` — seven rows of seven stars, the crow's star quilt made
sleepable, one short of fifty and the room does not mind — `sun`,
and `sea`. The quilt is the room's big color decision, which makes
it the cheapest possible "my room is MINE" lever: one tap, whole
room changes mood.

**3. The treasure shelf.** Three display spots on the mantel-slot
pattern (ownership-checked server-side, shows what you own),
drawing from collections that already exist but have nowhere to be
shown off together:
- a **stone** from `cavern.kept`
- a **bird** from `bird_lifelist`
- a **prize veggie** from `arcade.munch.prizes`

Any mix — three stones is fine. This answers her old "more for the
things I have" theme without inventing a new collectible.

Plus fixed art that makes it a bedroom: window with curtains (the
garden outside), rug, a bedside lamp. Luna stays downstairs — her
hearth is the reading room and cats do not relocate on request.

## Her letter shapes V2, on purpose

The upstairs reply asked CECILY what her room should have, and
invited her to poll Esme and Otto with the sibling-mail buttons —
the direct question has NOT been put to the younger two, so the
ship-time letters should ask them each plainly. Whatever comes back
becomes the V2 room kit — built after it arrives, not preempted.
V1 is deliberately the frame (walls, bed, shelf) rather than the
full furnishing, so that the first thing a child asks for can still
visibly appear. Do not gold-plate V1; the empty corner is
load-bearing.

*(Process scar, recorded: the first attempt at that reply delivered
the literal text `--to` to a raised flag — a CLI argument-order
slip, caught by this spec's adversarial review before she opened
it. The reply was rewritten with `--force`, and `read-letters.ts`
now refuses letter text that looks like a flag.)*

## State & API

```jsonc
// world_state.garden.room — each child's room lives in THEIR blob
{
  "quilt": "star",                          // default "patch"
  "hung": { "r1": "2026-08-26-3", "r4": "2026-08-28-1" },  // r1..r6
  "shelf": [
    { "kind": "stone",  "code": "garnet" },
    { "kind": "bird",   "code": "carolina_wren" },
    { "kind": "veggie", "code": "proud_tomato" }
  ]
}
```

- **Hanging** extends the existing art route rather than forking a
  second hanging system: `POST /api/art { action: 'hang', wall:
  'bedroom', slot: 'r1'..'r6', id }`. Omitted `wall` means
  `'reading'` with the current `left`/`right` slots — existing
  clients unchanged. Bedroom hangs write `garden.room.hung`;
  reading-room hangs keep writing `garden.art_hung`. Both use
  `hangPicture`'s gallery-membership check.
- **Cross-checks the route must refuse in words**: a `wall`/`slot`
  mismatch (`wall: 'reading', slot: 'r3'` or `wall: 'bedroom',
  slot: 'left'`) is an error, not a silent guess.
- **Room choices**: new `POST /api/house/room` — zod-validated
  `{ learnerId, action: 'quilt' | 'shelf', ... }`. Shelf items are
  verified against the real collections (`cavern.kept` keys,
  `bird_lifelist` keys, `arcade.munch.prizes` codes) — the cavern
  banking rule again: you can only display what you were actually
  given. Refusals in words. One item per spot (the same stone
  cannot fill two spots); displaying does NOT reserve — she may
  still sell a kept stone that is on her shelf, because her stuff
  stays hers to sell.
- **Dangling refs are normal, tolerated everywhere**: deleting a
  picture does not clean `art_hung` today (the reading room renders
  a missing ref as an empty frame), and selling a stone can orphan
  a shelf entry. The bedroom and VISITING renderers must both use
  the same tolerance — an unresolvable hung id or shelf code
  renders as an empty slot, never a crash — and the room route
  prunes unowned shelf entries whenever it writes.
- **Visiting**: the house page already fetches all learners for
  coat hooks; it additionally fetches each learner's `garden.room`
  (and gallery refs for their hung pictures) to render sibling
  rooms read-only. No API needed — server-rendered, like the rest
  of the house.

## Files

- `lib/world/room.ts` — `RoomState`, `setQuilt`, `setShelf`
  (ownership-checked against passed collections), `QUILTS` catalog,
  `BEDROOM_SLOTS = ['r1'..'r6']`.
- `tests/world/room.test.ts` — quilt validation, shelf ownership
  refusals (a stone she never banked, a veggie never won), one item
  per spot, unowned-entry pruning, hang slot bounds, wall/slot
  mismatch refusals, dangling-ref tolerance in the render helpers.
- `app/api/house/room/route.ts`; `app/api/art/route.ts` gains
  `wall`.
- `lib/world/artStore.ts` — `hangPicture`'s slot type is hard-coded
  `'left' | 'right'` today; it generalizes to accept a slot from a
  caller-supplied allowed list, so both walls share one
  gallery-membership check instead of growing a fork.
- `app/(child)/garden/house/HouseScene.tsx` — stairs become a
  doorway (the "upstairs" sign stays, now true); new views:
  `UpstairsLanding` + `Bedroom` (own/visiting) — likely their own
  files, HouseScene is 1,437 lines already.
- `app/(child)/garden/house/page.tsx` — fetch all rooms + own
  collections (kept stones, lifelist, prizes) for the shelf picker.

## Art (bespoke SVGs, looked at twice — the standing ruling)

To draw, proof-render, LOOK, revise, LOOK AGAIN: the landing
(railing, runner rug, three doors with name plates), the bedroom
(bed + each of the four quilts ON the bed, window with curtains,
rug, lamp, the six-slot wall, the three-spot shelf), and the shelf
treasures at display size (stones and birds have existing art to
reuse — species/mantel patterns; prize veggies reuse
`PrizeVeggieArt`). Everything stands on something with a shadow.
The star quilt must actually show 7×7 stars — a child who has met
the crow's quilt WILL count them, and the whole mnemonic system
rests on pictures that tell the truth.

## Letters

After deploy, drafts for owner review (channel norm) — WRITTEN AT
SEND TIME, not here, so no claim ages into a lie (a draft boasting
"it is still August" is false if the build slips three days).
Content notes only: Cecily's acknowledges her deadline and names
the star quilt; Esme's is short and picture-first; Otto's must NOT
say "your pictures can go up" — he has none — it says his door has
his name on it and the room is waiting, and maybe that the art
store is where pictures come from. All three mention visiting each
other's rooms, because the first thing that wall needs is an
audience.

## Out of scope (V2+, recorded)

The room kit from the children's reply letters; shop-bought decor
(penny-priced, treats band); a door for Friends (the shared profile
is a tablet, not a person — deliberately no room in V1, revisit if
a child asks where Friends sleeps); moving Luna; wallpaper.

## Build order

1. `lib/world/room.ts` + tests, green first.
2. APIs (room route, art `wall` param) + referee tests.
3. Landing + bedroom scenes, own-room editing, sibling visiting.
4. Stairs doorway, art pass (two looks), smoke, letters.
