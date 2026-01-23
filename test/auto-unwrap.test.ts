import { describe, expect, it } from 'vitest'
import type { MDCElement } from '../src/types/tree'
import { applyAutoUnwrap } from '../src/utils/auto-unwrap'

describe('applyAutoUnwrap', () => {
  it('should not modify non-container components', () => {
    const node: MDCElement = {
      type: 'element',
      tag: 'div',
      props: {},
      children: [
        {
          type: 'element',
          tag: 'p',
          props: {},
          children: [{ type: 'text', value: 'Text' }],
        },
      ],
    }

    const result = applyAutoUnwrap(node)
    expect(result).toEqual(node)
  })

  it('should unwrap single paragraph in container components', () => {
    const node: MDCElement = {
      type: 'element',
      tag: 'alert',
      props: {},
      children: [
        {
          type: 'element',
          tag: 'p',
          props: {},
          children: [
            {
              type: 'text',
              value: 'This is ',
            },
            {
              type: 'element',
              tag: 'strong',
              props: {},
              children: [{ type: 'text', value: 'bold' }],
            },
            {
              type: 'text',
              value: ' text',
            },
          ],
        },
      ],
    }

    const result = applyAutoUnwrap(node)

    // Paragraph should be unwrapped, content hoisted up
    expect(result.children).toHaveLength(3)
    expect(result.children[0]).toMatchObject({
      type: 'text',
      value: 'This is ',
    })
    expect(result.children[1]).toMatchObject({
      type: 'element',
      tag: 'strong',
    })
    expect(result.children[2]).toMatchObject({
      type: 'text',
      value: ' text',
    })
  })

  it('should not unwrap when there are multiple paragraphs', () => {
    const node: MDCElement = {
      type: 'element',
      tag: 'card',
      props: {},
      children: [
        {
          type: 'element',
          tag: 'p',
          props: {},
          children: [{ type: 'text', value: 'First paragraph' }],
        },
        {
          type: 'element',
          tag: 'p',
          props: {},
          children: [{ type: 'text', value: 'Second paragraph' }],
        },
      ],
    }

    const result = applyAutoUnwrap(node)
    // Should not unwrap when there are multiple paragraphs
    expect(result.children).toHaveLength(2)
    expect(result.children[0]).toMatchObject({
      type: 'element',
      tag: 'p',
    })
    expect(result.children[1]).toMatchObject({
      type: 'element',
      tag: 'p',
    })
  })

  it('should not unwrap when paragraph is mixed with other block elements', () => {
    const node: MDCElement = {
      type: 'element',
      tag: 'note',
      props: {},
      children: [
        {
          type: 'element',
          tag: 'p',
          props: {},
          children: [{ type: 'text', value: 'Text' }],
        },
        {
          type: 'element',
          tag: 'ul',
          props: {},
          children: [
            {
              type: 'element',
              tag: 'li',
              props: {},
              children: [{ type: 'text', value: 'item' }],
            },
          ],
        },
      ],
    }

    const result = applyAutoUnwrap(node)
    // Should not unwrap when there are other block elements
    expect(result.children).toHaveLength(2)
    expect(result.children[0]).toMatchObject({
      type: 'element',
      tag: 'p',
    })
    expect(result.children[1]).toMatchObject({
      type: 'element',
      tag: 'ul',
    })
  })

  it('should not unwrap when there are code blocks', () => {
    const node: MDCElement = {
      type: 'element',
      tag: 'tip',
      props: {},
      children: [
        {
          type: 'element',
          tag: 'pre',
          props: {},
          children: [
            {
              type: 'element',
              tag: 'code',
              props: {},
              children: [{ type: 'text', value: 'code' }],
            },
          ],
        },
      ],
    }

    const result = applyAutoUnwrap(node)
    // Should not unwrap code blocks
    expect(result.children).toHaveLength(1)
    expect(result.children[0]).toMatchObject({
      type: 'element',
      tag: 'pre',
    })
  })

  it('should not unwrap when there are tables', () => {
    const node: MDCElement = {
      type: 'element',
      tag: 'card',
      props: {},
      children: [
        {
          type: 'element',
          tag: 'table',
          props: {},
          children: [
            {
              type: 'element',
              tag: 'tbody',
              props: {},
              children: [
                {
                  type: 'element',
                  tag: 'tr',
                  props: {},
                  children: [
                    {
                      type: 'element',
                      tag: 'td',
                      props: {},
                      children: [{ type: 'text', value: 'Cell' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }

    const result = applyAutoUnwrap(node)
    expect(result.children).toHaveLength(1)
    expect(result.children[0]).toMatchObject({
      type: 'element',
      tag: 'table',
    })
  })

  it('should not unwrap when there are template elements (named slots)', () => {
    const node: MDCElement = {
      type: 'element',
      tag: 'callout',
      props: {},
      children: [
        {
          type: 'element',
          tag: 'template',
          props: { '#title': '' },
          children: [{ type: 'text', value: 'Title' }],
        },
      ],
    }

    const result = applyAutoUnwrap(node)
    // Template elements should be preserved
    expect(result.children).toHaveLength(1)
    expect(result.children[0]).toMatchObject({
      type: 'element',
      tag: 'template',
    })
  })

  it('should handle empty children array', () => {
    const node: MDCElement = {
      type: 'element',
      tag: 'alert',
      props: {},
      children: [],
    }

    const result = applyAutoUnwrap(node)
    expect(result.children).toHaveLength(0)
  })

  it('should preserve node props and other properties', () => {
    const node: MDCElement = {
      type: 'element',
      tag: 'alert',
      props: { variant: 'danger', id: 'alert-1' },
      children: [
        {
          type: 'element',
          tag: 'p',
          props: {},
          children: [{ type: 'text', value: 'Error' }],
        },
      ],
    }

    const result = applyAutoUnwrap(node)

    expect(result.type).toBe('element')
    expect(result.tag).toBe('alert')
    expect(result.props).toEqual({ variant: 'danger', id: 'alert-1' })
    // Should unwrap the paragraph
    expect(result.children).toHaveLength(1)
    expect(result.children[0]).toMatchObject({
      type: 'text',
      value: 'Error',
    })
  })

  it('should unwrap paragraph even with empty text nodes', () => {
    const node: MDCElement = {
      type: 'element',
      tag: 'warning',
      props: {},
      children: [
        { type: 'text', value: '\n' },
        {
          type: 'element',
          tag: 'p',
          props: {},
          children: [{ type: 'text', value: 'Warning text' }],
        },
        { type: 'text', value: '\n' },
      ],
    }

    const result = applyAutoUnwrap(node)
    // Should unwrap the paragraph and remove it
    expect(result.children).toHaveLength(1)
    expect(result.children[0]).toMatchObject({
      type: 'text',
      value: 'Warning text',
    })
  })
})
