import { defineConfig } from 'vitest/config'

/**
 * Suites that need a live OpenTUI renderer, and therefore native FFI — which
 * Node exposes from 26.1 behind `--experimental-ffi`.
 *
 * Kept in its own config, not merged with the default one, so `pnpm test` stays
 * runnable on any supported Node: `mergeConfig` concatenates `include`, which
 * would drag the unit suite in here too.
 */
export default defineConfig({
  resolve: {
    alias: {
      // OpenTUI targets Bun, whose resolver accepts extensionless CommonJS
      // subpaths. Node's ESM resolver does not, so `@opentui/react`'s import of
      // `react-reconciler/constants` has to be pointed at the real file.
      'react-reconciler/constants': 'react-reconciler/constants.js',
    },
  },
  test: {
    include: ['test/paint/**/*.test.tsx'],
    // Externalised dependencies bypass Vite's resolver, where the alias lives.
    server: { deps: { inline: ['@opentui/react', '@opentui/core'] } },
    // The renderer is process-wide native state, so files must not overlap.
    fileParallelism: false,
    // Note for anyone extending this: the `--experimental-ffi` flag has to come
    // from `NODE_OPTIONS` (which `scripts/paint.mjs` sets) because Vitest runs
    // test files in workers that inherit the environment but not the parent's
    // flags — `poolOptions.forks.execArgv` does not get it through.
  },
})
