// lib/world/burrowTunnels.ts
//
// The Tunnels — what is behind the door in the bunny burrow.
//
// Cecily asked twice for a door, because the burrow had one thing to
// practice and one animal in it. Behind it is a cutaway of the ground
// under her own garden, with five different homes dug into it.
//
// THE TWIST IS THE COTTONTAIL, and it is why this belongs behind HER
// burrow specifically. An eastern cottontail does not dig. It scrapes a
// shallow hollow called a form and sits in it, or it moves into a hole
// somebody else dug and abandoned. The rabbit whose burrow she has been
// visiting is the one animal down here that never made one. That is a
// real fact, it is genuinely surprising, and it reframes everything
// else on the screen — every tunnel she is looking at was dug by
// somebody, and the digger is usually not who is living there now.
//
// Each animal is a short story and then questions about it. The animal
// only moves in once she can answer them, so the reward is for having
// read and understood, not for tapping. That is the same shape as the
// bird units: one pass, no farming.
//
// Everything here is checkable. Mole tunnel depths, the groundhog's
// separate toilet chamber and spy hole, the fox reusing a groundhog
// den — all real, all Kentucky.

export interface BurrowQuestion {
  prompt: string;
  choices: string[];
  /** Index into choices. */
  correct: number;
  /** Shown after answering, right or wrong. Never just "no". */
  why: string;
}

export interface BurrowAnimal {
  code: string;
  name: string;
  scientificName: string;
  /** Species code in the main catalog, when one exists. */
  speciesCode?: string;
  /** Where its home sits in the cutaway, 0–1000 x and 0–560 y. */
  x: number;
  /** How deep the main chamber sits, in the same units. */
  depth: number;
  emoji: string;
  /** One line on the map, before she has read anything. */
  teaser: string;
  /** The story. Read aloud-able, ~150 words, every fact checkable. */
  story: string[];
  questions: BurrowQuestion[];
  /** Said when the animal moves in. */
  arrival: string;
}

export const BURROW_ANIMALS: BurrowAnimal[] = [
  {
    code: 'eastern_mole',
    name: 'Eastern Mole',
    scientificName: 'Scalopus aquaticus',
    x: 130, depth: 118,
    emoji: '🦔',
    teaser: 'Who made these ridges in the lawn?',
    story: [
      'If you have ever seen a long raised ridge snaking across a lawn, you have seen a mole going past. It was not walking down a tunnel you could see into. It was pushing through the soil itself, close enough to the surface to lift the grass.',
      'A mole is built entirely for this. Its front paws are turned outward like two shovels, and it swims through earth using a breaststroke, pushing soil sideways instead of carrying it away. Its fur has no grain, so it can reverse down a tunnel without being rubbed the wrong way.',
      'It has almost no use for eyes, and its eyes are almost gone — tiny, and buried under skin. What it has instead is a nose that can feel. It hunts earthworms in the dark by touch, and it must eat most days or starve, because tunnelling is desperately hard work.',
      'The shallow ridges are its hunting runs. Much deeper down, below the frost, is a round nest chamber lined with dry grass, and that is where it sleeps.',
    ],
    questions: [
      {
        prompt: 'Why can a mole back down its own tunnel without getting stuck?',
        choices: [
          'Its fur has no grain, so it slides either way',
          'It turns around in a wide part of the tunnel',
          'It is covered in slime',
          'It digs a second tunnel to come back through',
        ],
        correct: 0,
        why: 'Most animals have fur that lies one way. A mole\'s stands straight up, so it is just as smooth backwards as forwards.',
      },
      {
        prompt: 'What is the raised ridge across a lawn?',
        choices: [
          'A hunting run just under the surface',
          'The mole\'s nest',
          'A pile of soil from a deeper tunnel',
          'A path the mole walks on top of',
        ],
        correct: 0,
        why: 'The ridge is the tunnel itself, pushed along so close to the top that the grass lifts. The nest is much deeper down.',
      },
      {
        prompt: 'How does a mole find an earthworm in total darkness?',
        choices: [
          'By touch, with a nose that can feel',
          'By seeing in the dark',
          'By listening for it',
          'By smelling the soil above it',
        ],
        correct: 0,
        why: 'Its eyes are tiny and covered with skin. Underground, feeling is worth more than seeing.',
      },
    ],
    arrival: 'The mole has moved in. Watch the lawn for ridges.',
  },
  {
    code: 'groundhog',
    name: 'Groundhog',
    scientificName: 'Marmota monax',
    x: 340, depth: 196,
    emoji: '🦫',
    teaser: 'The biggest digger of all. And the landlord.',
    story: [
      'A groundhog — also called a woodchuck — is a very large ground squirrel, and it digs the grandest burrow in the field. A single system can run for thirty or forty feet and go deep enough to sit below the winter frost.',
      'It is not one tunnel. There is a main entrance with a heap of fresh soil beside it, and there are other entrances with no heap at all, because they were dug from underneath and pushed out. Those are the escape holes, hidden in long grass, and a groundhog under threat runs for one of those.',
      'Inside there is a grass-lined sleeping chamber, a separate nursery for the young, and — this is the surprising part — a separate small chamber used as a toilet, kept well away from the bedroom.',
      'In the autumn it eats until it is round, then seals itself in and truly hibernates. Its heart slows to a few beats a minute and its body goes cold. It is one of the few animals here that genuinely sleeps the winter through.',
    ],
    questions: [
      {
        prompt: 'Why do some groundhog entrances have no pile of soil beside them?',
        choices: [
          'They were dug from below and pushed out, to stay hidden',
          'Rain washed the soil away',
          'The groundhog carried the soil to the main door',
          'They are old entrances that collapsed',
        ],
        correct: 0,
        why: 'A hidden exit with a heap of fresh earth beside it would not be hidden. Those are the escape holes.',
      },
      {
        prompt: 'What is the small separate chamber for?',
        choices: [
          'A toilet, kept away from the sleeping room',
          'Storing food for winter',
          'The babies',
          'A lookout post',
        ],
        correct: 0,
        why: 'Groundhogs keep a bathroom chamber apart from the bedroom, which is tidier than most people expect.',
      },
      {
        prompt: 'What happens to a groundhog in winter?',
        choices: [
          'It truly hibernates — its heart slows and it goes cold',
          'It sleeps lightly and wakes to eat',
          'It stays awake underground all winter',
          'It moves to a warmer field',
        ],
        correct: 0,
        why: 'This is real hibernation, not a long nap. A few heartbeats a minute, and a cold body.',
      },
    ],
    arrival: 'The groundhog is in. Everyone else down here owes it a favour.',
  },
  {
    code: 'red_fox_den',
    name: 'Red Fox',
    scientificName: 'Vulpes vulpes',
    x: 548, depth: 160,
    emoji: '🦊',
    teaser: 'Rarely digs. Usually moves in.',
    story: [
      'A red fox can dig, but most of the time it would rather not. When a vixen needs a den for her cubs in early spring, she very often finds an old groundhog burrow, widens the doorway, and moves in.',
      'She makes changes. A den usually ends up with more than one way out, so nothing can trap the family inside, and there is a chamber at the end where the cubs are born blind and gray.',
      'You can tell a fox den from the burrow it used to be. There are usually bones and feathers scattered near the entrance, the grass around it is flattened by playing cubs, and it smells strongly — foxes are not tidy.',
      'For most of the year an adult fox does not use a den at all. It sleeps out in the open, curled up with its tail wrapped over its nose like a scarf. The den is for cubs, and once the cubs are grown it is left for the next animal that wants it.',
    ],
    questions: [
      {
        prompt: 'Where does a fox den usually come from?',
        choices: [
          'An old groundhog burrow, widened',
          'The fox digs it from scratch each spring',
          'A hollow tree that fell over',
          'A tunnel left by moles',
        ],
        correct: 0,
        why: 'Digging is expensive. Taking over a groundhog\'s work is much cheaper, and foxes do it constantly.',
      },
      {
        prompt: 'How can you tell a den is being used by a fox?',
        choices: [
          'Bones and feathers outside, flattened grass, a strong smell',
          'A neat pile of soil at the door',
          'Grass growing over the entrance',
          'Tracks leading away in a straight line',
        ],
        correct: 0,
        why: 'Foxes leave the remains of meals at the door and the cubs trample everything flat. It is a messy doorstep.',
      },
      {
        prompt: 'When does an adult fox sleep in a den?',
        choices: [
          'Mostly only when raising cubs',
          'Every night of the year',
          'Only in winter',
          'Only when it rains',
        ],
        correct: 0,
        why: 'The rest of the year it sleeps outside, curled up with its tail across its nose.',
      },
    ],
    arrival: 'The fox has taken the old groundhog hole. Look for feathers at the door.',
  },
  {
    code: 'chipmunk_larder',
    name: 'Eastern Chipmunk',
    scientificName: 'Tamias striatus',
    x: 742, depth: 132,
    emoji: '🐿️',
    teaser: 'Pip lives down here. Where is the doorway?',
    story: [
      'This is Pip\'s house, and the first thing to know about it is that you cannot find the front door.',
      'A chipmunk digs its tunnel and then carries every scrap of loose soil away in its cheek pouches and scatters it somewhere else, so there is no telltale heap at the entrance. The doorway is a plain hole, usually tucked under a rock, a log or a step, and it looks like nothing at all.',
      'Inside, the tunnel can run for thirty feet or more, with side rooms off it. One of those rooms is the larder, and it is the reason for the whole operation: thousands of seeds and nuts, sorted and stacked, enough to last a winter.',
      'The bedroom is strange. A chipmunk often sleeps directly ON its food pile, so it can wake up, eat without going anywhere, and go back to sleep. It does not truly hibernate like a groundhog. It wakes every few days all winter long, snacks in bed, and dozes off again.',
    ],
    questions: [
      {
        prompt: 'Why is a chipmunk\'s front door so hard to spot?',
        choices: [
          'It carries the dug-out soil away and scatters it elsewhere',
          'It covers the hole with leaves each morning',
          'The hole is far too small to see',
          'It digs the entrance underwater',
        ],
        correct: 0,
        why: 'A heap of fresh earth is a sign saying "someone lives here". The cheek pouches carry it off.',
      },
      {
        prompt: 'Where does a chipmunk sleep?',
        choices: [
          'On top of its food pile',
          'In a grass nest by the door',
          'Curled around the entrance to guard it',
          'In a different burrow each night',
        ],
        correct: 0,
        why: 'It sleeps on the larder, so breakfast is directly underneath it.',
      },
      {
        prompt: 'How is a chipmunk\'s winter different from a groundhog\'s?',
        choices: [
          'It wakes every few days to eat, instead of truly hibernating',
          'It stays awake the whole winter',
          'It sleeps far more deeply than a groundhog',
          'It leaves for somewhere warmer',
        ],
        correct: 0,
        why: 'A groundhog goes cold and still for months. A chipmunk keeps waking up for snacks — which is why it needs that larder.',
      },
    ],
    arrival: 'Pip is home. That larder took him all autumn.',
  },
  {
    code: 'cottontail_form',
    name: 'Eastern Cottontail',
    scientificName: 'Sylvilagus floridanus',
    speciesCode: 'cottontail',
    x: 900, depth: 44,
    emoji: '🐇',
    teaser: 'The odd one out. Look how shallow it is.',
    story: [
      'Here is the surprise, and it is about the animal whose burrow you came through to get here.',
      'An eastern cottontail does not dig a burrow. It cannot really dig at all — not like the others down here. What it makes instead is called a form: a shallow scrape in long grass, just the size and shape of a crouching rabbit, and it sits in it, completely still, relying on not being seen.',
      'When a cottontail does use a hole in the ground, it is almost always somebody else\'s. An old groundhog burrow will do. Rabbits in Europe dig enormous warrens, which is where the picture in most storybooks comes from, but that is a different animal on a different continent.',
      'Her nest is barely a nest at all: a hollow in the ground, lined with grass and with fur she pulls from her own chest, and covered over so well you could walk across it and never know. She visits it only twice a day, at dawn and at dusk, because going more often would show a predator exactly where it is.',
    ],
    questions: [
      {
        prompt: 'What is a form?',
        choices: [
          'A shallow scrape in the grass, shaped like a crouching rabbit',
          'A deep tunnel with several exits',
          'A nest built up in a bush',
          'A chamber lined with stored food',
        ],
        correct: 0,
        why: 'No tunnel at all. A cottontail\'s plan is to not be seen rather than to go underground.',
      },
      {
        prompt: 'When a cottontail is in a hole in the ground, whose hole is it usually?',
        choices: [
          'Somebody else\'s — often an old groundhog burrow',
          'One it dug itself that spring',
          'A tunnel the moles made',
          'A hole washed out by rain',
        ],
        correct: 0,
        why: 'The rabbit you have been visiting never dug that burrow. Somebody else did all the work.',
      },
      {
        prompt: 'Why does a mother cottontail visit her nest only at dawn and dusk?',
        choices: [
          'Going more often would show a predator where it is',
          'She is away feeding all day',
          'The babies only eat twice a day',
          'She cannot find it in daylight',
        ],
        correct: 0,
        why: 'Every visit is a clue. Staying away is how she protects them — a nest that looks abandoned usually is not.',
      },
    ],
    arrival: 'The cottontail is settled in her form. She never did dig that burrow.',
  },
];

export function getBurrowAnimal(code: string): BurrowAnimal | undefined {
  return BURROW_ANIMALS.find(a => a.code === code);
}

export interface TunnelsState {
  /** Animal codes she has read about and answered correctly. */
  placed: string[];
}

export function emptyTunnels(): TunnelsState {
  return { placed: [] };
}

/**
 * How many questions she must get right for the animal to move in.
 *
 * All of them. Three questions is short enough that "all three" is a
 * fair bar rather than a punishing one, and a partial pass would mean
 * the animal arrives for having half-read the story — which is exactly
 * the thing this is built to avoid. She can try again immediately;
 * nothing is lost by getting it wrong.
 */
export function passed(answers: boolean[], total: number): boolean {
  return answers.length === total && answers.every(Boolean);
}
