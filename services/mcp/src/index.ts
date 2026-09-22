import 'dotenv/config';

import { createServer } from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

import { createMcpServer } from './mcp/server.js';
import { connectDb, closeDb } from './config/db.js';

const mcpServer = createMcpServer();
const PORT = Number(process.env['PORT'] ?? 3003);

const httpServer = createServer(async (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        success: true,
        message: 'mcp-server is up and running',
      }),
    );
    return;
  }

  if (req.url !== '/mcp') {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
    return;
  }

  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on('close', () => {
      transport.close();
    });

    await mcpServer.connect(transport);
    await transport.handleRequest(req, res);
  } catch (error) {
    console.error('[MCP] Request error:', error);

    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal MCP server error.' }));
    }
  }
});

async function start(): Promise<void> {
  try {
    await connectDb();
  } catch (err) {
    console.warn('[MCP] DB connection warning:', err);
  }

  httpServer.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║            E L D E R C A R E   M C P                      ║
║                                                            ║
║      Model Context Protocol server for ElderCare          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

  Endpoint:  http://localhost:${PORT}/mcp

  Tools registered:
    - get_elder_profile
    - get_family_members
    - get_medication_preference
    - get_ride_preference
    - send_family_notification
    - get_pending_invites
`);
  });
}

start().catch((err) => {
  console.error('[MCP] Failed to start:', err);
  process.exit(1);
});

process.on('SIGINT', async () => {
  await closeDb();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDb();
  process.exit(0);
});
