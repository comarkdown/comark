import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { bundledModules, bindingModules } from '../../../test/helpers/bundle'

const root = fileURLToPath(new URL('../', import.meta.url))

describe('vue bundle isolation', { timeout: 30_000 }, () => {
  it.each(['Markdown', 'MarkdownDocument'])('%s excludes optional binding code', async (component) => {
    const entry = component === 'MarkdownAsync' ? '@comark/vue/async' : '@comark/vue'
    const modules = await bundledModules(root, `export { ${component} } from '${entry}'`)
    expect(
      modules.some((id) => id.includes('/comark-vue/') && (id.includes('/components/') || id.includes('/async/')))
    ).toBe(true)
    expect(bindingModules(modules)).toEqual([])
  })
  it('detects explicitly imported binding code', async () => {
    const modules = bindingModules(
      await bundledModules(root, "export { default as binding, Binding, If } from '@comark/vue/plugins/binding'")
    )
    expect(modules.some((id) => id.includes('/comark/') && id.includes('/plugins/binding.'))).toBe(true)
    expect(modules.some((id) => id.includes('/components/Binding.'))).toBe(true)
    expect(modules.some((id) => id.includes('/components/If.'))).toBe(true)
  })
})
