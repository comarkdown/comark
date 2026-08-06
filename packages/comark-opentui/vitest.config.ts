import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      // OpenTUI targets Bun, whose resolver accepts extensionless CommonJS
      // subpaths. Node's ESM resolver does not, so `@opentui/react`'s import of
      // `react-reconciler/constants` has to be pointed at the real file for the
      // suite to load under Vitest.
      'react-reconciler/constants': 'react-reconciler/constants.js',
    },
  },
  test: {
    // `test/paint` needs a live OpenTUI renderer, whose native FFI is Bun-only.
    // Those run via `pnpm test:paint`; Vitest keeps to the runtime-agnostic half.
    include: ['test/*.test.ts'],
    server: {
      deps: {
        // Externalised dependencies bypass Vite's resolver, which is where the
        // alias above lives — OpenTUI has to be inlined for it to apply.
        inline: ['@opentui/react', '@opentui/core'],
      },
    },
    // OpenTUI paints through native bindings and a process-wide renderer, so
    // suites cannot safely share a worker.
    fileParallelism: false,
  },
})
