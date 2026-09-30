/** The provider asked us to slow down (HTTP 429 or equivalent). */
export class LlmRateLimitError extends Error {
  constructor(
    message: string,
    readonly retryAfterMs?: number,
  ) {
    super(message);
    this.name = 'LlmRateLimitError';
  }
}

/** The provider failed on its side (5xx) or stayed unavailable after retries. The route shows a friendly "busy" reply. */
export class LlmUnavailableError extends Error {
  constructor(message = 'The language model is unavailable.') {
    super(message);
    this.name = 'LlmUnavailableError';
  }
}
