import { createServiceClient } from '@/lib/supabase/server';
import { HABITAT_CATALOG } from '@/lib/world/habitatCatalog';
import { SPECIES_CATALOG } from '@/lib/world/speciesCatalog';
import { computeNewArrivals } from '@/lib/world/arrivals';
import { MATH_SKILLS } from '@/lib/packs/math/skills';
import { READING_SKILLS } from '@/lib/packs/reading/skills';
import GardenScene from './GardenScene';
import type { PlacedHabitatView } from '@/components/child/garden/GardenGrid';
import type { TrayItem } from '@/components/child/garden/HabitatTray';

export const dynamic = 'force-dynamic';

export default async function GardenPage({
  searchParams,
}: {
  searchParams: { learner?: string };
}) {
  const db = createServiceClient();

  let learnerId = searchParams.learner;
  if (!learnerId) {
    const { data: first } = await db.from('learner').select('id').limit(1).single();
    learnerId = first?.id;
  }
  if (!learnerId) {
    return <div className="p-6">No learner found.</div>;
  }

  // Placed habitats
  const { data: placedRows } = await db
    .from('habitat')
    .select('id, position, habitat_type:habitat_type_id(code)')
    .eq('learner_id', learnerId);

  const placedHabitats: PlacedHabitatView[] = (placedRows ?? [])
    .map((h: any) => {
      const code = h.habitat_type?.code;
      const catalog = HABITAT_CATALOG.find(c => c.code === code);
      if (!code || !catalog) return null;
      return {
        id: h.id,
        code,
        emoji: catalog.emoji,
        position: h.position,
      };
    })
    .filter((h): h is PlacedHabitatView => !!h);

  const placedCodes = placedHabitats.map(h => h.code);

  // Mastery for tray unlock display
  const { data: progress } = await db
    .from('skill_progress')
    .select('mastery_state, skill:skill_id(code)')
    .eq('learner_id', learnerId);
  const mastered = new Set(
    (progress ?? [])
      .filter((p: any) => p.mastery_state === 'mastered')
      .map((p: any) => p.skill.code)
  );
  const allSkills = [...MATH_SKILLS, ...READING_SKILLS];
  const skillNameByCode = new Map(allSkills.map(s => [s.code, s.name]));

  const trayItems: TrayItem[] = HABITAT_CATALOG.map(h => {
    const unlocked = h.prereqSkillCodes.every(c => mastered.has(c));
    const placed = placedCodes.includes(h.code);
    const prereqDisplay = h.prereqSkillCodes.map(c => skillNameByCode.get(c) ?? c).join(', ');
    return {
      code: h.code,
      name: h.name,
      emoji: h.emoji,
      unlocked,
      placed,
      prereqDisplay,
    };
  });

  // Unlocked species + pending arrival detection
  const { data: journalRows } = await db
    .from('journal_entry')
    .select('species:species_id(code)')
    .eq('learner_id', learnerId);
  const unlockedCodes = (journalRows ?? []).map((r: any) => r.species?.code).filter(Boolean);

  const newArrivals = computeNewArrivals(placedCodes, unlockedCodes, SPECIES_CATALOG);
  const pendingArrival = newArrivals.length > 0 ? newArrivals[0] : null;

  return (
    <GardenScene
      learnerId={learnerId}
      initialPlaced={placedHabitats}
      trayItems={trayItems}
      pendingArrival={pendingArrival}
    />
  );
}
