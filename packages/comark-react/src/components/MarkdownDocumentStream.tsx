'use client'

import { useEffect, useMemo, useState } from 'react'
import { createStreamRenderer, getChildKeys, resolveStreamEffects } from 'comark/stream'
import { renderDocumentNodes, type MarkdownDocumentProps } from './MarkdownDocument.tsx'

/**
 * Client renderer behind {@link MarkdownDocument} when `caret`, `fade`, or `effects` are set. It keeps
 * per-instance effect state and re-renders on animation frames while paced effects drain.
 */
export function MarkdownDocumentStream(props: MarkdownDocumentProps): React.ReactNode {
  const {
    value,
    components,
    componentsManifest,
    streaming = false,
    caret = false,
    fade = false,
    effects,
    data,
    transformNode,
    className,
    ...rest
  } = props

  const [stream] = useState(() => createStreamRenderer())
  // Paced effects release text on a clock, so keep re-rendering until their backlog is empty.
  const [frame, setFrame] = useState(0)
  // Effects keep caches between renders, so rebuild them only when their props change, not every frame.
  const resolvedEffects = useMemo(() => resolveStreamEffects({ caret, fade, effects }), [caret, fade, effects])

  const rendered = useMemo(() => {
    const nodes = stream.render(value?.nodes || [], {
      streaming,
      effects: resolvedEffects,
    })
    return {
      pending: stream.pending(),
      nodes: renderDocumentNodes(
        nodes,
        { value, components, componentsManifest, data, transformNode },
        getChildKeys(nodes)
      ),
    }
  }, [stream, value, components, componentsManifest, streaming, resolvedEffects, data, transformNode, frame])

  useEffect(() => {
    if (!rendered.pending) return
    const id = requestAnimationFrame(() => setFrame((n) => n + 1))
    return () => cancelAnimationFrame(id)
  }, [rendered])

  return (
    <div
      {...rest}
      className={`comark-content ${className || ''}`}
    >
      {rendered.nodes}
    </div>
  )
}
