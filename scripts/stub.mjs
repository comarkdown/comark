#!/usr/bin/env node
// Creates development stub files in dist/ that re-export from src/
// so bundlers (Vite, vitest) resolve TypeScript sources directly.
// Run from a package directory: node ../../scripts/stub.mjs

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'

const cwd = process.cwd()
const srcDir = join(cwd, 'src')
const distDir = join(cwd, 'dist')
const pkgName = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf-8')).name

function walkDir(dir) {
  const files = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      files.push(...walkDir(full))
    }
    else if (/\.tsx?$/.test(entry) && !entry.endsWith('.d.ts')) {
      files.push(full)
    }
  }
  return files
}

const srcFiles = walkDir(srcDir)

for (const srcFile of srcFiles) {
  const rel = relative(srcDir, srcFile) // e.g. 'index.ts', 'ast/index.ts'
  const base = rel.replace(/\.tsx?$/, '') // e.g. 'index', 'ast/index'
  const distJs = join(distDir, base + '.js')
  const distDts = join(distDir, base + '.d.ts')

  mkdirSync(dirname(distJs), { recursive: true })

  // Relative path from the stub file back to the source file
  let srcRel = relative(dirname(distJs), srcFile).replace(/\\/g, '/')
  if (!srcRel.startsWith('.')) srcRel = './' + srcRel

  const content = readFileSync(srcFile, 'utf-8')
  const hasDefault = /(?:^|\n)export\s+default\b/.test(content)
    || /(?:^|\n)export\s*\{\s*default\s*\}/.test(content)

  // JS stub: re-export from source (bundlers handle .ts imports)
  writeFileSync(distJs,
    `export * from '${srcRel}'\n`
    + (hasDefault ? `export { default } from '${srcRel}'\n` : ''),
  )

  // .d.ts stub: TypeScript follows this to find types from source
  const srcRelNoExt = srcRel.replace(/\.tsx?$/, '')
  writeFileSync(distDts,
    `export * from '${srcRelNoExt}'\n`
    + (hasDefault ? `export { default } from '${srcRelNoExt}'\n` : ''),
  )
}

console.log(`[stub] ${pkgName}: ${srcFiles.length} files`)
