import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://financelisboabackend.onrender.com', // troque a porta se seu backend rodar em outra
        changeOrigin: true,
        // rewrite: path => path.replace(/^\/api/, '') // use se seu backend NÃO usa '/api'
      }
    }
  }
})
