import { Parser } from 'htmlparser2'
import type { ElementNode, Node } from 'comark'

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

function attribsToComarkAttrs(attribs: Record<string, string>, isInline: boolean = false): Record<string, unknown> {
  const attrs: Record<string, unknown> = {
    $: {
      html: 1,
      block: isInline ? 0 : 1,
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

interface HtmlTagInfo {
  tag: string
  attrs: Record<string, unknown>
  isVoid: boolean
  isClose: boolean
}

/**
 * Parse a single inline HTML tag fragment (opening, closing, or void).
 * Returns null if the content is not a recognisable HTML tag.
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
          attrs: attribsToComarkAttrs(attribs, true),
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

/**
 * Whether a node is a block-level HTML element (`$.block === 1`).
 * Text and comments are not block elements.
 */
function isBlockHtmlElement(node: Node): boolean {
  if (typeof node === 'string' || !Array.isArray(node) || node[0] === null) return false
  const meta = (node[1] as Record<string, unknown> | undefined)?.$ as Record<string, unknown> | undefined
  return meta?.html === 1 && meta?.block === 1
}

/**
 * Infer `$.block` from structure (no tag-name allowlists):
 *
 * - Root of an `html_block` fragment stays `block: 1` (it was a block unit).
 * - Nested element is `block: 0` when every child is text / comment / inline HTML
 *   (no nested `block: 1` descendants that make it a block container).
 * - Nested element is `block: 1` when it contains at least one block child.
 *
 * Walks bottom-up so children's flags are settled before the parent is classified.
 */
function inferBlockFromChildren(nodes: Node[], isRootLevel: boolean): void {
  for (const node of nodes) {
    if (typeof node === 'string' || !Array.isArray(node) || node[0] === null) continue

    const element = node as ElementNode
    const children = element.slice(2) as Node[]
    inferBlockFromChildren(children, false)

    const attrs = element[1] as Record<string, unknown>
    const meta = (attrs.$ ||= {}) as Record<string, unknown>
    if (meta.html !== 1) continue

    if (isRootLevel) {
      // Top-level of an html_block token is always a block unit.
      meta.block = 1
      continue
    }

    const hasBlockChild = children.some(isBlockHtmlElement)
    meta.block = hasBlockChild ? 1 : 0
  }
}

/**
 * Parse a full HTML string into Nodes using htmlparser2.
 * Handles nested elements, text, void elements, and comments.
 * `$.block` is inferred from children after the tree is built.
 */
export function htmlToNodes(html: string): Node[] {
  const root: Node[] = []
  const stack: { tag: string; attrs: Record<string, unknown>; children: Node[] }[] = []

  const parser = new Parser(
    {
      onopentag(name, attribs) {
        // Provisional block:1; refined by inferBlockFromChildren after close.
        const attrs = attribsToComarkAttrs(attribs, false)
        if (VOID_ELEMENTS.has(name)) {
          const node = [name, attrs] as Node
          if (stack.length > 0) {
            stack[stack.length - 1].children.push(node)
          } else {
            root.push(node)
          }
          return
        }
        stack.push({ tag: name, attrs, children: [] })
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

  parser.write(html.trim())
  parser.end()

  inferBlockFromChildren(root, true)
  return root
}
