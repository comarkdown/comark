import type { ComarkTree } from '../types.ts'

export type { ComarkTree }

/** Minimal subset of Vite's `import.meta.hot` API used by the devtools bridge */
export interface HotModule {
  send(event: string, data?: any): void
  on(event: string, cb: (...args: any[]) => void): void
}

/** A live Comark renderer instance tracked by the devtools registry */
export interface ComarkInstance {
  /** Unique instance identifier (e.g. `comark-1`) */
  id: string
  /** Human-readable label — typically the current page URL path or hash */
  label?: string
  /** Current parsed AST */
  tree: ComarkTree | { nodes: ComarkTree['nodes'] }
  /** Current markdown source (if available) */
  markdown?: string
}

/** Serializable snapshot of a {@link ComarkInstance} sent over RPC */
export interface ComarkInstanceSummary {
  id: string
  label?: string
  markdown?: string
  /** Total number of top-level AST nodes */
  nodeCount: number
}

/** Options accepted by {@link registerDevtoolsInstance} */
export interface RegisterInstanceOptions {
  /** The HMR handle (`import.meta.hot`). Pass `null` to skip registration. */
  hot: HotModule | null | undefined
  /** Initial tree (may be empty for string renderers) */
  tree: ComarkTree | { nodes: ComarkTree['nodes'] }
  /** Initial markdown source, if known */
  markdown?: string
}

/** Handles returned after a successful instance registration */
export interface RegisteredInstance {
  /** The assigned instance id */
  id: string
  /** Push an updated tree and/or markdown source to the devtools */
  update(patch: { tree?: ComarkTree | { nodes: ComarkTree['nodes'] }; markdown?: string }): void
  /** Remove the instance from the devtools registry */
  unregister(): void
}

/** Callback invoked whenever the set of tracked instances changes */
export type InstanceListener = (instances: Map<string, ComarkInstance>) => void

/** Active view in the devtools panel */
export type ViewState = 'loading' | 'empty' | 'markdown' | 'ast-error' | 'ast'

/** Color scheme preference for the devtools panel UI */
export type Theme = 'auto' | 'light' | 'dark'
