import React, { useState, useEffect } from 'react'
import { parse } from '../../index'
import type { ComarkTree } from '../../ast/types'
import type { ParseOptions } from '../../types'
import { ComarkAst } from './ComarkAst'

export interface ComarkProps {
  /**
   * The markdown content to parse and render
   */
  markdown: string

  /**
   * Parser options
   */
  options?: ParseOptions

  /**
   * Custom component mappings for element tags
   * Key: tag name (e.g., 'h1', 'p', 'MyComponent')
   * Value: React component
   */
  components?: Record<string, React.ComponentType<any>>

  /**
   * Dynamic component resolver function
   * Used to resolve components that aren't in the components map
   */
  componentsManifest?: (name: string) => Promise<{ default: React.ComponentType<any> }>

  /**
   * Enable streaming mode with enhanced components (e.g., ShikiCodeBlock)
   */
  streaming?: boolean

  /**
   * Additional className for the wrapper div
   */
  className?: string
}

/**
 * Comark component
 *
 * High-level component that accepts markdown as a string prop,
 * parses it, and renders it using ComarkAst.
 *
 * @example
 * ```tsx
 * import { Comark } from 'comark/react'
 * import CustomHeading from './CustomHeading'
 *
 * const customComponents = {
 *   h1: CustomHeading,
 *   alert: AlertComponent,
 * }
 *
 * export default function App() {
 *   const content = `
 *     # Hello World
 *
 *     This is a **markdown** document with *Comark* components.
 *
 *     ::alert{type="info"}
 *     This is an alert component
 *     ::
 *   `
 *
 *   return <Comark markdown={content} components={customComponents} />
 * }
 * ```
 */
export const Comark: React.FC<ComarkProps> = ({
  markdown,
  options = {},
  components: customComponents = {},
  componentsManifest,
  streaming = false,
  className,
}) => {
  const [parsed, setParsed] = useState<ComarkTree | null>(null)

  // Parse the markdown content
  useEffect(() => {
    let isMounted = true

    // Use async parse for non-streaming mode (supports code highlighting, etc.)
    parse(markdown, options).then((result) => {
      if (isMounted) {
        setParsed(result)
      }
    }).catch((error) => {
      console.error('Failed to parse markdown:', error)
    })

    return () => {
      isMounted = false
    }
  }, [markdown, streaming])

  if (!parsed) {
    return null
  }

  return (
    <ComarkAst
      body={parsed}
      components={customComponents}
      componentsManifest={componentsManifest}
      streaming={streaming}
      className={className}
    />
  )
}
