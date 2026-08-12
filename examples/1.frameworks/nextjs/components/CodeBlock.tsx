import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import type { ElementNode } from 'comark'
import { textContent } from 'comark/utils'
import CopyButton from './CopyButton'

interface CodeBlockProps extends Omit<ComponentPropsWithoutRef<'pre'>, 'children'> {
  __node?: ElementNode
  children?: ReactNode
  filename?: string
  highlights?: number[]
  language?: string
  meta?: string
}

export default function CodeBlock({
  __node,
  children,
  filename,
  highlights: _highlights,
  language,
  meta: _meta,
  ...props
}: CodeBlockProps) {
  const code = __node ? textContent(__node) : ''
  const label = filename || language?.toUpperCase() || 'Code'

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span>{label}</span>
        <CopyButton code={code} />
      </div>
      <pre
        {...props}
        data-filename={filename}
        data-language={language}
      >
        {children}
      </pre>
    </div>
  )
}

CodeBlock.propTypes = {
  __node: () => null,
}
