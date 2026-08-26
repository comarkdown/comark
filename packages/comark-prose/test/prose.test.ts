import { describe, expect, it } from 'vitest'
import type { ComarkParsePostState, ElementNode, Node } from 'comark'
import { parseMarkdown } from 'comark'
import prose from '../src/index'

function el(node: Node | undefined): ElementNode {
  expect(Array.isArray(node)).toBe(true)
  return node as ElementNode
}

describe('prose plugin — callouts', () => {
  it('lowers GFM alerts into a role=note div', async () => {
    const tree = await parseMarkdown('> [!NOTE]\n> hi', { plugins: [prose()] })
    expect(tree.nodes).toEqual([['div', { class: 'prose-callout', role: 'note', 'data-variant': 'note' }, 'hi']])
  })

  it('lowers ::note and friends into the same shape', async () => {
    const tree = await parseMarkdown('::warning\nCareful\n::', { plugins: [prose()] })
    expect(tree.nodes).toEqual([
      ['div', { class: 'prose-callout', role: 'note', 'data-variant': 'warning' }, 'Careful'],
    ])
  })

  it('lowers ::callout with color, icon and title', async () => {
    const tree = await parseMarkdown('::callout{color="tip" icon="i-lucide-flame" title="Hot"}\nBody\n::', {
      plugins: [prose()],
    })
    const callout = el(tree.nodes[0])
    expect(callout[0]).toBe('div')
    expect(callout[1]).toEqual({
      class: 'prose-callout',
      role: 'note',
      'data-variant': 'tip',
      'data-icon': '',
    })
    expect(callout[2]).toEqual(['span', { class: 'prose-callout-icon i-lucide-flame', 'aria-hidden': 'true' }])
    expect(callout[3]).toEqual(['p', { class: 'prose-callout-title' }, 'Hot'])
    expect(callout[4]).toBe('Body')
  })

  it('keeps author classes and plain blockquotes', async () => {
    const tree = await parseMarkdown('::note{.shadow}\nhi\n::\n\n> just a quote', { plugins: [prose()] })
    const callout = el(tree.nodes[0])
    expect(callout[1].class).toBe('prose-callout shadow')
    expect(el(tree.nodes[1])[0]).toBe('blockquote')
  })
})

describe('prose plugin — tabs', () => {
  const markdown = [
    ':::tabs{sync="pkg"}',
    '  ::tab-item{label="npm"}',
    '  npm install comark',
    '  ::',
    '  ::tab-item{label="pnpm"}',
    '  pnpm add comark',
    '  ::',
    ':::',
  ].join('\n')

  it('lowers ::tabs into an ARIA tablist inside <prose-tabs>', async () => {
    const tree = await parseMarkdown(markdown, { plugins: [prose()] })
    const tabs = el(tree.nodes[0])
    expect(tabs[0]).toBe('prose-tabs')
    expect(tabs[1]).toEqual({ 'data-sync': 'pkg', class: 'prose-tabs' })

    const tablist = el(tabs[2] as Node)
    expect(tablist[1]).toEqual({ role: 'tablist', class: 'prose-tabs-list' })
    expect(el(tablist[2] as Node)).toEqual([
      'button',
      {
        type: 'button',
        role: 'tab',
        id: 'prose-tabs-1-t0',
        class: 'prose-tab',
        'aria-controls': 'prose-tabs-1-p0',
        'aria-selected': 'true',
      },
      'npm',
    ])
    expect(el(tablist[3] as Node)[1]).toMatchObject({ 'aria-selected': 'false', tabindex: '-1' })

    const firstPanel = el(tabs[3] as Node)
    expect(firstPanel[1]).toEqual({
      role: 'tabpanel',
      id: 'prose-tabs-1-p0',
      class: 'prose-tab-panel',
      'aria-labelledby': 'prose-tabs-1-t0',
    })
    const secondPanel = el(tabs[4] as Node)
    expect(secondPanel[1]).toMatchObject({ hidden: '' })
  })

  it('generates deterministic sequential ids', async () => {
    const two = await parseMarkdown(`${markdown}\n\n${markdown}`, { plugins: [prose()] })
    expect(el(two.nodes[0])[1]).toMatchObject({ class: 'prose-tabs' })
    const secondList = el(el(two.nodes[1])[2] as Node)
    expect(el(secondList[2] as Node)[1]).toMatchObject({ id: 'prose-tabs-2-t0' })
  })

  it('leaves ::tabs alone when components are disabled', async () => {
    const tree = await parseMarkdown(markdown, { plugins: [prose({ components: false })] })
    expect(el(tree.nodes[0])[0]).toBe('tabs')
  })
})

describe('prose plugin — code blocks and code groups', () => {
  const fence = '~~~ts [nuxt.config.ts]\nexport default {}\n~~~'

  it('wraps code fences with a filename header and copy button', async () => {
    const tree = await parseMarkdown(fence, { plugins: [prose()] })
    const figure = el(tree.nodes[0])
    expect(figure[0]).toBe('figure')
    expect(figure[1]).toEqual({ class: 'prose-pre' })
    expect(figure[2]).toEqual(['figcaption', { class: 'prose-pre-filename' }, 'nuxt.config.ts'])
    expect(el(figure[3] as Node)).toEqual([
      'prose-copy',
      { class: 'prose-copy' },
      ['button', { type: 'button', class: 'prose-copy-button', 'aria-label': 'Copy code' }],
    ])
    expect(el(figure[4] as Node)[0]).toBe('pre')
  })

  it('supports a custom copy label and disabling copy', async () => {
    const labelled = await parseMarkdown(fence, { plugins: [prose({ components: { copy: { label: 'Copier' } } })] })
    expect(JSON.stringify(labelled.nodes)).toContain('Copier')

    const plain = await parseMarkdown(fence, { plugins: [prose({ components: { copy: false } })] })
    expect(el(plain.nodes[0])[0]).toBe('pre')
  })

  it('does not re-wrap code fences on a second pass (streaming reuse)', async () => {
    const tree = await parseMarkdown(fence, { plugins: [prose()] })
    const plugin = prose()
    await plugin.post!({ tree } as unknown as ComarkParsePostState)
    const figure = el(tree.nodes[0])
    expect(figure[0]).toBe('figure')
    expect(childTags(figure)).toEqual(['figcaption', 'prose-copy', 'pre'])
  })

  it('lowers ::code-group into tabs labelled by filename', async () => {
    const markdown = [
      '::code-group',
      '~~~bash [pnpm]',
      'pnpm add comark',
      '~~~',
      '~~~bash [npm]',
      'npm install comark',
      '~~~',
      '::',
    ].join('\n')
    const tree = await parseMarkdown(markdown, { plugins: [prose()] })
    const tabs = el(tree.nodes[0])
    expect(tabs[0]).toBe('prose-tabs')
    expect(tabs[1].class).toBe('prose-tabs prose-code-group')
    const tablist = el(tabs[2] as Node)
    expect(el(tablist[2] as Node)[2]).toBe('pnpm')
    expect(el(tablist[3] as Node)[2]).toBe('npm')
    // Panels contain the copy-wrapped figures.
    expect(el(el(tabs[3] as Node)[2] as Node)[0]).toBe('figure')
  })
})

describe('prose plugin — accordion and steps', () => {
  it('lowers ::accordion into exclusive <details name> groups', async () => {
    const markdown = [
      ':::accordion',
      '  ::accordion-item{label="One"}',
      '  First body',
      '  ::',
      '  ::accordion-item{label="Two" open}',
      '  Second body',
      '  ::',
      ':::',
    ].join('\n')
    const tree = await parseMarkdown(markdown, { plugins: [prose()] })
    const group = el(tree.nodes[0])
    expect(group[0]).toBe('div')
    expect(group[1].class).toBe('prose-accordion')

    const first = el(group[2] as Node)
    expect(first[0]).toBe('details')
    expect(first[1]).toEqual({ class: 'prose-accordion-item', name: 'prose-accordion-1' })
    expect(first[2]).toEqual(['summary', { class: 'prose-accordion-trigger' }, 'One'])
    expect(el(first[3] as Node)).toEqual(['div', { class: 'prose-accordion-content' }, 'First body'])

    const second = el(group[3] as Node)
    expect(second[1]).toEqual({ class: 'prose-accordion-item', name: 'prose-accordion-1', open: '' })
  })

  it('omits the name when {multiple} is set', async () => {
    const markdown = ':::accordion{multiple}\n  ::accordion-item{label="One"}\n  Body\n  ::\n:::'
    const tree = await parseMarkdown(markdown, { plugins: [prose()] })
    expect(el(el(tree.nodes[0])[2] as Node)[1]).toEqual({ class: 'prose-accordion-item' })
  })

  it('lowers ::steps into a counter wrapper', async () => {
    const markdown = '::steps{level="4"}\n\n#### First\n\nDo it.\n\n#### Second\n\nDone.\n\n::'
    const tree = await parseMarkdown(markdown, { plugins: [prose()] })
    const steps = el(tree.nodes[0])
    expect(steps[0]).toBe('div')
    expect(steps[1]).toEqual({ 'data-level': '4', class: 'prose-steps' })
    expect(childTags(steps)).toEqual(['h4', 'p', 'h4', 'p'])
  })
})

describe('prose plugin — elements', () => {
  it('wraps h2-h4 content in anchor links with the hash icon', async () => {
    const tree = await parseMarkdown('## Hello World', { plugins: [prose()] })
    const heading = el(tree.nodes[0])
    expect(heading[1]).toEqual({ id: 'hello-world' })
    const anchor = el(heading[2] as Node)
    expect(anchor[0]).toBe('a')
    expect(anchor[1]).toEqual({ href: '#hello-world', class: 'prose-anchor' })
    expect(el(anchor[2] as Node)[0]).toBe('svg')
    expect(anchor[3]).toBe('Hello World')
  })

  it('skips h1, {anchor=false} and headings containing links', async () => {
    const tree = await parseMarkdown('# Title\n\n## Quiet {anchor=false}\n\n## [Linked](https://a.b)', {
      plugins: [prose()],
    })
    expect(el(tree.nodes[0])[2]).toBe('Title')
    expect(el(tree.nodes[1])[2]).toBe('Quiet')
    expect(el(el(tree.nodes[2])[2] as Node)[1]).toEqual({ href: 'https://a.b' })
  })

  it('supports a class-based anchor icon and disabling anchors', async () => {
    const custom = await parseMarkdown('## Hi', {
      plugins: [prose({ elements: { anchorIcon: 'i-lucide-hash' } })],
    })
    const icon = el(el(el(custom.nodes[0])[2] as Node)[2] as Node)
    expect(icon).toEqual(['span', { class: 'prose-anchor-icon i-lucide-hash', 'aria-hidden': 'true' }])

    const disabled = await parseMarkdown('## Hi', { plugins: [prose({ elements: { headingAnchors: false } })] })
    expect(el(disabled.nodes[0])[2]).toBe('Hi')
  })

  it('wraps tables in a scroll container, once', async () => {
    const markdown = '| A | B |\n|---|---|\n| 1 | 2 |'
    const tree = await parseMarkdown(markdown, { plugins: [prose()] })
    const wrapper = el(tree.nodes[0])
    expect(wrapper[0]).toBe('div')
    expect(wrapper[1]).toEqual({ class: 'prose-table' })
    expect(el(wrapper[2] as Node)[0]).toBe('table')

    const plugin = prose()
    await plugin.post!({ tree } as unknown as ComarkParsePostState)
    expect(childTags(el(tree.nodes[0]))).toEqual(['table'])
  })
})

describe('prose plugin — classes, mergeClass and transform', () => {
  it('applies a class map to plain tags', async () => {
    const tree = await parseMarkdown('Hello **world**', {
      plugins: [prose({ classes: { p: 'leading-7', strong: 'font-semibold' } })],
    })
    const p = el(tree.nodes[0])
    expect(p[1].class).toBe('leading-7')
    expect(el(p[3] as Node)[1].class).toBe('font-semibold')
  })

  it('merges with author classes through mergeClass', async () => {
    const tree = await parseMarkdown('Hello {.text-red}', {
      plugins: [
        prose({
          classes: { p: 'leading-7' },
          mergeClass: (theme, author) => `${theme} ${author ?? ''} merged`.trim(),
        }),
      ],
    })
    expect(el(tree.nodes[0])[1].class).toBe('leading-7 text-red merged')
  })

  it('lets transform replace or remove nodes before built-ins', async () => {
    const tree = await parseMarkdown('::note\nhi\n::\n\n---', {
      plugins: [
        prose({
          transform: {
            note: (node) => ['mark', {}, ...(node.slice(2) as Node[])],
            hr: () => false,
          },
        }),
      ],
    })
    expect(tree.nodes).toEqual([['mark', {}, 'hi']])
  })
})

function childTags(node: ElementNode): string[] {
  return (node.slice(2) as Node[]).filter((child): child is ElementNode => Array.isArray(child)).map((c) => c[0])
}
