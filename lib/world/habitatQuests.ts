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

// ─── Level 3+ question tier ────────────────────────────────────────────
//
// Same quests, harder thinking. The grade-2 sets above are recall
// ("what do bunnies nibble?"); these are REASONING — food chains,
// metamorphosis, decomposers, adaptation why-questions. Served in
// place of the base questions for learners at Level 3+ (the intro and
// outro stay the same). Same authoring rules: 4 choices, correct at
// index 0 (shuffled at render), wrong answers plausible or gently silly.

export const HABITAT_QUESTIONS_L3: Record<string, QuestQuestion[]> = {
  bunny_burrow: [
    {
      prompt: 'A good burrow has more than one exit. Why dig extra doors?',
      choices: [
        'So a bunny can slip out one hole while a fox digs at another',
        'To let more sunlight into the tunnels',
        'Bunnies forget where the first door is',
        'The extra dirt makes a nicer hill',
      ],
      correctIndex: 0,
    },
    {
      prompt: 'Grass feeds the rabbit, and the rabbit feeds the fox. Where did the energy in the fox FIRST come from?',
      choices: [
        'The sun — the grass captured its light',
        "The fox's sharp teeth",
        "The rabbit's warm fur",
        'The soil around the burrow',
      ],
      correctIndex: 0,
    },
    {
      prompt: "In winter the meadow grass dies back. What's a cottontail's survival move?",
      choices: [
        'Switch to nibbling bark, twigs, and buds',
        'Hibernate underground until spring like a bear',
        'Migrate somewhere warm like a goose',
        'Stop eating until the grass grows back',
      ],
      correctIndex: 0,
    },
  ],
  frog_pond: [
    {
      prompt: 'A tadpole breathes with gills, then grows lungs. Why is that switch worth all the trouble?',
      choices: [
        'It lets the grown frog leave the water and hunt on land too',
        'Lungs are just bigger gills',
        'Gills stop working after a year',
        "It isn't — frogs never leave the water",
      ],
      correctIndex: 0,
    },
    {
      prompt: 'Mosquito → dragonfly → frog → heron. If the mosquitoes vanished, who would feel it LAST?',
      choices: [
        'The heron, at the top of the chain',
        'The dragonfly, who eats the mosquitoes',
        'The frog, in the middle',
        'No one — food chains are not connected',
      ],
      correctIndex: 0,
    },
    {
      prompt: 'A frog drinks and even breathes through its damp skin. What does that tell you about where frogs can live?',
      choices: [
        'Only damp places — a dry field would be dangerous for them',
        'Anywhere at all, even deserts',
        'Only underwater, forever',
        'Only in treetops where rain lands first',
      ],
      correctIndex: 0,
    },
  ],
  bee_hotel: [
    {
      prompt: 'A mason bee seals each egg into its own little mud room — with a lump of pollen inside. Why the pollen?',
      choices: [
        "It's a packed lunch waiting for the baby bee when it hatches",
        'It glues the mud door shut',
        'It makes the room smell nice',
        "It's a soft pillow for the egg",
      ],
      correctIndex: 0,
    },
    {
      prompt: 'Honeybees live in big hives; mason bees live all alone. What job do both do for flowering plants?',
      choices: [
        'Carry pollen flower to flower so the plants can make seeds',
        'Drink up extra nectar so it never spoils',
        'Guard the petals from hungry beetles',
        'Bring the flowers water on dry days',
      ],
      correctIndex: 0,
    },
    {
      prompt: 'Why do good bee hotels have tubes of several different widths?',
      choices: [
        'Different bee species need different-sized doorways',
        'Wide tubes are for winter and narrow ones for summer',
        'So the wind can whistle a tune through them',
        'Bees enjoy a variety of decorations',
      ],
      correctIndex: 0,
    },
  ],
  butterfly_bush: [
    {
      prompt: 'Monarch caterpillars eat only milkweed — which makes them taste terrible to birds. What is their bright orange color saying?',
      choices: [
        '"Don\'t eat me — I taste awful." It\'s a warning sign.',
        '"I am ripe, like a little orange."',
        'Nothing — orange is just pretty.',
        '"I am secretly a flower."',
      ],
      correctIndex: 0,
    },
    {
      prompt: "Inside the chrysalis, the caterpillar's body almost completely dissolves and rebuilds into a butterfly. What is this change called?",
      choices: [
        'Metamorphosis',
        'Hibernation',
        'Camouflage',
        'Pollination',
      ],
      correctIndex: 0,
    },
    {
      prompt: 'A butterfly sips nectar through a curled straw called a proboscis. What does the flower get in return?',
      choices: [
        'Its pollen gets carried to the next flower it visits',
        'A song, hummed politely',
        'A guard for the night',
        'Nothing — flowers need no help from visitors',
      ],
      correctIndex: 0,
    },
  ],
  ant_hill: [
    {
      prompt: 'An ant colony has queens, workers, and soldiers — each with one job. Why does splitting up the work help the colony?',
      choices: [
        'Each job gets done well, by ants built exactly for it',
        'It stops arguments about who is fastest',
        'Ants get bored if they do two things',
        "It doesn't help — every ant secretly does every job",
      ],
      correctIndex: 0,
    },
    {
      prompt: 'Ants mark the way to food with an invisible scent trail. What happens as MORE ants walk it?',
      choices: [
        'The trail smells stronger, so even more ants can find the food',
        'The scent gets used up and disappears',
        'The ants start getting lost more often',
        'The trail turns into a tiny road of pebbles',
      ],
      correctIndex: 0,
    },
    {
      prompt: 'Ant tunnels loosen the soil under the garden. How does that quietly help the plants above?',
      choices: [
        'Air and rainwater can reach the roots more easily',
        'It keeps the plants politely short',
        'It warms the soil like an oven',
        "It doesn't — plants ignore the soil",
      ],
      correctIndex: 0,
    },
  ],
  log_pile: [
    {
      prompt: 'Fungi and beetles slowly turn a dead log back into soil. What do we call living things with this recycling job?',
      choices: [
        'Decomposers',
        'Predators',
        'Pollinators',
        'Producers',
      ],
      correctIndex: 0,
    },
    {
      prompt: 'Imagine nothing ever rotted — no decomposers at all. What would happen to the forest?',
      choices: [
        'Dead leaves and logs would pile up, and the soil would run out of food',
        'The forest would grow twice as fast',
        'Nothing would change at all',
        'The trees would learn to eat rocks instead',
      ],
      correctIndex: 0,
    },
    {
      prompt: 'A centipede hunts at night and hides under bark all day. Why hide when the sun is out?',
      choices: [
        'Sunshine dries out its body — and daytime birds are hunting',
        'It is afraid of the dark',
        'Bark is warmer than sunlight',
        'It needs somewhere quiet to practice counting its legs',
      ],
      correctIndex: 0,
    },
  ],
};

/** Learners at this level and above get the reasoning-tier questions. */
export const QUEST_L3_MIN_LEVEL = 3;

export function getHabitatQuest(code: string, learnerLevel: number = 2): HabitatQuest | undefined {
  const quest = HABITAT_QUESTS[code];
  if (!quest) return undefined;
  const l3 = HABITAT_QUESTIONS_L3[code];
  if (learnerLevel >= QUEST_L3_MIN_LEVEL && l3) {
    return { ...quest, questions: l3 };
  }
  return quest;
}
