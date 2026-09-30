import type { AuthContext } from '@eldercare/shared';
import type { ElderCareMcpClient } from '../mcp/client.js';
import { groq, groqParams, SYSTEM_PROMPT, type ChatMessage } from './base.js';

const MAX_ITERATIONS = 10;
const MAX_LLM_ATTEMPTS = 4;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Thrown when the language model stays unavailable; the route turns it into a friendly reply. */
export class LlmUnavailableError extends Error {}

/** Calls Groq, waiting and retrying when it says we're going too fast (HTTP 429). */
async function completeWithRetry(params: ReturnType<typeof groqParams>) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await groq.chat.completions.create(params);
    } catch (err) {
      const status = (err as { status?: number }).status;
      if (status !== 429 && (status === undefined || status < 500)) throw err;
      if (attempt >= MAX_LLM_ATTEMPTS) throw new LlmUnavailableError('The language model is busy.');

      const retryAfter = Number(
        (err as { headers?: Record<string, string> }).headers?.['retry-after'],
      );
      const waitMs =
        Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : attempt * 3000;
      console.warn(`[agent] LLM busy (status ${status}), retrying in ${waitMs}ms`);
      await sleep(Math.min(waitMs, 15_000));
    }
  }
}

type ToolSchema = { properties?: Record<string, unknown>; required?: string[] } & Record<
  string,
  unknown
>;

function extractText(result: Awaited<ReturnType<ElderCareMcpClient['callTool']>>): string {
  const content = (result as { content?: { type: string; text?: string }[] }).content ?? [];
  return content.map((c) => c.text ?? '').join('\n') || JSON.stringify(result);
}

export class ElderCareAgent {
  private messages: ChatMessage[] = [{ role: 'system', content: SYSTEM_PROMPT }];

  constructor(
    private readonly mcp: ElderCareMcpClient,
    readonly ownerId: string,
  ) {}

  /** Tools as the model sees them — the `auth` argument is hidden and injected on call. */
  private async loadTools() {
    const tools = await this.mcp.listTools();
    return tools.map((tool) => {
      const schema = structuredClone(tool.inputSchema) as ToolSchema;
      delete schema.properties?.['auth'];
      schema.required = schema.required?.filter((key) => key !== 'auth');
      return {
        type: 'function' as const,
        function: { name: tool.name, description: tool.description ?? '', parameters: schema },
      };
    });
  }

  async run(userInput: string, authContext?: AuthContext): Promise<string> {
    this.messages.push({ role: 'user', content: userInput });
    const tools = await this.loadTools();

    for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
      const response = await completeWithRetry(groqParams(this.messages, tools));
      const message = response.choices[0]?.message;
      if (!message) throw new Error('Groq returned an empty response.');

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
        const name = toolCall.function.name;
        let content: string;

        try {
          const args = JSON.parse(toolCall.function.arguments || '{}') as Record<string, unknown>;
          // Identity always comes from the verified login, never from the model.
          delete args['auth'];
          if (authContext) args['auth'] = authContext;

          console.log(`[agent] tool ${name}`, { ...args, auth: authContext?.id });
          content = extractText(await this.mcp.callTool(name, args));
        } catch (err) {
          console.error(`[agent] tool ${name} failed:`, err);
          content = JSON.stringify({ success: false, error: 'The tool could not be run.' });
        }

        this.messages.push({ role: 'tool', tool_call_id: toolCall.id, name, content });
      }
    }

    throw new Error(`Agent exceeded maximum iterations (${MAX_ITERATIONS}).`);
  }

  reset(): void {
    this.messages = [{ role: 'system', content: SYSTEM_PROMPT }];
  }

  getCurrentMessages(): ChatMessage[] {
    return this.messages;
  }
}
