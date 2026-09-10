import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    projects: [
      { test: { name: 'server', include: ['test/**/*.test.{ts,tsx}'], exclude: ['test/**/*.browser.test.tsx'] } },
      {
        test: {
          name: 'client',
          include: ['test/**/*.browser.test.tsx'],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium', headless: true }],
          },
        },
      },
    ],
  },
})
