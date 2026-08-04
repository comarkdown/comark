'use client'

import { useEffect, useState } from 'react'
import type { MarkdownDocument as MarkdownDocumentType } from 'comark'
import { MarkdownDocument, type MarkdownDocumentProps } from './MarkdownDocument.tsx'

export interface MarkdownLiveProps extends MarkdownDocumentProps {
  /**
   * Document key used to subscribe to live updates via `globalThis.comarkContext`.
   * Falls back to the document's own `meta.key` when set by a plugin.
   */
  documentKey?: string
}

/**
 * Client wrapper around {@link MarkdownDocument} that subscribes to live document
 * updates via `globalThis.comarkContext` and re-renders with the pushed document.
 *
 * Use this when you need live updates. `MarkdownDocument` itself stays free of
 * client-only hooks so it can render in a React Server Component.
 *
 * @example
 * ```tsx
 * // In a Server Component — render statically, hydrate for live updates:
 * import { MarkdownLive } from '@comark/react'
 *
 * export default async function Page() {
 *   const document = await parseMarkdown(markdown)
 *   return <MarkdownLive value={document} documentKey="my-doc" components={{ Alert }} />
 * }
 * ```
 */
export function MarkdownLive({ value, documentKey, ...rest }: MarkdownLiveProps) {
  const document = value ?? { nodes: [] }
  // Live document support: if an ambient context exists, subscribe to updates
  // for this key and re-render with the pushed document. Cleaned up on unmount.
  // The key is the document's own `meta.key` (set by a plugin) or the `documentKey` prop.
  const [liveDocument, setLiveDocument] = useState<MarkdownDocumentType | null>(null)
  const key = (document as MarkdownDocumentType).meta?.key || documentKey
  useEffect(() => {
    if (!key || !globalThis.comarkContext) return
    const cleanup = globalThis.comarkContext.get(key, document as MarkdownDocumentType).listen(setLiveDocument)
    return () => cleanup(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return (
    <MarkdownDocument
      {...rest}
      value={liveDocument ?? document}
    />
  )
}
