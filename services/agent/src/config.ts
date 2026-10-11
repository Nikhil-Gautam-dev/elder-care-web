import { LLM_PROVIDERS, type LlmConfig, type LlmProviderName } from './llm/index.js';

const num = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return value !== undefined && value !== '' && Number.isFinite(parsed) ? parsed : fallback;
};

/** Ordered fallback list. LLM_PROVIDERS wins; a lone LLM_PROVIDER still works as a one-item list. */
const rawProviders = (process.env.LLM_PROVIDERS ?? process.env.LLM_PROVIDER ?? 'gemini,groq')
  .split(',')
  .map((name) => name.trim().toLowerCase())
  .filter(Boolean);

export const config = {
  port: Number(process.env.PORT ?? 3002),
  mcpServerUrl: process.env.MCP_SERVER_URL ?? 'http://localhost:3003/mcp',
  llm: {
    providers: rawProviders as LlmProviderName[],
    temperature: Math.min(2, Math.max(0, num(process.env.LLM_TEMPERATURE, 0.4))),
    groq: {
      apiKey: process.env.GROQ_API_KEY ?? '',
      model: process.env.GROQ_MODEL?.trim() || 'openai/gpt-oss-120b',
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY ?? '',
      model: process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash',
    },
  } satisfies LlmConfig,
} as const;

/**
 * Fails fast on unknown names. A provider without an API key is dropped with a warning;
 * startup fails only if none is left. Mutates `config.llm.providers` to the usable list.
 */
export function validateConfig(): void {
  const unknown = rawProviders.filter((name) => !LLM_PROVIDERS.includes(name as LlmProviderName));
  if (unknown.length) {
    throw new Error(
      `[agent] Unknown LLM provider '${unknown.join(', ')}'. Use any of: ${LLM_PROVIDERS.join(', ')}.`,
    );
  }

  const usable: LlmProviderName[] = [];
  for (const provider of new Set(config.llm.providers)) {
    if (config.llm[provider].apiKey) usable.push(provider);
    else
      console.warn(`[agent] ${provider.toUpperCase()}_API_KEY is not set — ${provider} disabled.`);
  }
  if (usable.length === 0) {
    throw new Error(
      `[agent] No usable LLM provider: set an API key for at least one of ${rawProviders.join(', ')}.`,
    );
  }
  (config.llm as { providers: LlmProviderName[] }).providers = usable;
}
