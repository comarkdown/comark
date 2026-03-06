import type { ComarkParseFn, ComarkParsePostState, ParseOptions } from './types'
import MarkdownIt from 'markdown-exit'
import pluginMdc from '@comark/markdown-it'
import taskList from './plugins/task-list'
import alert from './plugins/alert'
import { applyAutoUnwrap } from './internal/parse/auto-unwrap'
import type { ComarkTree, ComarkNode } from 'comark/ast'
import { marmdownItTokensToComarkTree } from './internal/parse/token-processor'
import { autoCloseMarkdown } from './internal/parse/auto-close/index'
import { parseFrontmatter } from './internal/front-matter'
import { extractReusableNodes } from './internal/parse/incremental'

// Re-export ComarkTree and ComarkNode for convenience
export type { ComarkTree, ComarkNode } from 'comark/ast'

// Re-export auto-close utilities
export { autoCloseMarkdown } from './internal/parse/auto-close'

// Re-export parse utilities
export { applyAutoUnwrap } from './internal/parse/auto-unwrap'

// Re-export types
export type * from './types'

/**
 * Creates a parser function for Comark content.
 *
 * Returns an async function that takes a markdown string and returns a Promise resolving to a ComarkTree AST.
 * The returned parser applies frontmatter extraction, Comark syntax parsing, token-to-AST conversion,
 * auto-closing of incomplete markdown, optional AST transformations and plugin hooks.
 *
 * @param options - Parser options controlling parsing behavior.
 * @returns An async parser function: (markdown) => Promise<ComarkTree>
 *
 * @example
 * ```typescript
 * import { createParse } from 'comark'
 *
 * const parse = createParse({ autoUnwrap: false })
 * const tree = await parse('# Hello **World**\n::alert\nhi\n::')
 * console.log(tree.nodes)
 * // → [ ['h1', { id: 'hello-world' }, 'Hello ', ['strong', {}, 'World'] ], ['alert', {}, 'hi'] ]
 * ```
 */
export function createParse(options: ParseOptions = {}): ComarkParseFn {
  const { autoUnwrap = true, autoClose = true, plugins = [] } = options

  plugins.unshift(taskList())
  plugins.unshift(alert())

  const parser = new MarkdownIt({
    html: true,
    linkify: true,
  })
    .enable(['table', 'strikethrough'])
    .use(pluginMdc)

  for (const plugin of plugins) {
    for (const markdownItPlugin of (plugin.markdownItPlugins || [])) {
      parser.use(markdownItPlugin)
    }
  }

  let lastOutput: ComarkTree | null = null
  let lastInput: string | null = null

  return async (markdown, opts = {}) => {
    const state = {
      options,
      tokens: [] as unknown[],
      markdown,
      tree: null as ComarkTree | null,
      parsedLines: 0,
      reusableNodes: [] as ComarkNode[],
    }

    const prevOutput = lastOutput
    if (opts.streaming && prevOutput && markdown.startsWith(lastInput ?? '')) {
      const { remainingMarkdownStartLine, reusedNodes, remainingMarkdown } = extractReusableNodes(markdown, prevOutput)

      // If there is no remaining markdown, return the previous output
      if (!remainingMarkdown) return prevOutput

      state.parsedLines = remainingMarkdownStartLine
      state.markdown = remainingMarkdown
      state.reusableNodes = reusedNodes
    }

    if (autoClose) {
      state.markdown = autoCloseMarkdown(state.markdown)
    }

    for (const plugin of options.plugins || []) {
      await plugin.pre?.(state)
    }

    const { content, data } = await parseFrontmatter(state.markdown)

    state.tokens = parser.parse(content, {})

    // Convert tokens to Comark structure
    let nodes = marmdownItTokensToComarkTree(state.tokens, {
      startLine: state.parsedLines,
      preservePositions: opts.streaming ?? false,
    })

    if (autoUnwrap) {
      nodes = nodes.map((node: ComarkNode) => applyAutoUnwrap(node))
    }

    if (opts.streaming) {
      state.tree = {
        frontmatter: state.parsedLines > 0 ? (prevOutput?.frontmatter ?? data) : data,
        meta: {},
        nodes: [...state.reusableNodes, ...nodes],
      }
      // Set last output and input for streaming mode
      lastOutput = state.tree
      lastInput = markdown
    }
    else {
      state.tree = {
        frontmatter: data,
        meta: {},
        nodes,
      }
      // Reset last output and input for non-streaming mode
      lastOutput = null
      lastInput = null
    }

    for (const plugin of plugins || []) {
      await plugin.post?.(state as ComarkParsePostState)
    }

    return state.tree
  }
}

/**
 * Parse Comark content from a string
 *
 * @param markdown - The markdown/Comark content as a string
 * @param options - Parser options
 * @returns ComarkTree - The parsed AST tree
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
 * const tree = await parse(content)
 * console.log(tree.nodes)        // Array of AST nodes
 * console.log(tree.frontmatter)  // { title: 'Hello World' }
 * console.log(tree.meta)         // Additional metadata
 *
 * // Disable auto-unwrap
 * const tree2 = await parse(content, { autoUnwrap: false })
 * ```
 */
export async function parse(markdown: string, options: ParseOptions = {}): Promise<ComarkTree> {
  const parse = createParse(options)

  return await parse(markdown)
}
