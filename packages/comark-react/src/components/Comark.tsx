import React from 'react'
import { parse } from 'comark'
import type { ParseOptions } from 'comark'
import { ComarkRenderer } from './ComarkRenderer.tsx'
import { ComarkClient } from './ComarkClient.tsx'

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
   * Enable streaming mode — delegates to ComarkClient for client-side re-rendering
   * when the markdown prop changes. Use this for LLM streaming output.
   */
  streaming?: boolean

  /**
   * If caret is true, a caret will be appended to the last text node in the tree
   * If caret is an object, it will be appended to the last text node in the tree with the given class
   */
  caret?: boolean | { class: string }

  /**
   * Additional data to pass to the renderer — referenced from markdown
   * via `:`-prefixed props using dot paths (e.g. `:foo="data.user.name"`).
   */
  data?: Record<string, unknown>

  /**
   * Additional className for the wrapper div
   */
  className?: string
}

/**
 * Comark component
 *
 * Async server component that parses markdown on the server and renders it.
 * When `streaming` is true, delegates to ComarkClient for client-side re-rendering.
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
export async function Comark({
  children,
  markdown = '',
  options = {},
  plugins = [],
  components: customComponents = {},
  componentsManifest,
  streaming = false,
  caret = false,
  data,
  className,
}: ComarkProps) {
  const source = children ? String(children) : markdown

  if (streaming) {
    return (
      <ComarkClient
        markdown={source}
        options={options}
        plugins={plugins}
        components={customComponents}
        componentsManifest={componentsManifest}
        streaming={streaming}
        caret={caret}
        data={data}
        className={className}
      />
    )
  }

  const parsed = await parse(source, { ...options, plugins })

  return (
    <ComarkRenderer
      tree={parsed}
      components={customComponents}
      componentsManifest={componentsManifest}
      streaming={streaming}
      className={className}
      caret={caret}
      data={data}
    />
  )
}
