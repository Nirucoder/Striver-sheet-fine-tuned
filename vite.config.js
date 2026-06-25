import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      external: ['express', 'cors', 'pg', 'fs', 'path', 'crypto', 'net', 'tls', 'http', 'https', 'stream', 'os', 'url', 'zlib'],
    },
  },
})
