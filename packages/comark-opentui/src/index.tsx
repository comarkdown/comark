/** @jsxImportSource @opentui/react */
import { MarkdownDocument as ComarkDocument } from '@comark/react'
import { parseMarkdown, type MarkdownDocument as MarkdownDocumentType, type ParserOptions } from 'comark'
import { isMarkdownDocument } from 'comark/utils'
import React, { useEffect, useMemo, useState } from 'react'
import { groupInlineRuns } from './components/flow.tsx'
import { components, componentsManifest } from './components/index.ts'
import { defaultTheme, MarkdownThemeProvider, type MarkdownTheme } from './theme.ts'

export * from './components/index.ts'
export * from './theme.ts'
export { BLOCK_TAGS, childNodes, contentNode, isBlockNode, isElementNode, withNode } from './utils.ts'
export type * from 'comark'

/**
 * Top-level container. Comark's React renderer wraps output in a `div`, which
 * OpenTUI's reconciler rejects outright — `wrapper` is what lets a non-DOM host
 * substitute its own root. The one-row gap stands in for the blank line between
 * markdown blocks.
 *
 * Children are grouped rather than placed directly: the document root can hold
 * an inline node, because a streaming caret with nowhere to attach is pushed
 * there as a bare `span`, and a bare span in a box throws.
 */
const Wrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <box
      flexDirection="column"
      gap={1}
    >
      {groupInlineRuns(children)}
    </box>
  )
}

export interface MarkdownProps {
  /** Markdown source. Equivalent to passing `value` a string. */
  children?: string

  /** Markdown source, or a document already parsed by `parseMarkdown`. */
  value?: string | MarkdownDocumentType

  /** Parser options (excluding plugins). */
  options?: Exclude<ParserOptions, 'plugins'>

  /** Additional parser plugins. */
  plugins?: ParserOptions['plugins']

  /**
   * Component overrides, merged over the OpenTUI defaults. Use this both for
   * `::components` and to restyle a built-in tag.
   */
  components?: Record<string, React.ComponentType<any>>

  /**
   * Re-parse as the source grows and auto-close unterminated constructs, so a
   * half-streamed `**bold` renders bold instead of flashing its asterisks.
   */
  streaming?: boolean

  /** Append a caret to the last text node — a typing cursor for streamed output. */
  caret?: boolean | { class: string }

  /** Runtime data addressed from markdown via `:`-prefixed props. */
  data?: Record<string, unknown>

  /** Colour and glyph overrides, merged over {@link defaultTheme}. */
  theme?: Partial<MarkdownTheme>
}

/**
 * Render markdown as an OpenTUI layout tree.
 *
 * @example
 * ```tsx
 * import { Markdown } from '@comark/opentui'
 *
 * <Markdown streaming={isStreaming} caret>
 *   {content}
 * </Markdown>
 * ```
 */
/**
 * Parse markdown source, holding on to the previous document while a new parse
 * is in flight so a growing stream keeps its last good frame instead of
 * blanking between deltas.
 *
 * Comark's own `MarkdownClient` does this with `use()` behind Suspense. That
 * path does not commit under OpenTUI's reconciler — a suspended subtree stays
 * hidden after its promise resolves — and an effect works in any host, so this
 * renderer parses here instead.
 *
 * Only `source` is tracked: `options` and `plugins` are expected to be stable
 * references, matching `MarkdownClient`.
 */
function useParsedMarkdown(
  source: string,
  options: MarkdownProps['options'],
  plugins: MarkdownProps['plugins']
): MarkdownDocumentType | null {
  const [parsed, setParsed] = useState<{ source: string; document: MarkdownDocumentType } | null>(null)

  useEffect(() => {
    let active = true

    void Promise.resolve(parseMarkdown(source, { ...options, plugins })).then((document) => {
      if (active) {
        setParsed({ source, document: document as MarkdownDocumentType })
      }
    })

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source])

  /*
   * Keep showing the last document only while the stream is still growing, which
   * is what stops a delta from blanking the screen mid-parse. Any other change —
   * a reset back to the start of a replay, a different document entirely — has to
   * drop it, or the old content stays on screen for a frame or two before the new
   * parse lands and reads as content flashing in twice.
   */
  if (!parsed || !source.startsWith(parsed.source)) {
    return null
  }

  return parsed.document
}

export function Markdown({ children, value, options, plugins, components: overrides, theme, ...rest }: MarkdownProps) {
  const mergedComponents = useMemo(() => (overrides ? { ...components, ...overrides } : components), [overrides])

  const mergedTheme = useMemo(() => (theme ? { ...defaultTheme, ...theme } : defaultTheme), [theme])

  const source = children ?? value ?? ''
  const isDocument = isMarkdownDocument(source)
  const parsed = useParsedMarkdown(isDocument ? '' : (source as string), options, plugins)
  const document = isDocument ? (source as MarkdownDocumentType) : parsed

  // Nothing to paint until the first parse resolves.
  if (!document) {
    return null
  }

  /*
   * Built with `createElement` rather than JSX: React 19 types a
   * `FunctionComponent` as returning `ReactNode | Promise<ReactNode>` to allow
   * async components, while OpenTUI declares `JSX.Element = React.ReactNode`,
   * which does not accept the nested promise. Both are fine at runtime, and
   * `createElement` skips the JSX-element check without a cast.
   */
  return (
    <MarkdownThemeProvider value={mergedTheme}>
      {React.createElement(ComarkDocument, {
        value: document,
        components: mergedComponents,
        componentsManifest,
        wrapper: Wrapper,
        ...rest,
      })}
    </MarkdownThemeProvider>
  )
}

export interface MarkdownDocumentProps extends Omit<MarkdownProps, 'children' | 'value' | 'options' | 'plugins'> {
  value?: MarkdownDocumentType | { nodes: MarkdownDocumentType['nodes'] }
}

/**
 * Render an already-parsed document — for hosts that parse elsewhere (a worker,
 * the main process of an Electron app, a build step) and only want the render.
 */
export function MarkdownDocument({ components: overrides, theme, ...rest }: MarkdownDocumentProps) {
  const mergedComponents = useMemo(() => (overrides ? { ...components, ...overrides } : components), [overrides])

  const mergedTheme = useMemo(() => (theme ? { ...defaultTheme, ...theme } : defaultTheme), [theme])

  // See the note in `Markdown` on why this is not JSX.
  return (
    <MarkdownThemeProvider value={mergedTheme}>
      {React.createElement(ComarkDocument, {
        components: mergedComponents,
        componentsManifest,
        wrapper: Wrapper,
        ...rest,
      })}
    </MarkdownThemeProvider>
  )
}
