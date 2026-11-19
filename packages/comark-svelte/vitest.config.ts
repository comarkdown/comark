import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  plugins: [svelte()],
  optimizeDeps: {
    include: ['katex', 'beautiful-mermaid'],
  },
  test: {
    projects: [
      {
        extends: './vitest.config.ts',
        test: {
          name: 'client',
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium', headless: true }],
          },
          include: ['test/**/*.svelte.{test,spec}.{js,ts}'],
        },
      },
      {
        extends: './vitest.config.ts',
        test: {
          name: 'server',
          environment: 'node',
          include: ['test/**/*.{test,spec}.{js,ts}'],
          exclude: ['test/**/*.svelte.{test,spec}.{js,ts}'],
        },
      },
    ],
  },
})
