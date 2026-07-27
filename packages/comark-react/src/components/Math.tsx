import { useState, useEffect } from 'react'
import katex from 'katex'

export interface MathProps {
  content: string
  className?: string
}

export function Math({ content, className = '' }: MathProps) {
  const isInline = className.includes('inline')
  const [mathml, setMathml] = useState<string>('...')

  useEffect(() => {
    try {
      const rendered = katex.renderToString(content, {
        throwOnError: true,
        displayMode: !isInline,
      })
      setMathml(rendered)
    } catch {
      // Keep loading state on error
    }
  }, [content, isInline])

  if (isInline) {
    return (
      <span
        className="math inline"
        dangerouslySetInnerHTML={{ __html: mathml }}
      />
    )
  }

  return (
    <div
      className="math block"
      dangerouslySetInnerHTML={{ __html: mathml }}
    />
  )
}
