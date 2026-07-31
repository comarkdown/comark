import type { MarkdownElement, ComarkNode, MarkdownTree } from './types.ts'

// #region patches

/**
 * A patch describes a surgical mutation of a {@link MarkdownTree}.
 *
 * `path` is a node index path into `tree.nodes`: the first segment indexes
 * into `tree.nodes`, each subsequent segment indexes into the *children* of
 * the addressed element. Because `MarkdownElement` is `[tag, attrs, ...children]`,
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

function emptyTree(): MarkdownTree {
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
  const element = target as MarkdownElement
  const children = element.slice(2) as ComarkNode[]
  next[index] = [element[0], element[1], ...patchNodeList(children, rest, patch)] as MarkdownElement
  return next
}

function applyPatch(current: MarkdownTree, patch: ComarkPatch): MarkdownTree {
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
  readonly tree: MarkdownTree
  /** Replace the whole tree (e.g. an HMR re-parse or an agent rewrite). */
  set(tree: MarkdownTree): void
  /** Apply one or more patches against the current tree (structural sharing). */
  patch(patch: ComarkPatch | ComarkPatch[]): void
  /** Subscribe to tree changes. Returns the cleanup function. */
  listen(fn: (tree: MarkdownTree) => void): (clear?: boolean) => void
}

function createDocument(initial: MarkdownTree, onEmpty: (tree: MarkdownTree) => void): ComarkDocument {
  let tree = initial
  const listeners = new Set<(tree: MarkdownTree) => void>()
  const emit = () => listeners.forEach((fn) => fn(tree))
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
    listen(fn) {
      listeners.add(fn)
      return (clear = false) => {
        if (!listeners.has(fn)) {
          return
        }

        if (clear) {
          listeners.clear()
        } else {
          listeners.delete(fn)
        }
        // Drop the document once nobody is listening — frees ids on unmount.
        if (listeners.size === 0) onEmpty(tree)
      }
    },
  }
}

// #endregion

// #region ComarkContext

/**
 * Ambient registry a `MarkdownParsed` renderer subscribes to so external sources can
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
  tree: MarkdownTree
}

export interface ComarkContext {
  /** Get the document for `id`, creating it (with `initial`) on first access. */
  get(id: string, initial?: MarkdownTree): ComarkDocument
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

  const ctx: ComarkContext = {
    get(id, initial) {
      let doc = docs.get(id)
      if (!doc) {
        docs.set(
          id,
          (doc = createDocument(initial ?? emptyTree(), (tree) => {
            docs.delete(id)
            emit({ event: 'remove', id, tree })
          }))
        )
        emit({ event: 'create', id, tree: doc.tree })
      }
      return doc
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
