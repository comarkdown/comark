import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/parse'
import breaks from '../src/plugins/breaks'
import math from '../src/plugins/math'

describe('breaks plugin', () => {
  it('should replace all occurrences of \n with the comark :br component', async () => {
    const md = 'She said "hello world" to\nhim.'
    const tree = await parseMarkdown(md, { plugins: [breaks()] })

    expect(tree.nodes).toEqual([['p', {}, 'She said "hello world" to', ['br', {}], 'him.']])
  })

  it('should not replace \n inside code blocks', async () => {
    const md = 'soft\nbreak\n\n```\nline1\nline2\n```'
    const tree = await parseMarkdown(md, { plugins: [breaks()] })

    expect(tree.nodes).toEqual([
      ['p', {}, 'soft', ['br', {}], 'break'],
      ['pre', {}, ['code', {}, 'line1\nline2']],
    ])
  })

  it('should not replace \n inside math blocks', async () => {
    const md = '$$\nx = 1 \\\\\ny = 2\n$$'
    const tree = await parseMarkdown(md, { plugins: [math(), breaks()] })

    expect(tree.nodes).toEqual([['math', { class: 'math block', content: 'x = 1 \\\\\ny = 2' }, 'x = 1 \\\\\ny = 2']])
  })
})
