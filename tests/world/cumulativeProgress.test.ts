// tests/world/cumulativeProgress.test.ts
import { describe, it, expect, vi } from 'vitest';
import { getCumulativeCorrect } from '@/lib/world/cumulativeProgress';

describe('getCumulativeCorrect', () => {
  it('queries attempt count where outcome=correct for the learner', async () => {
    const eq2 = vi.fn().mockResolvedValue({ count: 42, error: null });
    const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
    const select = vi.fn().mockReturnValue({ eq: eq1 });
    const from = vi.fn().mockReturnValue({ select });
    const db = { from } as any;
    const result = await getCumulativeCorrect(db, 'learner-123');
    expect(result).toBe(42);
    expect(from).toHaveBeenCalledWith('attempt');
    expect(select).toHaveBeenCalledWith('*', { count: 'exact', head: true });
    expect(eq1).toHaveBeenCalledWith('learner_id', 'learner-123');
    expect(eq2).toHaveBeenCalledWith('outcome', 'correct');
  });

  it('returns 0 when count is null', async () => {
    const eq2 = vi.fn().mockResolvedValue({ count: null, error: null });
    const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
    const select = vi.fn().mockReturnValue({ eq: eq1 });
    const db = { from: vi.fn().mockReturnValue({ select }) } as any;
    expect(await getCumulativeCorrect(db, 'l')).toBe(0);
  });

  it('throws on db error', async () => {
    const eq2 = vi.fn().mockResolvedValue({ count: null, error: { message: 'boom' } });
    const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
    const select = vi.fn().mockReturnValue({ eq: eq1 });
    const db = { from: vi.fn().mockReturnValue({ select }) } as any;
    await expect(getCumulativeCorrect(db, 'l')).rejects.toThrow('boom');
  });
});
