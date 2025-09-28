import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_BACKEND_URL': JSON.stringify(env.VITE_BACKEND_URL)
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5000', // Always proxy to local backend in development
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})