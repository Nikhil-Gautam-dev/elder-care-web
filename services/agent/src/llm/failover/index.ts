import { LlmRateLimitError, LlmUnavailableError } from '../errors.js';
import type { LlmMessage, LlmProvider, LlmProviderName, LlmRequest, LlmTurn } from '../types.js';

const MAX_RATE_LIMIT_COOLDOWN_MS = 120_000;
const DEFAULT_COOLDOWN_MS = 60_000;
const AUTH_COOLDOWN_MS = 300_000;

/** What a provider's `providerState` looks like once the failover layer has tagged it with its owner. */
interface TaggedState {
  provider: LlmProviderName;
  state: unknown;
}

const isTagged = (value: unknown): value is TaggedState =>
  typeof value === 'object' && value !== null && 'provider' in value && 'state' in value;

export interface ProviderStatus {
  provider: LlmProviderName;
  model: string;
  state: 'ready' | 'cooling';
  coolingUntil?: string;
  lastError?: string;
}

/**
 * Tries providers in order and moves to the next one on ANY error, putting the failed one on a
 * cooldown so later requests skip it. Providers know nothing about each other; this class is the
 * only place that does. In-memory only — a restart clears the cooldowns.
 */
export class FailoverProvider implements LlmProvider {
  private readonly cooldownUntil = new Map<LlmProviderName, number>();
  private readonly lastError = new Map<LlmProviderName, string>();
  private lastUsed: LlmProvider;

  constructor(
    private readonly providers: LlmProvider[],
    private readonly now: () => number = Date.now,
  ) {
    if (providers.length === 0) throw new Error('FailoverProvider needs at least one provider.');
    this.lastUsed = providers[0]!;
  }

  /** The provider that served the most recent call (first in order before any call). */
  get name(): LlmProviderName {
    return this.lastUsed.name;
  }

  get model(): string {
    return this.lastUsed.model;
  }

  status(): ProviderStatus[] {
    const now = this.now();
    return this.providers.map((p) => {
      const until = this.cooldownUntil.get(p.name) ?? 0;
      const cooling = until > now;
      return {
        provider: p.name,
        model: p.model,
        state: cooling ? 'cooling' : 'ready',
        ...(cooling ? { coolingUntil: new Date(until).toISOString() } : {}),
        ...(this.lastError.has(p.name) ? { lastError: this.lastError.get(p.name) } : {}),
      };
    });
  }

  async generate(request: LlmRequest): Promise<LlmTurn> {
    const now = this.now();
    const ready = this.providers.filter((p) => (this.cooldownUntil.get(p.name) ?? 0) <= now);
    // Everyone is cooling: still try, starting with whoever recovers first, rather than failing blind.
    const order = ready.length
      ? ready
      : [...this.providers].sort(
          (a, b) => (this.cooldownUntil.get(a.name) ?? 0) - (this.cooldownUntil.get(b.name) ?? 0),
        );

    let lastErr: unknown;
    for (const [index, provider] of order.entries()) {
      try {
        const turn = await provider.generate({
          ...request,
          messages: this.messagesFor(provider, request.messages),
        });
        this.lastUsed = provider;
        this.cooldownUntil.delete(provider.name);
        this.lastError.delete(provider.name);
        return turn.providerState === undefined
          ? turn
          : { ...turn, providerState: { provider: provider.name, state: turn.providerState } };
      } catch (err) {
        lastErr = err;
        const cooldown = this.cooldownFor(err);
        this.cooldownUntil.set(provider.name, this.now() + cooldown);
        this.lastError.set(provider.name, err instanceof Error ? err.message : String(err));
        const next = order[index + 1];
        console.warn(
          `[agent] ${provider.name}/${provider.model} failed (${err instanceof Error ? err.name : 'error'}: ${
            err instanceof Error ? err.message : String(err)
          }) → cooling ${Math.round(cooldown / 1000)}s` +
            (next ? `, falling back to ${next.name}` : ', no provider left to try'),
        );
      }
    }

    throw new LlmUnavailableError(
      `All language models failed${lastErr instanceof Error ? `: ${lastErr.message}` : '.'}`,
    );
  }

  /** Gives each provider only the opaque state it produced itself; unwraps our tag. */
  private messagesFor(provider: LlmProvider, messages: LlmMessage[]): LlmMessage[] {
    return messages.map((message) => {
      if (message.role !== 'assistant' || message.providerState === undefined) return message;
      const { providerState, ...rest } = message;
      return isTagged(providerState) && providerState.provider === provider.name
        ? { ...rest, providerState: providerState.state }
        : rest;
    });
  }

  private cooldownFor(err: unknown): number {
    if (err instanceof LlmRateLimitError) {
      return Math.min(err.retryAfterMs ?? DEFAULT_COOLDOWN_MS, MAX_RATE_LIMIT_COOLDOWN_MS);
    }
    const status = (err as { status?: number } | null)?.status;
    if (status === 401 || status === 403) return AUTH_COOLDOWN_MS;
    return DEFAULT_COOLDOWN_MS;
  }
}
