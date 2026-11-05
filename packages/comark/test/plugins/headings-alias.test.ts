import { describe, expect, it } from 'vitest'
import headings from '../../src/plugins/headings'
import titleDescription from '../../src/plugins/title-description'

describe('headings deprecated alias', () => {
  it('re-exports the same default plugin factory as title-description', () => {
    expect(headings).toBe(titleDescription)
  })

  it('creates a plugin with name `title-description`', () => {
    const plugin = headings()
    expect(plugin.name).toBe('title-description')
  })
})
