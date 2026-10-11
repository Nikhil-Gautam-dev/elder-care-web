import { FailoverProvider } from './failover/index.js';
import { GeminiProvider } from './gemini/index.js';
import { GroqProvider } from './groq/index.js';
import type { LlmProvider, LlmProviderName } from './types.js';

export interface LlmConfig {
  /** Ordered by preference; the first is tried first, the rest are fallbacks. */
  providers: LlmProviderName[];
  temperature: number;
  groq: { apiKey: string; model: string };
  gemini: { apiKey: string; model: string };
}

function createSingle(name: LlmProviderName, config: LlmConfig): LlmProvider {
  switch (name) {
    case 'groq':
      return new GroqProvider({ ...config.groq, temperature: config.temperature });
    case 'gemini':
      return new GeminiProvider({ ...config.gemini, temperature: config.temperature });
  }
}

/** The only place that knows every provider. Adding one = a new folder plus a case above. */
export function createLlmProvider(config: LlmConfig): FailoverProvider {
  return new FailoverProvider(config.providers.map((name) => createSingle(name, config)));
}

export { FailoverProvider } from './failover/index.js';
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
