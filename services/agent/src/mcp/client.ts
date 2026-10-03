import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

import { config } from '../config.js';

export class ElderCareMcpClient {
  private client: Client;
  private transport: StreamableHTTPClientTransport;

  constructor() {
    this.client = new Client({ name: 'eldercare-agent', version: '0.0.1' });
    this.transport = new StreamableHTTPClientTransport(new URL(config.mcpServerUrl));
  }

  async connect(): Promise<void> {
    console.info(`[mcp-client] Connecting to ${config.mcpServerUrl}`);
    await this.client.connect(this.transport);
    console.info('[mcp-client] Connected');
  }

  async listTools() {
    const response = await this.client.listTools();
    return response.tools;
  }

  async callTool(name: string, args: Record<string, unknown>) {
    return this.client.callTool({ name, arguments: args });
  }

  async close(): Promise<void> {
    await this.transport.close();
  }
}
