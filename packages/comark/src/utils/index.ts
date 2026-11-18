// #region Tree Utils

import type { Node, MarkdownDocument } from 'comark'

type VisitResult = Node | false | undefined | void

/**
 * Check whether a value is a {@link MarkdownDocument} (or a bare `{ nodes }` document-like).
 */
export function isMarkdownDocument(value: unknown): value is MarkdownDocument {
  return !!value && typeof value === 'object' && Array.isArray((value as MarkdownDocument).nodes)
}

export interface TextContentOptions {
  /**
   * Called on every text node before it is appended, e.g. `decodeHTML` from `entities`.
   * Parsed documents already have decoded text, so only pass this for trees whose text
   * may still contain character references (hand-built or from another source).
   */
  decodeHTML?: (text: string) => string
}

/** Return the concatenated text content of a Markdown AST node. */
export function textContent(node: Node, options?: TextContentOptions): string {
  return collectText(node, options?.decodeHTML)
}

function collectText(node: Node, decode: ((text: string) => string) | undefined): string {
  if (typeof node === 'string') {
    return decode ? decode(node) : node
  }
  let out = ''
  const len = node.length
  for (let i = 2; i < len; i++) {
    out += collectText(node[i] as Node, decode)
  }
  return out
}

/**
 * Walk at most this many element levels. Typical markdown trees are much shallower.
 * Nodes nested deeper are removed from the tree by {@link visit} / {@link visitAsync},
 * so plugins built on them (e.g. `security`) never leave an unvisited subtree behind.
 */
export const TREE_WALK_MAX_DEPTH = 50

function* walkGenerator(
  document: MarkdownDocument,
  checker: (node: Node) => boolean
): Generator<Node, void, VisitResult> {
  function* walk(
    node: Node,
    parent: Node | Node[],
    index: number,
    depth: number
  ): Generator<Node, boolean, VisitResult> {
    if (depth >= TREE_WALK_MAX_DEPTH) {
      ;(parent as Node[]).splice(index, 1)
      return true
    }

    let currentNode = node

    if (checker(node)) {
      const res = yield node

      if (res === false) {
        ;(parent as Node[]).splice(index, 1)
        return true
      }

      if (res !== undefined) {
        ;(parent as Node[])[index] = res as Node
        currentNode = res as Node
      }
    }

    if (Array.isArray(currentNode) && currentNode.length > 2) {
      let i = 2
      while (i < currentNode.length) {
        const childRemoved = yield* walk(currentNode[i] as Node, currentNode, i, depth + 1)
        if (childRemoved) {
          continue
        }
        i += 1
      }
    }

    return false
  }

  let i = 0
  while (i < document.nodes.length) {
    const removed = yield* walk(document.nodes[i], document.nodes, i, 0)
    if (removed) {
      continue
    }
    i += 1
  }
}

/**
 * Visit a Markdown document and apply a visitor function to matching nodes.
 * Return `false` from `visitor` to remove the node, or a replacement `Node`.
 * Recursion is capped at {@link TREE_WALK_MAX_DEPTH} element levels; deeper subtrees are dropped.
 */
export function visit(
  document: MarkdownDocument,
  checker: (node: Node) => boolean,
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  visitor: (node: Node) => VisitResult
) {
  const iterator = walkGenerator(document, checker)
  let step = iterator.next()

  while (!step.done) {
    const res = visitor(step.value)
    step = iterator.next(res)
  }
}

/** Recursion is capped at {@link TREE_WALK_MAX_DEPTH} element levels; deeper subtrees are dropped. */
export async function visitAsync(
  document: MarkdownDocument,
  checker: (node: Node) => boolean,
  visitor: (node: Node) => Promise<VisitResult> | VisitResult
): Promise<void> {
  const iterator = walkGenerator(document, checker)
  let step = iterator.next()

  while (!step.done) {
    const res = await visitor(step.value)
    step = iterator.next(res)
  }
}

const CODE_BLOCK_PROPS = new Set(['language', 'filename', 'highlights', 'meta'])

/**
 * Maps code block props on a native `<pre>` to `data-*` attributes.
 *
 * Raw HTML (`node[1].$.html`) is left unchanged so authored attributes round-trip.
 * The attribute bag does not include `$` (stripped by `resolveAttributes`), so the source
 * node is required.
 */
export function toNativeAttributes<T extends Record<string, any>>(tag: string, node: Node, attributes: T): T {
  if (tag !== 'pre' || !Array.isArray(node) || node[1]?.$?.html === 1) return attributes
  let changed = false
  const result: Record<string, any> = {}
  for (const key in attributes) {
    if (CODE_BLOCK_PROPS.has(key)) {
      changed = true
      const value = attributes[key]
      result[`data-${key}`] = value !== null && typeof value === 'object' ? JSON.stringify(value) : value
    } else {
      result[key] = attributes[key]
    }
  }
  return changed ? (result as T) : attributes
}

// #region String Utils

/**
 * HTML void elements. They never have children or a closing tag.
 * @see https://html.spec.whatwg.org/multipage/syntax.html#void-elements
 */
export const HTML_VOID_ELEMENTS: ReadonlySet<string> = new Set([
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

/** Whether `tag` is an HTML void element. Comparison is case-insensitive. */
export function isHtmlVoidElement(tag: string): boolean {
  return HTML_VOID_ELEMENTS.has(tag.toLowerCase())
}

const HTML_ESCAPE_RE = /[&<>"]/g
const HTML_ESCAPED_RE = /^&[a-zA-Z][a-zA-Z0-9]*;|#[0-9]+;|#x[0-9a-fA-F]+;/
export function escapeHtml(value: string, replace?: Record<string, string | undefined>): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
  }
  if (replace) {
    Object.assign(escapeMap, replace)
  }
  return value.replace(HTML_ESCAPE_RE, (char, index) => {
    switch (char) {
      case '&': {
        if (escapeMap[char] === '&' || value.slice(index).match(HTML_ESCAPED_RE)) {
          return char
        }
        return escapeMap[char] ?? char
      }
      default:
        return escapeMap[char] ?? char
    }
  })
}

export function indent(
  text: string,
  { ignoreFirstLine = false, level = 1, width }: { ignoreFirstLine?: boolean; level?: number; width?: number } = {}
) {
  const pad = width ? ' '.repeat(width) : '  '.repeat(level)
  return text
    .split('\n')
    .map((line, index) => {
      if (ignoreFirstLine && index === 0) {
        return line
      }
      return line ? pad + line : line
    })
    .join('\n')
}

/** Convert a string to PascalCase. */
export function pascalCase(str: string) {
  return str
    ? splitByCase(str)
        .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : ''))
        .join('')
    : ''
}

/** Convert a string to kebab-case. */
export function kebabCase(str: string) {
  return str
    ? splitByCase(str)
        .map((p) => p.toLowerCase())
        .join('-')
    : ''
}

/** Convert a string to camelCase. */
export function camelCase(str: string) {
  if (!str) {
    return ''
  }
  str = pascalCase(str)
  return str.charAt(0).toLowerCase() + str.slice(1)
}

function splitByCase(str: string) {
  const parts: string[] = []
  if (!str) {
    return parts
  }
  let buff = ''
  let previousUpper: boolean | undefined
  let previousSplitter: boolean | undefined
  for (let i = 0; i < str.length; i++) {
    const char = str[i]
    const isSplitter = char === '-' || char === '_' || char === '/' || char === '.'
    if (isSplitter === true) {
      parts.push(buff)
      buff = ''
      previousUpper = void 0
      continue
    }
    const charCode = char.charCodeAt(0)
    const isNumber = charCode >= 48 && charCode <= 57 // '0' to '9'
    const isUpper = isNumber ? void 0 : charCode >= 65 && charCode <= 90 // 'A' to 'Z'
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff)
        buff = char
        previousUpper = isUpper
        continue
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff[buff.length - 1]
        parts.push(buff.slice(0, buff.length - 1))
        buff = lastChar + char
        previousUpper = isUpper
        continue
      }
    }
    buff += char
    previousUpper = isUpper
    previousSplitter = isSplitter
  }
  parts.push(buff)
  return parts
}

// #endregion

// #region Object Utils
/** Read a value from a nested object by dot-separated key path. */
export function get(data: unknown, key: string): unknown {
  const keys = key.split('.')
  let value: unknown = data
  for (const k of keys) {
    if (value && typeof value === 'object' && k in (value as Record<string, unknown>)) {
      value = (value as Record<string, unknown>)[k]
    } else {
      return undefined
    }
  }
  return value
}
// #endregion

// Re-export the shared attribute resolvers so framework renderers can apply the
// same `:prefix` semantics as the HTML/ANSI handlers without duplicating logic.
export { resolveAttributes, resolveAttribute } from '../internal/stringify/html-attributes.ts'
export type { ResolveAttributesOptions } from '../internal/stringify/html-attributes.ts'
export { applyNodeTransforms, mergeNodeTransforms } from '../internal/stringify/transform-node.ts'

// The security plugin's frontmatter rules, for objects the parser never sees.
export { sanitizeData } from '../internal/sanitize.ts'
export type { SanitizeDataOptions } from '../internal/sanitize.ts'
