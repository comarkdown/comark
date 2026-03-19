#!/usr/bin/env node
/**
 * Unified release script for the comark monorepo.
 *
 * Auto-discovers packages with a .release-it.json, checks which ones have
 * changed since their last release tag, and runs release-it only for those.
 *
 * Usage:
 *   node scripts/release.mjs               # release all changed packages
 *   node scripts/release.mjs --dry         # dry run (no git/npm changes)
 *   node scripts/release.mjs --filter comark        # release a specific package by name
 *   node scripts/release.mjs --filter @comark/vue   # release a specific package by name
 */

import { execSync, spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const packagesDir = join(root, 'packages')

// --- CLI args ---
const args = process.argv.slice(2)
const isDry = args.includes('--dry')
const filterIdx = args.indexOf('--filter')
const filterPkg = filterIdx !== -1 ? args[filterIdx + 1] : null

// --- Helpers ---
function run(cmd, cwd = root) {
  return execSync(cmd, { cwd, encoding: 'utf-8' }).trim()
}

/**
 * Find the most recent git tag matching a prefix pattern (e.g. "comark" → "comark@*").
 * Tags are sorted by version so the highest semver wins.
 */
function getLatestTag(tagPrefix) {
  try {
    const tags = run(`git tag --list "${tagPrefix}@*" --sort=-version:refname`)
    return tags.split('\n').filter(Boolean)[0] ?? null
  }
  catch {
    return null
  }
}

/**
 * Returns true if any file inside pkgDir changed since the given tag.
 * When tag is null (first release) always returns true.
 */
function hasChangesSince(tag, pkgDir) {
  if (!tag) return true
  try {
    const rel = relative(root, pkgDir)
    const diff = run(`git diff --name-only "${tag}"..HEAD -- "${rel}"`)
    return diff.length > 0
  }
  catch {
    return true
  }
}

/**
 * Discover all packages that have a .release-it.json and read their metadata.
 */
function getReleasablePackages() {
  return readdirSync(packagesDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map((d) => {
      const pkgDir = join(packagesDir, d.name)
      const pkgJsonPath = join(pkgDir, 'package.json')
      const releaseItPath = join(pkgDir, '.release-it.json')

      if (!existsSync(pkgJsonPath) || !existsSync(releaseItPath)) return null

      const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'))
      const releaseIt = JSON.parse(readFileSync(releaseItPath, 'utf-8'))

      // tagName is like "comark@${version}" or "@comark/vue@${version}".
      // Strip the release-it template suffix to get the prefix for git tag matching.
      const tagName = releaseIt.git?.tagName ?? ''
      const tagPrefix = tagName.replace(/@\$\{version\}$/, '')

      return { name: pkg.name, dir: pkgDir, tagPrefix }
    })
    .filter(Boolean)
}

// --- Main ---
const packages = getReleasablePackages()

if (packages.length === 0) {
  console.error('No releasable packages found (no packages with .release-it.json).')
  process.exit(1)
}

const toRelease = []

console.log('Checking packages for changes since last release...\n')

for (const pkg of packages) {
  if (filterPkg && pkg.name !== filterPkg) continue

  const latestTag = getLatestTag(pkg.tagPrefix)
  const changed = hasChangesSince(latestTag, pkg.dir)

  const tagInfo = latestTag ? `since ${latestTag}` : 'no previous release'
  const changeLabel = changed ? '\x1B[32mCHANGED\x1B[0m' : '\x1B[90mno changes\x1B[0m'

  console.log(`  ${pkg.name.padEnd(24)} ${changeLabel}  (${tagInfo})`)

  if (changed) toRelease.push(pkg)
}

console.log()

if (toRelease.length === 0) {
  console.log('Nothing to release — all packages are up to date.')
  process.exit(0)
}

const dryLabel = isDry ? ' [DRY RUN]' : ''
console.log(`Releasing ${toRelease.length} package(s)${dryLabel}: ${toRelease.map(p => p.name).join(', ')}\n`)

for (const pkg of toRelease) {
  console.log(`${'─'.repeat(60)}`)
  console.log(`  Releasing ${pkg.name}${dryLabel}`)
  console.log(`${'─'.repeat(60)}\n`)

  const releaseItArgs = isDry ? ['--dry-run'] : []
  const result = spawnSync('pnpm', ['exec', 'release-it', ...releaseItArgs], {
    cwd: pkg.dir,
    stdio: 'inherit',
    env: process.env,
  })

  if (result.status !== 0) {
    console.error(`\nRelease failed for ${pkg.name} (exit ${result.status}).`)
    process.exit(result.status ?? 1)
  }
}

console.log('\nAll releases complete.')
