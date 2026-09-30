import 'dotenv/config';

import express, { type Request, type Response } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

import { ElderCareAgent } from './agents/index.js';
import { createLlmProvider, LlmUnavailableError } from './llm/index.js';
import { ElderCareMcpClient } from './mcp/client.js';
import { config, validateConfig } from './config.js';
import type { AuthContext } from '@eldercare/shared';

validateConfig();

const llm = createLlmProvider(config.llm);

const sessions = new Map<string, ElderCareAgent>();

let mcpClient: ElderCareMcpClient | null = null;

/** Connects to the MCP server on first use (and again after a failed attempt). */
async function getMcp(): Promise<ElderCareMcpClient> {
  if (!mcpClient) {
    const client = new ElderCareMcpClient();
    await client.connect();
    mcpClient = client;
  }
  return mcpClient;
}

async function getOrCreateSession(sessionId: string, ownerId: string): Promise<ElderCareAgent> {
  let agent = sessions.get(sessionId);
  if (!agent) {
    console.log(`[agent] New session created: ${sessionId}`);
    agent = new ElderCareAgent(await getMcp(), ownerId, llm);
    sessions.set(sessionId, agent);
  }
  return agent;
}

/** Identity comes only from a verified JWT — never from the request body. */
function extractAuthContext(req: Request): AuthContext | undefined {
  const authHeader = req.headers.authorization;
  const secret = process.env['JWT_SECRET'];
  if (!authHeader?.startsWith('Bearer ') || !secret) return undefined;

  try {
    const decoded = jwt.verify(authHeader.slice(7), secret) as {
      id: string;
      phone: string;
      role: 'user' | 'admin';
    };
    return { id: decoded.id, phone: decoded.phone, role: decoded.role };
  } catch {
    console.warn('[agent] Invalid JWT in Authorization header.');
    return undefined;
  }
}

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: '@eldercare/agent',
    llm: { provider: llm.name, model: llm.model },
    mcpConnected: mcpClient !== null,
    mcpServer: config.mcpServerUrl,
    sessions: sessions.size,
    timestamp: new Date().toISOString(),
  });
});

app.post('/chat', async (req: Request, res: Response) => {
  const { message, sessionId } = req.body as {
    message?: string;
    sessionId?: string;
  };

  if (!message || typeof message !== 'string' || !message.trim()) {
    res.status(400).json({
      success: false,
      error: 'message is required and must be a non-empty string',
    });
    return;
  }

  const sid =
    sessionId?.trim() || `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const authContext = extractAuthContext(req);
  if (!authContext) {
    res.status(401).json({ success: false, error: 'Please sign in to chat with the assistant.' });
    return;
  }

  const agent = await getOrCreateSession(sid, authContext.id);
  if (agent.ownerId !== authContext.id) {
    res.status(403).json({ success: false, error: 'This conversation belongs to someone else.' });
    return;
  }

  console.log(`\n[agent] /chat  sessionId=${sid} authUser=${authContext.id}`);
  console.log(`[agent] user: ${message}`);

  let reply: string;
  try {
    reply = await agent.run(message, authContext);
  } catch (err) {
    if (!(err instanceof LlmUnavailableError)) throw err;
    res.status(503).json({
      success: false,
      error: "I'm a little busy right now. Please try again in a moment.",
    });
    return;
  }

  console.log(`[agent] reply: ${reply}`);

  res.json({ success: true, data: { reply, sessionId: sid, authUser: authContext.id } });
});

app.post('/chat/reset', (req: Request, res: Response) => {
  const { sessionId } = req.body as { sessionId?: string };

  if (!sessionId) {
    res.status(400).json({ success: false, error: 'sessionId is required' });
    return;
  }

  const agent = sessions.get(sessionId);

  if (agent && agent.ownerId !== extractAuthContext(req)?.id) {
    res.status(403).json({ success: false, error: 'This conversation belongs to someone else.' });
    return;
  }

  if (agent) {
    agent.reset();
    console.log(`[agent] Session reset: ${sessionId}`);
  }

  res.json({ success: true, data: { message: `Session '${sessionId}' has been reset.` } });
});

app.get('/chat/history', (req: Request, res: Response) => {
  const sessionId = String(req.query['sessionId'] ?? '');

  if (!sessionId) {
    res.status(400).json({ success: false, error: 'sessionId query param is required' });
    return;
  }

  const agent = sessions.get(sessionId);

  if (agent && agent.ownerId !== extractAuthContext(req)?.id) {
    res.status(403).json({ success: false, error: 'This conversation belongs to someone else.' });
    return;
  }

  if (!agent) {
    res.status(404).json({ success: false, error: `Session '${sessionId}' not found` });
    return;
  }

  res.json({ success: true, data: { sessionId, messages: agent.getCurrentMessages() } });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use((err: Error, _req: Request, res: Response, _next: express.NextFunction) => {
  console.error('[agent] Unhandled error:', err);
  res.status(500).json({ success: false, error: err.message ?? 'Internal server error' });
});

process.on('unhandledRejection', (reason) => {
  console.error('[agent] Unhandled rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('[agent] Uncaught exception:', err);
  process.exit(1);
});

async function start() {
  await getMcp().catch((err) =>
    console.warn('[agent] MCP not reachable yet — will retry on the first chat:', err),
  );

  const server = app.listen(config.port, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║              E L D E R C A R E   A G E N T                 ║
║                                                            ║
║         AI agent service — LLM + MCP tools                 ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

  LLM:      ${llm.name} (${llm.model})
  Mode:     MCP  →  ${config.mcpServerUrl}
  Server:   http://localhost:${config.port}
  Health:   http://localhost:${config.port}/health
  Chat:     POST http://localhost:${config.port}/chat
  Reset:    POST http://localhost:${config.port}/chat/reset
  History:  GET  http://localhost:${config.port}/chat/history?sessionId=xxx
`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `[agent] Port ${config.port} is already in use. Kill the process on that port and retry.`,
      );
    } else {
      console.error('[agent] Server error:', err);
    }
    process.exit(1);
  });
}

start().catch((err) => {
  console.error('[agent] Failed to start:', err);
  process.exit(1);
});
