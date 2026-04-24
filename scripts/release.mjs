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
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
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
  } catch {
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
  } catch {
    return true
  }
}

/**
 * Discover all packages that have a .release-it.json and read their metadata.
 */
function getReleasablePackages() {
  return readdirSync(packagesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
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

/**
 * Bump a package's version in the pnpm-workspace.yaml catalog. Returns true on
 * success. Other workspace packages depend on this package via "catalog:", so
 * updating the catalog is what makes pnpm publish resolve to the new version.
 */
function updateCatalogVersion(name, newVersion) {
  const yamlPath = join(root, 'pnpm-workspace.yaml')
  const content = readFileSync(yamlPath, 'utf-8')
  const escaped = name.replace(/\./g, '\\.')
  const re = new RegExp(`^(\\s*"?${escaped}"?\\s*:\\s*)\\^?[^\\s#]+`, 'm')
  if (!re.test(content)) {
    console.error(`  Could not find catalog entry for ${name} in pnpm-workspace.yaml`)
    return false
  }
  const updated = content.replace(re, `$1^${newVersion}`)
  if (updated === content) return false
  writeFileSync(yamlPath, updated)
  return true
}

/**
 * Wait for a package to appear on npm, then bump its catalog entry so the next
 * package release picks up the new version through pnpm's catalog resolution.
 */
function waitAndUpdateDependents(pkg) {
  const newVersion = JSON.parse(readFileSync(join(pkg.dir, 'package.json'), 'utf-8')).version

  console.log(`\nWaiting for ${pkg.name}@${newVersion} to be available on npm...`)
  const maxAttempts = 30
  let available = false
  for (let i = 1; i <= maxAttempts; i++) {
    const check = spawnSync('npm', ['view', `${pkg.name}@${newVersion}`, 'version'], {
      cwd: root,
      encoding: 'utf-8',
      env: process.env,
    })
    if (check.status === 0 && check.stdout.trim() === newVersion) {
      available = true
      console.log(`  ${pkg.name}@${newVersion} is now available on npm.\n`)
      break
    }
    console.log(`  Attempt ${i}/${maxAttempts} — not yet available, retrying in 10s...`)
    spawnSync('sleep', ['10'])
  }

  if (!available) {
    console.error(
      `\n${pkg.name}@${newVersion} did not appear on npm after ${maxAttempts} attempts. Skipping catalog bump.`
    )
    return
  }

  console.log(`Bumping ${pkg.name} catalog entry to ^${newVersion}...\n`)
  if (!updateCatalogVersion(pkg.name, newVersion)) return

  const installResult = spawnSync('pnpm', ['install'], { cwd: root, stdio: 'inherit', env: process.env })
  if (installResult.status !== 0) {
    console.error(`  pnpm install failed; leaving catalog change uncommitted.`)
    return
  }

  spawnSync('git', ['add', 'pnpm-workspace.yaml', 'pnpm-lock.yaml'], { cwd: root, stdio: 'inherit', env: process.env })
  spawnSync('git', ['commit', '-m', `chore(deps): bump ${pkg.name} catalog to v${newVersion}`], {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  })
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

// Ensure release order: comark first, then @comark/vue, then the rest, nuxt last
for (const priorityName of ['@comark/vue', 'comark']) {
  const idx = toRelease.findIndex((p) => p.name === priorityName)
  if (idx > 0) {
    const [pkg] = toRelease.splice(idx, 1)
    toRelease.unshift(pkg)
  }
}
const nuxtIdx = toRelease.findIndex((p) => p.name === '@comark/nuxt')
if (nuxtIdx >= 0 && nuxtIdx < toRelease.length - 1) {
  const [nuxtPkg] = toRelease.splice(nuxtIdx, 1)
  toRelease.push(nuxtPkg)
}

const dryLabel = isDry ? ' [DRY RUN]' : ''
console.log(`Releasing ${toRelease.length} package(s)${dryLabel}: ${toRelease.map((p) => p.name).join(', ')}\n`)

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

  // After releasing a core package, wait for npm availability and update dependents
  if ((pkg.name === 'comark' || pkg.name === '@comark/vue') && !isDry) {
    waitAndUpdateDependents(pkg)
  }
}

console.log('\nAll releases complete.')
