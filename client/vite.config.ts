import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ['.allverze.com'],
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  preview: {
    port: 5173,
  },
})
