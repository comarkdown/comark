import type { ComarkElement, ComarkNode } from 'comark/ast'

export type ANSINodeHandler = (node: ComarkElement, state: ANSIState, parent?: ComarkElement) => string

export interface ANSIContext {
  /** Whether to emit ANSI escape codes */
  colors: boolean
  /** Terminal width used for HR and table rendering */
  width: number
  /** User-provided component overrides */
  handlers: Record<string, ANSINodeHandler>
  /** True when inside a list */
  list?: boolean
  /** Counter when inside an ordered list, false otherwise */
  order?: number | false
  /** Nesting depth for blockquote indentation */
  blockquoteDepth?: number

  [key: string]: unknown
}

export type ANSIState = {
  handlers: Record<string, ANSINodeHandler>
  context: ANSIContext
  flow: ANSINodeHandler
  one: (node: ComarkNode, state: ANSIState, parent?: ComarkElement) => string
  applyContext: (edit: Record<string, unknown>) => Record<string, unknown>
}
