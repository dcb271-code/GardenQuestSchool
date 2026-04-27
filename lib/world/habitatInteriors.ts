// lib/world/habitatInteriors.ts
//
// Which habitats have built interiors, and what themed skill each one
// hosts inside. Only bunny_burrow is mapped in the first push (§14 of
// the design spec); the other five habitat interiors are Phase 2.
//
// `themedSkillCode` is the skill that the interior's central glowing
// structure starts a session on. It does NOT add new content — it
// reuses an existing skill code and just dresses it in the habitat's
// theme.

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
};

export function hasHabitatInterior(habitatCode: string): boolean {
  return habitatCode in HABITAT_INTERIORS;
}
