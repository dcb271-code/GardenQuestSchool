import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { RECIPE_CATALOG, cookableRecipes } from '@/lib/world/recipeCatalog';
import { PLANT_CATALOG } from '@/lib/world/plantCatalog';
import { SPECIES_CATALOG } from '@/lib/world/speciesCatalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Kitchen state for a learner: what's in the harvest basket (harvested,
 * not yet cooked into a meal), which recipes are cookable right now,
 * meals already cooked, and who can be invited to the picnic.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const learnerId = url.searchParams.get('learner');
  if (!learnerId) return NextResponse.json({ error: 'learner required' }, { status: 400 });

  const db = createServiceClient();

  const { data: harvestRows } = await db
    .from('garden_plot')
    .select('plant_code')
    .eq('learner_id', learnerId)
    .not('harvested_at', 'is', null)
    .is('consumed_by_meal_id', null)
    .is('consumed_by_companion_id', null);

  const basket: Record<string, number> = {};
  for (const r of harvestRows ?? []) {
    basket[r.plant_code] = (basket[r.plant_code] ?? 0) + 1;
  }

  const { data: mealRows } = await db
    .from('meal')
    .select('recipe_code, guest_code, cooked_at')
    .eq('learner_id', learnerId)
    .order('cooked_at', { ascending: false });

  // Picnic guests: the household, plus any species the learner has
  // already welcomed to the garden.
  const { data: journalRows } = await db
    .from('journal_entry')
    .select('species:species_id(code)')
    .eq('learner_id', learnerId);
  const speciesGuests = (journalRows ?? [])
    .map((r: any) => r.species?.code)
    .filter(Boolean)
    .map((code: string) => {
      const sp = SPECIES_CATALOG.find(s => s.code === code);
      return sp ? { code, name: sp.commonName, emoji: sp.emoji } : null;
    })
    .filter((g): g is { code: string; name: string; emoji: string } => g !== null);

  const plantNames = Object.fromEntries(PLANT_CATALOG.map(p => [p.code, p.commonName]));

  return NextResponse.json({
    basket,
    plantNames,
    recipes: RECIPE_CATALOG.map(r => ({
      code: r.code, name: r.name, emoji: r.emoji, description: r.description,
      ingredients: r.ingredients,
      cookable: cookableRecipes(basket).some(c => c.code === r.code),
      timesCooked: (mealRows ?? []).filter(m => m.recipe_code === r.code).length,
    })),
    meals: mealRows ?? [],
    guests: [
      { code: 'esme', name: 'Esme', emoji: '👧' },
      { code: 'bachan', name: 'Bachan', emoji: '👵' },
      { code: 'luna', name: 'Luna the cat', emoji: '🐈' },
      ...speciesGuests,
    ],
  });
}
