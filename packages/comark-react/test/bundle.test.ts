import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { bundledModules, bindingModules } from '../../../test/helpers/bundle'

const root = fileURLToPath(new URL('../', import.meta.url))

describe('React bundle isolation', { timeout: 30_000 }, () => {
  it.each(['Markdown', 'MarkdownDocument', 'MarkdownClient', 'MarkdownLive'])(
    '%s excludes the optional binding plugin and components',
    async (component) => {
      const modules = await bundledModules(root, `export { ${component} } from '@comark/react'`)
      expect(modules.some((id) => id.includes(`/components/${component}.`))).toBe(true)
      expect(bindingModules(modules)).toEqual([])
    }
  )

  it('detects binding code when explicitly imported', async () => {
    const modules = bindingModules(
      await bundledModules(root, "export { default as binding, Binding, If } from '@comark/react/plugins/binding'")
    )
    expect(modules.some((id) => id.includes('/comark/') && id.includes('/plugins/binding.'))).toBe(true)
    expect(modules.some((id) => id.includes('/components/Binding.'))).toBe(true)
    expect(modules.some((id) => id.includes('/components/If.'))).toBe(true)
  })
})
