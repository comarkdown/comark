import { defineConfig } from 'vitest/config'

// Root-level test suite (currently just the bundle-size check).
// Scoped to `test/` so it does not pick up the per-package test files.
export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['test/**/*.test.ts'],
  },
})
