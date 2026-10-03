/**
 * Provider-neutral types. The agent only ever sees these; each provider adapter translates
 * them to and from its own SDK's wire format and is the only code that imports that SDK.
 */

export const LLM_PROVIDERS = ['groq', 'gemini'] as const;
export type LlmProviderName = (typeof LLM_PROVIDERS)[number];

export interface LlmTool {
  name: string;
  description: string;
  /** JSON Schema for the tool's arguments (an object schema). */
  parameters: Record<string, unknown>;
}

export interface LlmToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
  /** The model produced arguments that were not valid JSON; `args` is empty. */
  invalidArguments?: boolean;
}

export type LlmMessage =
  | { role: 'user'; content: string }
  | {
      role: 'assistant';
      content: string | null;
      toolCalls?: LlmToolCall[];
      /** Opaque data only the producing provider understands; passed back to it unchanged. */
      providerState?: unknown;
    }
  | { role: 'tool'; toolCallId: string; name: string; content: string };

export interface LlmRequest {
  system: string;
  messages: LlmMessage[];
  tools: LlmTool[];
}

export interface LlmTurn {
  text: string | null;
  toolCalls: LlmToolCall[];
  providerState?: unknown;
  usage?: { inputTokens?: number; outputTokens?: number };
}

export interface LlmProvider {
  readonly name: LlmProviderName;
  readonly model: string;
  generate(request: LlmRequest): Promise<LlmTurn>;
}
