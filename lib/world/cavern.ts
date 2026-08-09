// lib/world/cavern.ts
//
// The Crystal Cavern economy: specimens, coins, and the rules that
// keep it from becoming a grind.
//
// Cecily asked that gems "carry a worth, maybe in money terms, that
// can be traded for garden goods". This is that, with one constraint
// carried over from a lesson this project already learned the hard
// way: THE FAILURE MODE OF THIS GARDEN IS A CHILD FARMING EASY CONTENT
// FOR REWARDS. It is why the trellis gate is mastery-gated rather than
// count-gated, and why bird units are one-pass.
//
// So coins are bounded by CONTENT and TIME, never by repetition:
//
//   * ONE dig per day. Not per session, not per lesson — per day.
//   * No coin is ever paid per correct answer. Doing a hundred easy
//     sums earns nothing here.
//   * Coins come only from SELLING a specimen, and specimens come from
//     digging or from MASTERING A SKILL.
//
// That last route is Cecily's, and it is worth quoting her because she
// aimed it better than I did. She asked for more digging; I offered her
// either a second dig or a deeper one; she wrote back: "I know that one
// dig a day is the rule and I don't mean more digging a day I mean
// doing math for the crystals."
//
// She was never asking to farm. She was asking for the maths and the
// cavern to be the same world. So mastering a skill pays a stone —
// ONCE, ever, per skill. Mastery decays and can be won back, and the
// stone is not paid again when it is. The supply is therefore bounded
// by how much mathematics exists, not by how long she sits there,
// which is the same reason the trellis gate is mastery-gated rather
// than count-gated.
//
// The consequence is deliberate: the cavern pays for going deeper, not
// for going again.
//
// Stored in world_state.garden.cavern, like everything else.

import { GEM_CATALOG, getGem, type GemData } from './gemCatalog';

export interface CavernState {
  /** Spendable coins, in pennies. */
  coins: number;
  /** code → how many of that stone she has kept. */
  kept: Record<string, number>;
  /** ISO date (YYYY-MM-DD) of her most recent dig. */
  lastDig?: string;
  /** Derived for the client; never trusted from it. */
  canDigToday: boolean;
  /** Codes of cave creatures already found by digging. */
  creaturesFound: string[];
  /**
   * Stones earned but not yet kept or sold. Waiting in the cavern so
   * the choice still belongs to her — a stone that silently appeared
   * in the case would have taken it away.
   */
  pending: string[];
  /**
   * Skill codes that have already paid a stone. Never pays twice, even
   * if mastery lapses and is won back.
   */
  masteryPaid: string[];
}

export function emptyCavern(): CavernState {
  return {
    coins: 0, kept: {}, canDigToday: true, creaturesFound: [],
    pending: [], masteryPaid: [],
  };
}

/** One dig a day. The single most important rule in this file. */
export function canDig(state: { lastDig?: string }, today: string): boolean {
  return state.lastDig !== today;
}

/**
 * Pennies → something a child reads as money. Deliberately shows
 * dollars-and-cents, because the whole point is money maths.
 */
export function coinsToPrice(pennies: number): string {
  const safe = Math.max(0, Math.round(pennies));
  if (safe < 100) return `${safe}c`;
  const dollars = Math.floor(safe / 100);
  const cents = safe % 100;
  return cents === 0 ? `$${dollars}` : `$${dollars}.${String(cents).padStart(2, '0')}`;
}

/**
 * What a dig turns up.
 *
 * Weighted so the common Kentucky stones are common and the case
 * pieces are genuinely rare — a ruby should feel like an event, not a
 * Tuesday. `roll` is a 0–1 number supplied by the caller so this stays
 * pure and testable.
 *
 * The seam is what is actually under Kentucky, so the seam dominates.
 */
export function rollDig(roll: number): GemData {
  const seam = GEM_CATALOG.filter(g => g.shelf === 'seam');
  const display = GEM_CATALOG.filter(g => g.shelf === 'case');
  // 88% of digs are local stone. The famous ones are the other 12%.
  if (roll < 0.88) {
    const i = Math.floor((roll / 0.88) * seam.length);
    return seam[Math.min(i, seam.length - 1)];
  }
  const j = Math.floor(((roll - 0.88) / 0.12) * display.length);
  return display[Math.min(j, display.length - 1)];
}

/**
 * What mastering a skill turns up.
 *
 * Weighted better than a plain dig — a dig is luck and this was work,
 * so the case shelf comes up more often. Still mostly local stone,
 * because the seam is what is actually under Kentucky.
 */
export function stoneForMastery(roll: number): GemData {
  const seam = GEM_CATALOG.filter(g => g.shelf === 'seam');
  const display = GEM_CATALOG.filter(g => g.shelf === 'case');
  if (roll < 0.72) {
    const i = Math.floor((roll / 0.72) * seam.length);
    return seam[Math.min(i, seam.length - 1)];
  }
  const j = Math.floor(((roll - 0.72) / 0.28) * display.length);
  return display[Math.min(j, display.length - 1)];
}

/**
 * Pay for every skill in `masteredNow` that has not been paid before.
 *
 * Pure, and one-pass per skill. `rolls` supplies a 0–1 number per new
 * skill so the caller owns the randomness and this stays testable.
 */
export function awardMasteryStones(
  state: CavernState,
  masteredNow: string[],
  rolls: number[],
): { state: CavernState; earned: Array<{ skillCode: string; gemCode: string }> } {
  const paid = new Set(state.masteryPaid ?? []);
  const fresh = masteredNow.filter(c => !paid.has(c));
  if (fresh.length === 0) return { state, earned: [] };

  const earned = fresh.map((skillCode, i) => ({
    skillCode,
    gemCode: stoneForMastery(rolls[i] ?? 0).code,
  }));
  return {
    state: {
      ...state,
      pending: [...(state.pending ?? []), ...earned.map(e => e.gemCode)],
      masteryPaid: [...(state.masteryPaid ?? []), ...fresh],
    },
    earned,
  };
}

/** Take one pending stone off the front, once she has chosen. */
export function resolvePending(state: CavernState, gemCode: string): CavernState {
  const i = (state.pending ?? []).indexOf(gemCode);
  if (i < 0) return state;
  const pending = [...state.pending];
  pending.splice(i, 1);
  return { ...state, pending };
}

/** Cave creatures, in the order digging reveals them. */
export const CAVERN_CREATURES = [
  'cave_salamander', 'cave_cricket', 'little_brown_bat', 'cave_shrimp',
] as const;

/**
 * Whether this dig disturbs a creature instead of finding a stone.
 *
 * Only ever the NEXT undiscovered one, in order, so the salamander —
 * the one she asked for — is always the first thing she meets down
 * there. Returns null once they are all found.
 */
export function creatureForDig(
  found: string[], roll: number,
): string | null {
  if (roll >= 0.22) return null;
  return CAVERN_CREATURES.find(c => !found.includes(c)) ?? null;
}

/** Sell a stone. Returns the new state and what she was paid. */
export function sellGem(
  state: CavernState, code: string,
): { state: CavernState; paid: number } {
  const gem = getGem(code);
  if (!gem) return { state, paid: 0 };
  return {
    state: { ...state, coins: state.coins + gem.valuePerGram },
    paid: gem.valuePerGram,
  };
}

/** Keep a stone. It fills the case and pays nothing — that is the point. */
export function keepGem(state: CavernState, code: string): CavernState {
  if (!getGem(code)) return state;
  return { ...state, kept: { ...state.kept, [code]: (state.kept[code] ?? 0) + 1 } };
}

/** How much of the display case is filled — one of each is the goal. */
export function caseProgress(state: CavernState): { have: number; total: number } {
  return {
    have: GEM_CATALOG.filter(g => (state.kept[g.code] ?? 0) > 0).length,
    total: GEM_CATALOG.length,
  };
}
