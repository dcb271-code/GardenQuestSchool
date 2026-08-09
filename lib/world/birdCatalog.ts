// lib/world/birdCatalog.ts
//
// The birds of a Louisville back yard.
//
// Two rules shaped this list, both from the research in
// docs/superpowers/specs/2026-07-26-bird-curriculum-design.md:
//
// 1. FREQUENCY FIRST. Sibley: "your first 25 or 50 species are the
//    hardest ones to learn" — so learn the ones actually outside the
//    window, cold, before anything else. Louisville Parks publishes a
//    feeder guide that scores every Kentucky bird 20 (commonest) to
//    100 (rarest); `localPoints` is that score, and it orders the
//    crews.
//
// 2. SHAPE BEFORE COLOUR. Cornell's Four Keys run size & shape →
//    colour pattern → behavior → habitat, and only THEN fine field
//    marks. But raw silhouette is abstract for a seven-year-old, so
//    per Sibley's Birding Basics the child's version of "shape" is
//    BILL AND FACE — a kid can see "fat cone for cracking seeds" long
//    before she can see body proportions. Hence `bill` and
//    `sizeAnchor` sit above `colourHook` here, and the Look stage
//    asks about them first.
//
// Everything in `facts` is true and checkable. Several are the hook
// that makes a bird stick — the jay's blue not being a pigment, the
// chickadee growing brain cells in autumn — and those are worth more
// than another field mark.

export type BirdSeason = 'year_round' | 'winter' | 'summer' | 'migrant';

/** The birder's measuring stick. Everything is sized against these three. */
export type SizeAnchor = 'sparrow' | 'robin' | 'crow' | 'goose';

export type BillShape =
  | 'cone'         // cracks seeds — cardinal, finches
  | 'chisel'       // drills and pries — woodpeckers, nuthatch
  | 'tweezers'     // picks insects — wrens, chickadees
  | 'hook'         // tears — hawks
  | 'needle'       // sips — hummingbird
  | 'all_purpose'; // eats most things — robin, jay, dove

export type ToneQuality =
  | 'whistle' | 'buzzy' | 'trill' | 'nasal' | 'harsh' | 'flute' | 'chatter';

export type PitchShape = 'rising' | 'falling' | 'flat' | 'wandering';

export type VoiceKind = 'song' | 'call' | 'drum' | 'flight_call';

export interface BirdVoice {
  kind: VoiceKind;
  /**
   * 'teakettle-teakettle-teakettle'. NULL is meaningful: some birds
   * have no phrase that works (a crow just caws), and for those the
   * teaching hook is `note` instead. Don't invent a mnemonic to fill
   * this in — a bad one is worse than none.
   */
  mnemonic: string | null;
  tone: ToneQuality;
  pitchShape: PitchShape;
  /**
   * How many times a phrase repeats before changing. The mimic rule —
   * mockingbird 3+, thrasher 2, catbird 1 — is the best single rule in
   * the curriculum, because it works on birds that never sing the same
   * phrase twice. Null where it doesn't apply.
   */
  repeats: number | null;
  /** Kid-facing description, and the ONLY hook where mnemonic is null. */
  note: string;
}

export interface BirdData {
  code: string;
  commonName: string;
  scientificName: string;
  /** For the iNat photo harvester. Verified against the live API. */
  inatTaxonId: number;
  /**
   * Harvest photos from THIS taxon instead, when the species-level id
   * would teach the wrong-looking bird.
   *
   * The Dark-eyed Junco is the case: it has several regional forms
   * that look genuinely different, and a species-level search returns
   * mostly western Oregon Juncos — dark hood, brown back — while
   * Kentucky gets the Slate-colored form, which is uniform grey. A
   * child taught from the wrong subspecies would be looking for a bird
   * that is not outside her window, which is the same failure as
   * teaching the Black-capped Chickadee's mnemonic to a Carolina.
   *
   * The catalog still names and teaches the SPECIES; only the
   * photographs are narrowed.
   */
  inatPhotoTaxonId?: number;
  /** For the xeno-canto audio harvester (Phase 2). v3 syntax. */
  xcQuery: string;
  emoji: string;
  crew: string;
  season: BirdSeason;
  /** Louisville Parks feeder points: 20 commonest … 100 rarest. Null = not a feeder bird. */
  localPoints: 20 | 40 | 60 | 80 | 100 | null;
  sizeAnchor: SizeAnchor;
  /** Typical length, inches. Lets the size exercises compare honestly. */
  lengthInches: number;
  bill: BillShape;
  /** The gestalt, in Cornell's "color pattern" sense — not one diagnostic spot. */
  colourHook: string;
  fieldMarks: string[];
  behavior: string[];
  habitat: string[];
  facts: string[];
  /** Male and female look different enough to confuse a beginner. */
  dimorphic: boolean;
  /** Not native — a real and interesting lesson. */
  introduced?: boolean;
  voices: BirdVoice[];
  /** Drives hard distractors, and later the Tricky Twos units. Must resolve. */
  confusableWith?: string[];
}

/** Reference lengths for the size ladder, inches. */
export const ANCHOR_INCHES: Record<SizeAnchor, number> = {
  sparrow: 6, robin: 10, crow: 17.5, goose: 30,
};

export const BILL_HINT: Record<BillShape, string> = {
  cone: 'a fat cone, for cracking seeds',
  chisel: 'a straight chisel, for drilling and prying',
  tweezers: 'fine tweezers, for picking insects out of cracks',
  hook: 'a hooked bill, for tearing',
  needle: 'a long needle, for sipping flowers',
  all_purpose: 'a middling bill that eats most things',
};

export const BIRD_CATALOG: BirdData[] = [
  // ─────────────────────────────────────────────────────────────
  // CREW 1 — The Everyday Five. Unmistakable, at the feeder daily.
  // ─────────────────────────────────────────────────────────────
  {
    code: 'northern_cardinal',
    commonName: 'Northern Cardinal',
    scientificName: 'Cardinalis cardinalis',
    inatTaxonId: 9083,
    xcQuery: 'gen:cardinalis sp:cardinalis',
    emoji: '🐦',
    crew: 'crew1',
    season: 'year_round',
    localPoints: 20,
    sizeAnchor: 'robin',
    lengthInches: 8.5,
    bill: 'cone',
    colourHook:
      'The male is scarlet all over with a black mask. The female is warm buff-brown — but she has the same crest and the same heavy orange bill.',
    fieldMarks: [
      'a pointed crest, like a little hat that comes to a point',
      'a thick orange-red bill shaped like a cone',
      'a black mask around the bill and eyes',
    ],
    behavior: [
      'usually the first bird at the feeder at dawn and the last at dusk',
      'sings from a high open perch where everyone can hear',
      'feeds on the ground under the feeder as often as on it',
    ],
    habitat: ['shrubby edges', 'gardens with thick bushes', 'woodland edges'],
    facts: [
      "Kentucky's state bird. Schoolchildren campaigned for it, and the state agreed in 1926.",
      'The female sings too — which is unusual. In most songbirds only the male sings, but a female cardinal often sings back from the nest.',
      'Cardinals do not migrate. The pair in your yard in July may be the same pair in the snow in January.',
    ],
    dimorphic: true,
    voices: [
      {
        kind: 'song',
        mnemonic: 'birdie-birdie-birdie',
        tone: 'whistle',
        pitchShape: 'falling',
        repeats: 3,
        note: 'A clear, loud whistle that slides downward. Also heard as "what-cheer, what-cheer".',
      },
      {
        kind: 'call',
        mnemonic: null,
        tone: 'harsh',
        pitchShape: 'flat',
        repeats: null,
        note: 'A single sharp metallic "tick", like two small stones tapped together. You will hear this far more often than the song.',
      },
    ],
  },
  {
    code: 'blue_jay',
    commonName: 'Blue Jay',
    scientificName: 'Cyanocitta cristata',
    inatTaxonId: 8229,
    xcQuery: 'gen:cyanocitta sp:cristata',
    emoji: '🐦',
    crew: 'crew1',
    season: 'year_round',
    localPoints: 20,
    sizeAnchor: 'robin',
    lengthInches: 11,
    bill: 'all_purpose',
    colourHook:
      'Bright blue above, clean white below, with a black necklace across the throat and a tall blue crest.',
    fieldMarks: [
      'a tall pointed crest that goes up when it is excited',
      'a black necklace across the throat',
      'black bars across the blue wings and tail, with white patches',
    ],
    behavior: [
      'loud and bold — you usually hear it before you see it',
      'buries acorns in the ground to eat later',
      'mobs hawks and owls in a noisy gang to drive them off',
    ],
    habitat: ['oak woods', 'yards with big trees', 'park edges'],
    facts: [
      "The blue is not paint. There is no blue pigment in the feather at all — the feather is built to scatter light so that only blue bounces back. Crush one and the blue vanishes.",
      'A jay can imitate a Red-shouldered Hawk almost perfectly. It may do it to scare other birds off a feeder.',
      'One jay can bury thousands of acorns in an autumn, and it never finds them all. The forgotten ones grow into oak trees.',
    ],
    dimorphic: false,
    voices: [
      {
        kind: 'call',
        mnemonic: 'jay! jay!',
        tone: 'harsh',
        pitchShape: 'falling',
        repeats: 2,
        note: 'A loud harsh scream, shouted twice. Carries a long way.',
      },
      {
        kind: 'call',
        mnemonic: null,
        tone: 'nasal',
        pitchShape: 'rising',
        repeats: null,
        note: 'A squeaky note exactly like a rusty pump handle being worked up and down.',
      },
    ],
  },
  {
    code: 'mourning_dove',
    commonName: 'Mourning Dove',
    scientificName: 'Zenaida macroura',
    inatTaxonId: 3454,
    xcQuery: 'gen:zenaida sp:macroura',
    emoji: '🕊️',
    crew: 'crew1',
    season: 'year_round',
    localPoints: 20,
    sizeAnchor: 'robin',
    lengthInches: 12,
    bill: 'all_purpose',
    colourHook:
      'Soft fawn-gray all over, slim, with a very long pointed tail and a small round head.',
    fieldMarks: [
      'a long tail that comes to a point, with white edges',
      'scattered black spots on the folded wing',
      'a head that looks too small for the body',
    ],
    behavior: [
      'walks and feeds on the ground, rarely on the feeder itself',
      'sits still on wires for long stretches',
      'gathers in flocks, sometimes forty or more',
    ],
    habitat: ['open ground', 'lawns', 'wires and fences', 'field edges'],
    facts: [
      'The whistling when a dove takes off is not its voice — it is the wings. Specially shaped feathers make the sound, and it warns the whole flock that something is wrong.',
      'The cooing sounds so much like an owl that people report owls in the middle of the day.',
      'Parent doves feed their chicks "crop milk", a rich liquid they make inside themselves. Very few birds can do this.',
    ],
    dimorphic: false,
    voices: [
      {
        kind: 'song',
        mnemonic: 'coo-OO-oo, oo, oo',
        tone: 'flute',
        pitchShape: 'falling',
        repeats: null,
        note: 'A soft, sad, hollow cooing. The second note is the highest, then it settles down.',
      },
    ],
  },
  {
    code: 'carolina_chickadee',
    commonName: 'Carolina Chickadee',
    scientificName: 'Poecile carolinensis',
    inatTaxonId: 144814,
    xcQuery: 'gen:poecile sp:carolinensis',
    emoji: '🐦',
    crew: 'crew1',
    season: 'year_round',
    localPoints: 20,
    sizeAnchor: 'sparrow',
    lengthInches: 4.7,
    bill: 'tweezers',
    colourHook:
      'Tiny and round, gray above and pale below, with a black cap and a black bib — and a bright white cheek squeezed between them.',
    fieldMarks: [
      'a solid black cap pulled down over the eye',
      'a black bib under the chin',
      'a clean white cheek between the cap and the bib',
    ],
    behavior: [
      'takes ONE seed, flies off to eat it, and comes straight back',
      'hangs upside down from twigs to reach underneath',
      'travels in winter flocks with titmice and nuthatches',
    ],
    habitat: ['woods', 'yards with trees', 'anywhere with a feeder'],
    facts: [
      'It hides seeds one at a time in bark cracks and remembers thousands of hiding places.',
      'In autumn the memory part of its brain grows new cells to hold all those places, then shrinks again in spring.',
      'The "dee-dee-dee" is an alarm, and the number of dees tells the other birds how dangerous the predator is. More dees means more danger.',
    ],
    dimorphic: false,
    confusableWith: ['tufted_titmouse', 'white_breasted_nuthatch'],
    voices: [
      {
        kind: 'call',
        mnemonic: 'chick-a-dee-dee-dee',
        tone: 'nasal',
        pitchShape: 'falling',
        repeats: null,
        note: 'Buzzy and scolding — the bird saying its own name. You will hear this all year.',
      },
      {
        kind: 'song',
        mnemonic: 'fee-bee-fee-bay',
        tone: 'whistle',
        pitchShape: 'falling',
        repeats: null,
        note: 'Four clear whistled notes, each a little lower than the last. Sweet, not buzzy.',
      },
    ],
  },
  {
    code: 'american_robin',
    commonName: 'American Robin',
    scientificName: 'Turdus migratorius',
    inatTaxonId: 12727,
    xcQuery: 'gen:turdus sp:migratorius',
    emoji: '🐦',
    crew: 'crew1',
    season: 'year_round',
    localPoints: null,   // not a feeder bird — the Louisville guide leaves it out
    sizeAnchor: 'robin',
    lengthInches: 10,
    bill: 'all_purpose',
    colourHook:
      'Dark gray back, warm orange breast, yellow bill. Upright and long-legged on the grass.',
    fieldMarks: [
      'an orange breast, brightest on the male',
      'a yellow bill',
      'white crescents above and below the eye, like small spectacles',
    ],
    behavior: [
      'runs a few steps on the lawn, stops dead, tilts its head, then pulls',
      'stands very upright compared to other lawn birds',
      'gathers in big flocks in winter and disappears into the treetops',
    ],
    habitat: ['lawns', 'parks', 'gardens', 'woodland floor'],
    facts: [
      'When a robin tilts its head on the lawn, it is aiming one eye at the ground. Its eyes are on the sides of its head, so it cannot look straight down with both at once.',
      'Robin\'s-egg blue is named after these eggs, and they really are that color.',
      'The robin is the middle rung of the birder\'s measuring stick: every bird is sparrow-sized, robin-sized, or crow-sized.',
    ],
    dimorphic: false,
    voices: [
      {
        kind: 'song',
        mnemonic: 'cheerily, cheer-up, cheerio',
        tone: 'whistle',
        pitchShape: 'wandering',
        repeats: null,
        note: 'Rich rolling whistled phrases that rise and fall, with small pauses between. Often the first bird singing before dawn.',
      },
      {
        kind: 'call',
        mnemonic: null,
        tone: 'harsh',
        pitchShape: 'flat',
        repeats: null,
        note: 'A rapid scolding "tut tut tut" when a cat is about.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // CREW 2 — The Little Gang. Small, and they travel together.
  // ─────────────────────────────────────────────────────────────
  {
    code: 'tufted_titmouse',
    commonName: 'Tufted Titmouse',
    scientificName: 'Baeolophus bicolor',
    inatTaxonId: 13632,
    xcQuery: 'gen:baeolophus sp:bicolor',
    emoji: '🐦',
    crew: 'crew2',
    season: 'year_round',
    localPoints: 20,
    sizeAnchor: 'sparrow',
    lengthInches: 6.5,
    bill: 'cone',
    colourHook:
      'Soft gray above, white below, with a peachy wash down the sides — a gray crest and a very big black eye.',
    fieldMarks: [
      'a pointed gray crest',
      'a big dark eye that makes it look surprised',
      'a small black patch just above the bill',
      'peach-colored flanks under the wings',
    ],
    behavior: [
      'holds a seed down with its feet and hammers it open',
      'travels with chickadees and nuthatches in winter',
      'scolds loudly at anything it does not like',
    ],
    habitat: ['woods', 'shady yards', 'anywhere with big trees'],
    facts: [
      'It lines its nest with fur, and it pulls the fur off live animals to get it — squirrels, dogs, even people.',
      'The winter flock it joins with chickadees and nuthatches means more eyes watching for hawks.',
      'A titmouse can remember which of two feeders was refilled more recently.',
    ],
    dimorphic: false,
    confusableWith: ['carolina_chickadee', 'white_breasted_nuthatch'],
    voices: [
      {
        kind: 'song',
        mnemonic: 'peter-peter-peter',
        tone: 'whistle',
        pitchShape: 'flat',
        repeats: 3,
        note: 'A clear ringing whistle, the same two notes over and over. Sounds like it echoes.',
      },
    ],
  },
  {
    code: 'white_breasted_nuthatch',
    commonName: 'White-breasted Nuthatch',
    scientificName: 'Sitta carolinensis',
    inatTaxonId: 14801,
    xcQuery: 'gen:sitta sp:carolinensis',
    emoji: '🐦',
    crew: 'crew2',
    season: 'year_round',
    localPoints: 20,
    sizeAnchor: 'sparrow',
    lengthInches: 5.75,
    bill: 'chisel',
    colourHook:
      'Blue-gray back, clean white face and chest, black cap. Looks like it has no neck and almost no tail.',
    fieldMarks: [
      'a black cap over a completely white face — no stripe through the eye',
      'a long straight bill that turns up very slightly',
      'a stubby tail that looks too short',
    ],
    behavior: [
      'walks head-first DOWN a tree trunk — nothing else in the yard does this',
      'wedges a seed into bark and hammers it open',
      'joins the winter chickadee and titmouse flock',
    ],
    habitat: ['big trees', 'oak and maple woods', 'shady yards'],
    facts: [
      'Going down a trunk head-first lets it spot insects hiding in bark that birds climbing upward walk straight past.',
      'The name comes from "nut hatch" — it jams a nut into a crack and hacks it open.',
      'It smears crushed beetles around the entrance to its nest hole. The smell may keep squirrels away.',
    ],
    dimorphic: false,
    confusableWith: ['tufted_titmouse', 'carolina_chickadee'],
    voices: [
      {
        kind: 'call',
        mnemonic: 'yank-yank',
        tone: 'nasal',
        pitchShape: 'flat',
        repeats: 2,
        note: 'A nasal honk, like a tiny toy trumpet. Sounds slightly cross.',
      },
    ],
  },
  {
    code: 'carolina_wren',
    commonName: 'Carolina Wren',
    scientificName: 'Thryothorus ludovicianus',
    inatTaxonId: 7513,
    xcQuery: 'gen:thryothorus sp:ludovicianus',
    emoji: '🐦',
    crew: 'crew2',
    season: 'year_round',
    localPoints: 20,
    sizeAnchor: 'sparrow',
    lengthInches: 5.5,
    bill: 'tweezers',
    colourHook:
      'Warm rusty brown above, buff below, with a bold white stripe over the eye — and the tail cocked straight up.',
    fieldMarks: [
      'a bold white eyebrow stripe',
      'a tail held cocked upright',
      'a long bill that curves gently downward',
    ],
    behavior: [
      'creeps through brush piles and pokes into every crack',
      'nests in absurd places — boots, mailboxes, flowerpots, coat pockets',
      'stays in pairs all year rather than only in the breeding season',
    ],
    habitat: ['brush piles', 'thickets', 'tangled garden corners', 'porches'],
    facts: [
      'It weighs about as much as four paperclips and has one of the loudest voices in the yard.',
      'Only the male sings the teakettle song, and he may sing it three thousand times in one day.',
      'It sings all year long, which almost no other bird here does. In February, when the yard is silent, this is the voice you hear.',
    ],
    dimorphic: false,
    voices: [
      {
        kind: 'song',
        mnemonic: 'teakettle-teakettle-teakettle',
        tone: 'whistle',
        pitchShape: 'flat',
        repeats: 3,
        note: 'Loud, rolling, three beats to a phrase, repeated. Astonishingly big for the size of the bird.',
      },
      {
        kind: 'call',
        mnemonic: null,
        tone: 'harsh',
        pitchShape: 'flat',
        repeats: null,
        note: 'A dry scolding rattle, like a tiny football rattle, when it is annoyed.',
      },
    ],
  },
  {
    code: 'american_goldfinch',
    commonName: 'American Goldfinch',
    scientificName: 'Spinus tristis',
    inatTaxonId: 145310,
    xcQuery: 'gen:spinus sp:tristis',
    emoji: '🐤',
    crew: 'crew2',
    season: 'year_round',
    localPoints: 20,
    sizeAnchor: 'sparrow',
    lengthInches: 5,
    bill: 'cone',
    colourHook:
      'In summer the male is brilliant lemon yellow with a black cap and black wings. In winter the same bird is drab olive-buff — it looks like a different species.',
    fieldMarks: [
      'black wings with white wing bars, in every season',
      'a short notched tail',
      'a small pale cone bill, orange in summer',
    ],
    behavior: [
      'flies in deep bounces — up, down, up, down — and calls on each bounce',
      'clings sideways to seed heads and feeders',
      'comes in chattering flocks rather than alone',
    ],
    habitat: ['weedy fields', 'thistle and sunflower patches', 'feeders'],
    facts: [
      'Summer gold and winter olive are the same bird in a different coat. This is the one that surprises people most.',
      'It is almost entirely vegetarian, which is rare for a songbird — even the chicks are fed seeds.',
      'It nests in late summer, later than almost any other bird here, so that thistle down is ready to line the nest.',
    ],
    dimorphic: true,
    confusableWith: ['house_finch'],
    voices: [
      {
        kind: 'flight_call',
        mnemonic: 'po-ta-to-chip!',
        tone: 'whistle',
        pitchShape: 'wandering',
        repeats: null,
        note: 'Four bouncing notes, given while flying overhead — one burst per bounce. Look up when you hear it.',
      },
      {
        kind: 'song',
        mnemonic: null,
        tone: 'chatter',
        pitchShape: 'wandering',
        repeats: null,
        note: 'A long sweet twittering warble that rambles on without a clear pattern.',
      },
    ],
  },
  {
    code: 'house_finch',
    commonName: 'House Finch',
    scientificName: 'Haemorhous mexicanus',
    inatTaxonId: 199840,
    xcQuery: 'gen:haemorhous sp:mexicanus',
    emoji: '🐦',
    crew: 'crew2',
    season: 'year_round',
    localPoints: 20,
    sizeAnchor: 'sparrow',
    lengthInches: 5.5,
    bill: 'cone',
    colourHook:
      'The male has red on his forehead, throat and rump over a plain brown back. The female is brown and streaky with a blank face.',
    fieldMarks: [
      'brown streaks running down the flanks and belly — even on the red male',
      'red only at the front and on the rump, never over the whole back',
      'a plain face with no stripe, on the female',
    ],
    behavior: [
      'sits at the feeder and eats, rather than grabbing one seed and leaving',
      'comes in noisy flocks',
      'nests in hanging baskets, wreaths and porch corners',
    ],
    habitat: ['towns', 'yards', 'buildings', 'feeders'],
    facts: [
      'It is not originally an eastern bird at all. Pet shops in New York sold them illegally as "Hollywood Finches", and in 1940 the sellers set them loose to avoid being arrested. They spread across the whole east and reached Kentucky in the late 1970s.',
      'How red a male turns depends on what he ate while growing those feathers. Redder males are better at finding food, and females prefer them.',
      'The streaky flanks are the giveaway. Its cousin the Purple Finch has a clean white belly.',
    ],
    dimorphic: true,
    confusableWith: ['american_goldfinch', 'purple_finch'],
    voices: [
      {
        kind: 'song',
        mnemonic: null,
        tone: 'chatter',
        pitchShape: 'wandering',
        repeats: null,
        note: 'A long tumbling jumble of warbled notes, usually ending on a rough buzzy note that slides upward.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // CREW 3 — The Winter Visitors. NOT here in summer.
  //
  // The whole point of this crew is that it ARRIVES. Juncos reach
  // Louisville in mid-October and are gone by April, so a child who
  // opens the bird hide in July cannot see these units at all, and one
  // who opens it in November finds five birds that were not there
  // before. That is a real thing happening outside the window, and the
  // app should behave as though it noticed.
  //
  // Two of the five are the confusion pairs the design named:
  // Purple Finch against the House Finch she already knows from Crew
  // 2, and American Tree Sparrow against the summer Chipping Sparrow.
  // Both separate on the CALENDAR before they separate on any field
  // mark, which is the lesson.
  //
  // The Cedar Waxwing earns its place differently: it does not come to
  // feeders at all. It eats berries. Having one bird in the crew that
  // will never appear at the seed tray is how a child learns that a
  // feeder is not the whole world.
  // ─────────────────────────────────────────────────────────────
  {
    code: 'dark_eyed_junco',
    commonName: 'Dark-eyed Junco',
    scientificName: 'Junco hyemalis',
    inatTaxonId: 10094,
    // Junco hyemalis hyemalis — the Slate-colored form, the one that
    // winters in Kentucky. See inatPhotoTaxonId above.
    inatPhotoTaxonId: 132764,
    xcQuery: 'gen:junco sp:hyemalis',
    emoji: '🐦',
    crew: 'crew3',
    season: 'winter',
    localPoints: 20,
    sizeAnchor: 'sparrow',
    lengthInches: 6.3,
    bill: 'cone',
    colourHook:
      'Slate gray above and clean white below, as if it had been dipped halfway. A small pale pink bill, and white tail feathers that flash when it flies.',
    fieldMarks: [
      'a crisp line where the gray stops and the white starts',
      'a small pale pink bill',
      'white outer tail feathers that flash open in flight',
    ],
    behavior: [
      'feeds on the GROUND under the feeder, almost never on it',
      'hops backwards with both feet to kick leaves aside',
      'travels in loose flocks all winter',
    ],
    habitat: ['under feeders', 'brushy edges', 'leaf litter beneath trees'],
    facts: [
      'People call it the snowbird, because it turns up about when the cold does and leaves about when the cold goes.',
      'It spends the summer nesting far to the north, in Canada and the high mountains. Your winter is its vacation.',
      'The flash of white in its tail is a signal to other juncos, not camouflage — it opens as it flies away.',
    ],
    dimorphic: false,
    voices: [
      {
        kind: 'song',
        mnemonic: null,
        tone: 'trill',
        pitchShape: 'flat',
        repeats: null,
        note: 'An even, musical trill on one pitch, like a tiny bicycle bell that keeps ringing.',
      },
      {
        kind: 'call',
        mnemonic: null,
        tone: 'whistle',
        pitchShape: 'flat',
        repeats: null,
        note: 'A sharp little "tick", often several at once from a flock in a hedge.',
      },
    ],
  },
  {
    code: 'white_throated_sparrow',
    commonName: 'White-throated Sparrow',
    scientificName: 'Zonotrichia albicollis',
    inatTaxonId: 9184,
    xcQuery: 'gen:zonotrichia sp:albicollis',
    emoji: '🐦',
    crew: 'crew3',
    season: 'winter',
    localPoints: 40,
    sizeAnchor: 'sparrow',
    lengthInches: 6.7,
    bill: 'cone',
    colourHook:
      'A streaky brown sparrow with a boldly striped head — and a clean white bib at the throat, with a small yellow spot just in front of each eye.',
    fieldMarks: [
      'a bright white throat patch, sharply edged',
      'a yellow spot between the eye and the bill',
      'black and white (or brown and tan) stripes over the crown',
    ],
    behavior: [
      'scratches in leaf litter with both feet at once',
      'stays low in brush and hops out to feed',
      'sings even in winter, which most birds do not',
    ],
    habitat: ['brush piles', 'hedgerows', 'the ground under feeders'],
    facts: [
      'Its song sounds like it is whistling "Oh sweet Canada Canada Canada" — and Canada really is where it goes to nest.',
      'The yellow spot in front of the eye is called the lore. Once you have seen it you cannot unsee it.',
      'Some have black and white head stripes and some have brown and tan, and they are not male and female — they are two kinds that almost always pair with the other kind.',
    ],
    dimorphic: false,
    voices: [
      {
        kind: 'song',
        mnemonic: 'oh sweet Canada Canada',
        tone: 'whistle',
        pitchShape: 'falling',
        repeats: 3,
        note: 'Two long clear whistles, then a shaky three-note phrase repeated. Thin, pure and a little sad.',
      },
    ],
    confusableWith: ['american_tree_sparrow'],
  },
  {
    code: 'american_tree_sparrow',
    commonName: 'American Tree Sparrow',
    scientificName: 'Spizelloides arborea',
    inatTaxonId: 474210,
    xcQuery: 'gen:spizelloides sp:arborea',
    emoji: '🐦',
    crew: 'crew3',
    season: 'winter',
    localPoints: 60,
    sizeAnchor: 'sparrow',
    lengthInches: 6.3,
    bill: 'cone',
    colourHook:
      'A neat gray-faced sparrow with a rusty cap and a rusty line behind the eye — and one dark smudge in the middle of a plain gray chest.',
    fieldMarks: [
      'a single dark spot in the center of the chest, like a button',
      'a rusty cap and a rusty stripe behind the eye',
      'a bill that is dark on top and yellow underneath',
    ],
    behavior: [
      'feeds on the ground in small winter flocks',
      'often mixes in with juncos',
      'perches on weed stalks and rides them down to the seeds',
    ],
    habitat: ['weedy fields', 'brushy edges', 'under feeders'],
    facts: [
      'It is badly named: it does not much like trees, and it nests on the ground on the Arctic tundra.',
      'It looks very like the Chipping Sparrow — but a Chipping Sparrow is a SUMMER bird here. If it is January, it is this one.',
      'It has to eat about its own weight in seeds every single day to stay warm enough through a winter night.',
    ],
    dimorphic: false,
    voices: [
      {
        kind: 'call',
        mnemonic: null,
        tone: 'whistle',
        pitchShape: 'wandering',
        repeats: null,
        note: 'A soft musical "teel-wit", and a thin high "seet" from a flock.',
      },
    ],
    confusableWith: ['white_throated_sparrow'],
  },
  {
    code: 'purple_finch',
    commonName: 'Purple Finch',
    scientificName: 'Haemorhous purpureus',
    inatTaxonId: 199841,
    xcQuery: 'gen:haemorhous sp:purpureus',
    emoji: '🐦',
    crew: 'crew3',
    season: 'winter',
    localPoints: 80,
    sizeAnchor: 'sparrow',
    lengthInches: 6,
    bill: 'cone',
    colourHook:
      'The male looks as though he was dipped head-first in raspberry juice — the color runs right down over his back and wings. The female is brown with a bold white stripe over the eye.',
    fieldMarks: [
      'raspberry color spread over the head, back AND wings, not just the front',
      'a heavier, blunter bill than a House Finch',
      'on the female, a strong white eyebrow and a dark cheek patch',
    ],
    behavior: [
      'comes to sunflower seed in winter, often in small groups',
      'sits higher in trees than a House Finch does',
      'some winters there are many and some winters almost none',
    ],
    habitat: ['woodland edges', 'conifers', 'feeders in winter'],
    facts: [
      'A famous bird book describes the male as a sparrow dipped in raspberry juice, which is the best description anyone has managed.',
      'It is the one to compare with the House Finch you already know. House Finch red sits mostly on the front; Purple Finch color goes over the back and wings too.',
      'It does not come every winter. In some years the northern seed crop fails and they pour south; in others you may not see one at all.',
    ],
    dimorphic: true,
    voices: [
      {
        kind: 'song',
        mnemonic: null,
        tone: 'chatter',
        pitchShape: 'wandering',
        repeats: null,
        note: 'A fast rich warble that tumbles along without a rough note at the end.',
      },
    ],
    confusableWith: ['house_finch'],
  },
  {
    code: 'cedar_waxwing',
    commonName: 'Cedar Waxwing',
    scientificName: 'Bombycilla cedrorum',
    inatTaxonId: 7428,
    xcQuery: 'gen:bombycilla sp:cedrorum',
    emoji: '🐦',
    crew: 'crew3',
    season: 'winter',
    localPoints: 60,
    sizeAnchor: 'sparrow',
    lengthInches: 7.1,
    bill: 'all_purpose',
    colourHook:
      'Silky fawn-brown, smooth as velvet, with a swept-back crest, a narrow black mask, and a tail that looks as if it has been dipped in bright yellow paint.',
    fieldMarks: [
      'a black mask edged in white, like a tiny bandit',
      'a yellow band across the very tip of the tail',
      'red waxy spots on the wingtips of older birds',
    ],
    behavior: [
      'arrives as a whole flock, strips a berry bush, and leaves',
      'passes berries beak to beak along a branch to each other',
      'almost never comes to a seed feeder',
    ],
    habitat: ['berry bushes', 'holly and juniper', 'fruiting trees in streets'],
    facts: [
      'It is named for the red waxy tips on its wing feathers. Nobody is quite sure what they are for, but older birds have more of them.',
      'A row of waxwings on a branch will pass a single berry from beak to beak down the line and back again before somebody eats it.',
      'It will not come to your seed feeder however long you wait. If you want waxwings, plant berries.',
    ],
    dimorphic: false,
    voices: [
      {
        kind: 'call',
        mnemonic: null,
        tone: 'whistle',
        pitchShape: 'flat',
        repeats: null,
        note: 'A very high, thin, trembling whistle — so high that some grown-ups genuinely cannot hear it.',
      },
    ],
  },
];

export function getBird(code: string): BirdData | undefined {
  return BIRD_CATALOG.find(b => b.code === code);
}

export function birdsOfCrew(crew: string): BirdData[] {
  return BIRD_CATALOG.filter(b => b.crew === crew);
}

/** Crew codes in teaching order — commonest birds first. */
export function crewCodes(): string[] {
  const seen: string[] = [];
  for (const b of BIRD_CATALOG) if (!seen.includes(b.crew)) seen.push(b.crew);
  return seen;
}

/**
 * How this bird compares to the nearest anchor. Drives the size
 * exercises, and keeps them honest — a chickadee really is much
 * smaller than a sparrow, and the wording should admit it.
 */
export function sizeComparison(bird: BirdData): string {
  const anchor = ANCHOR_INCHES[bird.sizeAnchor];
  const ratio = bird.lengthInches / anchor;
  if (ratio < 0.85) return `smaller than a ${bird.sizeAnchor}`;
  if (ratio > 1.15) return `bigger than a ${bird.sizeAnchor}`;
  return `about the size of a ${bird.sizeAnchor}`;
}

/** Every voice of a given kind across the catalog — for Phase 2 harvesting. */
export function voicesOfKind(kind: VoiceKind): Array<{ bird: BirdData; voice: BirdVoice }> {
  return BIRD_CATALOG.flatMap(bird =>
    bird.voices.filter(v => v.kind === kind).map(voice => ({ bird, voice })),
  );
}
