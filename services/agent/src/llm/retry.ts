import { LlmRateLimitError, LlmUnavailableError } from './errors.js';

const MAX_ATTEMPTS = 4;
const MAX_WAIT_MS = 15_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Runs a provider call, waiting and retrying when the provider is rate-limited or temporarily down.
 * Provider-agnostic: adapters translate their SDK errors into the neutral errors first.
 */
export async function withRetry<T>(call: () => Promise<T>, label = 'llm'): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await call();
    } catch (err) {
      const retryable = err instanceof LlmRateLimitError || err instanceof LlmUnavailableError;
      if (!retryable) throw err;
      if (attempt >= MAX_ATTEMPTS) throw new LlmUnavailableError(`${label} is busy.`);

      const waitMs = (err instanceof LlmRateLimitError && err.retryAfterMs) || attempt * 3000;
      console.warn(
        `[agent] ${label} busy (${err.name}), retrying in ${Math.min(waitMs, MAX_WAIT_MS)}ms`,
      );
      await sleep(Math.min(waitMs, MAX_WAIT_MS));
    }
  }
}
