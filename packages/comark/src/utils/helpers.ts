import type { ComarkPlugin, ComarkPluginFactory } from '../types.ts'

/**
 * Returns a function that invokes `fn` **strictly one at a time**: each call waits until the
 * previous invocation has settled (resolved or rejected) before starting the next.
 */
export function createSerializedTask<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>
): (...args: TArgs) => Promise<TResult> {
  let chain: Promise<TResult> = Promise.resolve(null as TResult)
  return (...args: TArgs) => {
    chain = chain.then(() => fn(...args)).catch(() => null as TResult)
    return chain
  }
}

/**
 * Remove duplicate plugins by name, keeping the first occurrence.
 */
export function dedupePlugins(plugins: ComarkPlugin<any, any>[]): ComarkPlugin<any, any>[] {
  const seen = new Set<string>()
  const result: ComarkPlugin<any, any>[] = []

  for (const plugin of plugins) {
    if (seen.has(plugin.name)) {
      continue
    }
    seen.add(plugin.name)
    result.push(plugin)
  }

  return result
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
