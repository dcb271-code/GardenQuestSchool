# The Art Store & the Ride to Town — spec

*2026-08-26. The oldest open promise, owed to all three children:
Esme (~15 asks: paints, chalk, "hang my picture", Sergio's
destination), Cecily (by name; told the exploit diamond paid for
it), Otto (his first letter: "ready to go to the art store").
Owner decisions locked: the EASEL ships in V1; galleries are
PER-CHILD for now; and the store is not on the garden map — you
RIDE there.*

## The ride (the owner's idea, and the right one)

The garden map is full. Instead of wedging in a storefront, **a bike
and a scooter lean against the house.** Tap them and the question is
"Where do you want to ride?" — a destination sheet. V1 has one live
destination, the Art Store, plus an honest dashed entry: "more roads
someday." This is deliberately an EXTENSIBLE PATTERN: town is where
off-map places live (a library, the fluorspar museum, anywhere),
and each future destination is a menu row, not a map negotiation.

A short riding interstitial plays between tap and arrival — wheels,
wind, a hill — proof-rendered like all art. Reduced-motion skips it.

## The store (`/town/art-store`)

A storefront with an awning and a window full of easels; inside:

- **THE EASEL** — the point of the whole building. Finger painting
  on a real canvas: 10 colors, 3 brush sizes, eraser, undo, and
  stamps of garden creatures she already knows (species art, third
  job). Designed PRE-READER FIRST — Esme is the primary artist, so
  every control is an icon and nothing requires reading.
- **THE SHELVES** — frames (20–60p), fancy papers (canvas
  backgrounds), a stamp pack. Bounded cosmetics in the treats price
  band, paid from the one purse.
- **THE PLAQUE** — "This store was paid for, in full, by one
  diamond." True story; the exploit correction becomes founding
  lore.

**THE ECONOMIC RULE, stated first because it is the one that
matters: the MAKING is free, forever.** Colors, brushes, eraser,
saving — never cost a coin, never will. The store sells the
showing-off, not the art. Art earns nothing (no coins, no gems): the
picture is the reward. The anti-farming ledger gains no source and
creativity gains no paywall.

## Saving and the gallery

- A finished picture saves as a PNG to a Supabase storage bucket
  (`artwork/`) — a drawing is ~100–300KB, far too heavy for the
  jsonb blob. `garden.art_gallery` keeps the refs:
  `[{ id, path, title?, createdAt, frame? }]`.
- The gallery lives in the store (a "your pictures" wall) and is
  PER-CHILD. No cross-child visibility in V1; gifting is a possible
  V2 and stays out of this one.
- Deleting her own picture is allowed (her art, her call), with a
  plain confirm. Nothing else can delete it.

## Hanging

Esme's exact words were "hang it up." V1 ships ONE hanging surface:
the reading-room wall gains two frame slots (the mantel-slot
pattern — ownership-checked server-side, displays what she owns).
A plain frame is free; store frames change the border. Her own room
(house phase 3) becomes the big gallery LATER — the art store now
properly sequences before it.

## Access

No gates, any level, all three children. The ride, the store, the
easel: everything works without reading.

## Build order

1. `lib/world/artStore.ts` (gallery state, frame catalog, name/save
   validation) + `/api/art` (save = upload PNG + record ref; list;
   delete; hang).
2. The easel component (canvas, pointer events, undo stack, stamps).
3. The store scene + shelves + plaque; the ride (bike/scooter sprites
   by the house, destination sheet, interstitial).
4. Reading-room frame slots.
5. Letters to all three children — Esme's first, and Sergio gets a
   mention.

Proof-render gates: the storefront, the easel controls at phone
width, the interstitial, and one real finger-drawn save round-trip
(draw → save → gallery → hang) clicked through in the browser.

## Out of scope (V2+, recorded)

Cross-child gifting; photographing real paper art; more town
destinations; chalk-on-sidewalk mode; Sergio as a drawn character
greeting visitors (tempting — Esme invented him — but he needs her
to tell us who he is first, and that is a letter worth asking for).
