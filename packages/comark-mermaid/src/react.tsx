import { useState, useEffect } from 'react'
import mermaid from 'mermaid'

// Initialize mermaid once
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
})

export interface MermaidProps {
  content: string
  class?: string
  height?: string
  width?: string
  theme?: 'default' | 'base' | 'dark' | 'forest' | 'neutral' | 'null'
}

export function Mermaid({
  content,
  class: className = '',
  height = '400px',
  width = '100%',
  theme = 'default',
}: MermaidProps) {
  const [svgContent, setSvgContent] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  // Update mermaid theme when it changes
  useEffect(() => {
    mermaid.initialize({
      theme,
    })
  }, [theme])

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        setError(null)
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`
        const { svg } = await mermaid.render(id, content)
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
