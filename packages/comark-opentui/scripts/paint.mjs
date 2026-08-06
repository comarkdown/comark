#!/usr/bin/env node
/**
 * Runs the paint suite, which needs a live OpenTUI renderer and therefore
 * native FFI.
 *
 * Node exposes `node:ffi` from 26.1 behind `--experimental-ffi`. The flag has to
 * arrive via `NODE_OPTIONS` rather than on this process's argv: Vitest runs test
 * files in forked workers, which inherit the environment but not the parent's
 * flags (`poolOptions.forks.execArgv` does not get it through either).
 *
 * Wrapped in a script rather than inlined as `NODE_OPTIONS=… vitest` so it also
 * works in shells without env-prefix syntax, and so an unsupported Node gets a
 * real message instead of `node: bad option`.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const MIN_MAJOR = 26
const MIN_MINOR = 1

function isNewEnough(version) {
  const [major, minor] = version.replace(/^v/, '').split('.').map(Number)

  return major > MIN_MAJOR || (major === MIN_MAJOR && minor >= MIN_MINOR)
}

/**
 * A Node new enough to have `node:ffi`, or null.
 *
 * The search matters because version managers that shim `node` — Volta above all
 * — set the Node for the whole child-process tree from the workspace root's pin,
 * so a maintainer cannot opt this one script in by prefixing PATH. Set
 * `COMARK_NODE` to skip it.
 */
function findNode() {
  if (isNewEnough(process.versions.node)) {
    return process.execPath
  }

  const candidates = [
    process.env.COMARK_NODE,
    '/opt/homebrew/opt/node@26/bin/node',
    '/opt/homebrew/bin/node',
    '/usr/local/opt/node@26/bin/node',
    '/usr/local/bin/node',
  ].filter(Boolean)

  for (const candidate of candidates) {
    if (candidate.includes('/') && !existsSync(candidate)) {
      continue
    }

    const { status, stdout } = spawnSync(candidate, ['--version'], { encoding: 'utf-8' })

    if (status === 0 && isNewEnough(stdout.trim())) {
      return candidate
    }
  }

  return null
}

const node = findNode()

if (!node) {
  console.error(
    `Skipping the paint suite: needs Node >= ${MIN_MAJOR}.${MIN_MINOR} for node:ffi, found ${process.versions.node} ` +
      'and no newer one on this machine.\n' +
      'Point COMARK_NODE at a suitable binary to run it. The runtime-agnostic suite ' +
      '(`pnpm test`) covers tag resolution and layout logic on any Node.'
  )
  process.exit(0)
}

if (node !== process.execPath) {
  console.error(`[paint] using ${node} for native FFI`)
}

// Resolved through the manifest because Vitest's exports map does not expose its
// CLI entry directly.
const manifestPath = createRequire(import.meta.url).resolve('vitest/package.json')
const { bin } = JSON.parse(readFileSync(manifestPath, 'utf8'))
const vitest = join(dirname(manifestPath), typeof bin === 'string' ? bin : bin.vitest)

const { status } = spawnSync(node, [vitest, 'run', '--config', 'vitest.paint.config.ts', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} --experimental-ffi`.trim(),
  },
})

process.exit(status ?? 1)
