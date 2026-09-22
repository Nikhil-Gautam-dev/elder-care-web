import 'dotenv/config';

import express, { type Request, type Response } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

import { ElderCareAgent, ElderCareAgentMcp } from './agents/index.js';
import { ElderCareMcpClient } from './mcp/client.js';
import { config, validateConfig } from './config.js';
import type { AuthContext } from '@eldercare/shared';

validateConfig();

type AnyAgent = ElderCareAgent | ElderCareAgentMcp;

const sessions = new Map<string, AnyAgent>();

let mcpClient: ElderCareMcpClient | null = null;

async function initMcp(): Promise<boolean> {
  if (!process.env['MCP_SERVER_URL']) return false;

  try {
    mcpClient = new ElderCareMcpClient();
    await mcpClient.connect();
    return true;
  } catch (err) {
    console.warn('[agent] MCP connection failed — falling back to hardcoded tools:', err);
    mcpClient = null;
    return false;
  }
}

function createAgent(): AnyAgent {
  if (mcpClient) return new ElderCareAgentMcp(mcpClient);
  return new ElderCareAgent();
}

function getOrCreateSession(sessionId: string): AnyAgent {
  if (!sessions.has(sessionId)) {
    console.log(`[agent] New session created: ${sessionId}`);
    sessions.set(sessionId, createAgent());
  }

  return sessions.get(sessionId)!;
}

function extractAuthContext(req: Request): AuthContext | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const secret = process.env['JWT_SECRET'];
    if (secret) {
      try {
        const decoded = jwt.verify(token, secret) as {
          id: string;
          phone: string;
          role: 'user' | 'admin';
        };
        return { id: decoded.id, phone: decoded.phone, role: decoded.role };
      } catch {
        console.warn('[agent] Invalid JWT in Authorization header.');
      }
    }
  }

  const { auth, userId, userRole, phone } = req.body as {
    auth?: AuthContext;
    userId?: string;
    userRole?: 'user' | 'admin';
    phone?: string;
  };

  if (auth?.id) {
    return auth;
  }

  if (userId) {
    return { id: userId, phone: phone ?? '', role: userRole ?? 'user' };
  }

  return undefined;
}

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: '@eldercare/agent',
    mode: mcpClient ? 'mcp' : 'hardcoded',
    mcpServer: mcpClient ? config.mcpServerUrl : null,
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

  const agent = getOrCreateSession(sid);
  const authContext = extractAuthContext(req);

  console.log(`\n[agent] /chat  sessionId=${sid} authUser=${authContext?.id ?? 'none'}`);
  console.log(`[agent] user: ${message}`);

  const reply =
    'run' in agent && agent instanceof ElderCareAgentMcp
      ? await agent.run(message, authContext)
      : await (agent as ElderCareAgent).run(message);

  console.log(`[agent] reply: ${reply}`);

  res.json({ success: true, data: { reply, sessionId: sid, authUser: authContext?.id } });
});

app.post('/chat/reset', (req: Request, res: Response) => {
  const { sessionId } = req.body as { sessionId?: string };

  if (!sessionId) {
    res.status(400).json({ success: false, error: 'sessionId is required' });
    return;
  }

  const agent = sessions.get(sessionId);

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
  const usingMcp = await initMcp();

  const server = app.listen(config.port, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║              E L D E R C A R E   A G E N T                 ║
║                                                            ║
║      AI agent service powered by Groq + MCP tools          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

  Mode:     ${usingMcp ? `MCP  →  ${config.mcpServerUrl}` : 'Hardcoded tools (no MCP_SERVER_URL set)'}
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
