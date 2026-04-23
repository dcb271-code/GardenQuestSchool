import type { SupabaseClient } from '@supabase/supabase-js';
import { HABITAT_CATALOG } from '../lib/world/habitatCatalog';
import { SPECIES_CATALOG } from '../lib/world/speciesCatalog';

export async function seedWorld(sb: SupabaseClient): Promise<void> {
  for (const h of HABITAT_CATALOG) {
    const { error } = await sb.from('habitat_type').upsert({
      code: h.code,
      name: h.name,
      description: h.description,
      attracts_species_codes: h.attractsSpeciesCodes,
      prereq_skill_codes: h.prereqSkillCodes,
      illustration_key: h.illustrationKey,
    }, { onConflict: 'code' });
    if (error) throw error;
  }

  for (const s of SPECIES_CATALOG) {
    const { error } = await sb.from('species').upsert({
      code: s.code,
      common_name: s.commonName,
      scientific_name: s.scientificName,
      description: s.description,
      fun_fact: s.funFact,
      illustration_key: s.illustrationKey,
      habitat_req_codes: s.habitatReqCodes,
    }, { onConflict: 'code' });
    if (error) throw error;
  }

  console.log(`  → world: ${HABITAT_CATALOG.length} habitats + ${SPECIES_CATALOG.length} species`);
}
