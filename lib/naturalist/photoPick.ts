// lib/naturalist/photoPick.ts
//
// Photo selection for naturalist walks. One walk payload draws the
// hero (mystery) photo, key-step comparison photos, and reveal
// thumbnails from the same small per-species pools, so independent
// random picks repeat photos — the child sees the mystery photo again
// as a key choice (a giveaway) or as a reveal thumbnail. Threading a
// `used` set through every pick keeps photos distinct wherever the
// pool allows.

export interface PickablePhotoRow {
  flora_code: string;
  role: string;
  tier: number;
  storage_path: string;
}

export interface PickPhotoOpts {
  floraCode: string;
  /** Omit to match any role. */
  role?: string;
  /** Preferred challenge tier; other tiers are fallbacks. */
  tier: number;
  /** storage_paths already shown in this walk payload — avoided when possible. */
  used?: Set<string>;
  rng: () => number;
}

/**
 * Picks a photo row preferring, in order: unused + requested tier,
 * unused any tier, requested tier, anything matching. Repetition is
 * worse than tier drift, so "unused" outranks "tier". Returns null
 * only when nothing matches floraCode (+role, when given).
 */
export function pickPhotoRow<T extends PickablePhotoRow>(
  rows: T[],
  { floraCode, role, tier, used, rng }: PickPhotoOpts,
): T | null {
  const candidates = rows.filter(
    r => r.flora_code === floraCode && (role === undefined || r.role === role),
  );
  if (candidates.length === 0) return null;

  const fresh = used ? candidates.filter(r => !used.has(r.storage_path)) : candidates;
  const pools = [
    fresh.filter(r => r.tier === tier),
    fresh,
    candidates.filter(r => r.tier === tier),
    candidates,
  ];
  const pool = pools.find(p => p.length > 0)!;
  return pool[Math.floor(rng() * pool.length)];
}
