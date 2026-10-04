import React, { useCallback, useEffect, useState } from 'react';
import { Activity, X, RefreshCw } from 'lucide-react';

type Status = 'idle' | 'checking' | 'up' | 'down';

interface ServiceState {
  status: Status;
  ms?: number;
  detail?: string;
}

interface ServiceDef {
  id: string;
  label: string;
  url: string;
  // Extra detail/verdict derived from the health payload
  inspect?: (body: any) => { ok: boolean; detail?: string };
}

// Render free-tier services sleep; the first request wakes them, which can take a minute.
const WAKE_TIMEOUT_MS = 90_000;

const SERVICES: ServiceDef[] = [
  { id: 'api', label: 'API', url: '/api/health' },
  {
    id: 'agent',
    label: 'Agent',
    url: '/agent-api/health',
    inspect: (b) => ({
      ok: true,
      detail: b?.llm ? `${b.llm.provider} / ${b.llm.model}` : undefined,
    }),
  },
  { id: 'pharmacy', label: 'Pharmacy API', url: '/pharmacy-api/health' },
  { id: 'mcp', label: 'MCP', url: '/mcp-api/health' },
];

const initial = (): Record<string, ServiceState> =>
  Object.fromEntries(SERVICES.map((s) => s.id).map((id) => [id, { status: 'idle' }]));

const COLORS: Record<Status, string> = {
  idle: '#9ca3af',
  checking: '#f59e0b',
  up: '#16a34a',
  down: '#dc2626',
};

const LABELS: Record<Status, string> = {
  idle: 'Not checked',
  checking: 'Checking / waking…',
  up: 'Up',
  down: 'Down',
};

async function ping(url: string): Promise<{ ok: boolean; ms: number; body?: any; error?: string }> {
  const started = performance.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), WAKE_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
    const ms = Math.round(performance.now() - started);
    let body: any;
    try {
      body = await res.json();
    } catch {
      // non-JSON body (e.g. a platform "waking up" page)
    }
    return res.ok && body ? { ok: true, ms, body } : { ok: false, ms, error: `HTTP ${res.status}` };
  } catch (err) {
    const aborted = err instanceof DOMException && err.name === 'AbortError';
    return {
      ok: false,
      ms: Math.round(performance.now() - started),
      error: aborted ? 'Timed out' : 'Unreachable',
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Hidden service-health panel. Open with the faint dot in the bottom-right corner
 * or Ctrl+Shift+H. Pinging every service also wakes any that are asleep.
 */
export const HealthCheck: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [states, setStates] = useState<Record<string, ServiceState>>(initial);
  const running = Object.values(states).some((s) => s.status === 'checking');

  const set = (id: string, state: ServiceState) => setStates((prev) => ({ ...prev, [id]: state }));

  const checkAll = useCallback(async () => {
    setStates(Object.fromEntries(Object.keys(initial()).map((id) => [id, { status: 'checking' }])));

    await Promise.all(
      SERVICES.map(async (svc) => {
        const r = await ping(svc.url);
        if (!r.ok) {
          set(svc.id, { status: 'down', ms: r.ms, detail: r.error });
          return;
        }
        const verdict = svc.inspect?.(r.body) ?? { ok: true };
        set(svc.id, { status: verdict.ok ? 'up' : 'down', ms: r.ms, detail: verdict.detail });
      }),
    );
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Run once each time the panel opens
  useEffect(() => {
    if (open) void checkAll();
  }, [open, checkAll]);

  const rows = SERVICES;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Service health"
        title="Service health"
        style={{
          position: 'fixed',
          right: 8,
          bottom: 8,
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: 'none',
          background: 'transparent',
          color: 'var(--text-secondary)',
          opacity: 0.15,
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.15')}
      >
        <Activity size={14} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Service health"
          style={{
            position: 'fixed',
            right: 12,
            bottom: 40,
            width: 320,
            maxWidth: 'calc(100vw - 24px)',
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-sm)',
            padding: '0.75rem 1rem',
            zIndex: 1001,
            fontSize: '0.9rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <strong>Service health</strong>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => void checkAll()}
                disabled={running}
                title="Check all and wake sleeping services"
                aria-label="Re-check"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: running ? 'default' : 'pointer',
                }}
              >
                <RefreshCw size={16} className={running ? 'spin' : undefined} />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <ul
            style={{
              listStyle: 'none',
              margin: '0.75rem 0 0',
              padding: 0,
              display: 'grid',
              gap: 8,
            }}
          >
            {rows.map(({ id, label }) => {
              const s: ServiceState = states[id] ?? { status: 'idle' };
              return (
                <li key={id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: COLORS[s.status],
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ flex: 1 }}>
                    {label}
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {LABELS[s.status]}
                      {s.detail ? ` · ${s.detail}` : ''}
                    </span>
                  </span>
                  {s.ms !== undefined && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {s.ms >= 1000 ? `${(s.ms / 1000).toFixed(1)}s` : `${s.ms}ms`}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
          <p style={{ margin: '0.75rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Sleeping services can take up to a minute to wake.
          </p>
        </div>
      )}
    </>
  );
};
