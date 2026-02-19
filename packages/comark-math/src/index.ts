import type MarkdownIt from 'markdown-it'
import type StateInline from 'markdown-it/lib/rules_inline/state_inline.mjs'
import type StateBlock from 'markdown-it/lib/rules_block/state_block.mjs'
import katex from 'katex'
import type { ComarkPlugin } from 'comark'

export interface MathConfig {
  /**
   * Throw on parse errors or return error message
   * @default false
   */
  throwOnError?: boolean

  /**
   * Additional katex options
   */
  options?: Record<string, unknown>
}

/**
 * Render LaTeX math expression to HTML using KaTeX
 *
 * @param code LaTeX math expression
 * @param displayMode Whether to render in display mode
 * @param config KaTeX configuration
 * @returns HTML string
 *
 * @example
 * ```ts
 * const html = renderMath('E = mc^2', false)
 * const display = renderMath('x^2', true)
 * ```
 */
export function renderMath(
  code: string,
  displayMode: boolean,
  config: MathConfig = {},
): string {
  try {
    const options = {
      displayMode,
      throwOnError: config.throwOnError ?? false,
      ...config.options,
    }

    return katex.renderToString(code, options)
  }
  catch (error) {
    console.error('Math rendering error:', error)
    if (config.throwOnError) {
      throw error
    }
    return `<span class="math-error">${error instanceof Error ? error.message : 'Failed to render math'}</span>`
  }
}

/**
 * Check if code is valid LaTeX math syntax
 *
 * @param code LaTeX math expression
 * @returns true if valid, false otherwise
 *
 * @example
 * ```ts
 * validateMath('E = mc^2') // true
 * validateMath('\\invalid') // false
 * ```
 */
export function validateMath(code: string): boolean {
  try {
    katex.renderToString(code, { throwOnError: true })
    return true
  }
  catch {
    return false
  }
}

/**
 * markdown-it plugin for inline display math ($$...$$)
 * This handles $$...$$ within a paragraph (same line)
 */
function mathInlineDisplayRule(state: StateInline, silent: boolean, _config: MathConfig): boolean {
  const start = state.pos
  const max = state.posMax

  // Check if we start with $$
  if (start + 1 >= max) return false
  if (state.src.charCodeAt(start) !== 0x24 /* $ */) return false
  if (state.src.charCodeAt(start + 1) !== 0x24 /* $ */) return false

  // Find closing $$
  let pos = start + 2

  while (pos + 1 < max) {
    // Stop at newline
    if (state.src.charCodeAt(pos) === 0x0A /* \n */) {
      return false
    }

    // Check for $$
    if (state.src.charCodeAt(pos) === 0x24 && state.src.charCodeAt(pos + 1) === 0x24) {
      // Found closing $$
      const content = state.src.slice(start + 2, pos)

      if (!silent) {
        const token = state.push('math_inline', 'math', 0)
        token.content = content
        token.markup = '$$'
        token.meta = { display: true } // Mark as display mode
      }

      state.pos = pos + 2
      return true
    }

    pos++
  }

  return false
}

/**
 * markdown-it plugin for inline math ($...$)
 */
function mathInlineRule(state: StateInline, silent: boolean, _config: MathConfig): boolean {
  const start = state.pos
  const max = state.posMax

  // Check if we start with $
  if (state.src.charCodeAt(start) !== 0x24 /* $ */) {
    return false
  }

  // Don't match $$ (that's display math)
  if (start + 1 < max && state.src.charCodeAt(start + 1) === 0x24) {
    return false
  }

  // Find closing $
  let pos = start + 1
  let foundClose = false

  while (pos < max) {
    const char = state.src.charCodeAt(pos)

    // Stop at newline - $ must close on same line
    if (char === 0x0A /* \n */) {
      return false
    }

    if (char === 0x24 /* $ */) {
      // Found potential closing $
      // Make sure it's not escaped, we have content (at least 1 char),
      // it's not preceded by another $ (which would make it $$),
      // and it's not followed by another $ (which would make it $$)
      const hasContent = pos > start + 1
      const notEscaped = pos === start + 1 || state.src.charCodeAt(pos - 1) !== 0x5C /* \ */
      const notPrecededByDollar = pos === start + 1 || state.src.charCodeAt(pos - 1) !== 0x24
      const notFollowedByDollar = pos + 1 >= max || state.src.charCodeAt(pos + 1) !== 0x24

      if (hasContent && notEscaped && notPrecededByDollar && notFollowedByDollar) {
        foundClose = true
        break
      }
    }

    pos++
  }

  if (!foundClose) {
    return false
  }

  // Extract math content
  const content = state.src.slice(start + 1, pos)

  // Don't match if content looks like a price or number (starts with digits and contains "or" or ends at end of sentence)
  if (/^\d/.test(content)) {
    return false
  }

  if (!silent) {
    const token = state.push('math_inline', 'math', 0)
    token.content = content
    token.markup = '$'
  }

  state.pos = pos + 1
  return true
}

/**
 * markdown-it plugin for display math ($$...$$)
 */
function mathBlockRule(state: StateBlock, startLine: number, endLine: number, silent: boolean): boolean {
  const start = state.bMarks[startLine] + state.tShift[startLine]
  const max = state.eMarks[startLine]

  // Check if line starts with $$
  if (start + 2 > max) return false
  if (state.src.charCodeAt(start) !== 0x24 /* $ */) return false
  if (state.src.charCodeAt(start + 1) !== 0x24 /* $ */) return false

  const marker = state.src.slice(start, start + 2)
  const pos = start + 2

  // Check if it's inline $$ (closing on same line)
  const firstLine = state.src.slice(pos, max)
  const closePos = firstLine.indexOf('$$')

  if (closePos !== -1) {
    // Inline display math on single line
    if (silent) return true

    const content = firstLine.slice(0, closePos)

    const token = state.push('math_block', 'div', 0)
    token.content = content
    token.markup = marker
    token.block = true
    token.map = [startLine, startLine + 1]

    state.line = startLine + 1
    return true
  }

  // Multi-line display math
  let nextLine = startLine
  let autoClose = false

  // Search for closing $$
  while (nextLine < endLine) {
    nextLine++
    if (nextLine >= endLine) break

    const lineStart = state.bMarks[nextLine] + state.tShift[nextLine]
    const lineMax = state.eMarks[nextLine]

    if (lineStart < lineMax && state.sCount[nextLine] < state.blkIndent) {
      // Non-empty line with less indent - might close the block
      break
    }

    const lineText = state.src.slice(lineStart, lineMax)
    if (lineText.trim() === '$$') {
      autoClose = true
      break
    }

    // Check if line contains $$
    if (lineText.includes('$$')) {
      autoClose = true
      break
    }
  }

  if (!autoClose) {
    return false
  }

  if (silent) return true

  // Extract content between $$ markers
  const contentLines = []
  for (let i = startLine + 1; i < nextLine; i++) {
    const lineStart = state.bMarks[i] + state.tShift[i]
    const lineMax = state.eMarks[i]
    contentLines.push(state.src.slice(lineStart, lineMax))
  }

  const content = contentLines.join('\n')

  const token = state.push('math_block', 'div', 0)
  token.content = content
  token.markup = marker
  token.block = true
  token.map = [startLine, nextLine + 1]

  state.line = nextLine + 1
  return true
}

/**
 * Create markdown-it plugin for math support
 */
function markdownItMath(md: MarkdownIt, config: MathConfig = {}) {
  // Add inline display math rule ($$...$$) - must come before inline math ($...$)
  md.inline.ruler.before('escape', 'math_inline_display', (state, silent) =>
    mathInlineDisplayRule(state, silent, config),
  )

  // Add inline math rule ($...$)
  md.inline.ruler.before('escape', 'math_inline', (state, silent) =>
    mathInlineRule(state, silent, config),
  )

  // Add block math rule ($$...$$)
  md.block.ruler.before('fence', 'math_block', mathBlockRule, {
    alt: ['paragraph', 'reference', 'blockquote', 'list'],
  })
}

/**
 * Create math plugin for comark
 *
 * This plugin processes markdown-it tokens and converts math expressions
 * with $ and $$ delimiters to HTML using KaTeX.
 *
 * @param config Math rendering configuration
 *
 * @example
 * ```ts
 * import { parse } from 'comark'
 * import comarkMath from '@comark/math'
 *
 * const result = await parse('Inline $x^2$ and display $$E = mc^2$$', {
 *   plugins: [comarkMath({ throwOnError: false })]
 * })
 * ```
 */
export default function comarkMath(config?: MathConfig): ComarkPlugin {
  return {
    markdownItPlugins: [
      (md: MarkdownIt) => markdownItMath(md, config ?? {}),
    ],
  }
}
