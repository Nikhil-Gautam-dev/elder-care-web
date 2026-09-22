import { toolDefinitions, toGroqTools } from '../tools/index.js';
import { groq, groqParams, executeTool, SYSTEM_PROMPT, type ChatMessage } from './base.js';

export class ElderCareAgent {
  private messages: ChatMessage[] = [];

  private readonly maxIterations = 10;

  private readonly tools = toGroqTools(toolDefinitions);

  constructor() {
    this.messages.push({ role: 'system', content: SYSTEM_PROMPT });
  }

  async run(userInput: string): Promise<string> {
    this.messages.push({ role: 'user', content: userInput });

    for (let iteration = 1; iteration <= this.maxIterations; iteration++) {
      console.log(`\n${'─'.repeat(60)}`);
      console.log(`🤖 ElderCare Agent — iteration ${iteration}`);
      console.log(`${'─'.repeat(60)}`);

      const response = await groq.chat.completions.create(groqParams(this.messages, this.tools));

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
        tool_calls: message.tool_calls.map((call) => ({
          id: call.id,
          type: 'function' as const,
          function: { name: call.function.name, arguments: call.function.arguments },
        })),
      });

      for (const toolCall of message.tool_calls) {
        const name = toolCall.function.name;
        const args = toolCall.function.arguments;

        console.log(`\n🧠 Tool selected: ${name}`);
        console.log(`📦 Arguments: ${args}`);

        const result = await executeTool(name, args);

        console.log(`📨 Tool result: ${result}`);

        this.messages.push({ role: 'tool', content: result, tool_call_id: toolCall.id, name });
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
