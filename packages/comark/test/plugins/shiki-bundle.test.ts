import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { build, type Rolldown } from 'vite'
import { describe, expect, it } from 'vitest'

const packageDir = fileURLToPath(new URL('../..', import.meta.url))

async function bundledModules(entry: string, filter: (id: string) => boolean): Promise<string[]> {
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
    .filter(filter)
    .map((id) => id.slice(id.lastIndexOf('/') + 1))
    .sort()
}

async function bundledThemes(entry: string): Promise<string[]> {
  return bundledModules(entry, (id) => id.includes('@shikijs/themes/dist/'))
}

async function bundledLanguages(entry: string): Promise<string[]> {
  return bundledModules(entry, (id) => id.includes('@shikijs/langs/dist/'))
}

function isHighlighterModule(id: string, highlighter: 'rangi' | 'shiki'): boolean {
  if (highlighter === 'rangi') {
    return id.includes('/node_modules/rangi/') || id.includes('/node_modules/.pnpm/rangi@')
  }
  return (
    id.includes('/node_modules/shiki/') ||
    id.includes('/node_modules/@shikijs/') ||
    id.includes('/node_modules/.pnpm/shiki@') ||
    id.includes('/node_modules/.pnpm/@shikijs+')
  )
}

describe('shiki consumer bundle', { timeout: 30_000 }, () => {
  it('keeps the standalone language entries isolated by highlighter', async () => {
    const shikiModulesInRangi = await bundledModules(
      `
        import comarkLanguage from 'comark/plugins/rangi/language-comark'
        console.log(comarkLanguage)
      `,
      (id) => isHighlighterModule(id, 'shiki')
    )
    const rangiModulesInShiki = await bundledModules(
      `
        import comarkLanguages from 'comark/plugins/shiki/language-comark'
        console.log(comarkLanguages)
      `,
      (id) => isHighlighterModule(id, 'rangi')
    )

    expect(shikiModulesInRangi).toEqual([])
    expect(rangiModulesInShiki).toEqual([])
  })

  it('only bundles explicitly imported themes from the core entry', async () => {
    const themes = await bundledThemes(`
      import shiki from 'comark/plugins/shiki/core'
      import javascript from 'shiki/dist/langs/javascript.mjs'
      import githubLight from 'shiki/dist/themes/github-light.mjs'
      import githubDark from 'shiki/dist/themes/github-dark.mjs'
      console.log(shiki({
        languages: [javascript],
        themes: { light: githubLight, dark: githubDark },
      }))
    `)

    expect(themes).toEqual(['github-dark.mjs', 'github-light.mjs'])
  })

  it('only bundles explicitly imported languages from the core entry', async () => {
    const languages = await bundledLanguages(`
      import shiki from 'comark/plugins/shiki/core'
      import javascript from 'shiki/dist/langs/javascript.mjs'
      import githubDark from 'shiki/dist/themes/github-dark.mjs'
      console.log(shiki({
        languages: [javascript],
        themes: { dark: githubDark },
      }))
    `)

    // Explicit language + dependencies from the Comark grammar (markdown/yaml/html-derivative)
    expect(languages).toContain('javascript.mjs')
    expect(languages).toContain('markdown.mjs')
    expect(languages).toContain('yaml.mjs')

    // Default-entry languages must not leak into core
    expect(languages).not.toContain('typescript.mjs')
    expect(languages).not.toContain('vue.mjs')
    expect(languages).not.toContain('tsx.mjs')
    expect(languages).not.toContain('svelte.mjs')
    expect(languages).not.toContain('astro.mjs')
    expect(languages).not.toContain('json.mjs')
  })

  it('keeps Material themes in the default entry', async () => {
    const themes = await bundledThemes(`
      import shiki from 'comark/plugins/shiki'
      console.log(shiki())
    `)

    expect(themes).toEqual(['material-theme-lighter.mjs', 'material-theme-palenight.mjs'])
  })

  it('keeps default languages in the default entry', async () => {
    const languages = await bundledLanguages(`
      import shiki from 'comark/plugins/shiki'
      console.log(shiki())
    `)

    for (const language of [
      'astro.mjs',
      'javascript.mjs',
      'json.mjs',
      'markdown.mjs',
      'svelte.mjs',
      'tsx.mjs',
      'typescript.mjs',
      'vue.mjs',
      'yaml.mjs',
    ]) {
      expect(languages).toContain(language)
    }
  })
})
