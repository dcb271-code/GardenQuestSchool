// lib/world/house.ts
//
// The family's house. Not a habitat — no species requirements, no
// build quest, and NO GATE: nobody earns their own front door. It is
// the first interior in the app without a lock, on purpose.
//
// Spec: docs/superpowers/specs/2026-08-12-house-spec.md. Drawn from
// photos of the real house; the owner's corrections are recorded
// there (the exterior stays as drawn; a cushioned bench in front of
// the stairs, not the staged table the listing showed).
//
// State lives in world_state.garden.house, the letterbox convention —
// a new key in the jsonb blob, never a migration.

import type { LunaEpisode, SceneArt } from '@/lib/world/lunaAdventure';

export interface HouseState {
  /** Gem code displayed on the mantel shelf, from her display case. */
  mantelStone?: string;
  /** Bird code displayed on the mantel shelf, from her life list. */
  mantelBird?: string;
}

export function emptyHouse(): HouseState {
  return {};
}

/**
 * Put a stone on the mantel. Only a stone that is really in her case
 * may stand there — the mantel displays what she owns, it does not
 * conjure. `null` takes the stone down and returns it to nothing but
 * the case, where it never stopped being.
 */
export function setMantelStone(
  house: HouseState,
  kept: Record<string, number>,
  code: string | null,
): HouseState | null {
  if (code === null) {
    const next = { ...house };
    delete next.mantelStone;
    return next;
  }
  if ((kept[code] ?? 0) <= 0) return null;
  return { ...house, mantelStone: code };
}

/**
 * Put a bird on the mantel — a small carved likeness of one she has
 * really seen. Life list only: the mantel remembers sightings, not
 * quiz scores.
 */
export function setMantelBird(
  house: HouseState,
  lifeList: Record<string, unknown>,
  code: string | null,
): HouseState | null {
  if (code === null) {
    const next = { ...house };
    delete next.mantelBird;
    return next;
  }
  if (!lifeList[code]) return null;
  return { ...house, mantelBird: code };
}

// ── The storybooks on the hearth ────────────────────────────────────
//
// A finished Luna episode becomes a book she can re-read by the fire.
// A re-read is a BOOK, not a game: no gates re-run, no choices
// re-asked. The book remembers the path SHE took — her choice's
// response is printed as what happened, because in her story it is.

export interface BookPage {
  text: string;
  art: SceneArt;
}

export function storybookPages(
  episode: LunaEpisode,
  choices: Record<string, string>,
): BookPage[] {
  const pages: BookPage[] = [];
  for (const scene of episode.scenes) {
    if (scene.kind === 'narration') {
      pages.push({ text: scene.text, art: scene.art });
    } else if (scene.kind === 'choice') {
      pages.push({ text: scene.prompt, art: scene.art });
      // Her recorded choice is canon. If a record is somehow missing
      // (an episode finished before choices persisted), fall back to
      // the first option rather than tearing a page out of the book.
      const picked =
        scene.options.find(o => o.id === choices[scene.id]) ?? scene.options[0];
      pages.push({ text: picked.responseText, art: scene.art });
    } else {
      pages.push({ text: scene.inviteText, art: scene.art });
      pages.push({ text: scene.afterText, art: scene.art });
    }
  }
  return pages;
}

// ── Coat hooks ──────────────────────────────────────────────────────
//
// One hook per child by the door, each coat its own color, assigned
// by name so a coat never changes color between visits. The palette
// is deliberately small and warm — these are kids' coats on pegs, not
// a chart legend.

const COAT_COLORS = ['#C94C3E', '#4A7BA6', '#D9A441', '#6B8E5A', '#8A6BA6'];

/**
 * Assign every child a distinct coat color. Hashed by name, probed
 * past collisions in sorted order, so the same roster always hangs
 * the same coats — two sisters must never argue about whose is red.
 */
export function coatColorsFor(names: string[]): Record<string, string> {
  const taken = new Set<number>();
  const out: Record<string, string> = {};
  for (const name of [...names].sort()) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    let slot = h % COAT_COLORS.length;
    while (taken.has(slot) && taken.size < COAT_COLORS.length) {
      slot = (slot + 1) % COAT_COLORS.length;
    }
    taken.add(slot);
    out[name] = COAT_COLORS[slot];
  }
  return out;
}
