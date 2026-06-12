import type { ComarkInstance, ComarkInstanceSummary, HotModule, InstanceListener, ComarkTree } from './types.ts'

/**
 * Singleton registry tracking all live Comark instances in the browser.
 *
 * Instances are registered by framework renderers (Vue, React, Svelte) and
 * their data is pushed to the Vite dev server over HMR for the devtools panel.
 */
class ComarkDevtoolsRegistry {
  readonly instances = new Map<string, ComarkInstance>()
  private listeners = new Set<InstanceListener>()
  private hot: HotModule | null = null
  private counter = 0

  /** Generate the next sequential instance id (e.g. `comark-1`, `comark-2`) */
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
    // Listen for updates sent from devtools
    hot.on('comark:update', (data: { id: string; markdown: string; tree: ComarkTree }) => {
      const instance = this.instances.get(data.id)
      if (instance) {
        instance.markdown = data.markdown
        if (data.tree) instance.tree = data.tree
        instance.onUpdate?.(data.markdown, data.tree as any)
        // Notify listeners but skip pushing back to HMR to avoid loops
        for (const listener of this.listeners) {
          listener(this.instances)
        }
      }
    })
  }

  /** Add an instance to the registry and return an unregister callback */
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

  /** Merge a partial update into an existing instance's data */
  update(id: string, patch: Partial<Omit<ComarkInstance, 'id'>>): void {
    const instance = this.instances.get(id)
    if (!instance) return
    Object.assign(instance, patch)
    this.notify()
  }

  /** Subscribe to instance changes; returns an unsubscribe callback */
  subscribe(listener: InstanceListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /** Serialize all instances into lightweight summaries for RPC transport */
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
