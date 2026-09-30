import Groq from 'groq-sdk';

import { LlmRateLimitError, LlmUnavailableError } from '../errors.js';
import type { LlmMessage, LlmProvider, LlmRequest, LlmToolCall, LlmTurn } from '../types.js';

export interface GroqProviderOptions {
  apiKey: string;
  model: string;
  temperature: number;
}

/** The slice of the Groq SDK we use — lets tests inject a fake. */
export interface GroqClient {
  chat: { completions: { create(params: any): Promise<any> } }; // eslint-disable-line @typescript-eslint/no-explicit-any
}

type GroqMessage = Record<string, unknown>;

export function toGroqMessages(system: string, messages: LlmMessage[]): GroqMessage[] {
  const out: GroqMessage[] = [{ role: 'system', content: system }];
  for (const message of messages) {
    if (message.role === 'user') {
      out.push({ role: 'user', content: message.content });
    } else if (message.role === 'assistant') {
      out.push({
        role: 'assistant',
        content: message.content,
        ...(message.toolCalls?.length
          ? {
              tool_calls: message.toolCalls.map((call) => ({
                id: call.id,
                type: 'function',
                function: { name: call.name, arguments: JSON.stringify(call.args) },
              })),
            }
          : {}),
      });
    } else {
      out.push({
        role: 'tool',
        tool_call_id: message.toolCallId,
        name: message.name,
        content: message.content,
      });
    }
  }
  return out;
}

function parseToolCalls(raw: unknown): LlmToolCall[] {
  const calls = (raw as { id: string; function: { name: string; arguments: string } }[]) ?? [];
  return calls.map((call) => {
    try {
      const args = JSON.parse(call.function.arguments || '{}') as Record<string, unknown>;
      return { id: call.id, name: call.function.name, args };
    } catch {
      return { id: call.id, name: call.function.name, args: {}, invalidArguments: true };
    }
  });
}

/** Turns Groq SDK failures into the neutral errors the retry layer understands. */
export function mapGroqError(err: unknown): unknown {
  const { status, headers } = err as { status?: number; headers?: Record<string, string> };
  if (status === 429) {
    const seconds = Number(headers?.['retry-after']);
    return new LlmRateLimitError(
      'Groq rate limit reached.',
      Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : undefined,
    );
  }
  if (status !== undefined && status >= 500) return new LlmUnavailableError('Groq is unavailable.');
  return err;
}

export class GroqProvider implements LlmProvider {
  readonly name = 'groq' as const;
  readonly model: string;
  private readonly client: GroqClient;
  private readonly temperature: number;

  constructor(options: GroqProviderOptions, client?: GroqClient) {
    this.model = options.model;
    this.temperature = options.temperature;
    this.client = client ?? (new Groq({ apiKey: options.apiKey }) as unknown as GroqClient);
  }

  async generate(request: LlmRequest): Promise<LlmTurn> {
    let response;
    try {
      response = await this.client.chat.completions.create({
        model: this.model,
        messages: toGroqMessages(request.system, request.messages),
        tools: request.tools.map((tool) => ({
          type: 'function',
          function: { name: tool.name, description: tool.description, parameters: tool.parameters },
        })),
        tool_choice: 'auto',
        temperature: this.temperature,
      });
    } catch (err) {
      throw mapGroqError(err);
    }

    const message = response.choices?.[0]?.message;
    if (!message) throw new Error('Groq returned an empty response.');

    return {
      text: message.content ?? null,
      toolCalls: parseToolCalls(message.tool_calls),
      usage: {
        inputTokens: response.usage?.prompt_tokens,
        outputTokens: response.usage?.completion_tokens,
      },
    };
  }
}
