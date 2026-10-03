import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.API_PROXY_TARGET || 'http://localhost:3001';
  const agentTarget = env.AGENT_PROXY_TARGET || 'http://localhost:3002';

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
