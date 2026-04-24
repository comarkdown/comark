import type { ComarkTree } from '../types.ts'

/** Minimal subset of Vite's `import.meta.hot` API used by the registry */
interface HotModule {
  send(event: string, data?: any): void
  on(event: string, cb: (...args: any[]) => void): void
}

export interface ComarkInstance {
  /** Unique instance identifier */
  id: string
  /** The DOM element wrapping this instance */
  el: HTMLElement | null
  /** Current parsed tree */
  tree: ComarkTree
  /** Current markdown source (if available — only set by high-level Comark components) */
  markdown?: string
  /** Callback to update the markdown source and trigger re-parse */
  update?: (markdown: string) => void
}

export interface ComarkInstanceSummary {
  id: string
  markdown?: string
  nodeCount: number
}

type InstanceListener = (instances: Map<string, ComarkInstance>) => void

let counter = 0

class ComarkDevtoolsRegistry {
  readonly instances = new Map<string, ComarkInstance>()
  private listeners = new Set<InstanceListener>()
  private hot: HotModule | null = null

  nextId(): string {
    return `comark-${++counter}`
  }

  /**
   * Provide the caller's `import.meta.hot` handle so the registry can
   * push instance data to the Vite dev server and receive updates.
   * Call this once from the first renderer that mounts.
   */
  connectHMR(hot: HotModule): void {
    if (this.hot) return
    this.hot = hot

    // Listen for update requests from the dev server (relayed from the playground)
    hot.on('comark:update', (data: { id: string, markdown: string }) => {
      const instance = this.instances.get(data.id)
      if (instance?.update) {
        instance.update(data.markdown)
      }
    })
  }

  register(instance: ComarkInstance): () => void {
    this.instances.set(instance.id, instance)
    this.notify()
    return () => {
      this.instances.delete(instance.id)
      this.notify()
    }
  }

  update(id: string, patch: Partial<Omit<ComarkInstance, 'id'>>): void {
    const instance = this.instances.get(id)
    if (!instance) return
    Object.assign(instance, patch)
    this.notify()
  }

  subscribe(listener: InstanceListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  serialize(): ComarkInstanceSummary[] {
    return Array.from(this.instances.values()).map(inst => ({
      id: inst.id,
      markdown: inst.markdown,
      nodeCount: inst.tree?.nodes?.length || 0,
    }))
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.instances)
    }
    this.pushToHMR()
  }

  private pushToHMR(): void {
    const data = this.serialize()
    this.hot?.send('comark:instances', data)
  }
}

/**
 * Global devtools registry. Only active in dev mode — renderers should
 * guard registration behind `import.meta.hot` or `import.meta.env.DEV`.
 */
export function getDevtoolsRegistry(): ComarkDevtoolsRegistry {
  const g = globalThis as any
  if (!g.__COMARK_DEVTOOLS__) {
    g.__COMARK_DEVTOOLS__ = new ComarkDevtoolsRegistry()
  }
  return g.__COMARK_DEVTOOLS__
}
