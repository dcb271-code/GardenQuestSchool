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
  /**
   * The stop grows with the child — same mechanism as the garden
   * map's levelUpgrade. Cecily's "flower in the meadow is too easy"
   * letter turned out to point HERE: the interiors carried Level-1
   * skills forever, and a Level-3 child was being paid full session
   * rates for counting to 50. At minLevel+ the glowing stop serves
   * the harder sibling instead.
   */
  levelUpgrade?: { minLevel: number; skillCode: string; structureLabel: string };
}

/** The interior's skill for THIS child. Everything that reads a
 *  themed skill goes through here. */
export function resolveInteriorSkill(
  cfg: HabitatInteriorConfig, learnerLevel: number,
): { themedSkillCode: string; themedStructureLabel: string } {
  if (cfg.levelUpgrade && learnerLevel >= cfg.levelUpgrade.minLevel) {
    return {
      themedSkillCode: cfg.levelUpgrade.skillCode,
      themedStructureLabel: cfg.levelUpgrade.structureLabel,
    };
  }
  return {
    themedSkillCode: cfg.themedSkillCode,
    themedStructureLabel: cfg.themedStructureLabel,
  };
}

export const HABITAT_INTERIORS: Record<string, HabitatInteriorConfig> = {
  bunny_burrow: {
    themedSkillCode: 'math.subtract.within_10',
    themedStructureLabel: 'Petal Counting',
    themedStructureEmoji: '🌺',
  
    levelUpgrade: { minLevel: 3, skillCode: 'math.subtract.within_100.with_regrouping',
                    structureLabel: 'Petal Counting (big numbers)' },
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
  
    levelUpgrade: { minLevel: 3, skillCode: 'math.add.fluency_within_20',
                    structureLabel: 'Lily Pad Sprints' },
  },
  ant_hill: {
    themedSkillCode: 'math.counting.to_50',
    themedStructureLabel: 'Counting the Colony',
    themedStructureEmoji: '🐜',
  
    levelUpgrade: { minLevel: 3, skillCode: 'math.multiply.skip_count_bridge',
                    structureLabel: 'Counting the Colony in Groups' },
  },
  bee_hotel: {
    themedSkillCode: 'math.number_bond.within_10',
    themedStructureLabel: 'Cells and Bonds',
    themedStructureEmoji: '🍯',
  
    levelUpgrade: { minLevel: 3, skillCode: 'math.number_bond.within_20',
                    structureLabel: 'Cells and Bonds to 20' },
  },
  butterfly_bush: {
    themedSkillCode: 'math.add.within_20.crossing_ten',
    themedStructureLabel: 'Nectar Counting',
    themedStructureEmoji: '🌸',
  
    levelUpgrade: { minLevel: 3, skillCode: 'math.add.within_100.with_regrouping',
                    structureLabel: 'Nectar by the Hundred' },
  },
  log_pile: {
    themedSkillCode: 'math.counting.skip_2s',
    themedStructureLabel: 'Beetle Pairs',
    themedStructureEmoji: '🪲',
  
    levelUpgrade: { minLevel: 3, skillCode: 'math.multiply.facts_to_5',
                    structureLabel: 'Twos, Fives and Tens' },
  },
  bird_feeder: {
    // Equal groups is the feeder's own maths: four perches with three
    // birds each is a multiplication problem she can watch happen.
    themedSkillCode: 'math.multiply.equal_groups',
    themedStructureLabel: 'Counting the Queue',
    themedStructureEmoji: '🌻',
  },
  owl_box: {
    // The Reading Forest's habitat, so its stop is a reading stop.
    themedSkillCode: 'reading.comprehension.paragraph',
    themedStructureLabel: 'The Night Log',
    themedStructureEmoji: '📖',
  },
  crystal_cavern: {
    // The money maths Cecily asked for: a price times a count is
    // exactly multiplication facts, which is also what opens the
    // cavern in the first place.
    themedSkillCode: 'math.multiply.facts_to_10',
    themedStructureLabel: 'The Price Board',
    themedStructureEmoji: '🪙',
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
