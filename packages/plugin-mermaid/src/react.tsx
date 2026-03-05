import { useState, useEffect } from 'react'
import { renderMermaidSVG, THEMES, type DiagramColors } from 'beautiful-mermaid'
import type { ThemeNames } from '.'

export interface MermaidProps {
  content: string
  class?: string
  height?: string
  width?: string
  theme?: ThemeNames | DiagramColors
  themeDark?: ThemeNames | DiagramColors
}

export function Mermaid({
  content,
  class: className = '',
  height = '400px',
  width = '100%',
  theme,
  themeDark,
}: MermaidProps) {
  const [svgContent, setSvgContent] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(false)

  // Detect dark mode from HTML class
  useEffect(() => {
    const htmlEl = document.querySelector('html')
    if (htmlEl) {
      setIsDark(htmlEl.classList.contains('dark') || false)

      // Watch for class changes on HTML element
      const observer = new MutationObserver(() => {
        const newIsDark = htmlEl.classList.contains('dark')
        setIsDark(newIsDark)
      })

      observer.observe(htmlEl, {
        attributes: true,
        attributeFilter: ['class'],
      })

      return () => observer.disconnect()
    }
  }, [])

  // Update mermaid theme when it changes
  useEffect(() => {
    const renderDiagram = async () => {
      try {
        setError(null)

        // Determine which theme to use based on dark mode and props
        const themeProp = isDark ? themeDark : theme

        let resolvedTheme
        if (typeof themeProp === 'string') {
          resolvedTheme = THEMES[themeProp]
        }
        else if (typeof themeProp === 'object') {
          resolvedTheme = themeProp
        }

        // Fallback to default themes if no prop is set
        if (!resolvedTheme) {
          resolvedTheme = THEMES[isDark ? 'tokyo-night' : 'tokyo-light']
        }

        const svg = renderMermaidSVG(content, resolvedTheme)
        setSvgContent(svg)
      }
      catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to render diagram')
      }
    }

    renderDiagram()
  }, [content, theme, themeDark, isDark])

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
