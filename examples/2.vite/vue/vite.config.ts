import { DevTools } from '@vitejs/devtools'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'
import comark from '@comark/vue/vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [
    DevTools(),
    vue(),
    comark(),
    ui({
      prose: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
