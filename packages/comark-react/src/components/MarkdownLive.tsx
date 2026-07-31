'use client'

import { useEffect, useState } from 'react'
import type { MarkdownTree } from 'comark'
import { MarkdownParsed, type MarkdownParsedProps } from './MarkdownParsed.tsx'

export interface MarkdownLiveProps extends MarkdownParsedProps {
  /**
   * Document key used to subscribe to live updates via `globalThis.comarkContext`.
   * Falls back to the tree's own `meta.key` when set by a plugin.
   */
  comarkKey?: string
}

/**
 * Client wrapper around {@link MarkdownParsed} that subscribes to live document
 * updates via `globalThis.comarkContext` and re-renders with the pushed tree.
 *
 * Use this when you need live updates. `MarkdownParsed` itself stays free of
 * client-only hooks so it can render in a React Server Component.
 *
 * @example
 * ```tsx
 * // In a Server Component — render statically, hydrate for live updates:
 * import { MarkdownLive } from '@comark/react'
 *
 * export default async function Page() {
 *   const tree = await parse(markdown)
 *   return <MarkdownLive value={tree} comarkKey="my-doc" components={{ Alert }} />
 * }
 * ```
 */
export function MarkdownLive({ value, tree: treeProp, comarkKey, ...rest }: MarkdownLiveProps) {
  const tree = value ?? treeProp ?? { nodes: [] }
  // Live document support: if an ambient context exists, subscribe to updates
  // for this key and re-render with the pushed tree. Cleaned up on unmount.
  // The key is the tree's own `meta.key` (set by a plugin) or the `comarkKey` prop.
  const [liveTree, setLiveTree] = useState<MarkdownTree | null>(null)
  const key = (tree as MarkdownTree).meta?.key || comarkKey
  useEffect(() => {
    if (!key || !globalThis.comarkContext) return
    const cleanup = globalThis.comarkContext.get(key, tree as MarkdownTree).listen(setLiveTree)
    return () => cleanup(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return (
    <MarkdownParsed
      {...rest}
      value={liveTree ?? tree}
    />
  )
}
