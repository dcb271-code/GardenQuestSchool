#!/usr/bin/env tsx
/**
 * Reading pack seed — comprehensive Grade 2 buildout.
 *
 * Item types used: SightWordTap, PhonemeBlend, DigraphSort, ReadAloudSimple
 *
 * Covers: Dolch primer→3rd, CVC, digraphs, initial blends, silent-e,
 * vowel teams (ee/ea, ai/ay, oa/ow), r-controlled, diphthongs,
 * inflectional -ed/-ing, plurals, compound words, prefixes, oral reading.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { READING_STRANDS } from '../lib/packs/reading/strands';
import { READING_SKILLS } from '../lib/packs/reading/skills';

const DOLCH_PRIMER = [
  'a', 'and', 'away', 'big', 'blue', 'can', 'come', 'down',
  'find', 'for', 'funny', 'go', 'help', 'here', 'I', 'in',
  'is', 'it', 'jump', 'little', 'look', 'make', 'me', 'my',
  'not', 'one', 'play', 'red', 'run', 'said', 'see', 'the',
  'three', 'to', 'two', 'up', 'we', 'where', 'yellow', 'you',
];

const DOLCH_FIRST_GRADE = [
  'after', 'again', 'an', 'any', 'as', 'ask', 'by', 'could',
  'every', 'fly', 'from', 'give', 'going', 'had', 'has', 'her',
  'him', 'his', 'how', 'just', 'know', 'let', 'live', 'may',
  'of', 'old', 'once', 'open', 'over', 'put', 'round', 'some',
  'stop', 'take', 'thank', 'them', 'then', 'think', 'walk', 'were', 'when',
];

const DOLCH_SECOND_GRADE = [
  'always', 'around', 'because', 'been', 'before', 'best', 'both', 'buy',
  'call', 'cold', 'does', "don't", 'fast', 'first', 'five', 'found',
  'gave', 'goes', 'green', 'its', 'made', 'many', 'off', 'or',
  'pull', 'read', 'right', 'sing', 'sit', 'sleep', 'tell', 'their',
  'these', 'those', 'upon', 'us', 'use', 'very', 'wash', 'which',
  'why', 'wish', 'work', 'would', 'write', 'your',
];

const DOLCH_THIRD_GRADE = [
  'about', 'better', 'bring', 'carry', 'clean', 'cut', 'done', 'draw',
  'drink', 'eight', 'fall', 'far', 'full', 'got', 'grow', 'hold',
  'hot', 'hurt', 'if', 'keep', 'kind', 'laugh', 'light', 'long',
  'much', 'myself', 'never', 'only', 'own', 'pick', 'seven', 'shall',
  'show', 'six', 'small', 'start', 'ten', 'today', 'together', 'try', 'warm',
];

const CVC_WORDS: string[][] = [
  ['c','a','t'], ['d','o','g'], ['b','a','t'], ['m','a','p'],
  ['p','i','g'], ['s','u','n'], ['f','i','sh'], ['c','u','p'],
  ['h','a','t'], ['r','e','d'], ['b','u','g'], ['l','i','p'],
  ['n','e','t'], ['j','e','t'], ['p','a','n'], ['f','o','x'],
  ['m','o','p'], ['r','a','n'], ['w','i','g'], ['h','u','g'],
  ['b','e','d'], ['p','e','n'], ['t','o','p'], ['w','e','b'],
  ['d','i','g'], ['c','o','b'], ['s','i','t'], ['h','o','t'],
];

const DIGRAPH_WORDS: Array<{ word: string; digraph: string; emoji: string }> = [
  { word: 'ship', digraph: 'sh', emoji: '🚢' },
  { word: 'fish', digraph: 'sh', emoji: '🐟' },
  { word: 'shoe', digraph: 'sh', emoji: '👟' },
  { word: 'shell', digraph: 'sh', emoji: '🐚' },
  { word: 'shark', digraph: 'sh', emoji: '🦈' },
  { word: 'sheep', digraph: 'sh', emoji: '🐑' },
  { word: 'shop', digraph: 'sh', emoji: '🏪' },
  { word: 'chip', digraph: 'ch', emoji: '🍟' },
  { word: 'chin', digraph: 'ch', emoji: '🙂' },
  { word: 'chick', digraph: 'ch', emoji: '🐥' },
  { word: 'cheese', digraph: 'ch', emoji: '🧀' },
  { word: 'cherry', digraph: 'ch', emoji: '🍒' },
  { word: 'chair', digraph: 'ch', emoji: '🪑' },
  { word: 'chain', digraph: 'ch', emoji: '⛓️' },
  { word: 'thin', digraph: 'th', emoji: '➖' },
  { word: 'thumb', digraph: 'th', emoji: '👍' },
  { word: 'three', digraph: 'th', emoji: '3️⃣' },
  { word: 'thick', digraph: 'th', emoji: '📚' },
  { word: 'think', digraph: 'th', emoji: '💭' },
  { word: 'thorn', digraph: 'th', emoji: '🌹' },
  { word: 'thirty', digraph: 'th', emoji: '3️⃣' },
];

const BLEND_WORDS: Array<{ phonemes: string[]; word: string }> = [
  { phonemes: ['bl','o','b'], word: 'blob' },
  { phonemes: ['cl','i','p'], word: 'clip' },
  { phonemes: ['fl','a','g'], word: 'flag' },
  { phonemes: ['gl','o','b'], word: 'glob' },
  { phonemes: ['pl','u','m'], word: 'plum' },
  { phonemes: ['sl','i','p'], word: 'slip' },
  { phonemes: ['br','i','ck'], word: 'brick' },
  { phonemes: ['cr','a','b'], word: 'crab' },
  { phonemes: ['dr','u','m'], word: 'drum' },
  { phonemes: ['fr','o','g'], word: 'frog' },
  { phonemes: ['gr','a','b'], word: 'grab' },
  { phonemes: ['pr','o','p'], word: 'prop' },
  { phonemes: ['tr','i','p'], word: 'trip' },
  { phonemes: ['sp','o','t'], word: 'spot' },
  { phonemes: ['st','o','p'], word: 'stop' },
  { phonemes: ['sw','i','m'], word: 'swim' },
  { phonemes: ['bl','a','ck'], word: 'black' },
  { phonemes: ['sn','a','p'], word: 'snap' },
  { phonemes: ['sm','e','ll'], word: 'smell' },
  { phonemes: ['sc','a','n'], word: 'scan' },
];

const SILENT_E_PAIRS = [
  { short: 'cap', long: 'cape' },
  { short: 'mad', long: 'made' },
  { short: 'pin', long: 'pine' },
  { short: 'kit', long: 'kite' },
  { short: 'hop', long: 'hope' },
  { short: 'tub', long: 'tube' },
  { short: 'cub', long: 'cube' },
  { short: 'cut', long: 'cute' },
  { short: 'tap', long: 'tape' },
  { short: 'rat', long: 'rate' },
  { short: 'dim', long: 'dime' },
  { short: 'rob', long: 'robe' },
  { short: 'not', long: 'note' },
  { short: 'hid', long: 'hide' },
];

const VOWEL_EE_EA = [
  { word: 'tree', pattern: 'ee', emoji: '🌳' },
  { word: 'bee', pattern: 'ee', emoji: '🐝' },
  { word: 'feet', pattern: 'ee', emoji: '🦶' },
  { word: 'seed', pattern: 'ee', emoji: '🌱' },
  { word: 'queen', pattern: 'ee', emoji: '👑' },
  { word: 'green', pattern: 'ee', emoji: '🟢' },
  { word: 'eat', pattern: 'ea', emoji: '🍽️' },
  { word: 'leaf', pattern: 'ea', emoji: '🍃' },
  { word: 'beach', pattern: 'ea', emoji: '🏖️' },
  { word: 'team', pattern: 'ea', emoji: '👥' },
  { word: 'read', pattern: 'ea', emoji: '📖' },
  { word: 'sea', pattern: 'ea', emoji: '🌊' },
];

const VOWEL_AI_AY = [
  { word: 'rain', pattern: 'ai', emoji: '🌧️' },
  { word: 'train', pattern: 'ai', emoji: '🚂' },
  { word: 'snail', pattern: 'ai', emoji: '🐌' },
  { word: 'mail', pattern: 'ai', emoji: '📬' },
  { word: 'paint', pattern: 'ai', emoji: '🎨' },
  { word: 'sail', pattern: 'ai', emoji: '⛵' },
  { word: 'day', pattern: 'ay', emoji: '☀️' },
  { word: 'play', pattern: 'ay', emoji: '🎮' },
  { word: 'hay', pattern: 'ay', emoji: '🌾' },
  { word: 'tray', pattern: 'ay', emoji: '🍽️' },
  { word: 'spray', pattern: 'ay', emoji: '💦' },
  { word: 'way', pattern: 'ay', emoji: '➡️' },
];

const VOWEL_OA_OW = [
  { word: 'boat', pattern: 'oa', emoji: '⛵' },
  { word: 'coat', pattern: 'oa', emoji: '🧥' },
  { word: 'road', pattern: 'oa', emoji: '🛣️' },
  { word: 'goat', pattern: 'oa', emoji: '🐐' },
  { word: 'toast', pattern: 'oa', emoji: '🍞' },
  { word: 'soap', pattern: 'oa', emoji: '🧼' },
  { word: 'snow', pattern: 'ow', emoji: '❄️' },
  { word: 'grow', pattern: 'ow', emoji: '🌱' },
  { word: 'bow', pattern: 'ow', emoji: '🎀' },
  { word: 'slow', pattern: 'ow', emoji: '🐢' },
  { word: 'yellow', pattern: 'ow', emoji: '💛' },
  { word: 'window', pattern: 'ow', emoji: '🪟' },
];

const R_CONTROLLED = [
  { word: 'car', pattern: 'ar', emoji: '🚗' },
  { word: 'star', pattern: 'ar', emoji: '⭐' },
  { word: 'park', pattern: 'ar', emoji: '🏞️' },
  { word: 'yard', pattern: 'ar', emoji: '🌳' },
  { word: 'bird', pattern: 'ir', emoji: '🐦' },
  { word: 'girl', pattern: 'ir', emoji: '👧' },
  { word: 'shirt', pattern: 'ir', emoji: '👕' },
  { word: 'first', pattern: 'ir', emoji: '🥇' },
  { word: 'corn', pattern: 'or', emoji: '🌽' },
  { word: 'horn', pattern: 'or', emoji: '📯' },
  { word: 'horse', pattern: 'or', emoji: '🐴' },
  { word: 'fork', pattern: 'or', emoji: '🍴' },
  { word: 'her', pattern: 'er', emoji: '👩' },
  { word: 'river', pattern: 'er', emoji: '🏞️' },
  { word: 'butter', pattern: 'er', emoji: '🧈' },
  { word: 'flower', pattern: 'er', emoji: '🌸' },
  { word: 'turn', pattern: 'ur', emoji: '↪️' },
  { word: 'burn', pattern: 'ur', emoji: '🔥' },
  { word: 'purple', pattern: 'ur', emoji: '🟣' },
  { word: 'curl', pattern: 'ur', emoji: '➰' },
];

const DIPHTHONGS = [
  { word: 'coin', pattern: 'oi', emoji: '🪙' },
  { word: 'oil', pattern: 'oi', emoji: '🫒' },
  { word: 'join', pattern: 'oi', emoji: '🤝' },
  { word: 'boil', pattern: 'oi', emoji: '♨️' },
  { word: 'toy', pattern: 'oy', emoji: '🧸' },
  { word: 'boy', pattern: 'oy', emoji: '👦' },
  { word: 'joy', pattern: 'oy', emoji: '😊' },
  { word: 'soy', pattern: 'oy', emoji: '🫘' },
  { word: 'cloud', pattern: 'ou', emoji: '☁️' },
  { word: 'loud', pattern: 'ou', emoji: '🔊' },
  { word: 'mouse', pattern: 'ou', emoji: '🐭' },
  { word: 'house', pattern: 'ou', emoji: '🏠' },
  { word: 'cow', pattern: 'ow', emoji: '🐄' },
  { word: 'owl', pattern: 'ow', emoji: '🦉' },
  { word: 'brown', pattern: 'ow', emoji: '🟤' },
  { word: 'crown', pattern: 'ow', emoji: '👑' },
];

const ED_ING_WORDS = [
  { base: 'play', ed: 'played', ing: 'playing' },
  { base: 'jump', ed: 'jumped', ing: 'jumping' },
  { base: 'walk', ed: 'walked', ing: 'walking' },
  { base: 'look', ed: 'looked', ing: 'looking' },
  { base: 'paint', ed: 'painted', ing: 'painting' },
  { base: 'rain', ed: 'rained', ing: 'raining' },
  { base: 'talk', ed: 'talked', ing: 'talking' },
  { base: 'help', ed: 'helped', ing: 'helping' },
  { base: 'wait', ed: 'waited', ing: 'waiting' },
  { base: 'cook', ed: 'cooked', ing: 'cooking' },
];

const PLURAL_WORDS = [
  { singular: 'cat', plural: 'cats', rule: 's' },
  { singular: 'dog', plural: 'dogs', rule: 's' },
  { singular: 'frog', plural: 'frogs', rule: 's' },
  { singular: 'book', plural: 'books', rule: 's' },
  { singular: 'tree', plural: 'trees', rule: 's' },
  { singular: 'bee', plural: 'bees', rule: 's' },
  { singular: 'bus', plural: 'buses', rule: 'es' },
  { singular: 'box', plural: 'boxes', rule: 'es' },
  { singular: 'dish', plural: 'dishes', rule: 'es' },
  { singular: 'fox', plural: 'foxes', rule: 'es' },
  { singular: 'match', plural: 'matches', rule: 'es' },
  { singular: 'glass', plural: 'glasses', rule: 'es' },
];

const COMPOUND_WORDS: Array<[string, string, string]> = [
  ['sun', 'flower', 'sunflower'],
  ['butter', 'fly', 'butterfly'],
  ['rain', 'bow', 'rainbow'],
  ['bed', 'room', 'bedroom'],
  ['foot', 'ball', 'football'],
  ['back', 'pack', 'backpack'],
  ['sand', 'box', 'sandbox'],
  ['gold', 'fish', 'goldfish'],
  ['snow', 'man', 'snowman'],
  ['fire', 'fly', 'firefly'],
  ['star', 'fish', 'starfish'],
  ['lady', 'bug', 'ladybug'],
];

const PREFIX_WORDS = [
  { base: 'happy', prefixed: 'unhappy', prefix: 'un' },
  { base: 'kind', prefixed: 'unkind', prefix: 'un' },
  { base: 'safe', prefixed: 'unsafe', prefix: 'un' },
  { base: 'lock', prefixed: 'unlock', prefix: 'un' },
  { base: 'fair', prefixed: 'unfair', prefix: 'un' },
  { base: 'wrap', prefixed: 'unwrap', prefix: 'un' },
  { base: 'do', prefixed: 'redo', prefix: 're' },
  { base: 'play', prefixed: 'replay', prefix: 're' },
  { base: 'read', prefixed: 'reread', prefix: 're' },
  { base: 'use', prefixed: 'reuse', prefix: 're' },
  { base: 'fill', prefixed: 'refill', prefix: 're' },
  { base: 'write', prefixed: 'rewrite', prefix: 're' },
];

const READ_ALOUD_SHORT = [
  'cat', 'dog', 'sun', 'map', 'bug', 'hat', 'red', 'fish',
  'ship', 'chip', 'milk', 'book', 'pond', 'frog', 'cake',
  'hop', 'jump', 'sip', 'cup', 'log', 'bird', 'rock',
];

const READ_ALOUD_LONGER = [
  // 2-syllable
  'butter', 'flower', 'rabbit', 'garden', 'sunshine', 'careful',
  'mitten', 'kitten', 'picnic', 'paper', 'puddle', 'window',
  'yellow', 'pillow', 'apple', 'little', 'lovely', 'morning',
  'number', 'summer', 'winter', 'fifteen', 'twenty', 'meadow',
  'spider', 'thunder', 'silver', 'autumn', 'bottle', 'middle',
  'pebble', 'splendid', 'dragon', 'pumpkin', 'bonnet', 'forest',
  // 3-syllable
  'butterfly', 'bumblebee', 'cinnamon', 'beautiful', 'remember',
  'hamburger', 'elephant', 'pineapple', 'umbrella', 'kangaroo',
  'banana', 'animal', 'family', 'history', 'carnival', 'wonderful',
  'instrument', 'adventure',
  // 4-syllable (challenge stretch)
  'caterpillar', 'watermelon', 'alligator', 'hippopotamus', 'dictionary',
  'macaroni', 'cafeteria', 'binoculars',
];

/**
 * Short-sentence comprehension items. Each item is a sentence the
 * child reads, a question about it, the right answer, and 2-3
 * distractors that look plausible without giving the answer away.
 *
 * Sentences are written with a Grade-2-friendly vocabulary (mostly
 * Dolch + decodable phonics + a few naturalist nouns), 6-14 words,
 * one or two clauses. Half are "literal" (find a fact in the
 * sentence), half are "inference" (which feeling? what comes next?).
 */
type Comprehension = {
  sentence: string;
  question: string;
  correct: string;
  distractors: string[];
  difficulty: 'easy' | 'mid' | 'stretch';
};

const COMPREHENSION_ITEMS: Comprehension[] = [
  // ── easy: literal recall, very short sentence ──
  { sentence: 'The frog jumped onto the green lily pad.', question: 'What did the frog jump onto?',
    correct: 'a lily pad', distractors: ['a rock', 'the grass', 'the path'], difficulty: 'easy' },
  { sentence: 'Mia found a red bug in the garden.', question: 'What color was the bug?',
    correct: 'red', distractors: ['green', 'yellow', 'blue'], difficulty: 'easy' },
  { sentence: 'The cat sat on the soft pillow.', question: 'Where did the cat sit?',
    correct: 'on the pillow', distractors: ['on the mat', 'on the chair', 'on the floor'], difficulty: 'easy' },
  { sentence: 'A small bird made a nest in the tree.', question: 'Who made the nest?',
    correct: 'a bird', distractors: ['a squirrel', 'a frog', 'a bee'], difficulty: 'easy' },
  { sentence: 'Sam ate three apples for lunch.', question: 'How many apples did Sam eat?',
    correct: 'three', distractors: ['two', 'four', 'one'], difficulty: 'easy' },
  { sentence: 'The bee landed on the yellow flower.', question: 'What color was the flower?',
    correct: 'yellow', distractors: ['pink', 'orange', 'white'], difficulty: 'easy' },
  { sentence: 'Luna ran fast across the meadow.', question: 'Who ran across the meadow?',
    correct: 'Luna', distractors: ['Sam', 'the cat', 'the dog'], difficulty: 'easy' },
  { sentence: 'It was raining hard outside.', question: 'What was the weather doing?',
    correct: 'raining', distractors: ['snowing', 'sunny', 'windy'], difficulty: 'easy' },
  { sentence: 'The puppy chewed on a soft slipper.', question: 'What did the puppy chew on?',
    correct: 'a slipper', distractors: ['a bone', 'a stick', 'a ball'], difficulty: 'easy' },
  { sentence: 'There were five frogs in the pond.', question: 'How many frogs were in the pond?',
    correct: 'five', distractors: ['three', 'six', 'two'], difficulty: 'easy' },

  // ── mid: two clauses, named characters, simple inference ──
  { sentence: 'Cecily picked a bunch of flowers and gave them to her mom.',
    question: 'Who got the flowers?',
    correct: 'her mom', distractors: ['her sister', 'Cecily', 'her dad'], difficulty: 'mid' },
  { sentence: 'The little fox saw the rabbit and quickly hid behind a tree.',
    question: 'Why did the fox hide?',
    correct: 'because she saw the rabbit', distractors: ['because it was raining', 'because she was sleepy', 'because she lost her tail'], difficulty: 'mid' },
  { sentence: 'After the storm, a bright rainbow stretched across the sky.',
    question: 'When did the rainbow appear?',
    correct: 'after the storm', distractors: ['before the storm', 'at night', 'while it rained'], difficulty: 'mid' },
  { sentence: 'The honey bees buzzed around the lavender bushes all morning.',
    question: 'What were the bees doing?',
    correct: 'buzzing around the lavender', distractors: ['sleeping in the hive', 'flying away from the garden', 'building a new nest'], difficulty: 'mid' },
  { sentence: 'When the snow began to melt, the green grass started to show.',
    question: 'What happened first?',
    correct: 'the snow melted', distractors: ['the grass grew', 'the snow fell', 'the flowers bloomed'], difficulty: 'mid' },
  { sentence: 'Esme planted ten seeds in a tidy little row.',
    question: 'How many seeds did Esme plant?',
    correct: 'ten', distractors: ['nine', 'twelve', 'a hundred'], difficulty: 'mid' },
  { sentence: 'The kitten was tiny and shy, so she hid under the bed.',
    question: 'How did the kitten feel?',
    correct: 'shy', distractors: ['happy', 'angry', 'silly'], difficulty: 'mid' },
  { sentence: 'A long line of ants carried crumbs back to the ant hill.',
    question: 'Where were the ants going?',
    correct: 'to the ant hill', distractors: ['to the picnic', 'to the river', 'to the tree'], difficulty: 'mid' },
  { sentence: 'Dad opened the picnic basket and pulled out two sandwiches.',
    question: 'What was in the basket?',
    correct: 'sandwiches', distractors: ['flowers', 'bugs', 'books'], difficulty: 'mid' },
  { sentence: 'The big spider spun her web between two thin branches.',
    question: 'Where did the spider spin her web?',
    correct: 'between two branches', distractors: ['on the ground', 'inside a flower', 'under a leaf'], difficulty: 'mid' },
  { sentence: 'Cecily gave half of her berries to Esme so they could share.',
    question: 'Why did Cecily give Esme some berries?',
    correct: 'so they could share', distractors: ['because she did not like them', 'because Esme asked', 'because they were old'], difficulty: 'mid' },
  { sentence: 'The little turtle pulled its head into its hard shell.',
    question: 'What did the turtle pull into its shell?',
    correct: 'its head', distractors: ['its tail', 'a leaf', 'a fish'], difficulty: 'mid' },
  { sentence: 'In the spring, the apple tree grew tiny pink blossoms.',
    question: 'What season was it?',
    correct: 'spring', distractors: ['fall', 'winter', 'summer'], difficulty: 'mid' },
  { sentence: 'The brave little frog leapt across the stream to catch a fly.',
    question: 'What did the frog catch?',
    correct: 'a fly', distractors: ['a bee', 'a fish', 'a leaf'], difficulty: 'mid' },
  { sentence: 'Mom said the soup was too hot, so we waited a little while.',
    question: 'Why did they wait?',
    correct: 'the soup was too hot', distractors: ['Mom was busy', 'the bowls were dirty', 'they were not hungry'], difficulty: 'mid' },

  // ── stretch: longer sentences, vocabulary stretch, harder inference ──
  { sentence: 'The small caterpillar wiggled along the leaf, leaving a tiny silver trail behind.',
    question: 'What did the caterpillar leave behind?',
    correct: 'a silver trail', distractors: ['a green leaf', 'an empty cocoon', 'a tiny shell'], difficulty: 'stretch' },
  { sentence: 'When she opened the curtain, sunlight poured into the room and woke the cat.',
    question: 'What woke the cat?',
    correct: 'the sunlight', distractors: ['the curtain', 'the noise', 'the breakfast smell'], difficulty: 'stretch' },
  { sentence: 'The bumblebee searched every blossom looking for the sweetest nectar.',
    question: 'What was the bumblebee searching for?',
    correct: 'sweet nectar', distractors: ['a place to sleep', 'her hive', 'another bee'], difficulty: 'stretch' },
  { sentence: 'Although the path was muddy, the children kept walking toward the pond.',
    question: 'Why was the path tricky?',
    correct: 'it was muddy', distractors: ['it was uphill', 'it was rocky', 'it was windy'], difficulty: 'stretch' },
  { sentence: 'A family of deer stepped quietly into the clearing and began to eat the grass.',
    question: 'What did the deer do in the clearing?',
    correct: 'eat the grass', distractors: ['drink from the pond', 'run away', 'lie down'], difficulty: 'stretch' },
  { sentence: 'The brave little firefly flickered her tiny light to find her way home.',
    question: 'How did the firefly find her way?',
    correct: 'with her light', distractors: ['by following another firefly', 'by smelling flowers', 'by listening for friends'], difficulty: 'stretch' },
  { sentence: 'Even though the puppy was tired, he wagged his tail when he saw his sister.',
    question: 'Why did the puppy wag his tail?',
    correct: 'he saw his sister', distractors: ['he was tired', 'he was hungry', 'he heard a noise'], difficulty: 'stretch' },
  { sentence: 'After watching the rabbits all morning, Cecily wrote down every detail in her journal.',
    question: 'Where did Cecily write down what she saw?',
    correct: 'in her journal', distractors: ['on a piece of paper', 'on the wall', 'in a book at the library'], difficulty: 'stretch' },
  { sentence: 'The wind grew stronger, so the gardener tied the young sapling to a sturdy stake.',
    question: 'Why did the gardener tie the sapling?',
    correct: 'the wind was getting strong', distractors: ['the rain was coming', 'the leaves were falling', 'the sun was hot'], difficulty: 'stretch' },
  { sentence: 'Once the moon rose, the meadow was filled with the soft chirping of crickets.',
    question: 'When did the crickets start chirping?',
    correct: 'when the moon rose', distractors: ['at sunrise', 'after lunch', 'during the storm'], difficulty: 'stretch' },
];

export async function seedReading(
  sb: SupabaseClient,
  subjectId: string,
  skillIdByCode: Map<string, string>
): Promise<void> {
  for (const s of READING_STRANDS) {
    const { error } = await sb.from('strand').upsert({
      subject_id: subjectId, code: s.code, name: s.name, sort_order: s.sortOrder,
    }, { onConflict: 'subject_id,code' });
    if (error) throw error;
  }

  const { data: strandRows } = await sb.from('strand')
    .select('id, code').eq('subject_id', subjectId);
  const strandIdByCode = new Map(strandRows!.map(r => [r.code, r.id]));

  for (const sk of READING_SKILLS) {
    const strandId = strandIdByCode.get(sk.strandCode);
    if (!strandId) continue;
    const { error } = await sb.from('skill').upsert({
      strand_id: strandId, code: sk.code, name: sk.name, level: sk.level,
      prereq_skill_codes: sk.prereqSkillCodes,
      curriculum_refs: sk.curriculumRefs ?? {},
      theme_tags: sk.themeTags, sort_order: sk.sortOrder,
    }, { onConflict: 'code' });
    if (error) throw error;
  }

  const { data: allSkillRows } = await sb.from('skill').select('id, code');
  for (const r of allSkillRows ?? []) skillIdByCode.set(r.code, r.id);

  const readingSkillIds = READING_SKILLS
    .map(s => skillIdByCode.get(s.code))
    .filter((x): x is string => !!x);
  if (readingSkillIds.length > 0) {
    // Paginate — Supabase caps SELECT at 1000 rows by default.
    const PAGE = 1000;
    const priorIds: string[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await sb.from('item')
        .select('id').eq('generated_by', 'seed').in('skill_id', readingSkillIds)
        .range(from, from + PAGE - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      for (const r of data) priorIds.push(r.id);
      if (data.length < PAGE) break;
    }
    if (priorIds.length > 0) {
      // Batch deletes — see scripts/seed-math.ts for the same fix.
      // Single .in() with hundreds of UUIDs blows PostgREST's URL
      // length limit and fails silently.
      const DELETE_BATCH = 50;
      for (let i = 0; i < priorIds.length; i += DELETE_BATCH) {
        const batch = priorIds.slice(i, i + DELETE_BATCH);
        const { error: aErr } = await sb.from('attempt').delete().in('item_id', batch);
        if (aErr) throw aErr;
      }
      for (let i = 0; i < priorIds.length; i += DELETE_BATCH) {
        const batch = priorIds.slice(i, i + DELETE_BATCH);
        const { error: iErr } = await sb.from('item').delete().in('id', batch);
        if (iErr) throw iErr;
      }
    }
  }

  const now = new Date().toISOString();
  const items: any[] = [];

  const push = (skillCode: string, type: string, content: any, answer: any, elo: number) => {
    const id = skillIdByCode.get(skillCode);
    if (!id) return;
    items.push({
      skill_id: id, type, content, answer,
      approved_at: now, generated_by: 'seed', difficulty_elo: elo,
    });
  };

  const SIGHT_PROMPTS = [
    (w: string) => `Which word says "${w}"?`,
    (w: string) => `Tap "${w}".`,
    (w: string) => `Find the word "${w}".`,
    (w: string) => `Where is "${w}"?`,
    (w: string) => `Show me "${w}".`,
  ];

  // Articles, prepositions, conjunctions, and other functional glue
  // words that don't belong in a sight-word recognition exercise — at
  // 1st/2nd-grade level a child either knows these from sheer
  // frequency or would never see them in isolation. Combined with the
  // 3-letter minimum below, this catches all the "too simple" forms.
  const FUNCTION_WORD_DENYLIST = new Set<string>([
    // articles
    'a', 'an', 'the',
    // prepositions
    'at', 'by', 'for', 'from', 'in', 'into', 'of', 'off', 'on', 'onto',
    'out', 'over', 'past', 'to', 'under', 'up', 'upon', 'with',
    'about', 'after', 'around', 'before', 'between', 'down',
    // conjunctions
    'and', 'as', 'but', 'if', 'or', 'so',
    // tiny pronouns / copulas (also 1-2 letter, but listed for clarity)
    'i', 'me', 'my', 'we', 'us', 'it', 'he', 'is', 'am',
  ]);

  /** A word is teachable as a sight-word target if it's at least
   *  three letters and isn't a function word. */
  function isTeachableSightWord(w: string): boolean {
    if (w.length < 3) return false;
    if (FUNCTION_WORD_DENYLIST.has(w.toLowerCase())) return false;
    return true;
  }

  /** Deterministic mulberry32 RNG seeded from a string. */
  function seededRng(seed: string): () => number {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
    let s = (h >>> 0) || 1;
    return () => {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Pick `n` distinct distractor words from `pool`, never the
   *  target itself, and never two of the same word. */
  function pickUniqueDistractors(target: string, pool: string[], n: number, rand: () => number): string[] {
    const seen = new Set<string>([target.toLowerCase()]);
    const out: string[] = [];
    // Fisher–Yates shuffle of a defensive copy
    const shuffled = pool.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    for (const w of shuffled) {
      const key = w.toLowerCase();
      if (seen.has(key)) continue;
      out.push(w);
      seen.add(key);
      if (out.length >= n) break;
    }
    return out;
  }

  function sightWordItems(skillCode: string, words: string[], startElo: number) {
    const teachable = words.filter(isTeachableSightWord);
    const rand = seededRng(skillCode);
    for (let i = 0; i < teachable.length; i++) {
      const word = teachable[i];
      const distractors = pickUniqueDistractors(word, teachable, 3, rand);
      if (distractors.length < 3) continue;  // not enough teachable pool
      push(skillCode, 'SightWordTap', {
        type: 'SightWordTap', word, distractors,
        promptText: SIGHT_PROMPTS[i % SIGHT_PROMPTS.length](word),
      }, { word }, startElo + i * 3);
    }
  }

  sightWordItems('reading.sight_words.dolch_primer', DOLCH_PRIMER, 950);
  sightWordItems('reading.sight_words.dolch_first_grade', DOLCH_FIRST_GRADE, 1050);
  sightWordItems('reading.sight_words.dolch_second_grade', DOLCH_SECOND_GRADE, 1200);
  sightWordItems('reading.sight_words.dolch_third_grade', DOLCH_THIRD_GRADE, 1350);

  // CVC blending
  {
    const blendedWords = CVC_WORDS.map(p => p.join(''));
    for (let i = 0; i < CVC_WORDS.length; i++) {
      const phonemes = CVC_WORDS[i];
      const word = phonemes.join('');
      const pool = blendedWords.filter(w => w !== word);
      const distractors = [pool[(i * 3) % pool.length], pool[(i * 7 + 1) % pool.length]];
      push('reading.phonics.cvc_blend', 'PhonemeBlend', {
        type: 'PhonemeBlend', phonemes, word, distractors,
        // The renderer hides the answer choices and asks the child to
        // SAY the word into the mic — picking from a list defeats the
        // point of blending. Keep the spoken prompt in line with that.
        promptText: 'Blend the sounds and say the word.',
      }, { word }, 950 + i * 3);
    }
  }

  // Digraph sort
  {
    const grouped: Record<string, typeof DIGRAPH_WORDS> = { ch: [], sh: [], th: [] };
    for (const w of DIGRAPH_WORDS) grouped[w.digraph].push(w);
    const rounds = Math.min(grouped.ch.length, grouped.sh.length, grouped.th.length);
    const prompts = [
      'Put each word in the right bucket.',
      'Which digraph is in each word?',
      'Sort by the special letter pair.',
      'Drop each word where it belongs.',
    ];
    for (let r = 0; r < rounds; r++) {
      const roundWords = [grouped.ch[r], grouped.sh[r], grouped.th[r]];
      push('reading.phonics.digraphs', 'DigraphSort', {
        type: 'DigraphSort',
        digraphs: ['ch', 'sh', 'th'],
        words: roundWords.map(w => ({ word: w.word, emoji: w.emoji, digraph: w.digraph })),
        promptText: prompts[r % prompts.length],
      }, {
        placements: Object.fromEntries(roundWords.map(w => [w.word, w.digraph])),
      }, 1050 + r * 10);
    }
  }

  // Initial blends
  {
    const allWords = BLEND_WORDS.map(b => b.word);
    for (let i = 0; i < BLEND_WORDS.length; i++) {
      const { phonemes, word } = BLEND_WORDS[i];
      const pool = allWords.filter(w => w !== word);
      const distractors = [pool[(i * 3) % pool.length], pool[(i * 5 + 2) % pool.length]];
      push('reading.phonics.initial_blends', 'PhonemeBlend', {
        type: 'PhonemeBlend', phonemes, word, distractors,
        // Same speech-first rationale as cvc_blend.
        promptText: 'Blend the sounds and say the word.',
      }, { word }, 1100 + i * 5);
    }
  }

  // Silent-e
  {
    const allLongs = SILENT_E_PAIRS.map(p => p.long);
    for (let i = 0; i < SILENT_E_PAIRS.length; i++) {
      const { short, long } = SILENT_E_PAIRS[i];
      const distractors = [short, allLongs[(i + 1) % allLongs.length]];
      push('reading.phonics.silent_e', 'PhonemeBlend', {
        type: 'PhonemeBlend',
        phonemes: long.split(''),
        word: long, distractors,
        // Speech-first: ask the child to read the word out loud; the
        // PhonemeBlend renderer hides the tile choices unless the
        // child needs them.
        promptText: `Silent e makes the vowel say its name. Read this word out loud.`,
      }, { word: long }, 1200 + i * 5);
    }
    for (let i = 0; i < Math.min(10, SILENT_E_PAIRS.length); i++) {
      const { short, long } = SILENT_E_PAIRS[i];
      push('reading.phonics.silent_e', 'SightWordTap', {
        type: 'SightWordTap',
        word: long,
        distractors: [short, SILENT_E_PAIRS[(i + 3) % SILENT_E_PAIRS.length].short],
        promptText: 'Which word has silent e?',
      }, { word: long }, 1250 + i * 3);
    }
  }

  // Vowel teams ee/ea
  {
    const grouped: Record<string, typeof VOWEL_EE_EA> = { ee: [], ea: [] };
    for (const w of VOWEL_EE_EA) grouped[w.pattern].push(w);
    const rounds = Math.min(grouped.ee.length, grouped.ea.length);
    for (let r = 0; r < rounds; r++) {
      const roundWords = [grouped.ee[r], grouped.ea[r]];
      push('reading.phonics.vowel_teams_ee_ea', 'DigraphSort', {
        type: 'DigraphSort',
        digraphs: ['ee', 'ea'],
        words: roundWords.map(w => ({ word: w.word, emoji: w.emoji, digraph: w.pattern })),
        promptText: 'Sort each word by its long-e team.',
      }, {
        placements: Object.fromEntries(roundWords.map(w => [w.word, w.pattern])),
      }, 1300 + r * 5);
    }
    for (let i = 0; i < VOWEL_EE_EA.length; i++) {
      const w = VOWEL_EE_EA[i];
      const distractors = [
        VOWEL_EE_EA[(i + 1) % VOWEL_EE_EA.length].word,
        VOWEL_EE_EA[(i + 3) % VOWEL_EE_EA.length].word,
      ];
      push('reading.phonics.vowel_teams_ee_ea', 'SightWordTap', {
        type: 'SightWordTap', word: w.word, distractors,
        promptText: `Find "${w.word}".`,
      }, { word: w.word }, 1350 + i * 3);
    }
  }

  // Vowel teams ai/ay
  {
    const grouped: Record<string, typeof VOWEL_AI_AY> = { ai: [], ay: [] };
    for (const w of VOWEL_AI_AY) grouped[w.pattern].push(w);
    const rounds = Math.min(grouped.ai.length, grouped.ay.length);
    for (let r = 0; r < rounds; r++) {
      const roundWords = [grouped.ai[r], grouped.ay[r]];
      push('reading.phonics.vowel_teams_ai_ay', 'DigraphSort', {
        type: 'DigraphSort',
        digraphs: ['ai', 'ay'],
        words: roundWords.map(w => ({ word: w.word, emoji: w.emoji, digraph: w.pattern })),
        promptText: 'Sort by long-a team (ai inside, ay at end).',
      }, {
        placements: Object.fromEntries(roundWords.map(w => [w.word, w.pattern])),
      }, 1300 + r * 5);
    }
  }

  // Vowel teams oa/ow
  {
    const grouped: Record<string, typeof VOWEL_OA_OW> = { oa: [], ow: [] };
    for (const w of VOWEL_OA_OW) grouped[w.pattern].push(w);
    const rounds = Math.min(grouped.oa.length, grouped.ow.length);
    for (let r = 0; r < rounds; r++) {
      const roundWords = [grouped.oa[r], grouped.ow[r]];
      push('reading.phonics.vowel_teams_oa_ow', 'DigraphSort', {
        type: 'DigraphSort',
        digraphs: ['oa', 'ow'],
        words: roundWords.map(w => ({ word: w.word, emoji: w.emoji, digraph: w.pattern })),
        promptText: 'Sort each long-o word.',
      }, {
        placements: Object.fromEntries(roundWords.map(w => [w.word, w.pattern])),
      }, 1350 + r * 5);
    }
  }

  // R-controlled
  {
    const groups: Record<string, typeof R_CONTROLLED> = { ar: [], er: [], ir: [], or: [], ur: [] };
    for (const w of R_CONTROLLED) groups[w.pattern].push(w);
    const rounds = Math.min(groups.ar.length, groups.or.length, groups.er.length);
    for (let r = 0; r < rounds; r++) {
      const roundWords = [groups.ar[r], groups.or[r], groups.er[r]];
      push('reading.phonics.r_controlled', 'DigraphSort', {
        type: 'DigraphSort',
        digraphs: ['ar', 'or', 'er'],
        words: roundWords.map(w => ({ word: w.word, emoji: w.emoji, digraph: w.pattern })),
        promptText: 'Bossy-R! Sort by which R-sound each word has.',
      }, {
        placements: Object.fromEntries(roundWords.map(w => [w.word, w.pattern])),
      }, 1400 + r * 5);
    }
    for (let i = 0; i < groups.ir.length + groups.ur.length; i++) {
      const word = i < groups.ir.length ? groups.ir[i].word : groups.ur[i - groups.ir.length].word;
      const distractors = [
        R_CONTROLLED[(i + 3) % R_CONTROLLED.length].word,
        R_CONTROLLED[(i + 7) % R_CONTROLLED.length].word,
      ];
      push('reading.phonics.r_controlled', 'SightWordTap', {
        type: 'SightWordTap', word, distractors,
        promptText: `Find "${word}".`,
      }, { word }, 1450 + i * 3);
    }
  }

  // Diphthongs
  {
    const groups: Record<string, typeof DIPHTHONGS> = { oi: [], oy: [], ou: [], ow: [] };
    for (const w of DIPHTHONGS) groups[w.pattern].push(w);
    const oioyRounds = Math.min(groups.oi.length, groups.oy.length);
    for (let r = 0; r < oioyRounds; r++) {
      const roundWords = [groups.oi[r], groups.oy[r]];
      push('reading.phonics.diphthongs', 'DigraphSort', {
        type: 'DigraphSort',
        digraphs: ['oi', 'oy'],
        words: roundWords.map(w => ({ word: w.word, emoji: w.emoji, digraph: w.pattern })),
        promptText: 'Same sound, different spot — sort by oi or oy.',
      }, {
        placements: Object.fromEntries(roundWords.map(w => [w.word, w.pattern])),
      }, 1500 + r * 5);
    }
    const ouowRounds = Math.min(groups.ou.length, groups.ow.length);
    for (let r = 0; r < ouowRounds; r++) {
      const roundWords = [groups.ou[r], groups.ow[r]];
      push('reading.phonics.diphthongs', 'DigraphSort', {
        type: 'DigraphSort',
        digraphs: ['ou', 'ow'],
        words: roundWords.map(w => ({ word: w.word, emoji: w.emoji, digraph: w.pattern })),
        promptText: 'The "ow" sound — sort by spelling.',
      }, {
        placements: Object.fromEntries(roundWords.map(w => [w.word, w.pattern])),
      }, 1520 + r * 5);
    }
  }

  // Inflectional -ed/-ing
  {
    for (let i = 0; i < ED_ING_WORDS.length; i++) {
      const { base, ed, ing } = ED_ING_WORDS[i];
      push('reading.morphology.inflectional_ed_ing', 'SightWordTap', {
        type: 'SightWordTap', word: ing,
        distractors: [ed, base, ED_ING_WORDS[(i + 1) % ED_ING_WORDS.length].ing],
        promptText: `Which word shows "${base}" happening right now?`,
      }, { word: ing }, 1250 + i * 4);
      push('reading.morphology.inflectional_ed_ing', 'SightWordTap', {
        type: 'SightWordTap', word: ed,
        distractors: [ing, base, ED_ING_WORDS[(i + 2) % ED_ING_WORDS.length].ed],
        promptText: `Which word shows "${base}" already happened?`,
      }, { word: ed }, 1270 + i * 4);
    }
  }

  // Plurals s/es
  {
    const groups: Record<string, typeof PLURAL_WORDS> = { s: [], es: [] };
    for (const w of PLURAL_WORDS) groups[w.rule].push(w);
    const rounds = Math.min(groups.s.length, groups.es.length);
    for (let r = 0; r < rounds; r++) {
      const roundWords = [groups.s[r], groups.es[r]];
      push('reading.morphology.plural_s_es', 'DigraphSort', {
        type: 'DigraphSort',
        digraphs: ['s', 'es'],
        words: roundWords.map(w => ({ word: w.plural, digraph: w.rule })),
        promptText: 'Sort plurals by their ending.',
      }, {
        placements: Object.fromEntries(roundWords.map(w => [w.plural, w.rule])),
      }, 1200 + r * 5);
    }
    for (let i = 0; i < PLURAL_WORDS.length; i++) {
      const w = PLURAL_WORDS[i];
      push('reading.morphology.plural_s_es', 'SightWordTap', {
        type: 'SightWordTap', word: w.plural,
        distractors: [w.singular, PLURAL_WORDS[(i + 1) % PLURAL_WORDS.length].plural],
        promptText: `Which word means more than one ${w.singular}?`,
      }, { word: w.plural }, 1220 + i * 3);
    }
  }

  // Compound words
  {
    for (let i = 0; i < COMPOUND_WORDS.length; i++) {
      const [a, b, joined] = COMPOUND_WORDS[i];
      const other = COMPOUND_WORDS[(i + 2) % COMPOUND_WORDS.length][2];
      push('reading.morphology.compound_words', 'SightWordTap', {
        type: 'SightWordTap', word: joined,
        distractors: [a, b, other],
        promptText: `Two words join to make one. ${a} + ${b} = ?`,
      }, { word: joined }, 1300 + i * 5);
    }
  }

  // Prefixes un-/re-
  {
    for (let i = 0; i < PREFIX_WORDS.length; i++) {
      const { base, prefixed, prefix } = PREFIX_WORDS[i];
      const other = PREFIX_WORDS[(i + 3) % PREFIX_WORDS.length].prefixed;
      push('reading.morphology.prefix_un_re', 'SightWordTap', {
        type: 'SightWordTap', word: prefixed,
        distractors: [base, other, prefix + 'do'],
        promptText: prefix === 'un'
          ? `Which word means "not ${base}" or the opposite?`
          : `Which word means "${base} again"?`,
      }, { word: prefixed }, 1350 + i * 5);
    }
  }

  // Read aloud (simple + longer)
  for (let i = 0; i < READ_ALOUD_SHORT.length; i++) {
    const word = READ_ALOUD_SHORT[i];
    push('reading.read_aloud.simple', 'ReadAloudSimple', {
      type: 'ReadAloudSimple', word, promptText: 'Say it out loud.',
    }, {}, 950 + word.length * 10);
  }
  for (let i = 0; i < READ_ALOUD_LONGER.length; i++) {
    const word = READ_ALOUD_LONGER[i];
    // Syllable count is the cognitive load proxy: a 2-syllable word is
    // a true Grade-1.5 stretch (~1100), a 4-syllable word is a Grade-3
    // stretch (~1450). Approximation: count vowel groups.
    const syllables = Math.max(2, (word.match(/[aeiouy]+/g) || []).length);
    const elo = 1000 + syllables * 110;  // 1220 / 1330 / 1440 / 1550
    push('reading.read_aloud.longer_words', 'ReadAloudSimple', {
      type: 'ReadAloudSimple', word, promptText: 'Say this longer word aloud.',
    }, {}, elo);
  }

  // Short-sentence comprehension — 35 items spread across three
  // difficulty tiers (easy/mid/stretch), Elo 1100 → 1450 so the
  // adaptive picker walks through them as the child grows.
  {
    for (let i = 0; i < COMPREHENSION_ITEMS.length; i++) {
      const it = COMPREHENSION_ITEMS[i];
      const elo =
        it.difficulty === 'easy'    ? 1100 + (i % 6) * 6 :
        it.difficulty === 'mid'     ? 1250 + (i % 6) * 8 :
                                      1400 + (i % 6) * 10;
      push('reading.comprehension.short_sentence', 'SentenceComprehension', {
        type: 'SentenceComprehension',
        sentence: it.sentence,
        question: it.question,
        choices: [it.correct, ...it.distractors],
        promptText: it.question,
      }, { correct: it.correct }, elo);
    }
  }

  if (items.length > 0) {
    const batchSize = 500;
    for (let i = 0; i < items.length; i += batchSize) {
      const { error } = await sb.from('item').insert(items.slice(i, i + batchSize));
      if (error) throw error;
    }
  }

  console.log(`  → reading: inserted ${items.length} items across ${readingSkillIds.length} skills`);
}
