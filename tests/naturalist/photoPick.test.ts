import { describe, it, expect } from 'vitest';
import { pickPhotoRow } from '@/lib/naturalist/photoPick';

const row = (storage_path: string, over: Partial<{ flora_code: string; role: string; tier: number }> = {}) => ({
  flora_code: over.flora_code ?? 'red_maple',
  role: over.role ?? 'leaf',
  tier: over.tier ?? 1,
  storage_path,
});

const firstRng = () => 0; // always picks pool[0] — deterministic

describe('pickPhotoRow', () => {
  it('returns null when nothing matches the flora code (or role, when given)', () => {
    const rows = [row('a'), row('b', { role: 'bark' })];
    expect(pickPhotoRow(rows, { floraCode: 'tulip_poplar', tier: 1, rng: firstRng })).toBeNull();
    expect(pickPhotoRow(rows, { floraCode: 'red_maple', role: 'fruit', tier: 1, rng: firstRng })).toBeNull();
  });

  it('matches any role when role is omitted', () => {
    const rows = [row('bark-shot', { role: 'bark' })];
    expect(pickPhotoRow(rows, { floraCode: 'red_maple', tier: 1, rng: firstRng })?.storage_path).toBe('bark-shot');
  });

  it('prefers the requested tier when alternatives exist', () => {
    const rows = [row('t2', { tier: 2 }), row('t1', { tier: 1 })];
    expect(pickPhotoRow(rows, { floraCode: 'red_maple', role: 'leaf', tier: 2, rng: firstRng })?.storage_path).toBe('t2');
  });

  it('falls back across tiers when the requested tier has no photos', () => {
    const rows = [row('t1', { tier: 1 })];
    expect(pickPhotoRow(rows, { floraCode: 'red_maple', role: 'leaf', tier: 3, rng: firstRng })?.storage_path).toBe('t1');
  });

  it('avoids already-used photos, even at the cost of the preferred tier', () => {
    const rows = [row('t1-used', { tier: 1 }), row('t2-fresh', { tier: 2 })];
    const picked = pickPhotoRow(rows, {
      floraCode: 'red_maple', role: 'leaf', tier: 1, used: new Set(['t1-used']), rng: firstRng,
    });
    expect(picked?.storage_path).toBe('t2-fresh');
  });

  it('repeats a used photo only when every candidate is used', () => {
    const rows = [row('only-one')];
    const picked = pickPhotoRow(rows, {
      floraCode: 'red_maple', role: 'leaf', tier: 1, used: new Set(['only-one']), rng: firstRng,
    });
    expect(picked?.storage_path).toBe('only-one');
  });

  it('prefers tier-match among unused candidates', () => {
    const rows = [row('t2-fresh', { tier: 2 }), row('t1-fresh', { tier: 1 }), row('t1-used', { tier: 1 })];
    const picked = pickPhotoRow(rows, {
      floraCode: 'red_maple', role: 'leaf', tier: 1, used: new Set(['t1-used']), rng: firstRng,
    });
    expect(picked?.storage_path).toBe('t1-fresh');
  });
});
