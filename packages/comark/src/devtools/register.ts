import type { ComarkTree } from '../types.ts'
import type { ComarkInstance } from './registry.ts'

/** Minimal subset of Vite's `import.meta.hot` used by the helper */
interface HotHandle {
  send(event: string, data?: any): void
  on(event: string, cb: (...args: any[]) => void): void
}

export interface RegisterInstanceOptions {
  /** The HMR handle (`import.meta.hot`). Pass `null` to skip registration. */
  hot: HotHandle | null | undefined
  /** Initial tree (may be empty for string renderers) */
  tree: ComarkTree
  /** Initial markdown source, if known */
  markdown?: string
  /** Callback invoked when the playground pushes an edit */
  onUpdate?: (markdown: string) => void
}

export interface RegisteredInstance {
  /** The assigned instance id */
  id: string
  /** Update the instance's tree and/or markdown */
  update(patch: { tree?: ComarkTree, markdown?: string }): void
  /** Unregister the instance */
  unregister(): void
}

/**
 * Shared helper for registering a Comark devtools instance.
 *
 * Handles the full lifecycle:
 * 1. Dynamic import of the registry (keeps it tree-shakable in prod)
 * 2. HMR connection
 * 3. Instance registration
 * 4. Returns update/unregister handles
 *
 * @returns A promise that resolves to the registered instance handles,
 *          or `null` if HMR is not available.
 *
 * @example
 * ```ts
 * // In a framework renderer
 * const _hot = (import.meta as any).hot
 * const inst = await registerDevtoolsInstance({
 *   hot: _hot,
 *   tree,
 *   markdown,
 *   onUpdate: (md) => { source.value = md },
 * })
 * // Later: inst?.update({ tree: newTree, markdown: newMd })
 * // Cleanup: inst?.unregister()
 * ```
 */
export async function registerDevtoolsInstance(
  options: RegisterInstanceOptions,
): Promise<RegisteredInstance | null> {
  if (!options.hot) return null

  const { getDevtoolsRegistry } = await import('./registry.ts')
  const registry = getDevtoolsRegistry()
  registry.connectHMR(options.hot)

  const id = registry.nextId()

  const instance: ComarkInstance = {
    id,
    el: null as any,
    tree: options.tree,
    markdown: options.markdown,
  }

  if (options.onUpdate) {
    instance.update = options.onUpdate
  }

  const unregister = registry.register(instance)

  return {
    id,
    update(patch) {
      registry.update(id, patch)
    },
    unregister,
  }
}

/**
 * Convenience: register an instance and reverse-render the tree to markdown.
 * Used by renderers that only have a tree (no original markdown source).
 */
export async function registerDevtoolsInstanceFromTree(
  options: Omit<RegisterInstanceOptions, 'markdown'>,
): Promise<RegisteredInstance | null> {
  if (!options.hot) return null

  const { renderMarkdown } = await import('../render.ts')
  const markdown = await renderMarkdown(options.tree)

  return registerDevtoolsInstance({ ...options, markdown })
}
