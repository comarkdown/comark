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

/**
 * Elements that start HTML foreign content (SVG, MathML). Inside them, the
 * parser adjusts element names to their SVG/MathML case and attribute names
 * keep the author's case (#467). This is the foreign-content boundary from
 * the HTML standard, not an element map.
 */
const FOREIGN_CONTENT_TAGS = new Set(['svg', 'math'])

/** Whether `tag` starts a foreign-content (case-sensitive) subtree. */
export function isForeignContentTag(tag: string): boolean {
  return FOREIGN_CONTENT_TAGS.has(tag.toLowerCase())
}

/**
 * Convert parser attributes to Comark attributes.
 *
 * @param attribs - Attributes from the parser, with the author's name case
 * @param isInline - Whether the element comes from inline HTML
 * @param preserveCase - Keep the author's name case (foreign content)
 */
function attribsToComarkAttrs(
  attribs: Record<string, string>,
  isInline: boolean = false,
  preserveCase: boolean = false
): Record<string, unknown> {
  const attrs: Record<string, unknown> = {
    $: {
      html: 1,
      block: isInline ? 0 : 1,
    },
  }
  // The HTML tokenizer compares attribute names without case and keeps the
  // first one. The parser gives raw names, so `href` and `HREF` arrive as two
  // keys. Skip the later key to match browsers.
  const seen = new Set<string>()
  for (const key in attribs) {
    const lower = key.toLowerCase()
    if (seen.has(lower)) continue
    seen.add(lower)
    const value = attribs[key]
    const name = preserveCase ? key : lower
    if (value === '') {
      attrs[`:${name}`] = 'true'
    } else {
      attrs[name] = value
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
 *
 * The parser reads each fragment alone, so it cannot see an SVG/MathML
 * ancestor. `inForeignContent` gives that context:
 *
 * - The fragment is parsed inside a synthetic `<svg>` wrapper. The parser
 *   then adjusts the element name to its SVG/MathML case (LINEARGRADIENT
 *   becomes linearGradient) and makes unknown names lowercase. No element
 *   map is necessary.
 * - Attribute names keep the author's case, because they are case-sensitive
 *   in foreign content (#467).
 *
 * In foreign content, a fragment is void when the parser closes it while it
 * reads the fragment. This covers self-closed foreign elements (`<path/>`)
 * and a self-closed `<svg/>` or `<math/>`. Outside foreign content, only
 * `VOID_ELEMENTS` are void: HTML ignores `/>`, so `<div/>` stays open.
 */
export function parseInlineHtmlTag(html: string, inForeignContent: boolean = false): HtmlTagInfo | null {
  const trimmed = html.trim()
  if (!trimmed.startsWith('<')) return null

  // Fast path: closing tag. The name grammar is the same as the tokenizer's
  // close_tag rule, which permits hyphens (custom elements, annotation-xml).
  // The name is only for case-insensitive matching against the opener.
  const closeMatch = trimmed.match(/^<\/([a-z][a-z0-9-]*)\s*>/i)
  if (closeMatch) {
    return { tag: closeMatch[1].toLowerCase(), attrs: {}, isVoid: false, isClose: true }
  }

  let info: HtmlTagInfo | null = null
  let reading = true
  // With a wrapper, the first open tag is the wrapper itself.
  let wrapperOpenTags = inForeignContent ? 1 : 0

  const parser = new Parser(
    {
      onopentag(name, attribs) {
        if (wrapperOpenTags > 0) {
          wrapperOpenTags--
          return
        }
        if (info) return
        const lower = name.toLowerCase()
        info = {
          tag: name,
          attrs: attribsToComarkAttrs(attribs, true, inForeignContent || FOREIGN_CONTENT_TAGS.has(lower)),
          isVoid: VOID_ELEMENTS.has(lower),
          isClose: false,
        }
      },
      onclosetag(name) {
        // In foreign content, a close during write() means a self-closed
        // element. The parser closes elements that stay open later, in end().
        // HTML elements outside foreign content keep the VOID_ELEMENTS rule.
        const foreign = inForeignContent || (info !== null && FOREIGN_CONTENT_TAGS.has(info.tag.toLowerCase()))
        if (reading && info && foreign && name.toLowerCase() === info.tag.toLowerCase()) {
          info.isVoid = true
        }
      },
    },
    { decodeEntities: false, lowerCaseAttributeNames: false }
  )

  parser.write(inForeignContent ? `<svg>${trimmed}` : trimmed)
  reading = false
  parser.end()
  return info
}

/**
 * Parse a full HTML string into Nodes using htmlparser2.
 * Handles nested elements, text, void elements, and comments.
 *
 * The parser makes HTML element names lowercase and adjusts SVG/MathML
 * element names to their case. Attribute names arrive raw
 * (`lowerCaseAttributeNames: false`). This function makes them lowercase,
 * except inside foreign content, where names are case-sensitive (#467).
 */
export function htmlToNodes(html: string): Node[] {
  const root: Node[] = []
  const stack: { tag: string; attrs: Record<string, unknown>; children: Node[]; foreign: boolean }[] = []

  const parser = new Parser(
    {
      onopentag(name, attribs) {
        const parentForeign = stack.length > 0 && stack[stack.length - 1].foreign
        const foreign = parentForeign || FOREIGN_CONTENT_TAGS.has(name)
        const attrs = attribsToComarkAttrs(attribs, false, foreign)
        if (VOID_ELEMENTS.has(name)) {
          const node = [name, attrs] as Node
          if (stack.length > 0) {
            stack[stack.length - 1].children.push(node)
          } else {
            root.push(node)
          }
          return
        }
        stack.push({ tag: name, attrs, children: [], foreign })
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
    { decodeEntities: true, lowerCaseAttributeNames: false }
  )

  parser.write(html.trim())
  parser.end()

  return root
}
