import { Suspense, memo, use } from 'react'
import { loadKatex, typesetMath } from 'comark/plugins/math'

export interface MathProps {
  content: string
  className?: string
}

// After a failed load, formulas show their source, and a render this long
// after the failure loads KaTeX again.
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
  let html = typesetMath(content, !isInline)
  if (html === undefined) {
    use(waitForKatex())
    html = typesetMath(content, !isInline)
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

// Unfinished or invalid TeX, and TeX without KaTeX installed, stays readable as its source.
function Source({ content, isInline }: { content: string; isInline: boolean }) {
  return isInline ? <span className="math inline">{content}</span> : <div className="math block">{content}</div>
}

export function Math({ content, className = '' }: MathProps) {
  const isInline = className.includes('inline')

  // KaTeX loads on first use. Streaming server rendering and hydration wait
  // for it; otherwise the source shows until it loads.
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
