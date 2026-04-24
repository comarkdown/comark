import { defineConfig } from 'vite'
import { DevTools } from '@vitejs/devtools'
import { comarkDevtools } from 'comark/vite'

export default defineConfig({
  plugins: [
    DevTools(),
    comarkDevtools(),
  ],
})
