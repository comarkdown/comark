import type { ParserOptions } from 'comark'
import { createMarkdownParser } from 'comark'
import { type AnsiRendererOptions, renderAnsiFromDocument } from './render.ts'

export { renderAnsiFromDocument, type AnsiRendererOptions } from './render.ts'

function defaultWriter(string: string) {
  if (typeof process !== 'undefined') {
    process.stdout.write(string)
  } else {
    console.log(string.trim())
  }
}

/**
 * Options for creating an ANSI writer.
 */
export interface AnsiWriterOptions extends AnsiRendererOptions, ParserOptions {
  writer?: (string: string) => void
}

/**
 * Creates a reusable writer with pre-configured parse and render options.
 *
 * @param options - Comark parse and render options (plugins, autoClose, etc.)
 * @returns An async function `(markdown) => Promise<void>` that prints to stdout
 *
 * @example
 * ```typescript
 * import { createAnsiWriter } from '@comark/ansi'
 * import math, { Math } from '@comark/ansi/plugins/math'
 *
 * const writeAnsi = createAnsiWriter({
 *   plugins: [math()],
 *   components: { Math },
 *   width: 120,
 *   writer: (s) => process.stderr.write(s)
 * })
 *
 * await writeAnsi('# Hello\n\nThis is **bold**.')
 * ```
 */
export function createAnsiWriter(options?: AnsiWriterOptions): (markdown: string) => Promise<void> {
  const renderAnsi = createAnsiRenderer(options as AnsiRendererOptions)
  const write = options?.writer ?? defaultWriter
  return async (markdown: string) => {
    const output = await renderAnsi(markdown)
    write(output + '\n')
  }
}

/**
 * Parse markdown and print it as ANSI-styled output to stdout.
 *
 * @param markdown - The markdown content to parse and print
 * @param options - Optional markdown parser, ANSI renderer, and writer options
 *
 * @example
 * ```typescript
 * import { writeAnsi } from '@comark/ansi'
 *
 * await writeAnsi('# Hello\n\nThis is **bold** and _italic_.')
 * ```
 */
export async function writeAnsi(markdown: string, options?: AnsiWriterOptions): Promise<void> {
  return createAnsiWriter(options)(markdown)
}

/**
 * Creates a reusable render function with pre-configured parse and render options.
 *
 * @param options - Markdown parser and ANSI renderer options (plugins, autoClose, etc.)
 * @returns An async function `(markdown) => Promise<string>` that returns ANSI-styled output
 *
 * @example
 * ```typescript
 * import { createAnsiRenderer } from '@comark/ansi'
 *
 * const renderAnsi = createAnsiRenderer({
 *   plugins: [math()]
 * })
 *
 * const output = await renderAnsi('# Hello\n\nThis is **bold** and _italic_.')
 * console.log(output)
 * ```
 */
export function createAnsiRenderer(
  options?: ParserOptions & AnsiRendererOptions
): (markdown: string) => Promise<string> {
  const parseMarkdown = createMarkdownParser(options as ParserOptions)
  return async (markdown: string) => {
    const doc = await parseMarkdown(markdown)
    return await renderAnsiFromDocument(doc, options as AnsiRendererOptions)
  }
}

/**
 * Parse markdown and render it as an ANSI-styled string.
 *
 * @param markdown - The markdown content to parse and render
 * @param options - Optional markdown parser & ANSI renderer options
 *
 * @example
 * ```typescript
 * import { renderAnsi } from '@comark/ansi'
 *
 * const output = await renderAnsi('# Hello\n\nThis is **bold** and _italic_.')
 * console.log(output)
 * ```
 */
export async function renderAnsi(markdown: string, options?: ParserOptions & AnsiRendererOptions): Promise<string> {
  return createAnsiRenderer(options)(markdown)
}
