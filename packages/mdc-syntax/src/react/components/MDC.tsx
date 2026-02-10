import React, { useState, useEffect, useMemo } from 'react'
import { parse, parseAsync, type ParseResult } from '../../index'
import type { ParseOptions } from '../../types'
import { MDCRenderer } from './MDCRenderer'

export interface MDCProps {
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
 * MDC component
 *
 * High-level component that accepts markdown as a string prop,
 * parses it, and renders it using MDCRenderer.
 *
 * @example
 * ```tsx
 * import { MDC } from 'mdc-syntax/react'
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
 *     This is a **markdown** document with *MDC* components.
 *
 *     ::alert{type="info"}
 *     This is an alert component
 *     ::
 *   `
 *
 *   return <MDC markdown={content} components={customComponents} />
 * }
 * ```
 */
export const MDC: React.FC<MDCProps> = ({
  markdown,
  options = {},
  components: customComponents = {},
  componentsManifest,
  streaming = false,
  className,
}) => {
  const [parsed, setParsed] = useState<ParseResult | null>(null)
  const [streamComponents, setStreamComponents] = useState<Record<string, React.ComponentType<any>>>({})

  // Load stream components when streaming prop is true
  useEffect(() => {
    if (streaming) {
      import('./stream').then((m) => {
        setStreamComponents(m.proseStreamComponents)
      }).catch((error) => {
        console.error('Failed to load stream components:', error)
      })
    }
    else {
      setStreamComponents({})
    }
  }, [streaming])

  const components = useMemo(() => ({
    ...streamComponents,
    ...customComponents,
  }), [streamComponents, customComponents])

  // Parse the markdown content
  useEffect(() => {
    let isMounted = true

    if (streaming) {
      // Use synchronous parse for streaming mode
      const result = parse(markdown, options)
      if (isMounted) {
        setParsed(result)
      }
    }
    else {
      // Use async parse for non-streaming mode (supports code highlighting, etc.)
      parseAsync(markdown, options).then((result) => {
        if (isMounted) {
          setParsed(result)
        }
      }).catch((error) => {
        console.error('Failed to parse markdown:', error)
      })
    }

    return () => {
      isMounted = false
    }
  }, [markdown, streaming])

  if (!parsed) {
    return null
  }

  return (
    <MDCRenderer
      body={parsed.body}
      components={components}
      componentsManifest={componentsManifest}
      streaming={streaming}
      className={className}
    />
  )
}
