import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: path.resolve(__dirname, 'postcss.config.cjs')
  },
  server: {
    port: 5174,
    hmr: true,
    watch: {
      usePolling: false
    },
    middlewareMode: false
  },
  base: '/admin',
  preview: {
    port: 5174
  }
})
