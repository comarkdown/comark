import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/index'
import type { Node } from 'comark'

// Helper to check if a node is an element with a specific tag
function isElement(node: Node, tag: string): boolean {
  return Array.isArray(node) && node[0] === tag
}

// Helper to get the attrs object of an element
function getAttrs(node: Node): Record<string, unknown> {
  return Array.isArray(node) ? ((node[1] as Record<string, unknown>) ?? {}) : {}
}

describe('empty component props block (#319)', () => {
  it('parses an empty props block without throwing', async () => {
    const result = await parseMarkdown('::page-section\n---\n---\n#title\nHello\n::')
    const section = result.nodes[0] as Node

    expect(isElement(section, 'page-section')).toBe(true)
    // No YAML-derived keys should be present on the props object
    const attrs = getAttrs(section)
    const yamlKeys = Object.keys(attrs).filter((key) => key !== '$')
    expect(yamlKeys).toHaveLength(0)
  })

  it('preserves slot content when the props block is empty', async () => {
    const result = await parseMarkdown('::page-section\n---\n---\n#title\nHello\n::')
    const md = JSON.stringify(result.nodes)
    expect(md).toContain('Hello')
  })

  it('parses a whitespace-only props block without throwing', async () => {
    const result = await parseMarkdown('::hero\n---\n   \n---\ncontent\n::')
    const hero = result.nodes[0] as Node

    expect(isElement(hero, 'hero')).toBe(true)
    expect(JSON.stringify(result.nodes)).toContain('content')
  })

  it('parses a comment-only props block without throwing', async () => {
    const result = await parseMarkdown('::hero\n---\n# todo\n---\ncontent\n::')
    const hero = result.nodes[0] as Node

    expect(isElement(hero, 'hero')).toBe(true)
    const attrs = getAttrs(hero)
    const yamlKeys = Object.keys(attrs).filter((key) => key !== '$')
    expect(yamlKeys).toHaveLength(0)
  })

  it('still applies props from a non-empty props block', async () => {
    const result = await parseMarkdown('::hero\n---\ntitle: x\n---\n#title\nHi\n::')
    const hero = result.nodes[0] as Node

    expect(isElement(hero, 'hero')).toBe(true)
    expect(getAttrs(hero).title).toBe('x')
  })

  it('round-trips a multi-key, typed props block', async () => {
    const result = await parseMarkdown('::hero\n---\ncount: 3\nlabel: hello\n---\ncontent\n::')
    const hero = result.nodes[0] as Node

    expect(isElement(hero, 'hero')).toBe(true)
    // Non-string YAML scalars are stored as `:` bindings (MDC-compatible, #364)
    expect(getAttrs(hero)[':count']).toBe('3')
    expect(getAttrs(hero).label).toBe('hello')
  })

  it('stores non-string YAML block props as :bindings (#364)', async () => {
    const result = await parseMarkdown(`::comp
---
label: "hello"
count: 3
enabled: false
nested:
  x: 1
  y: true
nothing: null
---
::`)
    const attrs = getAttrs(result.nodes[0] as Node)

    // Match @nuxtjs/mdc: `:` prefix + JSON payload for non-strings
    expect(attrs).toEqual({
      label: 'hello',
      ':count': '3',
      ':enabled': 'false',
      ':nested': { x: 1, y: true },
      ':nothing': 'null',
    })
    // Quoted YAML strings must stay unprefixed strings
    const quoted = await parseMarkdown('::comp\n---\ncount: "3"\nenabled: "false"\n---\n::')
    expect(getAttrs(quoted.nodes[0] as Node)).toEqual({
      count: '3',
      enabled: 'false',
    })
  })

  it('parses document-level comment-only frontmatter without throwing', async () => {
    const result = await parseMarkdown('---\n# comment only\n---\n\n# Heading')

    const hasHeading = result.nodes.some((node) => isElement(node, 'h1'))
    expect(hasHeading).toBe(true)
  })

  it('rejects a malformed (non-empty, invalid) props block', async () => {
    await expect(parseMarkdown('::hero\n---\nfoo: [1,2\n---\ncontent\n::')).rejects.toThrow()
  })
})
