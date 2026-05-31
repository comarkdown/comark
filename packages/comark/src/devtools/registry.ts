import type { ComarkTree } from '../types.ts'

/** Minimal subset of Vite's `import.meta.hot` API used by the registry */
interface HotModule {
  send(event: string, data?: any): void
  on(event: string, cb: (...args: any[]) => void): void
}

export interface ComarkInstance {
  /** Unique instance identifier */
  id: string
  /** Human-readable label (e.g. current URL) */
  label?: string
  /** Current parsed tree */
  tree: ComarkTree
  /** Current markdown source (if available) */
  markdown?: string
}

export interface ComarkInstanceSummary {
  id: string
  label?: string
  markdown?: string
  nodeCount: number
}

type InstanceListener = (instances: Map<string, ComarkInstance>) => void

class ComarkDevtoolsRegistry {
  readonly instances = new Map<string, ComarkInstance>()
  private listeners = new Set<InstanceListener>()
  private hot: HotModule | null = null
  private counter = 0

  nextId(): string {
    return `comark-${++this.counter}`
  }

  /**
   * Provide the caller's `import.meta.hot` handle so the registry can
   * push instance data to the Vite dev server and receive updates.
   * Called by each renderer that mounts — always updates the handle
   * so the registry stays connected even after HMR module disposal.
   */
  connectHMR(hot: HotModule): void {
    this.hot = hot
  }

  register(instance: ComarkInstance): () => void {
    this.instances.set(instance.id, instance)
    this.notify()
    return () => {
      this.instances.delete(instance.id)
      // Reset counter when all instances are removed so IDs stay low
      if (this.instances.size === 0) {
        this.counter = 0
      }
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
    return Array.from(this.instances.values()).map((inst) => ({
      id: inst.id,
      label: inst.label,
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
