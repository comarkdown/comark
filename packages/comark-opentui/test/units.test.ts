import type { ElementNode, Node } from 'comark'
import { parseMarkdown } from 'comark'
import { createElement, type ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import { createMarkdownParser } from 'comark'
import { textContent } from 'comark/utils'
import shiki from 'comark/plugins/shiki'
import python from 'shiki/dist/langs/python.mjs'
import { components, componentsManifest, NATIVE_TAGS } from '../src/components/index.ts'
import { groupChildrenByFlow, reflowInline } from '../src/components/flow.tsx'
import { fenceLanguage, shikiTokens } from '../src/components/pre.tsx'
import { measureColumns } from '../src/components/table.tsx'
import { contentNode } from '../src/utils.ts'

/**
 * Anything needing a live renderer lives in `test/paint`, which requires native
 * FFI (Node >= 26.1). What is checked here runs on any supported Node: the part
 * that decides whether the reconciler throws at all — tag coverage and the
 * inline/block split.
 */

describe('fenceLanguage', () => {
  it('reads the language attribute', () => {
    expect(fenceLanguage(['pre', { language: 'ts' }, ['code', {}, 'x']])).toBe('ts')
  })

  it('falls back to the code node class', () => {
    expect(fenceLanguage(['pre', {}, ['code', { class: 'language-bash' }, 'ls']])).toBe('bash')
  })

  it('returns undefined for an unlabelled fence', () => {
    expect(fenceLanguage(['pre', {}, ['code', {}, 'plain']])).toBeUndefined()
    expect(fenceLanguage(undefined)).toBeUndefined()
  })
})

describe('measureColumns', () => {
  it('sizes each column to its widest cell across all rows', async () => {
    const document = await parseMarkdown('| a | b |\n| --- | --- |\n| wiiiiiiiide | x |\n| s | y |')
    const widths = measureColumns(document.nodes[0] as ElementNode)

    expect(widths).toHaveLength(2)
    expect(widths[0]).toBe('wiiiiiiiide'.length + 1)
    expect(widths[1]).toBeGreaterThanOrEqual(3)
  })

  it('clamps a runaway cell', async () => {
    const document = await parseMarkdown(`| a |\n| --- |\n| ${'x'.repeat(200)} |`)
    const widths = measureColumns(document.nodes[0] as ElementNode)

    expect(widths[0]).toBeLessThanOrEqual(40)
  })

  it('returns no columns for a table-less node', () => {
    expect(measureColumns(undefined)).toEqual([])
  })
})

describe('groupChildrenByFlow', () => {
  it('wraps an all-inline container in a single text host', () => {
    const node: ElementNode = ['li', {}, 'a ', ['strong', {}, 'b']]
    const groups = groupChildrenByFlow(node, ['a ', createElement('strong', {}, 'b')])

    expect(groups).toHaveLength(1)
    expect((groups[0] as ReactElement).type).toBe('text')
  })

  it('passes block children through untouched', () => {
    const node: ElementNode = ['li', {}, ['p', {}, 'a'], ['ul', {}, ['li', {}, 'b']]]
    const groups = groupChildrenByFlow(node, [createElement('p'), createElement('ul')])

    expect(groups).toHaveLength(2)
    expect((groups[0] as ReactElement).type).not.toBe('text')
  })

  /**
   * The task-list shape: an `input` span and bare text sit next to a nested
   * block. The inline pair has to be gathered into one text host, or the string
   * hits `createTextInstance` outside a text node and throws.
   */
  it('groups an inline run that precedes a block child', () => {
    const node: ElementNode = ['li', {}, ['input', { type: 'checkbox' }], ' done', ['ul', {}, ['li', {}, 'nested']]]
    const groups = groupChildrenByFlow(node, [createElement('span', {}, '[x]'), ' done', createElement('ul')])

    expect(groups).toHaveLength(2)
    expect((groups[0] as ReactElement).type).toBe('text')
    expect((groups[1] as ReactElement).type).toBe('ul')
  })

  it('skips comment and template children when pairing', () => {
    const node: ElementNode = ['li', {}, [null, {}, ' a comment '] as unknown as Node, 'text']
    const groups = groupChildrenByFlow(node, ['text'])

    expect(groups).toHaveLength(1)
    expect((groups[0] as ReactElement).type).toBe('text')
  })

  it('falls back to inline when children cannot be paired', () => {
    const node: ElementNode = ['li', {}, ['p', {}, 'a'], ['p', {}, 'b']]
    const groups = groupChildrenByFlow(node, [createElement('p')])

    expect(groups).toHaveLength(1)
    expect((groups[0] as ReactElement).type).toBe('text')
  })

  it('returns nothing for an empty container', () => {
    expect(groupChildrenByFlow(['li', {}], [])).toEqual([])
  })
})

/**
 * OpenTUI's reconciler throws `Unknown component type` on any tag missing from
 * its catalogue, so coverage is a correctness property rather than a nicety.
 * Mirrors `baseComponents` in `@opentui/react`.
 */
const OPENTUI_HOSTS = new Set([
  'box',
  'text',
  'code',
  'diff',
  'markdown',
  'input',
  'select',
  'textarea',
  'scrollbox',
  'ascii-font',
  'tab-select',
  'line-number',
  'span',
  'br',
  'b',
  'strong',
  'i',
  'em',
  'u',
  'a',
])

/** Markdown exercising every construct Comark emits a distinct tag for. */
const CORPUS = [
  '# h1',
  '## h2',
  '### h3',
  '#### h4',
  '##### h5',
  '###### h6',
  'paragraph **bold** _em_ ~~del~~ `code` [link](https://e.com) ![alt](i.png)',
  'line one  \nline two',
  '> quote',
  '- bullet',
  '1. ordered',
  '- [x] task',
  '```ts\ncode\n```',
  '---',
  '| a | b |\n| --- | --- |\n| 1 | 2 |',
  '<div class="x">html block</div>',
  'inline <mark>html</mark>',
  '::unregistered\nbody\n::',
].join('\n\n')

function collectTags(nodes: Node[], into = new Set<string>()): Set<string> {
  for (const node of nodes) {
    if (typeof node === 'string' || !Array.isArray(node) || typeof node[0] !== 'string') {
      continue
    }

    into.add(node[0])
    collectTags(node.slice(2) as Node[], into)
  }

  return into
}

describe('tag coverage', () => {
  it('resolves every tag the corpus emits', async () => {
    const document = await parseMarkdown(CORPUS)
    const tags = collectTags(document.nodes)

    expect(tags.size).toBeGreaterThan(15)

    for (const tag of tags) {
      const resolved = components[tag] ?? (NATIVE_TAGS.has(tag) ? 'native' : componentsManifest(tag))

      expect(resolved, `tag "${tag}" resolves to nothing and would throw`).toBeTruthy()
    }
  })

  it('never declares a tag both mapped and native', () => {
    for (const tag of NATIVE_TAGS) {
      expect(components[tag], `"${tag}" is both mapped and declared native`).toBeUndefined()
    }
  })

  it('declines native tags so they reach their own renderable', () => {
    for (const tag of NATIVE_TAGS) {
      expect(componentsManifest(tag), `"${tag}" would be shadowed by the fallback`).toBeUndefined()
    }
  })

  it('only declares tags OpenTUI actually hosts as native', () => {
    for (const tag of NATIVE_TAGS) {
      expect(OPENTUI_HOSTS.has(tag), `"${tag}" is not an OpenTUI host`).toBe(true)
    }
  })

  /**
   * `code` and `input` collide with OpenTUI hosts that mean something else
   * entirely — a block-level highlighted panel, and an interactive text field.
   * Leaving either unmapped is a silent visual break rather than a throw.
   */
  it('maps the tags that collide with unrelated OpenTUI hosts', () => {
    expect(components.code).toBeDefined()
    expect(components.input).toBeDefined()
    expect(NATIVE_TAGS.has('code')).toBe(false)
    expect(NATIVE_TAGS.has('input')).toBe(false)
  })

  it('answers unknown tags with a fallback', () => {
    expect(componentsManifest('div')).toBeDefined()
    expect(componentsManifest('some-future-tag')).toBeDefined()
  })
})

describe('reflowInline', () => {
  it('collapses a soft break and its indentation to one space', () => {
    expect(reflowInline(['one\n  two'])).toEqual(['one two'])
  })

  it('reaches strings nested inside emphasis', () => {
    const bold = createElement('strong', {}, 'spanning\ntwo lines')
    const [reflowed] = reflowInline([bold]) as ReactElement[]

    expect((reflowed!.props as { children: unknown }).children).toEqual(['spanning two lines'])
  })

  it('passes a childless element straight through', () => {
    // `React.Children.map` re-keys elements, so identity is not preserved.
    const [reflowed] = reflowInline([createElement('br')]) as ReactElement[]

    expect(reflowed!.type).toBe('br')
  })
})

describe('contentNode', () => {
  it('resolves to the default template when a component uses slots', () => {
    const node: ElementNode = [
      'alert',
      {},
      ['template', { name: 'title' }, 'Title'],
      ['template', { name: 'default' }, 'Body'],
    ]

    expect(contentNode(node)?.[1]).toEqual({ name: 'default' })
  })

  it('falls back to the node when slots exist but none is the default', () => {
    const node: ElementNode = ['alert', {}, ['template', { name: 'title' }, 'Title']]

    expect(contentNode(node)?.[0]).toBe('alert')
  })

  it('returns the node itself when there are no slots', () => {
    const node: ElementNode = ['li', {}, 'plain']

    expect(contentNode(node)).toBe(node)
  })

  it('returns undefined for no node', () => {
    expect(contentNode(undefined)).toBeUndefined()
  })
})

/**
 * The Shiki plugin rewrites a fence's code node into per-token spans. This
 * renderer highlights with tree-sitter instead and reads the body back off the
 * node, so that rewrite must not alter what comes out.
 */
describe('shiki plugin interop', () => {
  it('flattens tokenised code back to its exact source', async () => {
    const source = 'const a = 1\nconst b = 2'
    const parse = createMarkdownParser({ plugins: [shiki()] })
    const document = await parse(`\`\`\`ts [main.ts]\n${source}\n\`\`\``)
    const pre = document.nodes[0] as ElementNode

    expect(textContent(pre)).toBe(source)
    expect(fenceLanguage(pre)).toBe('ts')
    expect(pre[1].filename).toBe('main.ts')
  })

  it('agrees with an unhighlighted parse', async () => {
    const source = 'const a = 1'
    const fence = `\`\`\`ts\n${source}\n\`\`\``
    const plain = await createMarkdownParser({})(fence)
    const highlighted = await createMarkdownParser({ plugins: [shiki()] })(fence)

    expect(textContent(highlighted.nodes[0] as ElementNode)).toBe(textContent(plain.nodes[0] as ElementNode))
  })
})

describe('alert coverage', () => {
  it('maps every GitHub alert kind', () => {
    for (const kind of ['note', 'tip', 'important', 'warning', 'caution']) {
      expect(components[kind], `"${kind}" alerts would fall back to a plain container`).toBeDefined()
    }
  })

  it('maps math, which carries no block/inline meta of its own', () => {
    expect(components.math).toBeDefined()
  })
})

describe('shikiTokens', () => {
  it('returns one entry per line, with a colour per token', async () => {
    const parse = createMarkdownParser({ plugins: [shiki()] })
    const document = await parse('```ts\nconst a = 1\nconst b = 2\n```')
    const lines = shikiTokens(document.nodes[0] as ElementNode)

    expect(lines).toHaveLength(2)
    expect(lines![0]!.map((token) => token.text).join('')).toBe('const a = 1')

    const colors = new Set(lines!.flat().map((token) => token.fg))

    expect(colors.size).toBeGreaterThan(1)
  })

  it('prefers the dark variant when Shiki emits both', async () => {
    const parse = createMarkdownParser({ plugins: [shiki()] })
    const document = await parse('```ts\nconst a = 1\n```')
    const [first] = shikiTokens(document.nodes[0] as ElementNode)!

    // `const` carries `color:#9C3EDA;--shiki-dark:#C792EA` in the default themes.
    expect(first![0]!.fg).toBe('#C792EA')
  })

  it('returns null for a fence the plugin never touched', async () => {
    const document = await createMarkdownParser({})('```ts\nconst a = 1\n```')

    expect(shikiTokens(document.nodes[0] as ElementNode)).toBeNull()
  })

  it('returns null for a node that is not a fence', () => {
    expect(shikiTokens(undefined)).toBeNull()
    expect(shikiTokens(['p', {}, 'text'])).toBeNull()
  })
})

/**
 * Shiki's language set is fixed at highlighter creation — there is no
 * load-on-demand — so a fence in a language outside the plugin's defaults
 * (vue, tsx, svelte, typescript, javascript, bash, json, yaml, astro) comes back
 * untokenised and renders flat.
 */
describe('shiki language registration', () => {
  const fence = '```python\ndef fib(n: int) -> int:\n    return n\n```'

  it('leaves a language outside the default set untokenised', async () => {
    const document = await createMarkdownParser({ plugins: [shiki()] })(fence)

    expect(shikiTokens(document.nodes[0] as ElementNode)).toBeNull()
  })

  it('tokenises it once the grammar is passed in', async () => {
    const parse = createMarkdownParser({ plugins: [shiki({ languages: [python as never] })] })
    const document = await parse(fence)
    const lines = shikiTokens(document.nodes[0] as ElementNode)

    expect(lines).toHaveLength(2)
    expect(new Set(lines!.flat().map((token) => token.fg)).size).toBeGreaterThan(1)
  })
})
