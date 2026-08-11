#!/usr/bin/env node
// Syncs missing plugin re-exports from comark into framework packages (comark-vue, comark-react).
// For each plugin in comark/dist/plugins/ not present in a framework package's dist/plugins/,
// creates a .js and .d.ts file that re-exports from 'comark/plugins/<name>'.
//
// Run from repo root: node scripts/sync-plugins.mjs

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/\/$/, '')
const packagesDir = join(root, 'packages')

const comarkPluginsDir = join(packagesDir, 'comark', 'dist', 'plugins')

// Framework packages to sync plugins into
const frameworkPackages = [
  'comark-vue',
  'comark-react',
  'comark-svelte',
  'comark-html',
  'comark-ansi',
  'comark-nuxt',
  'comark-angular',
]

// Collect plugin names from comark/dist/plugins/ (by .js files), including
// nested entry points such as `shiki/core`.
function collectPlugins(dir) {
  const plugins = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      plugins.push(...collectPlugins(path))
    } else if (entry.name.endsWith('.js') && !entry.name.endsWith('.mjs')) {
      plugins.push(relative(comarkPluginsDir, path).slice(0, -3))
    }
  }
  return plugins
}

const comarkPlugins = collectPlugins(comarkPluginsDir)

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
      hasDefault = /^export default /m.test(content) || /export\s*\{[^}]*\bdefault\b/.test(content)
    }

    const reexport =
      `export * from 'comark/plugins/${name}';\n` +
      (hasDefault ? `export { default } from 'comark/plugins/${name}';\n` : '')

    if (existsSync(join(srcPluginsDir, `${name}.ts`))) {
      continue
    }

    for (const ext of ['.js', '.d.ts']) {
      const outputPath = join(distPluginsDir, `${name}${ext}`)
      mkdirSync(dirname(outputPath), { recursive: true })
      writeFileSync(outputPath, reexport)
      created++
    }
  }

  if (created === 0) {
    console.log(`[sync-plugins] ${pkg}: all plugins already present`)
  }
}
