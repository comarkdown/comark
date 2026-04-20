import type { ComarkParseFn, ComarkParsePostState, MarkdownExitPlugin, ParseOptions, ComarkTree, ComarkNode } from './types.ts'
import MarkdownExit from 'markdown-exit'
import pluginMdc from '@comark/markdown-it'
import taskList from './plugins/task-list.ts'
import alert from './plugins/alert.ts'
import { applyAutoUnwrap } from './internal/parse/auto-unwrap.ts'
import { marmdownItTokensToComarkTree } from './internal/parse/token-processor.ts'
import { autoCloseMarkdown } from './internal/parse/auto-close/index.ts'
import { parseFrontmatter } from './internal/frontmatter.ts'
import { extractReusableNodes } from './internal/parse/incremental.ts'
import html_block from './internal/parse/html/html_block_rule.ts'
import html_inline from './internal/parse/html/html_inline_rule.ts'
import { createSerializedTask } from './utils/helpers.ts'

// Re-export frontmatter utilities
export { parseFrontmatter } from './internal/frontmatter.ts'

// Re-export plugin utilities
export { defineComarkPlugin } from './utils/helpers.ts'

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
 *
 * // Enable HTML parsing (on by default) — HTML tags are included in the AST
 * const parseWithHtml = createParse({ html: true })
 * const tree2 = await parseWithHtml('<strong class="bold">Hello</strong> _world_')
 * console.log(tree2.nodes)
 * // → [ ['strong', { class: 'bold' }, 'Hello'], ' ', ['em', {}, 'world'] ]
 *
 * // Disable HTML parsing — HTML tags are treated as plain text
 * const parseNoHtml = createParse({ html: false })
 * ```
 */
export function createParse(options: ParseOptions = {}): ComarkParseFn {
  const { autoUnwrap = true, autoClose = true, plugins = [] } = options

  plugins.unshift(taskList())
  plugins.unshift(alert())

  const parser = new MarkdownExit({
    html: false,
    linkify: true,
  })
    .enable(['table', 'strikethrough'])
    .use(pluginMdc)

  if (options.html !== false) {
    parser.inline.ruler.before('text', 'comark_html_inline', html_inline)
    parser.block.ruler.before('html_block', 'comark_html_block', html_block, {
      alt: ['paragraph', 'reference', 'blockquote'],
    })
  }

  for (const plugin of plugins) {
    for (const markdownItPlugin of (plugin.markdownItPlugins || [])) {
      parser.use(markdownItPlugin as unknown as MarkdownExitPlugin)
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

    const { content, data } = parseFrontmatter(state.markdown)

    try {
      state.tokens = parser.parse(content, {})
    }
    catch (e) {
      // in case of streaming, return the previous output if parsing fails
      // This is to avoid resetting the tree to an empty state on failure
      // resetting the tree will re-redner whole tree
      if (opts.streaming && prevOutput) {
        return prevOutput
      }
      throw e
    }

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

/**
 * Creates a serialized parser function for Comark content.
 * This is useful for parsing large files in a streaming manner.
 *
 * @param options - Parser options
 * @returns ComarkParseFn - The serialized parser function
 *
 * @example
 * ```typescript
 * import { createSerializedParse } from 'comark'
 *
 * const parse = createSerializedParse()
 * const tree = await parse(content)
 * console.log(tree.nodes)
 */
export function createSerializedParse(options: ParseOptions = {}): ComarkParseFn {
  return createSerializedTask(createParse(options))
}
