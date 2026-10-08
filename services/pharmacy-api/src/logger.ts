/**
 * Timestamps every console line (ISO, UTC) so latency can be read off the logs.
 * Import this first in the entrypoint.
 */

for (const level of ['log', 'info', 'warn', 'error', 'debug'] as const) {
  const original = console[level].bind(console);
  console[level] = (...args: unknown[]) => original(`[${new Date().toISOString()}]`, ...args);
}

const MAX_BODY = 2000;

/** JSON for logs: secrets masked, long bodies truncated. */
export function preview(value: unknown): string {
  let text: string;
  try {
    text =
      JSON.stringify(value, (key, v) =>
        /^(x-api-key|authorization|token|otp|password)$/i.test(key) ? '***' : v,
      ) ?? 'undefined';
  } catch {
    text = String(value);
  }
  return text.length > MAX_BODY ? `${text.slice(0, MAX_BODY)}…(${text.length} chars)` : text;
}
