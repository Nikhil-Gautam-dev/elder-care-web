/**
 * Timestamps every console line (ISO, UTC) so latency can be read off the logs, and
 * provides helpers to log outgoing requests / incoming responses with their duration.
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
        /^(x-api-key|authorization|token|otp)$/i.test(key) ? '***' : v,
      ) ?? 'undefined';
  } catch {
    text = String(value);
  }
  return text.length > MAX_BODY ? `${text.slice(0, MAX_BODY)}…(${text.length} chars)` : text;
}

/** fetch() that logs the outgoing request and the response (or failure) with latency. */
export async function loggedFetch(tag: string, url: string, init: RequestInit): Promise<Response> {
  const started = Date.now();
  const method = init.method ?? 'GET';
  console.info(
    `[${tag}] → ${method} ${url} body=${init.body ? preview(safeParse(init.body)) : '-'}`,
  );
  try {
    const response = await fetch(url, init);
    console.info(`[${tag}] ← ${response.status} ${method} ${url} (${Date.now() - started}ms)`);
    return response;
  } catch (err) {
    console.error(`[${tag}] ✗ ${method} ${url} failed after ${Date.now() - started}ms:`, err);
    throw err;
  }
}

function safeParse(body: unknown): unknown {
  try {
    return JSON.parse(String(body));
  } catch {
    return String(body);
  }
}
