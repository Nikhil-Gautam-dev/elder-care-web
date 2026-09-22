import type { ElderCareMcpClient } from '../mcp/client.js';
import type { AuthContext } from '@eldercare/shared';
import { groq, groqParams, SYSTEM_PROMPT, type ChatMessage } from './base.js';

export class ElderCareAgentMcp {
  private messages: ChatMessage[] = [];

  private readonly maxIterations = 10;

  constructor(private readonly mcp: ElderCareMcpClient) {
    this.messages.push({ role: 'system', content: SYSTEM_PROMPT });
  }

  async run(userInput: string, authContext?: AuthContext): Promise<string> {
    this.messages.push({ role: 'user', content: userInput });

    const mcpTools = await this.mcp.listTools();

    const tools = mcpTools.map((tool) => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description ?? '',
        parameters: (tool.inputSchema as Record<string, unknown>) ?? {
          type: 'object',
          properties: {},
        },
      },
    }));

    console.log(`\n🔧 MCP exposed ${tools.length} tools`);

    for (let iteration = 1; iteration <= this.maxIterations; iteration++) {
      console.log(`\n${'─'.repeat(60)}`);
      console.log(`🤖 ElderCare MCP Agent — iteration ${iteration}`);
      console.log(`${'─'.repeat(60)}`);

      const response = await groq.chat.completions.create(groqParams(this.messages, tools));

      const message = response.choices[0]?.message;

      if (!message) {
        throw new Error('Groq returned an empty response.');
      }

      if (!message.tool_calls?.length) {
        const finalResponse = message.content ?? '';
        this.messages.push({ role: 'assistant', content: finalResponse });
        return finalResponse;
      }

      this.messages.push({
        role: 'assistant',
        content: message.content ?? null,
        tool_calls: message.tool_calls,
      });

      for (const toolCall of message.tool_calls) {
        const toolName = toolCall.function.name;
        const args = (JSON.parse(toolCall.function.arguments) as Record<string, unknown>) ?? {};

        if (authContext && !args['auth']) {
          args['auth'] = authContext;
        }

        console.log(`\n🧠 MCP Tool selected: ${toolName}`);
        console.log(`📦 Arguments:`, args);

        const result = await this.mcp.callTool(toolName, args);

        console.log(`📨 MCP result:`, JSON.stringify(result));

        this.messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          name: toolName,
          content: JSON.stringify(result),
        });
      }
    }

    throw new Error(`Agent exceeded maximum iterations (${this.maxIterations}).`);
  }

  reset(): void {
    this.messages = [{ role: 'system', content: SYSTEM_PROMPT }];
  }

  getCurrentMessages(): ChatMessage[] {
    return this.messages;
  }
}
