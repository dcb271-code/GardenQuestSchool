// app/(child)/garden/habitat/[code]/page.tsx
//
// Habitat interior dynamic route. Two interiors are implemented:
//   • bunny_burrow     — single themed skill stop + species
//   • operations_cave  — three skill stops (cave hosts the regrouping
//                        / fluency cluster from Math Mountain) + a
//                        sleepy resident bear

import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { resolveLearnerId } from '@/lib/learner/activeLearner';
import { hasHabitatInterior, HABITAT_INTERIORS } from '@/lib/world/habitatInteriors';
import { SPECIES_CATALOG } from '@/lib/world/speciesCatalog';
import { HABITAT_CATALOG } from '@/lib/world/habitatCatalog';
import { birdAudioUrl } from '@/lib/birds/photoStorage';
import type { AudioIndex } from '@/lib/birds/audioResolve';
import type { VoiceKind } from '@/lib/world/birdCatalog';
import {
  emptyCavern, canDig, digsLeftToday, digCooldownMs, type CavernState,
} from '@/lib/world/cavern';
import { todayKey } from '@/lib/learning/review';
import { correctCountsBySkill } from '@/lib/world/cumulativeProgress';
import { MATH_MOUNTAIN_STRUCTURES } from '@/lib/world/branchMaps';
import { MATH_SKILLS } from '@/lib/packs/math/skills';
import { ZONE_COMPLETION_TARGET } from '@/lib/world/zoneProgress';
import BunnyBurrowInterior from './BunnyBurrowInterior';
import PondInterior from './PondInterior';
import AntHillInterior from './AntHillInterior';
import BeeHotelInterior from './BeeHotelInterior';
import ButterflyBushInterior from './ButterflyBushInterior';
import LogPileInterior from './LogPileInterior';
import BirdFeederInterior from './BirdFeederInterior';
import CrystalCavernInterior from './CrystalCavernInterior';
import OwlBoxInterior from './OwlBoxInterior';
import CaveInterior, { type CaveSkillStop } from './CaveInterior';

export const dynamic = 'force-dynamic';

// Math Mountain structure codes that live INSIDE the Operations Cave
// when the cave is treated as a routed habitat. Order = render order
// (left wall, center under lantern, right wall).
const CAVE_STOP_CODES = ['mm_hundreds_hollow', 'mm_fast_facts', 'mm_regroup_ridge'];

export default async function HabitatInteriorPage({
  params, searchParams,
}: {
  params: { code: string };
  searchParams: { learner?: string };
}) {
  const code = params.code;
  if (!hasHabitatInterior(code)) notFound();

  const habitat = HABITAT_CATALOG.find(h => h.code === code);
  if (!habitat) notFound();

  const db = createServiceClient();
  const learnerId = await resolveLearnerId(db, searchParams.learner);
  if (!learnerId) {
    return <div className="p-6">No learner found.</div>;
  }

  // Which species belong to this habitat? Derived from the in-memory
  // SPECIES_CATALOG: any species whose habitatReqCodes array includes
  // this habitat's code.
  const allHabitatSpecies = SPECIES_CATALOG.filter(s =>
    s.habitatReqCodes.includes(code),
  );

  // Which of those has the learner discovered? Look up journal_entry rows.
  const { data: journalRows } = await db
    .from('journal_entry')
    .select('species:species_id(code)')
    .eq('learner_id', learnerId);
  const discoveredCodes = new Set(
    (journalRows ?? []).map((r: any) => r.species?.code).filter(Boolean),
  );

  const discoveredSpecies = allHabitatSpecies.filter(s => discoveredCodes.has(s.code));
  const undiscoveredCount = allHabitatSpecies.length - discoveredSpecies.length;

  const cfg = HABITAT_INTERIORS[code];

  if (code === 'bunny_burrow') {
    const { data: learnerRow } = await db
      .from('learner')
      .select('grade_level')
      .eq('id', learnerId)
      .single();
    return (
      <BunnyBurrowInterior
        learnerId={learnerId}
        themedSkillCode={cfg.themedSkillCode}
        themedStructureLabel={cfg.themedStructureLabel}
        themedStructureEmoji={cfg.themedStructureEmoji}
        discoveredSpecies={discoveredSpecies}
        undiscoveredCount={undiscoveredCount}
        learnerLevel={learnerRow?.grade_level ?? 2}
      />
    );
  }

  // The pond and the log pile share a shape: one themed skill stop and
  // the residents who live there. No extra queries needed beyond the
  // species work already done above.
  // Every habitat that is a HOME now has an interior; they all share
  // the same shape (one themed skill stop plus the residents), so a
  // lookup beats a chain of branches.
  if (code === 'owl_box') {
    return (
      <OwlBoxInterior
        learnerId={learnerId}
        themedSkillCode={cfg.themedSkillCode}
        themedStructureLabel={cfg.themedStructureLabel}
        themedStructureEmoji={cfg.themedStructureEmoji}
        discoveredSpecies={discoveredSpecies}
        undiscoveredCount={undiscoveredCount}
      />
    );
  }

  if (code === 'crystal_cavern') {
    const { data: stateRow } = await db
      .from('world_state').select('garden').eq('learner_id', learnerId).maybeSingle();
    const cavernGarden = (stateRow?.garden ?? {}) as Record<string, unknown>;
    const stored = (cavernGarden.cavern ?? {}) as Partial<CavernState>;
    const cavern: CavernState = { ...emptyCavern(), ...stored };
    return (
      <CrystalCavernInterior
        learnerId={learnerId}
        themedSkillCode={cfg.themedSkillCode}
        themedStructureLabel={cfg.themedStructureLabel}
        themedStructureEmoji={cfg.themedStructureEmoji}
        discoveredSpecies={discoveredSpecies}
        undiscoveredCount={undiscoveredCount}
        cavern={{ ...cavern, canDigToday: canDig(cavern, todayKey()),
                  digsLeftToday: digsLeftToday(cavern, todayKey()),
                  cooldownMs: digCooldownMs(cavern, Date.now()) }}
      />
    );
  }

  // The feeder is the one interior whose residents make a SOUND, so it
  // needs the clip index the others don't. Fetched here rather than in
  // the client so the birds can sing on the first tap, with no
  // round-trip between tapping a bird and hearing it.
  if (code === 'bird_feeder') {
    const audio: AudioIndex = {};
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (baseUrl) {
      const { data: clips } = await db
        .from('bird_audio')
        .select('bird_code, kind, storage_path, fallback_path, spectrogram_path, source_id, source_url, recordist, license_url');
      for (const row of (clips ?? []) as Array<Record<string, string | null>>) {
        const birdCode = row.bird_code as string;
        const kind = row.kind as VoiceKind;
        const byKind = (audio[birdCode] ??= {});
        (byKind[kind] ??= []).push({
          url: birdAudioUrl(baseUrl, row.storage_path as string),
          fallbackUrl: row.fallback_path ? birdAudioUrl(baseUrl, row.fallback_path) : null,
          spectrogramUrl: row.spectrogram_path ? birdAudioUrl(baseUrl, row.spectrogram_path) : null,
          attribution: {
            recordist: row.recordist as string,
            sourceId: row.source_id as string,
            sourceUrl: row.source_url as string,
            licenseUrl: row.license_url as string,
          },
        });
      }
    }
    return (
      <BirdFeederInterior
        learnerId={learnerId}
        themedSkillCode={cfg.themedSkillCode}
        themedStructureLabel={cfg.themedStructureLabel}
        themedStructureEmoji={cfg.themedStructureEmoji}
        discoveredSpecies={discoveredSpecies}
        undiscoveredCount={undiscoveredCount}
        audio={audio}
      />
    );
  }

  const SIMPLE_INTERIORS = {
    frog_pond: PondInterior,
    log_pile: LogPileInterior,
    butterfly_bush: ButterflyBushInterior,
    ant_hill: AntHillInterior,
    bee_hotel: BeeHotelInterior,
  } as const;

  if (code in SIMPLE_INTERIORS) {
    const Interior = SIMPLE_INTERIORS[code as keyof typeof SIMPLE_INTERIORS];
    return (
      <Interior
        learnerId={learnerId}
        themedSkillCode={cfg.themedSkillCode}
        themedStructureLabel={cfg.themedStructureLabel}
        themedStructureEmoji={cfg.themedStructureEmoji}
        discoveredSpecies={discoveredSpecies}
        undiscoveredCount={undiscoveredCount}
      />
    );
  }

  if (code === 'operations_cave') {
    // Compute per-stop unlock + completion state for the three cave
    // skills. Same logic as math-mountain/page.tsx — kept inline here
    // rather than extracted because both call sites are short and the
    // shape varies (stop record vs. structureState record).
    const { data: progress } = await db
      .from('skill_progress')
      .select('mastery_state, skill:skill_id(code)')
      .eq('learner_id', learnerId);
    const mastered = new Set(
      (progress ?? [])
        .filter((p: any) => p.mastery_state === 'mastered')
        .map((p: any) => p.skill.code),
    );

    const correctByCode = await correctCountsBySkill(db, learnerId);

    const skillNameByCode = new Map(MATH_SKILLS.map(s => [s.code, s.name]));

    const skillStops: CaveSkillStop[] = [];
    for (const stopCode of CAVE_STOP_CODES) {
      const struct = MATH_MOUNTAIN_STRUCTURES.find(s => s.code === stopCode);
      if (!struct?.skillCode) continue;
      const skill = MATH_SKILLS.find(x => x.code === struct.skillCode);
      const correctCount = correctByCode.get(struct.skillCode) ?? 0;
      const completed = mastered.has(struct.skillCode) || correctCount >= ZONE_COMPLETION_TARGET;
      const unmetPrereqs = skill
        ? skill.prereqSkillCodes.filter(c => !mastered.has(c))
        : [];
      const unlocked = unmetPrereqs.length === 0;
      const stop: CaveSkillStop = {
        code: struct.code,
        skillCode: struct.skillCode,
        label: struct.label,
        emoji: struct.themeEmoji,
        unlocked,
        completed,
        prereqDisplay: unlocked
          ? ''
          : `Finish ${unmetPrereqs.map(c => skillNameByCode.get(c) ?? c).join(', ')} first`,
      };
      if (struct.subLabel) stop.subLabel = struct.subLabel;
      skillStops.push(stop);
    }

    return (
      <CaveInterior
        learnerId={learnerId}
        skillStops={skillStops}
        discoveredSpecies={discoveredSpecies}
        undiscoveredCount={undiscoveredCount}
      />
    );
  }

  notFound();
}
