import type { AuthContext } from '@eldercare/shared';
import { withRetry, type LlmMessage, type LlmProvider, type LlmTool } from '../llm/index.js';
import type { ElderCareMcpClient } from '../mcp/client.js';
import { SYSTEM_PROMPT } from './prompt.js';

const MAX_ITERATIONS = 10;

type ToolSchema = { properties?: Record<string, unknown>; required?: string[] } & Record<
  string,
  unknown
>;

/** A message as shown by GET /chat/history (no provider internals). */
export interface HistoryMessage {
  role: LlmMessage['role'];
  content: string | null;
  toolCalls?: { name: string; args: Record<string, unknown> }[];
  name?: string;
}

function extractText(result: Awaited<ReturnType<ElderCareMcpClient['callTool']>>): string {
  const content = (result as { content?: { type: string; text?: string }[] }).content ?? [];
  return content.map((c) => c.text ?? '').join('\n') || JSON.stringify(result);
}

/**
 * The assistant loop. It only knows the provider-neutral LLM interface, so switching between
 * Groq and Gemini (LLM_PROVIDER) never touches this file.
 */
export class ElderCareAgent {
  private messages: LlmMessage[] = [];

  constructor(
    private readonly mcp: ElderCareMcpClient,
    readonly ownerId: string,
    private readonly llm: LlmProvider,
  ) {}

  /** Tools as the model sees them — the `auth` argument is hidden and injected on call. */
  private async loadTools(): Promise<LlmTool[]> {
    const tools = await this.mcp.listTools();
    return tools.map((tool) => {
      const schema = structuredClone(tool.inputSchema) as ToolSchema;
      delete schema.properties?.['auth'];
      delete schema['$schema']; // boilerplate that only costs tokens
      delete schema['additionalProperties'];
      schema.required = schema.required?.filter((key) => key !== 'auth');
      return { name: tool.name, description: tool.description ?? '', parameters: schema };
    });
  }

  async run(userInput: string, authContext?: AuthContext): Promise<string> {
    this.messages.push({ role: 'user', content: userInput });
    const tools = await this.loadTools();

    for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
      const turn = await withRetry(
        () => this.llm.generate({ system: SYSTEM_PROMPT, messages: this.messages, tools }),
        this.llm.name,
      );

      if (turn.usage?.inputTokens !== undefined) {
        console.log(
          `[agent] ${this.llm.name}/${this.llm.model} tokens in=${turn.usage.inputTokens} out=${turn.usage.outputTokens ?? '?'}`,
        );
      }

      if (turn.toolCalls.length === 0) {
        const finalResponse = turn.text ?? '';
        this.messages.push({ role: 'assistant', content: finalResponse });
        return finalResponse;
      }

      this.messages.push({
        role: 'assistant',
        content: turn.text,
        toolCalls: turn.toolCalls,
        providerState: turn.providerState,
      });

      for (const call of turn.toolCalls) {
        let content: string;

        if (call.invalidArguments) {
          content = JSON.stringify({ success: false, error: 'The tool arguments were not valid.' });
        } else {
          try {
            const args = { ...call.args };
            // Identity always comes from the verified login, never from the model.
            delete args['auth'];
            if (authContext) args['auth'] = authContext;

            console.log(`[agent] tool ${call.name}`, { ...args, auth: authContext?.id });
            content = extractText(await this.mcp.callTool(call.name, args));
          } catch (err) {
            console.error(`[agent] tool ${call.name} failed:`, err);
            content = JSON.stringify({ success: false, error: 'The tool could not be run.' });
          }
        }

        this.messages.push({ role: 'tool', toolCallId: call.id, name: call.name, content });
      }
    }

    throw new Error(`Agent exceeded maximum iterations (${MAX_ITERATIONS}).`);
  }

  reset(): void {
    this.messages = [];
  }

  getCurrentMessages(): HistoryMessage[] {
    return this.messages.map((m) => {
      if (m.role === 'assistant') {
        return {
          role: m.role,
          content: m.content,
          ...(m.toolCalls?.length
            ? { toolCalls: m.toolCalls.map(({ name, args }) => ({ name, args })) }
            : {}),
        };
      }
      if (m.role === 'tool') return { role: m.role, content: m.content, name: m.name };
      return { role: m.role, content: m.content };
    });
  }
}
