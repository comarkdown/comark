import type { ComarkPluginFactory } from '../types.ts'

/**
 * Returns a function that invokes `fn` **strictly one at a time**: each call waits until the
 * previous invocation has settled (resolved or rejected) before starting the next.
 */
export function createSerializedTask<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
): (...args: TArgs) => Promise<TResult> {
  let chain: Promise<TResult> = Promise.resolve(null as TResult)
  return (...args: TArgs) => {
    chain = chain
      .then(() => fn(...args))
      .catch(() => null as TResult)
    return chain
  }
}

// #region define plugin

/**
 * Define a Comark plugin
 * @param fn - The plugin factory function
 * @returns The defined plugin
 */
export function defineComarkPlugin<Options>(fn: ComarkPluginFactory<Options>): ComarkPluginFactory<Options> {
  return fn
}

// #endregion
