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
import { pickNearMissDistractors } from '../lib/packs/reading/distractors';

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

/**
 * Grade-3 paragraph comprehension. Each entry is one paragraph
 * (~3-5 sentences, 40-90 words) with multiple linked questions of
 * different kinds. The seed loop fans out one item per question.
 *
 * Vocab is a Grade-2-friendly base + a few stretch words per
 * passage so the child encounters new words in context. Content
 * is naturalist (the same world the garden lives in) so a child
 * who's been playing for a while recognises the cast.
 */
type Paragraph = {
  paragraph: string;
  questions: Array<{
    q: string;
    correct: string;
    distractors: string[];
    kind: 'recall' | 'sequence' | 'inference' | 'main_idea' | 'vocab';
  }>;
};

const PARAGRAPHS: Paragraph[] = [
  {
    paragraph:
      "Cecily and her sister Esme found a small pond at the edge of the meadow. " +
      "A green frog sat very still on a flat lily pad, watching them. " +
      "When Esme stepped closer, the frog leapt with a quick splash and disappeared under the water. " +
      "The two girls sat down on the grass to wait for the frog to come back.",
    questions: [
      { q: 'Where did the girls find the pond?',
        correct: 'at the edge of the meadow',
        distractors: ['behind their house', 'in the forest', 'next to the road'],
        kind: 'recall' },
      { q: 'Why do you think the frog jumped?',
        correct: 'Esme stepped close and surprised it',
        distractors: ['it was hungry', 'a fish came near', 'the sun was too hot'],
        kind: 'inference' },
      { q: 'What did the girls do after the frog disappeared?',
        correct: 'they sat down to wait for it',
        distractors: ['they ran home', 'they tried to catch it', 'they threw food in the water'],
        kind: 'sequence' },
    ],
  },
  {
    paragraph:
      "A row of busy ants marched along the garden path. " +
      "Each ant carried a tiny piece of leaf back to the ant hill. " +
      "Inside the hill, the worker ants chew the leaves into a soft mush, and the mush helps grow a special fungus. " +
      "The ants don't actually eat the leaves — they eat the fungus that grows on them.",
    questions: [
      { q: 'What were the ants carrying?',
        correct: 'tiny pieces of leaf',
        distractors: ['drops of water', 'small seeds', 'crumbs of bread'],
        kind: 'recall' },
      { q: 'What do the ants actually eat?',
        correct: 'the fungus that grows on the leaves',
        distractors: ['the leaves', 'other ants', 'tiny bugs'],
        kind: 'recall' },
      { q: 'What is this passage mostly about?',
        correct: 'how ants use leaves to grow their food',
        distractors: ['the path through a garden', 'why ants march in a row', 'the size of an ant hill'],
        kind: 'main_idea' },
    ],
  },
  {
    paragraph:
      "The little firefly hovered above the dark meadow. " +
      "She blinked her tiny green-yellow light on and off, on and off. " +
      "Far across the field, another firefly began to flash back, and then another. " +
      "Soon the whole meadow was twinkling, like a quiet party of stars that had come down to the grass.",
    questions: [
      { q: 'What color was the firefly\'s light?',
        correct: 'green-yellow',
        distractors: ['bright red', 'pure white', 'pale blue'],
        kind: 'recall' },
      { q: 'What happened in the meadow at the end?',
        correct: 'many fireflies were flashing together',
        distractors: ['a storm rolled in', 'the moon rose over the trees', 'the firefly flew away'],
        kind: 'sequence' },
      { q: 'In this passage, the word "twinkling" most likely means…',
        correct: 'flashing softly with light',
        distractors: ['making a quiet sound', 'moving in slow circles', 'falling from the sky'],
        kind: 'vocab' },
    ],
  },
  {
    paragraph:
      "Late in the afternoon, the wind began to grow stronger. " +
      "The clouds turned grey and then nearly black. " +
      "Cecily ran out to the garden and quickly tied a thin sapling to a wooden stake so the wind couldn't bend it too far. " +
      "Just as she finished, the first big drops of rain began to fall.",
    questions: [
      { q: 'Why did Cecily tie up the sapling?',
        correct: 'so the strong wind would not bend it too far',
        distractors: ['so it would grow taller', 'so animals would not eat it', 'so it would get more sun'],
        kind: 'inference' },
      { q: 'What happened just after Cecily finished tying the sapling?',
        correct: 'big raindrops started to fall',
        distractors: ['the wind stopped', 'the sun came out', 'thunder cracked'],
        kind: 'sequence' },
    ],
  },
  {
    paragraph:
      "A small brown rabbit nibbled the soft clover at the edge of the lawn. " +
      "Suddenly her ears perked up — she had heard something. " +
      "Without a sound, she froze, becoming as still as a stone. " +
      "After a long moment, she decided the danger had passed and went back to her quiet meal.",
    questions: [
      { q: 'What was the rabbit eating?',
        correct: 'clover',
        distractors: ['carrots', 'grass seeds', 'lettuce leaves'],
        kind: 'recall' },
      { q: 'Why did the rabbit freeze?',
        correct: 'she heard something that might be danger',
        distractors: ['she was tired', 'she saw another rabbit', 'she lost her balance'],
        kind: 'inference' },
      { q: 'In this passage, "froze" means…',
        correct: 'stayed perfectly still',
        distractors: ['turned to ice', 'felt very cold', 'started shaking'],
        kind: 'vocab' },
    ],
  },
  {
    paragraph:
      "Bees are the gardeners of the meadow. " +
      "When a honey bee lands on a flower to drink the nectar, tiny grains of yellow pollen stick to her fuzzy body. " +
      "When she flies to the next flower, some of that pollen rubs off. " +
      "Without bees moving pollen from blossom to blossom, many of the plants we love could not make seeds at all.",
    questions: [
      { q: 'What is this passage mostly about?',
        correct: 'how bees help flowers make seeds',
        distractors: ['how bees make honey', 'why bees live in a hive', 'how bees defend themselves'],
        kind: 'main_idea' },
      { q: 'What sticks to a bee while she drinks nectar?',
        correct: 'pollen',
        distractors: ['raindrops', 'sap', 'leaves'],
        kind: 'recall' },
      { q: 'In this passage, the word "blossom" means…',
        correct: 'a flower',
        distractors: ['a kind of bee', 'a stem', 'a small fruit'],
        kind: 'vocab' },
    ],
  },
  {
    paragraph:
      "Esme planted ten sunflower seeds in a tidy row in the spring. " +
      "She watered the soil every morning before school. " +
      "Slowly, the green sprouts pushed up out of the ground. " +
      "By the middle of summer, eight of the seeds had grown into tall yellow flowers — though the other two never came up at all.",
    questions: [
      { q: 'How many seeds did Esme plant?',
        correct: 'ten',
        distractors: ['eight', 'six', 'twelve'],
        kind: 'recall' },
      { q: 'How many seeds turned into flowers?',
        correct: 'eight',
        distractors: ['ten', 'all of them', 'two'],
        kind: 'recall' },
      { q: 'What did Esme do every morning?',
        correct: 'she watered the soil',
        distractors: ['she counted the sprouts', 'she pulled weeds', 'she picked sunflowers'],
        kind: 'recall' },
    ],
  },
  {
    paragraph:
      "Spiders may look spooky, but they are very helpful to the garden. " +
      "Most spiders eat insects that would otherwise nibble on plants. " +
      "Some spiders spin big webs to catch flying bugs. " +
      "Others wait quietly under leaves and pounce on insects that crawl by. " +
      "Without spiders, our gardens would lose far more leaves to hungry bugs.",
    questions: [
      { q: 'How do most spiders help a garden?',
        correct: 'they eat insects that would damage plants',
        distractors: ['they pollinate the flowers', 'they make the soil softer', 'they scare away birds'],
        kind: 'main_idea' },
      { q: 'How do some spiders catch flying bugs?',
        correct: 'they spin webs',
        distractors: ['they jump high in the air', 'they hide inside flowers', 'they dig small traps'],
        kind: 'recall' },
      { q: 'What would happen without spiders in the garden?',
        correct: 'more leaves would be eaten by bugs',
        distractors: ['the flowers would not grow', 'the rain would stop', 'the bees would leave'],
        kind: 'inference' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════
// LEVEL 4 (CCSS Grade 4) — elo band ≈ 1550–1950
// ═══════════════════════════════════════════════════════════════════

/**
 * Multisyllable decoding (3–4 syllables). PhonemeBlend items: the
 * renderer asks the child to read the word aloud, part by part, and
 * hides the tiles unless they need them — but the interface still
 * wants three look-alike distractors, so each target carries three
 * words that share its shape (butterfly / butterflies / buttercup /
 * battering). Nature-heavy word list.
 */
const MULTISYLLABLE_WORDS: Array<{ phonemes: string[]; word: string; distractors: string[] }> = [
  { phonemes: ['but', 'ter', 'fly'], word: 'butterfly', distractors: ['butterflies', 'buttercup', 'battering'] },
  { phonemes: ['cat', 'er', 'pil', 'lar'], word: 'caterpillar', distractors: ['caterpillars', 'cartilage', 'capillary'] },
  { phonemes: ['dan', 'de', 'li', 'on'], word: 'dandelion', distractors: ['dandelions', 'dandruff', 'medallion'] },
  { phonemes: ['ev', 'er', 'green'], word: 'evergreen', distractors: ['evergreens', 'everglade', 'evening'] },
  { phonemes: ['hi', 'ber', 'na', 'tion'], word: 'hibernation', distractors: ['hibernating', 'habitation', 'hibernate'] },
  { phonemes: ['pol', 'li', 'na', 'tion'], word: 'pollination', distractors: ['pollinating', 'population', 'pollinate'] },
  { phonemes: ['tem', 'per', 'a', 'ture'], word: 'temperature', distractors: ['temperatures', 'temporary', 'temperament'] },
  { phonemes: ['veg', 'e', 'ta', 'ble'], word: 'vegetable', distractors: ['vegetables', 'vegetation', 'venerable'] },
  { phonemes: ['re', 'mark', 'a', 'ble'], word: 'remarkable', distractors: ['remarkably', 'removable', 'remembrance'] },
  { phonemes: ['wa', 'ter', 'mel', 'on'], word: 'watermelon', distractors: ['watermelons', 'waterfall', 'watercolor'] },
  { phonemes: ['grass', 'hop', 'per'], word: 'grasshopper', distractors: ['grasshoppers', 'grasslands', 'gossamer'] },
  { phonemes: ['hon', 'ey', 'suck', 'le'], word: 'honeysuckle', distractors: ['honeycomb', 'honeydew', 'honeybees'] },
  { phonemes: ['drag', 'on', 'fly'], word: 'dragonfly', distractors: ['dragonflies', 'dragonfruit', 'drizzling'] },
  { phonemes: ['cin', 'na', 'mon'], word: 'cinnamon', distractors: ['cinnamons', 'cinema', 'ceremony'] },
  { phonemes: ['mar', 'i', 'gold'], word: 'marigold', distractors: ['marigolds', 'marmalade', 'mariner'] },
  { phonemes: ['blue', 'ber', 'ry'], word: 'blueberry', distractors: ['blueberries', 'blackberry', 'blueprint'] },
  { phonemes: ['straw', 'ber', 'ry'], word: 'strawberry', distractors: ['strawberries', 'gooseberry', 'scarecrow'] },
  { phonemes: ['gar', 'den', 'er'], word: 'gardener', distractors: ['gardeners', 'gardening', 'gathering'] },
  { phonemes: ['sun', 'flow', 'er'], word: 'sunflower', distractors: ['sunflowers', 'sunbonnet', 'sunburned'] },
  { phonemes: ['wil', 'der', 'ness'], word: 'wilderness', distractors: ['wildflower', 'wanderings', 'wildebeest'] },
  { phonemes: ['hum', 'ming', 'bird'], word: 'hummingbird', distractors: ['hummingbirds', 'humdinger', 'humbleness'] },
  { phonemes: ['chrys', 'a', 'lis'], word: 'chrysalis', distractors: ['chrysalises', 'chrysanthemum', 'crystalize'] },
  { phonemes: ['am', 'phib', 'i', 'an'], word: 'amphibian', distractors: ['amphibians', 'amphitheater', 'ambiguous'] },
  { phonemes: ['ta', 'ran', 'tu', 'la'], word: 'tarantula', distractors: ['tarantulas', 'tambourine', 'tantalize'] },
  { phonemes: ['but', 'ter', 'cup'], word: 'buttercup', distractors: ['buttercups', 'buttermilk', 'butterscotch'] },
  { phonemes: ['beau', 'ti', 'ful'], word: 'beautiful', distractors: ['beautifully', 'bountiful', 'dutiful'] },
  { phonemes: ['thun', 'der', 'storm'], word: 'thunderstorm', distractors: ['thunderstorms', 'thundercloud', 'thunderous'] },
  { phonemes: ['per', 'i', 'win', 'kle'], word: 'periwinkle', distractors: ['periwinkles', 'pinwheel', 'perishable'] },
  { phonemes: ['wood', 'peck', 'er'], word: 'woodpecker', distractors: ['woodpeckers', 'woodcutter', 'woodworker'] },
  { phonemes: ['blos', 'som', 'ing'], word: 'blossoming', distractors: ['blossoms', 'blossomed', 'bothering'] },
];

/** Tricky, hard-to-decode high-frequency words (Fry 4th–5th). Fed to
 *  the same sightWordItems helper as the Dolch lists. */
const FRY_ACADEMIC = [
  'through', 'enough', 'straight', 'thought', 'caught', 'weight',
  'neighbor', 'island', 'answer', 'often', 'though', 'early',
  'heard', 'whether', 'minute', 'favorite', 'probably', 'especially',
  'business', 'weird', 'guard', 'science', 'friend', 'cousin',
  'journey', 'listen', 'castle', 'honest', 'whole', 'height',
  'building', 'certain',
];

/** A word carrying one of a small set of prefixes/suffixes, sorted in
 *  a DigraphSort by its affix. Same content/answer shape as the phonics
 *  digraph sorts, with the affix standing in for the "digraph". */
type AffixWord = { word: string; affix: string };

const PREFIX_DMN_WORDS: AffixWord[] = [
  { word: 'disagree', affix: 'dis' }, { word: 'dislike', affix: 'dis' },
  { word: 'disappear', affix: 'dis' }, { word: 'dishonest', affix: 'dis' },
  { word: 'disconnect', affix: 'dis' }, { word: 'disobey', affix: 'dis' },
  { word: 'misplace', affix: 'mis' }, { word: 'misspell', affix: 'mis' },
  { word: 'mistake', affix: 'mis' }, { word: 'misbehave', affix: 'mis' },
  { word: 'misread', affix: 'mis' }, { word: 'misunderstand', affix: 'mis' },
  { word: 'nonstop', affix: 'non' }, { word: 'nonsense', affix: 'non' },
  { word: 'nonfiction', affix: 'non' }, { word: 'nonliving', affix: 'non' },
  { word: 'nonstick', affix: 'non' }, { word: 'nonempty', affix: 'non' },
];

type SentenceMeaning = { sentence: string; question: string; correct: string; distractors: string[] };

const PREFIX_DMN_MEANINGS: SentenceMeaning[] = [
  { sentence: 'If you MISPLACE your trowel, you cannot find where you put it.', question: 'MISPLACE means to…', correct: 'lose track of where something is', distractors: ['throw it away on purpose', 'clean it carefully', 'buy a brand-new one'] },
  { sentence: 'The two friends DISAGREE about where to plant the beans.', question: 'When two friends DISAGREE, they…', correct: 'have different ideas', distractors: ['both want the very same thing', 'are fast asleep', 'are best friends'] },
  { sentence: 'Nana read a NONFICTION book about how bees live.', question: 'A NONFICTION book is…', correct: 'all true and real', distractors: ['completely made up', 'only about dragons', 'full of jokes'] },
  { sentence: 'The rabbit will DISAPPEAR the moment you step too close.', question: 'To DISAPPEAR means to…', correct: 'go out of sight', distractors: ['appear once more', 'grow much bigger', 'make a loud sound'] },
  { sentence: 'If you MISSPELL a word, you spell it the wrong way.', question: 'To MISSPELL a word is to…', correct: 'spell it incorrectly', distractors: ['spell it perfectly', 'say it very loudly', 'read it twice'] },
  { sentence: 'The NONSTOP train raced past without slowing down.', question: 'A NONSTOP train…', correct: 'does not stop', distractors: ['stops at every town', 'goes backward', 'is always late'] },
  { sentence: 'Cecily began to DISLIKE the taste of the sour berries.', question: 'To DISLIKE something means you…', correct: 'do not like it', distractors: ['love it dearly', 'grow it yourself', 'give it away'] },
  { sentence: 'If the puppy MISBEHAVES, he digs up the flower beds.', question: 'To MISBEHAVE is to…', correct: 'act in a naughty way', distractors: ['sit quietly and still', 'behave very well', 'fall fast asleep'] },
  { sentence: 'A rock is a NONLIVING thing in the garden.', question: 'Something NONLIVING is…', correct: 'not alive', distractors: ['growing quickly', 'breathing softly', 'eating leaves'] },
  { sentence: 'To water the far bed, Esme had to DISCONNECT the two hoses.', question: 'To DISCONNECT the hoses means to…', correct: 'take them apart', distractors: ['join them together', 'fill them with water', 'paint them green'] },
  { sentence: 'The plan was pure NONSENSE and could never work.', question: 'If a plan is NONSENSE, it…', correct: 'does not make sense', distractors: ['works perfectly', 'is very clever', 'is a big secret'] },
  { sentence: 'It is easy to MISREAD a faded, muddy sign.', question: 'To MISREAD a sign means to…', correct: 'read it wrong', distractors: ['read it aloud', 'paint over the sign', 'read it again'] },
  { sentence: 'The two garden journals DISAGREE about the day the seeds sprouted.', question: 'When two journals DISAGREE, they…', correct: 'do not match', distractors: ['say exactly the same thing', 'are both blank', 'are both correct'] },
  { sentence: 'Nana bakes cornbread in a shiny NONSTICK pan.', question: 'A NONSTICK pan is one where…', correct: 'nothing sticks to it', distractors: ['everything sticks fast', 'the food always burns', 'honey is stored'] },
  { sentence: 'It is DISHONEST to say you watered the plants when you did not.', question: 'To be DISHONEST means to…', correct: 'not tell the truth', distractors: ['always tell the truth', 'talk a great deal', 'be very kind'] },
  { sentence: 'It is easy to MISTAKE a young weed for a flower.', question: 'To MISTAKE one plant for another means to…', correct: 'think it is something it is not', distractors: ['pull the flower on purpose', 'water it very well', 'know exactly what it is'] },
  { sentence: 'A wild deer will DISOBEY no rule but its own fear.', question: 'To DISOBEY a rule means to…', correct: 'not follow it', distractors: ['follow it carefully', 'write a new rule', 'read it aloud'] },
  { sentence: 'After the harvest, the shed was NONEMPTY, packed with baskets.', question: 'A NONEMPTY shed…', correct: 'has something in it', distractors: ['is completely bare', 'has a broken door', 'is far too high'] },
];

const SUFFIX_FLN_WORDS: AffixWord[] = [
  { word: 'careful', affix: 'ful' }, { word: 'hopeful', affix: 'ful' },
  { word: 'cheerful', affix: 'ful' }, { word: 'colorful', affix: 'ful' },
  { word: 'helpful', affix: 'ful' }, { word: 'joyful', affix: 'ful' },
  { word: 'careless', affix: 'less' }, { word: 'fearless', affix: 'less' },
  { word: 'hopeless', affix: 'less' }, { word: 'harmless', affix: 'less' },
  { word: 'endless', affix: 'less' }, { word: 'spotless', affix: 'less' },
  { word: 'kindness', affix: 'ness' }, { word: 'darkness', affix: 'ness' },
  { word: 'sadness', affix: 'ness' }, { word: 'brightness', affix: 'ness' },
  { word: 'softness', affix: 'ness' }, { word: 'wildness', affix: 'ness' },
];

const SUFFIX_FLN_MEANINGS: SentenceMeaning[] = [
  { sentence: 'A CARELESS gardener forgot to water the thirsty seedlings.', question: 'A CARELESS gardener is one who…', correct: 'does not pay careful attention', distractors: ['waters everything just right', 'plants very neat rows', 'always wins a prize'] },
  { sentence: 'Esme felt HOPEFUL that every seed would sprout.', question: 'To feel HOPEFUL is to…', correct: 'think good things will happen', distractors: ['feel very sad', 'feel sleepy', 'feel angry'] },
  { sentence: 'Sharing her berries was an act of KINDNESS.', question: 'KINDNESS means being…', correct: 'kind and caring', distractors: ['unkind and mean', 'very fast', 'very loud'] },
  { sentence: 'In the DARKNESS of the shed, Cecily could barely see.', question: 'In DARKNESS you…', correct: 'cannot see very well', distractors: ['hear nothing at all', 'smell every flower', 'feel very cold'] },
  { sentence: 'The FEARLESS explorer walked straight into the deep cave.', question: 'A FEARLESS explorer is…', correct: 'not afraid', distractors: ['always scared', 'very tired', 'very small'] },
  { sentence: 'The little ladybug is HARMLESS and cannot hurt you.', question: 'A HARMLESS bug…', correct: 'cannot hurt you', distractors: ['has a nasty sting', 'bites very hard', 'is dangerous'] },
  { sentence: 'The path seemed ENDLESS as it wound on and on.', question: 'An ENDLESS path…', correct: 'seems to go on and on', distractors: ['stops right away', 'is only one step', 'has a locked gate'] },
  { sentence: 'The COLORFUL garden was full of reds, blues, and golds.', question: 'A COLORFUL garden is…', correct: 'full of many colors', distractors: ['all dull gray', 'very quiet', 'quite tiny'] },
  { sentence: 'She loved the SOFTNESS of the green moss under her feet.', question: 'The SOFTNESS of moss means it feels…', correct: 'soft', distractors: ['hard', 'sharp', 'burning hot'] },
  { sentence: 'A HELPFUL friend lent Nana a hand with the weeding.', question: 'A HELPFUL friend is one who…', correct: 'gives you help', distractors: ['never helps at all', 'runs away', 'stays asleep'] },
  { sentence: 'After the rain washed it, the birdbath was SPOTLESS.', question: 'If something is SPOTLESS, it…', correct: 'has no dirt at all', distractors: ['is covered in mud', 'is frozen solid', 'is very deep'] },
  { sentence: 'The JOYFUL song of the robin filled the morning.', question: 'A JOYFUL song makes you feel…', correct: 'happy', distractors: ['sad', 'bored', 'sleepy'] },
  { sentence: 'The BRIGHTNESS of the noon sun made Cecily squint.', question: 'The BRIGHTNESS of the sun made her…', correct: 'squint her eyes', distractors: ['feel cold', 'fall asleep', 'shiver'] },
  { sentence: 'The HOPELESS tangle of vines looked too hard to ever fix.', question: 'A HOPELESS tangle…', correct: 'seems too hard to fix', distractors: ['is easy to undo', 'is very short', 'smells sweet'] },
  { sentence: 'Even in the rain, Nana stayed CHEERFUL and hummed a tune.', question: 'To be CHEERFUL is to be…', correct: 'happy and bright', distractors: ['grumpy', 'silent', 'lost'] },
  { sentence: 'A great SADNESS came over Esme when her flower wilted.', question: 'SADNESS is the feeling that makes you…', correct: 'want to cry', distractors: ['laugh out loud', 'jump for joy', 'run fast'] },
  { sentence: 'A CAREFUL scientist checks her work very closely.', question: 'A CAREFUL scientist…', correct: 'pays close attention to her work', distractors: ['rushes and makes mistakes', 'never writes anything down', 'only guesses'] },
  { sentence: 'The WILDNESS of the meadow was full of tangled, untamed grass.', question: 'The WILDNESS of the meadow means it was…', correct: 'wild and untamed', distractors: ['neatly trimmed', 'paved with stone', 'completely bare'] },
];

/** Context-clue vocabulary. Each sentence holds a challenging word in
 *  CAPS with enough context to pin its meaning; the question asks what
 *  the word means. Hand-authored, garden/nature themed. */
const CONTEXT_CLUES: SentenceMeaning[] = [
  { sentence: 'The drought PARCHED the garden — the soil was dry and cracked.', question: 'PARCHED means…', correct: 'very dry', distractors: ['soaking wet', 'freshly dug', 'covered in weeds'] },
  { sentence: 'The tiny sprout was so FRAGILE that a gust of wind could snap it.', question: 'FRAGILE means…', correct: 'easily broken', distractors: ['very strong', 'bright green', 'fast growing'] },
  { sentence: 'The bees were INDUSTRIOUS, working from dawn until dusk.', question: 'INDUSTRIOUS means…', correct: 'hard-working', distractors: ['lazy', 'sleepy', 'angry'] },
  { sentence: 'After the rain, the plants looked LUSH — thick, full, and green.', question: 'LUSH means…', correct: 'thick and healthy', distractors: ['dry and thin', 'brown and dead', 'small and weak'] },
  { sentence: 'The old oak was ENORMOUS, taller even than the barn.', question: 'ENORMOUS means…', correct: 'very big', distractors: ['very small', 'very old', 'very green'] },
  { sentence: 'The rabbit was TIMID and dashed away at the smallest sound.', question: 'TIMID means…', correct: 'shy and easily scared', distractors: ['brave', 'hungry', 'friendly'] },
  { sentence: 'The stream MEANDERED slowly through the meadow, bending this way and that.', question: 'MEANDERED means…', correct: 'wandered in slow curves', distractors: ['rushed straight ahead', 'dried up', 'froze solid'] },
  { sentence: 'The frost was so BITTER that it nipped at their noses.', question: 'BITTER (about weather) means…', correct: 'very cold and sharp', distractors: ['sweet', 'warm', 'gentle'] },
  { sentence: 'The garden was TRANQUIL, quiet and calm in the morning light.', question: 'TRANQUIL means…', correct: 'peaceful', distractors: ['noisy', 'crowded', 'stormy'] },
  { sentence: 'The soil was FERTILE, so everything they planted grew well.', question: 'FERTILE means…', correct: 'good for growing', distractors: ['rocky and bare', 'full of ants', 'far too wet'] },
  { sentence: 'The vines were TANGLED, twisted around each other in a mess.', question: 'TANGLED means…', correct: 'knotted together', distractors: ['neatly lined up', 'cut short', 'painted green'] },
  { sentence: 'The berries were ABUNDANT — far more than they could ever pick.', question: 'ABUNDANT means…', correct: 'plentiful', distractors: ['rare', 'rotten', 'tiny'] },
  { sentence: 'The caterpillar crept at a SLUGGISH pace, slow and lazy.', question: 'SLUGGISH means…', correct: 'very slow', distractors: ['very fast', 'very high', 'very loud'] },
  { sentence: 'The scent of the roses was FRAGRANT and sweet.', question: 'FRAGRANT means…', correct: 'sweet-smelling', distractors: ['rotten-smelling', 'very loud', 'brightly colored'] },
  { sentence: 'The thorny bush was so DENSE they could not see through it.', question: 'DENSE means…', correct: 'packed tightly together', distractors: ['thin and open', 'soft and fluffy', 'short and neat'] },
  { sentence: 'The dry leaves were BRITTLE and crumbled at a single touch.', question: 'BRITTLE means…', correct: 'easily crumbled', distractors: ['soft and bendy', 'wet and heavy', 'smooth and shiny'] },
  { sentence: 'The gardener was WEARY after a long day of digging.', question: 'WEARY means…', correct: 'very tired', distractors: ['full of energy', 'very happy', 'very hungry'] },
  { sentence: 'The pond was SHALLOW, only up to their ankles.', question: 'SHALLOW means…', correct: 'not deep', distractors: ['very deep', 'very wide', 'frozen over'] },
  { sentence: 'The wildflowers were SCATTERED across the whole field.', question: 'SCATTERED means…', correct: 'spread all around', distractors: ['in one tidy pile', 'lined up in a row', 'hidden away'] },
  { sentence: 'The morning dew made the grass GLISTEN in the sun.', question: 'GLISTEN means…', correct: 'sparkle and shine', distractors: ['turn brown', 'dry out', 'smell sweet'] },
  { sentence: 'The old fence was FEEBLE and leaned over in the wind.', question: 'FEEBLE means…', correct: 'weak', distractors: ['strong', 'brand new', 'bright red'] },
  { sentence: 'The nectar was a VITAL source of food for the young bees.', question: 'VITAL means…', correct: 'very important', distractors: ['not needed', 'very bad', 'very small'] },
  { sentence: 'The seedlings were DELICATE and needed gentle care.', question: 'DELICATE means…', correct: 'easily harmed', distractors: ['tough', 'huge', 'spiky'] },
  { sentence: 'The garden path was OVERGROWN with weeds and tall grass.', question: 'OVERGROWN means…', correct: 'covered with too many plants', distractors: ['freshly mowed', 'paved with stone', 'totally bare'] },
  { sentence: 'The owl sat MOTIONLESS on the branch, not moving at all.', question: 'MOTIONLESS means…', correct: 'perfectly still', distractors: ['shaking', 'flying', 'hooting'] },
  { sentence: 'The gardener PLUCKED the ripe tomato from the vine.', question: 'PLUCKED means…', correct: 'picked', distractors: ['watered', 'planted', 'dropped'] },
  { sentence: 'The compost had a PUNGENT smell that made her wrinkle her nose.', question: 'PUNGENT means…', correct: 'strong and sharp', distractors: ['sweet and faint', 'cool and fresh', 'with no smell'] },
  { sentence: 'The vegetables THRIVED in the rich soil, growing bigger each day.', question: 'THRIVED means…', correct: 'grew very well', distractors: ['wilted', 'stayed the same', 'disappeared'] },
  { sentence: 'The morning air was CRISP and cool against her cheeks.', question: 'CRISP (about air) means…', correct: 'fresh and cool', distractors: ['warm and damp', 'thick and smoky', 'heavy and wet'] },
  { sentence: 'The snail left a GLOSSY trail that shone on the leaf.', question: 'GLOSSY means…', correct: 'shiny', distractors: ['dull', 'sticky and dry', 'rough'] },
];

/** Longer informational + narrative passages (100–140 words, 5–8
 *  sentences), 2–3 linked questions each. Same Paragraph shape as the
 *  Grade-3 PARAGRAPHS. */
const PASSAGES: Paragraph[] = [
  {
    paragraph:
      "A butterfly does not start life with wings. It begins as a tiny egg, usually stuck to the underside of a leaf. " +
      "Out of the egg crawls a hungry caterpillar, which eats and eats until it grows far too big for its own skin. " +
      "When the time is right, the caterpillar forms a hard case called a chrysalis and hangs very still. " +
      "Inside, something amazing happens: its whole body slowly changes. " +
      "Days or weeks later, the case splits open and a butterfly climbs out. " +
      "At first its wings are damp and crumpled, but soon they dry, spread wide, and carry it up into the air. " +
      "This astonishing change is called metamorphosis.",
    questions: [
      { q: 'What comes right after the egg hatches?', correct: 'a caterpillar crawls out', distractors: ['a butterfly flies away', 'a chrysalis forms', 'the wings dry out'], kind: 'sequence' },
      { q: 'In this passage, "metamorphosis" means…', correct: 'a big change from one form to another', distractors: ['a kind of leaf', "a butterfly's egg", 'a very long sleep'], kind: 'vocab' },
      { q: 'This passage is mostly about…', correct: 'how a butterfly changes as it grows', distractors: ['what caterpillars like to eat', 'why leaves have eggs on them', 'how high butterflies can fly'], kind: 'main_idea' },
    ],
  },
  {
    paragraph:
      "Plants cannot walk, so how do their seeds travel to new places to grow? Nature has clever tricks. " +
      "Some seeds, like the dandelion's, wear tiny parachutes of fluff and float away on the wind. " +
      "Others, like the burr's, have little hooks that cling to the fur of passing animals and hitch a ride. " +
      "Juicy berries are eaten by birds, and the hard seeds inside pass through and drop far from the parent plant. " +
      "A few seeds even ride on water, floating down streams to sprout on a fresh bank. " +
      "Each trick helps a seed land somewhere with room, sunlight, and soil of its own.",
    questions: [
      { q: 'What is this passage mostly about?', correct: 'the different ways seeds travel to new places', distractors: ['why plants cannot walk', 'how birds build their nests', 'what dandelions look like'], kind: 'main_idea' },
      { q: 'How does a dandelion seed travel?', correct: 'it floats on the wind', distractors: ['it hooks onto fur', 'it rolls downhill', 'it is buried by ants'], kind: 'recall' },
      { q: 'Why is it helpful for a seed to land far from its parent plant?', correct: 'it can find its own space and sunlight', distractors: ['it can stay close to home', 'it grows faster in the shade', 'it needs no soil at all'], kind: 'inference' },
    ],
  },
  {
    paragraph:
      "When autumn arrives and the days grow short, many birds begin a long journey called migration. " +
      "They fly south to places where the winter is warm and food is easy to find. " +
      "Some birds travel in great V-shaped flocks, taking turns leading so no single bird grows too tired. " +
      "Others fly alone, guided by the stars and by the Earth's own magnetism. " +
      "A few small songbirds cross entire oceans without stopping to rest. " +
      "When spring returns and the north grows warm again, the birds fly back to raise their young, following the very same routes their parents once flew.",
    questions: [
      { q: 'In this passage, "migration" means…', correct: 'a long journey to a new place', distractors: ['building a warm nest', 'a kind of feather', 'a winter storm'], kind: 'vocab' },
      { q: 'Why do the birds take turns leading the V-shaped flock?', correct: 'so no single bird gets too tired', distractors: ['so they look pretty', 'so they can race each other', 'so they stay warm'], kind: 'inference' },
      { q: 'When do the birds fly back north?', correct: 'when spring returns', distractors: ['in the middle of winter', 'when food runs out in the south', 'at the first snowfall'], kind: 'recall' },
    ],
  },
  {
    paragraph:
      "In one corner of the garden, Nana keeps a pile she calls her treasure heap. " +
      "Into it go banana peels, apple cores, coffee grounds, dead leaves, and grass clippings. " +
      "At first it looks like nothing but scraps. " +
      "But hidden inside, an army of worms, bugs, and tiny living things gets to work, breaking everything down. " +
      "Over many months the pile turns dark, crumbly, and rich, like chocolate cake for plants. " +
      "This is compost. Nana spreads it around her vegetables so the soil stays healthy and her tomatoes grow plump and sweet. " +
      "Nothing is wasted; even yesterday's peelings become tomorrow's dinner.",
    questions: [
      { q: 'This passage is mostly about…', correct: 'how food scraps turn into rich compost for plants', distractors: ['how Nana grows her tomatoes', 'why worms live in gardens', 'what Nana likes to eat'], kind: 'main_idea' },
      { q: 'When Nana calls the pile a "treasure heap," she means…', correct: 'it is valuable even though it looks like scraps', distractors: ['it is full of gold coins', 'it is where she hides toys', 'it smells wonderful'], kind: 'vocab' },
      { q: 'What does Nana do with the finished compost?', correct: 'she spreads it around her vegetables', distractors: ['she throws it away', 'she puts it back in the kitchen', 'she feeds it to the worms'], kind: 'recall' },
    ],
  },
  {
    paragraph:
      "An orb-weaver spider builds one of nature's finest traps. " +
      "She begins by letting out a single thread that drifts on the breeze until it catches on a twig. " +
      "From that first bridge she adds spoke after spoke, like the wheel of a bicycle. " +
      "Then, starting at the center, she spins round and round, laying a spiral of sticky silk. " +
      "The dry spokes are safe to walk on, but the sticky spiral catches any insect that blunders into it. " +
      "When a fly is caught, the spider feels the web tremble and hurries over. " +
      "Each morning she may eat the old web and spin a fresh one.",
    questions: [
      { q: 'What does the spider do first?', correct: 'she lets out a thread that catches on a twig', distractors: ['she spins the sticky spiral', 'she eats the old web', 'she waits for a fly'], kind: 'sequence' },
      { q: "Why doesn't the spider get stuck in her own web?", correct: 'she walks on the dry spokes, not the sticky spiral', distractors: ['her feet are much too small', 'she never touches the web at all', 'the web is not really sticky'], kind: 'inference' },
      { q: 'How does the spider know a fly is caught?', correct: 'she feels the web tremble', distractors: ['she hears it buzzing', 'she sees it from far away', 'she smells it'], kind: 'recall' },
    ],
  },
  {
    paragraph:
      "When a honeybee finds a patch of flowers full of nectar, she flies home with important news. " +
      "But bees cannot speak, so she tells the others by dancing. " +
      "Right there on the honeycomb, she runs in a special pattern called the waggle dance, wiggling her body as she goes. " +
      "The direction she points shows which way to fly, and the length of her wiggle tells how far away the flowers are. " +
      "The longer she waggles, the farther the trip. " +
      "Her sisters crowd close, feel the dance, and then set off in the right direction. " +
      "In this way, one clever bee can share a whole meadow with her hive.",
    questions: [
      { q: 'This passage is mostly about…', correct: 'how a bee tells other bees where to find flowers', distractors: ['how bees make honey', 'why bees cannot speak', 'how far bees can fly'], kind: 'main_idea' },
      { q: "What does the length of the bee's waggle tell the others?", correct: 'how far away the flowers are', distractors: ['what color the flowers are', 'how sweet the nectar is', 'how many bees to send'], kind: 'recall' },
      { q: 'The "waggle dance" is…', correct: 'a wiggling pattern the bee runs to share directions', distractors: ['a song the bees hum', 'a kind of flower', 'a fight between bees'], kind: 'vocab' },
    ],
  },
  {
    paragraph:
      "When the ocean tide goes out, it leaves behind small pools of water among the rocks. " +
      "These tide pools are like tiny worlds, packed with life. " +
      "Bright sea stars cling to the stone, and green anemones wave their soft arms, waiting to catch a passing shrimp. " +
      "Tiny crabs scuttle sideways into shadowy cracks, and snails graze slowly on the rocks. " +
      "The creatures here must be tough, for twice each day the sea rushes back in and covers them again. " +
      "Between the crash of waves and the burning sun, a tide pool is a hard place to live — but a wonderful place to explore.",
    questions: [
      { q: 'Why must tide pool creatures be tough?', correct: 'the sea covers and uncovers them twice a day', distractors: ['there is never any water', 'the pools are always dark', 'no other animals live nearby'], kind: 'inference' },
      { q: 'What do the green anemones wait to catch?', correct: 'a passing shrimp', distractors: ['a sea star', 'a snail', 'a wave'], kind: 'recall' },
      { q: 'In this passage, "scuttle" means…', correct: 'move quickly with small steps', distractors: ['swim deep down', 'sleep all day', 'float on top'], kind: 'vocab' },
    ],
  },
  {
    paragraph:
      "The Earth leans a little to one side as it circles the sun, and that tilt gives us our seasons. " +
      "In summer, our part of the world tilts toward the sun, so the days are long and warm and the garden bursts with growth. " +
      "As autumn comes, the light softens, leaves turn gold, and plants begin to rest. " +
      "Winter tilts us away from the sun; the days are short and cold, and many trees stand bare. " +
      "Then spring returns, the sun climbs higher, buds unfurl, and the whole cycle begins again. " +
      "Season after season, the garden sleeps and wakes, wakes and sleeps.",
    questions: [
      { q: 'This passage is mostly about…', correct: 'why the Earth has different seasons', distractors: ['why leaves are green', 'how gardens are planted', 'how far away the sun is'], kind: 'main_idea' },
      { q: 'What causes the seasons?', correct: 'the tilt of the Earth as it circles the sun', distractors: ['how much rain falls', 'the phases of the moon', 'the direction of the wind'], kind: 'recall' },
      { q: 'Why do many trees stand bare in winter?', correct: 'the plants are resting in the short, cold days', distractors: ['birds eat all the leaves', 'the sun is too bright', 'the trees have died'], kind: 'inference' },
    ],
  },
  {
    paragraph:
      "Cecily searched the whole garden for Luna, but the cat was nowhere to be seen. " +
      "She called and called, shaking the little bag of treats that Luna loved, but nothing came. " +
      "At last, just as the sun began to set, Cecily heard a faint mew from high above. " +
      "There, stuck on a branch of the old apple tree, was Luna, her green eyes wide. " +
      "She had chased a squirrel too far and now could not get down. " +
      "Cecily fetched Nana, who brought the tall ladder and, very gently, carried the trembling cat back to the ground. " +
      "Safe at last, Luna licked her paw as if nothing had happened at all.",
    questions: [
      { q: 'Why could Luna not get down from the tree?', correct: 'she had climbed too far chasing a squirrel', distractors: ['she was too sleepy to move', 'the branch was on fire', 'Cecily had tied her up'], kind: 'inference' },
      { q: 'What happened just after Cecily heard the mew?', correct: 'she found Luna stuck in the apple tree', distractors: ['Luna ran home', 'the sun rose', 'Nana put away the ladder'], kind: 'sequence' },
      { q: 'When Luna "licked her paw as if nothing had happened," it shows she was…', correct: 'acting calm and proud again', distractors: ['badly hurt', 'still terrified', 'very hungry'], kind: 'inference' },
    ],
  },
  {
    paragraph:
      "Esme woke to find the whole garden dusted in white. " +
      "Overnight the first frost had come, and every leaf and blade of grass wore a coat of tiny ice crystals that sparkled in the early sun. " +
      "She rushed outside in her boots, her breath making little clouds in the cold air. " +
      "The pumpkins she and Nana had grown sat plump and orange on the frosted vine. " +
      "Esme knew what this meant: it was time to bring in the last of the harvest before winter truly arrived. " +
      "She hurried back inside to wake her sister, for there was work — and wonder — waiting in the cold, bright morning.",
    questions: [
      { q: 'In this passage, "dusted in white" means…', correct: 'covered lightly with frost', distractors: ['painted with white paint', 'buried in deep snow', 'sprinkled with sugar'], kind: 'vocab' },
      { q: 'Why did Esme know it was time to bring in the harvest?', correct: 'the first frost meant winter was near', distractors: ['the pumpkins were rotten', 'Nana had told her the day before', 'the garden was empty'], kind: 'inference' },
      { q: 'What did Esme do right after seeing the frost?', correct: 'she hurried to wake her sister', distractors: ['she went back to sleep', 'she picked all the flowers', 'she built a snowman'], kind: 'sequence' },
    ],
  },
  {
    paragraph:
      "Earthworms may seem plain, but they are among the garden's hardest workers. " +
      "All day and night they tunnel through the soil, swallowing dirt and bits of dead leaves as they go. " +
      "What passes out the other end is rich food for plants. " +
      "Their tunnels do another job too: they let air and rainwater soak deep down to the roots, where they are needed most. " +
      "A single garden can hold thousands of worms, quietly turning and mixing the earth. " +
      "Charles Darwin, a famous scientist, once said that few creatures have done as much to shape the land as the humble earthworm.",
    questions: [
      { q: 'This passage is mostly about…', correct: 'how earthworms help the soil and plants', distractors: ['how deep worms can dig', 'who Charles Darwin was', 'why leaves fall'], kind: 'main_idea' },
      { q: "Why are the worms' tunnels good for plant roots?", correct: 'they let air and water reach the roots', distractors: ['they keep the roots warm', 'they scare away bugs', 'they hold the plant up'], kind: 'inference' },
      { q: 'What did Charles Darwin say about earthworms?', correct: 'few creatures have done as much to shape the land', distractors: ['they are the fastest diggers', 'they live only in gardens', 'they cannot survive the cold'], kind: 'recall' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════
// LEVEL 5 (CCSS Grade 5) — elo band ≈ 1800–2200
// ═══════════════════════════════════════════════════════════════════

const SUFFIX_TMI_WORDS: AffixWord[] = [
  { word: 'invention', affix: 'tion' }, { word: 'protection', affix: 'tion' },
  { word: 'education', affix: 'tion' }, { word: 'celebration', affix: 'tion' },
  { word: 'information', affix: 'tion' }, { word: 'direction', affix: 'tion' },
  { word: 'movement', affix: 'ment' }, { word: 'excitement', affix: 'ment' },
  { word: 'enjoyment', affix: 'ment' }, { word: 'agreement', affix: 'ment' },
  { word: 'treatment', affix: 'ment' }, { word: 'improvement', affix: 'ment' },
  { word: 'curiosity', affix: 'ity' }, { word: 'electricity', affix: 'ity' },
  { word: 'activity', affix: 'ity' }, { word: 'ability', affix: 'ity' },
  { word: 'community', affix: 'ity' }, { word: 'generosity', affix: 'ity' },
];

const SUFFIX_TMI_MEANINGS: SentenceMeaning[] = [
  { sentence: 'The wheelbarrow was a clever INVENTION that made the work easier.', question: 'An INVENTION is…', correct: 'a new thing someone makes', distractors: ['an old broken toy', 'a kind of animal', 'a loud noise'] },
  { sentence: 'The MOVEMENT of the tall grass showed the wind was picking up.', question: 'MOVEMENT means…', correct: 'the act of moving', distractors: ['staying perfectly still', 'a quiet room', 'a deep sleep'] },
  { sentence: 'Her CURIOSITY led her to lift every leaf and peek beneath.', question: 'CURIOSITY is…', correct: 'the wish to learn or find out', distractors: ['a feeling of anger', 'a kind of plant', 'being very tired'] },
  { sentence: 'The fence gave the seedlings PROTECTION from the hungry deer.', question: 'PROTECTION means…', correct: 'keeping something safe', distractors: ['putting it in danger', 'throwing it away', 'making it dirty'] },
  { sentence: 'There was great EXCITEMENT when the first bud finally opened.', question: 'EXCITEMENT is a feeling of…', correct: 'being eager and thrilled', distractors: ['being bored', 'being sleepy', 'being calm'] },
  { sentence: 'ELECTRICITY lit the greenhouse lamps on the dark winter night.', question: 'ELECTRICITY is the power that…', correct: 'makes lights and machines work', distractors: ['waters the garden', 'grows the plants', 'feeds the bees'] },
  { sentence: 'After talking it over, the sisters reached an AGREEMENT about the plan.', question: 'When people reach an AGREEMENT, they…', correct: 'decide something together', distractors: ['start to argue', 'walk away', 'fall asleep'] },
  { sentence: 'Weeding the beds was Esme\'s favorite ACTIVITY.', question: 'An ACTIVITY is…', correct: 'something you do', distractors: ['a place to sleep', 'a kind of food', 'a quiet nap'] },
  { sentence: 'The harvest CELEBRATION filled the yard with music and laughter.', question: 'A CELEBRATION is…', correct: 'a happy time to mark something special', distractors: ['a sad goodbye', 'a long chore', 'a quiet rest'] },
  { sentence: 'She felt real ENJOYMENT as she wandered the blooming rows.', question: 'ENJOYMENT is the feeling you get when you…', correct: 'have a good time', distractors: ['feel unwell', 'feel afraid', 'feel bored'] },
  { sentence: 'The whole COMMUNITY came together to plant the new orchard.', question: 'A COMMUNITY is…', correct: 'a group of people living together', distractors: ['a single empty house', 'a lone traveler', 'a bare field'] },
  { sentence: 'Nana showed great GENEROSITY, sharing her seeds with every neighbor.', question: 'GENEROSITY means…', correct: 'being willing to share and give', distractors: ['keeping everything for yourself', 'taking from others', 'being greedy'] },
  { sentence: 'The gentle TREATMENT of the wilting fern soon brought it back to life.', question: 'The TREATMENT of a sick plant is…', correct: 'the care given to help it get better', distractors: ['throwing it out', 'leaving it all alone', 'cutting it down'] },
  { sentence: 'The signpost gave clear DIRECTION to the pond.', question: 'DIRECTION tells you…', correct: 'which way to go', distractors: ['how old you are', 'what time it is', 'how much it costs'] },
  { sentence: 'With practice, Cecily gained the ABILITY to name every bird by its song.', question: 'ABILITY means…', correct: 'being able to do something', distractors: ['not knowing how', 'being unwilling', 'being tired'] },
  { sentence: 'The field guide held a great deal of INFORMATION about moths.', question: 'INFORMATION is…', correct: 'facts you learn about something', distractors: ['a made-up story', 'a funny joke', 'a hiding place'] },
  { sentence: 'Careful watering brought a real IMPROVEMENT in the drooping tomatoes.', question: 'IMPROVEMENT means…', correct: 'getting better', distractors: ['getting worse', 'staying the same', 'falling down'] },
  { sentence: 'The EDUCATION of a young gardener takes many patient seasons.', question: 'EDUCATION means…', correct: 'the learning of new things', distractors: ['forgetting everything', 'a kind of tool', 'a long vacation'] },
];

/** Greek and Latin roots. Each item names a root and its meaning, then
 *  asks which word carries that root and fits the clue. Distractors are
 *  words built from OTHER roots, so exactly one choice both contains the
 *  target root and matches the meaning. */
const ROOT_ITEMS: SentenceMeaning[] = [
  { sentence: "The root PORT means 'to carry'.", question: 'Which word means "able to be carried"?', correct: 'portable', distractors: ['telephone', 'aquarium', 'geology'] },
  { sentence: "The root PORT means 'to carry'.", question: 'Which word means "to carry goods to another place"?', correct: 'transport', distractors: ['telescope', 'autograph', 'terrarium'] },
  { sentence: "The root PORT means 'to carry'.", question: 'Which word names a person who carries travelers\' bags?', correct: 'porter', distractors: ['biography', 'aquarium', 'geometry'] },
  { sentence: "The root GRAPH means 'to write or draw'.", question: 'Which word means "the written story of a person\'s life"?', correct: 'biography', distractors: ['telephone', 'aquarium', 'terrain'] },
  { sentence: "The root GRAPH means 'to write'.", question: 'Which word means "a name you write with your own hand"?', correct: 'autograph', distractors: ['telescope', 'aquatics', 'geology'] },
  { sentence: "The root GRAPH means 'to write or draw'.", question: 'Which word means "a chart that shows information with lines"?', correct: 'graph', distractors: ['telephone', 'aquarium', 'terrarium'] },
  { sentence: "The root TELE means 'far away'.", question: 'Which word means "a tool for seeing far-off things"?', correct: 'telescope', distractors: ['aquarium', 'portable', 'autograph'] },
  { sentence: "The root TELE means 'far off'.", question: 'Which word means "a device for talking to someone far away"?', correct: 'telephone', distractors: ['biography', 'aquarium', 'geology'] },
  { sentence: "The root TELE means 'distant'.", question: 'Which word names a screen showing pictures sent from far away?', correct: 'television', distractors: ['portable', 'aquarium', 'photograph'] },
  { sentence: "The root AQUA means 'water'.", question: 'Which word names a glass tank of water for fish?', correct: 'aquarium', distractors: ['telescope', 'autograph', 'geology'] },
  { sentence: "The root AQUA means 'water'.", question: 'Which word describes a blue-green color, like clear water?', correct: 'aquamarine', distractors: ['portable', 'telephone', 'biography'] },
  { sentence: "The root AQUA means 'water'.", question: 'Which word names the sport of exercises done in water?', correct: 'aquatics', distractors: ['telescope', 'autograph', 'geography'] },
  { sentence: "The root TERRA means 'earth' or 'land'.", question: 'Which word means "the land or ground of an area"?', correct: 'terrain', distractors: ['telephone', 'aquarium', 'autograph'] },
  { sentence: "The root TERRA means 'earth'.", question: 'Which word names a glass case of soil and small plants?', correct: 'terrarium', distractors: ['telescope', 'portable', 'biography'] },
  { sentence: "The root TERRA means 'land'.", question: 'Which word means "an area of land that belongs to someone"?', correct: 'territory', distractors: ['telephone', 'aquarium', 'photograph'] },
  { sentence: "The root PHOTO means 'light'.", question: 'Which word means "a picture made using light"?', correct: 'photograph', distractors: ['telephone', 'aquarium', 'terrain'] },
  { sentence: "The root PHOTO means 'light'.", question: 'Which word names how plants use light to make their food?', correct: 'photosynthesis', distractors: ['telescope', 'aquarium', 'biography'] },
  { sentence: "The root PHOTO means 'light'.", question: 'Which word names a person who takes pictures with light?', correct: 'photographer', distractors: ['telescope', 'aquarium', 'terrarium'] },
  { sentence: "The root SCOPE means 'to look at'.", question: 'Which word means "a tool for looking at tiny things"?', correct: 'microscope', distractors: ['telephone', 'aquarium', 'autograph'] },
  { sentence: "The root SCOPE means 'to see'.", question: 'Which word means "a tool for seeing distant stars"?', correct: 'telescope', distractors: ['photograph', 'aquarium', 'biography'] },
  { sentence: "The root SCOPE means 'to look'.", question: 'Which word names a tube toy with changing patterns to look at?', correct: 'kaleidoscope', distractors: ['telephone', 'aquarium', 'terrain'] },
  { sentence: "The root PHONE means 'sound'.", question: 'Which word means "a device that carries voices"?', correct: 'telephone', distractors: ['aquarium', 'terrarium', 'autograph'] },
  { sentence: "The root PHONE means 'sound'.", question: 'Which word names the sounds that letters make in reading?', correct: 'phonics', distractors: ['telescope', 'aquarium', 'geology'] },
  { sentence: "The root PHONE means 'sound'.", question: 'Which word names a tool you speak into to make your voice louder?', correct: 'microphone', distractors: ['telescope', 'aquarium', 'terrain'] },
  { sentence: "The root BIO means 'life'.", question: 'Which word means "the study of living things"?', correct: 'biology', distractors: ['telephone', 'aquarium', 'autograph'] },
  { sentence: "The root BIO means 'life'.", question: 'Which word means "the written life story of a real person"?', correct: 'biography', distractors: ['telescope', 'aquarium', 'terrain'] },
  { sentence: "The root BIO means 'life'.", question: 'Which word names a medicine that fights living germs?', correct: 'antibiotic', distractors: ['telescope', 'aquarium', 'terrarium'] },
  { sentence: "The root GEO means 'earth'.", question: 'Which word means "the study of the Earth\'s land, seas, and maps"?', correct: 'geography', distractors: ['telephone', 'aquarium', 'autograph'] },
  { sentence: "The root GEO means 'earth'.", question: 'Which word means "the study of the Earth\'s rocks"?', correct: 'geology', distractors: ['telescope', 'aquarium', 'biography'] },
  { sentence: "The root GEO means 'earth'.", question: 'Which word names the study of lines, shapes, and angles?', correct: 'geometry', distractors: ['telephone', 'aquarium', 'photograph'] },
];

/** Shades of meaning. Each sentence has a blank; the context selects one
 *  precise word from a set of near-synonyms that differ in intensity or
 *  nuance. Only one choice truly fits. */
const SHADES_ITEMS: Array<{ sentence: string; correct: string; distractors: string[] }> = [
  { sentence: "The kitten didn't just walk — it ___ quietly across the grass, trying not to be seen.", correct: 'crept', distractors: ['stomped', 'marched', 'plodded'] },
  { sentence: "The thirsty plants had waited all week, so the rain didn't just fall — it ___ down in a heavy, welcome rush.", correct: 'poured', distractors: ['sprinkled', 'dripped', 'misted'] },
  { sentence: 'She was not just happy about the first bloom — she was absolutely ___.', correct: 'delighted', distractors: ['pleased', 'fine', 'okay'] },
  { sentence: 'The old oak was not just big — it was truly ___.', correct: 'enormous', distractors: ['large', 'okay', 'small'] },
  { sentence: 'After the long hike the children were not just tired — they were completely ___.', correct: 'exhausted', distractors: ['sleepy', 'bored', 'calm'] },
  { sentence: 'The soup was not merely warm — fresh off the stove, it was ___.', correct: 'scalding', distractors: ['cool', 'mild', 'lukewarm'] },
  { sentence: "The frightened rabbit didn't just move — it ___ into the bushes in a blur.", correct: 'darted', distractors: ['strolled', 'wandered', 'ambled'] },
  { sentence: "She didn't simply like the puppy — she ___ it with all her heart.", correct: 'adored', distractors: ['liked', 'noticed', 'knew'] },
  { sentence: 'The wind was not just blowing — during the storm it ___ through the trees.', correct: 'howled', distractors: ['whispered', 'hummed', 'sighed'] },
  { sentence: 'The brook was not loud — it ___ softly over the smooth stones.', correct: 'murmured', distractors: ['roared', 'crashed', 'boomed'] },
  { sentence: 'He was not merely hungry after skipping lunch — he was ___.', correct: 'famished', distractors: ['full', 'picky', 'thirsty'] },
  { sentence: 'The garden path was not just dirty — after the flood it was ___ with mud.', correct: 'caked', distractors: ['dusted', 'speckled', 'sprinkled'] },
  { sentence: 'The old cat did not run to dinner — she ___ slowly across the room.', correct: 'plodded', distractors: ['raced', 'leapt', 'sprinted'] },
  { sentence: 'The berry was not just sweet — it was so sugary it tasted ___.', correct: 'syrupy', distractors: ['bitter', 'sour', 'bland'] },
  { sentence: 'The morning was not merely cold — up on the frosty hill it was ___.', correct: 'freezing', distractors: ['cool', 'mild', 'warm'] },
  { sentence: "She didn't just look at the strange bug — she ___ at it, unable to look away.", correct: 'stared', distractors: ['glanced', 'peeked', 'blinked'] },
  { sentence: 'The puppy was not simply glad to see her — it was wildly ___.', correct: 'overjoyed', distractors: ['content', 'calm', 'patient'] },
  { sentence: 'The path was not just narrow — squeezing between the rocks, it was ___.', correct: 'cramped', distractors: ['wide', 'open', 'roomy'] },
  { sentence: 'The little bird did not sing quietly — at dawn it ___ at the top of its voice.', correct: 'belted', distractors: ['hummed', 'mumbled', 'whispered'] },
  { sentence: 'The pond was not merely still — in the frozen dawn it lay perfectly ___.', correct: 'motionless', distractors: ['rippling', 'churning', 'splashing'] },
  { sentence: 'She was not just curious — she was so ___ she could hardly wait to look inside.', correct: 'eager', distractors: ['bored', 'unwilling', 'calm'] },
  { sentence: 'The old bread was not just dry — it had gone completely ___.', correct: 'stale', distractors: ['fresh', 'soft', 'warm'] },
  { sentence: 'The frightened deer did not walk away — it ___ into the forest the instant it saw them.', correct: 'bolted', distractors: ['lingered', 'paused', 'wandered'] },
  { sentence: 'The soup needed salt; without it the broth tasted flat and ___.', correct: 'bland', distractors: ['spicy', 'rich', 'tangy'] },
  { sentence: 'The kitten was not merely playful — chasing every leaf, it was utterly ___.', correct: 'frisky', distractors: ['lazy', 'still', 'tired'] },
];

/** Figurative language — similes, metaphors, and idioms in context. The
 *  question asks what the figure of speech means. */
const FIGURATIVE_ITEMS: SentenceMeaning[] = [
  { sentence: '"The garden was a blanket of gold."', question: 'This means the garden was…', correct: 'covered all over with golden flowers', distractors: ['cold and needed a blanket', 'made of real gold', 'only a small patch of yellow'] },
  { sentence: 'Nana said, "Hold your horses!"', question: 'She meant…', correct: 'wait and be patient', distractors: ['go and feed the horses', 'run much faster', 'let the horses out'] },
  { sentence: '"The wind whispered through the leaves."', question: 'This means the wind…', correct: 'made a soft, gentle sound', distractors: ['shouted very loudly', 'spoke real words', 'knocked the leaves down'] },
  { sentence: 'The frost lay like a silver blanket over the lawn.', question: 'This means the lawn was…', correct: 'covered with a layer of frost', distractors: ['made of silver', 'warm and cozy', 'painted white'] },
  { sentence: '"Cecily was as busy as a bee."', question: 'This means she was…', correct: 'working very hard', distractors: ['buzzing loudly', 'afraid of bees', 'covered in honey'] },
  { sentence: 'Grandpa said weeding was "a piece of cake."', question: 'He meant it was…', correct: 'very easy', distractors: ['sweet to eat', 'made with cake', 'very hard'] },
  { sentence: '"The sun smiled down on the meadow."', question: 'This means the sun was…', correct: 'shining warmly and brightly', distractors: ['making a face', 'hidden by clouds', 'setting for the night'] },
  { sentence: '"Her cheeks were as red as roses."', question: 'This means her cheeks were…', correct: 'very rosy and pink', distractors: ['made of petals', 'covered in thorns', 'smelling sweet'] },
  { sentence: 'When Esme spilled the seeds, Nana said, "Don\'t cry over spilled milk."', question: 'She meant…', correct: "don't be upset about a small mistake", distractors: ['go and get some milk', 'clean up the milk', 'stop drinking milk'] },
  { sentence: '"The old tree was a giant reaching for the sky."', question: 'This means the tree was…', correct: 'very tall', distractors: ['a real living giant', 'falling over', 'made of clouds'] },
  { sentence: '"The pond was a mirror in the still morning."', question: 'This means the pond…', correct: 'reflected everything clearly', distractors: ['was made of glass', 'had a mirror in it', 'was very small'] },
  { sentence: 'Dad said learning to weed was "a walk in the park."', question: 'He meant it was…', correct: 'easy and pleasant', distractors: ['done at the park', 'a long journey', 'very tiring'] },
  { sentence: '"Leaves danced in the autumn wind."', question: 'This means the leaves…', correct: 'moved and swirled about', distractors: ['played music', 'had little feet', 'stood still'] },
  { sentence: 'Cecily had "butterflies in her stomach" before the show.', question: 'This means she felt…', correct: 'nervous and jittery', distractors: ['hungry for lunch', 'like she ate bugs', 'very sleepy'] },
  { sentence: '"The snow was a soft white quilt."', question: 'This means the snow…', correct: 'covered the ground in a smooth, thick layer', distractors: ['was warm to the touch', 'was made of cloth', 'kept them cozy in bed'] },
  { sentence: 'Nana said, "It\'s raining cats and dogs!"', question: 'She meant…', correct: 'it was raining very hard', distractors: ['animals were falling', 'the pets were outside', 'it was barely drizzling'] },
  { sentence: '"The brook sang over the stones."', question: 'This means the brook…', correct: 'made a pleasant, musical sound', distractors: ['knew a real song', 'was completely quiet', 'had a human voice'] },
  { sentence: '"Her smile was sunshine."', question: 'This means her smile was…', correct: 'warm and cheerful', distractors: ['too bright to look at', 'hot like the sun', 'yellow in color'] },
  { sentence: 'When Cecily begged to plant more, Nana called her "a chip off the old block."', question: 'She meant Cecily…', correct: 'was just like her gardening family', distractors: ['was made of wood', 'had chipped a block', 'was very small'] },
  { sentence: '"The angry clouds gathered overhead."', question: 'This means the clouds looked…', correct: 'dark and stormy', distractors: ['friendly and soft', 'like real faces', 'very far away'] },
  { sentence: '"The vines were greedy fingers grabbing the fence."', question: 'This means the vines…', correct: 'spread and clung tightly to the fence', distractors: ['had real fingers', 'stole from the fence', 'were painted green'] },
  { sentence: 'Esme was "quiet as a mouse" in the early garden.', question: 'This means she was…', correct: 'very quiet', distractors: ['small like a mouse', 'afraid of mice', 'squeaking softly'] },
  { sentence: '"Time flew by while they played outside."', question: 'This means the time…', correct: 'seemed to pass very quickly', distractors: ['had real wings', 'stood still', 'went backward'] },
  { sentence: '"The tomatoes were begging to be picked."', question: 'This means the tomatoes were…', correct: 'perfectly ripe and ready', distractors: ['talking out loud', 'still green', 'rotten'] },
  { sentence: 'Grandpa said Cecily "has a green thumb."', question: 'He meant she…', correct: 'is very good at growing plants', distractors: ['painted her thumb green', 'hurt her thumb', 'has a sickness'] },
];

/** Long passages (140–190 words), richer informational and narrative
 *  content with harder inference. Same Paragraph shape. */
const LONG_PASSAGES: Paragraph[] = [
  {
    paragraph:
      "In the warm waters of a coral reef, two very different creatures live as partners. " +
      "The sea anemone looks like a soft, waving flower, but its arms are covered in tiny stingers that can hurt most fish. " +
      "The clownfish, however, has a special slippery coating on its body that keeps it from being stung. " +
      "So the clownfish makes its home right among the anemone's dangerous arms, safe from any larger fish that would like to eat it. " +
      "In return, the clownfish is not a lazy guest. " +
      "It chases away the few animals that try to nibble the anemone, and the scraps it drops become food for its host. " +
      "Neither creature could do as well alone, yet together they both thrive. " +
      "Scientists call this kind of partnership, where two living things help each other, symbiosis. " +
      "The reef is full of such quiet bargains, struck between creatures that will never speak a single word.",
    questions: [
      { q: 'In this passage, "symbiosis" means…', correct: 'a partnership where two living things help each other', distractors: ['a kind of coral', 'a fish that stings', 'a large ocean wave'], kind: 'vocab' },
      { q: "Why is the clownfish safe among the anemone's arms?", correct: 'its slippery coating keeps it from being stung', distractors: ['it is too fast to be caught', 'the anemone has no stingers', 'it is bigger than the anemone'], kind: 'inference' },
      { q: 'This passage is mostly about…', correct: 'how the clownfish and anemone help each other', distractors: ['how coral reefs are formed', 'why fish live in warm water', 'what anemones eat'], kind: 'main_idea' },
    ],
  },
  {
    paragraph:
      "The water that falls as rain today may be older than the dinosaurs. " +
      "Earth keeps the same water and uses it again and again in a great journey called the water cycle. " +
      "It begins when the sun warms oceans, lakes, and rivers, turning their surface into an invisible gas called water vapor, which rises into the sky. " +
      "This is evaporation. " +
      "High up, where the air is cold, the vapor cools and clings to bits of dust, forming the tiny droplets that make clouds. " +
      "When those droplets grow heavy enough, they fall back to Earth as rain or snow. " +
      "Some of this water soaks into the soil to be sipped up by roots; some gathers into streams that flow, at last, back to the sea. " +
      "Then the sun warms it once more, and the whole journey begins again. " +
      "Not a single drop is ever truly lost.",
    questions: [
      { q: 'In this passage, "evaporation" is when…', correct: 'water turns into invisible vapor and rises', distractors: ['rain falls from clouds', 'water freezes into ice', 'rivers flow to the sea'], kind: 'vocab' },
      { q: 'What happens right after water vapor cools high in the sky?', correct: 'it forms tiny droplets that make clouds', distractors: ['it falls as rain', 'the sun warms it', 'it soaks into the soil'], kind: 'sequence' },
      { q: 'This passage is mostly about…', correct: 'how Earth uses the same water over and over', distractors: ['why the sun is hot', 'how clouds change shape', 'where dinosaurs lived'], kind: 'main_idea' },
    ],
  },
  {
    paragraph:
      "When a leaf falls or an old tree topples in the forest, it does not simply vanish. " +
      "An army of quiet workers moves in to take it apart. " +
      "Fungi spread thread-thin roots through the rotting wood, while beetles, worms, and countless microbes chew and break it down. " +
      "These creatures are called decomposers, and they perform one of nature's most important jobs. " +
      "As they feed, they release the goodness locked inside the dead plant back into the soil — nutrients that living plants need to grow. " +
      "Without decomposers, the forest floor would pile ever higher with dead leaves and fallen trunks, and the nutrients would stay trapped inside them forever. " +
      "New plants would slowly starve. " +
      "So although a mushroom on a rotting log may look like the end of something, it is really part of a beginning, feeding the forest of tomorrow.",
    questions: [
      { q: 'This passage is mostly about…', correct: 'how decomposers recycle dead plants into food for new ones', distractors: ['why leaves fall in autumn', 'how tall trees grow', 'where mushrooms are found'], kind: 'main_idea' },
      { q: 'What would happen to the forest without decomposers?', correct: 'dead leaves would pile up and nutrients would stay trapped', distractors: ['the trees would grow faster', 'it would rain much more', 'the soil would get richer on its own'], kind: 'inference' },
      { q: 'In this passage, "decomposers" are creatures that…', correct: 'break down dead plants and animals', distractors: ['plant new seeds', 'hunt other animals', 'carry water to the roots'], kind: 'vocab' },
    ],
  },
  {
    paragraph:
      "Each autumn, an astonishing journey takes place across North America. " +
      "Monarch butterflies, weighing less than a paperclip, set off on a flight of up to three thousand miles to spend the winter in the warm forests of Mexico. " +
      "What makes this even more remarkable is that no single butterfly has ever made the trip before. " +
      "The monarchs that fly south were born only months earlier, yet somehow they find their way to the very same groves their great-grandparents used, guided by the sun and by senses we still do not fully understand. " +
      "There they cluster in the millions, covering the fir trees like orange leaves. " +
      "When spring comes, they begin the long trip north again, but no one butterfly finishes it. " +
      "Instead, they lay eggs along the way, and it takes several generations to complete the return. " +
      "The great-grandchildren of the first travelers arrive back where the journey began.",
    questions: [
      { q: 'Why is it surprising that the monarchs find the forests in Mexico?', correct: 'no butterfly making the trip has ever been there before', distractors: ['the forests are hidden underground', 'the butterflies are blind', 'Mexico is very close by'], kind: 'inference' },
      { q: 'About how far do the monarchs travel?', correct: 'up to three thousand miles', distractors: ['about three miles', 'around the whole world', 'just a few hundred feet'], kind: 'recall' },
      { q: 'This passage is mostly about…', correct: 'the remarkable migration of monarch butterflies', distractors: ['why butterflies are orange', 'how caterpillars become butterflies', 'what monarchs eat in winter'], kind: 'main_idea' },
    ],
  },
  {
    paragraph:
      "Bees see the world very differently than we do. " +
      "Human eyes catch red, green, and blue light, but a bee's eyes are tuned instead to blue, green, and ultraviolet — a kind of light that is completely invisible to people. " +
      "Because of this, a bee cannot see the color red at all; a red flower looks dull and dark to her. " +
      "But she can see patterns painted in ultraviolet that we would never notice. " +
      "Many flowers use this secret color to guide their visitors, drawing glowing lines and rings that point straight toward the sweet nectar, like landing strips at an airport. " +
      "To our eyes a buttercup may be a plain yellow cup, but to a bee it may blaze with hidden signals saying, 'Land here!' " +
      "In this way, flowers and bees have shaped each other over millions of years, each helping the other survive.",
    questions: [
      { q: 'Which color can a bee NOT see?', correct: 'red', distractors: ['blue', 'green', 'ultraviolet'], kind: 'recall' },
      { q: 'Why do many flowers have ultraviolet patterns?', correct: 'to guide bees toward the nectar', distractors: ['to hide from bees', 'to look pretty to people', 'to keep warm in the sun'], kind: 'inference' },
      { q: 'The flowers\' ultraviolet lines are compared to "landing strips at an airport" because they…', correct: 'guide the bee in to the right spot', distractors: ['are very long and straight', 'are made of pavement', 'make a loud noise'], kind: 'vocab' },
    ],
  },
  {
    paragraph:
      "The owl is built to be a silent hunter of the night. " +
      "While most birds are noisy in flight, an owl can swoop through the dark without a sound. " +
      "The secret lies in its feathers: their soft, comb-like edges break up the rushing air that would otherwise whoosh past a wing. " +
      "Its eyes, huge and forward-facing, gather what little light the moon and stars provide, letting the owl see when the world seems pitch black to us. " +
      "But its hearing may be its finest tool of all. " +
      "An owl's ears are set at slightly different heights on its head, so a sound reaches one ear a hair sooner than the other. " +
      "From that tiny difference, the owl can pinpoint a mouse rustling under leaves — or even under snow — and drop upon it in perfect silence. " +
      "Every part of the owl works together for one purpose: to hunt unseen and unheard.",
    questions: [
      { q: 'This passage is mostly about…', correct: 'the special features that make owls silent night hunters', distractors: ['what owls like to eat', 'where owls build their nests', 'why owls sleep in the day'], kind: 'main_idea' },
      { q: 'Why does having ears at different heights help the owl?', correct: 'it helps the owl pinpoint exactly where a sound comes from', distractors: ['it lets the owl hear two things at once', "it keeps the owl's head balanced", "it makes the owl's hearing louder"], kind: 'inference' },
      { q: 'In this passage, "pinpoint" means…', correct: 'find the exact spot', distractors: ['poke with a claw', 'listen for a long time', 'fly in a circle'], kind: 'vocab' },
    ],
  },
  {
    paragraph:
      "On the shadowy floor of a forest, every living thing is connected to the others in a web of who-eats-whom. " +
      "It starts with the plants — ferns, mosses, and tender seedlings — which make their own food from sunlight. " +
      "A rabbit or a mouse nibbles those plants, taking in their energy. " +
      "Then a fox or an owl hunts the rabbit, passing that energy further along. " +
      "When any of these creatures dies, decomposers move in, breaking the body down and returning its goodness to the soil, where new plants will use it to grow. " +
      "Pull on any single thread of this web and the whole thing trembles. " +
      "If the foxes disappeared, the mice might grow too many and eat every seedling; if the plants failed, the mice would starve, and so would the foxes. " +
      "Each creature, large or small, has its place, and the forest stays healthy only when the whole web stays in balance.",
    questions: [
      { q: 'What might happen if all the foxes disappeared?', correct: 'the mice could grow too many and eat all the seedlings', distractors: ['the plants would grow much faster', 'nothing at all would change', 'the owls would vanish at once too'], kind: 'inference' },
      { q: 'This passage is mostly about…', correct: 'how living things in a forest are connected in a food web', distractors: ['how foxes hunt mice', 'why forests are shadowy', 'what mosses need to grow'], kind: 'main_idea' },
      { q: 'When the passage says pulling one thread makes "the whole thing trembles," it means…', correct: 'a change to one part affects all the others', distractors: ['the web is made of string', 'the forest shakes in the wind', 'spiders live in the web'], kind: 'vocab' },
    ],
  },
  {
    paragraph:
      "Cecily had grown the tallest sunflower at the fair every summer for three years, and she had been sure she would win again. " +
      "But this year, when the judge walked slowly down the row, he stopped at a plant grown by a boy she had never met, and pinned the blue ribbon there instead. " +
      "For a moment Cecily's throat went tight and hot, and she wanted to march straight home. " +
      "Then she looked more closely at the winning flower — how straight its stem stood, how wide and bright its golden face — and she remembered how many mornings that boy must have watered it, just as she had. " +
      "She swallowed hard, walked over, and told him it was the finest sunflower she had ever seen. " +
      "His grin was so wide that, to her surprise, Cecily found she was glad she had said it after all.",
    questions: [
      { q: 'Why did Cecily\'s "throat go tight and hot"?', correct: 'she was disappointed that she did not win', distractors: ['she was thirsty from the sun', 'she had caught a cold', 'she was excited to win'], kind: 'inference' },
      { q: "Why did Cecily decide to praise the boy's sunflower?", correct: 'she realized he had worked just as hard as she had', distractors: ['she wanted to win next time', 'the judge told her to', 'she did not really like her own flower'], kind: 'inference' },
      { q: 'How did Cecily feel at the very end?', correct: 'glad that she had been kind', distractors: ['still angry about losing', 'sorry that she had spoken', 'bored with the whole fair'], kind: 'inference' },
    ],
  },
  {
    paragraph:
      "Esme wanted the carrots to grow now. " +
      "Every morning for a week she had knelt by the row Nana helped her plant, staring at the bare brown soil, and every morning nothing had changed. " +
      "'Maybe they're broken,' she finally said, close to tears. " +
      "Nana set down her trowel and smiled. " +
      "'Seeds do their best work where we can't see it,' she said. 'Under the ground, roots are already reaching down before a single leaf shows above.' " +
      "Esme wasn't sure she believed her, but she kept watering all the same. " +
      "Then one grey morning, almost two weeks later, she found a faint green thread no thicker than a hair curling up out of the dirt. " +
      "She shouted so loudly that Luna the cat leapt off the fence. " +
      "Esme understood now what Nana had meant: the most important growing had been happening all along, quietly, out of sight.",
    questions: [
      { q: 'Why did Esme think the seeds might be "broken"?', correct: 'nothing seemed to be happening above the soil', distractors: ['the seeds looked cracked', 'Nana had told her so', 'the soil was the wrong color'], kind: 'inference' },
      { q: 'What did Nana mean by "seeds do their best work where we can\'t see it"?', correct: 'the roots were growing underground before any leaf showed', distractors: ['seeds only grow in the dark', 'gardening should be kept secret', 'seeds do their work at night'], kind: 'inference' },
      { q: 'What lesson does Esme learn in this passage?', correct: 'important things can be happening even when we cannot see them', distractors: ['carrots grow faster than other plants', 'cats do not like loud noises', 'it is best to plant in the spring'], kind: 'main_idea' },
    ],
  },
  {
    paragraph:
      "Spider silk is one of the most amazing materials in all of nature. " +
      "A thread of it is far thinner than a human hair, yet, ounce for ounce, it is stronger than steel and can stretch without snapping. " +
      "A spider makes it as a liquid inside her body and spins it into solid thread only as it leaves her, through tiny nozzles called spinnerets. " +
      "Most remarkable of all, a single spider can make several different kinds of silk, each for a different job: a strong dry line for the spokes of her web, a stretchy sticky thread for catching prey, a soft wrapping to bundle her eggs, and even a fine strand she can ride on the wind like a balloon. " +
      "Scientists have long dreamed of copying spider silk to make everything from safer helmets to stronger ropes, but so far the little spider remains a far better weaver than any machine we have built.",
    questions: [
      { q: 'How does spider silk compare to steel?', correct: 'ounce for ounce, it is stronger than steel', distractors: ['it is much weaker than steel', 'it is exactly as strong as steel', 'it snaps more easily than steel'], kind: 'recall' },
      { q: 'In this passage, "spinnerets" are…', correct: 'tiny nozzles a spider spins silk through', distractors: ["the spider's eyes", 'kinds of insects', 'threads of the web'], kind: 'vocab' },
      { q: 'This passage is mostly about…', correct: 'what makes spider silk such a remarkable material', distractors: ['how spiders catch their prey', 'why spiders lay eggs', 'how helmets are made'], kind: 'main_idea' },
    ],
  },
  {
    paragraph:
      "From the kitchen window, Cecily watched Luna crouch low in the grass, tail twitching, her green eyes fixed on the apple tree. " +
      "In its branches sat a nest where a robin had raised three speckled chicks, and now the boldest of them was making its very first wobbly flights, tumbling from branch to branch. " +
      "Cecily's heart pounded. " +
      "She knew Luna's nature — a cat is a hunter — and yet she could not bear the thought of the little bird coming to harm. " +
      "She slipped outside as quietly as she could, scooped the surprised cat into her arms, and carried her indoors, whispering an apology for spoiling the game. " +
      "Luna grumbled and flicked her tail crossly for the rest of the afternoon. " +
      "But that evening, when the young robin flapped safely up to the rooftop and chirped into the dusk, Cecily decided that one sulking cat was a very small price to pay.",
    questions: [
      { q: 'Why did Cecily carry Luna indoors?', correct: 'to keep the young robin safe from the cat', distractors: ['because Luna was hungry', 'because it was time for dinner', 'because Luna was cold'], kind: 'inference' },
      { q: 'Why did Luna "grumble and flick her tail crossly"?', correct: 'she was annoyed that her hunt was spoiled', distractors: ['she was frightened of the robin', 'she was glad to be inside', 'she wanted to be fed'], kind: 'inference' },
      { q: 'Why did Cecily think "one sulking cat was a very small price to pay"?', correct: "keeping the bird safe mattered more than Luna's mood", distractors: ['cats forget quickly anyway', 'she did not like Luna', 'the robin belonged to her'], kind: 'inference' },
    ],
  },
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

  // SEED_ADDITIVE=1: only insert items for skills with NO existing
  // seed items, and skip the wipe — the full wipe deletes learners'
  // attempts on prior seed items, resetting attempt-derived garden
  // progress. Use additive mode when shipping new skills to a live DB.
  const additive = process.env.SEED_ADDITIVE === '1';
  const alreadySeeded = new Set<string>();
  if (additive && readingSkillIds.length > 0) {
    const PAGE = 1000;
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await sb.from('item')
        .select('skill_id').eq('generated_by', 'seed').in('skill_id', readingSkillIds)
        .range(from, from + PAGE - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      for (const r of data) alreadySeeded.add(r.skill_id);
      if (data.length < PAGE) break;
    }
  }
  if (!additive && readingSkillIds.length > 0) {
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
      const distractors = pickNearMissDistractors(word, teachable, 3, rand);
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

  // Paragraph comprehension (Grade 3) — fan one item out per
  // question on each paragraph, with Elo varying by question kind:
  // recall is the easiest cognitive load, then sequence, then
  // inference, then vocab-from-context, then main_idea (the highest).
  {
    const KIND_ELO: Record<string, number> = {
      recall:    1450,
      sequence:  1500,
      inference: 1550,
      vocab:     1580,
      main_idea: 1600,
    };
    for (let p = 0; p < PARAGRAPHS.length; p++) {
      const para = PARAGRAPHS[p];
      for (let q = 0; q < para.questions.length; q++) {
        const qa = para.questions[q];
        const elo = (KIND_ELO[qa.kind] ?? 1500) + p * 4;   // gentle drift across paragraphs
        push('reading.comprehension.paragraph', 'ParagraphComprehension', {
          type: 'ParagraphComprehension',
          paragraph: para.paragraph,
          question: qa.q,
          choices: [qa.correct, ...qa.distractors],
          questionKind: qa.kind,
          promptText: qa.q,
        }, { correct: qa.correct }, elo);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // LEVEL 4 (CCSS Grade 4) — elo band ≈ 1550–1950
  // ═══════════════════════════════════════════════════════════════

  // Small shared helpers for the Level 4/5 content -----------------

  /** Emit SentenceComprehension meaning items from a hand-authored
   *  {sentence, question, correct, distractors} array. */
  function meaningItems(
    skillCode: string,
    arr: Array<{ sentence: string; question: string; correct: string; distractors: string[] }>,
    startElo: number, step: number,
  ) {
    for (let i = 0; i < arr.length; i++) {
      const it = arr[i];
      push(skillCode, 'SentenceComprehension', {
        type: 'SentenceComprehension',
        sentence: it.sentence,
        question: it.question,
        choices: [it.correct, ...it.distractors],
        promptText: it.question,
      }, { correct: it.correct }, startElo + i * step);
    }
  }

  /** Emit DigraphSort rounds that sort affixed words into their
   *  prefix/suffix buckets — same content/answer shape as the phonics
   *  digraph sorts, with the affix standing in for the digraph. */
  function affixSortItems(
    skillCode: string, affixes: string[], words: AffixWord[],
    prompt: string, startElo: number, step: number,
  ) {
    const groups: Record<string, AffixWord[]> = {};
    for (const a of affixes) groups[a] = [];
    for (const w of words) groups[w.affix]?.push(w);
    const rounds = Math.min(...affixes.map(a => groups[a].length));
    for (let r = 0; r < rounds; r++) {
      const roundWords = affixes.map(a => groups[a][r]);
      push(skillCode, 'DigraphSort', {
        type: 'DigraphSort',
        digraphs: affixes,
        words: roundWords.map(w => ({ word: w.word, digraph: w.affix })),
        promptText: prompt,
      }, {
        placements: Object.fromEntries(roundWords.map(w => [w.word, w.affix])),
      }, startElo + r * step);
    }
  }

  /** Emit one ParagraphComprehension item per question across a set of
   *  passages, with Elo keyed by question kind plus a per-passage drift. */
  function paragraphSetItems(
    skillCode: string, passages: Paragraph[],
    kindElo: Record<string, number>, drift: number,
  ) {
    for (let p = 0; p < passages.length; p++) {
      const para = passages[p];
      for (let q = 0; q < para.questions.length; q++) {
        const qa = para.questions[q];
        const elo = (kindElo[qa.kind] ?? kindElo.inference) + p * drift;
        push(skillCode, 'ParagraphComprehension', {
          type: 'ParagraphComprehension',
          paragraph: para.paragraph,
          question: qa.q,
          choices: [qa.correct, ...qa.distractors],
          questionKind: qa.kind,
          promptText: qa.q,
        }, { correct: qa.correct }, elo);
      }
    }
  }

  // Multisyllable decoding — PhonemeBlend, read-aloud style.
  for (let i = 0; i < MULTISYLLABLE_WORDS.length; i++) {
    const { phonemes, word, distractors } = MULTISYLLABLE_WORDS[i];
    push('reading.phonics.multisyllable', 'PhonemeBlend', {
      type: 'PhonemeBlend', phonemes, word, distractors,
      // Speech-first, like the other PhonemeBlend skills: the child
      // reads the long word aloud one part at a time.
      promptText: 'Read this long word out loud, one part at a time.',
    }, { word }, 1560 + i * 4);
  }

  // Tricky Fry sight words — reuse the same SightWordTap generator.
  sightWordItems('reading.sight_words.academic', FRY_ACADEMIC, 1580);

  // Prefixes dis-/mis-/non- — sort rounds + meaning questions.
  affixSortItems('reading.morphology.prefix_dis_mis_non',
    ['dis', 'mis', 'non'], PREFIX_DMN_WORDS,
    'Sort each word by its prefix.', 1600, 8);
  meaningItems('reading.morphology.prefix_dis_mis_non', PREFIX_DMN_MEANINGS, 1640, 5);

  // Suffixes -ful/-less/-ness — sort rounds + meaning questions.
  affixSortItems('reading.morphology.suffix_ful_less_ness',
    ['ful', 'less', 'ness'], SUFFIX_FLN_WORDS,
    'Sort each word by its ending.', 1660, 8);
  meaningItems('reading.morphology.suffix_ful_less_ness', SUFFIX_FLN_MEANINGS, 1700, 5);

  // Context clues — vocabulary from context (RL.4.4).
  meaningItems('reading.vocab.context_clues', CONTEXT_CLUES, 1640, 9);

  // Longer passages (RL.4.1 / RI.4.1).
  paragraphSetItems('reading.comprehension.passage', PASSAGES, {
    recall: 1650, sequence: 1700, inference: 1760, vocab: 1790, main_idea: 1820,
  }, 5);

  // ═══════════════════════════════════════════════════════════════
  // LEVEL 5 (CCSS Grade 5) — elo band ≈ 1800–2200
  // ═══════════════════════════════════════════════════════════════

  // Suffixes -tion/-ment/-ity — sort rounds + meaning questions.
  affixSortItems('reading.morphology.suffix_tion_ment_ity',
    ['tion', 'ment', 'ity'], SUFFIX_TMI_WORDS,
    'Sort each word by its ending.', 1820, 8);
  meaningItems('reading.morphology.suffix_tion_ment_ity', SUFFIX_TMI_MEANINGS, 1860, 6);

  // Greek and Latin roots (RL.5.4).
  meaningItems('reading.morphology.greek_latin_roots', ROOT_ITEMS, 1880, 6);

  // Shades of meaning — choose the precise word.
  {
    for (let i = 0; i < SHADES_ITEMS.length; i++) {
      const it = SHADES_ITEMS[i];
      push('reading.vocab.shades_of_meaning', 'SentenceComprehension', {
        type: 'SentenceComprehension',
        sentence: it.sentence,
        question: 'Which word best fills the blank?',
        choices: [it.correct, ...it.distractors],
        promptText: 'Which word best fills the blank?',
      }, { correct: it.correct }, 1880 + i * 6);
    }
  }

  // Figurative language (RL.5.4).
  meaningItems('reading.vocab.figurative', FIGURATIVE_ITEMS, 1920, 6);

  // Long passages (RL.5.1 / RI.5.2).
  paragraphSetItems('reading.comprehension.long_passage', LONG_PASSAGES, {
    recall: 1850, sequence: 1900, inference: 1980, vocab: 2020, main_idea: 2060,
  }, 6);

  const toInsert = additive ? items.filter(it => !alreadySeeded.has(it.skill_id)) : items;
  if (toInsert.length > 0) {
    const batchSize = 500;
    for (let i = 0; i < toInsert.length; i += batchSize) {
      const { error } = await sb.from('item').insert(toInsert.slice(i, i + batchSize));
      if (error) throw error;
    }
  }

  console.log(`  → reading${additive ? ' (additive)' : ''}: inserted ${toInsert.length} items`);
}
