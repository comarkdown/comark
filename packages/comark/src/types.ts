import type MarkdownIt from 'markdown-it'
import type { ComarkTree } from './ast/types'

export type MarkdownItPlugin = (md: MarkdownIt) => void

export type ComarkParsePreState = {
  markdown: string
  options: ParseOptions

  [key: string]: any
}

export type ComarkParsePostState = {
  markdown: string
  tree: ComarkTree
  options: ParseOptions
  tokens: unknown[]

  [key: string]: any
}

export type ComarkPlugin = {
  markdownItPlugins?: MarkdownItPlugin[]
  pre?: (state: ComarkParsePreState) => Promise<void> | void
  post?: (state: ComarkParsePostState) => Promise<void> | void
}

export type ComponentManifest = (name: string) => Promise<unknown> | undefined | null
export interface ComarkContextProvider {
  components: Record<string, any>
  componentManifest: ComponentManifest
}
export interface ParseOptions {
  /**
   * Whether to automatically unwrap single paragraphs in container components.
   * When enabled, if a container component (alert, card, callout, note, warning, tip, info)
   * has only a single paragraph child, the paragraph wrapper is removed and its children
   * become direct children of the container. This creates cleaner HTML output.
   *
   * @default true
   * @example
   * // With autoUnwrap: true (default)
   * // <alert><strong>Text</strong></alert>
   *
   * // With autoUnwrap: false
   * // <alert><p><strong>Text</strong></p></alert>
   */
  autoUnwrap?: boolean

  /**
   * Whether to automatically close unclosed markdown and Comark components.
   * @default true
   */
  autoClose?: boolean

  /**
   * Additional plugins to use
   * @default []
   */
  plugins?: ComarkPlugin[]
}
