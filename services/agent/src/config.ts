import { LLM_PROVIDERS, type LlmConfig, type LlmProviderName } from './llm/index.js';

const num = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return value !== undefined && value !== '' && Number.isFinite(parsed) ? parsed : fallback;
};

const rawProvider = (process.env.LLM_PROVIDER ?? 'groq').trim().toLowerCase();

export const config = {
  port: Number(process.env.PORT ?? 3002),
  mcpServerUrl: process.env.MCP_SERVER_URL ?? 'http://localhost:3003/mcp',
  llm: {
    provider: rawProvider as LlmProviderName,
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

/** Fails fast at startup; only the selected provider's key is required. */
export function validateConfig(): void {
  const provider = config.llm.provider;
  if (!LLM_PROVIDERS.includes(provider)) {
    throw new Error(
      `[agent] Unknown LLM_PROVIDER '${rawProvider}'. Use one of: ${LLM_PROVIDERS.join(', ')}.`,
    );
  }

  const keyName = `${provider.toUpperCase()}_API_KEY`;
  if (!config.llm[provider].apiKey) {
    throw new Error(
      `[agent] ${keyName} environment variable is not set (LLM_PROVIDER=${provider}).`,
    );
  }
}
