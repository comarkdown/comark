import { decodeHTML } from 'comark/utils'
/** HTML void elements — never have children / closing tags. */
export const HTML_VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

export type ParsedHtmlTag =
  | { kind: 'open'; tag: string; attrs: Record<string, unknown>; selfClosing: boolean }
  | { kind: 'close'; tag: string }
  | { kind: 'comment'; content: string }
  | { kind: 'other'; content: string }

/**
 * Parse a single html_inline token content into a structured tag description.
 * Handles open tags (with attrs), close tags, self-closing syntax, and comments.
 */
export function parseHtmlInline(content: string): ParsedHtmlTag {
  const trimmed = content.trim()

  if (trimmed.startsWith('<!--') && trimmed.endsWith('-->')) {
    return { kind: 'comment', content: trimmed.slice(4, -3) }
  }

  const closeMatch = trimmed.match(/^<\/\s*([A-Za-z][\w:-]*)\s*>$/)
  if (closeMatch) {
    return { kind: 'close', tag: closeMatch[1] }
  }

  const openMatch = trimmed.match(/^<\s*([A-Za-z][\w:-]*)((?:\s+[\s\S]*?)?)\s*(\/?)>$/)
  if (openMatch) {
    const tag = openMatch[1]
    const attrsStr = openMatch[2] || ''
    const slash = openMatch[3] === '/'
    const selfClosing = slash || HTML_VOID_ELEMENTS.has(tag.toLowerCase())
    return {
      kind: 'open',
      tag,
      attrs: parseHtmlAttributes(attrsStr),
      selfClosing,
    }
  }

  return { kind: 'other', content: trimmed }
}

/**
 * Parse HTML attribute string into a key/value map.
 * Supports `key="value"`, `key='value'`, bare `key=value`, and boolean attributes.
 */
export function parseHtmlAttributes(attrsStr: string): Record<string, unknown> {
  const attrs: Record<string, unknown> = {}
  if (!attrsStr || !attrsStr.trim()) return attrs

  attrsStr = decodeHTML(attrsStr)

  const re = /([:\w.-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
  let match: RegExpExecArray | null
  while ((match = re.exec(attrsStr)) !== null) {
    const key = match[1]
    const value = match[2] ?? match[3] ?? match[4]
    attrs[key] = value === undefined ? true : value
  }

  return attrs
}
