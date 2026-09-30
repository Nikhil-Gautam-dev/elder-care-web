import { getAuthToken } from './api';

const AGENT_BASE = '/agent-api';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export async function sendChatMessage(
  message: string,
  sessionId: string,
): Promise<{ reply: string; sessionId: string }> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${AGENT_BASE}/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message, sessionId }),
  });

  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.error || 'Failed to send message to AI assistant');
  }

  return body.data;
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function resetChatSession(sessionId: string): Promise<void> {
  const res = await fetch(`${AGENT_BASE}/chat/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ sessionId }),
  });

  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.error || 'Failed to reset chat session');
  }
}

export async function getChatHistory(sessionId: string): Promise<any[]> {
  const res = await fetch(`${AGENT_BASE}/chat/history?sessionId=${encodeURIComponent(sessionId)}`, {
    headers: authHeaders(),
  });
  const body = await res.json();
  if (!res.ok || !body.success) {
    return [];
  }
  return body.data?.messages || [];
}
