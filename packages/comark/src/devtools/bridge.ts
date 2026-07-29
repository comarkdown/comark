import { createComarkContext } from '../context.ts'
import { renderMarkdown } from '../render.ts'
import type { ComarkInstanceSummary, HotModule, ComarkTree } from './types.ts'

/**
 * Bridge between `globalThis.comarkContext` and the Vite DevTools panel.
 *
 * Renderers never talk to devtools directly — they only subscribe to the ambient
 * context via `comarkKey` / `meta.key`. This bridge:
 * 1. Ensures a context is installed (so renderers have something to subscribe to)
 * 2. Pushes live document summaries to the Vite server over HMR
 * 3. Applies panel edits back onto the matching document via `doc.set`
 */
class ComarkDevtoolsBridge {
  private hot: HotModule | null = null
  private unsubs = new Map<string, () => void>()
  private markdownCache = new Map<string, string>()
  private pushTimer: ReturnType<typeof setTimeout> | null = null
  private connected = false
  /** True while applying a panel-originated update so we keep its markdown cache. */
  private applyingPanelUpdate = false

  /**
   * Provide the caller's `import.meta.hot` handle and start mirroring the ambient
   * context. Safe to call multiple times — subsequent calls only refresh the HMR handle.
   */
  connect(hot: HotModule): void {
    this.hot = hot
    // Always re-bind the update listener so HMR module disposal can't leave us deaf.
    hot.on('comark:update', (data: { id: string; markdown: string; tree: ComarkTree }) => {
      const ctx = globalThis.comarkContext
      // Only push into documents that still have a mounted renderer — don't
      // resurrect pruned ids as sticky-only zombies.
      if (!ctx || !ctx.keys().includes(data.id)) return
      // Panel edit — cache the authoritative source markdown, push the tree.
      if (data.markdown) this.markdownCache.set(data.id, data.markdown)
      this.applyingPanelUpdate = true
      try {
        ctx.get(data.id).set(data.tree)
      } finally {
        this.applyingPanelUpdate = false
      }
    })

    if (this.connected) {
      this.schedulePush()
      return
    }
    this.connected = true

    const ctx = createComarkContext(true)

    // Track documents that already exist (e.g. seeded before the bridge connected).
    for (const id of ctx.keys()) this.track(id)

    ctx.listen((e) => {
      if (e.event === 'create') {
        this.track(e.id)
      } else {
        // Drop sticky tracking without calling unsub→prune (doc is already gone).
        const unsub = this.unsubs.get(e.id)
        this.unsubs.delete(e.id)
        this.markdownCache.delete(e.id)
        // Detach sticky listener only — must not re-enter prune/lifecycle.
        unsub?.()
      }
      this.schedulePush()
    })

    this.schedulePush()
  }

  private track(id: string): void {
    if (this.unsubs.has(id)) return
    const ctx = globalThis.comarkContext
    if (!ctx) return
    // Per-doc tree changes refresh the panel. App-side set/patch invalidate the
    // reverse-rendered markdown; panel edits keep the cached source.
    // Sticky so a renderer's cleanup(true) can't wipe the bridge subscription.
    const unsub = ctx.get(id).listen(
      () => {
        if (!this.applyingPanelUpdate) this.markdownCache.delete(id)
        this.schedulePush()
      },
      { sticky: true }
    )
    this.unsubs.set(id, () => unsub())
  }

  /** Debounce pushes — a burst of patches should only serialize once. */
  private schedulePush(): void {
    if (this.pushTimer) return
    this.pushTimer = setTimeout(() => {
      this.pushTimer = null
      void this.push()
    }, 0)
  }

  private async push(): Promise<void> {
    const ctx = globalThis.comarkContext
    if (!ctx || !this.hot) return

    const keys = ctx.keys()
    const label = typeof location !== 'undefined' ? location.hash || location.pathname : undefined
    const data: ComarkInstanceSummary[] = []

    for (const id of keys) {
      const tree = ctx.get(id).tree
      let markdown = this.markdownCache.get(id)
      if (markdown === undefined) {
        try {
          markdown = await renderMarkdown(tree)
          this.markdownCache.set(id, markdown)
        } catch {
          markdown = undefined
        }
      }
      data.push({
        id,
        label,
        markdown,
        nodeCount: tree?.nodes?.length || 0,
      })
    }

    for (const cached of [...this.markdownCache.keys()]) {
      if (!keys.includes(cached)) this.markdownCache.delete(cached)
    }

    this.hot.send('comark:instances', data)
  }
}

function getBridge(): ComarkDevtoolsBridge {
  const g = globalThis as any
  if (!g.__COMARK_DEVTOOLS__) {
    g.__COMARK_DEVTOOLS__ = new ComarkDevtoolsBridge()
  }
  return g.__COMARK_DEVTOOLS__
}

/**
 * Connect the ambient context to Vite HMR for the DevTools panel.
 * Injected automatically by `comarkDevtools()` via the client entry.
 */
export function connectDevtools(hot: HotModule | null | undefined): void {
  if (!hot) return
  getBridge().connect(hot)
}
