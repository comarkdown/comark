import type { MDCRoot, MDCElement } from './types/tree'
import type { ParseOptions } from './types'
import MarkdownIt from 'markdown-it'
import pluginMdc from 'markdown-it-mdc'
import { parseFrontMatter } from 'remark-mdc'
import { convertMarkdownItTokensToMDC } from './utils/parse'
import { applyAutoUnwrap } from './utils/auto-unwrap'
import { generateToc } from './utils/table-of-contents'

export interface ParseResult {
  body: MDCRoot
  excerpt?: MDCRoot
  data: any
  toc?: any
}

// Re-export auto-close utilities
export { autoCloseMarkdown, detectUnclosedSyntax } from './auto-close'

// Re-export parse utilities
export { applyAutoUnwrap } from './utils/auto-unwrap'

// Re-export types
export type { MDCNode, MDCRoot, MDCElement, MDCText, MDCComment } from './types/tree'
export type { ParseOptions } from './types'

/**
 * Parse MDC content from a string
 *
 * @param source - The markdown/MDC content as a string
 * @param options - Parser options
 * @returns ParseResult - Object containing body, excerpt, data, and toc
 *
 * @example
 * ```typescript
 * import { parse } from 'mdc-syntax'
 *
 * const content = `---
 * title: Hello World
 * ---
 *
 * # Hello World
 *
 * This is a **markdown** document with *MDC* components.
 *
 * ::alert{type="info"}
 * This is an alert component
 * ::
 * `
 *
 * const result = parse(content)
 * console.log(result.body)    // MDC AST
 * console.log(result.data)    // { title: 'Hello World' }
 * console.log(result.toc)     // Table of contents
 *
 * // Disable auto-unwrap
 * const result2 = parse(content, { autoUnwrap: false })
 * ```
 */
export function parse(source: string, options: ParseOptions = {}): ParseResult {
  const { autoUnwrap = true } = options
  const { content, data } = parseFrontMatter(source)

  // Enable tables, GFM features
  const markdownIt = new MarkdownIt({
    html: true,
    linkify: true,
  })
    .enable(['table'])
    .use(pluginMdc)

  const tokens = markdownIt.parse(content, {})

  // Convert tokens to MDC structure
  const children = convertMarkdownItTokensToMDC(tokens)

  // Filter out top-level text nodes
  let filteredChildren = children.filter(child => child.type !== 'text')

  // Apply auto-unwrap to container components if enabled
  if (autoUnwrap) {
    filteredChildren = filteredChildren.map((child) => {
      if (child.type === 'element') {
        return applyAutoUnwrap(child as MDCElement)
      }
      return child
    })
  }

  const body: MDCRoot = {
    type: 'root',
    children: filteredChildren,
  }

  // Handle excerpt (look for HTML comment with 'more')
  let excerpt: MDCRoot | undefined
  const excerptIndex = tokens.findIndex(
    token => token.type === 'html_block' && token.content?.includes('<!-- more -->'),
  )

  if (excerptIndex !== -1) {
    const excerptTokens = tokens.slice(0, excerptIndex)
    let excerptChildren = convertMarkdownItTokensToMDC(excerptTokens as any, new Set())

    // Apply auto-unwrap to excerpt as well
    if (autoUnwrap) {
      excerptChildren = excerptChildren.map((child) => {
        if (child.type === 'element') {
          return applyAutoUnwrap(child as MDCElement)
        }
        return child
      })
    }

    excerpt = {
      type: 'root',
      children: excerptChildren.filter(child => child.type !== 'text'),
    }

    // Include styles if excerpt contains code block
    if (excerpt.children.find(node => node.type === 'element' && node.tag === 'pre')) {
      const lastChild = body.children[body.children.length - 1]
      if (lastChild && lastChild.type === 'element' && lastChild.tag === 'style') {
        excerpt.children.push(lastChild)
      }
    }
  }

  const toc = generateToc(body, {
    title: data.title || '',
    depth: data.depth || 2,
    searchDepth: data.searchDepth || 2,
    links: [],
  })

  return {
    body,
    excerpt,
    data,
    toc,
  }
}

/**
 * Alias for parse() - kept for backward compatibility
 * @internal
 */
export const parseWithMarkdownIt = parse
