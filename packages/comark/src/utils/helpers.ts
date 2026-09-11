import type { ComarkPlugin, ComarkPluginFactory } from '../types.ts'

/**
 * Returns a function that invokes `fn` **strictly one at a time**: each call waits until the
 * previous invocation has settled (resolved or rejected) before starting the next.
 *
 * A rejection is handed to the caller that triggered it, and the queue keeps accepting calls.
 */
export function createSerializedTask<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>
): (...args: TArgs) => Promise<TResult> {
  let chain: Promise<unknown> = Promise.resolve()
  return (...args: TArgs) => {
    const result = chain.then(() => fn(...args))
    // Keep the queue alive after a failure, but let this caller see it.
    chain = result.catch(() => undefined)
    return result
  }
}

/**
 * Merge default and user plugins, deduplicating by name.
 *
 * User plugins replace same-name defaults and run after the remaining defaults.
 * The default list is expected to contain unique names. The first user plugin
 * with a given name wins.
 */
export function dedupePlugins(
  defaultPlugins: readonly ComarkPlugin<any, any>[],
  userPlugins: readonly ComarkPlugin<any, any>[]
): ComarkPlugin<any, any>[] {
  const plugins = new Map<string, ComarkPlugin<any, any>>()

  for (const plugin of defaultPlugins) {
    plugins.set(plugin.name, plugin)
  }

  const seenUserPlugins = new Set<string>()
  for (const plugin of userPlugins) {
    if (seenUserPlugins.has(plugin.name)) continue
    seenUserPlugins.add(plugin.name)
    // Reinsert overrides so they move from the default order to the user order.
    plugins.delete(plugin.name)
    plugins.set(plugin.name, plugin)
  }

  return [...plugins.values()]
}

// #region define plugin

/**
 * Define a Comark plugin.
 *
 * `TMeta` and `TFrontmatter` declare what the plugin contributes to
 * `tree.meta` / `tree.frontmatter`. They are inferred from the factory's
 * return type when set via the `__meta` / `__frontmatter` phantom markers,
 * or can be passed explicitly. Plugins that don't contribute typed keys can
 * omit them entirely.
 *
 * @example
 * ```ts
 * defineComarkPlugin<Options, { toc: Toc }>((opts) => ({
 *   name: 'toc',
 *   post(state) { state.tree.meta.toc = ... },
 * }))
 * ```
 */
export function defineComarkPlugin<Options, TMeta = {}, TFrontmatter = {}>(
  fn: ComarkPluginFactory<Options, TMeta, TFrontmatter>
): ComarkPluginFactory<Options, TMeta, TFrontmatter> {
  return fn
}

// #endregion
