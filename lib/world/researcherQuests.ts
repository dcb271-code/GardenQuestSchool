// lib/world/researcherQuests.ts
//
// The RESEARCHER tier — a second, harder quest chain per habitat that
// unlocks after the habitat is BUILT, for learners at Level 3+. Where
// the build quest asks "how does this habitat work?", the researcher
// quest thinks like a field scientist: survival strategies, indicator
// species, mimicry, population reasoning.
//
// Completing one earns a researcher badge (🔬) for that habitat,
// persisted in world_state.garden.researcher_badges, plus a 'wondering'
// virtue gem (1/day cap applies via grantVirtueGem). Badged habitats
// can attract rare visitors — see speciesCatalog.requiresResearcherBadge
// and arrivals.pickArrivalForSession.
//
// Same authoring rules as habitatQuests: 4 choices, exactly one
// correct, authored at index 0 and shuffled at render; wrong answers
// plausible-but-distinct or gently silly.

import type { QuestQuestion } from './habitatQuests';

export const RESEARCHER_MIN_LEVEL = 3;

export interface ResearcherQuest {
  habitatCode: string;
  intro: string;        // one-line opening shown before Q1
  questions: QuestQuestion[];
  outro: string;        // one-line closing on the celebration screen
  gemLine: string;      // narrative for the 'wondering' gem grant
}

export const RESEARCHER_QUESTS: Record<string, ResearcherQuest> = {
  bunny_burrow: {
    habitatCode: 'bunny_burrow',
    intro: 'Time to study the burrow like a real field researcher.',
    questions: [
      {
        prompt: 'A researcher counts 12 rabbits in spring — and 30 by midsummer. Why do rabbit families grow so fast?',
        choices: [
          'Lots of babies, several times a summer — since many get eaten, fast breeding keeps the family going',
          'Rabbits adopt every stray bunny they meet',
          'The warm weather makes each rabbit split in two',
          'They only LOOK like more rabbits — they run in circles',
        ],
        correctIndex: 0,
      },
      {
        prompt: 'When a hawk glides over, a cottontail freezes perfectly still. Why freeze instead of run?',
        choices: [
          'Hawk eyes catch movement first — a still rabbit is nearly invisible in the grass',
          'Rabbits get too scared to move their legs',
          'Freezing keeps the rabbit warm',
          'It is showing the hawk who is bravest',
        ],
        correctIndex: 0,
      },
      {
        prompt: "A rabbit's front teeth never stop growing — ever. What daily habit keeps them the right length?",
        choices: [
          'Gnawing tough plants, bark, and twigs files them down',
          'Rabbits visit a dentist mouse each spring',
          'They fall out and regrow each month like leaves',
          'Carrots are actually tiny toothbrushes',
        ],
        correctIndex: 0,
      },
    ],
    outro: 'You studied the meadow like a scientist — someone shy may have noticed.',
    gemLine: 'You wondered how a burrow really works — population counts and all. That\'s field science.',
  },

  frog_pond: {
    habitatCode: 'frog_pond',
    intro: 'Grab your field notebook — the pond has deeper secrets.',
    questions: [
      {
        prompt: 'Scientists call frogs an INDICATOR SPECIES. If a pond\'s frogs start disappearing, it\'s an early warning that…',
        choices: [
          'something is wrong with the water — frogs\' thin skin soaks up pollution first',
          'the frogs found a better pond with a diving board',
          'winter is coming soon',
          'the pond has too many lily pads',
        ],
        correctIndex: 0,
      },
      {
        prompt: 'Spring peepers survive winter almost frozen solid. What\'s their trick?',
        choices: [
          'Their bodies make a sugary antifreeze that protects them until spring',
          'They wear tiny coats of moss',
          'They keep hopping all winter so they never cool down',
          'They hold their breath until March',
        ],
        correctIndex: 0,
      },
      {
        prompt: 'A frog lays hundreds of eggs; a bird lays just a few. Why so many?',
        choices: [
          'Most eggs and tadpoles get eaten — hundreds give a few a chance to grow up',
          'Frogs cannot count, so they lose track',
          'The extra eggs keep the pond warm',
          'Each egg holds half a tadpole',
        ],
        correctIndex: 0,
      },
    ],
    outro: 'The pond keeps honest records — and so do you now.',
    gemLine: 'You thought about what a pond\'s frogs can TELL us. Indicator species are real science.',
  },

  bee_hotel: {
    habitatCode: 'bee_hotel',
    intro: 'Look closer at the hotel — a researcher sees what a visitor misses.',
    questions: [
      {
        prompt: 'One mason bee pollinates as much as ~100 honeybees. What makes her such a champion?',
        choices: [
          'She carries pollen loose and dry on her belly hairs, dusting every single flower she lands on',
          'She is one hundred times bigger than a honeybee',
          'She flies one hundred times faster',
          'She brings ninety-nine friends inside her pockets',
        ],
        correctIndex: 0,
      },
      {
        prompt: 'A garden\'s bee hotel stays empty all spring — and the garden has no mud puddle anywhere. A researcher\'s hunch:',
        choices: [
          'Mason bees need wet mud to build the walls between their egg rooms',
          'The bees are waiting for an invitation letter',
          'The hotel needs a tiny front desk',
          'Bees only move in during winter',
        ],
        correctIndex: 0,
      },
      {
        prompt: 'Bee-hotel keepers replace the nesting tubes every year or two. Why would that be?',
        choices: [
          'Old tubes collect mites and mold that can harm next spring\'s baby bees',
          'The bees get bored of the wallpaper',
          'Used tubes shrink in the rain',
          'New tubes smell like flowers',
        ],
        correctIndex: 0,
      },
    ],
    outro: 'You now know more about mason bees than most grown-ups do.',
    gemLine: 'You wondered why the hotel works the way it does — that\'s a researcher\'s question.',
  },

  butterfly_bush: {
    habitatCode: 'butterfly_bush',
    intro: 'The bush has stories only a careful observer can read.',
    questions: [
      {
        prompt: 'Most monarchs live about 5 weeks — but the ones born in late summer live 8 MONTHS. What is that generation\'s special job?',
        choices: [
          'Flying thousands of miles south to Mexico for winter — they are the migration generation',
          'Guarding the bush while the others sleep',
          'Growing extra wings for their children',
          'Nothing — they are just lucky',
        ],
        correctIndex: 0,
      },
      {
        prompt: 'The viceroy butterfly looks almost exactly like a poisonous monarch — but isn\'t poisonous. Why does the disguise keep it safe?',
        choices: [
          'Birds can\'t tell them apart, so they don\'t risk a bite — that copying is called mimicry',
          'The viceroy tastes even worse than a monarch',
          'Monarchs protect anyone wearing their colors',
          'It doesn\'t — birds eat viceroys constantly',
        ],
        correctIndex: 0,
      },
      {
        prompt: 'Nectar flowers feed grown butterflies. For MONARCH CATERPILLARS, a garden must also grow…',
        choices: [
          'Milkweed — the one and only plant monarch caterpillars can eat',
          'Extra-sweet roses',
          'Tiny vegetable beds',
          'Any leaf will do — caterpillars aren\'t picky',
        ],
        correctIndex: 0,
      },
    ],
    outro: 'Migration, mimicry, milkweed — you read the bush like a book.',
    gemLine: 'You wondered about the monarch\'s long journey. Naturalists have wondered the same for a century.',
  },

  ant_hill: {
    habitatCode: 'ant_hill',
    intro: 'Kneel down close — the colony rewards a patient observer.',
    questions: [
      {
        prompt: 'An ant can carry about 50 times its own weight. If YOU were that strong, you could lift roughly…',
        choices: [
          'a small car above your head',
          'a loaf of bread',
          'one very heavy backpack',
          'a paper airplane',
        ],
        correctIndex: 0,
      },
      {
        prompt: 'Some ants keep herds of aphids the way farmers keep cows — guarding them from ladybugs. What do the ants get in return?',
        choices: [
          'A sweet syrup called honeydew that the aphids make',
          'Wool for tiny blankets',
          'Riding lessons',
          'Nothing — ants just enjoy the company',
        ],
        correctIndex: 0,
      },
      {
        prompt: 'When floodwater comes, some ants link their legs into a living raft that floats. Why take such a risk?',
        choices: [
          'The colony survives together or not at all — the queen rides safely in the middle',
          'Ants secretly love swimming',
          'Rafting is faster than walking',
          'The water is only ankle-deep to an ant',
        ],
        correctIndex: 0,
      },
    ],
    outro: 'Strength, farming, rafts — the colony is an engineering marvel, and you noticed.',
    gemLine: 'You wondered how a thousand tiny lives act like one big one. So do myrmecologists — ant scientists.',
  },

  log_pile: {
    habitatCode: 'log_pile',
    intro: 'A dead log is more alive than it looks. Prove it.',
    questions: [
      {
        prompt: 'A researcher claims a rotting log holds MORE living things than a healthy tree. How can that be?',
        choices: [
          'Thousands of decomposers — fungi, beetles, worms — all make their living off the dead wood',
          'It can\'t — dead wood is empty wood',
          'Squirrels hide extra squirrels inside',
          'The log is secretly still growing',
        ],
        correctIndex: 0,
      },
      {
        prompt: 'On summer nights, fireflies blink in exact patterns. What are the flashes actually for?',
        choices: [
          'Each species blinks its own code so it can find its own kind in the dark',
          'They are practicing for a light show',
          'The blinks scare away the moon',
          'Their lights flicker because the batteries are low',
        ],
        correctIndex: 0,
      },
      {
        prompt: 'Why can a messy log pile shelter creatures that a perfectly tidy garden cannot?',
        choices: [
          'Its damp, dark crevices stay cool in heat and sheltered in frost — tidy gardens have no hiding places',
          'Creatures prefer places that smell of sawdust',
          'Tidy gardens are too embarrassing to live in',
          'It can\'t — tidy gardens hold more creatures',
        ],
        correctIndex: 0,
      },
    ],
    outro: 'You saw the invisible city inside the wood. That\'s a naturalist\'s eye.',
    gemLine: 'You wondered what lives inside a dead log — and found a whole city. Decomposers salute you.',
  },
};

export function getResearcherQuest(code: string): ResearcherQuest | undefined {
  return RESEARCHER_QUESTS[code];
}
