import { describe, expect, it } from 'vitest'
import { createMarkdownParser } from '../../src/core'
import { needsEntities } from '../../src/internal/entities'

// Each test file runs in a fresh module graph, so the table starts unloaded.
describe('named character reference table', () => {
  const parse = createMarkdownParser()

  it('loads only when a document has `&` followed by a letter', async () => {
    expect((await parse('a & b &#169; c')).nodes).toEqual([['p', {}, 'a & b © c']])
    expect(needsEntities('&copy;')).toBe(true)

    expect((await parse('&copy; [a](/b "&lt;")')).nodes).toEqual([
      ['p', {}, '© ', ['a', { href: '/b', title: '<' }, 'a']],
    ])
    expect(needsEntities('&copy;')).toBe(false)
  })
})
