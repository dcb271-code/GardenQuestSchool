# The House — spec

*2026-08-12. Cecily has asked three times, most recently as an argument
the app cannot answer: "it is wherd that you can go in to athr animals
habitat but not our own house." She is right. The salamander's cavern
opens, the owl's box opens, the burrow has tunnels now — and the one
door on the map that belongs to the children is painted shut.*

*Reference photos of the real house were provided (interior listing
photos, six of them: the entry hall and staircase from two angles, the
fireplace, and the kitchen from three). The truth in them is recorded
here so the drawings can be checked against it.*

## What was decided before the spec

- **The exterior does not change.** The CozyHouse drawing on the map is
  confirmed right by the owner: tan siding, cream trim, red door,
  wraparound porch. It becomes tappable; nothing about it is redrawn.
- **The entry has a cushioned bench in front of the stairs** — the
  listing photos show a staged table and lamp there; the bench is what
  is really there. The bench is the detail a child who lives there
  would check first, the way the sundial's gnomon leans.

## The truth from the photos

**The entry hall.** Double front doors, wood-framed with glass. A grand
quartersawn-oak staircase on the right, turned balusters, a carved
newel post, a landing where it turns. Warm wood floors, white walls,
dark-stained wood trim on every opening, a scalloped pendant lamp.
The cushioned bench sits in front of the stairs. Ahead, a hallway runs
deeper into the house; to the right, a cased opening into the room
with the fireplace.

**The fireplace room.** The house's treasure: a full-height tiger-oak
mantel with round columns on both sides, a beveled mirror in the
middle, and its own display shelf — a piece of furniture built into
the wall. Brick firebox and a brick hearth stepping out onto the
floor. A colorful striped rug. Picture-rail molding on white walls.

**The kitchen.** Sage-green shaker cabinets, dark veined-granite
counters, a white-and-gray starburst tile backsplash, light parquet
floor laid in a brick pattern. Stainless refrigerator and dishwasher, a
gas cooktop, a wine-cubby shelf, a window over the sink, and a
peninsula with clear acrylic stools with teal cushions. A hallway
leads to the white back door with a window in it.

## What a house is in this world

Not a habitat. `residents.test.ts` is right to demand that a habitat
attract species, and a house is not for wild animals — it is for the
family. It gets its own route (`/garden/house`), reachable by tapping
the house on the garden map, and it is **open to every learner at
every level with no gate**. The children do not earn their own front
door. It would be the first interior in the app with no lock on it,
and that is correct.

One living thing is already true: **Luna is the house's animal.** A cat
asleep on the hearth is not decoration, it is where cats are. When
Luna is not wandering the garden, she is by the fire.

## The rooms, and what she DOES in each

The rule every interior has had to learn: a room built around nothing
is an empty box, and "nothing to do in here" is the letter that
follows. Each room ships with its activity or it does not ship.

### Phase 1 — the front door, the entry hall, the fireplace room

**The entry hall is the hub.** Drawn portrait like the cavern: the
double doors behind you (glass showing the garden you came from), the
oak staircase rising to the right with its landing and newel post, the
cushioned bench in front of it, the pendant lamp, the two ways deeper —
the cased opening to the fireplace room and the hallway to the kitchen.
The stairs go up to a landing that says where they lead (the bedrooms,
phase 3) without pretending they are open yet: **absent-not-padlocked
does not apply inside her own house** — upstairs should say "not built
yet" honestly, the way the letterbox replies do, because in a home a
locked door is a wrong note.

What she does here: **arrives, and chooses.** Plus one true small
thing: her boots by the bench and a coat hook per child — the profile
that is signed in has their coat on the hook. Otto's coat, Esme's coat,
Cecily's coat. A seven-year-old will check whose coat is up.

**The fireplace room is the reading room.** The mantel is drawn as the
photos show it — columns, mirror, shelf, brick hearth — because it is
the best object in the house and the drawing must earn it. Luna sleeps
on the hearth rug.

What she does here: **story time by the fire.** The Luna adventure
chapters she has finished become re-readable here, curled up where the
real cat is — the story about the moth, read next to the animal it
stars. The mantel shelf displays small things she has earned (a stone
from her case, a feather from the life list — one slot each, chosen by
her, the mantel as the family's own display case). If her letterbox
answer to "what do you DO in the first room" says something better,
her answer wins; this is the default, not the decree.

### Phase 2 — the kitchen

Drawn from the photos: sage cabinets, starburst backsplash, the teal
stools, the window over the sink, the back door down the hall.

What she does here: **cook.** The recipe system already exists —
Bachan's picnic table in the garden opens `KitchenModal`, harvest
basket and all. The house kitchen becomes a second door to the same
feature, not a fork of it: same recipes, same basket, same
consumed-by rules. Bachan's table stays; cooking outside in summer is
its own pleasure. Rendering the meal on the real counters is the
upgrade.

### Phase 3 — upstairs

Her room, and Esme's, and Otto's. This is the "my own room" she asked
for in writing: a room she arranges, indoor ornaments the way the Yard
works outdoors, art on the walls when the art store exists (the two
features want each other: the art store sells it, her room hangs it).
Needs its own design pass once phase 1 has been lived in — and it
should wait for her letters to say what a room of hers contains.

## Art rules

- Proof-render every room and LOOK, at phone portrait width first. The
  cavern took three attempts to look like a cave; a staircase with
  turned balusters will take more than one to look like oak.
- Palette from the photos, not from memory: white walls, dark oak trim,
  warm floors; kitchen sage, teal stool cushions, dark granite.
- The staircase is the entry's hero and the mantel is the fireplace
  room's. One hero per room; everything else supports.
- Same portrait composition discipline as the cavern (`meet`, not
  `slice`; a backdrop fills the letterbox edges).

## What this is not

- Not a habitat — no species, no build quest, no residents test
  entanglement. Luna appears via her existing wanderer logic, not a
  `SPECIES_CATALOG` entry.
- Not gated — no level, no mastery, no counts. It is their house.
- Not a shop surface — nothing in the house costs or pays coins in
  phase 1. The mantel displays what she already owns; it does not buy.
- Not the art store — that is its own promised building and stays so.

## Open questions

1. The fireplace-room activity is a default pending Cecily's letterbox
   answer to "what is the first room and what do you do in there?"
   Her answer supersedes this spec's phase 1 contents.
2. Whether the mantel display slots write to `world_state.garden.house`
   (new key, no migration — the letterbox pattern) — assumed yes.
3. Whether tapping Luna indoors offers the same feed/adventure choice
   as outdoors — assumed yes, one cat, one set of rules, one treat a
   day shared between locations.
