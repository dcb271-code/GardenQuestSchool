import { describe, it, expect } from 'vitest';
import {
  emptyCavern, sellGem, keepGem, holdsFind, awardMasteryStones,
} from '@/lib/world/cavern';

/**
 * The hole this closes: sellGem paid valuePerGram for ANY gem code,
 * and the API took that code straight from the request body. Anything
 * replaying the request — a double tap, a retry — minted money. A
 * balance of 499,926 coins appeared in a world whose entire shop costs
 * 590.
 */
describe('you can only bank a stone you were actually given', () => {
  const dug = { ...emptyCavern(), currentFind: 'quartz' };

  it('sells the stone in her hand', () => {
    const out = sellGem(dug, 'quartz');
    expect(out.paid).toBe(10);
    expect(out.state.coins).toBe(10);
    expect(out.state.currentFind).toBeUndefined();
  });

  it('refuses to sell a stone she never dug', () => {
    const out = sellGem(dug, 'diamond');
    expect(out.paid).toBe(0);
    expect(out.state.coins).toBe(0);
    expect(out.state).toBe(dug);
  });

  it('refuses to sell the same find twice', () => {
    const first = sellGem(dug, 'quartz');
    const second = sellGem(first.state, 'quartz');
    expect(second.paid).toBe(0);
    expect(second.state.coins).toBe(10);
  });

  it('refuses to keep a stone she never dug', () => {
    expect(keepGem(dug, 'diamond').kept.diamond).toBeUndefined();
    expect(keepGem(dug, 'quartz').kept.quartz).toBe(1);
  });

  it('cannot keep the same find twice', () => {
    const once = keepGem(dug, 'quartz');
    expect(keepGem(once, 'quartz').kept.quartz).toBe(1);
  });

  it('accepts a mastery stone waiting in pending', () => {
    const { state } = awardMasteryStones(emptyCavern(), ['math.multiply.arrays'], [0.1]);
    const code = state.pending[0];
    expect(holdsFind(state, code)).toBe(true);
    const out = sellGem(state, code);
    expect(out.paid).toBeGreaterThan(0);
    expect(out.state.pending).toHaveLength(0);
  });

  it('refuses anything not in hand and not pending', () => {
    expect(holdsFind(emptyCavern(), 'diamond')).toBe(false);
    expect(sellGem(emptyCavern(), 'diamond').paid).toBe(0);
  });
})
