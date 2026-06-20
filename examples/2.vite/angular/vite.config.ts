import { defineConfig } from 'vite'
import angular from '@analogjs/vite-plugin-angular'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

/**
 * In a pnpm workspace, Vite follows symlinks and resolves workspace-linked
 * packages to their real source paths (e.g. `/packages/comark/…`).
 * This breaks Vite's dep optimizer for non-Angular packages like the core
 * `comark` parser — their transitive deps (linkify-it, mdurl, etc.) can't
 * be resolved from the real source path.
 *
 * This plugin maps the core `comark` package back to its `node_modules`
 * symlink path so Vite's dep optimizer bundles it correctly.
 *
 * NOTE: `@comark/angular` is intentionally NOT remapped — it contains
 * Angular `@Component` decorators that Analog's fast-compile plugin
 * must AOT-compile.
 */
function pnpmWorkspaceCompat(): Plugin {
  const packagesDir = resolve(import.meta.dirname, '../../../packages')
  const nodeModules = resolve(import.meta.dirname, 'node_modules')

  const mapping: [RegExp, string][] = [[new RegExp(`^${escapeRegExp(packagesDir)}/comark/`), `${nodeModules}/comark/`]]

  return {
    name: 'comark:pnpm-workspace-compat',
    enforce: 'pre',
    resolveId: {
      order: 'pre',
      async handler(source, importer, options) {
        if (options?.custom?.['comark:pnpm-compat']) return undefined

        const resolved = await this.resolve(source, importer, {
          ...options,
          skipSelf: true,
          custom: { ...options?.custom, 'comark:pnpm-compat': true },
        })
        if (!resolved || resolved.external) return resolved

        for (const [pattern, replacement] of mapping) {
          if (pattern.test(resolved.id)) {
            return { ...resolved, id: resolved.id.replace(pattern, replacement) }
          }
        }
        return resolved
      },
    },
  }
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export default defineConfig({
  plugins: [
    pnpmWorkspaceCompat(),
    angular({
      tsconfig: './tsconfig.json',
      fastCompile: true,
      // define.ts uses @Component inside a factory function — a pattern the
      // fast-compile OXC scanner can't handle (it only finds top-level classes).
      // Excluding it lets Angular's standard JIT/AOT pipeline compile it instead.
      transformFilter: (_code, id) => !id.includes('/define.ts'),
    }),
    tailwindcss(),
  ],
})
