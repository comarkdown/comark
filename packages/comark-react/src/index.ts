import React from 'react'
import { Comark } from './components/Comark'
import { ComarkRenderer } from './components/ComarkRenderer'
import type { ComarkProps } from './components/Comark'
import type { ComarkRendererProps } from './components/ComarkRenderer'
import type { ParseOptions } from 'comark'

export { ComarkRenderer } from './components/ComarkRenderer'
export { ComarkClient } from './components/ComarkClient'
export { Comark }
export type * from 'comark'

interface DefineComarkComponentOptions extends ParseOptions {
  /** Extend an existing defined component — inherits its plugins and components. */
  extends?: React.FC<ComarkProps>
  /** Display name shown in React DevTools. */
  name?: string
  components?: Record<string, React.ComponentType<any>>
  /**
   * Additional classes for the wrapper div
   */
  className?: string
}

/**
 * Create a pre-configured Comark component with default options, plugins, and components.
 *
 * Use `extends` to inherit configuration from another defined component.
 *
 * @example
 * ```tsx
 * import { defineComarkComponent } from '@comark/react'
 * import highlight from '@comark/react/plugins/highlight'
 * import toc from '@comark/react/plugins/toc'
 *
 * const BaseComark = defineComarkComponent({
 *   name: 'BaseComark',
 *   plugins: [highlight({ themes: { light: githubLight, dark: githubDark } })],
 * })
 *
 * export const ArticleComark = defineComarkComponent({
 *   name: 'ArticleComark',
 *   extends: BaseComark,
 *   plugins: [toc({ depth: 3 })],
 * })
 * ```
 */
export function defineComarkComponent(config: DefineComarkComponentOptions = {}) {
  const { name, components: configComponents = {}, className: configClassName, extends: BaseComponent, ...parseOptions } = config

  const ComarkComponent: React.FC<ComarkProps> = (props) => {
    const mergedOptions: Exclude<ParseOptions, 'plugins'> = {
      ...parseOptions,
      ...props.options,
    }

    const mergedPlugins = [
      ...(config.plugins || []),
      ...(props.plugins || []),
    ]

    const mergedComponents = {
      ...configComponents,
      ...props.components,
    }

    const mergedClassName = [configClassName, props.className].filter(Boolean).join(' ') || undefined

    return React.createElement(BaseComponent ?? Comark, {
      ...props,
      options: mergedOptions,
      plugins: mergedPlugins,
      components: mergedComponents,
      className: mergedClassName,
    })
  }

  ComarkComponent.displayName = name || 'ComarkComponent'

  return ComarkComponent
}

interface DefineComarkRendererOptions {
  /** Extend an existing defined renderer — inherits its component mappings. */
  extends?: React.FC<ComarkRendererProps>
  /** Display name shown in React DevTools. */
  name?: string
  components?: Record<string, React.ComponentType<any>>
  /**
   * Additional classes for the wrapper div
   */
  className?: string
}

/**
 * Create a pre-configured ComarkRenderer component with default component mappings.
 *
 * Use this when parsing happens separately (server, build step, API) and you want
 * a reusable renderer with baked-in component mappings.
 *
 * Use `extends` to inherit mappings from another defined renderer.
 *
 * @example
 * ```tsx
 * import { defineComarkRendererComponent } from '@comark/react'
 * import Alert from './Alert'
 * import CodeBlock from './CodeBlock'
 *
 * export const ArticleRenderer = defineComarkRendererComponent({
 *   name: 'ArticleRenderer',
 *   components: { alert: Alert, pre: CodeBlock },
 * })
 *
 * // In a Server Component:
 * export default async function Page() {
 *   const tree = await parse(markdown)
 *   return <ArticleRenderer tree={tree} />
 * }
 * ```
 */
export function defineComarkRendererComponent(config: DefineComarkRendererOptions = {}) {
  const { name, components: configComponents = {}, className: configClassName, extends: BaseComponent } = config

  const RendererComponent: React.FC<ComarkRendererProps> = (props) => {
    const mergedComponents = {
      ...configComponents,
      ...props.components,
    }

    const mergedClassName = [configClassName, props.className].filter(Boolean).join(' ') || undefined

    return React.createElement(BaseComponent ?? ComarkRenderer, {
      ...props,
      components: mergedComponents,
      className: mergedClassName,
    })
  }

  RendererComponent.displayName = name || 'ComarkRendererComponent'

  return RendererComponent
}
