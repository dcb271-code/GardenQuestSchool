// lib/world/lunaTreats.ts
//
// Feeding Luna, and what she tells you afterwards.
//
// Cecily asked to be able to feed the cat. The obvious build is a
// button that plays a sound, which is a toy and is finished in a day.
// So a treat buys a fact: Luna sits down and tells her one true thing
// about the natural world, and never the same one twice until she has
// heard them all.
//
// ONE TREAT A DAY, in the house style. Not because feeding is a reward
// to be rationed — it is affection, and affection should be cheap — but
// because a fact you get thirty of in one sitting is thirty facts you
// remember none of. Coming back tomorrow is how the facts land.
//
// The facts are cat-shaped where they can be: things a cat would
// plausibly notice, or that are about her senses. Everything checkable.

export interface LunaFact {
  id: string;
  text: string;
}

export const LUNA_FACTS: LunaFact[] = [
  { id: 'whiskers',
    text: 'My whiskers are almost exactly as wide as I am. That is how I know in the dark whether a gap will fit me — I do not look, I feel the edges with my face.' },
  { id: 'purr_frequency',
    text: 'A purr sits at about 25 vibrations a second. That is in the range that helps bone heal, which may be why cats purr when hurt as well as when happy.' },
  { id: 'no_sweet',
    text: 'I cannot taste sweet things at all. The gene for it is broken in every cat there is, so sugar is nothing to me. A saucer of honey would be a saucer of wet.' },
  { id: 'moth_ears',
    text: 'Some moths can hear a bat coming and drop straight out of the air to escape. Watch the moths around your moonflower on a warm night and you may see one just fall.' },
  { id: 'earthworm_castings',
    text: 'The little curls of soil on your lawn in the morning are earthworm castings — soil that has been eaten and passed straight through. A worm can move its own weight in earth every day.' },
  { id: 'crow_faces',
    text: 'Crows remember human faces for years, and they tell other crows. A crow that decided it disliked somebody can pass that opinion to birds that never met them.' },
  { id: 'squirrel_fake',
    text: 'A squirrel that thinks it is being watched will dig a hole, pretend to put a nut in, and pack the empty hole down carefully. The real nut is still in its mouth.' },
  { id: 'cat_landing',
    text: 'When I fall I turn myself the right way up without pushing off anything. I twist my front half one way and my back half the other, and the two cancel out.' },
  { id: 'firefly_code',
    text: 'Every kind of firefly flashes in its own pattern, like a name being spelled out. Some females copy another species\' pattern to lure that male in, and then eat him.' },
  { id: 'acorn_forest',
    text: 'Most of an oak wood was planted by animals that forgot. A jay can bury thousands of acorns in one autumn and never find them all — the forgotten ones become trees.' },
  { id: 'cat_night_eyes',
    text: 'My eyes shine in a torch beam because there is a mirror behind them, bouncing light back through a second time. It is why I see so well at dusk and so badly in full dark.' },
  { id: 'spider_silk',
    text: 'An orb weaver eats her own web at the end of the day and spins a fresh one from it. The silk goes back into her body and comes out again as tomorrow\'s trap.' },
  { id: 'bat_insects',
    text: 'One little brown bat can eat a thousand insects in a single night. The bats over your garden at dusk are doing you an enormous favour.' },
  { id: 'cat_sleep',
    text: 'I sleep about sixteen hours a day, and most of it is light dozing with my ears still turning. I am rarely as asleep as I look.' },
  { id: 'monarch_generations',
    text: 'It takes several generations of monarch butterflies to travel north in spring, but only one to fly the whole way back to Mexico in autumn. That last one lives far longer than its parents did.' },
  { id: 'mole_worms',
    text: 'A mole bites the heads off earthworms and stores them still alive in a cellar. Hundreds of them, kept fresh, waiting for winter.' },
  { id: 'cat_nose_print',
    text: 'The pattern of ridges on my nose is unique to me, like a fingerprint. No other cat has one the same.' },
  { id: 'cicada_years',
    text: 'Some cicadas spend thirteen or seventeen years underground as young, then all come up in the same few weeks. Both those numbers are prime, which makes them very hard for a predator to plan around.' },
];

export interface LunaState {
  /** ISO date of the last treat. */
  lastFed?: string;
  /** Fact ids she has already been told. */
  factsHeard: string[];
}

export function emptyLuna(): LunaState {
  return { factsHeard: [] };
}

/** One treat a day. */
export function canFeed(state: { lastFed?: string }, today: string): boolean {
  return state.lastFed !== today;
}

/**
 * The next fact she has not heard.
 *
 * In order rather than at random, so nothing repeats until everything
 * has been said once. Returns null when she has heard them all — at
 * which point Luna still takes the treat, she just has nothing new.
 */
export function nextFact(heard: string[]): LunaFact | null {
  return LUNA_FACTS.find(f => !heard.includes(f.id)) ?? null;
}

export function factsRemaining(heard: string[]): number {
  return LUNA_FACTS.filter(f => !heard.includes(f.id)).length;
}
