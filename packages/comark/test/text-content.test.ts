import { describe, expect, it } from 'vitest'
import { decodeHTML } from 'entities'
import type { Node } from 'comark'
import { textContent } from '../src/utils'

describe('textContent', () => {
  const tree: Node = ['p', {}, 'Tom &amp; ', ['strong', {}, 'Jerry'], ' &copy;']

  it('concatenates text nodes', () => {
    expect(textContent('plain')).toBe('plain')
    expect(textContent(tree)).toBe('Tom &amp; Jerry &copy;')
  })

  it('applies decodeHTML to every text node', () => {
    expect(textContent(tree, { decodeHTML })).toBe('Tom & Jerry ©')
    expect(textContent('&lt;', { decodeHTML })).toBe('<')
  })

  it('decodes each text node separately', () => {
    const calls: string[] = []
    const split: Node = ['p', {}, '&am', 'p;']
    const result = textContent(split, {
      decodeHTML: (text) => {
        calls.push(text)
        return decodeHTML(text)
      },
    })
    expect(calls).toEqual(['&am', 'p;'])
    expect(result).toBe('&amp;')
  })
})
