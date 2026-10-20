import codspeedPlugin from '@codspeed/vitest-plugin'
import { defineConfig } from 'vitest/config'

// CodSpeed benchmark suite (`pnpm bench`). Kept separate from the root
// `vitest.config.ts` so the bundle-size test and the benches never pick up
// each other's files. Outside a CodSpeed run the plugin is a no-op and
// `vitest bench` falls back to regular wall-clock measurements.
export default defineConfig({
  root: import.meta.dirname,
  plugins: [codspeedPlugin()],
  test: {
    environment: 'node',
    globals: false,
    benchmark: {
      include: ['**/*.bench.ts'],
    },
  },
})
