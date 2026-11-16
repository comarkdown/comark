import { Suspense, memo, use } from 'react'

let katex: typeof import('katex').default | undefined
let loading: Promise<unknown> | undefined

function loadKatex(): Promise<unknown> {
  loading ??= import('katex').then(
    (module) => (katex = module.default),
    (error) => {
      loading = undefined
      throw error
    }
  )
  return loading
}

// HTML, `''` when KaTeX can't typeset the formula, or `undefined` before KaTeX loads.
function typeset(tex: string, displayMode: boolean): string | undefined {
  if (!katex) return undefined
  try {
    return katex.renderToString(tex, { throwOnError: true, displayMode })
  } catch {
    return ''
  }
}

export interface MathProps {
  content: string
  className?: string
}

// A render this long after a failed load tries KaTeX again.
const RETRY_DELAY = 5000

// One promise for every formula, since `use` needs the same one on each render.
let katexReady: Promise<boolean> | undefined
let failedAt: number | undefined

function waitForKatex(): Promise<boolean> {
  if (!katexReady || (failedAt !== undefined && Date.now() - failedAt >= RETRY_DELAY)) {
    failedAt = undefined
    katexReady = loadKatex().then(
      () => true,
      () => {
        failedAt = Date.now()
        return false
      }
    )
  }
  return katexReady
}

// Memoized because streaming re-renders every formula on each chunk.
const Typeset = memo(function Typeset({ content, isInline }: { content: string; isInline: boolean }) {
  let html = typeset(content, !isInline)
  if (html === undefined) {
    use(waitForKatex())
    html = typeset(content, !isInline)
  }
  if (!html)
    return (
      <Source
        content={content}
        isInline={isInline}
      />
    )

  if (isInline) {
    return (
      <span
        className="math inline"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  return (
    <div
      className="math block"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
})

function Source({ content, isInline }: { content: string; isInline: boolean }) {
  return isInline ? <span className="math inline">{content}</span> : <div className="math block">{content}</div>
}

export function Math({ content, className = '' }: MathProps) {
  const isInline = className.includes('inline')

  return (
    <Suspense
      fallback={
        <Source
          content={content}
          isInline={isInline}
        />
      }
    >
      <Typeset
        content={content}
        isInline={isInline}
      />
    </Suspense>
  )
}
