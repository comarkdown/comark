import { describe, expect, it } from 'vitest'
import { createTextVNode, h } from 'vue'
import { TEXT_TAGS, flatUnwrap, isTag, isText, nodeChildren, nodeTextContent, unwrap } from '../src/utils/node.ts'

describe('TEXT_TAGS', () => {
  it('includes expected text container tags', () => {
    expect(TEXT_TAGS).toContain('p')
    expect(TEXT_TAGS).toContain('h1')
    expect(TEXT_TAGS).toContain('li')
  })
})

describe('isTag', () => {
  it('matches string tag type', () => {
    const vnode = h('div')
    expect(isTag(vnode, 'div')).toBe(true)
    expect(isTag(vnode, 'span')).toBe(false)
  })

  it('matches symbol type', () => {
    const sym = Symbol.for('v-txt')
    const vnode = { type: sym, children: 'hello', props: null } as any
    expect(isTag(vnode, sym)).toBe(true)
    expect(isTag(vnode, Symbol.for('other'))).toBe(false)
  })

  it('matches object type with .tag property', () => {
    const vnode = { type: { tag: 'custom-tag' }, children: null, props: null } as any
    expect(isTag(vnode, 'custom-tag')).toBe(true)
    expect(isTag(vnode, 'other-tag')).toBe(false)
  })
})

describe('isText', () => {
  it('identifies text VNodes by v-txt symbol', () => {
    const textVnode = createTextVNode('hello')
    expect(isText(textVnode)).toBe(true)
  })

  it('returns false for element VNodes', () => {
    expect(isText(h('div'))).toBe(false)
    expect(isText(h('p', 'text'))).toBe(false)
    expect(isText(h('span'))).toBe(false)
  })
})

describe('nodeChildren', () => {
  it('returns array children', () => {
    const child = h('span', 'inner')
    const vnode = h('div', {}, [child])
    const children = nodeChildren(vnode)
    expect(Array.isArray(children)).toBe(true)
    expect(children).toContain(child)
  })

  it('returns string children', () => {
    const vnode = h('div', 'text content')
    const children = nodeChildren(vnode)
    expect(children).toBe('text content')
  })

  it('returns empty array when no children', () => {
    const vnode = h('div')
    expect(nodeChildren(vnode)).toEqual([])
  })

  it('calls default() for slot-style children', () => {
    const child = h('span', 'slot content')
    const vnode = { type: 'div', children: { default: () => [child] }, props: null } as any
    expect(nodeChildren(vnode)).toEqual([child])
  })
})

describe('nodeTextContent', () => {
  it('returns empty string for falsy input', () => {
    expect(nodeTextContent(null as any)).toBe('')
  })

  it('extracts text from a text VNode', () => {
    const textVnode = createTextVNode('hello')
    expect(nodeTextContent(textVnode)).toBe('hello')
  })

  it('joins text content from array of VNodes', () => {
    const nodes = [createTextVNode('hello'), createTextVNode(' world')]
    expect(nodeTextContent(nodes as any)).toBe('hello world')
  })

  it('recursively extracts text from nested elements', () => {
    const vnode = h('p', {}, [createTextVNode('nested')])
    expect(nodeTextContent(vnode)).toBe('nested')
  })
})

describe('unwrap', () => {
  it('returns vnode unchanged when tag does not match', () => {
    const vnode = h('div', {}, [h('p', 'text')])
    const result = unwrap(vnode, ['span'])
    expect(result).toBe(vnode)
  })

  it('unwraps a matching element tag and returns its children', () => {
    const child = h('p', 'text')
    const vnode = h('div', {}, [child])
    const result = unwrap(vnode, ['div'])
    expect(Array.isArray(result)).toBe(true)
    expect(result).toContain(child)
  })

  it('unwraps with wildcard *', () => {
    const child = h('p', 'text')
    const vnode = h('section', {}, [child])
    const result = unwrap(vnode, ['*'])
    expect(Array.isArray(result)).toBe(true)
    expect(result).toContain(child)
  })

  it('unwraps each element in an array of vnodes', () => {
    const childA = h('p', 'a')
    const childB = h('p', 'b')
    const nodes = [h('div', {}, [childA]), h('div', {}, [childB])] as any
    const result = unwrap(nodes, ['div']) as any[]
    expect(Array.isArray(result)).toBe(true)
    expect(result).toContain(childA)
    expect(result).toContain(childB)
  })
})

describe('flatUnwrap', () => {
  it('returns vnode unchanged when no tags provided', () => {
    const vnode = h('div', 'text')
    expect(flatUnwrap(vnode, [])).toBe(vnode)
    expect(flatUnwrap(vnode, '')).toBe(vnode)
  })

  it('unwraps div — the <slot unwrap="div" /> use case', () => {
    const child = h('p', {}, [createTextVNode('Hello World')])
    const div = h('div', {}, [child])
    const result = flatUnwrap(div, 'div') as any[]
    expect(Array.isArray(result)).toBe(true)
    expect(result).toContain(child)
    // div itself should not be in the result
    expect(result).not.toContain(div)
  })

  it('unwraps multiple space-separated tags', () => {
    const text = createTextVNode('content')
    const p = h('p', {}, [text])
    const div = h('div', {}, [p])
    // unwrapping div then p should expose the text node
    const result = flatUnwrap(div, 'div p') as any[]
    expect(Array.isArray(result)).toBe(true)
    // result should be strings (merged text nodes) not element vnodes
    expect(result.some(item => typeof item === 'string')).toBe(true)
    expect(result.find(item => typeof item === 'string')).toBe('content')
  })

  it('unwraps comma-separated tags', () => {
    const text = createTextVNode('hello')
    const span = h('span', {}, [text])
    const div = h('div', {}, [span])
    const result = flatUnwrap(div, 'div,span') as any[]
    expect(Array.isArray(result)).toBe(true)
    expect(result.some(item => typeof item === 'string' && item === 'hello')).toBe(true)
  })

  it('filters out empty whitespace-only text nodes', () => {
    const emptyText = createTextVNode('   ')
    const realChild = h('p', {}, [createTextVNode('content')])
    const div = h('div', {}, [emptyText, realChild])
    const result = flatUnwrap(div, 'div') as any[]
    const hasEmpty = result.some(item => typeof item === 'string' && item.trim() === '')
    expect(hasEmpty).toBe(false)
    expect(result).toContain(realChild)
  })

  it('merges consecutive text nodes into a single string', () => {
    const text1 = createTextVNode('Hello ')
    const text2 = createTextVNode('World')
    const div = h('div', {}, [text1, text2])
    const result = flatUnwrap(div, 'div') as any[]
    const strings = result.filter(item => typeof item === 'string')
    expect(strings).toHaveLength(1)
    expect(strings[0]).toBe('Hello World')
  })

  it('handles an array of vnodes as input', () => {
    const child1 = h('p', {}, [createTextVNode('one')])
    const child2 = h('p', {}, [createTextVNode('two')])
    const vnodes = [h('div', {}, [child1]), h('div', {}, [child2])]
    const result = flatUnwrap(vnodes, 'div') as any[]
    expect(result).toContain(child1)
    expect(result).toContain(child2)
  })
})
