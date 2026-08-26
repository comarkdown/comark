#!/usr/bin/env node
// Builds the package stylesheets with lightningcss:
// - dist/components.css and dist/typography.css: @imports inlined, minified
// - dist/styles/*.css: each partial built standalone, minified (for cherry-picking)

import { mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { bundle } from 'lightningcss'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = join(root, 'src/styles')
const distDir = join(root, 'dist')

// No targets on purpose: the source is modern CSS (light-dark(), color-mix(), masks)
// and must not be downleveled. lightningcss inlines @imports and minifies.
const entries = ['components.css', 'typography.css']
const partials = readdirSync(srcDir).filter((file) => file.endsWith('.css') && !entries.includes(file))

mkdirSync(join(distDir, 'styles'), { recursive: true })

for (const entry of entries) {
  const { code } = bundle({ filename: join(srcDir, entry), minify: true })
  writeFileSync(join(distDir, entry), code)
}

for (const file of partials) {
  const { code } = bundle({ filename: join(srcDir, file), minify: true })
  writeFileSync(join(distDir, 'styles', file), code)
}

console.log(`[css] @comark/prose: ${entries.length} bundles + ${partials.length} partials`)
