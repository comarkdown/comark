import type { ParseOptions, RenderOptions } from 'comark'
import { createParse } from 'comark'
import { renderANSI } from './render.ts'

export { renderANSI, RenderANSIOptions } from './render'

function defaultWrite(string: string) {
  if (typeof process !== 'undefined') {
    process.stdout.write(string)
  }
  else {
    console.log(string.trim())
  }
}

/**
 * Options for creating a log function.
 */
export interface LogOptions extends RenderOptions, ParseOptions {
  write?: (string: string) => void
}

/**
 * Creates a reusable log function with pre-configured parse and render options.
 *
 * @param options - Comark parse and render options (plugins, autoClose, etc.)
 * @returns An async function `(markdown) => Promise<void>` that prints to stdout
 *
 * @example
 * ```typescript
 * import { createLog } from '@comark/ansi'
 * import math from 'comark/plugins/math'
 *
 * const log = createLog({
 *   plugins: [math()],
 *   width: 120,
 *   write: (s) => process.stderr.write(s)
 * })
 *
 * await log('# Hello\n\nThis is **bold**.')
 * ```
 */
export function createLog(options?: LogOptions): (markdown: string) => Promise<void> {
  const parse = createParse(options as ParseOptions)

  return async (markdown: string) => {
    const tree = await parse(markdown)
    const write = options?.write ?? defaultWrite

    write(await renderANSI(tree, options as RenderOptions) + '\n')
  }
}

/**
 * Parse markdown and print it as ANSI-styled output to stdout.
 *
 * @param markdown - The markdown/Comark content to parse and print
 * @param options - Optional rendering options
 *
 * @example
 * ```typescript
 * import { log } from '@comark/ansi'
 *
 * await log('# Hello\n\nThis is **bold** and _italic_.')
 * ```
 */
export async function log(markdown: string, options?: LogOptions): Promise<void> {
  return createLog(options)(markdown)
}

/**
 * Creates a reusable render function with pre-configured parse and render options.
 *
 * @param options - Comark parse and render options (plugins, autoClose, etc.)
 * @returns An async function `(markdown) => Promise<string>` that returns ANSI-styled output
 *
 * @example
 * ```typescript
 * import { createRender } from '@comark/ansi'
 *
 * const render = createRender({
 *   plugins: [math()]
 * })
 *
 * const output = await render('# Hello\n\nThis is **bold** and _italic_.')
 * console.log(output)
 * ```
 */
export function createRender(options?: ParseOptions & RenderOptions): (markdown: string) => Promise<string> {
  const parse = createParse(options as ParseOptions)

  return async (markdown: string) => {
    const tree = await parse(markdown)
    return await renderANSI(tree, options as RenderOptions)
  }
}

/**
 * Parse markdown and render it as ANSI-styled output to stdout.
 *
 * @param markdown - The markdown/Comark content to parse and print
 * @param options - Optional rendering options
 *
 * @example
 * ```typescript
 * import { render } from '@comark/ansi'
 *
 * const output = await render('# Hello\n\nThis is **bold** and _italic_.')
 * console.log(output)
 * ```
 */
export async function render(markdown: string, options?: LogOptions): Promise<string> {
  return createRender(options)(markdown)
}
