// lib/world/habitatInteriors.ts
//
// Which habitats have built interiors, and what themed skill each one
// hosts inside.
//
// `themedSkillCode` is the skill that the interior's central glowing
// structure starts a session on. It does NOT add new content — it
// reuses an existing skill code and just dresses it in the habitat's
// theme. (For multi-skill interiors like Operations Cave, the field
// records the *primary* skill; the interior component is free to
// also render the other skills it hosts.)

export interface HabitatInteriorConfig {
  themedSkillCode: string;
  themedStructureLabel: string;  // displayed under the glowing pin in the interior
  themedStructureEmoji: string;
}

export const HABITAT_INTERIORS: Record<string, HabitatInteriorConfig> = {
  bunny_burrow: {
    themedSkillCode: 'math.subtract.within_10',
    themedStructureLabel: 'Petal Counting',
    themedStructureEmoji: '🌺',
  },
  // Math Mountain side-habitat — the cave at the foot of the mountain.
  // The interior hosts three regrouping/operations skill structures
  // (Hundred's Hollow, Fast Facts, Regroup Ridge) plus a sleepy bear.
  // The "themed" skill below is just the primary one; CaveInterior
  // resolves all three from MATH_MOUNTAIN_STRUCTURES at render time.
  // The pond and the log pile — added so the four "step inside"
  // habitats aren't a dead end, and so the rare visitors gated behind
  // researcher badges (painted turtle, spotted salamander) have
  // somewhere to actually be.
  frog_pond: {
    themedSkillCode: 'math.add.within_20.no_crossing',
    themedStructureLabel: 'Lily Pad Counting',
    themedStructureEmoji: '🪷',
  },
  ant_hill: {
    themedSkillCode: 'math.counting.to_50',
    themedStructureLabel: 'Counting the Colony',
    themedStructureEmoji: '🐜',
  },
  bee_hotel: {
    themedSkillCode: 'math.number_bond.within_10',
    themedStructureLabel: 'Cells and Bonds',
    themedStructureEmoji: '🍯',
  },
  butterfly_bush: {
    themedSkillCode: 'math.add.within_20.crossing_ten',
    themedStructureLabel: 'Nectar Counting',
    themedStructureEmoji: '🌸',
  },
  log_pile: {
    themedSkillCode: 'math.counting.skip_2s',
    themedStructureLabel: 'Beetle Pairs',
    themedStructureEmoji: '🪲',
  },
  bird_feeder: {
    // Equal groups is the feeder's own maths: four perches with three
    // birds each is a multiplication problem she can watch happen.
    themedSkillCode: 'math.multiply.equal_groups',
    themedStructureLabel: 'Counting the Queue',
    themedStructureEmoji: '🌻',
  },
  operations_cave: {
    themedSkillCode: 'math.add.within_100.no_regrouping',
    themedStructureLabel: "Hundred's Hollow",
    themedStructureEmoji: '🌳',
  },
};

export function hasHabitatInterior(habitatCode: string): boolean {
  return habitatCode in HABITAT_INTERIORS;
}
