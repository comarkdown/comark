import { DevTools } from '@vitejs/devtools'
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import comarkDevtools from '@comark/devtools/vite'

export default defineConfig({
  plugins: [DevTools(), svelte(), comarkDevtools(), tailwindcss()],
})
