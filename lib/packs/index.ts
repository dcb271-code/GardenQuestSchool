import type { Item, ScoreOutcome } from '@/lib/types';
import type { ItemTypeHandler, ItemTypeMap } from './registry';
import { mathItemTypes } from './math';
import { readingItemTypes } from './reading';

// Compose item types from all packs. Each pack's entries are merged.
// If two packs claim the same type name, the later-imported wins — so
// subject packs MUST use unique type names.
const ALL_ITEM_TYPES: ItemTypeMap = {
  ...mathItemTypes,
  ...readingItemTypes,
};

export function getItemHandler(type: string): ItemTypeHandler | undefined {
  return ALL_ITEM_TYPES[type];
}

export function scoreAnyItem(item: Item, response: any): ScoreOutcome {
  const handler = ALL_ITEM_TYPES[item.type];
  if (!handler) throw new Error(`No handler registered for item type: ${item.type}`);
  return handler.score(item, response);
}

export function getPromptText(item: Item): string {
  const handler = ALL_ITEM_TYPES[item.type];
  if (!handler) return item.content?.promptText ?? '';
  return handler.getPromptText(item);
}
