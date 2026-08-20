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
      expect(validateProp('href', '\\\\evil.com/p', { allowedLinkPrefixes: ['https://myapp.com'] })).toBe(
        REJECTED_PROP
      )
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
      expect(validateProp('src', '//tracker.evil.com/px.gif', { allowedImagePrefixes: ['https://cdn.myapp.com'] })).toBe(
        REJECTED_PROP
      )
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
