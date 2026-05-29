'use client'

import { use, useDeferredValue, useEffect, useMemo, useRef, useState, Suspense } from 'react'
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
  const [devtoolsOverride, setDevtoolsOverride] = useState<string | null>(null)
  const effectiveContent = devtoolsOverride ?? content

  // Re-creates the promise only when content changes.
  // Note: options/plugins should be stable references (defined outside render or memoized).
  const parsePromise = useMemo(() => parse(effectiveContent, { ...options, plugins }), [effectiveContent])

  // Keep showing the previous parsed result while a new parse is pending —
  // prevents blank flashes during rapid streaming updates.
  const deferredPromise = useDeferredValue(parsePromise)

  // Devtools instance registration (dev mode only)
  const instanceRef = useRef<RegisteredInstance | null>(null)
  useEffect(() => {
    if (!import.meta.hot) return
    let cancelled = false

    import('comark/devtools').then(({ registerDevtoolsInstance }) => {
      if (cancelled) return
      // We resolve the current parse to get the tree for registration
      parsePromise.then((tree) => {
        if (cancelled) return
        registerDevtoolsInstance({
          hot: import.meta.hot!,
          tree,
          markdown: effectiveContent,
          onUpdate: (md: string) => setDevtoolsOverride(md),
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
      instanceRef.current?.update({ tree, markdown: effectiveContent })
    })
  }, [parsePromise, effectiveContent])

  return (
    <Suspense fallback={null}>
      <ComarkContent
        parsePromise={deferredPromise}
        {...rest}
      />
    </Suspense>
  )
}
