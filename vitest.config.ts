import { defineConfig } from 'vitest/config'

// Root-level test suite: the bundle-size check and the cross-package sanitizer suite.
// Scoped to `test/` so it does not pick up the per-package test files.
export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['test/**/*.test.ts'],
  },
})
