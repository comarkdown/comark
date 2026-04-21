'use client'

import { use, useDeferredValue, useMemo, Suspense } from 'react'
import { parse } from 'comark'
import type { ComarkTree } from 'comark'
import { ComarkRenderer } from './ComarkRenderer'
import type { ComarkProps } from './Comark'

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

export function ComarkClient({
  children,
  markdown = '',
  options = {},
  plugins = [],
  ...rest
}: ComarkProps) {
  const content = children ? String(children) : markdown

  // Re-creates the promise only when content changes.
  // Note: options/plugins should be stable references (defined outside render or memoized).
  const parsePromise = useMemo(
    () => parse(content, { ...options, plugins }),
    [content],
  )

  // Keep showing the previous parsed result while a new parse is pending —
  // prevents blank flashes during rapid streaming updates.
  const deferredPromise = useDeferredValue(parsePromise)

  return (
    <Suspense fallback={null}>
      <ComarkContent parsePromise={deferredPromise} {...rest} />
    </Suspense>
  )
}
