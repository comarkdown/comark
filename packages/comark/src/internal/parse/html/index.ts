import { Parser } from 'htmlparser2'
import type { Node } from 'comark'

export const VOID_ELEMENTS = new Set([
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

function attribsToComarkAttrs(attribs: Record<string, string>, block: 0 | 1): Record<string, unknown> {
  const attrs: Record<string, unknown> = {
    $: {
      html: 1,
      block,
    },
  }
  for (const key in attribs) {
    const value = attribs[key]
    if (value === '') {
      attrs[`:${key}`] = 'true'
    } else {
      attrs[key] = value
    }
  }
  return attrs
}

/**
 * `$.block` rules for HTML-origin nodes:
 * - no parent (document root of this HTML fragment) → block: 1
 * - tag span contains a newline → block: 1
 * - otherwise (nested, single-line) → block: 0
 */
function resolveHtmlBlock(isRoot: boolean, source: string, startIndex: number, endIndex: number): 0 | 1 {
  if (isRoot) return 1
  if (source.slice(startIndex, endIndex + 1).includes('\n')) return 1
  return 0
}

interface HtmlTagInfo {
  tag: string
  attrs: Record<string, unknown>
  isVoid: boolean
  isClose: boolean
}

/**
 * Parse a single inline HTML tag fragment (opening, closing, or void).
 * Returns null if the content is not a recognisable HTML tag.
 *
 * Inline tokens are always single-line tag fragments → block: 0.
 */
export function parseInlineHtmlTag(html: string): HtmlTagInfo | null {
  const trimmed = html.trim()
  if (!trimmed.startsWith('<')) return null

  // Fast path: closing tag
  const closeMatch = trimmed.match(/^<\/([a-z][a-z0-9]*)\s*>/i)
  if (closeMatch) {
    return { tag: closeMatch[1].toLowerCase(), attrs: {}, isVoid: false, isClose: true }
  }

  let info: HtmlTagInfo | null = null
  const parser = new Parser(
    {
      onopentag(name, attribs) {
        info = {
          tag: name,
          attrs: attribsToComarkAttrs(attribs, 0),
          isVoid: VOID_ELEMENTS.has(name),
          isClose: false,
        }
      },
    },
    { decodeEntities: false }
  )

  parser.write(trimmed)
  parser.end()
  return info
}

interface HtmlStackFrame {
  tag: string
  attrs: Record<string, unknown>
  children: Node[]
  startIndex: number
  isRoot: boolean
}

/**
 * Parse a full HTML string into Nodes using htmlparser2.
 * Handles nested elements, text, void elements, and comments.
 */
export function htmlToNodes(html: string): Node[] {
  const source = html.trim()
  const root: Node[] = []
  const stack: HtmlStackFrame[] = []

  const parser = new Parser(
    {
      onopentag(name, attribs) {
        const startIndex = parser.startIndex
        const isRoot = stack.length === 0

        if (VOID_ELEMENTS.has(name)) {
          const block = resolveHtmlBlock(isRoot, source, startIndex, parser.endIndex)
          const node = [name, attribsToComarkAttrs(attribs, block)] as Node
          if (stack.length > 0) {
            stack[stack.length - 1].children.push(node)
          } else {
            root.push(node)
          }
          return
        }

        // Provisional attrs; $.block is finalized on matching close (need full span).
        stack.push({
          tag: name,
          attrs: attribsToComarkAttrs(attribs, isRoot ? 1 : 0),
          children: [],
          startIndex,
          isRoot,
        })
      },

      ontext(text) {
        const trimmed = text.trim()
        if (!trimmed) return
        if (stack.length > 0) {
          stack[stack.length - 1].children.push(trimmed)
        } else {
          root.push(trimmed)
        }
      },

      onclosetag(name) {
        if (VOID_ELEMENTS.has(name)) {
          return
        }
        // Find matching frame (handles mismatched tags gracefully)
        let idx = stack.length - 1
        while (idx >= 0 && stack[idx].tag !== name) {
          idx--
        }
        if (idx >= 0) {
          while (stack.length > idx) {
            const frame = stack.pop()!
            const block = resolveHtmlBlock(frame.isRoot, source, frame.startIndex, parser.endIndex)
            ;(frame.attrs.$ as { html: 1; block: 0 | 1 }).block = block
            const node =
              frame.children.length > 0
                ? ([frame.tag, frame.attrs, ...frame.children] as Node)
                : ([frame.tag, frame.attrs] as Node)
            if (stack.length > 0) {
              stack[stack.length - 1].children.push(node)
            } else {
              root.push(node)
            }
          }
        }
      },

      oncomment(data) {
        const node = [null, {}, data] as unknown as Node
        if (stack.length > 0) {
          stack[stack.length - 1].children.push(node)
        } else {
          root.push(node)
        }
      },
    },
    { decodeEntities: true }
  )

  parser.write(source)
  parser.end()

  // Incomplete open tags left on the stack (no closer) — still emit as nodes.
  while (stack.length > 0) {
    const frame = stack.pop()!
    const block = resolveHtmlBlock(frame.isRoot, source, frame.startIndex, source.length - 1)
    ;(frame.attrs.$ as { html: 1; block: 0 | 1 }).block = block
    const node =
      frame.children.length > 0
        ? ([frame.tag, frame.attrs, ...frame.children] as Node)
        : ([frame.tag, frame.attrs] as Node)
    if (stack.length > 0) {
      stack[stack.length - 1].children.push(node)
    } else {
      root.push(node)
    }
  }

  return root
}
