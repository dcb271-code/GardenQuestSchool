// Ikebana with Bachan — quiet flower arranging on the cottage porch.
//
// Unlocks once the learner has harvested enough flowers (lifetime,
// spent or not — the gate rewards growing, not hoarding). An
// arrangement follows the classic three-stem structure: shin (heaven,
// the tallest), soe (human, leaning beside it), hikae (earth, low at
// the base). Bachan teaches the shape; the child picks the blooms.

import { PLANT_CATALOG } from './plantCatalog';
import type { PlantData } from './plantCatalog';

/** Lifetime harvested flowers needed before Bachan offers ikebana. */
export const IKEBANA_UNLOCK_FLOWERS = 5;

export type StemRole = 'shin' | 'soe' | 'hikae';

export const STEM_ROLES: Array<{
  role: StemRole;
  name: string;
  meaning: string;
  hint: string;
  /** A true ikebana learning point Bachan shares while this stem is picked. */
  lesson: string;
}> = [
  {
    role: 'shin',
    name: 'shin — heaven',
    meaning: 'the tallest stem, reaching for the sky',
    hint: 'pick a flower to stand tall in the middle',
    lesson: 'Shin sets the whole shape. Ikebana artists make it about one and a half times as tall as the vase — tall enough to reach, not so tall it tips.',
  },
  {
    role: 'soe',
    name: 'soe — human',
    meaning: 'the middle stem, leaning like a friend',
    hint: 'pick a flower to lean beside it',
    lesson: 'Soe means "support." It stands for people, and it leans toward shin the way a friend leans in to listen — about three-quarters as tall.',
  },
  {
    role: 'hikae',
    name: 'hikae — earth',
    meaning: 'the shortest stem, close to the ground',
    hint: 'pick a flower to rest low in front',
    lesson: 'Hikae stands for the earth that holds everything up. The three flower tips should make a lopsided triangle — never a straight line.',
  },
];

/** Bachan's finishing thought once all three stems are placed. */
export const IKEBANA_FINISH_LESSON =
  'See the empty space between the flowers? In ikebana that space is part of the arrangement — it gives each bloom room to breathe.';

/** Kid-friendly facts Bachan shares, one per arrangement. */
export const IKEBANA_FACTS: string[] = [
  'Ikebana means "living flowers" in Japanese. People have practiced it for more than 600 years!',
  'In ikebana, the empty space around the flowers matters as much as the flowers themselves.',
  'The three stems stand for heaven, people, and earth — all in one little vase.',
  'Ikebana artists work quietly. Arranging flowers slowly is a way of resting your mind.',
  'An ikebana arrangement uses just a few flowers, so you can really notice each one.',
  'In Japan, ikebana is called kadō — "the way of flowers" — and people study it their whole lives.',
];

/** Plants that can go in the vase. New flowers join automatically. */
export function ikebanaFlowers(): PlantData[] {
  return PLANT_CATALOG.filter(p => p.garden === 'flower');
}

export function ikebanaFlowerCodes(): string[] {
  return ikebanaFlowers().map(p => p.code);
}

/** Display emoji for a flower in the vase and the journal. */
export function flowerEmoji(code: string): string {
  const map: Record<string, string> = {
    tulip: '🌷',
    daisy: '🌼',
    sunflower: '🌻',
    coneflower: '🌸',
    blackeyedsusan: '🌼',
    milkweed: '🌸',
    lupine: '💐',
    beebalm: '🌺',
  };
  return map[code] ?? '🌸';
}
