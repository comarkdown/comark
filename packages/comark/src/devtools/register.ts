import type { ComarkInstance, RegisterInstanceOptions, RegisteredInstance } from './types.ts'

/**
 * Register a Comark devtools instance.
 *
 * Handles the full lifecycle:
 * 1. Dynamic import of the registry (keeps it tree-shakable in prod)
 * 2. HMR connection
 * 3. Instance registration
 * 4. Returns update/unregister handles
 *
 * @returns A promise resolving to the registered instance handles,
 * or `null` if HMR is not available.
 */
export async function registerDevtoolsInstance(options: RegisterInstanceOptions): Promise<RegisteredInstance | null> {
  if (!options.hot) return null

  const { getDevtoolsRegistry } = await import('./registry.ts')
  const registry = getDevtoolsRegistry()
  registry.connectHMR(options.hot)

  const id = registry.nextId()

  const label = typeof location !== 'undefined' ? location.hash || location.pathname : undefined

  const instance: ComarkInstance = {
    id,
    label,
    tree: options.tree,
    markdown: options.markdown,
    onUpdate: options.onUpdate,
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
  options: Omit<RegisterInstanceOptions, 'markdown'>
): Promise<RegisteredInstance | null> {
  if (!options.hot) return null

  const { renderMarkdown } = await import('../render.ts')
  const markdown = await renderMarkdown(options.tree)

  return registerDevtoolsInstance({ ...options, markdown })
}
