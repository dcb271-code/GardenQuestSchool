import type { EngineEvent } from './types';

type EventType = EngineEvent['type'];
type Handler<T extends EventType> = (evt: Extract<EngineEvent, { type: T }>) => void;

export interface EventBus {
  on<T extends EventType>(type: T, handler: Handler<T>): () => void;
  emit(evt: EngineEvent): void;
}

export function createEventBus(): EventBus {
  const listeners = new Map<EventType, Set<Function>>();

  return {
    on<T extends EventType>(type: T, handler: Handler<T>) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(handler as Function);
      return () => { listeners.get(type)?.delete(handler as Function); };
    },
    emit(evt: EngineEvent) {
      const set = listeners.get(evt.type);
      if (!set) return;
      for (const fn of set) (fn as (e: EngineEvent) => void)(evt);
    },
  };
}
