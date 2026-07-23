/**
 * Bachan's Kitchen recipe catalog.
 *
 * A recipe is cooked from HARVESTED plants (garden_plot rows with
 * harvested_at set and ALL consumption columns null —
 * consumed_by_meal_id, consumed_by_companion_id, and
 * consumed_by_arrangement_id; the garden friend and Bachan's ikebana
 * vase draw from the same basket). Cooking consumes the ingredients — eat
 * what you grow, then grow some more — and ends with a picnic shared
 * with a guest.
 *
 * Content rules (mirrors habitatQuests):
 *  - Every recipe teaches something true: a couple of kid-readable
 *    facts plus 2 gentle questions (4 choices, one correct, wrong ones
 *    plausible-but-distinct or gently silly).
 *  - Kitchen math sneaks in on purpose — halves, doubling, counting
 *    ingredients — because measuring IS fractions.
 */

import type { QuestQuestion } from './habitatQuests';

export interface Recipe {
  code: string;
  name: string;
  emoji: string;
  description: string;              // one-line, shown on the recipe card
  ingredients: Record<string, number>; // plantCode -> harvested count needed
  facts: string[];                  // 2-3 short facts shown while "cooking"
  questions: QuestQuestion[];       // 2 questions before the picnic
  outro: string;                    // line on the celebration screen
}

export const RECIPE_CATALOG: Recipe[] = [
  {
    code: 'crunchy_garden_salad',
    name: 'Crunchy Garden Salad',
    emoji: '🥗',
    description: 'Radishes and lettuce, washed and tossed fresh from the beds.',
    ingredients: { radish: 3, lettuce: 2 },
    facts: [
      'Vegetables crunch because their cells are plump with water — like millions of tiny water balloons.',
      'Cooks always wash garden vegetables first to rinse away soil (and the occasional hitchhiking ant).',
    ],
    questions: [
      {
        prompt: 'The salad needs 3 radishes and 2 lettuces. How many vegetables is that all together?',
        choices: ['5', '4', '6', '32'],
        correctIndex: 0,
      },
      {
        prompt: 'Why do fresh vegetables CRUNCH when you bite them?',
        choices: [
          'Their cells are full of water',
          'They have tiny bones',
          'They are frozen inside',
          'The crunch is added at the store',
        ],
        correctIndex: 0,
      },
    ],
    outro: 'A salad that was still growing this morning — that\'s as fresh as food gets.',
  },
  {
    code: 'mint_tea',
    name: 'Mint Tea for Two',
    emoji: '🫖',
    description: 'Fresh mint leaves steeped in hot water, the way Bachan likes it.',
    ingredients: { mint: 3 },
    facts: [
      'Letting leaves sit in hot water is called STEEPING — the warmth coaxes the flavor out of the leaf.',
      'Mint tastes "cool" because its oil tricks the cold-sensors on your tongue. The tea is hot and cool at once!',
    ],
    questions: [
      {
        prompt: 'What does it mean to STEEP tea?',
        choices: [
          'Let leaves sit in hot water so the flavor comes out',
          'Stir it as fast as you can',
          'Freeze it into cubes',
          'Climb a very steep hill with it',
        ],
        correctIndex: 0,
      },
      {
        prompt: 'Why does mint make your mouth feel cool?',
        choices: [
          'Its oil tickles the cold-sensors on your tongue',
          'Mint leaves are always frozen',
          'It turns your tongue blue',
          'It doesn\'t — mint is spicy hot',
        ],
        correctIndex: 0,
      },
    ],
    outro: 'Bachan says the best tea is the kind you grew yourself.',
  },
  {
    code: 'rainbow_veggie_soup',
    name: 'Rainbow Veggie Soup',
    emoji: '🍲',
    description: 'Carrots, tomatoes, and a radish, simmered soft and cozy.',
    ingredients: { carrot: 2, tomato: 2, radish: 1 },
    facts: [
      'Here\'s a kitchen secret: a tomato is botanically a FRUIT — it grows from a flower and carries the seeds.',
      'Simmering means cooking in water that\'s hot with tiny lazy bubbles — not a wild rolling boil.',
    ],
    questions: [
      {
        prompt: 'You cut each of the 2 carrots in half. How many carrot pieces go in the pot?',
        choices: ['4', '2', '3', '8'],
        correctIndex: 0,
      },
      {
        prompt: 'Why do scientists call the tomato a fruit?',
        choices: [
          'It grows from a flower and holds the plant\'s seeds',
          'Because it is red',
          'Because it is round',
          'Because it tastes good in fruit salad',
        ],
        correctIndex: 0,
      },
    ],
    outro: 'Soup shared is soup doubled — somehow the pot never feels smaller.',
  },
  {
    code: 'garden_wrap',
    name: 'Garden Picnic Wraps',
    emoji: '🌯',
    description: 'Crisp lettuce leaves rolled around carrot and tomato.',
    ingredients: { lettuce: 2, carrot: 1, tomato: 1 },
    facts: [
      'A big lettuce leaf can BE the wrap — sturdy leaves work like edible paper.',
      'Carrots are roots, lettuce is leaves, tomatoes are fruit — one wrap, three different plant parts!',
    ],
    questions: [
      {
        prompt: 'A wrap uses a root, a leaf, and a fruit. Which ingredient is the ROOT?',
        choices: ['The carrot', 'The lettuce', 'The tomato', 'The sunshine'],
        correctIndex: 0,
      },
      {
        prompt: 'You make 2 wraps and cut each into halves. How many pieces for the picnic?',
        choices: ['4', '2', '6', '3'],
        correctIndex: 0,
      },
    ],
    outro: 'Three plant parts, one picnic. The garden fed everybody today.',
  },
  {
    code: 'pumpkin_bread',
    name: 'Pumpkin Bread',
    emoji: '🍞',
    description: 'Sweet, spiced, and orange — the whole kitchen smells like autumn.',
    ingredients: { pumpkin: 2 },
    facts: [
      'Baking soda makes tiny bubbles of gas in the batter — the bubbles are what make bread rise and turn fluffy.',
      'Pumpkin bread is orange for the same reason carrots are: a plant pigment called carotene.',
    ],
    questions: [
      {
        prompt: 'What makes pumpkin bread rise up fluffy in the oven?',
        choices: [
          'Tiny gas bubbles from the baking soda',
          'The oven shakes it upward',
          'Pumpkins are naturally bouncy',
          'You blow air into it with a straw',
        ],
        correctIndex: 0,
      },
      {
        prompt: 'The loaf is cut into 8 slices and you share half with your guest. How many slices do they get?',
        choices: ['4', '8', '2', '6'],
        correctIndex: 0,
      },
    ],
    outro: 'Warm pumpkin bread: proof that math (and a garden) can smell wonderful.',
  },
  {
    code: 'apple_crumble',
    name: 'Apple Crumble',
    emoji: '🥧',
    description: 'Soft baked apples under a golden crumbly lid.',
    ingredients: { apple: 2 },
    facts: [
      'Apples are about one-quarter air — that\'s why they bob and float in water.',
      'Cooked apples turn soft because heat loosens the glue (called pectin) holding their cells together.',
    ],
    questions: [
      {
        prompt: 'Why does an apple float in water?',
        choices: [
          'About a quarter of an apple is air',
          'Apples are lighter than feathers',
          'Apples can swim',
          'It doesn\'t — apples sink like stones',
        ],
        correctIndex: 0,
      },
      {
        prompt: 'You slice each of the 2 apples into 4 pieces. How many apple slices in the crumble?',
        choices: ['8', '6', '4', '24'],
        correctIndex: 0,
      },
    ],
    outro: 'The orchard\'s first dessert — worth every one of those 700 right answers.',
  },
  {
    code: 'strawberry_mint_cooler',
    name: 'Strawberry-Mint Cooler',
    emoji: '🍹',
    description: 'Squashed strawberries, torn mint, cold water, clinking cups.',
    ingredients: { strawberry: 2, mint: 2 },
    facts: [
      'Every strawberry wears about 200 seeds on its OUTSIDE — count the little specks!',
      'Tearing mint releases its smell because the scent oils live in tiny bubbles on the leaf that pop when bent.',
    ],
    questions: [
      {
        prompt: 'Where does a strawberry keep its seeds?',
        choices: [
          'On the outside of the berry',
          'Deep in its core like an apple',
          'In its leaves',
          'Strawberries have no seeds',
        ],
        correctIndex: 0,
      },
      {
        prompt: 'Why do cooks TEAR mint leaves instead of leaving them whole?',
        choices: [
          'Tearing pops the tiny oil bubbles that hold the smell',
          'Mint is too heavy whole',
          'It makes the drink turn green',
          'Whole leaves are poisonous',
        ],
        correctIndex: 0,
      },
    ],
    outro: 'Pink, cold, and minty — the official drink of a job well done.',
  },
  {
    code: 'berry_pancakes',
    name: 'Berry-Patch Pancakes',
    emoji: '🥞',
    description: 'Blueberries and strawberry folded into golden pancakes.',
    ingredients: { blueberry: 2, strawberry: 1 },
    facts: [
      'Blueberry flowers are pollinated by bumblebees that BUZZ at just the right pitch to shake the pollen loose.',
      'Pancakes get flipped when bubbles rise and pop on top — the bubbles say "this side is done!"',
    ],
    questions: [
      {
        prompt: 'How do bumblebees get pollen out of blueberry flowers?',
        choices: [
          'They buzz at just the right pitch to shake it loose',
          'They knock politely',
          'They use tiny spoons',
          'They wait for the wind to do it',
        ],
        correctIndex: 0,
      },
      {
        prompt: 'When is a pancake ready to flip?',
        choices: [
          'When bubbles rise and pop on top',
          'When it turns blue',
          'After exactly one hour',
          'When it flips itself',
        ],
        correctIndex: 0,
      },
    ],
    outro: 'Breakfast by bumblebee — the garden\'s busiest workers helped make this.',
  },
  {
    code: 'peach_cobbler',
    name: 'Sunset Peach Cobbler',
    emoji: '🍑',
    description: 'Warm peaches from beyond the trellis under a golden crumble lid.',
    ingredients: { peach: 3 },
    facts: [
      'Cobbler got its name because the bumpy crust looks like an old cobblestone street.',
      'Cooking a peach makes it even sweeter — heat breaks its sugars free.',
    ],
    questions: [
      {
        prompt: 'The cobbler needs 3 peaches. If you picked 5, how many are left to eat fresh?',
        choices: ['2', '3', '1', '8'],
        correctIndex: 0,
      },
      {
        prompt: 'Why does the top of a cobbler look so bumpy?',
        choices: [
          'The crust bakes like cobblestones on a street',
          'The peaches jump while it bakes',
          'It\'s always cut that way after',
          'The oven shakes it into bumps',
        ],
        correctIndex: 0,
      },
    ],
    outro: 'The first cobbler from the new orchard — worth every right answer.',
  },
  {
    code: 'bramble_jam',
    name: 'Bramble Patch Jam',
    emoji: '🫙',
    description: 'Raspberries and blackberries stirred slow into a ruby-dark jar.',
    ingredients: { raspberry: 2, blackberry: 2 },
    facts: [
      'Jam thickens because berries hide a natural glue called pectin that wakes up when heated.',
      'One jar of jam saves a whole afternoon of summer for a snowy day.',
    ],
    questions: [
      {
        prompt: 'The jam takes 2 raspberries and 2 blackberries. How many berries all together?',
        choices: ['4', '2', '6', '22'],
        correctIndex: 0,
      },
      {
        prompt: 'What makes jam turn thick instead of staying juice?',
        choices: [
          'Pectin — a natural glue inside the berries',
          'The jar squeezes it tight',
          'Sugar turns into rubber',
          'You stir it backwards',
        ],
        correctIndex: 0,
      },
    ],
    outro: 'Ruby jam from your own brambles — winter toast is going to be lucky.',
  },
  {
    code: 'moonlight_tea_party',
    name: 'Moonlight Tea Party',
    emoji: '🫖',
    description: 'Chamomile and lavender steeped warm, with mint from the old garden.',
    ingredients: { chamomile: 2, lavender: 1, mint: 1 },
    facts: [
      'Chamomile flowers are dried before steeping — drying keeps their apple smell for months.',
      'Herbal "tea" isn\'t really tea at all — true tea comes from one special leaf. This is a tisane.',
    ],
    questions: [
      {
        prompt: 'The pot needs 2 chamomile, 1 lavender, and 1 mint. How many plants is that?',
        choices: ['4', '3', '5', '211'],
        correctIndex: 0,
      },
      {
        prompt: 'What do you call a warm drink made from herbs instead of tea leaves?',
        choices: [
          'A tisane',
          'A soupline',
          'A leaf-latte',
          'A grass gulp',
        ],
        correctIndex: 0,
      },
    ],
    outro: 'A tea party under the moon garden\'s lantern — even Luna came to sit.',
  },
];

export function getRecipe(code: string): Recipe | undefined {
  return RECIPE_CATALOG.find(r => r.code === code);
}

/** Which recipes can be cooked from the given basket counts? */
export function cookableRecipes(basket: Record<string, number>): Recipe[] {
  return RECIPE_CATALOG.filter(r =>
    Object.entries(r.ingredients).every(([plant, n]) => (basket[plant] ?? 0) >= n),
  );
}
