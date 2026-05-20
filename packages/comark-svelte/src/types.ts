import type { ComarkNode, ComarkTree, ComarkPlugin, ComponentManifest, ParseOptions } from 'comark'
import type { Component, Snippet } from 'svelte'

export interface ComponentResolverProps {
  promise: Promise<any>
  props?: Record<string, any>
  children?: Snippet
}

export type ComponentResolver = Component<ComponentResolverProps>

export interface ComarkNodeProps {
  node: ComarkNode
  components?: Record<string, any>
  componentsManifest?: ComponentManifest
  resolver?: ComponentResolver
  /** CSS class for the streaming caret, or null if no caret. Threaded recursively to the last child. */
  caretClass?: string | null
}

export interface ComarkRendererProps {
  tree: ComarkTree
  components?: Record<string, any>
  componentsManifest?: ComponentManifest
  resolver?: ComponentResolver
  streaming?: boolean
  caret?: boolean | { class: string }
  class?: string
}

export interface ComarkProps {
  markdown?: string
  options?: Exclude<ParseOptions, 'plugins'>
  plugins?: ComarkPlugin[]
  components?: Record<string, any>
  componentsManifest?: ComponentManifest
  streaming?: boolean
  caret?: boolean | { class: string }
  class?: string
}
