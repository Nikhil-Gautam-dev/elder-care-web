import { GeminiProvider } from './gemini/index.js';
import { GroqProvider } from './groq/index.js';
import type { LlmProvider, LlmProviderName } from './types.js';

export interface LlmConfig {
  provider: LlmProviderName;
  temperature: number;
  groq: { apiKey: string; model: string };
  gemini: { apiKey: string; model: string };
}

/** The only place that knows every provider. Adding one = a new folder plus a case here. */
export function createLlmProvider(config: LlmConfig): LlmProvider {
  switch (config.provider) {
    case 'groq':
      return new GroqProvider({ ...config.groq, temperature: config.temperature });
    case 'gemini':
      return new GeminiProvider({ ...config.gemini, temperature: config.temperature });
  }
}

export { LlmRateLimitError, LlmUnavailableError } from './errors.js';
export { withRetry } from './retry.js';
export { LLM_PROVIDERS } from './types.js';
export type {
  LlmMessage,
  LlmProvider,
  LlmProviderName,
  LlmRequest,
  LlmTool,
  LlmToolCall,
  LlmTurn,
} from './types.js';
