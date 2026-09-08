import type { Node, ElementNode, ElementNodeAttributes, MarkdownDocument } from 'comark'
import { decodeHTML } from 'comark/utils'

/** HTML void elements — never have children / closing tags. */
const HTML_VOID_ELEMENTS = new Set([
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
 * Applies automatic unwrapping to container components.
 *
 * This utility removes unnecessary paragraph wrappers from container component children.
 * If a container has only a single paragraph child (and no other block elements),
 * the paragraph is unwrapped and its children are hoisted up to be direct children
 * of the container.
 *
 * @param node - The Comark element to process
 * @returns The node with auto-unwrapped children (if applicable)
 *
 * @example
 * // Before:
 * { tag: 'alert', children: [{ type: 'element', tag: 'p', children: [{ type: 'text', value: 'Text' }] }] }
 *
 * // After:
 * { tag: 'alert', children: [{ type: 'text', value: 'Text' }] }
 */
export function applyAutoUnwrap(node: Node): Node {
  if (typeof node === 'string' || node.length < 2) {
    return node
  }

  const [tag, props, ...children] = node

  // Filter out empty text nodes for checking
  const nonEmptyChildren = children.filter((child: Node) => typeof child !== 'string' || (child && child.trim()))

  if (nonEmptyChildren.length === 0) {
    return node
  }

  // Check if we have exactly one paragraph child (and possibly empty text nodes)
  if (nonEmptyChildren.length > 1 || typeof nonEmptyChildren[0] === 'string' || nonEmptyChildren[0][0] !== 'p') {
    return [tag, props, ...children.map((child: Node) => applyAutoUnwrap(child as Node))] as Node
  }

  // Lift the paragraph's attrs onto the parent so trailing `{attr}` survives the unwrap.
  // Parent attrs take precedence so explicit component props aren't overridden.
  const paragraphAttrs = nonEmptyChildren[0][1] as Record<string, unknown>
  const mergedProps = paragraphAttrs && Object.keys(paragraphAttrs).length > 0 ? { ...paragraphAttrs, ...props } : props

  return [tag, mergedProps, ...(nonEmptyChildren[0].slice(2) as Node[])] as Node
}

/**
 * Extracts reusable nodes from the last output tree
 * @param markdown - The markdown to parse
 * @param lastOutput - The last output tree
 * @returns The reusable nodes and the remaining markdown
 */
export function extractReusableNodes(markdown: string, lastOutput: MarkdownDocument) {
  let lastValidNodeIndex = -1
  let i = lastOutput.nodes.length - 1
  let lastNodeIgnored = false
  while (i >= 0) {
    const node = lastOutput.nodes[i] as ElementNode
    if (node[1] && node[1].$?.line) {
      if (lastNodeIgnored) {
        lastValidNodeIndex = i
        break
      } else {
        lastNodeIgnored = true
      }
    }
    i--
  }
  const lastNode = lastValidNodeIndex !== -1 ? lastOutput.nodes[lastValidNodeIndex] : null
  if (lastNode) {
    const remainingMarkdownStartLine = (lastNode[1] as ElementNodeAttributes).$?.line ?? 0
    return {
      remainingMarkdownStartLine,
      reusedNodes: lastOutput.nodes.slice(0, lastValidNodeIndex + 1),
      remainingMarkdown: markdown.split('\n').slice(remainingMarkdownStartLine).join('\n') || '',
    }
  }

  return {
    remainingMarkdownStartLine: 0,
    remainingMarkdown: markdown,
    reusedNodes: [],
  }
}

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
