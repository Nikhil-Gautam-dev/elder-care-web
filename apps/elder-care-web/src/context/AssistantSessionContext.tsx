import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { resetChatSession, sendChatMessage, type ChatMessage } from '../services/agentApi';
import { useAuth } from './AuthContext';

export type UiMessage = ChatMessage & { error?: boolean; retryText?: string };

interface AssistantSession {
  messages: UiMessage[];
  loading: boolean;
  /** Sends a message. Resolves with the assistant's message (or the error message) once done. */
  send: (text: string) => Promise<UiMessage | null>;
  /** Clears this conversation and the assistant's memory of it. */
  reset: () => Promise<void>;
}

const Ctx = createContext<AssistantSession | null>(null);

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const newSessionId = () => `web_session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

/**
 * Holds the current conversation in memory only. It survives moving between pages, but a refresh,
 * a closed tab or logging out starts fresh, and the assistant gets a matching fresh session id.
 */
export const AssistantSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userId } = useAuth();
  const [sessionId, setSessionId] = useState(newSessionId);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const sessionRef = useRef(sessionId);
  sessionRef.current = sessionId;

  // A different person (or logging out) never inherits someone else's conversation.
  const lastUser = useRef(userId);
  useEffect(() => {
    if (lastUser.current === userId) return;
    lastUser.current = userId;
    setMessages([]);
    setLoading(false);
    setSessionId(newSessionId());
  }, [userId]);

  const send = useCallback(async (text: string): Promise<UiMessage | null> => {
    const sid = sessionRef.current;
    setMessages((prev) => [
      // Only the newest failure keeps its "Try again".
      ...prev.map((m) => (m.retryText ? { ...m, retryText: undefined } : m)),
      { id: `msg_${Date.now()}`, sender: 'user', text, timestamp: now() },
    ]);
    setLoading(true);

    let result: UiMessage;
    try {
      const res = await sendChatMessage(text, sid);
      result = {
        id: `reply_${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        timestamp: now(),
      };
    } catch (err) {
      // A timeout does not prove the request failed, so never claim an outcome either way.
      result = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        error: true,
        retryText: text,
        text: `I couldn't get an answer just now (${(err as Error).message || 'no connection'}). If you were ordering or booking, check the Home page before trying again so it isn't done twice.`,
        timestamp: now(),
      };
    }
    // Ignore an answer that arrives after the conversation was reset or the user changed.
    if (sessionRef.current === sid) {
      setMessages((prev) => [...prev, result]);
      setLoading(false);
      return result;
    }
    return null;
  }, []);

  const reset = useCallback(async () => {
    try {
      await resetChatSession(sessionRef.current);
    } catch {
      // The screen is cleared either way; the server session expires on its own.
    }
    setMessages([]);
    setLoading(false);
  }, []);

  return <Ctx.Provider value={{ messages, loading, send, reset }}>{children}</Ctx.Provider>;
};

export const useAssistantSession = (): AssistantSession => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAssistantSession must be used within AssistantSessionProvider');
  return ctx;
};
