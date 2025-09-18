import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        additionalData: `@import "@/assets/styles/variables.less";`
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://app.iexue.com',
        changeOrigin: true,
        secure: true,
        bypass: (req) => {
          // 不代理 /api/user/api/register 路径
          if (req.url?.includes('/api/user/api/register')) {
            return req.url
          }
        }
      }
    }
  }
})