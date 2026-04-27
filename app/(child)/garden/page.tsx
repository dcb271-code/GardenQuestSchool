import { createServiceClient } from '@/lib/supabase/server';
import { GARDEN_STRUCTURES } from '@/lib/world/gardenMap';
import { HABITAT_CATALOG } from '@/lib/world/habitatCatalog';
import { SPECIES_CATALOG } from '@/lib/world/speciesCatalog';
import { MATH_SKILLS } from '@/lib/packs/math/skills';
import { READING_SKILLS } from '@/lib/packs/reading/skills';
import { computeStructureProgress, ZONE_COMPLETION_TARGET } from '@/lib/world/zoneProgress';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import {
  BRANCH_GATING,
  isStructureCompletedForGating,
  isBranchUnlocked,
  type BranchCode,
} from '@/lib/world/branchGating';
import { todaysAlertCharacter } from '@/lib/world/characterRotation';
import {
  partitionRecommendations,
  type RecommendedCandidate,
} from '@/lib/world/characterRecommendation';
import { hasHabitatInterior } from '@/lib/world/habitatInteriors';
import GardenScene from './GardenScene';

export const dynamic = 'force-dynamic';

export interface StructureState {
  unlocked: boolean;
  completed: boolean;
  isNext: boolean;
  correctCount: number;
  target: number;
  prereqDisplay: string;
  built?: boolean;       // habitats only — true if ecology quest done
  unlocksLabel?: string | null;  // skill structures: what finishing this opens
}

export default async function GardenPage({
  searchParams,
}: {
  searchParams: { learner?: string };
}) {
  const db = createServiceClient();

  const learnerId = await resolveLearnerId(db, searchParams.learner);
  if (!learnerId) {
    return <div className="p-6">No learner found.</div>;
  }

  const { data: learner } = await db
    .from('learner')
    .select('first_name')
    .eq('id', learnerId)
    .single();
  const firstName = learner?.first_name ?? null;

  // Existing skill-progress query (we still use mastery for habitat gating)
  const { data: progress } = await db
    .from('skill_progress')
    .select('mastery_state, skill:skill_id(code)')
    .eq('learner_id', learnerId);
  const mastered = new Set(
    (progress ?? [])
      .filter((p: any) => p.mastery_state === 'mastered')
      .map((p: any) => p.skill.code)
  );

  // Cumulative correct attempts per skill, joined via item → skill.
  const { data: attemptRows } = await db
    .from('attempt')
    .select('outcome, item:item_id(skill:skill_id(code))')
    .eq('learner_id', learnerId)
    .eq('outcome', 'correct');
  const correctByCode = new Map<string, number>();
  for (const row of attemptRows ?? []) {
    const code = (row as any).item?.skill?.code;
    if (!code) continue;
    correctByCode.set(code, (correctByCode.get(code) ?? 0) + 1);
  }

  const allSkills = [...MATH_SKILLS, ...READING_SKILLS];
  const skillNameByCode = new Map(allSkills.map(s => [s.code, s.name]));

  // Build skill structure progress via zone rules
  const prereqFallback = (structureCode: string) => {
    const struct = GARDEN_STRUCTURES.find(s => s.code === structureCode);
    if (!struct || !struct.skillCode) return 'more practice';
    const skill = allSkills.find(s => s.code === struct.skillCode);
    const unmet = skill
      ? skill.prereqSkillCodes.filter(c => !mastered.has(c)).map(c => skillNameByCode.get(c) ?? c)
      : [];
    return unmet.length > 0 ? unmet.join(', ') : 'more practice';
  };
  const skillProgress = computeStructureProgress(
    GARDEN_STRUCTURES,
    correctByCode,
    prereqFallback,
  );

  // Which habitats has the learner already BUILT (i.e. completed the
  // ecology quest)? This drives the visual + arrival eligibility.
  const { data: builtRows } = await db
    .from('habitat')
    .select('habitat_type:habitat_type_id(code)')
    .eq('learner_id', learnerId);
  const builtSet = new Set(
    (builtRows ?? []).map((r: any) => r.habitat_type?.code).filter(Boolean),
  );

  // Habitat unlock: skill prereqs met → habitat is "available to build"
  // (shown as a ghost on the map). Built = ecology quest done = full
  // illustration + arrivals possible.
  const structureStates: Record<string, StructureState> = {};
  for (const s of GARDEN_STRUCTURES) {
    if (s.kind === 'skill') {
      const p = skillProgress[s.code];
      structureStates[s.code] = {
        unlocked: p?.unlocked ?? false,
        completed: p?.completed ?? false,
        isNext: p?.isNext ?? false,
        correctCount: p?.correctCount ?? 0,
        target: p?.target ?? ZONE_COMPLETION_TARGET,
        prereqDisplay: p?.prereqDisplay ?? '',
        unlocksLabel: p?.unlocksLabel ?? null,
      };
    } else if (s.kind === 'habitat' && s.habitatCode) {
      const habitat = HABITAT_CATALOG.find(h => h.code === s.habitatCode);
      const prereqsMet = habitat ? habitat.prereqSkillCodes.every(c => mastered.has(c)) : false;
      const prereqNames = habitat
        ? habitat.prereqSkillCodes.filter(c => !mastered.has(c)).map(c => skillNameByCode.get(c) ?? c)
        : [];
      structureStates[s.code] = {
        unlocked: prereqsMet,
        completed: false,
        isNext: false,
        correctCount: 0,
        target: 0,
        prereqDisplay: prereqNames.length > 0 ? prereqNames.join(', ') : 'more practice',
        built: builtSet.has(s.habitatCode),
      };
    }
  }

  // For arrival eligibility we use the BUILT habitats (not just unlocked).
  const placedCodesList: string[] = Array.from(builtSet);

  // Pending arrival is now session-earned, not auto-computed. The
  // session-end API writes a species code into world_state.garden when
  // the learner completes ≥3 correct in a session. We just read it
  // here; the welcome modal will clear it on dismiss.
  const { data: worldStateRow } = await db
    .from('world_state')
    .select('garden')
    .eq('learner_id', learnerId)
    .maybeSingle();
  const pendingCode = (worldStateRow?.garden as Record<string, any> | null)
    ?.pendingArrivalSpeciesCode as string | undefined;
  const pendingArrival = pendingCode
    ? SPECIES_CATALOG.find(s => s.code === pendingCode) ?? null
    : null;

  // ─── Branch unlock state ─────────────────────────────────────────
  const isCompleted = (structureCode: string) =>
    isStructureCompletedForGating(
      structureCode, GARDEN_STRUCTURES, correctByCode, mastered, ZONE_COMPLETION_TARGET,
    );
  const branchCodes: BranchCode[] = ['math_mountain', 'reading_forest'];
  const previouslyUnlocked = new Set<string>(
    (worldStateRow?.garden as Record<string, any> | null)?.unlocked_branches ?? [],
  );
  const branchUnlock: Record<BranchCode, { unlocked: boolean; justUnlocked: boolean }> = {
    math_mountain: { unlocked: false, justUnlocked: false },
    reading_forest: { unlocked: false, justUnlocked: false },
  };
  const newlyUnlocked: string[] = [];
  for (const code of branchCodes) {
    const unlocked = isBranchUnlocked(code, isCompleted);
    const justUnlocked = unlocked && !previouslyUnlocked.has(code);
    branchUnlock[code] = { unlocked, justUnlocked };
    if (justUnlocked) newlyUnlocked.push(code);
  }

  // Persist newly-unlocked branches so the just-unlocked animation
  // only fires once. Only write if there's a new entry.
  if (newlyUnlocked.length > 0) {
    const updatedGarden = {
      ...(worldStateRow?.garden as Record<string, any> | null ?? {}),
      unlocked_branches: [...Array.from(previouslyUnlocked), ...newlyUnlocked],
    };
    await db.from('world_state')
      .update({ garden: updatedGarden })
      .eq('learner_id', learnerId);
  }

  // ─── Character rotation + recommendations ───────────────────────
  const alertCharacterCode = todaysAlertCharacter(learnerId);

  // Self-fetch the engine's candidate list. NEXT_PUBLIC_BASE_URL is
  // documented as the env for absolute URLs server-side; falls back to
  // VERCEL_URL in production, localhost in dev. If that ever fails the
  // cleaner fix is to expose the candidates logic as a shared lib —
  // out of scope for this task.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  let candidates: RecommendedCandidate[] = [];
  try {
    const candidatesRes = await fetch(
      `${baseUrl}/api/plan/candidates?learner=${learnerId}`,
      { cache: 'no-store' },
    );
    if (candidatesRes.ok) {
      const json = (await candidatesRes.json()) as { candidates?: RecommendedCandidate[] };
      candidates = json.candidates ?? [];
    }
  } catch {
    // If the self-fetch fails, fall through with empty candidates so
    // the characters still render in their sleeping state.
    candidates = [];
  }
  const partitioned = partitionRecommendations(candidates);
  const characterRecs = {
    hodge: partitioned.hodge ? { skillCode: partitioned.hodge.skillCode, structureLabel: partitioned.hodge.title } : null,
    nana: partitioned.nana ? { skillCode: partitioned.nana.skillCode, structureLabel: partitioned.nana.title } : null,
    signpost: partitioned.signpost.map(c => ({ skillCode: c.skillCode, structureLabel: c.title })),
  };

  // ─── Habitat interior eligibility ────────────────────────────────
  // For each built habitat that has an implemented interior, check if
  // any of its species is in the learner's journal.
  const { data: journalRows } = await db
    .from('journal_entry')
    .select('species:species_id(code)')
    .eq('learner_id', learnerId);
  const journalCodes = new Set(
    (journalRows ?? []).map((r: any) => r.species?.code).filter(Boolean),
  );
  const interiorEnabledByHabitat: Record<string, boolean> = {};
  for (const habitat of HABITAT_CATALOG) {
    if (!hasHabitatInterior(habitat.code)) continue;
    if (!builtSet.has(habitat.code)) continue;
    const habitatSpecies = SPECIES_CATALOG.filter(s => s.habitatReqCodes.includes(habitat.code));
    interiorEnabledByHabitat[habitat.code] = habitatSpecies.some(s => journalCodes.has(s.code));
  }

  return (
    <GardenScene
      learnerId={learnerId}
      firstName={firstName}
      structureStates={structureStates}
      pendingArrival={pendingArrival}
      branchUnlock={branchUnlock}
      characterRotation={{ alertCharacterCode }}
      characterRecs={characterRecs}
      interiorEnabledByHabitat={interiorEnabledByHabitat}
    />
  );
}
