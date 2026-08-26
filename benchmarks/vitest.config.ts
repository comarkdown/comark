import codspeedPlugin from '@codspeed/vitest-plugin'
import { defineConfig } from 'vitest/config'

/**
 * Isolated CodSpeed / Vitest bench config.
 * Keep this separate from package unit-test configs so CI can run benches
 * without dragging in the rest of the monorepo test graph.
 */
export default defineConfig({
  plugins: [codspeedPlugin()],
  test: {
    environment: 'node',
    globals: false,
    // bench files only — never pull in unit tests
    include: ['**/*.bench.ts'],
  },
})
