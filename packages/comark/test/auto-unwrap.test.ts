import { describe, expect, it } from 'vitest'
import { applyAutoUnwrap } from '../src/internal/parse/auto-unwrap'
import type { ComarkNode } from 'comark/ast'

describe('applyAutoUnwrap', () => {
  it('should not modify elements without paragraph children', () => {
    const node: ComarkNode = ['div', {}, ['span', {}, 'Text']]

    const result = applyAutoUnwrap(node)
    expect(result).toEqual(['div', {}, ['span', {}, 'Text']])
  })

  it('should unwrap single paragraph in container components', () => {
    const node: ComarkNode = [
      'alert',
      {},
      ['p', {}, 'This is ', ['strong', {}, 'bold'], ' text'],
    ]

    const result = applyAutoUnwrap(node)

    // Paragraph should be unwrapped, content hoisted up
    expect(result.length).toBe(2 + 3 /* text, strong, text */)
    expect(result).toEqual(['alert', {}, 'This is ', ['strong', {}, 'bold'], ' text'])
  })

  it('should not unwrap when there are multiple paragraphs', () => {
    const node: ComarkNode = [
      'card',
      {},
      ['p', {}, 'First paragraph'],
      ['p', {}, 'Second paragraph'],
    ]

    const result = applyAutoUnwrap(node)
    // Should not unwrap when there are multiple paragraphs
    expect(result).toEqual([
      'card',
      {},
      ['p', {}, 'First paragraph'],
      ['p', {}, 'Second paragraph'],
    ])
  })

  it('should not unwrap when paragraph is mixed with other block elements', () => {
    const node: ComarkNode = [
      'note',
      {},
      ['p', {}, 'Text'],
      ['ul', {}, ['li', {}, 'item']],
    ]

    const result = applyAutoUnwrap(node)
    // Should not unwrap when there are other block elements
    expect(result).toEqual([
      'note',
      {},
      ['p', {}, 'Text'],
      ['ul', {}, ['li', {}, 'item']],
    ])
  })

  it('should not unwrap when there are code blocks', () => {
    const node: ComarkNode = [
      'tip',
      {},
      ['pre', {}, ['code', {}, 'code']],
    ]

    const result = applyAutoUnwrap(node)
    // Should not unwrap code blocks (no p element)
    expect(result).toEqual([
      'tip',
      {},
      ['pre', {}, ['code', {}, 'code']],
    ])
  })

  it('should not unwrap when there are tables', () => {
    const node: ComarkNode = [
      'card',
      {},
      ['table', {}, ['tbody', {}, ['tr', {}, ['td', {}, 'Cell']]]],
    ]

    const result = applyAutoUnwrap(node)
    expect(result).toEqual([
      'card',
      {},
      ['table', {}, ['tbody', {}, ['tr', {}, ['td', {}, 'Cell']]]],
    ])
  })

  it('should not unwrap when there are template elements (named slots)', () => {
    const node: ComarkNode = [
      'callout',
      {},
      ['template', { '#title': '' }, 'Title'],
    ]

    const result = applyAutoUnwrap(node)
    // Template elements should be preserved
    expect(result).toEqual([
      'callout',
      {},
      ['template', { '#title': '' }, 'Title'],
    ])
  })

  it('should handle empty children array', () => {
    const node: ComarkNode = ['alert', {}]

    const result = applyAutoUnwrap(node)
    expect(result).toEqual(['alert', {}])
  })

  it('should preserve node props and other properties', () => {
    const node: ComarkNode = [
      'alert',
      { variant: 'danger', id: 'alert-1' },
      ['p', {}, 'Error'],
    ]

    const result = applyAutoUnwrap(node)

    expect(result[0]).toBe('alert')
    expect(result[1]).toEqual({ variant: 'danger', id: 'alert-1' })
    // Should unwrap the paragraph
    expect(result).toEqual(['alert', { variant: 'danger', id: 'alert-1' }, 'Error'])
  })

  it('should unwrap paragraph even with empty text nodes', () => {
    const node: ComarkNode = [
      'warning',
      {},
      '\n',
      ['p', {}, 'Warning text'],
      '\n',
    ]

    const result = applyAutoUnwrap(node)
    // Should unwrap the paragraph and filter out whitespace
    expect(result).toEqual(['warning', {}, 'Warning text'])
  })
})
