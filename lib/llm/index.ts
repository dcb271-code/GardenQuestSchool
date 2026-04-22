import type { LLMProvider } from './types';

/**
 * Plan 2 implements real Anthropic/Ollama providers. For Plan 1,
 * the stub throws on any call so AI paths fail fast instead of
 * shipping untested behavior.
 */
export function getLLMProvider(): LLMProvider {
  return {
    id: 'anthropic',
    async generate() {
      throw new Error('LLM provider not wired in Plan 1 — see Plan 2.');
    },
  };
}

export type { LLMProvider, LLMGenerateOptions } from './types';
