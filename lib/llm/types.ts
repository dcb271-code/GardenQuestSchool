import type { ZodSchema } from 'zod';

export interface LLMGenerateOptions<T> {
  systemPrompt: string;
  userPrompt: string;
  schema: ZodSchema<T>;
  examples?: Array<{ role: 'user' | 'assistant'; content: string }>;
  maxTokens?: number;
  cacheSystemPrompt?: boolean;
}

export interface LLMProvider {
  id: 'anthropic' | 'ollama' | 'openai';
  generate<T>(opts: LLMGenerateOptions<T>): Promise<T>;
}
