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
 * Options for creating an ANSI printer.
 */
export interface AnsiPrinterOptions extends AnsiRendererOptions, ParserOptions {
  writer?: (string: string) => void
}

/**
 * Options for creating an ANSI printer.
 *
 * @deprecated Use {@link AnsiPrinterOptions} instead. Will be removed in the next major version.
 */
export type AnsiWriterOptions = AnsiPrinterOptions

/**
 * Creates a reusable printer with pre-configured parse and render options.
 *
 * @param options - Comark parse and render options (plugins, autoClose, etc.)
 * @returns An async function `(markdown) => Promise<void>` that prints to stdout
 *
 * @example
 * ```typescript
 * import { createAnsiPrinter } from '@comark/ansi'
 * import math, { Math } from '@comark/ansi/plugins/math'
 *
 * const printAnsi = createAnsiPrinter({
 *   plugins: [math()],
 *   components: { Math },
 *   width: 120,
 *   writer: (s) => process.stderr.write(s)
 * })
 *
 * await printAnsi('# Hello\n\nThis is **bold**.')
 * ```
 */
export function createAnsiPrinter(options?: AnsiPrinterOptions): (markdown: string) => Promise<void> {
  const renderAnsi = createAnsiRenderer(options as AnsiRendererOptions)
  const write = options?.writer ?? defaultWriter
  return async (markdown: string) => {
    const output = await renderAnsi(markdown)
    write(output + '\n')
  }
}

/**
 * Creates a reusable printer with pre-configured parse and render options.
 *
 * @deprecated Use {@link createAnsiPrinter} instead. Will be removed in the next major version.
 */
export const createAnsiWriter = createAnsiPrinter

/**
 * Parse markdown and print it as ANSI-styled output to stdout.
 *
 * @param markdown - The markdown content to parse and print
 * @param options - Optional markdown parser, ANSI renderer, and writer options
 *
 * @example
 * ```typescript
 * import { printAnsi } from '@comark/ansi'
 *
 * await printAnsi('# Hello\n\nThis is **bold** and _italic_.')
 * ```
 */
export async function printAnsi(markdown: string, options?: AnsiPrinterOptions): Promise<void> {
  return createAnsiPrinter(options)(markdown)
}

/**
 * Parse markdown and print it as ANSI-styled output to stdout.
 *
 * @deprecated Use {@link printAnsi} instead. Will be removed in the next major version.
 */
export const writeAnsi = printAnsi

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
