import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': { // 修正为 /api，匹配后端 API 端点
        target: 'http://115.190.112.102:8080', // 后端地址
        changeOrigin: true, // 改变请求头中的 Origin 为 target
      },
    },
  },
});
// 跨域问题由AI助手解决