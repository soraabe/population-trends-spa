import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        // ローカル開発時、/api を本番/プレビューのサーバレス関数にプロキシ
        '/api': {
          target: process.env.DEV_API_BASE || 'https://population-trends-spa.vercel.app',
          changeOrigin: true,
          secure: true,
        },
      },
    },
  }
})
