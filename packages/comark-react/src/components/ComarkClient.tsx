'use client'

import { use, useDeferredValue, useEffect, useMemo, useRef, Suspense } from 'react'
import { parse } from 'comark'
import type { ComarkTree } from 'comark'
import { ComarkRenderer } from './ComarkRenderer.tsx'
import type { ComarkProps } from './Comark'
import type { RegisteredInstance } from 'comark/devtools'

interface ComarkContentProps extends Omit<ComarkProps, 'markdown' | 'children' | 'options' | 'plugins'> {
  parsePromise: Promise<ComarkTree>
}

function ComarkContent({
  parsePromise,
  components: customComponents = {},
  componentsManifest,
  streaming = false,
  caret = false,
  data,
  className,
}: ComarkContentProps) {
  const parsed = use(parsePromise)

  return (
    <ComarkRenderer
      tree={parsed}
      components={customComponents}
      componentsManifest={componentsManifest}
      streaming={streaming}
      className={className}
      caret={caret}
      data={data}
    />
  )
}

export function ComarkClient({ children, markdown = '', options = {}, plugins = [], ...rest }: ComarkProps) {
  const content = children ? String(children) : markdown

  // Re-creates the promise only when content changes.
  // Note: options/plugins should be stable references (defined outside render or memoized).
  const parsePromise = useMemo(() => parse(content, { ...options, plugins }), [content])

  // Keep showing the previous parsed result while a new parse is pending —
  // prevents blank flashes during rapid streaming updates.
  const deferredPromise = useDeferredValue(parsePromise)

  // Devtools instance registration (dev mode only)
  const instanceRef = useRef<RegisteredInstance | null>(null)
  useEffect(() => {
    const hot = (import.meta as Record<string, any>).hot
    if (!hot) return
    let cancelled = false

    import('comark/devtools').then(({ registerDevtoolsInstance }) => {
      if (cancelled) return
      parsePromise.then((tree) => {
        if (cancelled) return
        registerDevtoolsInstance({
          hot,
          tree,
          markdown: content,
        }).then((handle) => {
          if (cancelled) {
            handle?.unregister()
            return
          }
          instanceRef.current = handle
        })
      })
    })

    return () => {
      cancelled = true
      instanceRef.current?.unregister()
      instanceRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update instance when tree changes
  useEffect(() => {
    if (!instanceRef.current) return
    parsePromise.then((tree) => {
      instanceRef.current?.update({ tree, markdown: content })
    })
  }, [parsePromise, content])

  return (
    <Suspense fallback={null}>
      <ComarkContent
        parsePromise={deferredPromise}
        {...rest}
      />
    </Suspense>
  )
}
