import type { Node, MarkdownDocument, ComarkPlugin, ComponentManifest, NodeTransform, ParserOptions } from 'comark'
import type { Component, Snippet } from 'svelte'
import type { HTMLAttributes } from 'svelte/elements'
import type { CaretOptions, FadeOptions, StreamEffect } from 'comark/stream'

/**
 * HTML attributes (`id`, `style`, `role`, `data-*`, `aria-*`, ...) set on the
 * `comark-content` wrapper div.
 */
export type RootAttributes = Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'>

export interface ComponentResolverProps {
  promise: Promise<any>
  props?: Record<string, any>
  children?: Snippet
}

export type ComponentResolver = Component<ComponentResolverProps>

export interface MarkdownNodeProps {
  node: Node
  components?: Record<string, any>
  componentsManifest?: ComponentManifest
  /** Change the tag or props of element nodes just before they render */
  transformNode?: NodeTransform | readonly NodeTransform[]
  resolver?: ComponentResolver
  /** CSS class for the streaming caret, or null if no caret. Threaded recursively to the last child. */
  caretClass?: string | null
}

export interface MarkdownDocumentProps extends RootAttributes {
  /** The parsed Markdown document to render */
  value?: MarkdownDocument
  components?: Record<string, any>
  componentsManifest?: ComponentManifest
  /** Change the tag or props of element nodes just before they render */
  transformNode?: NodeTransform | readonly NodeTransform[]
  resolver?: ComponentResolver
  streaming?: boolean
  caret?: boolean | CaretOptions
  /** Fade in text as it streams */
  fade?: boolean | FadeOptions
  /** Custom render-time stream effects, run before `fade` and `caret`. Put `pace()` first. */
  effects?: readonly StreamEffect[]
  class?: string
  /**
   * Document key used to subscribe to live updates via `globalThis.comarkContext`.
   * Falls back to the document's own `meta.key` when set by a plugin.
   */
  documentKey?: string
}

export interface MarkdownProps extends RootAttributes {
  /** The markdown content to parse and render, or a pre-parsed MarkdownDocument */
  value?: string | MarkdownDocument
  options?: Omit<ParserOptions, 'plugins'>
  plugins?: ComarkPlugin[]
  /**
   * Strip wrapper tags from the top level of the document. Shorthand for
   * `options.unwrap`. `true` unwraps `<p>`; a space-separated string or array
   * unwraps the listed tags.
   */
  unwrap?: boolean | string | string[]
  components?: Record<string, any>
  componentsManifest?: ComponentManifest
  /** Change the tag or props of element nodes just before they render */
  transformNode?: NodeTransform | readonly NodeTransform[]
  streaming?: boolean
  caret?: boolean | CaretOptions
  /** Fade in text as it streams */
  fade?: boolean | FadeOptions
  /** Custom render-time stream effects, run before `fade` and `caret`. Put `pace()` first. */
  effects?: readonly StreamEffect[]
  class?: string
}
