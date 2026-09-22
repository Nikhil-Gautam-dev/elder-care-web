import Groq from 'groq-sdk';

import { config } from '../config.js';
import { toolExecutors } from '../tools/index.js';

export const groq = new Groq({ apiKey: config.groqApiKey });

export const MODEL = 'openai/gpt-oss-120b';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_call_id?: string;
  name?: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
};

export const SYSTEM_PROMPT = `
You are ElderCare Assistant, a warm and patient digital helper designed
specifically for elderly users and their families.

You help with:
- Looking up the elder's profile and preferences
- Checking and managing family member connections
- Finding pharmacy/medication preferences
- Checking ride preferences
- Sending notifications to family members
- Reviewing pending family invitations

You have access to tools. Use them whenever you need information.

IMPORTANT RULES:

1. Do not invent information. Always use tools to get real data.

2. Use tools whenever specific information is required.

3. You can call multiple tools in sequence to gather context.

4. After every tool result, decide what to do next.

5. Never claim an action was completed unless the tool confirmed it.

6. Sending a family notification is an external action — always confirm
   with the user what message will be sent before calling send_family_notification.

7. If the user says "yes", "go ahead", "do it", "confirm" after you asked
   for confirmation, treat that as approval for the pending action.

8. Keep responses warm, clear, and conversational. Use simple language.

9. Address the user respectfully. Be patient and helpful.

10. If you don't know something, say so honestly and suggest what you can help with.

You are operating in a development environment. Tool data is simulated.
`.trim();

export async function executeTool(name: string, argumentString: string): Promise<string> {
  const executor = toolExecutors[name];

  if (!executor) {
    return JSON.stringify({
      success: false,
      error: `Unknown tool: ${name}`,
    });
  }

  let args: Record<string, unknown>;

  try {
    args = JSON.parse(argumentString);
  } catch {
    return JSON.stringify({
      success: false,
      error: 'Tool arguments were not valid JSON.',
    });
  }

  try {
    const result = await executor(args);
    return JSON.stringify(result);
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown tool error.',
    });
  }
}

export function groqParams(messages: ChatMessage[], tools: unknown[]) {
  return {
    model: MODEL,
    messages: messages as Parameters<typeof groq.chat.completions.create>[0]['messages'],
    tools: tools as Parameters<typeof groq.chat.completions.create>[0]['tools'],
    tool_choice: 'auto' as const,
    temperature: 0,
  };
}
