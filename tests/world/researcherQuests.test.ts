// tests/world/researcherQuests.test.ts
import { describe, it, expect } from 'vitest';
import { RESEARCHER_QUESTS, getResearcherQuest, RESEARCHER_MIN_LEVEL } from '@/lib/world/researcherQuests';
import { HABITAT_QUESTS, HABITAT_QUESTIONS_L3, getHabitatQuest, QUEST_L3_MIN_LEVEL } from '@/lib/world/habitatQuests';
import { HABITAT_CATALOG } from '@/lib/world/habitatCatalog';

describe('RESEARCHER_QUESTS', () => {
  it('every researcher quest belongs to a real habitat', () => {
    const habitatCodes = new Set(HABITAT_CATALOG.map(h => h.code));
    for (const [code, quest] of Object.entries(RESEARCHER_QUESTS)) {
      expect(habitatCodes.has(code), code).toBe(true);
      expect(quest.habitatCode).toBe(code);
    }
  });

  it('every ecology habitat with a build quest also has a researcher quest', () => {
    for (const code of Object.keys(HABITAT_QUESTS)) {
      expect(RESEARCHER_QUESTS[code], `missing researcher quest for ${code}`).toBeDefined();
    }
  });

  it('quests are well-formed: 3 questions, 4 choices, correct at index 0, gem line present', () => {
    for (const quest of Object.values(RESEARCHER_QUESTS)) {
      expect(quest.questions).toHaveLength(3);
      expect(quest.gemLine.length).toBeGreaterThan(10);
      for (const q of quest.questions) {
        expect(q.choices).toHaveLength(4);
        expect(q.correctIndex).toBe(0);
      }
    }
  });

  it('getResearcherQuest round-trips and misses unknown codes', () => {
    expect(getResearcherQuest('frog_pond')?.habitatCode).toBe('frog_pond');
    expect(getResearcherQuest('operations_cave')).toBeUndefined();
    expect(getResearcherQuest('nope')).toBeUndefined();
  });

  it('minimum level is 3', () => {
    expect(RESEARCHER_MIN_LEVEL).toBe(3);
  });
});

describe('level-banded habitat quests', () => {
  it('every L3 question set belongs to a quest and is well-formed', () => {
    for (const [code, questions] of Object.entries(HABITAT_QUESTIONS_L3)) {
      expect(HABITAT_QUESTS[code], code).toBeDefined();
      expect(questions).toHaveLength(3);
      for (const q of questions) {
        expect(q.choices).toHaveLength(4);
        expect(q.correctIndex).toBe(0);
      }
    }
  });

  it('every base quest has an L3 tier', () => {
    for (const code of Object.keys(HABITAT_QUESTS)) {
      expect(HABITAT_QUESTIONS_L3[code], `missing L3 tier for ${code}`).toBeDefined();
    }
  });

  it('getHabitatQuest serves base questions below level 3 and the L3 tier at level 3+', () => {
    const base = getHabitatQuest('frog_pond', 2);
    const hard = getHabitatQuest('frog_pond', 3);
    expect(base?.questions).toBe(HABITAT_QUESTS.frog_pond.questions);
    expect(hard?.questions).toBe(HABITAT_QUESTIONS_L3.frog_pond);
    // intro/outro unchanged between tiers
    expect(hard?.intro).toBe(base?.intro);
    // default (no level passed) stays the gentle tier
    expect(getHabitatQuest('frog_pond')?.questions).toBe(HABITAT_QUESTS.frog_pond.questions);
    expect(QUEST_L3_MIN_LEVEL).toBe(3);
  });

  it('L3 tier is genuinely different content from the base tier', () => {
    for (const code of Object.keys(HABITAT_QUESTIONS_L3)) {
      const basePrompts = new Set(HABITAT_QUESTS[code].questions.map(q => q.prompt));
      for (const q of HABITAT_QUESTIONS_L3[code]) {
        expect(basePrompts.has(q.prompt), `${code}: duplicated prompt`).toBe(false);
      }
    }
  });

  it('researcher questions never duplicate the L3 build-quest questions', () => {
    for (const code of Object.keys(RESEARCHER_QUESTS)) {
      const l3Prompts = new Set((HABITAT_QUESTIONS_L3[code] ?? []).map(q => q.prompt));
      for (const q of RESEARCHER_QUESTS[code].questions) {
        expect(l3Prompts.has(q.prompt), `${code}: duplicated prompt`).toBe(false);
      }
    }
  });
});
