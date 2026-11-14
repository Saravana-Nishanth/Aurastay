import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During development the SPA runs on its own dev server and simply forwards
// API + uploaded-image requests to Express, so there is no CORS setup to fight.
const backendPort = process.env.PORT || 4002;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': `http://localhost:${backendPort}`,
      '/uploads': `http://localhost:${backendPort}`,
    },
  },
});
