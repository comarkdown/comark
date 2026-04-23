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
const frameworkPackages = ['comark-vue', 'comark-react', 'comark-svelte', 'comark-html', 'comark-ansi', 'comark-nuxt']

// Collect plugin names from comark/dist/plugins/ (by .js files)
const comarkPlugins = readdirSync(comarkPluginsDir)
  .filter((f) => f.endsWith('.js') && !f.endsWith('.mjs'))
  .map((f) => basename(f, '.js'))

for (const pkg of frameworkPackages) {
  const distPluginsDir = join(packagesDir, pkg, 'dist', 'plugins')
  const srcPluginsDir = join(packagesDir, pkg, 'src', 'plugins')
  mkdirSync(distPluginsDir, { recursive: true })

  let created = 0

  for (const name of comarkPlugins) {
    // Check if the comark plugin has a default export in its .d.ts
    const comarkDtsPath = join(comarkPluginsDir, `${name}.d.ts`)
    let hasDefault = existsSync(comarkDtsPath)
    if (hasDefault) {
      const content = readFileSync(comarkDtsPath, 'utf-8')
      hasDefault = /^export default /m.test(content) || /export\s*\{\s*default/.test(content)
    }

    const reexport =
      `export * from 'comark/plugins/${name}';\n` +
      (hasDefault ? `export { default } from 'comark/plugins/${name}';\n` : '')

    if (existsSync(join(srcPluginsDir, `${name}.ts`))) {
      continue
    }

    for (const ext of ['.js', '.d.ts']) {
      writeFileSync(join(distPluginsDir, `${name}${ext}`), reexport)
      created++
    }
  }

  if (created === 0) {
    console.log(`[sync-plugins] ${pkg}: all plugins already present`)
  }
}
