import type { ComarkTree, ComarkElement, ComarkNode } from 'comark/ast'
import type { ParseOptions } from 'comark'
import type { NodeHandler, State } from 'comark/string'
import { stringify } from 'comark/string'
import { handlers as defaultHandlers } from './handlers/index.ts'
import { createParse } from 'comark'

export interface RenderANSIContext extends State {
  /** Renders the element's children to an ANSI string */
  render: (children: ComarkNode[]) => string
  /** Frontmatter/metadata passed via options.data */
  data?: Record<string, any>
}

export type ANSIComponentRenderFn = (element: ComarkElement, ctx: RenderANSIContext) => string

export interface RenderANSIOptions {
  /** Custom component renderers keyed by tag name */
  components?: Record<string, ANSIComponentRenderFn>
  /** Frontmatter data, made available to component renderers */
  data?: Record<string, any>
  /**
   * Whether to emit ANSI escape codes.
   * Defaults to `true` unless the `NO_COLOR` environment variable is set.
   */
  colors?: boolean
  /**
   * Terminal width used for horizontal rules and code block borders.
   * @default 80
   */
  width?: number
}

/**
 * Options for creating a log function.
 */
export interface LogOptions {
  parse?: ParseOptions
  render?: RenderANSIOptions
  write?: (string: string) => void
}

/**
 * Render a Comark tree to an ANSI-styled terminal string.
 *
 * @param tree - The Comark tree to render
 * @param options - Optional rendering options
 * @returns The ANSI-styled string
 *
 * @example
 * ```typescript
 * import { parse } from 'comark'
 * import { renderANSI } from '@comark/ansi'
 *
 * const tree = await parse('# Hello\n\nThis is **bold** and _italic_.')
 * console.log(renderANSI(tree))
 * ```
 */
export function renderANSI(tree: ComarkTree, options?: RenderANSIOptions): string {
  const colors = options?.colors ?? (typeof process !== 'undefined' ? !process.env.NO_COLOR : true)
  const width = options?.width ?? 80

  const handlers: Record<string, NodeHandler> = {}

  if (options?.components) {
    for (const [name, renderFn] of Object.entries(options.components)) {
      handlers[name] = (node, state) => {
        const render = (children: ComarkNode[]) =>
          renderANSI({ nodes: children, frontmatter: {}, meta: {} }, options)
        return renderFn(node, { ...state, render, data: options.data })
      }
    }
  }

  return stringify(tree, {
    colors,
    width,
    handlers: {
      ...defaultHandlers,
      ...handlers,
    },
  })
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
 *   parse: { plugins: [math()] },
 *   render: { width: 120 },
 *   write: (s) => process.stderr.write(s)
 * })
 *
 * await log('# Hello\n\nThis is **bold**.')
 * ```
 */
export function createLog(options?: LogOptions): (markdown: string) => Promise<void> {
  const opts: ParseOptions = options?.parse ?? {}
  const parse = createParse(opts)

  return async (markdown: string) => {
    const tree = await parse(markdown)
    const write = options?.write ?? defaultWrite

    write(renderANSI(tree, options?.render) + '\n')
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

function defaultWrite(string: string) {
  if (typeof process !== 'undefined') {
    process.stdout.write(string)
  }
  else {
    console.log(string.trim())
  }
}
