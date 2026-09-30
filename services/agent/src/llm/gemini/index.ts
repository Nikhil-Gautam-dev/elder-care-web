import { GoogleGenAI, type Content, type GenerateContentResponse, type Part } from '@google/genai';

import { LlmRateLimitError, LlmUnavailableError } from '../errors.js';
import type { LlmMessage, LlmProvider, LlmRequest, LlmToolCall, LlmTurn } from '../types.js';

export interface GeminiProviderOptions {
  apiKey: string;
  model: string;
  temperature: number;
}

/** The slice of the Gemini SDK we use — lets tests inject a fake. */
export interface GeminiClient {
  models: { generateContent(params: any): Promise<GenerateContentResponse> }; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/** Gemini does not always return call ids; we make our own and recognise them by this prefix. */
const SYNTHETIC_ID_PREFIX = 'gemini_call_';

/** Removes JSON-Schema keywords Gemini's function declarations reject (recursively). */
export function sanitizeSchema(schema: unknown): unknown {
  if (Array.isArray(schema)) return schema.map(sanitizeSchema);
  if (schema && typeof schema === 'object') {
    return Object.fromEntries(
      Object.entries(schema as Record<string, unknown>)
        .filter(([key]) => key !== '$schema' && key !== 'additionalProperties')
        .map(([key, value]) => [key, sanitizeSchema(value)]),
    );
  }
  return schema;
}

/** Gemini wants function results as an object; tool output is JSON text, so use it as is when it is an object. */
function toFunctionResponse(content: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(content);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return { output: parsed };
  } catch {
    return { output: content };
  }
}

export function toGeminiContents(messages: LlmMessage[]): Content[] {
  const contents: Content[] = [];
  let pendingResults: Part[] = [];

  const flushResults = () => {
    if (pendingResults.length) {
      contents.push({ role: 'user', parts: pendingResults });
      pendingResults = [];
    }
  };

  for (const message of messages) {
    if (message.role === 'tool') {
      pendingResults.push({
        functionResponse: {
          ...(message.toolCallId.startsWith(SYNTHETIC_ID_PREFIX) ? {} : { id: message.toolCallId }),
          name: message.name,
          response: toFunctionResponse(message.content),
        },
      });
      continue;
    }

    flushResults();

    if (message.role === 'user') {
      contents.push({ role: 'user', parts: [{ text: message.content }] });
    } else if (message.providerState) {
      // Replay exactly what the model produced (keeps thought signatures intact for multi-step tool use).
      contents.push(message.providerState as Content);
    } else {
      const parts: Part[] = [];
      if (message.content) parts.push({ text: message.content });
      for (const call of message.toolCalls ?? []) {
        parts.push({
          functionCall: {
            ...(call.id.startsWith(SYNTHETIC_ID_PREFIX) ? {} : { id: call.id }),
            name: call.name,
            args: call.args,
          },
        });
      }
      contents.push({ role: 'model', parts });
    }
  }
  flushResults();
  return contents;
}

/** Pulls a "retry in N seconds" hint out of Gemini's error text when it includes one. */
function retryDelayMs(message: string): number | undefined {
  const match = /retryDelay"?\s*[:=]\s*"?(\d+(?:\.\d+)?)s/i.exec(message);
  return match ? Math.ceil(Number(match[1]) * 1000) : undefined;
}

/** Turns Gemini SDK failures into the neutral errors the retry layer understands. */
export function mapGeminiError(err: unknown): unknown {
  const { status, message } = err as { status?: number; message?: string };
  if (status === 429) {
    return new LlmRateLimitError('Gemini rate limit reached.', retryDelayMs(message ?? ''));
  }
  if (status !== undefined && status >= 500)
    return new LlmUnavailableError('Gemini is unavailable.');
  return err;
}

export class GeminiProvider implements LlmProvider {
  readonly name = 'gemini' as const;
  readonly model: string;
  private readonly client: GeminiClient;
  private readonly temperature: number;

  constructor(options: GeminiProviderOptions, client?: GeminiClient) {
    this.model = options.model;
    this.temperature = options.temperature;
    this.client =
      client ?? (new GoogleGenAI({ apiKey: options.apiKey }) as unknown as GeminiClient);
  }

  async generate(request: LlmRequest): Promise<LlmTurn> {
    let response: GenerateContentResponse;
    try {
      response = await this.client.models.generateContent({
        model: this.model,
        contents: toGeminiContents(request.messages),
        config: {
          systemInstruction: request.system,
          temperature: this.temperature,
          ...(request.tools.length
            ? {
                tools: [
                  {
                    functionDeclarations: request.tools.map((tool) => ({
                      name: tool.name,
                      description: tool.description,
                      parametersJsonSchema: sanitizeSchema(tool.parameters),
                    })),
                  },
                ],
              }
            : {}),
        },
      });
    } catch (err) {
      throw mapGeminiError(err);
    }

    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts ?? [];

    const text = parts
      .filter((part) => part.text && !part.thought)
      .map((part) => part.text)
      .join('');

    let counter = 0;
    const toolCalls: LlmToolCall[] = parts
      .filter((part) => part.functionCall?.name)
      .map((part) => ({
        id: part.functionCall!.id ?? `${SYNTHETIC_ID_PREFIX}${Date.now()}_${counter++}`,
        name: part.functionCall!.name!,
        args: part.functionCall!.args ?? {},
      }));

    if (!text && toolCalls.length === 0) {
      throw new Error(
        `Gemini returned no content (finishReason: ${candidate?.finishReason ?? 'unknown'}).`,
      );
    }

    return {
      text: text || null,
      toolCalls,
      providerState: toolCalls.length ? candidate?.content : undefined,
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount,
        outputTokens: response.usageMetadata?.candidatesTokenCount,
      },
    };
  }
}
