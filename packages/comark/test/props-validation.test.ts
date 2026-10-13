import { describe, expect, it, vi } from 'vitest'
import { REJECTED_PROP, validateProp, validateProps } from '../src/internal/props-validation'

describe('validateProp', () => {
  describe('event handlers', () => {
    it('blocks onclick', () => {
      expect(validateProp('onclick', 'alert(1)')).toBe(REJECTED_PROP)
    })

    it('blocks onmouseover', () => {
      expect(validateProp('onmouseover', 'evil()')).toBe(REJECTED_PROP)
    })

    it('blocks uppercase ON* attributes', () => {
      expect(validateProp('ONCLICK', 'alert(1)')).toBe(REJECTED_PROP)
    })

    it('blocks mixed-case On* attributes', () => {
      expect(validateProp('OnLoad', 'evil()')).toBe(REJECTED_PROP)
    })
  })

  describe('unsafe attributes', () => {
    it('blocks srcdoc', () => {
      expect(validateProp('srcdoc', '<script>evil()</script>')).toBe(REJECTED_PROP)
    })

    it('blocks formaction', () => {
      expect(validateProp('formaction', 'https://evil.com')).toBe(REJECTED_PROP)
    })

    it('blocks innerHTML (any case)', () => {
      expect(validateProp('innerHTML', '<img src=x onerror=alert(1)>')).toBe(REJECTED_PROP)
      expect(validateProp('innerHtml', '<img src=x onerror=alert(1)>')).toBe(REJECTED_PROP)
      expect(validateProp('INNERHTML', '<img src=x onerror=alert(1)>')).toBe(REJECTED_PROP)
    })

    it('blocks dangerouslySetInnerHTML', () => {
      expect(validateProp('dangerouslySetInnerHTML', { __html: '<img src=x onerror=alert(1)>' })).toBe(REJECTED_PROP)
    })

    it('blocks textContent', () => {
      expect(validateProp('textContent', 'overlay')).toBe(REJECTED_PROP)
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
      expect(validateProp('href', 'javascript:alert(1)')).toBe(REJECTED_PROP)
    })

    it('blocks javascript: hrefs with uppercase', () => {
      expect(validateProp('href', 'JAVASCRIPT:alert(1)')).toBe(REJECTED_PROP)
    })

    it('blocks data:text/html hrefs', () => {
      expect(validateProp('href', 'data:text/html,<script>evil()</script>')).toBe(REJECTED_PROP)
    })

    it('blocks data:text/javascript hrefs', () => {
      expect(validateProp('href', 'data:text/javascript,evil()')).toBe(REJECTED_PROP)
    })

    it('blocks data:text/css hrefs', () => {
      expect(validateProp('href', 'data:text/css,body{}')).toBe(REJECTED_PROP)
    })

    it('blocks data:text/xml hrefs', () => {
      expect(validateProp('href', 'data:text/xml,<x/>')).toBe(REJECTED_PROP)
    })

    it('blocks data:text/plain hrefs', () => {
      expect(validateProp('href', 'data:text/plain,hello')).toBe(REJECTED_PROP)
    })

    it('blocks data:text/vbscript hrefs', () => {
      expect(validateProp('href', 'data:text/vbscript,evil')).toBe(REJECTED_PROP)
    })

    it('blocks data:text/html with spaces before the MIME type', () => {
      // Browsers trim them and render HTML; `new URL()` keeps them in `href`.
      expect(validateProp('href', 'data: text/html,<script>evil()</script>')).toBe(REJECTED_PROP)
      expect(validateProp('href', 'data:   text/html,<script>evil()</script>')).toBe(REJECTED_PROP)
      expect(validateProp('src', 'data: text/html,<script>evil()</script>')).toBe(REJECTED_PROP)
      expect(validateProp('to', 'data: text/html,<script>evil()</script>')).toBe(REJECTED_PROP)
    })

    it('keeps data:image URLs with spaces before the MIME type when data images are allowed', () => {
      expect(validateProp('src', 'data: image/png;base64,abc')).toBe('data: image/png;base64,abc')
    })

    it('blocks entity-encoded javascript: hrefs', () => {
      expect(validateProp('href', 'javascript&#58;alert(1)')).toBe(REJECTED_PROP)
      expect(validateProp('href', 'javascript&#x3A;alert(1)')).toBe(REJECTED_PROP)
      expect(validateProp('href', 'javascript&colon;alert(1)')).toBe(REJECTED_PROP)
    })

    it('blocks entity-encoded whitespace inside the scheme', () => {
      expect(validateProp('href', 'jav&#x09;ascript:alert(1)')).toBe(REJECTED_PROP)
      expect(validateProp('href', 'java&Tab;script:alert(1)')).toBe(REJECTED_PROP)
      expect(validateProp('href', '&NewLine;javascript:alert(1)')).toBe(REJECTED_PROP)
    })

    it('blocks nested-encoded javascript: hrefs', () => {
      expect(validateProp('href', 'javascript&amp;#58;alert(1)')).toBe(REJECTED_PROP)
    })

    it('allows safe URLs containing entities', () => {
      expect(validateProp('href', '/search?q=a&amp;b=2')).toBe('/search?q=a&amp;b=2')
      expect(validateProp('href', 'https://example.com/?a=1&amp;b=2')).toBe('https://example.com/?a=1&amp;b=2')
    })

    it('blocks vbscript: hrefs', () => {
      expect(validateProp('href', 'vbscript:MsgBox(1)')).toBe(REJECTED_PROP)
    })

    it('blocks URL-encoded javascript: hrefs', () => {
      expect(validateProp('href', 'javascript%3Aalert(1)')).toBe(REJECTED_PROP)
    })

    it('rejects a non-string href instead of passing it through unvalidated', () => {
      // A non-string href can reach here via the YAML block-props JSON round-trip
      // (e.g. `href:\n  - javascript:alert(1)` parses to a real array). It must
      // not bypass validateUrl just because typeof value !== 'string'.
      expect(validateProp('href', ['javascript:alert(1)'])).toBe(REJECTED_PROP)
      expect(validateProp('href', { toString: () => 'javascript:alert(1)' })).toBe(REJECTED_PROP)
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
      expect(validateProp('src', 'javascript:evil()')).toBe(REJECTED_PROP)
    })

    it('rejects a non-string src instead of passing it through unvalidated', () => {
      expect(validateProp('src', ['javascript:evil()'])).toBe(REJECTED_PROP)
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

  describe('boolean false values (#367)', () => {
    it('keeps a real boolean `false` value, not the rejection sentinel', () => {
      expect(validateProp('enabled', false)).toBe(false)
      expect(validateProp('pagination', false)).toBe(false)
    })

    it('does not confuse a boolean `false` value with a rejected attribute', () => {
      expect(validateProp('enabled', false)).not.toBe(REJECTED_PROP)
    })

    it('still rejects genuinely unsafe attributes when the value happens to be a string', () => {
      expect(validateProp('onclick', 'alert(1)')).toBe(REJECTED_PROP)
    })
  })

  describe('allowedProtocols', () => {
    it('allows href whose protocol is in the list', () => {
      expect(validateProp('href', 'https://example.com', { allowedProtocols: ['https'] })).toBe('https://example.com')
    })

    it('blocks href whose protocol is not in the list', () => {
      expect(validateProp('href', 'http://example.com', { allowedProtocols: ['https'] })).toBe(REJECTED_PROP)
    })

    it('blocks ftp when only https and mailto are allowed', () => {
      expect(validateProp('href', 'ftp://files.example.com', { allowedProtocols: ['https', 'mailto'] })).toBe(
        REJECTED_PROP
      )
    })

    it('allows mailto when included in the list', () => {
      expect(validateProp('href', 'mailto:hi@example.com', { allowedProtocols: ['https', 'mailto'] })).toBe(
        'mailto:hi@example.com'
      )
    })

    it('always blocks javascript: even if listed in allowedProtocols', () => {
      expect(validateProp('href', 'javascript:alert(1)', { allowedProtocols: ['javascript'] })).toBe(REJECTED_PROP)
    })

    it('wildcard ["*"] allows all safe protocols', () => {
      expect(validateProp('href', 'ftp://files.example.com', { allowedProtocols: ['*'] })).toBe(
        'ftp://files.example.com'
      )
    })
  })

  describe('allowedLinkPrefixes', () => {
    it('allows href that matches an allowed prefix', () => {
      expect(validateProp('href', 'https://myapp.com/page', { allowedLinkPrefixes: ['https://myapp.com'] })).toBe(
        'https://myapp.com/page'
      )
    })

    it('blocks href that does not match any allowed prefix', () => {
      expect(validateProp('href', 'https://evil.com/page', { allowedLinkPrefixes: ['https://myapp.com'] })).toBe(
        REJECTED_PROP
      )
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
      expect(validateProp('src', 'https://any.com/img.png', { allowedLinkPrefixes: ['https://myapp.com'] })).toBe(
        'https://any.com/img.png'
      )
    })

    it('blocks scheme-relative URLs pointing at other hosts', () => {
      expect(validateProp('href', '//evil.com/p', { allowedLinkPrefixes: ['https://myapp.com'] })).toBe(REJECTED_PROP)
    })

    it('blocks backslash-relative URLs pointing at other hosts', () => {
      expect(validateProp('href', '\\\\evil.com/p', { allowedLinkPrefixes: ['https://myapp.com'] })).toBe(REJECTED_PROP)
    })

    it('blocks lookalike hosts that share a string prefix', () => {
      expect(validateProp('href', 'https://myapp.com.evil.com/p', { allowedLinkPrefixes: ['https://myapp.com'] })).toBe(
        REJECTED_PROP
      )
    })

    it('allows subpaths of an allowed origin', () => {
      expect(validateProp('href', 'https://myapp.com/docs/page', { allowedLinkPrefixes: ['https://myapp.com'] })).toBe(
        'https://myapp.com/docs/page'
      )
    })

    it('allows lookalike-host URLs with the default policy', () => {
      expect(validateProp('href', 'https://myapp.com.evil.com/p')).toBe('https://myapp.com.evil.com/p')
      expect(validateProp('href', '//evil.com/p')).toBe('//evil.com/p')
    })
  })

  describe('binding values', () => {
    it('validates the JSON-decoded form of :href bindings', () => {
      expect(validateProp(':href', '"javascript:alert(1)"')).toBe(REJECTED_PROP)
      expect(validateProp('v-bind:href', '"javascript:alert(1)"')).toBe(REJECTED_PROP)
      expect(validateProp(':src', '"data:text/html,<script>alert(1)</script>"')).toBe(REJECTED_PROP)
    })

    it('keeps the original binding string when the decoded URL is safe', () => {
      expect(validateProp(':href', '"https://example.com"')).toBe('"https://example.com"')
    })

    it('passes dot-path bindings through unchanged', () => {
      expect(validateProp(':href', 'frontmatter.home')).toBe('frontmatter.home')
    })

    it('does not JSON-decode plain (non-binding) hrefs', () => {
      expect(validateProp('href', '"https://example.com"')).toBe('"https://example.com"')
    })
  })

  describe('allowedImagePrefixes', () => {
    it('allows src that matches an allowed prefix', () => {
      expect(
        validateProp('src', 'https://cdn.myapp.com/img.png', { allowedImagePrefixes: ['https://cdn.myapp.com'] })
      ).toBe('https://cdn.myapp.com/img.png')
    })

    it('blocks src that does not match any allowed prefix', () => {
      expect(
        validateProp('src', 'https://tracker.evil.com/px.gif', { allowedImagePrefixes: ['https://cdn.myapp.com'] })
      ).toBe(REJECTED_PROP)
    })

    it('relative src is always allowed regardless of prefix list', () => {
      expect(validateProp('src', '/img/logo.png', { allowedImagePrefixes: ['https://cdn.myapp.com'] })).toBe(
        '/img/logo.png'
      )
    })

    it('blocks scheme-relative src pointing at other hosts', () => {
      expect(
        validateProp('src', '//tracker.evil.com/px.gif', { allowedImagePrefixes: ['https://cdn.myapp.com'] })
      ).toBe(REJECTED_PROP)
    })

    it('rewrites disallowed src to defaultOrigin when provided', () => {
      const result = validateProp('src', 'https://evil.com/tracker.gif', {
        allowedImagePrefixes: ['https://cdn.myapp.com'],
        defaultOrigin: 'https://cdn.myapp.com',
      })
      expect(result).toMatch(/^https:\/\/cdn\.myapp\.com/)
    })

    it('allowedImagePrefixes does not restrict href attributes', () => {
      expect(validateProp('href', 'https://any.com/page', { allowedImagePrefixes: ['https://cdn.myapp.com'] })).toBe(
        'https://any.com/page'
      )
    })
  })

  describe('allowDataImages', () => {
    it('allows data: src by default', () => {
      expect(validateProp('src', 'data:image/png;base64,abc')).not.toBe(REJECTED_PROP)
    })

    it('blocks data: src when allowDataImages is false', () => {
      expect(validateProp('src', 'data:image/png;base64,abc', { allowDataImages: false })).toBe(REJECTED_PROP)
    })

    it('blocks data:image/svg+xml src when allowDataImages is false', () => {
      expect(validateProp('src', 'data:image/svg+xml,<svg/>', { allowDataImages: false })).toBe(REJECTED_PROP)
    })

    it('does not affect href when allowDataImages is false', () => {
      // allowDataImages only controls src; data:text/* is still blocked by the unsafe prefix list
      expect(validateProp('href', 'https://example.com', { allowDataImages: false })).toBe('https://example.com')
    })

    it('data:text/html in href is always blocked regardless of allowDataImages', () => {
      expect(validateProp('href', 'data:text/html,<script>evil()</script>', { allowDataImages: true })).toBe(
        REJECTED_PROP
      )
    })
  })

  describe('xlink:href', () => {
    it('allows safe xlink:href values', () => {
      expect(validateProp('xlinkhref', 'https://example.com')).toBe('https://example.com')
      expect(validateProp('xLinkHref', 'https://example.com')).toBe('https://example.com')
      expect(validateProp('xlink:href', 'https://example.com')).toBe('https://example.com')
      expect(validateProp('xlinkhref', '/relative/path')).toBe('/relative/path')
    })

    it('blocks javascript: xlink:href', () => {
      expect(validateProp('xlink:href', 'javascript:alert(1)')).toBe(REJECTED_PROP)
    })
  })

  describe('URL props beyond href/src', () => {
    it('blocks script URLs in `to`, `*Url`, `*Link`, `*Src` and other URL attributes', () => {
      const payloads: Array<[string, string]> = [
        ['to', 'javascript:alert(1)'],
        ['To', 'JaVaScRiPt:alert(1)'],
        ['to', 'javascript&#58;alert(1)'],
        ['to', 'javascript%3Aalert(1)'],
        [':to', '"javascript:alert(1)"'],
        ['imageUrl', 'javascript:alert(1)'],
        ['cta-link', 'vbscript:msgbox(1)'],
        ['avatar_src', 'data:text/html,<script>alert(1)</script>'],
        ['action', 'javascript:alert(1)'],
        ['poster', 'javascript:alert(1)'],
      ]
      for (const [attribute, value] of payloads) {
        expect(validateProp(attribute, value), `${attribute}="${value}"`).toBe(REJECTED_PROP)
      }
    })

    it('keeps safe URLs in URL props', () => {
      for (const value of ['https://nuxt.com', 'mailto:hi@nuxt.com', '/docs', '#anchor', 'docs/page']) {
        expect(validateProp('to', value)).toBe(value)
      }
    })

    it('applies the image policy to *src props and the link policy to `to`', () => {
      expect(validateProp('avatarSrc', 'data:image/png;base64,abc', { allowDataImages: false })).toBe(REJECTED_PROP)
      expect(validateProp('avatarSrc', 'data:image/png;base64,abc')).toBe('data:image/png;base64,abc')
      expect(validateProp('to', 'http://example.com', { allowedProtocols: ['https'] })).toBe(REJECTED_PROP)
    })

    it('does not treat prose in non-URL props as a URL', () => {
      expect(validateProp('title', 'JavaScript: the good parts')).toBe('JavaScript: the good parts')
      expect(validateProp('label', 'javascript:alert(1)')).toBe('javascript:alert(1)')
      expect(validateProp('tooltip', 'data:text/html is blocked')).toBe('data:text/html is blocked')
    })

    it('keeps route objects in `to`', () => {
      expect(validateProp(':to', { path: '/docs', query: { q: 'x' } })).toEqual({ path: '/docs', query: { q: 'x' } })
    })
  })

  describe('SVG animation', () => {
    it('blocks attributeName targeting href in any form', () => {
      expect(validateProp('attributeName', 'href')).toBe(REJECTED_PROP)
      expect(validateProp('attributename', 'xlink:href')).toBe(REJECTED_PROP)
      expect(validateProp('attributeName', 'HREF')).toBe(REJECTED_PROP)
      expect(validateProp('attributeName', 'hr&#101;f')).toBe(REJECTED_PROP)
      expect(validateProp(':attributeName', '"href"')).toBe(REJECTED_PROP)
    })

    it('keeps animations of other attributes', () => {
      expect(validateProp('attributeName', 'opacity')).toBe('opacity')
      expect(validateProp('values', '0;1')).toBe('0;1')
    })
  })

  describe('markup props', () => {
    it('blocks *Html / *-html props', () => {
      for (const attribute of ['labelHtml', 'label-html', 'descriptionHtml', 'suffix_html', ':labelHtml', 'v-html']) {
        expect(validateProp(attribute, '<img src=x onerror=alert(1)>'), attribute).toBe(REJECTED_PROP)
      }
    })

    it('keeps props that only contain "html" mid-name', () => {
      expect(validateProp('htmlFor', 'email')).toBe('email')
    })
  })

  describe('Vue `.prop` and `^attr` prefixes', () => {
    it('validates the prop name behind the prefix', () => {
      const payloads: Array<[string, string]> = [
        ['.innerHTML', '<img src=x onerror=alert(1)>'],
        ['^innerHTML', '<img src=x onerror=alert(1)>'],
        ['.textContent', 'overlay'],
        ['^onclick', 'alert(1)'],
        ['.onclick', 'alert(1)'],
        [':.innerHTML', '"<img src=x onerror=alert(1)>"'],
        ['^href', 'javascript:alert(1)'],
        ['.srcdoc', '<script>alert(1)</script>'],
      ]
      for (const [attribute, value] of payloads) {
        expect(validateProp(attribute, value), attribute).toBe(REJECTED_PROP)
      }
    })

    it('keeps safe prefixed props', () => {
      expect(validateProp('.title', 'hello')).toBe('hello')
      expect(validateProp('^href', 'https://example.com')).toBe('https://example.com')
    })
  })

  describe('nested values', () => {
    it('removes unsafe keys and URLs at any depth', () => {
      const value = [
        {
          label: 'Docs',
          to: 'javascript:alert(1)',
          onClick: 'alert(2)',
          labelHtml: '<img src=x onerror=alert(3)>',
          '.innerHTML': '<b>x</b>',
          children: [{ label: 'Deep', href: 'javascript:alert(4)', avatar: { src: 'javascript:alert(5)', alt: 'a' } }],
        },
        { label: 'Safe', to: '/docs' },
      ]
      expect(validateProp(':links', value)).toEqual([
        { label: 'Docs', children: [{ label: 'Deep', avatar: { alt: 'a' } }] },
        { label: 'Safe', to: '/docs' },
      ])
    })

    it('validates array items against the prop name', () => {
      expect(validateProp(':hrefs', ['javascript:alert(1)', '/ok', ['javascript:alert(2)']])).toEqual(['/ok', []])
      expect(validateProp(':items', ['JavaScript: the good parts'])).toEqual(['JavaScript: the good parts'])
    })

    it('sanitizes JSON-encoded binding strings and re-encodes them', () => {
      const result = validateProp(':links', '[{"to":"javascript:alert(1)","label":"x"},{"to":"/ok"}]')
      expect(JSON.parse(result as string)).toEqual([{ label: 'x' }, { to: '/ok' }])
    })

    it('passes nested options through', () => {
      expect(validateProp(':item', { to: 'http://example.com', label: 'x' }, { allowedProtocols: ['https'] })).toEqual({
        label: 'x',
      })
    })

    it('keeps a JSON `__proto__` key as data instead of a prototype', () => {
      const result = validateProp(':item', JSON.parse('{"__proto__":{"polluted":true},"label":"x"}')) as object
      expect(Object.getPrototypeOf(result)).toBe(Object.prototype)
      expect((result as Record<string, unknown>).polluted).toBeUndefined()
    })
  })

  describe('Vue directive form', () => {
    it('blocks Vue directive-form event handlers and unsafe URLs', () => {
      const payloads: Array<[string, string]> = [
        [':onerror', 'alert(1)'],
        [':onload', 'alert(1)'],
        ['v-bind:onerror', 'alert(1)'],
        ['@click', 'alert(1)'],
        ['v-on:click', 'alert(1)'],
        [':href', 'javascript:alert(1)'],
        ['v-bind:href', 'javascript:alert(1)'],
        [':src', 'javascript:alert(1)'],
        ['v-bind:src', 'data:text/html,<script>alert(1)</script>'],
      ]

      for (const [attribute, value] of payloads) {
        expect(validateProp(attribute, value), `${attribute}="${value}"`).toBe(REJECTED_PROP)
      }
    })

    it('allows safe Vue directive-form href and src values', () => {
      expect(validateProp(':href', 'https://example.com')).toBe('https://example.com')
      expect(validateProp('v-bind:href', '/relative/path')).toBe('/relative/path')
      expect(validateProp(':src', 'https://example.com/image.png')).toBe('https://example.com/image.png')
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

  it('keeps a prop whose value is the boolean `false` (#367)', () => {
    const result = validateProps('div', { pagination: false, count: 3 })
    expect(result).toEqual({ pagination: false, count: 3 })
  })

  it('keeps multiple boolean props alongside other types (#367)', () => {
    const result = validateProps('comp', { enabled: false, active: true, label: 'hi' })
    expect(result).toEqual({ enabled: false, active: true, label: 'hi' })
  })

  it('does not warn when keeping a boolean `false` prop', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    validateProps('div', { pagination: false })
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('keeps parser metadata under `$` untouched', () => {
    const result = validateProps('svg', { $: { html: 1, block: 0 }, onclick: 'x' })
    expect(result).toEqual({ $: { html: 1, block: 0 } })
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
