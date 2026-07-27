// lib/birds/photoResolve.ts
//
// Turning a {birdCode, role} reference into an actual photo.
//
// Exercises are generated from the catalog, but photos are curated by
// hand, one bird at a time. Those two things will never be perfectly
// in step: a new crew lands in the catalog before anyone has sat down
// and looked at 360 candidate images for it.
//
// So resolution has to degrade rather than break. A missing role falls
// back through sensible neighbours (a male cardinal IS a perched
// cardinal), and a bird with no curated photos at all resolves to
// null, which the scene treats as "skip this exercise" rather than
// rendering a broken image at a seven-year-old.

import type { BirdPhotoRole } from '@/lib/birds/curriculum';

export interface ResolvedPhoto {
  url: string;
  alt: string;
  tier: number;
  attribution: {
    photographer: string | null;
    licenseCode: string;
    sourceUrl: string;
  };
}

export type PhotoIndex =
  Record<string, Partial<Record<BirdPhotoRole, ResolvedPhoto[]>>>;

/**
 * What to try when the asked-for role has nothing.
 *
 * Order matters and is not arbitrary. 'perched' falls back to 'male'
 * before 'female' because for the dimorphic birds here the male is the
 * one a child pictures when she hears the name — but it does fall back
 * to 'female' rather than showing nothing, because recognising the
 * female is a real part of knowing the bird.
 *
 * 'silhouette' deliberately falls back to nothing but itself: a
 * shape-only question answered with a full-colour photograph is not a
 * degraded version of the exercise, it is a different and much easier
 * one, and it would quietly undermine the whole shape-before-colour
 * sequence.
 */
export const ROLE_FALLBACK: Record<BirdPhotoRole, BirdPhotoRole[]> = {
  perched:     ['perched', 'male', 'female', 'nonbreeding', 'back', 'flight'],
  male:        ['male', 'perched', 'nonbreeding'],
  female:      ['female', 'nonbreeding', 'perched'],
  nonbreeding: ['nonbreeding', 'female', 'perched'],
  juvenile:    ['juvenile', 'female', 'perched'],
  flight:      ['flight', 'perched', 'male'],
  head:        ['head', 'perched', 'male'],
  back:        ['back', 'perched', 'male'],
  silhouette:  ['silhouette'],
};

/**
 * Best photo for a reference, or null if the bird has nothing usable.
 *
 * `seed` picks between equally good candidates so the same bird is not
 * always shown by the same picture — recognising one photograph is not
 * the same as recognising the bird.
 */
export function resolvePhoto(
  index: PhotoIndex,
  birdCode: string,
  role: BirdPhotoRole,
  seed = 0,
): ResolvedPhoto | null {
  const byRole = index[birdCode];
  if (!byRole) return null;

  for (const candidateRole of ROLE_FALLBACK[role]) {
    const photos = byRole[candidateRole];
    if (!photos || photos.length === 0) continue;
    // Prefer the clearest tier, then vary within it.
    const bestTier = Math.min(...photos.map(p => p.tier));
    const best = photos.filter(p => p.tier === bestTier);
    return best[Math.abs(seed) % best.length];
  }
  return null;
}

/** Can this exercise be shown at all? */
export function hasPhoto(
  index: PhotoIndex, birdCode: string, role: BirdPhotoRole,
): boolean {
  return resolvePhoto(index, birdCode, role) !== null;
}

/**
 * Roles in the order a gallery should show them: the sexes first,
 * because "the male and female look nothing alike" is the single
 * biggest surprise a beginner meets, then the plain portrait, then
 * the seasonal and detail shots.
 */
const GALLERY_ROLE_ORDER: BirdPhotoRole[] = [
  'male', 'female', 'perched', 'nonbreeding', 'juvenile', 'head', 'back', 'flight',
];

/** Roles worth captioning under a gallery photo. 'perched' says
 *  nothing a child needs; 'female' is the lesson itself. */
export const GALLERY_CAPTION: Partial<Record<BirdPhotoRole, string>> = {
  male: 'the male', female: 'the female',
  nonbreeding: 'in winter', juvenile: 'a youngster',
};

/**
 * Up to `max` distinct photos of one bird for its meet-the-bird page:
 * one of each role first (so a dimorphic bird always shows both
 * sexes), then extra photos of already-shown roles to fill out the
 * set. Never fewer than every photo the bird has, deduplicated by
 * URL because one file can satisfy several roles via fallback.
 */
export function galleryPhotos(
  index: PhotoIndex, birdCode: string, max = 4,
): Array<{ photo: ResolvedPhoto; role: BirdPhotoRole }> {
  const byRole = index[birdCode];
  if (!byRole) return [];
  const out: Array<{ photo: ResolvedPhoto; role: BirdPhotoRole }> = [];
  const seen = new Set<string>();
  const take = (photo: ResolvedPhoto, role: BirdPhotoRole) => {
    if (out.length >= max || seen.has(photo.url)) return;
    seen.add(photo.url);
    out.push({ photo, role });
  };
  // Pass 1: the best photo of each role the bird actually has.
  for (const role of GALLERY_ROLE_ORDER) {
    const best = resolvePhoto(index, birdCode, role);
    // Only when the role genuinely exists — resolvePhoto falls back
    // across roles, and a fallback would double-show one photo while
    // captioning it wrongly.
    if (best && (byRole[role]?.length ?? 0) > 0) take(best, role);
  }
  // Pass 2: fill remaining slots with the rest, clearest tier first.
  for (const role of GALLERY_ROLE_ORDER) {
    for (const photo of byRole[role] ?? []) take(photo, role);
  }
  return out;
}

/** Which birds have any curated photo — drives what the journal can show. */
export function birdsWithPhotos(index: PhotoIndex): string[] {
  return Object.keys(index).filter(code =>
    Object.values(index[code]).some(list => (list?.length ?? 0) > 0),
  );
}
