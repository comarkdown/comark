import type { ComarkNode, ComarkTree } from 'comark/ast'
import type { ComarkPlugin, ComponentManifest, ParseOptions } from 'comark'

export interface ComarkNodeProps {
  node: ComarkNode
  components?: Record<string, any>
  componentsManifest?: ComponentManifest
  /** CSS class for the streaming caret, or null if no caret. Threaded recursively to the last child. */
  caretClass?: string | null
}

export interface ComarkRendererProps {
  tree: ComarkTree
  components?: Record<string, any>
  componentsManifest?: ComponentManifest
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
