import { describe, expect, it, vi } from 'vitest'
import { validateProp, validateProps } from '../src/internal/props-validation'

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
      expect(validateProp('href', 'mailto:hi@example.com', { allowedProtocols: ['https', 'mailto'] })).toBe(
        'mailto:hi@example.com'
      )
    })

    it('always blocks javascript: even if listed in allowedProtocols', () => {
      expect(validateProp('href', 'javascript:alert(1)', { allowedProtocols: ['javascript'] })).toBe(false)
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
      expect(validateProp('src', 'https://any.com/img.png', { allowedLinkPrefixes: ['https://myapp.com'] })).toBe(
        'https://any.com/img.png'
      )
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
      ).toBe(false)
    })

    it('relative src is always allowed regardless of prefix list', () => {
      expect(validateProp('src', '/img/logo.png', { allowedImagePrefixes: ['https://cdn.myapp.com'] })).toBe(
        '/img/logo.png'
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

  describe('xlink:href', () => {
    it('allows safe xlink:href values', () => {
      expect(validateProp('xlinkhref', 'https://example.com')).toBe('https://example.com')
      expect(validateProp('xLinkHref', 'https://example.com')).toBe('https://example.com')
      expect(validateProp('xlink:href', 'https://example.com')).toBe('https://example.com')
      expect(validateProp('xlinkhref', '/relative/path')).toBe('/relative/path')
    })

    it('blocks javascript: xlink:href', () => {
      expect(validateProp('xlink:href', 'javascript:alert(1)')).toBe(false)
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
        expect(validateProp(attribute, value), `${attribute}="${value}"`).toBe(false)
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
