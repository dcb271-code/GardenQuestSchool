'use client';

// "This opens when you master…" — the actionable half of a locked
// stop. Resolves the lock's prerequisite chain to skills the child
// can play RIGHT NOW and offers them as one-tap practice buttons
// (or a signpost to the scene where they live).

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MATH_SKILLS } from '@/lib/packs/math/skills';
import { READING_SKILLS } from '@/lib/packs/reading/skills';
import { GARDEN_STRUCTURES } from '@/lib/world/gardenMap';
import { MATH_MOUNTAIN_STRUCTURES, READING_FOREST_STRUCTURES } from '@/lib/world/branchMaps';
import { actionablePrereqs, type HintSkill } from '@/lib/world/unlockHints';

const ALL_SKILLS: HintSkill[] = [...MATH_SKILLS, ...READING_SKILLS];
const SKILLS_BY_CODE = new Map(ALL_SKILLS.map(s => [s.code, s]));

export type SceneId = 'garden' | 'math_mountain' | 'reading_forest';

function locate(skillCode: string): { scene: SceneId; label: string } | null {
  const g = GARDEN_STRUCTURES.find(s => s.kind === 'skill' && s.skillCode === skillCode);
  if (g) return { scene: 'garden', label: g.label };
  const m = MATH_MOUNTAIN_STRUCTURES.find(s => s.skillCode === skillCode);
  if (m) return { scene: 'math_mountain', label: m.label };
  const r = READING_FOREST_STRUCTURES.find(s => s.skillCode === skillCode);
  if (r) return { scene: 'reading_forest', label: r.label };
  return null;
}

const SCENE_NAME: Record<SceneId, string> = {
  garden: 'in the garden',
  math_mountain: 'on Math Mountain',
  reading_forest: 'in Reading Forest',
};
const SCENE_HREF: Record<SceneId, (learnerId: string) => string> = {
  garden: id => `/garden?learner=${id}`,
  math_mountain: id => `/garden/math-mountain?learner=${id}`,
  reading_forest: id => `/garden/reading-forest?learner=${id}`,
};

export default function UnlockHintChips({
  skillCode, masteredCodes, currentScene, learnerId, onPractice,
}: {
  skillCode: string;
  masteredCodes: string[];
  currentScene: SceneId;
  learnerId: string;
  /** Start a practice session on a skill (scene's startSkill). */
  onPractice: (skillCode: string) => void;
}) {
  const mastered = new Set(masteredCodes);
  const hints = actionablePrereqs(skillCode, SKILLS_BY_CODE, mastered).slice(0, 3);

  if (hints.length === 0) {
    // Prereqs exist but none playable yet — extremely rare (means the
    // chain itself is blocked); keep it warm rather than technical.
    return (
      <div className="font-display italic text-[14px] text-bark/65 text-center">
        keep exploring — the path here opens as you master more skills
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="font-display italic text-[13px] text-bark/60 text-center">
        this place opens when you master{hints.length > 1 ? ' these' : ''}:
      </div>
      {hints.map(h => {
        const loc = locate(h.code);
        const here = loc?.scene === currentScene;
        return (
          <div
            key={h.code}
            className="flex items-center gap-2 bg-white border-2 border-ochre/60 rounded-2xl px-3 py-2"
          >
            <div className="flex-1 min-w-0">
              <div className="font-display text-[15px] text-bark truncate" style={{ fontWeight: 600 }}>
                {h.name}
              </div>
              {loc && (
                <div className="font-display italic text-[11px] text-bark/55">
                  {here ? `right here — ${loc.label}` : `${loc.label}, ${SCENE_NAME[loc.scene]}`}
                </div>
              )}
            </div>
            {here || !loc ? (
              <motion.button
                onClick={() => onPractice(h.code)}
                className="bg-forest text-white rounded-full px-4 py-2 font-display text-[13px] shrink-0"
                style={{ touchAction: 'manipulation', minHeight: 40, fontWeight: 600 }}
                whileTap={{ scale: 0.95 }}
              >
                practice now
              </motion.button>
            ) : (
              <Link
                href={SCENE_HREF[loc.scene](learnerId)}
                className="bg-sage text-white rounded-full px-4 py-2 font-display text-[13px] shrink-0"
                style={{ touchAction: 'manipulation', minHeight: 40, fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}
              >
                take me there →
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
