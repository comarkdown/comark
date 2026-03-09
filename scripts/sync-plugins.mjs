#!/usr/bin/env node
// Syncs missing plugin re-exports from comark into framework packages (comark-vue, comark-react).
// For each plugin in comark/dist/plugins/ not present in a framework package's dist/plugins/,
// creates a .js and .d.ts file that re-exports from 'comark/plugins/<name>'.
//
// Run from repo root: node scripts/sync-plugins.mjs

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import { join, basename } from 'node:path'

const root = new URL('..', import.meta.url).pathname.replace(/\/$/, '')
const packagesDir = join(root, 'packages')

const comarkPluginsDir = join(packagesDir, 'comark', 'dist', 'plugins')

// Framework packages to sync plugins into
const frameworkPackages = ['comark-vue', 'comark-react']

// Collect plugin names from comark/dist/plugins/ (by .js files)
const comarkPlugins = readdirSync(comarkPluginsDir)
  .filter(f => f.endsWith('.js') && !f.endsWith('.mjs'))
  .map(f => basename(f, '.js'))

for (const pkg of frameworkPackages) {
  const distPluginsDir = join(packagesDir, pkg, 'dist', 'plugins')
  mkdirSync(distPluginsDir, { recursive: true })

  // Determine which plugins already have a dist file
  const existing = existsSync(distPluginsDir)
    ? new Set(
        readdirSync(distPluginsDir)
          .filter(f => f.endsWith('.js') && !f.endsWith('.mjs'))
          .map(f => basename(f, '.js')),
      )
    : new Set()

  const missing = comarkPlugins.filter(name => !existing.has(name))

  for (const name of missing) {
    // Check if the comark plugin has a default export in its .d.ts
    const dtsPath = join(comarkPluginsDir, `${name}.d.ts`)
    const hasDefault = existsSync(dtsPath) &&
      /^export default /m.test(readFileSync(dtsPath, 'utf-8'))

    const reexport = `export * from 'comark/plugins/${name}';\n` +
      (hasDefault ? `export { default } from 'comark/plugins/${name}';\n` : '')

    writeFileSync(join(distPluginsDir, `${name}.js`), reexport)
    writeFileSync(join(distPluginsDir, `${name}.d.ts`), reexport)
    console.log(`[sync-plugins] ${pkg}/dist/plugins/${name}: created`)
  }

  if (missing.length === 0) {
    console.log(`[sync-plugins] ${pkg}: all plugins already present`)
  }
}
