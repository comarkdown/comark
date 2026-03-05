import React, { useState, useEffect } from 'react'
import { parse } from 'comark'
import type { ComarkTree } from 'comark/ast'
import type { ParseOptions } from 'comark'
import { ComarkRenderer } from './ComarkRenderer'

export interface ComarkProps {
  /**
   * The children content to parse and render
   */
  children?: React.ReactNode

  /**
   * The markdown content to parse and render
   */
  markdown?: string

  /**
   * Parser options (excluding plugins)
   */
  options?: Exclude<ParseOptions, 'plugins'>

  /**
   * Additional plugins to use
   */
  plugins?: ParseOptions['plugins']

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
   * If caret is true, a caret will be appended to the last text node in the tree
   * If caret is an object, it will be appended to the last text node in the tree with the given class
   */
  caret?: boolean | { class: string }

  /**
   * Additional className for the wrapper div
   */
  className?: string
}

/**
 * Comark component
 *
 * High-level component that accepts markdown as a string prop,
 * parses it, and renders it using ComarkRenderer.
 *
 * @example
 * ```tsx
 * import { Comark } from '@comark/react'
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
  children,
  markdown = '',
  options = {},
  plugins = [],
  components: customComponents = {},
  componentsManifest,
  streaming = false,
  caret = false,
  className,
}) => {
  const [parsed, setParsed] = useState<ComarkTree | null>(null)

  // Parse the markdown content
  useEffect(() => {
    let isMounted = true

    // Use async parse for non-streaming mode (supports code highlighting, etc.)
    parse(children ? String(children) : markdown, {
      ...options,
      plugins,
    }).then((result) => {
      if (isMounted) {
        setParsed(result)
      }
    }).catch((error) => {
      console.error('Failed to parse markdown:', error)
    })

    return () => {
      isMounted = false
    }
  }, [markdown, children, plugins, streaming])

  if (!parsed) {
    return null
  }

  return (
    <ComarkRenderer
      tree={parsed}
      components={customComponents}
      componentsManifest={componentsManifest}
      streaming={streaming}
      className={className}
      caret={caret}
    />
  )
}
