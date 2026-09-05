'use client'

import { use, useDeferredValue, useMemo, Suspense } from 'react'
import { createMarkdownParser } from 'comark'
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
  caret = false,
  data,
  className,
}: MarkdownContentProps) {
  const parsed = use(parsePromise)

  return (
    <MarkdownLive
      value={parsed}
      components={customComponents}
      componentsManifest={componentsManifest}
      streaming={streaming}
      className={className}
      caret={caret}
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
    let parser: ReturnType<typeof createMarkdownParser> | undefined
    let pending: Promise<unknown> = Promise.resolve()

    // Keep streaming state in order without hiding plugin errors from Suspense.
    return (source: string, streaming: boolean) => {
      const run = () => {
        parser ??= createMarkdownParser({ ...options, ...(unwrap ? { unwrap } : {}), plugins })
        return parser(source, { streaming })
      }
      const result = pending.then(run, run)
      pending = result
      return result
    }
  }, [options, plugins, unwrap])

  const parsePromise = useMemo(
    () => (isMarkdownDocument(content) ? Promise.resolve(content) : parse(content, streaming)),
    [content, parse, streaming]
  )

  // Keep showing the previous parsed result while a new parse is pending —
  // prevents blank flashes during rapid streaming updates.
  const deferredPromise = useDeferredValue(parsePromise)

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
