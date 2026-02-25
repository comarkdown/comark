import { useState, useEffect } from 'react'
import { renderMermaidSVG, THEMES, type DiagramColors } from 'beautiful-mermaid'
import type { ThemeNames } from '.'

export interface MermaidProps {
  content: string
  class?: string
  height?: string
  width?: string
  theme?: ThemeNames | DiagramColors
}

export function Mermaid({
  content,
  class: className = '',
  height = '400px',
  width = '100%',
  theme,
}: MermaidProps) {
  const [svgContent, setSvgContent] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  // Update mermaid theme when it changes
  useEffect(() => {
    const renderDiagram = async () => {
      try {
        setError(null)
        const svg = renderMermaidSVG(content, typeof theme === 'string' ? THEMES[theme] : theme)
        setSvgContent(svg)
      }
      catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to render diagram')
      }
    }

    renderDiagram()
  }, [content, theme])

  return (
    <div
      className={`mermaid ${className}`}
      style={{
        display: 'flex',
        justifyContent: 'center',
        width,
        height,
      }}
      data-error={error}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  )
}
