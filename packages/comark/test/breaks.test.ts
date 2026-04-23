import { describe, expect, it } from 'vitest'
import { parse } from '../src/parse'
import breaks from '../src/plugins/breaks'

describe('breaks plugin', () => {
  it('should replace all occurrences of \n with the comark :br component', async () => {
    const md = 'She said "hello world" to\nhim.'
    const tree = await parse(md, { plugins: [breaks()] })

    expect(tree.nodes).toEqual([['p', {}, 'She said "hello world" to', ['br', {}], 'him.']])
  })
})
