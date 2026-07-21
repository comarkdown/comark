import { describe, expect, it } from 'vitest'
import { parse } from '../src/parse'

describe('headingIds option', () => {
  it('generates id attributes by default', async () => {
    const tree = await parse('# Hello World')

    expect(tree.nodes).toEqual([['h1', { id: 'hello-world' }, 'Hello World']])
  })

  it('skips auto-generated ids when headingIds is false', async () => {
    const tree = await parse('# Hello World', { headingIds: false })

    expect(tree.nodes).toEqual([['h1', {}, 'Hello World']])
  })

  it('preserves user-supplied id when headingIds is false', async () => {
    const tree = await parse('# Hello {id="custom"}', { headingIds: false })

    expect(tree.nodes).toEqual([['h1', { id: 'custom' }, 'Hello']])
  })

  it('still generates hierarchical ids when headingIds is true', async () => {
    const tree = await parse('# Title\n\n## Section')

    expect(tree.nodes).toEqual([
      ['h1', { id: 'title' }, 'Title'],
      ['h2', { id: 'section' }, 'Section'],
    ])
  })
})
