import type { BundledLanguage, BundledTheme } from 'shiki'
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

export interface ShikiOptions {
  /**
   * Languages to preload. If not specified, languages will be loaded on demand.
   * @default undefined (load on demand)
   */
  languages?: BundledLanguage[]

  /**
   * Additional themes to preload
   * @default { light: 'material-theme-lighter', dark: 'material-theme-palenight' }
   */
  themes?: Record<string, BundledTheme | string>

  /**
   * Whether to add pre styles to the code blocks
   * @default false
   */
  preStyles?: boolean
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
   * Enable syntax highlighting for code blocks using Shiki or provide custom options
   * @default false
   */
  highlight?: boolean | ShikiOptions

  /**
   * Additional plugins to use
   * @default []
   */
  plugins?: ComarkPlugin[]
}
