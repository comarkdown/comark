import { DevTools } from '@vitejs/devtools'
import { defineConfig } from 'vite'
import { comarkDevtools } from 'comark/devtools/vite'

export default defineConfig({
  plugins: [DevTools(), comarkDevtools()],
})
