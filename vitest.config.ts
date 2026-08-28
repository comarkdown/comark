import { defineConfig } from 'vitest/config'
import codspeedPlugin from '@codspeed/vitest-plugin'

// Root-level test suite (currently just the bundle-size check).
// Scoped to `test/` so it does not pick up the per-package test files.
// Benchmarks live in `benchmarks/` and are reported to CodSpeed in CI.
export default defineConfig({
  plugins: [codspeedPlugin()],
  test: {
    environment: 'node',
    globals: false,
    include: ['test/**/*.test.ts'],
    benchmark: {
      include: ['benchmarks/**/*.bench.ts'],
    },
  },
})
