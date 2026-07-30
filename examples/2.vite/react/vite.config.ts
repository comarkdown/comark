import { DevTools } from '@vitejs/devtools'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import comarkDevtools from '@comark/devtools/vite'

export default defineConfig({
  plugins: [DevTools(), react(), comarkDevtools, tailwindcss()],
})
