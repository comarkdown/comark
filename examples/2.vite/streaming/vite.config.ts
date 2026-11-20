import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import react from '@vitejs/plugin-react'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import angular from '@analogjs/vite-plugin-angular'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

/**
 * In a pnpm workspace Vite resolves the linked `comark` package to its real source path, which breaks the
 * dependency optimizer for its transitive deps. Map it back to the `node_modules` symlink, as the Angular example does.
 */
function pnpmWorkspaceCompat(): Plugin {
  const packagesDir = resolve(import.meta.dirname, '../../../packages')
  const nodeModules = resolve(import.meta.dirname, 'node_modules')
  const pattern = new RegExp(`^${escapeRegExp(packagesDir)}/comark/`)

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
        if (pattern.test(resolved.id)) {
          return { ...resolved, id: resolved.id.replace(pattern, `${nodeModules}/comark/`) }
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
    vue(),
    react(),
    svelte(),
    angular({
      tsconfig: './tsconfig.json',
      fastCompile: true,
      // define.ts builds @Component inside a factory, which the fast-compile scanner cannot handle.
      transformFilter: (_code, id) => !id.includes('/define.ts'),
    }),
  ],
})
