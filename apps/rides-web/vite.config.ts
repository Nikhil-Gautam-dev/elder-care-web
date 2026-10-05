import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const ridesTarget = env.RIDES_PROXY_TARGET || 'http://localhost:3005';

  return {
    plugins: [react()],
    server: {
      port: 5175,
      proxy: {
        '/rides-api': {
          target: ridesTarget,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/rides-api/, ''),
        },
      },
    },
  };
});
