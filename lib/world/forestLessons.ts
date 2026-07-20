/**
 * Old Bramble the bear's reading lessons — READING COMPREHENSION
 * dressed as forest science.
 *
 * Sibling to the Burrow Bunny's little school, but the shape is
 * different on purpose. The bunny SHOWS a math trick and asks nothing.
 * The bear tells you something true about the world in real paragraphs
 * — the kind of prose a level 3-5 reader has to actually hold in their
 * head — and then asks "what did you learn?" with 2-3 multiple choice
 * questions drawn from the takeaways.
 *
 * So the skill being exercised is comprehension: read a passage of
 * connected sentences, keep the important facts, answer about them.
 * The science is the bait. The reading is the lesson.
 *
 * Level windows work like the bunny's: a learner at level N sees
 * lessons whose band covers N or N+1, floored at 3 (the bear's
 * easiest passages are level-3 prose, so a younger reader still gets
 * the starter shelf rather than an empty burrow).
 */

export type ForestVisual =
  /** Sky cross-section, four cloud families at their real altitudes. */
  | { kind: 'cloud_chart'; highlight?: 'cirrus' | 'cumulus' | 'stratus' | 'cumulonimbus' }
  /** Seed → root → shoot → first leaves. stage 1-4. */
  | { kind: 'germination'; stage: 1 | 2 | 3 | 4 }
  /** Carrot / potato / tomato with the soil line drawn through them. */
  | { kind: 'plant_parts'; highlight?: 'root' | 'tuber' | 'fruit' }
  /** Sun, sea, cloud, rain, river — arrows around the loop. */
  | { kind: 'water_cycle'; highlight?: 'evaporation' | 'condensation' | 'precipitation' | 'collection' }
  /** Seedling in a box with light from one side; roots down, shoot bent. */
  | { kind: 'phototropism'; stage: 1 | 2 }
  /** Orb web being built: bridge → frame → spokes → spiral. stage 1-4. */
  | { kind: 'spider_web'; stage: 1 | 2 | 3 | 4 }
  /** Leaf with CO2 in, O2 out, water up, sunlight down, sugar made. */
  | { kind: 'photosynthesis'; highlight?: 'light' | 'water' | 'air' | 'sugar' }
  /** 2x2 Punnett square of pea flower colour. */
  | { kind: 'punnett'; top: [string, string]; side: [string, string]; cells: string[]; caption: string }
  /** Butterfly and moth side by side, differences called out. */
  | { kind: 'moth_butterfly'; highlight?: 'antennae' | 'wings' | 'body' }
  /** One leaf in three states: green, gold, red. */
  | { kind: 'leaf_color'; stage: 1 | 2 | 3 }
  /** Fallen log with mushrooms, worms, mycelium threads underneath. */
  | { kind: 'decomposers'; stage: 1 | 2 | 3 };

export interface ForestPage {
  /** A real paragraph — this is the thing being comprehended. */
  text: string;
  visual: ForestVisual;
}

export interface ForestQuestion {
  prompt: string;
  choices: string[];
  /** Index into choices. */
  correct: number;
  /** Shown after answering — the takeaway restated, not just "correct". */
  why: string;
}

export interface ForestLesson {
  code: string;
  title: string;
  emoji: string;
  topic: 'sky & weather' | 'how plants work' | 'seeds & growing' | 'creatures' | 'the forest floor';
  minLevel: number;
  maxLevel: number;
  /** One-line hook shown on the lesson shelf. */
  teaser: string;
  pages: ForestPage[];
  questions: ForestQuestion[];
}

export const FOREST_LESSONS: ForestLesson[] = [
  // ─── Band 3–4 ─────────────────────────────────────────────────────
  {
    code: 'cloud_types',
    title: 'Reading the sky',
    emoji: '🌤️',
    topic: 'sky & weather',
    minLevel: 3, maxLevel: 4,
    teaser: 'Clouds tell you the weather before it arrives.',
    pages: [
      {
        text: 'Clouds are not all the same, and where a cloud sits in the sky tells you what kind it is. The highest clouds of all are called cirrus. They are so high and so cold that they are made of tiny ice crystals instead of water droplets. Wind up there stretches them into thin white streaks, which is why people sometimes call them mares’ tails.',
        visual: { kind: 'cloud_chart', highlight: 'cirrus' },
      },
      {
        text: 'Much lower down float the cumulus clouds — the puffy, cotton-ball kind you draw when you draw a cloud. Cumulus clouds form when warm air rises off the ground, cools, and the water in it turns back into droplets. On a fair afternoon they drift by with blue sky between them. Those are called fair-weather cumulus, and they are the sky telling you to go outside.',
        visual: { kind: 'cloud_chart', highlight: 'cumulus' },
      },
      {
        text: 'Stratus clouds are different again. Instead of puffs with gaps, stratus spreads out into one flat grey blanket that covers the whole sky. Stratus often brings drizzle. But the cloud to really watch is cumulonimbus: a cumulus that kept growing and growing until it towered up like a mountain with a flat anvil top. Cumulonimbus is the thunderstorm cloud. When you see one building, it is time to head indoors.',
        visual: { kind: 'cloud_chart', highlight: 'cumulonimbus' },
      },
    ],
    questions: [
      {
        prompt: 'Why are cirrus clouds made of ice instead of water droplets?',
        choices: [
          'They are so high up that it is freezing cold there',
          'They are made in the winter only',
          'The wind freezes them as it stretches them',
          'They are made of snow that has not fallen yet',
        ],
        correct: 0,
        why: 'Height is the reason. Cirrus float higher than any other cloud, and it is bitterly cold up there — so the water freezes into ice crystals.',
      },
      {
        prompt: 'You look up and the whole sky is one flat grey blanket with no gaps. What kind of cloud is that?',
        choices: ['Cumulus', 'Stratus', 'Cirrus', 'Cumulonimbus'],
        correct: 1,
        why: 'Stratus is the blanket cloud — flat, grey, edge to edge, often with drizzle. Cumulus would have blue sky showing between the puffs.',
      },
      {
        prompt: 'Which cloud means a thunderstorm is coming?',
        choices: [
          'Fair-weather cumulus',
          'Cirrus streaks',
          'Cumulonimbus, towering with a flat top',
          'Any cloud that is grey',
        ],
        correct: 2,
        why: 'Cumulonimbus is a cumulus that grew into a tower with an anvil-flat top. That shape is the storm warning.',
      },
    ],
  },
  {
    code: 'germination',
    title: 'How a seed wakes up',
    emoji: '🌱',
    topic: 'seeds & growing',
    minLevel: 3, maxLevel: 4,
    teaser: 'What happens underground in the first three days.',
    pages: [
      {
        text: 'A seed is not asleep the way you are asleep. It is more like a tiny plant packed in a lunchbox, waiting. Inside the hard seed coat there is a baby plant and a store of food for it to eat. The seed can wait like this for months, or in some plants for years, until the right things happen around it.',
        visual: { kind: 'germination', stage: 1 },
      },
      {
        text: 'The signal is water. When the soil gets damp, the seed drinks it in and swells until the seed coat splits open. Out of the split comes the root, always first, always pointing down. The root has a job to do before anything else can happen: it must anchor the seedling and start pulling up water of its own.',
        visual: { kind: 'germination', stage: 2 },
      },
      {
        text: 'Only after the root takes hold does the shoot push upward through the soil. It is still eating from the food packed inside the seed, because it cannot make its own food yet — there is no sunlight underground. Then the shoot breaks the surface and the first two leaves unfold. From that moment the seedling makes its own food from sunlight, the packed lunch is finished, and the seed has become a plant.',
        visual: { kind: 'germination', stage: 4 },
      },
    ],
    questions: [
      {
        prompt: 'What wakes a waiting seed up?',
        choices: ['Sunlight reaching it', 'Water in the soil', 'Warm wind', 'Being buried deeper'],
        correct: 1,
        why: 'Water is the signal. The seed drinks, swells, and the coat splits open — all of it underground, before any sunlight is involved.',
      },
      {
        prompt: 'Which part comes out of the seed first?',
        choices: ['The first leaves', 'The shoot', 'The root', 'They come out together'],
        correct: 2,
        why: 'The root always goes first and always points down. It anchors the seedling and starts drinking before the shoot bothers to climb.',
      },
      {
        prompt: 'How does the shoot eat while it is still underground?',
        choices: [
          'It uses the food packed inside the seed',
          'It makes food from sunlight through the soil',
          'It takes food from nearby plants',
          'It does not need food until it has leaves',
        ],
        correct: 0,
        why: 'The seed is a lunchbox. The shoot lives on that packed food until its first leaves reach the light and it can start making its own.',
      },
    ],
  },
  {
    code: 'plant_parts_eat',
    title: 'Root, tuber, or fruit?',
    emoji: '🥕',
    topic: 'how plants work',
    minLevel: 3, maxLevel: 4,
    teaser: 'Three vegetables, three completely different plant parts.',
    pages: [
      {
        text: 'When you eat a carrot you are eating a root. A carrot is one fat taproot that the plant grew straight down into the soil, and it is fat for a reason: the plant stuffed it with sugar to live on later. Roots also do the ordinary root things — they hold the plant in place and drink water. If you look closely at a carrot you can see the thin whiskery side roots that were doing the drinking.',
        visual: { kind: 'plant_parts', highlight: 'root' },
      },
      {
        text: 'A potato looks like a root, but it is not one. A potato is a tuber, which is a swollen underground stem. The proof is right on the skin: those little dents people call eyes are buds, and buds only ever grow on stems. Leave a potato in the cupboard too long and the eyes sprout — a root could never do that.',
        visual: { kind: 'plant_parts', highlight: 'tuber' },
      },
      {
        text: 'A tomato is neither. A tomato is a fruit, and the rule for fruit is simple: a fruit grows from a flower and it carries the seeds. Slice a tomato open and there they are. This rule surprises people, because it means cucumbers, peppers, pumpkins and green beans are all fruits too. They all began as flowers, and they all carry seeds.',
        visual: { kind: 'plant_parts', highlight: 'fruit' },
      },
    ],
    questions: [
      {
        prompt: 'How can you tell a potato is a stem and not a root?',
        choices: [
          'It grows underground',
          'It has eyes, which are buds, and buds grow only on stems',
          'It is round instead of long',
          'It has no seeds inside',
        ],
        correct: 1,
        why: 'The eyes give it away. Eyes are buds, buds belong to stems — so a potato is a swollen underground stem, called a tuber.',
      },
      {
        prompt: 'What are the two things that make something a fruit?',
        choices: [
          'It is sweet and you can eat it raw',
          'It grows above ground and is soft',
          'It grew from a flower and it carries seeds',
          'It is round and it grows on a vine',
        ],
        correct: 2,
        why: 'From a flower, carrying seeds. That is the whole rule — which is why cucumbers and peppers count as fruits even though they are not sweet.',
      },
      {
        prompt: 'Why is a carrot so much fatter than an ordinary root?',
        choices: [
          'The plant packed it with sugar to store for later',
          'It soaked up too much water',
          'Carrots grow in soft soil so they spread out',
          'It is full of seeds',
        ],
        correct: 0,
        why: 'It is a storage cupboard. The carrot plant filled that taproot with sugar to live on later — and we come along and eat the cupboard.',
      },
    ],
  },
  {
    code: 'water_cycle',
    title: 'The water that never leaves',
    emoji: '💧',
    topic: 'sky & weather',
    minLevel: 3, maxLevel: 4,
    teaser: 'The rain in the garden is older than the dinosaurs.',
    pages: [
      {
        text: 'Sunshine falls on an ocean, a lake, even a puddle in the lane, and warms the water at the top. Warm water turns into an invisible gas called water vapour and floats up into the air. That is evaporation, and it is happening around you all the time — it is why a wet path dries after the rain stops, without anybody wiping it.',
        visual: { kind: 'water_cycle', highlight: 'evaporation' },
      },
      {
        text: 'The higher the vapour rises, the colder the air gets. Cold air cannot hold vapour, so the vapour turns back into tiny water droplets and gathers around specks of dust. Millions of those droplets together are a cloud. That change from gas back into liquid is called condensation. It is the same thing that fogs up a cold window when you breathe on it.',
        visual: { kind: 'water_cycle', highlight: 'condensation' },
      },
      {
        text: 'When the droplets bump into each other they join up and grow heavier, until the air can no longer hold them and they fall as rain, or as snow if it is cold enough. That is precipitation. The water soaks into the ground or runs downhill into streams and rivers, which carry it back to the sea, and then the sun warms it again. Nothing is ever added and nothing ever leaves. The water you drank at breakfast has been round this loop more times than anyone could count, and some of it fell on dinosaurs.',
        visual: { kind: 'water_cycle', highlight: 'precipitation' },
      },
    ],
    questions: [
      {
        prompt: 'What is evaporation?',
        choices: [
          'Water turning into invisible vapour and rising',
          'Vapour turning back into droplets',
          'Rain soaking into the ground',
          'Rivers running down to the sea',
        ],
        correct: 0,
        why: 'Evaporation is liquid water becoming vapour and floating up — the reason a wet path dries itself.',
      },
      {
        prompt: 'Why does rising vapour turn back into droplets?',
        choices: [
          'The wind pushes it together',
          'The higher air is colder, and cold air cannot hold vapour',
          'Dust makes it heavy',
          'The sun stops shining on it',
        ],
        correct: 1,
        why: 'Cold is the cause. Higher air is colder, and cold air cannot hold vapour — so it condenses into droplets around specks of dust, making a cloud.',
      },
      {
        prompt: 'What does the passage mean by saying the water never leaves?',
        choices: [
          'Rain always falls in the same place',
          'Water can never be dirty',
          'The same water goes round the loop again and again, forever',
          'New water is made by the clouds each time',
        ],
        correct: 2,
        why: 'It is a closed loop. Nothing is added and nothing escapes, so the same water keeps travelling round — which is why some of it once fell on dinosaurs.',
      },
    ],
  },
  {
    code: 'seeds_find_sun',
    title: 'How seeds know which way is up',
    emoji: '☀️',
    topic: 'seeds & growing',
    minLevel: 3, maxLevel: 4,
    teaser: 'A seed underground has never seen the sky. So how?',
    pages: [
      {
        text: 'Plant a bean upside down and it still grows the right way up. That is strange when you think about it: the seed is buried in the dark, it has no eyes, and it has never seen the sky. Yet the root always turns down and the shoot always turns up. Plants can feel which way gravity pulls, and they grow by that feeling. Scientists call it gravitropism, and it works even in a pitch-dark cupboard.',
        visual: { kind: 'phototropism', stage: 1 },
      },
      {
        text: 'Once the shoot reaches the light, a second trick takes over. Put a seedling on a windowsill and within a day or two it will lean toward the glass. The plant makes a chemical messenger called auxin, and auxin collects on the shady side of the stem. Auxin tells cells to stretch longer — so the cells on the shady side grow taller than the cells on the sunny side, and a stem with one long side and one short side has no choice but to bend. The plant is not reaching for the light. It is growing crooked on purpose, and leaning is what crooked looks like.',
        visual: { kind: 'phototropism', stage: 2 },
      },
    ],
    questions: [
      {
        prompt: 'How does a buried seed know which way to send its root, with no light to see by?',
        choices: [
          'It feels which way gravity pulls',
          'It follows the warmth of the soil',
          'It grows toward the water',
          'It guesses, and half of them get it wrong',
        ],
        correct: 0,
        why: 'Gravity is the compass. Plants feel which way it pulls and grow by that — which is why an upside-down bean still comes up the right way.',
      },
      {
        prompt: 'Why does a seedling on a windowsill bend toward the glass?',
        choices: [
          'The sunny side of the stem shrinks',
          'Auxin collects on the shady side and makes those cells stretch longer',
          'The plant pushes itself over with its roots',
          'The light pulls the stem toward it',
        ],
        correct: 1,
        why: 'One side outgrows the other. Auxin gathers on the shady side, those cells stretch longer, and a stem with one long side simply has to bend.',
      },
    ],
  },
  {
    code: 'spider_web',
    title: 'The spider’s blueprint',
    emoji: '🕸️',
    topic: 'creatures',
    minLevel: 3, maxLevel: 4,
    teaser: 'Why the spider never sticks to her own web.',
    pages: [
      {
        text: 'An orb weaver does not spin her web at random. She builds it in a strict order, and she starts with a problem: how do you get a thread across a gap you cannot walk over? Her answer is to let out a fine strand and wait for the breeze to carry it across until the free end catches on a twig. That first thread is the bridge line, and everything else hangs from it.',
        visual: { kind: 'spider_web', stage: 1 },
      },
      {
        text: 'From the bridge line she drops down and builds a frame — the outer edges the whole web will be stretched inside. Then she lays the spokes, running from the frame in to the centre, like the spokes of a bicycle wheel. All of this silk is dry silk. She can walk on it as easily as you walk on a floor.',
        visual: { kind: 'spider_web', stage: 3 },
      },
      {
        text: 'Only last does she spiral around from the centre outward, and only that spiral thread is sticky. Now the trap is finished, and the secret is in the order she built it: when she crosses her own web she steps on the dry spokes and steps over the sticky spiral. Many orb weavers tear the whole thing down at the end of the day and eat the silk, so their body can spin it into a fresh web tomorrow.',
        visual: { kind: 'spider_web', stage: 4 },
      },
    ],
    questions: [
      {
        prompt: 'How does the spider get her very first thread across the gap?',
        choices: [
          'She climbs around the long way carrying it',
          'She throws it hard',
          'She lets it out and the breeze carries it until it catches',
          'She jumps across',
        ],
        correct: 2,
        why: 'The wind does it for her. She lets out a fine strand and waits for the breeze to catch the free end on a twig — that is the bridge line.',
      },
      {
        prompt: 'Why does the spider not get stuck in her own web?',
        choices: [
          'Her feet are coated in oil',
          'Only the spiral is sticky, and she walks on the dry spokes',
          'She never crosses the middle',
          'The web is only sticky for the first hour',
        ],
        correct: 1,
        why: 'She built herself a safe path. The spokes are dry silk and the spiral is the sticky part, so she steps on spokes and over spiral.',
      },
      {
        prompt: 'Why do many orb weavers eat their old web?',
        choices: [
          'To hide it from birds',
          'Because there is nothing else to eat',
          'To get the silk back so their body can spin a fresh web',
          'To clean the dust off it',
        ],
        correct: 2,
        why: 'The silk is recycled. Eating it gives her body the material back so she can spin a brand-new web tomorrow.',
      },
    ],
  },

  // ─── Band 4–5 ─────────────────────────────────────────────────────
  {
    code: 'photosynthesis',
    title: 'The kitchen inside a leaf',
    emoji: '🍃',
    topic: 'how plants work',
    minLevel: 4, maxLevel: 5,
    teaser: 'Plants do not eat. They cook — out of air, water and light.',
    pages: [
      {
        text: 'Plants do not eat food the way animals do. They make it. Every green leaf is a small kitchen running a recipe called photosynthesis, and the recipe needs exactly three ingredients: light from the sun, water from the soil, and carbon dioxide gas from the air. Out of those three things a plant builds sugar, which is the food it lives on and grows with.',
        visual: { kind: 'photosynthesis', highlight: 'light' },
      },
      {
        text: 'Each ingredient arrives by its own road. The water is pulled up from the roots through tiny pipes inside the stem, all the way to the leaves. The carbon dioxide comes in through holes on the underside of the leaf called stomata, which the plant can open and close. And the light is caught by a green pigment called chlorophyll — the reason leaves are green is that chlorophyll soaks up the red and blue light and throws the green back at your eyes.',
        visual: { kind: 'photosynthesis', highlight: 'water' },
      },
      {
        text: 'When the recipe runs, the plant keeps the sugar and pushes out what it does not need: oxygen. That leftover gas goes back out of the stomata into the air, and it is the oxygen you are breathing right now. So a forest is not only a place where things grow. It is a place where air is made. Every breath you take was cooked in a leaf.',
        visual: { kind: 'photosynthesis', highlight: 'sugar' },
      },
    ],
    questions: [
      {
        prompt: 'What are the three ingredients a plant needs to make its food?',
        choices: [
          'Soil, water and warmth',
          'Light, water and carbon dioxide',
          'Sugar, oxygen and light',
          'Water, oxygen and soil',
        ],
        correct: 1,
        why: 'Light, water, carbon dioxide. Notice soil is not on the list — soil holds the plant up and supplies water, but it is not an ingredient in the recipe.',
      },
      {
        prompt: 'Why do leaves look green?',
        choices: [
          'Chlorophyll soaks up red and blue light and reflects green back',
          'Green is the colour of the sugar inside them',
          'The water in the leaf is tinted green',
          'Green light is the strongest kind of sunlight',
        ],
        correct: 0,
        why: 'You are seeing the light chlorophyll rejected. It absorbs red and blue to run the recipe and bounces the green back at your eyes.',
      },
      {
        prompt: 'The oxygen you breathe is best described as what?',
        choices: [
          'An ingredient the plant needs',
          'What the plant makes when it runs out of water',
          'Leftover gas the plant pushes out after making sugar',
          'Something the roots pull out of the soil',
        ],
        correct: 2,
        why: 'Oxygen is the leftover. The plant wanted the sugar; the oxygen was waste, pushed back out through the stomata — and it happens to be what we breathe.',
      },
    ],
  },
  {
    code: 'mendel_peas',
    title: 'Mendel and his pea plants',
    emoji: '🫛',
    topic: 'seeds & growing',
    minLevel: 4, maxLevel: 5,
    teaser: 'A monk, a garden, and the hidden rule of inheritance.',
    pages: [
      {
        text: 'About a hundred and sixty years ago a monk named Gregor Mendel grew pea plants in his monastery garden, and he grew a great many of them — thousands. What made Mendel different from other gardeners was that he counted. He picked one thing at a time, like flower colour, and he crossed the plants on purpose to see what would happen, and then he wrote down exactly how many of each kind he got.',
        visual: { kind: 'punnett', top: ['P', 'P'], side: ['W', 'W'], cells: ['PW', 'PW', 'PW', 'PW'], caption: 'pure purple × pure white → every one purple' },
      },
      {
        text: 'When he crossed a purple-flowered pea with a white-flowered pea, he did not get pale purple. He got purple. Every single one. The white seemed to have vanished. But when he let those purple plants make the next generation, white came back — in about one plant out of every four. Whatever carried whiteness had been hiding in the purple plants the whole time, waiting.',
        visual: { kind: 'punnett', top: ['P', 'W'], side: ['P', 'W'], cells: ['PP', 'PW', 'PW', 'WW'], caption: 'their children crossed → three purple, one white' },
      },
      {
        text: 'Mendel worked out that each plant carries two instructions for a trait, one from each parent. Some instructions are dominant, meaning they show whenever they are present, and some are recessive, meaning they only show when a plant has two of them and no dominant one to cover them up. Purple was dominant; white was recessive. Today we call those instructions genes, and the little square you use to work out the combinations is called a Punnett square. Mendel never knew the word gene. He worked it all out by counting peas.',
        visual: { kind: 'punnett', top: ['P', 'W'], side: ['P', 'W'], cells: ['PP', 'PW', 'PW', 'WW'], caption: 'only WW has no P to cover it up' },
      },
    ],
    questions: [
      {
        prompt: 'What did Mendel do that other gardeners were not doing?',
        choices: [
          'He grew peas instead of flowers',
          'He crossed plants on purpose and counted the results carefully',
          'He used a microscope to look at genes',
          'He grew his plants indoors',
        ],
        correct: 1,
        why: 'Counting was the breakthrough. He crossed one trait at a time deliberately and wrote down exact numbers — that is what turned gardening into science.',
      },
      {
        prompt: 'What does it mean that purple is dominant?',
        choices: [
          'Purple flowers are bigger and stronger',
          'Purple plants make more seeds',
          'Purple shows whenever the instruction is present, even if a white instruction is there too',
          'Purple plants always come first',
        ],
        correct: 2,
        why: 'Dominant means it shows up whenever it is there. One purple instruction is enough to make the flower purple, which is how white stayed hidden for a generation.',
      },
      {
        prompt: 'Why did white flowers reappear in the next generation?',
        choices: [
          'The white instruction was hiding in the purple plants and two of them met up',
          'The purple plants got weaker over time',
          'Bees carried white pollen in from another garden',
          'The soil changed the colour',
        ],
        correct: 0,
        why: 'It was never gone. Those purple plants each carried a hidden white instruction, and when two hidden ones met in the same plant, white showed — about one time in four.',
      },
    ],
  },
  {
    code: 'moth_or_butterfly',
    title: 'Butterfly or moth?',
    emoji: '🦋',
    topic: 'creatures',
    minLevel: 4, maxLevel: 5,
    teaser: 'Three ways to tell them apart, even at a glance.',
    pages: [
      {
        text: 'Butterflies and moths are close cousins — both belong to a group whose name means scale-wing, because their wings are covered in thousands of tiny overlapping scales like roof tiles. That is the dust that comes off on your fingers if you handle one, and it is why you should not. But there are reliable ways to tell the two apart, and the best one is to look at the antennae.',
        visual: { kind: 'moth_butterfly', highlight: 'antennae' },
      },
      {
        text: 'A butterfly’s antennae are thin, and each one ends in a little club or knob, like a pin. A moth’s antennae have no knob at all; they are either plain and thread-like or spectacularly feathery, and the feathery ones belong to males, who use them to smell a female from far across a field. Once you know to check the tips, you can name almost any one you meet.',
        visual: { kind: 'moth_butterfly', highlight: 'antennae' },
      },
      {
        text: 'Two more clues help. Watch how the insect rests: most butterflies close their wings up over their back like praying hands, while most moths lay theirs flat out or fold them into a little roof. And moths tend to be furrier and stouter in the body, which helps them stay warm on cool nights — because most moths fly at night, and most butterflies fly by day. There are exceptions to every one of these rules, which is exactly why naturalists check more than one clue before deciding.',
        visual: { kind: 'moth_butterfly', highlight: 'wings' },
      },
    ],
    questions: [
      {
        prompt: 'What is the most reliable way to tell a butterfly from a moth?',
        choices: [
          'Whether it is flying in the daytime',
          'Whether the antennae end in a little club or knob',
          'How brightly coloured the wings are',
          'How big it is',
        ],
        correct: 1,
        why: 'Check the antenna tips. Butterflies have a club or knob at the end; moths have plain or feathery antennae with no knob.',
      },
      {
        prompt: 'Why are moths furrier and stouter than butterflies?',
        choices: [
          'To scare away birds',
          'Because they are older insects',
          'To stay warm, because most of them fly at night',
          'The fur helps them carry pollen',
        ],
        correct: 2,
        why: 'It is a coat. Most moths fly at night when it is cool, and a furry stout body holds heat.',
      },
      {
        prompt: 'The passage says there are exceptions to every rule. What should a naturalist do about that?',
        choices: [
          'Check more than one clue before deciding',
          'Only trust the daytime rule',
          'Assume anything colourful is a butterfly',
          'Give up on telling them apart',
        ],
        correct: 0,
        why: 'One clue can lie; three together rarely do. That is why naturalists check antennae AND resting wings AND body before naming what they have found.',
      },
    ],
  },
  {
    code: 'autumn_color',
    title: 'Why leaves turn gold',
    emoji: '🍁',
    topic: 'how plants work',
    minLevel: 4, maxLevel: 5,
    teaser: 'The gold was in the leaf all summer. You just could not see it.',
    pages: [
      {
        text: 'Here is the surprise about autumn: the yellow and orange were in the leaf the whole summer long. Those colours come from pigments called carotenoids — the same family of pigment that makes carrots orange — and they sit in the leaf all season helping to catch light. You never see them because the green chlorophyll is so much stronger that it drowns them out completely.',
        visual: { kind: 'leaf_color', stage: 1 },
      },
      {
        text: 'As the days shorten, a tree begins shutting the leaf down. Chlorophyll is expensive to keep making, and in weak autumn light a leaf no longer earns its keep, so the tree stops replacing it. The chlorophyll already there breaks apart and fades. As the green drains away the carotenoids are simply uncovered, and the leaf turns yellow and gold — not because anything was added, but because something was taken away.',
        visual: { kind: 'leaf_color', stage: 2 },
      },
      {
        text: 'The reds are a different story. Reds come from anthocyanins, and unlike the carotenoids these are made fresh in autumn, which is why the brightest red years come after warm sunny days and cool nights. Meanwhile the tree grows a corky wall called the abscission layer where the leaf stalk meets the twig, sealing the wound closed. When that wall is complete the leaf is no longer attached to anything, and the next breeze takes it. The tree let it go on purpose.',
        visual: { kind: 'leaf_color', stage: 3 },
      },
    ],
    questions: [
      {
        prompt: 'Where did the yellow in an autumn leaf come from?',
        choices: [
          'The tree made it in autumn',
          'It was there all summer, hidden under the green',
          'The cold air bleached the leaf',
          'It came from the soil as the roots slowed down',
        ],
        correct: 1,
        why: 'Nothing was added. The carotenoids sat there all summer, drowned out by the much stronger green — autumn just took the green away.',
      },
      {
        prompt: 'How is red different from yellow in an autumn leaf?',
        choices: [
          'Red is a kind of chlorophyll',
          'Red is what yellow turns into when it gets cold',
          'Red comes from anthocyanins, which are made fresh in autumn',
          'Red only appears on dead leaves',
        ],
        correct: 2,
        why: 'Red is newly manufactured. Anthocyanins are made in autumn itself, which is why red years depend on the weather while yellow shows up every year.',
      },
      {
        prompt: 'What is the abscission layer for?',
        choices: [
          'It seals the wound so the leaf can drop safely',
          'It feeds the leaf through the winter',
          'It holds the leaf on tighter during storms',
          'It makes the red colour',
        ],
        correct: 0,
        why: 'It is a corky wall that seals the twig where the stalk was. Once it is finished the leaf is attached to nothing — the tree dropped it deliberately.',
      },
    ],
  },
  {
    code: 'decomposers',
    title: 'The forest’s clean-up crew',
    emoji: '🍄',
    topic: 'the forest floor',
    minLevel: 4, maxLevel: 5,
    teaser: 'Every autumn drops a ton of leaves. Where do they go?',
    pages: [
      {
        text: 'Count the leaves that fall on a forest in one autumn and the number is enormous — tons of them, on every acre, every single year. Yet you never wade through a hundred years of piled-up leaves. Something takes them apart, and that something is a whole working crew: fungi, earthworms, beetles, woodlice and bacteria too small to see. They are called decomposers, and their job is to break dead things down.',
        visual: { kind: 'decomposers', stage: 1 },
      },
      {
        text: 'A mushroom is only the fruit of the fungus, the part that pops up to make spores. The real organism is a web of pale threads called mycelium, spreading through the leaf litter and the rotten wood underneath. Those threads release chemicals that dissolve tough dead material — including wood, which almost nothing else can digest — and then drink the results back in.',
        visual: { kind: 'decomposers', stage: 2 },
      },
      {
        text: 'This is not tidying up. It is the return trip. Every leaf was built out of nutrients the tree pulled from the soil, and the decomposers put those nutrients back where they came from, in a form roots can drink again. Without them the forest would run out of what it needs to grow, and be buried in its own leaves while it starved. The clean-up crew is the reason next spring is possible.',
        visual: { kind: 'decomposers', stage: 3 },
      },
    ],
    questions: [
      {
        prompt: 'What is a mushroom, really?',
        choices: [
          'The whole fungus',
          'A kind of plant with no leaves',
          'The fruit of the fungus — the part that makes spores',
          'A root that grew above ground',
        ],
        correct: 2,
        why: 'The mushroom is just the fruiting part. The actual organism is the mycelium — a web of pale threads spreading unseen through the litter and rotten wood.',
      },
      {
        prompt: 'How does a fungus feed on something as tough as wood?',
        choices: [
          'It releases chemicals that dissolve it, then drinks the results',
          'It chews it with tiny teeth',
          'It waits for rain to soften it',
          'It cannot — only beetles can eat wood',
        ],
        correct: 0,
        why: 'It digests from the outside. The mycelium releases chemicals that dissolve the dead material, then absorbs it — which is how fungi handle wood almost nothing else can.',
      },
      {
        prompt: 'Why does the passage call decomposing "the return trip"?',
        choices: [
          'Because the leaves blow back up into the tree',
          'Because it puts the tree’s nutrients back into the soil for roots to use again',
          'Because the fungi travel back underground each winter',
          'Because the same leaves fall every year',
        ],
        correct: 1,
        why: 'It closes the loop. The tree took those nutrients out of the soil to build the leaf; the decomposers carry them back so roots can use them again.',
      },
    ],
  },
];

/**
 * Lessons offered to a learner at `level`. Same window rule as the
 * bunny (covers N or N+1), but floored at 3 — the bear's easiest
 * passages are level-3 prose, so a level-1 or level-2 reader still
 * gets the starter shelf instead of an empty one.
 */
export function lessonsForLevel(level: number): ForestLesson[] {
  const l = Math.max(3, level);
  return FOREST_LESSONS.filter(x => x.minLevel <= l + 1 && x.maxLevel >= l);
}

/** Distinct topics present in a set of lessons, in catalog order. */
export function lessonTopics(lessons: ForestLesson[]): string[] {
  const seen: string[] = [];
  for (const l of lessons) if (!seen.includes(l.topic)) seen.push(l.topic);
  return seen;
}
