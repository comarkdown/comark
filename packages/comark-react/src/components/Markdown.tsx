import React from 'react'
import { parseMarkdown } from 'comark'
import type { MarkdownDocument as MarkdownDocumentType, NodeTransform, ParserOptions } from 'comark'
import { isMarkdownDocument } from 'comark/utils'
import type { StreamEffect } from 'comark/stream'
import { MarkdownDocument } from './MarkdownDocument.tsx'
import { MarkdownClient } from './MarkdownClient.tsx'

/**
 * Every other HTML attribute (`id`, `style`, `role`, `data-*`, `aria-*`, ...) is
 * set on the wrapper div.
 */
export interface MarkdownProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * The children content to parse and render
   */
  children?: React.ReactNode

  /**
   * The markdown content to parse and render, or a pre-parsed MarkdownDocument
   */
  value?: string | MarkdownDocumentType

  /**
   * Parser options (excluding plugins)
   */
  options?: Omit<ParserOptions, 'plugins'>

  /**
   * Additional plugins to use
   */
  plugins?: ParserOptions['plugins']

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
   * Change the tag or props of element nodes just before they render.
   * Pass a stable reference: a new array on every render re-renders the document.
   */
  transformNode?: NodeTransform | readonly NodeTransform[]

  /**
   * Strip wrapper tags from the top level of the document. Shorthand for
   * `options.unwrap`. `true` unwraps `<p>` (single-line rendering); a
   * space-separated string or array unwraps the listed tags. Useful for inline
   * usage like `<button><Markdown value={text} unwrap /></button>`.
   */
  unwrap?: boolean | string | string[]

  /**
   * Enable streaming mode. Delegates to MarkdownClient for client-side re-rendering
   * when the value prop changes. Use this for LLM streaming output.
   */
  streaming?: boolean

  /**
   * Render-time stream effects such as `caret()`, `fade()` and `pace()` from `comark/stream`. They run in order.
   */
  effects?: readonly StreamEffect[]

  /**
   * Additional data to pass to the renderer, referenced from markdown
   * via `:`-prefixed props using dot paths (e.g. `:foo="data.user.name"`).
   */
  data?: Record<string, unknown>

  /**
   * Additional className for the wrapper div
   */
  className?: string
}

/**
 * Markdown component
 *
 * Async server component that parses raw markdown on the server and renders it.
 * When `streaming` is true, delegates to MarkdownClient for client-side re-rendering.
 *
 * @example
 * ```tsx
 * import { Markdown } from '@comark/react'
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
 *   return <Markdown value={content} components={customComponents} />
 * }
 * ```
 */
export function Markdown(props: MarkdownProps): React.ReactNode | Promise<React.ReactNode> {
  // Streaming must stay synchronous: an async component suspends on every
  // streamed update, which flashes the parent Suspense fallback and rebuilds
  // fade spans mid-animation. An explicit `streaming={false}` with effects keeps the
  // streaming renderer mounted, so effects drain their backlog instead of the static
  // path showing it at once.
  const ended = props.streaming === false && props.effects?.length
  if (props.streaming || ended) return <MarkdownStreaming {...props} />
  return renderStatic(props)
}

function MarkdownStreaming({
  children,
  value,
  options,
  plugins,
  unwrap = false,
  components: customComponents = {},
  componentsManifest,
  streaming = false,
  effects,
  data,
  className,
  ...rest
}: MarkdownProps) {
  const source = isMarkdownDocument(value) ? value : children ? String(children) : ((value as string | undefined) ?? '')
  return (
    <MarkdownClient
      {...rest}
      value={source}
      options={options}
      unwrap={unwrap}
      plugins={plugins}
      components={customComponents}
      componentsManifest={componentsManifest}
      streaming={streaming}
      effects={effects}
      data={data}
      className={className}
    />
  )
}

async function renderStatic({
  children,
  value,
  options,
  plugins,
  unwrap = false,
  components: customComponents = {},
  componentsManifest,
  streaming = false,
  effects,
  data,
  className,
  ...rest
}: MarkdownProps) {
  if (isMarkdownDocument(value)) {
    return (
      <MarkdownDocument
        {...rest}
        value={value}
        components={customComponents}
        componentsManifest={componentsManifest}
        streaming={streaming}
        className={className}
        effects={effects}
        data={data}
      />
    )
  }

  const source = children ? String(children) : ((value as string | undefined) ?? '')
  // `unwrap` prop is a shorthand for the `unwrap` parse option; an explicit
  // `options.unwrap` still wins when the prop is left at its default.
  const parseOptions = unwrap ? { ...options, unwrap } : options

  const parsed = await parseMarkdown(source, { ...parseOptions, plugins })

  return (
    <MarkdownDocument
      {...rest}
      value={parsed}
      components={customComponents}
      componentsManifest={componentsManifest}
      streaming={streaming}
      className={className}
      effects={effects}
      data={data}
    />
  )
}
