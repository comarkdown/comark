import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { playwright } from '@vitest/browser-playwright'

const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'

export default defineConfig({
  plugins: [svelte()],
  optimizeDeps: {
    include: ['katex', 'beautiful-mermaid'],
  },
  test: {
    projects: [
      isCI
        ? (null as any)
        : {
            extends: './vitest.config.ts',
            test: {
              name: 'client',
              browser: {
                enabled: !isCI,
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
    ].filter(Boolean),
  },
})
