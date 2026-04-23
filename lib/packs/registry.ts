import type { ComponentType } from 'react';
import type { Item, ScoreOutcome } from '@/lib/types';

export interface RendererProps {
  content: any;
  onSubmit: (response: any) => void;
  retries: number;
}

export interface ItemTypeHandler {
  renderer: ComponentType<RendererProps>;
  score: (item: Item, response: any) => ScoreOutcome;
  getPromptText: (item: Item) => string;
}

export type ItemTypeMap = Record<string, ItemTypeHandler>;
