import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { getShopItem, emptyShop, instanceIds, codeOf, snapToGrid,
         type ShopState } from '@/lib/world/shopCatalog';
import { emptyCavern, spendKeptGem, type CavernState } from '@/lib/world/cavern';
import { getTreatKind, feedAnimal, canFeedToday, pantryCount, treatKindFor, isKnown, validateAnimalName } from '@/lib/world/treats';
import { SPECIES_CATALOG } from '@/lib/world/speciesCatalog';
import { todayKey } from '@/lib/learning/review';

/**
 * Buying, placing and putting back.
 *
 * The purse is the cavern's — the shop spends `garden.cavern.coins`
 * rather than inventing a second currency, so a stone sold in the
 * cavern is a bench in the garden without any exchange rate in between.
 *
 * PRICE IS CHECKED HERE. The client knows the catalog, but a client
 * that says "I paid" is a client, and the whole economy is one number
 * in a JSON blob.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const Body = z.object({
  learnerId: z.string().min(1),
  action: z.enum(['buy', 'place', 'store', 'buy_treat', 'feed', 'name_animal']),
  itemCode: z.string().optional(),
  instanceId: z.string().optional(),
  speciesCode: z.string().optional(),
  animalName: z.string().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
});

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  const db = createServiceClient();

  const { data: row } = await db
    .from('world_state').select('garden').eq('learner_id', body.learnerId).maybeSingle();
  const garden = (row?.garden as Record<string, unknown>) ?? {};
  const shop: ShopState = { ...emptyShop(), ...((garden.shop as ShopState) ?? {}) };
  const cavern: CavernState = { ...emptyCavern(), ...((garden.cavern as CavernState) ?? {}) };

  if (body.action === 'buy') {
    const item = body.itemCode ? getShopItem(body.itemCode) : undefined;
    if (!item) return NextResponse.json({ error: 'no such item' }, { status: 400 });

    // A Great Work is bartered: the stone leaves the case and the
    // monument arrives. Checked here, because the client knowing the
    // catalog is not the same as the child owning the ruby.
    if (item.tradeFor) {
      const after = spendKeptGem(cavern, item.tradeFor);
      if (!after) {
        return NextResponse.json({
          error: `That is traded for a ${item.tradeFor.replace(/_/g, ' ')}, and you do not have one.`,
        }, { status: 400 });
      }
      Object.assign(cavern, after);
      shop.owned = [...shop.owned, item.code];
      garden.shop = shop;
      garden.cavern = { ...(garden.cavern as object ?? {}), kept: cavern.kept };
      const { error: e } = await db.from('world_state').upsert(
        { learner_id: body.learnerId, garden, last_updated_at: new Date().toISOString() },
        { onConflict: 'learner_id' },
      );
      if (e) return NextResponse.json({ error: e.message }, { status: 500 });
      return NextResponse.json({ shop, coins: cavern.coins, kept: cavern.kept });
    }

    if (cavern.coins < item.price) {
      return NextResponse.json({
        error: `That costs ${item.price}c and you have ${cavern.coins}c.`,
      }, { status: 400 });
    }
    cavern.coins -= item.price;
    shop.owned = [...shop.owned, item.code];
  }

  // ── treats ──────────────────────────────────────────────────────
  // Bought into the pantry, not the shed: a treat is consumable and
  // never placed. Feeding is capped one-per-animal-per-day on HER
  // day, and every refusal is said in words — the silent {paid:0}
  // lesson, kept.
  if (body.action === 'buy_treat') {
    const treat = body.itemCode ? getTreatKind(body.itemCode) : undefined;
    if (!treat) return NextResponse.json({ error: 'no such treat' }, { status: 400 });
    if (cavern.coins < treat.price) {
      return NextResponse.json({
        error: `That costs ${treat.price}c and you have ${cavern.coins}c.`,
      }, { status: 400 });
    }
    cavern.coins -= treat.price;
    shop.pantry = { ...(shop.pantry ?? {}), [treat.code]: (shop.pantry?.[treat.code] ?? 0) + 1 };
  }

  if (body.action === 'feed' && body.speciesCode) {
    const species = SPECIES_CATALOG.find(sp => sp.code === body.speciesCode);
    const treat = species ? treatKindFor(species) : null;
    const today = todayKey();
    if (!species || !treat) {
      return NextResponse.json({ error: 'That animal does not want a treat.', shop });
    }
    if (!canFeedToday(shop, species.code, today)) {
      return NextResponse.json({
        error: `The ${species.commonName.toLowerCase()} has eaten today. Come back tomorrow.`,
        shop,
      });
    }
    if (pantryCount(shop, treat.code) <= 0) {
      return NextResponse.json({
        error: `A ${species.commonName.toLowerCase()} eats ${treat.name.toLowerCase()}, and you have none. The shop sells it.`,
        shop,
      });
    }
    const fed = feedAnimal(shop, species.code, today);
    if (!fed) return NextResponse.json({ error: 'That did not work. Nothing was used.', shop });
    Object.assign(shop, fed.state);
    garden.shop = shop;
    garden.cavern = { ...(garden.cavern as object ?? {}), coins: cavern.coins };
    const { error: fe } = await db.from('world_state').upsert(
      { learner_id: body.learnerId, garden, last_updated_at: new Date().toISOString() },
      { onConflict: 'learner_id' },
    );
    if (fe) return NextResponse.json({ error: fe.message }, { status: 500 });
    return NextResponse.json({ shop, coins: cavern.coins, fact: fed.fact, treat: fed.treat.code });
  }

  // ── naming a known animal ───────────────────────────────────────
  // Three distinct feed-days and the animal is known; a known animal
  // can carry the name she gives it. Checked HERE: a client cannot
  // name a stranger.
  if (body.action === 'name_animal' && body.speciesCode) {
    const species = SPECIES_CATALOG.find(sp => sp.code === body.speciesCode);
    if (!species) return NextResponse.json({ error: 'no such animal' }, { status: 400 });
    if (!isKnown(shop, species.code)) {
      return NextResponse.json({
        error: `The ${species.commonName.toLowerCase()} does not know you well enough yet. Feed it on three different days.`,
        shop,
      });
    }
    const checked = validateAnimalName(body.animalName ?? '');
    if ('error' in checked) return NextResponse.json({ error: checked.error, shop });
    const names = (garden.animal_names as Record<string, string>) ?? {};
    garden.animal_names = { ...names, [species.code]: checked.name };
    garden.shop = shop;
    const { error: ne } = await db.from('world_state').upsert(
      { learner_id: body.learnerId, garden, last_updated_at: new Date().toISOString() },
      { onConflict: 'learner_id' },
    );
    if (ne) return NextResponse.json({ error: ne.message }, { status: 500 });
    return NextResponse.json({ shop, animalNames: garden.animal_names });
  }

  if (body.action === 'place' && body.instanceId) {
    const ids = new Set(instanceIds(shop.owned));
    if (!ids.has(body.instanceId)) {
      return NextResponse.json({ error: 'you do not own that' }, { status: 400 });
    }
    if (!getShopItem(codeOf(body.instanceId))) {
      return NextResponse.json({ error: 'no such item' }, { status: 400 });
    }
    // Snap on the server too. The client snaps for the preview; this is
    // what stops a stored position ever being off-grid.
    shop.placed = {
      ...shop.placed,
      [body.instanceId]: { x: snapToGrid(body.x ?? 0), y: snapToGrid(body.y ?? 0) },
    };
  }

  if (body.action === 'store' && body.instanceId) {
    const next = { ...shop.placed };
    delete next[body.instanceId];
    shop.placed = next;
  }

  garden.shop = shop;
  garden.cavern = { ...(garden.cavern as object ?? {}), coins: cavern.coins };

  const { error } = await db.from('world_state').upsert(
    { learner_id: body.learnerId, garden, last_updated_at: new Date().toISOString() },
    { onConflict: 'learner_id' },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ shop, coins: cavern.coins });
}
