import { Parser } from 'htmlparser2'
import type { ComarkNode } from '../../../ast'

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
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
    }
    else {
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
  const parser = new Parser({
    onopentag(name, attribs) {
      info = {
        tag: name,
        attrs: attribsToComarkAttrs(attribs, true),
        isVoid: VOID_ELEMENTS.has(name),
        isClose: false,
      }
    },
  }, { decodeEntities: false })

  parser.write(trimmed)
  parser.end()
  return info
}

/**
 * Parse a full HTML string into ComarkNodes using htmlparser2.
 * Handles nested elements, text, void elements, and comments.
 */
export function htmlToComarkNodes(html: string): ComarkNode[] {
  const root: ComarkNode[] = []
  const stack: { tag: string, attrs: Record<string, unknown>, children: ComarkNode[] }[] = []

  const parser = new Parser({
    onopentag(name, attribs) {
      const attrs = attribsToComarkAttrs(attribs)
      if (VOID_ELEMENTS.has(name)) {
        const node = [name, attrs] as ComarkNode
        if (stack.length > 0) {
          stack[stack.length - 1].children.push(node)
        }
        else {
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
      }
      else {
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
          const node = frame.children.length > 0
            ? [frame.tag, frame.attrs, ...frame.children] as ComarkNode
            : [frame.tag, frame.attrs] as ComarkNode
          if (stack.length > 0) {
            stack[stack.length - 1].children.push(node)
          }
          else {
            root.push(node)
          }
        }
      }
    },

    oncomment(data) {
      const node = [null, {}, data] as unknown as ComarkNode
      if (stack.length > 0) {
        stack[stack.length - 1].children.push(node)
      }
      else {
        root.push(node)
      }
    },
  }, { decodeEntities: true })

  parser.write(html.trim())
  parser.end()

  return root
}
