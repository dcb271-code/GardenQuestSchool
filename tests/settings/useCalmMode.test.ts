import { describe, it, expect } from 'vitest';
import { medianFrameIsSlow } from '@/lib/settings/useCalmMode';

describe('calm mode — frame-time verdict', () => {
  it('a healthy 60fps device is not calm', () => {
    const deltas = Array.from({ length: 50 }, () => 16.7);
    expect(medianFrameIsSlow(deltas)).toBe(false);
  });

  it('a chugging ~35fps device is calm', () => {
    const deltas = Array.from({ length: 50 }, () => 28);
    expect(medianFrameIsSlow(deltas)).toBe(true);
  });

  it('uses the MEDIAN — a few GC spikes on a fast device do not trigger calm', () => {
    const deltas = [...Array.from({ length: 45 }, () => 16.7), 90, 120, 85, 95, 110];
    expect(medianFrameIsSlow(deltas)).toBe(false);
  });

  it('empty samples default to not-calm', () => {
    expect(medianFrameIsSlow([])).toBe(false);
  });
});
