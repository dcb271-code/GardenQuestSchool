// lib/world/dichotomousKey.ts
//
// Shared dichotomous decision tree for the Naturalist Grove module.
// Every Phase 1 pilot species is a leaf of this tree. The walk-builder
// (lib/naturalist/walkBuilder.ts) traverses from root to a target
// species, producing the canonical key path shown to the learner.
//
// Each internal node carries a yes/no question + a comparison photo
// pair. Photo references are (flora_code, photoRole) pairs that the
// API resolves to real Supabase Storage URLs at request time.
//
// Design spec: docs/superpowers/specs/2026-05-29-naturalist-grove-design.md §5

import type { PhotoRole } from './floraCatalog';

export const ROOT_NODE_ID = 'root';

export interface KeyPhotoRef {
  floraCode: string;       // references FLORA_CATALOG[].code
  role: PhotoRole;
}

export interface KeySpeciesLeaf {
  species: string;         // flora_code
}

export type KeyChild = string | KeySpeciesLeaf;

export interface KeyNode {
  id: string;
  question: string;
  leftLabel: string;
  rightLabel: string;
  leftPhoto: KeyPhotoRef;
  rightPhoto: KeyPhotoRef;
  leftChild: KeyChild;
  rightChild: KeyChild;
}

export function isSpeciesLeaf(child: KeyChild): child is KeySpeciesLeaf {
  return typeof child === 'object' && 'species' in child;
}

export const DICHOTOMOUS_KEY: Record<string, KeyNode> = {
  // ── ROOT ─────────────────────────────────────────────────────────
  root: {
    id: 'root',
    question: 'Look at the leaves. Are they...',
    leftLabel: 'long thin needles?',
    rightLabel: 'broad flat leaves?',
    leftPhoto: { floraCode: 'eastern_white_pine', role: 'leaf' },
    rightPhoto: { floraCode: 'tulip_poplar', role: 'leaf' },
    leftChild: { species: 'eastern_white_pine' },
    rightChild: 'leaf_compound',
  },

  // ── COUNT THE LEAFLETS FIRST ─────────────────────────────────────
  // The leaflet count sits directly under the root, ahead of
  // tree-vs-wildflower, for two reasons:
  //   1. Safety. "Leaves of three, let it be" is the one thing in this
  //      key that can save a child a week of itching. A hazard check
  //      does not belong four questions deep behind "is it woody?".
  //   2. It is real botany. Compound-vs-simple is a standard early
  //      split in field keys — and it is the ONLY split that works
  //      here, because poison ivy and Virginia creeper are vines and
  //      answer "tall woody tree?" / "low soft wildflower?" equally
  //      badly.
  // Cost: one extra question for simple-leaved species. dedupeWalkSteps
  // means only the first species of a walk actually pays it.
  leaf_compound: {
    id: 'leaf_compound',
    question: 'Look at ONE leaf. Is it...',
    leftLabel: 'made of several small leaflets?',
    rightLabel: 'one single leaf?',
    leftPhoto: { floraCode: 'shagbark_hickory', role: 'leaf' },
    rightPhoto: { floraCode: 'flowering_dogwood', role: 'leaf' },
    leftChild: 'compound_count',
    rightChild: 'tree_or_flower',
  },

  compound_count: {
    id: 'compound_count',
    question: 'Count the leaflets. Are there...',
    leftLabel: 'exactly three?',
    rightLabel: 'more than three?',
    leftPhoto: { floraCode: 'poison_ivy', role: 'leaf' },
    rightPhoto: { floraCode: 'virginia_creeper', role: 'leaf' },
    leftChild: 'three_leaflet_ground',
    rightChild: 'many_leaflet_group',
  },

  // Jack-in-the-pulpit splits off FIRST: it has leaves of three like
  // poison ivy, but it rises on one soft stalk straight from the
  // forest floor — it never climbs and never forms a bush. Teaching
  // the difference deepens the safety lesson instead of muddying it.
  three_leaflet_ground: {
    id: 'three_leaflet_ground',
    question: 'How does the plant grow?',
    leftLabel: 'climbing a tree, or as a bush?',
    rightLabel: 'one soft stalk straight from the forest floor?',
    leftPhoto: { floraCode: 'poison_ivy', role: 'whole' },
    rightPhoto: { floraCode: 'jack_in_the_pulpit', role: 'whole' },
    leftChild: 'three_leaflet_stalk',
    rightChild: { species: 'jack_in_the_pulpit' },
  },

  // Virginia creeper (5) vs shagbark hickory (5-7) — both "five-ish",
  // so counting cannot separate them. The real mark is palmate (all
  // leaflets from one point) vs pinnate (leaflets along a stem).
  many_leaflet_group: {
    id: 'many_leaflet_group',
    question: 'Look at how the leaflets are joined. Do they...',
    leftLabel: 'spread from one point, like fingers on a hand?',
    rightLabel: 'grow in a row along a stem?',
    leftPhoto: { floraCode: 'virginia_creeper', role: 'leaf' },
    rightPhoto: { floraCode: 'shagbark_hickory', role: 'leaf' },
    leftChild: { species: 'virginia_creeper' },
    rightChild: { species: 'shagbark_hickory' },
  },

  // ── THE THREE-LEAFLET GROUP ──────────────────────────────────────
  // Everything below here is either poison ivy or something that gets
  // mistaken for it. Fragrant sumac splits off on the middle-leaflet
  // stalk; box elder splits off on opposite-vs-alternate leaves.
  three_leaflet_stalk: {
    id: 'three_leaflet_stalk',
    question: 'Look at the middle leaflet. Does it...',
    leftLabel: 'sit on its own little stalk?',
    rightLabel: 'sit right against the stem, with no stalk?',
    leftPhoto: { floraCode: 'poison_ivy', role: 'leaf' },
    rightPhoto: { floraCode: 'fragrant_sumac', role: 'leaf' },
    leftChild: 'three_leaflet_pairs',
    rightChild: { species: 'fragrant_sumac' },
  },

  three_leaflet_pairs: {
    id: 'three_leaflet_pairs',
    question: 'Look at where the leaves join the stem. Do they...',
    leftLabel: 'grow in pairs, straight across from each other?',
    rightLabel: 'take turns, one at a time up the stem?',
    leftPhoto: { floraCode: 'box_elder', role: 'leaf' },
    rightPhoto: { floraCode: 'poison_ivy', role: 'leaf' },
    leftChild: { species: 'box_elder' },
    rightChild: { species: 'poison_ivy' },
  },

  // ── BROADLEAF, SIMPLE: tree or wildflower? ───────────────────────
  tree_or_flower: {
    id: 'tree_or_flower',
    question: 'Is the plant...',
    leftLabel: 'tall and woody (a tree)?',
    rightLabel: 'low and soft (a wildflower)?',
    leftPhoto: { floraCode: 'tulip_poplar', role: 'whole' },
    rightPhoto: { floraCode: 'cardinal_flower', role: 'whole' },
    leftChild: 'tree_heart_shape',
    rightChild: 'flower_red',
  },

  // ── TREE BRANCH ──────────────────────────────────────────────────
  tree_heart_shape: {
    id: 'tree_heart_shape',
    question: 'Is the leaf shape...',
    leftLabel: 'heart-shaped?',
    rightLabel: 'a different shape?',
    leftPhoto: { floraCode: 'eastern_redbud', role: 'leaf' },
    rightPhoto: { floraCode: 'tulip_poplar', role: 'leaf' },
    leftChild: { species: 'eastern_redbud' },
    rightChild: 'tree_lobes',
  },

  // Lobed vs smooth-edged is the big honest split for the tree crowd.
  tree_lobes: {
    id: 'tree_lobes',
    question: 'Look at the leaf edge. Does it have...',
    leftLabel: 'lobes — fingers or points sticking out?',
    rightLabel: 'a smooth edge with no lobes?',
    leftPhoto: { floraCode: 'white_oak', role: 'leaf' },
    rightPhoto: { floraCode: 'flowering_dogwood', role: 'leaf' },
    leftChild: 'tree_star',
    rightChild: 'tree_droopy',
  },

  tree_star: {
    id: 'tree_star',
    question: 'Is the leaf...',
    leftLabel: 'a five-pointed star?',
    rightLabel: 'a different lobed shape?',
    leftPhoto: { floraCode: 'sweetgum', role: 'leaf' },
    rightPhoto: { floraCode: 'tulip_poplar', role: 'leaf' },
    leftChild: { species: 'sweetgum' },
    rightChild: 'tree_camo',
  },

  // Sycamore is keyed by its unmissable bark, not its maple-ish leaf.
  tree_camo: {
    id: 'tree_camo',
    question: 'Look at the trunk. Is the bark...',
    leftLabel: 'patchy camouflage, white up high?',
    rightLabel: 'plain grey or brown?',
    leftPhoto: { floraCode: 'american_sycamore', role: 'bark' },
    rightPhoto: { floraCode: 'white_oak', role: 'bark' },
    leftChild: { species: 'american_sycamore' },
    rightChild: 'tree_round_lobes',
  },

  tree_round_lobes: {
    id: 'tree_round_lobes',
    question: 'Look at the lobe tips. Are they...',
    leftLabel: 'round, like fingertips?',
    rightLabel: 'pointy?',
    leftPhoto: { floraCode: 'white_oak', role: 'leaf' },
    rightPhoto: { floraCode: 'red_maple', role: 'leaf' },
    leftChild: { species: 'white_oak' },
    rightChild: 'tree_pairs',
  },

  tree_pairs: {
    id: 'tree_pairs',
    question: 'Look at how leaves join the twig. Do they grow...',
    leftLabel: 'in pairs, straight across from each other?',
    rightLabel: 'one at a time, taking turns?',
    leftPhoto: { floraCode: 'red_maple', role: 'leaf' },
    rightPhoto: { floraCode: 'tulip_poplar', role: 'leaf' },
    leftChild: { species: 'red_maple' },
    rightChild: { species: 'tulip_poplar' },
  },

  tree_droopy: {
    id: 'tree_droopy',
    question: 'Are the leaves...',
    leftLabel: 'huge and droopy, biggest at the branch tip?',
    rightLabel: 'medium ovals with curving veins?',
    leftPhoto: { floraCode: 'pawpaw', role: 'leaf' },
    rightPhoto: { floraCode: 'flowering_dogwood', role: 'leaf' },
    leftChild: { species: 'pawpaw' },
    rightChild: { species: 'flowering_dogwood' },
  },

  // ── WILDFLOWER BRANCH ────────────────────────────────────────────
  flower_red: {
    id: 'flower_red',
    question: 'Are the flowers...',
    leftLabel: 'bright scarlet red?',
    rightLabel: 'a different color?',
    leftPhoto: { floraCode: 'cardinal_flower', role: 'flower' },
    rightPhoto: { floraCode: 'virginia_bluebells', role: 'flower' },
    leftChild: { species: 'cardinal_flower' },
    rightChild: 'flower_water',
  },

  flower_water: {
    id: 'flower_water',
    question: 'Is the plant...',
    leftLabel: 'standing in water, with a brown corn-dog head?',
    rightLabel: 'growing on dry land?',
    leftPhoto: { floraCode: 'cattail', role: 'whole' },
    rightPhoto: { floraCode: 'black_eyed_susan', role: 'whole' },
    leftChild: { species: 'cattail' },
    rightChild: 'flower_orange',
  },

  flower_orange: {
    id: 'flower_orange',
    question: 'Are the flowers...',
    leftLabel: 'orange trumpets with red freckles, hanging like earrings?',
    rightLabel: 'a different color?',
    leftPhoto: { floraCode: 'jewelweed', role: 'flower' },
    rightPhoto: { floraCode: 'virginia_bluebells', role: 'flower' },
    leftChild: { species: 'jewelweed' },
    rightChild: 'flower_blue',
  },

  flower_blue: {
    id: 'flower_blue',
    question: 'Are the flowers...',
    leftLabel: 'blue?',
    rightLabel: 'a different color?',
    leftPhoto: { floraCode: 'chicory', role: 'flower' },
    rightPhoto: { floraCode: 'trillium', role: 'flower' },
    leftChild: 'flower_blue_which',
    rightChild: 'flower_yellow',
  },

  flower_blue_which: {
    id: 'flower_blue_which',
    question: 'Look at the blue flowers. Are they...',
    leftLabel: 'droopy clusters of little trumpet bells?',
    rightLabel: 'flat and fringed, on tough roadside stems?',
    leftPhoto: { floraCode: 'virginia_bluebells', role: 'flower' },
    rightPhoto: { floraCode: 'chicory', role: 'flower' },
    leftChild: { species: 'virginia_bluebells' },
    rightChild: { species: 'chicory' },
  },

  flower_yellow: {
    id: 'flower_yellow',
    question: 'Are the flowers...',
    leftLabel: 'yellow or gold?',
    rightLabel: 'a different color?',
    leftPhoto: { floraCode: 'black_eyed_susan', role: 'flower' },
    rightPhoto: { floraCode: 'trillium', role: 'flower' },
    leftChild: 'flower_yellow_which',
    rightChild: 'flower_three_petals',
  },

  flower_yellow_which: {
    id: 'flower_yellow_which',
    question: 'Look at the yellow flower. Is it...',
    leftLabel: 'ONE flower on a hollow milky stem?',
    rightLabel: 'many flowers together?',
    leftPhoto: { floraCode: 'dandelion', role: 'flower' },
    rightPhoto: { floraCode: 'tall_goldenrod', role: 'flower' },
    leftChild: { species: 'dandelion' },
    rightChild: 'flower_yellow_dome',
  },

  flower_yellow_dome: {
    id: 'flower_yellow_dome',
    question: 'Do the flowers have...',
    leftLabel: 'golden petals around a dark brown dome?',
    rightLabel: 'a golden plume of tiny flowers, like a firework?',
    leftPhoto: { floraCode: 'black_eyed_susan', role: 'flower' },
    rightPhoto: { floraCode: 'tall_goldenrod', role: 'flower' },
    leftChild: { species: 'black_eyed_susan' },
    rightChild: { species: 'tall_goldenrod' },
  },

  flower_three_petals: {
    id: 'flower_three_petals',
    question: 'How many petals on the flower?',
    leftLabel: 'three large white petals?',
    rightLabel: 'a different shape?',
    leftPhoto: { floraCode: 'trillium', role: 'flower' },
    rightPhoto: { floraCode: 'mayapple', role: 'whole' },
    leftChild: { species: 'trillium' },
    rightChild: 'flower_umbrella',
  },

  flower_umbrella: {
    id: 'flower_umbrella',
    question: 'Does the plant have...',
    leftLabel: 'a giant umbrella leaf hiding the flower?',
    rightLabel: 'a pink ball-cluster of many tiny flowers?',
    leftPhoto: { floraCode: 'mayapple', role: 'whole' },
    rightPhoto: { floraCode: 'common_milkweed', role: 'flower' },
    leftChild: { species: 'mayapple' },
    rightChild: { species: 'common_milkweed' },
  },
};
