import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.API_PROXY_TARGET || 'http://localhost:3001';
  const pharmacyTarget = env.PHARMACY_PROXY_TARGET || 'http://localhost:3004';
  const ridesTarget = env.RIDES_PROXY_TARGET || 'http://localhost:3005';
  const mcpTarget = env.MCP_PROXY_TARGET || 'http://localhost:3003';
  const agentTarget = env.AGENT_PROXY_TARGET || 'http://localhost:3002';

  console.info('api-url', apiTarget);
  console.info('agent-url: ', agentTarget);

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/pharmacy-api': {
          target: pharmacyTarget,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/pharmacy-api/, ''),
        },
        '/rides-api': {
          target: ridesTarget,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/rides-api/, ''),
        },
        '/mcp-api': {
          target: mcpTarget,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/mcp-api/, ''),
        },
        '/agent-api': {
          target: agentTarget,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/agent-api/, ''),
        },
      },
    },
  };
});
