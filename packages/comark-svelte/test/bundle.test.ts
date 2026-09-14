import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { bundledModules, bindingModules } from '../../../test/helpers/bundle'
import { svelte } from '@sveltejs/vite-plugin-svelte'

const root = fileURLToPath(new URL('../', import.meta.url))

describe('svelte bundle isolation', { timeout: 30_000 }, () => {
  it.each(['Markdown', 'MarkdownDocument', 'MarkdownNode', 'MarkdownAsync'])(
    '%s excludes optional binding code',
    async (component) => {
      const entry = component === 'MarkdownAsync' ? '@comark/svelte/async' : '@comark/svelte'
      const modules = await bundledModules(root, `export { ${component} } from '${entry}'`, {
        plugins: [svelte({ configFile: false, compilerOptions: { experimental: { async: true } } })],
        resolve: { conditions: ['svelte', 'browser'] },
      })
      expect(
        modules.some((id) => id.includes('/comark-svelte/') && (id.includes('/components/') || id.includes('/async/')))
      ).toBe(true)
      expect(bindingModules(modules)).toEqual([])
    }
  )
  it('detects explicitly imported binding code', async () => {
    const modules = bindingModules(
      await bundledModules(root, "export { default as binding, Binding, If } from '@comark/svelte/plugins/binding'", {
        plugins: [svelte({ configFile: false, compilerOptions: { experimental: { async: true } } })],
        resolve: { conditions: ['svelte', 'browser'] },
      })
    )
    expect(modules.some((id) => id.includes('/comark/') && id.includes('/plugins/binding.'))).toBe(true)
    expect(modules.some((id) => id.includes('/components/Binding.'))).toBe(true)
    expect(modules.some((id) => id.includes('/components/If.'))).toBe(true)
  })
})
