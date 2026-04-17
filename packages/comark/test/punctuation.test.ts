import { describe, expect, it } from 'vitest'
import { parse } from '../src/parse'
import punctuation from '../src/plugins/punctuation'

describe('punctuation plugin', () => {
  it('should convert straight double quotes to smart quotes', async () => {
    const md = 'She said "hello world" to him.'
    const tree = await parse(md, { plugins: [punctuation()] })

    const text = flattenText(tree.nodes)
    expect(text).toContain('\u201C') // left double quote
    expect(text).toContain('\u201D') // right double quote
    expect(text).not.toContain('"')
  })

  it('should convert straight single quotes to smart quotes', async () => {
    const md = 'She said \'hello\' to him.'
    const tree = await parse(md, { plugins: [punctuation()] })

    const text = flattenText(tree.nodes)
    expect(text).toContain('\u2018') // left single quote
    expect(text).toContain('\u2019') // right single quote
  })

  it('should handle apostrophes in contractions', async () => {
    const md = 'don\'t won\'t can\'t'
    const tree = await parse(md, { plugins: [punctuation()] })

    const text = flattenText(tree.nodes)
    // Apostrophes should become right single quote
    expect(text).toContain('don\u2019t')
    expect(text).toContain('won\u2019t')
    expect(text).toContain('can\u2019t')
  })

  it('should convert -- to en-dash', async () => {
    const md = 'pages 10--20'
    const tree = await parse(md, { plugins: [punctuation()] })

    const text = flattenText(tree.nodes)
    expect(text).toContain('\u2013') // en-dash
    expect(text).not.toContain('--')
  })

  it('should convert --- to em-dash', async () => {
    const md = 'hello --- world'
    const tree = await parse(md, { plugins: [punctuation()] })

    const text = flattenText(tree.nodes)
    expect(text).toContain('\u2014') // em-dash
  })

  it('should convert ... to ellipsis', async () => {
    const md = 'wait for it...'
    const tree = await parse(md, { plugins: [punctuation()] })

    const text = flattenText(tree.nodes)
    expect(text).toContain('\u2026') // ellipsis
    expect(text).not.toContain('...')
  })

  it('should convert (c) to copyright symbol', async () => {
    const md = 'Copyright (c) 2024'
    const tree = await parse(md, { plugins: [punctuation()] })

    const text = flattenText(tree.nodes)
    expect(text).toContain('\u00A9')
  })

  it('should convert (r) to registered symbol', async () => {
    const md = 'Product(r) name'
    const tree = await parse(md, { plugins: [punctuation()] })

    const text = flattenText(tree.nodes)
    expect(text).toContain('\u00AE')
  })

  it('should convert (tm) to trademark symbol', async () => {
    const md = 'Brand(tm) value'
    const tree = await parse(md, { plugins: [punctuation()] })

    const text = flattenText(tree.nodes)
    expect(text).toContain('\u2122')
  })

  it('should convert +- to plus-minus symbol', async () => {
    const md = 'tolerance: +-5%'
    const tree = await parse(md, { plugins: [punctuation()] })

    const text = flattenText(tree.nodes)
    expect(text).toContain('\u00B1')
  })

  it('should NOT transform text inside code elements', async () => {
    const md = 'text `"hello" -- world...` more text'
    const tree = await parse(md, { plugins: [punctuation()] })

    // Find the code element
    const code = findNode(tree.nodes, 'code')
    expect(code).toBeTruthy()
    const codeText = flattenText([code])
    // Code content should remain unchanged
    expect(codeText).toContain('"')
    expect(codeText).toContain('--')
    expect(codeText).toContain('...')
  })

  it('should NOT transform text inside pre elements', async () => {
    const md = '```\n"hello" -- world...\n```'
    const tree = await parse(md, { plugins: [punctuation()] })

    const pre = findNode(tree.nodes, 'pre')
    expect(pre).toBeTruthy()
    const preText = flattenText([pre])
    expect(preText).toContain('"')
    expect(preText).toContain('--')
  })

  it('should respect disabled options', async () => {
    const md = '"hello" -- world... (c)'
    const tree = await parse(md, {
      plugins: [punctuation({ quotes: false, dashes: false, ellipsis: false, symbols: false })],
    })

    const text = flattenText(tree.nodes)
    expect(text).toContain('"')
    expect(text).toContain('--')
    expect(text).toContain('...')
    expect(text).toContain('(c)')
  })

  it('should handle mixed content with formatting', async () => {
    const md = '"Hello **bold** world"'
    const tree = await parse(md, { plugins: [punctuation()] })

    const text = flattenText(tree.nodes)
    expect(text).toContain('\u201C')
    expect(text).toContain('\u201D')
  })
})

// Test helpers

function flattenText(nodes: any[]): string {
  let text = ''
  for (const node of nodes) {
    if (typeof node === 'string') {
      text += node
    }
    else if (Array.isArray(node) && node.length > 2) {
      text += flattenText(node.slice(2))
    }
  }
  return text
}

function findNode(nodes: any[], tag: string): any {
  for (const node of nodes) {
    if (Array.isArray(node) && node[0] === tag) return node
    if (Array.isArray(node) && node.length > 2) {
      const found = findNode(node.slice(2), tag)
      if (found) return found
    }
  }
  return null
}
