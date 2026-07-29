'use client'

import { useEffect, useRef, useState } from 'react'
import { subscribeComarkDocument, type ComarkDocumentSubscription, type ComarkTree } from 'comark'
import { ComarkRenderer, type ComarkRendererProps } from './ComarkRenderer.tsx'

export interface ComarkLiveProps extends ComarkRendererProps {
  /**
   * Document key used to subscribe to live updates via `globalThis.comarkContext`.
   * Falls back to the tree's own `meta.key` when set by a plugin.
   * When a context exists but no key is provided, an auto id is allocated so the
   * instance still appears in Vite DevTools.
   */
  comarkKey?: string
}

/**
 * Client wrapper around {@link ComarkRenderer} that subscribes to live document
 * updates via `globalThis.comarkContext` and re-renders with the pushed tree.
 *
 * Use this when you need live updates. `ComarkRenderer` itself stays free of
 * client-only hooks so it can render in a React Server Component.
 *
 * @example
 * ```tsx
 * // In a Server Component — render statically, hydrate for live updates:
 * import { ComarkLive } from '@comark/react'
 *
 * export default async function Page() {
 *   const tree = await parse(markdown)
 *   return <ComarkLive tree={tree} comarkKey="my-doc" components={{ Alert }} />
 * }
 * ```
 */
export function ComarkLive({ tree, comarkKey, ...rest }: ComarkLiveProps) {
  const [liveTree, setLiveTree] = useState<ComarkTree | null>(null)
  const subscriptionRef = useRef<ComarkDocumentSubscription | null>(null)

  useEffect(() => {
    const subscription = subscribeComarkDocument(tree as ComarkTree, comarkKey, setLiveTree)
    subscriptionRef.current = subscription
    return () => {
      subscription?.cleanup(true)
      subscriptionRef.current = null
    }
    // Resubscribe only when the document identity changes — prop tree updates
    // are pushed via subscription.set below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comarkKey, (tree as ComarkTree).meta?.key])

  // Keep the context document in sync when the parent re-parses.
  // Skip the first run — subscribe already seeded the document.
  const treeSyncedRef = useRef(false)
  useEffect(() => {
    if (!treeSyncedRef.current) {
      treeSyncedRef.current = true
      return
    }
    subscriptionRef.current?.set(tree as ComarkTree)
  }, [tree])

  return (
    <ComarkRenderer
      {...rest}
      tree={liveTree ?? tree}
    />
  )
}
