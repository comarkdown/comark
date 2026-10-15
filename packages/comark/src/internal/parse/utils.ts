import type { Node, ElementNode, ElementNodeAttributes, MarkdownDocument } from 'comark'
import { decodeHTML, isHtmlVoidElement, TREE_WALK_MAX_DEPTH } from 'comark/utils'

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
 * Recursion is capped at {@link TREE_WALK_MAX_DEPTH} element levels; deeper subtrees are left as-is.
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
function isBlankText(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i)
    if (c !== 32 && c !== 10 && c !== 9 && c !== 13 && c !== 12) return false
  }
  return true
}

export function applyAutoUnwrap(node: Node): Node {
  return applyAutoUnwrapAt(node, 0)
}

function applyAutoUnwrapAt(node: Node, depth: number): Node {
  if (depth >= TREE_WALK_MAX_DEPTH || typeof node === 'string' || node[0] === 'p' || node[0] == null) {
    return node
  }

  const length = node.length
  if (length < 3) {
    return node
  }

  let significant: Node | undefined
  let significantCount = 0
  for (let i = 2; i < length; i++) {
    const child = node[i] as Node
    if (typeof child === 'string' && isBlankText(child)) continue
    significant = child
    if (++significantCount > 1) break
  }

  if (significantCount === 0) {
    return node
  }

  if (significantCount === 1 && Array.isArray(significant) && significant[0] === 'p') {
    // Lift the paragraph's attrs onto the parent so trailing `{attr}` survives the unwrap.
    // Parent attrs take precedence so explicit component props aren't overridden.
    const paragraphAttrs = significant[1] as Record<string, unknown> | undefined
    let mergedProps = node[1]
    if (paragraphAttrs) {
      for (const key in paragraphAttrs) {
        if (key !== undefined) {
          mergedProps = { ...paragraphAttrs, ...node[1] }
          break
        }
      }
    }
    const unwrapped = significant.slice() as unknown as ElementNode
    unwrapped[0] = node[0] as string
    unwrapped[1] = mergedProps
    return unwrapped
  }

  let copy: Node[] | undefined
  for (let i = 2; i < length; i++) {
    const child = node[i] as Node
    const next = applyAutoUnwrapAt(child, depth + 1)
    if (copy !== undefined) {
      copy.push(next)
    } else if (next !== child) {
      copy = node.slice(0, i) as unknown as Node[]
      copy.push(next)
    }
  }
  return copy !== undefined ? (copy as Node) : node
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
 * Lowercase an all-uppercase tag name (`DIV` → `div`, `H1` → `h1`). HTML tag names are
 * case-insensitive, and renderers / plugins match the lowercase form. A name with any
 * lowercase letter keeps its authored case (`Hello`, `linearGradient`, `my-el`) so
 * component lookup still works.
 */
function normalizeTagName(tag: string): string {
  for (let i = 0; i < tag.length; i++) {
    const c = tag.charCodeAt(i)
    if (c >= 0x61 /* a */ && c <= 0x7a /* z */) return tag
  }
  return tag.toLowerCase()
}

/**
 * Elements that start HTML foreign content (SVG, MathML). Inside them,
 * attribute names are case-sensitive and keep the author's case (#467).
 */
const FOREIGN_CONTENT_TAGS = new Set(['svg', 'math'])

/** Whether `tag` starts a foreign-content (case-sensitive) subtree. */
export function isForeignContentTag(tag: string): boolean {
  return FOREIGN_CONTENT_TAGS.has(tag.toLowerCase())
}

/**
 * SVG tag-name adjustments from the HTML standard ("adjust SVG tag names").
 * Inside foreign content, names are lowercased and then mapped through this
 * table, so `<LINEARGRADIENT>` becomes `linearGradient`.
 */
const SVG_TAG_NAMES: Record<string, string> = {}
for (const name of [
  'altGlyph',
  'altGlyphDef',
  'altGlyphItem',
  'animateColor',
  'animateMotion',
  'animateTransform',
  'clipPath',
  'feBlend',
  'feColorMatrix',
  'feComponentTransfer',
  'feComposite',
  'feConvolveMatrix',
  'feDiffuseLighting',
  'feDisplacementMap',
  'feDistantLight',
  'feDropShadow',
  'feFlood',
  'feFuncA',
  'feFuncB',
  'feFuncG',
  'feFuncR',
  'feGaussianBlur',
  'feImage',
  'feMerge',
  'feMergeNode',
  'feMorphology',
  'feOffset',
  'fePointLight',
  'feSpecularLighting',
  'feSpotLight',
  'feTile',
  'feTurbulence',
  'foreignObject',
  'glyphRef',
  'linearGradient',
  'radialGradient',
  'textPath',
]) {
  SVG_TAG_NAMES[name.toLowerCase()] = name
}

/** Attribute string that ends inside an unquoted value (`href=/x`). */
const UNQUOTED_VALUE_END = /=\s*[^\s"'=<>`]+$/

/**
 * Whether the children of a foreign-content element are parsed as HTML again
 * (an HTML integration point): SVG `foreignObject` / `desc` / `title`, and
 * MathML `annotation-xml` carrying HTML.
 */
export function isHtmlIntegrationPoint(tag: string, attrs: Record<string, unknown>): boolean {
  if (tag === 'foreignObject' || tag === 'desc' || tag === 'title') return true
  if (tag !== 'annotation-xml') return false
  const encoding = typeof attrs.encoding === 'string' ? attrs.encoding.toLowerCase() : ''
  return encoding === 'text/html' || encoding === 'application/xhtml+xml'
}

/** Element name inside SVG/MathML: lowercase, then the SVG case adjustment. */
function adjustForeignTagName(tag: string): string {
  const lower = tag.toLowerCase()
  return SVG_TAG_NAMES[lower] ?? lower
}

/**
 * Parse a single html_inline token content into a structured tag description.
 * Handles open tags (with attrs), close tags, self-closing syntax, and comments.
 *
 * @param content - Raw html_inline token content
 * @param inForeignContent - Whether the tag sits inside an SVG/MathML subtree.
 *   There (and on the `<svg>` / `<math>` opener itself), attribute names keep
 *   the author's case (#467)
 */
export function parseHtmlInline(content: string, inForeignContent: boolean = false): ParsedHtmlTag {
  const trimmed = content.trim()

  if (trimmed.startsWith('<!--') && trimmed.endsWith('-->')) {
    return { kind: 'comment', content: trimmed.slice(4, -3) }
  }

  const normalize = inForeignContent ? adjustForeignTagName : normalizeTagName

  const closeMatch = trimmed.match(/^<\/\s*([A-Za-z][\w:-]*)\s*>$/)
  if (closeMatch) {
    return { kind: 'close', tag: normalize(closeMatch[1]) }
  }

  const openMatch = trimmed.match(/^<\s*([A-Za-z][\w:-]*)((?:\s+[\s\S]*?)?)\s*(\/?)>$/)
  if (openMatch) {
    let tag = normalize(openMatch[1])
    // `<SVG>` / `<Math>` are still HTML-parsed start tags.
    if (!inForeignContent && isForeignContentTag(tag)) tag = tag.toLowerCase()
    let attrsStr = openMatch[2] || ''
    let slash = openMatch[3] === '/'
    // In `href=/x/>` the slash belongs to the unquoted value, as in the HTML
    // tokenizer: it only self-closes after whitespace, a quote or a bare name.
    if (slash && !/\s/.test(trimmed.charAt(trimmed.length - 3)) && UNQUOTED_VALUE_END.test(attrsStr)) {
      attrsStr += '/'
      slash = false
    }

    const selfClosing = slash || isHtmlVoidElement(tag)
    return {
      kind: 'open',
      tag,
      attrs: parseHtmlAttributes(attrsStr, inForeignContent || isForeignContentTag(tag)),
      selfClosing,
    }
  }

  return { kind: 'other', content: trimmed }
}

/**
 * Parse HTML attribute string into a key/value map.
 * Supports `key="value"`, `key='value'`, bare `key=value`, and boolean attributes.
 * Names are lowercased, as HTML attribute names are case-insensitive, unless
 * `preserveCase` is set (SVG/MathML foreign content, #467). Like the HTML
 * tokenizer, the first of case-variant duplicates (`href` / `HREF`) wins.
 */
export function parseHtmlAttributes(attrsStr: string, preserveCase: boolean = false): Record<string, unknown> {
  const attrs: Record<string, unknown> = {}
  if (!attrsStr || !attrsStr.trim()) return attrs

  const seen = new Set<string>()
  const re = /([:\w.-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
  let match: RegExpExecArray | null
  while ((match = re.exec(attrsStr)) !== null) {
    const lower = match[1].toLowerCase()
    if (seen.has(lower)) continue
    seen.add(lower)
    const key = preserveCase ? match[1] : lower
    const value = match[2] ?? match[3] ?? match[4]
    attrs[key] = value === undefined ? true : decodeHTML(value)
  }

  return attrs
}
