import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'
import comark from '@comark/vue/vite'

export default defineConfig({
  plugins: [
    vue(),
    ui({
      prose: true,
    }),
    comark(),
  ],
})
