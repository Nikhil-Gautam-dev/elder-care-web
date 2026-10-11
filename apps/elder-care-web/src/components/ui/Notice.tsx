import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

/** Inline message. Errors interrupt screen readers; successes are announced politely. */
export const Notice: React.FC<{ kind: 'success' | 'error'; children: React.ReactNode }> = ({
  kind,
  children,
}) => {
  const error = kind === 'error';
  const Icon = error ? AlertCircle : CheckCircle2;
  return (
    <div
      role={error ? 'alert' : 'status'}
      style={{
        background: error ? 'var(--danger-light)' : 'var(--success-light)',
        color: error ? 'var(--danger)' : 'var(--success)',
        border: `1px solid ${error ? 'var(--danger)' : 'var(--success)'}`,
        padding: 'var(--space-3) var(--space-4)',
        borderRadius: 'var(--radius-sm)',
        marginBottom: 'var(--space-4)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-2)',
        fontWeight: 600,
      }}
    >
      <Icon size={20} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
      <span>{children}</span>
    </div>
  );
};
