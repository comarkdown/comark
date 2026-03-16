import { describe, expect, it, vi } from 'vitest'
import security from '../src/plugins/security'
import { validateProp, validateProps } from '../src/internal/props-validation'
import type { ComarkTree } from 'comark'

// ─── validateProp ────────────────────────────────────────────────────────────

describe('validateProp', () => {
  describe('event handlers', () => {
    it('blocks onclick', () => {
      expect(validateProp('onclick', 'alert(1)')).toBe(false)
    })

    it('blocks onmouseover', () => {
      expect(validateProp('onmouseover', 'evil()')).toBe(false)
    })

    it('blocks uppercase ON* attributes', () => {
      expect(validateProp('ONCLICK', 'alert(1)')).toBe(false)
    })

    it('blocks mixed-case On* attributes', () => {
      expect(validateProp('OnLoad', 'evil()')).toBe(false)
    })
  })

  describe('unsafe attributes', () => {
    it('blocks srcdoc', () => {
      expect(validateProp('srcdoc', '<script>evil()</script>')).toBe(false)
    })

    it('blocks formaction', () => {
      expect(validateProp('formaction', 'https://evil.com')).toBe(false)
    })
  })

  describe('href safety', () => {
    it('allows relative hrefs', () => {
      expect(validateProp('href', '/about')).toBe('/about')
    })

    it('allows https hrefs', () => {
      expect(validateProp('href', 'https://example.com')).toBe('https://example.com')
    })

    it('allows http hrefs', () => {
      expect(validateProp('href', 'http://example.com')).toBe('http://example.com')
    })

    it('allows mailto hrefs', () => {
      expect(validateProp('href', 'mailto:user@example.com')).toBe('mailto:user@example.com')
    })

    it('blocks javascript: hrefs', () => {
      expect(validateProp('href', 'javascript:alert(1)')).toBe(false)
    })

    it('blocks javascript: hrefs with uppercase', () => {
      expect(validateProp('href', 'JAVASCRIPT:alert(1)')).toBe(false)
    })

    it('blocks data:text/html hrefs', () => {
      expect(validateProp('href', 'data:text/html,<script>evil()</script>')).toBe(false)
    })

    it('blocks data:text/javascript hrefs', () => {
      expect(validateProp('href', 'data:text/javascript,evil()')).toBe(false)
    })

    it('blocks data:text/css hrefs', () => {
      expect(validateProp('href', 'data:text/css,body{}')).toBe(false)
    })

    it('blocks data:text/xml hrefs', () => {
      expect(validateProp('href', 'data:text/xml,<x/>')).toBe(false)
    })

    it('blocks data:text/plain hrefs', () => {
      expect(validateProp('href', 'data:text/plain,hello')).toBe(false)
    })

    it('blocks data:text/vbscript hrefs', () => {
      expect(validateProp('href', 'data:text/vbscript,evil')).toBe(false)
    })

    it('blocks vbscript: hrefs', () => {
      expect(validateProp('href', 'vbscript:MsgBox(1)')).toBe(false)
    })

    it('blocks URL-encoded javascript: hrefs', () => {
      expect(validateProp('href', 'javascript%3Aalert(1)')).toBe(false)
    })
  })

  describe('src safety', () => {
    it('allows https src', () => {
      expect(validateProp('src', 'https://example.com/img.png')).toBe('https://example.com/img.png')
    })

    it('allows relative src', () => {
      expect(validateProp('src', '/images/photo.jpg')).toBe('/images/photo.jpg')
    })

    it('blocks javascript: src', () => {
      expect(validateProp('src', 'javascript:evil()')).toBe(false)
    })
  })

  describe('safe attributes', () => {
    it('allows class', () => {
      expect(validateProp('class', 'foo bar')).toBe('foo bar')
    })

    it('allows id', () => {
      expect(validateProp('id', 'main')).toBe('main')
    })

    it('allows style', () => {
      expect(validateProp('style', 'color:red')).toBe('color:red')
    })

    it('allows data-* attributes', () => {
      expect(validateProp('data-value', '42')).toBe('42')
    })
  })

  describe('allowedProtocols', () => {
    it('allows href whose protocol is in the list', () => {
      expect(validateProp('href', 'https://example.com', { allowedProtocols: ['https'] })).toBe('https://example.com')
    })

    it('blocks href whose protocol is not in the list', () => {
      expect(validateProp('href', 'http://example.com', { allowedProtocols: ['https'] })).toBe(false)
    })

    it('blocks ftp when only https and mailto are allowed', () => {
      expect(validateProp('href', 'ftp://files.example.com', { allowedProtocols: ['https', 'mailto'] })).toBe(false)
    })

    it('allows mailto when included in the list', () => {
      expect(validateProp('href', 'mailto:hi@example.com', { allowedProtocols: ['https', 'mailto'] })).toBe('mailto:hi@example.com')
    })

    it('always blocks javascript: even if listed in allowedProtocols', () => {
      expect(validateProp('href', 'javascript:alert(1)', { allowedProtocols: ['javascript'] })).toBe(false)
    })

    it('wildcard ["*"] allows all safe protocols', () => {
      expect(validateProp('href', 'ftp://files.example.com', { allowedProtocols: ['*'] })).toBe('ftp://files.example.com')
    })
  })

  describe('allowedLinkPrefixes', () => {
    it('allows href that matches an allowed prefix', () => {
      expect(validateProp('href', 'https://myapp.com/page', { allowedLinkPrefixes: ['https://myapp.com'] })).toBe('https://myapp.com/page')
    })

    it('blocks href that does not match any allowed prefix', () => {
      expect(validateProp('href', 'https://evil.com/page', { allowedLinkPrefixes: ['https://myapp.com'] })).toBe(false)
    })

    it('relative hrefs are always allowed regardless of prefix list', () => {
      expect(validateProp('href', '/about', { allowedLinkPrefixes: ['https://myapp.com'] })).toBe('/about')
    })

    it('rewrites disallowed href to defaultOrigin when provided', () => {
      const result = validateProp('href', 'https://evil.com/page', {
        allowedLinkPrefixes: ['https://myapp.com'],
        defaultOrigin: 'https://myapp.com',
      })
      expect(result).toMatch(/^https:\/\/myapp\.com/)
    })

    it('allowedLinkPrefixes does not restrict src attributes', () => {
      expect(validateProp('src', 'https://any.com/img.png', { allowedLinkPrefixes: ['https://myapp.com'] })).toBe('https://any.com/img.png')
    })
  })

  describe('allowedImagePrefixes', () => {
    it('allows src that matches an allowed prefix', () => {
      expect(validateProp('src', 'https://cdn.myapp.com/img.png', { allowedImagePrefixes: ['https://cdn.myapp.com'] })).toBe('https://cdn.myapp.com/img.png')
    })

    it('blocks src that does not match any allowed prefix', () => {
      expect(validateProp('src', 'https://tracker.evil.com/px.gif', { allowedImagePrefixes: ['https://cdn.myapp.com'] })).toBe(false)
    })

    it('relative src is always allowed regardless of prefix list', () => {
      expect(validateProp('src', '/img/logo.png', { allowedImagePrefixes: ['https://cdn.myapp.com'] })).toBe('/img/logo.png')
    })

    it('rewrites disallowed src to defaultOrigin when provided', () => {
      const result = validateProp('src', 'https://evil.com/tracker.gif', {
        allowedImagePrefixes: ['https://cdn.myapp.com'],
        defaultOrigin: 'https://cdn.myapp.com',
      })
      expect(result).toMatch(/^https:\/\/cdn\.myapp\.com/)
    })

    it('allowedImagePrefixes does not restrict href attributes', () => {
      expect(validateProp('href', 'https://any.com/page', { allowedImagePrefixes: ['https://cdn.myapp.com'] })).toBe('https://any.com/page')
    })
  })

  describe('allowDataImages', () => {
    it('allows data: src by default', () => {
      expect(validateProp('src', 'data:image/png;base64,abc')).not.toBe(false)
    })

    it('blocks data: src when allowDataImages is false', () => {
      expect(validateProp('src', 'data:image/png;base64,abc', { allowDataImages: false })).toBe(false)
    })

    it('blocks data:image/svg+xml src when allowDataImages is false', () => {
      expect(validateProp('src', 'data:image/svg+xml,<svg/>', { allowDataImages: false })).toBe(false)
    })

    it('does not affect href when allowDataImages is false', () => {
      // allowDataImages only controls src; data:text/* is still blocked by the unsafe prefix list
      expect(validateProp('href', 'https://example.com', { allowDataImages: false })).toBe('https://example.com')
    })

    it('data:text/html in href is always blocked regardless of allowDataImages', () => {
      expect(validateProp('href', 'data:text/html,<script>evil()</script>', { allowDataImages: true })).toBe(false)
    })
  })
})

// ─── validateProps ────────────────────────────────────────────────────────────

describe('validateProps', () => {
  it('returns empty object for undefined props', () => {
    expect(validateProps('div', undefined)).toEqual({})
  })

  it('returns empty object for empty props', () => {
    expect(validateProps('div', {})).toEqual({})
  })

  it('strips all props from unsafe tags', () => {
    expect(validateProps('object', { data: '/foo', type: 'text/html' })).toEqual({})
  })

  it('removes unsafe event handler props', () => {
    const result = validateProps('div', { onclick: 'evil()', class: 'safe' })
    expect(result).not.toHaveProperty('onclick')
    expect(result).toHaveProperty('class', 'safe')
  })

  it('removes empty id attribute', () => {
    const result = validateProps('div', { id: '', class: 'foo' })
    expect(result).not.toHaveProperty('id')
    expect(result).toHaveProperty('class', 'foo')
  })

  it('keeps non-empty id attribute', () => {
    const result = validateProps('div', { id: 'main' })
    expect(result).toHaveProperty('id', 'main')
  })

  it('warns when removing an unsafe attribute', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    validateProps('a', { href: 'javascript:evil()' })
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('removing unsafe attribute'))
    spy.mockRestore()
  })

  it('passes options through to prop validation', () => {
    const result = validateProps('a', { href: 'http://example.com' }, { allowedProtocols: ['https'] })
    expect(result).not.toHaveProperty('href')
  })
})

// ─── case-insensitive XSS bypass ─────────────────────────────────────────────

describe('validateProps – unsafe tag case bypass', () => {
  it('strips all props from OBJECT (uppercase)', () => {
    expect(validateProps('OBJECT', { data: '/foo', type: 'text/html' })).toEqual({})
  })

  it('strips all props from Object (mixed case)', () => {
    expect(validateProps('Object', { data: '/foo' })).toEqual({})
  })
})

// ─── security plugin ──────────────────────────────────────────────────────────

function makeTree(nodes: ComarkTree['nodes']): ComarkTree {
  return { nodes, frontmatter: {}, meta: {} }
}

async function runPlugin(tree: ComarkTree, options: Parameters<typeof security>[0] = {}) {
  const plugin = security(options)
  await plugin.post!({ tree, markdown: '', tokens: [], options: {} })
  return tree
}

describe('security plugin', () => {
  describe('blockedTags', () => {
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
      const tree = makeTree([
        ['div', {}, ['script', {}, 'evil()'], ['p', {}, 'safe']],
      ])
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
      const tree = makeTree([
        ['div', {}, ['SCRIPT', {}, 'evil()'], ['p', {}, 'safe']],
      ])
      await runPlugin(tree, { blockedTags: ['script'] })
      const div = tree.nodes[0] as [string, any, ...any[]]
      expect(div).toHaveLength(3) // tag, attrs, p
      expect((div[2] as [string, any])[0]).toBe('p')
    })
  })

  describe('prop sanitization', () => {
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
      const tree = makeTree([
        ['div', {}, ['a', { href: 'javascript:evil()' }, 'click']],
      ])
      await runPlugin(tree)
      const div = tree.nodes[0] as [string, any, ...any[]]
      const a = div[2] as [string, any]
      expect(a[1]).not.toHaveProperty('href')
    })
  })

  describe('allowedLinkPrefixes', () => {
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

  describe('allowedImagePrefixes', () => {
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

  describe('allowedProtocols', () => {
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

  describe('allowDataImages', () => {
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
})
