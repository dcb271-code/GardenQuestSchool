import { describe, it, expect, vi } from 'vitest';
import { createEventBus } from '@/lib/engine/eventBus';
import type { EngineEvent } from '@/lib/engine/types';

describe('eventBus', () => {
  it('dispatches to subscribers by event type', () => {
    const bus = createEventBus();
    const fn = vi.fn();
    bus.on('item.attempted', fn);

    const evt: EngineEvent = {
      type: 'item.attempted',
      sessionId: 's1', itemId: 'i1', skillCode: 'x',
      outcome: 'correct', retries: 0, timeMs: 1000,
    };
    bus.emit(evt);
    expect(fn).toHaveBeenCalledWith(evt);
  });

  it('returns unsubscribe function', () => {
    const bus = createEventBus();
    const fn = vi.fn();
    const off = bus.on('item.attempted', fn);
    off();
    bus.emit({ type: 'item.attempted', sessionId: 's', itemId: 'i', skillCode: 'x',
      outcome: 'correct', retries: 0, timeMs: 1 });
    expect(fn).not.toHaveBeenCalled();
  });

  it('ignores emit for types with no listeners', () => {
    const bus = createEventBus();
    expect(() => bus.emit({
      type: 'narrator.moment', learnerId: 'l', kind: 'practice_is_working',
      payload: { skillCode: 'x', text: 'hi' },
    })).not.toThrow();
  });
});
