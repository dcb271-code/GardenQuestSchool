export interface ThemeHeader {
  title: string;
  themeEmoji: string;
  skillHint: string;
}

export const MATH_THEMES: Record<string, ThemeHeader> = {
  // Counting
  'math.counting.to_20': { title: 'Counting Bugs', themeEmoji: '🐞', skillHint: 'counting to 20' },
  'math.counting.to_50': { title: 'Flowers in the Meadow', themeEmoji: '🌼', skillHint: 'counting to 50' },
  'math.counting.to_120': { title: 'Big Meadow Count', themeEmoji: '🌾', skillHint: 'counting to 120' },
  'math.counting.skip_2s': { title: 'Ants in Pairs', themeEmoji: '🐜', skillHint: 'skip counting by 2s' },
  'math.counting.skip_5s': { title: 'Fingers & Fives', themeEmoji: '🖐️', skillHint: 'skip counting by 5s' },
  'math.counting.skip_10s': { title: 'Ten at a Time', themeEmoji: '🔟', skillHint: 'skip counting by 10s' },

  // Addition
  'math.add.within_10': { title: 'Meeting Bugs', themeEmoji: '🐛', skillHint: 'addition within 10' },
  'math.add.within_20.no_crossing': { title: 'Bee Swarms', themeEmoji: '🐝', skillHint: 'addition within 20' },
  'math.add.within_20.crossing_ten': { title: 'Butterfly Clusters', themeEmoji: '🦋', skillHint: 'make-10 addition' },
  'math.add.fluency_within_20': { title: 'Fast Facts', themeEmoji: '⚡', skillHint: 'quick recall within 20' },
  'math.add.within_100.no_regrouping': { title: "Hundred's Hollow", themeEmoji: '🌳', skillHint: '2-digit add (easy)' },
  'math.add.within_100.with_regrouping': { title: "Regrouping Ridge", themeEmoji: '⛰️', skillHint: '2-digit add (regroup)' },

  // Subtraction
  'math.subtract.within_10': { title: 'Petal Falls', themeEmoji: '🌸', skillHint: 'subtraction within 10' },
  'math.subtract.within_20.no_crossing': { title: 'Leaf Drops', themeEmoji: '🍂', skillHint: 'subtraction within 20' },
  'math.subtract.within_20.crossing_ten': { title: 'Berry Basket', themeEmoji: '🫐', skillHint: 'subtract with make-10' },
  'math.subtract.within_100.no_regrouping': { title: 'Quiet Pond', themeEmoji: '🪷', skillHint: '2-digit subtract (easy)' },
  'math.subtract.within_100.with_regrouping': { title: 'Rushing Stream', themeEmoji: '🌊', skillHint: '2-digit subtract (regroup)' },

  // Number bonds
  'math.number_bond.within_10': { title: 'Part & Whole', themeEmoji: '🌺', skillHint: 'number bonds to 10' },
  'math.number_bond.within_20': { title: 'Twin Blossoms', themeEmoji: '🌷', skillHint: 'number bonds to 20' },

  // Place value
  'math.placevalue.tens_ones': { title: 'Tens Tower', themeEmoji: '🏯', skillHint: 'tens and ones' },
  'math.placevalue.hundreds_tens_ones': { title: 'Three-Digit Tower', themeEmoji: '🏛️', skillHint: 'hundreds, tens, ones' },
  'math.placevalue.compare_2digit': { title: 'Tall Trees Compare', themeEmoji: '🌲', skillHint: 'compare 2-digit numbers' },
  'math.placevalue.compare_3digit': { title: 'Mountain Heights', themeEmoji: '🏔️', skillHint: 'compare 3-digit numbers' },
  'math.placevalue.add_subtract_10': { title: 'Ten More, Ten Less', themeEmoji: '🍃', skillHint: '± 10 mentally' },

  // Multiplication
  'math.multiply.equal_groups': { title: 'Equal Gardens', themeEmoji: '🌻', skillHint: 'equal groups' },
  'math.multiply.arrays': { title: 'Array Orchard', themeEmoji: '🍎', skillHint: 'rows and columns' },
  'math.multiply.skip_count_bridge': { title: 'Skip Count Bridge', themeEmoji: '🌉', skillHint: 'skip count as multiply' },

  // Word problems
  'math.word_problem.add_within_20': { title: 'Garden Stories (+)', themeEmoji: '📖', skillHint: 'add in a story' },
  'math.word_problem.subtract_within_20': { title: 'Garden Stories (−)', themeEmoji: '📖', skillHint: 'subtract in a story' },
  'math.word_problem.two_step': { title: 'Long Stories', themeEmoji: '📜', skillHint: 'two-step problems' },

  // Even / odd
  'math.even_odd.recognize': { title: 'Even & Odd Stones', themeEmoji: '🪨', skillHint: 'even or odd?' },

  // Time
  'math.time.read_hour_half': { title: 'Garden Clock', themeEmoji: '🕐', skillHint: 'hour & half-hour' },
  'math.time.read_to_5_min': { title: 'Sundial', themeEmoji: '🕰️', skillHint: 'time to nearest 5 min' },

  // Money
  'math.money.coin_count': { title: 'Pebble Coins', themeEmoji: '🪙', skillHint: 'count coins (¢)' },

  // Fractions (Grade 3)
  'math.fractions.identify': { title: 'Pie Slices', themeEmoji: '🥧', skillHint: 'name the fraction' },
  'math.fractions.compare_visual': { title: 'Bigger Slice', themeEmoji: '🍰', skillHint: 'which fraction is bigger' },

  // Multiplication facts (Grade 3)
  'math.multiply.facts_to_5': { title: 'Times Tables (×0–×5)', themeEmoji: '✖️', skillHint: 'multiplication facts' },
  'math.multiply.facts_to_10': { title: 'Times Tables (×0–×10)', themeEmoji: '✖️', skillHint: 'all the facts' },

  // Division (Grade 3)
  'math.divide.equal_share': { title: 'Sharing Squirrels', themeEmoji: '🐿️', skillHint: 'share equally' },
  'math.divide.facts_to_10': { title: 'Division Facts', themeEmoji: '➗', skillHint: 'division facts' },
  'math.divide.unknown_factor': { title: 'Missing Number', themeEmoji: '🧩', skillHint: 'find the missing factor' },

  // 3-digit math (Grade 3)
  'math.add.within_1000': { title: 'Big Number Bridge', themeEmoji: '🌉', skillHint: '3-digit add' },
  'math.subtract.within_1000': { title: 'Big Number Falls', themeEmoji: '🏞️', skillHint: '3-digit subtract' },

  // Rounding (Grade 3)
  'math.placevalue.round_nearest_10': { title: 'Round to 10', themeEmoji: '🌀', skillHint: 'nearest ten' },
  'math.placevalue.round_nearest_100': { title: 'Round to 100', themeEmoji: '🌀', skillHint: 'nearest hundred' },

  // Elapsed time (Grade 3)
  'math.time.elapsed_intervals': { title: 'Hourglass', themeEmoji: '⌛', skillHint: 'time that passed' },

  // ─── LEVEL 4 (CCSS grade 4) ───
  'math.placevalue.to_1_000_000': { title: 'The Thousand-Acre Meadow', themeEmoji: '🌾', skillHint: 'place value to 1,000,000' },
  'math.multiply.by_10s_100s': { title: 'Tens & Hundreds Trellis', themeEmoji: '🪜', skillHint: 'multiply by 10s and 100s' },
  'math.multiply.2digit_by_1digit': { title: 'Carrot Row Count', themeEmoji: '🥕', skillHint: '2-digit × 1-digit' },
  'math.factors.find': { title: 'Seed Sorter', themeEmoji: '🌱', skillHint: 'factors, multiples, primes' },
  'math.fractions.equivalent': { title: 'Twin Pies', themeEmoji: '🥧', skillHint: 'equivalent fractions' },
  'math.divide.with_remainders': { title: 'Leftover Acorns', themeEmoji: '🌰', skillHint: 'division with remainders' },
  'math.operations.multi_digit_add_subtract': { title: 'Great Number Grove', themeEmoji: '🌳', skillHint: '4-digit add & subtract' },
  'math.placevalue.round_large': { title: 'Round the Big Hill', themeEmoji: '🌀', skillHint: 'round large numbers' },
  'math.fractions.add_subtract_like': { title: 'Slice & Share', themeEmoji: '🍰', skillHint: 'fractions, like denominators' },
  'math.time.elapsed_across_hours': { title: 'Sun Across the Sky', themeEmoji: '🌤️', skillHint: 'elapsed time, hours apart' },
  'math.decimals.tenths_hundredths': { title: 'Decimal Dewdrops', themeEmoji: '💧', skillHint: 'tenths & hundredths' },
  'math.multiply.2digit_by_2digit': { title: 'Orchard Grid', themeEmoji: '🍏', skillHint: '2-digit × 2-digit' },
  'math.decimals.compare': { title: 'Dewdrop Weigh-In', themeEmoji: '⚖️', skillHint: 'compare decimals' },
  'math.measurement.area_perimeter': { title: 'Garden Bed Builder', themeEmoji: '📐', skillHint: 'area & perimeter' },
  'math.word_problem.multiplicative': { title: 'Tall Tales', themeEmoji: '🌲', skillHint: 'times-as-many stories' },

  // ─── LEVEL 5 (CCSS grade 5) ───
  'math.decimals.multiply_divide_10s': { title: 'Sliding Decimals', themeEmoji: '🛝', skillHint: 'decimals × and ÷ by 10s' },
  'math.fractions.of_a_set': { title: 'Part of the Patch', themeEmoji: '🍓', skillHint: 'fraction of a number' },
  'math.multiply.multi_digit': { title: 'The Great Multiply', themeEmoji: '✖️', skillHint: 'multi-digit multiply' },
  'math.decimals.add_subtract': { title: 'Raindrop Sums', themeEmoji: '🌧️', skillHint: 'add & subtract decimals' },
  'math.divide.long_division': { title: 'The Long Divide', themeEmoji: '➗', skillHint: 'long division' },
  'math.fractions.add_subtract_unlike': { title: 'Mismatched Slices', themeEmoji: '🍕', skillHint: 'unlike denominators' },
  'math.order_of_operations': { title: 'Recipe Order', themeEmoji: '📋', skillHint: 'order of operations' },
  'math.fractions.multiply': { title: 'Slice of a Slice', themeEmoji: '🍉', skillHint: 'multiply fractions' },
  'math.volume.rectangular': { title: 'Planter Box Volume', themeEmoji: '📦', skillHint: 'volume of prisms' },
  'math.word_problem.multi_step': { title: 'Winding Garden Path', themeEmoji: '🛤️', skillHint: 'multi-step stories' },
};

export function getThemeHeader(skillCode: string): ThemeHeader {
  return MATH_THEMES[skillCode] ?? {
    title: 'A New Path', themeEmoji: '🌿', skillHint: 'something new',
  };
}
