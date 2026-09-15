import { get, set } from './utils/index.ts'

// #region ComarkModel protocol

/**
 * Framework-agnostic two-way data binding protocol.
 *
 * Core defines this interface; renderers bridge it to native reactivity
 * (`shallowRef`, `useSyncExternalStore`, `signal`, `$state`). A host that
 * already has a reactive store can pass its own implementation — ~10 lines —
 * instead of using {@link createModelStore}.
 */
export interface ComarkModel {
  /** Read a dot-path. Same resolution rules as the existing `get()`. */
  get(path: string): unknown
  /**
   * Write a dot-path. Returns `false` when the path is outside the writable
   * namespaces or would cause prototype pollution.
   */
  set(path: string, value: unknown): boolean
  /**
   * Subscribe to a path. A write to `data.a.b` notifies subscribers of
   * `data.a.b`, `data.a`, and `data`. A subscriber of `data.a.b` is not
   * notified when an ancestor (`data.a`) is written. Returns the teardown
   * function.
   */
  subscribe(path: string, fn: (value: unknown) => void): () => void
  /** Optional: coalesce several writes into one notification batch. */
  batch?<T>(fn: () => T): T
}

// #endregion

// #region createModelStore

export interface ModelStoreOptions {
  /** Initial value for the writable namespace(s). */
  data?: Record<string, unknown>
  /**
   * Top-level namespace keys that accept writes.
   * @default ['data']
   */
  writable?: readonly string[]
  /**
   * Called after every accepted write with the path, the new scalar value,
   * and the entire current data snapshot. Use this for persistence or
   * controlled-mode observation.
   */
  onChange?: (path: string, value: unknown, next: Record<string, unknown>) => void
  /**
   * When set, every accepted write is also pushed as a `{ op: 'data' }` patch
   * into `globalThis.comarkContext` under this document key. Allows
   * `MarkdownLive` subscribers to see model writes via the existing context
   * transport without a separate data channel.
   */
  documentKey?: string
}

/**
 * Create a per-instance, dependency-free {@link ComarkModel}.
 *
 * Subscribers are keyed by path. A write to `data.a.b` notifies subscribers
 * of `data.a.b`, `data.a`, and `data` — nothing else (N4). The store holds
 * no module-scoped state (N3): every call returns an independent instance.
 */
export function createModelStore(options: ModelStoreOptions = {}): ComarkModel {
  const writable = new Set(options.writable ?? ['data'])
  const incoming = options.data ?? {}
  const data: Record<string, unknown> = {}
  for (const key of Object.keys(incoming)) {
    const value = incoming[key]
    data[key] =
      value !== null && typeof value === 'object' && !Array.isArray(value)
        ? { ...(value as Record<string, unknown>) }
        : value
  }

  // path → set of listener functions
  const listeners = new Map<string, Set<(value: unknown) => void>>()

  let batching = false
  const pendingNotifications = new Map<string, unknown>()

  const notify = (path: string, value: unknown) => {
    if (batching) {
      // Collect at every ancestor; last write wins within the batch.
      const segments = path.split('.')
      for (let i = segments.length; i >= 1; i--) {
        const ancestor = segments.slice(0, i).join('.')
        pendingNotifications.set(ancestor, i === segments.length ? value : get(data, ancestor))
      }
      return
    }
    // Notify the path and every ancestor prefix.
    const segments = path.split('.')
    for (let i = segments.length; i >= 1; i--) {
      const ancestor = segments.slice(0, i).join('.')
      const fns = listeners.get(ancestor)
      if (fns) {
        const ancestorValue = i === segments.length ? value : get(data, ancestor)
        for (const fn of fns) fn(ancestorValue)
      }
    }
  }

  const flushBatch = () => {
    for (const [p, v] of pendingNotifications) {
      const fns = listeners.get(p)
      if (fns) for (const fn of fns) fn(v)
    }
    pendingNotifications.clear()
  }

  const model: ComarkModel = {
    get(path) {
      return get(data, path)
    },

    set(path, value) {
      const namespace = path.split('.')[0]
      if (!writable.has(namespace)) return false
      const ok = set(data, path, value)
      if (!ok) return false

      // Bridge into globalThis.comarkContext when a documentKey was provided.
      // Patch the `data` namespace object (`{ name: 'Bob' }`), not the store
      // envelope (`{ data: { name: 'Bob' } }`), so document.data matches
      // renderData.data.
      if (options.documentKey && globalThis.comarkContext) {
        const payload =
          typeof data.data === 'object' && data.data !== null && !Array.isArray(data.data)
            ? { ...(data.data as Record<string, unknown>) }
            : { ...data }
        globalThis.comarkContext.get(options.documentKey).patch({ op: 'data', data: payload })
      }

      notify(path, value)
      options.onChange?.(path, value, data)
      return true
    },

    subscribe(path, fn) {
      let fns = listeners.get(path)
      if (!fns) {
        fns = new Set()
        listeners.set(path, fns)
      }
      fns.add(fn)
      return () => {
        fns!.delete(fn)
        if (fns!.size === 0) listeners.delete(path)
      }
    },

    batch(fn) {
      batching = true
      try {
        return fn()
      } finally {
        batching = false
        flushBatch()
      }
    },
  }

  return model
}

// #endregion
