// lib/world/branchMaps.ts
//
// Per-branch map data: which skill structures live on Math Mountain vs.
// Reading Forest, where they're positioned, and how they cluster by
// strand. Branch maps reuse the same MapStructure shape as the central
// garden so rendering can share components.
//
// Cluster groupings come from §6.2 (math) and §7.2 (reading) of the
// world-navigation-overhaul design spec. Position numbers are
// approximate — the implementer may nudge them after seeing the actual
// SVG render.

import type { MapStructure } from './gardenMap';

export const BRANCH_MAP_WIDTH = 1440;
export const BRANCH_MAP_HEIGHT = 800;

export interface BranchCluster {
  code: string;
  label: string;
  structureCodes: string[];
}

// ─── MATH MOUNTAIN ──────────────────────────────────────────────────
//
// Vertical metaphor: harder content sits higher up the mountain.
// Five clusters around a central peak silhouette + a Word Stories
// cottage in the bottom-left corner.

export const MATH_MOUNTAIN_STRUCTURES: MapStructure[] = [
  // ─── Operations Hollow (lake + cave + river, balanced layout) ───
  // Three visual anchors hold this cluster together:
  //  • LAKE at center-left (x:272-488, y:428-512) — Quiet Pond ON it,
  //    Berry Basket on the NE bank, Big Falls is the southern outflow.
  //  • CAVE at lower-left (x:40-320, y:610-735) — Hundred's Hollow,
  //    Fast Facts, Regroup Ridge anchored as cave-mouth structures.
  //  • RIVER y:695-715 spans the whole foreground; Rushing Stream sits
  //    on its north bank, Big Bridge crosses it.
  // Twin Bonds + Butterfly meadow above lake.
  { code: 'mm_butterfly_make10', kind: 'skill', skillCode: 'math.add.within_20.crossing_ten',
    label: 'Butterfly Clusters', subLabel: 'make-10 add', themeEmoji: '🦋',
    x: 200, y: 540, size: 64, zone: 'math' },
  { code: 'mm_fast_facts', kind: 'skill', skillCode: 'math.add.fluency_within_20',
    label: 'Fast Facts', subLabel: 'quick recall', themeEmoji: '⚡',
    x: 30, y: 706, size: 60, zone: 'math' },
  { code: 'mm_hundreds_hollow', kind: 'skill', skillCode: 'math.add.within_100.no_regrouping',
    label: "Hundred's Hollow", subLabel: '2-digit add', themeEmoji: '🌳',
    x: 70, y: 670, size: 64, zone: 'math' },
  { code: 'mm_regroup_ridge', kind: 'skill', skillCode: 'math.add.within_100.with_regrouping',
    label: 'Regrouping Ridge', subLabel: '2-digit regroup', themeEmoji: '⛰️',
    x: 110, y: 706, size: 64, zone: 'math' },
  { code: 'mm_big_bridge', kind: 'skill', skillCode: 'math.add.within_1000',
    label: 'Big Number Bridge', subLabel: '3-digit add', themeEmoji: '🌉',
    x: 540, y: 700, size: 60, zone: 'math' },
  { code: 'mm_leaf_drops', kind: 'skill', skillCode: 'math.subtract.within_20.no_crossing',
    label: 'Leaf Drops', subLabel: 'subtract within 20', themeEmoji: '🍂',
    x: 460, y: 560, size: 60, zone: 'math' },
  { code: 'mm_berry_basket', kind: 'skill', skillCode: 'math.subtract.within_20.crossing_ten',
    label: 'Berry Basket', subLabel: 'subtract make-10', themeEmoji: '🫐',
    x: 510, y: 432, size: 60, zone: 'math' },
  { code: 'mm_quiet_pond', kind: 'skill', skillCode: 'math.subtract.within_100.no_regrouping',
    label: 'Quiet Pond', subLabel: '2-digit subtract', themeEmoji: '🪷',
    x: 320, y: 480, size: 60, zone: 'math' },
  { code: 'mm_rushing_stream', kind: 'skill', skillCode: 'math.subtract.within_100.with_regrouping',
    label: 'Rushing Stream', subLabel: '2-digit regroup', themeEmoji: '🌊',
    x: 380, y: 660, size: 60, zone: 'math' },
  { code: 'mm_big_falls', kind: 'skill', skillCode: 'math.subtract.within_1000',
    label: 'Big Number Falls', subLabel: '3-digit subtract', themeEmoji: '🏞️',
    x: 300, y: 510, size: 60, zone: 'math' },
  { code: 'mm_twin_bonds', kind: 'skill', skillCode: 'math.number_bond.within_20',
    label: 'Twin Blossoms', subLabel: 'bonds to 20', themeEmoji: '🌷',
    x: 280, y: 400, size: 56, zone: 'math' },

  // ─── Place-Value Heights (center, ON the hill silhouettes) ───────
  // Sits on the rolling-hill band y:340-470 — the mist ends at y:320
  // and the painted peak silhouette ends at y:280, so structures here
  // ride the rolling hills (NOT the snow). This is the "mountain
  // terrace" zone, and it has to be USED — leaving it empty is what
  // pushed everything to the bottom and made the scene feel crushed.
  { code: 'mm_tens_tower', kind: 'skill', skillCode: 'math.placevalue.tens_ones',
    label: 'Tens Tower', subLabel: 'tens & ones', themeEmoji: '🏯',
    x: 560, y: 400, size: 64, zone: 'math' },
  { code: 'mm_three_digit_tower', kind: 'skill', skillCode: 'math.placevalue.hundreds_tens_ones',
    label: 'Three-Digit Tower', subLabel: 'hundreds, tens, ones', themeEmoji: '🏛️',
    x: 680, y: 350, size: 64, zone: 'math' },
  { code: 'mm_compare_trees', kind: 'skill', skillCode: 'math.placevalue.compare_2digit',
    label: 'Compare Trees', subLabel: 'compare 2-digit', themeEmoji: '🌲',
    x: 600, y: 470, size: 60, zone: 'math' },
  { code: 'mm_mountain_compare', kind: 'skill', skillCode: 'math.placevalue.compare_3digit',
    label: 'Mountain Heights', subLabel: 'compare 3-digit', themeEmoji: '🏔️',
    x: 800, y: 380, size: 60, zone: 'math' },
  { code: 'mm_ten_more_less', kind: 'skill', skillCode: 'math.placevalue.add_subtract_10',
    label: 'Ten More, Ten Less', subLabel: '±10 mentally', themeEmoji: '🍃',
    x: 740, y: 470, size: 60, zone: 'math' },
  { code: 'mm_round_10', kind: 'skill', skillCode: 'math.placevalue.round_nearest_10',
    label: 'Round to 10', subLabel: 'nearest ten', themeEmoji: '🌀',
    x: 880, y: 470, size: 60, zone: 'math' },
  { code: 'mm_round_100', kind: 'skill', skillCode: 'math.placevalue.round_nearest_100',
    label: 'Round to 100', subLabel: 'nearest hundred', themeEmoji: '🌀',
    x: 920, y: 360, size: 60, zone: 'math' },

  // ─── Multiplication Orchard (right side, layered) ───────────────
  // Equal Garden + Array on a mid band. Times-tables below.
  // Skip Count Bridge crosses the main river at (1320, 700).
  { code: 'mm_equal_garden', kind: 'skill', skillCode: 'math.multiply.equal_groups',
    label: 'Equal Gardens', subLabel: 'equal groups', themeEmoji: '🌻',
    x: 1080, y: 530, size: 60, zone: 'math' },
  { code: 'mm_array_orchard', kind: 'skill', skillCode: 'math.multiply.arrays',
    label: 'Array Orchard', subLabel: 'rows × columns', themeEmoji: '🍎',
    x: 1180, y: 570, size: 64, zone: 'math' },
  { code: 'mm_skip_bridge', kind: 'skill', skillCode: 'math.multiply.skip_count_bridge',
    label: 'Skip Count Bridge', subLabel: 'skip → multiply', themeEmoji: '🌉',
    x: 1320, y: 700, size: 60, zone: 'math' },
  { code: 'mm_times_to_5', kind: 'skill', skillCode: 'math.multiply.facts_to_5',
    label: 'Times Tables ×0–×5', subLabel: 'multiplication facts', themeEmoji: '✖️',
    x: 1090, y: 620, size: 60, zone: 'math' },
  { code: 'mm_times_to_10', kind: 'skill', skillCode: 'math.multiply.facts_to_10',
    label: 'Times Tables ×0–×10', subLabel: 'all the facts', themeEmoji: '✖️',
    x: 1230, y: 640, size: 60, zone: 'math' },

  // ─── Division Glen (right, ON the hill silhouettes) ─────────────
  // Sits in the upper hill band — pine-shaded clearing y:360-420.
  // Below the painted Fuji peaks (which end at y:280) but on the
  // rolling-hill silhouettes so the eye climbs up the right side.
  { code: 'mm_sharing_squirrels', kind: 'skill', skillCode: 'math.divide.equal_share',
    label: 'Sharing Squirrels', subLabel: 'share equally', themeEmoji: '🐿️',
    x: 1080, y: 420, size: 60, zone: 'math' },
  { code: 'mm_division_facts', kind: 'skill', skillCode: 'math.divide.facts_to_10',
    label: 'Division Facts', subLabel: 'division facts', themeEmoji: '➗',
    x: 1200, y: 360, size: 60, zone: 'math' },
  { code: 'mm_missing_number', kind: 'skill', skillCode: 'math.divide.unknown_factor',
    label: 'Missing Number', subLabel: 'find the factor', themeEmoji: '🧩',
    x: 1320, y: 380, size: 60, zone: 'math' },

  // ─── Measurement Meadow (two staggered rows in center) ──────────
  // Time pieces upper row at y:540, fractions/money lower at y:620.
  // Even & Odd is the bridge between the two — sits at lower row.
  { code: 'mm_even_odd', kind: 'skill', skillCode: 'math.even_odd.recognize',
    label: 'Even & Odd Stones', subLabel: 'even or odd?', themeEmoji: '🪨',
    x: 700, y: 620, size: 56, zone: 'math' },
  { code: 'mm_garden_clock', kind: 'skill', skillCode: 'math.time.read_hour_half',
    label: 'Garden Clock', subLabel: 'hour & half', themeEmoji: '🕐',
    x: 660, y: 540, size: 60, zone: 'math' },
  { code: 'mm_sundial', kind: 'skill', skillCode: 'math.time.read_to_5_min',
    label: 'Sundial', subLabel: 'to 5 minutes', themeEmoji: '🕰️',
    x: 760, y: 540, size: 60, zone: 'math' },
  { code: 'mm_hourglass', kind: 'skill', skillCode: 'math.time.elapsed_intervals',
    label: 'Hourglass', subLabel: 'time passed', themeEmoji: '⌛',
    x: 860, y: 540, size: 60, zone: 'math' },
  { code: 'mm_pebble_coins', kind: 'skill', skillCode: 'math.money.coin_count',
    label: 'Pebble Coins', subLabel: 'count coins', themeEmoji: '🪙',
    x: 800, y: 620, size: 60, zone: 'math' },
  { code: 'mm_pie_slices', kind: 'skill', skillCode: 'math.fractions.identify',
    label: 'Pie Slices', subLabel: 'name the fraction', themeEmoji: '🥧',
    x: 900, y: 620, size: 60, zone: 'math' },
  { code: 'mm_bigger_slice', kind: 'skill', skillCode: 'math.fractions.compare_visual',
    label: 'Bigger Slice', subLabel: 'which is bigger?', themeEmoji: '🍰',
    x: 990, y: 620, size: 60, zone: 'math' },

  // ─── Word Stories Cottage (top-left, cottage SVG anchors them) ──
  { code: 'mm_stories_plus', kind: 'skill', skillCode: 'math.word_problem.add_within_20',
    label: 'Garden Stories +', subLabel: 'add in a story', themeEmoji: '📖',
    x: 80, y: 460, size: 56, zone: 'math' },
  { code: 'mm_stories_minus', kind: 'skill', skillCode: 'math.word_problem.subtract_within_20',
    label: 'Garden Stories −', subLabel: 'subtract in a story', themeEmoji: '📖',
    x: 80, y: 510, size: 56, zone: 'math' },
  { code: 'mm_long_stories', kind: 'skill', skillCode: 'math.word_problem.two_step',
    label: 'Long Stories', subLabel: 'two-step', themeEmoji: '📜',
    x: 175, y: 470, size: 56, zone: 'math' },
];

export const MATH_MOUNTAIN_CLUSTERS: BranchCluster[] = [
  { code: 'operations_hollow', label: 'Operations Hollow',
    structureCodes: [
      'mm_butterfly_make10', 'mm_fast_facts', 'mm_hundreds_hollow',
      'mm_regroup_ridge', 'mm_big_bridge', 'mm_leaf_drops', 'mm_berry_basket',
      'mm_quiet_pond', 'mm_rushing_stream', 'mm_big_falls', 'mm_twin_bonds',
    ] },
  { code: 'place_value_heights', label: 'Place-Value Heights',
    structureCodes: [
      'mm_tens_tower', 'mm_three_digit_tower', 'mm_compare_trees',
      'mm_mountain_compare', 'mm_ten_more_less', 'mm_round_10', 'mm_round_100',
    ] },
  { code: 'multiplication_orchard', label: 'Multiplication Orchard',
    structureCodes: [
      'mm_equal_garden', 'mm_array_orchard', 'mm_skip_bridge',
      'mm_times_to_5', 'mm_times_to_10',
    ] },
  { code: 'division_glen', label: 'Division Glen',
    structureCodes: ['mm_sharing_squirrels', 'mm_division_facts', 'mm_missing_number'] },
  { code: 'measurement_meadow', label: 'Measurement Meadow',
    structureCodes: [
      'mm_even_odd', 'mm_garden_clock', 'mm_sundial', 'mm_hourglass',
      'mm_pebble_coins', 'mm_pie_slices', 'mm_bigger_slice',
    ] },
  { code: 'word_stories_cottage', label: 'Word Stories Cottage',
    structureCodes: ['mm_stories_plus', 'mm_stories_minus', 'mm_long_stories'] },
];

// ─── READING FOREST ─────────────────────────────────────────────────

export const READING_FOREST_STRUCTURES: MapStructure[] = [
  // ─── Sight Word Glade (NW) ──────────────────────────────────────
  // All three structures now placed within the glade clearing (x:80-370, y:360-510)
  // so they read as a coherent cluster. Previously rf_dolch_second and rf_dolch_third
  // were at y:700-740, stranded far south of the glade.
  { code: 'rf_dolch_first', kind: 'skill', skillCode: 'reading.sight_words.dolch_first_grade',
    label: 'Bee Words', subLabel: 'Dolch 1st grade', themeEmoji: '🌼',
    x: 140, y: 400, size: 64, zone: 'reading' },
  { code: 'rf_dolch_second', kind: 'skill', skillCode: 'reading.sight_words.dolch_second_grade',
    label: 'Petal Words', subLabel: 'Dolch 2nd grade', themeEmoji: '🌸',
    x: 240, y: 440, size: 60, zone: 'reading' },
  { code: 'rf_dolch_third', kind: 'skill', skillCode: 'reading.sight_words.dolch_third_grade',
    label: 'Wildflower Words', subLabel: 'Dolch 3rd grade', themeEmoji: '🌷',
    x: 160, y: 490, size: 60, zone: 'reading' },

  // ─── Phonics Path (winding through center) ──────────────────────
  { code: 'rf_digraphs', kind: 'skill', skillCode: 'reading.phonics.digraphs',
    label: 'Digraph Bridge', subLabel: 'ch · sh · th', themeEmoji: '🌉',
    x: 480, y: 360, size: 60, zone: 'reading' },
  { code: 'rf_initial_blends', kind: 'skill', skillCode: 'reading.phonics.initial_blends',
    label: 'Blending Bend', subLabel: 'consonant blends', themeEmoji: '🔗',
    x: 580, y: 280, size: 60, zone: 'reading' },
  { code: 'rf_silent_e', kind: 'skill', skillCode: 'reading.phonics.silent_e',
    label: 'Silent-e Spring', subLabel: 'magic-e', themeEmoji: '✨',
    x: 700, y: 220, size: 60, zone: 'reading' },
  { code: 'rf_vowel_ee_ea', kind: 'skill', skillCode: 'reading.phonics.vowel_teams_ee_ea',
    label: 'Ee/Ea Glade', subLabel: 'long e teams', themeEmoji: '🌿',
    x: 800, y: 260, size: 60, zone: 'reading' },
  { code: 'rf_vowel_ai_ay', kind: 'skill', skillCode: 'reading.phonics.vowel_teams_ai_ay',
    label: 'Ai/Ay Hollow', subLabel: 'long a teams', themeEmoji: '🌿',
    x: 900, y: 220, size: 60, zone: 'reading' },
  { code: 'rf_vowel_oa_ow', kind: 'skill', skillCode: 'reading.phonics.vowel_teams_oa_ow',
    label: 'Oa/Ow Path', subLabel: 'long o teams', themeEmoji: '🌿',
    x: 1000, y: 260, size: 60, zone: 'reading' },
  { code: 'rf_r_controlled', kind: 'skill', skillCode: 'reading.phonics.r_controlled',
    label: 'R-Controlled Ridge', subLabel: 'ar/er/ir/or/ur', themeEmoji: '🐎',
    x: 1100, y: 220, size: 60, zone: 'reading' },
  { code: 'rf_diphthongs', kind: 'skill', skillCode: 'reading.phonics.diphthongs',
    label: 'Diphthong Cove', subLabel: 'oi/oy, ou/ow', themeEmoji: '🐚',
    x: 1200, y: 260, size: 60, zone: 'reading' },

  // ─── Morphology Grove (NE around the old oak) ───────────────────
  { code: 'rf_ed_ing', kind: 'skill', skillCode: 'reading.morphology.inflectional_ed_ing',
    label: 'Word Endings', subLabel: '-ed / -ing', themeEmoji: '🍃',
    x: 1140, y: 460, size: 60, zone: 'reading' },
  { code: 'rf_plurals', kind: 'skill', skillCode: 'reading.morphology.plural_s_es',
    label: 'Plurals Patch', subLabel: '-s / -es', themeEmoji: '🌱',
    x: 1280, y: 480, size: 60, zone: 'reading' },
  { code: 'rf_compounds', kind: 'skill', skillCode: 'reading.morphology.compound_words',
    label: 'Compound Nests', subLabel: 'compound words', themeEmoji: '🪺',
    x: 1100, y: 540, size: 60, zone: 'reading' },
  { code: 'rf_prefixes', kind: 'skill', skillCode: 'reading.morphology.prefix_un_re',
    label: 'Prefix Acorns', subLabel: 'un- / re-', themeEmoji: '🌰',
    x: 1240, y: 580, size: 60, zone: 'reading' },

  // ─── Story Rocks (center back clearing) ─────────────────────────
  { code: 'rf_longer_words', kind: 'skill', skillCode: 'reading.read_aloud.longer_words',
    label: 'Long-Word Boulder', subLabel: 'multi-syllable read', themeEmoji: '📚',
    x: 660, y: 620, size: 60, zone: 'reading' },
  { code: 'rf_sentence', kind: 'skill', skillCode: 'reading.comprehension.short_sentence',
    label: 'Sentence Stones', subLabel: 'read & answer', themeEmoji: '📜',
    x: 800, y: 660, size: 60, zone: 'reading' },
  { code: 'rf_paragraph', kind: 'skill', skillCode: 'reading.comprehension.paragraph',
    label: 'Paragraph Pavers', subLabel: 'longer reading', themeEmoji: '📰',
    x: 740, y: 720, size: 60, zone: 'reading' },
];

export const READING_FOREST_CLUSTERS: BranchCluster[] = [
  { code: 'sight_word_glade', label: 'Sight Word Glade',
    structureCodes: ['rf_dolch_first', 'rf_dolch_second', 'rf_dolch_third'] },
  { code: 'phonics_path', label: 'Phonics Path',
    structureCodes: [
      'rf_digraphs', 'rf_initial_blends', 'rf_silent_e',
      'rf_vowel_ee_ea', 'rf_vowel_ai_ay', 'rf_vowel_oa_ow',
      'rf_r_controlled', 'rf_diphthongs',
    ] },
  { code: 'morphology_grove', label: 'Morphology Grove',
    structureCodes: ['rf_ed_ing', 'rf_plurals', 'rf_compounds', 'rf_prefixes'] },
  { code: 'story_rocks', label: 'Story Rocks',
    structureCodes: ['rf_longer_words', 'rf_sentence', 'rf_paragraph'] },
];
