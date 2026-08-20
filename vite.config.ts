import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
  base: '/static/k-slot/',
  plugins: [react()],
  server: {
    host: true,
    open: false,
  },
  build: {
    outDir: '../../app/static/k-slot',
    emptyOutDir: true,
    sourcemap: false,
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
