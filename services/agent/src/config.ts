export const config = {
  groqApiKey: process.env.GROQ_API_KEY ?? '',
  port: Number(process.env.PORT ?? 3002),
  mcpServerUrl: process.env.MCP_SERVER_URL ?? 'http://localhost:3003/mcp',
} as const;

export function validateConfig(): void {
  if (!config.groqApiKey) {
    throw new Error('[agent] GROQ_API_KEY environment variable is not set');
  }
}
