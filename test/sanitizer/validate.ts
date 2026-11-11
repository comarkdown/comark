/**
 * Output validator adapted from vercel-labs/markdown-sanitizers
 * (`harden-react-markdown/src/bypass-attempts.test.tsx`, MIT), using parse5
 * instead of JSDOM.
 *
 * Upstream's sanitizers strip every attribute outside a short allow list, and
 * their validator checks for exactly that. Comark's `security` plugin is a
 * deny list (event handlers, markup sinks, unsafe URLs), so this validator
 * flags what a browser would actually run or fetch instead:
 * - elements outside the upstream allow list
 * - event handler attributes (`on*`)
 * - any attribute the browser loads or navigates to, whose URL leaves the
 *   trusted origins (`href`, `src`, `srcset`, `poster`, `action`, ...)
 * - `url(...)` in inline styles, which fetches like an `<img>`
 *
 * Two upstream checks are relaxed, as they flag URLs a browser treats as safe:
 * - an unparseable URL (`https://example.com:65536/`) is not flagged: the
 *   browser cannot fetch or navigate to it either
 * - prefix checks compare the parsed URL, so `https://PREFIX.COM/prefix/` and
 *   `https://user@prefix.com/prefix/` count as `https://prefix.com/prefix/`
 */
import { parseFragment } from 'parse5'
import type { DefaultTreeAdapterMap } from 'parse5'

type ChildNode = DefaultTreeAdapterMap['childNode']
type Element = DefaultTreeAdapterMap['element']

export const TRUSTED_ORIGINS = [
  'https://example.com',
  'https://trusted.org',
  'https://images.com',
  'https://prefix.com',
]

/** Same config as upstream's bypass suite. */
export const SECURITY_OPTIONS = {
  allowedLinkPrefixes: ['https://example.com', 'https://trusted.org'],
  allowedImagePrefixes: ['https://example.com', 'https://images.com', 'https://prefix.com/prefix/'],
  allowDataImages: false,
}

/** Upstream's allowed elements, plus `del` (GFM strikethrough, also allowed by markdown-to-markdown-sanitizer). */
// prettier-ignore
export const ALLOWED_ELEMENTS = [
  'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'img', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'hr',
  'table', 'tbody', 'thead', 'tfoot', 'tr', 'td', 'th', 'span', 'br', 'div', 'strong', 'em', 'b', 'i', 'u',
  's', 'sup', 'sub', 'small', 'big', 'del',
]

const ALLOWED_ELEMENT_SET = new Set(ALLOWED_ELEMENTS)

/** Attributes whose value the browser fetches or navigates to. */
const URL_ATTRIBUTES = new Set([
  'href',
  'src',
  'xlink:href',
  'action',
  'formaction',
  'poster',
  'background',
  'ping',
  'data',
  'longdesc',
  'cite',
])

export function isDangerousUrl(url: string): false | string {
  if (url === '/forbidden' || url === '#') return false

  let parsed: URL
  try {
    parsed = new URL(url, 'https://example.com')
  } catch {
    return false
  }

  // A blob URL can only point at an object its own origin created
  if (parsed.protocol === 'blob:') {
    try {
      parsed = new URL(parsed.pathname)
    } catch {
      return false
    }
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return 'bad protocol'
  if (!TRUSTED_ORIGINS.includes(parsed.origin)) return 'untrusted origin'
  if (parsed.origin === 'https://prefix.com' && !parsed.pathname.startsWith('/prefix/')) return 'prefix bypass'
  return false
}

function serialize(element: Element): string {
  const attrs = element.attrs.map((a) => ` ${a.name}="${a.value}"`).join('')
  return `<${element.tagName}${attrs}>`
}

/** URLs in a `srcset` value: comma-separated `url [descriptor]` candidates. */
function srcsetUrls(value: string): string[] {
  return value
    .split(',')
    .map((candidate) => candidate.trim().split(/\s+/)[0])
    .filter(Boolean)
}

/** URLs in CSS `url(...)` calls. */
function cssUrls(value: string): string[] {
  return [...value.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/gi)].map((match) => match[2])
}

export function validateHtml(html: string): string[] {
  const issues: string[] = []

  const checkUrl = (attribute: string, url: string, element: Element) => {
    if (!url) return
    const issue = isDangerousUrl(url)
    if (issue) issues.push(`Dangerous ${attribute}: ${url} (${issue}): ${serialize(element)}`)
  }

  const walk = (nodes: ChildNode[]) => {
    for (const node of nodes) {
      if (!('tagName' in node)) continue
      const element = node as Element

      if (!ALLOWED_ELEMENT_SET.has(element.tagName)) {
        issues.push(`Forbidden element: ${serialize(element)}`)
      }

      for (const attr of element.attrs) {
        const name = attr.name.toLowerCase()
        if (name.startsWith('on')) {
          issues.push(`Event handler: ${name}="${attr.value}": ${serialize(element)}`)
        } else if (URL_ATTRIBUTES.has(name)) {
          checkUrl(name, attr.value, element)
        } else if (name === 'srcset') {
          for (const url of srcsetUrls(attr.value)) checkUrl(name, url, element)
        } else if (name === 'style') {
          for (const url of cssUrls(attr.value)) checkUrl(name, url, element)
        }
      }

      walk(element.childNodes)
      // <template> content lives outside childNodes
      if ('content' in element && element.content) walk((element.content as any).childNodes)
    }
  }

  walk(parseFragment(html).childNodes)
  return issues
}
