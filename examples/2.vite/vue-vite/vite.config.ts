import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import nuxtUi from '@nuxt/ui/vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    nuxtUi({
      prose: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
