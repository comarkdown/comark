#!/usr/bin/env node
/**
 * Launches a gallery entry with native FFI enabled.
 *
 *   node run.mjs gallery.tsx
 *
 * OpenTUI paints through native FFI, which Node exposes from 26.1 behind
 * `--experimental-ffi`. Two things make this more than a flag in the package
 * script:
 *
 *   - putting the flag there directly makes an older Node bail with
 *     `node: bad option` before any of our code can explain why;
 *   - version managers that shim `node` (Volta, in particular) rewrite PATH for
 *     the whole child-process tree from the pin resolved at the *workspace root*,
 *     so `PATH=…:$PATH pnpm dev:opentui` and a pin in this package are both
 *     ignored.
 *
 * So: check the running Node, and if it is too old, look for one that is new
 * enough rather than telling the user to change their global toolchain. Set
 * `COMARK_NODE` to skip the search.
 *
 * `stdio: 'inherit'` hands the real TTY to the child, which the renderer needs
 * for raw mode and resize events.
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'

const MIN_MAJOR = 26
const MIN_MINOR = 1

const entry = process.argv[2]

if (!entry) {
  console.error('usage: node run.mjs <entry.tsx>')
  process.exit(1)
}

function isNewEnough(version) {
  const [major, minor] = version.replace(/^v/, '').split('.').map(Number)

  return major > MIN_MAJOR || (major === MIN_MAJOR && minor >= MIN_MINOR)
}

/** Version of a candidate binary, or null when it is missing or not runnable. */
function versionOf(binary) {
  if (binary.includes('/') && !existsSync(binary)) {
    return null
  }

  const { status, stdout } = spawnSync(binary, ['--version'], { encoding: 'utf-8' })

  return status === 0 ? stdout.trim() : null
}

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
    const version = versionOf(candidate)

    if (version && isNewEnough(version)) {
      return candidate
    }
  }

  return null
}

const node = findNode()

if (!node) {
  console.error(
    `\nThis example needs Node >= ${MIN_MAJOR}.${MIN_MINOR}, and the one running it is ${process.versions.node}.\n\n` +
      `OpenTUI renders through native FFI, which Node only exposes from ${MIN_MAJOR}.${MIN_MINOR}\n` +
      `behind --experimental-ffi. No Node that new was found.\n\n` +
      `  COMARK_NODE=/path/to/node pnpm dev:opentui    # point at one directly\n` +
      `  volta install node@${MIN_MAJOR}                          # or nvm/fnm equivalent\n\n` +
      `Note for Volta users: prefixing PATH does not work here, because the shim\n` +
      `sets the Node for the whole process tree from the workspace root's pin.\n\n` +
      `Nothing else in the repo needs this: parsing, the component map and\n` +
      `\`pnpm test\` all run on any supported Node.\n`
  )
  process.exit(1)
}

if (node !== process.execPath) {
  console.error(`[gallery] using ${node} (${versionOf(node)}) for native FFI`)
}

const { status } = spawnSync(node, ['--experimental-ffi', '--import', 'tsx', entry, ...process.argv.slice(3)], {
  stdio: 'inherit',
})

process.exit(status ?? 1)
