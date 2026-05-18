import type { ComarkPluginFactory } from '../types.ts'

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
