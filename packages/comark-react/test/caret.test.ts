import type { ElementNode } from 'comark'
import { parseMarkdown } from 'comark'
import { describe, expect, it } from 'vitest'
import { appendCaretToLastTextNode, getCaret } from '../src/utils/caret'

const caret = () => getCaret(true)!

function countCarets(value: unknown): number {
  return JSON.stringify(value).split('"stream-caret"').length - 1
}

describe('appendCaretToLastTextNode', () => {
  it('appends the caret to the element holding the last text node', () => {
    const parent: ElementNode = ['p', {}, 'hello world']
    const result = appendCaretToLastTextNode(parent, caret())

    expect(countCarets(result)).toBe(1)
    expect(result![2]).toBe('hello world')
  })

  it('descends into nested elements', () => {
    const parent: ElementNode = ['div', {}, ['p', {}, 'nested text']]
    const result = appendCaretToLastTextNode(parent, caret())

    expect(countCarets(result![2])).toBe(1)
  })

  it('returns null when there is no text to anchor to', () => {
    expect(appendCaretToLastTextNode(['hr', {}], caret())).toBeNull()
    expect(appendCaretToLastTextNode(['ul', {}, ['li', {}]], caret())).toBeNull()
  })

  /**
   * The previous implementation pushed into the node it was given. `nodes` is only
   * a shallow copy of the document's array, so the caret ended up in the parsed
   * document itself — visible to anything else holding it, and appended again on
   * every re-render, each copy carrying the same React key.
   */
  it('leaves the input untouched', () => {
    const parent: ElementNode = ['p', {}, 'hello world']
    const before = JSON.stringify(parent)

    appendCaretToLastTextNode(parent, caret())

    expect(JSON.stringify(parent)).toBe(before)
  })

  it('does not accumulate across repeated calls', () => {
    const parent: ElementNode = ['p', {}, 'hello world']

    for (let call = 0; call < 5; call++) {
      expect(countCarets(appendCaretToLastTextNode(parent, caret()))).toBe(1)
    }
  })

  it('does not anchor to a caret that is already present', () => {
    const withCaret = appendCaretToLastTextNode(['p', {}, 'text'], caret())!
    const again = appendCaretToLastTextNode(withCaret, caret())

    expect(countCarets(again)).toBe(1)
  })

  it('leaves a parsed document unmodified', async () => {
    const document = await parseMarkdown('# Title\n\nBody text')
    const before = JSON.stringify(document.nodes)

    appendCaretToLastTextNode(document.nodes[document.nodes.length - 1] as ElementNode, caret())

    expect(JSON.stringify(document.nodes)).toBe(before)
  })

  it('shares the untouched parts of the tree', () => {
    const sibling: ElementNode = ['span', {}, 'sibling']
    const parent: ElementNode = ['div', {}, sibling, ['p', {}, 'text']]
    const result = appendCaretToLastTextNode(parent, caret())!

    expect(result[2]).toBe(sibling)
  })
})
