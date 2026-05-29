#!/usr/bin/env node
// Generates styles.ts from styles.css for the devtools renderer.
// The CSS file is the source of truth (for editor autocompletion).
// Run from repo root: node scripts/sync-devtools-css.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/\/$/, '')
const cssPath = join(root, 'packages/comark/src/devtools/renderer/styles.css')
const tsPath = join(root, 'packages/comark/src/devtools/renderer/styles.ts')

const css = readFileSync(cssPath, 'utf-8')

const output = `// @generated — do not edit. Edit styles.css instead, then run: node scripts/sync-devtools-css.mjs
export const STYLES = ${JSON.stringify(css)}
`

const existing = (() => {
  try {
    return readFileSync(tsPath, 'utf-8')
  } catch {
    return ''
  }
})()

if (existing === output) {
  console.log('[sync-devtools-css] styles.ts is up to date')
} else {
  writeFileSync(tsPath, output)
  console.log('[sync-devtools-css] styles.ts updated from styles.css')
}
