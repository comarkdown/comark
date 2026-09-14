import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { bundledModules, bindingModules } from '../../../test/helpers/bundle'

const root = fileURLToPath(new URL('../', import.meta.url))

describe('angular bundle isolation', { timeout: 30_000 }, () => {
  it.each(['Markdown', 'MarkdownDocument', 'MarkdownNode'])('%s excludes optional binding code', async (component) => {
    const entry = component === 'MarkdownAsync' ? '@comark/angular/async' : '@comark/angular'
    const modules = await bundledModules(root, `export { ${component} } from '${entry}'`)
    expect(
      modules.some((id) => id.includes('/comark-angular/') && (id.includes('/components/') || id.includes('/async/')))
    ).toBe(true)
    expect(bindingModules(modules)).toEqual([])
  })
  it('detects explicitly imported binding code', async () => {
    const modules = bindingModules(
      await bundledModules(root, "export { default as binding, Binding, If } from '@comark/angular/plugins/binding'")
    )
    expect(modules.some((id) => id.includes('/comark/') && id.includes('/plugins/binding.'))).toBe(true)
    expect(modules.some((id) => id.includes('/components/binding.component.'))).toBe(true)
    expect(modules.some((id) => id.includes('/components/if.component.'))).toBe(true)
  })
})
