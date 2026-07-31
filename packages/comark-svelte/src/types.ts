import type { ComarkNode, MarkdownTree, ComarkPlugin, ComponentManifest, ParseOptions } from 'comark'
import type { Component, Snippet } from 'svelte'

export interface ComponentResolverProps {
  promise: Promise<any>
  props?: Record<string, any>
  children?: Snippet
}

export type ComponentResolver = Component<ComponentResolverProps>

export interface MarkdownNodeProps {
  node: ComarkNode
  components?: Record<string, any>
  componentsManifest?: ComponentManifest
  resolver?: ComponentResolver
  /** CSS class for the streaming caret, or null if no caret. Threaded recursively to the last child. */
  caretClass?: string | null
}

export interface MarkdownParsedProps {
  /** The parsed Comark tree to render */
  value?: MarkdownTree
  /** @deprecated Use `value` instead */
  tree?: MarkdownTree
  components?: Record<string, any>
  componentsManifest?: ComponentManifest
  resolver?: ComponentResolver
  streaming?: boolean
  caret?: boolean | { class: string }
  class?: string
}

export interface MarkdownProps {
  /** The markdown content to parse and render */
  value?: string
  /** @deprecated Use `value` instead */
  markdown?: string
  options?: Exclude<ParseOptions, 'plugins'>
  plugins?: ComarkPlugin[]
  /**
   * Strip wrapper tags from the top level of the tree — shorthand for
   * `options.unwrap`. `true` unwraps `<p>`; a space-separated string or array
   * unwraps the listed tags.
   */
  unwrap?: boolean | string | string[]
  components?: Record<string, any>
  componentsManifest?: ComponentManifest
  streaming?: boolean
  caret?: boolean | { class: string }
  class?: string
}

/** @deprecated Use `MarkdownNodeProps` instead */
export type ComarkNodeProps = MarkdownNodeProps

/** @deprecated Use `MarkdownParsedProps` instead */
export type ComarkRendererProps = MarkdownParsedProps

/** @deprecated Use `MarkdownProps` instead */
export type ComarkProps = MarkdownProps
