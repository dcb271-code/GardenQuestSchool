import { describe, it, expect } from 'vitest';
import {
  MATH_MOUNTAIN_STRUCTURES,
  READING_FOREST_STRUCTURES,
  MATH_MOUNTAIN_CLUSTERS,
  READING_FOREST_CLUSTERS,
  BRANCH_MAP_WIDTH,
  BRANCH_MAP_HEIGHT,
} from '@/lib/world/branchMaps';
import { MATH_SKILLS } from '@/lib/packs/math/skills';
import { READING_SKILLS } from '@/lib/packs/reading/skills';

const allMathCodes = new Set(MATH_SKILLS.map(s => s.code));
const allReadingCodes = new Set(READING_SKILLS.map(s => s.code));

describe('branchMaps', () => {
  describe('Math Mountain', () => {
    it('every structure references a real math skill', () => {
      for (const s of MATH_MOUNTAIN_STRUCTURES) {
        expect(s.skillCode, `${s.code} must have a skillCode`).toBeTruthy();
        expect(
          allMathCodes.has(s.skillCode!),
          `${s.code} → ${s.skillCode} must be a real math skill`,
        ).toBe(true);
      }
    });

    it('every position is inside the branch map bounds', () => {
      for (const s of MATH_MOUNTAIN_STRUCTURES) {
        expect(s.x, `${s.code} x in bounds`).toBeGreaterThanOrEqual(0);
        expect(s.x, `${s.code} x in bounds`).toBeLessThanOrEqual(BRANCH_MAP_WIDTH);
        expect(s.y, `${s.code} y in bounds`).toBeGreaterThanOrEqual(0);
        expect(s.y, `${s.code} y in bounds`).toBeLessThanOrEqual(BRANCH_MAP_HEIGHT);
      }
    });

    it('structure codes are unique', () => {
      const codes = MATH_MOUNTAIN_STRUCTURES.map(s => s.code);
      expect(new Set(codes).size).toBe(codes.length);
    });

    it('every cluster is non-empty and references real structure codes', () => {
      const allCodes = new Set(MATH_MOUNTAIN_STRUCTURES.map(s => s.code));
      for (const cluster of MATH_MOUNTAIN_CLUSTERS) {
        expect(cluster.structureCodes.length).toBeGreaterThan(0);
        for (const code of cluster.structureCodes) {
          expect(allCodes.has(code), `cluster ${cluster.label} references unknown ${code}`).toBe(true);
        }
      }
    });

    it('does not duplicate any central-garden starter structure codes', () => {
      const starters = new Set([
        'math_counting_path', 'math_bee_swarm', 'math_petal_falls',
        'math_number_bonds', 'math_word_stories',
      ]);
      for (const s of MATH_MOUNTAIN_STRUCTURES) {
        expect(starters.has(s.code), `${s.code} must not duplicate a central-garden starter`).toBe(false);
      }
    });
  });

  describe('Reading Forest', () => {
    it('every structure references a real reading skill', () => {
      for (const s of READING_FOREST_STRUCTURES) {
        expect(s.skillCode, `${s.code} must have a skillCode`).toBeTruthy();
        expect(
          allReadingCodes.has(s.skillCode!),
          `${s.code} → ${s.skillCode} must be a real reading skill`,
        ).toBe(true);
      }
    });

    it('every position is inside the branch map bounds', () => {
      for (const s of READING_FOREST_STRUCTURES) {
        expect(s.x).toBeGreaterThanOrEqual(0);
        expect(s.x).toBeLessThanOrEqual(BRANCH_MAP_WIDTH);
        expect(s.y).toBeGreaterThanOrEqual(0);
        expect(s.y).toBeLessThanOrEqual(BRANCH_MAP_HEIGHT);
      }
    });

    it('structure codes are unique', () => {
      const codes = READING_FOREST_STRUCTURES.map(s => s.code);
      expect(new Set(codes).size).toBe(codes.length);
    });

    it('every cluster is non-empty and references real structure codes', () => {
      const allCodes = new Set(READING_FOREST_STRUCTURES.map(s => s.code));
      for (const cluster of READING_FOREST_CLUSTERS) {
        expect(cluster.structureCodes.length).toBeGreaterThan(0);
        for (const code of cluster.structureCodes) {
          expect(allCodes.has(code), `cluster ${cluster.label} references unknown ${code}`).toBe(true);
        }
      }
    });

    it('does not duplicate any central-garden starter structure codes', () => {
      const starters = new Set([
        'reading_book_stump', 'reading_blending_beach', 'reading_readaloud_log',
      ]);
      for (const s of READING_FOREST_STRUCTURES) {
        expect(starters.has(s.code)).toBe(false);
      }
    });
  });
});
