import type { ComarkElement, ComarkNode, ComarkTree } from './types.ts'

// #region patches

/**
 * A patch describes a surgical mutation of a {@link ComarkTree}.
 *
 * `path` is a node index path into `tree.nodes`: the first segment indexes
 * into `tree.nodes`, each subsequent segment indexes into the *children* of
 * the addressed element. Because `ComarkElement` is `[tag, attrs, ...children]`,
 * child index `i` is resolved against array slot `i + 2` internally — callers
 * always work in plain child indices.
 *
 * @example `{ op: 'replace', path: [2, 0], node: 'updated' }`
 * replaces the first child of the third top-level node.
 */
export type ComarkPatch =
  | { op: 'replace'; path: number[]; node: ComarkNode }
  | { op: 'insert'; path: number[]; node: ComarkNode }
  | { op: 'remove'; path: number[] }
  | { op: 'meta'; meta: Record<string, unknown> }
  | { op: 'frontmatter'; frontmatter: Record<string, unknown> }
  | { op: 'data'; data: Record<string, unknown> }

function emptyTree(): ComarkTree {
  return { nodes: [], frontmatter: {}, meta: {} }
}

/**
 * Apply a node-level patch to a node list, returning a **new** list with
 * structural sharing: only the arrays along `path` are cloned, untouched
 * siblings and branches keep their references so framework identity checks
 * only re-render what actually changed.
 */
function patchNodeList(nodes: ComarkNode[], path: number[], patch: ComarkPatch): ComarkNode[] {
  const [index, ...rest] = path
  const next = nodes.slice()

  if (rest.length === 0) {
    if (patch.op === 'replace') {
      if (index < 0 || index >= next.length) {
        throw new Error(`Comark patch: cannot replace out-of-range index [${index}]`)
      }
      next[index] = patch.node
    } else if (patch.op === 'insert') {
      next.splice(index, 0, patch.node)
    } else if (patch.op === 'remove') {
      if (index < 0 || index >= next.length) {
        throw new Error(`Comark patch: cannot remove out-of-range index [${index}]`)
      }
      next.splice(index, 1)
    }
    return next
  }

  const target = next[index]
  if (!Array.isArray(target) || target[0] === null) {
    throw new Error(`Comark patch: path segment [${index}] does not point to an element`)
  }
  const element = target as ComarkElement
  const children = element.slice(2) as ComarkNode[]
  next[index] = [element[0], element[1], ...patchNodeList(children, rest, patch)] as ComarkElement
  return next
}

function applyPatch(current: ComarkTree, patch: ComarkPatch): ComarkTree {
  switch (patch.op) {
    case 'meta':
      return { ...current, meta: { ...current.meta, ...patch.meta } }
    case 'frontmatter':
      return { ...current, frontmatter: { ...current.frontmatter, ...patch.frontmatter } }
    case 'data':
      // @ts-expect-error - patch.data is a plain object
      return { ...current, data: { ...current.data, ...patch.data } }
    default: {
      if (!patch.path.length) {
        throw new Error(`Comark patch "${patch.op}" requires a non-empty path`)
      }
      return { ...current, nodes: patchNodeList(current.nodes, patch.path, patch) }
    }
  }
}

// #endregion

// #region ComarkDocument

/** A single live document: the per-id handle returned by `context.get(id)`. */
export interface ComarkDocument {
  /** The current tree. Replaced wholesale on `set`, structurally on `patch`. */
  readonly tree: ComarkTree
  /** Replace the whole tree (e.g. an HMR re-parse or an agent rewrite). */
  set(tree: ComarkTree): void
  /** Apply one or more patches against the current tree (structural sharing). */
  patch(patch: ComarkPatch | ComarkPatch[]): void
  /**
   * Subscribe to tree changes. Returns the cleanup function.
   *
   * Pass `{ sticky: true }` for system subscribers (e.g. the Vite DevTools bridge)
   * that must survive a renderer's `cleanup(true)` — sticky listeners are never
   * bulk-cleared and do not keep a document alive on their own once every normal
   * listener is gone.
   */
  listen(fn: (tree: ComarkTree) => void, options?: { sticky?: boolean }): (clear?: boolean) => void
}

function createDocument(initial: ComarkTree, onEmpty: (tree: ComarkTree) => void): ComarkDocument {
  let tree = initial
  const listeners = new Set<(tree: ComarkTree) => void>()
  const sticky = new Set<(tree: ComarkTree) => void>()
  const emit = () => {
    listeners.forEach((fn) => fn(tree))
    sticky.forEach((fn) => fn(tree))
  }
  const pruneIfEmpty = () => {
    // Sticky-only docs still prune — system subscribers shouldn't pin documents
    // that no renderer cares about anymore.
    if (listeners.size === 0) onEmpty(tree)
  }
  return {
    get tree() {
      return tree
    },
    set(next) {
      tree = next
      emit()
    },
    patch(patch) {
      const patches = Array.isArray(patch) ? patch : [patch]
      for (const p of patches) tree = applyPatch(tree, p)
      emit()
    },
    listen(fn, options) {
      const bucket = options?.sticky ? sticky : listeners
      bucket.add(fn)
      return (clear = false) => {
        if (options?.sticky) {
          // Sticky unsub never prunes — the document is already empty of
          // normal listeners (or still in use). Pruning from here races the
          // lifecycle 'remove' handler that is tearing the sticky down.
          sticky.delete(fn)
          return
        }
        if (!listeners.has(fn) && !clear) return

        if (clear) {
          // Drop every normal listener (renderers); sticky system listeners stay.
          listeners.clear()
        } else {
          listeners.delete(fn)
        }
        pruneIfEmpty()
      }
    },
  }
}

// #endregion

// #region ComarkContext

/**
 * Ambient registry a `ComarkRenderer` subscribes to so external sources can
 * drive a mounted document by `id`. A renderer calls `get(id).listen(fn)` on
 * mount and the returned cleanup on unmount; drivers (HMR, devtools, collab,
 * agents) call `get(id).set` / `.patch` to push new trees to every renderer
 * with that id.
 *
 * The context is opt-in: a renderer only wires up when `globalThis.comarkContext`
 * exists, so it costs one global lookup when absent and tree-shakes out of any
 * build that never sets it.
 */
/** Document lifecycle event emitted by the context. */
export interface ComarkContextEvent {
  event: 'create' | 'remove'
  id: string
  tree: ComarkTree
}

export interface ComarkContext {
  /** Get the document for `id`, creating it (with `initial`) on first access. */
  get(id: string, initial?: ComarkTree): ComarkDocument
  /**
   * Ensure a document for `id` exists and is seeded. Like {@link get}, but if the
   * document already exists and `initial` is provided, its tree is replaced when
   * the current tree is empty (devtools auto-ids that race the first parse).
   */
  ensure(id: string, initial?: ComarkTree): ComarkDocument
  /** Ids currently tracked — for devtools enumeration. */
  keys(): string[]
  /** Listen for documents being created or removed. Returns the cleanup. */
  listen(fn: (e: ComarkContextEvent) => void): () => void
}

declare global {
  // eslint-disable-next-line no-var
  var comarkContext: ComarkContext | undefined
}

/**
 * Create a {@link ComarkContext} and (by default) install it on
 * `globalThis.comarkContext`. Returns the context.
 */
export function createComarkContext(install = true): ComarkContext {
  if (install && globalThis.comarkContext) {
    return globalThis.comarkContext
  }

  const docs = new Map<string, ComarkDocument>()
  const lifecycle = new Set<(e: ComarkContextEvent) => void>()
  const emit = (e: ComarkContextEvent) => lifecycle.forEach((fn) => fn(e))

  const create = (id: string, initial?: ComarkTree): ComarkDocument => {
    const doc = createDocument(initial ?? emptyTree(), (tree) => {
      // Idempotent: sticky teardown after a renderer prune must not re-emit.
      if (!docs.delete(id)) return
      emit({ event: 'remove', id, tree })
    })
    docs.set(id, doc)
    emit({ event: 'create', id, tree: doc.tree })
    return doc
  }

  const ctx: ComarkContext = {
    get(id, initial) {
      return docs.get(id) ?? create(id, initial)
    },
    ensure(id, initial) {
      const existing = docs.get(id)
      if (!existing) return create(id, initial)
      // Re-seed empty docs (e.g. auto-id reserved before parse finished).
      if (initial && existing.tree.nodes.length === 0 && initial.nodes.length > 0) {
        existing.set(initial)
      }
      return existing
    },
    keys: () => [...docs.keys()],
    listen(fn) {
      lifecycle.add(fn)
      return () => lifecycle.delete(fn)
    },
  }
  if (install) globalThis.comarkContext = ctx

  return ctx
}

// #endregion

// #region renderer helper

/** Allocate a short unique id for auto-registered renderer documents. */
let __comarkAutoId = 0
function nextDocumentId(): string {
  return `comark-${++__comarkAutoId}`
}

/** Handle returned by {@link subscribeComarkDocument}. */
export interface ComarkDocumentSubscription {
  /** Document id in the ambient context. */
  id: string
  /** Push a new tree into the document (e.g. when the renderer's `tree` prop changes). */
  set(tree: ComarkTree | { nodes: ComarkTree['nodes'] }): void
  /** Unsubscribe. Pass `true` to clear sibling listeners and prune the document. */
  cleanup(clear?: boolean): void
}

function asTree(tree: ComarkTree | { nodes: ComarkTree['nodes'] }): ComarkTree {
  return {
    nodes: tree.nodes || [],
    frontmatter: (tree as ComarkTree).frontmatter || {},
    meta: (tree as ComarkTree).meta || {},
  }
}

/**
 * Subscribe a mounted renderer to the ambient `globalThis.comarkContext`.
 *
 * - If `comarkKey` or `tree.meta.key` is set, uses that id.
 * - Otherwise, when a context exists (e.g. Vite DevTools installed one),
 *   allocates an auto id so the instance still shows up in the panel.
 * - No-op (returns `null`) when no context is present — zero cost in prod.
 */
export function subscribeComarkDocument(
  tree: ComarkTree | { nodes: ComarkTree['nodes'] },
  comarkKey: string | undefined,
  onTree: (tree: ComarkTree) => void
): ComarkDocumentSubscription | null {
  const ctx = globalThis.comarkContext
  if (!ctx) return null

  const seed = asTree(tree)
  const id = seed.meta?.key || comarkKey || nextDocumentId()
  const doc = ctx.ensure(id, seed)
  const unsub = doc.listen(onTree)

  return {
    id,
    set(next) {
      doc.set(asTree(next))
    },
    cleanup(clear) {
      unsub(clear)
    },
  }
}

// #endregion
