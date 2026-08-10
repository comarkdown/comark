import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { build, type Rolldown } from 'vite'
import { describe, expect, it } from 'vitest'

const packageDir = fileURLToPath(new URL('../..', import.meta.url))

async function bundledThemes(entry: string): Promise<string[]> {
  const entryId = join(packageDir, '.shiki-bundle-test.ts')
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    root: packageDir,
    plugins: [
      {
        name: 'test-entry',
        resolveId(id) {
          if (id === 'virtual:test-entry') return entryId
        },
        load(id) {
          if (id !== entryId) return
          return entry
        },
      },
    ],
    build: {
      write: false,
      minify: false,
      rollupOptions: {
        input: 'virtual:test-entry',
      },
    },
  })

  const outputs = (Array.isArray(result) ? result : [result]) as Rolldown.RolldownOutput[]
  return outputs
    .flatMap((output) => output.output)
    .flatMap((chunk) => (chunk.type === 'chunk' ? Object.keys(chunk.modules) : []))
    .filter((id) => id.includes('@shikijs/themes/dist/'))
    .map((id) => id.slice(id.lastIndexOf('/') + 1))
    .sort()
}

describe('shiki consumer bundle', { timeout: 30_000 }, () => {
  it('only bundles explicitly imported themes from the core entry', async () => {
    const themes = await bundledThemes(`
      import shiki from 'comark/plugins/shiki/core'
      import githubLight from 'shiki/dist/themes/github-light.mjs'
      import githubDark from 'shiki/dist/themes/github-dark.mjs'
      console.log(shiki({ themes: { light: githubLight, dark: githubDark } }))
    `)

    expect(themes).toEqual(['github-dark.mjs', 'github-light.mjs'])
  })

  it('keeps Material themes in the default entry', async () => {
    const themes = await bundledThemes(`
      import shiki from 'comark/plugins/shiki'
      console.log(shiki())
    `)

    expect(themes).toEqual(['material-theme-lighter.mjs', 'material-theme-palenight.mjs'])
  })
})
