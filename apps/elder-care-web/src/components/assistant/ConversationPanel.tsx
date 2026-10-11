import React, { useEffect, useRef } from 'react';
import { Bot, User as UserIcon, Volume2, X } from 'lucide-react';
import { Button } from '../ui';
import type { UiMessage } from '../../context/AssistantSessionContext';

interface Props {
  open: boolean;
  messages: UiMessage[];
  loading: boolean;
  canListen: boolean;
  onClose: () => void;
  onListen: (text: string) => void;
  onRetry: (text: string) => void;
}

const FOCUSABLE = 'button:not([disabled]), [href], input, select, [tabindex]:not([tabindex="-1"])';

/** This conversation only, newest at the bottom. A side panel on desktop, a sheet on phones. */
export const ConversationPanel: React.FC<Props> = ({
  open,
  messages,
  loading,
  canListen,
  onClose,
  onListen,
  onRetry,
}) => {
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const endRef = useRef<HTMLLIElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: 'end' });
  }, [open, messages, loading]);

  if (!open) return null;

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <aside
        ref={panelRef}
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="conversation-title"
      >
        <div className="drawer-head">
          <h2 id="conversation-title">This conversation</h2>
          <button
            type="button"
            ref={closeRef}
            className="btn btn-secondary btn-small"
            onClick={onClose}
            aria-label="Close conversation"
          >
            <X size={18} aria-hidden="true" /> Close
          </button>
        </div>
        <p className="drawer-note">
          This conversation isn’t saved. It clears when you refresh this page or log out.
        </p>

        <ol className="drawer-list">
          {messages.length === 0 && <li className="drawer-empty">Nothing here yet.</li>}
          {messages.map((m) => (
            <li key={m.id} className={`chat-bubble ${m.sender} ${m.error ? 'error' : ''}`}>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <span aria-hidden="true" style={{ flexShrink: 0, paddingTop: 2 }}>
                  {m.sender === 'assistant' ? (
                    <Bot size={18} color={m.error ? 'var(--danger)' : 'var(--primary)'} />
                  ) : (
                    <UserIcon size={18} />
                  )}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="sr-only">
                    {m.sender === 'user' ? 'You said: ' : 'ElderCare: '}
                  </span>
                  <div style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{m.text}</div>
                  <div className="drawer-meta">
                    <time>{m.timestamp}</time>
                    {m.sender === 'assistant' && !m.error && canListen && (
                      <button
                        type="button"
                        className="chat-listen-btn"
                        onClick={() => onListen(m.text)}
                      >
                        <Volume2 size={14} aria-hidden="true" /> Listen
                      </button>
                    )}
                    {m.retryText && (
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => onRetry(m.retryText!)}
                      >
                        Try again
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
          {loading && (
            <li className="chat-bubble assistant" aria-label="ElderCare is thinking">
              <span className="thinking" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </li>
          )}
          <li ref={endRef} aria-hidden="true" />
        </ol>
      </aside>
    </>
  );
};
