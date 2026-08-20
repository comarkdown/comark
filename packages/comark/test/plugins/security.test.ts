import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../../src/parse'
import security from '../../src/plugins/security'
import { textContent } from '../../src/utils/index.ts'
import { renderMarkdown } from 'comark/render'
import type { ElementNode, Node, MarkdownDocument } from '../../src/types'

const parseWithSecurity = (md: string, options: Parameters<typeof security>[0] = {}) =>
  parseMarkdown(md, { plugins: [security(options)] })

function makeTree(nodes: MarkdownDocument['nodes']): MarkdownDocument {
  return { nodes, frontmatter: {}, meta: {} }
}

async function runPlugin(tree: MarkdownDocument, options: Parameters<typeof security>[0] = {}) {
  const plugin = security(options)
  await plugin.post!({ tree, markdown: '', tokens: [], options: {} })
  return tree
}

function isElement(node: Node): node is ElementNode {
  return typeof node !== 'string' && node[0] !== null
}

function collectElements(nodes: Node[]): ElementNode[] {
  const elements: ElementNode[] = []

  for (const node of nodes) {
    if (!isElement(node)) continue
    elements.push(node)
    elements.push(...collectElements(node.slice(2) as Node[]))
  }

  return elements
}

function normalizeAttributeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^(:|v-bind:)/, '')
    .replace(/^(@|v-on:)/, 'on')
    .replace(/:/g, '')
}

function expectNoUnsafeStringProps(props: Record<string, unknown>) {
  for (const [key, value] of Object.entries(props)) {
    if (key === '$' || typeof value !== 'string') continue

    const normalized = normalizeAttributeName(key)
    expect(normalized.startsWith('on'), `${key} should be stripped`).toBe(false)

    if (normalized === 'href' || normalized === 'src' || normalized === 'xlinkhref') {
      const decoded = decodeURIComponent(value).toLowerCase()
      expect(decoded.includes('javascript:')).toBe(false)
      expect(decoded.startsWith('data:text')).toBe(false)
    }
  }
}

const xssMarkdown = `\
<!-- anchol link -->
[a](javascript://www.google.com%0Aprompt(1))
[a](JaVaScRiPt:alert(1))
[XSS](vbscript:alert(document.domain))
<javascript:prompt(document.cookie)>
[x](y '<style>')
<a href="jav&#x09;ascript:alert('XSS');">Click Me</a>

<!-- image -->

![](x){onerror=alert(1) onload="alert('XSS')" }
![a]("onerror="alert(1))
![](contenteditable/autofocus/onfocus=confirm('qwq')//)">
![XSS](data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4K)
<img src=x onerror=alert(1) onload="alert('XSS')" />
<img src=x onerror=alert(1)>">yep</a>
![XSS]("onerror="alert('XSS'))
![XSS](https://www.example.com/image.png"onload="alert('XSS'))
![onload](https://www.example.com/image.png"onload="alert('ImageOnLoad'))
![onerror]("onerror="alert('ImageOnError'))

<!-- iframe -->

:iframe{src=x onerror=alert(1) onload="alert('XSS')" }
<iframe src=x onerror=alert(1) onload="alert('XSS')" />
`.trim()

describe('security plugin — XSS payloads', () => {
  it('sanitizes generic XSS payloads', async () => {
    const tree = await parseWithSecurity(xssMarkdown)

    for (const element of collectElements(tree.nodes)) {
      expectNoUnsafeStringProps(element[1] as Record<string, unknown>)
    }
  })

  it('strips plain javascript: href from anchor elements', async () => {
    const tree = await parseWithSecurity(
      `\
<a href="javascript:alert(1)">this gets sanitized, yay!</a>
`.trim()
    )

    const anchor = collectElements(tree.nodes).find((element) => element[0] === 'a')
    expect(anchor).toBeDefined()
    expect(anchor![1].href).toBeUndefined()
  })

  it('strips a javascript: href delivered as an array via YAML block-props (#367)', async () => {
    // Non-string YAML block-prop values round-trip through a `:`-prefixed
    // JSON-string attr that gets JSON.parsed back into a real array before
    // this plugin runs — validateProp must not skip URL validation just
    // because the value is no longer a plain string.
    const tree = await parseWithSecurity(`\
::a
---
href:
  - javascript:alert(1)
---
click
::`)

    const anchor = collectElements(tree.nodes).find((element) => element[0] === 'a')
    expect(anchor).toBeDefined()
    expect(anchor![1].href).toBeUndefined()
    expect(anchor![1][':href']).toBeUndefined()
  })

  it('catches XSS payloads with HTML entities', async () => {
    const md = `\
## XSS payloads with HTML entities
<a href="jav&#x09;ascript:alert('XSS');">Click Me 1</a>
<a href="jav&#x0A;ascript:alert('XSS');">Click Me 2</a>
<a href="jav&#10;ascript:alert('XSS');">Click Me 3</a>
<a href="&#x09;javascript:alert('XSS');">Click Me 4</a>
`.trim()

    const tree = await parseWithSecurity(md)
    const anchors = collectElements(tree.nodes).filter((element) => element[0] === 'a')

    expect(anchors).toHaveLength(4)
    for (const anchor of anchors) {
      expect(anchor[1].href).toBeUndefined()
    }
  })

  it('blocks xlink:href on SVG anchor elements', async () => {
    const tree = await parseWithSecurity(
      `\
<svg viewBox="0 0 10 10">
  <a xlink:href="javascript:alert(1)">click</a>
</svg>
`.trim()
    )

    const anchor = collectElements(tree.nodes).find((element) => element[0] === 'a')
    expect(anchor).toBeDefined()
    expect(anchor![1]['xlink:href']).toBeUndefined()
    expect(anchor![1].xlinkhref).toBeUndefined()
  })

  it('allows safe xlink:href values', async () => {
    const tree = await parseWithSecurity(
      `\
<svg viewBox="0 0 10 10">
  <a xlink:href="https://example.com">external</a>
  <a xlink:href="/relative/path">relative</a>
</svg>
`.trim()
    )

    const anchors = collectElements(tree.nodes).filter((element) => element[0] === 'a')
    expect(anchors).toHaveLength(2)
    expect(anchors[0]![1]['xlink:href']).toBe('https://example.com')
    expect(anchors[1]![1]['xlink:href']).toBe('/relative/path')
  })

  it('blocks data:text/html on iframe src', async () => {
    const tree = await parseWithSecurity(
      `\
<iframe src="data:text/html,<script>alert(1)</script>"></iframe>
`.trim()
    )

    const iframe = collectElements(tree.nodes).find((element) => element[0] === 'iframe')
    expect(iframe).toBeDefined()
    expect(iframe![1].src).toBeUndefined()
  })

  it('blocks data:text/html on anchor href', async () => {
    const tree = await parseWithSecurity(
      `\
<a href="data:text/html,<script>alert(1)</script>">click</a>
`.trim()
    )

    const anchor = collectElements(tree.nodes).find((element) => element[0] === 'a')
    expect(anchor).toBeDefined()
    expect(anchor![1].href).toBeUndefined()
  })

  it('blocks Vue directive-form event handlers and unsafe URLs', async () => {
    const tree = await parseWithSecurity(
      `\
<p>
  <img :onerror="alert(1)" :onload="alert(1)" v-bind:onerror="alert(1)">
  <button @click="alert(1)" v-on:click="alert(1)">click</button>
  <a :href="javascript:alert(1)" v-bind:href="javascript:alert(1)">link</a>
  <img :src="javascript:alert(1)" v-bind:src="data:text/html,<script>alert(1)</script>">
</p>
`.trim()
    )

    const imgElements = collectElements(tree.nodes).filter((element) => element[0] === 'img')
    const button = collectElements(tree.nodes).find((element) => element[0] === 'button')
    const anchor = collectElements(tree.nodes).find((element) => element[0] === 'a')

    for (const img of imgElements) {
      expect(img[1].onerror ?? img[1][':onerror'] ?? img[1]['v-bind:onerror']).toBeUndefined()
      expect(img[1].onload ?? img[1][':onload']).toBeUndefined()
      expect(img[1].src ?? img[1][':src'] ?? img[1]['v-bind:src']).toBeUndefined()
    }

    expect(button?.[1].onclick ?? button?.[1]['@click'] ?? button?.[1]['v-on:click']).toBeUndefined()
    expect(anchor?.[1].href ?? anchor?.[1][':href'] ?? anchor?.[1]['v-bind:href']).toBeUndefined()
  })

  it('allows safe Vue directive-form href and src values', async () => {
    const tree = await parseWithSecurity(
      `\
<a :href="https://example.com">external</a>
<a v-bind:href="/relative/path">relative</a>
<img :src="https://example.com/image.png">
`.trim()
    )

    const anchors = collectElements(tree.nodes).filter((element) => element[0] === 'a')
    const img = collectElements(tree.nodes).find((element) => element[0] === 'img')

    expect(anchors[0]![1][':href']).toBe('https://example.com')
    expect(anchors[1]![1]['v-bind:href']).toBe('/relative/path')
    expect(img?.[1][':src']).toBe('https://example.com/image.png')
  })

  it('strips Vue directive-form unsafe attributes from parsed HTML', async () => {
    const tree = await parseWithSecurity(
      `\
<p>
  <img :src="x" :onerror="alert(1)">
  <a :href="javascript:alert(1)">click</a>
  <svg :onload="alert(1)"></svg>
</p>
`.trim()
    )

    const img = collectElements(tree.nodes).find((element) => element[0] === 'img')
    const anchor = collectElements(tree.nodes).find((element) => element[0] === 'a')
    const svg = collectElements(tree.nodes).find((element) => element[0] === 'svg')

    expect(img?.[1].onerror ?? img?.[1][':onerror']).toBeUndefined()
    expect(anchor?.[1].href ?? anchor?.[1][':href']).toBeUndefined()
    expect(svg?.[1].onload ?? svg?.[1][':onload']).toBeUndefined()
  })

  it('strips v-bind directive-form unsafe attributes from parsed HTML', async () => {
    const tree = await parseWithSecurity(
      `\
<a v-bind:href="javascript:alert(1)">click</a>
`.trim()
    )

    const anchor = collectElements(tree.nodes).find((element) => element[0] === 'a')
    expect(anchor).toBeDefined()
    expect(anchor![1].href ?? anchor![1]['v-bind:href']).toBeUndefined()
  })

  it('rejects JSON-quoted javascript: URLs in :href bindings', async () => {
    const tree = await parseWithSecurity(
      `\
::a{:href='"javascript:alert(1)"'}
click
::
`.trim()
    )

    const anchor = collectElements(tree.nodes).find((element) => element[0] === 'a')
    expect(anchor).toBeDefined()
    expect(anchor![1].href).toBeUndefined()
    expect(anchor![1][':href']).toBeUndefined()
  })

  it('keeps JSON-quoted safe URLs in :href bindings', async () => {
    const tree = await parseWithSecurity(
      `\
::a{:href='"https://example.com"'}
click
::
`.trim()
    )

    const anchor = collectElements(tree.nodes).find((element) => element[0] === 'a')
    expect(anchor).toBeDefined()
    expect(anchor![1][':href']).toBe('"https://example.com"')
  })

  it('strips framework HTML sink props from components', async () => {
    const tree = await parseWithSecurity(
      `\
::div{innerHTML="<img src=x onerror=alert(1)>"}
::

:span{:dangerouslySetInnerHTML='{"__html":"<img src=x onerror=alert(1)>"}'}
`.trim()
    )

    const div = collectElements(tree.nodes).find((element) => element[0] === 'div')
    const span = collectElements(tree.nodes).find((element) => element[0] === 'span')
    expect(div).toBeDefined()
    expect(div![1].innerHTML).toBeUndefined()
    expect(span).toBeDefined()
    expect(span![1][':dangerouslySetInnerHTML']).toBeUndefined()
  })
})

describe('security plugin — blockedTags', () => {
  it('removes a blocked tag', async () => {
    const tree = makeTree([
      ['script', {}, 'evil()'],
      ['p', {}, 'safe'],
    ])
    await runPlugin(tree, { blockedTags: ['script'] })
    expect(tree.nodes).toHaveLength(1)
    expect((tree.nodes[0] as [string, any])[0]).toBe('p')
  })

  it('removes nested blocked tags', async () => {
    const tree = makeTree([['div', {}, ['script', {}, 'evil()'], ['p', {}, 'safe']]])
    await runPlugin(tree, { blockedTags: ['script'] })
    const div = tree.nodes[0] as [string, any, ...any[]]
    expect(div).toHaveLength(3) // tag, attrs, p
    expect((div[2] as [string, any])[0]).toBe('p')
  })

  it('removes multiple different blocked tags', async () => {
    const tree = makeTree([
      ['script', {}, 'evil()'],
      ['iframe', {}, ''],
      ['p', {}, 'safe'],
    ])
    await runPlugin(tree, { blockedTags: ['script', 'iframe'] })
    expect(tree.nodes).toHaveLength(1)
  })

  it('keeps all tags when blockedTags is empty', async () => {
    const tree = makeTree([
      ['script', {}, 'evil()'],
      ['p', {}, 'safe'],
    ])
    await runPlugin(tree, { blockedTags: [] })
    expect(tree.nodes).toHaveLength(2)
  })

  it('uses empty blockedTags by default', async () => {
    const tree = makeTree([['p', {}, 'hello']])
    await runPlugin(tree)
    expect(tree.nodes).toHaveLength(1)
  })

  it('drops uppercase variant of a tag in blockedTags', async () => {
    const tree = makeTree([
      ['SCRIPT', {}, 'evil()'],
      ['p', {}, 'safe'],
    ])
    await runPlugin(tree, { blockedTags: ['script'] })
    expect(tree.nodes).toHaveLength(1)
    expect((tree.nodes[0] as [string, any])[0]).toBe('p')
  })

  it('drops mixed-case ScRipt when script is blocked', async () => {
    const tree = makeTree([
      ['ScRipt', {}, 'evil()'],
      ['p', {}, 'safe'],
    ])
    await runPlugin(tree, { blockedTags: ['script'] })
    expect(tree.nodes).toHaveLength(1)
  })

  it('drops uppercase IFRAME when iframe is blocked', async () => {
    const tree = makeTree([
      ['IFRAME', { src: 'https://evil.com' }],
      ['p', {}, 'safe'],
    ])
    await runPlugin(tree, { blockedTags: ['iframe'] })
    expect(tree.nodes).toHaveLength(1)
  })

  it('drops nested mixed-case tag', async () => {
    const tree = makeTree([['div', {}, ['SCRIPT', {}, 'evil()'], ['p', {}, 'safe']]])
    await runPlugin(tree, { blockedTags: ['script'] })
    const div = tree.nodes[0] as [string, any, ...any[]]
    expect(div).toHaveLength(3) // tag, attrs, p
    expect((div[2] as [string, any])[0]).toBe('p')
  })
})

describe('security plugin — allowedTags', () => {
  it('removes all other tags', async () => {
    const tree = makeTree([
      ['script', {}, 'evil()'],
      ['p', {}, 'safe'],
    ])
    await runPlugin(tree, { allowedTags: ['p'] })
    expect(tree.nodes).toHaveLength(1)
    expect((tree.nodes[0] as [string, any])[0]).toBe('p')
  })

  it('text content for all other tags', async () => {
    const tree = makeTree([
      ['code', {}, 'evil()'],
      ['p', {}, 'safe'],
    ])
    await runPlugin(tree, { allowedTags: ['p'], tagFallback: (e) => textContent(e) })
    expect(tree.nodes).toHaveLength(2)
    expect(tree.nodes[0] as [string, any]).toBe('evil()')
    expect((tree.nodes[1] as [string, any])[0]).toBe('p')
  })

  it('raw content all other tags', async () => {
    const tree = makeTree([
      ['code', {}, 'evil()'],
      ['p', {}, 'safe'],
    ])
    await runPlugin(tree, { allowedTags: ['p'], tagFallback: async (e) => await renderMarkdown({ nodes: [e] }) })
    expect(tree.nodes).toHaveLength(2)
    expect(tree.nodes[0] as [string, any]).toBe('`evil()`')
    expect((tree.nodes[1] as [string, any])[0]).toBe('p')
  })
})

describe('security plugin — as prop', () => {
  it('strips as pointing at a blocked tag', async () => {
    const tree = makeTree([['span', { as: 'script' }, 'x']])
    await runPlugin(tree, { blockedTags: ['script'] })
    const el = tree.nodes[0] as [string, any]
    expect(el[0]).toBe('span')
    expect(el[1].as).toBeUndefined()
  })

  it('strips as pointing at a tag outside allowedTags', async () => {
    const tree = makeTree([['span', { as: 'AdminPanel' }, 'x']])
    await runPlugin(tree, { allowedTags: ['span'] })
    const el = tree.nodes[0] as [string, any]
    expect(el[1].as).toBeUndefined()
  })

  it('keeps as when the resolved tag is allowed', async () => {
    const tree = makeTree([['span', { as: 'Badge' }, 'x']])
    await runPlugin(tree, { allowedTags: ['span', 'badge'] })
    const el = tree.nodes[0] as [string, any]
    expect(el[1].as).toBe('Badge')
  })

  it('keeps as when no tag filters are configured', async () => {
    const tree = makeTree([['span', { as: 'Badge' }, 'x']])
    await runPlugin(tree)
    const el = tree.nodes[0] as [string, any]
    expect(el[1].as).toBe('Badge')
  })
})

describe('security plugin — prop sanitization', () => {
  it('strips event handler props', async () => {
    const tree = makeTree([['div', { onclick: 'evil()', class: 'safe' }]])
    await runPlugin(tree)
    const el = tree.nodes[0] as [string, any]
    expect(el[1]).not.toHaveProperty('onclick')
    expect(el[1]).toHaveProperty('class', 'safe')
  })

  it('strips unsafe href', async () => {
    const tree = makeTree([['a', { href: 'javascript:alert(1)', class: 'link' }]])
    await runPlugin(tree)
    const el = tree.nodes[0] as [string, any]
    expect(el[1]).not.toHaveProperty('href')
    expect(el[1]).toHaveProperty('class', 'link')
  })

  it('keeps safe href', async () => {
    const tree = makeTree([['a', { href: 'https://example.com' }]])
    await runPlugin(tree)
    const el = tree.nodes[0] as [string, any]
    expect(el[1]).toHaveProperty('href', 'https://example.com')
  })

  it('keeps a prop whose value is the boolean `false` (#367)', async () => {
    const tree = makeTree([['comp', { enabled: false, count: 3 }]])
    await runPlugin(tree)
    const el = tree.nodes[0] as [string, any]
    expect(el[1]).toEqual({ enabled: false, count: 3 })
  })

  it('keeps a `false` prop alongside a genuinely unsafe attribute, stripping only the unsafe one', async () => {
    const tree = makeTree([['comp', { enabled: false, onclick: 'evil()' }]])
    await runPlugin(tree)
    const el = tree.nodes[0] as [string, any]
    expect(el[1]).toEqual({ enabled: false })
  })

  it('leaves string nodes untouched', async () => {
    const tree = makeTree([['p', {}, 'hello']])
    await runPlugin(tree)
    const el = tree.nodes[0] as [string, any, ...any[]]
    expect(el[2]).toBe('hello')
  })

  it('leaves comment nodes untouched', async () => {
    const commentNode: [null, {}, string] = [null, {}, 'comment text']
    const tree = makeTree([commentNode])
    await runPlugin(tree)
    expect(tree.nodes[0]).toEqual([null, {}, 'comment text'])
  })

  it('does not modify elements with no props', async () => {
    const tree = makeTree([['p', {}]])
    await runPlugin(tree)
    expect(tree.nodes).toHaveLength(1)
    expect((tree.nodes[0] as [string, any])[1]).toEqual({})
  })

  it('sanitizes props on nested elements', async () => {
    const tree = makeTree([['div', {}, ['a', { href: 'javascript:evil()' }, 'click']]])
    await runPlugin(tree)
    const div = tree.nodes[0] as [string, any, ...any[]]
    const a = div[2] as [string, any]
    expect(a[1]).not.toHaveProperty('href')
  })
})

describe('security plugin — allowedLinkPrefixes', () => {
  it('strips href that does not match allowed prefix', async () => {
    const tree = makeTree([['a', { href: 'https://evil.com/page' }]])
    await runPlugin(tree, { allowedLinkPrefixes: ['https://myapp.com'] })
    expect((tree.nodes[0] as [string, any])[1]).not.toHaveProperty('href')
  })

  it('keeps href that matches allowed prefix', async () => {
    const tree = makeTree([['a', { href: 'https://myapp.com/page' }]])
    await runPlugin(tree, { allowedLinkPrefixes: ['https://myapp.com'] })
    expect((tree.nodes[0] as [string, any])[1]).toHaveProperty('href', 'https://myapp.com/page')
  })

  it('rewrites disallowed href to defaultOrigin', async () => {
    const tree = makeTree([['a', { href: 'https://evil.com/page' }]])
    await runPlugin(tree, {
      allowedLinkPrefixes: ['https://myapp.com'],
      defaultOrigin: 'https://myapp.com',
    })
    const href = (tree.nodes[0] as [string, any])[1].href as string
    expect(href).toMatch(/^https:\/\/myapp\.com/)
  })

  it('always keeps relative hrefs', async () => {
    const tree = makeTree([['a', { href: '/about' }]])
    await runPlugin(tree, { allowedLinkPrefixes: ['https://myapp.com'] })
    expect((tree.nodes[0] as [string, any])[1]).toHaveProperty('href', '/about')
  })
})

describe('security plugin — allowedImagePrefixes', () => {
  it('strips src that does not match allowed prefix', async () => {
    const tree = makeTree([['img', { src: 'https://tracker.evil.com/px.gif', alt: 'x' }]])
    await runPlugin(tree, { allowedImagePrefixes: ['https://cdn.myapp.com'] })
    expect((tree.nodes[0] as [string, any])[1]).not.toHaveProperty('src')
    expect((tree.nodes[0] as [string, any])[1]).toHaveProperty('alt', 'x')
  })

  it('keeps src that matches allowed prefix', async () => {
    const tree = makeTree([['img', { src: 'https://cdn.myapp.com/logo.png' }]])
    await runPlugin(tree, { allowedImagePrefixes: ['https://cdn.myapp.com'] })
    expect((tree.nodes[0] as [string, any])[1]).toHaveProperty('src', 'https://cdn.myapp.com/logo.png')
  })

  it('rewrites disallowed src to defaultOrigin', async () => {
    const tree = makeTree([['img', { src: 'https://evil.com/tracker.gif' }]])
    await runPlugin(tree, {
      allowedImagePrefixes: ['https://cdn.myapp.com'],
      defaultOrigin: 'https://cdn.myapp.com',
    })
    const src = (tree.nodes[0] as [string, any])[1].src as string
    expect(src).toMatch(/^https:\/\/cdn\.myapp\.com/)
  })
})

describe('security plugin — allowedProtocols', () => {
  it('strips href with disallowed protocol', async () => {
    const tree = makeTree([['a', { href: 'http://example.com' }]])
    await runPlugin(tree, { allowedProtocols: ['https'] })
    expect((tree.nodes[0] as [string, any])[1]).not.toHaveProperty('href')
  })

  it('keeps href with allowed protocol', async () => {
    const tree = makeTree([['a', { href: 'https://example.com' }]])
    await runPlugin(tree, { allowedProtocols: ['https'] })
    expect((tree.nodes[0] as [string, any])[1]).toHaveProperty('href', 'https://example.com')
  })

  it('always blocks javascript: regardless of allowedProtocols', async () => {
    const tree = makeTree([['a', { href: 'javascript:alert(1)' }]])
    await runPlugin(tree, { allowedProtocols: ['*'] })
    expect((tree.nodes[0] as [string, any])[1]).not.toHaveProperty('href')
  })
})

describe('security plugin — allowDataImages', () => {
  it('allows data: src by default', async () => {
    const tree = makeTree([['img', { src: 'data:image/png;base64,abc' }]])
    await runPlugin(tree)
    expect((tree.nodes[0] as [string, any])[1]).toHaveProperty('src')
  })

  it('strips data: src when allowDataImages is false', async () => {
    const tree = makeTree([['img', { src: 'data:image/png;base64,abc' }]])
    await runPlugin(tree, { allowDataImages: false })
    expect((tree.nodes[0] as [string, any])[1]).not.toHaveProperty('src')
  })

  it('data:text/* hrefs are always stripped regardless of allowDataImages', async () => {
    const tree = makeTree([['a', { href: 'data:text/html,<script>evil()</script>' }]])
    await runPlugin(tree, { allowDataImages: true })
    expect((tree.nodes[0] as [string, any])[1]).not.toHaveProperty('href')
  })
})
