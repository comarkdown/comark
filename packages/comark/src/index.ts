import type { ParseOptions } from './types'
import MarkdownIt from 'markdown-it'
import pluginMdc from 'markdown-it-mdc'
import markdownItEmoji from './internal/parse/markdown-it-emoji'
import markdownItTaskListsMdc from './internal/parse/markdown-it-task-lists-mdc'
import { applyAutoUnwrap } from './internal/parse/auto-unwrap'
import { generateToc } from './internal/parse/table-of-contents'
import type { ComarkTree, ComarkNode } from 'comark/ast'
import { marmdownItTokensToComarkTree } from './internal/parse/token-processor'
import { autoCloseMarkdown } from './internal/parse/auto-close'
import { parseFrontmatter } from './internal/front-matter'

export interface ParseResult {
  body: ComarkTree
  excerpt?: ComarkTree
  data: any
  toc?: any
}

// Re-export ComarkTree and ComarkNode for convenience
export type { ComarkTree, ComarkNode } from 'comark/ast'

// Re-export auto-close utilities
export { autoCloseMarkdown } from './internal/parse/auto-close'

// Re-export parse utilities
export { applyAutoUnwrap } from './internal/parse/auto-unwrap'

// Re-export syntax highlighting utilities
export { highlightCode } from './internal/parse/shiki-highlighter'

// Re-export types
export type * from './types'

/**
 * Parse Comark content from a string
 *
 * @param source - The markdown/Comark content as a string
 * @param options - Parser options
 * @returns ParseResult - Object containing body, excerpt, data, and toc
 *
 * @example
 * ```typescript
 * import { parse } from 'comark'
 *
 * const content = `---
 * title: Hello World
 * ---
 *
 * # Hello World
 *
 * This is a **markdown** document with *Comark* components.
 *
 * ::alert{type="info"}
 * This is an alert component
 * ::
 * `
 *
 * const result = parse(content)
 * console.log(result.body)    // Comark AST
 * console.log(result.data)    // { title: 'Hello World' }
 * console.log(result.toc)     // Table of contents
 *
 * // Disable auto-unwrap
 * const result2 = parse(content, { autoUnwrap: false })
 * ```
 */
export function parse(source: string, options: ParseOptions = {}): ParseResult {
  const { autoUnwrap = true, autoClose = true, highlight } = options

  // Warn if highlight option is used with sync parse
  if (highlight) {
    console.warn(
      'The "highlight" option requires async parsing. Use parseAsync() instead, or call highlightCodeBlocks() manually after parsing.',
    )
  }

  if (autoClose) {
    source = autoCloseMarkdown(source)
  }

  const { content, data } = parseFrontmatter(source)

  // Enable tables, GFM features
  const markdownIt = new MarkdownIt({
    html: true,
    linkify: true,
  })
    .enable(['table', 'strikethrough'])
    // Custom task list plugin must run before Comark to prevent [X] being parsed as Comark
    .use(markdownItTaskListsMdc)
    .use(markdownItEmoji)
    .use(pluginMdc)

  for (const plugin of options.plugins || []) {
    for (const markdownItPlugin of plugin.markdownItPlugins) {
      markdownIt.use(markdownItPlugin)
    }
  }

  const tokens = markdownIt.parse(content, {})

  // Convert tokens to Comark structure
  const body: ComarkTree = marmdownItTokensToComarkTree(tokens)

  if (autoUnwrap) {
    body.value = body.value.map((node: ComarkNode) => applyAutoUnwrap(node))
  }

  // Handle excerpt (look for HTML comment with 'more')
  let excerpt: ComarkTree | undefined
  const excerptIndex = tokens.findIndex(
    token => token.type === 'html_block' && token.content?.includes('<!-- more -->'),
  )

  if (excerptIndex !== -1) {
    const excerptTokens = tokens.slice(0, excerptIndex)
    excerpt = marmdownItTokensToComarkTree(excerptTokens)

    // Apply auto-unwrap to excerpt as well
    if (autoUnwrap) {
      excerpt.value = excerpt.value.map((child: ComarkNode) => applyAutoUnwrap(child))
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
 * Parse Comark content from a string with optional syntax highlighting
 *
 * This is an async version of parse() that supports the `highlight` option
 * to automatically apply Shiki syntax highlighting to code blocks.
 *
 * @param source - The markdown/Comark content as a string
 * @param options - Parser options including highlight settings
 * @returns Promise<ParseResult> - Object containing body, excerpt, data, and toc
 *
 * @example
 * ```typescript
 * import { parseAsync } from 'comark'
 *
 * const content = `
 * # Hello World
 *
 * \`\`\`javascript
 * console.log("Hello!")
 * \`\`\`
 * `
 *
 * const result = await parseAsync(content, {
 *   highlight: true,
 *   shiki: { theme: 'github-dark' }
 * })
 * console.log(result.body)  // AST with syntax-highlighted code blocks
 * ```
 */
export async function parseAsync(source: string, options: ParseOptions = {}): Promise<ParseResult> {
  const { highlight = false, ...parseOptions } = options

  // First, do the regular synchronous parse (without highlight option to avoid warning)
  const result = parse(source, parseOptions)

  // If highlighting is enabled, apply it to code blocks
  if (highlight) {
    const { highlightCodeBlocks } = await import('./internal/parse/shiki-highlighter')
    result.body = await highlightCodeBlocks(result.body, highlight === true ? {} : highlight)
  }

  return result
}
