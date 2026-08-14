import React from 'react'
import { Markdown } from './components/Markdown.tsx'
import { MarkdownDocument } from './components/MarkdownDocument.tsx'
import type { MarkdownProps } from './components/Markdown.tsx'
import type { MarkdownDocumentProps } from './components/MarkdownDocument.tsx'
import type { ParserOptions } from 'comark'

export { Markdown }
export type { MarkdownProps } from './components/Markdown.tsx'
export { MarkdownDocument } from './components/MarkdownDocument.tsx'
export type { MarkdownDocumentProps } from './components/MarkdownDocument.tsx'
export { MarkdownLive } from './components/MarkdownLive.tsx'
export type { MarkdownLiveProps } from './components/MarkdownLive.tsx'
export { MarkdownClient } from './components/MarkdownClient.tsx'

export type * from 'comark'

interface DefineMarkdownComponentOptions extends ParserOptions {
  /** Extend an existing defined component — inherits its plugins and components. */
  extends?: React.FC<MarkdownProps>
  /** Display name shown in React DevTools. */
  name?: string
  components?: Record<string, React.ComponentType<any>>
  /**
   * Additional classes for the wrapper div
   */
  className?: string
}

/**
 * Create a pre-configured Markdown component with default options, plugins, and components.
 *
 * Use `extends` to inherit configuration from another defined component.
 *
 * @example
 * ```tsx
 * import { defineMarkdownComponent } from '@comark/react'
 * import shiki from '@comark/react/plugins/shiki'
 * import toc from '@comark/react/plugins/toc'
 *
 * const BaseMarkdown = defineMarkdownComponent({
 *   name: 'BaseMarkdown',
 *   plugins: [shiki({ themes: { light: githubLight, dark: githubDark } })],
 * })
 *
 * export const ArticleMarkdown = defineMarkdownComponent({
 *   name: 'ArticleMarkdown',
 *   extends: BaseMarkdown,
 *   plugins: [toc({ depth: 3 })],
 * })
 * ```
 */
export function defineMarkdownComponent(config: DefineMarkdownComponentOptions = {}) {
  const {
    name,
    components: configComponents = {},
    className: configClassName,
    extends: BaseComponent,
    ...parseOptions
  } = config

  const MarkdownComponent: React.FC<MarkdownProps> = (props) => {
    const mergedOptions: Exclude<ParserOptions, 'plugins'> = {
      ...parseOptions,
      ...props.options,
    }

    const mergedPlugins = [...(config.plugins || []), ...(props.plugins || [])]

    const mergedComponents = {
      ...configComponents,
      ...props.components,
    }

    const mergedClassName = [configClassName, props.className].filter(Boolean).join(' ') || undefined

    return React.createElement(BaseComponent ?? Markdown, {
      ...props,
      options: mergedOptions,
      plugins: mergedPlugins,
      components: mergedComponents,
      className: mergedClassName,
    })
  }

  MarkdownComponent.displayName = name || 'MarkdownComponent'

  return MarkdownComponent
}

interface DefineMarkdownDocumentOptions {
  /** Extend an existing defined renderer — inherits its component mappings. */
  extends?: React.FC<MarkdownDocumentProps>
  /** Display name shown in React DevTools. */
  name?: string
  components?: Record<string, React.ComponentType<any>>
  /**
   * Additional classes for the wrapper div
   */
  className?: string
}

/**
 * Create a pre-configured MarkdownDocument component with default component mappings.
 *
 * Use this when parsing happens separately (server, build step, API) and you want
 * a reusable renderer with baked-in component mappings.
 *
 * Use `extends` to inherit mappings from another defined renderer.
 *
 * @example
 * ```tsx
 * import { defineMarkdownDocumentComponent } from '@comark/react'
 * import Alert from './Alert'
 * import CodeBlock from './CodeBlock'
 *
 * export const ArticleRenderer = defineMarkdownDocumentComponent({
 *   name: 'ArticleRenderer',
 *   components: { alert: Alert, pre: CodeBlock },
 * })
 *
 * // In a Server Component:
 * export default async function Page() {
 *   const document = await parseMarkdown(markdown)
 *   return <ArticleRenderer value={document} />
 * }
 * ```
 */
export function defineMarkdownDocumentComponent(config: DefineMarkdownDocumentOptions = {}) {
  const { name, components: configComponents = {}, className: configClassName, extends: BaseComponent } = config

  const ParsedComponent: React.FC<MarkdownDocumentProps> = (props) => {
    const mergedComponents = {
      ...configComponents,
      ...props.components,
    }

    const mergedClassName = [configClassName, props.className].filter(Boolean).join(' ') || undefined

    return React.createElement(BaseComponent ?? MarkdownDocument, {
      ...props,
      components: mergedComponents,
      className: mergedClassName,
    })
  }

  ParsedComponent.displayName = name || 'MarkdownDocumentComponent'

  return ParsedComponent
}
