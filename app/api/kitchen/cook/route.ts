import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { getRecipe } from '@/lib/world/recipeCatalog';
import { grantVirtueGem } from '@/lib/engine/virtueGrants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const Body = z.object({
  learnerId: z.string().min(1),
  recipeCode: z.string().min(1),
  guestCode: z.string().min(1).max(60).optional(),
});

/**
 * Cook a recipe: verify the basket really holds the ingredients,
 * record the meal, and consume the harvested rows (oldest harvests
 * first — first in, first eaten, like a real pantry).
 */
export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();

  const recipe = getRecipe(body.recipeCode);
  if (!recipe) return NextResponse.json({ error: 'unknown recipe' }, { status: 404 });

  // Load the unconsumed harvest rows for the needed plants, oldest first.
  const neededPlants = Object.keys(recipe.ingredients);
  const { data: rows, error: rErr } = await db
    .from('garden_plot')
    .select('id, plant_code, harvested_at')
    .eq('learner_id', body.learnerId)
    .in('plant_code', neededPlants)
    .not('harvested_at', 'is', null)
    .is('consumed_by_meal_id', null)
    .is('consumed_by_companion_id', null)
    .order('harvested_at', { ascending: true });
  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 });

  const byPlant = new Map<string, string[]>();
  for (const r of rows ?? []) {
    if (!byPlant.has(r.plant_code)) byPlant.set(r.plant_code, []);
    byPlant.get(r.plant_code)!.push(r.id);
  }

  const missing: Record<string, number> = {};
  const toConsume: string[] = [];
  for (const [plant, count] of Object.entries(recipe.ingredients)) {
    const have = byPlant.get(plant) ?? [];
    if (have.length < count) missing[plant] = count - have.length;
    else toConsume.push(...have.slice(0, count));
  }
  if (Object.keys(missing).length > 0) {
    return NextResponse.json({ error: 'not enough ingredients', missing }, { status: 409 });
  }

  const { data: meal, error: mErr } = await db
    .from('meal')
    .insert({
      learner_id: body.learnerId,
      recipe_code: recipe.code,
      guest_code: body.guestCode ?? null,
    })
    .select('id')
    .single();
  if (mErr || !meal) return NextResponse.json({ error: mErr?.message }, { status: 500 });

  const { error: cErr } = await db
    .from('garden_plot')
    .update({ consumed_by_meal_id: meal.id })
    .in('id', toConsume)
    .is('consumed_by_meal_id', null)
    .is('consumed_by_companion_id', null);
  if (cErr) {
    // Roll the meal back rather than leave a meal that consumed nothing.
    await db.from('meal').delete().eq('id', meal.id);
    return NextResponse.json({ error: cErr.message }, { status: 500 });
  }

  // Making something and sharing it is care (1/day cap in the helper).
  await grantVirtueGem(
    db, body.learnerId, 'care',
    `You made ${recipe.name.toLowerCase()} and shared it. Feeding someone is one of the oldest kinds of care.`,
    { recipeCode: recipe.code, guestCode: body.guestCode ?? null },
  );

  // Cooking is an interest signal too — she chose to spend her harvest.
  const { error: sigErr } = await db.from('interest_signal').insert([
    { learner_id: body.learnerId, tag: 'plants', weight: 1.0, source: 'kitchen_cook' },
    { learner_id: body.learnerId, tag: 'cooking', weight: 1.0, source: 'kitchen_cook' },
  ]);
  if (sigErr) console.error('interest_signal insert failed:', sigErr.message);

  return NextResponse.json({ cooked: true, mealId: meal.id });
}
