import { describe, expect, it } from 'vitest'
import highlight from '../../src/plugins/highlight'
import shiki from '../../src/plugins/shiki'

describe('highlight deprecated alias', () => {
  it('re-exports the same default plugin factory as shiki', () => {
    expect(highlight).toBe(shiki)
  })

  it('creates a plugin with name `shiki`', () => {
    const plugin = highlight()
    expect(plugin.name).toBe('shiki')
  })
})
