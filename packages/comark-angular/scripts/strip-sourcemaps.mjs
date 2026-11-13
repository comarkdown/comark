// ng-packagr always emits source maps for the FESM bundles and has no option to
// turn them off. They roughly double the published size, so drop them after the
// build along with the `sourceMappingURL` comments that point to them.
import { readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = fileURLToPath(new URL('../dist', import.meta.url))
const SOURCE_MAP_COMMENT = /\n?\/\/# sourceMappingURL=\S+\s*$/

for (const entry of await readdir(dist, { recursive: true, withFileTypes: true })) {
  if (!entry.isFile()) continue
  const file = join(entry.parentPath, entry.name)
  if (entry.name.endsWith('.map')) {
    await rm(file)
  } else if (entry.name.endsWith('.mjs') || entry.name.endsWith('.js')) {
    const source = await readFile(file, 'utf8')
    const stripped = source.replace(SOURCE_MAP_COMMENT, '\n')
    if (stripped !== source) await writeFile(file, stripped)
  }
}
