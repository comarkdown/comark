'use client'

import { use, useDeferredValue, useEffect, useMemo, useReducer, Suspense } from 'react'
import { createSerializedMarkdownParser } from 'comark'
import type { MarkdownDocument as MarkdownDocumentType } from 'comark'
import { isMarkdownDocument } from 'comark/utils'
import { MarkdownLive } from './MarkdownLive.tsx'
import type { MarkdownProps } from './Markdown'

interface MarkdownContentProps extends Omit<MarkdownProps, 'value' | 'children' | 'options' | 'plugins'> {
  parsePromise: Promise<MarkdownDocumentType>
}

function MarkdownContent({
  parsePromise,
  components: customComponents = {},
  componentsManifest,
  streaming = false,
  data,
  className,
  ...rest
}: MarkdownContentProps) {
  const parsed = use(parsePromise)

  return (
    <MarkdownLive
      {...rest}
      value={parsed}
      components={customComponents}
      componentsManifest={componentsManifest}
      streaming={streaming}
      className={className}
      data={data}
    />
  )
}

export function MarkdownClient({
  children,
  value,
  options,
  plugins,
  unwrap = false,
  streaming = false,
  ...rest
}: MarkdownProps) {
  const content = isMarkdownDocument(value)
    ? value
    : children
      ? String(children)
      : ((value as string | undefined) ?? '')

  const parse = useMemo(() => {
    let parser: ReturnType<typeof createSerializedMarkdownParser> | undefined
    return (source: string, streaming: boolean): Promise<MarkdownDocumentType> => {
      parser ??= createSerializedMarkdownParser({ ...options, ...(unwrap ? { unwrap } : {}), plugins })
      return parser(source, { streaming })
    }
  }, [options, plugins, unwrap])
  const parsePromise = useMemo(
    () => (isMarkdownDocument(content) ? Promise.resolve(content) : parse(content, streaming)),
    [content, parse, streaming]
  )

  // Keep showing the previous parsed result while a new parse is pending to
  // prevent blank flashes during rapid streaming updates.
  const deferredPromise = useDeferredValue(parsePromise)

  // React throttles Suspense reveals that commit through a retry lane by up to
  // 300ms (FALLBACK_THROTTLE_MS). Re-rendering through a normal update once the
  // parse settles commits the resolved content immediately instead.
  const [, rerender] = useReducer((count: number) => count + 1, 0)
  useEffect(() => {
    let active = true
    const settle = (): void => {
      if (active) rerender()
    }
    deferredPromise.then(settle, settle)
    return () => {
      active = false
    }
  }, [deferredPromise])

  return (
    <Suspense fallback={null}>
      <MarkdownContent
        parsePromise={deferredPromise}
        {...rest}
        streaming={streaming}
      />
    </Suspense>
  )
}
