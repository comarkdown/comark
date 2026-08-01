import { describe, expect, it } from 'vitest'
import { parse } from '../src/index'
import type { ComarkNode } from 'comark'

// Helper to check if a node is an element with a specific tag
function isElement(node: ComarkNode, tag: string): boolean {
  return Array.isArray(node) && node[0] === tag
}

// Helper to get the attrs object of an element
function getAttrs(node: ComarkNode): Record<string, unknown> {
  return Array.isArray(node) ? ((node[1] as Record<string, unknown>) ?? {}) : {}
}

describe('empty component props block (#319)', () => {
  it('parses an empty props block without throwing', async () => {
    const result = await parse('::page-section\n---\n---\n#title\nHello\n::')
    const section = result.nodes[0] as ComarkNode

    expect(isElement(section, 'page-section')).toBe(true)
    // No YAML-derived keys should be present on the props object
    const attrs = getAttrs(section)
    const yamlKeys = Object.keys(attrs).filter((key) => key !== '$')
    expect(yamlKeys).toHaveLength(0)
  })

  it('preserves slot content when the props block is empty', async () => {
    const result = await parse('::page-section\n---\n---\n#title\nHello\n::')
    const md = JSON.stringify(result.nodes)
    expect(md).toContain('Hello')
  })

  it('parses a whitespace-only props block without throwing', async () => {
    const result = await parse('::hero\n---\n   \n---\ncontent\n::')
    const hero = result.nodes[0] as ComarkNode

    expect(isElement(hero, 'hero')).toBe(true)
    expect(JSON.stringify(result.nodes)).toContain('content')
  })

  it('parses a comment-only props block without throwing', async () => {
    const result = await parse('::hero\n---\n# todo\n---\ncontent\n::')
    const hero = result.nodes[0] as ComarkNode

    expect(isElement(hero, 'hero')).toBe(true)
    const attrs = getAttrs(hero)
    const yamlKeys = Object.keys(attrs).filter((key) => key !== '$')
    expect(yamlKeys).toHaveLength(0)
  })

  it('still applies props from a non-empty props block', async () => {
    const result = await parse('::hero\n---\ntitle: x\n---\n#title\nHi\n::')
    const hero = result.nodes[0] as ComarkNode

    expect(isElement(hero, 'hero')).toBe(true)
    expect(getAttrs(hero).title).toBe('x')
  })

  it('round-trips a multi-key, typed props block', async () => {
    const result = await parse('::hero\n---\ncount: 3\nlabel: hello\n---\ncontent\n::')
    const hero = result.nodes[0] as ComarkNode

    expect(isElement(hero, 'hero')).toBe(true)
    // Non-string attribute values are JSON-stringified onto the element (see syntax.ts)
    expect(getAttrs(hero).count).toBe('3')
    expect(getAttrs(hero).label).toBe('hello')
  })

  it('parses document-level comment-only frontmatter without throwing', async () => {
    const result = await parse('---\n# comment only\n---\n\n# Heading')

    const hasHeading = result.nodes.some((node) => isElement(node, 'h1'))
    expect(hasHeading).toBe(true)
  })

  it('rejects a malformed (non-empty, invalid) props block', async () => {
    await expect(parse('::hero\n---\nfoo: [1,2\n---\ncontent\n::')).rejects.toThrow()
  })
})
