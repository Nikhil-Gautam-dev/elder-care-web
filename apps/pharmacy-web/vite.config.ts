import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const pharmacyTarget = env.PHARMACY_PROXY_TARGET || 'http://localhost:3004';

  console.info('pharmacy-url', pharmacyTarget);

  return {
    plugins: [react()],
    server: {
      port: 5174,
      proxy: {
        '/pharmacy-api': {
          target: pharmacyTarget,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/pharmacy-api/, ''),
        },
      },
    },
  };
});
