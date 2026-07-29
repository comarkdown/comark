import type { ComarkTree } from '../types.ts'

export type { ComarkTree }

/** Minimal subset of Vite's `import.meta.hot` API used by the devtools bridge */
export interface HotModule {
  send(event: string, data?: any): void
  on(event: string, cb: (...args: any[]) => void): void
}

/** Serializable snapshot of a live document, pushed over HMR / RPC to the panel */
export interface ComarkInstanceSummary {
  id: string
  label?: string
  markdown?: string
  /** Current tree — included so the panel can show AST without a round-trip parse. */
  tree?: ComarkTree
  /** Total number of top-level AST nodes */
  nodeCount: number
}

/** Active view in the devtools panel */
export type ViewState = 'loading' | 'empty' | 'markdown' | 'ast-error' | 'ast'

/** Color scheme preference for the devtools panel UI */
export type Theme = 'auto' | 'light' | 'dark'
