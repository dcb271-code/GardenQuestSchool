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
    leftChild: 'three_leaflet_stalk',
    rightChild: 'many_leaflet_group',
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
    rightChild: 'tree_lobed_or_oval',
  },

  tree_lobed_or_oval: {
    id: 'tree_lobed_or_oval',
    question: 'Look at the leaf edge. Is it...',
    leftLabel: 'a tulip shape with four lobes?',
    rightLabel: 'a smooth oval with no lobes?',
    leftPhoto: { floraCode: 'tulip_poplar', role: 'leaf' },
    rightPhoto: { floraCode: 'flowering_dogwood', role: 'leaf' },
    leftChild: { species: 'tulip_poplar' },
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
    rightChild: 'flower_blue',
  },

  flower_blue: {
    id: 'flower_blue',
    question: 'Are the flowers...',
    leftLabel: 'sky-blue trumpets?',
    rightLabel: 'a different color?',
    leftPhoto: { floraCode: 'virginia_bluebells', role: 'flower' },
    rightPhoto: { floraCode: 'trillium', role: 'flower' },
    leftChild: { species: 'virginia_bluebells' },
    rightChild: 'flower_three_petals',
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
