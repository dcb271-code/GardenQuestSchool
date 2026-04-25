/**
 * Ecology mini-lessons for each habitat. Completing a habitat's quest is
 * what BUILDS the habitat in the garden — it's the small piece of
 * inquiry that turns a possible habitat into a real one a child has
 * thought about. Three questions each — short and meaningful, never
 * a chore.
 *
 * Content choices:
 *  - Each question has 4 choices, exactly one correct.
 *  - Wrong choices are gently silly or plausible-but-distinct so a
 *    careful listener can rule them out.
 *  - Wording is grade-2 friendly.
 */

export interface QuestQuestion {
  prompt: string;
  choices: string[];
  correctIndex: number;
}

export interface HabitatQuest {
  habitatCode: string;
  intro: string;       // one-line opening shown before Q1
  questions: QuestQuestion[];
  outro: string;       // one-line closing on the celebration screen
}

export const HABITAT_QUESTS: Record<string, HabitatQuest> = {
  bunny_burrow: {
    habitatCode: 'bunny_burrow',
    intro: "Let's get a bunny burrow ready in the meadow.",
    questions: [
      {
        prompt: 'Why do bunnies dig burrows underground?',
        choices: [
          'To stay safe and warm',
          'To find buried treasure',
          'To collect rocks',
          'For exercise',
        ],
        correctIndex: 0,
      },
      {
        prompt: "What's inside a bunny burrow?",
        choices: [
          'Tunnels and cozy little rooms',
          'A swimming pool',
          'A library of books',
          'Nothing — bunnies sleep on top',
        ],
        correctIndex: 0,
      },
      {
        prompt: 'What do bunnies like to nibble on near their burrow?',
        choices: [
          'Grass, clover, and dandelions',
          'Stones and twigs',
          'Worms and beetles',
          'Acorns only',
        ],
        correctIndex: 0,
      },
    ],
    outro: 'A bunny might come visit you soon.',
  },

  frog_pond: {
    habitatCode: 'frog_pond',
    intro: "Let's set up a small pond — the kind frogs love.",
    questions: [
      {
        prompt: 'Where do baby frogs (tadpoles) grow?',
        choices: [
          'In water',
          'On a tree branch',
          'Inside a flower',
          'Underground',
        ],
        correctIndex: 0,
      },
      {
        prompt: "How do frogs catch flies and bugs?",
        choices: [
          'With a long sticky tongue',
          'They run after them',
          'They wait for them to land',
          'They use their hands',
        ],
        correctIndex: 0,
      },
      {
        prompt: 'What lives in or around a healthy pond?',
        choices: [
          'Lily pads, dragonflies, and frogs',
          'Cars and roads',
          'Cactus plants',
          'Polar bears',
        ],
        correctIndex: 0,
      },
    ],
    outro: 'Listen for the splash — a frog may visit soon.',
  },

  bee_hotel: {
    habitatCode: 'bee_hotel',
    intro: "Let's build a hotel for solitary bees — they live alone, not in hives.",
    questions: [
      {
        prompt: 'What do bees gather from flowers?',
        choices: [
          'Nectar and pollen',
          'Petals',
          'Stems',
          'Roots',
        ],
        correctIndex: 0,
      },
      {
        prompt: 'Why are bees important to plants?',
        choices: [
          'They help flowers make seeds (pollination)',
          'They water the plants',
          'They guard the plants',
          'They sing to the plants',
        ],
        correctIndex: 0,
      },
      {
        prompt: 'Where do solitary bees lay their eggs?',
        choices: [
          'Inside small hollow tubes',
          'Inside a giant honeycomb',
          'In the pond',
          'On top of leaves',
        ],
        correctIndex: 0,
      },
    ],
    outro: 'A mason bee or two may show up soon.',
  },

  butterfly_bush: {
    habitatCode: 'butterfly_bush',
    intro: "Let's plant a bush full of nectar — butterflies can't resist.",
    questions: [
      {
        prompt: 'A caterpillar wraps itself up and turns into…?',
        choices: [
          'A butterfly',
          'A frog',
          'A bird',
          'Another caterpillar',
        ],
        correctIndex: 0,
      },
      {
        prompt: "How do butterflies drink nectar from flowers?",
        choices: [
          'With a long curly tongue (called a proboscis)',
          'With a tiny straw they carry',
          'They scoop it with their wings',
          'They suck it up through their feet',
        ],
        correctIndex: 0,
      },
      {
        prompt: 'Why do butterflies love the butterfly bush?',
        choices: [
          'It has lots of sweet nectar',
          "It's tall",
          "It's a good place to sleep",
          'They eat the leaves',
        ],
        correctIndex: 0,
      },
    ],
    outro: 'Watch for a flutter near the bush.',
  },

  ant_hill: {
    habitatCode: 'ant_hill',
    intro: "Let's make space for an ant colony to dig.",
    questions: [
      {
        prompt: 'Who lays all the eggs in an ant colony?',
        choices: [
          'The queen ant',
          'The biggest ant',
          'Every ant takes turns',
          'No one — ants come from the sky',
        ],
        correctIndex: 0,
      },
      {
        prompt: 'How do ants tell each other where food is?',
        choices: [
          'They leave a smelly trail to follow',
          'They draw a map',
          'They shout',
          'They guess',
        ],
        correctIndex: 0,
      },
      {
        prompt: "What's an ant hill like inside?",
        choices: [
          'Lots of tunnels and tiny rooms',
          'Empty',
          'Full of water',
          'Made of glass',
        ],
        correctIndex: 0,
      },
    ],
    outro: 'A line of ants may begin marching soon.',
  },

  log_pile: {
    habitatCode: 'log_pile',
    intro: "Let's stack some old logs — they're alive with little creatures.",
    questions: [
      {
        prompt: 'Who lives inside a pile of rotting logs?',
        choices: [
          'Beetles, centipedes, and tiny fungi',
          'Sharks',
          'Cows',
          'Eagles',
        ],
        correctIndex: 0,
      },
      {
        prompt: 'What slowly happens to a log over many years?',
        choices: [
          'It rots and becomes new soil',
          'It turns into stone',
          'It floats away',
          'Nothing — logs last forever',
        ],
        correctIndex: 0,
      },
      {
        prompt: 'Why are rotting logs good for the garden?',
        choices: [
          'They feed the soil so plants can grow',
          'They scare away animals',
          'They make pretty colors',
          'They are not good for the garden',
        ],
        correctIndex: 0,
      },
    ],
    outro: 'Look closely — you might spot a ladybug.',
  },
};

export function getHabitatQuest(code: string): HabitatQuest | undefined {
  return HABITAT_QUESTS[code];
}
